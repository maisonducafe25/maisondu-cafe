import z, { object, string } from "zod";

export const signInSchema = object({
	email: string().min(1, "Email is required").email("Invalid email"),
	password: string()
		.min(1, "Password is required")
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
});

export type TSignInFormValues = z.infer<typeof signInSchema>;

export const userRegisterSchema = object({
	id: string().optional(),
	email: string().min(1, "required").email("Invalid email"),
	password: string()
		.min(1, "required")
		.min(8, "must be more than 8 characters")
		.max(32, "must be less than 32 characters"),
	confirmPassword: string().min(1, "required"),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords do not match",
	path: ["confirmPassword"],
});