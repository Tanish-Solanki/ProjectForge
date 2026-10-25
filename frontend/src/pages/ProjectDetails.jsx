import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import Alert from '../components/Alert';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [relation, setRelation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    maxTeamSize: 4,
    deadline: '',
    status: 'Open',
  });

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getById(id);
      if (res.success) {
        setProject(res.project);
        setRelation(res.userRelation);
        setEditForm({
          title: res.project.title,
          description: res.project.description,
          requiredSkills: (res.project.requiredSkills || []).join(', '),
          maxTeamSize: res.project.maxTeamSize,
          deadline: res.project.deadline ? res.project.deadline.split('T')[0] : '',
          status: res.project.status,
        });

        // If the user is the owner or an admin, fetch join requests
        if (res.userRelation?.isOwner || isAdmin) {
          fetchJoinRequests();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const reqRes = await projectAPI.getRequests(id);
      if (reqRes.success) {
        setRequests(reqRes.requests);
      }
    } catch (err) {
      console.error('Failed to load join requests:', err);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, isAuthenticated]);

  // Request to join handler
  const handleJoinRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await projectAPI.requestJoin(id);
      if (res.success) {
        setSuccess('Join request submitted successfully. The project owner has been notified.');
        await fetchProjectData();
      }
    } catch (err) {
      setError(err.message || 'Could not submit join request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Owner: Accept or reject join request
  const handleReviewRequest = async (requestId, status) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await projectAPI.handleRequest(id, requestId, status);
      if (res.success) {
        setSuccess(`Request has been ${status.toLowerCase()}.`);
        await fetchProjectData();
      }
    } catch (err) {
      setError(err.message || `Failed to ${status.toLowerCase()} request.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Owner: Save edits
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      const res = await projectAPI.update(id, {
        title: editForm.title,
        description: editForm.description,
        requiredSkills: editForm.requiredSkills,
        maxTeamSize: Number(editForm.maxTeamSize),
        deadline: editForm.deadline || undefined,
        status: editForm.status,
      });

      if (res.success) {
        setSuccess('Project updated successfully.');
        setIsEditing(false);
        await fetchProjectData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update project.');
    } finally {
      setActionLoading(false);
    }
  };

  // Owner: Delete project
  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await projectAPI.delete(id);
      navigate('/projects', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Project Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The project you requested does not exist or was removed.</p>
        <Link to="/projects" className="inline-block mt-4 text-blue-600 font-medium hover:underline">
          ← Back to All Projects
        </Link>
      </div>
    );
  }

  const isOwner = relation?.isOwner;
  const isMember = relation?.isMember;
  const hasPendingRequest = relation?.hasPendingRequest;
  const members = project.members || [];
  const isTeamFull = members.length >= project.maxTeamSize;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <Link to="/projects" className="text-xs text-blue-600 hover:underline">
          ← Back to All Projects
        </Link>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Main Project Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs mb-8">
        {isEditing ? (
          /* Edit Mode Form */
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Edit Project Details</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={4}
                required
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.requiredSkills}
                  onChange={(e) => setEditForm({ ...editForm, requiredSkills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Max Team Size (Min {members.length})
                </label>
                <input
                  type="number"
                  min={members.length}
                  max={20}
                  required
                  value={editForm.maxTeamSize}
                  onChange={(e) => setEditForm({ ...editForm, maxTeamSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                {actionLoading ? 'Saving...' : 'Save Updates'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs px-2.5 py-0.5 rounded font-medium bg-blue-100 border border-blue-300 text-blue-800"
                  >
                    {project.status}
                  </span>

                  {isOwner && (
                    <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      You are the Project Owner
                    </span>
                  )}
                  {isMember && !isOwner && (
                    <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      You are a Team Member
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              </div>

              {/* Owner or Admin Action Buttons */}
              {(isOwner || isAdmin) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-medium rounded cursor-pointer"
                  >
                    Edit Project
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-medium rounded cursor-pointer"
                  >
                    {isAdmin && !isOwner ? 'Delete (Admin)' : 'Delete Project'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Project Metadata Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs mb-6">
              <div>
                <span className="text-gray-500 block mb-0.5">Project Creator</span>
                <span className="font-semibold text-gray-800">{project.owner?.name}</span>
                <span className="block text-gray-400 font-mono text-[11px]">{project.owner?.email}</span>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">Team Size</span>
                <span className={`font-semibold ${isTeamFull ? 'text-red-600' : 'text-gray-800'}`}>
                  {members.length} / {project.maxTeamSize} Members {isTeamFull ? '(Full)' : ''}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">Submission Deadline</span>
                <span className="font-semibold text-gray-800">
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString()
                    : 'No specific deadline'}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block mb-0.5">Created On</span>
                <span className="font-semibold text-gray-800">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Required Skills Section */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills && project.requiredSkills.length > 0 ? (
                  project.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs bg-gray-100 text-gray-800 rounded border border-gray-200 font-medium hover:bg-blue-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No specific skills listed</span>
                )}
              </div>
            </div>

            {/* Team Members List */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Current Team Members ({members.length})
              </h3>
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                {members.map((member) => (
                  <div key={member._id} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div>
                      <span className="font-semibold text-gray-800 mr-2">{member.name}</span>
                      {member._id === project.owner?._id && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                          Owner
                        </span>
                      )}
                      <span className="block text-gray-500 font-mono text-[11px] mt-0.5">
                        {member.email} • {member.experienceLevel || 'Beginner'}
                      </span>
                    </div>

                    <div className="text-right">
                      {member.skills && member.skills.length > 0 && (
                        <span className="text-[11px] text-gray-500">
                          {member.skills.slice(0, 3).join(', ')}
                          {member.skills.length > 3 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Join Request Button for Non-Members */}
            {!isOwner && !isMember && (
              <div className="pt-4 border-t border-gray-200">
                {hasPendingRequest ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-center justify-between">
                    <span>Your join request is currently pending review by the project owner.</span>
                    <span className="font-semibold text-xs uppercase tracking-wider bg-yellow-200 px-2 py-0.5 rounded">
                      Pending
                    </span>
                  </div>
                ) : isTeamFull ? (
                  <div className="p-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600">
                    This project team has reached its maximum capacity of {project.maxTeamSize} members.
                  </div>
                ) : project.status === 'Completed' ? (
                  <div className="p-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600">
                    This project is completed and is no longer accepting new team members.
                  </div>
                ) : (
                  <button
                    onClick={handleJoinRequest}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded transition-colors shadow-xs cursor-pointer"
                  >
                    {actionLoading ? 'Sending Request...' : 'Request to Join Team'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner or Admin: Join Requests Management Section */}
      {(isOwner || isAdmin) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Manage Join Requests</h2>
            </div>
            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-medium border border-gray-200">
              {requests.filter((r) => r.status === 'Pending').length} Pending
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
              No join requests received yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 border border-gray-200 rounded-md">
              {requests.map((req) => (
                <div key={req._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {req.student?.name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {req.student?.experienceLevel}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${req.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : req.status === 'Accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-mono">{req.student?.email}</p>

                    {req.student?.skills && req.student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[11px] text-gray-500">Skills:</span>
                        {req.student.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Owner Action Buttons for Pending Requests */}
                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewRequest(req._id, 'Accepted')}
                        disabled={actionLoading || isTeamFull}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                        title={isTeamFull ? 'Team is full' : 'Accept student into team'}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req._id, 'Rejected')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
