import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import './TorusFieldMobile.css';

interface TorusFieldMobileProps {
  className?: string;
  chapterId?: number;
  breathing?: boolean;
}

export function TorusFieldMobile({ 
  className = '', 
  chapterId = 1, 
  breathing = true 
}: TorusFieldMobileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Reduced color palettes for mobile (less complex)
  const colorPalettes = useMemo(() => ({
    1: { primary: 0xD4AF37, secondary: 0x6B4E71 },
    2: { primary: 0xC0C0C0, secondary: 0x4A5568 },
    3: { primary: 0x4A5568, secondary: 0x1A202C },
    4: { primary: 0x2B6CB0, secondary: 0x1A365D },
    5: { primary: 0xF6E05E, secondary: 0xD69E2E },
    6: { primary: 0x48BB78, secondary: 0x2F855A },
    7: { primary: 0x9F7AEA, secondary: 0x6B46C1 },
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer - mobile optimized
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Disabled for mobile performance
      alpha: true,
      powerPreference: 'low-power', // Battery conscious
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Colors based on chapter
    const colors = colorPalettes[chapterId as keyof typeof colorPalettes] || colorPalettes[1];

    // Single simplified torus for mobile
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.3, 80, 12, 2, 3); // Reduced segments
    const material = new THREE.MeshBasicMaterial({
      color: colors.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // Reduced particle count for mobile
    const particleCount = 80;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 2 + Math.random() * 2;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: colors.secondary,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation loop - optimized
    let lastTime = 0;
    const targetFPS = 30; // Limit FPS for battery
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Throttle rendering
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);
      
      timeRef.current += 0.016;

      // Breathing animation
      const breathScale = breathing 
        ? 1 + Math.sin(timeRef.current * 0.3) * 0.03 
        : 1;

      // Slower rotation for mobile
      torus.rotation.x = timeRef.current * 0.05;
      torus.rotation.y = timeRef.current * 0.08;
      torus.scale.setScalar(breathScale);

      // Static particles for performance (no updates)
      particles.rotation.y = timeRef.current * 0.02;

      renderer.render(scene, camera);
    };

    animate(0);

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
      
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [chapterId, colorPalettes, breathing]);

  return (
    <div 
      ref={containerRef} 
      className={`torus-field-mobile ${className}`}
      aria-hidden="true"
    />
  );
}
