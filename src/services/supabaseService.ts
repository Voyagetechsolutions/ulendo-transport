import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Bus, Driver, Route, Terminal, Trip, Ticket, Luggage, Staff, ActivityLog, Notification, PromoCode } from '../types';

// Transform database row to app type
const transformBus = (row: any): Bus => ({
  id: row.id,
  plateNumber: row.plate_number,
  model: row.model,
  capacity: row.capacity,
  status: row.status,
  lastMaintenance: row.last_maintenance,
  createdAt: row.created_at,
});

const transformDriver = (row: any): Driver => ({
  id: row.id,
  name: row.name,
  licenseNumber: row.license_number,
  phone: row.phone,
  email: row.email,
  status: row.status,
  createdAt: row.created_at,
});

const transformRoute = (row: any): Route => ({
  id: row.id,
  name: row.name,
  origin: row.origin,
  destination: row.destination,
  distance: row.distance,
  duration: row.duration,
  price: row.price,
  status: row.status,
  createdAt: row.created_at,
});

const transformTerminal = (row: any): Terminal => ({
  id: row.id,
  name: row.name,
  location: row.location,
  address: row.address,
  status: row.status,
  createdAt: row.created_at,
});

const transformTrip = (row: any): Trip => ({
  id: row.id,
  routeId: row.route_id,
  busId: row.bus_id,
  driverId: row.driver_id,
  scheduledDeparture: row.scheduled_departure,
  scheduledArrival: row.scheduled_arrival,
  actualDeparture: row.actual_departure,
  actualArrival: row.actual_arrival,
  status: row.status,
  availableSeats: row.available_seats,
  totalSeats: row.total_seats,
  price: row.price,
  createdAt: row.created_at,
});

const transformTicket = (row: any): Ticket => ({
  id: row.id,
  tripId: row.trip_id,
  passengerName: row.passenger_name,
  passengerPhone: row.passenger_phone,
  passengerEmail: row.passenger_email,
  seatNumber: row.seat_number,
  price: row.price,
  discount: row.discount,
  promoCode: row.promo_code,
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  qrCode: row.qr_code,
  status: row.status,
  checkedIn: row.checked_in,
  createdAt: row.created_at,
});

const transformLuggage = (row: any): Luggage => ({
  id: row.id,
  ticketId: row.ticket_id,
  passengerName: row.passenger_name,
  bagType: row.bag_type,
  description: row.description,
  weight: row.weight,
  fee: row.fee,
  tagId: row.tag_id,
  qrCode: row.qr_code,
  status: row.status,
  tripId: row.trip_id,
  createdAt: row.created_at,
});

// Buses
export const getBuses = async (): Promise<Bus[]> => {
  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformBus);
};

export const createBus = async (bus: Omit<Bus, 'id' | 'createdAt'>): Promise<Bus> => {
  const { data, error } = await supabase
    .from('buses')
    .insert({
      plate_number: bus.plateNumber,
      model: bus.model,
      capacity: bus.capacity,
      status: bus.status,
      last_maintenance: bus.lastMaintenance,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformBus(data);
};

export const updateBus = async (id: string, updates: Partial<Bus>): Promise<Bus> => {
  const updateData: any = {};
  if (updates.plateNumber) updateData.plate_number = updates.plateNumber;
  if (updates.model) updateData.model = updates.model;
  if (updates.capacity !== undefined) updateData.capacity = updates.capacity;
  if (updates.status) updateData.status = updates.status;
  if (updates.lastMaintenance !== undefined) updateData.last_maintenance = updates.lastMaintenance;
  
  const { data, error } = await supabase
    .from('buses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformBus(data);
};

// Drivers
export const getDrivers = async (): Promise<Driver[]> => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformDriver);
};

export const createDriver = async (driver: Omit<Driver, 'id' | 'createdAt'>): Promise<Driver> => {
  const { data, error } = await supabase
    .from('drivers')
    .insert({
      name: driver.name,
      license_number: driver.licenseNumber,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformDriver(data);
};

export const updateDriver = async (id: string, updates: Partial<Driver>): Promise<Driver> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.licenseNumber) updateData.license_number = updates.licenseNumber;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.email) updateData.email = updates.email;
  if (updates.status) updateData.status = updates.status;
  
  const { data, error } = await supabase
    .from('drivers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformDriver(data);
};

// Routes
export const getRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformRoute);
};

export const createRoute = async (route: Omit<Route, 'id' | 'createdAt'>): Promise<Route> => {
  const { data, error } = await supabase
    .from('routes')
    .insert({
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance,
      duration: route.duration,
      price: route.price,
      status: route.status,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformRoute(data);
};

export const updateRoute = async (id: string, updates: Partial<Route>): Promise<Route> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.origin) updateData.origin = updates.origin;
  if (updates.destination) updateData.destination = updates.destination;
  if (updates.distance !== undefined) updateData.distance = updates.distance;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.status) updateData.status = updates.status;
  
  const { data, error } = await supabase
    .from('routes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformRoute(data);
};

// Terminals
export const getTerminals = async (): Promise<Terminal[]> => {
  const { data, error } = await supabase
    .from('terminals')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformTerminal);
};

