import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { questionsAPI } from '../utils/api';
import flashNumberIcon from '../assets/images/Flashnumber.png';
import logoutIcon from '../assets/images/Logout.png';
import universityIcon from '../assets/images/university.png';
import studentIcon from '../assets/images/student-male.png';

function Stepper({
  value,
  onChange,
  step = 1,
  min = -Infinity,
  max = Infinity,
  formatValue,
}) {
  const display = useMemo(() => {
    const v = typeof value === 'number' ? value : 0;
    return typeof formatValue === 'function' ? formatValue(v) : v;
  }, [value, formatValue]);

  const dec = () =>
    onChange(Math.max(min, parseFloat((value - step).toFixed(2))));
  const inc = () =>
    onChange(Math.min(max, parseFloat((value + step).toFixed(2))));

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={dec}
        className="w-12 h-12 md:w-16 md:h-12 bg-blue-600 hover:bg-blue-700 text-white text-xl md:text-2xl rounded-md"
        aria-label="decrease"
      >
        -
      </button>
      <div className="min-w-[80px] md:min-w-[100px] h-12 border-2 border-gray-300 rounded-md flex items-center justify-center text-xl md:text-2xl bg-white">
        {display}
      </div>
      <button
        type="button"
        onClick={inc}
        className="w-12 h-12 md:w-16 md:h-12 bg-blue-600 hover:bg-blue-700 text-white text-xl md:text-2xl rounded-md"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

export default function FlashNumberGame() {
  const navigate = useNavigate();

  const [concepts, setConcepts] = useState([]);
  const [lengths, setLengths] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [questionLength, setQuestionLength] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [speedSeconds, setSpeedSeconds] = useState(1.2);
  const [items, setItems] = useState([]);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(true);

  // Remove API call and use hardcoded concepts
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
          setQuestionLength(filters.lengths[0]);
        }
      } catch (error) {
        toast.error('Failed to load question filters');
        console.error('Error fetching filters:', error);
      } finally {
        setIsLoadingConcepts(false);
      }
    };

    fetchFilters();
  }, []);

  const totalQuestions = useMemo(
    () => items.reduce((sum, r) => sum + (Number(r.questions) || 0), 0),
    [items]
  );

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        concept: selectedConcept,
        questions: numQuestions,
        time: speedSeconds,
        length: questionLength,
      },
    ]);
  };

  const removeItem = id => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleNext = () => {
    if (items.length === 0) {
      toast.error('Please add at least one question before proceeding.');
      return;
    }
    // Store all current form data for the next page
    try {
      const payload = {
        items,
        currentSettings: {
          selectedConcept,
          questionLength,
          numQuestions,
          speedSeconds,
        },
        createdAt: Date.now(),
      };
      window.sessionStorage.setItem(
        'flashGeneratorPlan',
        JSON.stringify(payload)
      );
    } catch (error) {
      console.error('Error storing flash generator plan:', error);
    }
    navigate('/assign');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-yellow-200/60" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-8">
        <div className="bg-[#faf9ed] rounded-2xl sm:rounded-3xl shadow-lg w-[95vw] sm:w-[90vw] max-w-[1400px] min-h-[85vh] sm:min-h-[80vh] p-3 sm:p-5 md:p-8 flex flex-col relative pb-20 sm:pb-16 md:pb-20">
          {/* header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4 md:mb-6">
            <img
              src={flashNumberIcon}
              alt="Flash"
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
            />
            <h1
              className="text-base sm:text-xl md:text-3xl font-extrabold tracking-wide text-center px-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              FLASH NUMBER GENERATOR
            </h1>
            <button
              onClick={() => navigate('/login')}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={logoutIcon}
                alt="Logout"
                className="w-7 h-7 sm:w-9 sm:h-9 md:w-14 md:h-14"
              />
              <span className="text-xs sm:text-sm md:text-base mt-1">
                Logout
              </span>
            </button>
          </div>

          {/* content */}
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* left controls */}
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 px-1 sm:px-2 md:px-4 items-center sm:items-start">
              {/* Concept row */}
              <div className="flex flex-col sm:grid sm:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] items-center sm:items-start lg:items-center gap-2 sm:gap-4">
                <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center sm:text-left">
                  Concept:
                </div>
                <div className="w-full">
                  <select
                    value={selectedConcept}
                    onChange={e => setSelectedConcept(e.target.value)}
                    disabled={isLoadingConcepts}
                    className="w-full h-10 sm:h-12 border-2 border-gray-300 rounded-md px-3 sm:px-4 text-sm sm:text-base md:text-lg font-semibold bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingConcepts ? (
                      <option value="">Loading concepts...</option>
                    ) : concepts.length > 0 ? (
                      concepts.map(concept => (
                        <option key={concept} value={concept}>
                          {concept}
                        </option>
                      ))
                    ) : (
                      <option value="">No concepts available</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Length of Question */}
              <div className="flex flex-col sm:grid sm:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] items-center sm:items-start lg:items-center gap-2 sm:gap-4">
                <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center sm:text-left">
                  Length of Question:
                </div>
                <div className="w-full">
                  <select
                    value={questionLength}
                    onChange={e => setQuestionLength(e.target.value)}
                    disabled={isLoadingConcepts}
                    className="w-full h-10 sm:h-12 border-2 border-gray-300 rounded-md px-3 sm:px-4 text-sm sm:text-base md:text-lg font-semibold bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingConcepts ? (
                      <option value="">Loading lengths...</option>
                    ) : lengths.length > 0 ? (
                      lengths.map(length => (
                        <option key={length} value={length}>
                          {length}
                        </option>
                      ))
                    ) : (
                      <option value="">No lengths available</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Numbers of Questions */}
              <div className="flex flex-col sm:grid sm:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] items-center sm:items-start lg:items-center gap-2 sm:gap-4">
                <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center sm:text-left">
                  Numbers of Questions:
                </div>
                <div className="flex justify-center sm:justify-start">
                  <Stepper
                    value={numQuestions}
                    onChange={setNumQuestions}
                    min={1}
                    max={200}
                    step={1}
                  />
                </div>
              </div>

              {/* Speed */}
              <div className="flex flex-col sm:grid sm:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] items-center sm:items-start lg:items-center gap-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-3">
                  <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center sm:text-left">
                    Set the speed:
                  </div>
                  <div className="italic text-gray-600 text-xs sm:text-sm text-center sm:text-left">
                    (in Seconds)
                  </div>
                </div>
                <div className="flex justify-center sm:justify-start">
                  <Stepper
                    value={speedSeconds}
                    onChange={setSpeedSeconds}
                    min={0.1}
                    max={10}
                    step={0.1}
                    formatValue={v => `${v.toFixed(1)}s`}
                  />
                </div>
              </div>

              {/* Add button */}
              <div className="pt-2 flex justify-center w-full">
                <button
                  onClick={addItem}
                  className="w-24 h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 rounded-xl border-4 border-blue-500 bg-white shadow hover:shadow-md flex flex-col items-center justify-center gap-1 sm:gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-xl sm:text-2xl">✍️</span>
                  <span className="font-bold text-xs sm:text-sm">ADD</span>
                </button>
              </div>
            </div>

            {/* right list */}
            <div className="bg-white/70 border border-blue-300 rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 flex flex-col w-full overflow-hidden max-w-[480px] mx-auto">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-xs sm:text-sm md:text-base font-semibold px-1 sm:px-2 pb-1 border-b border-blue-200 text-gray-900">
                <div>CONCEPT</div>
                <div className="text-center">Questions</div>
                <div className="text-center">Time</div>
                <div className="text-center">Action</div>
              </div>
              <div className="flex-1 divide-y divide-gray-200 max-h-64 sm:max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="px-1 sm:px-2 py-6 sm:py-8 text-center text-gray-500 italic text-xs sm:text-sm">
                    No items added yet. Use the ADD button to create flash
                    number activities.
                  </div>
                ) : (
                  items.map(row => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm"
                    >
                      <div className="truncate pr-1 font-medium">
                        {row.concept}
                      </div>
                      <div className="text-center font-semibold">
                        {row.questions}
                      </div>
                      <div className="text-center font-semibold">
                        {Number(row.time).toString()}s
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => removeItem(row.id)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-red-400 hover:bg-red-500 active:scale-95 transition-transform text-white font-bold"
                          aria-label={`remove ${row.concept}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 sm:mt-4 mb-2">
                <div className="bg-yellow-500 rounded-lg px-2 sm:px-3 md:px-4 py-2 flex items-center justify-between text-black font-bold text-sm sm:text-base md:text-lg border border-yellow-600">
                  <span>Total Questions</span>
                  <span>{totalQuestions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* footer actions */}
          <div className="absolute left-3 sm:left-4 md:left-8 bottom-3 sm:bottom-4 flex flex-col items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={universityIcon}
                alt="Dashboard"
                className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16"
              />
              <span className="text-xs sm:text-sm md:text-base font-semibold mt-1">
                DASHBOARD
              </span>
            </button>
          </div>

          <div className="absolute right-3 sm:right-4 md:right-8 bottom-3 sm:bottom-4 flex flex-col items-center">
            <button
              onClick={handleNext}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={studentIcon}
                alt="Next"
                className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16"
              />
              <span className="text-xs sm:text-sm md:text-base font-semibold mt-1">
                Next
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
