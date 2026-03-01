shader_type canvas_item;
render_mode unshaded;

// ASCII Post-Process Shader
// Converts rendered output to ASCII art with error-text overlay support

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

// ASCII character set as a texture (16x6 grid = 96 characters)
// Characters ordered by perceived brightness
uniform sampler2D ascii_texture : hint_default_black;

// Display settings
uniform vec2 char_size = vec2(8.0, 16.0);
uniform float ascii_scale : hint_range(0.5, 4.0) = 1.0;

// Color modes
uniform int color_mode : hint_range(0, 3) = 0; // 0=grayscale, 1=full color, 2=green terminal, 3=amber
uniform bool preserve_luminance = true;

// Effects
uniform float scanline_intensity : hint_range(0.0, 1.0) = 0.3;
uniform float scanline_count : hint_range(100.0, 2000.0) = 800.0;
uniform float glow_amount : hint_range(0.0, 2.0) = 0.5;
uniform float flicker_amount : hint_range(0.0, 0.1) = 0.02;

// Error text overlay
uniform bool show_error_text = false;
uniform vec2 error_text_position = vec2(0.1, 0.1);
uniform float error_text_scale : hint_range(0.5, 3.0) = 1.0;
uniform vec4 error_color : source_color = vec4(1.0, 0.0, 0.0, 1.0);
uniform float error_flash_speed : hint_range(0.0, 10.0) = 3.0;
uniform float error_scroll_speed : hint_range(0.0, 2.0) = 0.5;

// Internal time
uniform float time : hint_range(0.0, 1000.0) = 0.0;

// Character brightness lookup (simplified - maps to ASCII texture)
const float char_brightness[16] = float[](
    0.0, 0.067, 0.133, 0.2, 0.267, 0.333, 0.4, 0.467,
    0.533, 0.6, 0.667, 0.733, 0.8, 0.867, 0.933, 1.0
);

// Simple hash for randomness
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Get luminance
float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// Sample ASCII character
vec3 sampleASCII(float brightness, vec2 charUV, vec3 originalColor) {
    // Map brightness to character index (0-15 for simplified set)
    int charIndex = int(brightness * 15.0);
    charIndex = clamp(charIndex, 0, 15);
    
    // Calculate texture coordinates
    // Assuming 16x1 character layout in the texture
    float charWidth = 1.0 / 16.0;
    vec2 asciiUV = vec2(
        (float(charIndex) + charUV.x) * charWidth,
        charUV.y
    );
    
    // Sample the ASCII texture
    float charValue = texture(ascii_texture, asciiUV).r;
    
    // Apply color based on mode
    vec3 finalColor;
    switch (color_mode) {
        case 0: // Grayscale
            finalColor = vec3(charValue);
            break;
        case 1: // Full color
            finalColor = originalColor * charValue;
            break;
        case 2: // Green terminal
            finalColor = vec3(0.0, charValue, 0.0);
            break;
        case 3: // Amber
            finalColor = vec3(charValue, charValue * 0.75, 0.0);
            break;
        default:
            finalColor = vec3(charValue);
    }
    
    return finalColor;
}

// Generate procedural ASCII pattern (fallback when no texture)
float proceduralASCII(float brightness, vec2 charUV) {
    // Simple patterns for different brightness levels
    float pattern = 0.0;
    
    if (brightness < 0.067) {
        pattern = 0.0; // Space
    } else if (brightness < 0.133) {
        pattern = step(0.5, charUV.x) * step(0.5, charUV.y) * 0.3; // Dot
    } else if (brightness < 0.2) {
        pattern = step(0.7, 1.0 - length(charUV - 0.5) * 2.0) * 0.4; // Small circle
    } else if (brightness < 0.267) {
        pattern = (1.0 - abs(charUV.x - 0.5) * 2.0) * 0.1 + step(0.5, charUV.y) * 0.3; // Comma-ish
    } else if (brightness < 0.333) {
        pattern = step(0.3, charUV.x) * step(0.3, 1.0 - charUV.x) * 0.5; // Dash
    } else if (brightness < 0.4) {
        pattern = (charUV.x + charUV.y) * 0.3; // Slash-like
    } else if (brightness < 0.467) {
        pattern = step(0.4, sin(charUV.x * 10.0) * sin(charUV.y * 10.0) + 0.5) * 0.5; // Plus
    } else if (brightness < 0.533) {
        pattern = step(0.5, sin(charUV.x * 6.28) * sin(charUV.y * 6.28) + 0.3) * 0.6; // Star
    } else if (brightness < 0.6) {
        pattern = 1.0 - step(0.4, length(charUV - 0.5)); // Circle
    } else if (brightness < 0.667) {
        pattern = step(0.3, charUV.x) * step(0.3, 1.0 - charUV.x) +
                  step(0.3, charUV.y) * step(0.3, 1.0 - charUV.y) * 0.7; // Box
    } else if (brightness < 0.733) {
        pattern = mix(0.3, 0.8, charUV.x * charUV.y); // Gradient
    } else if (brightness < 0.8) {
        pattern = step(0.2, sin(charUV.x * 20.0) * sin(charUV.y * 20.0) + 0.5) * 0.5 + 0.3; // Dither
    } else if (brightness < 0.867) {
        pattern = 0.7 + 0.3 * step(0.5, charUV.x + charUV.y); // Half fill
    } else if (brightness < 0.933) {
        pattern = 0.8 + 0.2 * step(0.7, charUV.x); // Mostly full
    } else {
        pattern = 1.0; // Full block
    }
    
    return pattern;
}

