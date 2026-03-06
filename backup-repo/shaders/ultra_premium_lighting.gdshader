shader_type spatial;
render_mode unshaded, cull_disabled;

// Ultra Premium Lighting Shader
// Advanced PBR lighting with subsurface scattering and anisotropic highlights

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;
uniform sampler2D DEPTH_TEXTURE : hint_depth_texture, filter_linear_mipmap;

// Base material properties
uniform vec4 albedo : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform sampler2D albedo_texture : hint_default_white;
uniform float roughness : hint_range(0.0, 1.0) = 0.5;
uniform float metallic : hint_range(0.0, 1.0) = 0.0;
uniform float specular : hint_range(0.0, 1.0) = 0.5;

// Normal mapping
uniform sampler2D normal_map : hint_normal;
uniform float normal_scale : hint_range(-2.0, 2.0) = 1.0;

// Subsurface scattering
uniform bool enable_sss = false;
uniform float sss_strength : hint_range(0.0, 1.0) = 0.5;
uniform float sss_thickness : hint_range(0.0, 2.0) = 1.0;
uniform vec4 sss_color : source_color = vec4(1.0, 0.3, 0.1, 1.0);

// Anisotropic highlights (for hair/brushed metal)
uniform bool enable_anisotropy = false;
uniform float anisotropy : hint_range(-1.0, 1.0) = 0.0;
uniform sampler2D anisotropy_flow : hint_default_white;

// Iridescence
uniform bool enable_iridescence = false;
uniform float iridescence_scale : hint_range(0.0, 2.0) = 1.0;
uniform float iridescence_ior : hint_range(1.0, 3.0) = 1.3;

// Clear coat (for car paint, etc.)
uniform bool enable_clearcoat = false;
uniform float clearcoat : hint_range(0.0, 1.0) = 0.5;
uniform float clearcoat_roughness : hint_range(0.0, 1.0) = 0.1;

// Ambient occlusion
uniform sampler2D ao_texture : hint_default_white;
uniform float ao_strength : hint_range(0.0, 2.0) = 1.0;

// Emission
uniform vec4 emission : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float emission_energy : hint_range(0.0, 16.0) = 1.0;

// Screen-space reflections
uniform bool enable_ssr = true;
uniform int ssr_steps : hint_range(16, 128) = 64;
uniform float ssr_thickness : hint_range(0.01, 1.0) = 0.1;

// Internal time
uniform float time : hint_range(0.0, 1000.0) = 0.0;

void fragment() {
    // Sample base textures
    vec4 albedo_tex = texture(albedo_texture, UV);
    vec3 base_color = albedo.rgb * albedo_tex.rgb;
    
    // Normal mapping
    vec3 normal = normalize(NORMAL);
    vec3 tangent = normalize(TANGENT);
    vec3 bitangent = normalize(BINORMAL);
    
    vec3 normal_map_sample = texture(normal_map, UV).rgb * 2.0 - 1.0;
    normal_map_sample.xy *= normal_scale;
    normal = normalize(
        tangent * normal_map_sample.x +
        bitangent * normal_map_sample.y +
        normal * normal_map_sample.z
    );
    
    // Ambient occlusion
    float ao = texture(ao_texture, UV).r;
    ao = mix(1.0, ao, ao_strength);
    
    // Set material properties
    ALBEDO = base_color * ao;
    ROUGHNESS = roughness;
    METALLIC = metallic;
    SPECULAR = specular;
    NORMAL = normal;
    
    // Emission
    EMISSION = emission.rgb * emission_energy;
    
    // Subsurface scattering approximation
    if (enable_sss) {
        float sss = sss_strength * (1.0 - dot(normal, VIEW));
        sss = pow(sss, sss_thickness);
        SSS_TRANSMITTANCE = sss_color.rgb * sss;
    }
    
    // Anisotropic tangent
    if (enable_anisotropy) {
        vec2 flow = texture(anisotropy_flow, UV).rg * 2.0 - 1.0;
        ANISOTROPY = anisotropy;
        ANISOTROPY_TANGENT = normalize(tangent * flow.x + bitangent * flow.y);
    }
    
    // Iridescence
    if (enable_iridescence) {
        float NdotV = clamp(dot(normal, VIEW), 0.0, 1.0);
        float irid = sin(NdotV * 10.0 * iridescence_scale) * 0.5 + 0.5;
        EMISSION += vec3(irid * 0.2, irid * 0.3, irid * 0.5) * enable_iridescence ? 1.0 : 0.0;
    }
    
    // Clear coat
    if (enable_clearcoat) {
        CLEARCOAT = clearcoat;
        CLEARCOAT_ROUGHNESS = clearcoat_roughness;
    }
}
