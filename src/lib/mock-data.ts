
import type { Lead, LeadRequest } from './types';
import { faker } from '@faker-js/faker';

// A simple in-memory sequence to ensure unique company names per session
let companyNameCounter = 0;

export function generateMockLead(request: LeadRequest): Lead {
  companyNameCounter++;
  const companyName = `${faker.company.name()} ${faker.company.bsBuzz()} ${companyNameCounter}`;
  const website = `www.${companyName.toLowerCase().replace(/ /g, '').replace(/,/g, '')}.com`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const emailDomain = website.startsWith('www.') ? website.substring(4) : website;

  return {
    id: faker.string.uuid(),
    company: companyName,
    industry: request.category,
    location: `${faker.location.city()}, ${request.continent}`,
    locations: [
      { location_type: 'continent', value: request.continent, uuid: faker.string.uuid(), entity_def_id: 'location' },
      { location_type: 'country', value: faker.location.country(), uuid: faker.string.uuid(), entity_def_id: 'location' },
      { location_type: 'city', value: faker.location.city(), uuid: faker.string.uuid(), entity_def_id: 'location' },
    ],
    contactName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
    website: `https://${website}`,
    description: faker.company.catchPhrase(),
    phoneNumber: faker.phone.number(),
    linkedin: `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/ /g, '-')}`,
    facebook: null,
    postalCode: faker.location.zipCode(),
    foundedOn: faker.date.past({ years: 20 }).getFullYear().toString(),
    status: 'new',
    browsed: false,
    notes: '',
    nextTask: '',
    nextTaskDate: '',
    sourceRequestId: request.id,
  };
}
