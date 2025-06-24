import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { addMonths, format } from 'date-fns';

export default function AddMember() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    plan: '1month',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [calculatedEndDate, setCalculatedEndDate] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [customData, setCustomData] = useState({});
  const [gymProfile, setGymProfile] = useState(null);

  const navigate = useNavigate();

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

  useEffect(() => {
    const result = calculateEndDate(form.start_date, form.plan);
    setCalculatedEndDate(format(result, 'yyyy-MM-dd'));
  }, [form.plan, form.start_date]);


  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile, error } = await supabase
        .from('gym_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        alert('Failed to load gym profile: ' + error.message);
      } else {
        setGymProfile(profile);
        setFormFields(profile.form_fields || []);
      }
    };

    fetchProfile();
  }, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleCustomChange = (e, field) => {
    setCustomData({ ...customData, [field]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('members').insert([
      {
        user_id: user.id,
        gym_id: gymProfile.id,
        gym_name: gymProfile.gym_name,
        name: form.name,
        phone: form.phone,
        email: form.email,
        plan: form.plan,
        start_date: form.start_date,
        end_date: calculatedEndDate,
        notes: form.notes,
        custom_data: customData,
      },
    ]);

    if (error) {
      alert('Error adding member: ' + error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Member</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="phone"
          type="text"
          placeholder="Phone"
          required
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
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

        {/* Display auto-calculated end_date */}
        <input
          type="text"
          value={calculatedEndDate}
          readOnly
          className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-600"
        />

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        {formFields.length > 0 && (
          <div className="space-y-2">
            {formFields.map((field) => (
              <input
                key={field.label}
                type={field.type || 'text'}
                placeholder={field.label}
                value={customData[field.label] || ''}
                onChange={(e) => handleCustomChange(e, field.label)}
                className="w-full border px-3 py-2 rounded"
              />
            ))}
          </div>
        )}


        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Member
        </button>
      </form>
    </div>
  );
}
