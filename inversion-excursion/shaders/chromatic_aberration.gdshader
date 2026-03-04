shader_type canvas_item;

// Chromatic Aberration Shader
// Adds subtle "modded SNES" color separation effect

uniform float strength : hint_range(0.0, 10.0) = 2.0;
uniform float radius : hint_range(0.0, 2.0) = 1.0;
uniform bool only_edge = true;

void fragment() {
    vec2 uv = UV;
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    
    // Calculate aberration offset
    vec2 offset = normalize(delta) * strength * 0.01;
    
    // Edge detection
    float edge_factor = 1.0;
    if (only_edge) {
        edge_factor = smoothstep(0.0, radius, dist);
    }
    
    // Sample RGB channels with offset
    float r = texture(TEXTURE, uv + offset * edge_factor).r;
    float g = texture(TEXTURE, uv).g;
    float b = texture(TEXTURE, uv - offset * edge_factor).b;
    
    COLOR = vec4(r, g, b, 1.0);
}
