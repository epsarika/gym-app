import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') || 'all';

  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, name, place, end_date')
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

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

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
      <PageHeader
        left={
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value);
              navigate(`/members?filter=${value}`);
            }}
          >
            <SelectTrigger className="text-lg font-semibold border-none shadow-none p-0 dark:text-white dark:bg-black">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent className="dark:bg-black dark:text-white">
              <SelectItem value="all" className="text-lg font-semibold">
                All Members
              </SelectItem>
              <SelectItem value="active" className="text-lg font-semibold">
                Active
              </SelectItem>
              <SelectItem value="expired" className="text-lg font-semibold">
                Expired
              </SelectItem>
            </SelectContent>
          </Select>
        }
        right={
          <Button
            onClick={() => navigate('/add')}
            className="gap-2 bg-black text-white hover:bg-gray-800 dark:bg-gray-300 dark:text-black dark:hover:bg-gray-400"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      />


      <div className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg mx-auto px-4 md:px-6 py-3 md:py-6 space-y-4 my-16 mb-20 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <Input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-100 dark:bg-gray-900 dark:placeholder-gray-400"
        />

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500 dark:text-gray-300" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 mt-2">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/member/${member.id}`)}
                  className="flex items-center justify-between gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm md:text-base font-semibold text-gray-700 dark:text-gray-200">
                      {getInitials(member.name)}
                    </div>
                    <div className="flex flex-col text-[13px] md:text-[15px]">
                      <p className="font-medium text-[14px] md:text-[16px]">{member.name}</p>
                      <p className="text-muted-foreground dark:text-gray-400">
                        {format(new Date(member.end_date), 'dd MMM yyyy')}
                        {` • ${member.place}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground dark:text-gray-400 text-sm mt-4">
                No members found.
              </p>
            )}
          </>
        )}
      </div>


      <BottomNavigation />
    </>
  );
}
