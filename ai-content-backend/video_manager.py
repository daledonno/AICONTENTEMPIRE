from fastapi import BackgroundTasks, HTTPException
from typing import Optional
import os
import json
import asyncio
from moviepy.editor import VideoFileClip, ImageClip, ColorClip, concatenate_videoclips, AudioFileClip, CompositeVideoClip, TextClip
from gtts import gTTS
import random

# In-memory storage (shared with main.py)
videos = []  # Will be imported from main.py
timelines = {}
render_queue = []  # Shared queue
generated_images = {}

async def render_video_task(video_id: int, voice_id: int, format: str, resolution: str, editing_style: str, music_track: Optional[str], music_volume: float):
    """Render a single video task"""
    global videos, timelines
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
    
    if resolution == "720p":
        clip_width, clip_height = 720, 1280
    elif resolution == "1080p":
        clip_width, clip_height = 1080, 1920
    else:
        clip_width, clip_height = 720, 720
    
    total_duration = 0
    
    for idx, segment in enumerate(segments):
        progress = 10 + int(70 * (idx / len(segments)))
        for i, video in enumerate(videos):
            if video["id"] == video_id:
                videos[i]["progress"] = progress
                break
                
        if segment["text"]:
            tts = gTTS(text=segment["text"], lang='en', tld='us', gender='male', slow=False)
            audio_file = f"assets/audio/segment_{video_id}_{idx}.mp3"
            tts.save(audio_file)
            audio_duration = AudioFileClip(audio_file).duration
            duration = max(2, min(4, segment.get("duration", 3)))  # Ensure 2-4 seconds
            audio_clip = AudioFileClip(audio_file).subclip(0, duration)
            audio_clips.append(audio_clip)
        else:
            duration = max(2, min(4, segment.get("duration", 3)))  # Ensure 2-4 seconds
        
        # Use image or video if available, otherwise fall back to color
        if segment.get("mediaType") == "image" and segment.get("imageUrl"):
            image_path = f"assets/images/{os.path.basename(segment['imageUrl'])}"
            if os.path.exists(image_path):
                clip = ImageClip(image_path, duration=duration)
                clip = clip.resize(height=clip_height)
                if clip.w > clip_width:
                    clip = clip.crop(x_center=clip.w/2, y_center=clip.h/2, width=clip_width, height=clip_height)
            else:
                clip = ColorClip(size=(clip_width, clip_height), 
                                color=hex_to_rgb(segment.get("background", "#1e293b")), 
                                duration=duration)
        elif segment.get("mediaType") == "video" and segment.get("imageUrl"):
            video_path = f"assets/videos/{os.path.basename(segment['imageUrl'])}"
            if os.path.exists(video_path):
                clip = VideoFileClip(video_path).subclip(0, duration)
                clip = clip.resize(height=clip_height)
                if clip.w > clip_width:
                    clip = clip.crop(x_center=clip.w/2, y_center=clip.h/2, width=clip_width, height=clip_height)
            else:
                clip = ColorClip(size=(clip_width, clip_height), 
                                color=hex_to_rgb(segment.get("background", "#1e293b")), 
                                duration=duration)
        else:
            clip = ColorClip(size=(clip_width, clip_height),
                           color=hex_to_rgb(segment.get("background", "#1e293b")),
                           duration=duration)
        
        if segment["text"]:
            txt_clip = TextClip(
                segment["text"], 
                fontsize=int(clip_width/20),
                color='white',
                font='Arial',
                size=(clip_width * 0.9, None),
                method='caption',
                align='center'
            )
            txt_clip = txt_clip.set_position('center').set_duration(duration)
            clip = CompositeVideoClip([clip, txt_clip])
            
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
        await asyncio.sleep(0.1)
    
    for i, video in enumerate(videos):
        if video["id"] == video_id:
            videos[i]["progress"] = 80
            break
    
    final_clip = concatenate_videoclips(clips)
    
    if audio_clips:
        final_audio = concatenate_audioclips(audio_clips)
        if music_track:
            music_path = f"assets/audio/{music_track}.mp3"
            if os.path.exists(music_path):
                music = AudioFileClip(music_path)
                if music.duration < final_audio.duration:
                    repeats = int(final_audio.duration / music.duration) + 1
                    music = concatenate_audioclips([music] * repeats)
                music = music.subclip(0, final_audio.duration)
                final_audio = CompositeAudioClip([
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
            await render_video_task(video_id, request.voiceId, request.format, request.resolution, request.editing_style, request.music_track, request.music_volume)
        except Exception as e:
            print(f"Error rendering video {video_id} from queue: {str(e)}")
            for i, video in enumerate(videos):
                if video["id"] == video_id:
                    videos[i]["status"] = "error"
                    videos[i]["progress"] = 0
                    break

def create_placeholder_video():
    if not os.path.exists("assets/videos/placeholder.mp4"):
        clip = ColorClip(size=(720, 1280), color=(30, 30, 30), duration=5)
        txt_clip = TextClip(
            "Sample Video", 
            fontsize=70, 
            color='white',
            size=clip.size,
            method='caption'
        )
        txt_clip = txt_clip.set_position('center').set_duration(5)
        final_clip = CompositeVideoClip([clip, txt_clip])
        final_clip.write_videofile("assets/videos/placeholder.mp4", fps=30)

def create_sample_music():
    if not os.path.exists("assets/audio/energetic.mp3"):
        silence = AudioClip(lambda t: 0.5 * (1 + 0.5 * mp.cos(2 * 3.14159 * 440 * t)), duration=30, fps=44100)
        silence.write_audiofile("assets/audio/energetic.mp3", fps=44100)
    if not os.path.exists("assets/audio/chill.mp3"):
        silence = AudioClip(lambda t: 0.3 * (1 + 0.3 * mp.cos(2 * 3.14159 * 220 * t)), duration=30, fps=44100)
        silence.write_audiofile("assets/audio/chill.mp3", fps=44100)

def create_script_templates():
    with open("templates/templates.json", "w") as f:
        json.dump(script_templates, f)