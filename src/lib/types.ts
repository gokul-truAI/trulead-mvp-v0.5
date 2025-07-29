
export interface LocationIdentifier {
  location_type: string;
  value: string;
  uuid: string;
  entity_def_id: string;
}

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
