"use client";

import { Canvas, advance, useFrame } from "@react-three/fiber";
import { Float, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useExperienceStore } from "./experience-store";

const palettes = {
  home: ["#ff6846", "#b6ff3c", "#78d7ff"],
  projects: ["#9cff00", "#00ddff", "#101cff"],
  honors: ["#ffcc72", "#8c1734", "#f6e8c8"],
  resume: ["#1455ff", "#ff3b30", "#f2f0e9"],
  journal: ["#839b64", "#f3e8ca", "#513b2b"],
  cinema: ["#ff3131", "#f4ebd9", "#2d42ff"],
  gallery: ["#ff3d22", "#d8a054", "#44111b"],
} as const;

function PortalMaterial() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const world = useExperienceStore((state) => state.world);
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const colors = palettes[world];

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = reduceMotion ? 0 : clock.elapsedTime;
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uA: { value: new THREE.Color(colors[0]) },
    uB: { value: new THREE.Color(colors[1]) },
  }), [colors]);

  useEffect(() => {
    if (!material.current) return;
    material.current.uniforms.uA.value.set(colors[0]);
    material.current.uniforms.uB.value.set(colors[1]);
  }, [colors]);

  return (
    <shaderMaterial
      ref={material}
      transparent
      depthWrite={false}
      side={THREE.DoubleSide}
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float uTime;
        void main() {
          vUv = uv;
          vNormal = normal;
          vec3 p = position + normal * sin(position.y * 5.0 + uTime * 1.4) * 0.045;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `}
      fragmentShader={`
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float uTime;
        uniform vec3 uA;
        uniform vec3 uB;
        void main() {
          float rings = sin(length(vUv - 0.5) * 35.0 - uTime * 2.5) * 0.5 + 0.5;
          float edge = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 1.8);
          vec3 color = mix(uA, uB, rings + edge * 0.35);
          gl_FragColor = vec4(color, 0.34 + edge * 0.48);
        }
      `}
    />
  );
}

function HomeWorld({ color, reduceMotion }: { color: string; reduceMotion: boolean }) {
  const nodes = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const angle = (index / 7) * Math.PI * 2;
    return [Math.cos(angle) * 3.2, Math.sin(angle) * 1.7, Math.sin(angle * 2) * 0.65] as [number, number, number];
  }), []);

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.05, 5]} />
        <PortalMaterial />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.2, 0.012, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} />
      </mesh>
      {nodes.map((position, index) => (
        <Float key={index} speed={reduceMotion ? 0 : 1.2 + index * 0.08} rotationIntensity={reduceMotion ? 0 : 0.35} floatIntensity={reduceMotion ? 0 : 0.45}>
          <mesh position={position} rotation={[index * 0.2, index * 0.4, 0]}>
            <torusKnotGeometry args={[0.18 + (index % 2) * 0.05, 0.035, 64, 8]} />
            <meshStandardMaterial color={palettes.home[index % 3]} emissive={palettes.home[index % 3]} emissiveIntensity={1.2} metalness={0.9} roughness={0.18} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function ProjectsWorld() {
  return <group rotation={[-0.35, -0.4, 0]}>{Array.from({ length: 18 }, (_, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    return <mesh key={index} position={[(column - 2.5) * 0.85, (row - 1) * 0.85, Math.sin(index) * 0.65]} rotation={[0.04 * index, 0.08 * index, 0]}>
      <boxGeometry args={[0.66, 0.44, 0.08 + (index % 3) * 0.08]} />
      <meshStandardMaterial color={index % 3 === 0 ? "#9cff00" : "#07191c"} wireframe={index % 3 !== 0} emissive="#00ddff" emissiveIntensity={0.35} />
    </mesh>;
  })}</group>;
}

function HonorsWorld() {
  return <group position={[0, -1.15, -0.5]}>{Array.from({ length: 9 }, (_, index) => {
    const x = (index - 4) * 0.9;
    return <group key={index} position={[x, 0, -Math.abs(index - 4) * 0.36]}>
      <mesh position={[0, 1, 0]}><boxGeometry args={[0.09, 2.3, 0.09]} /><meshStandardMaterial color="#8c1734" metalness={0.85} /></mesh>
      <mesh position={[0, 2.15, 0]}><boxGeometry args={[0.62, 0.8, 0.05]} /><meshStandardMaterial color="#ffcc72" emissive="#8c1734" emissiveIntensity={0.25} /></mesh>
    </group>;
  })}</group>;
}

function ResumeWorld() {
  return <group rotation={[-0.2, 0.4, -0.12]}>{Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[(index - 3) * 0.62, (index % 3 - 1) * 0.5, -Math.abs(index - 3) * 0.16]} rotation={[0, 0, (index - 3) * 0.035]}>
    <planeGeometry args={[0.48, 3.8 - Math.abs(index - 3) * 0.35]} />
    <meshBasicMaterial color={index === 3 ? "#ff3b30" : index % 2 ? "#f2f0e9" : "#1455ff"} transparent opacity={index === 3 ? 0.78 : 0.28} side={THREE.DoubleSide} />
  </mesh>)}</group>;
}

function JournalWorld({ reduceMotion }: { reduceMotion: boolean }) {
  return <group rotation={[0.05, -0.45, -0.12]}>{Array.from({ length: 11 }, (_, index) => <Float key={index} speed={reduceMotion ? 0 : 0.45 + index * 0.02} floatIntensity={reduceMotion ? 0 : 0.22}>
    <mesh position={[(index - 5) * 0.42, Math.sin(index * 1.7) * 0.6, -Math.abs(index - 5) * 0.25]} rotation={[0.1 * Math.sin(index), index * 0.025, index * 0.018]}>
      <planeGeometry args={[1.3, 1.78]} />
      <meshStandardMaterial color={index % 3 === 0 ? "#839b64" : "#f3e8ca"} roughness={0.85} transparent opacity={0.38} side={THREE.DoubleSide} />
    </mesh>
  </Float>)}</group>;
}

function CinemaWorld() {
  return <group position={[0, -0.25, -0.5]}>
    <mesh position={[0, 0.65, -1]}><planeGeometry args={[4.8, 2.45]} /><meshStandardMaterial color="#f4ebd9" emissive="#2d42ff" emissiveIntensity={0.85} /></mesh>
    {Array.from({ length: 14 }, (_, index) => {
      const side = index % 2 ? 1 : -1;
      const depth = Math.floor(index / 2) * 0.58;
      return <mesh key={index} position={[side * (1.25 + depth * 0.16), -1.05, depth * 0.45]} rotation={[0, -side * 0.18, 0]}><boxGeometry args={[0.68, 0.34, 0.75]} /><meshStandardMaterial color={index % 4 === 0 ? "#ff3131" : "#11131b"} roughness={0.55} /></mesh>;
    })}
  </group>;
}

function GalleryWorld() {
  return <group>{Array.from({ length: 26 }, (_, index) => {
    const angle = index * 0.68;
    const radius = 1.2 + index * 0.055;
    return <mesh key={index} position={[Math.cos(angle) * radius, (index - 13) * 0.15, Math.sin(angle) * radius]} rotation={[0, -angle + Math.PI / 2, index * 0.015]}>
      <planeGeometry args={[0.54, index % 3 === 0 ? 0.78 : 0.54]} />
      <meshStandardMaterial color={index % 4 === 0 ? "#ff3d22" : index % 3 === 0 ? "#d8a054" : "#43242a"} emissive="#44111b" emissiveIntensity={0.6} side={THREE.DoubleSide} />
    </mesh>;
  })}</group>;
}

function WorldScene() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const world = useExperienceStore((state) => state.world);
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const transitionTarget = useExperienceStore((state) => state.transitionTarget);
  const color = palettes[world][0];

  useEffect(() => {
    if (reduceMotion) return;
    const onPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [reduceMotion]);

  useFrame(({ camera, clock }, delta) => {
    if (!group.current) return;
    if (reduceMotion) {
      group.current.rotation.set(0, 0, 0);
      camera.position.z = transitionTarget ? 3.75 : 6.7;
      return;
    }
    const speed = Math.min(delta * 2.2, 0.08);
    const targetX = pointer.current.y * 0.1;
    const targetY = pointer.current.x * 0.16 + clock.elapsedTime * 0.018;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, speed);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, speed);
    const transitionZ = transitionTarget ? 3.75 : 6.7;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, transitionZ, Math.min(delta * 3.8, 0.16));
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 4, 5]} intensity={12} color={palettes[world][1]} />
      <pointLight position={[-4, -2, 2]} intensity={8} color={palettes[world][2]} />
      <group ref={group}>
        {world === "home" && <HomeWorld color={color} reduceMotion={reduceMotion} />}
        {world === "projects" && <ProjectsWorld />}
        {world === "honors" && <HonorsWorld />}
        {world === "resume" && <ResumeWorld />}
        {world === "journal" && <JournalWorld reduceMotion={reduceMotion} />}
        {world === "cinema" && <CinemaWorld />}
        {world === "gallery" && <GalleryWorld />}
        <Sparkles count={reduceMotion ? 20 : 90} scale={[9, 6, 5]} size={1.2} speed={reduceMotion ? 0 : 0.24} color={color} opacity={0.48} />
      </group>
    </>
  );
}

export default function CanvasRuntime() {
  const quality = useExperienceStore((state) => state.quality);
  const factor = useExperienceStore((state) => state.qualityFactor);
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const setQualityFactor = useExperienceStore((state) => state.setQualityFactor);
  const dprMax = quality === "cinematic" ? 1.8 : quality === "balanced" ? 1.45 : 1.1 + factor * 0.55;

  useEffect(() => {
    if (reduceMotion) return;

    const renderSpatialScene = (time: number) => {
      if (!document.hidden) advance(time * 1000, true);
    };
    gsap.ticker.add(renderSpatialScene);
    return () => gsap.ticker.remove(renderSpatialScene);
  }, [reduceMotion]);

  return (
    <div className="spatial-canvas" aria-hidden="true">
      <Canvas
        frameloop={reduceMotion ? "demand" : "never"}
        dpr={[1, dprMax]}
        camera={{ position: [0, 0, 6.7], fov: 48, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        fallback={<div className="spatial-poster" />}
      >
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor: next }) => setQualityFactor(next)}
          onFallback={() => setQualityFactor(0.25)}
        />
        <WorldScene />
        {!reduceMotion && quality !== "balanced" && (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.62} mipmapBlur intensity={0.65 + factor * 0.7} />
            <Noise opacity={0.022} />
            <Vignette eskil={false} offset={0.22} darkness={0.72} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
