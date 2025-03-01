from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
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

# API Keys (in a real app, store these more securely in env variables)
OPENAI_API_KEY = "your_openai_api_key_here"
FAL_API_KEY = "your_fal_api_key_here"

# Models
class TimelineSegment(BaseModel):
    id: str
    type: str
    text: str
    duration: int
    mediaType: str = "color"
    background: str = "#1e293b"
    visualPrompt: str = ""
    imageUrl: Optional[str] = None

class TimelineData(BaseModel):
    segments: List[TimelineSegment]
    
class ScriptRequest(BaseModel):
    title: str
    topic: str
    goal: str
    target_audience: str
    tone: str = "informative"
    selected_template: Optional[str] = None
    segmentTypes: List[str]
    
class ScriptTemplate(BaseModel):
    id: str
    name: str
    description: str
    structure: List[Dict[str, str]]
    
class RenderRequest(BaseModel):
    voiceId: int
    format: str = "mp4"
    resolution: str = "720p"
    editing_style: str = "standard"
    music_track: Optional[str] = None
    music_volume: float = 0.3

class GenerateImageRequest(BaseModel):
    prompt: str
    segment_id: str
    style: str = "realistic"
    aspect_ratio: str = "9:16"

# In-memory storage until we implement a database
videos = [
    {
        "id": 1,
        "title": "AI Image Generation Tools",
        "status": "ready",
        "progress": 100,
        "duration": "1:24",
        "created": "2 hours ago"
    },
    {
        "id": 2,
        "title": "GPT-5 Capabilities Overview",
        "status": "draft",
        "progress": 0,
        "duration": "",
        "created": "1 day ago"
    },
    {
        "id": 3,
        "title": "AI in Healthcare Applications",
        "status": "draft",
        "progress": 0,
        "duration": "",
        "created": "3 days ago"
    }
]

# Script templates
script_templates = [
    {
        "id": "problem-solution",
        "name": "Problem-Solution",
        "description": "Introduces a problem and presents your product/service as the solution",
        "structure": [
            {"type": "intro", "purpose": "Introduce the problem that many face"},
            {"type": "point", "purpose": "Explain why the problem persists"},
            {"type": "point", "purpose": "Introduce your solution"},
            {"type": "point", "purpose": "Show benefits and results"},
            {"type": "conclusion", "purpose": "Call to action"}
        ]
    },
    {
        "id": "how-to",
        "name": "How-To Tutorial",
        "description": "Step-by-step instructions to accomplish a specific task",
        "structure": [
            {"type": "intro", "purpose": "Introduce what viewers will learn"},
            {"type": "point", "purpose": "Step 1 with details"},
            {"type": "point", "purpose": "Step 2 with details"},
            {"type": "point", "purpose": "Step 3 with details"},
            {"type": "conclusion", "purpose": "Recap and benefits"}
        ]
    },
    {
        "id": "listicle",
        "name": "Listicle (Top 5)",
        "description": "Presents a list of tips, ideas, or products",
        "structure": [
            {"type": "intro", "purpose": "Introduce the topic and why it matters"},
            {"type": "point", "purpose": "Item #1 with explanation"},
            {"type": "point", "purpose": "Item #2 with explanation"},
            {"type": "point", "purpose": "Item #3 with explanation"},
            {"type": "point", "purpose": "Item #4 with explanation"},
            {"type": "point", "purpose": "Item #5 with explanation"},
            {"type": "conclusion", "purpose": "Summarize and call to action"}
        ]
    }
]

# Store timelines
timelines = {}

# Store generated images
generated_images = {}

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
            # In a real app, we'd have a database mapping video_id to file
            file_path = f"rendered/video_{video_id}.mp4"
            
            # For demo purposes, send a sample video if exists
            if os.path.exists(file_path):
                return FileResponse(file_path)
            else:
                # For testing, we'll use a placeholder video if we have it
                placeholder_path = "assets/videos/placeholder.mp4"
                if os.path.exists(placeholder_path):
                    return FileResponse(placeholder_path, media_type="video/mp4")
                
                # If no placeholder, return an error
                raise HTTPException(status_code=404, detail="Video file not found")
                
    raise HTTPException(status_code=404, detail="Video not found or not ready")

@app.get("/api/script-templates")
async def get_script_templates():
    """Get all script templates"""
    return script_templates

