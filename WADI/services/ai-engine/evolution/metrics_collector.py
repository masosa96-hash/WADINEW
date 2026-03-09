import random

def collect_metrics(project_id: str) -> dict:
    """
    Mock de colector de metricas.
    En v2 se conectará a PostHog, Google Analytics, Stripe, etc.
    """
    # Dummy data for demonstration
    return {
        "daily_users": random.randint(10, 500),
        "signup_rate": round(float(random.uniform(0.01, 0.1)), 3), # pyre-ignore
        "churn": round(float(random.uniform(0.01, 0.2)), 3), # pyre-ignore
        "feature_usage": {
            "dashboard": random.randint(50, 90),
            "settings": random.randint(5, 20),
            "core_action": random.randint(30, 80)
        }
    }
