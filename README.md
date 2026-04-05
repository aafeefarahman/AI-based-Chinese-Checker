---
## AI BASED CHINESE CHECKER

<img width="1715" height="747" alt="image" src="https://github.com/user-attachments/assets/116e8021-3585-46a9-9d81-0631175fccfe" />
This project implements a Chinese Checkers game with an AI opponent. The system uses a React frontend for the user interface and a Flask backend for handling game logic and AI decision-making.

---

## Overview

Chinese Checkers is a strategy-based board game where players aim to move all their pieces into the opposite triangle. This project focuses on building an AI that can evaluate moves and make decisions based on the current game state.

---

## Features

* Interactive game board
* AI-based move selection
* Minimax algorithm implementation
* Alpha-Beta pruning for optimization
* Heuristic-based evaluation
* Separation of frontend and backend

---

## AI Concepts Used

* Adversarial Search
* Minimax Algorithm
* Alpha-Beta Pruning
* Heuristic Function

---

## Tech Stack

### Frontend

* React.js
* CSS

### Backend

* Flask (Python)

---

## Project Structure

```bash
Chinese Checker/
│
├── chinese-checkers/
│   ├── backend/
│   ├── frontend/
│   ├── README.md
│   ├── start-backend.bat
│   └── start-frontend.bat
```

---

## Architecture

The project follows a simple frontend-backend structure:

* The frontend (React) handles the user interface and interactions
* The backend (Flask) handles game logic and AI computation
* The frontend sends game data to the backend and receives the best move in response

---

## Installation and Setup

### Clone the repository

```bash
git clone https://github.com/aafeefarahman/AI-based-Chinese-Checker.git
cd AI-based-Chinese-Checker
```

---

### Run Backend

```bash
cd chinese-checkers/backend
pip install -r requirements.txt
python app.py
```

---

### Run Frontend

```bash
cd chinese-checkers/frontend
npm install
npm run dev
```

---

## Usage

* Start both backend and frontend
* Open the application in your browser
* Play the game against AI

---

## How It Works

* The system generates possible moves
* Minimax evaluates each move
* Alpha-Beta pruning improves performance
* Heuristic function scores positions
* The best move is selected

---

## Future Improvements

* Better heuristic functions
* Difficulty levels
* Multiplayer support
* UI improvements

---

## Feedback

Feedback and suggestions are welcome for improving the project.

---

