"""Tiny CNN for Quick Draw 28x28 sketch classification.

Deliberately small: this gets hand-ported to plain TypeScript with no ML runtime
(see app/lib/quickdraw/), so every layer type used here must have a straightforward,
easy-to-verify TS equivalent (conv2d same-padding stride-1, maxpool2 stride-2, dense,
relu). No batchnorm, no dropout-at-inference-time complexity, no exotic layers.

Architecture (input 1x28x28):
  conv1: 1  -> 16 ch, 3x3, pad 1, stride 1  -> relu -> maxpool 2x2 -> 16x14x14
  conv2: 16 -> 32 ch, 3x3, pad 1, stride 1  -> relu -> maxpool 2x2 -> 32x7x7
  conv3: 32 -> 32 ch, 3x3, pad 1, stride 1  -> relu -> maxpool 2x2 -> 32x3x3 (floor)
  flatten -> 288
  fc1: 288 -> 128 -> relu
  fc2: 128 -> NUM_CLASSES  (raw logits; softmax applied outside the model)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class QuickDrawCNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.fc1 = nn.Linear(32 * 3 * 3, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x))
        return self.fc2(x)
