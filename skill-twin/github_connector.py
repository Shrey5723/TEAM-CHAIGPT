"""
GitHub Connector - Reality Check via GitHub API
Fetches repos, languages, and calculates velocity/consistency scores
"""

import httpx
from typing import Dict, Any, Optional
import asyncio

# GitHub language to skill mapping
LANGUAGE_SKILL_MAP = {
    "python": "python",
    "javascript": "javascript",
    "typescript": "typescript",
    "java": "java",
    "c++": "c++",
    "c#": "c#",
    "go": "go",
    "rust": "rust",
    "ruby": "ruby",
    "php": "php",
    "swift": "swift",
    "kotlin": "kotlin",
    "scala": "scala",
    "r": "r",
    "html": "html",
    "css": "css",
    "shell": "linux",
    "dockerfile": "docker",
    "hcl": "terraform",
}


async def fetch_github_data(username: str, token: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch GitHub user data and analyze for skill verification
    
    Returns:
    - velocity_score: Based on repo count
    - consistency_score: Based on stars and activity
    - languages: Programming languages used
    - repos: List of repositories
    """
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "SkillTwin-App"
    }
    if token:
        headers["Authorization"] = f"token {token}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Fetch user profile
            user_resp = await client.get(
                f"https://api.github.com/users/{username}",
                headers=headers
            )
            
            if user_resp.status_code == 404:
                return {"success": False, "error": "User not found"}
            elif user_resp.status_code != 200:
                return {"success": False, "error": f"API error: {user_resp.status_code}"}
            
            user_data = user_resp.json()

            # Fetch repositories
            repos_resp = await client.get(
                f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated",
                headers=headers
            )
            repos_data = repos_resp.json() if repos_resp.status_code == 200 else []

            # Calculate metrics
            public_repos = user_data.get("public_repos", 0)
            total_stars = sum(repo.get("stargazers_count", 0) for repo in repos_data)
            total_forks = sum(repo.get("forks_count", 0) for repo in repos_data)
            
            # Velocity Score: Measures output volume (0-1)
            velocity_score = min(public_repos / 10.0, 1.0)
            
            # Consistency Score: Measures quality/impact (0-1)
            star_factor = min(total_stars / 5.0, 1.0)
            fork_factor = min(total_forks / 3.0, 1.0)
            consistency_score = (star_factor + fork_factor) / 2

            # Extract languages
            languages = {}
            for repo in repos_data:
                lang = repo.get("language")
                if lang:
                    lang_lower = lang.lower()
                    if lang_lower in languages:
                        languages[lang_lower] += 1
                    else:
                        languages[lang_lower] = 1

            # Map languages to skills
            verified_skills = {}
            for lang, count in languages.items():
                skill_name = LANGUAGE_SKILL_MAP.get(lang, lang)
                # Score based on repo count using this language
                skill_score = min(0.5 + (count * 0.3), 3.0)  # Base 0.5, +0.3 per repo
                verified_skills[skill_name] = {
                    "score": round(skill_score, 2),
                    "repo_count": count,
                    "verified": True
                }

            # Recent activity (repos updated in last 6 months)
            recent_repos = [r for r in repos_data if r.get("pushed_at")][:10]

            return {
                "success": True,
                "username": username,
                "profile": {
                    "name": user_data.get("name") or username,
                    "avatar": user_data.get("avatar_url"),
                    "bio": user_data.get("bio"),
                    "followers": user_data.get("followers", 0),
                    "following": user_data.get("following", 0),
                    "public_repos": public_repos
                },
                "metrics": {
                    "velocity_score": round(velocity_score, 3),
                    "consistency_score": round(consistency_score, 3),
                    "total_stars": total_stars,
                    "total_forks": total_forks
                },
                "languages": languages,
                "verified_skills": verified_skills,
                "recent_repos": [
                    {
                        "name": r.get("name"),
                        "language": r.get("language"),
                        "stars": r.get("stargazers_count", 0),
                        "url": r.get("html_url")
                    }
                    for r in recent_repos
                ]
            }

        except httpx.TimeoutException:
            return {"success": False, "error": "Request timeout"}
        except Exception as e:
            return {"success": False, "error": str(e)}


def sync_fetch_github_data(username: str, token: Optional[str] = None) -> Dict[str, Any]:
    """Synchronous wrapper for async GitHub fetch"""
    return asyncio.run(fetch_github_data(username, token))
