
'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { LeadRequest } from '@/lib/types';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface LeadFiltersProps {
  activeRequest: LeadRequest;
  onClearFilter: () => void;
}

export default function LeadFilters({ activeRequest, onClearFilter }: LeadFiltersProps) {
  return (
    <Card className="w-full bg-primary/5">
      <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-muted-foreground">Actively unearthing leads for:</p>
          <p className="font-semibold text-primary text-lg">
            {activeRequest.category} <span className="text-base font-normal text-muted-foreground">in</span> {activeRequest.continent}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilter}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear Filter
        </Button>
      </CardContent>
    </Card>
  );
}
