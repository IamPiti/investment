import { Router } from 'express';
import { buyStock } from './buyStock';
import { sellStock } from './sellStock';
import { updatePrices } from './updatePrices';
import { clearData } from './clearData';
import { readApple } from './readApple';
import { saveApple } from './saveApple';

const router = Router();

// Stock trading routes
router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.post('/update-prices', updatePrices);
router.post('/clear-data', clearData);
router.get('/read-apple', readApple);
router.get('/api-request', saveApple);


export default router;
