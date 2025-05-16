import { Portfolio, Stock } from "./types";

export function calculateStockValue(portfolio: Portfolio, stocks: Stock[]): number {
    return Object.entries(portfolio).reduce((sum, [symbol, qty]) => {
        const stock = stocks.find(s => s.symbol === symbol);
        return sum + (stock ? qty * stock.price : 0);
    }, 0);
}