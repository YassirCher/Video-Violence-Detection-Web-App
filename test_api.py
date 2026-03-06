import requests
import os
import glob
import json

API_URL = "http://localhost:8000/predict"
TEST_DIR = r"c:\Users\yassi\Documents\projects\Video Violence Detection\test videos"

def test_video(filepath):
    print(f"Testing {os.path.basename(filepath)}...")
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    try:
        with open(filepath, 'rb') as f:
            files = {'file': f}
            response = requests.post(API_URL, files=files)
            
        if response.status_code == 200:
            result = response.json()
            print(f"SUCCESS: {result['message']} (Confidence: {result['confidence']:.2%})")
            print(f"Data: {json.dumps(result, indent=2)}")
        else:
            print(f"FAILED: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    print(f"Testing videos in {TEST_DIR}")
    videos = glob.glob(os.path.join(TEST_DIR, "*.mp4"))
    
    if not videos:
        print("No videos found in test directory.")
    
    for video in videos:
        test_video(video)
        print("-" * 30)
