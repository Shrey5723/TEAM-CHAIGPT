"""
SkillTwin - Digital Twin Core Logic
Manages skill state, velocity tracking, and future simulation
"""

from typing import Dict, Any
from datetime import datetime

class SkillTwin:
    def __init__(self):
        self.state = {
            "name": "Guest",
            "skills": {},
            "attributes": {
                "velocity": 0.0,
                "consistency": 0.0,
                "total_skills": 0
            },
            "last_updated": None,
            "github_connected": False,
            "resume_uploaded": False
        }

    def update_skill(self, name: str, impact: float, source: str = "unknown") -> Dict:
        """Add or update a skill. Impact adds to score, capped at 10.0"""
        name_lower = name.lower().strip()
        
        if name_lower in self.state["skills"]:
            current = self.state["skills"][name_lower]
            new_score = min(current["score"] + impact, 10.0)
            old_score = current["score"]
            velocity = (new_score - old_score) / max(1, impact)
            
            self.state["skills"][name_lower] = {
                "score": round(new_score, 2),
                "velocity": round(velocity, 3),
                "source": source,
                "last_update": datetime.now().isoformat()
            }
        else:
            self.state["skills"][name_lower] = {
                "score": round(min(impact, 10.0), 2),
                "velocity": round(impact * 0.1, 3),
                "source": source,
                "last_update": datetime.now().isoformat()
            }
        
        self.recalculate_attributes()
        self.state["last_updated"] = datetime.now().isoformat()
        return self.state["skills"][name_lower]

    def recalculate_attributes(self):
        """Recalculate global attributes from all skills"""
        skills = self.state["skills"]
        if not skills:
            self.state["attributes"] = {
                "velocity": 0.0,
                "consistency": 0.0,
                "total_skills": 0
            }
            return

        scores = [s["score"] for s in skills.values()]
        velocities = [s["velocity"] for s in skills.values()]
        
        avg_score = sum(scores) / len(scores)
        avg_velocity = sum(velocities) / len(velocities)
        
        # Consistency = how evenly distributed skills are (lower std dev = higher consistency)
        if len(scores) > 1:
            variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
            std_dev = variance ** 0.5
            consistency = max(0, 1 - (std_dev / 5))  # Normalize
        else:
            consistency = 1.0

        self.state["attributes"] = {
            "velocity": round(avg_velocity, 3),
            "consistency": round(consistency, 3),
            "total_skills": len(skills),
            "avg_score": round(avg_score, 2)
        }

    def simulate_future(self, months: int = 12) -> Dict:
        """
        Simulate future skill growth
        Formula: Future_Score = Current_Score + (Global_Velocity * (months / 12))
        """
        global_velocity = self.state["attributes"]["velocity"]
        future_skills = {}
        
        for name, skill in self.state["skills"].items():
            current_score = skill["score"]
            skill_velocity = skill["velocity"]
            
            # Combined velocity (global + individual)
            combined_velocity = (global_velocity + skill_velocity) / 2
            
            # Calculate future score
            growth = combined_velocity * (months / 12) * 2  # Amplify for visibility
            future_score = min(current_score + growth, 10.0)
            
            future_skills[name] = {
                "current_score": round(current_score, 2),
                "future_score": round(future_score, 2),
                "growth": round(future_score - current_score, 2),
                "velocity_used": round(combined_velocity, 3)
            }

        return {
            "months_simulated": months,
            "current_state": self.state["skills"],
            "future_state": future_skills,
            "prediction_confidence": min(0.95, 0.5 + (len(self.state["skills"]) * 0.05))
        }

    def set_name(self, name: str):
        """Set the twin's name"""
        self.state["name"] = name
        self.state["last_updated"] = datetime.now().isoformat()

    def clear_skills(self):
        """Clear only skills (called before processing a new resume)"""
        self.state["skills"] = {}
        self.state["resume_uploaded"] = False
        self.recalculate_attributes()
        self.state["last_updated"] = datetime.now().isoformat()

    def reset(self):
        """Full reset to blank state"""
        self.state = {
            "name": "Guest",
            "skills": {},
            "attributes": {
                "velocity": 0.0,
                "consistency": 0.0,
                "total_skills": 0
            },
            "last_updated": datetime.now().isoformat(),
            "github_connected": False,
            "resume_uploaded": False
        }

    def get_state(self) -> Dict[str, Any]:
        """Return current state"""
        return self.state

    def get_skill_names(self) -> list:
        """Get list of skill names for chart labels"""
        return list(self.state["skills"].keys())

    def get_skill_scores(self) -> list:
        """Get list of skill scores for chart data"""
        return [s["score"] for s in self.state["skills"].values()]


# Singleton instance
skill_twin = SkillTwin()
