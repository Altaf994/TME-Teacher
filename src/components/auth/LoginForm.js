import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import schoolImage from '../../assets/images/university.png';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    // setError('');
    const result = await login({ username, password });
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      // Show only the backend error message
      // setError(result.error);
      toast.error(result.error);
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

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 bg-amber-50 p-8">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold text-black mb-8 text-center font-serif">
                Login
              </h1>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Error message removed from screen, only shown in toast */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Username:
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-black">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                      Forget password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 pr-10 border border-blue-300 rounded-md bg-white text-black placeholder-gray-400 italic focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your password here.."
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-black"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 uppercase tracking-wide"
                >
                  LOGIN
                </button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 underline"
                    >
                      Sign up
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

export default LoginForm;
