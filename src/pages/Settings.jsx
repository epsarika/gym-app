// settings.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import PageHeader from '@/components/PageHeader';

// User cache to persist data across navigation
const userCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export default function Settings() {
  const [userInfo, setUserInfo] = useState(userCache.data);
  const [loading, setLoading] = useState(!userCache.data);
  const navigate = useNavigate();

  // Memoize initials calculation
  const userInitials = useMemo(() => {
    if (!userInfo?.name) return '';
    return userInfo.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }, [userInfo?.name]);

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert("Logout failed: " + error.message);
      } else {
        // Clear cache on logout
        userCache.data = null;
        userCache.timestamp = null;
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert("An unexpected error occurred during logout");
    }
  }, [navigate]);

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    if (!userCache.data || !userCache.timestamp) return false;
    return Date.now() - userCache.timestamp < userCache.CACHE_DURATION;
  }, []);

  // Fetch user data with caching
  const fetchUser = useCallback(async () => {
    // Use cached data if available and valid
    if (isCacheValid()) {
      setUserInfo(userCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error("Error fetching user:", error?.message);
        // Clear invalid cache
        userCache.data = null;
        userCache.timestamp = null;
      } else {
        const userData = {
          name: user.user_metadata?.name || 'No Name',
          email: user.email,
        };
        
        // Update cache
        userCache.data = userData;
        userCache.timestamp = Date.now();
        
        setUserInfo(userData);
      }
    } catch (err) {
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Memoized loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg skeleton" />
      <div className="flex flex-col gap-2">
        <div className="w-32 h-4 skeleton" />
        <div className="w-24 h-3 skeleton" />
      </div>
    </div>
  ), []);

  // Memoized user profile section
  const UserProfile = useMemo(() => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-sm">
          {userInitials}
        </div>
        <div className="text-sm">
          <p className="font-medium">{userInfo?.name}</p>
          <p className="text-muted-foreground dark:text-gray-400">{userInfo?.email}</p>
        </div>
      </div>
    </div>
  ), [userInfo?.name, userInfo?.email, userInitials]);

  // Memoized logout button
  const LogoutButton = useMemo(() => (
    <Button variant="destructive" onClick={handleLogout} className="rounded-[10px] dark:bg-red-600">
      <LogOut className="w-4 h-4" />
      Log Out
    </Button>
  ), [handleLogout]);

  return (
    <>
      <PageHeader
        title="Profile Details"
        right={LogoutButton}
      />

      <div className="max-w-md mx-auto px-4 py-4 my-16 space-y-6">
        {loading ? LoadingSkeleton : UserProfile}
      </div>

      <BottomNavigation />
    </>
  );
}