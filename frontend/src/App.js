import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Assessment from "@/pages/Assessment";
import Report from "@/pages/Report";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminQuestions from "@/pages/AdminQuestions";
import AdminResults from "@/pages/AdminResults";
import ParentDashboard from "@/pages/ParentDashboard";
import SchoolDashboard from "@/pages/SchoolDashboard";
import SchoolStudents from "@/pages/SchoolStudents";
import Vocational from "@/pages/Vocational";
import BulkOnboard from "@/pages/BulkOnboard";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student */}
            <Route path="/dashboard" element={<ProtectedRoute roles={["student"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute roles={["student"]}><Assessment /></ProtectedRoute>} />
            <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/vocational" element={<ProtectedRoute roles={["student"]}><Vocational /></ProtectedRoute>} />

            {/* Parent */}
            <Route path="/parent" element={<ProtectedRoute roles={["parent"]}><ParentDashboard /></ProtectedRoute>} />

            {/* Counselor */}
            <Route path="/counselor" element={<ProtectedRoute roles={["counselor"]}><SchoolDashboard variant="counselor" /></ProtectedRoute>} />
            <Route path="/counselor/students" element={<ProtectedRoute roles={["counselor"]}><SchoolStudents variant="counselor" /></ProtectedRoute>} />
            <Route path="/counselor/bulk" element={<ProtectedRoute roles={["counselor"]}><BulkOnboard /></ProtectedRoute>} />

            {/* Principal */}
            <Route path="/principal" element={<ProtectedRoute roles={["principal"]}><SchoolDashboard variant="principal" /></ProtectedRoute>} />
            <Route path="/principal/students" element={<ProtectedRoute roles={["principal"]}><SchoolStudents variant="principal" /></ProtectedRoute>} />
            <Route path="/principal/bulk" element={<ProtectedRoute roles={["principal"]}><BulkOnboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/questions" element={<ProtectedRoute roles={["admin"]}><AdminQuestions /></ProtectedRoute>} />
            <Route path="/admin/results" element={<ProtectedRoute roles={["admin"]}><AdminResults /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
