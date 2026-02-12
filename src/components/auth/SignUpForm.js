import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../utils/validation';
import schoolImage from '../../assets/images/university.png';

const SignUpForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    teacherId: '',
    password: '',
    confirmPassword: '',
    role: 'teacher',
  });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSignUp = async e => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      registerSchema.parse(formData);

      const result = await register(formData);
      if (result.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      if (error.name === 'ZodError') {
        const fieldErrors = {};
        error.errors.forEach(err => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <div className="w-full max-w-4xl bg-amber-50 rounded-2xl border border-blue-200 shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - School Building Image */}
          <div className="lg:w-1/2 bg-amber-50 p-8 flex items-center justify-center border-r border-blue-200">
            <div className="text-center">
              <img
                src={schoolImage}
                alt="School Building"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="lg:w-1/2 bg-amber-50 p-8">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-black mb-8 text-center font-serif">
                Sign Up
              </h1>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Username:
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name:
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name:
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Teacher ID:
                  </label>
                  <input
                    type="text"
                    name="teacherId"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your teacher ID"
                    value={formData.teacherId}
                    onChange={handleChange}
                  />
                  {errors.teacherId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.teacherId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Password:
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 uppercase tracking-wide"
                >
                  SIGN UP
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 underline"
                    >
                      Sign in
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
