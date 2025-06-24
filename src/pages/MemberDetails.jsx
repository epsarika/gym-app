import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';
import { isActive } from '../utils/dateUtils';

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

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
  <h2 className="text-2xl font-bold">{member.name}</h2>
  <span
    className={`text-sm px-2 py-1 rounded-full font-semibold ${
      isActive(member.end_date)
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}
  >
    {isActive(member.end_date) ? 'Active' : 'Expired'}
  </span>
</div>

      <div className="space-y-1 text-gray-700">
        <p><strong>Phone:</strong> {member.phone}</p>
        <p><strong>Plan:</strong> {member.plan}</p>
        <p><strong>Start Date:</strong> {format(new Date(member.start_date), 'dd MMM yyyy')}</p>
        <p><strong>End Date:</strong> {format(new Date(member.end_date), 'dd MMM yyyy')}</p>
        {member.notes && <p><strong>Notes:</strong> {member.notes}</p>}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <a
          href={`tel:${member.phone}`}
          className="bg-green-600 text-white text-center py-2 rounded"
        >
          📞 Call
        </a>

        <a
          href={`sms:${member.phone}?body=Hi ${member.name}, your gym membership (${member.plan}) has expired. Please renew.`}
          className="bg-yellow-500 text-white text-center py-2 rounded"
        >
          💬 Remind
        </a>

        <button
          onClick={() => navigate(`/edit/${member.id}`)}
          className="bg-blue-600 text-white py-2 rounded col-span-2"
        >
          ✏️ Edit Member
        </button>

      
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-4 text-blue-600 underline block text-center"
      >
        ← Back to Home
      </button>
    </div>
  );
}
