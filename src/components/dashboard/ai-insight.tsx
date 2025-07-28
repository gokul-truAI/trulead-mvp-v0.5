'use client';

import { useEffect, useState } from 'react';
import { generateLeadInsight } from '@/ai/flows/generate-lead-insight';
import type { Lead } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';

interface AiInsightProps {
  lead: Lead;
}

export default function AiInsight({ lead }: AiInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateLeadInsight({
          company: lead.company,
          industry: lead.industry,
          location: lead.location,
          contactName: lead.contactName,
          email: lead.email,
        });
        setInsight(result.insight);
      } catch (e) {
        console.error('Failed to generate insight:', e);
        setError('Could not generate insight at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [lead]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 text-sm">
      <Bot className="h-5 w-5 flex-shrink-0 text-accent" />
      <div className="flex-grow">
        <p className="font-semibold text-accent">AI Insight</p>
        <p className="text-foreground/80">{error || insight}</p>
      </div>
    </div>
  );
}
