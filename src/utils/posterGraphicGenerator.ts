/**
 * Generates custom SVG poster artwork matching the Badrul Huda Life Festival visual identity.
 */
export function generatePosterGraphic(
  title: string,
  category: string,
  eventName: string,
  accentColor = '#1B9B53',
  subText = 'RENDEZVOUS 26'
): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131" width="800" height="1131">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F8FAF7"/>
        <stop offset="60%" stop-color="#EEF5F0"/>
        <stop offset="100%" stop-color="#E2EDE6"/>
      </linearGradient>
      
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2CD46B"/>
        <stop offset="50%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#0F7138"/>
      </linearGradient>

      <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1E2848"/>
        <stop offset="100%" stop-color="#2C365E"/>
      </linearGradient>

      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#1B9B53" flood-opacity="0.15"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="800" height="1131" fill="url(#bgGrad)" />

    <!-- Organic Background Accents -->
    <path d="M -100 -50 Q 200 300 850 -100 L 850 400 Q 400 200 -100 500 Z" fill="#1B9B53" opacity="0.04" />
    <path d="M 900 1200 Q 500 800 -100 1150 L -100 700 Q 300 950 900 650 Z" fill="#2C365E" opacity="0.03" />

    <!-- Top Header -->
    <g transform="translate(400, 70)" text-anchor="middle">
      <text font-family="'Inter', sans-serif" font-size="14" font-weight="600" letter-spacing="8" fill="#475569">
        BADRUL HUDA LIFE FESTIVAL
      </text>
    </g>

    <!-- Central Emblem / Geometric Leaf -->
    <g transform="translate(400, 260)" filter="url(#shadow)">
      <!-- Central Leaf Geometric Structure -->
      <path d="M 0 -110 L 80 -40 L 80 40 L 0 80 L -80 40 L -80 -40 Z" fill="url(#leafGrad)" />
      <!-- Facets -->
      <path d="M 0 -110 L 80 -40 L 0 0 Z" fill="#ffffff" opacity="0.2" />
      <path d="M 0 0 L 80 40 L 0 80 Z" fill="#000000" opacity="0.1" />
      <path d="M -80 -40 L 0 -110 L 0 0 Z" fill="#ffffff" opacity="0.1" />
      
      <!-- Leaf Stem -->
      <path d="M 0 -100 L 0 90" stroke="#F8FAF7" stroke-width="6" stroke-linecap="round" />
      <path d="M 0 -40 L 50 -70" stroke="#F8FAF7" stroke-width="4" stroke-linecap="round" />
      <path d="M 0 10 L 50 -20" stroke="#F8FAF7" stroke-width="4" stroke-linecap="round" />
      <path d="M 0 -20 L -50 -50" stroke="#F8FAF7" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- Category Pill -->
    <g transform="translate(400, 420)">
      <rect x="-90" y="-18" width="180" height="36" rx="18" fill="${accentColor}" opacity="0.15" />
      <text font-family="'Inter', sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="${accentColor}" text-anchor="middle" y="5">
        ${category.toUpperCase()}
      </text>
    </g>

    <!-- Poster Main Title -->
    <g transform="translate(400, 530)" text-anchor="middle">
      <text font-family="'Outfit', sans-serif" font-size="44" font-weight="900" fill="#0F172A" letter-spacing="1">
        ${escapeXml(title)}
      </text>
    </g>

    <!-- Event Name Subheading -->
    <g transform="translate(400, 600)" text-anchor="middle">
      <text font-family="'Inter', sans-serif" font-size="20" font-weight="600" fill="#2C365E" letter-spacing="4">
        ${escapeXml(eventName.toUpperCase())}
      </text>
    </g>

    <!-- Date Badges -->
    <g transform="translate(400, 680)">
      <text font-family="'Inter', sans-serif" font-size="14" font-weight="700" letter-spacing="4" fill="#64748B" text-anchor="middle" y="-25">
        2026 • SEPTEMBER
      </text>

      <g transform="translate(-35, 0)">
        <rect x="-24" y="-20" width="48" height="40" rx="8" fill="#F59E0B" />
        <text font-family="'Outfit', sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle" y="7">10</text>
      </g>
      <g transform="translate(35, 0)">
        <rect x="-24" y="-20" width="48" height="40" rx="8" fill="#F59E0B" />
        <text font-family="'Outfit', sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" text-anchor="middle" y="7">11</text>
      </g>
    </g>

    <!-- SubText / Tagline -->
    <g transform="translate(400, 800)" text-anchor="middle">
      <text font-family="'Outfit', sans-serif" font-size="26" font-weight="800" letter-spacing="6" fill="#1B9B53">
        ${escapeXml(subText)}
      </text>
      <line x1="-120" y1="20" x2="120" y2="20" stroke="#1B9B53" stroke-width="2" opacity="0.3" />
    </g>

    <!-- Decorative Corner Elements -->
    <path d="M 60 60 L 100 60 M 60 60 L 60 100" stroke="#1B9B53" stroke-width="3" opacity="0.3" />
    <path d="M 740 60 L 700 60 M 740 60 L 740 100" stroke="#1B9B53" stroke-width="3" opacity="0.3" />

    <!-- Bottom Academy Banner -->
    <rect y="1031" width="800" height="100" fill="url(#navyGrad)" />
    <g transform="translate(400, 1070)" text-anchor="middle" fill="#FFFFFF">
      <text font-family="'Outfit', sans-serif" font-size="16" font-weight="700" letter-spacing="3">
        BADRUL HUDA ACADEMY
      </text>
      <text font-family="'Inter', sans-serif" font-size="12" font-weight="400" letter-spacing="1.5" opacity="0.8" y="22">
        Panamaram, Wayanad, Kerala • Jamia Madeenathunnoor
      </text>
    </g>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
