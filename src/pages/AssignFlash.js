import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import logoutIcon from '../assets/images/Logout.png';
import universityIcon from '../assets/images/university.png';
import studentIcon from '../assets/images/student-male.png';
import teachingIcon from '../assets/images/teaching.png';
import { apiService } from '../utils/api';

export default function AssignFlash() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [assignMode, setAssignMode] = useState('individual');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [flashData, setFlashData] = useState(null);
  // const [apiResponse, setApiResponse] = useState(null); // Removed unused
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isApiLoading, setIsApiLoading] = useState(true); // Removed unused

  // Fetch assignables (students & sections)
  useEffect(() => {
    const fetchAssignables = async () => {
      setIsLoadingStudents(true);
      setIsLoadingSections(true);
      try {
        const response = await apiService.get('/assignables');
        const data = response.data;
        if (Array.isArray(data.users)) setStudents(data.users);
        if (Array.isArray(data.users)) {
          const uniqueSections = [...new Set(data.users.map(u => u.section))];
          setSections(uniqueSections.map(s => ({ id: s, name: s })));
        }
      } catch (err) {
        console.error('Failed to fetch assignables:', err);
        toast.error('Failed to load students and sections.');
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingSections(false);
      }
    };
    fetchAssignables();
  }, []);

  // Load flash data
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('flashGeneratorPlan');
      if (storedData) setFlashData(JSON.parse(storedData));
    } catch (error) {
      console.error('Flash load error:', error);
    }
  }, []);

  // ---------- FIXED HANDLE SUBMIT ----------
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Always use access token for API calls
      const token =
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('access_token');

      // Check if token exists and is a valid JWT
      if (!token || token.split('.').length !== 3) {
        toast.error('Invalid or missing auth token. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Decode token for debugging
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token type:', payload.token_type);
      } catch (e) {
        console.log('Token decode failed');
        toast.error('Auth token is corrupted. Please login again.');
        setIsSubmitting(false);
        return;
      }

      if (!flashData || !flashData.items?.length) {
        toast.error('No flash activities to assign.');
        setIsSubmitting(false);
        return;
      }

      // Get teacherId from storage
      const teacherId =
        localStorage.getItem('teacherId') ||
        sessionStorage.getItem('teacherId');

      console.log('Retrieved teacherId:', teacherId);

      if (!teacherId) {
        toast.error('Teacher ID not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Validate assignment mode and target (optional - no longer required)
      // Removed validation to make assignment optional

      const assignmentCalls = flashData.items.map(async item => {
        const payload = {
          complexity: item.concept,
          length: parseInt(item.length) || 1,
          numQuestions: item.questions || 1,
          speed: item.time || 30,
          title: title || 'Untitled Activity',
          teacherId: teacherId,
          ...(selectedStudent ? { userId: selectedStudent } : {}),
          ...(selectedSection ? { section: selectedSection } : {}),
        };

        try {
          const res = await apiService.post('/assignments/', payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          return res.data;
        } catch (error) {
          console.error('Assignment API error:', error);
          return null;
        }
      });

      const results = await Promise.all(assignmentCalls);
      const successCount = results.filter(r => r !== null).length;

      if (successCount === 0) {
        toast.error('No assignments were created.');
        setIsSubmitting(false);
        return;
      }

      toast.success(`${successCount} assignment(s) created!`);

      sessionStorage.setItem(
        'flashAssignment',
        JSON.stringify({
          flashData,
          title: title || 'Untitled Activity',
          assignMode,
          selectedStudent: assignMode === 'individual' ? selectedStudent : null,
          selectedSection: assignMode === 'class' ? selectedSection : null,
          assignmentResults: results,
          createdAt: Date.now(),
        })
      );

      navigate('/notification-sent');
    } catch (error) {
      console.error(error);
      toast.error('Failed to assign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------ RETURN JSX ------------------
  return (
    <div className="relative min-h-screen bg-yellow-200/60 p-2 sm:p-4 md:p-8">
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="bg-[#faf9ed] rounded-3xl shadow-lg w-full max-w-[1600px] min-h-[88vh] p-2 sm:p-4 md:p-10 flex flex-col relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
            <div className="w-0 sm:w-16 md:w-24" />
            <h1
              className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-wide text-center"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              FLASH NUMBER GENERATOR
            </h1>

            <button
              onClick={() => navigate('/login')}
              className="flex flex-col items-center hover:scale-105 transition-transform"
            >
              <img
                src={logoutIcon}
                alt="Logout"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16"
              />
              <span className="text-xs md:text-sm mt-1">Logout</span>
            </button>
          </div>

          {/* Title Input */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="text-base md:text-lg font-semibold">
              Title of Activity:
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Your title here"
              className="w-full sm:w-[220px] md:w-[360px] h-10 border-2 border-gray-300 rounded-md px-3 bg-white"
            />
          </div>

          {/* Assign Panels */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_120px_1fr] gap-4 sm:gap-6 md:gap-10">
            {/* Individual */}
            <div className="flex flex-col items-center">
              <div className="text-base md:text-lg font-semibold mb-2">
                Assign task to individual
              </div>

              <button
                onClick={() => setAssignMode('individual')}
                className={`p-2 sm:p-3 rounded-2xl border-2 ${
                  assignMode === 'individual'
                    ? 'border-blue-600'
                    : 'border-transparent'
                } hover:border-blue-600`}
              >
                <img
                  src={studentIcon}
                  alt="Student"
                  className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16"
                />
              </button>

              <div className="mt-2 sm:mt-4 w-full flex flex-col items-center">
                <Select
                  options={students.map(s => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={
                    selectedStudent
                      ? {
                          value: selectedStudent,
                          label: students.find(s => s.id === selectedStudent)
                            ?.name,
                        }
                      : null
                  }
                  onChange={opt => setSelectedStudent(opt?.value || '')}
                  isLoading={isLoadingStudents}
                  isClearable
                  isSearchable={true}
                  placeholder="Search & select student..."
                  className="w-full sm:w-[220px] md:w-[300px]"
                />
              </div>
            </div>

            {/* OR */}
            <div className="flex items-center justify-center md:flex hidden">
              <div className="text-2xl sm:text-3xl md:text-5xl font-extrabold">
                OR
              </div>
            </div>

            {/* Class */}
            <div className="flex flex-col items-center">
              <div className="text-base md:text-lg font-semibold mb-2">
                Assign task to class
              </div>

              <button
                onClick={() => setAssignMode('class')}
                className={`p-2 sm:p-3 rounded-2xl border-2 ${
                  assignMode === 'class'
                    ? 'border-blue-600'
                    : 'border-transparent'
                } hover:border-blue-600`}
              >
                <img
                  src={teachingIcon}
                  alt="Class"
                  className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16"
                />
              </button>

              <div className="mt-2 sm:mt-4 w-full flex flex-col items-center">
                <Select
                  options={sections.map(sec => ({
                    value: sec.name,
                    label: sec.name,
                  }))}
                  value={
                    selectedSection
                      ? { value: selectedSection, label: selectedSection }
                      : null
                  }
                  onChange={opt => setSelectedSection(opt?.value || '')}
                  isLoading={isLoadingSections}
                  isClearable
                  isSearchable={true}
                  placeholder="Search & select section..."
                  className="w-full sm:w-[220px] md:w-[300px]"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="absolute left-2 sm:left-4 md:left-8 bottom-2 sm:bottom-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center hover:scale-105 transition-transform"
            >
              <img
                src={universityIcon}
                alt="Dashboard"
                className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
              />
              <span className="text-xs md:text-sm font-semibold mt-1">
                DASHBOARD
              </span>
            </button>
          </div>

          <div className="absolute right-2 sm:right-4 md:right-8 bottom-2 sm:bottom-4">
            <button
              onClick={handleSubmit}
              className={`flex flex-col items-center hover:scale-105 transition-transform ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-6 w-6 text-blue-600 mb-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                <img
                  src={studentIcon}
                  alt="Submit"
                  className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
                />
              )}
              <span className="text-xs md:text-sm font-semibold mt-1">
                {isSubmitting ? 'Submitting...' : 'SUBMIT'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
