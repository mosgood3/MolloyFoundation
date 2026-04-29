// utils/validators.ts
import { z } from "zod";

export const tshirtSizes = ["S", "M", "L", "XL", "XXL"] as const;
export const divisions = ["Competitive", "Casual"] as const;

export const playerSchema = z.object({
  name: z.string().min(1, { message: "Player name is required" }),
  size: z.enum(tshirtSizes, {
    errorMap: () => ({ message: "Select a valid t-shirt size" }),
  }),
  email: z.string().email({ message: "Valid email is required" }),
});

// Team registration (3 required + 1 optional)
export const teamRegistrationSchema = z.object({
  mode: z.literal("team"),
  team_name: z.string().min(1, { message: "Team name is required" }),
  players: z.tuple([playerSchema, playerSchema, playerSchema]),
  player4: playerSchema.optional(),
  division: z.enum(divisions, {
    errorMap: () => ({ message: "Select a division" }),
  }),
  team_email: z.string().email({ message: "Invalid email address" }),
  team_phone: z.string().regex(/^[0-9]{10}$/, {
    message: "Phone must be 10 digits (no spaces or dashes)",
  }),
  promo_code: z.string().max(64).optional(),
});

// Singles registration
export const singlesRegistrationSchema = z.object({
  mode: z.literal("singles"),
  player: playerSchema,
  division: z.enum(divisions, {
    errorMap: () => ({ message: "Select a division" }),
  }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().regex(/^[0-9]{10}$/, {
    message: "Phone must be 10 digits (no spaces or dashes)",
  }),
});

export const registrationSchema = z.discriminatedUnion("mode", [
  teamRegistrationSchema,
  singlesRegistrationSchema,
]);

export type TeamRegistrationData = z.infer<typeof teamRegistrationSchema>;
export type SinglesRegistrationData = z.infer<typeof singlesRegistrationSchema>;
export type RegistrationData = z.infer<typeof registrationSchema>;
