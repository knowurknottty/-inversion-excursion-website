shader_type spatial;
render_mode unshaded, cull_disabled, depth_test_disabled;

// PS5-Quality Spiral Tunnel Shader
// Raymarched infinite tunnel with god rays and color shifting

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;
uniform sampler2D DEPTH_TEXTURE : hint_depth_texture, filter_linear_mipmap;

// Core tunnel parameters
uniform float tunnel_radius : hint_range(0.1, 5.0) = 1.5;
uniform float tunnel_speed : hint_range(0.0, 10.0) = 2.0;
uniform float twist_amount : hint_range(0.0, 3.0) = 0.5;
uniform float tunnel_length : hint_range(10.0, 100.0) = 50.0;

// Color shifting (Gold -> Purple -> Cyan)
uniform float color_shift_speed : hint_range(0.0, 2.0) = 0.3;
uniform float color_saturation : hint_range(0.0, 2.0) = 1.2;
uniform float color_brightness : hint_range(0.5, 2.0) = 1.0;

// God rays / volumetric lighting
uniform float god_ray_intensity : hint_range(0.0, 2.0) = 0.8;
uniform float god_ray_density : hint_range(0.1, 5.0) = 1.5;
uniform float god_ray_speed : hint_range(0.0, 3.0) = 0.5;
uniform int god_ray_steps : hint_range(8, 64) = 32;

// 40Hz flicker for gamma entrainment
uniform bool enable_flicker = false;
uniform float flicker_frequency : hint_range(30.0, 50.0) = 40.0;
uniform float flicker_intensity : hint_range(0.0, 0.5) = 0.15;

// Visual effects
uniform float glow_intensity : hint_range(0.0, 3.0) = 1.5;
uniform float noise_scale : hint_range(1.0, 50.0) = 15.0;
uniform float aberration_amount : hint_range(0.0, 0.02) = 0.005;

// PS5-style raymarching quality
uniform int max_steps : hint_range(32, 256) = 128;
uniform float step_size : hint_range(0.01, 0.5) = 0.05;
uniform float min_distance : hint_range(0.001, 0.1) = 0.01;

// Internal time uniform (set from script)
uniform float time : hint_range(0.0, 1000.0) = 0.0;

// Hash function for noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// 3D noise function
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + 113.0 * i.z;
    return mix(
        mix(mix(hash(vec2(n, 0.0)), hash(vec2(n + 1.0, 0.0)), f.x),
            mix(hash(vec2(n + 57.0, 0.0)), hash(vec2(n + 58.0, 0.0)), f.x), f.y),
        mix(mix(hash(vec2(n + 113.0, 0.0)), hash(vec2(n + 114.0, 0.0)), f.x),
            mix(hash(vec2(n + 170.0, 0.0)), hash(vec2(n + 171.0, 0.0)), f.x), f.y), f.z
    );
}

// Fractal Brownian Motion for detailed noise
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

// SDF for spiral tunnel
float sdSpiralTunnel(vec3 p, float t) {
    // Spiral twist
    float angle = p.z * twist_amount + t * tunnel_speed * 0.5;
    float c = cos(angle);
    float s = sin(angle);
    
    vec2 rotated = vec2(
        p.x * c - p.y * s,
        p.x * s + p.y * c
    );
    
    // Distance from tunnel wall with ripple effect
    float dist = length(rotated) - tunnel_radius;
    float ripple = sin(p.z * 3.0 + t * 2.0) * 0.1 * sin(rotated.x * 5.0 + t);
    
    return dist + ripple * 0.05;
}

// Color shift: Gold -> Purple -> Cyan cycle
vec3 getShiftedColor(float t, float intensity) {
    // Phase through the color cycle
    float phase = fract(t * color_shift_speed) * 6.28318;
    
    // Gold (1.0, 0.8, 0.0) -> Purple (0.6, 0.0, 1.0) -> Cyan (0.0, 1.0, 1.0)
    vec3 gold = vec3(1.0, 0.84, 0.0);
    vec3 purple = vec3(0.6, 0.0, 1.0);
    vec3 cyan = vec3(0.0, 1.0, 1.0);
    
    float p1 = smoothstep(0.0, 2.09, phase) * smoothstep(4.18, 2.09, phase);
    float p2 = smoothstep(2.09, 4.18, phase) * smoothstep(6.28, 4.18, phase);
    float p3 = smoothstep(4.18, 6.28, phase) + smoothstep(0.0, 2.09, phase) * (1.0 - smoothstep(0.0, 2.09, phase));
    
    vec3 color = gold * p1 + purple * p2 + cyan * p3;
    
    // Normalize and apply saturation/brightness
    color = normalize(color + 0.001) * color_saturation;
    color = mix(vec3(length(color)), color, color_saturation);
    color *= color_brightness * intensity;
    
    return color;
}

