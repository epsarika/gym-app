import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';

export default function Settings() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Error fetching user:", error?.message);
      } else {
        setUserInfo({
          name: user.user_metadata?.name || 'No Name',
          email: user.email,
        });
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout failed: " + error.message);
    } else {
      navigate('/login');
    }
  };

  const getInitials = (name) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  if (!userInfo) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl font-semibold">Profile details</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-sm">
            {getInitials(userInfo.name)}
          </div>
          <div className="text-sm">
            <p className="font-medium">{userInfo.name}</p>
            <p className="text-muted-foreground">{userInfo.email}</p>
          </div>
        </div>

        <Button variant="destructive" onClick={handleLogout}>
          <span className="mr-2">↩️</span> Log Out
        </Button>
      </div>

      <BottomNavigation/>
    </div>
  );
}
