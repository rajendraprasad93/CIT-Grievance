"""
Test script to verify API keys are working
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

print("=" * 60)
print("API KEY VERIFICATION TEST")
print("=" * 60)

# Test Gemini API Key
gemini_key = os.environ.get("GEMINI_API_KEY")
if gemini_key:
    print(f"✅ Gemini API Key found: {gemini_key[:20]}...")
    
    # Try to configure Gemini
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        
        # List available models
        print("\n📋 Testing Gemini connection...")
        models = genai.list_models()
        model_names = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
        print(f"✅ Gemini API working! Available models: {len(model_names)}")
        print(f"   Models: {', '.join(model_names[:3])}...")
        
    except Exception as e:
        print(f"❌ Gemini API error: {str(e)}")
else:
    print("❌ Gemini API Key not found")

# Test Sightengine API Keys
sightengine_user = os.environ.get("SIGHTENGINE_API_USER")
sightengine_secret = os.environ.get("SIGHTENGINE_API_SECRET")

if sightengine_user and sightengine_secret:
    print(f"\n✅ Sightengine API User: {sightengine_user}")
    print(f"✅ Sightengine API Secret: {sightengine_secret[:10]}...")
    
    # Try to test Sightengine
    try:
        import requests
        print("\n📋 Testing Sightengine connection...")
        
        # Test with a simple check endpoint
        response = requests.get(
            'https://api.sightengine.com/1.0/check.json',
            params={
                'url': 'https://via.placeholder.com/150',
                'models': 'properties',
                'api_user': sightengine_user,
                'api_secret': sightengine_secret
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Sightengine API working!")
        else:
            print(f"⚠️ Sightengine API returned status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Sightengine API error: {str(e)}")
else:
    print("\n❌ Sightengine API Keys not found")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
