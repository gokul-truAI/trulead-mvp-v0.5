'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { LeadRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { generateAnalyticsInsight } from '@/ai/flows/generate-lead-insight';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

export default function AdminPage() {
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [analyticsInsight, setAnalyticsInsight] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('truLeadAiUserRole');
    if (role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  const fetchRequests = () => {
    const savedRequestsJSON = localStorage.getItem('truLeadAiLeadRequests');
    if (savedRequestsJSON && savedRequestsJSON !== 'undefined') {
      try {
        const parsedRequests = JSON.parse(savedRequestsJSON);
        if (Array.isArray(parsedRequests)) {
          setRequests(parsedRequests);
          return parsedRequests;
        }
      } catch (e) {
        console.error("Failed to parse requests from localStorage", e);
      }
    }
    return [];
  };

  useEffect(() => {
    const allRequests = fetchRequests();
    if (allRequests.length > 0) {
        setIsInsightLoading(true);
        generateAnalyticsInsight({ requests: allRequests })
            .then(result => setAnalyticsInsight(result.insight))
            .catch(err => {
                console.error("Failed to get analytics insight", err);
                setAnalyticsInsight("Could not generate analytics insight at this time.");
            })
            .finally(() => setIsInsightLoading(false));
    } else {
        setIsInsightLoading(false);
        setAnalyticsInsight("No requests have been submitted yet. Insights will appear here once there is data to analyze.");
    }
  }, []);

  const handleApproveRequest = (requestId: string) => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        return { ...req, status: 'Processing' as const };
      }
      return req;
    });
    setRequests(updatedRequests);
    localStorage.setItem('truLeadAiLeadRequests', JSON.stringify(updatedRequests));
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const otherRequests = requests.filter(r => r.status !== 'Pending');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Lead Requests</CardTitle>
                <CardDescription>Approve new requests to make them available to users.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.category}</TableCell>
                        <TableCell>{req.continent}</TableCell>
                        <TableCell>{format(new Date(req.requestDate), 'PP')}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleApproveRequest(req.id)}>
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No pending requests.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>AI Analytics Insight</CardTitle>
                    <CardDescription>An AI-powered analysis of user request trends.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isInsightLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                       <div className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg">
                         <Lightbulb className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                         <p className="text-sm text-foreground/90">{analyticsInsight}</p>
                       </div>
                    )}
                </CardContent>
             </Card>
          </div>
           <div className="lg:col-span-3">
             <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>All previously approved and processed requests.</CardDescription>
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
                    {otherRequests.length > 0 ? otherRequests.map((req) => (
                      <TableRow key={req.id} className="opacity-70">
                        <TableCell>{req.category}</TableCell>
                        <TableCell>{req.continent}</TableCell>
                        <TableCell>{format(new Date(req.requestDate), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'Ready' ? 'default' : 'secondary'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No processed requests yet.</TableCell>
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
