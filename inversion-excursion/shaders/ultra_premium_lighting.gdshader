shader_type canvas_item;

// Ultra Premium Lighting - Normal-mapped 2D with dynamic lighting
// Simulates PS5-level lighting on pixel art

uniform sampler2D normal_map : hint_normal;
uniform vec3 light_position : source_color = vec3(0.5, 0.5, 1.0);
uniform vec3 light_color : source_color = vec3(1.0, 0.95, 0.8);
uniform float light_intensity : hint_range(0.0, 5.0) = 1.5;
uniform float ambient_light : hint_range(0.0, 1.0) = 0.3;
uniform float specular_power : hint_range(1.0, 128.0) = 32.0;
uniform float specular_intensity : hint_range(0.0, 2.0) = 0.5;

void fragment() {
    vec4 tex_color = texture(TEXTURE, UV);
    vec3 normal = texture(normal_map, UV).rgb * 2.0 - 1.0;
    
    // Light direction
    vec3 light_dir = normalize(light_position - vec3(UV, 0.0));
    vec3 view_dir = vec3(0.0, 0.0, 1.0);
    
    // Diffuse lighting
    float diff = max(dot(normal, light_dir), 0.0);
    vec3 diffuse = diff * light_color * light_intensity;
    
    // Specular lighting (Blinn-Phong)
    vec3 half_dir = normalize(light_dir + view_dir);
    float spec = pow(max(dot(normal, half_dir), 0.0), specular_power);
    vec3 specular = spec * light_color * specular_intensity;
    
    // Ambient
    vec3 ambient = vec3(ambient_light);
    
    // Combine
    vec3 lighting = ambient + diffuse + specular;
    COLOR = vec4(tex_color.rgb * lighting, tex_color.a);
}
