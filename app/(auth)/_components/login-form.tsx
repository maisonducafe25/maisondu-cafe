"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signInSchema, TSignInFormValues } from "@/lib/schemas/user";
import { useState, useTransition } from "react";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	UnlockKeyhole,
	LockKeyhole,
	TriangleAlert,
	ShieldCheck,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [show, setShow] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState(false);
	const [isPending, startTransition] = useTransition();

	const router = useRouter();

	const form = useForm<TSignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	function onSubmit(values: TSignInFormValues) {
		startTransition(async () => {
			const res = await signIn("credentials", {
				email: values.email,
				password: values.password,
				redirect: false,
			});

			if (res.error) {
				setMessage("Invalid Credentials or Account not exist");
				setError(true);
			} else {
				setMessage("Logged as " + form.getValues().email);
				setError(false);

				setTimeout(() => {
					router.push("/");
				}, 2500);
			}
		});
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="p-6 md:p-8"
						>
							<div className="flex flex-col gap-6">
								<div className="flex flex-col items-center text-center">
									<h1 className="text-2xl font-bold">
										Welcome back
									</h1>
									<p className="text-muted-foreground text-balance">
										Login to your Maisondu Cafe account
									</p>
								</div>

								<div className="grid gap-3">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														placeholder="john.doe@msficorp.com"
														{...field}
														disabled={
															message ===
															"Logged as " +
																form.getValues()
																	.email
														}
														data-testid="email"
													/>
												</FormControl>
												<FormDescription></FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="relative grid gap-3">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input
														placeholder="*************"
														{...field}
														type={
															show
																? "text"
																: "password"
														}
														disabled={
															message ===
															"Logged as " +
																form.getValues()
																	.email
														}
														data-testid="password"
													/>
												</FormControl>
												<FormDescription></FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Button
										type="button"
										onClick={() => setShow(!show)}
										className="absolute bottom-2 right-0 cursor-pointer hover:bg-transparent"
										variant={"ghost"}
									>
										{show ? (
											<UnlockKeyhole />
										) : (
											<LockKeyhole />
										)}
									</Button>
								</div>
							</div>

							{message && (
								<Card
									className={cn(
										"rounded-sm py-2 text-white",
										!error ? "bg-green-400" : "bg-rose-400"
									)}
								>
									<CardContent className="px-3 flex items-center gap-1">
										{error ? (
											<TriangleAlert />
										) : (
											<ShieldCheck />
										)}{" "}
										{message}
									</CardContent>
								</Card>
							)}

							<Button
								type="submit"
								className="cursor-pointer"
								disabled={
									isPending ||
									message ===
										"Logged as " + form.getValues().email
								}
								data-testid="loginSubmit"
							>
								{isPending ? "Logging in" : "Login"}
							</Button>
						</form>
					</Form>
					{/* <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Maisondu Cafe account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form> */}
					<div className="bg-muted relative hidden md:block">
						<h2 className="text-3xl text-center font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
							Maisondu Cafe's LOGO
						</h2>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				By logging in, you agree to our <a href="#">Terms of Service</a>{" "}
				and <a href="#">Privacy Policy</a>.
			</div>
		</div>
	);
}
