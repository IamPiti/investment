import { calculateStockValue } from "../../common/helpers";
import { State } from "../../common/types";

export class Actions {
    private readonly API_URL = 'http://localhost:4000/api';
    private readonly stateId = 1; // We'll use a fixed state ID since we only have one game state

    async buyStock(state: State, symbol: string, price: number): Promise<State> {
        try {
            const response = await fetch(`${this.API_URL}/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stateId: this.stateId, symbol, price }),
            });
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                return state;
            }
            
            return data.state;
        } catch (error) {
            console.error('Error:', error);
            return state;
        }
    }
    
    async sellStock(state: State, symbol: string, price: number): Promise<State> {
        try {
            const response = await fetch(`${this.API_URL}/sell`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stateId: this.stateId, symbol, price }),
            });
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                return state;
            }
            
            return data.state;
        } catch (error) {
            console.error('Error:', error);
            return state;
        }
    }
    
    async updatePrices(state: State): Promise<State> {
        try {
            const response = await fetch(`${this.API_URL}/update-prices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stateId: this.stateId }),
            });
            const data = await response.json();
            
            if (data.error) {
                console.error('Error updating prices:', data.error);
                return state;
            }
            
            return data.state;
        } catch (error) {
            console.error('Error:', error);
            return state;
        }
    }

    async clearData(): Promise<void> {
        try {
            const response = await fetch(`${this.API_URL}/clear-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                return;
            }
            
            alert('Game data cleared successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to clear game data');
        }
    }

    async readApple(): Promise<any> {
        try {
            const response = await fetch(`${this.API_URL}/read-apple`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    async saveApple(): Promise<any> {
        try {
            const response = await fetch(`${this.API_URL}/api-request`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
}