export const createTerminal = async (terminal: Omit<Terminal, 'id' | 'createdAt'>): Promise<Terminal> => {
  const { data, error } = await supabase
    .from('terminals')
    .insert({
      name: terminal.name,
      location: terminal.location,
      address: terminal.address,
      status: terminal.status,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformTerminal(data);
};

export const updateTerminal = async (id: string, updates: Partial<Terminal>): Promise<Terminal> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.location) updateData.location = updates.location;
  if (updates.address) updateData.address = updates.address;
  if (updates.status) updateData.status = updates.status;
  
  const { data, error } = await supabase
    .from('terminals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformTerminal(data);
};

// Trips
export const getTrips = async (): Promise<Trip[]> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('scheduled_departure', { ascending: true });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformTrip);
};

export const createTrip = async (trip: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> => {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      route_id: trip.routeId,
      bus_id: trip.busId,
      driver_id: trip.driverId,
      scheduled_departure: trip.scheduledDeparture,
      scheduled_arrival: trip.scheduledArrival,
      actual_departure: trip.actualDeparture,
      actual_arrival: trip.actualArrival,
      status: trip.status,
      available_seats: trip.availableSeats,
      total_seats: trip.totalSeats,
      price: trip.price,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformTrip(data);
};

export const updateTrip = async (id: string, updates: Partial<Trip>): Promise<Trip> => {
  const updateData: any = {};
  if (updates.routeId) updateData.route_id = updates.routeId;
  if (updates.busId) updateData.bus_id = updates.busId;
  if (updates.driverId) updateData.driver_id = updates.driverId;
  if (updates.scheduledDeparture) updateData.scheduled_departure = updates.scheduledDeparture;
  if (updates.scheduledArrival) updateData.scheduled_arrival = updates.scheduledArrival;
  if (updates.actualDeparture !== undefined) updateData.actual_departure = updates.actualDeparture;
  if (updates.actualArrival !== undefined) updateData.actual_arrival = updates.actualArrival;
  if (updates.status) updateData.status = updates.status;
  if (updates.availableSeats !== undefined) updateData.available_seats = updates.availableSeats;
  if (updates.price !== undefined) updateData.price = updates.price;
  
  const { data, error } = await supabase
    .from('trips')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformTrip(data);
};

// Tickets
export const getTickets = async (): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformTicket);
};

export const createTicket = async (ticket: Omit<Ticket, 'id' | 'createdAt'>): Promise<Ticket> => {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      trip_id: ticket.tripId,
      passenger_name: ticket.passengerName,
      passenger_phone: ticket.passengerPhone,
      passenger_email: ticket.passengerEmail,
      seat_number: ticket.seatNumber,
      price: ticket.price,
      discount: ticket.discount,
      promo_code: ticket.promoCode,
      payment_method: ticket.paymentMethod,
      payment_status: ticket.paymentStatus,
      qr_code: ticket.qrCode,
      status: ticket.status,
      checked_in: ticket.checkedIn,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformTicket(data);
};

export const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
  const updateData: any = {};
  if (updates.tripId) updateData.trip_id = updates.tripId;
  if (updates.passengerName) updateData.passenger_name = updates.passengerName;
  if (updates.passengerPhone) updateData.passenger_phone = updates.passengerPhone;
  if (updates.passengerEmail !== undefined) updateData.passenger_email = updates.passengerEmail;
  if (updates.seatNumber) updateData.seat_number = updates.seatNumber;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.discount !== undefined) updateData.discount = updates.discount;
  if (updates.status) updateData.status = updates.status;
  if (updates.checkedIn !== undefined) updateData.checked_in = updates.checkedIn;
  if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus;
  
  const { data, error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformTicket(data);
};

// Luggage
export const getLuggage = async (): Promise<Luggage[]> => {
  const { data, error } = await supabase
    .from('luggage')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map(transformLuggage);
};

export const createLuggage = async (luggage: Omit<Luggage, 'id' | 'createdAt'>): Promise<Luggage> => {
  const { data, error } = await supabase
    .from('luggage')
    .insert({
      ticket_id: luggage.ticketId,
      passenger_name: luggage.passengerName,
      bag_type: luggage.bagType,
      description: luggage.description,
      weight: luggage.weight,
      fee: luggage.fee,
      tag_id: luggage.tagId,
      qr_code: luggage.qrCode,
      status: luggage.status,
      trip_id: luggage.tripId,
    })
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformLuggage(data);
};

export const updateLuggage = async (id: string, updates: Partial<Luggage>): Promise<Luggage> => {
  const updateData: any = {};
  if (updates.status) updateData.status = updates.status;
  if (updates.fee !== undefined) updateData.fee = updates.fee;
  
  const { data, error } = await supabase
    .from('luggage')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) handleSupabaseError(error);
  return transformLuggage(data);
};

// Staff
export const getStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    permissions: row.permissions,
    createdAt: row.created_at,
  }));
};

// Activity Logs
export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  if (error) handleSupabaseError(error);
  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    details: row.details,
    timestamp: row.timestamp,
  }));
};

// Notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) handleSupabaseError(error);
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
  }));
};

// Promo Codes
export const getPromoCodes = async (): Promise<PromoCode[]> => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) handleSupabaseError(error);
  return (data || []).map((row: any) => ({
    id: row.id,
    code: row.code,
    discount: row.discount,
    discountType: row.discount_type,
    validFrom: row.valid_from,
    validTo: row.valid_to,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    status: row.status,
    createdAt: row.created_at,
  }));
};

