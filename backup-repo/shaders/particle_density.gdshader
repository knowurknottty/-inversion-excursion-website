shader_type spatial;
render_mode blend_add, unshaded, cull_disabled;

// Particle Density Shader
// Volumetric particle rendering with density-based lighting

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;
uniform sampler2D DEPTH_TEXTURE : hint_depth_texture, filter_linear_mipmap;

// Particle properties
uniform vec4 particle_color : source_color = vec4(0.5, 0.7, 1.0, 0.5);
uniform float particle_size : hint_range(0.001, 0.1) = 0.01;
uniform float particle_density : hint_range(0.0, 1000.0) = 100.0;
uniform float particle_speed : hint_range(0.0, 10.0) = 1.0;

// Volumetric properties
uniform float scattering : hint_range(0.0, 2.0) = 0.5;
uniform float absorption : hint_range(0.0, 2.0) = 0.3;
uniform int volume_steps : hint_range(8, 64) = 32;
uniform float volume_depth : hint_range(1.0, 50.0) = 10.0;

// Noise for particle distribution
uniform float noise_scale : hint_range(1.0, 50.0) = 10.0;
uniform float noise_speed : hint_range(0.0, 2.0) = 0.1;

// Lighting
uniform vec3 light_direction = vec3(0.5, 1.0, 0.3);
uniform float light_intensity : hint_range(0.0, 5.0) = 1.0;
uniform vec4 light_color : source_color = vec4(1.0, 0.95, 0.8, 1.0);

// Wind/turbulence
uniform vec3 wind_direction = vec3(1.0, 0.0, 0.0);
uniform float wind_strength : hint_range(0.0, 5.0) = 1.0;
uniform float turbulence : hint_range(0.0, 2.0) = 0.5;

// Internal time
uniform float time : hint_range(0.0, 1000.0) = 0.0;

// Hash function
float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

// 3D noise
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + 113.0 * i.z;
    return mix(
        mix(mix(hash(vec3(n, 0.0, 0.0)), hash(vec3(n + 1.0, 0.0, 0.0)), f.x),
            mix(hash(vec3(n + 57.0, 0.0, 0.0)), hash(vec3(n + 58.0, 0.0, 0.0)), f.x), f.y),
        mix(mix(hash(vec3(n + 113.0, 0.0, 0.0)), hash(vec3(n + 114.0, 0.0, 0.0)), f.x),
            mix(hash(vec3(n + 170.0, 0.0, 0.0)), hash(vec3(n + 171.0, 0.0, 0.0)), f.x), f.y), f.z
    );
}

// Fractal Brownian Motion
float fbm(vec3 p) {
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

// Particle density at position
float getParticleDensity(vec3 pos) {
    // Animated noise
    vec3 animatedPos = pos + wind_direction * time * wind_strength;
    animatedPos += vec3(
        sin(time * noise_speed + pos.z * 0.5) * turbulence,
        cos(time * noise_speed * 0.7 + pos.x * 0.5) * turbulence,
        sin(time * noise_speed * 0.5 + pos.y * 0.5) * turbulence
    );
    
    float n = fbm(animatedPos * noise_scale);
    
    // Density threshold
    float density = smoothstep(0.3, 0.7, n) * particle_density;
    
    return density;
}

// Raymarch through volume
vec4 raymarchVolume(vec3 ro, vec3 rd, float maxDist) {
    vec3 accum = vec3(0.0);
    float transmittance = 1.0;
    
    float stepSize = maxDist / float(volume_steps);
    
    for (int i = 0; i < volume_steps; i++) {
        float t = float(i) * stepSize;
        vec3 pos = ro + rd * t;
        
        float density = getParticleDensity(pos);
        
        if (density > 0.01) {
            // Light scattering
            float lightTransmittance = exp(-density * absorption * stepSize);
            
            // In-scattering (simplified)
            vec3 lightDir = normalize(light_direction);
            float NdotL = max(0.0, dot(-rd, lightDir));
            vec3 inScatter = light_color.rgb * light_intensity * NdotL * scattering;
            
            // Accumulate
            accum += inScatter * density * transmittance * stepSize;
            transmittance *= lightTransmittance;
            
            if (transmittance < 0.01) break;
        }
    }
    
    return vec4(accum * particle_color.rgb, 1.0 - transmittance);
}

void fragment() {
    // View ray
    vec3 ro = CAMERA_POSITION_WORLD;
    vec3 rd = normalize(VERTEX - ro);
    
    // Get scene depth
    float sceneDepth = texture(DEPTH_TEXTURE, SCREEN_UV).r;
    sceneDepth = PROJECTION_MATRIX[3][2] / (sceneDepth + PROJECTION_MATRIX[2][2]);
    sceneDepth = -sceneDepth;
    
    // Raymarch volume
    float maxDist = min(volume_depth, sceneDepth);
    vec4 volume = raymarchVolume(ro, rd, maxDist);
    
    // Apply particle color
    ALBEDO = volume.rgb;
    ALPHA = volume.a * particle_color.a;
    
    // Add glow
    EMISSION = volume.rgb * 0.5;
}
