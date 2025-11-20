# app/main.py

from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .config import settings
from .recommender import (
    CandidateProfile,
    DatasetConfig,
    GenericRecommender,
    QuizQuestionConfig,
)

app = FastAPI(
    title="Recommender API",
    version="1.0.0",
    description="Content-based + constraint-based recommender with quiz integration.",
)


# ---------- Global recommender + quiz config ----------

recommender: Optional[GenericRecommender] = None
quiz_configs: Dict[str, QuizQuestionConfig] = {}


def init_quiz_configs() -> Dict[str, QuizQuestionConfig]:
    """
    Hard-coded example of how quiz answers map to keywords.
    You can change this to fit your front-end.
    """
    return {
        "pref_work_style": QuizQuestionConfig(
            id="pref_work_style",
            answer_to_keywords={
                "team": ["teamwork", "collaboration"],
                "solo": ["independent", "autonomous"],
            },
            weight=1.0,
        ),
        "pref_domain": QuizQuestionConfig(
            id="pref_domain",
            answer_to_keywords={
                "data": ["data", "analytics", "machine_learning"],
                "web": ["web_development", "frontend", "backend"],
            },
            weight=1.0,
        ),
    }


def init_recommender() -> GenericRecommender:
    """
    Initialize the recommender from CSV and dataset config.
    Change DatasetConfig to adapt to a different dataset.
    """
    try:
        df = pd.read_csv(settings.dataset_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load dataset at {settings.dataset_path}: {e}")

    # Example config for a jobs dataset – adjust to your CSV columns.
    dataset_cfg = DatasetConfig(
        id_col="job_id",
        title_col="job_title",
        text_cols=[
            "short_description",
            "full_description",
            "responsibilities",
            "required_skills",
            "nice_to_have_skills",
            "role_tags",
        ],
        location_col="job_location",
        salary_min_col="salary_min",
        difficulty_col="difficulty",
        popularity_col="views",  # or clicks / applicants / rating etc.
        role_tag_cols=["role_tags"],
    )

    return GenericRecommender(
        df=df,
        config=dataset_cfg,
        language=settings.language,
        max_features=settings.max_features,
    )


@app.on_event("startup")
def on_startup():
    global recommender, quiz_configs
    quiz_configs = init_quiz_configs()
    recommender = init_recommender()


# ---------- Pydantic models for API ----------


class RecommendRequest(BaseModel):
    interests_text: str = Field(
        ..., description="Free text describing skills, interests, technologies."
    )
    preferred_location: Optional[str] = Field(
        None, description="Preferred location, e.g. 'Amsterdam'."
    )
    min_salary: Optional[float] = Field(
        None, description="Minimum desired salary (number)."
    )
    max_difficulty: Optional[float] = Field(
        None, description="Maximum difficulty level accepted."
    )
    role_include: List[str] = Field(
        default_factory=list,
        description="List of domain/role tags the user is interested in.",
    )
    quiz_answers: Dict[str, Any] = Field(
        default_factory=dict,
        description="Mapping from quiz question ID to answer value.",
    )
    k: int = Field(10, ge=1, le=100, description="Number of recommendations to return.")


class RecommendationItem(BaseModel):
    item_id: Any
    title: str
    final_score: float
    content_sim: float
    constraint_score: float
    popularity_score: float
    constraint_reasons: Dict[str, Any]


class RecommendResponse(BaseModel):
    recommendations: List[RecommendationItem]


class HealthResponse(BaseModel):
    status: str


# ---------- Routes ----------


@app.get("/health", response_model=HealthResponse)
def health_check():
    if recommender is None:
        return HealthResponse(status="initializing")
    return HealthResponse(status="ok")


@app.post("/recommend", response_model=RecommendResponse)
def recommend_endpoint(payload: RecommendRequest):
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommender not initialized")

    profile = CandidateProfile(
        interests_text=payload.interests_text,
        preferred_location=payload.preferred_location,
        min_salary=payload.min_salary,
        max_difficulty=payload.max_difficulty,
        role_include=payload.role_include,
        quiz_answers=payload.quiz_answers,
    )

    try:
        df = recommender.recommend(
            profile,
            k=payload.k,
            alpha=settings.alpha,
            beta=settings.beta,
            gamma=settings.gamma,
            quiz_configs=quiz_configs,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {e}")

    items: List[RecommendationItem] = []
    for _, row in df.iterrows():
        items.append(
            RecommendationItem(
                item_id=row["item_id"],
                title=row["title"],
                final_score=float(row["final_score"]),
                content_sim=float(row["content_sim"]),
                constraint_score=float(row["constraint_score"]),
                popularity_score=float(row["popularity_score"]),
                constraint_reasons=row["constraint_reasons"],
            )
        )

    return RecommendResponse(recommendations=items)
