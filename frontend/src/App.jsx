import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import FindTeammates from './pages/FindTeammates';
import MyProjects from './pages/MyProjects';

function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-sm text-gray-600 mb-6">The page you requested could not be found.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/teammates" element={<FindTeammates />} />
                <Route path="/my-projects" element={<MyProjects />} />
              </Route>

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-lg font-medium text-gray-700">
                ProjectForge • Hackathon Teammate Matching Platform
              </p>
              {/* <p className="mt-1 text-gray-400">
                Built with React, Express, Node.js, and MongoDB
              </p> */}
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
