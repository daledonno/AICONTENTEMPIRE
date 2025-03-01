from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import os
import json
import uuid
import time
import asyncio
import httpx
import base64
from datetime import datetime
import shutil
import random
from gtts import gTTS
import moviepy.editor as mp
import re
from pathlib import Path
import io
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
FAL_API_KEY = os.getenv("FAL_API_KEY")

# Create directories for storing assets and rendered videos
os.makedirs("assets/audio", exist_ok=True)
os.makedirs("assets/images", exist_ok=True)
os.makedirs("assets/videos", exist_ok=True)
os.makedirs("rendered", exist_ok=True)
os.makedirs("projects", exist_ok=True)
os.makedirs("templates", exist_ok=True)

app = FastAPI(title="Video Maker API")

# Allow your website to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="rendered"), name="static")
app.mount("/images", StaticFiles(directory="assets/images"), name="images")
app.mount("/audio", StaticFiles(directory="assets/audio"), name="audio")
app.mount("/videos", StaticFiles(directory="assets/videos"), name="videos")

# Models
class TimelineSegment(BaseModel):
    id: str
    type: str
    text: str
    duration: int = 3  # Default to 3 seconds (2-4s range, capped)
    mediaType: str = "image"  # Default to image for visuals
    background: str = "#1e293b"
    visualPrompt: str = ""
    imageUrl: Optional[str] = None
    videoUrl: Optional[str] = None  # For custom videos
    captions: Optional[bool] = False  # For captions on/off

class TimelineData(BaseModel):
    segments: List[TimelineSegment]
    slideImages: Dict[str, str] = {}  # Store generated image URLs
    customVideos: Dict[str, str] = {}  # Store custom video URLs

class ScriptRequest(BaseModel):
    title: str
    topic: str
    goal: str
    target_audience: str
    tone: str = "informative"
    selected_template: Optional[str] = None
    segmentTypes: List[str]
    target_duration: Optional[int] = None  # Target video length in seconds
    use_trends: bool = False  # New field for trend-based scripts
    max_words_per_segment: Optional[int] = 8  # Customizable word limit per template
    slide_duration: Optional[int] = 3  # Customizable slide duration (2-4s)

class TemplateSchema(BaseModel):
    id: str
    name: str
    description: str
    structure: List[Dict[str, str]]  # Segment types and purposes
    slide_duration: int = 3  # Default slide duration (2-4s)
    max_words_per_segment: int = 8  # Default max words per segment
    captions: bool = False  # Default captions setting
    aspect_ratio: str = "9:16"  # Default aspect ratio (9:16 or 16:9)

class RenderRequest(BaseModel):
    voiceId: int
    format: str = "mp4"
    resolution: str = "720p"
    editing_style: str = "standard"
    music_track: Optional[str] = None
    music_volume: float = 0.3
    captions: Optional[bool] = False  # Add captions option
    aspect_ratio: str = "9:16"  # Add aspect ratio option

class GenerateImageRequest(BaseModel):
    prompt: str
    segment_id: str
    style: str = "realistic"
    aspect_ratio: str = "9:16"

class QueueItem(BaseModel):
    video_id: int
    render_request: RenderRequest

# In-memory storage until we implement a database
videos = [
    {
        "id": 1,
        "title": "AI Image Generation Tools",
        "status": "ready",
        "progress": 100,
        "duration": "1:24",
        "created": "2 hours ago",
        "aspect_ratio": "9:16"
    },
    {
        "id": 2,
        "title": "GPT-5 Capabilities Overview",
        "status": "draft",
        "progress": 0,
        "duration": "",
        "created": "1 day ago",
        "aspect_ratio": "9:16"
    },
    {
        "id": 3,
        "title": "AI in Healthcare Applications",
        "status": "draft",
        "progress": 0,
        "duration": "",
        "created": "3 days ago",
        "aspect_ratio": "9:16"
    }
]

