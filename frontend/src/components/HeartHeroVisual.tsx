import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeartHeroVisualProps {
  onExploreClick?: () => void;
}

export const HeartHeroVisual: React.FC<HeartHeroVisualProps> = ({ onExploreClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 440;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    // Clinical Ambient & Key Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, 1.4);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Anatomical Heart Group
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    // Ventricles Geometry
    const heartGeo = new THREE.SphereGeometry(1.3, 64, 64);
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
      color: 0x8b2b2b,
      roughness: 0.5,
      metalness: 0.15,
    });
    const myocardium = new THREE.Mesh(heartGeo, myocardiumMat);
    heartGroup.add(myocardium);

    // Aorta Arch
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.7, 0.1),
      new THREE.Vector3(-0.1, 1.6, 0.0),
      new THREE.Vector3(0.2, 2.0, -0.2),
      new THREE.Vector3(0.65, 1.7, -0.4),
      new THREE.Vector3(0.7, 1.0, -0.5)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.32, 24, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.35,
      metalness: 0.2
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    heartGroup.add(aortaMesh);

    // Pulmonary Trunk
    const pulmoCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.5, 0.3),
      new THREE.Vector3(0.05, 1.3, 0.25),
      new THREE.Vector3(-0.35, 1.5, 0.0)
    ]);
    const pulmoGeo = new THREE.TubeGeometry(pulmoCurve, 30, 0.26, 20, false);
    const pulmoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4,
      metalness: 0.1
    });
    const pulmoMesh = new THREE.Mesh(pulmoGeo, pulmoMat);
    heartGroup.add(pulmoMesh);

    // LAD Coronary Artery (Left Anterior Descending)
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 0.8, 0.8),
      new THREE.Vector3(-0.05, 0.4, 1.15),
      new THREE.Vector3(0.02, 0.0, 1.25),
      new THREE.Vector3(0.05, -0.4, 1.1),
      new THREE.Vector3(0.08, -0.8, 0.8),
      new THREE.Vector3(0.05, -1.2, 0.4)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 50, 0.075, 16, false);
    const ladMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.3
    });
    const ladMesh = new THREE.Mesh(ladGeo, ladMat);
    heartGroup.add(ladMesh);

    // LCX Coronary Artery (Left Circumflex)
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 0.8, 0.8),
      new THREE.Vector3(-0.45, 0.65, 0.95),
      new THREE.Vector3(-0.85, 0.45, 0.75),
      new THREE.Vector3(-1.15, 0.15, 0.3),
      new THREE.Vector3(-1.1, -0.25, -0.2)
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 45, 0.065, 16, false);
    const lcxMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
      roughness: 0.25,
      metalness: 0.3
    });
    const lcxMesh = new THREE.Mesh(lcxGeo, lcxMat);
    heartGroup.add(lcxMesh);

    // RCA Coronary Artery (Right Coronary Artery)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.75, 0.7),
      new THREE.Vector3(0.65, 0.55, 0.85),
      new THREE.Vector3(0.95, 0.2, 0.65),
      new THREE.Vector3(1.05, -0.2, 0.2),
      new THREE.Vector3(0.85, -0.65, -0.3)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 45, 0.065, 16, false);
    const rcaMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      emissive: 0x0f766e,
      emissiveIntensity: 0.3,
      roughness: 0.25,
      metalness: 0.3
    });
    const rcaMesh = new THREE.Mesh(rcaGeo, rcaMat);
    heartGroup.add(rcaMesh);

    // Initial slight angle
    heartGroup.rotation.y = 0.2;
    heartGroup.rotation.x = 0.08;

    // Interactive Drag & Zoom Controls for Safe Preview
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      heartGroup.rotation.y += dx * 0.008;
      heartGroup.rotation.x += dy * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(7.5, camera.position.z + e.deltaY * 0.003));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation when not dragging
      if (!isDragging) {
        heartGroup.rotation.y += 0.003;
      }

      // Subtle anatomical heartbeat pulse
      const pulse = 1.0 + Math.sin(elapsedTime * 2.5) * 0.015;
      heartGroup.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      if (newW && newH) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[340px] sm:h-[390px] md:h-[430px] flex items-center justify-center">
      {/* Background Soft Glow Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-rose-500/10 blur-3xl rounded-full -z-10 pointer-events-none" />

      {/* ThreeJS Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Interactive 3D Coronary Anatomy Preview • Click & drag to rotate, scroll to zoom"
      />

      {/* Clean Anatomical Callout Badges (No fabricated patient probabilities) */}
      <div className="absolute top-4 right-3 sm:right-6 bg-[#0B1B2B]/90 backdrop-blur-md border border-[#1A2E44] rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        <div>
          <div className="text-[11px] font-bold text-white tracking-wide">LAD Branch</div>
          <div className="text-[10px] text-slate-400">Left anterior descending</div>
        </div>
      </div>

      <div className="absolute bottom-14 right-2 sm:right-4 bg-[#0B1B2B]/90 backdrop-blur-md border border-[#1A2E44] rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <div>
          <div className="text-[11px] font-bold text-white tracking-wide">LCX Branch</div>
          <div className="text-[10px] text-slate-400">Left circumflex</div>
        </div>
      </div>

      <div className="absolute bottom-10 left-3 sm:left-6 bg-[#0B1B2B]/90 backdrop-blur-md border border-[#1A2E44] rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        <div>
          <div className="text-[11px] font-bold text-white tracking-wide">RCA Branch</div>
          <div className="text-[10px] text-slate-400">Right coronary artery</div>
        </div>
      </div>

      {/* Floating Interactive CTA Hint */}
      {onExploreClick && (
        <button
          type="button"
          onClick={onExploreClick}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#0B1B2B]/85 hover:bg-[#13283E] text-[11px] text-teal-300 border border-teal-500/30 backdrop-blur-sm transition flex items-center gap-1.5 shadow-md cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-400"
        >
          <span>Open in 3D Heart Viewer</span>
          <span className="text-xs">→</span>
        </button>
      )}
    </div>
  );
};
export default HeartHeroVisual;
