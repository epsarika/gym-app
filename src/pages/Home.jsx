import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import BottomNavigation from "@/components/BottomNavigation";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAfter } from "date-fns";

export default function Home() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("members")
      .select("id, end_date");

    if (error) {
      console.error("Error fetching members", error.message);
    } else {
      setMembers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const total = members.length;
  const active = members.filter((m) => isAfter(new Date(m.end_date), new Date())).length;
  const expired = total - active;

  const StatCard = ({ count, label, onClick, className }) => (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-md transition duration-200 rounded-2xl p-4 ${className}`}
    >
      <CardContent className="flex flex-col items-start space-y-1 p-0">
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <PageHeader title="Dashboard" />

      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6 my-16 bg-white transition-colors duration-300">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            count={total}
            label="Total Members"
            onClick={() => navigate("/members")}
            className="bg-blue-50" // keep cards light
          />
          <StatCard
            count={active}
            label="Active Members"
            onClick={() => navigate("/members?filter=active")}
            className="bg-green-50"
          />
          <StatCard
            count={expired}
            label="Expired Members"
            onClick={() => navigate("/members?filter=expired")}
            className="bg-red-50"
          />
          <StatCard
            count="+"
            label="Add Member"
            onClick={() => navigate("/add")}
            className="bg-gray-100 flex items-center justify-center text-3xl font-semibold"
          />
        </div>

        {/* Add Button for Mobile View */}
        <div className="sm:hidden">
          <Button onClick={() => navigate("/add")} className="w-full text-white">
            Add Member
          </Button>
        </div>
      </div>



      <BottomNavigation />
    </>
  );
}
