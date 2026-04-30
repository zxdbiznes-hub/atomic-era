import { useEffect, useState } from "react";
import { MainMenu } from "@/components/atomic/MainMenu";
import { FactionSelect } from "@/components/atomic/FactionSelect";
import { GameScreen } from "@/components/atomic/GameScreen";
import type { GameState } from "@/game/engine";
import type { FactionId } from "@/game/factions";

type Screen = "menu" | "select" | "game";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("menu");
  const [playerId, setPlayerId] = useState<FactionId>("UAS");
  const [savedState, setSavedState] = useState<GameState | null>(null);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("atomicfall:save");
      if (raw) setHasSave(true);
    } catch {}
  }, []);

  return (
    <>
      {screen === "menu" && (
        <MainMenu
          hasSave={hasSave}
          onNewGame={() => setScreen("select")}
          onLoad={() => {
            try {
              const raw = localStorage.getItem("atomicfall:save");
              if (!raw) return;
              const state: GameState = JSON.parse(raw);
              setPlayerId(state.playerId);
              setSavedState(state);
              setScreen("game");
            } catch {}
          }}
        />
      )}
      {screen === "select" && (
        <FactionSelect
          onBack={() => setScreen("menu")}
          onConfirm={(id) => {
            setPlayerId(id);
            setSavedState(null);
            try { localStorage.removeItem("atomicfall:save"); } catch {}
            setScreen("game");
          }}
        />
      )}
      {screen === "game" && (
        <GameScreen
          playerId={playerId}
          initial={savedState ?? undefined}
          onExit={() => {
            setHasSave(true);
            setScreen("menu");
          }}
        />
      )}
    </>
  );
};

export default Index;
