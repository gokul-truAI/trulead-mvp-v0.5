
type LocationData = {
  [region: string]: {
    countries: {
      name: string;
      states: {
        name: string;
        cities: string[];
      }[];
    }[];
  };
};

export const locations: LocationData = {
  "US": {
    countries: [
      {
        name: "United States",
        states: [
          { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego"] },
          { name: "New York", cities: ["New York City", "Buffalo", "Rochester"] },
          { name: "Texas", cities: ["Houston", "Austin", "Dallas"] },
        ],
      },
    ],
  },
  "Europe": {
    countries: [
      {
        name: "United Kingdom",
        states: [
          { name: "England", cities: ["London", "Manchester", "Birmingham"] },
          { name: "Scotland", cities: ["Edinburgh", "Glasgow"] },
        ],
      },
      {
        name: "Germany",
        states: [
          { name: "Berlin", cities: ["Berlin"] },
          { name: "Bavaria", cities: ["Munich", "Nuremberg"] },
        ],
      },
       {
        name: "France",
        states: [
          { name: "Île-de-France", cities: ["Paris"] },
          { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice"] },
        ],
      },
    ],
  },
};

    