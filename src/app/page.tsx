
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Lead, RawLead, LocationHierarchy, LeadStatus, LeadRequest } from '@/lib/types';
import { BATCH_SIZE, DAILY_LIMIT } from '@/lib/constants';
import Header from '@/components/dashboard/header';
import ProgressMeter from '@/components/dashboard/progress-meter';
import UnearthButton from '@/components/dashboard/unearth-button';
import DiscoveryLog from '@/components/dashboard/discovery-log';
import LeadFilters from '@/components/dashboard/lead-filters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mapRawLeadToLead = (rawLead: RawLead): Lead => {
  const properties = rawLead.properties;

  const categories =
    properties.categories?.map((c) => c.value).join(', ') || 'N/A';

  const city = properties.location_identifiers?.find(
    (l) => l.location_type === 'city'
  )?.value;
  const region = properties.location_identifiers?.find(
    (l) => l.location_type === 'region'
  )?.value;
  const country = properties.location_identifiers?.find(
    (l) => l.location_type === 'country'
  )?.value;
  let location = 'N/A';
  if (city && region && country) {
    location = `${city}, ${region}, ${country}`;
  } else {
    location = properties.location_identifiers?.map((l) => l.value).join(', ') || 'N/A';
  }

  let foundedOn = 'N/A';
  if (properties.founded_on?.value) {
    try {
      foundedOn = format(new Date(properties.founded_on.value), 'yyyy');
    } catch (e) {
      // Keep N/A if date is invalid
    }
  }

  return {
    id: rawLead.uuid,
    company: properties.identifier?.value || 'N/A',
    description: properties.short_description || 'No description available.',
    industry: categories,
    location: location,
    locations: properties.location_identifiers || [],
    email: properties.contact_email || 'N/A',
    website: properties.website?.value || '#',
    phoneNumber: properties.phone_number || 'N/A',
    linkedin: properties.linkedin?.value || null,
    facebook: properties.facebook?.value || null,
    postalCode: properties.hq_postal_code || 'N/A',
    foundedOn: foundedOn,
    contactName: 'N/A',
    status: 'new',
    browsed: false,
  };
};

