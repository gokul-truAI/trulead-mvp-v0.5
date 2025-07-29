'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import type { Lead } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const COLORS = ['#4285F4', '#8E44AD', '#34A853', '#FBBC05', '#EA4335'];

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadRequests, setLeadRequests] = useState<any[]>([]);

  useEffect(() => {
    const savedLeads = localStorage.getItem('truLeadAiDisplayedLeads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    }
    const savedRequests = localStorage.getItem('truLeadAiLeadRequests');
    if (savedRequests) {
      setLeadRequests(JSON.parse(savedRequests));
    }
  }, []);

  const browsedCount = leads.filter(lead => lead.browsed).length;
  const pendingCount = leads.length - browsedCount;

  const statusData = [
    { name: 'High Potential', value: leads.filter(l => l.status === 'high-potential').length },
    { name: 'Need Follow-up', value: leads.filter(l => l.status === 'follow-up').length },
    { name: 'Not Connected', value: leads.filter(l => l.status === 'not-connected').length },
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
  ];

  const categoryRequestData = leadRequests.reduce((acc, req) => {
    const category = req.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1; // Assuming 1 request = 1 lead for simplicity
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryRequestData).map(([name, value]) => ({ name, value }));
  
  const browsedData = [
    { name: 'Browsed', value: browsedCount },
    { name: 'Pending', value: pendingCount }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Leads Requested</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{leadRequests.length}</p>
              <p className="text-sm text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Leads Browsed vs. Pending</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full h-48">
                    <ResponsiveContainer>
                        <PieChart>
                        <Pie data={browsedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                            {browsedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
          </Card>
           <Card className="lg:col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Lead Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#82ca9d" paddingAngle={5} label>
                       {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Leads Requested by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-72">
                <ResponsiveContainer>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Number of Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
             <CardHeader>
                <CardTitle>Quick Access</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-wrap gap-4">
                {categoryChartData.map(cat => (
                    <Link key={cat.name} href={`/?category=${cat.name}`} passHref>
                        <Button variant="outline">Browse '{cat.name}' Leads</Button>
                    </Link>
                ))}
             </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
