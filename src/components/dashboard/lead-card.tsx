
import type { Lead } from '@/lib/types';
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
    Phone, Linkedin, Facebook, Calendar, Pin
} from 'lucide-react';
import AiInsight from './ai-insight';

interface LeadCardProps {
  lead: Lead;
  animationStyle: React.CSSProperties;
}

const SocialLink = ({ href, icon, label }: { href: string | null; icon: React.ReactNode; label: string }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
      {icon} {label}
    </a>
  );
};


export default function LeadCard({ lead, animationStyle }: LeadCardProps) {
  const preventAction = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault();
    return false;
  };
  
  return (
    <div style={animationStyle} className="animate-fade-in opacity-0" onCopy={preventAction} onContextMenu={preventAction}>
      <Card className="user-select-none shadow-md hover:shadow-xl transition-shadow duration-300">
        <Accordion type="single" collapsible>
          <AccordionItem value={lead.id} className="border-b-0">
            <AccordionTrigger className="p-4 hover:no-underline">
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-primary">{lead.company}</h3>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                  <Badge variant="secondary"><Briefcase className="mr-1 h-3 w-3" />{lead.industry}</Badge>
                  <Badge variant="secondary"><MapPin className="mr-1 h-3 w-3" />{lead.location}</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                
                <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="font-medium whitespace-nowrap">Description:</span> 
                    <p className="flex-1 text-foreground/80">{lead.description}</p>
                </div>
                
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Email:</span> <span className="text-foreground/80">{lead.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Phone:</span> <span className="text-foreground/80">{lead.phoneNumber}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Founded:</span> <span className="text-foreground/80">{lead.foundedOn}</span></div>
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
