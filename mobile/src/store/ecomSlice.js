import { createSlice } from '@reduxjs/toolkit';

const initialProducts = [
  {
    id: 'PRD-101',
    name: 'Nexus Quantum Headset ANC',
    category: 'Audio & Wearables',
    mfgPrice: 185,
    price: 349,
    stock: 42,
    rating: 4.9,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    description: 'Lossless studio monitoring with adaptive noise cancelling and 40h battery.',
  },
  {
    id: 'PRD-102',
    name: 'Titan Pro Ergonomic Mechanical Keyboard',
    category: 'Peripherals',
    mfgPrice: 95,
    price: 189,
    stock: 18,
    rating: 4.8,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    description: 'Hot-swappable tactile switches, CNC aluminum chassis, RGB backlighting.',
  },
  {
    id: 'PRD-103',
    name: 'AeroGlide 4K Ultra Drone',
    category: 'Hardware & Drones',
    mfgPrice: 480,
    price: 899,
    stock: 7,
    rating: 4.95,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80',
    description: '3-axis gimbal stabilized drone with 45 min flight time and obstacle radar.',
  },
  {
    id: 'PRD-104',
    name: 'Apex Horizon Curved 34" Monitor',
    category: 'Ultra-Wide Displays',
    mfgPrice: 380,
    price: 649,
    stock: 12,
    rating: 4.7,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80',
    description: '165Hz Refresh rate, 1ms response, 99% sRGB color gamut for creators.',
  },
  {
    id: 'PRD-105',
    name: 'OmniCharger GaN 140W Fast Station',
    category: 'Power & Accessories',
    mfgPrice: 35,
    price: 79,
    stock: 85,
    rating: 4.65,
    isActive: false,
    image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&auto=format&fit=crop&q=80',
    description: 'Compact 4-port fast charging brick with intelligent temperature throttling.',
  },
];

const initialInvoices = [
  {
    id: 'INV-2026-081',
    client: 'Apex Global Corp',
    clientEmail: 'billing@apexglobal.com',
    amount: 3850,
    issueDate: 'Oct 10, 2026',
    dueDate: 'Nov 10, 2026',
    status: 'Paid',
    itemsCount: 4,
  },
  {
    id: 'INV-2026-082',
    client: 'Starlight Tech Inc',
    clientEmail: 'finance@starlight.io',
    amount: 1420,
    issueDate: 'Oct 14, 2026',
    dueDate: 'Nov 14, 2026',
    status: 'Pending',
    itemsCount: 2,
  },
  {
    id: 'INV-2026-083',
    client: 'Hyperion Logistics',
    clientEmail: 'accounts@hyperion.com',
    amount: 5200,
    issueDate: 'Sep 25, 2026',
    dueDate: 'Oct 15, 2026',
    status: 'Overdue',
    itemsCount: 6,
  },
  {
    id: 'INV-2026-084',
    client: 'Velox Media Agency',
    clientEmail: 'pay@veloxmedia.co',
    amount: 890,
    issueDate: 'Oct 16, 2026',
    dueDate: 'Nov 16, 2026',
    status: 'Pending',
    itemsCount: 1,
  },
];

const initialOrders = [
  {
    id: 'ORD-9821',
    customer: 'Emma Watson',
    customerEmail: 'customer@nexus.io',
    salesRep: 'Leo Vance',
    items: 'Nexus Quantum Headset ANC (x1)',
    total: 349,
    date: 'Today, 09:15 AM',
    status: 'Processing',
    trackingStep: 1, // 0: Placed, 1: Processing, 2: Shipped, 3: Delivered
  },
  {
    id: 'ORD-9818',
    customer: 'Marcus Brody',
    customerEmail: 'marcus.b@outlook.com',
    salesRep: 'Leo Vance',
    items: 'Titan Pro Keyboard (x2), OmniCharger (x1)',
    total: 457,
    date: 'Oct 15, 2026',
    status: 'Shipped',
    trackingStep: 2,
  },
  {
    id: 'ORD-9810',
    customer: 'Sophia Patel',
    customerEmail: 'sophia@creatives.co',
    salesRep: 'Direct Web',
    items: 'Apex Horizon Curved 34" Monitor (x1)',
    total: 649,
    date: 'Oct 12, 2026',
    status: 'Delivered',
    trackingStep: 3,
  },
  {
    id: 'ORD-9799',
    customer: 'David Reynolds',
    customerEmail: 'd.reynolds@techflow.com',
    salesRep: 'Leo Vance',
    items: 'AeroGlide 4K Ultra Drone (x1)',
    total: 899,
    date: 'Oct 08, 2026',
    status: 'Delivered',
    trackingStep: 3,
  },
];

const initialBills = [
  {
    id: 'BILL-401',
    title: 'Nexus Cloud VIP Subscription',
    period: 'October 2026',
    amount: 49.99,
    dueDate: 'Oct 28, 2026',
    status: 'Due',
    category: 'Subscription',
  },
  {
    id: 'BILL-398',
    title: 'Express Courier & Handling',
    period: 'Order #ORD-9821',
    amount: 15.00,
    dueDate: 'Paid on Order',
    status: 'Paid',
    category: 'Logistics',
  },
  {
    id: 'BILL-385',
    title: 'Nexus Cloud VIP Subscription',
    period: 'September 2026',
    amount: 49.99,
    dueDate: 'Sep 28, 2026',
    status: 'Paid',
    category: 'Subscription',
  },
];

