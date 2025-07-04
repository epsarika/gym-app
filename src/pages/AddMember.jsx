import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { addMonths, format } from 'date-fns';
import { SaveButton } from '@/components/Buttons';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from '@/components/PageHeader';

export default function AddMember() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    place: '',
    plan: '1month',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [date, setDate] = useState(new Date(form.start_date));
  const [value, setValue] = useState(format(date, 'MMMM dd, yyyy'));
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(date);

  const [endDate, setEndDate] = useState(calculateEndDate(date, form.plan));
  const [endDateStr, setEndDateStr] = useState(format(endDate, 'MMMM dd, yyyy'));
  const [endOpen, setEndOpen] = useState(false);
  const [endMonth, setEndMonth] = useState(endDate);

  const [gymProfile, setGymProfile] = useState(null);
  const navigate = useNavigate();

  function calculateEndDate(startDate, plan) {
    const date = new Date(startDate);
    switch (plan) {
      case '1month': return addMonths(date, 1);
      case '2months': return addMonths(date, 2);
      case '3months': return addMonths(date, 3);
      case '6months': return addMonths(date, 6);
      case '1year': return addMonths(date, 12);
      default: return date;
    }
  }

  useEffect(() => {
    const result = calculateEndDate(date.toISOString().split('T')[0], form.plan);
    setEndDate(result);
    setEndDateStr(format(result, 'MMMM dd, yyyy'));
    setForm((prev) => ({ ...prev, start_date: date.toISOString().split('T')[0] }));
  }, [form.plan, date]);

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
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!form.name || !form.phone || !form.place) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('members').insert([{
      user_id: user.id,
      gym_id: gymProfile.id,
      gym_name: gymProfile.gym_name,
      name: form.name,
      phone: form.phone,
      email: form.email,
      place: form.place,
      plan: form.plan,
      start_date: form.start_date,
      end_date: endDate.toISOString().split('T')[0],
      notes: form.notes,
    }]);

    if (error) {
      alert('Error adding member: ' + error.message);
    } else {
      navigate(-1);
    }
  };

  const getFieldClass = (field) => {
    return hasSubmitted && !form[field] ? 'border-red-500 ring-1 ring-red-500' : '';
  };

  return (
    <>
      <PageHeader

        title="Add Member"

        left={
          <Button variant="ghost" size='32' onClick={() => navigate(-1)}>
            <X className="stroke-[3] text-black" />
          </Button>
        }

        right={<SaveButton onClick={handleSubmit} />}
      />

      <div className="max-w-sm mx-auto p-4 text-m my-16 text-gray-900 bg-white rounded-[10px]">
        <form onSubmit={handleSubmit} className="space-y-[14px]">
          {/* Name */}
          <div className="grid w-full items-start gap-1">
            <Label>Name</Label>
            <Input
              name="name"
              type="text"
              placeholder="Enter Your Name"
              value={form.name}
              onChange={handleChange}
              className={`${getFieldClass('name')}`}
            />
          </div>

          {/* Phone */}
          <div className="grid w-full items-start gap-1">
            <Label>Phone</Label>
            <Input
              name="phone"
              type="text"
              placeholder="Enter Phone Number"
              value={form.phone}
              onChange={handleChange}
              className={`${getFieldClass('phone')}`}
            />
            <p className="text-xs text-gray-500">This number will be used to send reminders</p>
          </div>

          {/* Email */}
          <div className="grid w-full items-start gap-1">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              placeholder="Enter Email ID"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Place */}
          <div className="grid w-full items-start gap-1">
            <Label>Place</Label>
            <Input
              name="place"
              type="text"
              placeholder="Enter Place"
              value={form.place}
              onChange={handleChange}
              className={`${getFieldClass('place')}`}
            />
          </div>

          {/* Plan */}
          <div className="grid items-start gap-1">
            <Label>Plan</Label>
            <Select
              value={form.plan}
              onValueChange={(value) => setForm((prev) => ({ ...prev, plan: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="2months">2 Months</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="date">Start Date</Label>
            <div className="relative flex">
              <Input
                id="date"
                value={value}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setValue(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setDate(newDate);
                    setMonth(newDate);
                  }
                }}
                onKeyDown={(e) => e.key === 'ArrowDown' && (e.preventDefault(), setOpen(true))}
              />
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2 text-gray-500"
                  >
                    <CalendarIcon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 bg-white">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={(date) => {
                      setDate(date);
                      setValue(format(date, 'MMMM dd, yyyy'));
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="end-date">End Date</Label>
            <div className="relative flex">
              <Input
                id="end-date"
                value={endDateStr}
                readOnly
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2 text-gray-500"
              >
                <CalendarIcon className="size-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="grid w-full items-start gap-1">
            <Label>Notes</Label>
            <Textarea
              name="notes"
              placeholder="Optional notes"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>

    </>
  );
}
