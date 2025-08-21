'use client';

import { useEffect, useState } from 'react';
import { generateMarketAnalysis } from '@/ai/flows/generate-market-analysis';
import type { Lead, MarketAnalysis } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Target } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface MarketAnalysisProps {
  lead: Lead;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

export default function MarketAnalysis({ lead, onUpdateLead }: MarketAnalysisProps) {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(lead.marketAnalysis || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      // Only fetch if analysis hasn't been fetched before for this lead.
      if (lead.marketAnalysis) {
        setAnalysis(lead.marketAnalysis);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await generateMarketAnalysis({
          company: lead.company,
          industry: lead.industry,
          description: lead.description,
        });
        setAnalysis(result);
        onUpdateLead(lead.id, { marketAnalysis: result });
      } catch (e) {
        console.error('Failed to generate market analysis:', e);
        setError('Could not generate analysis at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 text-sm">
        <Target className="h-5 w-5 flex-shrink-0 text-destructive" />
        <div className="flex-grow">
          <p className="font-semibold text-destructive">Market Analysis</p>
          <p className="text-foreground/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }
  
  const score = analysis.confidenceScore;
  const getPathColor = (s: number) => {
    if (s < 40) return '#ef4444'; // red-500
    if (s < 70) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-20 h-20 flex-shrink-0">
         <CircularProgressbar
            value={score}
            text={`${score}%`}
            styles={buildStyles({
                textSize: '24px',
                pathTransitionDuration: 0.5,
                pathColor: getPathColor(score),
                textColor: 'hsl(var(--foreground))',
                trailColor: 'hsl(var(--secondary))',
            })}
        />
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold text-accent flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analyst Note
        </h4>
        <p className="text-sm text-foreground/90">{analysis.analysisNote}</p>
      </div>
    </div>
  );
}
