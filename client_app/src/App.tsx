
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContestsPage from './pages/ContestsPage';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contests" element={<ContestsPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

