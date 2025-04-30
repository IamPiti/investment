import { Request, Response } from 'express';
import { StockActionRequest, StateResponse, ErrorResponse } from '../../common/types';
import { loadState, saveState } from '../read-write/read-write';

export async function sellStock(req: Request<{}, StateResponse | ErrorResponse, StockActionRequest>, res: Response<StateResponse | ErrorResponse>) {
    try {
        const { stateId, symbol, price } = req.body;
        
        if (!stateId || !symbol || !price) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const state = await loadState();

        if (state.portfolio[symbol] && state.portfolio[symbol] > 0) {
            state.portfolio[symbol] -= 1;
            state.balance += price;
            if (state.portfolio[symbol] === 0) {
                delete state.portfolio[symbol];
            }
            await saveState(state);
            res.json({ state });
        } else {
            res.status(400).json({ error: `You don't own any shares of ${symbol}` });
        }
    } catch (error) {
        console.error('Error in sellStock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
