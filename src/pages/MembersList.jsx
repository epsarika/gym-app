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
import { Plus, ChevronRight, Loader2, Search, ChevronDown } from 'lucide-react';
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
            <SelectTrigger className="relative text-lg font-semibold border-none shadow-none p-0 text-gray-900 bg-transparent dark:bg-transparent">
              <SelectValue placeholder="All Members" />
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 stroke-[3] text-gray-800" />
            </SelectTrigger>
            <SelectContent className="bg-white p-1 rounded-[10px]">
              <SelectItem value="all" className="text-[16px] font-semibold">
                All Members
              </SelectItem>
              <SelectItem value="active" className="text-[16px] font-semibold">
                Active
              </SelectItem>
              <SelectItem value="expired" className="text-[16px] font-semibold">
                Expired
              </SelectItem>
            </SelectContent>
          </Select>

        }
        right={
          <Button
            onClick={() => navigate('/add')}
            className="gap-2 bg-black text-white hover:bg-gray-800 rounded-[10px]"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      />


      <div className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg mx-auto px-4 md:px-6 py-3 md:py-6 space-y-4 my-16 mb-20 bg-white text-black transition-colors duration-300">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-100 border-0 shadow-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 mt-2">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  onClick={() => navigate(`/member/${member.id}`)}
                  className="flex items-center justify-between gap-2 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-sm md:text-base font-semibold text-gray-700">
                      {getInitials(member.name)}
                    </div>
                    <div className="flex flex-col text-[13px] md:text-[15px]">
                      <p className="font-medium text-[14px] md:text-[16px]">{member.name}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(member.end_date), 'dd MMM yyyy')}
                        {` • ${member.place}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              ))}
            </div>

            {members.length === 0 && !loading ? (
              // TRUE EMPTY STATE — No members at all
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <img
                  src="/no-member.svg"
                  alt="No Records"
                  className="w-[280px] h-[180px] object-contain"
                />
                <div className="space-y-1">
                  <p className="text-lg font-medium text-gray-900">
                    No records yet.
                  </p>
                  <div className='w-56 sm:w-72 md:w-80 lg:w-96 text-center mx-auto'>
                    <p className="text-m text-gray-500">
                      Add new members by clicking the “Add” button
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => navigate('/add')}
                    className="rounded-[10px] border border-gray-300"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 stroke-2.5 text-gray-900" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/settings')}
                    className="text-sm text-gray-900"
                  >
                    Settings <ChevronRight className="w-4 h-4 stroke-2.5" />
                  </Button>
                </div>
              </div>
            ) : filtered.length === 0 && !loading ? (
              // SPECIFIC FILTER EMPTY — Show minimal feedback
              <div className="text-center py-10 text-gray-500 text-sm">
                No members found.
              </div>
            ) : null}

          </>
        )}
      </div>


      <BottomNavigation />
    </>
  );
}
