
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContestsPage from './pages/ContestsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contests" element={<ContestsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

