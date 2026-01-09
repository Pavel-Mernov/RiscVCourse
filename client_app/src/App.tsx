
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContestsPage from './pages/ContestsPage';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import ContestPage from './pages/ContestPage';

function App() {

  

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/contests/:id" element={<ContestPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    
  );
}

export default App;

