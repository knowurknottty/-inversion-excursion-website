shader_type canvas_item;
render_mode unshaded;

// Dissolve Transition Shader
// High-quality noise-based dissolve with edge glow and distortion

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

// Transition control
uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform int transition_direction : hint_range(0, 3) = 0; // 0=in, 1=out, 2=wipe, 3=radial

// Noise parameters
uniform float noise_scale : hint_range(1.0, 100.0) = 25.0;
uniform float noise_contrast : hint_range(0.5, 5.0) = 2.0;
uniform float edge_width : hint_range(0.0, 0.5) = 0.1;
uniform float distortion_amount : hint_range(0.0, 0.1) = 0.02;

// Edge effects
uniform vec4 edge_color : source_color = vec4(1.0, 0.5, 0.0, 1.0);
uniform float edge_glow : hint_range(0.0, 5.0) = 2.0;
uniform float edge_intensity : hint_range(0.0, 3.0) = 1.5;

// Burn/char effect
uniform bool enable_burn = true;
uniform vec4 burn_color : source_color = vec4(0.1, 0.05, 0.0, 1.0);
uniform float burn_width : hint_range(0.0, 0.2) = 0.05;

// Glitch during transition
uniform bool enable_glitch = false;
uniform float glitch_intensity : hint_range(0.0, 1.0) = 0.3;
uniform float glitch_speed : hint_range(1.0, 20.0) = 10.0;

// Pattern type
uniform int pattern_type : hint_range(0, 4) = 0; // 0=noise, 1=cells, 2=stripes, 3=radial, 4=checker

// Internal time
uniform float time : hint_range(0.0, 1000.0) = 0.0;

// Hash function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// 2D noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Voronoi/cell pattern
float voronoi(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float minDist = 1.0;
    
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = neighbor + hash(i + neighbor);
            float dist = length(f - point);
            minDist = min(minDist, dist);
        }
    }
    
    return minDist;
}

// Pattern generator
float getPattern(vec2 uv, int type) {
    vec2 p = uv * noise_scale;
    
    switch (type) {
        case 0: // Noise
            return fbm(p);
        case 1: // Cells
            return 1.0 - voronoi(p * 0.5);
        case 2: // Stripes
            return sin(p.x * 3.0 + fbm(p * 0.5) * 2.0) * 0.5 + 0.5;
        case 3: // Radial
            float angle = atan(uv.y - 0.5, uv.x - 0.5);
            return sin(angle * 10.0 + length(uv - 0.5) * 20.0) * 0.5 + 0.5;
        case 4: // Checker
            vec2 check = floor(p * 0.5);
            return mod(check.x + check.y, 2.0);
        default:
            return fbm(p);
    }
}

// Directional mask
float getDirectionalMask(vec2 uv, int direction, float progress) {
    float mask = 0.0;
    
    switch (direction) {
        case 0: // Dissolve in (center outward)
            mask = length(uv - 0.5) * 2.0;
            return 1.0 - smoothstep(progress - 0.1, progress + 0.1, mask);
        case 1: // Dissolve out (edges inward)
            mask = 1.0 - length(uv - 0.5) * 2.0;
            return smoothstep(progress - 0.1, progress + 0.1, mask);
        case 2: // Wipe left to right
            mask = uv.x;
            return smoothstep(progress - 0.05, progress + 0.05, mask);
        case 3: // Radial wipe
            float angle = atan(uv.y - 0.5, uv.x - 0.5) / 6.28318 + 0.5;
            return smoothstep(progress - 0.05, progress + 0.05, angle);
        default:
            return progress;
    }
}

// Glitch offset
vec2 getGlitchOffset(vec2 uv, float t) {
    if (!enable_glitch) return vec2(0.0);
    
    float glitch = hash(vec2(floor(t * glitch_speed), 0.0));
    float offset = (glitch - 0.5) * glitch_intensity * 0.1;
    
    // Blocky glitch
    vec2 block = floor(uv * vec2(20.0, 10.0));
    float blockGlitch = hash(block + t);
    
    if (blockGlitch > 0.9) {
        offset *= 5.0;
    }
    
    return vec2(offset * (hash(vec2(t)) - 0.5), 0.0);
}

void fragment() {
    vec2 uv = UV;
    
    // Apply glitch
    vec2 glitchOffset = getGlitchOffset(uv, time);
    vec2 distortedUV = uv + glitchOffset * (1.0 - abs(progress - 0.5) * 2.0);
    
    // Get pattern value
    float pattern = getPattern(distortedUV, pattern_type);
    pattern = pow(pattern, noise_contrast);
    
    // Get directional mask
    float dirMask = getDirectionalMask(uv, transition_direction, progress);
    
    // Combine pattern with direction
    float threshold = mix(-0.2, 1.2, progress);
    float dissolve = smoothstep(threshold - edge_width, threshold + edge_width, pattern * dirMask);
    
    // Edge detection
    float edge = smoothstep(threshold - edge_width, threshold, pattern * dirMask) -
                 smoothstep(threshold, threshold + edge_width, pattern * dirMask);
    edge = pow(edge, 0.5) * edge_intensity;
    
    // Burn effect
    float burn = 0.0;
    if (enable_burn) {
        burn = smoothstep(threshold - edge_width - burn_width, threshold - edge_width, pattern * dirMask) -
               smoothstep(threshold - edge_width, threshold, pattern * dirMask);
        burn = pow(burn, 0.3);
    }
    
    // Sample screen with distortion
    vec2 sampleUV = distortedUV + (pattern - 0.5) * distortion_amount * (1.0 - dissolve);
    vec3 screenColor = texture(SCREEN_TEXTURE, sampleUV).rgb;
    
    // Apply edge glow
    vec3 edgeGlow = edge_color.rgb * edge * edge_glow;
    
    // Apply burn
    vec3 burnEffect = burn_color.rgb * burn * 2.0;
    
    // Combine
    vec3 finalColor = screenColor * (1.0 - edge) + edgeGlow + burnEffect;
    
    // Add scanlines during transition
    float scanline = sin(uv.y * 200.0 + time * 10.0) * 0.5 + 0.5;
    finalColor *= 1.0 - scanline * edge * 0.3;
    
    COLOR = vec4(finalColor, dissolve);
}