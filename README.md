# Serpent's Journey

A modern, AI-enhanced reimagining of the classic Snake game. Features an Evolution System, Dynamic Biomes, an AI Guide, and Adaptive Difficulty, all powered by the Google Gemini API.

## Features

- **Evolution System**: The snake evolves as it consumes food, unlocking new abilities.
- **Dynamic Biomes**: The environment changes based on your progress.
- **AI Guide**: An intelligent guide that provides tips and commentary.
- **Adaptive Difficulty**: The game adjusts its difficulty based on your performance.

## Technology Stack

- **Frontend**: React, Vite
- **Styling**: Vanilla CSS
- **AI Integration**: Google Gemini API

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pranav05kumar/game.git
    cd game
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API Key:**
    -   Create a `.env` file in the root directory.
    -   You can use `.env.example` as a template: `cp .env.example .env`
    -   Add your Google Gemini API key to the `.env` file:
        ```env
        VITE_GEMINI_API_KEY=your_api_key_here
        ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

## License

MIT
