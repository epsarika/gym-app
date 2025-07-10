import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { RenewButton } from '@/components/Buttons';
import PageHeader from '@/components/PageHeader';

// Global cache for member details
let memberDetailsCache = new Map();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes (shorter than main cache as details might change more frequently)

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Memoized formatted plan to avoid recalculation
  const formatPlan = useCallback((plan) => {
    if (!plan) return '';
    
    const formatted = plan.replace(/(\d+)([a-zA-Z]+)/, '$1 $2');
    return formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  // Memoized member status calculations
  const memberStatus = useMemo(() => {
    if (!member) return { isActiveMember: false, daysRemaining: 0 };
    
    const isActiveMember = isActive(member.end_date);
    const daysRemaining = isActiveMember 
      ? differenceInDays(new Date(member.end_date), new Date()) 
      : 0;
    
    return { isActiveMember, daysRemaining };
  }, [member?.end_date]);

  // Memoized formatted dates
  const formattedDates = useMemo(() => {
    if (!member) return { startDate: '', endDate: '' };
    
    return {
      startDate: format(new Date(member.start_date), 'dd MMMM yyyy'),
      endDate: format(new Date(member.end_date), 'dd MMMM yyyy')
    };
  }, [member?.start_date, member?.end_date]);

  // Memoized contact handlers
  const contactHandlers = useMemo(() => {
    if (!member) return { handleSMS: null, handleCall: null };
    
    const handleSMS = () => {
      const message = `Hi ${member.name}, your gym membership (${member.plan}) has expired on ${member.end_date}. Kindly renew to continue your workouts. Contact us at 6238417389`;
      window.open(`sms:${member.phone}?body=${encodeURIComponent(message)}`, "_self");
    };

    const handleCall = () => {
      window.open(`tel:${member.phone}`, "_self");
    };

    return { handleSMS, handleCall };
  }, [member?.name, member?.phone, member?.plan, member?.end_date]);

  const fetchMember = useCallback(async (forceRefresh = false) => {
    const cacheKey = `member_${id}`;
    const now = Date.now();
    const cachedData = memberDetailsCache.get(cacheKey);
    
    // Check cache validity
    if (cachedData && !forceRefresh && (now - cachedData.timestamp < CACHE_DURATION)) {
      setMember(cachedData.member);
      setHistory(cachedData.history);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching member:', error.message);
        setLoading(false);
        return;
      }

      const historyData = [
        {
          type: 'start',
          plan: data.plan,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      ];

      // Update cache
      memberDetailsCache.set(cacheKey, {
        member: data,
        history: historyData,
        timestamp: now
      });

      setMember(data);
      setHistory(historyData);
    } catch (err) {
      console.error('Unexpected error fetching member:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id, fetchMember]);

  // Optimized navigation handlers
  const handleBack = useCallback(() => {
    navigate('/members');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(`/edit/${member.id}`);
  }, [navigate, member?.id]);

  // Optimized renewal handler
  const handleRenew = useCallback((newEndDate, newPlan) => {
    const updatedMember = {
      ...member,
      end_date: newEndDate,
      plan: newPlan,
    };
    
    const newHistoryEntry = {
      type: 'renew',
      start_date: member.end_date,
      end_date: newEndDate,
      plan: newPlan,
    };
    
    const updatedHistory = [...history, newHistoryEntry];
    
    // Update state
    setMember(updatedMember);
    setHistory(updatedHistory);
    
    // Update cache
    const cacheKey = `member_${id}`;
    memberDetailsCache.set(cacheKey, {
      member: updatedMember,
      history: updatedHistory,
      timestamp: Date.now()
    });
  }, [member, history, id]);

  // Loading skeleton component - matching home.jsx style
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Skeleton for membership card */}
      <div className="p-[2px] bg-gray-200 border rounded-[15px]">
        <div className="relative p-3 bg-white rounded-[10px] shadow-md m-[3px] overflow-hidden">
          <div className="h-4 w-32 skeleton mb-2" />
          <div className="h-3 w-24 skeleton mb-4" />
          <div className="h-8 w-full skeleton" />
        </div>
        <div className="ml-3 mt-2 h-3 w-24 skeleton" />
      </div>

      {/* Skeleton for member info */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="w-20 h-3 skeleton" />
            <div className="w-24 h-3 skeleton" />
          </div>
        ))}
      </div>

      {/* Skeleton for buttons */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 skeleton" />
        <div className="h-10 skeleton" />
      </div>

      {/* Skeleton for membership period */}
      <div className="space-y-3">
        <div className="h-4 w-32 skeleton mb-2" />
        <div className="flex justify-between">
          <div className="w-24 h-3 skeleton" />
          <div className="w-24 h-3 skeleton" />
        </div>
        <div className="flex justify-between">
          <div className="w-24 h-3 skeleton" />
          <div className="w-24 h-3 skeleton" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title={
          <span title={member?.name} className="block max-w-[200px] truncate text-ellipsis">
            {member?.name || 'Loading...'}
          </span>
        }
        left={
          <Button variant="ghost" size="32" onClick={handleBack} className="pr-3">
            <img src="/back-button.svg" alt="Back" loading="lazy" />
          </Button>
        }
        right={
          member && (
            <Button
              variant="outline"
              className="gap-2 rounded-[10px]"
              onClick={handleEdit}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )
        }
      />

      <div className="max-w-md mx-auto p-4 space-y-4 py-3 my-16">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Membership Card */}
            <div className="p-[2px] bg-gray-200 border rounded-[15px]">
              <div className="relative p-3 bg-white rounded-[10px] shadow-md m-[3px] overflow-hidden">
                {/* Stamp inside white box, cropped on right */}
                <img
                  src="/logo.png"
                  alt="Gym Logo"
                  className="absolute top-0 right-0 w-56 h-56 object-contain translate-x-20 -translate-y-18 opacity-80 pointer-events-none"
                  loading="lazy"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${memberStatus.isActiveMember ? "text-green-700" : "text-red-600"} text-lg font-semibold mb-1`}>
                      {memberStatus.isActiveMember ? "Active Membership" : "Expired Membership"}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formattedDates.endDate}
                    </p>
                  </div>
                </div>

                <RenewButton
                  id={member.id}
                  currentEndDate={member.end_date}
                  onRenew={handleRenew}
                />
              </div>

              {memberStatus.isActiveMember && (
                <p className="text-gray-500 text-xs ml-3 mb-[5px] mt-[6px]">
                  {memberStatus.daysRemaining} Days Remaining
                </p>
              )}
            </div>

            {/* Member Info */}
            <div className="space-y-3 text-[14px] font-medium">
              <div className="flex justify-between gap-4">
                <span className='text-gray-500'>Phone</span>
                <span className="truncate max-w-[160px] text-right">{member.phone}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">Email</span>
                <span title={member.email}
                  className={`max-w-[240px] text-right truncate ${member.email?.trim() ? "text-gray-800" : "text-gray-400"
                    }`}
                >
                  {member.email?.trim() ? member.email : "Not provided"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className='text-gray-500'>Place</span>
                <span className="max-w-[240px] text-right truncate" title={member.place}>{member.place}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full rounded-[10px] dark:bg-transparent transition-colors"
                  onClick={contactHandlers.handleSMS}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Remind
                </Button>
                <Button
                  className="w-full rounded-[10px] transition-colors"
                  onClick={contactHandlers.handleCall}
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
                <span>{formattedDates.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className='text-gray-500'>End Date</span>
                <span>{formattedDates.endDate}</span>
              </div>
            </div>

            {/* Notes */}
            {member.notes && (
              <div className="text-[14px] font-medium">
                <div className="flex flex-col mt-3">
                  <span className="text-gray-500 mb-1">Notes</span>
                  <p className="text-[14px] text-black font-normal">
                    {member.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Membership History */}
            {history.length > 0 && (
              <div className="pt-2 text-[14px] font-medium space-y-3">
                <h3 className="text-[14px] font-medium text-black pb-1 border-b border-gray-100">Membership History</h3>
                {history.map((entry, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between">
                      <span className='capitalize'>{entry.type}</span>
                      <span>{formatPlan(entry.plan)}</span>
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