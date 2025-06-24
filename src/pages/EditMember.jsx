import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());
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
      const initialDate = new Date(data.start_date);
      setDate(initialDate);
      setValue(format(initialDate, 'MMMM dd, yyyy'));
      setMonth(initialDate);
      const end = calculateEndDate(data.start_date, data.plan);
      setCalculatedEndDate(format(end, 'yyyy-MM-dd'));
    }
  };

  useEffect(() => {
    fetchMember();
  }, []);

  useEffect(() => {
    if (form) {
      const result = calculateEndDate(date.toISOString().split('T')[0], form.plan);
      setCalculatedEndDate(format(result, 'yyyy-MM-dd'));
      setForm((prev) => ({ ...prev, start_date: date.toISOString().split('T')[0] }));
    }
  }, [form?.plan, date]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        <Button variant="ghost" size="icon" onClick={() => navigate(`/member/${id}`)}>
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Edit Member</h2>
        <SaveButton onClick={handleSubmit} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-[5px]">
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label>Name</Label>
          <Input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label>Phone</Label>
          <Input
            name="phone"
            type="text"
            required
            value={form.phone}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-400">This number will be used to send reminders</p>
        </div>

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label>Place</Label>
          <Input
            name="place"
            type="text"
            required
            value={form.place}
            onChange={handleChange}
          />
        </div>

        <div className="grid items-center gap-2">
          <Label>Plan</Label>
          <Select
            name="plan"
            value={form.plan}
            onValueChange={(value) => setForm((prev) => ({ ...prev, plan: value }))}
          >
            <SelectTrigger className="w-full max-w-sm">
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

        <div className="flex flex-col gap-3">
          <Label htmlFor="date" className="px-1">Start Date</Label>
          <div className="relative flex gap-2">
            <Input
              id="date"
              value={value}
              className="bg-background pr-10"
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setValue(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  setDate(newDate);
                  setMonth(newDate);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
            />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant="ghost"
                  className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                >
                  <CalendarIcon className="size-3.5" />
                  <span className="sr-only">Select date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
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

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label>End Date</Label>
          <Input type="text" value={calculatedEndDate} readOnly />
        </div>

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label>Notes</Label>
          <Textarea
            name="notes"
            placeholder="Optional notes"
            value={form.notes || ''}
            onChange={handleChange}
          />
        </div>
      </form>
    </div>
  );
}
