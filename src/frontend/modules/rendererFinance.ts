import { Chart, ChartConfiguration, registerables, TimeScale } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { parse } from 'date-fns';

declare global {
    interface Window {  
        saveApple: () => void;
    }
}

// Register chart.js components
Chart.register(...registerables, TimeScale, CandlestickController, CandlestickElement);

export interface APIaction {
    onsaveApple: () => void;
    onreadApple: () => void;
}

// Define the shape of the data
export interface AppleDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjclose: number;
  volume: number;
}

export interface ChartData {
  time: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  adjclose: number[];
  volume: number[];
}

export class RendererFinance {
  private chart: Chart;
  
  private actions: APIaction | null = null;

  public setActions(actions: APIaction) {
    this.actions = actions;
  }

  constructor(actions: APIaction | null = null) {
    this.actions = actions;

    // Create load API button
    const loadApiButton = document.createElement('button');
    loadApiButton.textContent = 'Load API';
    loadApiButton.className = 'load-api-button';
    loadApiButton.style.cssText = 'position: fixed; top: 50px; right: 10px; padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;';
    document.body.appendChild(loadApiButton);

    // Button handlers
    loadApiButton.onclick = () => {
      if (confirm('Load data with API?') && this.actions) {
      this.actions.onsaveApple();
      this.actions.onreadApple();
      } else if (!this.actions) {
        console.error('No API action registered!');
      }
    };

    const canvas = document.getElementById('appleData') as HTMLCanvasElement;
    if (!canvas) throw new Error('Missing required DOM elements');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    this.chart = this.initializeStockPriceChart(ctx);
  }

  private initializeStockPriceChart(ctx: CanvasRenderingContext2D): Chart {
    const config: ChartConfiguration<'candlestick'> = {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'AAPL Stock',
            data: [], // will be filled later with {x, o, h, l, c}
            borderColor: 'black'
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' }
          },
          y: {
            beginAtZero: false
          }
        }
      }
    };
    return new Chart(ctx, config);
  }

  // Render the candlestick chart with the data
  public render(data: ChartData): void {
    if (!this.chart) {
      throw new Error('Chart is not initialized');
    }

    if (!data || !data.time || !Array.isArray(data.time)) {
      console.error('Invalid data passed to render:', data);
      return;
    }

    // Prepare the candlestick data from raw data
    const candlestickData = data.time.map((timeStr, i) => ({
      x: parse(timeStr, 'yyyy-MM-dd', new Date()).getTime(), // parse the date string into a Date object and get timestamp
      o: data.open[i],
      h: data.high[i],
      l: data.low[i],
      c: data.close[i]
    }));

    // Set the chart data
    this.chart.data.datasets[0].data = candlestickData;
    this.chart.update();
  }
}
