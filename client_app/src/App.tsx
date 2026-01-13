
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContestsPage from './pages/ContestsPage';
import Login from './pages/Login';
import { AuthProvider, } from './context/AuthContext';
import ContestPage from './pages/ContestPage';
import TaskPage from './pages/TaskPage';
import CreateContestPage from './pages/CreateContestPage';
import EditContestPage from './pages/EditContestPage';

function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contests" element={<ContestsPage />} />
          <Route path="/create-contest" element={ <CreateContestPage /> }  />
          <Route path="/contests/:id" element={<ContestPage />} />
          <Route path="/contests/:id/edit" element={<EditContestPage />} />
          <Route path="/tasks/:id" element={<TaskPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    
  );
}

export default App;

