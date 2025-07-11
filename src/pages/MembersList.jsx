import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Search, ChevronRight } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import PageHeader from '@/components/PageHeader';
import MemberList from '@/components/MemberList';

// Global cache for members list - reuse from home cache if available
let membersListCache = {
  data: null,
  timestamp: null,
  isLoading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes - same as home cache

export default function MembersList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized initial filter from URL params
  const initialFilter = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('filter') || 'all';
  }, [location.search]);

  const [members, setMembers] = useState(membersListCache.data || []);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!membersListCache.data);

  // Memoized filter options for better performance
  const filterOptions = useMemo(() => [
    { value: 'all', label: 'All Members' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' }
  ], []);

  // Memoized filtered and searched members
  const filteredMembers = useMemo(() => {
    if (!members.length) return [];

    let filtered = members;

    // Apply filter
    if (filter === 'active') {
      filtered = members.filter(member => new Date(member.end_date) > new Date());
    } else if (filter === 'expired') {
      filtered = members.filter(member => new Date(member.end_date) <= new Date());
    }

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.place.toLowerCase().includes(searchLower) ||
        (member.email && member.email.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [members, filter, search]);

  const fetchMembers = useCallback(async (forceRefresh = false) => {
    // Check if we have valid cached data
    const now = Date.now();
    const cacheValid = membersListCache.data &&
      membersListCache.timestamp &&
      (now - membersListCache.timestamp < CACHE_DURATION);

    if (cacheValid && !forceRefresh) {
      setMembers(membersListCache.data);
      setLoading(false);
      return;
    }

    // Prevent multiple concurrent requests
    if (membersListCache.isLoading) return;

    membersListCache.isLoading = true;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, place, end_date, email')
        .order('end_date', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error.message);
      } else {
        // Update cache
        membersListCache.data = data;
        membersListCache.timestamp = now;
        setMembers(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching members:', err);
    } finally {
      membersListCache.isLoading = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const shouldRefresh = queryParams.get('refresh') === 'true';

    fetchMembers(shouldRefresh);

    if (shouldRefresh) {
      // ✅ Clean the URL (remove ?refresh=true)
      queryParams.delete('refresh');
      navigate({ pathname: location.pathname, search: queryParams.toString() }, { replace: true });
    }
  }, [location.search, fetchMembers, navigate]);


  // Update filter when URL changes
  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  // Optimized handlers
  const handleFilterChange = useCallback((value) => {
    setFilter(value);
    navigate(`/members?filter=${value}`, { replace: true });
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleAddMember = useCallback(() => {
    navigate('/add');
  }, [navigate]);

  // Memoized search input props
  const searchInputProps = useMemo(() => ({
    placeholder: "Search by name, place, or email",
    value: search,
    onChange: handleSearchChange,
    className: "pl-10 bg-gray-100 border-0 shadow-none"
  }), [search, handleSearchChange]);

  return (
    <>
      <PageHeader
        left={
          <Select
            value={filter}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="relative text-lg font-semibold border-none shadow-none p-0 text-gray-900 bg-transparent dark:bg-transparent">
              <SelectValue placeholder="All Members" />
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 stroke-[3] text-gray-800" />
            </SelectTrigger>
            <SelectContent className="bg-white p-1 rounded-[12px]">
              {filterOptions.map(option => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-[16px] font-semibold"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        right={
          <Button
            onClick={handleAddMember}
            className="gap-2 bg-black text-white hover:bg-gray-800 rounded-[10px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        }
      />

      <div className="w-full max-w-screen-md mx-auto px-4 py-2 my-16 mb-20 bg-white text-black">
        {/* Search Input */}
        <div className="relative w-full max-w-sm mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
          <Input {...searchInputProps} />
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {search.trim() ? (
              <span>
                Found {filteredMembers.length} result{filteredMembers.length !== 1 ? 's' : ''}
                {filter !== 'all' && ` in ${filter} members`}
                {search.trim() && ` for "${search.trim()}"`}
              </span>
            ) : (
              <span>
                Showing {filteredMembers.length} {filter} member{filteredMembers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 skeleton rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
                <div className="w-16 h-6 skeleton" />
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center px-6 text-gray-500">
            <img
              src="/no-member.svg"
              alt="No Members Illustration"
              className="w-70 h-70 object-contain"
              loading="lazy"
            />
            <h2 className="text-lg font-semibold text-black mb-1">No records yet.</h2>
            <p className="text-medium w-[230px] text-gray-500 mb-6">
              Add new members by clicking the “Add” button
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleAddMember}
                className="gap-2 rounded-[10px] bg-white text-black border shadow-none"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
              <Button variant="outline"
                onClick={() => navigate('/settings')}
                className="rounded-[10px] border-0 shadow-none text-black">
                Settings
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}


        {/* Member List */}
        {!loading && filteredMembers.length > 0 && (
          <MemberList
            members={filteredMembers}
            filter={filter}
            search={search}
            loading={loading}
          />
        )}
      </div>

      <BottomNavigation />
    </>
  );
}