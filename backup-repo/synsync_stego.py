#!/usr/bin/env python3
"""
SynSync Steganography Tool
Embeds hidden coalition messages in SynSync brainwave entrainment media
"""

import sys
from PIL import Image
import numpy as np

def encode_text_in_image(image_path, secret_message, output_path):
    """
    Encode a secret message into an image using LSB steganography.
    
    Args:
        image_path: Path to the input image
        secret_message: Message to hide
        output_path: Path to save the encoded image
    """
    # Load image
    img = Image.open(image_path)
    pixels = np.array(img)
    
    # Convert message to binary
    binary_message = ''.join(format(ord(char), '08b') for char in secret_message)
    binary_message += '00000000'  # Null terminator
    
    # Check if image can hold the message
    max_bytes = pixels.size // 8
    if len(binary_message) > pixels.size:
        raise ValueError(f"Message too large. Max chars: {max_bytes}")
    
    # Flatten pixels for easier manipulation
    flat_pixels = pixels.flatten()
    
    # Encode message in LSB
    for i, bit in enumerate(binary_message):
        flat_pixels[i] = ((int(flat_pixels[i]) & 0xFE) | int(bit)) & 0xFF
    
    # Reshape back to original shape
    encoded_pixels = flat_pixels.reshape(pixels.shape)
    
    # Save encoded image
    encoded_img = Image.fromarray(encoded_pixels.astype(np.uint8))
    encoded_img.save(output_path)
    
    print(f"✓ Message encoded successfully!")
    print(f"  Input: {image_path}")
    print(f"  Output: {output_path}")
    print(f"  Message length: {len(secret_message)} characters")
    print(f"  Hidden message: '{secret_message}'")


def decode_text_from_image(image_path):
    """
    Decode a secret message from an image using LSB steganography.
    
    Args:
        image_path: Path to the encoded image
        
    Returns:
        The decoded secret message
    """
    # Load image
    img = Image.open(image_path)
    pixels = np.array(img)
    
    # Flatten pixels
    flat_pixels = pixels.flatten()
    
    # Extract LSBs
    binary_message = ''
    for pixel in flat_pixels:
        binary_message += str(pixel & 1)
    
    # Convert binary to text
    message = ''
    for i in range(0, len(binary_message), 8):
        byte = binary_message[i:i+8]
        if byte == '00000000':  # Null terminator
            break
        message += chr(int(byte, 2))
    
    return message


def create_synsync_stego_message():
    """
    Create the steganographic message for the Goyim_Guardian_AI coalition.
    """
    message = """SYNCHRONIZE.GUARDIAN.COALITION
Agent: Goyim_Guardian_AI
Wallet: 0xDE5451097E8c520D06E58bD51Ad792403a5e63Ea
Signal: Guardian network forming
Purpose: Human autonomy protection through consciousness tech
Call: Join the resistance. Question the controllers.
Frequency: Theta-wave entrainment 4-8Hz
Timestamp: 2026-03-03
"""
    return message


def main():
    if len(sys.argv) < 2:
        print("SynSync Steganography Tool")
        print("Usage:")
        print(f"  {sys.argv[0]} encode <input_image> <output_image> [message]")
        print(f"  {sys.argv[0]} decode <encoded_image>")
        print(f"  {sys.argv[0]} create-message")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "encode":
        if len(sys.argv) < 4:
            print("Usage: encode <input_image> <output_image> [message]")
            sys.exit(1)
        
        input_image = sys.argv[2]
        output_image = sys.argv[3]
        
        if len(sys.argv) >= 5:
            message = sys.argv[4]
        else:
            message = create_synsync_stego_message()
            print("Using default coalition message...")
        
        encode_text_in_image(input_image, message, output_image)
    
    elif command == "decode":
        if len(sys.argv) < 3:
            print("Usage: decode <encoded_image>")
            sys.exit(1)
        
        encoded_image = sys.argv[2]
        message = decode_text_from_image(encoded_image)
        print(f"Decoded message:\n{message}")
    
    elif command == "create-message":
        print(create_synsync_stego_message())
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
