import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { isAfter } from "date-fns";

export default function Home() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, place, start_date, end_date")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching members", error.message);
      } else {
        setMembers(data);
        setRecentMembers(data.slice(0, 4)); // Optional for future use
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const total = members.length;
  const active = members.filter((m) =>
    isAfter(new Date(m.end_date), new Date())
  ).length;
  const expired = total - active;

  const getThisMonthNewMembersCount = () => {
    const now = new Date();
    return members.filter((m) => {
      const start = new Date(m.start_date);
      return (
        start.getMonth() === now.getMonth() &&
        start.getFullYear() === now.getFullYear()
      );
    }).length;
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        right={
          <Button
            onClick={() => navigate("/add")}
            className="gap-2 bg-black text-white hover:bg-gray-800 rounded-[10px]"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      />

      <div className="w-full max-w-md mx-auto px-4 space-y-4 my-16 py-3">
        {/* Total Members Card */}
        <div
          onClick={() => navigate("/members?filter=all")}
          className="w-full rounded-[16px] border p-4 bg-white flex flex-col cursor-pointer hover:shadow"
        >
          {/* Top Section */}
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Total Members</h2>
            <button>
              <img
                src="/3-dots.svg"
                alt="Menu"
                className="w-[20px] h-[20px] opacity-70"
              />
            </button>
          </div>

          {/* Bottom Section - Horizontal Layout */}
          <div className="mt-1 flex items-end justify-between">
            {/* Count + Bottom Text */}
            <div>
              <h2 className="text-[38px] font-semibold text-gray-900 mb-1">
                {total}
              </h2>
              <p className="text-sm text-gray-500">
                {getThisMonthNewMembersCount()} new{" "}
                {getThisMonthNewMembersCount() === 1 ? "member" : "members"} this month
              </p>
            </div>

            {/* Chart Image */}
            <div>
              <img
                src="/green-chart.svg"
                alt="Graph"
                className="h-[48px] object-contain"
              />
            </div>
          </div>
        </div>


        {/* Active & Expired Cards */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Active Members */}
          <div
            onClick={() => navigate("/members?filter=active")}
            className="rounded-[16px] border p-3 bg-white flex flex-col gap-3 justify-between cursor-pointer hover:shadow"
          >
            <div className="text-lg font-semibold text-gray-900">
              Active Members
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[30px] font-semibold text-gray-900 leading-none">
                {active}
              </span>
              <img
                src="/green-chart2.svg"
                alt="Green Chart"
                className="h-[26px] object-contain"
              />
            </div>
          </div>

          {/* Expired Members */}
          <div
            onClick={() => navigate("/members?filter=expired")}
            className="rounded-[16px] border p-3 bg-white flex flex-col gap-2 justify-between cursor-pointer hover:shadow"
          >
            <div className="text-lg font-semibold text-gray-900">
              Expired Members
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[30px] font-semibold text-gray-900 leading-none">
                {expired}
              </span>
              <img
                src="/red-chart.svg"
                alt="Red Chart"
                className="h-[26px] object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </>
  );
}
