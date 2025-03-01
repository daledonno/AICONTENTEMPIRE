from fastapi import HTTPException
import httpx
import base64
import os
from typing import Dict, List

FAL_API_KEY = os.getenv("FAL_API_KEY")
generated_images = {}  # Shared with main.py

async def generate_image(prompt: str, segment_id: str, style: str = "realistic", aspect_ratio: str = "9:16"):
    """Generate an image for a segment using FAL"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://fal.run/fal-ai/stable-diffusion",
                headers={
                    "Authorization": f"Key {FAL_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "prompt": f"{prompt}, {style} style, high quality, detailed",
                    "negative_prompt": "blurry, low quality, distorted, deformed",
                    "width": 512 if aspect_ratio == "9:16" else 720,
                    "height": 912 if aspect_ratio == "9:16" else 1280,
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
            
            image_id = f"img_{segment_id}_{int(time.time())}"
            image_path = f"assets/images/{image_id}.jpg"
            image_bytes = base64.b64decode(image_data)
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            
            if segment_id not in generated_images:
                generated_images[segment_id] = []
            
            generated_images[segment_id].append({
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

def get_segment_images(segment_id: str):
    """Get all generated images for a segment"""
    if segment_id in generated_images:
        return {"images": generated_images[segment_id]}
    return {"images": []}

async def regenerate_image(image_id: str, new_prompt: str, segment_id: str, style: str = "realistic", aspect_ratio: str = "9:16"):
    """Regenerate an existing image with a new prompt"""
    try:
        # Remove old image if it exists
        image_path = f"assets/images/{image_id}.jpg"
        if os.path.exists(image_path):
            os.remove(image_path)
        
        # Generate new image
        return await generate_image(new_prompt, segment_id, style, aspect_ratio)
    except Exception as e:
        print(f"Error regenerating image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error regenerating image: {str(e)}")