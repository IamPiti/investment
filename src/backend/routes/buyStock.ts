import { Request, Response } from 'express';
import { StockActionRequest, StateResponse, ErrorResponse } from '../../common/types';
import { loadState, saveState } from '../read-write/read-write';

export async function buyStock(req: Request<{}, StateResponse | ErrorResponse, StockActionRequest>, res: Response<StateResponse | ErrorResponse>) {
    try {
        const { stateId, symbol, price } = req.body;
        
        if (!stateId || !symbol || !price) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const state = await loadState();

        if (state.balance >= price) {
            state.balance -= price;
            state.portfolio[symbol] = (state.portfolio[symbol] || 0) + 1;
            await saveState(state);
            res.json({ state });
        } else {
            res.status(400).json({ error: "Not enough balance!" });
        }
    } catch (error) {
        console.error('Error in buyStock:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
