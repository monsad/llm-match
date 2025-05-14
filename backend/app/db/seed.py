import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import User, LLMModel
from app.core.security import get_password_hash

def create_admin_user(db: Session) -> None:
    """Create admin user if it doesn't exist"""
    admin = db.query(User).filter(User.email == "admin@llmadvisor.com").first()
    if not admin:
        admin = User(
            email="admin@llmadvisor.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),  # Change in production
            is_active=True,
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        print("Admin user created")
    else:
        print("Admin user already exists")

def create_sample_models(db: Session) -> None:
    """Create sample LLM models if none exist"""
    model_count = db.query(LLMModel).count()
    if model_count == 0:
        models = [
            LLMModel(
                name="GPT-4",
                provider="OpenAI",
                version="4-turbo",
                parameters=1500.0,
                description="Advanced large language model with improved reasoning capabilities.",
                training_data="Trained on data up to 2023, including web text, books, articles, and code.",
                performance_benchmarks={
                    "MMLU": 86.4,
                    "HellaSwag": 95.3,
                    "TruthfulQA": 71.9,
                    "GSM8K": 92.0
                },
                hardware_requirements="Available through API. For local deployment requires significant GPU resources.",
                pricing_info="Pay-per-token model with higher cost than previous versions. Enterprise licensing available.",
                strengths="Excellent reasoning, coding abilities, and general knowledge. Strong at complex tasks, creative content, and instruction following.",
                weaknesses="Higher cost compared to smaller models. May occasionally hallucinate facts.",
                supported_languages=["English", "Spanish", "French", "German", "Japanese", "Chinese", "Russian", "Portuguese", "Italian"],
                license_type="commercial"
            ),
            LLMModel(
                name="Claude",
                provider="Anthropic",
                version="3 Opus",
                parameters=175.0,
                description="A frontier model designed for thoughtful dialogue and content generation.",
                training_data="Trained on a diverse corpus of text data including books, websites, and other sources.",
                performance_benchmarks={
                    "MMLU": 86.8,
                    "HellaSwag": 94.6,
                    "TruthfulQA": 78.5,
                    "GSM8K": 91.5
                },
                hardware_requirements="Available through API. Not available for local deployment.",
                pricing_info="Pay-per-token pricing with volume discounts. Enterprise plans available.",
                strengths="Excels at natural conversation, essay writing, summarization, and reasoning. Strong built-in safety features.",
                weaknesses="More limited coding capabilities compared to some competitors. Not available for local deployment.",
                supported_languages=["English", "Spanish", "French", "German", "Portuguese", "Italian"],
                license_type="commercial"
            ),
            LLMModel(
                name="Llama",
                provider="Meta",
                version="3 405B",
                parameters=405.0,
                description="Large open-source language model designed for research and commercial use.",
                training_data="Trained on publicly available datasets including web data, books, and code repositories.",
                performance_benchmarks={
                    "MMLU": 83.7,
                    "HellaSwag": 93.2,
                    "TruthfulQA": 63.8,
                    "GSM8K": 88.4
                },
                hardware_requirements="Requires multiple high-end GPUs for full model deployment. Quantized versions available for consumer hardware.",
                pricing_info="Free for research. Commercial use requires following license terms.",
                strengths="Strong performance relative to model size. Versatile for multiple tasks including dialogue, code generation, and reasoning.",
                weaknesses="Requires significant resources for deployment of full model. May require fine-tuning for specialized tasks.",
                supported_languages=["English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian", "Japanese", "Chinese", "Korean", "Arabic"],
                license_type="open_source"
            ),
            LLMModel(
                name="Gemma",
                provider="Google",
                version="2 27B",
                parameters=27.0,
                description="Lightweight open model based on Gemini technology.",
                training_data="Trained on web documents, mathematics, and code.",
                performance_benchmarks={
                    "MMLU": 73.5,
                    "HellaSwag": 87.8,
                    "TruthfulQA": 61.3,
                    "GSM8K": 77.9
                },
                hardware_requirements="Can run on a single consumer GPU with 24GB+ VRAM. Quantized versions can run on smaller GPUs.",
                pricing_info="Free for research and commercial use under license terms.",
                strengths="Efficient for its size. Good at general knowledge, reasoning, and basic coding.",
                weaknesses="Less capable than larger models for complex reasoning and specialized domains.",
                supported_languages=["English", "Spanish", "French", "German", "Italian"],
                license_type="open_source"
            ),
            LLMModel(
                name="Mixtral",
                provider="Mistral AI",
                version="8x22B",
                parameters=176.0,
                description="Sparse mixture-of-experts model with strong performance across tasks.",
                training_data="Trained on diverse internet text, books, and code.",
                performance_benchmarks={
                    "MMLU": 81.2,
                    "HellaSwag": 92.6,
                    "TruthfulQA": 68.4,
                    "GSM8K": 85.7
                },
                hardware_requirements="Available via API. Local deployment requires high-end GPU setup.",
                pricing_info="API access with pay-per-token pricing. Open weights versions available.",
                strengths="Excellent code generation and understanding. Strong reasoning capabilities and efficiency.",
                weaknesses="Larger resource requirements than non-MoE models of similar capability.",
                supported_languages=["English", "French", "Spanish", "German", "Italian", "Portuguese", "Dutch"],
                license_type="commercial"
            ),
            LLMModel(
                name="PaLM",
                provider="Google",
                version="2",
                parameters=340.0,
                description="Large language model with strong reasoning capabilities.",
                training_data="Trained on web documents, books, code, and other text sources.",
                performance_benchmarks={
                    "MMLU": 79.1,
                    "HellaSwag": 90.2,
                    "TruthfulQA": 65.3,
                    "GSM8K": 80.7
                },
                hardware_requirements="Available through Google Cloud API. Not available for local deployment.",
                pricing_info="Available through Google Cloud with various pricing tiers.",
                strengths="Strong reasoning, multilingual capabilities, and code generation.",
                weaknesses="Only available through Google Cloud. Less accessible for local deployment.",
                supported_languages=["English", "Spanish", "French", "German", "Japanese", "Chinese", "Korean", "Hindi", "Italian", "Portuguese"],
                license_type="commercial"
            ),
            LLMModel(
                name="Pythia",
                provider="EleutherAI",
                version="12B",
                parameters=12.0,
                description="Open-source language model designed for research.",
                training_data="Trained on The Pile, a diverse dataset of text from the internet.",
                performance_benchmarks={
                    "MMLU": 43.5,
                    "HellaSwag": 72.8,
                    "TruthfulQA": 41.3,
                    "GSM8K": 11.9
                },
                hardware_requirements="Can run on consumer GPUs with 16GB+ VRAM. Quantized versions can run on smaller GPUs.",
                pricing_info="Free for research and commercial use.",
                strengths="Fully open source. Good for research and fine-tuning experiments.",
                weaknesses="Lower performance than state-of-the-art models. Requires fine-tuning for most practical applications.",
                supported_languages=["English"],
                license_type="open_source"
            ),
            LLMModel(
                name="Falcon",
                provider="TII",
                version="180B",
                parameters=180.0,
                description="Open-source language model with competitive performance.",
                training_data="Trained on large-scale web text, including RefinedWeb dataset.",
                performance_benchmarks={
                    "MMLU": 70.4,
                    "HellaSwag": 85.9,
                    "TruthfulQA": 59.6,
                    "GSM8K": 57.2
                },
                hardware_requirements="Requires multiple high-end GPUs for full model deployment. Quantized versions available.",
                pricing_info="Free for research and commercial use under Apache 2.0 license.",
                strengths="Strong performance for an open-source model. Permissive license.",
                weaknesses="Requires significant hardware for full deployment. Less refined than proprietary alternatives.",
                supported_languages=["English", "French", "Spanish", "Arabic"],
                license_type="open_source"
            ),
            LLMModel(
                name="Claude",
                provider="Anthropic",
                version="3 Haiku",
                parameters=85.0,
                description="Smaller, faster version of Claude optimized for rapid responses.",
                training_data="Similar training data to other Claude models with optimizations for speed.",
                performance_benchmarks={
                    "MMLU": 79.2,
                    "HellaSwag": 90.7,
                    "TruthfulQA": 72.1,
                    "GSM8K": 83.3
                },
                hardware_requirements="Available through API. Not available for local deployment.",
                pricing_info="Lower cost per token than Claude Opus. Volume discounts available.",
                strengths="Fast response times. Good balance of quality and cost. Strong at chat and summarization.",
                weaknesses="Less capable than larger Claude models at complex reasoning tasks.",
                supported_languages=["English", "Spanish", "French", "German", "Portuguese", "Italian"],
                license_type="commercial"
            ),
            LLMModel(
                name="GPT-3.5",
                provider="OpenAI",
                version="Turbo",
                parameters=175.0,
                description="Balanced language model for general purpose use.",
                training_data="Trained on web texts, books, articles, and code up to 2021.",
                performance_benchmarks={
                    "MMLU": 70.1,
                    "HellaSwag": 85.5,
                    "TruthfulQA": 57.8,
                    "GSM8K": 57.1
                },
                hardware_requirements="Available through API. Not available for local deployment.",
                pricing_info="Low cost per token compared to GPT-4. Volume discounts available.",
                strengths="Good balance of capability and cost. Fast response times. Strong at chat and creative content.",
                weaknesses="Less capable than GPT-4 at complex reasoning. Knowledge cutoff limits recent information.",
                supported_languages=["English", "Spanish", "French", "German", "Japanese", "Chinese", "Russian", "Portuguese", "Italian"],
                license_type="commercial"
            ),
        ]
        
        for model in models:
            db.add(model)
        
        db.commit()
        print(f"Added {len(models)} sample LLM models")
    else:
        print(f"Database already contains {model_count} models")

def main() -> None:
    """Seed the database with initial data"""
    db = SessionLocal()
    try:
        create_admin_user(db)
        create_sample_models(db)
        print("Database seeding completed")
    finally:
        db.close()

if __name__ == "__main__":
    main()
