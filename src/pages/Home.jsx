import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isActive, isExpired } from "../utils/dateUtils";
import { supabase } from "../utils/supabase";



export default function Home() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // or 'expired'
  const navigate = useNavigate();

  // Fetch members from Supabase
  const fetchMembers = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .order('end_date', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error.message);
    } else {
      setMembers(data || []);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members
    .filter((member) =>
      activeTab === 'active' ? isActive(member.end_date) : isExpired(member.end_date)
    )
    .filter((member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Gym Management App</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload(); // or use navigate('/login')
          }}
          className="text-sm text-red-600 underline"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-between mb-4">
        <button
          className={`flex-1 py-2 rounded-l-lg ${activeTab === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`flex-1 py-2 rounded-r-lg ${activeTab === 'expired' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          onClick={() => setActiveTab('expired')}
        >
          Expired
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search"
          className="flex-1 px-3 py-2 border rounded mr-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-full text-xl"
          onClick={() => navigate('/add')}
        >
          +
        </button>
      </div>

      {/* Member List */}
      {filteredMembers.length > 0 ? (
        <ul className="space-y-2">
          {filteredMembers.map((member) => (
            <li
              key={member.id}
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/member/${member.id}`)}
            >
              <div className="font-semibold">{member.name}</div>
              <div className="text-gray-500 text-sm">
                {new Date(member.end_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No members found.</p>
      )}
    </div>
  );
}