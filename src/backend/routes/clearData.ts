import { Request, Response } from 'express';
import { clearDatabase } from '../read-write/read-write';

export async function clearData(_req: Request, res: Response) {
    try {
        await clearDatabase();
        res.json({ message: 'Database cleared successfully' });
    } catch (error) {
        console.error('Error clearing database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
