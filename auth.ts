import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/schemas/user";
import { compare, hash } from "bcryptjs";
import prisma from "./lib/prisma";
import { GetProfileFullName } from "./lib/utils";

export const { handlers, auth } = NextAuth({
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				let user = null;

				const { email, password } = await signInSchema.parseAsync(
					credentials
				);

				// logic to verify if the user exists
				user = await prisma.user.findUnique({
					where: {
						email,
					},
					include: {
						profile: {
							include: {
								userRoles: {
									include: {
										role: true,
									},
								},
							},
						},
					},
				});

				if (!user) {
					throw new Error("Email is not registered.");
				}

				const isPasswordMatched = await compare(
					password!,
					user.password_hash!
				);

				if (!isPasswordMatched) {
					throw new Error("Password does not matched.");
				}

				const profile = user.profile;

				const full_name = GetProfileFullName(profile);

				// return JSON object with the user data
				return {
					name: full_name,
					company_id: profile?.company_id ?? "Missing Company ID",
					email: user.email,
					job_titles: user.profile?.userRoles.map(
						(role) => role.role.name
					)!,
				};
			},
		}),
	],
	pages: {
		signIn: "/auth/login",
	},
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.name = user.name;
				token.email = user.email!;
				token.company_id = user.company_id!;
				token.job_titles = user.job_titles!;
			}
			return token;
		},
		session({ session, token }) {
			session.user.name = token.name;
			session.user.email = token.email;
			session.user.company_id = token.company_id;
			session.user.job_titles = token.job_titles;

			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
});
