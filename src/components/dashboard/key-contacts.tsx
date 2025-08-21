'use client';

import { useEffect, useState } from 'react';
import { findKeyContacts } from '@/ai/flows/find-key-contacts';
import type { Lead, KeyContact } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { UserSearch, Linkedin, Mail, Briefcase } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface KeyContactsProps {
  lead: Lead;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

export default function KeyContacts({ lead, onUpdateLead }: KeyContactsProps) {
  const [contacts, setContacts] = useState<KeyContact[] | null>(lead.keyContacts || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      // Only fetch if contacts haven't been fetched before.
      if (lead.keyContacts) {
          setContacts(lead.keyContacts);
          return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await findKeyContacts({
          company: lead.company,
          description: lead.description,
        });
        setContacts(result.contacts);
        // Persist the fetched contacts to the lead object
        onUpdateLead(lead.id, { keyContacts: result.contacts });
      } catch (e) {
        console.error('Failed to find key contacts:', e);
        setError('Could not find contacts at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  // We only want to run this when the lead ID changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id, lead.company, lead.description]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2"><UserSearch className="h-4 w-4 text-muted-foreground" /> AI Found Contacts</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
              </div>
          </div>
           <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
              </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <UserSearch className="h-5 w-5 flex-shrink-0 text-destructive" />
            <div className="flex-grow">
                <p className="font-semibold text-destructive">Key Contacts</p>
                <p className="text-foreground/80">{error}</p>
            </div>
        </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return null; // Don't render anything if there are no contacts to show
  }

  return (
    <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2"><UserSearch className="h-4 w-4 text-muted-foreground" /> AI Found Contacts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact, index) => (
            <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-primary/10">
                <p className="font-semibold text-primary">{contact.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="h-3 w-3" />{contact.title}</p>
                <div className="mt-2 space-y-1 text-xs">
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:underline">
                        <Mail className="h-3 w-3" /> {contact.email}
                    </a>
                    <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                        <Linkedin className="h-3 w-3" /> LinkedIn Profile
                    </a>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
}
