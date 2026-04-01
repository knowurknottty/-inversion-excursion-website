import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface TorusFieldProps {
  className?: string;
  chapterId?: number;
  scrollProgress?: number;
  breathing?: boolean;
}

export function TorusField({ 
  className = '', 
  chapterId = 1, 
  scrollProgress = 0,
  breathing = true 
}: TorusFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const torusRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Chapter-specific color palettes
  const colorPalettes = useMemo(() => ({
    1: { primary: 0xD4AF37, secondary: 0x6B4E71, accent: 0x2D1B4E }, // Inversion - gold/purple
    2: { primary: 0xC0C0C0, secondary: 0x4A5568, accent: 0x1A202C }, // Mirror - silver/gray
    3: { primary: 0x4A5568, secondary: 0x1A202C, accent: 0x000000 }, // Threshold - dark/void
    4: { primary: 0x2B6CB0, secondary: 0x1A365D, accent: 0x63B3ED }, // Labyrinth - blue
    5: { primary: 0xF6E05E, secondary: 0xD69E2E, accent: 0xFFFFF0 }, // Revelation - golden light
    6: { primary: 0x48BB78, secondary: 0x2F855A, accent: 0x9AE6B4 }, // Integration - green
    7: { primary: 0x9F7AEA, secondary: 0x6B46C1, accent: 0xE9D8FD }, // Return - violet
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create torus knot group
    const torusGroup = new THREE.Group();
    torusRef.current = torusGroup;
    scene.add(torusGroup);

    // Colors based on chapter
    const colors = colorPalettes[chapterId as keyof typeof colorPalettes] || colorPalettes[1];

    // Outer torus - wireframe
    const outerGeometry = new THREE.TorusKnotGeometry(1.2, 0.3, 150, 20, 2, 3);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: colors.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const outerTorus = new THREE.Mesh(outerGeometry, outerMaterial);
    torusGroup.add(outerTorus);

    // Inner torus - glowing core
    const innerGeometry = new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16, 3, 2);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: colors.accent,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const innerTorus = new THREE.Mesh(innerGeometry, innerMaterial);
    innerTorus.rotation.x = Math.PI / 4;
    torusGroup.add(innerTorus);

    // Particle field representing energy flow
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 2;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      velocities.push(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: colors.secondary,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    torusGroup.add(particles);

    // Lighting (for any mesh materials that might use it)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      // Breathing animation
      const breathScale = breathing 
        ? 1 + Math.sin(timeRef.current * 0.5) * 0.05 
        : 1;
      
      // Scroll-based rotation
      const scrollRotation = (scrollProgress / 100) * Math.PI * 2;

      // Animate outer torus
      outerTorus.rotation.x = timeRef.current * 0.1 + scrollRotation * 0.3;
      outerTorus.rotation.y = timeRef.current * 0.15;
      outerTorus.scale.setScalar(breathScale);

      // Animate inner torus - counter rotation
      innerTorus.rotation.x = -timeRef.current * 0.2 + scrollRotation * 0.2;
      innerTorus.rotation.z = timeRef.current * 0.1;
      innerTorus.scale.setScalar(1 + Math.sin(timeRef.current * 0.7) * 0.03);

      // Animate particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i3] * breathScale;
        positions[i3 + 1] += velocities[i3 + 1] * breathScale;
        positions[i3 + 2] += velocities[i3 + 2] * breathScale;

        // Keep particles in bounds
        const dist = Math.sqrt(
          positions[i3] ** 2 + 
          positions[i3 + 1] ** 2 + 
          positions[i3 + 2] ** 2
        );
        if (dist > 5) {
          const scale = 2 / dist;
          positions[i3] *= scale;
          positions[i3 + 1] *= scale;
          positions[i3 + 2] *= scale;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = timeRef.current * 0.05;

      // Gentle camera movement
      camera.position.x = Math.sin(timeRef.current * 0.1) * 0.2;
      camera.position.y = Math.cos(timeRef.current * 0.08) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      
      // Cleanup
      outerGeometry.dispose();
      outerMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [chapterId, colorPalettes, breathing, scrollProgress]);

  return (
    <div 
      ref={containerRef} 
      className={`sacred-geometry ${className}`}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
