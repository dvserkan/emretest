import React from 'react';
import { OrderHeader, OrderPayment, OrderTransaction } from '@/types/tables';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Users, Receipt, CreditCard, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderDetailDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    orderDetail: Array<{
        header: string;
        payments: string;
        transactions: string;
    }> | null;
    loading: boolean;
}

interface ParsedOrderHeader extends OrderHeader {
    OrderID: string;
    EmployeeName: string;
    GuestNumber: number;
    SubTotal: number;
    AmountDue: number;
}

interface ParsedTransaction extends Omit<OrderTransaction, 'ProductName' | 'UnitPrice' | 'ParentLineID'> {
    TransactionID: string;
    MenuItemText: string;
    MenuItemUnitPrice: number;
    ExtendedPrice: number;
    ParentLineID: string | null;
}

interface ParsedPayment extends Omit<OrderPayment, 'Amount'> {
    PaymentMethodName: string;
    AmountPaid: number;
    AmountChange: number;
}

const formatTransactions = (transactions: string): ParsedTransaction[][] => {
    try {
        const parsedTransactions = JSON.parse(transactions) as ParsedTransaction[];
        const result: ParsedTransaction[][] = [];
        const transactionMap = new Map<string, ParsedTransaction[]>();

        parsedTransactions.forEach((transaction) => {
            if (!transaction.ParentLineID) {
                transactionMap.set(transaction.TransactionID, []);
                result.push([transaction]);
            }
        });

        parsedTransactions.forEach((transaction) => {
            if (transaction.ParentLineID) {
                const parentGroup = transactionMap.get(transaction.ParentLineID);
                if (parentGroup) {
                    parentGroup.push(transaction);
                }
            }
        });

        return result;
    } catch (error) {
        console.error('Transaction parse error:', error);
        return [];
    }
};

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Sipariş detayları yükleniyor...</p>
    </div>
);

const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Sipariş detayları alınamadı</p>
        <p className="text-xs text-muted-foreground">Lütfen daha sonra tekrar deneyin</p>
    </div>
);

export function OrderDetailDialog({ isOpen, onOpenChange, orderDetail, loading }: OrderDetailDialogProps) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[800px]">
                {loading || !orderDetail ? (
                    <LoadingState />
                ) : (() => {
                    try {
                        const orderData = orderDetail[0];
                        if (!orderData) {
                            return <ErrorState />;
                        }

                        const header = JSON.parse(orderData.header) as ParsedOrderHeader;
                        const payments = orderData.payments ? JSON.parse(orderData.payments) as ParsedPayment[] : [];
                        const formattedTransactions = formatTransactions(orderData.transactions);

                        return (
                            <div className="max-h-[80vh] flex flex-col">
                                <DialogHeader className="space-y-1 pb-4 border-b">
                                    <DialogTitle className="text-xl font-semibold">
                                        Sipariş #{header.OrderID}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{header.OrderKey}</span>
                                        <span>•</span>
                                        <span>{header.SatisTuru}</span>
                                    </div>
                                </DialogHeader>

                                <ScrollArea className="flex-1 pr-4 mt-4">
                                    <div className="space-y-6">
                                        {/* Info Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-2 text-sm bg-muted/40 p-3 rounded-md hover:bg-muted/60 transition-colors">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span>{header.TarihText}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm bg-muted/40 p-3 rounded-md hover:bg-muted/60 transition-colors">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>{header.EmployeeName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm bg-muted/40 p-3 rounded-md hover:bg-muted/60 transition-colors">
                                                <Users className="h-4 w-4 text-primary" />
                                                <span>{header.GuestNumber} Kişi</span>
                                            </div>
                                        </div>

                                        {/* Products */}
                                        <Card>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-primary" />
                                                    <h3 className="font-medium">Ürünler</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {formattedTransactions.map((group, groupIndex) => (
                                                        <div key={groupIndex} className="space-y-2">
                                                            {group.map((transaction) => (
                                                                <div
                                                                    key={transaction.TransactionID}
                                                                    className={cn(
                                                                        "flex items-start justify-between p-3 rounded-lg transition-all",
                                                                        transaction.ParentLineID
                                                                            ? "ml-4 bg-muted/30 hover:bg-muted/50"
                                                                            : "bg-muted hover:bg-muted/80",
                                                                        transaction.Status === 'İptal' && "opacity-60"
                                                                    )}
                                                                >
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">
                                                                                {transaction.MenuItemText}
                                                                            </span>
                                                                            {transaction.Status === 'İptal' && (
                                                                                <Badge variant="destructive" className="text-xs">
                                                                                    İptal
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {transaction.SaatText}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-medium">
                                                                            {new Intl.NumberFormat('tr-TR', {
                                                                                style: 'currency',
                                                                                currency: 'TRY'
                                                                            }).format(transaction.ExtendedPrice)}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {transaction.Quantity} x {new Intl.NumberFormat('tr-TR', {
                                                                                style: 'currency',
                                                                                currency: 'TRY'
                                                                            }).format(transaction.MenuItemUnitPrice)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Payments - Only show if payments exist */}
                                        {payments && payments.length > 0 && (
                                            <Card>
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-primary" />
                                                        <h3 className="font-medium">Ödemeler</h3>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {payments.map((payment, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                                                            >
                                                                <div>
                                                                    <div className="font-medium">{payment.PaymentMethodName}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {payment.SaatText}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-medium">
                                                                        {new Intl.NumberFormat('tr-TR', {
                                                                            style: 'currency',
                                                                            currency: 'TRY'
                                                                        }).format(payment.AmountPaid)}
                                                                    </div>
                                                                    {payment.AmountChange > 0 && (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Para Üstü: {new Intl.NumberFormat('tr-TR', {
                                                                                style: 'currency',
                                                                                currency: 'TRY'
                                                                            }).format(payment.AmountChange)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Totals */}
                                        <Card>
                                            <CardContent className="p-6 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Ara Toplam</span>
                                                    <span>
                                                        {new Intl.NumberFormat('tr-TR', {
                                                            style: 'currency',
                                                            currency: 'TRY'
                                                        }).format(header.SubTotal)}
                                                    </span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between text-lg font-medium">
                                                    <span>Toplam</span>
                                                    <span className="text-primary">
                                                        {new Intl.NumberFormat('tr-TR', {
                                                            style: 'currency',
                                                            currency: 'TRY'
                                                        }).format(header.AmountDue)}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </ScrollArea>
                            </div>
                        );
                    } catch (error) {
                        console.error('Dialog render error:', error);
                        return <ErrorState />;
                    }
                })()}
            </DialogContent>
        </Dialog>
    );
}
