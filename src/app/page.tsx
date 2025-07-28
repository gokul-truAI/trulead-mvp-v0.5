'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '@/lib/types';
import { BATCH_SIZE, DAILY_LIMIT } from '@/lib/constants';
import Header from '@/components/dashboard/header';
import ProgressMeter from '@/components/dashboard/progress-meter';
import UnearthButton from '@/components/dashboard/unearth-button';
import DiscoveryLog from '@/components/dashboard/discovery-log';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket } from 'lucide-react';

const mapRawLeadToLead = (rawLead: any, index: number): Lead => {
  const email = rawLead.email || `placeholder-${index}@example.com`;
  return {
    id: email,
    company: rawLead.company || rawLead.name || rawLead.companyName || 'N/A',
    industry: rawLead.industry || rawLead.sector || 'N/A',
    location: rawLead.location || rawLead.city || 'N/A',
    contactName: rawLead.contactName || rawLead.contact?.name || 'N/A',
    email: email,
    website: rawLead.website || '#',
    description: rawLead.description || 'No description available.',
  };
};

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [unearthedIndices, setUnearthedIndices] = useState<Set<number>>(new Set());
  const [unearthedCount, setUnearthedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/data/leads.json');
        const rawData = await response.json();
        const mappedLeads = rawData.map(mapRawLeadToLead);
        setAllLeads(mappedLeads);
      } catch (error) {
        console.error('Failed to load leads:', error);
      }
    };

    fetchLeads();

    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('truLeadAiLastUnearthDate');
    const savedCount = localStorage.getItem('truLeadAiUnearthedCount');

    if (savedDate === today && savedCount) {
      setUnearthedCount(parseInt(savedCount, 10));
    } else {
      localStorage.setItem('truLeadAiUnearthedCount', '0');
      localStorage.setItem('truLeadAiLastUnearthDate', today);
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleUnearth = useCallback(() => {
    if (isLoading || unearthedCount >= DAILY_LIMIT) return;

    setIsLoading(true);

    setTimeout(() => {
      const availableIndices = allLeads
        .map((_, index) => index)
        .filter((index) => !unearthedIndices.has(index));

      const newLeads: Lead[] = [];
      const newIndices = new Set(unearthedIndices);

      for (let i = 0; i < BATCH_SIZE && availableIndices.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const leadIndex = availableIndices.splice(randomIndex, 1)[0];
        
        if (leadIndex !== undefined) {
          newLeads.push(allLeads[leadIndex]);
          newIndices.add(leadIndex);
        }
      }

      const newTotalUnearthed = unearthedCount + newLeads.length;
      
      setDisplayedLeads((prev) => [...newLeads, ...prev]);
      setUnearthedIndices(newIndices);
      setUnearthedCount(newTotalUnearthed);
      
      localStorage.setItem('truLeadAiUnearthedCount', newTotalUnearthed.toString());

      setIsLoading(false);
      setNotification(`${newLeads.length} new leads unearthed!`);
    }, 1500); // Simulate network and animation delay
  }, [allLeads, unearthedIndices, unearthedCount, isLoading]);
  
  const isLimitReached = unearthedCount >= DAILY_LIMIT;

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
          <ProgressMeter unearthed={unearthedCount} limit={DAILY_LIMIT} />
          <UnearthButton
            onClick={handleUnearth}
            isLoading={isLoading}
            isLimitReached={isLimitReached}
          />

          {notification && (
            <div className="w-full transition-all duration-300 ease-in-out">
              <Alert className="bg-primary/10 border-primary/20">
                <Rocket className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary font-semibold">Discovery Successful!</AlertTitle>
                <AlertDescription className="text-primary/80">
                  {notification}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <div className="w-full max-w-4xl mx-auto flex-grow mt-8">
            <DiscoveryLog leads={displayedLeads} />
        </div>
      </main>
    </div>
  );
}
