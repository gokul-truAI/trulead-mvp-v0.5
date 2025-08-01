
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Lead, LeadRequest, UserCuratedFeed } from '@/lib/types';
import { BATCH_SIZE, DAILY_LIMIT } from '@/lib/constants';
import Header from '@/components/dashboard/header';
import ProgressMeter from '@/components/dashboard/progress-meter';
import UnearthButton from '@/components/dashboard/unearth-button';
import DiscoveryLog from '@/components/dashboard/discovery-log';
import LeadFilters from '@/components/dashboard/lead-filters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { generateMockLead } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function MyLeadsPage() {
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [unearthedCount, setUnearthedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<LeadRequest | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('truLeadAiUserRole');
    if (role !== 'user') {
      router.push('/');
    }
  }, [router]);
  
  const loadFromLocalStorage = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('truLeadAiLastUnearthDate');
    const savedCount = localStorage.getItem('truLeadAiUnearthedCount');
    const savedLeads = localStorage.getItem('truLeadAiDisplayedLeads');

    if (savedDate === today) {
      if (savedCount) setUnearthedCount(parseInt(savedCount, 10));
      if (savedLeads && savedLeads !== 'undefined') {
        try {
            const parsedLeads = JSON.parse(savedLeads);
            if(Array.isArray(parsedLeads)) {
                setDisplayedLeads(parsedLeads);
            }
        } catch (e) {
            console.error("Failed to parse displayed leads", e)
        }
      }
    } else {
      localStorage.setItem('truLeadAiUnearthedCount', '0');
      localStorage.setItem('truLeadAiLastUnearthDate', today);
      localStorage.setItem('truLeadAiDisplayedLeads', '[]');
      setUnearthedCount(0);
      setDisplayedLeads([]);
    }
  }, []);

  // Effect to load initial data
  useEffect(() => {
    loadFromLocalStorage();
    const savedRequests = localStorage.getItem('truLeadAiLeadRequests');
    if (savedRequests && savedRequests !== 'undefined') {
        try {
            const parsedRequests = JSON.parse(savedRequests);
            if (Array.isArray(parsedRequests)) {
                setRequests(parsedRequests);
            }
        } catch (e) {
            console.error("Failed to parse lead requests from localStorage", e);
        }
    }
  }, [loadFromLocalStorage]);

  // Handle setting active category from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('request_id');
    if (requestId) {
        const foundRequest = requests.find(r => r.id === requestId);
        if (foundRequest) {
          setActiveRequest(foundRequest);
        }
    }
  }, [requests]);

  // Update URL when active request changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeRequest) {
        params.set('request_id', activeRequest.id);
    } else {
        params.delete('request_id');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (newUrl !== window.location.href) {
       window.history.pushState({}, '', newUrl);
    }
  }, [activeRequest]);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const handleUnearth = useCallback(() => {
    if (isLoading || unearthedCount >= DAILY_LIMIT || !activeRequest) return;
    setIsLoading(true);

    setTimeout(() => {
      // In a real scenario, this would be an API call to the backend orchestration job.
      // Here, we simulate the curation job by generating new, unique leads.
      const curatedFeedJSON = localStorage.getItem('truLeadAiCuratedFeed');
      const curatedFeed: UserCuratedFeed = curatedFeedJSON ? JSON.parse(curatedFeedJSON) : {};
      
      const leadsForRequest = curatedFeed[activeRequest.id] || [];
      const alreadyDisplayedIds = new Set(displayedLeads.map(l => l.id));
      
      const availableLeads = leadsForRequest.filter(l => !alreadyDisplayedIds.has(l.id));

      const leadsToUnearth = Math.min(BATCH_SIZE, DAILY_LIMIT - unearthedCount, availableLeads.length);
      const newLeadsBatch = availableLeads.slice(0, leadsToUnearth);

      if (newLeadsBatch.length > 0) {
        const newTotalUnearthed = unearthedCount + newLeadsBatch.length;
        const newDisplayedLeads = [...newLeadsBatch, ...displayedLeads];
        
        setDisplayedLeads(newDisplayedLeads);
        setUnearthedCount(newTotalUnearthed);
        
        localStorage.setItem('truLeadAiUnearthedCount', newTotalUnearthed.toString());
        localStorage.setItem('truLeadAiDisplayedLeads', JSON.stringify(newDisplayedLeads));

        setNotification(`${newLeadsBatch.length} new leads unearthed!`);
      } else {
        setNotification('No new leads available for this request.');
      }
      
      setIsLoading(false);
    }, 1500);
  }, [unearthedCount, isLoading, activeRequest, displayedLeads]);

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    const newDisplayedLeads = displayedLeads.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    );
    setDisplayedLeads(newDisplayedLeads);
    localStorage.setItem('truLeadAiDisplayedLeads', JSON.stringify(newDisplayedLeads));
  };

  const filteredLeads = useMemo(() => {
    if (!activeRequest) {
        return displayedLeads;
    }
    return displayedLeads.filter(lead => lead.sourceRequestId === activeRequest.id);
  }, [activeRequest, displayedLeads]);
  
  const handleSelectRequest = (request: LeadRequest) => {
    if (request.status === 'Ready') {
      setActiveRequest(request);
      const newUrl = `${window.location.pathname}?request_id=${request.id}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  const handleClearFilter = () => {
    setActiveRequest(null);
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };
  
  const readyRequests = useMemo(() => requests.filter(r => r.status === 'Ready' || r.status === 'Completed'), [requests]);
  const isLimitReached = unearthedCount >= DAILY_LIMIT;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex-grow space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Lead Requests</CardTitle>
                <CardDescription>Select a 'Ready' request to start unearthing leads.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? requests.map((req) => (
                      <TableRow key={req.id} 
                        className={cn(
                          req.status === 'Ready' && 'cursor-pointer hover:bg-muted/50',
                          activeRequest?.id === req.id && 'bg-primary/10'
                        )}
                        onClick={() => handleSelectRequest(req)}
                      >
                        <TableCell className="min-w-[150px]">{req.category}</TableCell>
                        <TableCell>{req.continent}</TableCell>
                        <TableCell>{format(new Date(req.requestDate), 'PP')}</TableCell>
                        <TableCell>{req.leadCount}</TableCell>
                        <TableCell>
                            <Badge variant={req.status === 'Ready' ? 'default' : req.status === 'Processing' ? 'secondary' : 'outline'}>
                                {req.status}
                            </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No active requests. Approved requests will appear here.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
                <ProgressMeter 
                    unearthed={unearthedCount} 
                    limit={DAILY_LIMIT} 
                    category={activeRequest?.category}
                    categoryCount={filteredLeads.length}
                />
                
                {activeRequest && <LeadFilters onClearFilter={handleClearFilter} activeRequest={activeRequest} />}

                <UnearthButton
                    onClick={handleUnearth}
                    isLoading={isLoading}
                    isLimitReached={isLimitReached}
                    disabled={!activeRequest}
                />

                {notification && (
                    <div className="w-full transition-all duration-300 ease-in-out animate-fade-in">
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

            <DiscoveryLog leads={filteredLeads} onUpdateLead={updateLead} />
        </div>
      </main>
    </div>
  );
}
