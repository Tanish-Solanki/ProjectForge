import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import Alert from '../components/Alert';

const MyProjects = () => {
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'joined'

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        setLoading(true);
        const res = await projectAPI.getMyProjects();
        if (res.success) {
          setCreatedProjects(res.createdProjects || []);
          setJoinedProjects(res.joinedProjects || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load your projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Project Portfolio</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage projects you have created and view projects you are participating in.
          </p>
        </div>

        <Link
          to="/projects?action=create"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
        >
          + Create New Project
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 flex space-x-6">
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === 'created'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Projects Created by Me ({createdProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === 'joined'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Projects I Have Joined ({joinedProjects.length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          Loading your projects...
        </div>
      ) : activeTab === 'created' ? (
        /* Created Projects Tab */
        createdProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <p className="text-gray-700 font-medium">You haven't created any projects yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Start an initiative and invite classmates to join your team.
            </p>
            <Link
              to="/projects?action=create"
              className="inline-block mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {project.title}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium shrink-0 bg-blue-100 border border-blue-200 text-blue-600"
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills && project.requiredSkills.length > 0 ? (
                        project.requiredSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200"
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

                <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Team Members:</span>
                    <span className="font-semibold text-gray-800">
                      {project.members?.length || 1} / {project.maxTeamSize}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="text-gray-700">
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="block text-center w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded border border-blue-200 transition-colors"
                    >
                      Manage Project & Join Requests →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Joined Projects Tab */
        joinedProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <p className="text-gray-700 font-medium">You haven't joined any other projects yet.</p>
            <p className="text-sm text-gray-500 mt-1">
              Browse available course projects and submit a join request to participate.
            </p>
            <Link
              to="/projects"
              className="inline-block mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Explore Projects to Join
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {project.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${project.status === 'Open'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mb-3 text-xs">
                    <span className="text-gray-500">Owner: </span>
                    <span className="font-semibold text-gray-800">
                      {project.owner?.name} ({project.owner?.email})
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Team Count:</span>
                    <span className="font-semibold text-gray-800">
                      {project.members?.length || 1} / {project.maxTeamSize}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="text-gray-700">
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="block text-center w-full py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium rounded border border-gray-200 transition-colors"
                    >
                      View Project Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyProjects;
