import { z } from "zod";

/**
 * Free-text abuse caps (ADR-007). Names and categories are short labels.
 * Notes and descriptions are the long fields. Length is JavaScript string
 * length (UTF-16 code units), which is what Zod `.max()` counts.
 */
export const MAX_NAME_LENGTH = 120;
export const MAX_NOTES_LENGTH = 2_000;

/** Required name or revenue category. */
export const NameSchema = z.string().min(1).max(MAX_NAME_LENGTH);

/** Required strategy description. */
export const DescriptionSchema = z.string().min(1).max(MAX_NOTES_LENGTH);

/** Optional map notes, modifier notes, or session notes. Empty is allowed. */
export const OptionalNotesSchema = z.string().max(MAX_NOTES_LENGTH).optional();
