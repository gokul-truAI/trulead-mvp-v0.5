
'use client';

import { useState } from 'react';
import type { Lead, LeadStatus } from '@/lib/types';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Building2, Briefcase, MapPin, Mail, Link as LinkIcon, FileText,
    Phone, Linkedin, Facebook, Calendar as CalendarIcon, Pin, Star, Repeat, XCircle, CheckCircle, Save, CalendarPlus, Pencil, Clock
} from 'lucide-react';
import AiInsight from './ai-insight';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  animationStyle: React.CSSProperties;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

const SocialLink = ({ href, icon, label }: { href: string | null; icon: React.ReactNode; label: string }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
      {icon} {label}
    </a>
  );
};

const StatusBadge = ({ status }: { status: LeadStatus }) => {
    const statusMap = {
        'new': { label: 'New', icon: <Star className="h-3 w-3" />, variant: 'secondary' as const },
        'high-potential': { label: 'High Potential', icon: <CheckCircle className="h-3 w-3" />, variant: 'default' as const },
        'follow-up': { label: 'Need Follow-up', icon: <Repeat className="h-3 w-3" />, variant: 'outline' as const },
        'not-connected': { label: 'Not Connected', icon: <XCircle className="h-3 w-3" />, variant: 'destructive' as const },
    };
    const currentStatus = statusMap[status];

    return <Badge variant={currentStatus.variant}>{currentStatus.icon}<span className="ml-1">{currentStatus.label}</span></Badge>
}


export default function LeadCard({ lead, animationStyle, onUpdateLead }: LeadCardProps) {
  const [notes, setNotes] = useState(lead.notes || '');
  const [nextTask, setNextTask] = useState(lead.nextTask || '');
  const [nextTaskDate, setNextTaskDate] = useState<Date | undefined>(
    lead.nextTaskDate ? new Date(lead.nextTaskDate) : undefined
  );
  
  const preventAction = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleStatusChange = (e: React.MouseEvent, newStatus: LeadStatus) => {
    e.stopPropagation(); // prevent accordion from toggling
    onUpdateLead(lead.id, { status: newStatus });
  }

  const handleAccordionToggle = (isOpen: boolean) => {
    if (isOpen && !lead.browsed) {
      onUpdateLead(lead.id, { browsed: true });
    }
  };

  const handleSaveChanges = (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpdateLead(lead.id, {
          notes,
          nextTask,
          nextTaskDate: nextTaskDate?.toISOString()
      });
  }
  
  return (
    <div style={animationStyle} className="animate-fade-in opacity-0" onCopy={preventAction} onContextMenu={preventAction}>
      <Card className={cn("user-select-none shadow-md hover:shadow-xl transition-all duration-300", lead.browsed && "opacity-70 blur-[0.5px]")}>
        <Accordion type="single" collapsible onValueChange={(value) => handleAccordionToggle(!!value)}>
          <AccordionItem value={lead.id} className="border-b-0">
            <AccordionTrigger className="p-4 hover:no-underline">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-4">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg text-primary truncate">{lead.company}</h3>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end flex-shrink-0">
                  <StatusBadge status={lead.status} />
                  <Badge variant="secondary" className="whitespace-nowrap"><Briefcase className="mr-1 h-3 w-3 flex-shrink-0" />{lead.industry}</Badge>
                  <Badge variant="secondary" className="whitespace-nowrap"><MapPin className="mr-1 h-3 w-3 flex-shrink-0" />{lead.location}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0 space-y-6">
                <div className="border-t pt-4 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium mr-2">Mark as:</p>
                    <Button size="sm" variant="outline" onClick={(e) => handleStatusChange(e, 'high-potential')}><CheckCircle className="mr-2 h-4 w-4" />High Potential</Button>
                    <Button size="sm" variant="outline" onClick={(e) => handleStatusChange(e, 'follow-up')}><Repeat className="mr-2 h-4 w-4" />Need Follow-up</Button>
                    <Button size="sm" variant="outline" onClick={(e) => handleStatusChange(e, 'not-connected')}><XCircle className="mr-2 h-4 w-4" />Not Connected</Button>
                </div>
              
              {lead.nextTask && lead.nextTaskDate && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-primary flex items-center gap-2"><Clock className="h-4 w-4" />Next Action</h4>
                    <p className="text-foreground/90 pl-6">{lead.nextTask}</p>
                    <p className="text-xs text-muted-foreground pl-6">Due: {format(new Date(lead.nextTaskDate), 'PPP')}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                
                <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">Description:</span> 
                    <p className="flex-1 text-foreground/80">{lead.description}</p>
                </div>
                
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Email:</span> <span className="text-foreground/80 truncate">{lead.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Phone:</span> <span className="text-foreground/80 truncate">{lead.phoneNumber}</span></div>
                <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Founded:</span> <span className="text-foreground/80">{lead.foundedOn}</span></div>
                <div className="flex items-center gap-2"><Pin className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Postal Code:</span> <span className="text-foreground/80">{lead.postalCode}</span></div>

                <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Website:</span> 
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{lead.website}</a>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center gap-4">
                    <SocialLink href={lead.linkedin} icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
                    <SocialLink href={lead.facebook} icon={<Facebook className="h-4 w-4" />} label="Facebook" />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                    <h4 className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Location Details</h4>
                    <div className="pl-6 text-foreground/80">
                        {lead.locations.map(loc => (
                            <div key={loc.uuid} className="capitalize">
                                <span className="font-semibold">{loc.location_type}:</span> {loc.value}
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                 <div className="col-span-1 md:col-span-2 space-y-2">
                    <h4 className="font-medium flex items-center gap-2"><Pencil className="h-4 w-4 text-muted-foreground" /> Your Notes</h4>
                    <Textarea 
                        placeholder="Add your notes about this lead..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-background"
                    />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <h4 className="font-medium flex items-center gap-2"><CalendarPlus className="h-4 w-4 text-muted-foreground" /> Set Next Task & Reminder</h4>
                     <Input 
                        placeholder="e.g., 'Follow-up call with marketing manager'"
                        value={nextTask}
                        onChange={(e) => setNextTask(e.target.value)}
                        className="bg-background"
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !nextTaskDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {nextTaskDate ? format(nextTaskDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={nextTaskDate}
                            onSelect={setNextTaskDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end">
                    <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Save Notes & Task</Button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <AiInsight lead={lead} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
