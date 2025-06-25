import { useEffect, useState, useMemo } from 'react';
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
import { Plus, ChevronRight, Loader2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import PageHeader from '@/components/PageHeader';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email, end_date')
        .order('end_date', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error.message);
      } else {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  // Debounce Search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Memoized Filter Logic
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const isActiveStatus =
        filter === 'active'
          ? isAfter(new Date(m.end_date), new Date())
          : filter === 'expired'
          ? isBefore(new Date(m.end_date), new Date())
          : true;

      const matchesSearch = m.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      return isActiveStatus && matchesSearch;
    });
  }, [members, filter, debouncedSearch]);

  const getInitials = (name) => {
    const words = name.split(' ');
    return words.map((w) => w[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Top Header */}
      <PageHeader
        left={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="text-lg font-semibold border-none shadow-none">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">All Members</SelectItem>
              <SelectItem value="active" className="text-lg">Active</SelectItem>
              <SelectItem value="expired" className="text-lg">Expired</SelectItem>
            </SelectContent>
          </Select>
        }
        right={
          <Button onClick={() => navigate('/add')} className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      />

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-3 space-y-4 my-18 scrollbar-hide">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-100"
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNavigation />
    </>
  );
}
