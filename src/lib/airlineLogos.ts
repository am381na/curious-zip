// Airline branding colors, abbreviations, and logos for visual identification

export interface AirlineInfo {
  code: string;
  color: string;
  bgColor: string;
  logoUrl: string;
}

export const AIRLINE_INFO: Record<string, AirlineInfo> = {
  "American Airlines": {
    code: "AA",
    color: "#FFFFFF",
    bgColor: "#0078D2",
    logoUrl: "https://img.logo.dev/aa.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "United Airlines": {
    code: "UA",
    color: "#FFFFFF",
    bgColor: "#003087",
    logoUrl: "https://img.logo.dev/united.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "Delta Air Lines": {
    code: "DL",
    color: "#FFFFFF",
    bgColor: "#C8102E",
    logoUrl: "https://img.logo.dev/delta.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "JetBlue Airways": {
    code: "B6",
    color: "#FFFFFF",
    bgColor: "#0033A0",
    logoUrl: "https://img.logo.dev/jetblue.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "Alaska Airlines": {
    code: "AS",
    color: "#FFFFFF",
    bgColor: "#01426A",
    logoUrl: "https://img.logo.dev/alaskaair.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "Southwest Airlines": {
    code: "WN",
    color: "#111B40",
    bgColor: "#FFB612",
    logoUrl: "https://img.logo.dev/southwest.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "British Airways": {
    code: "BA",
    color: "#FFFFFF",
    bgColor: "#075AAA",
    logoUrl: "https://img.logo.dev/britishairways.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
  "Virgin Atlantic": {
    code: "VS",
    color: "#FFFFFF",
    bgColor: "#E10A0A",
    logoUrl: "https://img.logo.dev/virgin-atlantic.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png",
  },
};

export function getAirlineInfo(airline: string): AirlineInfo {
  const cleanAirline = airline.toLowerCase().replace(/\s+/g, '');
  return (
    AIRLINE_INFO[airline] || {
      code: airline.substring(0, 2).toUpperCase(),
      color: "#FFFFFF",
      bgColor: "#666666",
      logoUrl: `https://img.logo.dev/${cleanAirline}.com?token=pk_X-1uRvB5QpWljLvSm5K9uQ&size=32&format=png`,
    }
  );
}
