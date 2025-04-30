export interface Stock {
    symbol: string;
    price: number;
}

export interface WealthData {
    cash: number;
    stockValue: number;
}

export interface Portfolio {
    [key: string]: number;
}

export interface State {
    balance: number;
    portfolio: Portfolio;
    stocks: Stock[];
    wealthHistory: WealthData[];
    timeLabels: string[];
}

// Request interfaces
export interface StockActionRequest {
    stateId: number;
    symbol: string;
    price: number;
}

export interface UpdatePricesRequest {
    stateId: number;
}

// Response interfaces
export interface StateResponse {
    state: State;
}

export interface ErrorResponse {
    error: string;
}