@app.post("/api/timeline/{video_id}")
async def save_timeline(video_id: int, timeline_data: TimelineData):
    """Save a timeline for a video"""
    video_found = False
    for video in videos:
        if video["id"] == video_id:
            video_found = True
            break
            
    if not video_found:
        raise HTTPException(status_code=404, detail="Video not found")
        
    # Save timeline to dictionary (in a real app, would save to database)
    timelines[video_id] = timeline_data.dict()
    
    # Also save to disk as JSON for persistence
    with open(f"projects/timeline_{video_id}.json", "w") as f:
        json.dump(timeline_data.dict(), f)
    
    return {"status": "success", "message": "Timeline saved"}

@app.get("/api/timeline/{video_id}")
async def get_timeline(video_id: int):
    """Get the timeline for a video"""
    # First check if we have it in memory
    if video_id in timelines:
        return timelines[video_id]
    
    # If not, try to load from disk
    try:
        with open(f"projects/timeline_{video_id}.json", "r") as f:
            timeline = json.load(f)
            timelines[video_id] = timeline
            return timeline
    except:
        # Generate default segments for this video
        segments = [
            {
                "id": f"default_{i}_{int(time.time())}",
                "type": segment_type,
                "text": "",
                "duration": 5,
                "mediaType": "color",
                "background": "#1e293b",
                "visualPrompt": ""
            }
            for i, segment_type in enumerate(["intro", "point", "point", "conclusion"])
        ]
        
        timeline = {"segments": segments}
        timelines[video_id] = timeline
        return timeline

@app.post("/api/generate-script/{video_id}")
async def generate_script(video_id: int, request: ScriptRequest):
    """Generate script content for timeline segments using OpenAI"""
    # Find the video
    video_found = False
    for video in videos:
        if video["id"] == video_id:
            video_found = True
            video_title = video["title"]
            break
            
    if not video_found:
        raise HTTPException(status_code=404, detail="Video not found")
    
    try:
        # Get the selected template if provided
        template = None
        if request.selected_template:
            for t in script_templates:
                if t["id"] == request.selected_template:
                    template = t
                    break
        
        # If no template is specified or found, use a default structure
        if not template:
            segment_structure = request.segmentTypes
        else:
            # Use the template's structure
            segment_structure = [s["type"] for s in template["structure"]]
        
        # Prepare our prompt for OpenAI
        prompt = f"""
        Create a script for a short-form video about {request.title}.
        
        Topic: {request.topic}
        Goal: {request.goal}
        Target Audience: {request.target_audience}
        Tone: {request.tone}
        
        The script should be divided into the following segments:
        """
        
        # Add segment details based on template
        if template:
            for i, segment in enumerate(template["structure"]):
                prompt += f"\n{i+1}. {segment['type'].upper()}: {segment['purpose']}"
        else:
            for i, segment_type in enumerate(request.segmentTypes):
                prompt += f"\n{i+1}. {segment_type.upper()}"
        
        prompt += """
        
        For each segment, provide:
        1. Script text (concise, conversational, and engaging)
        2. Visual description (what should appear on screen)
        
        Format your response as a JSON array with each segment having:
        - text: The script to be read
        - visualPrompt: Description of what should be shown visually
        
        Keep each segment's script under 30 words for short-form video pacing.
        """
        
        # Make API call to OpenAI
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
                        {"role": "system", "content": "You are an expert scriptwriter for short-form videos."},
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
            
            # Extract the JSON part from the response
            # This handles if the AI wraps the JSON in markdown or explanatory text
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                json_content = json_match.group(0)
            else:
                # If no array is found, try to find JSON object
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_content = json_match.group(0)
                else:
                    raise HTTPException(status_code=500, detail="Failed to parse JSON from OpenAI response")
            
            try:
                segments = json.loads(json_content)
                
                # If segments is a dict with a segments key, extract that
                if isinstance(segments, dict) and "segments" in segments:
                    segments = segments["segments"]
                
                # Ensure we have enough segments
                if len(segments) < len(segment_structure):
                    # Fill in any missing segments
                    while len(segments) < len(segment_structure):
                        segments.append({
                            "text": f"Additional content for {segment_structure[len(segments)]}",
                            "visualPrompt": "Generic visual related to the topic"
                        })
                        
                # Truncate if we have too many
                segments = segments[:len(segment_structure)]
                
                return {"segments": segments}
                
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Failed to decode JSON from OpenAI response")
        
    except Exception as e:
        print(f"Error generating script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating script: {str(e)}")

