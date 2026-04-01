import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface MetatronCubeProps {
  className?: string;
  chapterId?: number;
  isRevealed?: boolean;
}

export function MetatronCube({ 
  className = '', 
  chapterId = 5,
  isRevealed = true
}: MetatronCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const frameRef = useRef<number>(0);

  const colors = useMemo(() => {
    const palettes: Record<number, { lines: number; nodes: number; glow: number }> = {
      5: { lines: 0xF6E05E, nodes: 0xD69E2E, glow: 0xFAF089 }, // Revelation
    };
    return palettes[chapterId] || palettes[5];
  }, [chapterId]);

  useEffect(() => {
    if (!containerRef.current || !isRevealed) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Metatron's Cube consists of 13 circles (4 connected circles in x/y axis)
    // We'll create simplified wireframe representation
    const radius = 2.5;
    const nodePositions: THREE.Vector3[] = [];

    // Central node
    nodePositions.push(new THREE.Vector3(0, 0, 0));

    // 6 nodes around center (hexagon)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      nodePositions.push(new THREE.Vector3(
        Math.cos(angle) * radius * 0.5,
        Math.sin(angle) * radius * 0.5,
        0
      ));
    }

    // Outer 6 nodes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      nodePositions.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }

    // Create node spheres
    const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: colors.nodes,
      transparent: true,
      opacity: 0.8
    });

    nodePositions.forEach((pos) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      node.position.copy(pos);
      group.add(node);
    });

    // Create connecting lines (edges of Metatron's cube)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: colors.lines,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    // Connect all nodes to center
    const center = nodePositions[0];
    for (let i = 1; i < nodePositions.length; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([center, nodePositions[i]]);
      const line = new THREE.Line(geometry, lineMaterial.clone());
      group.add(line);
    }

    // Connect inner ring
    for (let i = 1; i <= 6; i++) {
      const next = i === 6 ? 1 : i + 1;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        nodePositions[i], nodePositions[next]
      ]);
      const line = new THREE.Line(geometry, lineMaterial.clone());
      group.add(line);
    }

    // Connect outer ring
    for (let i = 7; i < nodePositions.length; i++) {
      const next = i === nodePositions.length - 1 ? 7 : i + 1;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        nodePositions[i], nodePositions[next]
      ]);
      const line = new THREE.Line(geometry, lineMaterial.clone());
      group.add(line);
    }

    // Connect inner to outer
    for (let i = 1; i <= 6; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        nodePositions[i], nodePositions[i + 6]
      ]);
      const line = new THREE.Line(geometry, lineMaterial.clone());
      group.add(line);
    }

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.01;

      // Slow rotation
      group.rotation.z = timeRef.current * 0.02;
      group.rotation.x = Math.sin(timeRef.current * 0.1) * 0.15;
      group.rotation.y = Math.cos(timeRef.current * 0.08) * 0.15;

      // Pulse nodes
      group.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const scale = 1 + Math.sin(timeRef.current * 0.5 + i * 0.3) * 0.2;
          child.scale.setScalar(scale);
        } else if (child instanceof THREE.Line) {
          const material = child.material as THREE.LineBasicMaterial;
          material.opacity = 0.2 + Math.sin(timeRef.current * 0.3 + i * 0.1) * 0.1;
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
  }, [colors, isRevealed]);

  if (!isRevealed) return null;

  return (
    <div 
      ref={containerRef} 
      className={`metatron-cube ${className}`}
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
