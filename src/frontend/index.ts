import { State } from '../common/types';
import { Renderer } from './modules/renderer';
import { RendererFinance, AppleDataPoint, ChartData } from './modules/rendererFinance';
import { calculateStockValue } from '../common/helpers';
import { Actions } from './modules/actions';

let state: State;
const actions = new Actions();
const renderer = new Renderer();
let rendererFinance: RendererFinance;

async function app(): Promise<void> {
  // Initial fetch & render
  state = await actions.updatePrices(state);
  updateUI(state);
  renderer.updateChartDisplay(state.wealthHistory, state.timeLabels);

  // Refresh every 100 seconds
  setInterval(async () => {
    state = await actions.updatePrices(state);
    updateUI(state);
    renderer.updateChartDisplay(state.wealthHistory, state.timeLabels);
  }, 100_000);
  
}

function updateUI(state: State): void {
  renderer.updateBalance(state.balance);
  renderer.updateStockValue(calculateStockValue(state.portfolio, state.stocks));
  renderer.updateStockList(state.stocks, {
    onBuy: async (symbol, price) => {
      state = await actions.buyStock(state, symbol, price);
      updateUI(state);
    },
    onSell: async (symbol, price) => {
      state = await actions.sellStock(state, symbol, price);
      updateUI(state);
    },
    onClearData: async () => {
      await actions.clearData();
      window.location.reload();
    }
  });
  renderer.updatePortfolio(state.portfolio, state.stocks);
}

document.addEventListener('DOMContentLoaded', () => {
  // Wire up the finance renderer *after* the canvas exists
  rendererFinance = new RendererFinance({
    onsaveApple: async () => {
      // Fetch raw Apple data
      const result = await actions.saveApple();
      const rawData: AppleDataPoint[] = result.state;

      // Now annotate each `.map` so `d` is known to be AppleDataPoint
      const chartData: ChartData = {
        time:     rawData.map((d: AppleDataPoint) => d.time),
        open:     rawData.map((d: AppleDataPoint) => d.open),
        high:     rawData.map((d: AppleDataPoint) => d.high),
        low:      rawData.map((d: AppleDataPoint) => d.low),
        close:    rawData.map((d: AppleDataPoint) => d.close),
        adjclose: rawData.map((d: AppleDataPoint) => d.adjclose),
        volume:   rawData.map((d: AppleDataPoint) => d.volume),
      };

      // Render your candlesticks
      rendererFinance.render(chartData);
    },

    onreadApple: async () => {
      // Fetch the Apple data from the backend
      const result = await actions.readApple();
      const rawData: AppleDataPoint[] = result.state;

      // Now annotate each `.map` so `d` is known to be AppleDataPoint
      const chartData: ChartData = {
        time:     rawData.map((d: AppleDataPoint) => d.time),
        open:     rawData.map((d: AppleDataPoint) => d.open),
        high:     rawData.map((d: AppleDataPoint) => d.high),
        low:      rawData.map((d: AppleDataPoint) => d.low),
        close:    rawData.map((d: AppleDataPoint) => d.close),
        adjclose: rawData.map((d: AppleDataPoint) => d.adjclose),
        volume:   rawData.map((d: AppleDataPoint) => d.volume),
      };

      // Render your candlesticks
      rendererFinance.render(chartData);
    }
  });

  // Kick off the rest of your app
  app();
});
