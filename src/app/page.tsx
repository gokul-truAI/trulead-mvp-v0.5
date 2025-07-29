'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lead, RawLead, LocationHierarchy } from '@/lib/types';
import { BATCH_SIZE, DAILY_LIMIT } from '@/lib/constants';
import Header from '@/components/dashboard/header';
import ProgressMeter from '@/components/dashboard/progress-meter';
import UnearthButton from '@/components/dashboard/unearth-button';
import DiscoveryLog from '@/components/dashboard/discovery-log';
import LeadFilters from '@/components/dashboard/lead-filters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket } from 'lucide-react';
import { format } from 'date-fns';

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
  };
};

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [unearthedIds, setUnearthedIds] = useState<Set<string>>(new Set());
  const [unearthedCount, setUnearthedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter state
  const [locationHierarchy, setLocationHierarchy] = useState<LocationHierarchy>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    continent: '',
    country: '',
    region: '',
    city: '',
    category: '',
  });

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/data/leadseurope.json');
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const rawData = await response.json();

        if (Array.isArray(rawData)) {
            const mappedLeads = rawData.map(mapRawLeadToLead);
            setAllLeads(mappedLeads);
  
            // Extract filters
            const newLocationHierarchy: LocationHierarchy = {};
            const newCategories = new Set<string>();
  
            rawData.forEach(lead => {
              let currentLevel: any = newLocationHierarchy;
  
              const continent = lead.properties.location_identifiers?.find(l => l.location_type === 'continent')?.value;
              const country = lead.properties.location_identifiers?.find(l => l.location_type === 'country')?.value;
              const region = lead.properties.location_identifiers?.find(l => l.location_type === 'region')?.value;
              const city = lead.properties.location_identifiers?.find(l => l.location_type === 'city')?.value;

              if (continent) {
                if (!currentLevel[continent]) currentLevel[continent] = {};
                currentLevel = currentLevel[continent];
                if (country) {
                  if (!currentLevel[country]) currentLevel[country] = {};
                  currentLevel = currentLevel[country];
                   if (region) {
                    if (!currentLevel[region]) currentLevel[region] = {};
                    currentLevel = currentLevel[region];
                    if (city) {
                      if (!currentLevel[city]) currentLevel[city] = {};
                    }
                  }
                }
              }
  
              lead.properties.categories?.forEach(cat => {
                if (cat.value) {
                  newCategories.add(cat.value);
                }
              });
            });
  
            setLocationHierarchy(newLocationHierarchy);
            setCategories(Array.from(newCategories).sort());
  
          } else {
            console.error('Lead data is not in a recognized array format:', rawData);
          }
      } catch (error) {
        console.error('Failed to load leads:', error);
      }
    };

    fetchLeads();

    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('truLeadAiLastUnearthDate');
    const savedCount = localStorage.getItem('truLeadAiUnearthedCount');
    const savedIds = localStorage.getItem('truLeadAiUnearthedIds');

    if (savedDate === today) {
      const savedUnearthedCount = savedCount ? parseInt(savedCount, 10) : 0;
      const savedUnearthedIds = savedIds ? new Set<string>(JSON.parse(savedIds)) : new Set<string>();
      
      setUnearthedCount(savedUnearthedCount);
      setUnearthedIds(savedUnearthedIds);
      
      // Load previously displayed leads on page refresh
      if (allLeads.length > 0 && savedUnearthedIds.size > 0) {
        const previouslyUnearthed = allLeads.filter(lead => savedUnearthedIds.has(lead.id));
        setDisplayedLeads(previouslyUnearthed);
      }

    } else {
      localStorage.setItem('truLeadAiUnearthedCount', '0');
      localStorage.setItem('truLeadAiLastUnearthDate', today);
      localStorage.setItem('truLeadAiUnearthedIds', '[]');
      setUnearthedCount(0);
      setUnearthedIds(new Set());
    }
  }, [allLeads, unearthedIds, displayedLeads]);


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => {
        const newFilters = {...prev, [filterType]: value};
        // Reset dependent filters
        if (filterType === 'continent') {
            newFilters.country = '';
            newFilters.region = '';
            newFilters.city = '';
        }
        if (filterType === 'country') {
            newFilters.region = '';
            newFilters.city = '';
        }
        if (filterType === 'region') {
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

            const hasCategory = !category || lead.industry.includes(category);
            
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
      
      setDisplayedLeads((prev) => [...newLeadsBatch, ...prev]);
      setUnearthedIds(newIds);
      setUnearthedCount(newTotalUnearthed);
      
      localStorage.setItem('truLeadAiUnearthedCount', newTotalUnearthed.toString());
      localStorage.setItem('truLeadAiUnearthedIds', JSON.stringify(Array.from(newIds)));

      setIsLoading(false);
      setNotification(newLeadsBatch.length > 0 ? `${newLeadsBatch.length} new leads unearthed!` : 'No new leads found with current filters.');
    }, 1500);
  }, [allLeads, unearthedIds, unearthedCount, isLoading, filters]);
  
  const isLimitReached = unearthedCount >= DAILY_LIMIT;

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
          <ProgressMeter unearthed={unearthedCount} limit={DAILY_LIMIT} />
          
          <LeadFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            locationHierarchy={locationHierarchy}
            categories={categories}
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
        <div className="w-full max-w-4xl mx-auto flex-grow mt-8">
            <DiscoveryLog leads={displayedLeads} />
        </div>
      </main>
    </div>
  );
}
