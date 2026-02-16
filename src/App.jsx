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
    // Only fetch if API key is present
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      import('./services/aiService').then(({ getGuideMessage }) => {
        getGuideMessage("GAME_START", {}).then(setGuideMessage);
      }).catch(err => console.error("Failed to load AI service", err));
    } else {
      setGuideMessage("System: API Key missing. AI features disabled.");
    }
  }, []);

  const handleGameOver = async (reason) => {
    setGameState(prev => ({ ...prev, isGameOver: true }));
    console.log("Game Over:", reason);

    // Get AI commentary on death
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      const { getGuideMessage } = await import('./services/aiService');
      const msg = await getGuideMessage("GAME_OVER", { reason, score: gameState.score });
      setGuideMessage(msg);
    }
  };

  const handleScoreUpdate = async (newScore) => {
    setGameState(prev => ({ ...prev, score: newScore }));

    // Dynamic Biome Change every 50 points
    if (newScore > 0 && newScore % 50 === 0) {
      const newLevel = Math.floor(newScore / 50) + 1;
      setGameState(prev => ({ ...prev, level: newLevel }));

      if (import.meta.env.VITE_GEMINI_API_KEY) {
        const { generateBiome, getGuideMessage } = await import('./services/aiService');

        // Trigger Guide comment
        getGuideMessage("LEVEL_UP", { level: newLevel }).then(setGuideMessage);

        // Change Biome
        const newBiome = await generateBiome(newLevel);
        setBiome(newBiome);
      }
    }

    // Evolution triggers every 100 points
    if (newScore > 0 && newScore % 100 === 0) {
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        const { generateEvolution } = await import('./services/aiService');
        const newEvo = await generateEvolution(newScore, snakeAppearance);

        setSnakeAppearance(newEvo.visuals);
        setEvolution(newEvo);
        setGuideMessage(`EVOLUTION DETECTED: ${newEvo.name}!`);
      }
    }
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Inter', sans-serif"
    }}>
      <h1 className="game-title" style={{
        marginBottom: '20px',
        background: 'linear-gradient(to right, #00E5FF, #6600FF)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '3rem',
        fontWeight: '900'
      }}>
        SERPENT'S JOURNEY
      </h1>

      <div style={{ position: 'relative' }}>
        <GameCanvas
          gameState={gameState}
          setGameState={setGameState}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          biomedata={biome}
          snakeAppearance={snakeAppearance}
        />

        {/* HUD Overlay */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid #333',
          minWidth: '200px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Score: <span style={{ color: '#00E5FF' }}>{gameState.score}</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
            Biome: <span style={{ color: biomedata.foodColor }}>{biomedata.name}</span>
          </div>
          {evolution && (
            <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#00E676', textTransform: 'uppercase' }}>Current Form</div>
              <div style={{ fontWeight: 'bold' }}>{evolution.name}</div>
              <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#888' }}>{evolution.ability}</div>
            </div>
          )}
        </div>

        {/* AI Guide Dialogue */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(20, 20, 30, 0.9)',
          border: '1px solid #00E5FF',
          borderRadius: '8px',
          padding: '15px',
          maxWidth: '600px',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)',
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#00E5FF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#000',
            fontSize: '1.2rem'
          }}>H</div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#00E5FF', marginBottom: '4px' }}>HELIX // SYSTEM GUIDE</div>
            <div style={{ lineHeight: '1.4' }}>{guideMessage}</div>
          </div>
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center', opacity: 0.7 }}>
          {!gameState.isPlaying && !gameState.isGameOver && <p>Press W/A/S/D to Start</p>}
          {gameState.isGameOver && <p style={{ color: '#FF3D00', fontWeight: 'bold' }}>GAME OVER - Refresh to Restart</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
