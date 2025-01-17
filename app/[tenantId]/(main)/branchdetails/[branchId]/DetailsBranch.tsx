"use client";

import { Calendar, Store } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import BranchStats from "@/components/DashboardComponent/BranchStats";
import BranchCharts from "@/components/DashboardComponent/BranchCharts";
import OrdersTable from "@/components/DashboardComponent/OrdersTable";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BranchModel } from "@/types/tables";
import { useTabStore } from "@/stores/tab-store";

interface BranchData {
    id: string;
    name: string;
    stats: {
        checkCount: number;
        checkAverage: number;
        discount: number;
        peopleCount: number;
        peopleAverage: number;
        canceled: number;
    };
    revenue: {
        openChecks: number;
        closedChecks: number;
        total: number;
    };
    orders: Array<{
        id: string;
        checkNumber: string;
        openDate: string;
        staffName: string;
        amount: number;
        type: 'table' | 'package' | 'takeaway';
    }>;
}

interface DetailsClientProps {
    branchData: BranchData;
    allBranches: BranchData[];
}

const dateRanges = [
    { value: "today", label: "Bugün", color: "bg-blue-500" },
    { value: "yesterday", label: "Dün", color: "bg-purple-500" },
    { value: "thisWeek", label: "Bu Hafta", color: "bg-green-500" },
    { value: "lastWeek", label: "Geçen Hafta", color: "bg-yellow-500" },
    { value: "thisMonth", label: "Bu Ay", color: "bg-orange-500" },
    { value: "lastMonth", label: "Geçen Ay", color: "bg-red-500" },
    { value: "custom", label: "Özel Tarih", color: "bg-gray-500" },
];

export default function DetailsBranch({ branchData, allBranches }: DetailsClientProps) {
    const { addTab, tabs, setActiveTab } = useTabStore();
    const [dateRange, setDateRange] = useState("today");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const handleBranchChange = (branchId: string) => {
        const selectedBranch = allBranches.find(b => b.id === branchId);
        if (!selectedBranch) return;

        const tabId = `branch-${branchId}`;

        // Tab zaten açıksa sadece aktif yap
        const existingTab = tabs.find(tab => tab.id === tabId);
        if (existingTab) {
            setActiveTab(tabId);
            return;
        }

        // Yeni tab aç
        addTab({
            id: tabId,
            title: `${selectedBranch.name} Detay`,
            lazyComponent: () => Promise.resolve({
                default: () => <DetailsBranch branchData={selectedBranch} allBranches={allBranches} />
            })
        });
    };

    // BranchModel verisi oluştur
    const chartData: BranchModel = {
        BranchID: parseInt(branchData.id),
        reportValue1: branchData.name,
        reportValue2: branchData.revenue.total,
        reportValue3: branchData.revenue.closedChecks,
        reportValue4: branchData.revenue.openChecks,
        reportValue5: branchData.stats.peopleCount,
        reportValue6: branchData.stats.peopleAverage,
        reportValue7: branchData.stats.checkCount,
        reportValue8: branchData.stats.checkAverage,
        reportValue9: branchData.stats.discount
    };

    return (
        <div className="h-[calc(90vh-4rem)] overflow-y-auto w-full
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
            <div className="mx-auto space-y-6 py-6">
                <Card className="p-6 border-2 border-border/60 rounded-xl shadow-lg hover:border-border/80 transition-all duration-300">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Filtreler</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select value={branchData.id} onValueChange={handleBranchChange}>
                                <SelectTrigger className="bg-card border-2 border-border/60 rounded-xl h-12">
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Şube Seçin" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {allBranches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={branch.id}
                                            className="cursor-pointer"
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="bg-card border-2 border-border/60 rounded-xl h-12">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Tarih Aralığı Seçin" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {dateRanges.map((range) => (
                                        <SelectItem
                                            key={range.value}
                                            value={range.value}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${range.color}`} />
                                                {range.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {dateRange === "custom" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal h-12 border-2 border-border/60 rounded-xl",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {startDate ? (
                                                format(startDate, "PPP", { locale: tr })
                                            ) : (
                                                "Başlangıç Tarihi"
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal h-12 border-2 border-border/60 rounded-xl",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {endDate ? (
                                                format(endDate, "PPP", { locale: tr })
                                            ) : (
                                                "Bitiş Tarihi"
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                </Card>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <BranchStats data={branchData.stats} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <BranchCharts data={chartData} />
                </motion.div>

                <OrdersTable orders={branchData.orders} />
            </div>
        </div>
    );
}
