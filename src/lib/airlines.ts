// Airline branding colors and codes for visual identification

export interface AirlineInfo {
  code: string;
  fg: string;  // foreground/text color
  bg: string;  // background color
}

export const AIRLINE_INFO: Record<string, AirlineInfo> = {
  "American Airlines": {
    code: "AA",
    fg: "#FFFFFF",
    bg: "#0078D2",
  },
  "United Airlines": {
    code: "UA",
    fg: "#FFFFFF",
    bg: "#003087",
  },
  "Delta Air Lines": {
    code: "DL",
    fg: "#FFFFFF",
    bg: "#C8102E",
  },
  "JetBlue Airways": {
    code: "B6",
    fg: "#FFFFFF",
    bg: "#0033A0",
  },
  "Alaska Airlines": {
    code: "AS",
    fg: "#FFFFFF",
    bg: "#01426A",
  },
  "Southwest Airlines": {
    code: "WN",
    fg: "#111B40",
    bg: "#FFB612",
  },
  "British Airways": {
    code: "BA",
    fg: "#FFFFFF",
    bg: "#075AAA",
  },
  "Virgin Atlantic": {
    code: "VS",
    fg: "#FFFFFF",
    bg: "#E10A0A",
  },
};

export function lookupAirlineInfo(airline?: string): AirlineInfo {
  if (!airline) {
    return {
      code: "??",
      fg: "#FFFFFF",
      bg: "#666666",
    };
  }
  
  return (
    AIRLINE_INFO[airline] || {
      code: airline.substring(0, 2).toUpperCase(),
      fg: "#FFFFFF",
      bg: "#666666",
    }
  );
}
