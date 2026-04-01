import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface FlowerOfLifeProps {
  className?: string;
  chapterId?: number;
  intensity?: number;
  isActive?: boolean;
}

export function FlowerOfLife({ 
  className = '', 
  chapterId = 1,
  intensity = 0.5,
  isActive = true
}: FlowerOfLifeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);
  const frameRef = useRef<number>(0);

  const colors = useMemo(() => {
    const palettes: Record<number, { core: number; petals: number; glow: number }> = {
      1: { core: 0xFFD700, petals: 0xB8860B, glow: 0xFFA500 },
      2: { core: 0xC0C0C0, petals: 0x808080, glow: 0xE8E8E8 },
      3: { core: 0x4A5568, petals: 0x2D3748, glow: 0x718096 },
      4: { core: 0x4299E1, petals: 0x2B6CB0, glow: 0x63B3ED },
      5: { core: 0xF6E05E, petals: 0xD69E2E, glow: 0xFAF089 },
      6: { core: 0x48BB78, petals: 0x2F855A, glow: 0x68D391 },
      7: { core: 0x9F7AEA, petals: 0x6B46C1, glow: 0xB794F4 },
    };
    return palettes[chapterId] || palettes[1];
  }, [chapterId]);

  useEffect(() => {
    if (!containerRef.current || !isActive) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create Flower of Life
    const flowerGroup = new THREE.Group();
    groupRef.current = flowerGroup;
    scene.add(flowerGroup);

    // Create the seed of life (center + 6 surrounding)
    const radius = 0.6;
    const tubeRadius = 0.02;
    
    // Material for the circles
    const createMaterial = (color: number, opacity: number) => 
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        wireframe: true,
        blending: THREE.AdditiveBlending
      });

    const coreMaterial = createMaterial(colors.core, 0.6);
    const petalMaterial = createMaterial(colors.petals, 0.4);
    const glowMaterial = createMaterial(colors.glow, 0.2);

    // Central circle
    const centerGeometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
    const centerCircle = new THREE.Mesh(centerGeometry, coreMaterial);
    flowerGroup.add(centerCircle);

    // First ring - 6 circles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const circle = new THREE.Mesh(centerGeometry, petalMaterial.clone());
      circle.position.set(x, y, 0);
      flowerGroup.add(circle);
    }

    // Second ring - 12 circles (for fuller flower of life)
    const outerRadius = radius * 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * outerRadius;
      const y = Math.sin(angle) * outerRadius;
      
      const circle = new THREE.Mesh(centerGeometry, glowMaterial.clone());
      circle.position.set(x, y, 0);
      circle.scale.setScalar(0.8);
      flowerGroup.add(circle);
    }

    // Add sacred center point
    const pointGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({
      color: colors.core,
      transparent: true,
      opacity: 0.8
    });
    const centerPoint = new THREE.Mesh(pointGeometry, pointMaterial);
    centerPoint.position.z = 0.1;
    flowerGroup.add(centerPoint);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01 * intensity;

      // Rotate entire flower
      flowerGroup.rotation.z = timeRef.current * 0.05;
      flowerGroup.rotation.x = Math.sin(timeRef.current * 0.2) * 0.1;
      flowerGroup.rotation.y = Math.cos(timeRef.current * 0.15) * 0.1;

      // Pulse effect
      const scale = 1 + Math.sin(timeRef.current * 0.5) * 0.03;
      flowerGroup.scale.setScalar(scale);

      // Opacity breathing
      flowerGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          const baseOpacity = i === 0 ? 0.6 : i < 7 ? 0.4 : 0.2;
          child.material.opacity = baseOpacity + Math.sin(timeRef.current * 0.3 + i * 0.5) * 0.1;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
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
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [colors, intensity, isActive]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef} 
      className={`flower-of-life ${className}`}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
}