const initialCustomers = [
  {
    id: 'CUST-01',
    shopName: 'Watson Creative Electronics',
    ownerName: 'Emma Watson',
    name: 'Emma Watson',
    company: 'Watson Creative Electronics',
    email: 'emma@watsonstudio.com',
    mobile: '+1 (555) 902-3341',
    phone: '+1 (555) 902-3341',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
    totalSpent: '$1,248',
    ordersCount: 4,
    status: 'VIP Gold',
  },
  {
    id: 'CUST-02',
    shopName: 'AeroDynamics Tech Hub',
    ownerName: 'Marcus Brody',
    name: 'Marcus Brody',
    company: 'AeroDynamics Tech Hub',
    email: 'marcus.b@aerodynamics.io',
    mobile: '+1 (555) 781-9920',
    phone: '+1 (555) 781-9920',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80',
    totalSpent: '$3,890',
    ordersCount: 9,
    status: 'Platinum',
  },
  {
    id: 'CUST-03',
    shopName: 'Apex Digital Devices',
    ownerName: 'Sophia Patel',
    name: 'Sophia Patel',
    company: 'Apex Digital Devices',
    email: 'sophia@apexdigital.co',
    mobile: '+1 (555) 234-8711',
    phone: '+1 (555) 234-8711',
    image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400&auto=format&fit=crop&q=80',
    totalSpent: '$2,150',
    ordersCount: 5,
    status: 'Active',
  },
  {
    id: 'CUST-04',
    shopName: 'Sterling Smart Enterprise',
    ownerName: 'Jason Sterling',
    name: 'Jason Sterling',
    company: 'Sterling Smart Enterprise',
    email: 'j.sterling@sterlingcap.com',
    mobile: '+1 (555) 890-1243',
    phone: '+1 (555) 890-1243',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
    totalSpent: '$8,450',
    ordersCount: 14,
    status: 'Enterprise VIP',
  },
];

const ecomSlice = createSlice({
  name: 'ecom',
  initialState: {
    products: initialProducts,
    invoices: initialInvoices,
    orders: initialOrders,
    bills: initialBills,
    customers: initialCustomers,
    cart: [],
    businessProfile: {
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
      companyName: 'Nexus Global Technologies Inc.',
      mobileNumber: '+1 (555) 019-2831',
      alternativeEmail: 'support@nexus-enterprise.io',
      fullAddress: '500 Howard Street, Suite 400, Financial District, San Francisco, CA 94105, USA',
      links: {
        facebook: 'https://facebook.com/nexuscommerce',
        linkedin: 'https://linkedin.com/company/nexus-commerce',
        website: 'https://nexus-commerce.io',
      },
    },
  },
  reducers: {
    addProduct: (state, action) => {
      const newProd = {
        id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
        rating: 5.0,
        ...action.payload,
      };
      state.products.unshift(newProd);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...action.payload,
        };
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({
          ...product,
          quantity: 1,
        });
      }
    },
    decreaseCartQuantity: (state, action) => {
      const productId = action.payload;
      const existing = state.cart.find((item) => item.id === productId);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          state.cart = state.cart.filter((item) => item.id !== productId);
        }
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
    createOrder: (state, action) => {
      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: 'Just now',
        status: 'Processing',
        trackingStep: 1,
        ...action.payload,
      };
      state.orders.unshift(newOrder);
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
        if (action.payload.status === 'Delivered') order.trackingStep = 3;
        else if (action.payload.status === 'Shipped') order.trackingStep = 2;
        else order.trackingStep = 1;
      }
    },
    markInvoicePaid: (state, action) => {
      const invoice = state.invoices.find((i) => i.id === action.payload);
      if (invoice) {
        invoice.status = 'Paid';
      }
    },
    payBill: (state, action) => {
      const bill = state.bills.find((b) => b.id === action.payload);
      if (bill) {
        bill.status = 'Paid';
      }
    },
    addCustomer: (state, action) => {
      const newCust = {
        id: `CUST-0${state.customers.length + 1}`,
        totalSpent: '$0',
        ordersCount: 0,
        status: 'New Client',
        ...action.payload,
      };
      state.customers.unshift(newCust);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = {
          ...state.customers[index],
          ...action.payload,
        };
      }
    },
    updateBusinessProfile: (state, action) => {
      state.businessProfile = {
        ...state.businessProfile,
        ...action.payload,
        links: {
          ...state.businessProfile?.links,
          ...(action.payload?.links || {}),
        },
      };
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  addToCart,
  decreaseCartQuantity,
  removeFromCart,
  clearCart,
  createOrder,
  updateOrderStatus,
  markInvoicePaid,
  payBill,
  addCustomer,
  updateCustomer,
  updateBusinessProfile,
} = ecomSlice.actions;

export default ecomSlice.reducer;
