// Map common aircraft families to a short, passenger-facing note.
// Fallback is a neutral statement.

const FAMILY_NOTES: Record<string, string> = {
  A350: "A350 airframe dampens vibration well; one of the smoothest long-haul aircraft.",
  B787: "787 reduces felt bumpiness and cabin fatigue on long flights.",
  B777: "Heavy airframe smooths bumps, though not as soft as A350/787.",
  A330: "Generally stable ride; less wing flex than newer designs.",
  A340: "Stable wide-body ride; older damping tech but balanced.",
  A320: "Narrow-body; bumps can feel more noticeable on longer segments.",
  B737: "Narrow-body; bumps can feel more noticeable on longer segments.",
  B767: "Older wide-body; typically stable but less refined than newer models.",
  B757: "Narrow-body with powerful wings; can feel chop on long segments.",
  E190: "Regional jet; lighter airframe tends to transmit bumps more."
};

function normalize(typeOrIcao: string): string {
  const s = (typeOrIcao || "").toUpperCase();
  // Try family prefixes by common patterns
  if (s.startsWith("A35")) return "A350";
  if (s.startsWith("B78")) return "B787";
  if (s.startsWith("B77")) return "B777";
  if (s.startsWith("A33")) return "A330";
  if (s.startsWith("A34")) return "A340";
  if (s.startsWith("A32")) return "A320";
  if (s.startsWith("B73")) return "B737";
  if (s.startsWith("B76")) return "B767";
  if (s.startsWith("B75")) return "B757";
  if (s.startsWith("E19") || s.startsWith("E90")) return "E190";
  // If already a clean family string:
  if (FAMILY_NOTES[s]) return s;
  return "";
}

export function aircraftNote(typeOrIcao: string): string {
  const fam = normalize(typeOrIcao);
  if (fam && FAMILY_NOTES[fam]) return FAMILY_NOTES[fam];
  return "Ride quality varies by airframe and loading; newer wide-bodies tend to feel smoother.";
}
