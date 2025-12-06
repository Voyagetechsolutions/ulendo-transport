// Database types for Supabase
// This will be auto-generated from your Supabase schema
// For now, we'll define the structure based on our existing types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      buses: {
        Row: {
          id: string;
          plate_number: string;
          model: string;
          capacity: number;
          status: 'active' | 'maintenance' | 'inactive';
          last_maintenance: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plate_number: string;
          model: string;
          capacity: number;
          status?: 'active' | 'maintenance' | 'inactive';
          last_maintenance?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plate_number?: string;
          model?: string;
          capacity?: number;
          status?: 'active' | 'maintenance' | 'inactive';
          last_maintenance?: string | null;
          created_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          license_number: string;
          phone: string;
          email: string;
          status: 'active' | 'on-leave' | 'suspended';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          license_number: string;
          phone: string;
          email: string;
          status?: 'active' | 'on-leave' | 'suspended';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          license_number?: string;
          phone?: string;
          email?: string;
          status?: 'active' | 'on-leave' | 'suspended';
          created_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          name: string;
          origin: string;
          destination: string;
          distance: number;
          duration: number;
          price: number;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          origin: string;
          destination: string;
          distance: number;
          duration: number;
          price: number;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          origin?: string;
          destination?: string;
          distance?: number;
          duration?: number;
          price?: number;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
      };
      terminals: {
        Row: {
          id: string;
          name: string;
          location: string;
          address: string;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          address: string;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          address?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          route_id: string;
          bus_id: string;
          driver_id: string;
          scheduled_departure: string;
          scheduled_arrival: string;
          actual_departure: string | null;
          actual_arrival: string | null;
          status: 'scheduled' | 'boarding' | 'in-transit' | 'arrived' | 'cancelled' | 'delayed';
          available_seats: number;
          total_seats: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          bus_id: string;
          driver_id: string;
          scheduled_departure: string;
          scheduled_arrival: string;
          actual_departure?: string | null;
          actual_arrival?: string | null;
          status?: 'scheduled' | 'boarding' | 'in-transit' | 'arrived' | 'cancelled' | 'delayed';
          available_seats: number;
          total_seats: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          bus_id?: string;
          driver_id?: string;
          scheduled_departure?: string;
          scheduled_arrival?: string;
          actual_departure?: string | null;
          actual_arrival?: string | null;
          status?: 'scheduled' | 'boarding' | 'in-transit' | 'arrived' | 'cancelled' | 'delayed';
          available_seats?: number;
          total_seats?: number;
          price?: number;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          trip_id: string;
          passenger_name: string;
          passenger_phone: string;
          passenger_email: string | null;
          seat_number: string;
          price: number;
          discount: number | null;
          promo_code: string | null;
          payment_method: 'cash' | 'card' | 'mobile-money';
          payment_status: 'pending' | 'paid' | 'refunded';
          qr_code: string;
          status: 'active' | 'used' | 'cancelled' | 'refunded';
          checked_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          passenger_name: string;
          passenger_phone: string;
          passenger_email?: string | null;
          seat_number: string;
          price: number;
          discount?: number | null;
          promo_code?: string | null;
          payment_method: 'cash' | 'card' | 'mobile-money';
          payment_status?: 'pending' | 'paid' | 'refunded';
          qr_code: string;
          status?: 'active' | 'used' | 'cancelled' | 'refunded';
          checked_in?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          passenger_name?: string;
          passenger_phone?: string;
          passenger_email?: string | null;
          seat_number?: string;
          price?: number;
          discount?: number | null;
          promo_code?: string | null;
          payment_method?: 'cash' | 'card' | 'mobile-money';
          payment_status?: 'pending' | 'paid' | 'refunded';
          qr_code?: string;
          status?: 'active' | 'used' | 'cancelled' | 'refunded';
          checked_in?: boolean;
          created_at?: string;
        };
      };
      luggage: {
        Row: {
          id: string;
          ticket_id: string;
          passenger_name: string;
          bag_type: string;
          description: string;
          weight: number;
          fee: number;
          tag_id: string;
          qr_code: string;
          status: 'checked-in' | 'loaded' | 'in-transit' | 'offloaded' | 'collected' | 'lost';
          trip_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          passenger_name: string;
          bag_type: string;
          description: string;
          weight: number;
          fee: number;
          tag_id: string;
          qr_code: string;
          status?: 'checked-in' | 'loaded' | 'in-transit' | 'offloaded' | 'collected' | 'lost';
          trip_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          passenger_name?: string;
          bag_type?: string;
          description?: string;
          weight?: number;
          fee?: number;
          tag_id?: string;
          qr_code?: string;
          status?: 'checked-in' | 'loaded' | 'in-transit' | 'offloaded' | 'collected' | 'lost';
          trip_id?: string;
          created_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'ticketing' | 'luggage' | 'check-in' | 'driver';
          status: 'active' | 'inactive';
          permissions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'admin' | 'ticketing' | 'luggage' | 'check-in' | 'driver';
          status?: 'active' | 'inactive';
          permissions: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'admin' | 'ticketing' | 'luggage' | 'check-in' | 'driver';
          status?: 'active' | 'inactive';
          permissions?: string[];
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource: string;
          details: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource: string;
          details?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource?: string;
          details?: string | null;
          timestamp?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'error' | 'success';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type?: 'info' | 'warning' | 'error' | 'success';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'warning' | 'error' | 'success';
          read?: boolean;
          created_at?: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount: number;
          discount_type: 'percentage' | 'fixed';
          valid_from: string;
          valid_to: string;
          max_uses: number | null;
          used_count: number;
          status: 'active' | 'expired' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount: number;
          discount_type: 'percentage' | 'fixed';
          valid_from: string;
          valid_to: string;
          max_uses?: number | null;
          used_count?: number;
          status?: 'active' | 'expired' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount?: number;
          discount_type?: 'percentage' | 'fixed';
          valid_from?: string;
          valid_to?: string;
          max_uses?: number | null;
          used_count?: number;
          status?: 'active' | 'expired' | 'inactive';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

