"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { TabContent } from "@/components/TabContent";
import Header from "@/components/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabStore } from "@/stores/tab-store";

export default function Home() {
	const { tabs, activeTab, setActiveTab, removeTab } = useTabStore();

	const handleCloseTab = (tabId: string) => {
		if (activeTab === tabId) {
			const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
			if (tabIndex > 0) {
				setActiveTab(tabs[tabIndex - 1].id);
			} else if (tabs.length > 1) {
				setActiveTab(tabs[1].id);
			} else {
				setActiveTab("dashboard");
			}
		}
		removeTab(tabId);
	};

	return (
		<div className="flex h-screen overflow-hidden w-full">
			<AppSidebar />
			<div className="flex-1 flex flex-col">
				<Header />
				<main className="flex-1 overflow-hidden">
					<div className="h-full p-4 flex gap-2"> {/* Added flex and gap-6 */}
						<div className="flex-1"> {/* Main content wrapper */}
							<Tabs
								value={activeTab}
								onValueChange={setActiveTab}
								className="h-full flex flex-col"
							>
								<TabsList className="w-full justify-start">
									<TabsTrigger value="dashboard">
										Dashboard
									</TabsTrigger>
									{tabs.map((tab) => (
										<TabsTrigger
											key={tab.id}
											value={tab.id}
											onClose={() => handleCloseTab(tab.id)}
										>
											{tab.title}
										</TabsTrigger>
									))}
								</TabsList>

								<div className="flex-1 mt-4">
									<TabContent
										id="dashboard"
										isActive={activeTab === "dashboard"}
										lazyComponent={() =>
											import(
												"@/app/[tenantId]/(main)/dashboard/page"
											)
										}
									/>
									{tabs.map((tab) => (
										<TabContent
											key={tab.id}
											id={tab.id}
											isActive={activeTab === tab.id}
											lazyComponent={tab.lazyComponent}
										/>
									))}
								</div>
							</Tabs>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
