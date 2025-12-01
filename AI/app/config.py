# app/config.py

import os
from dataclasses import dataclass


@dataclass
class Settings:
    dataset_path: str = os.getenv("DATASET_PATH", "data/half_done_vkm_dataset.csv")
    language: str = os.getenv("TFIDF_LANGUAGE", "english")
    max_features: int = int(os.getenv("TFIDF_MAX_FEATURES", "8000"))
    alpha: float = 0.80  # content similarity
    beta: float = 0.15   # constraints (location, difficulty, role tags)
    gamma: float = 0.05  # popularity


settings = Settings()
