
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Lead } from '@/lib/types';
import { BATCH_SIZE, DAILY_LIMIT } from '@/lib/constants';
import { locations } from '@/lib/locations';
import Header from '@/components/dashboard/header';
import ProgressMeter from '@/components/dashboard/progress-meter';
import UnearthButton from '@/components/dashboard/unearth-button';
import DiscoveryLog from '@/components/dashboard/discovery-log';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  const industries = useMemo(() => {
    const allIndustries = allLeads.map(lead => lead.industry).filter(Boolean);
    return [...new Set(allIndustries)].sort();
  }, [allLeads]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/data/leads.json');
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const rawData = await response.json();
        if (rawData && Array.isArray(rawData.leads)) {
          const mappedLeads = rawData.leads.map(mapRawLeadToLead);
          setAllLeads(mappedLeads);
        } else {
          throw new Error('Lead data is not in the expected format');
        }
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
      const filteredLeads = allLeads.filter(lead => {
        const locationParts = lead.location.split(', ').map(p => p.trim());
        const leadCity = locationParts[0];
        const leadState = locationParts.length > 1 ? locationParts[1] : undefined;
        const leadCountry = locationParts.length > 2 ? locationParts[2] : undefined;

        const countryMatch = !selectedCountry || (leadCountry && leadCountry === selectedCountry);
        const stateMatch = !selectedState || (leadState && leadState === selectedState);
        const cityMatch = !selectedCity || (leadCity && leadCity === selectedCity);
        const industryMatch = !selectedIndustry || lead.industry === selectedIndustry;

        return countryMatch && stateMatch && cityMatch && industryMatch;
      });

      const availableIndices = filteredLeads
        .map((_, index) => index)
        .filter((index) => !unearthedIndices.has(index));

      const newLeads: Lead[] = [];
      const newIndices = new Set(unearthedIndices);

      for (let i = 0; i < BATCH_SIZE && availableIndices.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const leadIndex = availableIndices.splice(randomIndex, 1)[0];
        
        if (leadIndex !== undefined) {
          newLeads.push(filteredLeads[leadIndex]);
          newIndices.add(leadIndex);
        }
      }

      const newTotalUnearthed = unearthedCount + newLeads.length;
      
      setDisplayedLeads((prev) => [...newLeads, ...prev]);
      setUnearthedIndices(newIndices);
      setUnearthedCount(newTotalUnearthed);
      
      localStorage.setItem('truLeadAiUnearthedCount', newTotalUnearthed.toString());

      setIsLoading(false);
      setNotification(newLeads.length > 0 ? `${newLeads.length} new leads unearthed!` : 'No new leads found matching your criteria.');
    }, 1500);
  }, [allLeads, unearthedIndices, unearthedCount, isLoading, selectedCountry, selectedState, selectedCity, selectedIndustry]);
  
  const isLimitReached = unearthedCount >= DAILY_LIMIT;

  const countries = selectedRegion ? locations[selectedRegion].countries : [];
  const states = selectedCountry ? countries.find(c => c.name === selectedCountry)?.states : [];
  const cities = selectedState ? states?.find(s => s.name === selectedState)?.cities : [];

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedState('');
    setSelectedCity('');
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity('');
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
          <Card className="w-full">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Location Filters */}
                <div className="space-y-1">
                  <Label htmlFor="region">Region</Label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger id="region"><SelectValue placeholder="Select Region" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(locations).map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={!selectedRegion}>
                    <SelectTrigger id="country"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.name} value={country.name}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Select value={selectedState} onValueChange={handleStateChange} disabled={!selectedCountry}>
                    <SelectTrigger id="state"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent>
                      {states?.map(state => (
                        <SelectItem key={state.name} value={state.name}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                    <SelectTrigger id="city"><SelectValue placeholder="Select City" /></SelectTrigger>
                    <SelectContent>
                      {cities?.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Industry Filter */}
                <div className="space-y-1">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger id="industry"><SelectValue placeholder="Select Industry" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
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

    