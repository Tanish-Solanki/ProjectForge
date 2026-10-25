import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 mb-10 text-center shadow-xs">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-50 border border-gray-200 rounded-full mb-4">
          Academic Project Collaboration Platform
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
          Welcome to Project<span className="text-blue-600">Forge</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A dedicated platform for college students to publish course projects, find teammates with complementary technical skills, and manage project join requests.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
            >
              Go to Your Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-4 py-2 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs"
              >
                Register as a Student
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* How it Works Section */}
      {/* <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          How ProjectForge Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3 text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Create or Discover Projects</h3>
            <p className="text-sm text-gray-600 leading-normal">
              Post projects with required technical skillsets and team size limits, or browse ideas created by other students.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3 text-sm">
              2
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Find Compatible Teammates</h3>
            <p className="text-sm text-gray-600 leading-normal">
              Our deterministic algorithm matches students based on shared skills, overlapping interests, and project-specific complementary needs.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3 text-sm">
              3
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Request & Approve Join Requests</h3>
            <p className="text-sm text-gray-600 leading-normal">
              Send join requests to project creators. Project owners review student profiles and approve candidates without exceeding team limits.
            </p>
          </div>
        </div>
      </div> */}

      {/* College Project Scope Notice */}
      {/* <div className="bg-gray-100 border border-gray-200 rounded-lg p-5 text-sm text-gray-600">
        <p className="font-medium text-gray-800 mb-1">FSD Innovative Assignment Specification</p>
        <p>
          Built strictly with React, Node.js, Express, and MongoDB. Securely utilizes HTTP-only JWT cookies, bcryptjs password hashing, and role-based owner controls.
        </p>
      </div> */}
    </div>
  );
};

export default Home;
