
import type { Lead, LeadRequest } from './types';
import { faker } from '@faker-js/faker';
import { locations } from './locations';

// A simple in-memory sequence to ensure unique company names per session
let companyNameCounter = 0;

export function generateMockLead(request: LeadRequest): Lead {
  companyNameCounter++;
  const companyName = `${faker.company.name()} ${faker.company.bsBuzz()} ${companyNameCounter}`;
  const website = `www.${companyName.toLowerCase().replace(/ /g, '').replace(/,/g, '')}.com`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const emailDomain = website.startsWith('www.') ? website.substring(4) : website;

  // Get location data based on the request's continent
  const continentData = locations[request.continent];
  const randomCountry = continentData ? faker.helpers.arrayElement(continentData.countries) : { name: 'N/A', cities: ['N/A'] };
  const randomCity = faker.helpers.arrayElement(randomCountry.cities);
  const locationString = `${randomCity}, ${randomCountry.name}`;

  return {
    id: faker.string.uuid(),
    company: companyName,
    industry: request.category,
    location: locationString,
    locations: [
      { location_type: 'continent', value: request.continent, uuid: faker.string.uuid(), entity_def_id: 'location' },
      { location_type: 'country', value: randomCountry.name, uuid: faker.string.uuid(), entity_def_id: 'location' },
      { location_type: 'city', value: randomCity, uuid: faker.string.uuid(), entity_def_id: 'location' },
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
