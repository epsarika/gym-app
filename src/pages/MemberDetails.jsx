import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { format, differenceInDays } from 'date-fns';
import { isActive } from '../utils/dateUtils';
import {
  Button
} from '@/components/ui/button';
import {
  MessageSquare,
  Phone,
  Pencil,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { RenewButton } from '@/components/Buttons';
import PageHeader from '@/components/PageHeader';

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  const fetchMember = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching member:', error.message);
    } else {
      setMember(data);

      // Initialize history with start record
      setHistory([
        {
          type: 'start',
          plan: data.plan,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  return (
    <>
      <PageHeader
        title={member?.name || 'Member'}
        left={
          <Button variant="ghost" size="icon" onClick={() => navigate('/members')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        }
        right={
          member && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate(`/edit/${member.id}`)}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )
        }
      />

      <div className="max-w-md mx-auto p-4 space-y-4 my-16">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* Membership Card */}
            <div className="p-[2px] bg-gray-100 border rounded-[10px]">
              <div className="p-3 bg-white rounded-[10px] shadow-sm m-[2px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isActive(member.end_date) ? "text-green-700" : "text-red-600"} text-sm font-medium mb-1`}>
                      {isActive(member.end_date) ? "Active Membership" : "Expired Membership"}
                    </p>
                    <p className="text-sm font-medium text-black">
                      {format(new Date(member.end_date), "dd MMMM yyyy")}
                    </p>
                  </div>
                  <img src="/logo.png" alt="Gym Logo" className="w-12 h-12 object-contain" />
                </div>
                <RenewButton
                  id={member.id}
                  currentEndDate={member.end_date}
                  onRenew={(newEndDate, newPlan) => {
                    setMember((prev) => ({
                      ...prev,
                      end_date: newEndDate,
                      plan: newPlan,
                    }));
                    setHistory((prev) => [
                      ...prev,
                      {
                        type: 'renew',
                        start_date: member.end_date,
                        end_date: newEndDate,
                        plan: newPlan,
                      },
                    ]);
                  }}
                />
              </div>
              {isActive(member.end_date) && (
                <p className="text-gray-500 text-xs ml-3 mt-1">
                  {differenceInDays(new Date(member.end_date), new Date())} Days Remaining
                </p>
              )}
            </div>

            {/* Member Info */}
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
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Remind
                </Button>
                <Button
                  className="w-full"
                  onClick={() => window.open(`tel:${member.phone}`, "_self")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>

            {/* Membership Period */}
            <div className="pt-4 text-sm text-gray-700 space-y-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Start Date</span>
                <span>{format(new Date(member.start_date), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>End Date</span>
                <span>{format(new Date(member.end_date), 'dd MMMM yyyy')}</span>
              </div>
            </div>

            {/* Membership History */}
            {history.length > 0 && (
              <div className="pt-4 text-sm text-gray-700 space-y-3 border-t border-gray-200">
                <h3 className="text-base font-medium mb-2">Membership History</h3>
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="flex flex-col border rounded-md px-3 py-2 bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-500 capitalize">{entry.type}</span>
                      <span>{entry.plan}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{format(new Date(entry.start_date), 'dd MMM yyyy')}</span>
                      <span>{format(new Date(entry.end_date), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </>
  );
}
