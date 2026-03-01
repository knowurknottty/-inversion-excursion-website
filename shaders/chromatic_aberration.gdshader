shader_type canvas_item;
render_mode unshaded;

// Chromatic Aberration Shader
// High-quality RGB channel separation with barrel distortion

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

// Aberration parameters
uniform float aberration_strength : hint_range(-0.1, 0.1) = 0.01;
uniform float radial_distortion : hint_range(0.0, 1.0) = 0.1;
uniform float barrel_power : hint_range(0.5, 3.0) = 1.5;

// Color channel offsets
uniform vec2 red_offset = vec2(-0.01, 0.0);
uniform vec2 green_offset = vec2(0.0, 0.0);
uniform vec2 blue_offset = vec2(0.01, 0.0);

// Additional effects
uniform bool enable_vignette = true;
uniform float vignette_strength : hint_range(0.0, 2.0) = 0.5;
uniform float vignette_size : hint_range(0.0, 2.0) = 1.0;

uniform bool enable_scanlines = false;
uniform float scanline_intensity : hint_range(0.0, 1.0) = 0.3;
uniform float scanline_count : hint_range(100.0, 2000.0) = 800.0;

uniform bool enable_noise = false;
uniform float noise_intensity : hint_range(0.0, 0.5) = 0.05;

// Internal time
uniform float time : hint_range(0.0, 1000.0) = 0.0;

// Hash for noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Barrel distortion
vec2 barrelDistort(vec2 uv, float strength) {
    vec2 centered = uv * 2.0 - 1.0;
    float dist = length(centered);
    float distortion = pow(dist, barrel_power) * strength;
    return uv + centered * distortion * 0.1;
}

void fragment() {
    vec2 uv = UV;
    vec2 centered = uv - 0.5;
    float dist = length(centered);
    
    // Apply barrel distortion
    vec2 distortedUV = barrelDistort(uv, radial_distortion);
    
    // Calculate radial aberration offset
    vec2 direction = normalize(centered + 0.0001);
    float radialAberration = aberration_strength * pow(dist, 2.0);
    
    // Sample each color channel with offset
    vec2 redUV = distortedUV + direction * (radialAberration + red_offset.x);
    vec2 greenUV = distortedUV + direction * (green_offset.x);
    vec2 blueUV = distortedUV + direction * (-radialAberration + blue_offset.x);
    
    // Clamp UVs to prevent sampling outside screen
    redUV = clamp(redUV, 0.0, 1.0);
    greenUV = clamp(greenUV, 0.0, 1.0);
    blueUV = clamp(blueUV, 0.0, 1.0);
    
    // Sample channels
    float r = texture(SCREEN_TEXTURE, redUV).r;
    float g = texture(SCREEN_TEXTURE, greenUV).g;
    float b = texture(SCREEN_TEXTURE, blueUV).b;
    
    vec3 color = vec3(r, g, b);
    
    // Vignette
    if (enable_vignette) {
        float vignette = 1.0 - pow(dist * vignette_size, 2.0) * vignette_strength;
        vignette = clamp(vignette, 0.0, 1.0);
        color *= vignette;
    }
    
    // Scanlines
    if (enable_scanlines) {
        float scanline = sin(uv.y * scanline_count + time * 2.0) * 0.5 + 0.5;
        color *= 1.0 - scanline_intensity * scanline;
    }
    
    // Noise
    if (enable_noise) {
        float n = hash(uv * time) * noise_intensity;
        color += n;
    }
    
    COLOR = vec4(color, 1.0);
}
