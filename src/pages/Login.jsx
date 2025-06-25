import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Optional: install lucide-react for icons
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';

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
        <div className="flex justify-center mb-6 ">
          <img src="/login.svg" alt="login" className="w-full" />
        </div>


        <form onSubmit={handleLogin} className="space-y-[10px]">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label>Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                className="pr-10" // Leave space for the icon button
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <Button
            type="submit"
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="text-gray-500 text-center mt-6 font-medium text-base">
          Powered by <a href="#" className="text-blue-500">Our Team</a>
        </p>
      </div>
    </div>
  );
}
