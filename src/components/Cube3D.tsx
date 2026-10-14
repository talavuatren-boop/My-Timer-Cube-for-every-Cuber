import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Eye,
  RotateCw,
  Compass,
  ChevronsLeft,
  ChevronsRight,
  Layers,
} from 'lucide-react';
import { tokenizeAlgorithm, invertAlgorithm } from '../lib/cubeModel';

export interface Cube3DProps {
  scramble?: string;
  algorithm?: string;
  category?: string;
  maskMode?: 'cross' | 'f2l' | 'none' | 'auto';
  autoplay?: boolean;
  isTimerRunning?: boolean;
  className?: string;
  height?: number | string;
  onMoveComplete?: (moveIndex: number, totalMoves: number) => void;
  interactiveControls?: boolean;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
}

// Standard Official WCA / CFOP Sticker Colors (White Cross D-face, Yellow Last Layer U-face)
const COLORS = {
  R: 0xb71234, // Red (+X Right)
  L: 0xff5800, // Orange (-X Left)
  U: 0xffd500, // Yellow (+Y Up - CFOP Last Layer)
  D: 0xffffff, // White (-Y Down - CFOP Cross Layer)
  F: 0x009b48, // Green (+Z Front)
  B: 0x0046ad, // Blue (-Z Back)
  BODY: 0x111111, // Dark plastic body / unneeded piece blackener
};

// Cubie internal structure tracking mathematically accurate 26 cubies
interface CubieRecord {
  mesh: THREE.Mesh;
  // Current discrete grid coordinate: {-1, 0, 1}
  gridX: number;
  gridY: number;
  gridZ: number;
}

