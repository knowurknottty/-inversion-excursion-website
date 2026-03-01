shader_type canvas_item;

// Inversion Excursion - Psychedelic Spiral Tunnel Shader
// Transports the player from the void into the Source

uniform float progress : hint_range(0.0, 1.0) = 0.0;
uniform float speed : hint_range(0.0, 5.0) = 1.5;
uniform float spiral_arms : hint_range(3.0, 12.0) = 6.0;
uniform float spiral_tightness : hint_range(0.5, 5.0) = 2.0;
uniform vec3 color_primary : source_color = vec3(1.0, 0.85, 0.2); // Ethereal Gold
uniform vec3 color_secondary : source_color = vec3(0.6, 0.2, 0.9); // Spiritual Purple
uniform vec3 color_tertiary : source_color = vec3(1.0, 1.0, 1.0); // Divine White
uniform float intensity : hint_range(0.0, 3.0) = 1.2;
uniform float tunnel_depth : hint_range(1.0, 20.0) = 8.0;
uniform float center_glow : hint_range(0.0, 2.0) = 1.0;
uniform float flash_strength : hint_range(0.0, 5.0) = 3.0;
uniform float noise_scale : hint_range(1.0, 50.0) = 20.0;
uniform float noise_influence : hint_range(0.0, 0.5) = 0.15;

// Simplex noise function for organic wisp effects
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Fractional Brownian Motion for layered noise
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}

void fragment() {
    // Center UV coordinates
    vec2 uv = UV - 0.5;
    
    // Correct aspect ratio
    uv.x *= 1920.0 / 1080.0;
    
    // Calculate polar coordinates
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Progress-based animation
    float time = TIME * speed;
    
    // Phase 1: Formation (0-0.33 progress)
    // Phase 2: Active Tunnel (0.33-0.66 progress)  
    // Phase 3: Acceleration (0.66-1.0 progress)
    
    float formation = smoothstep(0.0, 0.33, progress);
    float active = smoothstep(0.33, 0.66, progress);
    float acceleration = smoothstep(0.66, 1.0, progress);
    
    // Dynamic spiral rotation speed
    float rotation_speed = speed + active * 2.0 + acceleration * 8.0;
    float rotated_angle = angle + time * rotation_speed;
    
    // Create tunnel depth effect
    float depth = 1.0 / (radius + 0.1);
    depth = pow(depth, 1.0 / tunnel_depth);
    
    // Spiral pattern
    float spiral = sin(rotated_angle * spiral_arms + log(radius + 0.1) * spiral_tightness * 10.0 - time * 2.0);
    spiral = spiral * 0.5 + 0.5; // Normalize to 0-1
    
    // Secondary counter-rotating spiral
    float spiral2 = sin(-rotated_angle * (spiral_arms * 0.5) - log(radius + 0.1) * spiral_tightness * 5.0 + time);
    spiral2 = spiral2 * 0.5 + 0.5;
    
    // Organic noise wisps
    vec2 noise_uv = uv * noise_scale + vec2(time * 0.5);
    float noise_val = fbm(noise_uv);
    noise_val = noise_val * 0.5 + 0.5;
    
    // Combine patterns
    float pattern = mix(spiral, spiral2, 0.3);
    pattern = mix(pattern, noise_val, noise_influence);
    
    // Formation phase: fade in from center
    float center_mask = smoothstep(0.5, 0.0, radius * (1.0 - formation * 0.8));
    pattern *= center_mask;
    
    // Color mixing
    vec3 color = mix(color_secondary, color_primary, pattern);
    color = mix(color, color_tertiary, pow(noise_val, 3.0) * 0.5);
    
    // Center glow - the divine source pulling us in
    float glow = 1.0 / (radius * 5.0 + 0.1);
    glow = pow(glow, 2.0);
    glow *= center_glow * (0.5 + acceleration * 0.5);
    color += color_tertiary * glow;
    
    // Add wisps flowing toward center
    float wisp = sin(radius * 20.0 - time * 3.0) * 0.5 + 0.5;
    wisp *= smoothstep(0.5, 0.0, radius);
    color += color_primary * wisp * 0.3 * active;
    
    // Final white flash as we enter the Source
    float flash = pow(acceleration, 3.0) * flash_strength;
    color += vec3(flash);
    
    // Apply intensity and alpha based on formation
    color *= intensity;
    float alpha = formation * (0.8 + pattern * 0.2);
    
    // Vignette
    float vignette = 1.0 - radius * 0.8;
    vignette = clamp(vignette, 0.0, 1.0);
    color *= vignette;
    
    COLOR = vec4(color, alpha);
}
