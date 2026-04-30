import { FACTIONS, FactionId, getFaction } from "@/game/factions";
import { cn } from "@/lib/utils";

interface Region {
  id: FactionId;
  // simplified blocky polygons in 1000x500 viewbox
  d: string;
  labelX: number;
  labelY: number;
}

const REGIONS: Region[] = [
  // UAS — North America
  { id: "UAS", d: "M70,90 L260,80 L300,150 L290,260 L210,300 L120,280 L60,210 Z", labelX: 175, labelY: 190 },
  // EAC — Europe + N. Africa
  { id: "EAC", d: "M430,90 L560,85 L600,150 L580,240 L500,250 L440,200 L420,140 Z", labelX: 510, labelY: 170 },
  // USSAR — Russia/Eurasia
  { id: "USSAR", d: "M440,40 L900,50 L920,130 L820,170 L700,160 L560,130 L450,110 Z", labelX: 700, labelY: 100 },
  // ARC — China
  { id: "ARC", d: "M720,170 L900,165 L920,260 L820,290 L740,270 L710,220 Z", labelX: 820, labelY: 225 },
  // JAS — Japan
  { id: "JAS", d: "M905,200 L945,210 L955,260 L920,275 L900,245 Z", labelX: 930, labelY: 240 },
];

const NEUTRAL: { d: string }[] = [
  // South America
  { d: "M210,310 L300,300 L320,420 L240,470 L190,420 Z" },
  // Africa
  { d: "M450,260 L580,260 L600,400 L500,460 L440,380 Z" },
  // Australia
  { d: "M820,380 L920,370 L935,430 L840,445 Z" },
  // India
  { d: "M660,250 L740,260 L730,320 L680,330 Z" },
];

interface Props {
  playerId: FactionId;
  selected: FactionId | null;
  onSelect: (id: FactionId) => void;
  tension: number;
  alliances: FactionId[];
}

export function WorldMap({ playerId, selected, onSelect, tension, alliances }: Props) {
  return (
    <div className="relative w-full h-full grid-bg overflow-hidden rounded-md border border-border panel-hud scanlines">
      <svg viewBox="0 0 1000 500" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(195 100% 30% / 0.15)" />
            <stop offset="100%" stopColor="hsl(222 47% 5% / 0)" />
          </radialGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1000" height="500" fill="url(#oceanGlow)" />

        {/* Latitude lines */}
        {[100, 200, 300, 400].map((y) => (
          <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="hsl(var(--neon-blue) / 0.08)" />
        ))}
        {[200, 400, 600, 800].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="hsl(var(--neon-blue) / 0.08)" />
        ))}

        {/* Neutral landmasses */}
        {NEUTRAL.map((r, i) => (
          <path
            key={i}
            d={r.d}
            fill="hsl(222 25% 14%)"
            stroke="hsl(var(--neon-blue) / 0.25)"
            strokeWidth="1"
          />
        ))}

        {/* Faction territories */}
        {REGIONS.map((r) => {
          const f = getFaction(r.id);
          const isPlayer = r.id === playerId;
          const isSelected = r.id === selected;
          const isAlly = alliances.includes(r.id);
          return (
            <g
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="cursor-pointer transition-opacity"
              style={{ filter: isSelected ? "url(#neonGlow)" : undefined }}
            >
              <path
                d={r.d}
                fill={`hsl(${f.color} / ${isPlayer ? 0.55 : 0.32})`}
                stroke={`hsl(${f.color})`}
                strokeWidth={isSelected ? 3 : 1.5}
                className="hover:opacity-90 transition-all"
              />
              <text
                x={r.labelX}
                y={r.labelY}
                textAnchor="middle"
                className="display fill-foreground pointer-events-none select-none"
                style={{ fontSize: 14, fontWeight: 700, textShadow: "0 0 6px black" }}
              >
                {f.short}
              </text>
              {isPlayer && (
                <circle cx={r.labelX} cy={r.labelY + 14} r="4" fill="hsl(var(--neon-blue))" filter="url(#neonGlow)" />
              )}
              {isAlly && (
                <circle cx={r.labelX + 22} cy={r.labelY + 14} r="3" fill="hsl(var(--neon-green))" />
              )}
            </g>
          );
        })}

        {/* Tension overlay */}
        {tension > 70 && (
          <rect width="1000" height="500" fill="hsl(var(--neon-red) / 0.06)" className="flash" />
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 panel px-3 py-2 text-xs space-y-1">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-neon-blue" /> Twoje państwo</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-neon-green" /> Sojusznik</div>
        <div className="text-muted-foreground">Kliknij region, aby zobaczyć szczegóły</div>
      </div>

      <div className="absolute top-2 right-2 panel px-3 py-1 text-xs text-muted-foreground tracking-widest">
        SIATKA ŚWIATA • LIVE
      </div>
    </div>
  );
}

export { FACTIONS };