import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { addMonths, format } from 'date-fns';

export default function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState('');

  const calculateEndDate = (startDate, plan) => {
    const date = new Date(startDate);
    switch (plan) {
      case '1month': return addMonths(date, 1);
      case '2months': return addMonths(date, 2);
      case '3months': return addMonths(date, 3);
      case '6months': return addMonths(date, 6);
      case '1year': return addMonths(date, 12);
      default: return date;
    }
  };

  const fetchMember = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      alert('Error loading member: ' + error.message);
    } else {
      setForm(data);
      const end = calculateEndDate(data.start_date, data.plan);
      setCalculatedEndDate(format(end, 'yyyy-MM-dd'));
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);

    if (['plan', 'start_date'].includes(e.target.name)) {
      const end = calculateEndDate(updatedForm.start_date, updatedForm.plan);
      setCalculatedEndDate(format(end, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('members').update({
      name: form.name,
      phone: form.phone,
      email: form.email,
      place: form.place,
      plan: form.plan,
      start_date: form.start_date,
      end_date: calculatedEndDate,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) {
      alert('Error updating member: ' + error.message);
    } else {
      navigate(`/member/${id}`);
    }
  };

  if (!form) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-sm mx-auto p-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(`/member/${id}`)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <img src="/x.svg" alt="Close" className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold">Edit Member</h2>
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-3 h-[36px] rounded-[10px]"
        >
          <div className='flex items-center gap-1'>
            <img src="/save.svg" alt="Save" className="w-4 h-4" />
            <span>Save</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[5px]">
        <div>
          <label className="block mb-1 text-gray-700 font-medium text-base">Name</label>
          <input
            name="name"
            type="text"
            placeholder="Enter Your Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 border-[2px] border-gray-300 rounded-[10px] h-12 focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium text-base">Phone</label>
          <input
            name="phone"
            type="text"
            placeholder="Enter Phone Number"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 border-[2px] border-gray-300 rounded-[10px] h-12 focus:outline-none focus:ring"
          />
          <p className="text-xs text-gray-400 mt-1">
            This number will be used to send reminders
          </p>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium text-base">Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter Email ID"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 border-[2px] border-gray-300 rounded-[10px] h-12 focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium text-base">Place</label>
          <input
            name="place"
            type="text"
            placeholder="Enter Place"
            required
            value={form.place}
            onChange={handleChange}
            className="w-full px-4 border-[2px] border-gray-300 rounded-[10px] h-12 focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium text-base">Plan</label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full px-4 border-[2px] border-gray-300 rounded-[10px] h-12 focus:outline-none focus:ring"
          >
            <option value="1month">1 Month</option>
            <option value="2months">2 Months</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>
        </div>

        <div className="relative">
          <label className="block mb-1 text-gray-700 font-medium text-base">Start Date</label>
          <div className="relative">
            <img
              src="/calendar.svg"
              alt="calendar icon"
              onClick={() => document.getElementById('start_date').showPicker()}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer"
            />
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full h-12 pr-4 border-[2px] border-gray-300 pl-10 rounded-[10px] focus:outline-none focus:ring"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block mb-1 text-gray-700 font-medium text-base">End Date</label>
          <div className="relative">
            <img
              src="/calendar.svg"
              alt="calendar icon"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              value={calculatedEndDate}
              readOnly
              className="w-full border-[2px] border-gray-300 text-gray-600 pl-10 h-12 pr-4 rounded-[10px] focus:outline-none focus:ring"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium text-base">Notes</label>
          <textarea
            name="notes"
            placeholder="Optional notes"
            value={form.notes || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border-[2px] border-gray-300 rounded-[10px] h-24 focus:outline-none focus:ring"
          />
        </div>
      </form>
    </div>
  );
}
