import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { format, isAfter, isBefore } from 'date-fns';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, search, members]);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('end_date', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error.message);
    } else {
      setMembers(data);
    }
  };

  const applyFilters = () => {
    let result = [...members];

    if (filter === 'active') {
      result = result.filter((m) => isAfter(new Date(m.end_date), new Date()));
    } else if (filter === 'expired') {
      result = result.filter((m) => isBefore(new Date(m.end_date), new Date()));
    }

    if (search.trim()) {
      result = result.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  };

  const getInitials = (name) => {
    const words = name.split(' ');
    return words.map((w) => w[0]).join('').toUpperCase();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-3 space-y-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className=" text-xl font-semibold">
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xl">All Members</SelectItem>
            <SelectItem value="active" className="text-xl ">Active</SelectItem>
            <SelectItem value="expired" className="text-xl ">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => navigate('/add')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl text-sm h-10 bg-gray-100"
      />

      {/* Member List */}
      <div className="divide-y border rounded-xl mt-2">
        {filtered.map((member) => (
          <div
            key={member.id}
            onClick={() => navigate(`/member/${member.id}`)}
            className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                {getInitials(member.name)}
              </div>
              <div className="flex flex-col text-[13px]">
                <p className="font-medium text-[14px]">{member.name}</p>
                <p className="text-muted-foreground">
                  {format(new Date(member.end_date), 'dd MMM yyyy')}
                  {member.email ? ` • ${member.email}` : ''}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm mt-4">
          No members found.
        </p>
      )}

      <BottomNavigation />
    </div>
  );
}
