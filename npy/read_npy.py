import numpy as np
events = np.load('21.npy')

# Convert to (N, 4) float32: [timestamp, x, y, polarity]
out = events.T.astype(np.float32)  # shape: (833427, 4)
out.tofile('events.bin')

print("Saved events.bin")
print("Shape:", out.shape)
print("File size:", out.nbytes / 1024 / 1024, "MB")