// God rays / volumetric light scattering
vec3 calculateGodRays(vec3 ro, vec3 rd, float t) {
    vec3 lightPos = vec3(
        sin(t * god_ray_speed) * tunnel_radius * 0.5,
        cos(t * god_ray_speed * 0.7) * tunnel_radius * 0.5,
        5.0 + sin(t * 0.3) * 3.0
    );
    
    vec3 accum = vec3(0.0);
    float step_len = tunnel_length / float(god_ray_steps);
    
    for (int i = 0; i < god_ray_steps; i++) {
        float dist = float(i) * step_len;
        vec3 pos = ro + rd * dist;
        
        // Distance to light source
        float d = length(pos - lightPos);
        float attenuation = 1.0 / (1.0 + d * d * 0.1);
        
        // Density based on tunnel SDF
        float tunnelDist = sdSpiralTunnel(pos, t);
        float density = smoothstep(0.5, 0.0, abs(tunnelDist)) * god_ray_density;
        
        // Animated noise for volumetric feel
        float volNoise = fbm(pos * 0.5 + vec3(0.0, 0.0, t * 0.2));
        density *= (0.5 + 0.5 * volNoise);
        
        vec3 rayColor = getShiftedColor(t + dist * 0.05, 1.0);
        accum += rayColor * attenuation * density * step_len * god_ray_intensity;
    }
    
    return accum;
}

// Raymarch the tunnel
vec4 raymarch(vec3 ro, vec3 rd, float t) {
    float depth = 0.0;
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    for (int i = 0; i < max_steps; i++) {
        vec3 pos = ro + rd * depth;
        
        float dist = sdSpiralTunnel(pos, t);
        
        if (abs(dist) < min_distance) {
            // Hit the tunnel wall
            float intensity = 1.0 - (depth / tunnel_length);
            intensity = pow(intensity, 0.5);
            
            // Surface detail
            float detail = fbm(pos * noise_scale + vec3(0.0, 0.0, t));
            
            // Color based on position and time
            vec3 baseColor = getShiftedColor(t + pos.z * 0.1, intensity);
            baseColor *= (0.7 + 0.3 * detail);
            
            // Glow near the surface
            float glow = glow_intensity * smoothstep(0.5, 0.0, abs(dist));
            
            color = baseColor + vec3(glow);
            alpha = intensity;
            break;
        }
        
        depth += max(abs(dist) * 0.5, step_size);
        
        if (depth > tunnel_length) {
            // Fade to background
            float fade = exp(-depth * 0.02);
            color = getShiftedColor(t, fade * 0.3);
            alpha = fade * 0.5;
            break;
        }
    }
    
    return vec4(color, alpha);
}

// Chromatic aberration
vec3 applyChromaticAberration(vec2 uv, vec3 color, float amount) {
    vec2 direction = normalize(uv - vec2(0.5));
    float dist = length(uv - vec2(0.5));
    
    float r = texture(SCREEN_TEXTURE, uv + direction * amount * dist).r;
    float g = color.g;
    float b = texture(SCREEN_TEXTURE, uv - direction * amount * dist).b;
    
    return vec3(r, g, b);
}

void fragment() {
    // Normalized screen coordinates
    vec2 uv = SCREEN_UV;
    vec2 centered = uv * 2.0 - vec2(1.0);
    
    // Camera setup for raymarching
    vec3 ro = vec3(0.0, 0.0, -5.0);
    vec3 rd = normalize(vec3(centered, 1.5));
    
    // Apply slight camera movement
    ro.x += sin(time * 0.3) * 0.2;
    ro.y += cos(time * 0.2) * 0.2;
    
    // Raymarch the tunnel
    vec4 tunnel = raymarch(ro, rd, time);
    
    // Calculate god rays
    vec3 rays = calculateGodRays(ro, rd, time);
    
    // Combine
    vec3 finalColor = tunnel.rgb + rays;
    
    // Apply chromatic aberration at edges
    finalColor = applyChromaticAberration(uv, finalColor, aberration_amount);
    
    // 40Hz flicker for gamma entrainment
    if (enable_flicker) {
        float flicker = sin(time * flicker_frequency * 6.28318) * 0.5 + 0.5;
        flicker = 1.0 - flicker_intensity * flicker;
        finalColor *= flicker;
    }
    
    // Tone mapping (ACES-like)
    finalColor = finalColor / (finalColor + vec3(1.0));
    finalColor = pow(finalColor, vec3(1.0 / 2.2));
    
    ALBEDO = finalColor;
    ALPHA = tunnel.a;
    EMISSION = finalColor * glow_intensity * 0.5;
}