# Video templates (stored in templates directory)
templates = [
    {
        "id": "educational-explainer",
        "name": "Educational Explainer",
        "description": "Explains a topic in simple terms with examples",
        "structure": [
            {"type": "Hook", "purpose": "Grab attention with a surprising fact (1 sentence)"},
            {"type": "Intro", "purpose": "Introduce the topic briefly (1 sentence)"},
            {"type": "Point", "purpose": "Explain a key concept briefly (1 sentence)"},
            {"type": "Point", "purpose": "Provide an example briefly (1 sentence)"},
            {"type": "Conclusion", "purpose": "Summarize and call to action briefly (1 sentence)"}
        ],
        "slide_duration": 3,
        "max_words_per_segment": 8,
        "captions": True,
        "aspect_ratio": "9:16"
    },
    {
        "id": "product-tutorial",
        "name": "Product Tutorial",
        "description": "Step-by-step guide on using a product",
        "structure": [
            {"type": "Hook", "purpose": "Highlight a key benefit briefly (1 sentence)"},
            {"type": "Intro", "purpose": "Introduce the product briefly (1 sentence)"},
            {"type": "Point", "purpose": "Step 1 explanation briefly (1 sentence)"},
            {"type": "Point", "purpose": "Step 2 explanation briefly (1 sentence)"},
            {"type": "Conclusion", "purpose": "Recap benefits and call to action briefly (1 sentence)"}
        ],
        "slide_duration": 3,
        "max_words_per_segment": 10,  # More words for detailed steps
        "captions": True,
        "aspect_ratio": "9:16"
    },
    {
        "id": "silent-ugc",
        "name": "Silent UGC",
        "description": "User-generated content without voice, focusing on visuals",
        "structure": [
            {"type": "Hook", "purpose": "Visually engaging hook (no text)"},
            {"type": "Point", "purpose": "Visual demonstration 1 (no text)"},
            {"type": "Point", "purpose": "Visual demonstration 2 (no text)"},
            {"type": "Conclusion", "purpose": "Call to action visually (no text)"}
        ],
        "slide_duration": 4,
        "max_words_per_segment": 0,  # No text for silent videos
        "captions": False,
        "aspect_ratio": "9:16"
    },
    {
        "id": "ai-ugc",
        "name": "AI UGC",
        "description": "AI-generated user content with lip-sync and visuals",
        "structure": [
            {"type": "Hook", "purpose": "Engaging lip-sync hook (1 sentence)"},
            {"type": "Curiosity Builder", "purpose": "Build curiosity briefly (1 sentence)"},
            {"type": "Problem", "purpose": "State a problem briefly (1 sentence)"},
            {"type": "Pain Points", "purpose": "Highlight pain points briefly (1 sentence)"},
            {"type": "Holy Grail Solution", "purpose": "Offer solution briefly (1 sentence)"},
            {"type": "Conclusion", "purpose": "Call to action with lip-sync briefly (1 sentence)"}
        ],
        "slide_duration": 3,
        "max_words_per_segment": 8,
        "captions": True,
        "aspect_ratio": "9:16"
    }
]

# Store timelines, images, queue, and templates
timelines = {}
generated_images = {}
render_queue = []  # In-memory queue for video rendering
template_store = {}  # In-memory template storage (will sync with file)

# Load templates from file on startup
def load_templates():
    global templates, template_store
    template_path = "templates/templates.json"
    if os.path.exists(template_path):
        with open(template_path, "r") as f:
            template_store = json.load(f)
    else:
        template_store = templates
        with open(template_path, "w") as f:
            json.dump(templates, f)

# Save templates to file
def save_templates():
    with open("templates/templates.json", "w") as f:
        json.dump(template_store, f)

# API Routes
@app.get("/api/videos")
async def get_videos():
    """Get all videos"""
    return videos

@app.get("/api/videos/{video_id}")
async def get_video(video_id: int):
    """Get a specific video"""
    for video in videos:
        if video["id"] == video_id:
            return video
    raise HTTPException(status_code=404, detail="Video not found")

