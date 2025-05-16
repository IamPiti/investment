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

export interface priceHistory {
    time: string;       // or Date if you prefer Date objects
    close: number;
    volume: number;
    open: number;
    high: number;
    low: number;
    adjClose: number;
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