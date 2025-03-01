from fastapi import HTTPException
import httpx
import json
import re
from typing import List, Dict
import os

# In-memory storage (shared with main.py)
script_templates = [
    {
        "id": "problem-solution",
        "name": "Problem-Solution",
        "description": "Introduces a problem and presents your product/service as the solution",
        "structure": [
            {"type": "intro", "purpose": "Introduce the problem briefly (1 sentence)"},
            {"type": "point", "purpose": "Explain the issue briefly (1 sentence)"},
            {"type": "point", "purpose": "Introduce solution briefly (1 sentence)"},
            {"type": "point", "purpose": "Show benefits briefly (1 sentence)"},
            {"type": "conclusion", "purpose": "Call to action (1 sentence)"}
        ]
    },
    {
        "id": "how-to",
        "name": "How-To Tutorial",
        "description": "Step-by-step instructions to accomplish a specific task",
        "structure": [
            {"type": "intro", "purpose": "Introduce what viewers will learn briefly (1 sentence)"},
            {"type": "point", "purpose": "Step 1 briefly (1 sentence)"},
            {"type": "point", "purpose": "Step 2 briefly (1 sentence)"},
            {"type": "point", "purpose": "Step 3 briefly (1 sentence)"},
            {"type": "conclusion", "purpose": "Recap and benefits briefly (1 sentence)"}
        ]
    },
    {
        "id": "listicle",
        "name": "Listicle (Top 5)",
        "description": "Presents a list of tips, ideas, or products",
        "structure": [
            {"type": "intro", "purpose": "Introduce the topic briefly (1 sentence)"},
            {"type": "point", "purpose": "Item #1 briefly (1 sentence)"},
            {"type": "point", "purpose": "Item #2 briefly (1 sentence)"},
            {"type": "point", "purpose": "Item #3 briefly (1 sentence)"},
            {"type": "point", "purpose": "Item #4 briefly (1 sentence)"},
            {"type": "point", "purpose": "Item #5 briefly (1 sentence)"},
            {"type": "conclusion", "purpose": "Summarize and call to action briefly (1 sentence)"}
        ]
    }
]

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def generate_script_task(video_id: int, request: Dict):
    """Generate script content for timeline segments using OpenAI or trends"""
    global script_templates
    template = None
    if request.get("selected_template"):
        for t in script_templates:
            if t["id"] == request["selected_template"]:
                template = t
                break
    
    segment_structure = request.get("segmentTypes", [])
    if template:
        segment_structure = [s["type"] for s in template["structure"]]
    
    num_segments = len(segment_structure)
    if request.get("target_duration"):
        avg_duration = max(2, min(4, request["target_duration"] // num_segments))  # Ensure 2-4s per segment
        num_segments = max(1, request["target_duration"] // 4)  # Minimum 1 segment, max ~4s each
        if num_segments < len(segment_structure):
            segment_structure = segment_structure[:num_segments]
        elif num_segments > len(segment_structure):
            segment_structure.extend([segment_structure[-1]] * (num_segments - len(segment_structure)))

    prompt = f"""
    Create a script for a short-form video about {request['title']}.
    
    Topic: {request['topic']}
    Goal: {request['goal']}
    Target Audience: {request['target_audience']}
    Tone: {request.get('tone', 'informative')}
    """
    
    if request.get("use_trends", False):
        prompt += """
        Use current AI trends from YouTube and TikTok (e.g., AI tools, ethics, education) to generate relevant, engaging content.
        """
    else:
        prompt += f"""
        The script should be divided into {num_segments} segments, each lasting approximately {avg_duration} seconds.
        Each segment should have:
        1. Script text (1 concise sentence, under 15 words, conversational, and engaging)
        2. Visual description (what should appear on screen, detailed but brief, for images or videos)
        
        Format your response as a JSON array with each segment having:
        - text: The script to be read (1 sentence, max 15 words)
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
                    {"role": "system", "content": "You are an expert scriptwriter for short-form videos, focusing on 2-4 second segments with one sentence per slide (max 15 words), using AI trends if specified."},
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
                        "text": "Brief additional content here.",
                        "visualPrompt": "Generic visual related to the topic"
                    })
            segments = segments[:len(segment_structure)]
            
            # Validate text length (max 15 words per segment)
            for segment in segments:
                words = segment["text"].split()
                if len(words) > 15:
                    segment["text"] = " ".join(words[:15]) + "..."  # Truncate to 15 words
            
            # Save to timelines
            import main  # Import main to access global timelines
            main.timelines[video_id] = {"segments": segments}
            with open(f"projects/timeline_{video_id}.json", "w") as f:
                json.dump({"segments": segments}, f)
            
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to decode JSON from OpenAI response")

def get_script_templates():
    """Get all script templates"""
    return script_templates