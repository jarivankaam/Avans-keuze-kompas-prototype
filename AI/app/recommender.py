# app/recommender.py

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Mapping, Optional, Sequence

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ---------- Generic helpers ----------


def norm_col(name: str) -> str:
    """Normalize a column name to snake_case."""
    name = str(name).strip().lower()
    name = re.sub(r"[^0-9a-zA-Z]+", "_", name)
    name = name.strip("_")
    return name


# ---------- Configuration objects ----------


@dataclass
class DatasetConfig:
    """Describe how a particular dataset is structured."""

    id_col: str
    title_col: str
    text_cols: Sequence[str]  # columns to concatenate into item_text
    location_col: Optional[str] = None
    salary_min_col: Optional[str] = None
    salary_max_col: Optional[str] = None
    difficulty_col: Optional[str] = None
    popularity_col: Optional[str] = None
    role_tag_cols: Sequence[str] = field(
        default_factory=list
    )  # e.g. ["role", "domain"]


@dataclass
class QuizQuestionConfig:
    """
    Maps quiz answers to extra keywords (or tags) for the profile.
    Example:
        id="pref_work_style",
        answer_to_keywords={
            "team": ["teamwork", "collaboration"],
            "solo": ["independent", "autonomous"]
        }
    """

    id: str
    answer_to_keywords: Mapping[Any, List[str]]
    weight: float = 1.0  # scalar if you ever want to weight certain questions


@dataclass
class CandidateProfile:
    """
    What comes from your front-end.
    """

    interests_text: str
    preferred_location: Optional[str] = None
    min_salary: Optional[float] = None
    max_difficulty: Optional[float] = None
    role_include: List[str] = field(default_factory=list)
    quiz_answers: Dict[str, Any] = field(default_factory=dict)


# ---------- Quiz bridge ----------


def quiz_answers_to_keywords(
    quiz_answers: Dict[str, Any], quiz_configs: Mapping[str, QuizQuestionConfig]
) -> str:
    """
    Convert quiz answers into a space-separated keyword string.
    """
    extra_tokens: List[str] = []

    for qid, answer in quiz_answers.items():
        cfg = quiz_configs.get(qid)
        if not cfg:
            continue
        keywords = cfg.answer_to_keywords.get(answer)
        if not keywords:
            continue
        # Simple weighting by repetition
        weighted_keywords = keywords * int(max(cfg.weight, 1))
        extra_tokens.extend(weighted_keywords)

    return " ".join(extra_tokens)


# ---------- Core recommender ----------


