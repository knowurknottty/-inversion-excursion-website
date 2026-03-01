shader_type canvas_item;

// INVERSION EXCURSION - PS5 FIDELITY SPIRAL VORTEX
// GPU-intensive ray-marched volumetric spiral
// This shader is designed to push the GPU like a 3D game would

uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform float speed : hint_range(0.0, 3.0) = 1.2;
uniform vec3 color_primary : source_color = vec3(1.0, 0.85, 0.2);
uniform vec3 color_secondary : source_color = vec3(0.6, 0.15, 0.95);
uniform vec3 color_tertiary : source_color = vec3(1.0, 1.0, 1.0);
uniform float ray_count : hint_range(4.0, 24.0) = 12.0;
uniform float density : hint_range(0.5, 5.0) = 2.0;
uniform float bloom_intensity : hint_range(0.5, 5.0) = 2.5;

// High-quality noise functions (GPU intensive)
vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 157.0 + 113.0 * i.z;
    return mix(mix(mix(hash33(i + vec3(0.0, 0.0, 0.0)).x,
                       hash33(i + vec3(1.0, 0.0, 0.0)).x, f.x),
                   mix(hash33(i + vec3(0.0, 1.0, 0.0)).x,
                       hash33(i + vec3(1.0, 1.0, 0.0)).x, f.x), f.y),
               mix(mix(hash33(i + vec3(0.0, 0.0, 1.0)).x,
                       hash33(i + vec3(1.0, 0.0, 1.0)).x, f.x),
                   mix(hash33(i + vec3(0.0, 1.0, 1.0)).x,
                       hash33(i + vec3(1.0, 1.0, 1.0)).x, f.x), f.y), f.z);
}

// Fractional Brownian Motion - expensive but beautiful
float fbm3D(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < octaves; i++) {
        value += amplitude * noise3D(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// Rotational matrix for 3D effect
mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(vec2(c, -s), vec2(s, c));
}

void fragment() {
    // Center and aspect correct
    vec2 uv = (UV - 0.5) * 2.0;
    uv.x *= 1920.0 / 1080.0;
    
    float time = TIME * speed;
    
    // Polar coordinates
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Progress phases
    float formation = smoothstep(0.0, 0.2, progress);
    float active = smoothstep(0.2, 0.7, progress);
    float acceleration = smoothstep(0.7, 1.0, progress);
    
    // Multiple layered spiral systems
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    // Layer 1: Primary volumetric spiral (expensive)
    float spiral1 = 0.0;
    float rotation1 = time * (1.0 + acceleration * 3.0);
    
    for (float i = 0.0; i < ray_count; i++) {
        float t = i / ray_count;
        float ray_angle = angle + rotation1 + t * 6.28318;
        float ray_radius = radius * (1.0 + t * 2.0);
        
        // 3D noise sampling for volumetric effect
        vec3 noise_pos = vec3(
            cos(ray_angle) * ray_radius,
            sin(ray_angle) * ray_radius,
            time * 0.5 + t * 3.0
        );
        
        float noise_val = fbm3D(noise_pos * density, 4);
        float ray_intensity = exp(-ray_radius * 2.0) * (0.5 + 0.5 * noise_val);
        
        spiral1 += ray_intensity * (1.0 - t);
    }
    spiral1 /= ray_count;
    
    // Layer 2: Counter-rotating secondary spiral
    float spiral2 = 0.0;
    float rotation2 = -time * 0.7 - acceleration * 2.0;
    
    for (float i = 0.0; i < ray_count * 0.7; i++) {
        float t = i / (ray_count * 0.7);
        float ray_angle = angle + rotation2 - t * 4.0;
        float ray_radius = radius * (1.2 + t * 1.5);
        
        vec3 noise_pos = vec3(
            cos(ray_angle) * ray_radius,
            sin(ray_angle) * ray_radius,
            time * 0.3 - t * 2.0
        );
        
        float noise_val = fbm3D(noise_pos * density * 1.3, 3);
        float ray_intensity = exp(-ray_radius * 1.5) * noise_val;
        
        spiral2 += ray_intensity * (1.0 - t * 0.5);
    }
    spiral2 /= (ray_count * 0.7);
    
    // Layer 3: Central divine light (god rays)
    float god_rays = 0.0;
    float ray_angle_step = 6.28318 / 16.0;
    
    for (float i = 0.0; i < 16.0; i++) {
        float ray_angle = i * ray_angle_step + time * 0.2;
        vec2 ray_dir = vec2(cos(ray_angle), sin(ray_angle));
        float ray_dist = dot(uv, ray_dir);
        
        // Volumetric god ray
        float ray_width = 0.05 + radius * 0.1;
        float ray_strength = smoothstep(ray_width, 0.0, abs(ray_dist - radius * 0.5));
        ray_strength *= exp(-radius * 3.0);
        
        god_rays += ray_strength;
    }
    god_rays /= 16.0;
    
    // Combine layers
    float final_pattern = spiral1 * 2.0 + spiral2 * 1.5 + god_rays * 3.0;
    final_pattern *= formation;
    
    // Color mixing with sophisticated palette
    vec3 primary = color_primary * spiral1 * 3.0;
    vec3 secondary = color_secondary * spiral2 * 2.0;
    vec3 divine = color_tertiary * god_rays * bloom_intensity;
    
    // Add iridescent shift based on depth
    float iridescent = sin(final_pattern * 10.0 + time) * 0.5 + 0.5;
    vec3 irid_color = mix(color_primary, color_secondary, iridescent);
    
    color = primary + secondary + divine;
    color += irid_color * final_pattern * 0.5;
    
    // Central singularity glow (the Source)
    float singularity = 1.0 / (radius * radius * 50.0 + 0.01);
    singularity = pow(singularity, 0.8);
    singularity *= (0.5 + acceleration * 0.5);
    color += color_tertiary * singularity * bloom_intensity;
    
    // Chromatic aberration at edges
    float chromatic = radius * 0.1 * acceleration;
    color.r += chromatic * 0.5;
    color.b -= chromatic * 0.3;
    
    // Final white flash as we enter the Source
    float flash = pow(acceleration, 4.0) * 5.0;
    color += vec3(flash);
    
    // Volumetric fog fade
    float fog = exp(-radius * 0.5);
    color *= fog;
    
    // HDR tone mapping (reinhard)
    color = color / (1.0 + color);
    
    // Gamma correction
    color = pow(color, vec3(1.0 / 2.2));
    
    // Alpha based on formation
    alpha = formation * min(final_pattern * 2.0 + singularity, 1.0);
    
    COLOR = vec4(color, alpha);
}
