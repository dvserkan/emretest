"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import { useTabStore } from "@/stores/tab-store";
import dynamic from 'next/dynamic';
import { memo } from 'react';

const DashboardPage = memo(dynamic(() => import('./dashboard/page'), {
    loading: () => <div>Loading...</div>,
    ssr: false
}));

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
                <main className="flex-1 overflow-hidden bg-background/80 backdrop-blur-sm border-2 border-border/40/">
                    <div className="h-full p-4 flex gap-2">
                        <div className="flex-1 bg-background/60 backdrop-blur-sm rounded-lg border-2 border-border/40 shadow-lg dark:shadow-slate-900/20 p-4">
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="h-full flex flex-col"
                            >
                                <TabsList className="w-full justify-start bg-background/80 backdrop-blur-sm shadow-sm border-b-2 border-border/30">
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

                                <div className="flex-1 mt-4 overflow-hidden">
                                    <div style={{ display: activeTab === "dashboard" ? "block" : "none", height: "100%" }}>
                                        <DashboardPage />
                                    </div>
                                    {tabs.map((tab) => {
                                        const TabComponent = dynamic(tab.lazyComponent, {
                                            loading: () => <div>Loading...</div>,
                                            ssr: false
                                        });
                                        return (
                                            <div
                                                key={tab.id}
                                                style={{
                                                    display: activeTab === tab.id ? "block" : "none",
                                                    height: "100%"
                                                }}
                                            >
                                                <TabComponent />
                                            </div>
                                        );
                                    })}
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
