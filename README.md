# Ulendo Transport - Bus Management System

A comprehensive, production-ready Bus Management System built with React, TypeScript, and TailwindCSS. The system includes four main dashboards: Admin, Ticketing, Luggage Management, and Check-In.

## Features

### 🎯 Admin Dashboard
- **Overview Cards**: Total trips, active trips, tickets sold, revenue, pending issues, fleet status
- **Analytics**: Daily sales charts, passenger volume, route performance, bus utilization, trip punctuality
- **Management Tools**: Manage buses, drivers, routes, terminals, staff & permissions
- **Real-Time Monitoring**: Live trip tracker, bus status, driver activity
- **System Logs**: Activity logging for all system actions
- **Notifications Center**: System-wide notifications and alerts
- **Marketing Tools**: Promo codes and announcements management

### 🎫 Ticketing Dashboard
- **Ticket Sales**: Search trips, seat selection with visual map, passenger details form, payment processing
- **Ticket Management**: View, modify, print, and re-issue tickets
- **QR Code Generation**: Automatic QR code for each ticket
- **Reports**: Daily sales, transaction history, payment summaries, agent performance
- **Discount & Promo Support**: Apply promo codes and discounts

### 🛄 Luggage Management Dashboard
- **Luggage Registration**: Link luggage to tickets, weight-based fee calculation, QR tag generation
- **Luggage Tracking**: Real-time status tracking (Checked-in → Loaded → In Transit → Offloaded → Collected)
- **Lost & Found System**: Report missing luggage, track resolution status
- **Reports**: Daily luggage fees, lost luggage incidents, trip luggage summaries

### 🔍 Check-In Dashboard
- **QR Check-In**: Scan passenger QR codes for instant check-in
- **Manual Check-In**: Search by name, ticket number, seat, or ID/Passport
- **Passenger Manifest**: Real-time boarding status, filters, print/download options
- **Trip Operations**: Select active trips, mark departure/arrival times, driver dashboard
- **Security Features**: Duplicate check-in prevention, ticket validation, luggage count display

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **QRCode.react** - QR code generation
- **date-fns** - Date formatting

## Project Structure

```
ulendo-transport/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Main layout with sidebar navigation
│   │   └── shared/
│   │       ├── StatCard.tsx        # Statistics card component
│   │       ├── Modal.tsx           # Reusable modal component
│   │       ├── Table.tsx           # Data table component
│   │       └── LoadingSpinner.tsx  # Loading indicator
│   ├── pages/
│   │   ├── AdminDashboard.tsx      # Admin operations hub
│   │   ├── TicketingDashboard.tsx  # Ticket sales & management
│   │   ├── LuggageDashboard.tsx    # Luggage management
│   │   └── CheckInDashboard.tsx    # Passenger check-in
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── data/
│   │   └── mockData.ts             # Mock data (Supabase-ready structure)
│   ├── App.tsx                     # Main app component with routing
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Supabase Integration

The data structure is designed to be Supabase-ready. All types in `src/types/index.ts` correspond to database table schemas. To integrate with Supabase:

1. Create tables matching the type definitions
2. Replace mock data imports with Supabase client queries
3. Add authentication using Supabase Auth
4. Implement real-time subscriptions for live updates

Example table structure:
- `buses` - Fleet management
- `drivers` - Driver information
- `routes` - Route definitions
- `trips` - Scheduled trips
- `tickets` - Ticket records
- `luggage` - Luggage tracking
- `staff` - Staff management
- `activity_logs` - System logs
- `notifications` - Notifications
- `promo_codes` - Marketing codes

## Features Highlights

### Responsive Design
- Mobile-first approach
- Optimized for tablets and desktops
- Touch-friendly interface

### Real-Time Updates
- Live trip tracking
- Real-time passenger count
- Instant status updates

### Security
- Duplicate check-in prevention
- Ticket validation
- Role-based access control (ready for implementation)

### User Experience
- Smooth animations and transitions
- Loading states
- Empty states
- Error handling
- Search and filtering
- Sorting and pagination

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme. The primary color is currently set to blue (`primary-600`).

### Company Branding
- Update company name in `src/components/Layout.tsx`
- Modify logo and branding as needed

## Future Enhancements

- Real-time WebSocket connections
- Push notifications
- Advanced reporting and analytics
- Mobile app integration
- Payment gateway integration
- SMS/Email notifications
- Multi-language support

## License

This project is proprietary software for Ulendo Transport.

## Support

For issues or questions, please contact the development team.

