
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ContestsPage from './pages/ContestsPage';
import Login from './pages/Login';
import { AuthProvider, } from './context/AuthContext';
import ContestPage from './pages/ContestPage';
import TaskPage from './pages/TaskPage';
import CreateContestPage from './pages/CreateContestPage';
import EditContestPage from './pages/EditContestPage';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';
import { ServerConnectionProvider } from './context/ServerConnectionContext';
import ReportPage from './pages/ReportPage';
import TeacherReportPage from './pages/TeacherReportPage';

function App() {


  return (
    <ServerConnectionProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contests" element={<ContestsPage />} />
            <Route path="/create-contest" element={ <CreateContestPage /> }  />
            <Route path="/contests/:id" element={<ContestPage />} />
            <Route path="/contests/:id/edit" element={<EditContestPage />} />
            <Route path="/contests/:contestId/create-task" element={<CreateTaskPage />} />
            <Route path="/tasks/:id" element={<TaskPage />} />
            <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/report/teacher" element={<TeacherReportPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ServerConnectionProvider>
    
    
  );
}

export default App;

