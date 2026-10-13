import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, RotateCcw, Box, Eye, Info } from 'lucide-react';
import { RISK_BANDS, getRiskBand } from '../config/riskBands';

interface HeartViewerProps {
  probabilities: {
    LAD: number;
    LCX: number;
    RCA: number;
  };
  selectedVessel: string;
  onSelectVessel: (vessel: string) => void;
}

export const HeartViewer: React.FC<HeartViewerProps> = ({
  probabilities,
  selectedVessel,
  onSelectVessel
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredVessel, setHoveredVessel] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = useState<'heart' | 'vessels'>('heart');

  // References to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial }>({});
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Helper to compute clinical risk color from probability [0, 1] using central risk bands
  const getRiskThreeColor = (prob: number): THREE.Color => {
    const band = getRiskBand(prob);
    return new THREE.Color(band.colorHex);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- 1. Scene setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth || 520;
    const height = mount.clientHeight || 440;

    // Camera framing: adjusted slightly back (z: 5.4, y: 0.5) to keep the entire myocardium and great vessels in full view
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 2. Balanced clinical lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.9);
    dirLight1.position.set(4, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf1f5f9, 0.9);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    // --- 3. Heart anatomical group ---
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // Anatomical Myocardium (Ventricles Body)
    const heartGeo = new THREE.SphereGeometry(1.32, 64, 64);
    const pos = heartGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      if (y < 0) {
        const factor = 1.0 + y * 0.45;
        x *= Math.max(factor, 0.2);
        z *= Math.max(factor, 0.2);
      } else {
        y += Math.sin(x * 2.0) * 0.12;
      }
      pos.setXYZ(i, x, y, z);
    }
    heartGeo.computeVertexNormals();

    const myocardiumMat = new THREE.MeshStandardMaterial({
      color: 0x933633, // Organic muscle tissue tone
      roughness: 0.55,
      metalness: 0.1
    });
    materialsRef.current['myocardium'] = myocardiumMat;
    const myocardium = new THREE.Mesh(heartGeo, myocardiumMat);
    myocardium.name = 'myocardium';
    heartGroup.add(myocardium);

    // Great Vessels (Aorta Arch & Pulmonary Trunk)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.7, 0.1),
      new THREE.Vector3(-0.1, 1.6, 0.0),
      new THREE.Vector3(0.2, 2.0, -0.2),
      new THREE.Vector3(0.65, 1.7, -0.4),
      new THREE.Vector3(0.7, 1.0, -0.5)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.32, 24, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xaa3333,
      roughness: 0.4,
      metalness: 0.15
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    heartGroup.add(aortaMesh);

    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.6, 0.35),
      new THREE.Vector3(-0.25, 1.3, 0.25),
      new THREE.Vector3(-0.6, 1.5, -0.1)
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmCurve, 30, 0.26, 20, false);
    const pulmMat = new THREE.MeshStandardMaterial({
      color: 0x3b5f8f,
      roughness: 0.45,
      metalness: 0.1
    });
    const pulmMesh = new THREE.Mesh(pulmGeo, pulmMat);
    heartGroup.add(pulmMesh);

    // --- 4. The 3 Coronary Arteries (LAD, LCX, RCA) ---
    // LAD (Left Anterior Descending)
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.05, 0.8),
      new THREE.Vector3(-0.1, 0.65, 1.25),
      new THREE.Vector3(-0.05, 0.15, 1.34),
      new THREE.Vector3(0.02, -0.45, 1.15),
      new THREE.Vector3(0.06, -0.95, 0.78),
      new THREE.Vector3(0.08, -1.35, 0.35)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 50, 0.078, 16, false);
    const ladMat = new THREE.MeshStandardMaterial({
      color: getRiskThreeColor(probabilities.LAD),
      roughness: 0.3,
      metalness: 0.2
    });
    materialsRef.current['LAD'] = ladMat;
    const ladMesh = new THREE.Mesh(ladGeo, ladMat);
    ladMesh.name = 'LAD';
    heartGroup.add(ladMesh);

    // LCX (Left Circumflex)
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 1.05, 0.8),
      new THREE.Vector3(-0.45, 0.85, 0.95),
      new THREE.Vector3(-0.95, 0.65, 0.7),
      new THREE.Vector3(-1.25, 0.35, 0.1),
      new THREE.Vector3(-1.18, -0.15, -0.45),
      new THREE.Vector3(-0.85, -0.55, -0.7)
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 45, 0.068, 16, false);
    const lcxMat = new THREE.MeshStandardMaterial({
      color: getRiskThreeColor(probabilities.LCX),
      roughness: 0.3,
      metalness: 0.2
    });
    materialsRef.current['LCX'] = lcxMat;
    const lcxMesh = new THREE.Mesh(lcxGeo, lcxMat);
    lcxMesh.name = 'LCX';
    heartGroup.add(lcxMesh);

    // RCA (Right Coronary Artery)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.95, 0.75),
      new THREE.Vector3(0.65, 0.7, 0.85),
      new THREE.Vector3(1.05, 0.35, 0.65),
      new THREE.Vector3(1.15, -0.2, 0.25),
      new THREE.Vector3(0.95, -0.75, -0.25),
      new THREE.Vector3(0.45, -1.05, -0.55)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 45, 0.072, 16, false);
    const rcaMat = new THREE.MeshStandardMaterial({
      color: getRiskThreeColor(probabilities.RCA),
      roughness: 0.3,
      metalness: 0.2
    });
    materialsRef.current['RCA'] = rcaMat;
    const rcaMesh = new THREE.Mesh(rcaGeo, rcaMat);
    rcaMesh.name = 'RCA';
    heartGroup.add(rcaMesh);

    // Initial anatomical viewing tilt
    heartGroup.rotation.y = -0.25;
    heartGroup.rotation.x = 0.08;

    // --- 5. Mouse Interaction Handlers ---
    const getIntersection = (e: MouseEvent): THREE.Intersection | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        [ladMesh, lcxMesh, rcaMesh],
        false
      );
      return intersects.length > 0 ? intersects[0] : null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        heartGroup.rotation.y += deltaX * 0.008;
        heartGroup.rotation.x += deltaY * 0.008;

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
        setHoveredVessel(null);
      } else {
        const hit = getIntersection(e);
        if (hit && ['LAD', 'LCX', 'RCA'].includes(hit.object.name)) {
          setHoveredVessel(hit.object.name);
          setTooltipPos({ x: currentX, y: currentY });
          renderer.domElement.style.cursor = 'pointer';
        } else {
          setHoveredVessel(null);
          renderer.domElement.style.cursor = 'grab';
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      const hit = getIntersection(e);
      if (hit && ['LAD', 'LCX', 'RCA'].includes(hit.object.name)) {
        onSelectVessel(hit.object.name);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(8.0, camera.position.z + e.deltaY * 0.003));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // --- 6. Smooth Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle anatomical heartbeat contraction (72 BPM)
      const pulse = 1.0 + Math.pow(Math.sin(elapsedTime * Math.PI * 1.2), 8) * 0.02;
      heartGroup.scale.set(pulse, pulse, pulse);

      // Auto-rotation toggle
      if (autoRotate && !isDraggingRef.current) {
        heartGroup.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // --- 7. Window Resize Handler ---
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('wheel', handleWheel);
      if (mount.contains(dom)) {
        mount.removeChild(dom);
      }
      renderer.dispose();
    };
  }, []);

  // Update vessel risk colors dynamically when probabilities change
  useEffect(() => {
    (['LAD', 'LCX', 'RCA'] as const).forEach(vessel => {
      const mat = materialsRef.current[vessel];
      if (mat) {
        const targetColor = getRiskThreeColor(probabilities[vessel] || 0.0);
        mat.color.copy(targetColor);
        mat.emissive.copy(
          selectedVessel === vessel
            ? targetColor.clone().multiplyScalar(0.4)
            : new THREE.Color(0x000000)
        );
      }
    });

    // Update myocardium visibility if viewMode changes
    const myoMat = materialsRef.current['myocardium'];
    if (myoMat) {
      myoMat.opacity = viewMode === 'vessels' ? 0.22 : 1.0;
      myoMat.transparent = viewMode === 'vessels';
    }
  }, [probabilities, selectedVessel, viewMode]);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(3.5, Math.min(8.0, cameraRef.current.position.z + delta));
  };

  const handleResetView = () => {
    if (cameraRef.current && heartGroupRef.current) {
      cameraRef.current.position.set(0, 0.5, 5.4);
      heartGroupRef.current.rotation.set(0.08, -0.25, 0);
      heartGroupRef.current.scale.set(1, 1, 1);
    }
  };

  return (
    <div id="heart-viewer" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs relative flex flex-col justify-between overflow-hidden">

      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[360px] sm:h-[420px] rounded-lg overflow-hidden relative cursor-grab bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#07121E] dark:to-[#0B1B2B]"
      />

      {/* Top Left: Card Title & Subtitle */}
      <div className="absolute top-5 left-5 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
              3D Heart Visualization
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive model showing predicted vessel-specific stenosis risk
            </p>
          </div>
        </div>
      </div>

      {/* Top Right: Heart View / Coronary Vessels Switcher */}
      <div className="absolute top-5 right-5 z-10 flex items-center bg-[#0B1B2B]/85 backdrop-blur-md p-1 rounded-lg border border-[#1A2E44] text-xs shadow-md">
        <button
          type="button"
          onClick={() => setViewMode('heart')}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            viewMode === 'heart'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Heart View
        </button>
        <button
          type="button"
          onClick={() => setViewMode('vessels')}
          className={`px-3 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            viewMode === 'vessels'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Coronary Vessels Only
        </button>
      </div>

      {/* Middle Left: Tool Control Buttons (Rotate, Zoom In, Zoom Out, Reset) */}
      <div className="absolute left-5 top-24 z-10 flex flex-col gap-1.5 bg-[#0B1B2B]/85 backdrop-blur-md p-1.5 rounded-xl border border-[#1A2E44] text-slate-300 shadow-md">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg text-xs transition flex flex-col items-center gap-0.5 cursor-pointer ${
            autoRotate ? 'bg-teal-600 text-white' : 'hover:bg-[#13283E] hover:text-white'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-[9px] font-medium">Rotate</span>
        </button>

        <button
          type="button"
          onClick={() => handleZoom(-0.5)}
          className="p-2 rounded-lg text-xs hover:bg-[#13283E] hover:text-white transition flex flex-col items-center gap-0.5 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
          <span className="text-[9px] font-medium">Zoom In</span>
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.5)}
          className="p-2 rounded-lg text-xs hover:bg-[#13283E] hover:text-white transition flex flex-col items-center gap-0.5 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
          <span className="text-[9px] font-medium">Zoom Out</span>
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="p-2 rounded-lg text-xs hover:bg-[#13283E] hover:text-white transition flex flex-col items-center gap-0.5 cursor-pointer"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-[9px] font-medium">Reset</span>
        </button>
      </div>

      {/* Middle Right Overlay: Risk Color Guide & Interaction Tips */}
      <div className="absolute right-5 top-20 z-10 hidden sm:flex flex-col gap-2 pointer-events-none">
        {/* Risk Color Guide */}
        <div className="bg-[#0B1B2B]/85 backdrop-blur-md p-2.5 rounded-xl border border-[#1A2E44] shadow-md text-[11px] text-white w-44">
          <span className="text-[11px] font-bold text-slate-300 block mb-1.5">
            Risk Color Guide
          </span>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300 text-[10px]">Low Risk</span>
              </div>
              <span className="text-slate-400 tabular-nums text-[10px]">&lt; 35%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300 text-[10px]">Moderate Risk</span>
              </div>
              <span className="text-slate-400 tabular-nums text-[10px]">35 – 60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300 text-[10px]">High Risk</span>
              </div>
              <span className="text-slate-400 tabular-nums text-[10px]">&gt; 60%</span>
            </div>
          </div>
        </div>

        {/* Interaction Tips Box */}
        <div className="bg-[#0B1B2B]/85 backdrop-blur-md p-2.5 rounded-xl border border-[#1A2E44] shadow-md text-[10px] text-slate-300 w-44 space-y-1">
          <span className="font-bold text-slate-200 block text-[11px]">Interaction Guide</span>
          <p className="flex items-center gap-1.5">
            <span>🖱️</span> Drag to rotate model
          </p>
          <p className="flex items-center gap-1.5">
            <span>🔍</span> Scroll wheel to zoom
          </p>
          <p className="flex items-center gap-1.5">
            <span>🎯</span> Click vessel to select
          </p>
          <p className="flex items-center gap-1.5">
            <span>🔄</span> Click reset to restore framing
          </p>
        </div>
      </div>

      {/* Floating 3D Callout Badges on the heart (synchronizing with selectedVessel) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* LAD Callout Badge (Top Right of Heart) */}
        <div
          onClick={() => onSelectVessel('LAD')}
          className={`pointer-events-auto absolute top-20 right-28 sm:right-52 p-1.5 px-2.5 rounded-xl border shadow-lg text-center cursor-pointer transition-transform hover:scale-105 ${
            selectedVessel === 'LAD'
              ? 'bg-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50'
              : 'bg-[#0B1B2B]/90 text-white border-slate-700 hover:border-teal-400'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select LAD vessel"
        >
          <div className="text-[10px] font-bold">LAD Branch</div>
          <div className="text-xs font-extrabold tabular-nums">
            {(probabilities.LAD * 100).toFixed(1)}%
          </div>
        </div>

        {/* LCX Callout Badge (Right Middle of Heart) */}
        <div
          onClick={() => onSelectVessel('LCX')}
          className={`pointer-events-auto absolute bottom-24 right-20 sm:right-40 p-1.5 px-2.5 rounded-xl border shadow-lg text-center cursor-pointer transition-transform hover:scale-105 ${
            selectedVessel === 'LCX'
              ? 'bg-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50'
              : 'bg-[#0B1B2B]/90 text-white border-slate-700 hover:border-teal-400'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select LCX vessel"
        >
          <div className="text-[10px] font-bold">LCX Branch</div>
          <div className="text-xs font-extrabold tabular-nums">
            {(probabilities.LCX * 100).toFixed(1)}%
          </div>
        </div>

        {/* RCA Callout Badge (Left Middle of Heart) */}
        <div
          onClick={() => onSelectVessel('RCA')}
          className={`pointer-events-auto absolute bottom-28 left-20 sm:left-28 p-1.5 px-2.5 rounded-xl border shadow-lg text-center cursor-pointer transition-transform hover:scale-105 ${
            selectedVessel === 'RCA'
              ? 'bg-teal-600 text-white border-teal-300 ring-2 ring-teal-400/50'
              : 'bg-[#0B1B2B]/90 text-white border-slate-700 hover:border-teal-400'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select RCA vessel"
        >
          <div className="text-[10px] font-bold">RCA Branch</div>
          <div className="text-xs font-extrabold tabular-nums">
            {(probabilities.RCA * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeartViewer;