@app.get("/api/videos/{video_id}/stream")
async def stream_video(video_id: int):
    """Stream a video file"""
    for video in videos:
        if video["id"] == video_id and video["status"] == "ready":
            file_path = f"rendered/video_{video_id}.mp4"
            if os.path.exists(file_path):
                return FileResponse(file_path)
            else:
                placeholder_path = "assets/videos/placeholder.mp4"
                if os.path.exists(placeholder_path):
                    return FileResponse(placeholder_path, media_type="video/mp4")
                raise HTTPException(status_code=404, detail="Video file not found")
    raise HTTPException(status_code=404, detail="Video not found or not ready")

@app.get("/api/script-templates")
async def get_script_templates():
    """Get all script templates"""
    return template_store

@app.post("/api/templates")
async def create_template(template: TemplateSchema):
    """Create a new video template"""
    template_dict = template.dict()
    template_dict["id"] = str(uuid.uuid4())
    template_store.append(template_dict)
    save_templates()
    return {"status": "success", "template": template_dict}

@app.get("/api/templates/{template_id}")
async def get_template(template_id: str):
    """Get a specific template"""
    for template in template_store:
        if template["id"] == template_id:
            return template
    raise HTTPException(status_code=404, detail="Template not found")

@app.put("/api/templates/{template_id}")
async def update_template(template_id: str, template: TemplateSchema):
    """Update an existing template"""
    for i, t in enumerate(template_store):
        if t["id"] == template_id:
            template_store[i] = template.dict()
            template_store[i]["id"] = template_id
            save_templates()
            return {"status": "success", "template": template_store[i]}
    raise HTTPException(status_code=404, detail="Template not found")

@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    """Delete a template"""
    global template_store
    initial_length = len(template_store)
    template_store = [t for t in template_store if t["id"] != template_id]
    if len(template_store) < initial_length:
        save_templates()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Template not found")

@app.post("/api/timeline/{video_id}")
async def save_timeline(video_id: int, timeline_data: TimelineData):
    """Save a timeline for a video with UI feedback for empty requests"""
    video_found = False
    for video in videos:
        if video["id"] == video_id:
            video_found = True
            break
            
    if not video_found:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not timeline_data.segments or all(not s.text for s in timeline_data.segments):
        raise HTTPException(status_code=400, detail="Timeline segments cannot be empty or all textless")
    
    timelines[video_id] = timeline_data.dict()
    with open(f"projects/timeline_{video_id}.json", "w") as f:
        json.dump(timeline_data.dict(), f)
    
    return {"status": "success", "message": "Timeline saved", "slideImages": timeline_data.slideImages, "customVideos": timeline_data.customVideos}

@app.get("/api/timeline/{video_id}")
async def get_timeline(video_id: int):
    """Get the timeline for a video with UI feedback for empty requests"""
    if video_id in timelines:
        if not timelines[video_id]["segments"] or all(not s["text"] for s in timelines[video_id]["segments"]):
            raise HTTPException(status_code=404, detail="Timeline is empty or has no text")
        return timelines[video_id]
    
    try:
        with open(f"projects/timeline_{video_id}.json", "r") as f:
            timeline = json.load(f)
            if not timeline["segments"] or all(not s["text"] for s in timeline["segments"]):
                raise HTTPException(status_code=404, detail="Timeline is empty or has no text")
            timelines[video_id] = timeline
            return timeline
    except:
        segments = [
            {
                "id": f"default_{i}_{int(time.time())}",
                "type": segment_type,
                "text": "",
                "duration": 3,  # Default to 3 seconds (2-4s range)
                "mediaType": "image",
                "background": "#1e293b",
                "visualPrompt": "",
                "videoUrl": None,
                "captions": False
            }
            for i, segment_type in enumerate(["Hook", "Intro", "Point", "Conclusion"])
        ]
        timeline = {"segments": segments, "slideImages": {}, "customVideos": {}}
        timelines[video_id] = timeline
        if not timeline["segments"] or all(not s["text"] for s in timeline["segments"]):
            raise HTTPException(status_code=404, detail="Default timeline is empty or has no text")
        return timeline

