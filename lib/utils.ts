import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface FormatNumberOptions {
    decimals?: number;
    delimiter?: string;
    decimalPoint?: string;
    prefix?: string;
    suffix?: string;
}

interface IntlFormatNumberOptions {
    locale?: string;
    style?: 'decimal' | 'currency' | 'percent' | 'unit';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const formatDateTimeDMY = (date: Date | undefined) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export const formatDateTimeYMDHIS = (date: Date | undefined) => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatNumber = (
    value: number | string | null | undefined,
    options: FormatNumberOptions = {}
): string => {
    const {
        decimals = 2,
        delimiter = ',',
        decimalPoint = '.',
        prefix = '',
        suffix = ''
    } = options;

    try {
        if (value === null || value === undefined) {
            return '';
        }

        const number = typeof value === 'string'
            ? parseFloat(value.replace(/[^\d.-]/g, ''))
            : value;

        if (isNaN(number)) {
            return '';
        }

        const isInteger = Number.isInteger(number);
        const actualDecimals = isInteger ? 0 : decimals;

        const [integerPart, decimalPart] = Math.abs(number)
            .toFixed(actualDecimals)
            .split('.');

        const formattedIntegerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            delimiter
        );

        const sign = number < 0 ? '-' : '';

        return `${prefix}${sign}${formattedIntegerPart}${decimalPart ? decimalPoint + decimalPart : ''}${suffix}`;
    } catch (error) {
        console.error('Formatlama hatası:', error);
        return value?.toString() || '';
    }
}

export const formatNumberIntl = (
    value: number | string | null | undefined,
    options: IntlFormatNumberOptions = {}
): string => {
    const {
        locale = 'tr-TR',
        style = 'decimal',
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        currency
    } = options;

    try {
        if (value === null || value === undefined) {
            return '';
        }

        const number = typeof value === 'string'
            ? parseFloat(value.replace(/[^\d.-]/g, ''))
            : value;

        if (isNaN(number)) {
            return '';
        }

        const isInteger = Number.isInteger(number);

        const formatter = new Intl.NumberFormat(locale, {
            style,
            currency,
            minimumFractionDigits: isInteger ? 0 : minimumFractionDigits,
            maximumFractionDigits
        });

        return formatter.format(number);
    } catch (error) {
        console.error('Formatlama hatası:', error);
        return value?.toString() || '';
    }
}
