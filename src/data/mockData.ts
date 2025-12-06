import { Bus, Driver, Route, Terminal, Trip, Ticket, Luggage, Staff, ActivityLog, Notification, PromoCode } from '../types';

// Mock data - structured for Supabase integration

export const mockBuses: Bus[] = [
  { id: '1', plateNumber: 'UL-001', model: 'Mercedes Sprinter', capacity: 30, status: 'active', lastMaintenance: '2024-01-15', createdAt: '2024-01-01' },
  { id: '2', plateNumber: 'UL-002', model: 'Toyota Hiace', capacity: 25, status: 'active', lastMaintenance: '2024-01-20', createdAt: '2024-01-01' },
  { id: '3', plateNumber: 'UL-003', model: 'Mercedes Sprinter', capacity: 30, status: 'maintenance', lastMaintenance: '2024-01-10', createdAt: '2024-01-01' },
  { id: '4', plateNumber: 'UL-004', model: 'Toyota Hiace', capacity: 25, status: 'active', lastMaintenance: '2024-01-18', createdAt: '2024-01-01' },
];

export const mockDrivers: Driver[] = [
  { id: '1', name: 'John Mwale', licenseNumber: 'DL-12345', phone: '+265991234567', email: 'john@ulendo.com', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Peter Banda', licenseNumber: 'DL-12346', phone: '+265991234568', email: 'peter@ulendo.com', status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'James Phiri', licenseNumber: 'DL-12347', phone: '+265991234569', email: 'james@ulendo.com', status: 'on-leave', createdAt: '2024-01-01' },
];

export const mockRoutes: Route[] = [
  { id: '1', name: 'Lilongwe - Blantyre', origin: 'Lilongwe', destination: 'Blantyre', distance: 350, duration: 5, price: 250, status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Lilongwe - Mzuzu', origin: 'Lilongwe', destination: 'Mzuzu', distance: 380, duration: 5, price: 280, status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'Blantyre - Zomba', origin: 'Blantyre', destination: 'Zomba', distance: 65, duration: 1, price: 50, status: 'active', createdAt: '2024-01-01' },
  { id: '4', name: 'Lilongwe - Mangochi', origin: 'Lilongwe', destination: 'Mangochi', distance: 180, duration: 3, price: 150, status: 'active', createdAt: '2024-01-01' },
];

export const mockTerminals: Terminal[] = [
  { id: '1', name: 'Lilongwe Main Terminal', location: 'Lilongwe', address: 'Kamuzu Procession Road, Lilongwe', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Blantyre Terminal', location: 'Blantyre', address: 'Victoria Avenue, Blantyre', status: 'active', createdAt: '2024-01-01' },
  { id: '3', name: 'Mzuzu Terminal', location: 'Mzuzu', address: 'Mzuzu Main Road, Mzuzu', status: 'active', createdAt: '2024-01-01' },
];

export const mockTrips: Trip[] = [
  {
    id: '1',
    routeId: '1',
    busId: '1',
    driverId: '1',
    scheduledDeparture: '2024-01-25T08:00:00',
    scheduledArrival: '2024-01-25T13:00:00',
    status: 'boarding',
    availableSeats: 15,
    totalSeats: 30,
    price: 250,
    createdAt: '2024-01-20',
  },
  {
    id: '2',
    routeId: '2',
    busId: '2',
    driverId: '2',
    scheduledDeparture: '2024-01-25T09:00:00',
    scheduledArrival: '2024-01-25T14:00:00',
    status: 'in-transit',
    availableSeats: 5,
    totalSeats: 25,
    price: 280,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    routeId: '1',
    busId: '4',
    driverId: '1',
    scheduledDeparture: '2024-01-25T14:00:00',
    scheduledArrival: '2024-01-25T19:00:00',
    status: 'scheduled',
    availableSeats: 30,
    totalSeats: 30,
    price: 250,
    createdAt: '2024-01-20',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: '1',
    tripId: '1',
    passengerName: 'Mary Banda',
    passengerPhone: '+265991111111',
    passengerEmail: 'mary@example.com',
    seatNumber: 'A1',
    price: 250,
    paymentMethod: 'mobile-money',
    paymentStatus: 'paid',
    qrCode: 'TKT-001-2024',
    status: 'active',
    checkedIn: false,
    createdAt: '2024-01-24T10:00:00',
  },
  {
    id: '2',
    tripId: '1',
    passengerName: 'David Phiri',
    passengerPhone: '+265992222222',
    seatNumber: 'A2',
    price: 250,
    discount: 25,
    promoCode: 'SAVE10',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    qrCode: 'TKT-002-2024',
    status: 'active',
    checkedIn: true,
    createdAt: '2024-01-24T11:00:00',
  },
  {
    id: '3',
    tripId: '2',
    passengerName: 'Sarah Mwale',
    passengerPhone: '+265993333333',
    seatNumber: 'B5',
    price: 280,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    qrCode: 'TKT-003-2024',
    status: 'active',
    checkedIn: false,
    createdAt: '2024-01-24T12:00:00',
  },
];

export const mockLuggage: Luggage[] = [
  {
    id: '1',
    ticketId: '1',
    passengerName: 'Mary Banda',
    bagType: 'Suitcase',
    description: 'Black medium suitcase',
    weight: 15,
    fee: 20,
    tagId: 'LUG-001',
    qrCode: 'LUG-001-QR',
    status: 'checked-in',
    tripId: '1',
    createdAt: '2024-01-24T10:30:00',
  },
  {
    id: '2',
    ticketId: '2',
    passengerName: 'David Phiri',
    bagType: 'Backpack',
    description: 'Blue backpack',
    weight: 8,
    fee: 10,
    tagId: 'LUG-002',
    qrCode: 'LUG-002-QR',
    status: 'loaded',
    tripId: '1',
    createdAt: '2024-01-24T11:15:00',
  },
];

export const mockStaff: Staff[] = [
  { id: '1', name: 'Admin User', email: 'admin@ulendo.com', role: 'admin', status: 'active', permissions: ['all'], createdAt: '2024-01-01' },
  { id: '2', name: 'Ticketing Agent', email: 'ticketing@ulendo.com', role: 'ticketing', status: 'active', permissions: ['tickets:read', 'tickets:write'], createdAt: '2024-01-01' },
  { id: '3', name: 'Check-In Staff', email: 'checkin@ulendo.com', role: 'check-in', status: 'active', permissions: ['checkin:read', 'checkin:write'], createdAt: '2024-01-01' },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: '1', userId: '1', action: 'login', resource: 'system', timestamp: '2024-01-25T08:00:00' },
  { id: '2', userId: '1', action: 'create', resource: 'ticket', details: 'Ticket TKT-001 created', timestamp: '2024-01-25T08:15:00' },
  { id: '3', userId: '2', action: 'update', resource: 'trip', details: 'Trip status updated to boarding', timestamp: '2024-01-25T08:30:00' },
];

export const mockNotifications: Notification[] = [
  { id: '1', title: 'New Booking', message: '5 new tickets sold in the last hour', type: 'success', read: false, createdAt: '2024-01-25T08:00:00' },
  { id: '2', title: 'Bus Maintenance', message: 'UL-003 requires maintenance', type: 'warning', read: false, createdAt: '2024-01-25T07:00:00' },
  { id: '3', title: 'Trip Delayed', message: 'Trip to Blantyre delayed by 30 minutes', type: 'error', read: true, createdAt: '2024-01-25T06:00:00' },
];

export const mockPromoCodes: PromoCode[] = [
  { id: '1', code: 'SAVE10', discount: 10, discountType: 'percentage', validFrom: '2024-01-01', validTo: '2024-12-31', maxUses: 1000, usedCount: 45, status: 'active', createdAt: '2024-01-01' },
  { id: '2', code: 'WELCOME20', discount: 20, discountType: 'percentage', validFrom: '2024-01-01', validTo: '2024-03-31', maxUses: 500, usedCount: 120, status: 'active', createdAt: '2024-01-01' },
];