export default function MyLeadsPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [unearthedIds, setUnearthedIds] = useState<Set<string>>(new Set());
  const [unearthedCount, setUnearthedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [requests, setRequests] = useState<LeadRequest[]>([]);

  // Filter state
  const [locationHierarchy, setLocationHierarchy] = useState<LocationHierarchy>({});
  const [filters, setFilters] = useState({
    continent: '',
    country: '',
    region: '',
    city: '',
    category: '',
  });
  
  // Set initial category from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
        setFilters(prev => ({ ...prev, category }));
    }
  }, []);

  // Update URL when category filter changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (filters.category) {
        params.set('category', filters.category);
    } else {
        params.delete('category');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (newUrl !== window.location.href) {
       window.history.pushState({}, '', newUrl);
    }
  }, [filters.category]);


  // Effect to fetch initial data and populate filters
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/data/leads.json');
        const rawData = await response.json();
        
        if (rawData && Array.isArray(rawData.entities)) {
            const mappedLeads = rawData.entities.map(mapRawLeadToLead);
            setAllLeads(mappedLeads);
  
            // Extract filters
            const newLocationHierarchy: LocationHierarchy = {};
  
            rawData.entities.forEach((lead: RawLead) => {
              const continent = lead.properties.location_identifiers?.find(l => l.location_type === 'continent')?.value;
              const country = lead.properties.location_identifiers?.find(l => l.location_type === 'country')?.value;
              const region = lead.properties.location_identifiers?.find(l => l.location_type === 'region')?.value;
              const city = lead.properties.location_identifiers?.find(l => l.location_type === 'city')?.value;

              if (continent) {
                if (!newLocationHierarchy[continent]) newLocationHierarchy[continent] = {};
                if (country) {
                  if (!newLocationHierarchy[continent][country]) newLocationHierarchy[continent][country] = {};
                  if (region) {
                    if (!newLocationHierarchy[continent][country][region]) newLocationHierarchy[continent][country][region] = {};
                    if (city) {
                      if (!newLocationHierarchy[continent][country][region][city]) {
                        newLocationHierarchy[continent][country][region][city] = {};
                      }
                    }
                  }
                }
              }
            });
  
            setLocationHierarchy(newLocationHierarchy);
  
          } else {
            console.error('Lead data is not in a recognized array format:', rawData);
        }
      } catch (error) {
        console.error('Failed to load leads:', error);
      }
    };

    fetchLeads();

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
  }, []);
  
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    allLeads.forEach(lead => {
        lead.industry.split(',').forEach(cat => {
            const trimmedCat = cat.trim();
            if(trimmedCat) categories.add(trimmedCat);
        })
    })
    return Array.from(categories).sort();
  }, [allLeads]);

  const loadFromLocalStorage = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('truLeadAiLastUnearthDate');
    const savedCount = localStorage.getItem('truLeadAiUnearthedCount');
    const savedIds = localStorage.getItem('truLeadAiUnearthedIds');
    const savedLeads = localStorage.getItem('truLeadAiDisplayedLeads');

    if (savedDate === today) {
      if (savedCount) setUnearthedCount(parseInt(savedCount, 10));
      if (savedIds && savedIds !== 'undefined') {
          try {
              const parsedIds = JSON.parse(savedIds);
              if(Array.isArray(parsedIds)) {
                setUnearthedIds(new Set<string>(parsedIds));
              }
          } catch(e) {
              console.error("Failed to parse unearthed ids", e);
          }
      }
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
      localStorage.setItem('truLeadAiUnearthedIds', '[]');
      localStorage.setItem('truLeadAiDisplayedLeads', '[]');
      setUnearthedCount(0);
      setUnearthedIds(new Set());
      setDisplayedLeads([]);
    }
  }, []);

  useEffect(() => {
    if (allLeads.length > 0) {
      loadFromLocalStorage();
    }
  }, [allLeads, loadFromLocalStorage]);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => {
        const newFilters = {...prev, [filterType]: value};
        if (filterType === 'continent') {
            newFilters.country = '';
            newFilters.region = '';
            newFilters.city = '';
        } else if (filterType === 'country') {
            newFilters.region = '';
            newFilters.city = '';
        } else if (filterType === 'region') {
            newFilters.city = '';
        }
        return newFilters;
    });
  };
  
  const handleUnearth = useCallback(() => {
    if (isLoading || unearthedCount >= DAILY_LIMIT || allLeads.length === 0) return;
    setIsLoading(true);

    setTimeout(() => {
        const filteredLeads = allLeads.filter(lead => {
            const { continent, country, region, city, category } = filters;
            
            const hasLocation = (type: string, value: string) => 
                !value || lead.locations.some(l => l.location_type === type && l.value === value);

            const hasCategory = !category || lead.industry.toLowerCase().includes(category.toLowerCase());

            return hasLocation('continent', continent) &&
                   hasLocation('country', country) &&
                   hasLocation('region', region) &&
                   hasLocation('city', city) &&
                   hasCategory;
        });

      const availableLeads = filteredLeads.filter(lead => !unearthedIds.has(lead.id));
      const newLeadsBatch = [];
      const newIds = new Set(unearthedIds);

      for (let i = 0; i < BATCH_SIZE && availableLeads.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableLeads.length);
        const newLead = availableLeads.splice(randomIndex, 1)[0];
        
        if (newLead) {
          newLeadsBatch.push(newLead);
          newIds.add(newLead.id);
        }
      }

      const newTotalUnearthed = unearthedCount + newLeadsBatch.length;
      const newDisplayedLeads = [...newLeadsBatch, ...displayedLeads];
      
      setDisplayedLeads(newDisplayedLeads);
      setUnearthedIds(newIds);
      setUnearthedCount(newTotalUnearthed);
      
      localStorage.setItem('truLeadAiUnearthedCount', newTotalUnearthed.toString());
      localStorage.setItem('truLeadAiUnearthedIds', JSON.stringify(Array.from(newIds)));
      localStorage.setItem('truLeadAiDisplayedLeads', JSON.stringify(newDisplayedLeads));

      setIsLoading(false);
      setNotification(newLeadsBatch.length > 0 ? `${newLeadsBatch.length} new leads unearthed!` : 'No new leads found with current filters.');
    }, 1500);
  }, [allLeads, unearthedIds, unearthedCount, isLoading, filters, displayedLeads]);

  const updateLead = (leadId: string, updates: Partial<Lead>) => {
    const newDisplayedLeads = displayedLeads.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    );
    setDisplayedLeads(newDisplayedLeads);
    localStorage.setItem('truLeadAiDisplayedLeads', JSON.stringify(newDisplayedLeads));
  };

  const getFilteredLeads = () => {
    if (!filters.category) {
        return displayedLeads;
    }
    return displayedLeads.filter(lead => lead.industry.toLowerCase().includes(filters.category!.toLowerCase()));
  };
  
  const filteredLeads = getFilteredLeads();
  const isLimitReached = unearthedCount >= DAILY_LIMIT;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex-grow space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Lead Requests</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="min-w-[150px]">{req.category}</TableCell>
                        <TableCell>{req.continent}</TableCell>
                        <TableCell>{format(new Date(req.requestDate), 'PP')}</TableCell>
                        <TableCell>
                          {req.status === 'Ready' ? (
                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleFilterChange('category', req.category)}>
                                <Badge variant="default" className="cursor-pointer hover:bg-primary/80">
                                    {req.status}
                                </Badge>
                            </Button>
                          ) : (
                            <Badge variant={req.status === 'Processing' ? 'secondary' : 'outline'}>
                                {req.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No requests submitted yet.</TableCell>
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
                    category={filters.category}
                    categoryCount={filteredLeads.length}
                />
                
                <LeadFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    locationHierarchy={locationHierarchy}
                    allCategories={allCategories}
                />

                <UnearthButton
                    onClick={handleUnearth}
                    isLoading={isLoading}
                    isLimitReached={isLimitReached}
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
