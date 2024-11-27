"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { WebWidget, WebWidgetData } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import RingLoader from "react-spinners/RingLoader";
import LazyWidgetCard from "@/components/DashboardComponent/LazyWidgetCard";
import NotificationPanel from "@/components/DashboardComponent/NotificationPanel";
import { Bell, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Branch {
    BranchID: string | number;
}

export default function Dashboard() {
	const [widgets, setWidgets] = useState<WebWidget[]>([]);
	const [initialLoading, setInitialLoading] = useState(true);
	const [filterLoading, setFilterLoading] = useState(false);
	const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
	const { selectedFilter } = useFilterStore();
	const { addOrReplaceWidgetData } = useWidgetDataStore();
	const previousFilterRef = useRef(selectedFilter);

	const getWidgetsData = useCallback(async (widgets: WebWidget[]) => {
		const branches =
			selectedFilter.selectedBranches.length <= 0
				? selectedFilter.branches
				: selectedFilter.selectedBranches;
		const response = await axios.post<WebWidgetData[]>(
			"/api/widgetreport",
			{
				date1: selectedFilter.date.from,
				date2: selectedFilter.date.to,
				branches: branches.map(
					(item: Branch) => item.BranchID
				),
				reportId: widgets.map((widget) => widget.ReportID),
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		response.data.forEach((widget) => {
			addOrReplaceWidgetData({
				ReportID: widget.ReportID,
				reportValue1: widget.reportValue1,
				reportValue2: widget.reportValue2,
				reportValue3: widget.reportValue3,
				reportValue4: widget.reportValue4,
				reportValue5: widget.reportValue5,
				reportValue6: widget.reportValue6,
			});
		});

		// Reset countdown after data fetch
		setCountdown(REFRESH_INTERVAL / 1000);
	}, [selectedFilter, addOrReplaceWidgetData]);

	useEffect(() => {
		// İlk yüklemede widget'ları getir
		const fetchWidgets = async () => {
			try {
				const response = await axios.get<WebWidget[]>(
					"/api/webwidgets",
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				setWidgets(response.data);
			} catch (error) {
				console.error("Widget verisi alınamadı:", error);
			}
		};

		fetchWidgets();
	}, []);

	// Countdown timer effect
	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					return REFRESH_INTERVAL / 1000;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const fetchWidgetsData = async () => {
			// Check if filter has changed
			if (
				JSON.stringify(selectedFilter) !==
				JSON.stringify(previousFilterRef.current)
			) {
				setFilterLoading(true);
				previousFilterRef.current = selectedFilter;
			}

			try {
				await getWidgetsData(widgets);
			} catch (error) {
				console.error("Widget verileri alınırken hata oluştu:", error);
			} finally {
				setInitialLoading(false);
				setFilterLoading(false);
			}
		};

		if (widgets.length > 0) {
			fetchWidgetsData();

			const intervalId = setInterval(() => {
				getWidgetsData(widgets); // Don't set loading states during interval updates
			}, REFRESH_INTERVAL);

			return () => {
				clearInterval(intervalId);
			};
		}
	}, [widgets, selectedFilter, getWidgetsData]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen bg-gradient-to-br from-background via-purple-50/30 dark:via-purple-950/30 to-background">
			<div className="col-span-1 lg:col-span-4 min-h-full flex flex-col">
				<div className="fixed bottom-4 right-4 lg:hidden z-40">
					<Sheet>
						<SheetTrigger asChild>
							<Button size="icon" className="rounded-full h-12 w-12">
								<div className="relative">
									<Bell className="h-5 w-5" />
									<span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
								</div>
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[90%] max-w-[400px] p-0 sm:w-[400px]">
							<NotificationPanel />
						</SheetContent>
					</Sheet>
				</div>
				<div
					className="justify-center overflow-auto h-[83vh] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-transparent
                    dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                    dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80 p-3"
				>
					<div className="flex justify-between items-center py-3 px-0">
						<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
							<Store className="h-5 w-5" />
							Toplam Tutarlar
						</h2>
						<div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground text-start">
							Yenileme: {countdown} saniye
						</div>
					</div>
					<div className="space-y-4 md:space-y-6 pb-6">
						{widgets.length <= 0 ||
						widgets === null ||
						widgets === undefined ? (
							<div className="flex items-center justify-center min-h-[200px]">
								<RingLoader
									color="#fff"
									loading
									size={30}
									speedMultiplier={2}
								/>
							</div>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 auto-rows-auto">
								{widgets.map((widget, index) => (
									<LazyWidgetCard
										key={widget.AutoID}
										{...widget}
										loading={
											initialLoading || filterLoading
										}
										columnIndex={index % 3}
									/>
								))}
							</div>
						)}
					</div>

					<div className="space-y-4 md:space-y-6 pb-6">
						{widgets.length <= 0 ||
						widgets === null ||
						widgets === undefined ? (
							<div className="flex items-center justify-center min-h-[200px]">
								<RingLoader
									color="#fff"
									loading
									size={30}
									speedMultiplier={2}
								/>
							</div>
						) : (
							<motion.div
								className="space-y-6"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.5, delay: 0.3 }}
							>
								<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
									<Store className="h-5 w-5" />
									Şube Bazlı Tutarlar
								</h2>
							</motion.div>
						)}
					</div>
				</div>
			</div>
			<div className="hidden lg:block w-100 p-3 m-0 flex-shrink-0 bg-background/95 backdrop-blur-sm">
				<NotificationPanel />
			</div>
		</div>
	);
}
