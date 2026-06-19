import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
  name: z.string().min(2, "At least 2 characters").max(50, "Max 50 characters"),
  email: z.string().min(1, "Required").email("Invalid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const postSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export const profileSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(50, "Max 50 characters"),
  bio: z.string().max(300, "Max 300 characters").optional(),
  avatar: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
