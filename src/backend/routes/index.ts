import { Router } from 'express';
import { buyStock } from './buyStock';
import { sellStock } from './sellStock';
import { updatePrices } from './updatePrices';
import { clearData } from './clearData';
import { readApple } from './readApple';

const router = Router();

// Stock trading routes
router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.post('/update-prices', updatePrices);
router.post('/clear-data', clearData);
router.get('/read-apple', readApple);


export default router;
