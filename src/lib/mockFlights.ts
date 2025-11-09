import { computeTCI } from "./scoring";

export interface Flight {
  origin: string;
  destination: string;
  airline: string;
  flightNumber: string;
  aircraftIcao: string;
  departTime: string;
  arriveTime: string;
  tci: number;
  bucket: "Smooth" | "Moderate" | "Turbulent" | "Avoid";
  breakdown: {
    aircraft: number;
    route: number;
    season: number;
    realtime: number;
  };
}

const airlines = [
  { code: "AA", name: "American Airlines" },
  { code: "UA", name: "United Airlines" },
  { code: "DL", name: "Delta Air Lines" },
  { code: "B6", name: "JetBlue Airways" },
  { code: "AS", name: "Alaska Airlines" },
  { code: "WN", name: "Southwest Airlines" },
];

const aircraftTypes = ["A350", "B789", "A321", "B738", "A333", "CRJ9", "B77W", "E175"];

export const mockFlights = (
  origin: string,
  destination: string,
  date: string
): Flight[] => {
  const flights: Flight[] = [];
  const baseDate = new Date(date);

  // Generate 6-8 flights
  const numFlights = 6 + Math.floor(Math.random() * 3);

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[i % airlines.length];
    const aircraftIcao = aircraftTypes[i % aircraftTypes.length];

    // Create departure time (6 AM to 10 PM, spaced every 45 min)
    const departHour = 6 + Math.floor((i * 45) / 60);
    const departMinute = (i * 45) % 60;
    const departDate = new Date(baseDate);
    departDate.setHours(departHour, departMinute, 0, 0);

    // Flight duration: 2-6 hours depending on distance
    const duration = 2 + Math.floor(Math.random() * 4);
    const arriveDate = new Date(departDate);
    arriveDate.setHours(arriveDate.getHours() + duration);

    // Compute TCI
    const scoring = computeTCI(aircraftIcao, origin, destination, date);

    flights.push({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      airline: airline.name,
      flightNumber: `${airline.code}${100 + i * 10}`,
      aircraftIcao,
      departTime: departDate.toISOString(),
      arriveTime: arriveDate.toISOString(),
      tci: scoring.tci,
      bucket: scoring.bucket,
      breakdown: scoring.breakdown,
    });
  }

  // Sort by TCI descending, then by departure time ascending
  return flights.sort((a, b) => {
    if (b.tci !== a.tci) return b.tci - a.tci;
    return new Date(a.departTime).getTime() - new Date(b.departTime).getTime();
  });
};
