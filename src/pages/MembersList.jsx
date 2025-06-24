// MembersList.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import BottomNav from '../components/BottomNav';
import MemberCard from '../components/MemberCard';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (!error) setMembers(data);
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-sm mx-auto min-h-screen pb-20 px-4 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">All Members</h1>
        <button
          onClick={() => navigate('/add-member')}
          className="bg-black text-white px-3 h-[32px] rounded-[10px] text-sm flex items-center gap-1"
        >
          + Add
        </button>
      </div>

      <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      <div className="space-y-3 mt-4">
        {filteredMembers.map((member) => (
          <MemberCard key={member.id} member={member} onClick={() => navigate(`/edit-member/${member.id}`)} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}