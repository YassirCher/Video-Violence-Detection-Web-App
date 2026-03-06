import torch
import torch.nn as nn
from torchvision import models

class CNNLSTM(nn.Module):
    def __init__(self, hidden_size=512, num_layers=2, dropout=0.5):
        super().__init__()
        # Use V2 weights as in the notebook
        resnet = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        
        # Remove the classification head (fc layer)
        self.cnn = nn.Sequential(*list(resnet.children())[:-1])
        
        # Freeze CNN parameters
        for param in self.cnn.parameters():
            param.requires_grad = False
        
        # LSTM for temporal features
        # Input size is 2048 (ResNet50 output feature size)
        self.lstm = nn.LSTM(
            input_size=2048,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Binary Classifier Head
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(hidden_size * 2, 1) # *2 for bidirectional
        )
    
    def forward(self, x):
        # x shape: [Batch, Time, Channels, Height, Width]
        B, T, C, H, W = x.shape
        
        # Flatten for CNN: [B*T, C, H, W]
        x = x.view(B * T, C, H, W)
        
        # Extract features
        with torch.no_grad():
            features = self.cnn(x).squeeze(-1).squeeze(-1) # [B*T, 2048]
        
        # Reshape for LSTM: [B, T, 2048]
        features = features.view(B, T, -1)
        
        # LSTM processing
        lstm_out, _ = self.lstm(features)
        
        # Use the last time step output for classification
        return self.classifier(lstm_out[:, -1, :])

def load_model(model_path, device='cpu'):
    model = CNNLSTM()
    # Load state dict
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model
