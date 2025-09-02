
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Starters' | 'Heavy Snacks' | 'Rice & Noodles' | 'Sides';
}

// This interface is used when adding items to the cart on the frontend.
export interface CartItem extends MenuItem {
  quantity: number;
}

// This interface now more closely matches the line items from the backend.
export interface OrderItem {
    id: string; // was not present, but good for react keys
    name: string; // mapped from 'sku'
    quantity: number; // mapped from 'qty'
    price: number;
}


// This interface now matches the structure from the backend API response.
export interface Order {
  id: string; // mapped from '_id'
  token: string; // mapped from 'orderToken'
  items: OrderItem[]; // mapped from 'lineItems'
  customerName: string; // mapped from 'customer.name'
  customerPhone: string; // mapped from 'customer.phone'
  total: number; // mapped from 'amount'
  amountDue?: number; // optional amount due
  timestamp: number; // mapped from 'createdAt'
  status: 'new' | 'paid' | 'done' | 'created' | 'served'; // mapped from 'status'
}