export const Cube3D: React.FC<Cube3DProps> = ({
  scramble = '',
  algorithm = '',
  category = '',
  maskMode = 'auto',
  autoplay = false,
  isTimerRunning = false,
  className = '',
  height = '360px',
  onMoveComplete,
  interactiveControls = true,
  speed,
  onSpeedChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubePivotRef = useRef<THREE.Group | null>(null);
  const cubiesRef = useRef<CubieRecord[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Drag orbit state (camera rotation only - never mutates cube model)
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitGroupRef = useRef<THREE.Group | null>(null);

  // Discrete Animation Engine
  const moveQueueRef = useRef<string[]>([]);
  const isAnimatingRef = useRef(false);
  const activeAnimationRef = useRef<{
    rotGroup: THREE.Group;
    axis: THREE.Vector3;
    targetAngle: number;
    currentAngle: number;
    affectedCubies: CubieRecord[];
    onFinish: () => void;
  } | null>(null);

  // Algorithm playback state
  const [movesList, setMovesList] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(speed ?? 1);

  // Sync external speed prop if provided
  useEffect(() => {
    if (speed !== undefined && speed > 0) {
      setPlaybackSpeedState(speed);
    }
  }, [speed]);

  const setPlaybackSpeed = useCallback((newSpeed: number) => {
    setPlaybackSpeedState(newSpeed);
    onSpeedChange?.(newSpeed);
  }, [onSpeedChange]);

  const [showManualPad, setShowManualPad] = useState(false);

  // Focus Mode Masking: Dim / blacken unneeded cubies for Cross and F2L training
  const [focusModeEnabled, setFocusModeEnabled] = useState<boolean>(true);

  const effectiveMask = useMemo<'cross' | 'f2l' | 'none'>(() => {
    if (!focusModeEnabled) return 'none';
    if (maskMode === 'cross' || maskMode === 'f2l' || maskMode === 'none') {
      return maskMode;
    }
    const cat = (category || '').toLowerCase();
    if (cat.includes('cross')) return 'cross';
    if (cat.includes('f2l')) return 'f2l';
    return 'none';
  }, [focusModeEnabled, maskMode, category]);

  const isCubieRelevant = useCallback((x: number, y: number, z: number, mask: 'cross' | 'f2l' | 'none'): boolean => {
    if (mask === 'none') return true;

    if (mask === 'cross') {
      // Cross training: ONLY the 4 bottom cross edges (DF, DR, DB, DL on D y=-1) and the 6 centers are colored!
      // All 8 corners, 4 middle edges, and 4 top edges are black!
      const isCrossEdge = y === -1 && (Math.abs(x) + Math.abs(z) === 1);
      const isCenter = Math.abs(x) + Math.abs(y) + Math.abs(z) === 1;
      return isCrossEdge || isCenter;
    }

    if (mask === 'f2l') {
      // F2L training: ONLY the active Front-Right slot pair + solved Cross foundation + centers!
      // Active F2L corner (DFR): x = 1, y = -1, z = 1
      // Active F2L edge (FR): x = 1, y = 0, z = 1
      // Solved Cross edges on bottom (y = -1): DF, DR, DB, DL
      // Centers
      // All other 7 corners, 3 middle edges, and 4 top edges are black!
      const isActiveCorner = x === 1 && y === -1 && z === 1;
      const isActiveEdge = x === 1 && y === 0 && z === 1;
      const isCrossEdge = y === -1 && (Math.abs(x) + Math.abs(z) === 1);
      const isCenter = Math.abs(x) + Math.abs(y) + Math.abs(z) === 1;
      return isActiveCorner || isActiveEdge || isCrossEdge || isCenter;
    }

    return true;
  }, []);

  const createMaterials = useCallback((x: number, y: number, z: number, mask: 'cross' | 'f2l' | 'none') => {
    const isRelevant = isCubieRelevant(x, y, z, mask);
    const mat = (color: number) =>
      new THREE.MeshStandardMaterial({
        color: isRelevant ? color : COLORS.BODY,
        roughness: isRelevant ? 0.28 : 0.9,
        metalness: isRelevant ? 0.05 : 0.0,
      });

    return [
      mat(x === 1 ? COLORS.R : COLORS.BODY),
      mat(x === -1 ? COLORS.L : COLORS.BODY),
      mat(y === 1 ? COLORS.U : COLORS.BODY),
      mat(y === -1 ? COLORS.D : COLORS.BODY),
      mat(z === 1 ? COLORS.F : COLORS.BODY),
      mat(z === -1 ? COLORS.B : COLORS.BODY),
    ];
  }, [isCubieRelevant]);

  // Parse moves list whenever sequence changes
  useEffect(() => {
    const raw = (algorithm || scramble).trim();
    if (raw) {
      const parsed = tokenizeAlgorithm(raw);
      setMovesList(parsed);
      setCurrentMoveIndex(0);
    } else {
      setMovesList([]);
      setCurrentMoveIndex(0);
    }
  }, [algorithm, scramble]);

  // Construct Scene and mathematically pristine 26 cubies
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    camera.position.set(4.6, 3.8, 5.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // High quality WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.maxWidth = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Realistic Speedcube Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight2.position.set(-8, -10, -8);
    scene.add(dirLight2);

    // Orbit Group (handles view orientation without affecting cube model space)
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.set(0.35, -0.45, 0);
    scene.add(orbitGroup);
    orbitGroupRef.current = orbitGroup;

    // Cube Pivot (stationary origin group holding the 26 cubies)
    const cubePivot = new THREE.Group();
    orbitGroup.add(cubePivot);
    cubePivotRef.current = cubePivot;

    // Build the 26 cubies with beveled rounded aesthetic
    const cubies: CubieRecord[] = [];
    const cubieSize = 0.94;
    const spacing = 1.0;
    const geom = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // Skip inner core

          const materials = createMaterials(x, y, z, effectiveMask);
          const mesh = new THREE.Mesh(geom, materials);
          mesh.position.set(x * spacing, y * spacing, z * spacing);

          // Store pristine initial data
          mesh.userData = {
            initialX: x,
            initialY: y,
            initialZ: z,
          };

          cubePivot.add(mesh);
          cubies.push({
            mesh,
            gridX: x,
            gridY: y,
            gridZ: z,
          });
        }
      }
    }
    cubiesRef.current = cubies;

    // Pointer Drag Listeners
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !orbitGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - prevMouseRef.current.x;
      const dy = clientY - prevMouseRef.current.y;

      orbitGroupRef.current.rotation.y += dx * 0.012;
      orbitGroupRef.current.rotation.x += dy * 0.012;

      // Restrict polar flips
      orbitGroupRef.current.rotation.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, orbitGroupRef.current.rotation.x)
      );

      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Continuous Render Loop
    let lastTime = performance.now();
    const render = (time: number) => {
      animFrameRef.current = requestAnimationFrame(render);

      if (isTimerRunning) return; // Save GPU during live timer solving

      const dt = Math.min((time - lastTime) / 1000, 0.08);
      lastTime = time;

      // Handle ongoing move animation
      if (activeAnimationRef.current) {
        const anim = activeAnimationRef.current;
        const speed = playbackSpeed * 12; // radians/sec
        const delta = (anim.targetAngle > 0 ? 1 : -1) * speed * dt;

        if (Math.abs(anim.currentAngle + delta) >= Math.abs(anim.targetAngle)) {
          // Snap exact completion
          const remainder = anim.targetAngle - anim.currentAngle;
          anim.rotGroup.rotateOnAxis(anim.axis, remainder);
          anim.onFinish();
        } else {
          anim.currentAngle += delta;
          anim.rotGroup.rotateOnAxis(anim.axis, delta);
        }
      } else if (moveQueueRef.current.length > 0) {
        // Start next move in queue
        const next = moveQueueRef.current.shift()!;
        executePhysicalTurn(next);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(render);

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = typeof height === 'number' ? height : container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height, isTimerRunning, playbackSpeed]);

  // Dynamically update cubie materials whenever focus mode or effective mask changes
  useEffect(() => {
    if (!cubiesRef.current || cubiesRef.current.length === 0) return;
    cubiesRef.current.forEach((cubie) => {
      const { initialX, initialY, initialZ } = cubie.mesh.userData || {};
      if (typeof initialX === 'number' && typeof initialY === 'number' && typeof initialZ === 'number') {
        cubie.mesh.material = createMaterials(initialX, initialY, initialZ, effectiveMask);
      }
    });
  }, [effectiveMask, createMaterials]);

  // Reset cube immediately to initial base solved state
  const resetCubeToBase = useCallback(() => {
    moveQueueRef.current = [];
    if (activeAnimationRef.current) {
      const anim = activeAnimationRef.current;
      anim.affectedCubies.forEach((c) => {
        cubePivotRef.current?.attach(c.mesh);
      });
      cubePivotRef.current?.remove(anim.rotGroup);
      activeAnimationRef.current = null;
      isAnimatingRef.current = false;
    }

    if (cubePivotRef.current) {
      cubiesRef.current.forEach((c) => {
        cubePivotRef.current?.add(c.mesh);
        c.mesh.rotation.set(0, 0, 0);
        c.mesh.quaternion.identity();
        c.gridX = c.mesh.userData.initialX;
        c.gridY = c.mesh.userData.initialY;
        c.gridZ = c.mesh.userData.initialZ;
        c.mesh.position.set(c.gridX, c.gridY, c.gridZ);
        c.mesh.updateMatrix();
      });
    }
  }, []);

  // Parse move parameters (base, modifiers, axis, clockwise sign, and cubie filter)
  const parseMoveParams = (moveStr: string) => {
    const cleanMove = moveStr
      .replace(/[‘’′`]/g, "'")
      .replace(/prime/gi, "'")
      .replace(/3/g, "'");

    let base = '';
    if (/^[RLUDFB]w/i.test(cleanMove)) {
      base = cleanMove.slice(0, 2);
    } else {
      base = cleanMove.charAt(0);
    }

    const mod = cleanMove.slice(base.length);
    let turns = 1;
    let isCounter = false;
    if (mod.includes('2')) turns = 2;
    if (mod.includes("'")) isCounter = true;

    const axis = new THREE.Vector3();
    let filterCondition: (cubie: CubieRecord) => boolean;
    let cwSign = 1;

    switch (base) {
      case 'U':
        axis.set(0, 1, 0);
        cwSign = -1;
        filterCondition = (c) => c.gridY === 1;
        break;
      case 'D':
        axis.set(0, 1, 0);
        cwSign = 1;
        filterCondition = (c) => c.gridY === -1;
        break;
      case 'R':
        axis.set(1, 0, 0);
        cwSign = -1;
        filterCondition = (c) => c.gridX === 1;
        break;
      case 'L':
        axis.set(1, 0, 0);
        cwSign = 1;
        filterCondition = (c) => c.gridX === -1;
        break;
      case 'F':
        axis.set(0, 0, 1);
        cwSign = -1;
        filterCondition = (c) => c.gridZ === 1;
        break;
      case 'B':
        axis.set(0, 0, 1);
        cwSign = 1;
        filterCondition = (c) => c.gridZ === -1;
        break;

      // Slice moves
      case 'M':
        // M follows L direction (x = 0 layer)
        axis.set(1, 0, 0);
        cwSign = 1;
        filterCondition = (c) => c.gridX === 0;
        break;
      case 'E':
        // E follows D direction (y = 0 layer)
        axis.set(0, 1, 0);
        cwSign = 1;
        filterCondition = (c) => c.gridY === 0;
        break;
      case 'S':
        // S follows F direction (z = 0 layer)
        axis.set(0, 0, 1);
        cwSign = -1;
        filterCondition = (c) => c.gridZ === 0;
        break;

      // Wide moves
      case 'Rw':
      case 'r':
        axis.set(1, 0, 0);
        cwSign = -1;
        filterCondition = (c) => c.gridX >= 0;
        break;
      case 'Lw':
      case 'l':
        axis.set(1, 0, 0);
        cwSign = 1;
        filterCondition = (c) => c.gridX <= 0;
        break;
      case 'Uw':
      case 'u':
        axis.set(0, 1, 0);
        cwSign = -1;
        filterCondition = (c) => c.gridY >= 0;
        break;
      case 'Dw':
      case 'd':
        axis.set(0, 1, 0);
        cwSign = 1;
        filterCondition = (c) => c.gridY <= 0;
        break;
      case 'Fw':
      case 'f':
        axis.set(0, 0, 1);
        cwSign = -1;
        filterCondition = (c) => c.gridZ >= 0;
        break;
      case 'Bw':
      case 'b':
        axis.set(0, 0, 1);
        cwSign = 1;
        filterCondition = (c) => c.gridZ <= 0;
        break;

      // Whole cube rotations
      case 'x':
        axis.set(1, 0, 0);
        cwSign = -1;
        filterCondition = () => true;
        break;
      case 'y':
        axis.set(0, 1, 0);
        cwSign = -1;
        filterCondition = () => true;
        break;
      case 'z':
        axis.set(0, 0, 1);
        cwSign = -1;
        filterCondition = () => true;
        break;

      default:
        return null;
    }

    const direction = isCounter ? -1 : 1;
    const angle = cwSign * direction * (turns === 2 ? Math.PI : Math.PI / 2);

    return { axis, filterCondition, angle };
  };

  // Apply a move instantaneously (used for fast scrubbing & initial setup state)
  const applyMoveInstant = (moveStr: string) => {
    const params = parseMoveParams(moveStr);
    if (!params) return;

    const { axis, filterCondition, angle } = params;
    const rotQ = new THREE.Quaternion().setFromAxisAngle(axis.normalize(), angle);
    const halfPi = Math.PI / 2;

    for (const c of cubiesRef.current) {
      if (filterCondition(c)) {
        const pos = new THREE.Vector3(c.gridX, c.gridY, c.gridZ).applyQuaternion(rotQ);
        c.gridX = Math.round(pos.x);
        c.gridY = Math.round(pos.y);
        c.gridZ = Math.round(pos.z);
        c.mesh.position.set(c.gridX, c.gridY, c.gridZ);

        c.mesh.quaternion.premultiply(rotQ);
        const euler = new THREE.Euler().setFromQuaternion(c.mesh.quaternion, 'XYZ');
        euler.x = Math.round(euler.x / halfPi) * halfPi;
        euler.y = Math.round(euler.y / halfPi) * halfPi;
        euler.z = Math.round(euler.z / halfPi) * halfPi;
        c.mesh.quaternion.setFromEuler(euler);
        c.mesh.updateMatrix();
      }
    }
  };

  // Execute a physical face turn on the 3D model with exact mathematical snapping & smooth animation
  const executePhysicalTurn = (moveStr: string, onDone?: () => void) => {
    if (!cubePivotRef.current || !sceneRef.current) return;
    const pivot = cubePivotRef.current;

    const params = parseMoveParams(moveStr);
    if (!params) return;

    const { axis, filterCondition, angle } = params;

    // Identify affected cubies
    const affected = cubiesRef.current.filter(filterCondition);
    if (affected.length === 0) return;

    // Create temporary rotation group attached to pivot
    const rotGroup = new THREE.Group();
    pivot.add(rotGroup);

    // Attach affected cubies to rotGroup preserving their global transformation
    affected.forEach((c) => {
      rotGroup.attach(c.mesh);
    });

    isAnimatingRef.current = true;

    activeAnimationRef.current = {
      rotGroup,
      axis: axis.clone().normalize(),
      targetAngle: angle,
      currentAngle: 0,
      affectedCubies: affected,
      onFinish: () => {
        // Complete rotation: update matrices & re-attach to pivot
        rotGroup.updateMatrixWorld(true);

        affected.forEach((c) => {
          pivot.attach(c.mesh);

          // Mathematically snap position coordinates to clean integer grid {-1, 0, 1}
          c.mesh.position.x = Math.round(c.mesh.position.x);
          c.mesh.position.y = Math.round(c.mesh.position.y);
          c.mesh.position.z = Math.round(c.mesh.position.z);

          // Update tracked grid coordinates
          c.gridX = c.mesh.position.x;
          c.gridY = c.mesh.position.y;
          c.gridZ = c.mesh.position.z;

          // Mathematically round orientation quaternion to remove floating point drift
          const euler = new THREE.Euler().setFromQuaternion(c.mesh.quaternion, 'XYZ');
          const halfPi = Math.PI / 2;
          euler.x = Math.round(euler.x / halfPi) * halfPi;
          euler.y = Math.round(euler.y / halfPi) * halfPi;
          euler.z = Math.round(euler.z / halfPi) * halfPi;
          c.mesh.quaternion.setFromEuler(euler);
          c.mesh.updateMatrix();
        });

        pivot.remove(rotGroup);
        activeAnimationRef.current = null;
        isAnimatingRef.current = false;
        if (onDone) onDone();
      },
    };
  };

  // Reset cube immediately to initial unsolved state for active sequence
  const resetCube = useCallback(() => {
    resetCubeToBase();
    setCurrentMoveIndex(0);
    setIsPlaying(false);

    // Apply setup scramble to bring cube to UNSOLVED case state
    const setupStr = scramble || (algorithm ? invertAlgorithm(algorithm) : '');
    if (setupStr) {
      const setupTokens = tokenizeAlgorithm(setupStr);
      for (const t of setupTokens) {
        applyMoveInstant(t);
      }
    }

    if (onMoveComplete) onMoveComplete(0, movesList.length);
  }, [algorithm, movesList.length, onMoveComplete, resetCubeToBase, scramble]);

  // Jump directly to a specific move index without lag or drift
  const jumpToMoveIndex = useCallback(
    (targetIndex: number) => {
      resetCubeToBase();
      const clamped = Math.max(0, Math.min(targetIndex, movesList.length));

      // Re-apply setup scramble first to establish unsolved case state
      const setupStr = scramble || (algorithm ? invertAlgorithm(algorithm) : '');
      if (setupStr) {
        const setupTokens = tokenizeAlgorithm(setupStr);
        for (const t of setupTokens) {
          applyMoveInstant(t);
        }
      }

      // Apply moves up to clamped step instantaneously
      for (let i = 0; i < clamped; i++) {
        applyMoveInstant(movesList[i]);
      }

      setCurrentMoveIndex(clamped);
      if (onMoveComplete) onMoveComplete(clamped, movesList.length);
    },
    [algorithm, movesList, onMoveComplete, resetCubeToBase, scramble]
  );

  // Step next move in sequence
  const playNextMove = useCallback(() => {
    if (currentMoveIndex < movesList.length) {
      const nextMove = movesList[currentMoveIndex];
      moveQueueRef.current.push(nextMove);
      setCurrentMoveIndex((prev) => {
        const next = prev + 1;
        if (onMoveComplete) onMoveComplete(next, movesList.length);
        return next;
      });
    } else {
      setIsPlaying(false);
    }
  }, [currentMoveIndex, movesList, onMoveComplete]);

  // Execute a single manual move (e.g. from move buttons)
  const executeManualMove = useCallback((move: string) => {
    moveQueueRef.current.push(move);
  }, []);

  // Whenever sequence or scramble changes, establish initial unsolved case position
  useEffect(() => {
    const timer = setTimeout(() => {
      resetCube();
    }, 15);
    return () => clearTimeout(timer);
  }, [algorithm, scramble, resetCube]);

  // Autoplay ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (moveQueueRef.current.length === 0 && !activeAnimationRef.current) {
        if (currentMoveIndex < movesList.length) {
          playNextMove();
        } else {
          setIsPlaying(false);
        }
      }
    }, 400 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIndex, movesList, playNextMove, playbackSpeed]);

  // Reset view angle
  const resetCameraView = () => {
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.set(0.35, -0.45, 0);
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full relative cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden touch-none"
        style={{ height }}
      >
        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <div className="text-[11px] text-neutral-300 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800 flex items-center gap-1.5 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Drag anywhere to rotate view</span>
          </div>
        </div>

        <button
          onClick={resetCameraView}
          title="Reset Camera Angle"
          className="absolute top-3 right-3 p-2 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors shadow-sm"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Move-by-Move Controls */}
      {interactiveControls && movesList.length > 0 && (
        <div className="w-full mt-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex flex-col gap-2.5 shadow-lg">
          {/* Scrollable Move Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none px-1">
            {movesList.map((m, idx) => {
              const isCurrent = idx === currentMoveIndex - 1;
              const isPassed = idx < currentMoveIndex;

              return (
                <button
                  key={idx}
                  onClick={() => jumpToMoveIndex(idx + 1)}
                  className={`px-2 py-0.5 rounded-lg font-mono text-xs transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-xs'
                      : isPassed
                      ? 'text-neutral-500 hover:text-neutral-300'
                      : 'text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-800/80 text-xs">
            {/* Step progress counter */}
            <div className="text-neutral-400 font-mono text-[11px] flex items-center gap-1.5">
              <span>Step</span>
              <span className="text-neutral-100 font-semibold">{currentMoveIndex}</span>
              <span>/</span>
              <span>{movesList.length}</span>
            </div>

            {/* Playback action buttons */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => jumpToMoveIndex(0)}
                title="Jump to Start (Solved)"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => jumpToMoveIndex(currentMoveIndex - 1)}
                disabled={currentMoveIndex === 0}
                title="Previous Move"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={playNextMove}
                disabled={currentMoveIndex >= movesList.length}
                title="Next Move"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => jumpToMoveIndex(movesList.length)}
                disabled={currentMoveIndex >= movesList.length}
                title="Jump to End (Scrambled State)"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              <button
                onClick={resetCube}
                title="Reset Cube"
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Playback Speeds: 0.5x, 1x, 2x, 5x, 10x */}
              <div
                className="flex items-center gap-0.5 ml-1 bg-neutral-950/70 p-0.5 rounded-lg border border-neutral-800"
                title="Playback Speed (0.5×, 1×, 2×, 5×, 10×)"
              >
                {[0.5, 1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      playbackSpeed === s
                        ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-xs'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              {/* Toggle Manual Move Pad */}
              <button
                onClick={() => setShowManualPad(!showManualPad)}
                title="Manual Move Pad (R, R', R2, L2, M2...)"
                className={`p-1.5 rounded-lg transition-colors ml-1 ${
                  showManualPad
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Focus Mode Mask Toggle for Cross & F2L */}
              {(category.toLowerCase().includes('cross') ||
                category.toLowerCase().includes('f2l') ||
                maskMode === 'cross' ||
                maskMode === 'f2l') && (
                <button
                  onClick={() => setFocusModeEnabled(!focusModeEnabled)}
                  title={
                    focusModeEnabled
                      ? 'Focus Mode Active: Unneeded pieces blackened for high visibility. Click to show full cube.'
                      : 'Full Cube Active: Click to blacken unneeded pieces.'
                  }
                  className={`ml-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                    focusModeEnabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{focusModeEnabled ? 'Focus: Blacken Unused' : 'Full Cube'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Manual Move Pad */}
          {showManualPad && (
            <div className="w-full pt-3 mt-1 border-t border-neutral-800/80 flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-semibold text-neutral-300">Manual Move Pad</span>
                <span>Tap any move to test on 3D cube</span>
              </div>

              {/* Row 1: Clockwise single moves */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-neutral-500 w-8 shrink-0 font-mono">1x:</span>
                {['R', 'L', 'U', 'D', 'F', 'B', 'M', 'E', 'S'].map((m) => (
                  <button
                    key={m}
                    onClick={() => executeManualMove(m)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-semibold active:scale-95 transition-all shadow-xs"
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Row 2: Counter-clockwise prime moves */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-neutral-500 w-8 shrink-0 font-mono">Prime:</span>
                {["R'", "L'", "U'", "D'", "F'", "B'", "M'", "E'", "S'"].map((m) => (
                  <button
                    key={m}
                    onClick={() => executeManualMove(m)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-amber-300 font-mono text-xs font-semibold active:scale-95 transition-all shadow-xs"
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Row 3: Double 180° moves */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-neutral-500 w-8 shrink-0 font-mono">2-Turn:</span>
                {['R2', 'L2', 'U2', 'D2', 'F2', 'B2', 'M2', 'E2', 'S2'].map((m) => (
                  <button
                    key={m}
                    onClick={() => executeManualMove(m)}
                    className="px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-500/30 hover:bg-teal-900/60 text-teal-300 font-mono text-xs font-semibold active:scale-95 transition-all shadow-xs"
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Row 4: Cube rotations */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] text-neutral-500 w-8 shrink-0 font-mono">Rot:</span>
                {['x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'].map((m) => (
                  <button
                    key={m}
                    onClick={() => executeManualMove(m)}
                    className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 font-mono text-xs active:scale-95 transition-all"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
