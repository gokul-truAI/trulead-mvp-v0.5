import type { Lead } from '@/lib/types';
import LeadCard from './lead-card';
import { Telescope } from 'lucide-react';

interface DiscoveryLogProps {
  leads: Lead[];
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

export default function DiscoveryLog({ leads, onUpdateLead }: DiscoveryLogProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <Telescope className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Awaiting Discovery</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your unearthed leads will appear here.
        </p>
         <p className="mt-1 text-sm text-muted-foreground">
          Click "Unearth Leads" to begin!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead, index) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          animationStyle={{ animationDelay: `${index * 120}ms` }}
          onUpdateLead={onUpdateLead}
        />
      ))}
    </div>
  );
}
