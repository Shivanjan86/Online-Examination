import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header'; // We will create this
import Login from './pages/Login';
import InstructorDashboard from './pages/InstructorDashboard'; 
import AddQuestions from './pages/AddQuestions';
import CreateExam from './pages/CreateExam';
import InstructorResults from './pages/InstructorResults';
import StudentDashboard from './pages/StudentDashboard';
import TakeExam from './pages/TakeExam';
import StudentResult from './pages/StudentResult';

// Layout to add the Header to all pages except Login
const AppLayout = () => (
  <>
    <Header />
    <Outlet /> {/* This renders the child route element */}
  </>
);

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Public Login Page (no header) */}
          <Route path="/" element={<Login />} />
          
          {/* Routes with the Header */}
          <Route element={<AppLayout />}>
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/exam/:examid" element={<TakeExam />} />
            <Route path="/student/results/:attemptid" element={<StudentResult />} />
            
            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} /> 
            <Route path="/instructor/questionbank" element={<AddQuestions />} /> 
            <Route path="/instructor/create-exam" element={<CreateExam />} /> 
            <Route path="/instructor/results" element={<InstructorResults />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;