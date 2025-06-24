import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Optional: install lucide-react for icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-white">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-xl font-semibold text-center mb-1">Welcome to Power Gym</h1>
        <p className="text-sm text-gray-600 text-center mb-6">Welcome back! Please sign in to continue</p>

        {/* Image */}
        <div className="flex justify-center mb-6">
          <img src="/login.svg" alt="login" className="w-40 h-40" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-black mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              className="w-full px-3 py-2 border-1 border-gray-300 rounded-lg focus:outline-none focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                className="w-full px-3 py-2 border-1 border-gray-300 rounded-lg focus:outline-none focus:ring pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Powered by <a href="#" className="text-blue-500 underline">Our Team</a>
        </p>
      </div>
    </div>
  );
}
