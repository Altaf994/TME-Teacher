import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { questionsAPI, assignmentsAPI } from '../utils/api';
import worksheetsIcon from '../assets/images/Worksheets.png';
import universityIcon from '../assets/images/university.png';
import logoutIcon from '../assets/images/Logout.png';

const Worksheets = () => {
  const navigate = useNavigate();

  const [concepts, setConcepts] = useState([]);
  const [lengths, setLengths] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedConcept, setSelectedConcept] = useState('');
  const [selectedLength, setSelectedLength] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [speed, setSpeed] = useState(60);
  const [title, setTitle] = useState('Math Practice');
  const [userId, setUserId] = useState('');
  const [section, setSection] = useState('');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filters = await questionsAPI.getQuestionFilters();
        setConcepts(filters.complexities || []);
        setLengths(filters.lengths || []);

        // Set default values
        if (filters.complexities && filters.complexities.length > 0) {
          setSelectedConcept(filters.complexities[0]);
        }
        if (filters.lengths && filters.lengths.length > 0) {
          setSelectedLength(filters.lengths[0]);
        }
      } catch (error) {
        toast.error('Failed to load question filters');
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const handleGenerate = async () => {
    if (!selectedConcept || !selectedLength) {
      toast.error('Please select a concept and length.');
      return;
    }

    try {
      const payload = {
        complexity: selectedConcept,
        length: parseInt(selectedLength),
        numQuestions: questionCount,
        speed: speed,
        title: title,
        ...(userId && { userId: parseInt(userId) }),
        ...(section && { section }),
      };

      await assignmentsAPI.createAssignment(payload);
      toast.success('Assignment created successfully!');
      navigate('/dashboard'); // or wherever appropriate
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error('Error creating assignment:', error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-yellow-50">
      <div
        className="relative w-full max-w-6xl mx-auto bg-[#faf9ed] rounded-3xl shadow-2xl border border-yellow-300 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col"
        style={{ minHeight: '80vh' }}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src={worksheetsIcon}
              alt="Worksheets"
              className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 mr-3"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-black text-center">
            WORKSHEETS GENERATOR
          </h1>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center group focus:outline-none"
          >
            <img
              src={logoutIcon}
              alt="Logout"
              className="w-8 h-8 sm:w-12 sm:h-12 mb-1"
            />
            <span className="text-black text-sm sm:text-lg font-serif group-hover:underline">
              Logout
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left controls */}
          <div className="space-y-8">
            {/* Concept */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                Concept:
              </div>
              <div className="flex-1 max-w-md">
                <select
                  value={selectedConcept}
                  onChange={e => setSelectedConcept(e.target.value)}
                  className="w-full max-w-sm bg-white border border-blue-200 rounded-xl px-4 py-2 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                >
                  {concepts.map(concept => (
                    <option key={concept} value={concept}>
                      {concept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Length of Question */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                Length of Question:
              </div>
              <div className="flex-1 max-w-md">
                <select
                  value={selectedLength}
                  onChange={e => setSelectedLength(e.target.value)}
                  className="w-full max-w-sm bg-white border border-blue-200 rounded-xl px-4 py-2 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                  disabled={loading}
                >
                  {lengths.map(length => (
                    <option key={length} value={length}>
                      {length}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Number of Questions */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                Numbers of Questions:
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setQuestionCount(prev => clamp(prev - 1, 1, 100))
                  }
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-200 text-black text-2xl leading-none shadow active:scale-95"
                  aria-label="decrease count"
                >
                  −
                </button>
                <div className="w-20 md:w-24 text-center bg-white border border-gray-200 rounded-xl py-2 text-lg md:text-xl font-semibold shadow">
                  {questionCount}
                </div>
                <button
                  onClick={() =>
                    setQuestionCount(prev => clamp(prev + 1, 1, 100))
                  }
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-200 text-black text-2xl leading-none shadow active:scale-95"
                  aria-label="increase count"
                >
                  +
                </button>
              </div>
            </div>

            {/* Speed */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                Speed:
              </div>
              <div className="flex-1 max-w-md">
                <input
                  type="number"
                  value={speed}
                  onChange={e => setSpeed(parseInt(e.target.value) || 60)}
                  className="w-full max-w-sm bg-white border border-blue-200 rounded-xl px-4 py-2 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="60"
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                Title:
              </div>
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full max-w-sm bg-white border border-blue-200 rounded-xl px-4 py-2 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="Math Practice"
                />
              </div>
            </div>

            {/* User ID (Optional) */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                User ID (Optional):
              </div>
              <div className="flex-1 max-w-md">
                <input
                  type="number"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  className="w-full max-w-sm bg-white border border-blue-200 rounded-xl px-4 py-2 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="123"
                />
              </div>
            </div>

            {/* Section (Optional) */}
            <div className="flex items-center gap-6">
              <div className="w-56 text-right text-lg md:text-xl font-serif">
                Section (Optional):
              </div>
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className="w-full max-w-sm bg-white border border-blue-200 rounded-xl px-4 py-2 text-base md:text-lg shadow-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="Class A"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="pl-56">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-3 bg-green-500 text-white rounded-2xl px-6 py-3 shadow hover:shadow-md active:scale-95"
              >
                <span className="text-lg font-semibold font-serif">
                  GENERATE ASSIGNMENT
                </span>
              </button>
            </div>
          </div>

          {/* Right panel - info */}
          <div className="">
            <div className="bg-white/80 rounded-2xl border border-blue-200 shadow-sm p-6">
              <h3 className="text-xl font-extrabold font-serif mb-4">
                Assignment Details
              </h3>
              <div className="space-y-2 text-lg">
                <p>
                  <strong>Concept:</strong> {selectedConcept || 'None'}
                </p>
                <p>
                  <strong>Length:</strong> {selectedLength || 'None'}
                </p>
                <p>
                  <strong>Questions:</strong> {questionCount}
                </p>
                <p>
                  <strong>Speed:</strong> {speed}
                </p>
                <p>
                  <strong>Title:</strong> {title}
                </p>
                {userId && (
                  <p>
                    <strong>User ID:</strong> {userId}
                  </p>
                )}
                {section && (
                  <p>
                    <strong>Section:</strong> {section}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-start items-center mt-8">
          <button
            onClick={handleDashboard}
            className="flex flex-col items-center group focus:outline-none"
          >
            <img
              src={universityIcon}
              alt="Dashboard"
              className="w-8 h-8 sm:w-12 sm:h-12 mb-1"
            />
            <span className="text-black text-sm sm:text-lg font-serif group-hover:underline">
              DASHBOARD
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Worksheets;