@app.post("/api/generate-image")
async def generate_image(request: GenerateImageRequest):
    """Generate an image for a segment using FAL"""
    try:
        # Prepare the request to FAL API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://fal.run/fal-ai/stable-diffusion",  # Replace with your specific FAL endpoint
                headers={
                    "Authorization": f"Key {FAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": f"{request.prompt}, {request.style} style, high quality, detailed",
                    "negative_prompt": "blurry, low quality, distorted, deformed",
                    "width": 512,
                    "height": 912,  # 16:9 aspect ratio for portrait mode
                    "num_inference_steps": 30
                }
            )
            
            if response.status_code != 200:
                print("FAL Error:", response.text)
                raise HTTPException(status_code=500, detail=f"FAL API error: {response.text}")
            
            result = response.json()
            
            # Extract the image data
            image_data = result.get("images", [{}])[0].get("base64")
            if not image_data:
                raise HTTPException(status_code=500, detail="No image data received from FAL")
            
            # Save the image to disk
            image_id = f"img_{request.segment_id}_{int(time.time())}"
            image_path = f"assets/images/{image_id}.jpg"
            
            # Decode base64 and save
            image_bytes = base64.b64decode(image_data)
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            
            # Store the mapping
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

@app.get("/api/images/{segment_id}")
async def get_segment_images(segment_id: str):
    """Get all generated images for a segment"""
    if segment_id in generated_images:
        return {"images": generated_images[segment_id]}
    return {"images": []}

