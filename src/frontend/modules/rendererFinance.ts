import { Chart, ChartConfiguration, registerables, TimeScale } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { parse } from 'date-fns';

// Register chart.js components
Chart.register(...registerables, TimeScale, CandlestickController, CandlestickElement);

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

  constructor() {
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
      x: parse(timeStr, 'MM/dd/yyyy', new Date()).getTime(), // parse the date string into a Date object and get timestamp
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
