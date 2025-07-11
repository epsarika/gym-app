// MemberList.jsx - Advanced version with virtual scrolling
import { useMemo, useCallback, memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, isBefore } from 'date-fns';
import { ChevronRight } from 'lucide-react';

// Utility functions
const getInitials = (name) => {
  const nameParts = name.trim().split(' ');
  return nameParts.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
};

// Memoized individual member item component
const MemberItem = memo(({ member, onClick, style }) => {
  const initials = useMemo(() => getInitials(member.name), [member.name]);
  
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(member.end_date), 'dd MMM yyyy');
    } catch (error) {
      console.warn('Invalid date format:', member.end_date);
      return 'Invalid Date';
    }
  }, [member.end_date]);

  const handleClick = useCallback(() => {
    onClick(member.id);
  }, [onClick, member.id]);

  return (
    <div
      style={style}
      onClick={handleClick}
      className="flex items-center justify-between gap-2 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden text-sm md:text-base font-semibold text-gray-700">
          
          { (
            initials
          )}
        </div>
        <div className="flex flex-col text-[13px] md:text-[15px] max-w-[250px] md:max-w-[250px]">
          <p className="font-medium text-[14px] md:text-[16px] truncate" title={member.name}>
            {member.name}
          </p>
          <p className="text-muted-foreground truncate">
            {formattedDate} • {member.place}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500" />
    </div>
  );
});

MemberItem.displayName = 'MemberItem';

// Virtual scrolling component
const VirtualizedList = memo(({ items, renderItem, itemHeight = 60, containerHeight = 400 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight, overflowY: 'auto' }}
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={item.id} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Memoized loading skeleton component
const LoadingSkeleton = memo(({ count = 5 }) => (
  <div className="space-y-4 mt-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg skeleton" />
          <div className="flex flex-col gap-2">
            <div className="w-32 h-4 skeleton"></div>
            <div className="w-20 h-3 skeleton"></div>
          </div>
        </div>
        <div className="w-4 h-4 skeleton rounded" />
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Memoized empty state component
const EmptyState = memo(({ message = "No members found." }) => (
  <div className="text-center py-10 text-gray-500">{message}</div>
));

EmptyState.displayName = 'EmptyState';

// Enhanced filter function with better performance
const useFilteredMembers = (members, filter, search, max) => {
  return useMemo(() => {
    if (!members.length) return [];

    const now = new Date();
    const searchLower = search.toLowerCase().trim();

    let filteredMembers = members;

    // Apply filters only if needed
    if (filter !== 'all' || searchLower) {
      filteredMembers = members.filter((member) => {
        // Status filter
        if (filter === 'active' && !isAfter(new Date(member.end_date), now)) {
          return false;
        }
        if (filter === 'expired' && !isBefore(new Date(member.end_date), now)) {
          return false;
        }

        // Search filter
        if (searchLower && !member.name.toLowerCase().includes(searchLower)) {
          return false;
        }

        return true;
      });
    }

    // Apply max limit
    return max ? filteredMembers.slice(0, max) : filteredMembers;
  }, [members, filter, search, max]);
};

// Main component
export default function MemberList({ 
  members = [], 
  filter = 'all', 
  search = '', 
  max, 
  loading = false,
  virtualScrolling = false,
  containerHeight = 400
}) {
  const navigate = useNavigate();
  const filteredMembers = useFilteredMembers(members, filter, search, max);

  // Memoized navigation handler
  const handleMemberClick = useCallback((memberId) => {
    navigate(`/member/${memberId}`);
  }, [navigate]);

  // Memoized render item for virtual scrolling
  const renderItem = useCallback((member) => (
    <MemberItem 
      member={member} 
      onClick={handleMemberClick}
    />
  ), [handleMemberClick]);

  if (loading) {
    return <LoadingSkeleton count={max || 5} />;
  }

  if (filteredMembers.length === 0) {
    const emptyMessage = search 
      ? `No members found for "${search}"`
      : filter === 'active' 
        ? "No active members found"
        : filter === 'expired'
          ? "No expired members found"
          : "No members found";
    
    return (
      <div className="divide-y divide-gray-100">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  // Use virtual scrolling for large lists
  if (virtualScrolling && filteredMembers.length > 50) {
    return (
      <VirtualizedList
        items={filteredMembers}
        renderItem={renderItem}
        itemHeight={60}
        containerHeight={containerHeight}
      />
    );
  }

  // Regular rendering for smaller lists
  return (
    <div className="divide-y divide-gray-100">
      {filteredMembers.map((member) => (
        <MemberItem 
          key={member.id} 
          member={member} 
          onClick={handleMemberClick}
        />
      ))}
    </div>
  );
}