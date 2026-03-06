import cv2
import numpy as np
import torch
from torchvision import transforms as T
import tempfile
import os

# Configuration matching the training
IMG_SIZE = 224
NUM_FRAMES = 16

def extract_frames(video_path, num_frames=NUM_FRAMES, img_size=IMG_SIZE):
    """
    Extracts 16 frames uniformly from the video.
    """
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Processing video: {video_path}, Total Frames: {total_frames}")
    
    if total_frames <= 0:
        # Fallback for empty or corrupt videos
        cap.release()
        return np.zeros((num_frames, img_size, img_size, 3), dtype=np.uint8)

    # Calculate indices for uniform sampling
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    
    frames = []
    for i in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            # Convert BGR to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Resize
            frame = cv2.resize(frame, (img_size, img_size))
            frames.append(frame)
        else:
            # Pad with black frame if read fails
            frames.append(np.zeros((img_size, img_size, 3), dtype=np.uint8))
            
    cap.release()
    
    # Pad if we didn't get enough frames
    while len(frames) < num_frames:
        frames.append(np.zeros((img_size, img_size, 3), dtype=np.uint8))
        
    return np.array(frames[:num_frames])

def preprocess_video(video_path):
    """
    Extracts frames and applies normalization for the model.
    """
    frames = extract_frames(video_path) # [16, 224, 224, 3] (uint8)
    
    # Define transforms (Standard ImageNet normalization)
    transform = T.Compose([
        T.ToTensor(),
        T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Process each frame
    # frames array is numpy, transform expects PIL or numpy
    processed_frames = []
    for frame in frames:
        tensor_frame = transform(frame)
        processed_frames.append(tensor_frame)
        
    # Stack into [T, C, H, W]
    video_tensor = torch.stack(processed_frames)
    
    # Add batch dimension [1, T, C, H, W]
    return video_tensor.unsqueeze(0)
