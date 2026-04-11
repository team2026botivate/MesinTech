'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/lib/data-context';
import { Company } from '@/lib/types';
import { Settings, Clock4 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgeingConfigFormProps {
  company: Company;
  onSubmit?: () => void;
}

export function AgeingConfigForm({ company, onSubmit }: AgeingConfigFormProps) {
  const { updateCompany } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bracket1: company.ageingBrackets?.bracket1 || 30,
    bracket2: company.ageingBrackets?.bracket2 || 60,
    bracket3: company.ageingBrackets?.bracket3 || 90,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bracket1 >= formData.bracket2 || formData.bracket2 >= formData.bracket3) {
      alert('Brackets must be in ascending order');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const updatedCompany: Company = {
        ...company,
        ageingBrackets: {
          bracket1: formData.bracket1,
          bracket2: formData.bracket2,
          bracket3: formData.bracket3,
        },
      };
      updateCompany(updatedCompany);
      setIsLoading(false);
      setIsOpen(false);
      onSubmit?.();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-6 border-b bg-muted/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock4 className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Ageing Configuration</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Customize payment ageing brackets for <span className="font-semibold text-foreground">{company.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bracket1" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    Bracket 1: Current (Days)
                  </Label>
                  <Input
                    id="bracket1"
                    type="number"
                    min="1"
                    value={formData.bracket1}
                    onChange={(e) => setFormData({ ...formData, bracket1: parseInt(e.target.value) })}
                    className="bg-background/50 h-10"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Standard: 30 days</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bracket2" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    Bracket 2: Overdue (Days)
                  </Label>
                  <Input
                    id="bracket2"
                    type="number"
                    min="1"
                    value={formData.bracket2}
                    onChange={(e) => setFormData({ ...formData, bracket2: parseInt(e.target.value) })}
                    className="bg-background/50 h-10"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Standard: 60 days</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bracket3" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                    Bracket 3: Severely Overdue (Days)
                  </Label>
                  <Input
                    id="bracket3"
                    type="number"
                    min="1"
                    value={formData.bracket3}
                    onChange={(e) => setFormData({ ...formData, bracket3: parseInt(e.target.value) })}
                    className="bg-background/50 h-10"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Standard: 90 days</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Live Preview:</p>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Current Status</span>
                    <span className="font-medium">0 - {formData.bracket1} days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className="font-medium text-amber-600">{formData.bracket1 + 1} - {formData.bracket2} days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Severely Overdue</span>
                    <span className="font-medium text-orange-600">{formData.bracket2 + 1} - {formData.bracket3} days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Critical Status</span>
                    <span className="font-medium text-red-600">{formData.bracket3}+ days</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10 gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto shadow-sm">
              {isLoading ? 'Saving...' : 'Update Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
