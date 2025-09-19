import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Coffee, Users, Wifi, Clock, Star } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();
	const company_id = session?.user.company_id;
	console.log("session", session);
	if (session && company_id === "EMP002") {
		redirect(`/cashier/${company_id}`);
	} else {
		return (
			<div className="min-h-screen bg-background">
				{/* Navigation */}
				<nav className="flex items-center justify-between p-6 lg:px-12">
					<div className="text-2xl font-bold text-primary">
						maisondu café
					</div>
					<div className="hidden md:flex items-center space-x-8">
						<a
							href="#about"
							className="text-foreground hover:text-primary transition-colors"
						>
							About
						</a>
						<a
							href="#menu"
							className="text-foreground hover:text-primary transition-colors"
						>
							Menu
						</a>
						<a
							href="#location"
							className="text-foreground hover:text-primary transition-colors"
						>
							Location
						</a>
						<Button>Visit Us</Button>
					</div>
				</nav>

				{/* Hero Section */}
				<section className="relative h-screen flex items-center justify-center text-center">
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url('/freshly-brewed-coffee-cup-with-steam-rising--warm-.jpg')`,
						}}
					>
						<div className="absolute inset-0 bg-black/40"></div>
					</div>
					<div className="relative z-10 text-white max-w-4xl px-6">
						<h1 className="text-5xl lg:text-7xl font-bold mb-6 text-balance">
							Experience the Art of Coffee
						</h1>
						<p className="text-xl lg:text-2xl mb-8 text-pretty opacity-90">
							Where every cup tells a story of passion,
							craftsmanship, and community
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="text-lg px-8 py-4">
								Explore Our Menu
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-foreground"
							>
								Find Us
							</Button>
						</div>
					</div>
				</section>

				{/* About Section */}
				<section id="about" className="py-20 px-6 lg:px-12">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16">
							<h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
								Why Coffee Lovers Choose Us
							</h2>
							<p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
								At maisondu café, we&apos;re more than just a coffee
								shop. We&apos;re a community hub where quality meets
								comfort.
							</p>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							<Card className="text-center p-8 hover:shadow-lg transition-shadow">
								<CardContent className="pt-6">
									<Coffee className="w-12 h-12 text-primary mx-auto mb-4" />
									<h3 className="text-xl font-semibold mb-3">
										Artisanal Brews
									</h3>
									<p className="text-muted-foreground text-pretty">
										Hand-crafted coffee using premium beans
										sourced directly from sustainable farms
										worldwide.
									</p>
								</CardContent>
							</Card>

							<Card className="text-center p-8 hover:shadow-lg transition-shadow">
								<CardContent className="pt-6">
									<Users className="w-12 h-12 text-primary mx-auto mb-4" />
									<h3 className="text-xl font-semibold mb-3">
										Cozy Atmosphere
									</h3>
									<p className="text-muted-foreground text-pretty">
										Warm, inviting space perfect for work,
										study, or catching up with friends over
										great coffee.
									</p>
								</CardContent>
							</Card>

							<Card className="text-center p-8 hover:shadow-lg transition-shadow">
								<CardContent className="pt-6">
									<Wifi className="w-12 h-12 text-primary mx-auto mb-4" />
									<h3 className="text-xl font-semibold mb-3">
										Modern Amenities
									</h3>
									<p className="text-muted-foreground text-pretty">
										Free high-speed WiFi, charging stations,
										and comfortable seating for the modern
										coffee lover.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Location Section */}
				<section id="location" className="py-20 bg-muted">
					<div className="max-w-6xl mx-auto px-6 lg:px-12">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<div>
								<h2 className="text-4xl font-bold mb-6">
									Find Us in the Heart of the City
								</h2>
								<p className="text-xl text-muted-foreground mb-8 text-pretty">
									Conveniently located downtown, we&apos;re your
									perfect coffee destination whether you&apos;re
									commuting, shopping, or exploring the city.
								</p>

								<div className="space-y-4 mb-8">
									<div className="flex items-center gap-3">
										<MapPin className="w-5 h-5 text-primary" />
										<span>
											123 Coffee Street, Downtown District
										</span>
									</div>
									<div className="flex items-center gap-3">
										<Clock className="w-5 h-5 text-primary" />
										<span>
											Mon-Fri: 6:30 AM - 9:00 PM |
											Weekends: 7:00 AM - 10:00 PM
										</span>
									</div>
									<div className="flex items-center gap-3">
										<Star className="w-5 h-5 text-primary" />
										<span>
											4.8/5 stars from 500+ happy
											customers
										</span>
									</div>
								</div>

								<Button size="lg" className="text-lg px-8 py-4">
									Get Directions
								</Button>
							</div>

							<div className="relative">
								<img
									src="/modern-coffee-shop-interior-with-warm-lighting--wo.jpg"
									alt="Maisondu Cafe Interior"
									className="rounded-lg shadow-lg w-full h-[400px] object-cover"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="py-20 px-6 lg:px-12 text-center">
					<div className="max-w-4xl mx-auto">
						<h2 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
							Ready for Your Perfect Cup?
						</h2>
						<p className="text-xl text-muted-foreground mb-8 text-pretty">
							Join our community of coffee lovers and discover
							what makes maisondu café special.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" className="text-lg px-8 py-4">
								Visit Us
							</Button>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-card py-12 px-6 lg:px-12">
					<div className="max-w-6xl mx-auto">
						<div className="grid md:grid-cols-3 gap-8 mb-8">
							<div>
								<h3 className="text-xl font-bold mb-4 text-primary">
									maisondu café
								</h3>
								<p className="text-muted-foreground text-pretty">
									Crafting exceptional coffee experiences in
									the heart of the city since 2024.
								</p>
							</div>

							<div>
								<h4 className="font-semibold mb-4">
									Quick Links
								</h4>
								<div className="space-y-2">
									<a
										href="#menu"
										className="block text-muted-foreground hover:text-primary transition-colors"
									>
										Menu
									</a>
									<a
										href="#about"
										className="block text-muted-foreground hover:text-primary transition-colors"
									>
										About Us
									</a>
									<a
										href="#location"
										className="block text-muted-foreground hover:text-primary transition-colors"
									>
										Location
									</a>
									<a
										href="#contact"
										className="block text-muted-foreground hover:text-primary transition-colors"
									>
										Contact
									</a>
								</div>
							</div>

							<div>
								<h4 className="font-semibold mb-4">
									Connect With Us
								</h4>
								<div className="space-y-2">
									<p className="text-muted-foreground">
										Follow us for daily coffee inspiration
									</p>
									<div className="flex gap-4">
										<a
											href="#"
											className="text-muted-foreground hover:text-primary transition-colors"
										>
											Instagram
										</a>
										<a
											href="#"
											className="text-muted-foreground hover:text-primary transition-colors"
										>
											Facebook
										</a>
										<a
											href="#"
											className="text-muted-foreground hover:text-primary transition-colors"
										>
											Twitter
										</a>
									</div>
								</div>
							</div>
						</div>

						<div className="border-t border-border pt-8 text-center text-muted-foreground">
							<p>
								&copy; 2025 maisondu café. All rights reserved.
								| Capstone Project
							</p>
						</div>
					</div>
				</footer>
			</div>
		);
	}
}
