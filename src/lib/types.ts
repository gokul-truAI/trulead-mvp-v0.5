export interface Lead {
  id: string;
  company: string;
  industry: string;
  location: string;
  contactName: string;
  email: string;
  website: string;
  description: string;
}

export interface RawLead {
  uuid: string;
  properties: {
    identifier?: {
      value: string;
    };
    short_description?: string;
    categories?: {
      value: string;
    }[];
    location_identifiers?: {
      location_type: string;
      value: string;
    }[];
    contact_email?: string;
    website?: {
      value: string;
    };
    [key: string]: any;
  };
}
