import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Alert from '../components/Alert';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setLoading(true);
        const data = await projectAPI.getAll();
        if (data.success) {
          // Take top 4 most recent projects for quick dashboard preview
          setProjects(data.projects.slice(0, 4));
        }
      } catch (err) {
        setError('Failed to load recent projects from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-500 rounded-md font-medium">
              {user?.experienceLevel}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as <span className="font-mono text-gray-800">{user?.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/projects?action=create"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
          >
            + Create a Project
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Profile Summary & Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Skills */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Your Technical Skills
            </h2>
            <Link to="/profile" className="text-xs text-blue-600 hover:text-blue-900">
              Edit
            </Link>
          </div>
          {user?.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 font-medium hover:bg-blue-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No skills added yet.</p>
          )}
        </div>

        {/* User Interests */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Areas of Interest
            </h2>
            <Link to="/profile" className="text-xs text-blue-600 hover:text-blue-900">
              Edit
            </Link>
          </div>
          {user?.interests && user.interests.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {user.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 font-medium hover:bg-blue-100"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No interests listed.</p>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
              Platform Actions
            </h2>
            <div className="space-y-2">
              <Link
                to="/teammates"
                className="block p-2.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-sm font-medium text-blue-600 transition-colors hover:text-blue-900"
              >
                Discover Potential Teammates
              </Link>
              <Link
                to="/my-projects"
                className="block p-2.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-sm font-medium text-blue-600 transition-colors hover:text-blue-900"
              >
                View My Projects & Requests
              </Link>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Keep your skills updated to improve teammate match accuracy.
          </div>
        </div>
      </div>

      {/* Available Projects Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Available Course Projects</h2>
            {/* <p className="text-xs text-gray-500">Recently published student projects in MongoDB</p> */}
          </div>
          <Link
            to="/projects"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all projects →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded">
            <p className="text-sm text-gray-600 font-medium">No projects published yet.</p>
            <p className="text-xs text-gray-500 mt-1">Be the first student to create a project for your team!</p>
            <Link
              to="/projects?action=create"
              className="inline-block mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Create Project Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="border border-gray-200 rounded-md p-4 hover:border-gray-300 transition-colors bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-gray-900 leading-snug">
                      {proj.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${proj.status === 'Open'
                        ? 'bg-green-100 text-green-800'
                        : proj.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {proj.description}
                  </p>

                  <div className="mb-3">
                    <span className="text-xs text-gray-500 block mb-1">Required Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {proj.requiredSkills && proj.requiredSkills.length > 0 ? (
                        proj.requiredSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">None specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    Team:{' '}
                    <span className="font-semibold text-gray-700">
                      {proj.members?.length || 1} / {proj.maxTeamSize}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${proj._id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
