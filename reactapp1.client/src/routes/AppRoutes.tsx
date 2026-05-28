import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import PublicRoute from '../components/layout/PublicRoute';
import Game from '../pages/Game';
import Home from '../pages/Home';
import Login from '../pages/Login';
import MemoryGame from '../pages/MemoryGame';
import Presentation from '../pages/Presentation';
import TicTacToeGame from '../pages/TicTacToeGame';
import TriviaGame from '../pages/TriviaGame';
import Register from '../pages/Register';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Presentation />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/game/tic-tac-toe/room/:roomId" element={<TicTacToeGame />} />
        <Route path="/game/trivia/room/:roomId" element={<TriviaGame />} />
        <Route path="/game/memory/room/:roomId" element={<MemoryGame />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
