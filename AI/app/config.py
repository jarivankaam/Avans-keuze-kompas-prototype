# app/config.py

import os
from dataclasses import dataclass


@dataclass
class Settings:
    dataset_path: str = os.getenv("DATASET_PATH", "data/job_postings_dataset.csv")
    language: str = os.getenv("TFIDF_LANGUAGE", "dutch")
    max_features: int = int(os.getenv("TFIDF_MAX_FEATURES", "8000"))
    alpha: float = float(os.getenv("RECOMMENDER_ALPHA", "0.7"))
    beta: float = float(os.getenv("RECOMMENDER_BETA", "0.2"))
    gamma: float = float(os.getenv("RECOMMENDER_GAMMA", "0.1"))


settings = Settings()
