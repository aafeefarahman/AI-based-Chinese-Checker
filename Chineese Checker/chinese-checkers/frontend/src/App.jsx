import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MenuPage from './pages/MenuPage'
import GamePage from './pages/GamePage'

export default function App() {
  const [players, setPlayers] = useState({ p1: null, p2: null })
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<MenuPage  players={players} setPlayers={setPlayers} />} />
        <Route path="/game" element={<GamePage  players={players} />} />
        <Route path="*"     element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
