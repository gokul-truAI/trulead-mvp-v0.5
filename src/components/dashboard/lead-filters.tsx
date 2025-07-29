
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
import { Button } from '../ui/button';
import { X } from 'lucide-react';

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
  allCategories: string[];
}

const FilterSelect = ({
  placeholder,
  value,
  onValueChange,
  options,
  disabled = false,
}: {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) => (
  <div className="relative">
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {value && (
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full"
        onClick={(e) => {
            e.stopPropagation();
            onValueChange('');
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
);


export default function LeadFilters({
  filters,
  onFilterChange,
  locationHierarchy,
  allCategories,
}: LeadFiltersProps) {
  const continents = Object.keys(locationHierarchy).filter(c => c);
  const countries = filters.continent && locationHierarchy[filters.continent] ? Object.keys(locationHierarchy[filters.continent]).filter(c => c) : [];
  const regions = (filters.continent && filters.country && locationHierarchy[filters.continent]?.[filters.country]) ? Object.keys(locationHierarchy[filters.continent][filters.country]).filter(r => r) : [];
  const cities = (filters.continent && filters.country && filters.region && locationHierarchy[filters.continent]?.[filters.country]?.[filters.region]) ? Object.keys(locationHierarchy[filters.continent][filters.country][filters.region]).filter(c => c) : [];


  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
           <h4 className="text-sm font-medium text-muted-foreground">Filter Your Discovery by Location</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterSelect
                placeholder="Select Continent"
                value={filters.continent}
                onValueChange={(value) => onFilterChange('continent', value)}
                options={continents}
              />

              <FilterSelect
                placeholder="Select Country"
                value={filters.country}
                onValueChange={(value) => onFilterChange('country', value)}
                options={countries}
                disabled={!filters.continent}
              />

              <FilterSelect
                placeholder="Select Region"
                value={filters.region}
                onValueChange={(value) => onFilterChange('region', value)}
                options={regions}
                disabled={!filters.country}
              />
              
              <FilterSelect
                placeholder="Select City"
                value={filters.city}
                onValueChange={(value) => onFilterChange('city', value)}
                options={cities}
                disabled={!filters.region}
              />
           </div>
        </div>

        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Filter Your Discovery by Category</h4>
            <FilterSelect
                placeholder="Select Category"
                value={filters.category}
                onValueChange={(value) => onFilterChange('category', value)}
                options={allCategories}
            />
        </div>
      </CardContent>
    </Card>
  );
}
