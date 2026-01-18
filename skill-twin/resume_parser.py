"""
Resume Parser - PDF Skill Extraction
Uses pypdf to extract text and match against skill database
"""

from pypdf import PdfReader
from typing import Dict, Any
import io
import re

# Comprehensive skill database with categories
SKILL_DB = {
    # Programming Languages
    "python": {"category": "language", "weight": 1.0},
    "javascript": {"category": "language", "weight": 1.0},
    "typescript": {"category": "language", "weight": 1.0},
    "java": {"category": "language", "weight": 1.0},
    "c++": {"category": "language", "weight": 0.9},
    "c#": {"category": "language", "weight": 0.9},
    "go": {"category": "language", "weight": 0.9},
    "rust": {"category": "language", "weight": 0.9},
    "ruby": {"category": "language", "weight": 0.8},
    "php": {"category": "language", "weight": 0.7},
    "swift": {"category": "language", "weight": 0.9},
    "kotlin": {"category": "language", "weight": 0.9},
    "scala": {"category": "language", "weight": 0.8},
    "r": {"category": "language", "weight": 0.8},
    
    # Frontend
    "react": {"category": "frontend", "weight": 1.0},
    "angular": {"category": "frontend", "weight": 0.9},
    "vue": {"category": "frontend", "weight": 0.9},
    "nextjs": {"category": "frontend", "weight": 1.0},
    "next.js": {"category": "frontend", "weight": 1.0},
    "html": {"category": "frontend", "weight": 0.5},
    "css": {"category": "frontend", "weight": 0.5},
    "tailwind": {"category": "frontend", "weight": 0.8},
    "sass": {"category": "frontend", "weight": 0.6},
    
    # Backend
    "node": {"category": "backend", "weight": 1.0},
    "nodejs": {"category": "backend", "weight": 1.0},
    "express": {"category": "backend", "weight": 0.9},
    "fastapi": {"category": "backend", "weight": 0.9},
    "django": {"category": "backend", "weight": 0.9},
    "flask": {"category": "backend", "weight": 0.8},
    "spring": {"category": "backend", "weight": 0.9},
    "graphql": {"category": "backend", "weight": 0.8},
    "rest": {"category": "backend", "weight": 0.7},
    
    # Cloud & DevOps
    "aws": {"category": "cloud", "weight": 1.0},
    "azure": {"category": "cloud", "weight": 1.0},
    "gcp": {"category": "cloud", "weight": 1.0},
    "docker": {"category": "devops", "weight": 1.0},
    "kubernetes": {"category": "devops", "weight": 1.0},
    "k8s": {"category": "devops", "weight": 1.0},
    "terraform": {"category": "devops", "weight": 0.9},
    "jenkins": {"category": "devops", "weight": 0.8},
    "github actions": {"category": "devops", "weight": 0.8},
    "ci/cd": {"category": "devops", "weight": 0.8},
    
    # Databases
    "postgresql": {"category": "database", "weight": 0.9},
    "mysql": {"category": "database", "weight": 0.8},
    "mongodb": {"category": "database", "weight": 0.9},
    "redis": {"category": "database", "weight": 0.8},
    "elasticsearch": {"category": "database", "weight": 0.8},
    "sql": {"category": "database", "weight": 0.7},
    "nosql": {"category": "database", "weight": 0.7},
    
    # AI/ML
    "machine learning": {"category": "ai", "weight": 1.0},
    "deep learning": {"category": "ai", "weight": 1.0},
    "tensorflow": {"category": "ai", "weight": 1.0},
    "pytorch": {"category": "ai", "weight": 1.0},
    "keras": {"category": "ai", "weight": 0.9},
    "scikit-learn": {"category": "ai", "weight": 0.9},
    "nlp": {"category": "ai", "weight": 0.9},
    "computer vision": {"category": "ai", "weight": 0.9},
    "neural network": {"category": "ai", "weight": 0.9},
    "llm": {"category": "ai", "weight": 1.0},
    "gpt": {"category": "ai", "weight": 0.9},
    "openai": {"category": "ai", "weight": 0.9},
    "langchain": {"category": "ai", "weight": 0.9},
    
    # Data
    "pandas": {"category": "data", "weight": 0.8},
    "numpy": {"category": "data", "weight": 0.8},
    "spark": {"category": "data", "weight": 0.9},
    "hadoop": {"category": "data", "weight": 0.8},
    "data analysis": {"category": "data", "weight": 0.8},
    "data science": {"category": "data", "weight": 1.0},
    
    # Tools
    "git": {"category": "tool", "weight": 0.6},
    "linux": {"category": "tool", "weight": 0.7},
    "agile": {"category": "tool", "weight": 0.6},
    "scrum": {"category": "tool", "weight": 0.6},
}


def parse_resume(file_content: bytes) -> Dict[str, Any]:
    """
    Parse PDF resume and extract skills
    Returns: { "success": True, "skills": { "python": 0.5, ... }, "raw_text": "..." }
    """
    try:
        # Read PDF from bytes
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        
        # Extract all text
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        text_lower = text.lower()
        
        # Find matching skills
        found_skills = {}
        for skill, info in SKILL_DB.items():
            # Use word boundary matching for accuracy
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Count occurrences for stronger signal
                count = len(re.findall(pattern, text_lower))
                # Base score 0.5, bonus for multiple mentions (up to 1.5 extra)
                base_score = 0.5 + min(count * 0.25, 1.5)
                found_skills[skill] = {
                    "score": round(base_score * info["weight"], 2),
                    "category": info["category"],
                    "mentions": count
                }
        
        return {
            "success": True,
            "skills": found_skills,
            "total_found": len(found_skills),
            "text_length": len(text),
            "pages": len(reader.pages)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "skills": {}
        }


def get_skill_categories() -> Dict[str, list]:
    """Get skills grouped by category"""
    categories = {}
    for skill, info in SKILL_DB.items():
        cat = info["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(skill)
    return categories
