
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { LocationHierarchy } from '@/lib/types';

interface LeadFiltersProps {
  filters: {
    continent: string;
    country: string;
    region: string;
    city: string;
    category: string;
  };
  onFilterChange: (filterType: keyof LeadFiltersProps['filters'], value: string) => void;
  locationHierarchy: LocationHierarchy;
  categories: string[];
}

export default function LeadFilters({
  filters,
  onFilterChange,
  locationHierarchy,
  categories,
}: LeadFiltersProps) {
  const continents = Object.keys(locationHierarchy);
  const countries = filters.continent ? Object.keys(locationHierarchy[filters.continent]) : [];
  const regions = (filters.continent && filters.country && locationHierarchy[filters.continent]?.[filters.country]) ? Object.keys(locationHierarchy[filters.continent][filters.country]) : [];
  const cities = (filters.continent && filters.country && filters.region && locationHierarchy[filters.continent]?.[filters.country]?.[filters.region]) ? Object.keys(locationHierarchy[filters.continent][filters.country][filters.region]) : [];


  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 col-span-1 md:col-span-3">
             <h4 className="text-sm font-medium text-muted-foreground">Filter Your Discovery</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.continent} onValueChange={(value) => onFilterChange('continent', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Continent" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Continents</SelectItem>
                        {continents.map((continent) => (
                        <SelectItem key={continent} value={continent}>
                            {continent}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.country} onValueChange={(value) => onFilterChange('country', value)} disabled={!filters.continent}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Countries</SelectItem>
                        {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                            {country}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.region} onValueChange={(value) => onFilterChange('region', value)} disabled={!filters.country}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Regions</SelectItem>
                        {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                            {region}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.city} onValueChange={(value) => onFilterChange('city', value)} disabled={!filters.region}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Cities</SelectItem>
                        {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                            {city}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
