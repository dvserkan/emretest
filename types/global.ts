interface FormatNumberOptions {
    decimals?: number;
    delimiter?: string;
    decimalPoint?: string;
    prefix?: string;
    suffix?: string;
}

interface IntlFormatNumberOptions {
    locale?: string;
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}
