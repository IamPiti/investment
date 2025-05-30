import { Request, Response } from 'express';
import { StockActionRequest, StateResponse, ErrorResponse } from '../../common/types';
import { loadAppleData} from '../read-write/read-write';


export async function readApple(req: Request<{}, StateResponse | ErrorResponse, StockActionRequest>, res: Response<StateResponse | ErrorResponse>) {
    try {
        const state = await loadAppleData();
        //const state = await load30dayData();
        res.json({ state }); 
    } catch (error) {
        console.error('Error in readApple:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}