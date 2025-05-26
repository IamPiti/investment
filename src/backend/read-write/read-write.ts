import sqlite3 from 'sqlite3';
import path from 'path';
import { State } from '../../common/types';
import { DEFAULT_BALANCE, DEFAULT_STOCKS } from '../../common/defaults';
import { readAppleData } from '../routes/AAPLapi';

const dbDir = path.join(process.cwd(), 'db');
const dbPath = path.join(dbDir, 'investment.db');

// Create db directory if it doesn't exist
if (!require('fs').existsSync(dbDir)) {
    require('fs').mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase().catch(console.error);
    }
});

// Initialize database tables
async function initializeDatabase() {
    return new Promise<void>((resolve, reject) => {
        db.serialize(() => {
            // Create tables
            db.run(`
                CREATE TABLE IF NOT EXISTS game_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    balance REAL NOT NULL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS Apple (
                    time DateTime PRIMARY KEY,
                    close REAL,
                    volume INTEGER,
                    open REAL,
                    high REAL,
                    low REAL,
                    adjClose REAL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS portfolio (
                    symbol TEXT PRIMARY KEY,
                    quantity INTEGER NOT NULL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS stocks (
                    symbol TEXT PRIMARY KEY,
                    price REAL NOT NULL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS wealth_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cash REAL NOT NULL,
                    stock_value REAL NOT NULL,
                    timestamp TEXT NOT NULL
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

// Save state to database
export function saveState(state: State): Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            try {
                const stmt = db.prepare('INSERT OR REPLACE INTO game_state (id, balance) VALUES (1, ?)');
                stmt.run(state.balance);
                stmt.finalize();

                // Clear and save portfolio
                db.run('DELETE FROM portfolio');
                const portfolioStmt = db.prepare('INSERT INTO portfolio (symbol, quantity) VALUES (?, ?)');
                Object.entries(state.portfolio).forEach(([symbol, quantity]) => {
                    portfolioStmt.run(symbol, quantity);
                });
                portfolioStmt.finalize();

                // Clear and save stocks
                db.run('DELETE FROM stocks');
                const stocksStmt = db.prepare('INSERT INTO stocks (symbol, price) VALUES (?, ?)');
                state.stocks.forEach(stock => {
                    stocksStmt.run(stock.symbol, stock.price);
                });
                stocksStmt.finalize();

                // Dynamically add a column for each stock symbol if it doesn't exist, then insert latest wealth history entry
                if (state.wealthHistory.length > 0 && state.timeLabels.length > 0) {
                    const lastWealth = state.wealthHistory[state.wealthHistory.length - 1];
                    const lastTime = state.timeLabels[state.timeLabels.length - 1];

                    // Get all stock symbols
                    const stockSymbols = state.stocks.map(stock => stock.symbol);

                    // Helper to check and add columns for each stock symbol
                    const addColumns = (symbols: string[], cb: () => void) => {
                        let pending = symbols.length;
                        if (pending === 0) return cb();
                        symbols.forEach(symbol => {
                            const colName = symbol.replace(/[^a-zA-Z0-9_]/g, '_'); // sanitize
                            db.run(
                                `ALTER TABLE wealth_history ADD COLUMN "${colName}" REAL`,
                                [],
                                // Ignore error if column exists
                                () => {
                                    if (--pending === 0) cb();
                                }
                            );
                        });
                    };

                    addColumns(stockSymbols, () => {
                        // Build columns and values for insert
                        const columns = ['cash', 'stock_value', 'timestamp', ...stockSymbols.map(s => `"${s.replace(/[^a-zA-Z0-9_]/g, '_')}"`)];
                        const placeholders = columns.map(() => '?').join(', ');
                        const values = [
                            lastWealth.cash,
                            lastWealth.stockValue,
                            lastTime,
                            ...stockSymbols.map(symbol => {
                                const stock = state.stocks.find(s => s.symbol === symbol);
                                return stock ? stock.price : null;
                            })
                        ];

                        const sql = `INSERT INTO wealth_history (${columns.join(', ')}) VALUES (${placeholders})`;
                        db.run(sql, values, (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                            } else {
                                db.run('COMMIT');
                                resolve();
                            }
                        });
                    });
                } else {
                    db.run('COMMIT');
                    resolve();
                }
            } catch (error) {
                db.run('ROLLBACK');
                reject(error);
            }
        });
    });
}

// Load state from database
export async function clearDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            try {
                db.run('DELETE FROM game_state');
                db.run('DELETE FROM portfolio');
                db.run('DELETE FROM stocks');
                db.run('DELETE FROM wealth_history');
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                db.run('ROLLBACK');
                reject(error);
            }
        });
    });
}

export function loadState(): Promise<State> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const state: State = {
                balance: 0,
                portfolio: {},
                stocks: [],
                wealthHistory: [],
                timeLabels: []
            };

            // Load balance
            db.get<{ balance: number }>('SELECT balance FROM game_state WHERE id = 1', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                state.balance = row?.balance ?? DEFAULT_BALANCE; // Default starting balance

                // Load portfolio
                db.all<{ symbol: string; quantity: number }>('SELECT symbol, quantity FROM portfolio', (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    rows?.forEach(row => {
                        state.portfolio[row.symbol] = row.quantity;
                    });

                    // Load stocks
                    db.all<{ symbol: string; price: number }>('SELECT symbol, price FROM stocks', (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        state.stocks = (rows?.length && rows?.map(row => ({
                            symbol: row.symbol,
                            price: row.price
                        }))) || DEFAULT_STOCKS;

                        // Load wealth history (last 100 entries)
                        db.all(
                            `SELECT cash, stock_value, timestamp 
                             FROM wealth_history 
                             ORDER BY id DESC LIMIT 100`, 
                            (err, rows: { cash: number; stock_value: number; timestamp: string }[] | undefined) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                if (rows) {
                                    rows.reverse(); // Reverse to get chronological order
                                    state.wealthHistory = rows.map(row => ({
                                        cash: row.cash,
                                        stockValue: row.stock_value
                                    }));
                                    state.timeLabels = rows.map(row => row.timestamp);
                                }
                                resolve(state);
                            }
                        );
                    });
                });
            });
        });
    });
}



// Save Apple data to database
export async function saveAppleData(timeSeries: Record<string, any>) {
    return new Promise<void>((resolve, reject) => {
        db.serialize(() => {
            const stmt = db.prepare(
                `INSERT OR REPLACE INTO apple 
                (time, close, volume, open, high, low, adjClose) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`
            );
            for (const [date, daily] of Object.entries(timeSeries)) {
                stmt.run(
                    date,
                    Number(daily["4. close"]),
                    Number(daily["5. volume"]),
                    Number(daily["1. open"]),
                    Number(daily["2. high"]),
                    Number(daily["3. low"]),
                    Number(daily["5. adjclose"] || daily["4. close"]) // use adjusted if available
                );
            }
            stmt.finalize((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

export function loadAppleData(): Promise<any> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
        
            // Load balance
            db.all<any>('SELECT * FROM apple', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                //console.log(row);
                resolve(row);
            });
        });
    });
}


/*
export async function fetchAndSaveApple() {
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
*/