async def render_video_task(video_id: int, voice_id: int, format: str, resolution: str, editing_style: str, music_track: Optional[str], music_volume: float):
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
    
    # Load timeline
    if video_id not in timelines:
        # Try to load from disk
        try:
            with open(f"projects/timeline_{video_id}.json", "r") as f:
                timeline = json.load(f)
                timelines[video_id] = timeline
        except:
            print(f"Timeline for video {video_id} not found")
            # Mark rendering as failed
            for i, video in enumerate(videos):
                if video["id"] == video_id:
                    videos[i]["status"] = "draft"
                    break
            return
    
    timeline = timelines[video_id]
    segments = timeline["segments"]
    
    # Create clips for each segment
    clips = []
    audio_clips = []
    
    # Update progress
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["progress"] = 10
            break
    
    # Parse resolution
    if resolution == "720p":
        clip_width, clip_height = 720, 1280  # Portrait mode for social
    elif resolution == "1080p":
        clip_width, clip_height = 1080, 1920
    else:
        clip_width, clip_height = 720, 720  # Square format
    
    # Create a total duration counter for the video
    total_duration = 0
    
    for idx, segment in enumerate(segments):
        # Update progress incrementally
        progress = 10 + int(70 * (idx / len(segments)))
        for i, video in enumerate(videos):
            if video["id"] == video_id:
                videos[i]["progress"] = progress
                break
                
        # Generate TTS audio for the segment
        if segment["text"]:
            # Convert text to speech
            tts = gTTS(text=segment["text"], lang='en', slow=False)
            audio_file = f"assets/audio/segment_{video_id}_{idx}.mp3"
            tts.save(audio_file)
            audio_duration = mp.AudioFileClip(audio_file).duration
            
            # Make sure segment duration is at least as long as audio
            duration = max(segment.get("duration", 5), audio_duration)
            
            # Create audio clip
            audio_clip = mp.AudioFileClip(audio_file)
            audio_clips.append(audio_clip)
        else:
            # No speech, just use the segment duration
            duration = segment.get("duration", 5)
        
        # Create video clip based on mediaType
        if segment.get("mediaType") == "image" and segment.get("imageUrl"):
            # Use generated image if available
            image_path = f"assets/images/{os.path.basename(segment['imageUrl'])}"
            if os.path.exists(image_path):
                clip = mp.ImageClip(image_path, duration=duration)
                clip = clip.resize(height=clip_height)
                
                # Center crop if needed
                if clip.w > clip_width:
                    clip = clip.crop(x_center=clip.w/2, y_center=clip.h/2, 
                                    width=clip_width, height=clip_height)
            else:
                # Fallback to colored clip
                clip = mp.ColorClip(size=(clip_width, clip_height), 
                                   color=hex_to_rgb(segment.get("background", "#1e293b")), 
                                   duration=duration)
        else:
            # Create a colored clip
            clip = mp.ColorClip(size=(clip_width, clip_height),
                               color=hex_to_rgb(segment.get("background", "#1e293b")),
                               duration=duration)
        
        # Add text overlay
        if segment["text"]:
            txt_clip = mp.TextClip(
                segment["text"], 
                fontsize=int(clip_width/20),  # Responsive font size
                color='white',
                font='Arial',
                size=(clip_width * 0.9, None),
                method='caption',
                align='center'
            )
            txt_clip = txt_clip.set_position('center').set_duration(duration)
            clip = mp.CompositeVideoClip([clip, txt_clip])
            
        # Apply editing style effects
        if editing_style == "zoom":
            # Create a zoom effect
            start_scale = 1.0
            end_scale = 1.2
            clip = clip.fx(
                mp.vfx.resize, 
                lambda t: max(start_scale, min(start_scale + t/duration*(end_scale-start_scale), end_scale))
            )
        elif editing_style == "fade":
            # Add fade in/out
            clip = clip.fx(mp.vfx.fadein, 0.5).fx(mp.vfx.fadeout, 0.5)
        
        clips.append(clip)
        total_duration += duration
        
        # Simulate rendering time (remove in production)
        await asyncio.sleep(0.5)
    
    # Update progress
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["progress"] = 80
            break
    
    # Concatenate all clips
    final_clip = mp.concatenate_videoclips(clips)
    
    # Add audio
    if audio_clips:
        final_audio = mp.concatenate_audioclips(audio_clips)
        
        # Add background music if specified
        if music_track:
            music_path = f"assets/audio/{music_track}.mp3"
            if os.path.exists(music_path):
                music = mp.AudioFileClip(music_path)
                
                # Loop music if needed
                if music.duration < final_audio.duration:
                    repeats = int(final_audio.duration / music.duration) + 1
                    music = mp.concatenate_audioclips([music] * repeats)
                
                # Trim to match final audio length
                music = music.subclip(0, final_audio.duration)
                
                # Mix with adjusted volume
                final_audio = mp.CompositeAudioClip([
                    final_audio,
                    music.volumex(music_volume)
                ])
        
        final_clip = final_clip.set_audio(final_audio)
    
    # Save the result
    output_file = f"rendered/video_{video_id}.{format}"
    final_clip.write_videofile(output_file, fps=30, codec='libx264', audio_codec='aac')
    
    # Update video metadata
    minutes = int(total_duration // 60)
    seconds = int(total_duration % 60)
    duration_str = f"{minutes}:{seconds:02d}"
    
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["status"] = "ready"
            videos[i]["progress"] = 100
            videos[i]["duration"] = duration_str
            break
    
    # Clean up temporary audio files
    for idx in range(len(segments)):
        audio_file = f"assets/audio/segment_{video_id}_{idx}.mp3"
        if os.path.exists(audio_file):
            os.remove(audio_file)

@app.post("/api/render/{video_id}")
async def render_video(video_id: int, request: RenderRequest, background_tasks: BackgroundTasks):
    """Start rendering a video"""
    # Find the video
    video_found = False
    for video in videos:
        if video["id"] == video_id:
            video_found = True
            break
            
    if not video_found:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Add rendering task to background tasks
    background_tasks.add_task(
        render_video_task, 
        video_id, 
        request.voiceId, 
        request.format, 
        request.resolution,
        request.editing_style,
        request.music_track,
        request.music_volume
    )
    
    return {"message": f"Started rendering video {video_id}"}

@app.get("/api/render/{video_id}/progress")
async def get_progress(video_id: int):
    """Get the rendering progress for a video"""
    for video in videos:
        if video["id"] == video_id:
            return {
                "status": video["status"],
                "progress": video["progress"]
            }
    
    raise HTTPException(status_code=404, detail="Video not found")

# Helper function to convert hex color to RGB tuple
def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

# Create a placeholder video for testing
def create_placeholder_video():
    if not os.path.exists("assets/videos/placeholder.mp4"):
        clip = mp.ColorClip(size=(720, 1280), color=(30, 30, 30), duration=5)
        txt_clip = mp.TextClip(
            "Sample Video", 
            fontsize=70, 
            color='white',
            size=clip.size,
            method='caption'
        )
        txt_clip = txt_clip.set_position('center').set_duration(5)
        final_clip = mp.CompositeVideoClip([clip, txt_clip])
        final_clip.write_videofile("assets/videos/placeholder.mp4", fps=30)

# Create sample music tracks
def create_sample_music():
    if not os.path.exists("assets/audio/energetic.mp3"):
        # Create a silent placeholder
        try:
            with open("assets/audio/energetic.mp3", "wb") as f:
                f.write(b'')
        except:
            pass
            
    if not os.path.exists("assets/audio/chill.mp3"):
        try:
            with open("assets/audio/chill.mp3", "wb") as f:
                f.write(b'')
        except:
            pass

# Create sample script templates
def create_script_templates():
    with open("templates/templates.json", "w") as f:
        json.dump(script_templates, f)

# Create placeholders on startup
@app.on_event("startup")
async def startup_event():
    try:
        create_placeholder_video()
        create_sample_music()
        create_script_templates()
    except Exception as e:
        print(f"Could not create placeholders: {e}")