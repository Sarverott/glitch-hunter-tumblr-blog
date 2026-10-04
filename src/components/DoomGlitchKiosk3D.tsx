/**
 * DoomGlitchKiosk3D.tsx
 * High quality Three.js retro low-poly DOOM-styled glitching public kiosk scene
 * Features:
 * - Low-poly CRT terminal cabinet with 90s flat-shaded geometry
 * - Custom dynamic Canvas texture rendering authentic public display crashes (McDonald's Windows 10 desktop, BSOD, Linux Kernel Panic, BIOS)
 * - Software-renderer retro vertex jitter & displacement glitch shaders
 * - Interactive click-to-glitch state switching & camera orbiting
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RefreshCw, Monitor, Zap, Terminal } from 'lucide-react';

interface DoomGlitchKioskProps {
  currentGlitchMode?: string;
  onGlitchStateChange?: (stateName: string) => void;
}

export const GLITCH_MODES = [
  { id: 'mcdonalds_win10', name: "McDonald's Win10 Breakout", color: '#0078d7', text: "WINDOWS 10 PRO - DESKTOP EXITED" },
  { id: 'subway_kernel', name: 'Subway Linux Kernel Panic', color: '#000000', text: 'KERNEL PANIC: FATAL EXCEPTION IN INTERRUPT' },
  { id: 'atm_bsod', name: 'ATM Blue Screen of Death', color: '#0000aa', text: 'CRITICAL_PROCESS_DIED (ntoskrnl.exe)' },
  { id: 'billboard_teamviewer', name: 'LED Billboard TeamViewer', color: '#0055aa', text: 'TEAMVIEWER ID: 492 881 024' },
  { id: 'bios_boot', name: 'Airport FIDS AMI BIOS Prompt', color: '#111111', text: 'CMOS BATTERY LOW // PRESS F1 TO RUN SETUP' },
];

export const DoomGlitchKiosk3D: React.FC<DoomGlitchKioskProps> = ({ onGlitchStateChange }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeGlitchIndex, setActiveGlitchIndex] = useState(0);
  const [isGlitchingHard, setIsGlitchingHard] = useState(false);
  const [fps, setFps] = useState(60);

  // References for three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const glitchIntensityRef = useRef(1.0);

  // Update dynamic CRT Canvas Texture
  const drawScreenContent = (modeIndex: number, hardGlitch: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mode = GLITCH_MODES[modeIndex];
    const w = canvas.width;
    const h = canvas.height;

    // Base background
    ctx.fillStyle = mode.color;
    ctx.fillRect(0, 0, w, h);

    if (mode.id === 'mcdonalds_win10') {
      // Windows 10 desktop background
      ctx.fillStyle = '#103554';
      ctx.fillRect(0, 0, w, h);

      // Windows 10 window light logo
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(w * 0.45, h * 0.25, w * 0.35, h * 0.45);

      // Taskbar
      ctx.fillStyle = '#0f141c';
      ctx.fillRect(0, h - 48, w, 48);

      // Windows Start button
      ctx.fillStyle = '#0078d7';
      ctx.fillRect(8, h - 40, 32, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('⊞', 16, h - 18);

      // McDonald's NewPOS Error Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 70, 350, 180);
      ctx.fillStyle = '#000000';
      ctx.fillRect(80, 70, 350, 32);
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 14px "Fira Code", monospace';
      ctx.fillText("MCDONALD'S NEWPOS6 v4.2 - CRASH", 95, 92);

      ctx.fillStyle = '#cc0000';
      ctx.font = '13px sans-serif';
      ctx.fillText('Fatal: Order display viewport lost focus.', 100, 130);
      ctx.fillStyle = '#333333';
      ctx.fillText('Exited to Windows Desktop shell.', 100, 155);
      ctx.fillText('Memory Allocation Failure at 0x7FFE90', 100, 180);

      // Recycle bin icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText('🗑 Recycle Bin', 20, 40);
      ctx.fillText('📂 Menu_Promos_2026', 20, 80);
      ctx.fillText('⚙️ Signage_Service.bat', 20, 120);

    } else if (mode.id === 'subway_kernel') {
      // Linux Kernel Panic
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = '13px "Courier New", monospace';

      const lines = [
        '[  14.289102] Kernel panic - not syncing: Fatal exception in interrupt',
        '[  14.289104] CPU: 1 PID: 0 Comm: swapper/1 Tainted: G        W',
        '[  14.289106] Hardware name: TransitKiosk-Intel-Atom-E3940/IPC-8800',
        '[  14.289108] Call Trace:',
        '[  14.289110]  <IRQ>',
        '[  14.289112]  dump_stack+0x6d/0x8b',
        '[  14.289114]  panic+0x101/0x290',
        '[  14.289116]  nmi_panic+0x34/0x38',
        '[  14.289118]  transit_display_gpu_irq_handler+0x8a/0x120',
        '[  14.289120]  handle_irq_event_percpu+0x32/0x70',
        '[  14.289122] ---[ end Kernel panic - not syncing ]---',
      ];
      lines.forEach((line, idx) => {
        ctx.fillText(line, 15, 30 + idx * 24);
      });

    } else if (mode.id === 'atm_bsod') {
      // Windows BSOD
      ctx.fillStyle = '#0078d7';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.font = '60px sans-serif';
      ctx.fillText(':(', 40, 90);

      ctx.font = '18px sans-serif';
      ctx.fillText('Your ATM PC ran into a problem and needs to restart.', 40, 140);
      ctx.fillText("We're just collecting some error info, and then we'll restart.", 40, 170);

      ctx.font = '13px "Fira Code", monospace';
      ctx.fillText('Stop code: CRITICAL_PROCESS_DIED', 40, 240);
      ctx.fillText('What failed: win32kfull.sys (Wincor Nixdorf ATM Agent)', 40, 265);

    } else if (mode.id === 'billboard_teamviewer') {
      // TeamViewer prompt
      ctx.fillStyle = '#0d2238';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(60, 40, 390, 280);
      ctx.fillStyle = '#00539f';
      ctx.fillRect(60, 40, 390, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('TeamViewer 14 - Commercial Display Host', 80, 66);

      ctx.fillStyle = '#333333';
      ctx.font = '13px sans-serif';
      ctx.fillText('Ready to connect (secure connection)', 80, 110);

      ctx.font = 'bold 22px "Fira Code", monospace';
      ctx.fillStyle = '#00539f';
      ctx.fillText('Your ID:   492 881 024', 80, 160);
      ctx.fillText('Password:  7294', 80, 200);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText('Times Square High-Brightness Signage Node #7', 80, 260);

    } else {
      // BIOS prompt
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffff55';
      ctx.font = '14px "Fira Code", monospace';
      ctx.fillText('American Megatrends Inc. (AMI) BIOS v2.18', 20, 35);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Main Processor: Intel(R) Celeron(R) CPU J1900 @ 1.99GHz', 20, 65);
      ctx.fillText('Memory Testing : 4194304K OK', 20, 90);
      ctx.fillText('Checking NVRAM... DONE', 20, 115);
      ctx.fillStyle = '#ff5555';
      ctx.fillText('CMOS Settings Wrong', 20, 160);
      ctx.fillText('CMOS Date/Time Not Set', 20, 185);
      ctx.fillText('Press F1 to Run SETUP', 20, 230);
      ctx.fillText('Press F2 to load default values and continue', 20, 255);
    }

    // Scanline & glitch artifacts
    if (hardGlitch) {
      for (let i = 0; i < 20; i++) {
        const gy = Math.random() * h;
        const gh = Math.random() * 12 + 2;
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '0,255,102' : '255,0,80'}, ${Math.random() * 0.7 + 0.3})`;
        ctx.fillRect(0, gy, w, gh);
      }
    }

    // Horizontal scanlines on canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  };

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

    drawScreenContent(activeGlitchIndex, false);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050806);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.6);

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

    // 1. Kiosk Heavy Steel Pedestal / Body (Low-poly chamfered)
    const bodyGeo = new THREE.BoxGeometry(1.6, 2.2, 1.1, 2, 2, 2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x181c19,
      roughness: 0.6,
      metalness: 0.5,
      flatShading: true,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = -0.5;
    kioskGroup.add(bodyMesh);

    // 2. Kiosk Front Vent Grille
    const ventGeo = new THREE.PlaneGeometry(1.1, 0.4, 4, 2);
    const ventMat = new THREE.MeshBasicMaterial({
      color: 0x0f2b18,
      wireframe: true,
    });
    const ventMesh = new THREE.Mesh(ventGeo, ventMat);
    ventMesh.position.set(0, -0.7, 0.56);
    kioskGroup.add(ventMesh);

    // 3. CRT Monitor Bezel (Angled monitor housing)
    const bezelGeo = new THREE.BoxGeometry(2.0, 1.5, 1.2, 2, 2, 2);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x1f2622,
      roughness: 0.4,
      metalness: 0.6,
      flatShading: true,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.set(0, 1.0, 0.1);
    bezelMesh.rotation.x = -0.08;
    kioskGroup.add(bezelMesh);

    // 4. CRT Curved Glass Screen (Where the glitch happens)
    const screenGeo = new THREE.PlaneGeometry(1.65, 1.15, 8, 8);

    // Slight low-poly curve to screen vertices
    const pos = screenGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const curvature = (1 - (vx * vx) / 1.5) * (1 - (vy * vy) / 1.5);
      pos.setZ(i, curvature * 0.08);
    }
    screenGeo.computeVertexNormals();

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 1.02, 0.72);
    screenMesh.rotation.x = -0.08;
    screenMeshRef.current = screenMesh;
    kioskGroup.add(screenMesh);

    // 5. Retro Wireframe HUD Border around screen
    const wireframeGeo = new THREE.EdgesGeometry(bezelGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.4 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframe.position.copy(bezelMesh.position);
    wireframe.rotation.copy(bezelMesh.rotation);
    kioskGroup.add(wireframe);

    // 6. Floating Data Shards / Low-Poly Glitch particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 6;
      particlePositions[i + 1] = (Math.random() - 0.5) * 4 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ff66,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x00ff66, 0x003311);
    gridHelper.position.y = -1.6;
    scene.add(gridHelper);

    // Mouse drag interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      kioskGroup.rotation.y += deltaX * 0.008;
      kioskGroup.rotation.x = Math.max(-0.3, Math.min(0.3, kioskGroup.rotation.x + deltaY * 0.008));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }

      // Gentle idle wobble
      if (!isDragging) {
        kioskGroup.rotation.y = Math.sin(elapsed * 0.5) * 0.15;
      }

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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  const triggerNextGlitch = () => {
    const nextIdx = (activeGlitchIndex + 1) % GLITCH_MODES.length;
    setActiveGlitchIndex(nextIdx);
    setIsGlitchingHard(true);
    glitchIntensityRef.current = 3.0;

    drawScreenContent(nextIdx, true);

    if (onGlitchStateChange) {
      onGlitchStateChange(GLITCH_MODES[nextIdx].name);
    }

    setTimeout(() => {
      setIsGlitchingHard(false);
      glitchIntensityRef.current = 1.0;
      drawScreenContent(nextIdx, false);
    }, 600);
  };

  return (
    <div className="relative w-full rounded-md border border-emerald-500/30 bg-black/90 p-3 shadow-[0_0_30px_rgba(0,255,102,0.15)] overflow-hidden">
      {/* 3D Viewport Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <Monitor className="h-4 w-4 animate-pulse" />
          <span className="font-bold tracking-wider">DOOM_LOWPOLY_CRT_VIEWPORT // v1.09</span>
          <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
            {fps} FPS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 hidden sm:inline">[Drag to rotate 3D Kiosk]</span>
          <button
            onClick={triggerNextGlitch}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 transition active:scale-95 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Switch Glitch State
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[320px] sm:h-[400px] cursor-grab active:cursor-grabbing rounded bg-black/60 relative overflow-hidden"
      >
        {/* Retro scanline simulation on overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-70" />

        {/* Current Anomaly Indicator Badge */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex flex-col gap-1 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-black/85 border border-emerald-500/40 px-2.5 py-1 rounded text-emerald-400 backdrop-blur shadow-md">
            <Zap className={`h-3 w-3 ${isGlitchingHard ? 'text-rose-500 animate-spin' : 'text-amber-400'}`} />
            <span className="text-[11px] text-zinc-400">ACTIVE RENDER:</span>
            <span className="font-bold">{GLITCH_MODES[activeGlitchIndex].name}</span>
          </div>
          <div className="text-[10px] text-emerald-500/70 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20">
            {GLITCH_MODES[activeGlitchIndex].text}
          </div>
        </div>

        {/* Status indicator right corner */}
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <div className="bg-black/80 border border-emerald-500/30 px-2 py-1 rounded font-mono text-[10px] text-emerald-400/80">
            VERTEX_DISPLACEMENT: ACTIVE
          </div>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-[11px]">
        {GLITCH_MODES.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => {
              setActiveGlitchIndex(idx);
              drawScreenContent(idx, true);
              setTimeout(() => drawScreenContent(idx, false), 400);
            }}
            className={`px-2 py-1.5 rounded text-left border transition truncate ${
              activeGlitchIndex === idx
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-zinc-200'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
};