class GenericRecommender:
    def __init__(
        self,
        df: pd.DataFrame,
        config: DatasetConfig,
        language: str = "dutch",
        max_features: int = 8000,
    ):
        """
        df: your item dataset
        config: DatasetConfig describing column names
        """
        self.config = config

        # Normalize column names once
        df = df.copy()
        df.columns = [norm_col(c) for c in df.columns]
        self.df = df

        # Build item_text
        self._build_item_text()

        # Build vectorizer on item_text
        self.vectorizer = TfidfVectorizer(
            max_features=max_features, ngram_range=(1, 2), stop_words=language
        )
        self.X = self.vectorizer.fit_transform(self.df["item_text"])

    # ---------- Internal helpers ----------

    def _build_item_text(self) -> None:
        cfg = self.config
        text_cols = [norm_col(c) for c in cfg.text_cols]
        missing = [c for c in text_cols if c not in self.df.columns]
        if missing:
            raise ValueError(f"Missing text columns in dataset: {missing}")

        def row_text(row):
            parts = []
            for col in text_cols:
                val = row.get(col)
                if pd.notna(val):
                    parts.append(str(val))
            return " \n ".join(parts)

        self.df["item_text"] = self.df.apply(row_text, axis=1)

    def _extract_numeric(self, val) -> Optional[float]:
        if pd.isna(val):
            return None
        text = str(val)
        nums = re.findall(r"\d+(?:[.,]\d+)?", text)
        if not nums:
            return None
        n = nums[0].replace(",", ".")
        try:
            return float(n)
        except ValueError:
            return None

    def _constraint_score(
        self, row: pd.Series, profile: CandidateProfile
    ) -> Dict[str, Any]:
        """
        Returns dict with:
            score: float between 0 and 1
            reasons: dict[str, str]
        """
        cfg = self.config
        reasons: Dict[str, str] = {}
        scores: List[float] = []

        # Location
        if cfg.location_col and profile.preferred_location:
            loc_col = norm_col(cfg.location_col)
            item_loc = str(row.get(loc_col, "")).lower()
            pref = profile.preferred_location.lower()
            if pref in item_loc:
                scores.append(1.0)
                reasons["location"] = (
                    f"Location matches preference '{profile.preferred_location}'"
                )
            else:
                scores.append(0.0)
                reasons["location"] = (
                    f"Location mismatch (item: '{item_loc}', preferred: '{pref}')"
                )

        # Salary (minimum)
        if cfg.salary_min_col and profile.min_salary is not None:
            sal_col = norm_col(cfg.salary_min_col)
            item_sal = self._extract_numeric(row.get(sal_col))
            if item_sal is None:
                scores.append(0.5)  # unknown salary, neutral
                reasons["salary"] = "Salary unknown in dataset"
            elif item_sal >= profile.min_salary:
                scores.append(1.0)
                reasons["salary"] = f"Salary OK (item >= {profile.min_salary})"
            else:
                scores.append(0.0)
                reasons["salary"] = (
                    f"Salary below expectation ({item_sal} < {profile.min_salary})"
                )

        # Difficulty
        if cfg.difficulty_col and profile.max_difficulty is not None:
            diff_col = norm_col(cfg.difficulty_col)
            item_diff = self._extract_numeric(row.get(diff_col))
            if item_diff is None:
                scores.append(0.5)  # unknown, neutral
                reasons["difficulty"] = "Difficulty unknown in dataset"
            elif item_diff <= profile.max_difficulty:
                scores.append(1.0)
                reasons["difficulty"] = (
                    f"Difficulty OK (item <= {profile.max_difficulty})"
                )
            else:
                scores.append(0.0)
                reasons["difficulty"] = (
                    f"Difficulty too high ({item_diff} > {profile.max_difficulty})"
                )

        # Role / domain tags
        if cfg.role_tag_cols and profile.role_include:
            tags: List[str] = []
            for col in cfg.role_tag_cols:
                col_n = norm_col(col)
                val = row.get(col_n)
                if pd.notna(val):
                    # Split on non-word characters so "AI; Data, Innovatie"
                    # becomes ["ai", "data", "innovatie"]
                    raw = str(val).lower()
                    tokens = re.split(r"\W+", raw)
                    tokens = [t for t in tokens if t]  # remove empty strings
                    tags.extend(tokens)

            tags_set = set(tags)
            needed = {t.lower() for t in profile.role_include}
            overlap = tags_set & needed

            if overlap:
                scores.append(1.0)
                reasons["role"] = f"Role/domain matches: {', '.join(sorted(overlap))}"
            else:
                scores.append(0.0)
                reasons["role"] = f"No explicit role/domain overlap with {needed}"

        if not scores:
            return {"score": 1.0, "reasons": {"info": "No constraints set"}}

        return {"score": float(np.mean(scores)), "reasons": reasons}

    def _popularity_score(self) -> np.ndarray:
        cfg = self.config
        if not cfg.popularity_col:
            return np.zeros(len(self.df))

        col = norm_col(cfg.popularity_col)
        if col not in self.df.columns:
            return np.zeros(len(self.df))

        vals = self.df[col].astype(float)
        if vals.max() == vals.min():
            return np.ones(len(self.df))
        # Min-max normalize to [0,1]
        norm_vals = (vals - vals.min()) / (vals.max() - vals.min())
        return norm_vals.to_numpy()

    # ---------- Public API ----------

    def profile_vector(
        self,
        profile: CandidateProfile,
        quiz_configs: Optional[Mapping[str, QuizQuestionConfig]] = None,
    ):
        base_text = profile.interests_text or ""
        quiz_text = ""
        if quiz_configs:
            quiz_text = quiz_answers_to_keywords(profile.quiz_answers, quiz_configs)
        full_text = (base_text + " " + quiz_text).strip()
        return self.vectorizer.transform([full_text])

    def recommend(
        self,
        profile: CandidateProfile,
        k: int = 10,
        alpha: float = 0.7,
        beta: float = 0.2,
        gamma: float = 0.1,
        quiz_configs: Optional[Mapping[str, QuizQuestionConfig]] = None,
    ) -> pd.DataFrame:
        """
        alpha: weight content similarity
        beta : weight constraint score
        gamma: weight popularity
        """
        if not np.isclose(alpha + beta + gamma, 1.0):
            raise ValueError("alpha + beta + gamma must sum to 1")

        prof_vec = self.profile_vector(profile, quiz_configs)
        content_sim = cosine_similarity(prof_vec, self.X)[0]

        popularity = self._popularity_score()

        constraint_scores = []
        reasons_list = []
        for _, row in self.df.iterrows():
            res = self._constraint_score(row, profile)
            constraint_scores.append(res["score"])
            reasons_list.append(res["reasons"])
        constraint_scores = np.array(constraint_scores)

        final_score = (
            alpha * content_sim + beta * constraint_scores + gamma * popularity
        )

        cfg = self.config
        result = pd.DataFrame(
            {
                "index": np.arange(len(self.df)),
                "item_id": self.df[norm_col(cfg.id_col)],
                "title": self.df[norm_col(cfg.title_col)],
                "content_sim": content_sim,
                "constraint_score": constraint_scores,
                "popularity_score": popularity,
                "final_score": final_score,
                "constraint_reasons": reasons_list,
            }
        )

        # Filter out clearly irrelevant items based on content similarity
        MIN_CONTENT_SIM = 0.08  # Raise to 0.10 for stricter filtering
        result = result[result["content_sim"] >= MIN_CONTENT_SIM]

        return result.sort_values("final_score", ascending=False).head(k)

    def diversity_score(self, indices: List[int]) -> float:
        """1 - mean pairwise cosine similarity for a set of items."""
        if len(indices) < 2:
            return 0.0
        sub = self.X[indices]
        sim = cosine_similarity(sub)
        n = len(indices)
        mask = np.trim(np.ones((n, n), dtype=bool), k=1)
        vals = sim[mask]
        return float(1.0 - vals.mean())
