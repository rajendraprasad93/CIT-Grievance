"""
Universal Vision Service - Context-aware image analysis
Analyzes any image and determines what it represents
"""

import os
import logging
import json
import google.generativeai as genai
from typing import Dict, Optional
from PIL import Image

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def analyze_image_universal(
    image_path: str,
    context_hint: Optional[str] = None,
    user_caption: Optional[str] = None
) -> Dict:
    """
    Universal image analysis that works for ANY context
    
    Args:
        image_path: Path to uploaded image
        context_hint: Optional hint ("issue", "moment", "opportunity")
        user_caption: Optional user-provided caption/text
    
    Returns:
        {
            "detected_context": "civic_issue" | "opportunity" | "social_moment" | "unknown",
            "confidence": 0-100,
            "extracted_data": {...},
            "auto_fill_preview": {...}
        }
    """
    
    # STEP 1: Initialize tracking
    tracking = {
        "step": "initialization",
        "api_key_configured": bool(GEMINI_API_KEY),
        "image_path": image_path,
        "context_hint": context_hint,
        "user_caption": user_caption,
        "errors": []
    }
    
    logger.info(f"🚀 STEP 1: Starting analysis - {tracking}")
    
    try:
        # STEP 2: Build prompt
        tracking["step"] = "building_prompt"
        logger.info(f"📝 STEP 2: Building prompt for context: {context_hint}")
        
        prompt = build_universal_prompt(context_hint, user_caption)
        tracking["prompt_length"] = len(prompt)
        logger.info(f"✅ STEP 2 Complete: Prompt built ({tracking['prompt_length']} chars)")
        
        # STEP 3: Load image using PIL
        tracking["step"] = "loading_image"
        logger.info(f"🖼️ STEP 3: Loading image from {image_path}")
        
        # Check if file exists
        if not os.path.exists(image_path):
            error = f"Image file not found: {image_path}"
            tracking["errors"].append(error)
            logger.error(f"❌ STEP 3 Failed: {error}")
            return create_fallback_response(context_hint, tracking)
        
        # Get file size
        file_size = os.path.getsize(image_path)
        tracking["file_size_bytes"] = file_size
        logger.info(f"📊 Image file size: {file_size} bytes")
        
        # Load image using PIL
        from PIL import Image
        img = Image.open(image_path)
        tracking["image_loaded"] = True
        logger.info(f"✅ STEP 3 Complete: Image loaded with PIL ({img.size})")
        
        # STEP 4: Try Gemini API
        tracking["step"] = "calling_gemini_api"
        logger.info(f"🤖 STEP 4: Calling Gemini API")
        
        try:
            # Check API key again
            api_key = os.environ.get("GEMINI_API_KEY")
            if not api_key:
                error = "GEMINI_API_KEY not found in environment"
                tracking["errors"].append(error)
                logger.error(f"❌ STEP 4 Failed: {error}")
                return create_fallback_response(context_hint, tracking)
            
            # Check if API key is placeholder
            if api_key in ['your_gemini_api_key_here', 'your_api_key_here'] or 'placeholder' in api_key.lower():
                error = "API key is placeholder - skipping API call"
                tracking["errors"].append(error)
                logger.warning(f"⚠️ STEP 4 Skipped: {error}")
                return create_fallback_response(context_hint, tracking)
            
            tracking["api_key_present"] = True
            logger.info(f"🔑 API Key found: {api_key[:20]}...")
            
            # Configure Gemini
            genai.configure(api_key=api_key)
            logger.info(f"⚙️ Gemini configured successfully")
            
            # FIRST: List available models to find one that works
            logger.info(f"📋 Listing available models...")
            available_models = []
            try:
                for model in genai.list_models():
                    if 'generateContent' in model.supported_generation_methods:
                        available_models.append(model.name)
                        logger.info(f"   Found model: {model.name}")
            except Exception as e:
                logger.warning(f"Could not list models: {e}")
            
            tracking["available_models"] = available_models
            logger.info(f"📋 Available models: {available_models}")
            
            # Try each available model
            models_to_try = available_models if available_models else [
                "models/gemini-1.5-flash",
                "models/gemini-1.5-pro", 
                "models/gemini-pro"
            ]
            
            last_error = None
            for model_name in models_to_try:
                try:
                    tracking["model_attempted"] = model_name
                    logger.info(f"🎯 Attempting model: {model_name}")
                    
                    model = genai.GenerativeModel(model_name)
                    logger.info(f"✅ Model created: {model_name}")
                    
                    # Make API call with PIL image directly
                    logger.info(f"📡 Making API call to Gemini...")
                    response = model.generate_content([prompt, img])
                    logger.info(f"✅ API call successful! Response received")
                    
                    # If we get here, the model worked!
                    break
                    
                except Exception as e:
                    last_error = str(e)
                    logger.warning(f"Model {model_name} failed: {last_error}")
                    continue
            else:
                # All models failed
                error = f"All models failed. Last error: {last_error}"
                tracking["errors"].append(error)
                logger.error(f"❌ STEP 4 Failed: {error}")
                return create_fallback_response(context_hint, tracking)
            
            # STEP 5: Parse response
            tracking["step"] = "parsing_response"
            logger.info(f"📋 STEP 5: Parsing Gemini response")
            
            response_text = response.text.strip()
            tracking["raw_response_length"] = len(response_text)
            logger.info(f"📝 Raw response length: {tracking['raw_response_length']} chars")
            logger.info(f"📄 Raw response preview: {response_text[:200]}...")
            
            # Clean response
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            tracking["cleaned_response_length"] = len(response_text)
            logger.info(f"🧹 Cleaned response length: {tracking['cleaned_response_length']} chars")
            
            # Parse JSON
            result = json.loads(response_text)
            tracking["json_parsed"] = True
            logger.info(f"✅ JSON parsed successfully")
            
            # Validate result
            required_fields = ["detected_context", "confidence"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if missing_fields:
                error = f"Missing required fields: {missing_fields}"
                tracking["errors"].append(error)
                logger.warning(f"⚠️ Response validation failed: {error}")
                return create_fallback_response(context_hint, tracking)
            
            tracking["step"] = "success"
            tracking["final_result"] = {
                "detected_context": result.get("detected_context"),
                "confidence": result.get("confidence")
            }
            
            logger.info(f"🎉 STEP 5 Complete: Analysis successful!")
            logger.info(f"🎯 Final result: {tracking['final_result']}")
            logger.info(f"📊 Full tracking: {tracking}")
            
            return result
            
        except json.JSONDecodeError as e:
            error = f"JSON parsing failed: {str(e)}"
            tracking["errors"].append(error)
            logger.error(f"❌ JSON Parse Error: {error}")
            logger.error(f"🔍 Response that failed to parse: {response_text[:500]}...")
            return create_fallback_response(context_hint, tracking)
            
        except Exception as e:
            error = f"Gemini API call failed: {str(e)}"
            tracking["errors"].append(error)
            logger.error(f"❌ STEP 4 Failed: {error}")
            logger.error(f"📊 Tracking at failure: {tracking}")
            return create_fallback_response(context_hint, tracking)
        
    except Exception as e:
        error = f"Universal analysis failed: {str(e)}"
        tracking["errors"].append(error)
        tracking["step"] = "fatal_error"
        logger.error(f"💥 FATAL ERROR: {error}")
        logger.error(f"📊 Final tracking: {tracking}")
        return create_fallback_response(context_hint, tracking)


def create_fallback_response(context_hint: Optional[str], tracking: dict) -> Dict:
    """Create intelligent fallback response based on context"""
    
    logger.info(f"🔄 Creating fallback response for context: {context_hint}")
    logger.info(f"📊 Tracking data: {tracking}")
    
    # Check if API key is placeholder
    api_key = os.getenv('GEMINI_API_KEY', '')
    is_placeholder = api_key in ['your_gemini_api_key_here', 'your_api_key_here', ''] or 'placeholder' in api_key.lower()
    
    if is_placeholder:
        reasoning = "AI analysis unavailable - API key not configured. Using smart fallback based on context."
    else:
        reasoning = f"AI analysis failed - API error at step: {tracking.get('step', 'unknown')}. Using fallback detection."
    
    if context_hint == "issue":
        return {
            "detected_context": "civic_issue",
            "confidence": 75,  # Higher confidence for context-based detection
            "reasoning": reasoning,
            "extracted_data": {
                "issue_type": "infrastructure",
                "severity": "MEDIUM",
                "visual_description": "Campus issue detected from uploaded image"
            },
            "auto_fill_preview": {
                "category": "Infrastructure",
                "title": "Campus Issue Report",
                "description": "Please describe the issue you see in the uploaded image",
                "location": "Please specify the location"
            },
            "tracking": tracking
        }
    elif context_hint == "opportunity":
        return {
            "detected_context": "opportunity",
            "confidence": 75,
            "reasoning": reasoning,
            "extracted_data": {
                "opportunity_type": "event",
                "title": "Campus Opportunity",
                "description": "Opportunity details from image"
            },
            "auto_fill_preview": {
                "title": "New Opportunity",
                "opp_type": "event",
                "description": "Please describe this opportunity from the uploaded image",
                "deadline": ""
            },
            "tracking": tracking
        }
    else:  # moment context
        return {
            "detected_context": "social_moment",
            "confidence": 80,  # High confidence for moment context
            "reasoning": reasoning,
            "extracted_data": {
                "moment_type": "campus_life",
                "summary": "Campus moment with image"
            },
            "auto_fill_preview": {
                "title": "Campus Moment",
                "content": "Share what's happening! Describe what you see in the image.",
                "moment_type": "campus_life",
                "tags": ["campus", "moment"]
            },
            "tracking": tracking
        }


def build_universal_prompt(context_hint: Optional[str], user_caption: Optional[str]) -> str:
    """Build intelligent prompt based on context"""
    
    base_prompt = """You are an expert image analyzer for a campus platform. Analyze this image and determine what it represents.

POSSIBLE CONTEXTS:
1. CIVIC_ISSUE - Campus infrastructure problems (garbage, potholes, broken lights, leaks, etc.)
2. OPPORTUNITY - Internship posters, event flyers, workshop announcements, job postings
3. SOCIAL_MOMENT - Social posts, help requests, announcements, celebrations, questions

ANALYSIS RULES:
- Look for text in the image (posters, signs, flyers)
- Identify objects and their condition
- Determine the primary purpose of this image
- Extract ALL relevant information visible in the image

"""
    
    if user_caption:
        base_prompt += f"\nUSER CAPTION: \"{user_caption}\"\n"
    
    if context_hint == "issue":
        base_prompt += "\nCONTEXT HINT: User is reporting a campus issue. Focus on infrastructure problems.\n"
    elif context_hint == "opportunity":
        base_prompt += "\nCONTEXT HINT: User is posting an opportunity. Focus on extracting event/internship details.\n"
    elif context_hint == "moment":
        base_prompt += "\nCONTEXT HINT: User is posting a social moment. Focus on the social context.\n"
    
    base_prompt += """
Return ONLY valid JSON in this format:

{
  "detected_context": "civic_issue" | "opportunity" | "social_moment" | "unknown",
  "confidence": 0-100,
  "reasoning": "Brief explanation of detection",
  "extracted_data": {
    // Context-specific fields
  },
  "auto_fill_preview": {
    // Ready-to-use form fields
  }
}

FOR CIVIC_ISSUE:
{
  "extracted_data": {
    "issue_type": "garbage" | "pothole" | "water_leak" | "electrical" | "infrastructure" | "other",
    "severity": "LOW" | "MEDIUM" | "HIGH",
    "visual_description": "Factual description of what's visible",
    "detected_objects": ["object1", "object2"],
    "location_hint": "Any visible location text/landmarks"
  },
  "auto_fill_preview": {
    "category": "hostel",
    "severity": "Medium",
    "description": "User-friendly description",
    "title": "Short title for the issue",
    "tags": ["relevant", "tags", "for", "issue"]
  }
}

FOR OPPORTUNITY:
{
  "extracted_data": {
    "opportunity_type": "internship" | "job" | "event" | "workshop" | "competition",
    "title": "Extracted title from poster",
    "organization": "Company/organizer name",
    "deadline": "Extracted deadline date",
    "requirements": ["requirement1", "requirement2"],
    "contact_info": "Email/phone if visible",
    "event_date": "Event date if applicable",
    "location": "Event location if visible",
    "description": "Summary of opportunity"
  },
  "auto_fill_preview": {
    "title": "Opportunity title",
    "opp_type": "internship",
    "organization": "Company name",
    "deadline": "2026-02-15",
    "description": "Auto-generated description",
    "requirements": "Comma-separated requirements",
    "tags": ["relevant", "tags", "for", "opportunity"]
  }
}

FOR SOCIAL_MOMENT:
{
  "extracted_data": {
    "moment_type": "help" | "campus_life" | "opportunity" | "issue_observation",
    "summary": "What this moment is about",
    "sentiment": "positive" | "neutral" | "urgent" | "negative",
    "tags": ["tag1", "tag2"],
    "has_text": true/false,
    "text_content": "Any visible text in image"
  },
  "auto_fill_preview": {
    "title": "Auto-generated title",
    "content": "Auto-generated caption",
    "tags": ["tag1", "tag2"],
    "moment_type": "help"
  }
}

Be accurate and extract ALL visible information."""
    
    return base_prompt


def fallback_response() -> Dict:
    """Fallback when analysis fails"""
    return {
        "detected_context": "unknown",
        "confidence": 0,
        "reasoning": "Analysis failed or image unclear",
        "extracted_data": {},
        "auto_fill_preview": {},
        "error": True
    }