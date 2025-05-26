// At the top of your file, add these imports (for type help, if needed):

import axios from 'axios';

export async function readAppleData(): Promise<any> {
    const API_KEY = 'CC5MAHI6NBQ9X444';
    const stockSymbol = 'AAPL';
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&outputsize=full&apikey=${API_KEY}`;

    const response = await axios.get(url, {
        headers: { 'User-Agent': 'axios' }
    });
    return response.data;
}