import React from 'react';
import { AlgorithmCase, PllArrow } from '../types/cube';
import {
  createSolvedCube,
  createCfopSolvedCube,
  applyAlgorithm,
  invertAlgorithm,
  getTopColorsMatrix,
  getTopLayerSideColors,
  getSideYellowFromCube,
  derivePllArrowsFromState,
} from '../lib/cubeModel';

interface CubeDiagramProps {
  caseData: AlgorithmCase;
  size?: number;
  className?: string;
  showArrows?: boolean;
  interactive3D?: boolean;
}

export const CubeDiagram: React.FC<CubeDiagramProps> = ({
  caseData,
  size = 110,
  className = '',
  showArrows = true,
}) => {
  // Always derive setup scramble to show authentic UNSOLVED case state
  const effectiveScramble =
    caseData.setupScramble ||
    (caseData.algorithm ? invertAlgorithm(caseData.algorithm) : '');

  const subCat = (caseData.subCategory || '').toLowerCase();
  const cat = (caseData.category || '').toLowerCase();
  const group = (caseData.group || '').toLowerCase();
  const name = (caseData.name || '').toLowerCase();
  const id = (caseData.id || '').toLowerCase();
  const tags = (caseData.tags || []).map((t) => t.toLowerCase());

  const isCross =
    subCat === 'cross' ||
    cat === 'cross' ||
    id.startsWith('cross_') ||
    group.includes('cross') ||
    name.toLowerCase().includes('cross') ||
    tags.includes('cross');

  const isZbll =
    subCat === 'zbll' ||
    cat === 'zbll' ||
    id.startsWith('zbll_') ||
    group.includes('zbll') ||
    name.toLowerCase().includes('zbll') ||
    tags.includes('zbll');

  const isF2l =
    !isCross &&
    (subCat === 'f2l' ||
      cat === 'f2l' ||
      id.startsWith('f2l_') ||
      group.includes('f2l') ||
      name.toLowerCase().includes('f2l') ||
      tags.includes('f2l'));

  const isPll =
    !isCross &&
    !isF2l &&
    !isZbll &&
    (subCat === 'pll' ||
      subCat === '2look-pll' ||
      cat === 'pll' ||
      cat === '2look-pll' ||
      id.includes('pll') ||
      group.includes('pll') ||
      group.includes('perm') ||
      name.includes('pll') ||
      name.includes('perm') ||
      tags.includes('pll'));

  const isOll =
    !isCross &&
    !isF2l &&
    !isZbll &&
    !isPll &&
    (subCat === 'oll' ||
      subCat === '2look-oll' ||
      cat === 'oll' ||
      cat === '2look-oll' ||
      id.includes('oll') ||
      group.includes('oll') ||
      name.includes('oll') ||
      tags.includes('oll'));

  const getColorHex = (code: string) => {
    switch (code) {
      case 'Y':
        return '#fbbf24'; // Vivid yellow
      case 'W':
        return '#f8fafc'; // Crisp white
      case 'R':
        return '#ef4444'; // Speedcube red
      case 'G':
        return '#10b981'; // Speedcube green
      case 'B':
        return '#3b82f6'; // Speedcube blue
      case 'O':
        return '#f97316'; // Speedcube orange
      case 'N':
      default:
        return '#262626'; // Slate dark (unoriented in OLL/neutral)
    }
  };

  const getStrokeHex = (code: string) => {
    switch (code) {
      case 'Y':
        return '#d97706';
      case 'W':
        return '#cbd5e1';
      case 'R':
        return '#b91c1c';
      case 'G':
        return '#047857';
      case 'B':
        return '#1d4ed8';
      case 'O':
        return '#c2410c';
      default:
        return '#1e1e1e';
    }
  };

  // ==========================================
  // 1. CROSS VIEW (D FACE & CROSS INSERTION)
  // ==========================================
  if (isCross) {
    let dCube: any = null;
    try {
      dCube = applyAlgorithm(createCfopSolvedCube(), effectiveScramble);
    } catch {
      dCube = createCfopSolvedCube();
    }

    const viewBoxSize = 140;
    const margin = 24;
    const gridSize = viewBoxSize - 2 * margin; // 92px
    const cellSize = gridSize / 3;
    const cellGap = 1.5;

    // In D face view (looking at bottom from underneath):
    // Center is White ('W')
    // Top is Back (B[2]), Bottom is Front (F[2]), Left is Left (L[2]), Right is Right (R[2])
    const isDbSolved = dCube?.D?.[0]?.[1] === 'W';
    const isDlSolved = dCube?.D?.[1]?.[0] === 'W';
    const isDrSolved = dCube?.D?.[1]?.[2] === 'W';
    const isDfSolved = dCube?.D?.[2]?.[1] === 'W';

    const sideBorderColors = {
      top: dCube?.B?.[1]?.[1] || 'B',
      bottom: dCube?.F?.[1]?.[1] || 'G',
      left: dCube?.L?.[1]?.[1] || 'O',
      right: dCube?.R?.[1]?.[1] || 'R',
    };

    const edgeSideStickers = {
      top: dCube?.B?.[2]?.[1] || 'B',
      bottom: dCube?.F?.[2]?.[1] || 'G',
      left: dCube?.L?.[2]?.[1] || 'O',
      right: dCube?.R?.[2]?.[1] || 'R',
    };

    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-neutral-950 border border-neutral-800/90 shadow-inner select-none transition-transform shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={`${caseData.name} — White Cross (D-Face)`}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full p-0.5 drop-shadow-sm"
          shapeRendering="geometricPrecision"
        >
          {/* Subtle Outer Frame */}
          <rect
            x={margin - 14}
            y={margin - 14}
            width={gridSize + 28}
            height={gridSize + 28}
            fill="#0a0a0a"
            rx={8}
            stroke="#1f1f1f"
            strokeWidth={1}
          />

          {/* Cube D Face Frame */}
          <rect
            x={margin - 2}
            y={margin - 2}
            width={gridSize + 4}
            height={gridSize + 4}
            fill="#141414"
            rx={5}
            stroke="#333333"
            strokeWidth={1.5}
          />

          {/* 3x3 D Facelets */}
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const x = margin + c * cellSize + cellGap;
              const y = margin + r * cellSize + cellGap;
              const w = cellSize - 2 * cellGap;
              const h = cellSize - 2 * cellGap;

              // Center is always White
              let isWhiteEdge = false;
              let isCenter = false;
              if (r === 1 && c === 1) {
                isCenter = true;
              } else if (r === 0 && c === 1) {
                isWhiteEdge = isDbSolved;
              } else if (r === 1 && c === 0) {
                isWhiteEdge = isDlSolved;
              } else if (r === 1 && c === 2) {
                isWhiteEdge = isDrSolved;
              } else if (r === 2 && c === 1) {
                isWhiteEdge = isDfSolved;
              }

              const isWhite = isCenter || isWhiteEdge;
              const fillColor = isWhite ? '#f8fafc' : '#1e1e1e';
              const strokeColor = isWhite ? '#cbd5e1' : '#2a2a2a';

              return (
                <rect
                  key={`cross-cell-${r}-${c}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={3.5}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isWhite ? 1.4 : 0.8}
                />
              );
            })
          )}

          {/* Center Reference Border Indicators & Edge Stickers */}
          {/* Top (Back face center reference) */}
          <rect
            x={margin + cellSize + cellGap}
            y={margin - 11}
            width={cellSize - 2 * cellGap}
            height={7}
            rx={2}
            fill={getColorHex(edgeSideStickers.top)}
            stroke={getStrokeHex(sideBorderColors.top)}
            strokeWidth={1.2}
          />
          {/* Bottom (Front face center reference) */}
          <rect
            x={margin + cellSize + cellGap}
            y={margin + gridSize + 4}
            width={cellSize - 2 * cellGap}
            height={7}
            rx={2}
            fill={getColorHex(edgeSideStickers.bottom)}
            stroke={getStrokeHex(sideBorderColors.bottom)}
            strokeWidth={1.2}
          />
          {/* Left (Left face center reference) */}
          <rect
            x={margin - 11}
            y={margin + cellSize + cellGap}
            width={7}
            height={cellSize - 2 * cellGap}
            rx={2}
            fill={getColorHex(edgeSideStickers.left)}
            stroke={getStrokeHex(sideBorderColors.left)}
            strokeWidth={1.2}
          />
          {/* Right (Right face center reference) */}
          <rect
            x={margin + gridSize + 4}
            y={margin + cellSize + cellGap}
            width={7}
            height={cellSize - 2 * cellGap}
            rx={2}
            fill={getColorHex(edgeSideStickers.right)}
            stroke={getStrokeHex(sideBorderColors.right)}
            strokeWidth={1.2}
          />

          {/* Insertion Direction Indicator */}
          {!isDfSolved && (
            <g className="animate-pulse">
              <path
                d={`M ${margin + cellSize * 1.5} ${margin + gridSize + 18} L ${margin + cellSize * 1.5} ${margin + cellSize * 2.3}`}
                stroke="#14b8a6"
                strokeWidth={2.6}
                strokeDasharray="3 2"
                fill="none"
              />
              <polygon
                points={`${margin + cellSize * 1.5},${margin + cellSize * 2.1} ${margin + cellSize * 1.5 - 4},${margin + cellSize * 2.4} ${margin + cellSize * 1.5 + 4},${margin + cellSize * 2.4}`}
                fill="#14b8a6"
              />
            </g>
          )}
        </svg>

        {/* Cross Badge */}
        <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold text-teal-300 bg-neutral-900/95 px-1 py-0.2 rounded border border-teal-500/40 pointer-events-none shadow-xs">
          White Cross (D)
        </span>
      </div>
    );
  }

  // ==========================================
  // 2. F2L ISOMETRIC 3D SVG RENDERER (TOP, FRONT & RIGHT FACES)
  // Displays the authentic Front-Right (FR) target slot & active pair
  // ==========================================
  if (isF2l) {
    let f2lCube: any = null;
    try {
      f2lCube = applyAlgorithm(
        createCfopSolvedCube(),
        effectiveScramble || (caseData.algorithm ? invertAlgorithm(caseData.algorithm) : '')
      );
    } catch {
      f2lCube = createCfopSolvedCube();
    }

    // Dynamic centers detection to withstand cube rotations (y, y', d, etc.)
    const fCenter = f2lCube?.F?.[1]?.[1] || 'G';
    const rCenter = f2lCube?.R?.[1]?.[1] || 'R';
    const dCenter = f2lCube?.D?.[1]?.[1] || 'W';
    const bCenter = f2lCube?.B?.[1]?.[1] || 'B';
    const lCenter = f2lCube?.L?.[1]?.[1] || 'O';
    const uCenter = f2lCube?.U?.[1]?.[1] || 'Y';

    const targetCornerKey = [fCenter, rCenter, dCenter].sort().join('');
    const targetEdgeKey = [fCenter, rCenter].sort().join('');

    // All corner positions on the cube
    const corners = [
      { id: 'UFR', U: [2, 2], F: [0, 2], R: [0, 0] },
      { id: 'UFL', U: [2, 0], F: [0, 0], L: [0, 2] },
      { id: 'UBR', U: [0, 2], B: [0, 0], R: [0, 2] },
      { id: 'UBL', U: [0, 0], B: [0, 2], L: [0, 0] },
      { id: 'DFR', D: [0, 2], F: [2, 2], R: [2, 0] },
      { id: 'DFL', D: [0, 0], F: [2, 0], L: [2, 2] },
      { id: 'DBR', D: [2, 2], B: [2, 0], R: [2, 2] },
      { id: 'DBL', D: [2, 0], B: [2, 2], L: [2, 0] },
    ];

    let targetCornerPos: string | null = null;
    let whiteCornerOrientation = 'FR Slot';

    for (const c of corners) {
      const uColor = c.U ? f2lCube?.U?.[c.U[0]]?.[c.U[1]] : f2lCube?.D?.[c.D![0]]?.[c.D![1]];
      const fColor = c.F ? f2lCube?.F?.[c.F[0]]?.[c.F[1]] : f2lCube?.B?.[c.B![0]]?.[c.B![1]];
      const rColor = c.R ? f2lCube?.R?.[c.R[0]]?.[c.R[1]] : f2lCube?.L?.[c.L![0]]?.[c.L![1]];
      const set = [uColor, fColor, rColor].sort().join('');
      if (set === targetCornerKey) {
        targetCornerPos = c.id;
        if (c.U && f2lCube?.U?.[c.U[0]]?.[c.U[1]] === dCenter) {
          whiteCornerOrientation = 'W: Top';
        } else if (c.F && f2lCube?.F?.[c.F[0]]?.[c.F[1]] === dCenter) {
          whiteCornerOrientation = 'W: Front';
        } else if (c.R && f2lCube?.R?.[c.R[0]]?.[c.R[1]] === dCenter) {
          whiteCornerOrientation = 'W: Right';
        } else if (c.id === 'DFR') {
          whiteCornerOrientation = 'In Slot';
        }
        break;
      }
    }

    // Edge check helper
    const isFaceletOnTargetEdge = (face: 'U' | 'F' | 'R', r: number, c: number) => {
      if (face === 'U') {
        if (r === 2 && c === 1 && [f2lCube?.U?.[2]?.[1], f2lCube?.F?.[0]?.[1]].sort().join('') === targetEdgeKey) return true;
        if (r === 1 && c === 2 && [f2lCube?.U?.[1]?.[2], f2lCube?.R?.[0]?.[1]].sort().join('') === targetEdgeKey) return true;
        if (r === 0 && c === 1 && [f2lCube?.U?.[0]?.[1], f2lCube?.B?.[0]?.[1]].sort().join('') === targetEdgeKey) return true;
        if (r === 1 && c === 0 && [f2lCube?.U?.[1]?.[0], f2lCube?.L?.[0]?.[1]].sort().join('') === targetEdgeKey) return true;
      } else if (face === 'F') {
        if (r === 0 && c === 1 && [f2lCube?.U?.[2]?.[1], f2lCube?.F?.[0]?.[1]].sort().join('') === targetEdgeKey) return true;
        if (r === 1 && c === 2 && [f2lCube?.F?.[1]?.[2], f2lCube?.R?.[1]?.[0]].sort().join('') === targetEdgeKey) return true;
      } else if (face === 'R') {
        if (r === 0 && c === 1 && [f2lCube?.U?.[1]?.[2], f2lCube?.R?.[0]?.[1]].sort().join('') === targetEdgeKey) return true;
        if (r === 1 && c === 0 && [f2lCube?.F?.[1]?.[2], f2lCube?.R?.[1]?.[0]].sort().join('') === targetEdgeKey) return true;
      }
      return false;
    };

    const getF2lFaceletVisual = (face: 'U' | 'F' | 'R', r: number, c: number) => {
      const rawColor = f2lCube?.[face]?.[r]?.[c] || 'N';

      // Check if this facelet is on the target corner
      let isPairCorner = false;
      if (face === 'U') {
        if (targetCornerPos === 'UFR' && r === 2 && c === 2) isPairCorner = true;
        if (targetCornerPos === 'UFL' && r === 2 && c === 0) isPairCorner = true;
        if (targetCornerPos === 'UBR' && r === 0 && c === 2) isPairCorner = true;
        if (targetCornerPos === 'UBL' && r === 0 && c === 0) isPairCorner = true;
      } else if (face === 'F') {
        if (targetCornerPos === 'UFR' && r === 0 && c === 2) isPairCorner = true;
        if (targetCornerPos === 'UFL' && r === 0 && c === 0) isPairCorner = true;
        if (targetCornerPos === 'DFR' && r === 2 && c === 2) isPairCorner = true;
      } else if (face === 'R') {
        if (targetCornerPos === 'UFR' && r === 0 && c === 0) isPairCorner = true;
        if (targetCornerPos === 'UBR' && r === 0 && c === 2) isPairCorner = true;
        if (targetCornerPos === 'DFR' && r === 2 && c === 0) isPairCorner = true;
      }

      // Check if this facelet is on target edge
      const isPairEdge = isFaceletOnTargetEdge(face, r, c);

      // Target Front-Right Slot facelets
      const isTargetSlot = (face === 'F' && c === 2 && r >= 1) || (face === 'R' && c === 0 && r >= 1);

      if (isPairCorner || isPairEdge) {
        return {
          fill: getColorHex(rawColor),
          stroke: '#38bdf8',
          strokeWidth: 1.5,
          isHighlight: true,
        };
      }

      if (isTargetSlot) {
        return {
          fill: '#131b26',
          stroke: '#14b8a6',
          strokeWidth: 1.3,
          isSlot: true,
        };
      }

      // Subdued neutral tone for other pieces so the target pair pops out
      return {
        fill: '#242427',
        stroke: '#1c1c1e',
        strokeWidth: 0.8,
        isMuted: true,
      };
    };

    const cx = 55;
    const cy = 54;
    const R = 44;
    const cos30 = 0.866025;
    const sin30 = 0.5;

    const C = { x: cx, y: cy };
    const T = { x: cx, y: cy - R };
    const TR = { x: cx + R * cos30, y: cy - R * sin30 };
    const BR = { x: cx + R * cos30, y: cy + R * sin30 };
    const B = { x: cx, y: cy + R };
    const BL = { x: cx - R * cos30, y: cy + R * sin30 };
    const TL = { x: cx - R * cos30, y: cy - R * sin30 };

    const getFaceletPoints = (
      pOrigin: { x: number; y: number },
      vU: { x: number; y: number },
      vV: { x: number; y: number },
      r: number,
      c: number,
      inset = 0.04
    ) => {
      const u0 = r / 3 + inset;
      const u1 = (r + 1) / 3 - inset;
      const v0 = c / 3 + inset;
      const v1 = (c + 1) / 3 - inset;

      const p0 = { x: pOrigin.x + u0 * vU.x + v0 * vV.x, y: pOrigin.y + u0 * vU.y + v0 * vV.y };
      const p1 = { x: pOrigin.x + u0 * vU.x + v1 * vV.x, y: pOrigin.y + u0 * vU.y + v1 * vV.y };
      const p2 = { x: pOrigin.x + u1 * vU.x + v1 * vV.x, y: pOrigin.y + u1 * vU.y + v1 * vV.y };
      const p3 = { x: pOrigin.x + u1 * vU.x + v0 * vV.x, y: pOrigin.y + u1 * vU.y + v0 * vV.y };

      return `${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;
    };

    const vU_u = { x: TL.x - T.x, y: TL.y - T.y };
    const vU_v = { x: TR.x - T.x, y: TR.y - T.y };

    const vF_u = { x: BL.x - TL.x, y: BL.y - TL.y };
    const vF_v = { x: C.x - TL.x, y: C.y - TL.y };

    const vR_u = { x: B.x - C.x, y: B.y - C.y };
    const vR_v = { x: TR.x - C.x, y: TR.y - C.y };

    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-neutral-950 border border-neutral-800/90 shadow-inner select-none transition-transform shrink-0 ${className}`}
        style={{ width: size, height: size }}
        title={`${caseData.name} — F2L Front-Right Slot (${whiteCornerOrientation})`}
      >
        <svg
          viewBox="0 0 110 110"
          className="w-full h-full p-0.5 drop-shadow-md"
          shapeRendering="geometricPrecision"
        >
          {/* Chassis Outer Hexagon */}
          <polygon
            points={`${T.x},${T.y} ${TR.x},${TR.y} ${BR.x},${BR.y} ${B.x},${B.y} ${BL.x},${BL.y} ${TL.x},${TL.y}`}
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />

          {/* Top (U) Facelets */}
          <g className="f2l-u-face">
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const vis = getF2lFaceletVisual('U', r, c);
                return (
                  <polygon
                    key={`u-${r}-${c}`}
                    points={getFaceletPoints(T, vU_u, vU_v, r, c)}
                    fill={vis.fill}
                    stroke={vis.stroke}
                    strokeWidth={vis.strokeWidth}
                    strokeLinejoin="round"
                  />
                );
              })
            )}
          </g>

          {/* Front (F) Facelets */}
          <g className="f2l-f-face">
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const vis = getF2lFaceletVisual('F', r, c);
                return (
                  <polygon
                    key={`f-${r}-${c}`}
                    points={getFaceletPoints(TL, vF_u, vF_v, r, c)}
                    fill={vis.fill}
                    stroke={vis.stroke}
                    strokeWidth={vis.strokeWidth}
                    strokeLinejoin="round"
                  />
                );
              })
            )}
          </g>

          {/* Right (R) Facelets */}
          <g className="f2l-r-face">
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const vis = getF2lFaceletVisual('R', r, c);
                return (
                  <polygon
                    key={`r-${r}-${c}`}
                    points={getFaceletPoints(C, vR_u, vR_v, r, c)}
                    fill={vis.fill}
                    stroke={vis.stroke}
                    strokeWidth={vis.strokeWidth}
                    strokeLinejoin="round"
                  />
                );
              })
            )}
          </g>

          {/* Seam Lines */}
          <line x1={C.x} y1={C.y} x2={T.x} y2={T.y} stroke="#09090b" strokeWidth={1.5} />
          <line x1={C.x} y1={C.y} x2={TL.x} y2={TL.y} stroke="#09090b" strokeWidth={1.5} />
          <line x1={C.x} y1={C.y} x2={TR.x} y2={TR.y} stroke="#09090b" strokeWidth={1.5} />
          <line x1={C.x} y1={C.y} x2={B.x} y2={B.y} stroke="#09090b" strokeWidth={1.8} />

          {/* Target FR Slot Marker Dot on center seam */}
          <circle cx={C.x} cy={(C.y + B.y) / 2} r={2.5} fill="#2dd4bf" stroke="#042f2e" strokeWidth={0.8} opacity={0.85} />
        </svg>

        {/* FR Slot & Orientation Pill */}
        <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold text-teal-300 bg-neutral-900/95 px-1 py-0.2 rounded border border-teal-500/40 pointer-events-none shadow-xs">
          {whiteCornerOrientation}
        </span>
      </div>
    );
  }

  // ==========================================
  // 3. TOP-DOWN 2D RECOGNITION (ZBLL, PLL, OLL)
  // ==========================================
  let topColors = caseData.topColors ? caseData.topColors.map((r) => [...r]) : undefined;
  let sideYellow = caseData.sideYellow ? { ...caseData.sideYellow } : undefined;
  let pllSides: {
    top: string[];
    bottom: string[];
    left: string[];
    right: string[];
  } | null = null;

  if (caseData.sideColors) {
    pllSides = {
      top: caseData.sideColors.back || caseData.sideColors.top || ['B', 'B', 'B'],
      bottom: caseData.sideColors.front || caseData.sideColors.bottom || ['G', 'G', 'G'],
      left: caseData.sideColors.left || ['O', 'O', 'O'],
      right: caseData.sideColors.right || ['R', 'R', 'R'],
    };
  }

  let activeArrows: PllArrow[] = caseData.pllArrows ? [...caseData.pllArrows] : [];

  if (effectiveScramble) {
    try {
      const unsolvedState = applyAlgorithm(createCfopSolvedCube(), effectiveScramble);

      if (isZbll) {
        // ZBLL: Authentic SpeedCubeDB / VisualCube recognition diagram
        // Top face shows authentic sticker colors (Yellow cross + center + oriented corners, true colors for unoriented corners)
        // 12 side stickers show true face colors (including yellow pointing outward) for complete CP + EP recognition
        // Strictly NO cycle arrows per speedcubing standard
        topColors = unsolvedState.U.map((row) => [...row]);
        pllSides = getTopLayerSideColors(unsolvedState);
        sideYellow = undefined;
        activeArrows = []; // ZBLL is recognized strictly by stickers, never cycle arrows
      } else if (isPll) {
        // Pure PLL: Top face is 100% yellow
        topColors = [
          ['Y', 'Y', 'Y'],
          ['Y', 'Y', 'Y'],
          ['Y', 'Y', 'Y'],
        ];
        pllSides = getTopLayerSideColors(unsolvedState);
        const derived = derivePllArrowsFromState(unsolvedState);
        activeArrows = derived.length > 0 ? derived : (caseData.pllArrows || []);
      } else if (isOll) {
        // Pure OLL: Top yellow facelets + side yellow indicators
        topColors = unsolvedState.U.map((row) =>
          row.map((c) => (c === 'Y' ? 'Y' : 'N'))
        );
        sideYellow = getSideYellowFromCube(unsolvedState);
        activeArrows = [];
      } else {
        if (!topColors) {
          topColors = getTopColorsMatrix(unsolvedState);
        }
      }
    } catch {
      // fallback
    }
  }

  // Fallback defaults
  if (isZbll) {
    if (!topColors) {
      topColors = [
        ['Y', 'Y', 'Y'],
        ['Y', 'Y', 'Y'],
        ['N', 'Y', 'N'],
      ];
    }
    if (!pllSides) {
      pllSides = {
        top: ['B', 'B', 'B'],
        bottom: ['G', 'G', 'G'],
        left: ['O', 'O', 'O'],
        right: ['R', 'R', 'R'],
      };
    }
  } else if (isPll) {
    if (!topColors) {
      topColors = [
        ['Y', 'Y', 'Y'],
        ['Y', 'Y', 'Y'],
        ['Y', 'Y', 'Y'],
      ];
    }
    if (!pllSides) {
      pllSides = {
        top: ['B', 'B', 'B'],
        bottom: ['G', 'G', 'G'],
        left: ['O', 'O', 'O'],
        right: ['R', 'R', 'R'],
      };
    }
  } else if (isOll) {
    if (!topColors) {
      topColors = [
        ['N', 'Y', 'N'],
        ['Y', 'Y', 'Y'],
        ['N', 'Y', 'N'],
      ];
    }
    activeArrows = [];
  } else if (!topColors) {
    topColors = [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ];
  }

  const viewBoxSize = 140;
  const margin = 24;
  const gridSize = viewBoxSize - 2 * margin; // 92px
  const cellSize = gridSize / 3;
  const cellGap = 1.5;

  const getCellCenter = (row: number, col: number) => ({
    x: margin + col * cellSize + cellSize / 2,
    y: margin + row * cellSize + cellSize / 2,
  });

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-neutral-950 border border-neutral-800/90 shadow-inner select-none transition-transform shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`${caseData.name} — ${isZbll ? 'ZBLL Diagram (OLL + PLL)' : isPll ? 'PLL Recognition Diagram' : isOll ? 'OLL Orientation Diagram' : '2D Diagram'}`}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full p-0.5 drop-shadow-sm"
        shapeRendering="geometricPrecision"
      >
        {/* Outer Frame glow */}
        <rect
          x={margin - 14}
          y={margin - 14}
          width={gridSize + 28}
          height={gridSize + 28}
          fill="#0a0a0a"
          rx={8}
          stroke="#1f1f1f"
          strokeWidth={1}
        />

        {/* Outer cube top face border */}
        <rect
          x={margin - 2}
          y={margin - 2}
          width={gridSize + 4}
          height={gridSize + 4}
          fill="#141414"
          rx={5}
          stroke="#333333"
          strokeWidth={1.5}
        />

        {/* 3x3 Facelets */}
        {topColors.map((row, r) =>
          row.map((cell, c) => {
            const x = margin + c * cellSize + cellGap;
            const y = margin + r * cellSize + cellGap;
            const w = cellSize - 2 * cellGap;
            const h = cellSize - 2 * cellGap;
            const isYellow = cell === 'Y';

            return (
              <rect
                key={`cell-${r}-${c}`}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={3.5}
                fill={getColorHex(cell)}
                stroke={isYellow ? '#d97706' : '#2e2e2e'}
                strokeWidth={isYellow ? 1.2 : 0.8}
              />
            );
          })
        )}

        {/* PLL & ZBLL MODE: Full 12 True-Color Side Stickers */}
        {(isPll || isZbll) && pllSides && (
          <g className="pll-side-stickers">
            {/* Top / North side stickers (Back face) */}
            {pllSides.top.map((colorCode, c) => {
              const x = margin + c * cellSize + cellGap;
              const y = margin - 11;
              const w = cellSize - 2 * cellGap;
              const h = 7.5;
              return (
                <rect
                  key={`pll-top-${c}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2.2}
                  fill={getColorHex(colorCode)}
                  stroke={getStrokeHex(colorCode)}
                  strokeWidth={1}
                />
              );
            })}

            {/* Bottom / South side stickers (Front face) */}
            {pllSides.bottom.map((colorCode, c) => {
              const x = margin + c * cellSize + cellGap;
              const y = margin + gridSize + 3.5;
              const w = cellSize - 2 * cellGap;
              const h = 7.5;
              return (
                <rect
                  key={`pll-bot-${c}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2.2}
                  fill={getColorHex(colorCode)}
                  stroke={getStrokeHex(colorCode)}
                  strokeWidth={1}
                />
              );
            })}

            {/* Left / West side stickers (Left face) */}
            {pllSides.left.map((colorCode, r) => {
              const x = margin - 11;
              const y = margin + r * cellSize + cellGap;
              const w = 7.5;
              const h = cellSize - 2 * cellGap;
              return (
                <rect
                  key={`pll-left-${r}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2.2}
                  fill={getColorHex(colorCode)}
                  stroke={getStrokeHex(colorCode)}
                  strokeWidth={1}
                />
              );
            })}

            {/* Right / East side stickers (Right face) */}
            {pllSides.right.map((colorCode, r) => {
              const x = margin + gridSize + 3.5;
              const y = margin + r * cellSize + cellGap;
              const w = 7.5;
              const h = cellSize - 2 * cellGap;
              return (
                <rect
                  key={`pll-right-${r}`}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={2.2}
                  fill={getColorHex(colorCode)}
                  stroke={getStrokeHex(colorCode)}
                  strokeWidth={1}
                />
              );
            })}
          </g>
        )}

        {/* OLL MODE: Side Yellow Indicator Bars */}
        {isOll && sideYellow && (
          <g className="oll-yellow-indicators">
            {/* Top / North side bars */}
            {sideYellow.top?.map((active, c) =>
              active ? (
                <rect
                  key={`top-${c}`}
                  x={margin + c * cellSize + cellGap}
                  y={margin - 9}
                  width={cellSize - 2 * cellGap}
                  height={5.5}
                  rx={2}
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth={1}
                />
              ) : null
            )}

            {/* Bottom / South side bars */}
            {sideYellow.bottom?.map((active, c) =>
              active ? (
                <rect
                  key={`bot-${c}`}
                  x={margin + c * cellSize + cellGap}
                  y={margin + gridSize + 3.5}
                  width={cellSize - 2 * cellGap}
                  height={5.5}
                  rx={2}
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth={1}
                />
              ) : null
            )}

            {/* Left / West side bars */}
            {sideYellow.left?.map((active, r) =>
              active ? (
                <rect
                  key={`left-${r}`}
                  x={margin - 9}
                  y={margin + r * cellSize + cellGap}
                  width={5.5}
                  height={cellSize - 2 * cellGap}
                  rx={2}
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth={1}
                />
              ) : null
            )}

            {/* Right / East side bars */}
            {sideYellow.right?.map((active, r) =>
              active ? (
                <rect
                  key={`right-${r}`}
                  x={margin + gridSize + 3.5}
                  y={margin + r * cellSize + cellGap}
                  width={5.5}
                  height={cellSize - 2 * cellGap}
                  rx={2}
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth={1}
                />
              ) : null
            )}
          </g>
        )}

        {/* PLL Permutation Cycle Arrows (Pure PLL only, NEVER ZBLL) */}
        {showArrows &&
          isPll &&
          !isZbll &&
          activeArrows.map((arr, idx) => {
            const start = getCellCenter(arr.from[0], arr.from[1]);
            const end = getCellCenter(arr.to[0], arr.to[1]);

            // Direction vector & arrowhead math
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const arrowHeadLen = 8;

            const x1 = end.x - arrowHeadLen * Math.cos(angle - Math.PI / 5.2);
            const y1 = end.y - arrowHeadLen * Math.sin(angle - Math.PI / 5.2);
            const x2 = end.x - arrowHeadLen * Math.cos(angle + Math.PI / 5.2);
            const y2 = end.y - arrowHeadLen * Math.sin(angle + Math.PI / 5.2);

            return (
              <g key={`arrow-${idx}`} className="opacity-95 drop-shadow-md">
                {/* Dark stroke background for high contrast against yellow facelets */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#0f172a"
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
                {/* Arrow shaft */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#0d9488"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                />
                {/* Forward arrowhead dark border */}
                <polygon
                  points={`${end.x},${end.y} ${x1},${y1} ${x2},${y2}`}
                  fill="#0f172a"
                />
                {/* Forward arrowhead teal fill */}
                <polygon
                  points={`${end.x - Math.cos(angle) * 1},${end.y - Math.sin(angle) * 1} ${
                    x1 + Math.cos(angle) * 0.5
                  },${y1 + Math.sin(angle) * 0.5} ${x2 + Math.cos(angle) * 0.5},${
                    y2 + Math.sin(angle) * 0.5
                  }`}
                  fill="#14b8a6"
                />

                {/* Bidirectional reverse arrowhead */}
                {arr.bidirectional && (
                  <>
                    <polygon
                      points={`${start.x},${start.y} ${
                        start.x + arrowHeadLen * Math.cos(angle - Math.PI / 5.2)
                      },${
                        start.y + arrowHeadLen * Math.sin(angle - Math.PI / 5.2)
                      } ${
                        start.x + arrowHeadLen * Math.cos(angle + Math.PI / 5.2)
                      },${
                        start.y + arrowHeadLen * Math.sin(angle + Math.PI / 5.2)
                      }`}
                      fill="#0f172a"
                    />
                    <polygon
                      points={`${start.x + Math.cos(angle) * 1},${
                        start.y + Math.sin(angle) * 1
                      } ${
                        start.x + (arrowHeadLen - 1) * Math.cos(angle - Math.PI / 5.2)
                      },${
                        start.y + (arrowHeadLen - 1) * Math.sin(angle - Math.PI / 5.2)
                      } ${
                        start.x + (arrowHeadLen - 1) * Math.cos(angle + Math.PI / 5.2)
                      },${
                        start.y + (arrowHeadLen - 1) * Math.sin(angle + Math.PI / 5.2)
                      }`}
                      fill="#14b8a6"
                    />
                  </>
                )}
              </g>
            );
          })}
      </svg>

      {/* Recognition Badge */}
      <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold text-teal-300 bg-neutral-900/95 px-1 py-0.2 rounded border border-teal-500/40 pointer-events-none shadow-xs">
        {isZbll
          ? caseData.group?.replace('ZBLL ', '')
            ? `ZBLL · ${caseData.group.replace('ZBLL ', '')}`
            : 'ZBLL'
          : isPll
          ? 'PLL'
          : isOll
          ? 'OLL'
          : '2D'}
      </span>
    </div>
  );
};
