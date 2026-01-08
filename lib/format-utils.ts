export const getCurrencySymbol = (currencyCode: string): string => {
    switch (currencyCode) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'PHP': return '₱';
        default: return '₱';
    }
};

export const formatCurrency = (amount: number, currencyCode: string = 'PHP'): string => {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
