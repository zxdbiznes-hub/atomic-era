import { FACTIONS, FactionId, getFaction } from "@/game/factions";
import { REGIONS, RegionId, getRegion, getNeighbors } from "@/game/regions";

interface Props {
  playerId: FactionId;
  regions: Record<RegionId, FactionId | null>;
  selectedRegion: RegionId | null;
  selectedFaction: FactionId | null;
  onSelectRegion: (id: RegionId) => void;
  tension: number;
  alliances: FactionId[];
  wars: FactionId[];
  invadeMode: boolean;
  invadeFrom: RegionId | null;
}

const NEUTRAL_FILL = "hsl(222 25% 14%)";
const NEUTRAL_STROKE = "hsl(var(--neon-blue) / 0.25)";

export function WorldMap({
  playerId, regions, selectedRegion, selectedFaction,
  onSelectRegion, tension, alliances, wars, invadeMode, invadeFrom,
}: Props) {
  const validTargets = invadeFrom ? new Set(getNeighbors(invadeFrom)) : new Set<string>();

  return (
    <div className="relative w-full h-full grid-bg overflow-hidden rounded-md border border-border panel-hud scanlines">
      <svg viewBox="0 0 1000 500" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(195 100% 30% / 0.18)" />
            <stop offset="100%" stopColor="hsl(222 47% 5% / 0)" />
          </radialGradient>
          <filter id="neonGlow"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <pattern id="warStripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="3" height="6" fill="hsl(var(--neon-red) / 0.55)"/>
          </pattern>
        </defs>

        <rect width="1000" height="500" fill="url(#oceanGlow)" />

        {/* Grid */}
        {[60, 120, 180, 240, 300, 360, 420].map((y) => (
          <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="hsl(var(--neon-blue) / 0.06)" />
        ))}
        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="hsl(var(--neon-blue) / 0.06)" />
        ))}

        {/* Regions */}
        {REGIONS.map((r) => {
          const owner = regions[r.id];
          const f = owner ? getFaction(owner) : null;
          const isPlayer = owner === playerId;
          const isAlly = owner && alliances.includes(owner);
          const isAtWar = owner && wars.includes(owner);
          const isSelected = r.id === selectedRegion;
          const isFactionSelected = selectedFaction && owner === selectedFaction;
          const isValidTarget = invadeMode && validTargets.has(r.id) && owner !== playerId;
          const isInvadeSource = invadeFrom === r.id;

          const fill = f
            ? `hsl(${f.color} / ${isPlayer ? 0.6 : 0.32})`
            : NEUTRAL_FILL;
          const stroke = f ? `hsl(${f.color})` : NEUTRAL_STROKE;
          const strokeWidth = isSelected || isInvadeSource ? 3 : isValidTarget ? 2.5 : 1.2;

          return (
            <g
              key={r.id}
              onClick={() => onSelectRegion(r.id)}
              className="cursor-pointer transition-all"
              style={{ filter: (isSelected || isInvadeSource || isValidTarget) ? "url(#neonGlow)" : undefined }}
            >
              <path d={r.d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} className="hover:opacity-90 transition-opacity" />
              {isAtWar && (
                <path d={r.d} fill="url(#warStripes)" pointerEvents="none" />
              )}
              {isValidTarget && (
                <path d={r.d} fill="hsl(var(--neon-amber) / 0.25)" stroke="hsl(var(--neon-amber))" strokeWidth="2" strokeDasharray="4 3" pointerEvents="none" />
              )}
              {isInvadeSource && (
                <path d={r.d} fill="hsl(var(--neon-blue) / 0.35)" stroke="hsl(var(--neon-blue))" strokeWidth="2.5" pointerEvents="none" />
              )}
              {(isFactionSelected || isPlayer) && (
                <text
                  x={r.labelX} y={r.labelY}
                  textAnchor="middle"
                  className="display fill-foreground pointer-events-none select-none"
                  style={{ fontSize: r.short.length > 3 ? 8 : 9, fontWeight: 700, textShadow: "0 0 4px black" }}
                >
                  {r.short}
                </text>
              )}
            </g>
          );
        })}

        {/* Tension overlay */}
        {tension > 75 && (
          <rect width="1000" height="500" fill="hsl(var(--neon-red) / 0.05)" className="flash" pointerEvents="none" />
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 panel px-3 py-2 text-xs space-y-1 max-w-[260px]">
        <div className="display tracking-widest text-[10px] text-muted-foreground mb-1">FRAKCJE</div>
        {FACTIONS.map((f) => (
          <div key={f.id} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm" style={{ background: `hsl(${f.color})` }} />
            <span className={f.id === playerId ? "text-neon-blue font-semibold" : "text-muted-foreground"}>
              {f.short} {f.id === playerId && "(TY)"}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
          <span className="w-2 h-2 rounded-sm bg-muted" /> <span className="text-muted-foreground">Niezrzeszone</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 panel px-3 py-1 text-xs text-muted-foreground tracking-widest">
        SIATKA ŚWIATA • LIVE
      </div>

      {invadeMode && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 panel-hud px-4 py-2 text-xs display tracking-widest border border-[hsl(var(--neon-amber))] text-neon-amber animate-pulse">
          {invadeFrom ? "WYBIERZ CEL ATAKU (sąsiedni region)" : "WYBIERZ REGION DO WYJŚCIA ATAKU"}
        </div>
      )}
    </div>
  );
}

export { FACTIONS };