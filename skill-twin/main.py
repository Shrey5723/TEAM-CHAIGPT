"""
Skill Twin - FastAPI Server
Main entry point serving API endpoints and static frontend
Integrates with main Node.js backend for user data
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import httpx
import os

from twin_core import skill_twin
from resume_parser import parse_resume
from github_connector import fetch_github_data

# Main app backend URL
MAIN_BACKEND_URL = "http://localhost:3000"

# Initialize FastAPI
app = FastAPI(
    title="Skill Twin API",
    description="Digital Twin for Skill Intelligence - Extension of Main App",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class GitHubRequest(BaseModel):
    username: str
    token: str | None = None

class SimulateRequest(BaseModel):
    months: int = 12

class NameRequest(BaseModel):
    name: str

class SyncRequest(BaseModel):
    token: str


# API Endpoints

@app.get("/")
async def root():
    """Serve the main dashboard"""
    return FileResponse("static/index.html")


@app.get("/api/state")
async def get_state():
    """Get current twin state"""
    return JSONResponse(content=skill_twin.get_state())


@app.post("/api/sync_from_main_app")
async def sync_from_main_app(request: SyncRequest):
    """
    Sync data from the main Node.js backend
    Fetches user profile, skills, and GitHub repos using auth token
    """
    token = request.token
    if not token:
        raise HTTPException(status_code=400, detail="Auth token required")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Fetch profile from main app
            profile_resp = await client.get(
                f"{MAIN_BACKEND_URL}/api/applicant/profile",
                headers=headers
            )
            
            if profile_resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Failed to fetch profile. Check auth token.")
            
            profile_data = profile_resp.json()
            
            if not profile_data.get("success"):
                raise HTTPException(status_code=400, detail="Profile not found. Create profile first.")
            
            profile = profile_data.get("data", {})
            
            # Reset twin and set name from profile
            skill_twin.reset()
            
            # Get user name from profile or use "Applicant"
            user_name = profile.get("user", {}).get("name", "Applicant")
            skill_twin.set_name(user_name)
            
            # Extract skills from derived_skills
            derived_skills = profile.get("derivedSkills", [])
            for skill in derived_skills:
                skill_twin.update_skill(
                    name=skill.get("name", "unknown"),
                    impact=skill.get("confidence", 0.5) * 10,  # Convert 0-1 to 0-10 scale
                    source=skill.get("source", "main-app")
                )
            
            # Extract skills from certificates
            certificates = profile.get("certificates", [])
            for cert in certificates:
                # Add certificate as a meta-skill
                cert_name = cert.get("name", "")
                platform = cert.get("platform", "")
                if cert_name:
                    if cert_name:
                        # Use first 2 words of cert name for better display
                        short_name = " ".join(cert_name.split()[:2]).lower()
                        skill_twin.update_skill(
                            name=short_name,
                            impact=3.0,  # Increased impact for certificates
                            source="certificate"
                        )
            
            # Extract languages from GitHub repos
            github_repos = profile.get("githubRepos", [])
            for repo in github_repos:
                languages = repo.get("languages", [])
                
                # Handle dictionary (old legacy) or list (prisma String[])
                if isinstance(languages, dict):
                    for lang in languages.keys():
                        skill_twin.update_skill(
                            name=lang.lower(),
                            impact=1.0,
                            source="github"
                        )
                elif isinstance(languages, list):
                    for lang in languages:
                        if isinstance(lang, str):
                            skill_twin.update_skill(
                                name=lang.lower(),
                                impact=1.0,
                                source="github"
                            )
            
            skill_twin.state["resume_uploaded"] = bool(profile.get("resume"))
            skill_twin.state["github_connected"] = len(github_repos) > 0
            
            return {
                "success": True,
                "message": f"Synced data for {user_name}",
                "synced": {
                    "skills": len(derived_skills),
                    "certificates": len(certificates),
                    "github_repos": len(github_repos)
                },
                "twin_state": skill_twin.get_state()
            }
            
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Connection to main app failed: {str(e)}")


@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and parse resume PDF
    Extracts skills and updates the twin
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read file content
        content = await file.read()
        
        # Clear existing skills before processing new resume
        skill_twin.clear_skills()
        
        # Parse resume
        result = parse_resume(content)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to parse resume"))
        
        # Update twin with extracted skills
        for skill_name, skill_data in result["skills"].items():
            skill_twin.update_skill(
                name=skill_name,
                impact=skill_data["score"],
                source="resume"
            )
        
        skill_twin.state["resume_uploaded"] = True
        
        return {
            "success": True,
            "message": f"Extracted {result['total_found']} skills from {result['pages']} pages",
            "skills_found": result["skills"],
            "twin_state": skill_twin.get_state()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/connect_github")
async def connect_github(request: GitHubRequest):
    """
    Connect GitHub account and verify skills
    Adds velocity and consistency scores
    """
    try:
        result = await fetch_github_data(request.username, request.token)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to fetch GitHub data"))
        
        # Update twin name from GitHub profile
        profile_name = result["profile"]["name"]
        if profile_name:
            skill_twin.set_name(profile_name)
        
        # Add verified skills from GitHub
        for skill_name, skill_data in result["verified_skills"].items():
            skill_twin.update_skill(
                name=skill_name,
                impact=skill_data["score"],
                source="github"
            )
        
        # Update global velocity and consistency
        metrics = result["metrics"]
        skill_twin.state["attributes"]["velocity"] = max(
            skill_twin.state["attributes"]["velocity"],
            metrics["velocity_score"]
        )
        skill_twin.state["attributes"]["consistency"] = max(
            skill_twin.state["attributes"]["consistency"],
            metrics["consistency_score"]
        )
        skill_twin.state["github_connected"] = True
        
        return {
            "success": True,
            "message": f"Connected as {profile_name}",
            "github_data": result,
            "twin_state": skill_twin.get_state()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simulate")
async def simulate_future(request: SimulateRequest):
    """
    Simulate future skill growth
    Returns predicted state after N months
    """
    if request.months < 1 or request.months > 120:
        raise HTTPException(status_code=400, detail="Months must be between 1 and 120")
    
    simulation = skill_twin.simulate_future(request.months)
    
    return {
        "success": True,
        "simulation": simulation,
        "current_state": skill_twin.get_state()
    }


@app.post("/api/reset")
async def reset_twin():
    """Reset the twin to blank state"""
    skill_twin.reset()
    return {
        "success": True,
        "message": "Twin reset to initial state",
        "twin_state": skill_twin.get_state()
    }


@app.post("/api/set_name")
async def set_name(request: NameRequest):
    """Set the twin's name"""
    skill_twin.set_name(request.name)
    return {
        "success": True,
        "message": f"Name set to {request.name}",
        "twin_state": skill_twin.get_state()
    }


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


if __name__ == "__main__":
    port = 8005
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                     🧠 SKILL TWIN                            ║
║                Digital Twin for Skill Intelligence           ║
╠══════════════════════════════════════════════════════════════╣
║  Dashboard: http://localhost:{port}                            ║
║  API Docs:  http://localhost:{port}/docs                       ║
╚══════════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(app, host="0.0.0.0", port=port)
