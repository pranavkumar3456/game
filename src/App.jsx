import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';

function App() {
  const [gameState, setGameState] = useState({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    level: 1
  });

  const [biome, setBiome] = useState({
    name: "Digital Void",
    bgColor: "#060608",
    foodColor: "#00E5FF"
  });

  const [snakeAppearance, setSnakeAppearance] = useState({
    headColor: "#FFFFFF",
    bodyColor: "#00E676"
  });

  const [guideMessage, setGuideMessage] = useState("Initializing system... waiting for user input.");
  const [evolution, setEvolution] = useState(null);

  // Initial greeting
  useEffect(() => {
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      import('./services/aiService').then(({ getGuideMessage }) => {
        getGuideMessage("GAME_START", {}).then(setGuideMessage);
      }).catch(err => {
        console.error("Failed to load AI service", err);
        setGuideMessage("System: AI Service Error. Check API Key and Connectivity.");
      });
    } else {
      setGuideMessage("System: API Key missing. AI features disabled.");
    }
  }, []);

  const handleGameOver = async (reason) => {
    setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));

    if (import.meta.env.VITE_GEMINI_API_KEY) {
      try {
        const { getGuideMessage } = await import('./services/aiService');
        const msg = await getGuideMessage("GAME_OVER", { reason, score: gameState.score });
        setGuideMessage(msg);
      } catch (e) {
        setGuideMessage(`GAME OVER: ${reason}`);
      }
    } else {
      setGuideMessage(`GAME OVER: ${reason}`);
    }
  };

  const handleScoreUpdate = async (newScore) => {
    setGameState(prev => ({ ...prev, score: newScore }));

    if (newScore > 0 && newScore % 50 === 0) {
      const newLevel = Math.floor(newScore / 50) + 1;
      setGameState(prev => ({ ...prev, level: newLevel }));

      if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          const { generateBiome, getGuideMessage } = await import('./services/aiService');
          getGuideMessage("LEVEL_UP", { level: newLevel }).then(setGuideMessage);
          const newBiome = await generateBiome(newLevel);
          setBiome(newBiome);
        } catch (e) {
          console.error("AI Update failed", e);
        }
      }
    }

    if (newScore > 0 && newScore % 100 === 0) {
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          const { generateEvolution } = await import('./services/aiService');
          const newEvo = await generateEvolution(newScore, snakeAppearance);
          setSnakeAppearance(newEvo.visuals);
          setEvolution(newEvo);
          setGuideMessage(`EVOLUTION DETECTED: ${newEvo.name}!`);
        } catch (e) {
          console.error("Evolution failed", e);
        }
      }
    }
  };

  const resetGame = () => {
    window.location.reload(); // Simple refresh for now to reset canvas refs properly
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
        SERPENT'S JOURNEY
      </h1>

      <div className="game-wrapper" style={{ position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          biomedata={biome}
          snakeAppearance={snakeAppearance}
        />

        {/* HUD */}
        <div className="hud-overlay" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(10, 10, 20, 0.85)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)',
          minWidth: '180px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{gameState.score}</div>

          <div style={{ marginTop: '15px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Biome</div>
            <div style={{ fontWeight: 'bold', color: biome.foodColor }}>{biome.name}</div>
          </div>

          {evolution && (
            <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--success)', textTransform: 'uppercase' }}>Evolution</div>
              <div style={{ fontWeight: 'bold' }}>{evolution.name}</div>
            </div>
          )}
        </div>

        {/* Start/Game Over Overlay */}
        {(!gameState.isPlaying || gameState.isGameOver) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px'
          }}>
            {gameState.isGameOver ? (
              <>
                <h2 style={{ color: 'var(--error)', fontSize: '3rem', marginBottom: '1rem' }}>SYSTEM CRASH</h2>
                <button
                  onClick={resetGame}
                  style={{
                    padding: '12px 30px',
                    fontSize: '1.1rem',
                    background: 'var(--error)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  Reboot System
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Ready for Insertion?</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Use W A S D or Arrows to control</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guide Box */}
      <div className="guide-box" style={{
        marginTop: '30px',
        background: 'var(--bg-secondary)',
        border: `1px solid ${guideMessage.includes("Signal lost") ? 'var(--error)' : 'var(--accent-primary)'}`,
        borderRadius: '12px',
        padding: '20px',
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        boxShadow: `0 0 30px ${guideMessage.includes("Signal lost") ? 'rgba(255, 61, 0, 0.1)' : 'rgba(0, 229, 255, 0.1)'}`
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: guideMessage.includes("Signal lost") ? 'var(--error)' : 'var(--accent-primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          color: '#000',
          fontSize: '1.5rem',
          flexShrink: 0
        }}>
          {guideMessage.includes("Signal lost") ? "!" : "H"}
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '5px', fontWeight: 'bold' }}>
            {guideMessage.includes("Signal lost") ? "SYSTEM // ERROR" : "HELIX // SYSTEM GUIDE"}
          </div>
          <div style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            {guideMessage.includes("Signal lost") ? (
              <span>Signal lost... Please <a href="https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview" target="_blank" rel="noreferrer" style={{ color: 'var(--error)', textDecoration: 'underline' }}>enable the Gemini API</a> for this project.</span>
            ) : guideMessage}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
