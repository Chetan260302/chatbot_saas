# backend/app/core/plan_limits.py
"""
Single source of truth for plan-based usage limits.
"""

PLAN_LIMITS = {
    "free": {
        "max_chatbots": 1,
        "max_documents_per_chatbot": 2,
        "max_conversations_per_month": 100,
        "max_messages_per_month": 500,
        "trial_days": 30,
    },
    "starter": {
        "max_chatbots": 5,
        "max_documents_per_chatbot": 50,
        "max_conversations_per_month": 2000,
        "max_messages_per_month": 10000,
        "trial_days": None,
    },
    "growth": {
        "max_chatbots": 50,
        "max_documents_per_chatbot": 500,
        "max_conversations_per_month": 10000,
        "max_messages_per_month": 50000,
        "trial_days": None,
    },
    "enterprise": {
        "max_chatbots": 999999,
        "max_documents_per_chatbot": 999999,
        "max_conversations_per_month": 999999,
        "max_messages_per_month": 999999,
        "trial_days": None,
    },
}
