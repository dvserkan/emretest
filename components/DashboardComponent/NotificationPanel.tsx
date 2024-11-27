"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { motion } from "framer-motion";
import {
    Bell,
    CheckCircle2,
    Ban,
    Tag,
    Receipt,
    TrendingDown,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Notification } from "@/types/tables";
import { useOrderDetail } from "@/hooks/use-orderdetail";
import { OrderDetailDialog } from "./OrderDetailDialog";

export default function NotificationPanel() {
    const { notifications, loading, error } = useNotifications();
    const {
        isOpen,
        setIsOpen,
        orderDetail,
        fetchOrderDetail,
    } = useOrderDetail();

    const getNotificationStyle = (type: Notification["type"]) => {
        switch (type) {
            case "sale":
                return {
                    icon: CheckCircle2,
                    color: "text-green-500",
                    bgColor: "bg-green-100/90 dark:bg-green-500/10",
                    borderColor: "border-green-200 dark:border-green-500/20",
                    label: "Satış",
                    labelClass:
                        "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
                    buttonClass:
                        "hover:bg-green-200/50 dark:hover:bg-green-500/20",
                };
            case "discount":
                return {
                    icon: Tag,
                    color: "text-blue-500",
                    bgColor: "bg-blue-100/90 dark:bg-blue-500/10",
                    borderColor: "border-blue-200 dark:border-blue-500/20",
                    label: "İndirim",
                    labelClass:
                        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
                    buttonClass:
                        "hover:bg-blue-200/50 dark:hover:bg-blue-500/20",
                };
            case "cancel":
                return {
                    icon: Ban,
                    color: "text-red-500",
                    bgColor: "bg-red-100/90 dark:bg-red-500/10",
                    borderColor: "border-red-200 dark:border-red-500/20",
                    label: "İptal",
                    labelClass:
                        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
                    buttonClass: "hover:bg-red-200/50 dark:hover:bg-red-500/20",
                };
            case "alert":
                return {
                    icon: AlertCircle,
                    color: "text-amber-500",
                    bgColor: "bg-amber-100/90 dark:bg-amber-500/10",
                    borderColor: "border-amber-200 dark:border-amber-500/20",
                    label: "Uyarı",
                    labelClass:
                        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
                    buttonClass:
                        "hover:bg-amber-200/50 dark:hover:bg-amber-500/20",
                };
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                <p>Bildirimler yüklenirken hata oluştu</p>
            </div>
        );
    }

    return (
        <>
            <div>
                {/* Header */}
                <div className="bg-background/95 backdrop-blur-sm pb-4">
                    <div className="flex flex-row items-center sm:justify-between justify-center mb-4 gap-3 p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-foreground" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                            <h2 className="text-lg font-semibold">
                                Olay Bildirimleri
                            </h2>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-2 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground ml-2">
                            Canlı
                        </motion.div>
                    </div>

                    <div className="flex gap-2">
                        {["sale", "discount", "cancel", "alert"].map((type) => {
                            const style = getNotificationStyle(
                                type as Notification["type"]
                            );
                            return (
                                <span
                                    key={type}
                                    className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity",
                                        style.labelClass
                                    )}
                                >
                                    {style.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
                {/* Bildirimler */}
                <div
                    className="space-y-2 p-4 sm:p-0 pr-2 sm:pr-2 overflow-y-auto max-h-[calc(70vh)] 
         [&::-webkit-scrollbar]:w-2
         [&::-webkit-scrollbar-thumb]:bg-gray-300/50
         [&::-webkit-scrollbar-thumb]:rounded-full
         [&::-webkit-scrollbar-track]:bg-transparent
         dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
         hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
         dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
                >
                    {notifications.map((notification, index) => {
                        const style = getNotificationStyle(notification.type);
                        const Icon = style.icon;

                        return (
                            <motion.div
                                key={notification.autoId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                }}
                                className={cn(
                                    "group p-4 rounded-xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm border",
                                    style.bgColor,
                                    style.borderColor
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <Icon
                                            className={cn(
                                                "h-5 w-5 flex-shrink-0 transition-all duration-300",
                                                style.color,
                                                "group-hover:scale-110"
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm text-foreground line-clamp-1">
                                                {notification.branchName}
                                            </p>
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0",
                                                    style.labelClass
                                                )}
                                            >
                                                {style.label}
                                            </span>
                                        </div>
                                        {/* Metin wrap için güncellenen kısım */}
                                        <div className="flex items-start gap-2">
                                            <Receipt className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                                            <p className="text-sm text-muted-foreground break-words whitespace-normal">
                                                #{notification.logDetail}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(
                                                        notification.amountDue
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatTime(
                                                    notification.orderDateTime
                                                )}
                                            </span>
                                        </div>
                                        {notification.discountAmount > 0 && (
                                            <div className="text-xs text-blue-500 mt-1">
                                                İndirim:{" "}
                                                {formatCurrency(
                                                    notification.discountAmount
                                                )}
                                            </div>
                                        )}
                                        {notification.voidAmount > 0 && (
                                            <div className="text-xs text-red-500 mt-1">
                                                İptal:{" "}
                                                {formatCurrency(
                                                    notification.voidAmount
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => fetchOrderDetail(notification.orderKey)}
                                            disabled={loading}
                                            className={cn(
                                                "w-full mt-2 text-center px-3 py-1.5 rounded-lg",
                                                "text-xs font-medium transition-colors duration-300",
                                                "bg-background/30 hover:bg-background/50",
                                                "dark:bg-background/20 dark:hover:bg-background/40",
                                                loading && "opacity-50 cursor-not-allowed",
                                                style.buttonClass
                                            )}
                                        >
                                            {loading ? "Yükleniyor..." : "Detayları Görüntüle"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            <OrderDetailDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                orderDetail={orderDetail as Array<{
                    header: string;
                    payments: string;
                    transactions: string;
                }> | null}
                loading={loading}
            />
        </>
    );
}
