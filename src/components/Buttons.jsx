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
import { useEffect, useState } from "react";
import { RefreshCcw, Save } from "lucide-react";


export function SaveButton({ onClick }) {
  return (
    <div onClick={onClick} className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button className="gap-2 rounded-[10px]">
        <Save className="w-4 h-4" />
        Save
        </Button>
    </div>
  )
}

export function RenewButton({ id, currentEndDate, onRenew }) {
  const [renewOpen, setRenewOpen] = useState(false);
  const [newPlan, setNewPlan] = useState('1month');
  const [newEndDate, setNewEndDate] = useState(null);

  // ✅ Calculate new end date whenever plan or currentEndDate changes
  useEffect(() => {
    const baseDate = new Date(currentEndDate);
    const calculateEndDate = (startDate, plan) => {
      switch (plan) {
        case '1month': return addMonths(startDate, 1);
        case '2months': return addMonths(startDate, 2);
        case '3months': return addMonths(startDate, 3);
        case '6months': return addMonths(startDate, 6);
        case '1year': return addMonths(startDate, 12);
        default: return startDate;
      }
    };
    setNewEndDate(calculateEndDate(baseDate, newPlan));
  }, [currentEndDate, newPlan]);

  const handleRenew = async () => {
    const newEnd = newEndDate.toISOString().split('T')[0];

    const { error } = await supabase
      .from('members')
      .update({
        plan: newPlan,
        end_date: newEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      alert("Failed to renew: " + error.message);
    } else {
      if (onRenew) onRenew(newEnd, newPlan); // Update parent state
      setRenewOpen(false);
    }
  };

  return (
    <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 bg-green-800 rounded-[10px] h-[32px]">
          <RefreshCcw className='w-4 h-4' /> Renew
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="p-0">
          <DialogTitle className="text-left">Renew Membership</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
           <p className="text-sm text-muted-foreground mt-1">
            Current End Date: {format(new Date(currentEndDate), "dd MMM yyyy")}
          </p>
          <div>
            <label className="mb-1 block font-medium">Select New Plan</label>
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

          <p className="text-sm text-muted-foreground">
            New End Date: {newEndDate ? format(new Date(newEndDate), "dd MMM yyyy") : 'Calculating...'}
          </p>
        </div>

        <DialogFooter>
          <Button onClick={handleRenew} className="rounded-[10px]">Confirm Renewal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

