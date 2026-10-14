import { AlgorithmCase } from '../types/cube';
import { ZBLL_DATABASE } from './zbllData';

const BASE_ALGORITHM_DATABASE: AlgorithmCase[] = [
  // ==========================================
  // CROSS (Foundation Techniques)
  // ==========================================
  {
    id: 'cross_1',
    category: 'cross',
    name: 'Cross 1 — Direct Orientation Insertion',
    caseNumber: 1,
    group: 'Direct Insertions',
    algorithm: "F2",
    alternativeAlgorithms: ["R2", "L2", "B2"],
    notes: 'White edge sticker matches front center and white sticker is on top. Direct 180° rotation into bottom cross.',
    topColors: [
      ['N', 'W', 'N'],
      ['N', 'Y', 'N'],
      ['N', 'W', 'N']
    ]
  },
  {
    id: 'cross_2',
    category: 'cross',
    name: 'Cross 2 — Flipped Edge in Front Layer',
    caseNumber: 2,
    group: 'Flipped Edges',
    algorithm: "F' U' R U",
    alternativeAlgorithms: ["d R' F R", "U' R' F R"],
    notes: 'White sticker on front and color sticker on top: slide to right side and insert cleanly without displacing other cross pieces.',
    topColors: [
      ['N', 'N', 'N'],
      ['N', 'Y', 'N'],
      ['N', 'N', 'N']
    ]
  },
  {
    id: 'cross_3',
    category: 'cross',
    name: 'Cross 3 — Edge Trapped in Middle Layer',
    caseNumber: 3,
    group: 'Middle Layer',
    algorithm: "R' D' R D",
    alternativeAlgorithms: ["R U' R' F", "F D' F'"],
    notes: 'Edge is in middle layer (FR/FL slot). Displace out while maintaining already solved cross edges.',
    topColors: [
      ['N', 'N', 'N'],
      ['N', 'Y', 'N'],
      ['N', 'N', 'N']
    ]
  },
  {
    id: 'cross_4',
    category: 'cross',
    name: 'Cross 4 — Opposites Placement & Alignment',
    caseNumber: 4,
    group: 'Advanced Cross Strategy',
    algorithm: "R2 L2 D2",
    alternativeAlgorithms: ["D2 R2 L2 D2"],
    notes: 'Place opposite color edges (e.g. Blue opposite Green, Red opposite Orange) and execute D2 to align all 4 cross edges at once.',
    topColors: [
      ['N', 'N', 'N'],
      ['N', 'Y', 'N'],
      ['N', 'N', 'N']
    ]
  },
  {
    id: 'cross_5',
    category: 'cross',
    name: 'Cross 5 — Keyhole Insertion with D-Turn',
    caseNumber: 5,
    group: 'D-Layer Offset',
    algorithm: "D R' F R D'",
    alternativeAlgorithms: ["D' F R' F' D"],
    notes: 'Rotate D-layer first to position open slot under the target piece, insert edge, then restore cross with D prime.',
    topColors: [
      ['N', 'N', 'N'],
      ['N', 'Y', 'N'],
      ['N', 'N', 'N']
    ]
  },

  // ==========================================
  // PLL (ALL 21 CASES - SPEEDCUBEDB VERIFIED)
  // ==========================================
  {
    id: 'pll_t',
    category: 'pll',
    name: 'T Permutation',
    caseNumber: 'T',
    group: 'Adjacent Corner Swap',
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    alternativeAlgorithms: ["F R U' R' U R U R2 F' R U R U' R'"],
    notes: 'Headlights on left. Swaps right two corners (UBR <-> UFR) and left/right edges (UL <-> UR).',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 2], to: [2, 2], bidirectional: true }, // right corners UBR <-> UFR
      { from: [1, 0], to: [1, 2], bidirectional: true }, // edges UL <-> UR
    ]
  },
  {
    id: 'pll_ua',
    category: 'pll',
    name: 'Ua Permutation',
    caseNumber: 'Ua',
    group: 'Edges Only',
    algorithm: "R U' R U R U R U' R' U' R2",
    alternativeAlgorithms: ["M2 U M U2 M' U M2", "R2 U' R' U' R U R U R U' R"],
    notes: 'Clockwise 3-edge cycle with solved bar at back.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [1, 0], to: [2, 1] }, // UL -> UF
      { from: [1, 2], to: [1, 0] }, // UR -> UL
      { from: [2, 1], to: [1, 2] }, // UF -> UR
    ]
  },
  {
    id: 'pll_ub',
    category: 'pll',
    name: 'Ub Permutation',
    caseNumber: 'Ub',
    group: 'Edges Only',
    algorithm: "R2 U R U R' U' R' U' R' U R'",
    alternativeAlgorithms: ["M2 U' M U2 M' U' M2"],
    notes: 'Counter-clockwise 3-edge cycle with solved bar at back.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [1, 0], to: [1, 2] }, // UL -> UR
      { from: [1, 2], to: [2, 1] }, // UR -> UF
      { from: [2, 1], to: [1, 0] }, // UF -> UL
    ]
  },
  {
    id: 'pll_h',
    category: 'pll',
    name: 'H Permutation',
    caseNumber: 'H',
    group: 'Edges Only',
    algorithm: "M2 U M2 U2 M2 U M2",
    alternativeAlgorithms: ["M2 U' M2 U2 M2 U' M2"],
    notes: 'Opposite edge swaps: UF <-> UB and UL <-> UR.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [1, 0], to: [1, 2], bidirectional: true }, // UB <-> UF
      { from: [0, 1], to: [2, 1], bidirectional: true }, // UL <-> UR
    ]
  },
  {
    id: 'pll_z',
    category: 'pll',
    name: 'Z Permutation',
    caseNumber: 'Z',
    group: 'Edges Only',
    algorithm: "M' U' M2 U' M2 U' M' U2 M2 U",
    alternativeAlgorithms: ["M2 U M2 U M' U2 M2 U2 M' U", "M' U M2 U M2 U M' U2 M2 U'"],
    notes: 'Adjacent edge swaps: UF <-> UR and UB <-> UL.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [1, 2], to: [2, 1], bidirectional: true }, // UF <-> UR
      { from: [1, 0], to: [0, 1], bidirectional: true }, // UB <-> UL
    ]
  },
  {
    id: 'pll_aa',
    category: 'pll',
    name: 'Aa Permutation',
    caseNumber: 'Aa',
    group: 'Corners Only',
    algorithm: "x R' U R' D2 R U' R' D2 R2 x'",
    alternativeAlgorithms: ["l' U R' D2 R U' R' D2 R2 x'"],
    notes: 'Headlights in front, cycle 3 corners counter-clockwise.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [2, 0] },
      { from: [2, 0], to: [0, 2] },
      { from: [0, 2], to: [0, 0] },
    ]
  },
  {
    id: 'pll_ab',
    category: 'pll',
    name: 'Ab Permutation',
    caseNumber: 'Ab',
    group: 'Corners Only',
    algorithm: "x' R2 D2 R' U' R D2 R' U R' x",
    alternativeAlgorithms: ["R2 B2 R F R' B2 R F' R", "x' R U' R D2 R' U R D2 R2 x"],
    notes: 'Clockwise 3-corner cycle with headlights in front.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [0, 2] },
      { from: [0, 2], to: [2, 0] },
      { from: [2, 0], to: [0, 0] },
    ]
  },
  {
    id: 'pll_e',
    category: 'pll',
    name: 'E Permutation',
    caseNumber: 'E',
    group: 'Diagonal Corner Swap',
    algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    alternativeAlgorithms: ["y x' R U' R' D R U R' u2 R' U R D R' U' R"],
    notes: 'Diagonal corners swap with no edge movement.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [2, 2], bidirectional: true }, // UBL <-> UFR
      { from: [2, 0], to: [0, 2], bidirectional: true }, // UBR <-> UFL
    ]
  },
  {
    id: 'pll_f',
    category: 'pll',
    name: 'F Permutation',
    caseNumber: 'F',
    group: 'Adjacent Corner Swap',
    algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    alternativeAlgorithms: ["R' U2 R' d' R' F' R2 U' R' U R' F R U' F"],
    notes: 'T-perm setup into F-perm.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [0, 2], bidirectional: true },
      { from: [1, 2], to: [1, 0], bidirectional: true },
    ]
  },
  {
    id: 'pll_ja',
    category: 'pll',
    name: 'Ja Permutation',
    caseNumber: 'Ja',
    group: 'Adjacent Corner Swap',
    algorithm: "R' U L' U2 R U' R' U2 R L U'",
    alternativeAlgorithms: ["y' L' U' L F L' U' L U L F' L2 U L"],
    notes: 'Block on left with adjacent edge-corner swap.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [2, 0], to: [2, 2], bidirectional: true },
      { from: [1, 0], to: [2, 1], bidirectional: true },
    ]
  },
  {
    id: 'pll_jb',
    category: 'pll',
    name: 'Jb Permutation',
    caseNumber: 'Jb',
    group: 'Adjacent Corner Swap',
    algorithm: "R U R' F' R U R' U' R' F R2 U' R' U'",
    alternativeAlgorithms: ["R U2 R' U' R U2 L' U R' U' L"],
    notes: 'Block on right, lightning fast trigger.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [2, 0], to: [2, 2], bidirectional: true },
      { from: [1, 2], to: [2, 1], bidirectional: true },
    ]
  },
  {
    id: 'pll_ra',
    category: 'pll',
    name: 'Ra Permutation',
    caseNumber: 'Ra',
    group: 'Adjacent Corner Swap',
    algorithm: "R U' R' U' R U R D R' U' R D' R' U2 R' U'",
    alternativeAlgorithms: ["R U R' F' R U2 R' U2 R' F R U R U2 R'"],
    notes: 'Headlights left with 1x2 block.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 2], to: [2, 2], bidirectional: true },
      { from: [1, 0], to: [2, 1], bidirectional: true },
    ]
  },
  {
    id: 'pll_rb',
    category: 'pll',
    name: 'Rb Permutation',
    caseNumber: 'Rb',
    group: 'Adjacent Corner Swap',
    algorithm: "R' U2 R' D' R U' R' D R U R U' R' U' R U'",
    alternativeAlgorithms: ["R' U2 R U2 R' F R U R' U' R' F' R2 U'"],
    notes: 'Headlights front with 1x2 block.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 2], to: [2, 2], bidirectional: true },
      { from: [1, 2], to: [2, 1], bidirectional: true },
    ]
  },
  {
    id: 'pll_v',
    category: 'pll',
    name: 'V Permutation',
    caseNumber: 'V',
    group: 'Diagonal Corner Swap',
    algorithm: "R' U R' U' y R' F' R2 U' R' U R' F R F",
    alternativeAlgorithms: ["R' U R' U' B' D B' D' B2 R' B' R B R"],
    notes: '2x2 block in back-left.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [2, 2], bidirectional: true },
      { from: [0, 1], to: [1, 2], bidirectional: true },
    ]
  },
  {
    id: 'pll_y',
    category: 'pll',
    name: 'Y Permutation',
    caseNumber: 'Y',
    group: 'Diagonal Corner Swap',
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    alternativeAlgorithms: ["R2 U' R' U R U' x' z' R U' R' U' R U R'"],
    notes: 'Opposite corners and adjacent edges swap.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 2], to: [2, 0], bidirectional: true },
      { from: [0, 1], to: [1, 0], bidirectional: true },
    ]
  },
  {
    id: 'pll_na',
    category: 'pll',
    name: 'Na Permutation',
    caseNumber: 'Na',
    group: 'Diagonal Corner Swap',
    algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    alternativeAlgorithms: ["z U R' D R2 U' R D' U R' D R2 U' R D'"],
    notes: 'Diagonal corners swap, double Jb perm trigger.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [2, 2], bidirectional: true },
      { from: [1, 2], to: [2, 1], bidirectional: true },
    ]
  },
  {
    id: 'pll_nb',
    category: 'pll',
    name: 'Nb Permutation',
    caseNumber: 'Nb',
    group: 'Diagonal Corner Swap',
    algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    alternativeAlgorithms: ["z' U' R D' R2 U R' D U' R D' R2 U R' D"],
    notes: 'Diagonal corners swap, double Ja perm trigger.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [2, 0], to: [0, 2], bidirectional: true },
      { from: [1, 0], to: [0, 1], bidirectional: true },
    ]
  },
  {
    id: 'pll_ga',
    category: 'pll',
    name: 'Ga Permutation',
    caseNumber: 'Ga',
    group: 'G Permutations',
    algorithm: "R2 U R' U R' U' R U' R2 D U' R' U R D'",
    alternativeAlgorithms: ["R2 u R' U R' U' R u' R2 y' R' U R"],
    notes: 'Headlights left, 1x2 block in front.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [2, 0], to: [2, 2] },
      { from: [2, 2], to: [0, 2] },
      { from: [0, 2], to: [2, 0] },
    ]
  },
  {
    id: 'pll_gb',
    category: 'pll',
    name: 'Gb Permutation',
    caseNumber: 'Gb',
    group: 'G Permutations',
    algorithm: "R' U' R y R2 u R' U R U' R u' R2",
    alternativeAlgorithms: ["F' U' F R2 u R' U R U' R u' R2"],
    notes: 'Headlights left, 1x2 block in back.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 2], to: [2, 2] },
      { from: [2, 2], to: [2, 0] },
      { from: [2, 0], to: [0, 2] },
    ]
  },
  {
    id: 'pll_gc',
    category: 'pll',
    name: 'Gc Permutation',
    caseNumber: 'Gc',
    group: 'G Permutations',
    algorithm: "R2 U' R U' R U R' U R2 D' U R U' R' D",
    alternativeAlgorithms: ["R2 u' R U' R U R' u R2 y R U' R'"],
    notes: 'Headlights left, 1x2 block right.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [2, 0] },
      { from: [2, 0], to: [2, 2] },
      { from: [2, 2], to: [0, 0] },
    ]
  },
  {
    id: 'pll_gd',
    category: 'pll',
    name: 'Gd Permutation',
    caseNumber: 'Gd',
    group: 'G Permutations',
    algorithm: "R U R' y' R2 u' R U' R' U R' u R2",
    alternativeAlgorithms: ["R U R' U' D R2 U' R U' R' U R' U R2 D'"],
    notes: 'Headlights left, 1x2 block back-right.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [2, 2], to: [2, 0] },
      { from: [2, 0], to: [0, 0] },
      { from: [0, 0], to: [2, 2] },
    ]
  },

  // ==========================================
  // OLL (COMPLETE SPEEDCUBEDB VERIFIED 57 CASES)
  // ==========================================
  {
    id: 'oll_1',
    category: 'oll',
    name: 'OLL 1 — Dot (Runway)',
    caseNumber: 1,
    group: 'Dot Cases',
    algorithm: "R U2 R2 F R F' U2 R' F R F'",
    alternativeAlgorithms: ["y F R U R' U' F' f R U R' U' f'"],
    notes: 'No edges oriented, corners unoriented pointing front and back.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [false, true, false], bottom: [false, true, false], left: [true, true, true], right: [true, true, true] }
  },
  {
    id: 'oll_2',
    category: 'oll',
    name: 'OLL 2 — Dot (Zamboni)',
    caseNumber: 2,
    group: 'Dot Cases',
    algorithm: "r U r' U2 r U2 R' U2 R U' r'",
    alternativeAlgorithms: ["F R U R' U' F' f R U R' U' f'"],
    notes: 'No edges oriented, two diagonal corners oriented.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [true, true, false], bottom: [false, true, true], left: [true, true, false], right: [false, true, true] }
  },
  {
    id: 'oll_3',
    category: 'oll',
    name: 'OLL 3 — Dot (Anti-Zamboni)',
    caseNumber: 3,
    group: 'Dot Cases',
    algorithm: "r' R2 U R' U r U2 r' U M'",
    alternativeAlgorithms: ["f R U R' U' f' U' F R U R' U' F'"],
    notes: 'No edges oriented.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [false, true, true], bottom: [true, true, false], left: [false, true, true], right: [true, true, false] }
  },
  {
    id: 'oll_4',
    category: 'oll',
    name: 'OLL 4 — Dot (Ying Yang)',
    caseNumber: 4,
    group: 'Dot Cases',
    algorithm: "M U' r U2 r' U' R U' R' M'",
    alternativeAlgorithms: ["f R U R' U' f' U F R U R' U' F'"],
    notes: 'No edges oriented, two adjacent corners facing.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [true, true, true], bottom: [false, true, false], left: [false, true, true], right: [false, true, true] }
  },
  {
    id: 'oll_5',
    category: 'oll',
    name: 'OLL 5 — Right Back Square',
    caseNumber: 5,
    group: 'Square Cases',
    algorithm: "r' U2 R U R' U r",
    alternativeAlgorithms: ["l' U2 L U L' U l"],
    notes: '2x2 square in back-right.',
    topColors: [['N','Y','Y'],['N','Y','Y'],['N','N','N']],
    sideYellow: { top: [true, false, false], bottom: [true, true, true], left: [false, true, false], right: [false, false, false] }
  },
  {
    id: 'oll_6',
    category: 'oll',
    name: 'OLL 6 — Left Back Square',
    caseNumber: 6,
    group: 'Square Cases',
    algorithm: "r U2 R' U' R U' r'",
    alternativeAlgorithms: ["y2 l U2 L' U' L U' l'"],
    notes: '2x2 square in back-left.',
    topColors: [['Y','Y','N'],['Y','Y','N'],['N','N','N']],
    sideYellow: { top: [false, false, true], bottom: [true, true, true], left: [false, false, false], right: [false, true, false] }
  },
  {
    id: 'oll_7',
    category: 'oll',
    name: 'OLL 7 — Small Lightning (Right)',
    caseNumber: 7,
    group: 'Lightning Cases',
    algorithm: "r U R' U R U2 r'",
    alternativeAlgorithms: ["y2 l U L' U L U2 l'"],
    notes: 'Lightning shape pointing top right.',
    topColors: [['N','N','Y'],['N','Y','Y'],['Y','N','N']],
    sideYellow: { top: [true, true, false], bottom: [false, true, true], left: [false, true, false], right: [false, false, false] }
  },
  {
    id: 'oll_8',
    category: 'oll',
    name: 'OLL 8 — Small Lightning (Left)',
    caseNumber: 8,
    group: 'Lightning Cases',
    algorithm: "r' U' R U' R' U2 r",
    alternativeAlgorithms: ["l' U' L U' L' U2 l"],
    notes: 'Lightning shape pointing top left.',
    topColors: [['Y','N','N'],['Y','Y','N'],['N','N','Y']],
    sideYellow: { top: [false, true, true], bottom: [true, true, false], left: [false, false, false], right: [false, true, false] }
  },
  {
    id: 'oll_9',
    category: 'oll',
    name: 'OLL 9 — Kite (Right)',
    caseNumber: 9,
    group: 'Fish Cases',
    algorithm: "R U R' U' R' F R2 U R' U' F'",
    alternativeAlgorithms: ["y2 R' U' R U' R' U y' R' U R B"],
    notes: 'Fish shape right orientation.',
    topColors: [['N','N','Y'],['N','Y','Y'],['N','Y','N']],
    sideYellow: { top: [true, true, false], bottom: [true, false, false], left: [true, true, false], right: [false, false, true] }
  },
  {
    id: 'oll_10',
    category: 'oll',
    name: 'OLL 10 — Kite (Left)',
    caseNumber: 10,
    group: 'Fish Cases',
    algorithm: "R U R' U R' F R F' R U2 R'",
    alternativeAlgorithms: ["y2 F U R U' R' F' R U R' U' R' F R F'"],
    notes: 'Fish shape left orientation.',
    topColors: [['Y','N','N'],['Y','Y','N'],['N','Y','N']],
    sideYellow: { top: [false, true, true], bottom: [false, false, true], left: [false, false, true], right: [true, true, false] }
  },
  {
    id: 'oll_11',
    category: 'oll',
    name: 'OLL 11 — Gun (Down)',
    caseNumber: 11,
    group: 'Lightning Cases',
    algorithm: "r U R' U R' F R F' R U2 r'",
    alternativeAlgorithms: ["F' L' U' L U F y F R U R' U' F'"],
    notes: 'Horizontal lightning.',
    topColors: [['N','Y','N'],['N','Y','Y'],['N','N','Y']],
    sideYellow: { top: [true, false, false], bottom: [true, true, false], left: [true, true, true], right: [false, false, false] }
  },
  {
    id: 'oll_12',
    category: 'oll',
    name: 'OLL 12 — Gun (Up)',
    caseNumber: 12,
    group: 'Lightning Cases',
    algorithm: "M' R' U' R U' R' U2 R U' R r'",
    alternativeAlgorithms: ["F R U R' U' F' U F R U R' U' F'"],
    notes: 'Opposite horizontal lightning.',
    topColors: [['N','Y','N'],['Y','Y','N'],['Y','N','N']],
    sideYellow: { top: [false, false, true], bottom: [false, true, true], left: [false, false, false], right: [true, true, true] }
  },
  {
    id: 'oll_13',
    category: 'oll',
    name: 'OLL 13 — Knight Move (Down Right)',
    caseNumber: 13,
    group: 'Knight Cases',
    algorithm: "F U R U' R2 F' R U R U' R'",
    alternativeAlgorithms: ["r U' r' U' r U r' y' R' U R"],
    notes: 'Knight L move facing right.',
    topColors: [['N','Y','N'],['N','Y','N'],['Y','N','Y']],
    sideYellow: { top: [true, false, true], bottom: [false, true, false], left: [false, true, false], right: [false, true, false] }
  },
  {
    id: 'oll_14',
    category: 'oll',
    name: 'OLL 14 — Knight Move (Down Left)',
    caseNumber: 14,
    group: 'Knight Cases',
    algorithm: "R' F R U R' F' R F U' F'",
    alternativeAlgorithms: ["l' U l U l' U' l y F R' F' R"],
    notes: 'Knight L move facing left.',
    topColors: [['Y','N','Y'],['N','Y','N'],['N','Y','N']],
    sideYellow: { top: [false, true, false], bottom: [true, false, true], left: [false, true, false], right: [false, true, false] }
  },
  {
    id: 'oll_15',
    category: 'oll',
    name: 'OLL 15 — Knight Move (Up Left)',
    caseNumber: 15,
    group: 'Knight Cases',
    algorithm: "l' U' l L' U' L U l' U l",
    alternativeAlgorithms: ["r' D' r U' r' D r U r U' r'"],
    notes: 'Inverted knight move.',
    topColors: [['N','N','Y'],['Y','Y','N'],['N','Y','N']],
    sideYellow: { top: [true, false, false], bottom: [true, false, false], left: [false, false, true], right: [true, true, false] }
  },
  {
    id: 'oll_16',
    category: 'oll',
    name: 'OLL 16 — Knight Move (Up Right)',
    caseNumber: 16,
    group: 'Knight Cases',
    algorithm: "r U r' R U R' U' r U' r'",
    alternativeAlgorithms: ["l U l' U' l' U l y' R U R'"],
    notes: 'Inverted knight right.',
    topColors: [['Y','N','N'],['N','Y','Y'],['N','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [false, false, true], left: [true, true, false], right: [false, false, true] }
  },
  {
    id: 'oll_17',
    category: 'oll',
    name: 'OLL 17 — Dot (Diagonal)',
    caseNumber: 17,
    group: 'Dot Cases',
    algorithm: "R U R' U R' F R F' U2 R' F R F'",
    alternativeAlgorithms: ["F R' F' R2 r' U R U' r' R U' R'"],
    notes: 'Dot with two diagonal corners facing front and left.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [true, true, false], bottom: [true, true, false], left: [false, true, true], right: [false, true, true] }
  },
  {
    id: 'oll_18',
    category: 'oll',
    name: 'OLL 18 — Dot (Crown)',
    caseNumber: 18,
    group: 'Dot Cases',
    algorithm: "r U R' U R U2 r2 U' R U' R' U2 r",
    alternativeAlgorithms: ["y F R U R' U' F' U2 F R U R' U' F'"],
    notes: 'Dot with headlights on sides.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [false, true, false], bottom: [false, true, false], left: [true, true, true], right: [true, true, true] }
  },
  {
    id: 'oll_19',
    category: 'oll',
    name: 'OLL 19 — Dot (Moustache)',
    caseNumber: 19,
    group: 'Dot Cases',
    algorithm: "r' R U R U R' U' M' R' F R F'",
    alternativeAlgorithms: ["M U R U R' U' M' R' F R F'"],
    notes: 'Dot with headlights front and back.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [true, true, true], bottom: [true, true, true], left: [false, true, false], right: [false, true, false] }
  },
  {
    id: 'oll_20',
    category: 'oll',
    name: 'OLL 20 — Dot (X-Dot)',
    caseNumber: 20,
    group: 'Dot Cases',
    algorithm: "M U R U R' U' M2 U R U' r'",
    alternativeAlgorithms: ["M' U M U2 M' U M"],
    notes: 'Pure dot with zero yellow stickers on top except center.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
    sideYellow: { top: [false, true, false], bottom: [false, true, false], left: [false, true, false], right: [false, true, false] }
  },
  {
    id: 'oll_21',
    category: 'oll',
    name: 'OLL 21 — Cross (Double Sune / H)',
    caseNumber: 21,
    group: 'All Edges Oriented',
    algorithm: "R U2 R' U' R U R' U' R U' R'",
    alternativeAlgorithms: ["y F (R U R' U')3 F'", "R U R' U R U' R' U R U2 R'"],
    notes: 'Cross formed with 4 unoriented corners pointing outward in headlights pairs.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['N','Y','N']],
    sideYellow: { top: [false, false, false], bottom: [false, false, false], left: [true, false, true], right: [true, false, true] }
  },
  {
    id: 'oll_22',
    category: 'oll',
    name: 'OLL 22 — Cross (Pi)',
    caseNumber: 22,
    group: 'All Edges Oriented',
    algorithm: "R U2 R2 U' R2 U' R2 U2 R",
    alternativeAlgorithms: ["f R U R' U' f' F R U R' U' F'"],
    notes: 'Cross formed, 2 headlights on left, 2 corners opposite front and back.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['N','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [false, false, true], left: [true, false, true], right: [false, false, false] }
  },
  {
    id: 'oll_23',
    category: 'oll',
    name: 'OLL 23 — Cross (Headlights / U)',
    caseNumber: 23,
    group: 'All Edges Oriented',
    algorithm: "R2 D R' U2 R D' R' U2 R'",
    alternativeAlgorithms: ["y2 R2 D' R U2 R' D R U2 R"],
    notes: 'Headlights in front, 2 yellow corners solved on back.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['N','Y','N']],
    sideYellow: { top: [false, false, false], bottom: [true, false, true], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: 'oll_24',
    category: 'oll',
    name: 'OLL 24 — Cross (Chameleon / T)',
    caseNumber: 24,
    group: 'All Edges Oriented',
    algorithm: "r U R' U' r' F R F'",
    alternativeAlgorithms: ["L F R' F' L' F R F'"],
    notes: 'Two corners facing opposite sideways, two corners top solved.',
    topColors: [['N','Y','Y'],['Y','Y','Y'],['N','Y','Y']],
    sideYellow: { top: [false, false, false], bottom: [false, false, false], left: [true, false, true], right: [false, false, false] }
  },
  {
    id: 'oll_25',
    category: 'oll',
    name: 'OLL 25 — Cross (Bowtie / L)',
    caseNumber: 25,
    group: 'All Edges Oriented',
    algorithm: "F' r U R' U' r' F R",
    alternativeAlgorithms: ["x' R U' R' D R U R' D' x"],
    notes: 'One corner solved front-left and one back-right, two diagonals opposite.',
    topColors: [['N','Y','Y'],['Y','Y','Y'],['Y','Y','N']],
    sideYellow: { top: [true, false, false], bottom: [false, false, true], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: 'oll_26',
    category: 'oll',
    name: 'OLL 26 — Anti-Sune',
    caseNumber: 26,
    group: 'All Edges Oriented',
    algorithm: "R U2 R' U' R U' R'",
    alternativeAlgorithms: ["y' R' U' R U' R' U2 R"],
    notes: 'One yellow corner top right, other corners cycle clockwise.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['N','Y','Y']],
    sideYellow: { top: [true, false, false], bottom: [true, false, false], left: [false, false, false], right: [true, false, false] }
  },
  {
    id: 'oll_27',
    category: 'oll',
    name: 'OLL 27 — Sune',
    caseNumber: 27,
    group: 'All Edges Oriented',
    algorithm: "R U R' U R U2 R'",
    alternativeAlgorithms: ["y' R' U2 R U R' U R"],
    notes: 'The iconic speedcubing algorithm: corner solved at bottom-left, others facing right.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['Y','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [false, false, true], left: [false, false, true], right: [false, false, false] }
  },
  {
    id: 'oll_28',
    category: 'oll',
    name: 'OLL 28 — Stealth / Flying Bird',
    caseNumber: 28,
    group: 'Corners Oriented',
    algorithm: "r U R' U' r' R U R U' R'",
    alternativeAlgorithms: ["y M' U M U2 M' U M"],
    notes: 'All 4 corners oriented, 2 opposite edges flipped.',
    topColors: [['Y','N','Y'],['Y','Y','Y'],['Y','N','Y']],
    sideYellow: { top: [false, true, false], bottom: [false, true, false], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: 'oll_29',
    category: 'oll',
    name: 'OLL 29 — Awkward Shape (Spot)',
    caseNumber: 29,
    group: 'Awkward Cases',
    algorithm: "R U R' U' R U' R' F' U' F R U R'",
    alternativeAlgorithms: ["y2 r2 D' r U r' D r2 U' r' U' r"],
    notes: 'Awkward shape with 2 adjacent corners facing.',
    topColors: [['Y','Y','N'],['N','Y','Y'],['N','N','Y']],
    sideYellow: { top: [false, false, true], bottom: [true, true, false], left: [false, true, true], right: [false, false, false] }
  },
  {
    id: 'oll_30',
    category: 'oll',
    name: 'OLL 30 — Awkward Shape (Blank)',
    caseNumber: 30,
    group: 'Awkward Cases',
    algorithm: "F R' F R2 U' R' U' R U R' F2",
    alternativeAlgorithms: ["r2 D r' U' r D' r2 U r U r'"],
    notes: 'Awkward shape mirror.',
    topColors: [['N','Y','Y'],['Y','Y','N'],['Y','N','N']],
    sideYellow: { top: [true, false, false], bottom: [false, true, true], left: [false, false, false], right: [true, true, false] }
  },
  {
    id: 'oll_31',
    category: 'oll',
    name: 'OLL 31 — Couch (Left)',
    caseNumber: 31,
    group: 'P-Shapes',
    algorithm: "R' U' F U R U' R' F' R",
    alternativeAlgorithms: ["y2 S' L' U' L U f R' F' R"],
    notes: 'P-shape on left.',
    topColors: [['Y','Y','N'],['Y','Y','N'],['N','N','N']],
    sideYellow: { top: [false, false, true], bottom: [true, true, true], left: [false, false, false], right: [false, true, false] }
  },
  {
    id: 'oll_32',
    category: 'oll',
    name: 'OLL 32 — Couch (Right)',
    caseNumber: 32,
    group: 'P-Shapes',
    algorithm: "L U F' U' L' U L F L'",
    alternativeAlgorithms: ["R U B' U' R' U R B R'"],
    notes: 'P-shape on right.',
    topColors: [['N','Y','Y'],['N','Y','Y'],['N','N','N']],
    sideYellow: { top: [true, false, false], bottom: [true, true, true], left: [false, true, false], right: [false, false, false] }
  },
  {
    id: 'oll_33',
    category: 'oll',
    name: 'OLL 33 — T-Shape (Key)',
    caseNumber: 33,
    group: 'T-Shapes',
    algorithm: "R U R' U' R' F R F'",
    alternativeAlgorithms: ["y2 F R U R' U' F'"],
    notes: 'Sexy move into sledgehammer.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['N','N','N']],
    sideYellow: { top: [true, false, true], bottom: [true, true, true], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: 'oll_34',
    category: 'oll',
    name: 'OLL 34 — C-Shape (City)',
    caseNumber: 34,
    group: 'C-Shapes',
    algorithm: "R U R2 U' R' F R U R U' F'",
    alternativeAlgorithms: ["F R U R' U' R' F' r U R U' r'"],
    notes: 'C-shape with headlights in front.',
    topColors: [['Y','Y','N'],['N','Y','N'],['Y','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [false, false, true], left: [false, true, false], right: [true, true, true] }
  },
  {
    id: 'oll_35',
    category: 'oll',
    name: 'OLL 35 — Fish (Manta Ray)',
    caseNumber: 35,
    group: 'Fish Cases',
    algorithm: "R U2 R2 F R F' R U2 R'",
    alternativeAlgorithms: ["R U B' R B R2 U' R' F R F'"],
    notes: 'Fish outline facing top-left.',
    topColors: [['Y','N','N'],['N','Y','Y'],['N','Y','Y']],
    sideYellow: { top: [false, true, true], bottom: [true, false, false], left: [true, true, false], right: [false, false, false] }
  },
  {
    id: 'oll_36',
    category: 'oll',
    name: 'OLL 36 — W-Shape (Right)',
    caseNumber: 36,
    group: 'W-Shapes',
    algorithm: "L' U' L U' L' U L U L F' L' F",
    alternativeAlgorithms: ["R' U' R U' R' U R U R B' R' B"],
    notes: 'W-shape on right.',
    topColors: [['Y','N','N'],['N','Y','Y'],['N','Y','Y']],
    sideYellow: { top: [false, true, true], bottom: [true, false, false], left: [true, true, false], right: [false, false, false] }
  },
  {
    id: 'oll_37',
    category: 'oll',
    name: 'OLL 37 — Fish (Mounted Fish)',
    caseNumber: 37,
    group: 'Fish Cases',
    algorithm: "F R U' R' U' R U R' F'",
    alternativeAlgorithms: ["F R' F' R U R U' R'"],
    notes: 'Fish outline facing bottom-right.',
    topColors: [['N','Y','Y'],['Y','Y','N'],['N','N','Y']],
    sideYellow: { top: [true, false, false], bottom: [true, true, false], left: [false, false, true], right: [false, true, false] }
  },
  {
    id: 'oll_38',
    category: 'oll',
    name: 'OLL 38 — W-Shape (Left)',
    caseNumber: 38,
    group: 'W-Shapes',
    algorithm: "R U R' U R U' R' U' R' F R F'",
    alternativeAlgorithms: ["F R U' R' U' R U R' F'"],
    notes: 'W-shape on left.',
    topColors: [['N','N','Y'],['Y','Y','N'],['Y','Y','N']],
    sideYellow: { top: [true, true, false], bottom: [false, false, true], left: [false, false, false], right: [true, true, false] }
  },
  {
    id: 'oll_39',
    category: 'oll',
    name: 'OLL 39 — Big Lightning (Right)',
    caseNumber: 39,
    group: 'Lightning Cases',
    algorithm: "L F' L' U' L U F U' L'",
    alternativeAlgorithms: ["R B' R' U' R U B U' R'"],
    notes: 'Large lightning bolt facing right.',
    topColors: [['Y','Y','N'],['N','Y','Y'],['N','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [true, false, false], left: [false, true, true], right: [false, false, true] }
  },
  {
    id: 'oll_40',
    category: 'oll',
    name: 'OLL 40 — Big Lightning (Left)',
    caseNumber: 40,
    group: 'Lightning Cases',
    algorithm: "R' F R U R' U' F' U R",
    alternativeAlgorithms: ["y2 L F' L' U' L U F U' L'"],
    notes: 'Large lightning bolt facing left.',
    topColors: [['N','Y','Y'],['Y','Y','N'],['N','Y','N']],
    sideYellow: { top: [true, false, false], bottom: [false, false, true], left: [true, false, false], right: [false, true, true] }
  },
  {
    id: 'oll_41',
    category: 'oll',
    name: 'OLL 41 — Awkward Shape (Left Hook)',
    caseNumber: 41,
    group: 'Awkward Cases',
    algorithm: "R U R' U R U2 R' F R U R' U' F'",
    alternativeAlgorithms: ["y2 F U R U2 R' U' R U R' F'"],
    notes: 'Hook on left.',
    topColors: [['N','Y','N'],['Y','Y','N'],['N','N','Y']],
    sideYellow: { top: [true, false, true], bottom: [true, true, false], left: [false, false, true], right: [true, true, false] }
  },
  {
    id: 'oll_42',
    category: 'oll',
    name: 'OLL 42 — Awkward Shape (Right Hook)',
    caseNumber: 42,
    group: 'Awkward Cases',
    algorithm: "R' U' R U' R' U2 R F R U R' U' F'",
    alternativeAlgorithms: ["y2 F' U' L' U2 L U L' U' L F"],
    notes: 'Hook on right.',
    topColors: [['N','Y','N'],['N','Y','Y'],['Y','N','N']],
    sideYellow: { top: [true, false, true], bottom: [false, true, true], left: [true, true, false], right: [false, false, true] }
  },
  {
    id: 'oll_43',
    category: 'oll',
    name: 'OLL 43 — P-Shape (Left Front)',
    caseNumber: 43,
    group: 'P-Shapes',
    algorithm: "f' L' U' L U f",
    alternativeAlgorithms: ["F' U' L' U L F"],
    notes: 'P-shape front-left.',
    topColors: [['Y','Y','N'],['Y','Y','N'],['N','N','N']],
    sideYellow: { top: [false, false, true], bottom: [true, true, true], left: [false, false, false], right: [false, true, false] }
  },
  {
    id: 'oll_44',
    category: 'oll',
    name: 'OLL 44 — P-Shape (Right Front)',
    caseNumber: 44,
    group: 'P-Shapes',
    algorithm: "f R U R' U' f'",
    alternativeAlgorithms: ["y2 F U R U' R' F'"],
    notes: 'Wide F sexy move wide F prime.',
    topColors: [['N','Y','Y'],['N','Y','Y'],['N','N','N']],
    sideYellow: { top: [true, false, false], bottom: [true, true, true], left: [false, true, false], right: [false, false, false] }
  },
  {
    id: 'oll_45',
    category: 'oll',
    name: 'OLL 45 — T-Shape (Streetlights)',
    caseNumber: 45,
    group: 'T-Shapes',
    algorithm: "F R U R' U' F'",
    alternativeAlgorithms: ["y2 R' U' F' U F R"],
    notes: 'Standard beginner edge-orienting algorithm.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['N','N','N']],
    sideYellow: { top: [false, false, false], bottom: [true, true, true], left: [true, false, false], right: [true, false, false] }
  },
  {
    id: 'oll_46',
    category: 'oll',
    name: 'OLL 46 — C-Shape (Seein Headlights)',
    caseNumber: 46,
    group: 'C-Shapes',
    algorithm: "R' U' R' F R F' U R",
    alternativeAlgorithms: ["y2 F R U R' U' F'"],
    notes: 'C-shape with headlights facing sideways.',
    topColors: [['Y','Y','N'],['N','Y','N'],['Y','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [false, false, true], left: [false, true, false], right: [false, true, false] }
  },
  {
    id: 'oll_47',
    category: 'oll',
    name: 'OLL 47 — Small L-Shape (Anti-Breakneck)',
    caseNumber: 47,
    group: 'L-Shapes',
    algorithm: "F' L' U' L U L' U' L U F",
    alternativeAlgorithms: ["R' U' R' F R F' R' F R F' U R"],
    notes: 'Small L shape on top right.',
    topColors: [['N','Y','N'],['Y','Y','N'],['N','N','N']],
    sideYellow: { top: [true, false, true], bottom: [true, true, false], left: [false, false, true], right: [true, true, true] }
  },
  {
    id: 'oll_48',
    category: 'oll',
    name: 'OLL 48 — Small L-Shape (Breakneck)',
    caseNumber: 48,
    group: 'L-Shapes',
    algorithm: "F R U R' U' R U R' U' F'",
    alternativeAlgorithms: ["y2 R U R' U' R U' R' F' U' F R U R'"],
    notes: 'Small L shape on top left.',
    topColors: [['N','Y','N'],['N','Y','Y'],['N','N','N']],
    sideYellow: { top: [true, false, true], bottom: [false, true, true], left: [true, true, true], right: [false, false, true] }
  },
  {
    id: 'oll_49',
    category: 'oll',
    name: 'OLL 49 — Small L-Shape (Right)',
    caseNumber: 49,
    group: 'L-Shapes',
    algorithm: "r U' r2 U r2 U r2 U' r",
    alternativeAlgorithms: ["l' U l2 U' l2 U' l2 U l'"],
    notes: 'L-shape with right orientation.',
    topColors: [['N','Y','N'],['Y','Y','N'],['N','N','N']],
    sideYellow: { top: [true, false, false], bottom: [false, true, true], left: [false, false, false], right: [true, true, true] }
  },
  {
    id: 'oll_50',
    category: 'oll',
    name: 'OLL 50 — Small L-Shape (Left)',
    caseNumber: 50,
    group: 'L-Shapes',
    algorithm: "r' U r2 U' r2 U' r2 U r'",
    alternativeAlgorithms: ["y2 l U' l2 U l2 U l2 U' l"],
    notes: 'L-shape with left orientation.',
    topColors: [['N','Y','N'],['N','Y','Y'],['N','N','N']],
    sideYellow: { top: [false, false, true], bottom: [true, true, false], left: [true, true, true], right: [false, false, false] }
  },
  {
    id: 'oll_51',
    category: 'oll',
    name: 'OLL 51 — I-Shape (Bottle Cap)',
    caseNumber: 51,
    group: 'I-Shapes',
    algorithm: "f R U R' U' R U R' U' f'",
    alternativeAlgorithms: ["F U R U' R' U R U' R' F'"],
    notes: 'Horizontal yellow bar across center.',
    topColors: [['N','N','N'],['Y','Y','Y'],['N','N','N']],
    sideYellow: { top: [true, false, true], bottom: [true, false, true], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: 'oll_52',
    category: 'oll',
    name: 'OLL 52 — I-Shape (Rice Cooker)',
    caseNumber: 52,
    group: 'I-Shapes',
    algorithm: "R U R' U R U' B U' B' R'",
    alternativeAlgorithms: ["y2 R' U' R U' R' U F' U F R"],
    notes: 'Vertical yellow bar across center.',
    topColors: [['N','Y','N'],['N','Y','N'],['N','Y','N']],
    sideYellow: { top: [false, false, false], bottom: [false, false, false], left: [true, false, true], right: [true, false, true] }
  },
  {
    id: 'oll_53',
    category: 'oll',
    name: 'OLL 53 — Small L-Shape (Frying Pan)',
    caseNumber: 53,
    group: 'L-Shapes',
    algorithm: "r' U' R U' R' U R U' R' U2 r",
    alternativeAlgorithms: ["l' U2 L U L' U' L U L' U l"],
    notes: 'L-shape with corner at front.',
    topColors: [['N','Y','N'],['Y','Y','N'],['N','N','Y']],
    sideYellow: { top: [true, false, false], bottom: [false, true, false], left: [false, false, false], right: [true, true, true] }
  },
  {
    id: 'oll_54',
    category: 'oll',
    name: 'OLL 54 — Small L-Shape (Anti-Frying Pan)',
    caseNumber: 54,
    group: 'L-Shapes',
    algorithm: "r U R' U R U' R' U R U2 r'",
    alternativeAlgorithms: ["y2 l U2 L' U' L U L' U' L U' l'"],
    notes: 'L-shape mirror with corner at front.',
    topColors: [['N','Y','N'],['N','Y','Y'],['Y','N','N']],
    sideYellow: { top: [false, false, true], bottom: [false, true, false], left: [true, true, true], right: [false, false, false] }
  },
  {
    id: 'oll_55',
    category: 'oll',
    name: 'OLL 55 — I-Shape (Highway)',
    caseNumber: 55,
    group: 'I-Shapes',
    algorithm: "R U2 R2 U' R U' R' U2 F R F'",
    alternativeAlgorithms: ["R' F R U R U' R2 F' R2 U' R' U R U R'"],
    notes: 'Vertical line with all corners unoriented.',
    topColors: [['N','Y','N'],['N','Y','N'],['N','Y','N']],
    sideYellow: { top: [true, false, true], bottom: [true, false, true], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: 'oll_56',
    category: 'oll',
    name: 'OLL 56 — I-Shape (Street)',
    caseNumber: 56,
    group: 'I-Shapes',
    algorithm: "r U r' U R U' R' U R U' R' r U' r'",
    alternativeAlgorithms: ["F R U R' U' R F' r U R' U' r'"],
    notes: 'Horizontal line with all corners unoriented facing right/left.',
    topColors: [['N','N','N'],['Y','Y','Y'],['N','N','N']],
    sideYellow: { top: [false, false, false], bottom: [false, false, false], left: [true, false, true], right: [true, false, true] }
  },
  {
    id: 'oll_57',
    category: 'oll',
    name: 'OLL 57 — H-Shape (Columns)',
    caseNumber: 57,
    group: 'Corners Oriented',
    algorithm: "R U R' U' M' U R U' r'",
    alternativeAlgorithms: ["M' U M U2 M' U M"],
    notes: 'Edges unoriented in line, corners all solved.',
    topColors: [['Y','N','Y'],['Y','Y','Y'],['Y','N','Y']],
    sideYellow: { top: [false, true, false], bottom: [false, true, false], left: [false, false, false], right: [false, false, false] }
  },

  // ==========================================
  // 2-LOOK OLL (10 CASES)
  // ==========================================
  {
    id: '2l_oll_bar',
    category: '2look-oll',
    name: 'Step 1: Yellow Line / Bar',
    caseNumber: 'Line',
    group: 'Edge Orientation',
    algorithm: "F R U R' U' F'",
    alternativeAlgorithms: ["F (R U R' U') F'"],
    notes: 'Orient horizontal line to make cross.',
    topColors: [['N','N','N'],['Y','Y','Y'],['N','N','N']],
    sideYellow: { top: [false, false, false], bottom: [false, false, false], left: [false, false, false], right: [false, false, false] }
  },
  {
    id: '2l_oll_angle',
    category: '2look-oll',
    name: 'Step 1: Yellow L / Angle',
    caseNumber: 'L-Angle',
    group: 'Edge Orientation',
    algorithm: "f R U R' U' f'",
    alternativeAlgorithms: ["F U R U' R' F'"],
    notes: 'Small 90-degree corner at top-left into cross.',
    topColors: [['N','Y','N'],['Y','Y','N'],['N','N','N']],
  },
  {
    id: '2l_oll_dot',
    category: '2look-oll',
    name: 'Step 1: Yellow Dot',
    caseNumber: 'Dot',
    group: 'Edge Orientation',
    algorithm: "F R U R' U' F' f R U R' U' f'",
    alternativeAlgorithms: ["F R U R' U' F' U2 f R U R' U' f'"],
    notes: 'Combines Bar and Angle algorithms.',
    topColors: [['N','N','N'],['N','Y','N'],['N','N','N']],
  },
  {
    id: '2l_oll_sune',
    category: '2look-oll',
    name: 'Step 2: Sune',
    caseNumber: 'Sune',
    group: 'Corner Orientation',
    algorithm: "R U R' U R U2 R'",
    alternativeAlgorithms: ["y' R' U2 R U R' U R"],
    notes: '1 corner solved at front-left.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['Y','Y','N']],
    sideYellow: { top: [false, false, true], bottom: [false, false, true], left: [false, false, true], right: [false, false, false] }
  },
  {
    id: '2l_oll_antisune',
    category: '2look-oll',
    name: 'Step 2: Anti-Sune',
    caseNumber: 'Anti-Sune',
    group: 'Corner Orientation',
    algorithm: "R U2 R' U' R U' R'",
    alternativeAlgorithms: ["y' R' U' R U' R' U2 R"],
    notes: '1 corner solved at back-left.',
    topColors: [['N','Y','N'],['Y','Y','Y'],['N','Y','Y']],
    sideYellow: { top: [true, false, false], bottom: [true, false, false], left: [false, false, false], right: [true, false, false] }
  },

  // ==========================================
  // 2-LOOK PLL (6 CASES)
  // ==========================================
  {
    id: '2l_pll_headlights',
    category: '2look-pll',
    name: 'Step 1: Corner Permutation (Headlights)',
    caseNumber: 'Headlights (T Perm)',
    group: 'Corner Permutation',
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    alternativeAlgorithms: ["x R' U R' D2 R U' R' D2 R2 x' (Aa Perm)"],
    notes: 'Place matching corners (headlights) at left/back, run to solve all 4 corners.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 2], to: [2, 2], bidirectional: true },
      { from: [1, 0], to: [1, 2], bidirectional: true }
    ]
  },
  {
    id: '2l_pll_diagonal',
    category: '2look-pll',
    name: 'Step 1: Corner Permutation (Diagonal)',
    caseNumber: 'Diagonal (Y Perm)',
    group: 'Corner Permutation',
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    alternativeAlgorithms: ["x' R U' R' D R U R' D' R U R' D R U' R' D' x"],
    notes: 'When there are NO headlights on any side. Swaps diagonal corners.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 0], to: [2, 2], bidirectional: true },
      { from: [0, 1], to: [1, 0], bidirectional: true }
    ]
  },
  {
    id: '2l_pll_ua',
    category: '2look-pll',
    name: 'Step 2: Edge Permutation (Ua)',
    caseNumber: 'Ua Perm',
    group: 'Edge Permutation',
    algorithm: "R U' R U R U R U' R' U' R2",
    alternativeAlgorithms: ["M2 U M U2 M' U M2"],
    notes: 'Solved bar at back, 3 edges cycle clockwise.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [1, 0], to: [2, 1] }, // UL -> UF
      { from: [1, 2], to: [1, 0] }, // UR -> UL
      { from: [2, 1], to: [1, 2] }  // UF -> UR
    ]
  },
  {
    id: '2l_pll_ub',
    category: '2look-pll',
    name: 'Step 2: Edge Permutation (Ub)',
    caseNumber: 'Ub Perm',
    group: 'Edge Permutation',
    algorithm: "R2 U R U R' U' R' U' R' U R'",
    alternativeAlgorithms: ["M2 U' M U2 M' U' M2"],
    notes: 'Solved bar at back, 3 edges cycle counter-clockwise.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [1, 0], to: [1, 2] }, // UL -> UR
      { from: [1, 2], to: [2, 1] }, // UR -> UF
      { from: [2, 1], to: [1, 0] }  // UF -> UL
    ]
  },
  {
    id: '2l_pll_h',
    category: '2look-pll',
    name: 'Step 2: Edge Permutation (H Perm)',
    caseNumber: 'H Perm',
    group: 'Edge Permutation',
    algorithm: "M2 U M2 U2 M2 U M2",
    alternativeAlgorithms: ["M2 U' M2 U2 M2 U' M2"],
    notes: 'Opposite edges need swapping.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 1], to: [2, 1], bidirectional: true },
      { from: [1, 0], to: [1, 2], bidirectional: true }
    ]
  },
  {
    id: '2l_pll_z',
    category: '2look-pll',
    name: 'Step 2: Edge Permutation (Z Perm)',
    caseNumber: 'Z Perm',
    group: 'Edge Permutation',
    algorithm: "M' U' M2 U' M2 U' M' U2 M2 U",
    alternativeAlgorithms: ["M2 U M2 U M' U2 M2 U2 M' U'"],
    notes: 'Adjacent edges need swapping.',
    topColors: [['Y','Y','Y'],['Y','Y','Y'],['Y','Y','Y']],
    pllArrows: [
      { from: [0, 1], to: [1, 0], bidirectional: true },
      { from: [1, 2], to: [2, 1], bidirectional: true }
    ]
  },

  // ==========================================
  // F2L (FUNDAMENTALS & KEY SLOTS)
  // ==========================================
  {
    id: 'f2l_1',
    category: 'f2l',
    name: 'F2L 1 — Easy Insertion (Basic Right)',
    caseNumber: 1,
    group: 'Basic Insertions',
    algorithm: "U R U' R'",
    alternativeAlgorithms: ["y' U' R' U R"],
    notes: 'Pair already made in U layer.',
  },
  {
    id: 'f2l_2',
    category: 'f2l',
    name: 'F2L 2 — Easy Insertion (Basic Left)',
    caseNumber: 2,
    group: 'Basic Insertions',
    algorithm: "y' R' U R",
    alternativeAlgorithms: ["U' F' U F"],
    notes: 'Pair already made in U layer for left slot.',
  },
  {
    id: 'f2l_3',
    category: 'f2l',
    name: 'F2L 3 — Corner & Edge in U layer (Split)',
    caseNumber: 3,
    group: 'Corner & Edge in U Layer',
    algorithm: "y' R' U' R",
    alternativeAlgorithms: ["F' U' F"],
    notes: 'Colors match on top, easy 3-mover.',
  },
  {
    id: 'f2l_4',
    category: 'f2l',
    name: 'F2L 4 — Corner & Edge in U layer',
    caseNumber: 4,
    group: 'Corner & Edge in U Layer',
    algorithm: "R U R'",
    alternativeAlgorithms: ["y U' L' U L"],
    notes: 'Colors match on front.',
  },
  {
    id: 'f2l_5',
    category: 'f2l',
    name: 'F2L 5 — Corner Facing Right, Edge in U',
    caseNumber: 5,
    group: 'Corner Facing Side',
    algorithm: "U' R U R' U2 R U' R'",
    alternativeAlgorithms: ["d R' U' R U2 R' U R"],
    notes: 'Different colors on top.',
  },
  {
    id: 'f2l_6',
    category: 'f2l',
    name: 'F2L 6 — Corner Facing Front, Edge in U',
    caseNumber: 6,
    group: 'Corner Facing Side',
    algorithm: "d R' U' R U2 R' U R",
    alternativeAlgorithms: ["U' R U2 R' U2 R U' R'"],
    notes: 'Different colors on top, edge adjacent.',
  },
  {
    id: 'f2l_7',
    category: 'f2l',
    name: 'F2L 7 — Corner White Facing Up',
    caseNumber: 7,
    group: 'White Sticker Facing Up',
    algorithm: "R U2 R' U' R U R'",
    alternativeAlgorithms: ["y' R' U2 R U R' U' R"],
    notes: 'Pair edge and corner by hiding corner.',
  },
  {
    id: 'f2l_8',
    category: 'f2l',
    name: 'F2L 8 — Corner White Facing Up (Far Edge)',
    caseNumber: 8,
    group: 'White Sticker Facing Up',
    algorithm: "y' R' U2 R U R' U' R",
    alternativeAlgorithms: ["U R U2 R' U R U' R'"],
    notes: 'Match edge with center first.',
  },
  {
    id: 'f2l_9',
    category: 'f2l',
    name: 'F2L 9 — Corner in Slot, Edge in U layer',
    caseNumber: 9,
    group: 'Corner in Slot',
    algorithm: "R U' R' U R U' R'",
    alternativeAlgorithms: ["R U R' U' R U R'"],
    notes: 'Corner solved correctly in slot, edge needs inserting.',
  },
  {
    id: 'f2l_10',
    category: 'f2l',
    name: 'F2L 10 — Edge in Slot, Corner in U layer',
    caseNumber: 10,
    group: 'Edge in Slot',
    algorithm: "R U' R' d R' U R",
    alternativeAlgorithms: ["U' R' F R F' R U R'"],
    notes: 'Edge is correctly in slot but corner in U layer.',
  },
  {
    id: 'f2l_11',
    category: 'f2l',
    name: 'F2L 11 — Both Pieces in Slot (Flipped)',
    caseNumber: 11,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' U' R U R' U2 R U' R'",
    alternativeAlgorithms: ["R U R' U' R U' R' U2 y' R' U' R"],
    notes: 'Pair is in slot but edge is flipped.',
  },
  {
    id: 'f2l_12',
    category: 'f2l',
    name: 'F2L 12 — Both Pieces in Slot (Wrong Slot)',
    caseNumber: 12,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' U y' R' U2 R U2 R' U R",
    alternativeAlgorithms: ["R U R' U' R U2 R' U' R U R'"],
    notes: 'Corner and edge trapped in incorrect slot.',
  },
  {
    id: 'f2l_13',
    category: 'f2l',
    name: 'F2L 13 — Corner Front, Edge in U (Same Top Color)',
    caseNumber: 13,
    group: 'Corner Facing Front',
    algorithm: "y' U R' U' R U2 R' U R",
    alternativeAlgorithms: ["d R' U' R U2 R' U R"],
    notes: 'White faces front, top colors match.',
  },
  {
    id: 'f2l_14',
    category: 'f2l',
    name: 'F2L 14 — Corner Right, Edge in U (Same Top Color)',
    caseNumber: 14,
    group: 'Corner Facing Right',
    algorithm: "U' R U R' U2 R U R'",
    alternativeAlgorithms: ["y' U R' U R U2 R' U' R"],
    notes: 'White faces right, top colors match.',
  },
  {
    id: 'f2l_15',
    category: 'f2l',
    name: 'F2L 15 — Corner Front, Edge in U (Different Top Colors)',
    caseNumber: 15,
    group: 'Corner Facing Front',
    algorithm: "R U' R' U2 R U R'",
    alternativeAlgorithms: ["y' R' U2 R U2 R' U R"],
    notes: 'White faces front, top colors are different.',
  },
  {
    id: 'f2l_16',
    category: 'f2l',
    name: 'F2L 16 — Corner Right, Edge in U (Different Top Colors)',
    caseNumber: 16,
    group: 'Corner Facing Right',
    algorithm: "y' R' U R U2 R' U' R",
    alternativeAlgorithms: ["R U2 R' U2 R U' R'"],
    notes: 'White faces right, top colors are different.',
  },
  {
    id: 'f2l_17',
    category: 'f2l',
    name: 'F2L 17 — Corner Right, Edge Adjacent (Direct Pair)',
    caseNumber: 17,
    group: 'Direct Pairs',
    algorithm: "R U' R'",
    alternativeAlgorithms: ["y' U2 R' U' R"],
    notes: 'Pair already formed on the right side; direct 3-move insertion.',
  },
  {
    id: 'f2l_18',
    category: 'f2l',
    name: 'F2L 18 — Corner Front, Edge Adjacent (Direct Pair)',
    caseNumber: 18,
    group: 'Direct Pairs',
    algorithm: "y' R' U R",
    alternativeAlgorithms: ["U2 R U R'"],
    notes: 'Pair already formed on the front side; direct 3-move insertion.',
  },
  {
    id: 'f2l_19',
    category: 'f2l',
    name: 'F2L 19 — White Up, Edge Matching Side Center',
    caseNumber: 19,
    group: 'White Sticker Up',
    algorithm: "U R U2 R' U R U' R'",
    alternativeAlgorithms: ["y' R' U2 R U R' U' R"],
    notes: 'White sticker on top, edge matches the side center sticker.',
  },
  {
    id: 'f2l_20',
    category: 'f2l',
    name: 'F2L 20 — White Up, Edge Matching Front Center',
    caseNumber: 20,
    group: 'White Sticker Up',
    algorithm: "y' U' R' U2 R U' R' U R",
    alternativeAlgorithms: ["U' R U2 R' U R U' R'"],
    notes: 'White sticker on top, edge matches the front center sticker.',
  },
  {
    id: 'f2l_21',
    category: 'f2l',
    name: 'F2L 21 — White Up, Edge Aligned Opposite',
    caseNumber: 21,
    group: 'White Sticker Up',
    algorithm: "R U2 R2 U' R2 U' R'",
    alternativeAlgorithms: ["R U2 R' U' R U R'"],
    notes: 'Hide corner with R U2 R\' to pair cleanly.',
  },
  {
    id: 'f2l_22',
    category: 'f2l',
    name: 'F2L 22 — White Up, Edge Inverted',
    caseNumber: 22,
    group: 'White Sticker Up',
    algorithm: "R U R' U2 R U R' U' R U R'",
    alternativeAlgorithms: ["F' L' U2 L F"],
    notes: 'Split pieces while orienting the pair.',
  },
  {
    id: 'f2l_23',
    category: 'f2l',
    name: 'F2L 23 — Edge in Slot, Corner in U (White Right)',
    caseNumber: 23,
    group: 'Edge in Slot',
    algorithm: "R U R' U' R U R'",
    alternativeAlgorithms: ["U R U' R' U R U' R'"],
    notes: 'Edge is correctly in slot, corner on top with white facing right.',
  },
  {
    id: 'f2l_24',
    category: 'f2l',
    name: 'F2L 24 — Edge in Slot, Corner in U (White Front)',
    caseNumber: 24,
    group: 'Edge in Slot',
    algorithm: "y' R' U' R U R' U' R",
    alternativeAlgorithms: ["d R' U R U' R' U R"],
    notes: 'Edge is correctly in slot, corner on top with white facing front.',
  },
  {
    id: 'f2l_25',
    category: 'f2l',
    name: 'F2L 25 — Edge in Slot, Corner in U (White Up)',
    caseNumber: 25,
    group: 'Edge in Slot',
    algorithm: "U R U' R' U' R U R'",
    alternativeAlgorithms: ["R U2 R' U' R U R'"],
    notes: 'Edge is in slot, corner white facing up.',
  },
  {
    id: 'f2l_26',
    category: 'f2l',
    name: 'F2L 26 — Edge in Slot, Corner in U (White Up, Left)',
    caseNumber: 26,
    group: 'Edge in Slot',
    algorithm: "y' U' R' U R U R' U' R",
    alternativeAlgorithms: ["d R' U2 R U R' U' R"],
    notes: 'Edge in slot, rotate to insert corner cleanly.',
  },
  {
    id: 'f2l_27',
    category: 'f2l',
    name: 'F2L 27 — Corner in Slot (White Right), Edge in U',
    caseNumber: 27,
    group: 'Corner in Slot',
    algorithm: "R U' R' U R U' R'",
    alternativeAlgorithms: ["y' R' U R U' R' U R"],
    notes: 'Corner solved into slot, edge is in U layer.',
  },
  {
    id: 'f2l_28',
    category: 'f2l',
    name: 'F2L 28 — Corner in Slot (White Front), Edge in U',
    caseNumber: 28,
    group: 'Corner in Slot',
    algorithm: "y' R' U R U' R' U R",
    alternativeAlgorithms: ["R U' R' d R' U R"],
    notes: 'Corner solved into slot, white facing front.',
  },
  {
    id: 'f2l_29',
    category: 'f2l',
    name: 'F2L 29 — Corner in Slot (White Down), Edge in U (Opposite)',
    caseNumber: 29,
    group: 'Corner in Slot',
    algorithm: "R U R' U' R U R'",
    alternativeAlgorithms: ["y' R' U' R U R' U' R"],
    notes: 'Corner is in slot with white on bottom, pop out and reinsert.',
  },
  {
    id: 'f2l_30',
    category: 'f2l',
    name: 'F2L 30 — Corner in Slot (White Down), Edge in U (Same)',
    caseNumber: 30,
    group: 'Corner in Slot',
    algorithm: "y' R' U' R U R' U' R",
    alternativeAlgorithms: ["R U R' U' R U R'"],
    notes: 'Corner in slot with white on bottom, edge in U facing same color.',
  },
  {
    id: 'f2l_31',
    category: 'f2l',
    name: 'F2L 31 — Both in Slot, Corner Solved, Edge Flipped',
    caseNumber: 31,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' d R' U2 R U2 R' U R",
    alternativeAlgorithms: ["R U R' U' R' F R F' R U' R'"],
    notes: 'Corner is oriented, but edge is reversed in slot.',
  },
  {
    id: 'f2l_32',
    category: 'f2l',
    name: 'F2L 32 — Both in Slot, Corner Twisted (White Right)',
    caseNumber: 32,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' U R U2 R' U R U' R'",
    alternativeAlgorithms: ["R U R' U2 R U R' U' R U R'"],
    notes: 'Edge is solved, corner is twisted with white facing right.',
  },
  {
    id: 'f2l_33',
    category: 'f2l',
    name: 'F2L 33 — Both in Slot, Corner Twisted (White Front)',
    caseNumber: 33,
    group: 'Both Pieces in Slot',
    algorithm: "y' R' U R U' R' U2 R U' R' U R",
    alternativeAlgorithms: ["d R' U' R U2 R' U' R U R' U' R"],
    notes: 'Edge is solved, corner is twisted with white facing front.',
  },
  {
    id: 'f2l_34',
    category: 'f2l',
    name: 'F2L 34 — Both in Slot, Corner Twisted (White Right), Edge Flipped',
    caseNumber: 34,
    group: 'Both Pieces in Slot',
    algorithm: "R U R' U' R U' R' U2 y' R' U' R",
    alternativeAlgorithms: ["R U' R' U' R U R' U2 R U' R'"],
    notes: 'Both pieces in slot, neither oriented properly.',
  },
  {
    id: 'f2l_35',
    category: 'f2l',
    name: 'F2L 35 — Both in Slot, Corner Twisted (White Front), Edge Flipped',
    caseNumber: 35,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' d R' U' R U2 R' U R",
    alternativeAlgorithms: ["y' R' U R d R U R' U2 R U' R'"],
    notes: 'Both pieces in slot, extract with d R\' and reinsert.',
  },
  {
    id: 'f2l_36',
    category: 'f2l',
    name: 'F2L 36 — Both in Slot, Paired Incorrectly',
    caseNumber: 36,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' U' R U R' U' R U2 R'",
    alternativeAlgorithms: ["R U' R' U y' R' U2 R U' R' U R"],
    notes: 'Pieces are attached to each other in slot but misaligned.',
  },
  {
    id: 'f2l_37',
    category: 'f2l',
    name: 'F2L 37 — Both in Slot, Corner Solved, Edge Inverted',
    caseNumber: 37,
    group: 'Both Pieces in Slot',
    algorithm: "R U' R' d R' U R U' R' U R",
    alternativeAlgorithms: ["y' R' U R d R U' R' U R U' R'"],
    notes: 'Corner solved, edge swapped direction.',
  },
  {
    id: 'f2l_38',
    category: 'f2l',
    name: 'F2L 38 — Corner in Wrong Slot, Edge in U Layer',
    caseNumber: 38,
    group: 'Wrong Slot Cases',
    algorithm: "R U' R' U R U2 R'",
    alternativeAlgorithms: ["y' R' U' R U' R' U2 R"],
    notes: 'Corner trapped in adjacent slot, edge in top layer.',
  },
  {
    id: 'f2l_39',
    category: 'f2l',
    name: 'F2L 39 — Corner in U Layer, Edge in Wrong Slot',
    caseNumber: 39,
    group: 'Wrong Slot Cases',
    algorithm: "y' R' U' R U' R' U2 R",
    alternativeAlgorithms: ["R U' R' U R U2 R'"],
    notes: 'Corner is in top layer, edge trapped in adjacent slot.',
  },
  {
    id: 'f2l_40',
    category: 'f2l',
    name: 'F2L 40 — Both in Adjacent Slot (Paired)',
    caseNumber: 40,
    group: 'Wrong Slot Cases',
    algorithm: "R U' R' U y' R' U R",
    alternativeAlgorithms: ["y' R' U R U y R U' R'"],
    notes: 'Pair formed in wrong slot; extract and insert into target slot.',
  },
  {
    id: 'f2l_41',
    category: 'f2l',
    name: 'F2L 41 — Both in Adjacent Slot (Separated)',
    caseNumber: 41,
    group: 'Wrong Slot Cases',
    algorithm: "R U R' U' R U' R' U y' R' U R",
    alternativeAlgorithms: ["y' R' U' R U R' U R U' y R U' R'"],
    notes: 'Corner and edge both stuck in adjacent slot, separate and solve.',
  },

  // Full 472 ZBLL Cases loaded dynamically from zbllData.ts
];

export const ALGORITHM_DATABASE: AlgorithmCase[] = [
  ...BASE_ALGORITHM_DATABASE,
  ...ZBLL_DATABASE,
];

export function getAlgorithmsByCategory(category: string): AlgorithmCase[] {
  if (category === 'all') return ALGORITHM_DATABASE;
  return ALGORITHM_DATABASE.filter(a => a.category === category);
}

export function searchAlgorithms(query: string, category: string = 'all'): AlgorithmCase[] {
  const base = getAlgorithmsByCategory(category);
  if (!query.trim()) return base;
  const q = query.toLowerCase().trim();
  return base.filter(a => 
    a.name.toLowerCase().includes(q) ||
    String(a.caseNumber).toLowerCase().includes(q) ||
    a.algorithm.toLowerCase().includes(q) ||
    (a.group && a.group.toLowerCase().includes(q))
  );
}
