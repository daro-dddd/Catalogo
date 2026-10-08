// Helper to create clean inline SVG Data URLs for generic technical product catalog items
const makeIndustrialSvg = (title, color = '#2563eb', shape = 'fitting') => {
  let shapeContent = '';
  if (shape === 'elbow') {
    shapeContent = `
      <path d="M 60 140 L 140 140 C 160 140 160 120 160 100 L 160 40" fill="none" stroke="${color}" stroke-width="38" stroke-linecap="round" />
      <path d="M 60 140 L 140 140 C 160 140 160 120 160 100 L 160 40" fill="none" stroke="#fff" stroke-width="4" stroke-opacity="0.3" stroke-linecap="round" />
      <rect x="42" y="121" width="18" height="38" rx="3" fill="#1e40af" />
      <rect x="141" y="22" width="38" height="18" rx="3" fill="#1e40af" />
    `;
  } else if (shape === 'nut') {
    shapeContent = `
      <polygon points="100,35 152,65 152,125 100,155 48,125 48,65" fill="${color}" stroke="#1e3a8a" stroke-width="4" />
      <circle cx="100" cy="95" r="32" fill="#0f172a" />
      <circle cx="100" cy="95" r="24" fill="none" stroke="${color}" stroke-width="6" />
    `;
  } else if (shape === 'tee') {
    shapeContent = `
      <path d="M 35 100 L 165 100 M 100 100 L 100 160" fill="none" stroke="${color}" stroke-width="36" stroke-linecap="square" />
      <path d="M 35 100 L 165 100 M 100 100 L 100 160" fill="none" stroke="#fff" stroke-width="4" stroke-opacity="0.3" stroke-linecap="square" />
      <rect x="20" y="82" width="16" height="36" rx="2" fill="#1e3a8a" />
      <rect x="164" y="82" width="16" height="36" rx="2" fill="#1e3a8a" />
      <rect x="82" y="158" width="36" height="16" rx="2" fill="#1e3a8a" />
    `;
  } else if (shape === 'coupling') {
    shapeContent = `
      <rect x="35" y="70" width="130" height="55" rx="6" fill="${color}" stroke="#1e3a8a" stroke-width="3" />
      <line x1="100" y1="68" x2="100" y2="127" stroke="#0f172a" stroke-width="6" />
      <rect x="35" y="70" width="130" height="15" fill="#fff" fill-opacity="0.2" />
    `;
  } else if (shape === 'sanitary') {
    shapeContent = `
      <path d="M 50 40 L 50 160 M 50 100 L 150 40" fill="none" stroke="${color}" stroke-width="32" stroke-linecap="round" />
      <rect x="34" y="28" width="32" height="16" rx="3" fill="#64748b" />
      <rect x="34" y="146" width="32" height="16" rx="3" fill="#64748b" />
      <rect x="138" y="28" width="24" height="24" rx="3" fill="#64748b" transform="rotate(45 138 28)" />
    `;
  } else if (shape === 'heater') {
    shapeContent = `
      <rect x="65" y="35" width="70" height="135" rx="12" fill="#e2e8f0" stroke="#475569" stroke-width="4" />
      <rect x="75" y="45" width="50" height="115" rx="6" fill="#f8fafc" />
      <circle cx="100" cy="75" r="12" fill="#2563eb" />
      <rect x="85" y="115" width="30" height="18" rx="3" fill="#334155" />
      <path d="M 90 20 L 90 35 M 110 20 L 110 35" stroke="#2563eb" stroke-width="5" stroke-linecap="round" />
    `;
  } else if (shape === 'valve') {
    shapeContent = `
      <circle cx="100" cy="105" r="38" fill="${color}" stroke="#1e3a8a" stroke-width="4" />
      <rect x="30" y="90" width="140" height="30" rx="4" fill="${color}" />
      <rect x="85" y="40" width="60" height="14" rx="4" fill="#dc2626" transform="rotate(-15 85 40)" />
      <circle cx="100" cy="105" r="14" fill="#0f172a" />
    `;
  } else {
    shapeContent = `
      <circle cx="100" cy="95" r="45" fill="${color}" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 190" width="100%" height="100%">
    <rect width="200" height="190" fill="none" rx="8"/>
    <g transform="translate(0, 5)">
      ${shapeContent}
    </g>
    <text x="100" y="176" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#64748b" letter-spacing="0.5">${title.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_CATEGORIES = [
  'Todas las Categorías',
  'Conexiones de Cobre',
  'Tuboplus / PP-R',
  'CPVC Hidráulico',
  'PVC Cédula 40',
  'PVC Sanitario y Drenaje',
  'Calentadores y Equipos',
  'Válvulas Industriales',
];

export const INITIAL_MASTER_PRICES = [
  // CONEXIONES DE COBRE
  { sku: 'SKU-COB-100-10', code: 'COB-100', name: 'Cople con ranura cobre a cobre', variant: '10 mm (3/8")', price: 14.20, unit: 'pz', category: 'Conexiones de Cobre' },
  { sku: 'SKU-COB-100-13', code: 'COB-100', name: 'Cople con ranura cobre a cobre', variant: '13 mm (1/2")', price: 17.50, unit: 'pz', category: 'Conexiones de Cobre' },
  { sku: 'SKU-COB-100-19', code: 'COB-100', name: 'Cople con ranura cobre a cobre', variant: '19 mm (3/4")', price: 28.00, unit: 'pz', category: 'Conexiones de Cobre' },
  { sku: 'SKU-COB-100-25', code: 'COB-100', name: 'Cople con ranura cobre a cobre', variant: '25 mm (1")', price: 42.00, unit: 'pz', category: 'Conexiones de Cobre' },

  { sku: 'SKU-COB-111-13', code: 'COB-111', name: 'Te de cobre tripolar solder', variant: '13 mm (1/2")', price: 29.90, unit: 'pz', category: 'Conexiones de Cobre' },
  { sku: 'SKU-COB-111-19', code: 'COB-111', name: 'Te de cobre tripolar solder', variant: '19 mm (3/4")', price: 48.00, unit: 'pz', category: 'Conexiones de Cobre' },

  { sku: 'SKU-COB-20F-10X3', code: 'COB-20F', name: 'Codo estufa abocinado 45° rosca interior', variant: '10 x 3 mm', price: 48.50, unit: 'pz', category: 'Conexiones de Cobre' },
  { sku: 'SKU-COB-20F-10X6', code: 'COB-20F', name: 'Codo estufa abocinado 45° rosca interior', variant: '10 x 6 mm', price: 52.00, unit: 'pz', category: 'Conexiones de Cobre' },

  // TUBOPLUS / PP-R
  { sku: 'SKU-TP-COP-20', code: 'TP-100', name: 'Cople Termofusión Tuboplus PP-R', variant: '20 mm (1/2")', price: 8.50, unit: 'pz', category: 'Tuboplus / PP-R' },
  { sku: 'SKU-TP-COP-25', code: 'TP-100', name: 'Cople Termofusión Tuboplus PP-R', variant: '25 mm (3/4")', price: 12.00, unit: 'pz', category: 'Tuboplus / PP-R' },
  { sku: 'SKU-TP-COP-32', code: 'TP-100', name: 'Cople Termofusión Tuboplus PP-R', variant: '32 mm (1")', price: 18.50, unit: 'pz', category: 'Tuboplus / PP-R' },

  { sku: 'SKU-TP-COD-20', code: 'TP-110', name: 'Codo 90° Termofusión Tuboplus PP-R', variant: '20 mm (1/2")', price: 10.20, unit: 'pz', category: 'Tuboplus / PP-R' },
  { sku: 'SKU-TP-COD-25', code: 'TP-110', name: 'Codo 90° Termofusión Tuboplus PP-R', variant: '25 mm (3/4")', price: 14.80, unit: 'pz', category: 'Tuboplus / PP-R' },

  // CPVC HIDRÁULICO
  { sku: 'SKU-CPVC-COP-13', code: 'CPVC-01', name: 'Cople Cementado CPVC Agua Caliente', variant: '1/2" (13 mm)', price: 6.80, unit: 'pz', category: 'CPVC Hidráulico' },
  { sku: 'SKU-CPVC-COP-19', code: 'CPVC-01', name: 'Cople Cementado CPVC Agua Caliente', variant: '3/4" (19 mm)', price: 9.50, unit: 'pz', category: 'CPVC Hidráulico' },
  { sku: 'SKU-CPVC-COP-25', code: 'CPVC-01', name: 'Cople Cementado CPVC Agua Caliente', variant: '1" (25 mm)', price: 16.20, unit: 'pz', category: 'CPVC Hidráulico' },

  { sku: 'SKU-CPVC-COD-13', code: 'CPVC-02', name: 'Codo 90° Cementado CPVC', variant: '1/2" (13 mm)', price: 8.90, unit: 'pz', category: 'CPVC Hidráulico' },
  { sku: 'SKU-CPVC-COD-19', code: 'CPVC-02', name: 'Codo 90° Cementado CPVC', variant: '3/4" (19 mm)', price: 13.50, unit: 'pz', category: 'CPVC Hidráulico' },

  // PVC CÉDULA 40
  { sku: 'SKU-PVC-C40-13', code: 'PVC-C40-01', name: 'Cople PVC Cédula 40 Presión', variant: '1/2" (13 mm)', price: 7.20, unit: 'pz', category: 'PVC Cédula 40' },
  { sku: 'SKU-PVC-C40-19', code: 'PVC-C40-01', name: 'Cople PVC Cédula 40 Presión', variant: '3/4" (19 mm)', price: 10.50, unit: 'pz', category: 'PVC Cédula 40' },
  { sku: 'SKU-PVC-C40-25', code: 'PVC-C40-01', name: 'Cople PVC Cédula 40 Presión', variant: '1" (25 mm)', price: 17.00, unit: 'pz', category: 'PVC Cédula 40' },
  { sku: 'SKU-PVC-C40-50', code: 'PVC-C40-01', name: 'Cople PVC Cédula 40 Presión', variant: '2" (50 mm)', price: 34.50, unit: 'pz', category: 'PVC Cédula 40' },

  // PVC SANITARIO Y DRENAJE
  { sku: 'SKU-SAN-COD45-50', code: 'PVC-SAN-01', name: 'Codo 45° PVC Sanitario Norma ASTM', variant: '2" (50 mm)', price: 19.50, unit: 'pz', category: 'PVC Sanitario y Drenaje' },
  { sku: 'SKU-SAN-COD45-75', code: 'PVC-SAN-01', name: 'Codo 45° PVC Sanitario Norma ASTM', variant: '3" (75 mm)', price: 32.00, unit: 'pz', category: 'PVC Sanitario y Drenaje' },
  { sku: 'SKU-SAN-COD45-100', code: 'PVC-SAN-01', name: 'Codo 45° PVC Sanitario Norma ASTM', variant: '4" (110 mm)', price: 48.00, unit: 'pz', category: 'PVC Sanitario y Drenaje' },

  { sku: 'SKU-SAN-Y-100X50', code: 'PVC-SAN-02', name: 'Y Griega Sanitaria PVC Drenaje', variant: '4" x 2" Reducida', price: 65.00, unit: 'pz', category: 'PVC Sanitario y Drenaje' },

  // CALENTADORES Y EQUIPOS
  { sku: 'SKU-CAL-1SERV', code: 'CAL-01', name: 'Calentador Depósito Automático Gas', variant: '1 Servicio (38 L)', price: 3490.00, unit: 'pza', category: 'Calentadores y Equipos' },
  { sku: 'SKU-CAL-2SERV', code: 'CAL-01', name: 'Calentador Depósito Automático Gas', variant: '2 Servicios (75 L)', price: 5890.00, unit: 'pza', category: 'Calentadores y Equipos' },

  // VÁLVULAS INDUSTRIALES
  { sku: 'SKU-VAL-13', code: 'VAL-100', name: 'Válvula Esfera Paso Total NPT', variant: '1/2" (13 mm)', price: 185.00, unit: 'pza', category: 'Válvulas Industriales' },
  { sku: 'SKU-VAL-19', code: 'VAL-100', name: 'Válvula Esfera Paso Total NPT', variant: '3/4" (19 mm)', price: 265.00, unit: 'pza', category: 'Válvulas Industriales' },
];

export const INITIAL_PRODUCTS = [
  // COBRE
  {
    id: 'prod-cob-100',
    catalogCode: 'CATÁLOGO COB-100',
    title: 'Cople con ranura cobre a cobre',
    category: 'Conexiones de Cobre',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Cople Cobre', '#b45309', 'coupling'),
    normStandard: 'Norma NMX-W-018 / ASTM B-88',
    material: 'Cobre Desoxidado C12200',
    description: 'Cople de cobre solder para unión hidráulica tipo M y L.',
    variants: [
      { sku: 'SKU-COB-100-10', label: '10 mm (3/8")' },
      { sku: 'SKU-COB-100-13', label: '13 mm (1/2")' },
      { sku: 'SKU-COB-100-19', label: '19 mm (3/4")' },
      { sku: 'SKU-COB-100-25', label: '25 mm (1")' },
    ]
  },
  {
    id: 'prod-cob-111',
    catalogCode: 'CATÁLOGO COB-111',
    title: 'Te de cobre tripolar solder',
    category: 'Conexiones de Cobre',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Te Cobre', '#b45309', 'tee'),
    normStandard: 'Norma NMX-W-018',
    material: 'Cobre C12200 High Purity',
    description: 'Te igual de 3 bocas para tuberías de agua potable y gas.',
    variants: [
      { sku: 'SKU-COB-111-13', label: '13 mm (1/2")' },
      { sku: 'SKU-COB-111-19', label: '19 mm (3/4")' },
    ]
  },

  // TUBOPLUS PP-R
  {
    id: 'prod-tp-100',
    catalogCode: 'CATÁLOGO TP-100',
    title: 'Cople Termofusión Tuboplus PP-R',
    category: 'Tuboplus / PP-R',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Tuboplus Cople', '#15803d', 'coupling'),
    normStandard: 'Norma NMX-E-226 / DIN 8077',
    material: 'Polipropileno Copolímero Random (PP-R)',
    description: 'Cople liso para fusión molecular estanca de tuberías de agua fría y caliente.',
    variants: [
      { sku: 'SKU-TP-COP-20', label: '20 mm (1/2")' },
      { sku: 'SKU-TP-COP-25', label: '25 mm (3/4")' },
      { sku: 'SKU-TP-COP-32', label: '32 mm (1")' },
    ]
  },
  {
    id: 'prod-tp-110',
    catalogCode: 'CATÁLOGO TP-110',
    title: 'Codo 90° Termofusión Tuboplus PP-R',
    category: 'Tuboplus / PP-R',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Tuboplus Codo 90', '#15803d', 'elbow'),
    normStandard: 'Norma NMX-E-226',
    material: 'PP-R Termofusión Verde',
    description: 'Codo a 90 grados sin rosca para cambio direccional termofusionado.',
    variants: [
      { sku: 'SKU-TP-COD-20', label: '20 mm (1/2")' },
      { sku: 'SKU-TP-COD-25', label: '25 mm (3/4")' },
    ]
  },

  // CPVC
  {
    id: 'prod-cpvc-01',
    catalogCode: 'CATÁLOGO CPVC-01',
    title: 'Cople Cementado CPVC Agua Caliente',
    category: 'CPVC Hidráulico',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Cople CPVC', '#ca8a04', 'coupling'),
    normStandard: 'Norma ASTM D2846 / NMX-E-181',
    material: 'CPVC Resisto-Calor Amarillo',
    description: 'Cople liso cementado para unión de tubos de CPVC hidráulico hasta 82°C.',
    variants: [
      { sku: 'SKU-CPVC-COP-13', label: '1/2" (13 mm)' },
      { sku: 'SKU-CPVC-COP-19', label: '3/4" (19 mm)' },
      { sku: 'SKU-CPVC-COP-25', label: '1" (25 mm)' },
    ]
  },
  {
    id: 'prod-cpvc-02',
    catalogCode: 'CATÁLOGO CPVC-02',
    title: 'Codo 90° Cementado CPVC',
    category: 'CPVC Hidráulico',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Codo CPVC 90', '#ca8a04', 'elbow'),
    normStandard: 'Norma ASTM D2846',
    material: 'CPVC Resisto-Calor',
    description: 'Codo 90° cementado hidráulico.',
    variants: [
      { sku: 'SKU-CPVC-COD-13', label: '1/2" (13 mm)' },
      { sku: 'SKU-CPVC-COD-19', label: '3/4" (19 mm)' },
    ]
  },

  // PVC CÉDULA 40
  {
    id: 'prod-pvc-c40-01',
    catalogCode: 'CATÁLOGO PVC-C40-01',
    title: 'Cople PVC Cédula 40 Presión',
    category: 'PVC Cédula 40',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Cople PVC Ced 40', '#0284c7', 'coupling'),
    normStandard: 'Norma ASTM D2466 / NMX-E-145',
    material: 'PVC Rígido Blanco Cédula 40',
    description: 'Cople de presión industrial para conducción de fluidos a alta presión.',
    variants: [
      { sku: 'SKU-PVC-C40-13', label: '1/2" (13 mm)' },
      { sku: 'SKU-PVC-C40-19', label: '3/4" (19 mm)' },
      { sku: 'SKU-PVC-C40-25', label: '1" (25 mm)' },
      { sku: 'SKU-PVC-C40-50', label: '2" (50 mm)' },
    ]
  },

  // PVC SANITARIO
  {
    id: 'prod-pvc-san-01',
    catalogCode: 'CATÁLOGO PVC-SAN-01',
    title: 'Codo 45° PVC Sanitario Norma ASTM',
    category: 'PVC Sanitario y Drenaje',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Codo 45 Sanitario', '#475569', 'sanitary'),
    normStandard: 'Norma ASTM D2665 / NMX-E-199',
    material: 'PVC Sanitario Gris / Blanco',
    description: 'Codo a 45 grados cementado para descargas sanitarias y bajadas pluviales.',
    variants: [
      { sku: 'SKU-SAN-COD45-50', label: '2" (50 mm)' },
      { sku: 'SKU-SAN-COD45-75', label: '3" (75 mm)' },
      { sku: 'SKU-SAN-COD45-100', label: '4" (110 mm)' },
    ]
  },
  {
    id: 'prod-pvc-san-02',
    catalogCode: 'CATÁLOGO PVC-SAN-02',
    title: 'Y Griega Sanitaria PVC Drenaje',
    category: 'PVC Sanitario y Drenaje',
    templateType: 'template-a',
    imageUrl: makeIndustrialSvg('Y Griega Sanitaria', '#475569', 'sanitary'),
    normStandard: 'Norma ASTM D2665',
    material: 'PVC Sanitario Heavy Duty',
    description: 'Conexión Y de derivación a 45° para colectores principales de drenaje.',
    variants: [
      { sku: 'SKU-SAN-Y-100X50', label: '4" x 2" Reducida' },
    ]
  },

  // EQUIPOS
  {
    id: 'prod-cal-01',
    catalogCode: 'CATÁLOGO CAL-01',
    title: 'Calentador Depósito Automático Gas',
    category: 'Calentadores y Equipos',
    templateType: 'template-b',
    imageUrl: makeIndustrialSvg('Calentador Depósito', '#2563eb', 'heater'),
    normStandard: 'NOM-011-SDE / NOM-003-ENER',
    material: 'Acero Calibre Heavy Porcelanizado',
    description: 'Calentador de agua automático para residencias y comercio.',
    variants: [
      { sku: 'SKU-CAL-1SERV', label: '1 Servicio', capacity: '38 Lts / Min' },
      { sku: 'SKU-CAL-2SERV', label: '2 Servicios', capacity: '75 Lts / Min' },
    ]
  },

  // VÁLVULAS
  {
    id: 'prod-val-01',
    catalogCode: 'CATÁLOGO VAL-100',
    title: 'Válvula Esfera Paso Total NPT',
    category: 'Válvulas Industriales',
    templateType: 'template-c',
    imageUrl: makeIndustrialSvg('Válvula Esfera', '#2563eb', 'valve'),
    normStandard: 'Norma MSS SP-110 / 600 WOG',
    material: 'Latón Forjado Heavy Duty',
    description: 'Válvula de bola para corte rápido en redes hidráulicas y neumáticas.',
    variants: [
      { sku: 'SKU-VAL-13', label: 'Medida Única 1/2" NPT' },
      { sku: 'SKU-VAL-19', label: 'Medida Única 3/4" NPT' },
    ]
  }
];
