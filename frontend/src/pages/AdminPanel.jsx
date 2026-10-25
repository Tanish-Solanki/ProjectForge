import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load administrative data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);
      setFeedback({ type: '', message: '' });
      const res = await adminAPI.updateUserRole(userId, newRole);

      if (res.success) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        // Refresh stats
        const statsRes = await adminAPI.getStats();
        if (statsRes.success) setStats(statsRes.stats);

        setFeedback({
          type: 'success',
          message: res.message || `Role updated to ${newRole}.`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update user role.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${userName}"? This will remove all their created projects and join requests.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setFeedback({ type: '', message: '' });
      const res = await adminAPI.deleteUser(userId);

      if (res.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
        const statsRes = await adminAPI.getStats();
        if (statsRes.success) setStats(statsRes.stats);

        setFeedback({
          type: 'success',
          message: res.message || 'User deleted successfully.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete user.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-purple-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-gray-500">Loading admin metrics & users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>Admin Panel</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                RBAC Control
              </span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Oversee platform activity, manage user roles, and enforce permissions.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={actionLoading}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded transition-colors cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className="mb-6">
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback({ type: '', message: '' })}
          />
        </div>
      )}

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Students</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.studentCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Faculty</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.facultyCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Admins</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{stats.adminCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProjects}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Join Requests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRequests}</p>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">User Role Management</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Change user roles directly to grant or restrict platform permissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium text-xs">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="px-4 py-3">Assign Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{u.name}</div>
                        {isCurrent && (
                          <span className="text-[10px] text-purple-600 font-semibold">(You)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {u.experienceLevel || 'Beginner'}
                      </td>
                      <td className="px-4 py-3">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 border border-purple-200">
                            Admin
                          </span>
                        ) : u.role === 'faculty' ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Faculty
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-700 border border-blue-200">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          disabled={actionLoading || isCurrent}
                          value={u.role || 'student'}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={actionLoading}
                            className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
