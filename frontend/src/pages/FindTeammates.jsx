import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Alert from '../components/Alert';

const FindTeammates = () => {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const fetchTeammates = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getTeammates();
        if (res.success) {
          setTeammates(res.teammates);
          setMeta({
            userHasProjects: res.userHasProjects,
            userSkillsCount: res.userSkillsCount,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load teammates data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeammates();
  }, []);

  const filteredTeammates = teammates.filter((student) => {
    const query = searchFilter.toLowerCase();
    const nameMatch = student.name.toLowerCase().includes(query);
    const skillMatch = (student.skills || []).some((s) => s.toLowerCase().includes(query));
    const interestMatch = (student.interests || []).some((i) => i.toLowerCase().includes(query));
    return nameMatch || skillMatch || interestMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Compatible Teammates</h1>
        <p className="text-sm text-gray-600 mt-1">
          Discover students ranked by algorithmic compatibility with your technical skillset and project needs.
        </p>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Matching Criteria Explanation Box */}
      <div className="bg-white border border-blue-200 rounded-lg p-5 mb-8 shadow-xs">
        <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Deterministic Matching Criteria (Out of 100 Points)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <span className="font-semibold text-gray-800 block mb-1">
              1. Direct Skill Overlap (Up to 40 Pts)
            </span>
            Evaluates matching technical competencies between your profile skills and the candidate's skills.
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <span className="font-semibold text-gray-800 block mb-1">
              2. Complementary Project Needs (Up to 35 Pts)
            </span>
            Infers required skills listed in your owned/joined projects that you lack, but the candidate specializes in.
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded">
            <span className="font-semibold text-gray-800 block mb-1">
              3. Shared Domain Interests (Up to 25 Pts)
            </span>
            Measures mutual areas of interest (e.g. Web Development, Cloud Computing, AI) for project alignment.
          </div>
        </div>

        {meta.userSkillsCount === 0 && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            Tip: You currently have no technical skills listed on your profile. Update your profile skills to get higher and more meaningful compatibility scores.
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6 shadow-xs flex items-center">
        <input
          type="text"
          placeholder="Filter students by name, skill, or interest..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border-none focus:outline-none"
        />
        {searchFilter && (
          <button
            onClick={() => setSearchFilter('')}
            className="text-xs text-gray-500 hover:text-gray-700 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Teammates List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          Calculating teammate compatibility scores...
        </div>
      ) : teammates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-700 font-medium">No other registered students found.</p>
          <p className="text-sm text-gray-500 mt-1">
            As other college classmates register, they will automatically appear here with their match scores.
          </p>
        </div>
      ) : filteredTeammates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-600">
          No students found matching "{searchFilter}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTeammates.map((student) => {
            const score = student.compatibilityScore;
            const scoreColor =
              score >= 70
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : score >= 40
                ? 'text-blue-700 bg-blue-50 border-blue-200'
                : 'text-gray-700 bg-gray-50 border-gray-200';

            return (
              <div
                key={student._id}
                className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors"
              >
                <div>
                  {/* Top info and compatibility badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{student.name}</h3>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        {student.email} • {student.experienceLevel}
                      </div>
                    </div>

                    <div className={`px-3 py-1.5 rounded-lg border text-center shrink-0 ${scoreColor}`}>
                      <div className="text-lg font-bold leading-tight">{score}</div>
                      <div className="text-[10px] uppercase font-semibold">Match Score</div>
                    </div>
                  </div>

                  {/* Score breakdown metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-gray-50 border border-gray-100 rounded text-center text-[11px]">
                    <div>
                      <span className="text-gray-400 block">Skill Match</span>
                      <span className="font-semibold text-gray-800">
                        {student.breakdown?.skillPoints || 0} / 40
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Complementary</span>
                      <span className="font-semibold text-gray-800">
                        {student.breakdown?.complementaryPoints || 0} / 35
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Interests</span>
                      <span className="font-semibold text-gray-800">
                        {student.breakdown?.interestPoints || 0} / 25
                      </span>
                    </div>
                  </div>

                  {/* Complementary Skills Highlight */}
                  {student.complementarySkills && student.complementarySkills.length > 0 && (
                    <div className="mb-3 p-2 bg-emerald-50 border border-emerald-100 rounded text-xs">
                      <span className="font-semibold text-emerald-800 block mb-1">
                        ★ Complementary to Your Projects:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {student.complementarySkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-medium rounded text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Matching Skills */}
                  {student.matchingSkills && student.matchingSkills.length > 0 && (
                    <div className="mb-3 text-xs">
                      <span className="text-gray-500 block mb-1">Direct Shared Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {student.matchingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Candidate Skills */}
                  <div className="mb-3 text-xs">
                    <span className="text-gray-500 block mb-1">All Technical Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {student.skills && student.skills.length > 0 ? (
                        student.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 text-[11px]"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Areas of Interest */}
                  <div className="text-xs">
                    <span className="text-gray-500 block mb-1">Interests:</span>
                    <div className="flex flex-wrap gap-1">
                      {student.interests && student.interests.length > 0 ? (
                        student.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[11px]"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No interests listed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                  <a
                    href={`mailto:${student.email}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Contact via Email →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FindTeammates;
