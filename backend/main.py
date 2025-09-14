from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import asyncio
import json
import base64
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

from services.ai_service import AIService
from services.content_service import ContentService
from services.analytics_service import AnalyticsService
from services.gamification_service import GamificationService
from services.team_service import TeamService
from services.engagement_service import EngagementService
from services.enhanced_pomodoro_service import EnhancedPomodoroService, SessionType, TimerState
from services.enhanced_posture_service import EnhancedPostureService
from services.programming_service import ProgrammingService

app = FastAPI(title="Enhanced AI Programming Mentor API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
content_service = ContentService()
analytics_service = AnalyticsService()
gamification_service = GamificationService()
team_service = TeamService()
engagement_service = EngagementService()
pomodoro_service = EnhancedPomodoroService()
posture_service = EnhancedPostureService()
programming_service = ProgrammingService()

# Pydantic models
class PostureAnalysisRequest(BaseModel):
    image: str
    timestamp: int

class PresenceUpdateRequest(BaseModel):
    present: bool

class SessionSwitchRequest(BaseModel):
    session_type: str

# WebSocket connections
active_connections: Dict[str, WebSocket] = {}
pomodoro_connections: Dict[str, WebSocket] = {}

# Setup Pomodoro callbacks
async def on_timer_tick(state):
    for client_id, ws in pomodoro_connections.items():
        try:
            await ws.send_text(json.dumps({
                "type": "timer_state",
                "payload": state
            }))
        except:
            pass

async def on_auto_pause(state):
    for client_id, ws in pomodoro_connections.items():
        try:
            await ws.send_text(json.dumps({
                "type": "auto_paused",
                "payload": state
            }))
        except:
            pass

async def on_auto_resume(state):
    for client_id, ws in pomodoro_connections.items():
        try:
            await ws.send_text(json.dumps({
                "type": "auto_resumed",
                "payload": state
            }))
        except:
            pass

pomodoro_service.set_callback('on_tick', on_timer_tick)
pomodoro_service.set_callback('on_auto_pause', on_auto_pause)
pomodoro_service.set_callback('on_auto_resume', on_auto_resume)

@app.websocket("/ws/pomodoro")
async def pomodoro_websocket(websocket: WebSocket):
    await websocket.accept()
    client_id = f"pomodoro_{len(pomodoro_connections)}"
    pomodoro_connections[client_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any client messages if needed
    except WebSocketDisconnect:
        if client_id in pomodoro_connections:
            del pomodoro_connections[client_id]

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "chat":
                response = await ai_service.process_message(message["content"], message.get("subject"))
                await websocket.send_text(json.dumps({"type": "chat_response", "content": response}))
            
            elif message["type"] == "engagement_data":
                await engagement_service.process_engagement_data(client_id, message["data"])
                
    except WebSocketDisconnect:
        del active_connections[client_id]

# Enhanced Pomodoro endpoints
@app.post("/api/pomodoro/start")
async def start_pomodoro():
    result = await pomodoro_service.start_timer()
    return result

@app.post("/api/pomodoro/pause")
async def pause_pomodoro():
    result = await pomodoro_service.pause_timer(manual=True)
    return result

@app.post("/api/pomodoro/reset")
async def reset_pomodoro():
    result = await pomodoro_service.reset_timer()
    return result

@app.post("/api/pomodoro/switch")
async def switch_session(request: SessionSwitchRequest):
    try:
        session_type = SessionType(request.session_type)
        result = await pomodoro_service.switch_session(session_type)
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session type")

@app.post("/api/pomodoro/presence")
async def update_presence(request: PresenceUpdateRequest):
    result = await pomodoro_service.update_person_presence(request.present)
    return result

@app.get("/api/pomodoro/state")
async def get_pomodoro_state():
    return pomodoro_service.get_state()

# Enhanced posture analysis
@app.post("/api/analyze-posture")
async def analyze_posture(request: PostureAnalysisRequest):
    try:
        # Decode base64 image
        image_data = request.image.split(',')[1] if ',' in request.image else request.image
        image_bytes = base64.b64decode(image_data)
        
        # Convert to OpenCV format
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        # Analyze frame
        result = posture_service.analyze_frame(frame)
        
        # Update Pomodoro service with presence info
        if 'person_present' in result:
            await pomodoro_service.update_person_presence(result['person_present'])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    return await content_service.process_upload(file)

@app.get("/api/subjects")
async def get_subjects():
    return {
        "subjects": ["Python", "Java", "C++", "JavaScript", "TypeScript", "Go", "Rust", "PHP", "HTML/CSS", "SQL"],
        "categories": ["Programming", "Web Development", "Data Science", "Mobile Development"]
    }

@app.get("/api/programming/{language}/content")
async def get_programming_content(language: str):
    return await programming_service.get_course_content(language)

@app.get("/api/analytics/{user_id}")
async def get_analytics(user_id: str):
    return await analytics_service.get_user_analytics(user_id)

@app.get("/api/gamification/{user_id}")
async def get_gamification_data(user_id: str):
    return await gamification_service.get_user_progress(user_id)

@app.post("/api/team/create")
async def create_team(team_data: dict):
    return await team_service.create_team(team_data)

@app.get("/api/team/{team_id}")
async def get_team(team_id: str):
    return await team_service.get_team_details(team_id)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
