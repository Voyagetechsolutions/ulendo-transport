// Core types for Supabase-ready structure

export interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  status: 'active' | 'on-leave' | 'suspended';
  createdAt: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Terminal {
  id: string;
  name: string;
  location: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: 'scheduled' | 'boarding' | 'in-transit' | 'arrived' | 'cancelled' | 'delayed';
  availableSeats: number;
  totalSeats: number;
  price: number;
  createdAt: string;
}

export interface Ticket {
  id: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
  seatNumber: string;
  price: number;
  discount?: number;
  promoCode?: string;
  paymentMethod: 'cash' | 'card' | 'mobile-money';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  qrCode: string;
  status: 'active' | 'used' | 'cancelled' | 'refunded';
  checkedIn: boolean;
  createdAt: string;
}

export interface Luggage {
  id: string;
  ticketId: string;
  passengerName: string;
  bagType: string;
  description: string;
  weight: number;
  fee: number;
  tagId: string;
  qrCode: string;
  status: 'checked-in' | 'loaded' | 'in-transit' | 'offloaded' | 'collected' | 'lost';
  tripId: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'ticketing' | 'luggage' | 'check-in' | 'driver';
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validFrom: string;
  validTo: string;
  maxUses?: number;
  usedCount: number;
  status: 'active' | 'expired' | 'inactive';
  createdAt: string;
}

