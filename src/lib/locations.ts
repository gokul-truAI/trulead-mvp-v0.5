
type LocationData = {
  [continent: string]: {
    countries: {
      name: string;
      cities: string[];
    }[];
  };
};

export const locations: LocationData = {
  "North America": {
    countries: [
      { name: "USA", cities: ["New York", "San Francisco", "Austin", "Chicago", "Seattle"] },
      { name: "Canada", cities: ["Toronto", "Vancouver", "Montreal"] },
    ]
  },
  "South America": {
    countries: [
        { name: "Brazil", cities: ["São Paulo", "Rio de Janeiro"] },
        { name: "Argentina", cities: ["Buenos Aires"] },
    ]
  },
  "Europe": {
    countries: [
      { name: "United Kingdom", cities: ["London", "Manchester", "Edinburgh"] },
      { name: "Germany", cities: ["Berlin", "Munich", "Hamburg"] },
      { name: "France", cities: ["Paris", "Lyon", "Marseille"] },
    ],
  },
  "Asia": {
      countries: [
          { name: "Japan", cities: ["Tokyo", "Osaka"]},
          { name: "Singapore", cities: ["Singapore"]},
          { name: "India", cities: ["Bangalore", "Mumbai"]},
      ]
  },
  "Africa": {
      countries: [
          { name: "South Africa", cities: ["Cape Town", "Johannesburg"]},
          { name: "Nigeria", cities: ["Lagos"]},
          { name: "Kenya", cities: ["Nairobi"]},
      ]
  },
  "Australia": {
      countries: [
          { name: "Australia", cities: ["Sydney", "Melbourne", "Brisbane"]},
      ]
  }
};
