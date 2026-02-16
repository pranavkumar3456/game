import React, { useRef, useEffect } from 'react';

const GRID_SIZE = 20;
const TILE_SIZE = 20; // Will be calculated dynamically based on canvas size

const GameCanvas = ({
    gameState,
    setGameState,
    onGameOver,
    onScoreUpdate,
    biomedata,
    snakeAppearance
}) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const lastTimeRef = useRef(0);
    const snakeRef = useRef([{ x: 10, y: 10 }]);
    const directionRef = useRef({ x: 0, y: 0 }); // Start stationary
    const foodRef = useRef({ x: 15, y: 15 });
    const scoreRef = useRef(0);

    // Game constants - could be part of props for difficulty
    const INITIAL_SPEED = 150; // ms per move
    const speedRef = useRef(INITIAL_SPEED);
    const lastMoveTimeRef = useRef(0);

    // Initialize game state logic
    useEffect(() => {
        // Input handling
        const handleKeyDown = (e) => {
            if (gameState.isGameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    if (directionRef.current.y !== 1) directionRef.current = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 's':
                    if (directionRef.current.y !== -1) directionRef.current = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'a':
                    if (directionRef.current.x !== 1) directionRef.current = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                    if (directionRef.current.x !== -1) directionRef.current = { x: 1, y: 0 };
                    break;
            }

            // Start game on first input if stationary
            if (!gameState.isPlaying && !gameState.isGameOver && (directionRef.current.x !== 0 || directionRef.current.y !== 0)) {
                setGameState(prev => ({ ...prev, isPlaying: true }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, setGameState]);

    // Main Game Loop
    const animate = (time) => {
        lastTimeRef.current = time;

        update(time);
        render();

        if (!gameState.isGameOver) {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    const update = (time) => {
        if (!gameState.isPlaying || gameState.isPaused) return;

        if (time - lastMoveTimeRef.current > speedRef.current) {
            moveSnake();
            lastMoveTimeRef.current = time;
        }
    };

    const moveSnake = () => {
        const head = { ...snakeRef.current[0] };
        head.x += directionRef.current.x;
        head.y += directionRef.current.y;

        // Grid Boundaries
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            handleGameOver("Hit the wall!");
            return;
        }

        // Self Collision
        if (snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
            handleGameOver("Ouroboros accident!");
            return;
        }

        const newSnake = [head, ...snakeRef.current];

        // Check Food Collision
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
            // Ate food
            scoreRef.current += 10;
            onScoreUpdate(scoreRef.current);
            spawnFood();
            // Increase speed slightly
            speedRef.current = Math.max(50, speedRef.current * 0.98);
        } else {
            // Didn't eat, remove tail
            newSnake.pop();
        }

        snakeRef.current = newSnake;
    };

    const spawnFood = () => {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            // Check if food spawns on snake
            const onSnake = snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
            if (!onSnake) break;
        }
        foodRef.current = newFood;
    };

    const handleGameOver = (reason) => {
        cancelAnimationFrame(requestRef.current);
        onGameOver(reason);
    };

    const render = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear Canvas
        ctx.fillStyle = biomedata?.bgColor || '#060608';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width / GRID_SIZE;
        const h = canvas.height / GRID_SIZE;

        // Draw Grid (Optional, for style)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * w, 0);
            ctx.lineTo(i * w, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * h);
            ctx.lineTo(canvas.width, i * h);
            ctx.stroke();
        }

        // Draw Food
        ctx.fillStyle = biomedata?.foodColor || '#00E5FF';
        ctx.shadowBlur = 15;
        ctx.shadowColor = biomedata?.foodColor || '#00E5FF';
        ctx.beginPath();
        const fx = foodRef.current.x * w + w / 2;
        const fy = foodRef.current.y * h + h / 2;
        ctx.arc(fx, fy, w / 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Snake
        snakeRef.current.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? (snakeAppearance?.headColor || '#FFFFFF') : (snakeAppearance?.bodyColor || '#00E676');

            // Gradient effect for body
            if (index > 0) {
                ctx.globalAlpha = 1 - (index / snakeRef.current.length) * 0.6;
            }

            ctx.fillRect(segment.x * w + 1, segment.y * h + 1, w - 2, h - 2);
            ctx.globalAlpha = 1.0;
        });
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, biomedata, snakeAppearance]);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="game-canvas"
            style={{
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                maxWidth: '100%'
            }}
        />
    );
};

export default GameCanvas;
