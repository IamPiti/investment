import { State } from '../common/types';
import { Renderer } from './modules/renderer';
import { RendererFinance } from './modules/rendererFinance';
import { calculateStockValue } from '../common/helpers';
import { Actions } from './modules/actions';
import { AppleDataPoint, ChartData } from './modules/rendererFinance'; // import your interfaces

let state: State;

const renderer = new Renderer();
const rendererFinance = new RendererFinance();
const actions = new Actions();

const app = async () => {
  // Initialize renderers
  state = await actions.updatePrices(state);
  updateUI(state);
  renderer.updateChartDisplay(state.wealthHistory, state.timeLabels);

  // Update prices every 5 seconds
  setInterval(async () => {
    state = await actions.updatePrices(state);
    updateUI(state);
    renderer.updateChartDisplay(state.wealthHistory, state.timeLabels);
  }, 5000);

  // Test for Apple data
  const test: { state: AppleDataPoint[] } = await actions.readApple();
  console.log('Test Apple Data:', test);

  const rawData = test.state;

  const chartData: ChartData = {
    time: rawData.map((d) => d.time),
    open: rawData.map((d) => d.open),
    high: rawData.map((d) => d.high),
    low: rawData.map((d) => d.low),
    close: rawData.map((d) => d.close),
    adjclose: rawData.map((d) => d.adjclose),
    volume: rawData.map((d) => d.volume)
  };

  console.log('chartData passed to render:', chartData);
  rendererFinance.render(chartData);
};

function updateUI(state: State): void {
  renderer.updateBalance(state.balance);
  renderer.updateStockValue(calculateStockValue(state.portfolio, state.stocks));
  renderer.updateStockList(state.stocks, {
    onBuy: async (symbol: string, price: number) => {
      state = await actions.buyStock(state, symbol, price);
      updateUI(state);
    },
    onSell: async (symbol: string, price: number) => {
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

app();
