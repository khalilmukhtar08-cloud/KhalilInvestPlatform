import React, { useRef, useState, useEffect, Suspense, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("3D Background Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function AuraSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#3b82f6"
        attach="material"
        distort={0.5}
        speed={2}
        roughness={0}
      />
    </Sphere>
  );
}

const StaticFallback = () => (
  <div className="fixed inset-0 -z-10 bg-indigo-950">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-blue-900 opacity-80" />
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
  </div>
);

const SafeCanvas = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 5], fov: 75 }}
      onCreated={({ gl }) => {
        if (gl) {
          gl.setClearColor(new THREE.Color('#000000'), 0);
        }
      }}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
};

export function AuraBackground() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGL(!!gl);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return <StaticFallback />;
  }

  if (hasWebGL === null) {
    return <div className="fixed inset-0 -z-10 bg-indigo-950" />;
  }

  return (
    <div className="fixed inset-0 -z-10 bg-background overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 opacity-50" />
      <ErrorBoundary fallback={<StaticFallback />}>
        <SafeCanvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AuraSphere />
        </SafeCanvas>
      </ErrorBoundary>
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
}
