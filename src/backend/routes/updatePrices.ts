import { Request, Response } from 'express';
import { UpdatePricesRequest, StateResponse, ErrorResponse } from '../../common/types';
import { calculateStockValue } from '../../common/helpers';
import { loadState, saveState } from '../read-write/read-write';

export async function updatePrices(req: Request<{}, StateResponse | ErrorResponse, UpdatePricesRequest>, res: Response<StateResponse | ErrorResponse>) {
    try {
        const { stateId } = req.body;
        
        if (!stateId) {
            return res.status(400).json({ error: 'Missing stateId parameter' });
        }

        const state = await loadState();

        // Update stock prices
        state.stocks.forEach(stock => {
            const change = (Math.random()-0.4)/10 + 1;
            stock.price = stock.price * change;
        });

        // Record wealth
        const stockValue = calculateStockValue(state.portfolio, state.stocks);
        const now = new Date();
        const label = now.toLocaleTimeString();
        
        state.timeLabels.push(label);
        state.wealthHistory.push({ 
            cash: state.balance, 
            stockValue: stockValue 
        });

        if (state.timeLabels.length > 100) {
            state.timeLabels.shift();
            state.wealthHistory.shift();
        }

        await saveState(state);
        res.json({ state });
    } catch (error) {
        console.error('Error in updatePrices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
