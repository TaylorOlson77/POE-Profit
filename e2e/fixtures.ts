/**
 * Case data for the current journeys. A later spec passes its own object
 * into the same helpers. These values are the step files, not a rule inside
 * the page modules or the cleanup.
 */

/** Strategy the create, update, and delete pass creates and then removes. */
export const crudStrategy = {
  name: "POC Expedition Tablet Farming",
  game: "Path of Exile 2",
  description: "Tablet-focused expedition farming",
  mapNotes: "T16 waystones",
  mapCost: "2",
  lines: [
    {
      name: "Expedition Tablet",
      quantity: "2",
      unitCost: "100",
      modifierNotes: "remnants",
    },
    {
      name: "Temple Tablet",
      quantity: "1",
      unitCost: "10",
    },
  ],
} as const;

/**
 * Strategy that already has a session. The conflict pass confirms delete and
 * expects the row to stay. The session pass logs onto it and must leave the
 * listed session in place.
 */
export const strategyWithSessions = {
  name: "Expedition + Temple tablets (demo)",
  keepSessionIds: ["seed_map_session_poe2_expedition"],
} as const;

export const extrapolatedSession = {
  strategyName: strategyWithSessions.name,
  mapsCompleted: "40",
  mapCost: "2",
  divineRate: "200",
  sampleMaps: "10",
  sampleMinutes: "20",
  investment: [
    { name: "Expedition Tablet", quantity: "40", unit: "7" },
    { name: "Temple Tablet", quantity: "40", unit: "1" },
  ],
  revenue: [
    { category: "Currency", name: "Divine Orb", quantity: "7", unit: "200" },
    { category: "Currency", name: "Exalted Orb", quantity: "30", unit: "14" },
    {
      category: "Tablets",
      name: "Expedition Tablet",
      quantity: "60",
      unit: "5",
    },
  ],
} as const;
