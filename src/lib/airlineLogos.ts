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
    logoUrl: "https://logo.clearbit.com/aa.com",
  },
  "United Airlines": {
    code: "UA",
    color: "#FFFFFF",
    bgColor: "#003087",
    logoUrl: "https://logo.clearbit.com/united.com",
  },
  "Delta Air Lines": {
    code: "DL",
    color: "#FFFFFF",
    bgColor: "#C8102E",
    logoUrl: "https://logo.clearbit.com/delta.com",
  },
  "JetBlue Airways": {
    code: "B6",
    color: "#FFFFFF",
    bgColor: "#0033A0",
    logoUrl: "https://logo.clearbit.com/jetblue.com",
  },
  "Alaska Airlines": {
    code: "AS",
    color: "#FFFFFF",
    bgColor: "#01426A",
    logoUrl: "https://logo.clearbit.com/alaskaair.com",
  },
  "Southwest Airlines": {
    code: "WN",
    color: "#111B40",
    bgColor: "#FFB612",
    logoUrl: "https://logo.clearbit.com/southwest.com",
  },
  "British Airways": {
    code: "BA",
    color: "#FFFFFF",
    bgColor: "#075AAA",
    logoUrl: "https://logo.clearbit.com/britishairways.com",
  },
  "Virgin Atlantic": {
    code: "VS",
    color: "#FFFFFF",
    bgColor: "#E10A0A",
    logoUrl: "https://logo.clearbit.com/virgin-atlantic.com",
  },
};

export function getAirlineInfo(airline: string): AirlineInfo {
  return (
    AIRLINE_INFO[airline] || {
      code: airline.substring(0, 2).toUpperCase(),
      color: "#FFFFFF",
      bgColor: "#666666",
      logoUrl: `https://logo.clearbit.com/${airline.toLowerCase().replace(/\s+/g, '')}.com`,
    }
  );
}
