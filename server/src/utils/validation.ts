import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const noteMetadataSchema = z.object({
  color: z.string().optional(),
  pinned: z.boolean().optional(),
});

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(20000).optional().default(""),
  tags: z.array(z.string().min(1).max(30)).max(20).optional().default([]),
  metadata: noteMetadataSchema.optional().default({}),
});

export const updateNoteSchema = createNoteSchema.partial();

export const updateNameSchema = z.object({
  name: z.string().min(1).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
