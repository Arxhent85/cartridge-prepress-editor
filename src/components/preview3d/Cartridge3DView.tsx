import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Maximize2, Sparkles, RefreshCcw } from 'lucide-react';
import { CartridgeConfig } from '../../types';

interface Cartridge3DViewProps {
  layoutCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cartridge: CartridgeConfig;
  updateTrigger: number;
}

export const Cartridge3DView: React.FC<Cartridge3DViewProps> = ({
  layoutCanvasRef,
  cartridge,
  updateTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const cartridgeMeshRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [isHDPEPlastic, setIsHDPEPlastic] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 260;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16171a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 160);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(50, 80, 80);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffa066, 0.6); // slight warm rim
    dirLight2.position.set(-60, -40, -50);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 150);
    pointLight.position.set(0, 20, 60);
    scene.add(pointLight);

    // Cartridge Group
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // 1. Cartridge Body (Cylinder)
    // Scale: radius = diameter / 2 = ~23.5, height = 100
    const bodyRadius = 23.5;
    const bodyHeight = 95.0;
    const bodyGeometry = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 64, 1, true);

    // Initial placeholder texture
    const dummyCanvas = document.createElement('canvas');
    dummyCanvas.width = 512;
    dummyCanvas.height = 1024;
    const dCtx = dummyCanvas.getContext('2d');
    if (dCtx) {
      dCtx.fillStyle = '#f0f2f5';
      dCtx.fillRect(0, 0, 512, 1024);
      dCtx.fillStyle = '#ff6600';
      dCtx.fillRect(20, 50, 472, 80);
      dCtx.fillStyle = '#141414';
      dCtx.font = 'bold 36px sans-serif';
      dCtx.fillText('M ONE SANITÄR 310ml', 40, 105);
    }

    const texture = new THREE.CanvasTexture(dummyCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    textureRef.current = texture;

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      reflectivity: 0.6,
      side: THREE.DoubleSide,
    });

    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.y = 0;
    cartridgeMeshRef.current = bodyMesh;
    group.add(bodyMesh);

    // 2. Cartridge Top Shoulder / Neck
    const shoulderGeometry = new THREE.CylinderGeometry(8, bodyRadius, 8, 48);
    const plasticMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.35,
      metalness: 0.05,
    });
    const shoulderMesh = new THREE.Mesh(shoulderGeometry, plasticMaterial);
    shoulderMesh.position.y = bodyHeight / 2 + 4;
    group.add(shoulderMesh);

    // 3. Threaded Neck
    const neckGeometry = new THREE.CylinderGeometry(7.5, 7.5, 10, 36);
    const neckMesh = new THREE.Mesh(neckGeometry, plasticMaterial);
    neckMesh.position.y = bodyHeight / 2 + 13;
    group.add(neckMesh);

    // Thread rings on neck
    for (let r = 0; r < 3; r++) {
      const ringGeom = new THREE.TorusGeometry(8.0, 0.7, 12, 36);
      const ringMesh = new THREE.Mesh(ringGeom, plasticMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = bodyHeight / 2 + 10 + r * 3;
      group.add(ringMesh);
    }

    // 4. Cartridge Conical Nozzle / Tip (Düse)
    const nozzleGeometry = new THREE.ConeGeometry(7, 34, 36, 1, true);
    const nozzleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5f7fa,
      roughness: 0.2,
      transmission: 0.35, // slightly translucent PE
      thickness: 1.2,
      transparent: true,
      opacity: 0.92,
    });
    const nozzleMesh = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    nozzleMesh.position.y = bodyHeight / 2 + 35;
    group.add(nozzleMesh);

    // 5. Bottom Plunger / Kolben
    const pistonGeometry = new THREE.CylinderGeometry(bodyRadius - 0.5, bodyRadius - 0.5, 6, 48);
    const pistonMaterial = new THREE.MeshStandardMaterial({
      color: 0x22242a,
      roughness: 0.6,
    });
    const pistonMesh = new THREE.Mesh(pistonGeometry, pistonMaterial);
    pistonMesh.position.y = -bodyHeight / 2 + 3;
    group.add(pistonMesh);

    // Position entire group nicely
    group.rotation.x = 0.08;
    group.rotation.y = -Math.PI / 3;

    // Mouse drag rotation handling
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !groupRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      groupRef.current.rotation.y += deltaX * 0.012;
      groupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, groupRef.current.rotation.x + deltaY * 0.008));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (groupRef.current && autoRotate && !isDragging) {
        groupRef.current.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 260;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
    };
  }, []);

  // Update 3D texture dynamically whenever layout canvas changes
  useEffect(() => {
    if (!layoutCanvasRef.current || !textureRef.current) return;

    try {
      const sourceCanvas = layoutCanvasRef.current;
      if (sourceCanvas.width > 0 && sourceCanvas.height > 0) {
        // Create an aspect-matched texture canvas
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 1024;
        texCanvas.height = 1024;
        const tCtx = texCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = '#ffffff';
          tCtx.fillRect(0, 0, 1024, 1024);

          // Invert horizontal orientation for cylinder wrap
          tCtx.save();
          tCtx.translate(1024, 0);
          tCtx.scale(-1, 1);
          tCtx.drawImage(sourceCanvas, 0, 0, 1024, 1024);
          tCtx.restore();

          textureRef.current.image = texCanvas;
          textureRef.current.needsUpdate = true;
        }
      }
    } catch (e) {
      console.warn('3D Texture sync note:', e);
    }
  }, [updateTrigger, layoutCanvasRef]);

  const resetRotation = () => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0.08, -Math.PI / 3, 0);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#141518] rounded-lg border border-[#2a2d34] overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1b1c20] border-b border-[#2a2d34] text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>3D-KARTUSCHENVORSCHAU</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1 rounded text-zinc-400 hover:text-white transition ${
              autoRotate ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-[#26282e]'
            }`}
            title="Auto-Rotation umschalten"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetRotation}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#26282e] transition"
            title="Ansicht zurücksetzen"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Viewport Canvas Container */}
      <div
        ref={mountRef}
        className="w-full flex-1 cursor-grab active:cursor-grabbing min-h-[220px]"
        title="Mit Maus drehen und zoomen"
      />

      {/* Bottom Information Pill */}
      <div className="px-3 py-1.5 bg-[#18191c]/90 border-t border-[#26282e] flex items-center justify-between text-[11px] text-zinc-400">
        <span className="truncate">Modell: {cartridge.name}</span>
        <span className="text-orange-400 font-mono font-medium">{cartridge.volume}</span>
      </div>
    </div>
  );
};
