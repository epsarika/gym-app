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
      plan: form.plan,
      start_date: form.start_date,
      end_date: calculatedEndDate,
      notes: form.notes,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) {
      alert('Error updating member: ' + error.message);
    } else {
      navigate('/');
    }
  };

  if (!form) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Member</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="phone"
          type="text"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="plan"
          value={form.plan}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="1month">1 Month</option>
          <option value="2months">2 Months</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="1year">1 Year</option>
        </select>

        <input
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          value={calculatedEndDate}
          readOnly
          className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-600"
        />

        <textarea
          name="notes"
          value={form.notes || ''}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Notes (optional)"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
