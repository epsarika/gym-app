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
import PageHeader from '@/components/PageHeader';

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
      navigate(`/member/${id}?refresh=true`);
    }
  };

  return (
    <>
      <PageHeader
        title="Edit Member"
        left={
          <Button variant="ghost" size='32' onClick={() => navigate(-1)} className="pr-3">
            <img src="/x.svg" alt="x" />
          </Button>
        }
        right={<SaveButton onClick={handleSubmit} />}
      />

      <div className="max-w-sm mx-auto p-4 text-sm my-16">
        {form ? (
          <form onSubmit={handleSubmit} className="space-y-[14px]">
            <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} required note="This number will be used to send reminders" />
            <FormField label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            <FormField label="Place" name="place" value={form.place} onChange={handleChange} required />

            {/* Plan Selection */}
            <div className="grid items-center gap-1">
              <Label>Plan</Label>
              <Select
                value={form.plan}
                onValueChange={(value) => setForm((prev) => ({ ...prev, plan: value }))}
              >
                <SelectTrigger className="w-full max-w-sm !h-10">
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

            {/* Start Date Picker */}
            <div className="flex flex-col gap-1">
              <Label>Start Date</Label>
              <div className="relative flex">
                <Input
                  value={value}
                  className="bg-background pr-10 h-10"
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setValue(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setDate(newDate);
                      setMonth(newDate);
                    }
                  }}
                  onKeyDown={(e) => e.key === "ArrowDown" && (e.preventDefault(), setOpen(true))}
                />
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2 text-gray-500">
                      <CalendarIcon className="size-4" />
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

            {/* End Date Field with Calendar Icon */}
            <div className="flex flex-col gap-1">
              <Label>End Date</Label>
              <div className="relative">
                <Input
                  value={format(new Date(calculatedEndDate), 'MMMM dd, yyyy')}
                  readOnly
                  className="w-full pr-1 h-10"
                />
                <CalendarIcon className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            {/* Notes */}
            <div className="grid w-full max-w-sm items-center gap-1">
              <Label>Notes</Label>
              <Textarea
                name="notes"
                placeholder="Optional notes"
                value={form.notes || ''}
                onChange={handleChange}
              />
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-pulse mt-2">
    {[...Array(6)].map((_, idx) => (
      <div key={idx} className="space-y-1">
        <div className="h-4 w-24 skeleton" />
        <div className="h-10 w-full skeleton rounded" />
      </div>
    ))}
    {/* Notes skeleton */}
    <div className="space-y-1">
      <div className="h-4 w-24 skeleton" />
      <div className="h-20 w-full skeleton rounded" />
    </div>
  </div>
        )}
      </div>
    </>
  );
}

// ✅ Reusable Field Component
function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required,
  readOnly,
  note,
  calendar = false,
  placeholder = 'Not provided',
}) {
  const isEmpty = value === '' || value === null || value === undefined;

  return (
    <div className="grid w-full max-w-sm items-center gap-1">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          placeholder={isEmpty ? placeholder : ''}
          className={`w-full pr-10 h-10`}
        />
        {calendar && (
          <CalendarIcon className="absolute top-1/2 right-2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-300" />
        )}
      </div>
      {note && <p className="text-xs text-gray-400">{note}</p>}
    </div>
  );
}
