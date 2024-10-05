import { createRoot } from 'react-dom/client'
import App, { AppWithParams } from './App.tsx'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Lobby } from './Lobby.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<AppWithParams />} />
      </Routes>
    </BrowserRouter>
  // </StrictMode>,
)

