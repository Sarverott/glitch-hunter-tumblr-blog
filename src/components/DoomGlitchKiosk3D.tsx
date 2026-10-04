/**
 * DoomGlitchKiosk3D.tsx
 * High quality Three.js retro low-poly DOOM-styled glitching public kiosk scene
 * Features:
 * - Low-poly CRT terminal cabinet with 90s flat-shaded geometry
 * - Modular glitch screens extending BaseKioskScreen (McDonald's Win10, Kernel Panic, BSOD, TeamViewer, BIOS)
 * - Dynamic custom data injection (custom venue, error message, remote payload)
 * - Interactive CRT controls (reboot sequence, hard jitter trigger, camera reset)
 * - Software-renderer retro vertex jitter & displacement glitch shaders
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  RefreshCw,
  Monitor,
  Zap,
  Terminal,
  Power,
  Sliders,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  REGISTERED_KIOSK_SCREENS,
  BaseKioskScreen,
  KioskCustomData,
} from './kiosk-modes';

export interface DoomGlitchKioskProps {
  currentGlitchMode?: string;
  initialCustomData?: KioskCustomData;
  onGlitchStateChange?: (stateName: string) => void;
}

export const GLITCH_MODES = REGISTERED_KIOSK_SCREENS.map((screen) => ({
  id: screen.id,
  name: screen.name,
  color: screen.color,
  text: screen.defaultSummary,
  category: screen.osCategory,
}));

export const DoomGlitchKiosk3D: React.FC<DoomGlitchKioskProps> = ({
  initialCustomData,
  onGlitchStateChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeGlitchIndex, setActiveGlitchIndex] = useState(0);
  const [isGlitchingHard, setIsGlitchingHard] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [fps, setFps] = useState(60);

  // User customizable data rendered in real-time on the 3D CRT monitor
  const [customData, setCustomData] = useState<KioskCustomData>({
    venueName: "McDonald's Drive-Thru #4412",
    customMessage: 'Fatal: Order display viewport lost focus. Exited to Windows Desktop.',
    osDetected: 'Windows 10 Pro / IoT',
    userPayload: '492 881 024',
    incidentRef: 'GH-8821',
    ...initialCustomData,
  });

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const glitchIntensityRef = useRef(1.0);
  const kioskGroupRef = useRef<THREE.Group | null>(null);

  // Active screen object from modular registry
  const currentScreen = useMemo(
    () => REGISTERED_KIOSK_SCREENS[activeGlitchIndex] || REGISTERED_KIOSK_SCREENS[0],
    [activeGlitchIndex]
  );

  // Update dynamic CRT Canvas Texture via modular screen object
  const drawScreenContent = (
    modeIndex: number,
    hardGlitch: boolean,
    powered: boolean = true,
    data: KioskCustomData = customData
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    if (!powered) {
      // Powered off CRT screen (black with faint phosphor dot)
      ctx.fillStyle = '#020302';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(0, 255, 102, 0.4)';
      ctx.fillRect(w / 2 - 2, h / 2 - 2, 4, 4);
      if (textureRef.current) textureRef.current.needsUpdate = true;
      return;
    }

    const screenInstance = REGISTERED_KIOSK_SCREENS[modeIndex] || REGISTERED_KIOSK_SCREENS[0];
    screenInstance.render(ctx, w, h, hardGlitch, data);

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  };

  // Re-draw when customData or mode changes
  useEffect(() => {
    drawScreenContent(activeGlitchIndex, isGlitchingHard, isPoweredOn, customData);
  }, [customData, activeGlitchIndex, isPoweredOn]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Create 2D offscreen canvas for CRT screen content
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 512;
    offCanvas.height = 384;
    canvasRef.current = offCanvas;

    const screenTexture = new THREE.CanvasTexture(offCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.NearestFilter;
    textureRef.current = screenTexture;

    drawScreenContent(activeGlitchIndex, false, true, customData);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050806);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting (DOOM-style industrial moody lighting)
    const ambientLight = new THREE.AmbientLight(0x1a3320, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff66, 2.5, 12);
    pointLight.position.set(2, 3, 3);
    scene.add(pointLight);

    const redAlertLight = new THREE.PointLight(0xff0044, 1.2, 8);
    redAlertLight.position.set(-2, 1, 2);
    scene.add(redAlertLight);

    // -------------------------------------------------------------
    // LOW POLY 3D KIOSK / CRT DOOM MONITOR MESHES
    // -------------------------------------------------------------
    const kioskGroup = new THREE.Group();
    scene.add(kioskGroup);
    kioskGroupRef.current = kioskGroup;

    // 1. Kiosk Heavy Steel Pedestal / Body (Low-poly chamfered)
    const bodyGeo = new THREE.BoxGeometry(1.6, 2.2, 1.1, 2, 2, 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x181c19,
      roughness: 0.85,
      metalness: 0.3,
      flatShading: true,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = -0.5;
    kioskGroup.add(bodyMesh);

    // Kiosk ventilation grill slats (DOOM retro industrial look)
    const ventMat = new THREE.MeshBasicMaterial({ color: 0x050705 });
    for (let i = 0; i < 4; i++) {
      const ventGeo = new THREE.BoxGeometry(1.2, 0.05, 0.05);
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.position.set(0, -0.2 - i * 0.15, 0.56);
      kioskGroup.add(vent);
    }

    // 2. Heavy CRT Monitor Housing (Slanted retro industrial enclosure)
    const monitorGeo = new THREE.BoxGeometry(2.0, 1.5, 1.4, 2, 2, 2);
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x222823,
      roughness: 0.7,
      metalness: 0.4,
      flatShading: true,
    });
    const monitorMesh = new THREE.Mesh(monitorGeo, monitorMat);
    monitorMesh.position.set(0, 1.0, 0);
    monitorMesh.rotation.x = -0.08;
    kioskGroup.add(monitorMesh);

    // Monitor Bezel Frame (Beveled CRT border)
    const bezelGeo = new THREE.BoxGeometry(1.7, 1.25, 0.15);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f0d,
      roughness: 0.9,
      flatShading: true,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.set(0, 1.0, 0.65);
    bezelMesh.rotation.x = -0.08;
    kioskGroup.add(bezelMesh);

    // 3. Curved Low-poly CRT Glass Screen (Emits dynamic canvas texture)
    const screenGeo = new THREE.PlaneGeometry(1.48, 1.08, 8, 8);
    // Subtle vertex curve for retro CRT bulb distortion
    const posAttr = screenGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const distFromCenter = (x * x + y * y) * 0.08;
      posAttr.setZ(i, -distFromCenter);
    }
    screenGeo.computeVertexNormals();

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    });

    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 1.0, 0.73);
    screenMesh.rotation.x = -0.08;
    kioskGroup.add(screenMesh);
    screenMeshRef.current = screenMesh;

    // Glowing screen phosphor halo
    const glowGeo = new THREE.PlaneGeometry(1.52, 1.12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(0, 1.0, 0.74);
    glowMesh.rotation.x = -0.08;
    kioskGroup.add(glowMesh);

    // 4. Industrial Warning Stripes & Decals
    const stripeGeo = new THREE.BoxGeometry(1.62, 0.1, 0.02);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.set(0, -1.3, 0.56);
    kioskGroup.add(stripeMesh);

    // 5. Retro Floating Dust & Matrix Sparks
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = Math.random() * 4 - 1;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ff66,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // -------------------------------------------------------------
    // INTERACTION: MOUSE ROTATION & GLITCH SHAKE
    // -------------------------------------------------------------
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0.2;
    let targetRotationX = 0;

    const domElement = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Click on 3D kiosk screen to trigger glitch or switch mode
    const onCanvasClick = (e: MouseEvent) => {
      if (Math.abs(e.clientX - prevMouseX) < 4 && Math.abs(e.clientY - prevMouseY) < 4) {
        triggerGlitchPulse();
      }
    };
    domElement.addEventListener('click', onCanvasClick);

    // Animation loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = now * 0.001;
      frameCount++;

      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Smooth dampening rotation
      kioskGroup.rotation.y += (targetRotationY - kioskGroup.rotation.y) * 0.08;
      kioskGroup.rotation.x += (targetRotationX - kioskGroup.rotation.x) * 0.08;

      // Idle DOOM industrial breathing float
      kioskGroup.position.y = Math.sin(elapsed * 1.5) * 0.02;

      // Glitch flicker jitter
      if (Math.random() < 0.04 * glitchIntensityRef.current) {
        screenMesh.position.x = (Math.random() - 0.5) * 0.05;
        pointLight.intensity = 2.5 + Math.random() * 2.0;
      } else {
        screenMesh.position.x = 0;
        pointLight.intensity = 2.0;
      }

      // Rotate particle cloud
      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('click', onCanvasClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  const triggerGlitchPulse = () => {
    setIsGlitchingHard(true);
    glitchIntensityRef.current = 3.5;
    drawScreenContent(activeGlitchIndex, true, isPoweredOn, customData);

    setTimeout(() => {
      setIsGlitchingHard(false);
      glitchIntensityRef.current = 1.0;
      drawScreenContent(activeGlitchIndex, false, isPoweredOn, customData);
    }, 550);
  };

  const triggerNextGlitch = () => {
    const nextIdx = (activeGlitchIndex + 1) % REGISTERED_KIOSK_SCREENS.length;
    setActiveGlitchIndex(nextIdx);
    setIsGlitchingHard(true);
    glitchIntensityRef.current = 3.0;

    drawScreenContent(nextIdx, true, isPoweredOn, customData);

    if (onGlitchStateChange) {
      onGlitchStateChange(REGISTERED_KIOSK_SCREENS[nextIdx].name);
    }

    setTimeout(() => {
      setIsGlitchingHard(false);
      glitchIntensityRef.current = 1.0;
      drawScreenContent(nextIdx, false, isPoweredOn, customData);
    }, 550);
  };

  const togglePower = () => {
    const nextState = !isPoweredOn;
    setIsPoweredOn(nextState);
    if (!nextState) {
      // Power down animation
      drawScreenContent(activeGlitchIndex, false, false, customData);
    } else {
      // Power on reboot burst
      setIsGlitchingHard(true);
      drawScreenContent(activeGlitchIndex, true, true, customData);
      setTimeout(() => {
        setIsGlitchingHard(false);
        drawScreenContent(activeGlitchIndex, false, true, customData);
      }, 600);
    }
  };

  const resetCamera = () => {
    if (kioskGroupRef.current) {
      kioskGroupRef.current.rotation.y = 0.2;
      kioskGroupRef.current.rotation.x = 0;
    }
  };

  return (
    <div className="relative w-full rounded-md border border-emerald-500/30 bg-black/90 p-3 shadow-[0_0_30px_rgba(0,255,102,0.15)] overflow-hidden font-mono">
      {/* 3D Viewport Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/20 pb-2 mb-2 text-xs gap-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Monitor className="h-4 w-4 animate-pulse" />
          <span className="font-bold tracking-wider">DOOM_LOWPOLY_CRT_VIEWPORT // MODULAR_v2.0</span>
          <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
            {fps} FPS
          </span>
          <span className="text-[10px] text-zinc-500 hidden md:inline">
            [{REGISTERED_KIOSK_SCREENS.length} MODULAR SCREENS]
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={resetCamera}
            title="Reset Camera Orientation"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 text-xs transition"
          >
            <RotateCcw className="h-3 w-3" /> Center
          </button>

          <button
            onClick={togglePower}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-semibold transition ${
              isPoweredOn
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/60'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
            }`}
          >
            <Power className="h-3 w-3" /> {isPoweredOn ? 'Shutdown CRT' : 'Boot CRT'}
          </button>

          <button
            onClick={triggerGlitchPulse}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 transition active:scale-95 text-xs font-semibold"
          >
            <Zap className="h-3 w-3" /> Glitch Shock
          </button>

          <button
            onClick={triggerNextGlitch}
            className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 transition active:scale-95 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Next Screen
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[320px] sm:h-[390px] cursor-grab active:cursor-grabbing rounded bg-black/60 relative overflow-hidden"
      >
        {/* Retro scanline simulation on overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-70" />

        {/* Current Anomaly Indicator Badge */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1.5 bg-black/85 border border-emerald-500/40 px-2.5 py-1 rounded text-emerald-400 backdrop-blur shadow-md">
            <Zap className={`h-3 w-3 ${isGlitchingHard ? 'text-rose-500 animate-spin' : 'text-amber-400'}`} />
            <span className="text-[11px] text-zinc-400">ACTIVE SCREEN:</span>
            <span className="font-bold">{currentScreen.name}</span>
          </div>
          <div className="text-[10px] text-emerald-400/90 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/20">
            {customData.venueName} &bull; {currentScreen.osCategory}
          </div>
        </div>

        {/* Status indicator top right */}
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <div className="bg-black/80 border border-emerald-500/30 px-2 py-1 rounded text-[10px] text-emerald-400/80">
            {isPoweredOn ? 'CRT_PHOSPHOR: ACTIVE' : 'CRT_POWER: STANDBY'}
          </div>
        </div>
      </div>

      {/* Quick Screen Selectors */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
        {REGISTERED_KIOSK_SCREENS.map((screen, idx) => (
          <button
            key={screen.id}
            onClick={() => {
              setActiveGlitchIndex(idx);
              drawScreenContent(idx, true, isPoweredOn, customData);
              setTimeout(() => drawScreenContent(idx, false, isPoweredOn, customData), 350);
            }}
            className={`px-2 py-1.5 rounded text-left border transition truncate ${
              activeGlitchIndex === idx
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-zinc-200'
            }`}
          >
            {screen.name}
          </button>
        ))}
      </div>

      {/* Interactive Custom Data Injection Panel */}
      <div className="mt-3 rounded border border-emerald-500/25 bg-[#070b08] p-3">
        <button
          onClick={() => setShowDataEditor(!showDataEditor)}
          className="w-full flex items-center justify-between text-xs text-emerald-400 font-bold hover:text-emerald-300 transition"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" />
            3D CRT DATA INJECTION &amp; REAL-TIME TELEMETRY CUSTOMIZER
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            {showDataEditor ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showDataEditor ? 'Hide Controls' : 'Edit 3D Screen Data'}
          </span>
        </button>

        {showDataEditor && (
          <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Target Venue / Asset Name:</label>
              <input
                type="text"
                value={customData.venueName || ''}
                onChange={(e) => setCustomData((prev) => ({ ...prev, venueName: e.target.value }))}
                placeholder="e.g. McDonald's Drive-Thru #4412"
                className="w-full rounded border border-zinc-700 bg-black px-2.5 py-1.5 text-white focus:border-emerald-500 focus:outline-hidden text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">CRT Error Message / Panic Text:</label>
              <input
                type="text"
                value={customData.customMessage || ''}
                onChange={(e) => setCustomData((prev) => ({ ...prev, customMessage: e.target.value }))}
                placeholder="e.g. NewPOS6 crashed to Windows desktop"
                className="w-full rounded border border-zinc-700 bg-black px-2.5 py-1.5 text-white focus:border-emerald-500 focus:outline-hidden text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Remote ID / Custom Payload:</label>
              <input
                type="text"
                value={customData.userPayload || ''}
                onChange={(e) => setCustomData((prev) => ({ ...prev, userPayload: e.target.value }))}
                placeholder="e.g. 492 881 024 or IRQ_0x7FFE"
                className="w-full rounded border border-zinc-700 bg-black px-2.5 py-1.5 text-white focus:border-emerald-500 focus:outline-hidden text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
