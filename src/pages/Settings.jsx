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
      {/* Always show header */}
      <PageHeader
        title="Profile Details"
        right={
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        }
      />


      <div className="max-w-md mx-auto px-4 py-4 my-16 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : (
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

          </div>
        )}
      </div>

      <BottomNavigation />
    </>
  );
}
