// Airline branding colors and abbreviations for visual identification

export interface AirlineInfo {
  code: string;
  color: string;
  bgColor: string;
}

export const AIRLINE_INFO: Record<string, AirlineInfo> = {
  "American Airlines": {
    code: "AA",
    color: "#FFFFFF",
    bgColor: "#0078D2",
  },
  "United Airlines": {
    code: "UA",
    color: "#FFFFFF",
    bgColor: "#003087",
  },
  "Delta Air Lines": {
    code: "DL",
    color: "#FFFFFF",
    bgColor: "#C8102E",
  },
  "JetBlue Airways": {
    code: "B6",
    color: "#FFFFFF",
    bgColor: "#0033A0",
  },
  "Alaska Airlines": {
    code: "AS",
    color: "#FFFFFF",
    bgColor: "#01426A",
  },
  "Southwest Airlines": {
    code: "WN",
    color: "#111B40",
    bgColor: "#FFB612",
  },
  "British Airways": {
    code: "BA",
    color: "#FFFFFF",
    bgColor: "#075AAA",
  },
  "Virgin Atlantic": {
    code: "VS",
    color: "#FFFFFF",
    bgColor: "#E10A0A",
  },
};

export function getAirlineInfo(airline: string): AirlineInfo {
  return (
    AIRLINE_INFO[airline] || {
      code: airline.substring(0, 2).toUpperCase(),
      color: "#FFFFFF",
      bgColor: "#666666",
    }
  );
}
