'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Header from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { LeadRequest } from '@/lib/types';
import Link from 'next/link';

type FormInputs = {
  category: string;
  continent: string;
};

const continents = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Australia', 'Antarctica'];

export default function RequestLeadsPage() {
  const { register, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm<FormInputs>();
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  useEffect(() => {
    const savedRequests = localStorage.getItem('truLeadAiLeadRequests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
    // Mock processing
    const interval = setInterval(() => {
      setRequests(prev => {
        const newRequests = prev.map(req => {
            if (req.status === 'Pending') return {...req, status: 'Processing' as const};
            if (req.status === 'Processing') return {...req, status: 'Ready' as const};
            return req;
        });
        localStorage.setItem('truLeadAiLeadRequests', JSON.stringify(newRequests));
        return newRequests;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    setIsSubmitting(true);
    setSubmissionMessage('');

    setTimeout(() => {
      const newRequest: LeadRequest = {
        id: new Date().getTime().toString(),
        category: data.category,
        continent: data.continent,
        status: 'Pending',
        requestDate: new Date().toISOString(),
      };
      
      const updatedRequests = [...requests, newRequest];
      setRequests(updatedRequests);
      localStorage.setItem('truLeadAiLeadRequests', JSON.stringify(updatedRequests));

      setIsSubmitting(false);
      setSubmissionMessage('Your lead request has been submitted successfully!');
      reset();
      setValue('continent', '');
      setTimeout(() => setSubmissionMessage(''), 3000);
    }, 1000);
  };
  
  const selectedContinent = watch('continent');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Request New Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Input id="category" {...register('category', { required: 'Category is required' })} placeholder="e.g., 'Software Development', 'Manufacturing'" />
                    {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Continental Region</label>
                    <Select onValueChange={(value) => setValue('continent', value, { shouldValidate: true })} value={selectedContinent}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a continent" />
                        </SelectTrigger>
                        <SelectContent>
                            {continents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <input type="hidden" {...register('continent', { required: 'Continent is required' })} />
                    {errors.continent && <p className="text-sm text-destructive">{errors.continent.message}</p>}
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  {submissionMessage && <p className="text-sm text-green-600 text-center">{submissionMessage}</p>}
                </form>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Track Your Requests</CardTitle>
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
                            <Link href={`/?category=${encodeURIComponent(req.category)}`}>
                                <Badge variant="default" className="cursor-pointer hover:bg-primary/80">
                                    {req.status}
                                </Badge>
                            </Link>
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
          </div>
        </div>
      </main>
    </div>
  );
}
