import { Button } from "@/components/ui/button"
import { addMonths, format } from 'date-fns';
import { supabase } from "@/utils/supabase";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";


export function SaveButton({ onClick }) {
  return (
    <div onClick={onClick} className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button>Save</Button>
    </div>
  )
}

export function RenewButton({ id, fetchMember }) {

  const [renewOpen, setRenewOpen] = useState(false);
  const [newPlan, setNewPlan] = useState('1month');
  const [newStartDate, setNewStartDate] = useState(new Date());
  const [newEndDate, setNewEndDate] = useState('');

  useEffect(() => {
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

    const result = calculateEndDate(newStartDate, newPlan);
    setNewEndDate(result.toISOString().split('T')[0]);
  }, [newStartDate, newPlan]);

  return (
    <div>
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogTrigger asChild>
          <Button className="mt-[10px] bg-green-800 rounded-[10px] h-8">
            <RefreshCcw className='w-4 h-4 mr-2' /> Renew
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Membership</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block font-medium">Plan</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
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

            <div>
              <label className="mb-1 block font-medium">Start Date</label>
              <Calendar
                mode="single"
                selected={newStartDate}
                onSelect={setNewStartDate}
              />
            </div>

            {newEndDate && (
              <p className="text-sm text-muted-foreground">
                End Date: {format(new Date(newEndDate), "dd MMM yyyy")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={async () => {
              const { error } = await supabase
                .from('members')
                .update({
                  plan: newPlan,
                  start_date: newStartDate.toISOString().split('T')[0],
                  end_date: newEndDate,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id);

              if (error) {
                alert("Failed to renew: " + error.message);
              } else {
                await fetchMember(); // refresh member details
                setRenewOpen(false); // close dialog
              }
            }}>
              Confirm Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}