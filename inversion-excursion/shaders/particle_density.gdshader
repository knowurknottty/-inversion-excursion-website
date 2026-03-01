shader_type canvas_item;

// High-density particle system shader
// GPU-intensive atmospheric particles

uniform float particle_count : hint_range(100.0, 10000.0) = 1000.0;
uniform float particle_size : hint_range(0.001, 0.1) = 0.01;
uniform vec3 particle_color : source_color = vec3(1.0, 0.9, 0.6);
uniform float speed : hint_range(0.0, 2.0) = 0.3;
uniform float depth : hint_range(0.5, 5.0) = 2.0;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void fragment() {
    vec2 uv = UV;
    float time = TIME * speed;
    
    float particles = 0.0;
    
    // Multiple layers of particles for depth
    for (float i = 0.0; i < 3.0; i++) {
        float layer_depth = 1.0 + i * 0.5;
        vec2 layer_uv = uv * layer_depth;
        
        // Grid-based particles
        vec2 grid = fract(layer_uv * particle_count / layer_depth);
        vec2 id = floor(layer_uv * particle_count / layer_depth);
        
        float rnd = random(id + i * 10.0);
        float rnd2 = random(id + i * 20.0 + 0.5);
        
        // Animate
        vec2 pos = vec2(rnd, rnd2);
        pos.y += fract(time * (0.1 + rnd * 0.2) + rnd);
        
        // Distance from particle center
        float dist = length(grid - pos);
        float size = particle_size * layer_depth * (0.5 + rnd * 0.5);
        
        // Soft particle
        float particle = smoothstep(size, 0.0, dist);
        particle *= (0.3 + rnd * 0.7); // Vary intensity
        
        particles += particle / layer_depth;
    }
    
    particles = clamp(particles, 0.0, 1.0);
    
    COLOR = vec4(particle_color * particles, particles * 0.8);
}
