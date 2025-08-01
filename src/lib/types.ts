
export interface LocationIdentifier {
  location_type: string;
  value: string;
  uuid: string;
  entity_def_id: string;
}

export type LeadStatus = 'new' | 'high-potential' | 'follow-up' | 'not-connected';

export interface Lead {
  id: string;
  company: string;
  industry: string;
  location: string;
  locations: LocationIdentifier[];
  contactName: string;
  email: string;
  website: string;
  description: string;
  phoneNumber: string;
  linkedin: string | null;
  facebook: string | null;
  postalCode: string;
  foundedOn: string;
  status: LeadStatus;
  browsed: boolean;
  notes?: string;
  nextTask?: string;
  nextTaskDate?: string;
  sourceRequestId: string; 
}

export interface RawLead {
  uuid: string;
  properties: {
    identifier?: {
      value: string;
      permalink: string;
      uuid: string;
      entity_def_id: string;
    };
    short_description?: string;
    categories?: {
      value: string;
      uuid: string;
      entity_def_id: string;
    }[];
    location_identifiers?: LocationIdentifier[];
    contact_email?: string;
    website?: {
      value: string;
    };
    phone_number?: string;
    linkedin?: {
      value: string;
    };
    facebook?: {
      value: string;
    };
    hq_postal_code?: string;
    founded_on?: {
      value: string;
      precision: string;
    };
    [key: string]: any;
  };
}

export type LocationHierarchy = {
  [continent: string]: {
    [country: string]: {
      [region: string]: {
        [city: string]: {};
      };
    };
  };
};

export type LeadRequestStatus = 'Pending' | 'Processing' | 'Ready' | 'Completed';

export type LeadRequest = {
  id: string;
  category: string;
  continent: string;
  status: LeadRequestStatus;
  requestDate: string;
  leadCount: number; // Number of leads this request can yield
};

// This represents the curated feed for a user, which would be a separate data store in the future.
export type UserCuratedFeed = {
  [requestId: string]: Lead[];
}
