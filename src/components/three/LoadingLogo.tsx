"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { useTheme } from "next-themes";

export default function LoadingLogo() {
  const { theme } = useTheme();
  const [colors, setColors] = useState({
    accent: "#4dd8ff",
    bg: "#0a0a0f",
  });

  const groupRef = useRef<THREE.Group>(null);
  const lVerticalRef = useRef<THREE.Mesh>(null);
  const lHorizontalRef = useRef<THREE.Mesh>(null);
  const dVerticalRef = useRef<THREE.Mesh>(null);
  const dTopRef = useRef<THREE.Mesh>(null);
  const dRightRef = useRef<THREE.Mesh>(null);
  const dBottomRef = useRef<THREE.Mesh>(null);

  // Extract CSS variable values dynamically on the client side
  useEffect(() => {
    const getCssValue = (variable: string, fallback: string) => {
      if (typeof window === "undefined") return fallback;
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(variable)
          .trim() || fallback
      );
    };

    setColors({
      accent: getCssValue("--color-accent", "#4dd8ff"),
      bg: getCssValue("--color-bg", "#0a0a0f"),
    });
  }, [theme]);

  // Staggered reveal animation on mount
  useEffect(() => {
    const meshes = [
      lVerticalRef.current,
      lHorizontalRef.current,
      dVerticalRef.current,
      dTopRef.current,
      dRightRef.current,
      dBottomRef.current,
    ].filter((m): m is THREE.Mesh => m !== null);

    if (meshes.length > 0) {
      // Set initial scale to 0
      meshes.forEach((mesh) => {
        mesh.scale.set(0, 0, 0);
      });

      // Animate scale in with a stagger
      gsap.to(
        meshes.map((m) => m.scale),
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.5)",
        }
      );
    }
  }, []);

  // Continuous slow rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* TODO: A custom SVG monogram or detailed 3D model (.gltf / .obj) can be swapped in here */}
      
      {/* Monogram "L" */}
      <group position={[-0.8, 0, 0]}>
        {/* L Vertical Bar */}
        <mesh ref={lVerticalRef} position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 1.8, 0.3]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* L Horizontal Bar */}
        <mesh ref={lHorizontalRef} position={[0.45, -0.75, 0]}>
          <boxGeometry args={[0.6, 0.3, 0.3]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Monogram "D" */}
      <group position={[0.6, 0, 0]}>
        {/* D Vertical Bar */}
        <mesh ref={dVerticalRef} position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 1.8, 0.3]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* D Top Bar */}
        <mesh ref={dTopRef} position={[0.4, 0.75, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* D Right Bar */}
        <mesh ref={dRightRef} position={[0.65, 0, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {/* D Bottom Bar */}
        <mesh ref={dBottomRef} position={[0.4, -0.75, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}
