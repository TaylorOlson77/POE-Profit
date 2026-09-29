import type { Game } from "@/src/contracts/strategies";

export type StrategyLabels = {
  gameName: string;
  mapNoun: string;
  mapsNoun: string;
  mapCost: string;
  mapNotes: string;
  costPer: string;
  enhancement: string;
  enhancementSingular: string;
  showModifierNotes: boolean;
  showUses: boolean;
};

const POE2_LABELS: StrategyLabels = {
  gameName: "Path of Exile 2",
  mapNoun: "Waystone",
  mapsNoun: "Waystones",
  mapCost: "Waystone cost (chaos)",
  mapNotes: "Waystone notes",
  costPer: "Estimated cost per waystone",
  enhancement: "Tablets",
  enhancementSingular: "Tablet",
  showModifierNotes: true,
  showUses: true,
};

const POE1_LABELS: StrategyLabels = {
  gameName: "Path of Exile 1",
  mapNoun: "Map",
  mapsNoun: "Maps",
  mapCost: "Map cost (chaos)",
  mapNotes: "Map notes",
  costPer: "Estimated cost per map",
  enhancement: "Scarabs",
  enhancementSingular: "Scarab",
  showModifierNotes: false,
  showUses: false,
};

export function strategyLabels(game: Game): StrategyLabels {
  return game === "POE1" ? POE1_LABELS : POE2_LABELS;
}
