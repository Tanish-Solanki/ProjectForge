import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Alert from '../components/Alert';

const Projects = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form toggle and state
  const [showCreateForm, setShowCreateForm] = useState(
    searchParams.get('action') === 'create'
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    maxTeamSize: 4,
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll();
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide both title and description for the project.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await projectAPI.create({
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        maxTeamSize: Number(formData.maxTeamSize),
        deadline: formData.deadline || undefined,
      });

      if (res.success) {
        setSuccess('Project created successfully!');
        setFormData({
          title: '',
          description: '',
          requiredSkills: '',
          maxTeamSize: 4,
          deadline: '',
        });
        setShowCreateForm(false);
        // Refresh list
        await fetchProjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.requiredSkills || []).some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === 'ALL' || proj.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Projects</h1>
          <p className="text-sm text-gray-600">
            Browse active student project proposals or create your own project team.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setError('');
              setSuccess('');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs cursor-pointer"
          >
            {showCreateForm ? 'Cancel Creation' : '+ Create New Project'}
          </button>
        )}
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Project Creation Form Box */}
      {showCreateForm && (
        <div className="bg-white border border-blue-200 rounded-lg p-6 mb-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Create a New Project</h2>
          <p className="text-xs text-gray-500 mb-4">
            You will automatically become the owner and first member of this project team.
          </p>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Project Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. ProjectForge"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe project objectives, scope, architecture, and what members will work on..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requiredSkills">
                  Required Skills (comma-separated)
                </label>
                <input
                  id="requiredSkills"
                  name="requiredSkills"
                  type="text"
                  value={formData.requiredSkills}
                  onChange={handleInputChange}
                  placeholder="e.g. React, Node.js, Express, MongoDB"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="maxTeamSize">
                  Max Team Size *
                </label>
                <input
                  id="maxTeamSize"
                  name="maxTeamSize"
                  type="number"
                  min={1}
                  max={8}
                  required
                  value={formData.maxTeamSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deadline">
                Project Deadline (Optional)
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded transition-colors cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Save & Publish Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by title, skill, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          Loading projects from database...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-700 font-medium">No projects found matching your criteria.</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search query or create a new project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const memberCount = project.members?.length || 1;
            const isFull = memberCount >= project.maxTeamSize;

            return (
              <div
                key={project._id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-gray-300 shadow-xs transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-base font-bold text-gray-900 leading-snug">
                      {project.title}
                    </h2>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium shrink-0 bg-blue-100 text-blue-700 border border-blue-300"
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-xs font-semibold text-gray-500 block mb-1">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills && project.requiredSkills.length > 0 ? (
                        project.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No specific skills listed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Creator:</span>
                    <span className="font-medium text-gray-700">
                      {project.owner?.name || 'Student'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Team Capacity:</span>
                    <span
                      className={`font-semibold ${isFull ? 'text-red-600' : 'text-gray-700'
                        }`}
                    >
                      {memberCount} / {project.maxTeamSize} members {isFull ? '(Full)' : ''}
                    </span>
                  </div>

                  {project.deadline && (
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span className="text-gray-700">
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      to={`/projects/${project._id}`}
                      className="block text-center w-full py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium rounded border border-gray-200 transition-colors"
                    >
                      View Details & Join →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
