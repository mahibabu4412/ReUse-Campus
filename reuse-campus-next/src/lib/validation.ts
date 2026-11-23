import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Enter your email or username").max(190),
  password: z.string().min(1, "Enter your password"),
  role: z.enum(["student", "admin"]).default("student"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(3, "Name must be at least 3 characters").max(120),
    student_id: z.string().regex(/^[A-Za-z0-9\-/]{3,50}$/, "Invalid student ID"),
    email: z.string().email("Enter a valid email").max(190),
    college: z.string().min(1, "Enter your college").max(190),
    department: z.string().min(1, "Enter your department").max(190),
    semester: z.string().max(30).optional().default(""),
    phone: z.string().max(30).optional().default(""),
    contact_preferences: z.enum(["email", "phone", "both"]).default("email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(180),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  category_id: z.coerce.number().int().positive("Choose a category"),
  item_condition: z.enum(["new", "like_new", "good", "fair"]),
  exchange_type: z.enum(["donation", "borrow", "exchange", "sale"]),
  price: z.coerce.number().min(0).default(0),
  availability: z.enum(["available", "reserved"]).default("available"),
  pickup_location: z.string().max(190).optional().default(""),
});

export const requestSchema = z.object({
  listing_id: z.coerce.number().int().positive(),
  message: z.string().min(10, "Write at least 10 characters").max(1000),
  expected_return_date: z.string().optional(),
});

export const profileSchema = z.object({
  full_name: z.string().min(3).max(120),
  college: z.string().min(1).max(190),
  department: z.string().min(1).max(190),
  semester: z.string().max(30).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  contact_preferences: z.enum(["email", "phone", "both"]),
  bio: z.string().max(500).optional().default(""),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  subject: z.enum(["General question", "Account help", "Listing issue", "Report a problem", "Partnership"]),
  message: z.string().min(10).max(2000),
});

export const reportSchema = z.object({
  listing_id: z.coerce.number().int().positive(),
  reason: z.enum(["inappropriate", "spam", "misleading", "other"]),
  details: z.string().max(1000).optional().default(""),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  description: z.string().max(255).optional().default(""),
  icon: z.string().max(60).optional().default("layers"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const forgotSchema = z.object({ email: z.string().email().max(190) });
export const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ListingInput = z.infer<typeof listingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
