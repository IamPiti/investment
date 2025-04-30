import { Stock, Portfolio, WealthData } from '../../common/types';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

declare global {
    interface Window {
        buyStock: (symbol: string, price: number) => void;
        sellStock: (symbol: string, price: number) => void;
    }
}

export interface StockAction {
    onBuy: (symbol: string, price: number) => void;
    onSell: (symbol: string, price: number) => void;
}

export interface GameActions extends StockAction {
    onClearData: () => void;
}

export interface ChartData {
    timeLabels: string[];
    cashData: number[];
    stockData: number[];
    totalData: number[];
}

// Register all Chart.js components
Chart.register(...registerables);

export class Renderer {
    private readonly balanceElement: HTMLElement;
    private readonly stockValueElement: HTMLElement;
    private readonly stockListElement: HTMLElement;
    private readonly portfolioElement: HTMLElement;
    private readonly datetimeElement: HTMLElement;
    private chart: Chart;

    private actions: GameActions | null = null;

    constructor() {
        const balanceElement = document.getElementById('balance');
        const stockValueElement = document.getElementById('stockValue');
        const stockListElement = document.getElementById('stock-list');
        const portfolioElement = document.getElementById('portfolio');
        const datetimeElement = document.getElementById('datetime');
        const chartCanvas = document.getElementById('wealthChart') as HTMLCanvasElement;
        
        // Create clear data button
        const clearDataButton = document.createElement('button');
        clearDataButton.textContent = 'Reset Game';
        clearDataButton.className = 'clear-data-button';
        clearDataButton.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 8px 16px; background-color: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;';
        document.body.appendChild(clearDataButton);
        
        let chart: Chart | null = null;
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                chart = this.initializeChart(ctx);
            }
        }
        if (!chart) {
            throw new Error('Can not create chart');
        }
        this.chart = chart;
        
        if (!balanceElement || !stockValueElement || !stockListElement || !portfolioElement || !datetimeElement || !chartCanvas) {
            throw new Error('Missing required DOM elements');
        }

        this.balanceElement = balanceElement;
        this.stockValueElement = stockValueElement;
        this.stockListElement = stockListElement;
        this.portfolioElement = portfolioElement;
        this.datetimeElement = datetimeElement;

        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000); // Update clock every second

        // Add clear data button click handler
        clearDataButton.onclick = () => {
            if (this.actions && confirm('Are you sure you want to reset the game? This will clear all your progress.')) {
                this.actions.onClearData();
            }
        };
    }

    public updateBalance(balance: number): void {
        if (this.balanceElement) {
            this.balanceElement.innerText = `Balance: $${balance.toFixed(2)}`;
        }
    }

    public updateStockValue(stockValue: number): void {
        if (this.stockValueElement) {
            this.stockValueElement.innerText = `Stock Value: $${stockValue.toFixed(2)}`;
        }
    }

    public updateStockList(stocks: Stock[], actions: GameActions): void {
        this.actions = actions;
        if (this.stockListElement) {
            // Make functions available globally for onclick handlers
            window.buyStock = actions.onBuy;
            window.sellStock = actions.onSell;
            this.stockListElement.innerHTML = '';
            stocks.forEach(stock => {
                const div = document.createElement('div');
                div.innerHTML = `
                    ${stock.symbol} - $${stock.price.toFixed(2)}
                    <button onclick="window.buyStock('${stock.symbol}', ${stock.price})">Buy</button>
                    <button onclick="window.sellStock('${stock.symbol}', ${stock.price})">Sell</button>
                `;
                this.stockListElement?.appendChild(div);
            });
        }
    }

    public updatePortfolio(portfolio: Portfolio, stocks: Stock[]): void {
        if (this.portfolioElement) {
            this.portfolioElement.innerHTML = Object.entries(portfolio).map(([symbol, qty]) => {
                const stock = stocks.find(s => s.symbol === symbol);
                const total = stock ? qty * stock.price : 0;
                return `<div>${symbol}: ${qty} shares ($${total.toFixed(2)})</div>`;
            }).join('');
        }
    }

    private updateDateTime(): void {
        if (this.datetimeElement) {
            const now = new Date();
            this.datetimeElement.innerText = now.toLocaleString();
        }
    }

    private initializeChart(ctx: CanvasRenderingContext2D): Chart {
        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Cash',
                        data: [],
                        borderColor: 'green',
                        fill: false
                    },
                    {
                        label: 'Stock Value',
                        data: [],
                        borderColor: 'blue',
                        fill: false
                    },
                    {
                        label: 'Total Wealth',
                        data: [],
                        borderColor: 'black',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        };
        return new Chart(ctx, config);
    }

    public updateChartDisplay(
        wealthHistory: WealthData[],
        timeLabels: string[]
    ): void {
        const cashData = wealthHistory.map(w => w.cash);
        const stockData = wealthHistory.map(w => w.stockValue);
        const totalData = wealthHistory.map(w => w.cash + w.stockValue);
    
        this.chart.data.labels = timeLabels;
        this.chart.data.datasets[0].data = cashData;
        this.chart.data.datasets[1].data = stockData;
        this.chart.data.datasets[2].data = totalData;   
        this.chart.update();
    }
}
