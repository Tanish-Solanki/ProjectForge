import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Alert from '../components/Alert';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '',
    interests: '',
    experienceLevel: 'Beginner',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill profile from current user state or fetch fresh
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : '',
        experienceLevel: user.experienceLevel || 'Beginner',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      const res = await userAPI.updateProfile({
        name: formData.name,
        skills: formData.skills,
        interests: formData.interests,
        experienceLevel: formData.experienceLevel,
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Your profile has been successfully updated.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded capitalize bg-blue-50 text-blue-700 border border-blue-200">
              Role: {user?.role || 'student'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal profile, technical skills, and experience level.
          </p>
        </div>

        <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />
        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email & Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                College Email (Read-only)
              </label>
              <input
                id="email"
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Role (Fixed)
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-gray-100 text-gray-700 font-medium capitalize">
                {user?.role || 'student'}
              </div>
            </div>
          </div>


          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="skills">
              Technical Skills (comma-separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Express, MongoDB, Python"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used directly by the teammate compatibility algorithm.
            </p>
          </div>

          {/* Areas of Interest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interests">
              Areas of Interest (comma-separated)
            </label>
            <input
              id="interests"
              name="interests"
              type="text"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g. Web Development, Cloud, Data Science, Security"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="experienceLevel">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Beginner">Beginner (Course fundamentals)</option>
              <option value="Intermediate">Intermediate (Project experience)</option>
              <option value="Advanced">Advanced (Full-stack / industry practices)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded transition-colors shadow-xs cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
