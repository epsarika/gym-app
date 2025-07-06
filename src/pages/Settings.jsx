import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import PageHeader from '@/components/PageHeader';

export default function Settings() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Error fetching user:", error?.message);
      } else {
        setUserInfo({
          name: user.user_metadata?.name || 'No Name',
          email: user.email,
        });
      }
      setLoading(false);
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

  return (
    <>
      <PageHeader
        title="Profile Details"
        right={
          <Button variant="destructive" onClick={handleLogout} className="rounded-[10px] dark:bg-red-600">
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        }
      />

      <div className="max-w-md mx-auto px-4 py-4 my-16 space-y-6">
        {loading ? (
  <div className="flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-lg bg-gray-300" />
    <div className="flex flex-col gap-2">
      <div className="w-32 h-4 bg-gray-300 rounded" />
      <div className="w-24 h-3 bg-gray-200 rounded" />
    </div>
  </div>
) : (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-sm">
        {getInitials(userInfo.name)}
      </div>
      <div className="text-sm">
        <p className="font-medium">{userInfo.name}</p>
        <p className="text-muted-foreground dark:text-gray-400">{userInfo.email}</p>
      </div>
    </div>
  </div>
)}

      </div>

      <BottomNavigation />
    </>
  );
}
