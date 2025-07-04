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
          <Button variant="ghost" size="32" onClick={() => navigate('/members')} className="pr-3">
            <img src="/back-button.svg" alt="Back" />
          </Button>
        }
        right={
          member && (
            <Button
              variant="outline"
              className="gap-2 rounded-[10px]"
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
            <div className="p-[2px] bg-gray-200 border rounded-[15px]">
              <div className="p-3 bg-white rounded-[10px] shadow-md m-[3px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${isActive(member.end_date) ? "text-green-700 " : "text-red-600"} text-lg font-medium mb-1`}>
                      {isActive(member.end_date) ? "Active Membership" : "Expired Membership"}
                    </p>
                    <p className="text-m font-medium text-black">
                      {format(new Date(member.end_date), "dd MMMM yyyy")}
                    </p>
                  </div>
                  <img src="/logo.png" alt="Gym Logo" className="w-24 h-24 object-contain -mt-6 -mr-6 self-start" />
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
                <p className="text-gray-500 text-xs ml-3 my-[5px]">
                  {differenceInDays(new Date(member.end_date), new Date())} Days Remaining
                </p>
              )}
            </div>

            {/* Member Info */}
<div className="space-y-3 text-[14px] font-medium">
  <div className="flex justify-between">
    <span className='text-gray-500'>Phone</span>
    <span>{member.phone}</span>
  </div>
  <div className="flex justify-between">
    <span className='text-gray-500'>Email</span>
    <span>{member.email}</span>
  </div>
  <div className="flex justify-between">
    <span className='text-gray-500'>Place</span>
    <span>{member.place}</span>
  </div>

  {member.notes && (
    <div className="flex flex-col mt-3">
      <span className="text-gray-500 mb-1">Notes</span>
      <p className="text-[14px] text-black font-normal whitespace-pre-wrap">
        {member.notes}
      </p>
    </div>
  )}

  <div className="grid grid-cols-2 gap-2">
    <Button
      variant="outline"
      className="w-full rounded-[10px] dark:bg-transparent"
      onClick={() =>
        window.open(
          `sms:${member.phone}?body=Hi ${member.name}, your gym membership (${member.plan}) has expired on ${member.end_date}. Kindly renew to continue your workouts. Contact us at 6238417389`,
          "_self"
        )
      }
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Remind
    </Button>
    <Button
      className="w-full rounded-[10px]"
      onClick={() => window.open(`tel:${member.phone}`, "_self")}
    >
      <Phone className="w-4 h-4 mr-2" />
      Call
    </Button>
  </div>
</div>


            {/* Membership Period */}
            <div className="text-[14px] font-medium space-y-3">
              <h3 className="text-[14px] font-medium text-black pb-1 border-b border-gray-100">Membership Details</h3>
              <div className="flex justify-between">
                <span className='text-gray-500'>Start Date</span>
                <span>{format(new Date(member.start_date), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className='text-gray-500'>End Date</span>
                <span>{format(new Date(member.end_date), 'dd MMMM yyyy')}</span>
              </div>
            </div>

            {/* Membership History */}
            {history.length > 0 && (
              <div className="pt-4 text-[14px] font-medium space-y-3">
                <h3 className="text-[14px] font-medium text-black pb-1 border-b border-gray-100">Membership History</h3>
                {history.map((entry, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between">
                      <span className="capitalize text-gray-500">{entry.type}</span>
                      <span>{entry.plan}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-gray-400">
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
    </>
  );
}
