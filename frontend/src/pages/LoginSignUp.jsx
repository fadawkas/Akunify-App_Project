import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { useDispatch } from 'react-redux'; // Import useDispatch for Redux
import { login } from '../store/slices/authSlice'; // Import the login action
import Logo from '../assets/akunify_bg.png';

const API_URL = 'http://localhost:3000'; // Gateway URL

function LoginSignUp() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate
  const dispatch = useDispatch(); // Initialize dispatch to send actions to Redux store

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignIn) {
        // Login via Gateway
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token); // Save JWT token
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Dispatch login action to Redux store
        dispatch(login({ 
          token: response.data.token, 
          userId: response.data.user.userId, 
          email: response.data.user.email, 
          role: response.data.user.role, 
          branch: response.data.user.branch 
        }));

        navigate('/dashboard'); // Redirect to Dashboard
      } else {
        // Sign-up via Gateway
        const response = await axios.post(`${API_URL}/auth/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        console.log('Sign-up successful:', response.data);
        alert('Sign-up successful! You can now log in.');
        setIsSignIn(true); // Switch to Sign In form
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const toggleForm = () => setIsSignIn((prev) => !prev);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-6 py-12 border-2 bg-white shadow-md rounded-lg">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img alt="Your Company" src={Logo} className="mx-auto h-12 w-auto" />
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            {isSignIn ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-blue-900 sm:text-sm"
                />
              </div>
            </div>

            {!isSignIn && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-blue-900 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-blue-900 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-gradient-to-tl from-blue-900 to-blue-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
              >
                {isSignIn ? 'Sign in' : 'Sign up'}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </form>

          <p className="mt-10 text-center text-sm text-gray-800">
            {isSignIn ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
            <button
              onClick={toggleForm}
              className="font-semibold text-blue-900 hover:text-blue-800"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginSignUp;
