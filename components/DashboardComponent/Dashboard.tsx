"use client";
import NotificationPanel from "./NotificationPanel";
import { Card } from "@/components/ui/card";
import { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";
import LazyWidgetCard from "./LazyWidgetCard";
import { WebWidget, WebWidgetData } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useWidgetDataStore } from "@/stores/widget-data-store";
import RingLoader from "react-spinners/RingLoader";

export default function Dashboard() {
	const mainContentRef = useRef<HTMLDivElement>(null);
	const notificationRef = useRef<HTMLDivElement>(null);
	const [widgets, setWidgets] = useState<WebWidget[]>([]);
	const [loading, setLoading] = useState(true);
	const { selectedFilter } = useFilterStore();
	const { addOrReplaceWidgetData } = useWidgetDataStore();

	const getWidgetsData = useCallback(async (widgets: WebWidget[]) => {
        const branches = selectedFilter.selectedBranches.length<=0 ? selectedFilter.branches : selectedFilter.selectedBranches;
		const response = await axios.post<WebWidgetData[]>(
			"/api/widgetreport",
			{
				date1: selectedFilter.date.from,
				date2: selectedFilter.date.to,
				branches: branches.map((item) => item.BranchID),
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

	useEffect(() => {
		const fetchWidgetsData = async () => {
			setLoading(true);
			try {
				await getWidgetsData(widgets);
			} catch (error) {
				console.error("Widget verileri alınırken hata oluştu:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchWidgetsData();

		const intervalId = setInterval(() => {
			fetchWidgetsData();
		}, 90000);
		return () => {
			clearInterval(intervalId);
		};
	}, [widgets, selectedFilter, getWidgetsData]);

	// Scrollları senkronize et
	useEffect(() => {
		const mainContent = mainContentRef.current;
		const notification = notificationRef.current;

		if (!mainContent || !notification) return;

		const handleScroll = () => {
			const scrollPercentage =
				(mainContent.scrollTop /
					(mainContent.scrollHeight - mainContent.clientHeight)) *
				100;
			notification.scrollTop =
				(notification.scrollHeight - notification.clientHeight) *
				(scrollPercentage / 100);
		};

		mainContent.addEventListener("scroll", handleScroll);
		return () => mainContent.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="overflow-y-auto bg-gradient-to-br from-background via-purple-50/30 dark:via-purple-950/30 to-background">
			<div className="flex p-6 gap-6">
				<div className="flex-1">
					<div className="space-y-8">
						{widgets.length <= 0 ||
						widgets === null ||
						widgets === undefined ? (
							<RingLoader
								color="#fff"
								className="m-auto"
								loading
								size={30}
								speedMultiplier={2}
							/>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{widgets.map((widget, index) => (
									<LazyWidgetCard
										key={widget.AutoID}
										{...widget}
										loading={loading}
                                        columnIndex={index % 4}
									/>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="w-96 flex-shrink-0">
					<Card className="sticky top-6 bg-background/95 backdrop-blur-sm border-border/60 rounded-xl shadow-lg">
						<NotificationPanel />
					</Card>
				</div>
			</div>
		</div>
	);
}
