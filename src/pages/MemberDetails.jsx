import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { format, differenceInDays } from 'date-fns';
import { isActive } from '../utils/dateUtils';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Phone, MessageSquare, Pencil, ArrowLeft, RefreshCcw } from "lucide-react";
import BottomNavigation from '@/components/BottomNavigation';
import { RenewButton } from '@/components/Buttons';

export default function MemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMember();
  }, []);

  const fetchMember = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching member:', error.message);
    } else {
      setMember(data);
    }
  };

  if (!member) return <p className="p-4">Loading...</p>;

  const daysRemaining = differenceInDays(new Date(member.end_date), new Date());

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)} // Go back to previous page
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <h2 className="text-xl font-semibold">{member.name}</h2>
    </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate(`/edit/${member.id}`)}
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Membership Card */}
      <div className="p-[2px] bg-gray-100 relative border shadow-sm rounded-[10px]">
        <div className="p-4 bg-white rounded-[10px] shadow-sm m-[2px]">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${
                isActive(member.end_date)
                  ? "text-green-700 text-xl"
                  : "text-red-600 text-xl"
              } text-sm font-medium mb-1`}>
              {isActive(member.end_date) ? "Active Membership" : "Expired Membership"}
            </p>
            <p className="text-sm font-medium text-black">
              {format(new Date(member.end_date), "dd MMMM yyyy")}
            </p>
          </div>
          <img src="/logo.png" alt="Gym Logo" className="w-12 h-12 object-contain" />
        </div>
        
        <RenewButton id={member.id} fetchMember={fetchMember} />

        </div>
        {isActive(member.end_date) && (
          <p className=" text-gray-500 text-xs m-1.5 ">
            {daysRemaining} Days Remaining
          </p>
        )}
      </div>

      {/* Member Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Phone</span>
          <span>{member.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Email</span>
          <span>{member.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Place</span>
          <span>{member.place}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
  <Button
    variant="outline"
    className="w-full"
    onClick={() =>
      window.open(
        `sms:${member.phone}?body=Hi ${member.name}, your gym membership (${member.plan}) has expired. Please renew.`,
        "_self"
      )
    }
  >
    <MessageSquare className="w-4 h-4 mr-2" /> Remind
  </Button>
  <Button
    className="w-full"
    onClick={() => window.open(`tel:${member.phone}`, "_self")}
  >
    <Phone className="w-4 h-4 mr-2" /> Call
  </Button>
</div>

      </div>

      {/* Membership Details */}
      <div className="pt-4 text-sm text-gray-700 space-y-2 border-t border-gray-200">
        <div className="flex justify-between">
          <span>Start Date</span>
          <span>{format(new Date(member.start_date), 'dd MMMM yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span>End Date</span>
          <span>{format(new Date(member.end_date), 'dd MMMM yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span>Fees</span>
          <span className="font-semibold text-green-600">Paid</span>
        </div>
      </div>

    <BottomNavigation />
    </div>
  );
}