@app.post("/api/generate-script/{video_id}")
async def generate_script(video_id: int, request: ScriptRequest):
    """Generate script content for timeline segments using OpenAI or trends with UI feedback"""
    video_found = False
    for video in videos:
        if video["id"] == video_id:
            video_found = True
            video_title = video["title"]
            break
            
    if not video_found:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Check for empty or invalid requests
    if not request.title or not request.topic or not request.goal or not request.target_audience:
        raise HTTPException(status_code=400, detail="Request fields (title, topic, goal, target_audience) cannot be empty")
    
    try:
        template = None
        if request.selected_template:
            for t in template_store:
                if t["id"] == request.selected_template:
                    template = t
                    break
        
        if not template:
            segment_structure = request.segmentTypes
            slide_duration = request.slide_duration or 3
            max_words = request.max_words_per_segment or 8
        else:
            segment_structure = [s["type"] for s in template["structure"]]
            slide_duration = template["slide_duration"]
            max_words = template["max_words_per_segment"]
        
        # Enforce 2-4 seconds per slide and word limit
        slide_duration = max(2, min(4, slide_duration))
        max_words = max(0, max_words)  # Allow 0 for silent videos

        # Calculate number of segments based on target duration (if provided)
        num_segments = len(segment_structure)
        if request.target_duration:
            num_segments = max(1, request.target_duration // slide_duration)  # Minimum 1 segment
            if num_segments < len(segment_structure):
                segment_structure = segment_structure[:num_segments]
            elif num_segments > len(segment_structure):
                segment_structure.extend([segment_structure[-1]] * (num_segments - len(segment_structure)))

        prompt = f"""
        Create a script for a short-form video about {request.title}.
        
        Topic: {request.topic}
        Goal: {request.goal}
        Target Audience: {request.target_audience}
        Tone: {request.tone}
        """
        
        if request.use_trends:
            prompt += """
            Use current AI trends from YouTube and TikTok (e.g., AI tools, ethics, education) to generate relevant, engaging content.
            """
        else:
            prompt += f"""
            The script should be divided into {num_segments} segments, each lasting approximately {slide_duration} seconds.
            Each segment should have:
            1. Script text ({max_words} words maximum, conversational, and engaging, or no text if max_words is 0)
            2. Visual description (what should appear on screen, detailed but brief, for images or videos)
            
            Format your response as a JSON array with each segment having:
            - type: The segment type (e.g., Hook, Intro, Point, Conclusion)
            - text: The script to be read (1 sentence, max {max_words} words, or empty if max_words is 0)
            - visualPrompt: Description of what should be shown visually (brief, actionable)
            
            Keep the pacing fast to maintain viewer retention for a short-form video.
            """
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4",
                    "messages": [
                        {"role": "system", "content": f"You are an expert scriptwriter for short-form videos, focusing on {slide_duration}-second segments with one sentence per slide (max {max_words} words, or no text if 0), using AI trends if specified."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                }
            )
            
            if response.status_code != 200:
                print("OpenAI Error:", response.text)
                raise HTTPException(status_code=500, detail=f"OpenAI API error: {response.text}")
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                json_content = json_match.group(0)
            else:
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_content = json_match.group(0)
                else:
                    raise HTTPException(status_code=500, detail="Failed to parse JSON from OpenAI response")
            
            try:
                segments = json.loads(json_content)
                if isinstance(segments, dict) and "segments" in segments:
                    segments = segments["segments"]
                
                if len(segments) < len(segment_structure):
                    while len(segments) < len(segment_structure):
                        segments.append({
                            "type": segment_structure[len(segments)],
                            "text": "",
                            "visualPrompt": "Generic visual related to the topic"
                        })
                segments = segments[:len(segment_structure)]
                
                # Validate text length and duration
                for segment in segments:
                    words = segment["text"].split()
                    if len(words) > max_words and max_words > 0:
                        segment["text"] = " ".join(words[:max_words]) + "..."  # Truncate to max_words
                    segment["duration"] = slide_duration
                    segment["captions"] = template["captions"] if template else False
                
                timelines[video_id] = {"segments": segments, "slideImages": {}, "customVideos": {}}
                with open(f"projects/timeline_{video_id}.json", "w") as f:
                    json.dump({"segments": segments, "slideImages": {}, "customVideos": {}}, f)
                
                return {"segments": segments}
                
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Failed to decode JSON from OpenAI response")
        
    except Exception as e:
        print(f"Error generating script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating script: {str(e)}")

@app.post("/api/generate-image")
async def generate_image(request: GenerateImageRequest):
    """Generate an image for a segment using FAL with preview and regeneration support"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://fal.run/fal-ai/stable-diffusion",
                headers={
                    "Authorization": f"Key {FAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": f"{request.prompt}, {request.style} style, high quality, detailed",
                    "negative_prompt": "blurry, low quality, distorted, deformed",
                    "width": 512 if request.aspect_ratio == "9:16" else 720,
                    "height": 912 if request.aspect_ratio == "9:16" else 1280,
                    "num_inference_steps": 30
                }
            )
            
            if response.status_code != 200:
                print("FAL Error:", response.text)
                raise HTTPException(status_code=500, detail=f"FAL API error: {response.text}")
            
            result = response.json()
            image_data = result.get("images", [{}])[0].get("base64")
            if not image_data:
                raise HTTPException(status_code=500, detail="No image data received from FAL")
            
            image_id = f"img_{request.segment_id}_{int(time.time())}"
            image_path = f"assets/images/{image_id}.jpg"
            image_bytes = base64.b64decode(image_data)
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            
            if request.segment_id not in generated_images:
                generated_images[request.segment_id] = []
            
            generated_images[request.segment_id].append({
                "id": image_id,
                "path": image_path,
                "url": f"/images/{image_id}.jpg"
            })
            
            return {
                "image_id": image_id,
                "url": f"/images/{image_id}.jpg"
            }
        
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")

@app.post("/api/regenerate-image")
async def regenerate_image(request: GenerateImageRequest):
    """Regenerate an existing image with a new prompt using FAL"""
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        # Remove old image if it exists
        image_id = f"img_{request.segment_id}_{int(time.time())}"
        image_path = f"assets/images/{image_id}.jpg"
        if os.path.exists(image_path):
            os.remove(image_path)
        
        # Generate new image
        return await generate_image(request)
        
    except Exception as e:
        print(f"Error regenerating image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error regenerating image: {str(e)}")

@app.get("/api/images/{segment_id}")
async def get_segment_images(segment_id: str):
    """Get all generated images for a segment"""
    if segment_id in generated_images:
        return {"images": generated_images[segment_id]}
    return {"images": []}

@app.post("/api/upload-video")
async def upload_video(file: UploadFile = File(...), segment_id: str = Form(...)):
    """Upload a custom video for a segment"""
    try:
        video_path = f"assets/videos/{file.filename}"
        with open(video_path, "wb") as f:
            f.write(await file.read())
        
        if segment_id not in generated_images:
            generated_images[segment_id] = []
        
        generated_images[segment_id].append({
            "id": f"video_{segment_id}_{int(time.time())}",
            "path": video_path,
            "url": f"/videos/{file.filename}"
        })
        
        # Update timeline to include custom video
        for video_id, timeline in timelines.items():
            for segment in timeline["segments"]:
                if segment["id"] == segment_id:
                    segment["videoUrl"] = f"/videos/{file.filename}"
                    segment["mediaType"] = "video"
                    with open(f"projects/timeline_{video_id}.json", "w") as f:
                        json.dump(timeline, f)
                    return {"status": "success", "videoUrl": f"/videos/{file.filename}"}
        
        return {"status": "success", "videoUrl": f"/videos/{file.filename}"}
    except Exception as e:
        print(f"Error uploading video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading video: {str(e)}")

@app.post("/api/transcribe-audio")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe uploaded audio using Whisper"""
    try:
        import whisper
        model = whisper.load_model("base")
        audio_path = f"assets/audio/{file.filename}"
        with open(audio_path, "wb") as f:
            f.write(await file.read())
        result = model.transcribe(audio_path)
        os.remove(audio_path)
        return {"text": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.get("/api/audio/preview/{track}")
async def preview_music(track: str):
    """Stream a preview of a music track (first 10 seconds)"""
    music_path = f"assets/audio/{track}.mp3"
    if not os.path.exists(music_path):
        raise HTTPException(status_code=404, detail="Music track not found")
    
    def iterfile():
        with open(music_path, "rb") as f:
            # Read only the first 10 seconds (assuming 44.1kHz, ~441,000 bytes per second)
            chunk_size = 441000 * 10  # 10 seconds at 44.1kHz
            data = f.read(chunk_size)
            while data:
                yield data
                data = f.read(chunk_size)
    
    return StreamingResponse(iterfile(), media_type="audio/mpeg")

@app.get("/api/voice/preview")
async def preview_voice():
    """Stream a preview of a male voice (sample line)"""
    sample_text = "Hello, this is a sample male voice for your video."
    tts = gTTS(text=sample_text, lang='en', tld='us', gender='male')  # gTTS supports gender='male'
    audio_file = io.BytesIO()
    tts.write_to_fp(audio_file)
    audio_file.seek(0)
    
    def iterfile():
        yield audio_file.read()
    
    return StreamingResponse(iterfile(), media_type="audio/mpeg")

async def render_video_task(video_id: int, voice_id: int, format: str, resolution: str, editing_style: str, music_track: Optional[str], music_volume: float, captions: bool, aspect_ratio: str):
    """Background task to render a video"""
    video_found = False
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            video_found = True
            videos[i]["status"] = "rendering"
            videos[i]["progress"] = 0
            break
            
    if not video_found:
        print(f"Video {video_id} not found")
        return
    
    if video_id not in timelines or not timelines[video_id]["segments"] or all(not s["text"] for s in timelines[video_id]["segments"]):
        raise HTTPException(status_code=400, detail="Timeline is empty or has no text for rendering")
    
    timeline = timelines[video_id]
    segments = timeline["segments"]
    clips = []
    audio_clips = []
    
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["progress"] = 10
            break
    
    # Determine dimensions based on aspect ratio
    if aspect_ratio == "9:16":
        clip_width, clip_height = 720, 1280 if resolution == "1080p" else 576, 1024  # 720p or 1080p portrait
    else:  # 16:9
        clip_width, clip_height = 1280, 720 if resolution == "1080p" else 1024, 576  # 720p or 1080p landscape
    
    total_duration = 0
    
    for idx, segment in enumerate(segments):
        progress = 10 + int(70 * (idx / len(segments)))
        for i, video in enumerate(videos):
            if video["id"] == video_id:
                videos[i]["progress"] = progress
                break
                
        duration = max(2, min(4, segment.get("duration", 3)))  # Enforce 2-4 seconds
        
        # Use custom video, image, or color based on mediaType
        if segment.get("mediaType") == "video" and segment.get("videoUrl"):
            video_path = f"assets/videos/{os.path.basename(segment['videoUrl'])}"
            if os.path.exists(video_path):
                clip = mp.VideoFileClip(video_path).subclip(0, duration)
                clip = clip.resize(height=clip_height)
                if clip.w > clip_width:
                    clip = clip.crop(x_center=clip.w/2, y_center=clip.h/2, width=clip_width, height=clip_height)
            else:
                clip = mp.ColorClip(size=(clip_width, clip_height), 
                                   color=hex_to_rgb(segment.get("background", "#1e293b")), 
                                   duration=duration)
        elif segment.get("mediaType") == "image" and segment.get("imageUrl"):
            image_path = f"assets/images/{os.path.basename(segment['imageUrl'])}"
            if os.path.exists(image_path):
                clip = mp.ImageClip(image_path, duration=duration)
                clip = clip.resize(height=clip_height)
                if clip.w > clip_width:
                    clip = clip.crop(x_center=clip.w/2, y_center=clip.h/2, width=clip_width, height=clip_height)
            else:
                clip = mp.ColorClip(size=(clip_width, clip_height), 
                                   color=hex_to_rgb(segment.get("background", "#1e293b")), 
                                   duration=duration)
        else:
            clip = mp.ColorClip(size=(clip_width, clip_height),
                               color=hex_to_rgb(segment.get("background", "#1e293b")),
                               duration=duration)
        
        if segment["text"] and segment["text"].strip():
            # Use male voice for TTS
            tts = gTTS(text=segment["text"], lang='en', tld='us', gender='male', slow=False)
            audio_file = f"assets/audio/segment_{video_id}_{idx}.mp3"
            tts.save(audio_file)
            audio_duration = mp.AudioFileClip(audio_file).duration
            audio_clip = mp.AudioFileClip(audio_file).subclip(0, duration)  # Trim to match duration
            audio_clips.append(audio_clip)
        
            # Add captions if enabled
            if captions:
                txt_clip = mp.TextClip(
                    segment["text"], 
                    fontsize=int(clip_width/20),
                    color='white',
                    font='Arial',
                    size=(clip_width * 0.8, None),  # 80% width for padding
                    method='caption',
                    align='center'
                )
                txt_clip = txt_clip.set_position(('center', clip_height - 50))  # 50px padding from bottom
                txt_clip = txt_clip.set_duration(duration)
                clip = mp.CompositeVideoClip([clip, txt_clip])
        
        if editing_style == "zoom":
            start_scale = 1.0
            end_scale = 1.2
            clip = clip.fx(
                mp.vfx.resize, 
                lambda t: max(start_scale, min(start_scale + t/duration*(end_scale-start_scale), end_scale))
            )
        elif editing_style == "fade":
            clip = clip.fx(mp.vfx.fadein, 0.5).fx(mp.vfx.fadeout, 0.5)
        
        clips.append(clip)
        total_duration += duration
        await asyncio.sleep(0.1)  # Reduced sleep for faster rendering
    
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["progress"] = 80
            break
    
    final_clip = mp.concatenate_videoclips(clips)
    
    if audio_clips:
        final_audio = mp.concatenate_audioclips(audio_clips)
        if music_track:
            music_path = f"assets/audio/{music_track}.mp3"
            if os.path.exists(music_path):
                music = mp.AudioFileClip(music_path)
                if music.duration < final_audio.duration:
                    repeats = int(final_audio.duration / music.duration) + 1
                    music = mp.concatenate_audioclips([music] * repeats)
                music = music.subclip(0, final_audio.duration)
                final_audio = mp.CompositeAudioClip([
                    final_audio,
                    music.volumex(music_volume)
                ])
        final_clip = final_clip.set_audio(final_audio)
    
    output_file = f"rendered/video_{video_id}.{format}"
    final_clip.write_videofile(output_file, fps=30, codec='libx264', audio_codec='aac')
    
    minutes = int(total_duration // 60)
    seconds = int(total_duration % 60)
    duration_str = f"{minutes}:{seconds:02d}"
    
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["status"] = "ready"
            videos[i]["progress"] = 100
            videos[i]["duration"] = duration_str
            break
    
    for idx in range(len(segments)):
        audio_file = f"assets/audio/segment_{video_id}_{idx}.mp3"
        if os.path.exists(audio_file):
            os.remove(audio_file)

async def process_render_queue():
    """Process videos in the render queue sequentially"""
    global render_queue, videos
    while render_queue:
        queue_item = render_queue.pop(0)  # Dequeue first item
        video_id = queue_item.video_id
        request = queue_item.render_request
        try:
            await render_video_task(video_id, request.voiceId, request.format, request.resolution, request.editing_style, request.music_track, request.music_volume, request.captions, request.aspect_ratio)
        except Exception as e:
            print(f"Error rendering video {video_id} from queue: {str(e)}")
            for i, video in enumerate(videos):
                if video["id"] == video_id:
                    videos[i]["status"] = "error"
                    videos[i]["progress"] = 0
                    break

@app.post("/api/render/{video_id}")
async def render_video(video_id: int, request: RenderRequest, background_tasks: BackgroundTasks):
    """Start rendering a video with queue management and UI feedback for empty requests"""
    video_found = False
    for video in videos:
        if video["id"] == video_id:
            video_found = True
            break
            
    if not video_found:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if video_id not in timelines or not timelines[video_id]["segments"] or all(not s["text"] for s in timelines[video_id]["segments"]):
        raise HTTPException(status_code=400, detail="Timeline is empty or has no text for rendering")
    
    # Add to render queue
    queue_item = QueueItem(video_id=video_id, render_request=request)
    render_queue.append(queue_item)
    
    # Process queue in background
    background_tasks.add_task(process_render_queue)
    return {"message": f"Video {video_id} added to render queue (position: {len(render_queue)})"}

@app.get("/api/render/{video_id}/progress")
async def get_progress(video_id: int):
    """Get the rendering progress for a video or queue status"""
    for video in videos:
        if video["id"] == video_id:
            return {
                "status": video["status"],
                "progress": video["progress"],
                "queue_position": next((i + 1 for i, item in enumerate(render_queue) if item.video_id == video_id), None)
            }
    raise HTTPException(status_code=404, detail="Video not found")

@app.get("/api/render/queue")
async def get_render_queue():
    """Get the current render queue"""
    return {"queue": [{"video_id": item.video_id, "position": i + 1} for i, item in enumerate(render_queue)]}

@app.post("/api/clear-queue")
async def clear_render_queue():
    """Clear the render queue"""
    global render_queue
    render_queue = []
    return {"message": "Render queue cleared"}

# Helper function to convert hex color to RGB tuple
def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Create a placeholder video for testing
def create_placeholder_video():
    if not os.path.exists("assets/videos/placeholder.mp4"):
        clip = mp.ColorClip(size=(720, 1280), color=(255, 255, 255), duration=5)  # White background for light theme
        txt_clip = mp.TextClip(
            "Sample Video", 
            fontsize=70, 
            color='black',
            size=clip.size,
            method='caption'
        )
        txt_clip = txt_clip.set_position('center').set_duration(5)
        final_clip = mp.CompositeVideoClip([clip, txt_clip])
        final_clip.write_videofile("assets/videos/placeholder.mp4", fps=30)

# Create sample music tracks
def create_sample_music():
    if not os.path.exists("assets/audio/energetic.mp3"):
        # Generate a 30-second energetic tone as a placeholder
        silence = mp.AudioClip(lambda t: 0.5 * (1 + 0.5 * mp.cos(2 * 3.14159 * 440 * t)), duration=30, fps=44100)
        silence.write_audiofile("assets/audio/energetic.mp3", fps=44100)
    if not os.path.exists("assets/audio/chill.mp3"):
        # Generate a 30-second chill tone as a placeholder
        silence = mp.AudioClip(lambda t: 0.3 * (1 + 0.3 * mp.cos(2 * 3.14159 * 220 * t)), duration=30, fps=44100)
        silence.write_audiofile("assets/audio/chill.mp3", fps=44100)
    if not os.path.exists("assets/audio/corporate.mp3"):
        silence = mp.AudioClip(lambda t: 0.4 * (1 + 0.4 * mp.cos(2 * 3.14159 * 330 * t)), duration=30, fps=44100)
        silence.write_audiofile("assets/audio/corporate.mp3", fps=44100)
    if not os.path.exists("assets/audio/cinematic.mp3"):
        silence = mp.AudioClip(lambda t: 0.6 * (1 + 0.6 * mp.cos(2 * 3.14159 * 110 * t)), duration=30, fps=44100)
        silence.write_audiofile("assets/audio/cinematic.mp3", fps=44100)

# Create sample script templates
def create_script_templates():
    with open("templates/templates.json", "w") as f:
        json.dump(templates, f)

# Create placeholders on startup
@app.on_event("startup")
async def startup_event():
    try:
        load_templates()
        create_placeholder_video()
        create_sample_music()
        create_script_templates()
    except Exception as e:
        print(f"Could not create placeholders: {e}")