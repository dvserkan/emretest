"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDateTimeDMY } from "@/lib/utils";
import {
	Calendar as CalendarIcon,
	ChevronDown,
	Sun,
	Moon,
	Palette,
	Languages,
	Bell,
	Settings,
	User,
} from "lucide-react";
import { useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/stores/filters-store";
import { SidebarTrigger } from "./ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CommandList } from "cmdk";
import { Checkbox } from "./ui/checkbox";
import {
    addDays,
	endOfMonth,
	endOfWeek,
	endOfYear,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subDays,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";

const translations = {
	tr: {
		startDate: "Başlangıç Tarihi",
		endDate: "Bitiş Tarihi",
		allBranches: "Tüm Şubeler",
		branchesSelected: "Şube Seçili",
		searchBranch: "Şube ara...",
		branchNotFound: "Şube bulunamadı.",
		apply: "Uygula",
		refresh: "Yenile",
		notifications: "Bildirimler",
		settings: "Ayarlar",
		profile: "Profil",
		time: "Saat",
		dateRange: "Tarih Aralığı",
		today: "Bugün",
		yesterday: "Dün",
		thisWeek: "Bu Hafta",
		lastWeek: "Geçen Hafta",
		thisMonth: "Bu Ay",
		lastMonth: "Geçen Ay",
		thisYear: "Bu Yıl",
	},
	en: {
		startDate: "Start Date",
		endDate: "End Date",
		allBranches: "All Branches",
		branchesSelected: "Branches Selected",
		searchBranch: "Search branch...",
		branchNotFound: "Branch not found.",
		apply: "Apply",
		refresh: "Refresh",
		notifications: "Notifications",
		settings: "Settings",
		profile: "Profile",
		time: "Time",
		dateRange: "Date Range",
		today: "Today",
		yesterday: "Yesterday",
		thisWeek: "This Week",
		lastWeek: "Last Week",
		thisMonth: "This Month",
		lastMonth: "Last Month",
		thisYear: "This Year",
	},
	ar: {
		startDate: "تاريخ البدء",
		endDate: "تاريخ الانتهاء",
		allBranches: "جميع الفروع",
		branchesSelected: "الفروع المحددة",
		searchBranch: "البحث عن فرع...",
		branchNotFound: "لم يتم العثور على فرع.",
		apply: "تطبيق",
		refresh: "تحديث",
		notifications: "إشعارات",
		settings: "إعدادات",
		profile: "الملف الشخصي",
		time: "الوقت",
		dateRange: "نطاق التاريخ",
		today: "اليوم",
		yesterday: "أمس",
		thisWeek: "هذا الأسبوع",
		lastWeek: "الأسبوع الماضي",
		thisMonth: "هذا الشهر",
		lastMonth: "الشهر الماضي",
		thisYear: "هذه السنة",
	},
};

export default function Header() {
	const [open, setOpen] = useState(false);
	const { selectedFilter, setFilter } = useFilterStore();

	const [selectedBranches] = useState(selectedFilter.branches);
	const [selectedStartDate, setSelectedStartDate] = useState(
		selectedFilter.date.from
	);
	const [selectedEndDate, setSelectedEndDate] = useState(
		selectedFilter.date.to
	);
	const { theme, setTheme } = useTheme();
	const { language, setLanguage } = useLanguage();
	const t = translations[language as keyof typeof translations];

	const applyFilters = () => {
		setFilter({
			branches: selectedFilter.branches,
			date: {
				from: selectedStartDate,
				to: selectedEndDate,
			},
			selectedBranches: selectedBranches,
		});
	};
	const dateRangeChange = (value: string) => {
		const today = new Date();
		const tomorrow = addDays(new Date(), 1);
		switch (value) {
			case "today":
				setSelectedStartDate(today);
				setSelectedEndDate(tomorrow);
				break;
			case "yesterday":
				const yesterday = subDays(today, 1);
				setSelectedStartDate(yesterday);
				setSelectedEndDate(today);
				break;
			case "thisWeek":
				setSelectedStartDate(startOfWeek(today, { weekStartsOn: 1 }));
				setSelectedEndDate(endOfWeek(today, { weekStartsOn: 1 }));
				break;

			case "lastWeek":
				const lastWeek = subWeeks(today, 1);
				setSelectedStartDate(
					startOfWeek(lastWeek, { weekStartsOn: 1 })
				);
				setSelectedEndDate(endOfWeek(lastWeek, { weekStartsOn: 1 }));
				break;
			case "thisMonth":
				setSelectedStartDate(startOfMonth(today));
				setSelectedEndDate(endOfMonth(today));
				break;
			case "lastMonth":
				const lastMonth = subMonths(today, 1);
				setSelectedStartDate(startOfMonth(lastMonth));
				setSelectedEndDate(endOfMonth(lastMonth));
				break;
			case "thisYear":
				setSelectedStartDate(startOfYear(today));
				setSelectedEndDate(endOfYear(today));
				break;
			case "lastYear":
				const lastYear = subYears(today, 1);
				setSelectedStartDate(startOfYear(lastYear));
				setSelectedEndDate(endOfYear(lastYear));
				break;
			case "lastSevenDays":
				setSelectedStartDate(subDays(today, 7));
				setSelectedEndDate(today);
				break;
			default:
				break;
		}
	};

	return (
		<header className="sticky top-0 z-40 border-b bg-background shadow-md">
			<div className="flex h-16 items-center px-4 gap-4">
				<SidebarTrigger className="-ml-1" />

				<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2 flex-1">
					<Select
						onValueChange={dateRangeChange}
						defaultValue="today"
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder={t.dateRange} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="today">{t.today}</SelectItem>
							<SelectItem value="yesterday">
								{t.yesterday}
							</SelectItem>
							<SelectItem value="thisWeek">
								{t.thisWeek}
							</SelectItem>
							<SelectItem value="lastWeek">
								{t.lastWeek}
							</SelectItem>
							<SelectItem value="thisMonth">
								{t.thisMonth}
							</SelectItem>
							<SelectItem value="lastMonth">
								{t.lastMonth}
							</SelectItem>
							<SelectItem value="thisYear">
								{t.thisYear}
							</SelectItem>
						</SelectContent>
					</Select>

					<div className="hidden md:block">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!selectedStartDate &&
											"text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{selectedStartDate
										? formatDateTimeDMY(selectedStartDate)
										: t.startDate}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start"
							>
								<Calendar
									mode="single"
									selected={selectedStartDate}
									onSelect={setSelectedStartDate}
									initialFocus
									disabled={(date) =>
										selectedEndDate
											? date > selectedEndDate
											: false
									}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="hidden md:block">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!selectedEndDate &&
											"text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{selectedEndDate
										? formatDateTimeDMY(selectedEndDate)
										: t.endDate}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start"
							>
								<Calendar
									mode="single"
									selected={selectedEndDate}
									onSelect={setSelectedEndDate}
									initialFocus
									disabled={(date) =>
										selectedStartDate
											? date < selectedStartDate
											: false
									}
								/>
							</PopoverContent>
						</Popover>
					</div>

					<div className="hidden lg:block">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full justify-between"
								>
									{selectedFilter.selectedBranches.length ===
									0
										? t.allBranches
										: `${selectedFilter.selectedBranches.length} ${t.branchesSelected}`}
									<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-0 w-full">
								<Command>
									<CommandInput
										placeholder={t.searchBranch}
									/>

									<CommandList
										className="max-h-72 max-w-full w-full overflow-y-auto
                                                [&::-webkit-scrollbar]:w-2
                                                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                                                [&::-webkit-scrollbar-thumb]:rounded-full
                                                [&::-webkit-scrollbar-track]:bg-transparent
                                                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                                                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                                                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
									>
										<CommandEmpty>
											{t.branchNotFound}
										</CommandEmpty>
										<CommandGroup heading="Şubeler">
											{selectedFilter?.branches?.map(
												(branch, index) => (
													<CommandItem
														key={index}
														onSelect={() => {
															/*addBranch(
																branch.BranchID
															);*/
														}}
													>
														<div className="flex items-center space-x-2">
															<Checkbox id="terms"/>
															<label
																htmlFor="terms"
																className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
																{
																	branch.BranchName
																}
															</label>
														</div>
													</CommandItem>
												)
											)}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<Button className="w-full " onClick={applyFilters}>
						{t.apply}
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="hidden sm:flex"
							>
								<Languages className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setLanguage("tr")}>
								<span className="mr-2">🇹🇷</span>
								<span>Türkçe</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setLanguage("en")}>
								<span className="mr-2">🇬🇧</span>
								<span>English</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setLanguage("ar")}>
								<span className="mr-2">🇸🇦</span>
								<span>العربية</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								{theme === "light" ? (
									<Sun className="h-4 w-4" />
								) : theme === "dark" ? (
									<Moon className="h-4 w-4" />
								) : (
									<Palette className="h-4 w-4" />
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setTheme("light")}>
								<Sun className="mr-2 h-4 w-4" />
								<span>Light</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("dark")}>
								<Moon className="mr-2 h-4 w-4" />
								<span>Dark</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("blue")}>
								<Palette className="mr-2 h-4 w-4" />
								<span>Blue</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("red")}>
								<Palette className="mr-2 h-4 w-4" />
								<span>Red</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						variant="ghost"
						size="icon"
						title={t.notifications}
						className="hidden sm:flex"
					>
						<Bell className="h-4 w-4" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						title={t.settings}
						className="hidden sm:flex"
					>
						<Settings className="h-4 w-4" />
					</Button>

					<Button variant="ghost" size="icon" title={t.profile}>
						<User className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</header>
	);
}
