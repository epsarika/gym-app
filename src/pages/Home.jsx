import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { isAfter } from "date-fns";
import MemberList from "@/components/MemberList";

// Global cache to persist data across navigation
let membersCache = {
  data: null,
  timestamp: null,
  isLoading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const navigate = useNavigate();
  const [members, setMembers] = useState(membersCache.data || []);
  const [loading, setLoading] = useState(!membersCache.data);

  // Memoized calculations to avoid recalculation on every render
  const memberStats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) =>
      isAfter(new Date(m.end_date), new Date())
    ).length;
    const expired = total - active;
    
    const now = new Date();
    const thisMonthNew = members.filter((m) => {
      const start = new Date(m.start_date);
      return (
        start.getMonth() === now.getMonth() &&
        start.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, active, expired, thisMonthNew };
  }, [members]);

  // Memoized recent members to avoid recalculation
  const recentMembers = useMemo(() => members.slice(0, 6), [members]);

  const fetchMembers = useCallback(async (forceRefresh = false) => {
    // Check if we have valid cached data
    const now = Date.now();
    const cacheValid = membersCache.data && 
                      membersCache.timestamp && 
                      (now - membersCache.timestamp < CACHE_DURATION);

    if (cacheValid && !forceRefresh) {
      setMembers(membersCache.data);
      setLoading(false);
      return;
    }

    // Prevent multiple concurrent requests
    if (membersCache.isLoading) return;

    membersCache.isLoading = true;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, place, start_date, end_date")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching members", error.message);
      } else {
        // Update cache
        membersCache.data = data;
        membersCache.timestamp = now;
        setMembers(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching members:", err);
    } finally {
      membersCache.isLoading = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Navigation handlers with preloading
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleAddMember = useCallback(() => {
    navigate("/add");
  }, [navigate]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        right={
          <Button
            onClick={handleAddMember}
            className="gap-2 bg-black text-white hover:bg-gray-800 rounded-[10px]"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        }
      />

      <div className="w-full max-w-md mx-auto px-4 space-y-4 my-16 py-3">
        {/* Total Members Card */}
        <div
          onClick={() => handleNavigation("/members?filter=all")}
          className="w-full rounded-[16px] border p-4 bg-white flex flex-col cursor-pointer hover:shadow transition-shadow"
        >
          {/* Top Section */}
          <div className="flex items-start justify-between">
            <h2 className="text-[18px] font-semibold text-gray-900">Total Members</h2>
          </div>

          {/* Bottom Section - Horizontal Layout */}
          <div className="mt-1 flex items-end justify-between">
            {/* Count + Bottom Text */}
            <div>
              {loading ? (
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-1" />
              ) : (
                <h2 className="text-[38px] font-semibold text-gray-900 mb-1">
                  {memberStats.total}
                </h2>
              )}
              <p className="text-sm text-gray-500">
                {loading ? (
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    {memberStats.thisMonthNew} new{" "}
                    {memberStats.thisMonthNew === 1 ? "member" : "members"} this month
                  </>
                )}
              </p>
            </div>

            {/* Chart Image */}
            <div>
              <img
                src="/green-chart.svg"
                alt="Graph"
                className="h-[48px] object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Active & Expired Cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Active Members */}
          <div
            onClick={() => handleNavigation("/members?filter=active")}
            className="rounded-[16px] border p-3 bg-white flex flex-col gap-3 justify-between cursor-pointer hover:shadow transition-shadow"
          >
            <div className="text-[16px] font-semibold text-gray-900">
              Active Members
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <div className="w-10 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="text-[30px] font-semibold text-gray-900 leading-none">
                  {memberStats.active}
                </span>
              )}
              <img
                src="/green-chart2.svg"
                alt="Green Chart"
                className="h-[26px] object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Expired Members */}
          <div
            onClick={() => handleNavigation("/members?filter=expired")}
            className="rounded-[16px] border p-3 bg-white flex flex-col gap-2 justify-between cursor-pointer hover:shadow transition-shadow"
          >
            <div className="text-[16px] font-semibold text-gray-900">
              Expired Members
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <div className="w-10 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="text-[30px] font-semibold text-gray-900 leading-none">
                  {memberStats.expired}
                </span>
              )}
              <img
                src="/red-chart.svg"
                alt="Red Chart"
                className="h-[26px] object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Recently Added Section */}
        <div className="mt-2">
          <h3 className="text-[14px] font-medium text-gray-500 mb-2 pb-2 border-b border-gray-100">
            Recently Joined
          </h3>
          
          <MemberList members={recentMembers} max={6} loading={loading} />
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}