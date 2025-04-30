import { State } from '../common/types';
import { Renderer } from './modules/renderer';
import { calculateStockValue } from '../common/helpers';
import { Actions } from './modules/actions';

let state: State;

const renderer = new Renderer();
const actions = new Actions();

const app = async () => {
  // Initialize renderer

  // initial setup
  state = await actions.updatePrices(state);
  updateUI(state);
  renderer.updateChartDisplay(state.wealthHistory, state.timeLabels);

  // Update prices every 5 seconds
  setInterval(async () => {
    state = await actions.updatePrices(state);
    updateUI(state);
    renderer.updateChartDisplay(state.wealthHistory, state.timeLabels);
  }, 5000);
}

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
      // After clearing data, reload the page to start fresh
      window.location.reload();
    }
  });
  renderer.updatePortfolio(state.portfolio, state.stocks);
}

app();