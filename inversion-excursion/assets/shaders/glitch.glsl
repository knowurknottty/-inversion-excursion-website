// The Glitch Shader
// Visual representation of the System breaking down
// When the code fails, the truth emerges

shader_type canvas_item;

uniform float glitch_intensity : hint_range(0.0, 1.0) = 0.0;
uniform float time_scale : hint_range(0.0, 10.0) = 1.0;

void fragment() {
    vec2 uv = UV;
    
    // The glitch shifts reality
    float shift = sin(TIME * time_scale + uv.y * 10.0) * glitch_intensity * 0.1;
    uv.x += shift;
    
    // Sample the texture with the shifted coordinates
    vec4 color = texture(TEXTURE, uv);
    
    // Add RGB separation (the colors of fractured truth)
    float r = texture(TEXTURE, uv + vec2(shift * 0.5, 0.0)).r;
    float g = texture(TEXTURE, uv).g;
    float b = texture(TEXTURE, uv - vec2(shift * 0.5, 0.0)).b;
    
    COLOR = vec4(r, g, b, color.a);
    
    // The inversion: when glitch is max, we see truth
    if (glitch_intensity > 0.9) {
        COLOR = vec4(1.0 - COLOR.rgb, COLOR.a);
    }
}
