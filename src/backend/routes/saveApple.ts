import { saveAppleData, loadAppleData } from '../read-write/read-write';
import { readAppleData } from '../routes/AAPLapi';

export async function saveApple() {
    try {
        const data = await readAppleData();
        const timeSeries = data["Time Series (Daily)"];
        if (timeSeries) {
            await saveAppleData(timeSeries);
            console.log('Apple data saved to DB!');
        } else {
            console.error('Alpha Vantage data does not contain Time Series (Daily)');
        }
    } catch (error) {
        console.error('Error fetching/saving Apple data:', error);
    }
}