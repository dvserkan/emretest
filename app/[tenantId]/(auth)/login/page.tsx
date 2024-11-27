"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { useRouter, usePathname } from "next/navigation";
import {
	LockKeyhole,
	User,
	Loader2,
	ShieldCheck,
	BarChart3,
	Globe2,
	Sun,
	Moon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { RobotposLoader } from "@/components/ui/robotpos-loader";
import { Efr_Branches } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";

export default function LoginPage() {
	const router = useRouter();
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [isLoading, setIsLoading] = useState(false);
	const [pageLoader, setPageLoader] = useState(true);
	const [tenantName, setTenantName] = useState<string>("");
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

    const { setBranchs } = useFilterStore();
	const getUserBranches =  () => {
		axios.get<Efr_Branches[]>("/api/efr_branches", {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((branches) => {
				setBranchs(branches.data);
			});
	};

    const setReduxStates = async () => {
        try {
            const promises = [getUserBranches()];
            await Promise.all(promises);
            router.push(`/${pathname?.split("/")[1]}`);
        } catch (error) {
            console.error("Bir hata oluştu:", error);
        }
    };
    


	useEffect(() => {
		const pathSegments = pathname?.split("/") || [];
		if (pathSegments.length > 1) {
			const tenant = pathSegments[1];
			const formattedName = tenant
				.split(/(?=[A-Z])|(?=[0-9])/)
				.map(
					(word) =>
						word.charAt(0).toUpperCase() +
						word.slice(1).toLowerCase()
				)
				.join(" ");
			setTenantName(formattedName);
			document.title = `${formattedName} - Web Rapor Sistemi`;
		}
		setPageLoader(false);
	}, [pathname]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
        setPageLoader(true);
        
		try {
			const response = await axios.post("/api/auth/login", formData, {
				headers: {
					"Content-Type": "application/json",
				},
			});
			setIsLoading(false);

			if (response.status === 200) {
                setReduxStates();
			}
            setPageLoader(false);
		} catch (error) {
			console.error("Login error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const features = [
		{
			icon: BarChart3,
			title: "Gerçek Zamanlı Analitik",
			description: "Anlık veri analizi ve raporlama",
		},
		{
			icon: ShieldCheck,
			title: "Güvenli Altyapı",
			description: "End-to-end şifrelenmiş veri güvenliği",
		},
		{
			icon: Globe2,
			title: "Global Erişim",
			description: "Her yerden güvenli erişim imkanı",
		},
	];

	return (
		<>
			{pageLoader ? (
				<RobotposLoader />
			) : (
				<div className="h-screen flex flex-col overflow-hidden">
					<div className="flex-1 relative w-full overflow-auto">
						{/* Gradient Arka Plan */}
						<div
							className={cn(
								"fixed inset-0 transition-colors duration-300",
								"dark:bg-gradient-to-b dark:from-zinc-900 dark:to-black",
								"bg-gradient-to-b from-gray-100 to-white"
							)}
						/>

						{/* Desen Overlay */}
						<div
							className={cn(
								"fixed inset-0",
								"bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)]",
								"bg-[length:20px_20px]",
								"dark:opacity-20 opacity-10"
							)}
						/>

						{/* Ana İçerik */}
						<div className="relative min-h-full p-4 sm:p-8">
							{/* Tema Değiştirme Butonu */}
							<Button
								variant="outline"
								size="icon"
								className={cn(
									"fixed top-4 right-4 z-50 h-10 w-10 rounded-full",
									"dark:bg-zinc-900/50 bg-white/50",
									"dark:border-zinc-800 border-gray-200",
									"backdrop-blur-sm",
									"hover:scale-110 transition-transform"
								)}
								onClick={() =>
									setTheme(
										theme === "light" ? "dark" : "light"
									)
								}
							>
								<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
							</Button>

							<div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-2rem)]">
								{/* Logo */}
								<div className="relative w-40 sm:w-52 h-12 sm:h-14 mb-8 sm:mb-14">
									<Image
										src="/images/robotpos-logo.png"
										alt="RobotPOS Logo"
										fill
										priority
										className={cn(
											"object-contain",
											"dark:brightness-110 dark:contrast-125"
										)}
									/>
								</div>

								{/* Ana İçerik Alanı */}
								<div className="flex-1 flex flex-col lg:flex-row gap-8">
									{/* Sol Taraf - Başlık ve Özellikler */}
									<div className="flex-1 flex flex-col justify-between">
										<div className="space-y-8">
											{/* Başlıklar */}
											<div className="space-y-6">
												<div className="flex flex-col sm:flex-row sm:items-center gap-3">
													<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
														{tenantName}
													</h1>
													<div
														className={cn(
															"hidden sm:block w-[2px] h-12",
															"bg-border dark:bg-muted-foreground/20"
														)}
													/>
													<h2 className="text-3xl sm:text-4xl font-semibold text-muted-foreground">
														Web Rapor Sistemi
													</h2>
												</div>
												<p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[480px]">
													İş zekası ve raporlama
													platformu ile verilerinizi
													güvenle yönetin, analiz edin
													ve raporlayın.
												</p>
											</div>

											{/* Mobil Login Formu */}
											<div className="lg:hidden">
												<Card
													className={cn(
														"border-0",
														"dark:bg-zinc-900/70 bg-white/70",
														"backdrop-blur-sm",
														"shadow-xl",
														"dark:shadow-black/10"
													)}
												>
													<CardHeader className="space-y-1 pb-4">
														<h2 className="text-2xl font-semibold text-foreground">
															Giriş Yap
														</h2>
														<p className="text-muted-foreground">
															Devam etmek için
															hesabınıza giriş
															yapın
														</p>
													</CardHeader>
													<form
														onSubmit={handleSubmit}
													>
														<CardContent className="space-y-6 pb-6">
															<div className="space-y-2">
																<Label htmlFor="username-mobile">
																	Kullanıcı
																	Adı
																</Label>
																<div className="relative">
																	<User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
																	<Input
																		id="username-mobile"
																		type="text"
																		placeholder="Kullanıcı adınız"
																		className={cn(
																			"pl-10 h-12",
																			"dark:bg-zinc-800/50 bg-white/50",
																			"dark:border-zinc-700/50 border-gray-200",
																			"focus:border-primary"
																		)}
																		value={
																			formData.username
																		}
																		onChange={(
																			e
																		) =>
																			setFormData(
																				{
																					...formData,
																					username:
																						e
																							.target
																							.value,
																				}
																			)
																		}
																		disabled={
																			isLoading
																		}
																	/>
																</div>
															</div>

															<div className="space-y-2">
																<Label htmlFor="password-mobile">
																	Şifre
																</Label>
																<div className="relative">
																	<LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
																	<Input
																		id="password-mobile"
																		type="password"
																		placeholder="••••••••"
																		className={cn(
																			"pl-10 h-12",
																			"dark:bg-zinc-800/50 bg-white/50",
																			"dark:border-zinc-700/50 border-gray-200",
																			"focus:border-primary"
																		)}
																		value={
																			formData.password
																		}
																		onChange={(
																			e
																		) =>
																			setFormData(
																				{
																					...formData,
																					password:
																						e
																							.target
																							.value,
																				}
																			)
																		}
																		disabled={
																			isLoading
																		}
																	/>
																</div>
															</div>

															<div className="flex items-center justify-between">
																<div className="flex items-center space-x-2">
																	<input
																		type="checkbox"
																		id="remember-mobile"
																		className="rounded border-input"
																	/>
																	<Label
																		htmlFor="remember-mobile"
																		className="text-sm text-muted-foreground"
																	>
																		Beni
																		Hatırla
																	</Label>
																</div>
																<Button
																	variant="link"
																	className="text-sm p-0"
																>
																	Şifremi
																	Unuttum
																</Button>
															</div>
														</CardContent>

														<CardFooter className="flex flex-col space-y-4 pt-0">
															<Button
																type="submit"
																className={cn(
																	"w-full h-12 text-base font-medium",
																	"bg-primary hover:bg-primary/90"
																)}
																disabled={
																	isLoading
																}
															>
																{isLoading ? (
																	<>
																		<Loader2 className="mr-2 h-5 w-5 animate-spin" />
																		Giriş
																		Yapılıyor
																	</>
																) : (
																	"Giriş Yap"
																)}
															</Button>
														</CardFooter>
													</form>
												</Card>
											</div>

											{/* Özellikler */}
											<div className="space-y-6">
												{features.map(
													(feature, index) => (
														<div
															key={index}
															className={cn(
																"flex items-start space-x-5 p-6 rounded-lg",
																"dark:bg-zinc-900/50 bg-white/50",
																"dark:border-zinc-800/50 border-gray-200/50",
																"backdrop-blur-sm",
																"transition-all duration-200",
																"hover:dark:bg-zinc-900/70 hover:bg-white/70",
																"hover:scale-[1.02]",
																"shadow-lg shadow-black/15"
															)}
														>
															<div
																className={cn(
																	"p-3 rounded-md",
																	"dark:bg-white/5 bg-black/5",
																	"ring-1 ring-black/5 dark:ring-white/5"
																)}
															>
																<feature.icon className="h-6 w-6 text-primary" />
															</div>
															<div>
																<h3 className="font-semibold text-foreground text-lg mb-2">
																	{
																		feature.title
																	}
																</h3>
																<p className="text-base text-muted-foreground">
																	{
																		feature.description
																	}
																</p>
															</div>
														</div>
													)
												)}
											</div>

											{/* Rozetler */}
											<div className="flex flex-wrap gap-2">
												<Badge
													variant="secondary"
													className="text-sm py-1 px-4 hover:bg-primary/10 transition-colors shadow-lg shadow-black/15"
												>
													ISO 27001
												</Badge>
												<Badge
													variant="secondary"
													className="text-sm py-1 px-4 hover:bg-primary/10 transition-colors shadow-lg shadow-black/15"
												>
													KVKK Uyumlu
												</Badge>
												<Badge
													variant="secondary"
													className="text-sm py-1 px-4 hover:bg-primary/10 transition-colors shadow-lg shadow-black/15"
												>
													%99.9 Uptime
												</Badge>
											</div>
										</div>
									</div>

									{/* Sağ Taraf - Desktop Login */}
									<div className="hidden lg:block w-[400px]">
										<Card
											className={cn(
												"border-0",
												"dark:bg-zinc-900/70 bg-white/70",
												"backdrop-blur-sm",
												"shadow-xl",
												"dark:shadow-black/10"
											)}
										>
											<CardHeader className="space-y-1 pb-4">
												<h2 className="text-2xl font-semibold text-foreground">
													Giriş Yap
												</h2>
												<p className="text-muted-foreground">
													Devam etmek için hesabınıza
													giriş yapın
												</p>
											</CardHeader>
											<form onSubmit={handleSubmit}>
												<CardContent className="space-y-6 pb-6">
													<div className="space-y-2">
														<Label htmlFor="username-desktop">
															Kullanıcı Adı
														</Label>
														<div className="relative">
															<User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
															<Input
																id="username-desktop"
																type="text"
																placeholder="Kullanıcı adınız"
																className={cn(
																	"pl-10 h-12",
																	"dark:bg-zinc-800/50 bg-white/50",
																	"dark:border-zinc-700/50 border-gray-200",
																	"focus:border-primary"
																)}
																value={
																	formData.username
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			username:
																				e
																					.target
																					.value,
																		}
																	)
																}
																disabled={
																	isLoading
																}
															/>
														</div>
													</div>

													<div className="space-y-2">
														<Label htmlFor="password-desktop">
															Şifre
														</Label>
														<div className="relative">
															<LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
															<Input
																id="password-desktop"
																type="password"
																placeholder="••••••••"
																className={cn(
																	"pl-10 h-12",
																	"dark:bg-zinc-800/50 bg-white/50",
																	"dark:border-zinc-700/50 border-gray-200",
																	"focus:border-primary"
																)}
																value={
																	formData.password
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			password:
																				e
																					.target
																					.value,
																		}
																	)
																}
																disabled={
																	isLoading
																}
															/>
														</div>
													</div>

													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-2">
															<input
																type="checkbox"
																id="remember-desktop"
																className="rounded border-input"
															/>
															<Label
																htmlFor="remember-desktop"
																className="text-sm text-muted-foreground"
															>
																Beni Hatırla
															</Label>
														</div>
														<Button
															variant="link"
															className="text-sm p-0"
														>
															Şifremi Unuttum
														</Button>
													</div>
												</CardContent>

												<CardFooter className="flex flex-col space-y-4 pt-0">
													<Button
														type="submit"
														className={cn(
															"w-full h-12 text-base font-medium",
															"bg-primary hover:bg-primary/90"
														)}
														disabled={isLoading}
													>
														{isLoading ? (
															<>
																<Loader2 className="mr-2 h-5 w-5 animate-spin" />
																Giriş Yapılıyor
															</>
														) : (
															"Giriş Yap"
														)}
													</Button>
												</CardFooter>
											</form>
										</Card>
									</div>
								</div>

								{/* Footer */}
								<footer className="mt-8 py-4 flex items-center justify-between text-muted-foreground text-sm border-t border-border/20">
									<p>© 2024 RobotPOS</p>
									<div className="flex gap-4">
										<button className="hover:text-foreground transition-colors">
											Gizlilik
										</button>
										<button className="hover:text-foreground transition-colors">
											Koşullar
										</button>
									</div>
								</footer>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
