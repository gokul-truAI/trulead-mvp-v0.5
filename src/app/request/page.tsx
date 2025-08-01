
'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Header from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { LeadRequest, UserCuratedFeed, Lead } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateMockLead } from '@/lib/mock-data';

type FormInputs = {
  category: string;
  continent: string;
};

const continents = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Australia', 'Antarctica'];
const leadsPerRequest = 50; // Each approved request yields 50 leads for the user's feed.

export default function RequestLeadsPage() {
  const { register, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm<FormInputs>();
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('truLeadAiUserRole');
    if (role !== 'user') {
      router.push('/');
    }
  }, [router]);
  
  useEffect(() => {
    const savedRequestsJSON = localStorage.getItem('truLeadAiLeadRequests');
    if (savedRequestsJSON && savedRequestsJSON !== 'undefined') {
        try {
            const allRequests = JSON.parse(savedRequestsJSON);
            if (Array.isArray(allRequests)) {
                setRequests(allRequests);
            }
        } catch(e) {
            console.error("Failed to parse requests", e)
        }
    }
    
    // This interval mocks the backend curation job.
    // When an admin approves a request, its status becomes 'Processing'.
    // This job finds 'Processing' requests, generates their leads, and sets them to 'Ready'.
    const interval = setInterval(() => {
      let requestsUpdated = false;
      const allRequests = JSON.parse(localStorage.getItem('truLeadAiLeadRequests') || '[]') as LeadRequest[];
      const curatedFeedJSON = localStorage.getItem('truLeadAiCuratedFeed');
      const curatedFeed: UserCuratedFeed = curatedFeedJSON ? JSON.parse(curatedFeedJSON) : {};
      
      const newRequests = allRequests.map(req => {
          if (req.status === 'Processing') {
              console.log(`Processing request ${req.id} for category ${req.category}`);
              requestsUpdated = true;

              // Simulate lead generation for this request
              const newLeads: Lead[] = [];
              for (let i = 0; i < req.leadCount; i++) {
                newLeads.push(generateMockLead(req));
              }
              curatedFeed[req.id] = newLeads;
              
              return {...req, status: 'Ready' as const};
          }
          return req;
      });

      if (requestsUpdated) {
        localStorage.setItem('truLeadAiLeadRequests', JSON.stringify(newRequests));
        localStorage.setItem('truLeadAiCuratedFeed', JSON.stringify(curatedFeed));
        setRequests(newRequests);
      }
    }, 5000); // Check for processing requests every 5 seconds.

    return () => clearInterval(interval);
  }, []);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    setIsSubmitting(true);
    setSubmissionMessage('');

    setTimeout(() => {
      const currentRequestsJSON = localStorage.getItem('truLeadAiLeadRequests');
      const currentRequests: LeadRequest[] = (currentRequestsJSON && currentRequestsJSON !== 'undefined') ? JSON.parse(currentRequestsJSON) : [];

      const newRequest: LeadRequest = {
        id: new Date().getTime().toString(),
        category: data.category,
        continent: data.continent,
        status: 'Pending',
        requestDate: new Date().toISOString(),
        leadCount: leadsPerRequest
      };
      
      const updatedRequests = [...currentRequests, newRequest];
      setRequests(updatedRequests);
      localStorage.setItem('truLeadAiLeadRequests', JSON.stringify(updatedRequests));

      setIsSubmitting(false);
      setSubmissionMessage('Your lead request has been submitted for approval!');
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
                <CardDescription>Submit a request for a new lead category. It will require admin approval.</CardDescription>
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
                    {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
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
                 <CardDescription>Your request history and status.</CardDescription>
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
                            <Link href={`/leads?request_id=${encodeURIComponent(req.id)}`}>
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
                        <TableCell colSpan={4} className="text-center">Submit a request to get started.</TableCell>
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