// Error text generation
vec3 generateErrorText(vec2 uv) {
    if (!show_error_text) return vec3(0.0);
    
    // Scrolling position
    float scroll = time * error_scroll_speed;
    vec2 textUV = (uv - error_text_position) * error_text_scale;
    textUV.y += scroll;
    
    // Character grid
    vec2 charPos = floor(textUV * vec2(40.0, 20.0));
    vec2 charUV = fract(textUV * vec2(40.0, 20.0));
    
    // Generate error pattern
    float errorNoise = hash(charPos + floor(time * error_flash_speed));
    float errorPattern = step(0.3, errorNoise);
    
    // Flash effect
    float flash = sin(time * error_flash_speed * 6.28318) * 0.5 + 0.5;
    
    // Create text-like pattern
    float textLine = step(0.1, charUV.y) * step(charUV.y, 0.9);
    float textChar = step(0.1, charUV.x) * step(charUV.x, 0.9) * errorPattern;
    
    // Random "corrupted" characters
    float corruption = hash(charPos + time * 0.1);
    float corrupted = step(0.7, corruption);
    
    vec3 color = error_color.rgb * textLine * textChar * (0.5 + 0.5 * flash);
    color += error_color.rgb * corrupted * 0.3 * flash;
    
    return color;
}

// CRT scanline effect
float scanline(vec2 uv) {
    float scan = sin(uv.y * scanline_count + time * 2.0) * 0.5 + 0.5;
    return 1.0 - scanline_intensity * scan;
}

// Screen flicker
float flicker(float t) {
    return 1.0 - flicker_amount * (hash(vec2(t * 60.0, 0.0)) - 0.5);
}

void fragment() {
    vec2 uv = UV;
    vec2 screenSize = vec2(textureSize(SCREEN_TEXTURE, 0));
    
    // Calculate character grid
    vec2 scaledCharSize = char_size / ascii_scale;
    vec2 charCount = screenSize / scaledCharSize;
    vec2 charIndex = floor(uv * charCount);
    vec2 charUV = fract(uv * charCount);
    
    // Sample the screen at character center
    vec2 sampleUV = (charIndex + 0.5) / charCount;
    vec3 screenColor = texture(SCREEN_TEXTURE, sampleUV).rgb;
    
    // Get luminance for character selection
    float luminance = getLuminance(screenColor);
    
    // Apply contrast curve
    luminance = pow(luminance, 0.8);
    
    // Generate ASCII
    vec3 asciiColor;
    
    // Try to sample from texture first, fallback to procedural
    vec4 asciiTex = texture(ascii_texture, vec2(luminance, 0.5));
    if (asciiTex.a > 0.01) {
        // Use texture-based ASCII
        asciiColor = sampleASCII(luminance, charUV, screenColor);
    } else {
        // Use procedural ASCII
        float pattern = proceduralASCII(luminance, charUV);
        
        switch (color_mode) {
            case 0:
                asciiColor = vec3(pattern);
                break;
            case 1:
                asciiColor = screenColor * pattern;
                break;
            case 2:
                asciiColor = vec3(0.0, pattern, 0.0);
                break;
            case 3:
                asciiColor = vec3(pattern, pattern * 0.75, 0.0);
                break;
            default:
                asciiColor = vec3(pattern);
        }
    }
    
    // Apply glow
    vec3 glow = vec3(0.0);
    if (glow_amount > 0.0) {
        for (float x = -1.0; x <= 1.0; x += 1.0) {
            for (float y = -1.0; y <= 1.0; y += 1.0) {
                vec2 offset = vec2(x, y) / charCount;
                vec3 sampleGlow = texture(SCREEN_TEXTURE, sampleUV + offset).rgb;
                glow += sampleGlow * glow_amount * 0.1;
            }
        }
    }
    
    // Combine
    vec3 finalColor = asciiColor + glow;
    
    // Apply scanlines
    finalColor *= scanline(uv);
    
    // Apply flicker
    finalColor *= flicker(time);
    
    // Add error text overlay
    vec3 errorOverlay = generateErrorText(uv);
    finalColor = mix(finalColor, errorOverlay, step(0.001, length(errorOverlay)));
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    finalColor *= vignette;
    
    COLOR = vec4(finalColor, 1.0);
}