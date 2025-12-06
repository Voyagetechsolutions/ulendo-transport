# Supabase Integration Setup Guide

## Environment Variables

The Supabase credentials have been configured in `.env.local`:

```
VITE_SUPABASE_URL=https://ncozrjvlkyvrupkcgmtw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema Required

You need to create the following tables in your Supabase database. Here are the SQL statements:

### 1. Buses Table
```sql
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'maintenance', 'inactive')),
  last_maintenance DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Drivers Table
```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'on-leave', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Routes Table
```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Terminals Table
```sql
CREATE TABLE terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Trips Table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id),
  bus_id UUID NOT NULL REFERENCES buses(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  scheduled_departure TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_departure TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'boarding', 'in-transit', 'arrived', 'cancelled', 'delayed')),
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Tickets Table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id),
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT,
  seat_number TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2),
  promo_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile-money')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  qr_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. Luggage Table
```sql
CREATE TABLE luggage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  passenger_name TEXT NOT NULL,
  bag_type TEXT NOT NULL,
  description TEXT NOT NULL,
  weight DECIMAL(5, 2) NOT NULL,
  fee DECIMAL(10, 2) NOT NULL,
  tag_id TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('checked-in', 'loaded', 'in-transit', 'offloaded', 'collected', 'lost')),
  trip_id UUID NOT NULL REFERENCES trips(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. Staff Table
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'ticketing', 'luggage', 'check-in', 'driver')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. Activity Logs Table
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11. Promo Codes Table
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount DECIMAL(10, 2) NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

Enable RLS on all tables and create policies as needed. For development, you can temporarily disable RLS:

```sql
ALTER TABLE buses DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE terminals DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE luggage DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes DISABLE ROW LEVEL SECURITY;
```

## Indexes for Performance

```sql
-- Indexes for common queries
CREATE INDEX idx_trips_route_id ON trips(route_id);
CREATE INDEX idx_trips_bus_id ON trips(bus_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_scheduled_departure ON trips(scheduled_departure);
CREATE INDEX idx_tickets_trip_id ON tickets(trip_id);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_checked_in ON tickets(checked_in);
CREATE INDEX idx_luggage_ticket_id ON luggage(ticket_id);
CREATE INDEX idx_luggage_trip_id ON luggage(trip_id);
CREATE INDEX idx_luggage_status ON luggage(status);
```

## Next Steps

1. Run the SQL statements above in your Supabase SQL Editor
2. Install dependencies: `npm install`
3. The application will automatically use Supabase instead of mock data
4. Test the connection by running `npm run dev`

## Currency Update

All currency references have been updated from ZMW (Zambian Kwacha) to MWK (Malawian Kwacha) throughout the application.

## Location Updates

All locations have been updated to Malawian cities:
- Lilongwe (Capital)
- Blantyre
- Mzuzu
- Zomba
- Mangochi

Phone numbers have been updated from +260 (Zambia) to +265 (Malawi).

