import { useState } from 'react';
import { Search, Edit, Printer, QrCode, DollarSign, Calendar, MessageCircle, Mail, RefreshCw, Phone, CreditCard, Ticket as TicketIcon } from 'lucide-react';
import Modal from '../components/shared/Modal';
import Table from '../components/shared/Table';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useTrips, useTickets, useRoutes, usePromoCodes } from '../hooks/useSupabaseData';
import { createTicket, updateTicket } from '../services/supabaseService';
import type { Ticket, Trip } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const TicketingDashboard = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'online' | 'manage' | 'reports'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [passengerForm, setPassengerForm] = useState({
    name: '',
    phone: '',
    email: '',
    passport: '',
    gender: 'male' as 'male' | 'female' | 'other',
    seatNumber: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'mobile-money',
    promoCode: '',
  });

  // Fetch data from Supabase
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { tickets, loading: ticketsLoading, refetch: refetchTickets } = useTickets();
  const { routes, loading: routesLoading } = useRoutes();
  const { promoCodes: _mockPromoCodes, loading: promosLoading } = usePromoCodes();

  const isLoading = tripsLoading || ticketsLoading || routesLoading || promosLoading;

  // Filter trips based on search
  const filteredTrips = trips.filter(trip => {
    const route = routes.find(r => r.id === trip.routeId);
    if (!route) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      route.origin.toLowerCase().includes(searchLower) ||
      route.destination.toLowerCase().includes(searchLower) ||
      route.name.toLowerCase().includes(searchLower)
    );
  });

  // Generate seat map
  const generateSeatMap = (totalSeats: number, bookedSeats: string[]) => {
    const seats = [];
    const rows = Math.ceil(totalSeats / 4);
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < 4 && i * 4 + j < totalSeats; j++) {
        const seatNum = `${String.fromCharCode(65 + i)}${j + 1}`;
        const isBooked = bookedSeats.includes(seatNum);
        row.push({ number: seatNum, booked: isBooked });
      }
      seats.push(row);
    }
    return seats;
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowTicketModal(true);
  };

  const handleIssueTicket = async () => {
    try {
      if (!selectedTrip) return;

      const discount = passengerForm.promoCode ? 25 : 0; // Calculate discount based on promo code
      const finalPrice = selectedTrip.price - discount;

      const newTicket = await createTicket({
        tripId: selectedTrip.id,
        passengerName: passengerForm.name,
        passengerPhone: passengerForm.phone,
        passengerEmail: passengerForm.email || undefined,
        seatNumber: passengerForm.seatNumber,
        price: finalPrice,
        discount: discount > 0 ? discount : undefined,
        promoCode: passengerForm.promoCode || undefined,
        paymentMethod: passengerForm.paymentMethod,
        paymentStatus: 'paid',
        qrCode: `TKT-${Date.now()}-QR`,
        status: 'active',
        checkedIn: false,
      });

      setSelectedTicket(newTicket);
      setShowTicketModal(false);
      setShowQRModal(true);
      
      // Update trip available seats
      await refetchTrips();
      await refetchTickets();
      
      // Reset form
      setPassengerForm({
        name: '',
        phone: '',
        email: '',
        passport: '',
        gender: 'male',
        seatNumber: '',
        paymentMethod: 'cash',
        promoCode: '',
      });
    } catch (error: any) {
      alert(`Error creating ticket: ${error.message}`);
    }
  };

  const todaySales = tickets.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.createdAt).toDateString() === today;
  });

  const todayRevenue = todaySales.reduce((sum, t) => sum + (t.price - (t.discount || 0)), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ticketing Dashboard</h1>
          <p className="text-gray-600 mt-1">Ticket sales and management</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ticketing Dashboard</h1>
        <p className="text-gray-600 mt-1">Ticket sales and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'sales', label: 'Admin Booking' },
          { id: 'online', label: 'Online Booking' },
          { id: 'manage', label: 'Ticket Management' },
          { id: 'reports', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ticket Sales Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search routes, origin, destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <select className="input-field">
                <option>All Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
              <input type="date" className="input-field" />
            </div>
          </div>

          {/* Available Trips */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Available Trips</h2>
            <div className="space-y-4">
              {filteredTrips.map((trip) => {
                const route = routes.find(r => r.id === trip.routeId);
                if (!route) return null;
                return (
                  <div
                    key={trip.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trip.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            trip.status === 'boarding' ? 'bg-green-100 text-green-700' :
                            trip.status === 'in-transit' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {trip.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-900">Departure</p>
                            <p>{format(new Date(trip.scheduledDeparture), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Arrival</p>
                            <p>{format(new Date(trip.scheduledArrival), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Available Seats</p>
                            <p>{trip.availableSeats} / {trip.totalSeats}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Price</p>
                            <p className="text-primary-600 font-semibold">MWK {trip.price}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectTrip(trip)}
                        className="btn-primary whitespace-nowrap"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Online Booking Tab */}
      {activeTab === 'online' && (
        <div className="space-y-6">
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary-600 rounded-lg">
                <Search className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Your Trip Online</h2>
                <p className="text-sm text-gray-600">Search and book your journey in minutes</p>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <select className="input-field">
                  <option>Select Origin</option>
                  {Array.from(new Set(routes.map(r => r.origin))).map(origin => (
                    <option key={origin}>{origin}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select className="input-field">
                  <option>Select Destination</option>
                  {Array.from(new Set(routes.map(r => r.destination))).map(dest => (
                    <option key={dest}>{dest}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" className="input-field" />
              </div>
              <div className="flex items-end">
                <button className="btn-primary w-full">
                  <Search className="inline mr-2" size={16} />
                  Search Trips
                </button>
              </div>
            </div>
          </div>

          {/* Available Trips */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Available Trips</h2>
            <div className="space-y-4">
              {filteredTrips.map((trip) => {
                const route = routes.find(r => r.id === trip.routeId);
                if (!route) return null;
                return (
                  <div
                    key={trip.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trip.availableSeats > 10 ? 'bg-green-100 text-green-700' :
                            trip.availableSeats > 5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {trip.availableSeats} seats available
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium text-gray-900">Departure</p>
                            <p>{format(new Date(trip.scheduledDeparture), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Arrival</p>
                            <p>{format(new Date(trip.scheduledArrival), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Duration</p>
                            <p>{route.duration} hours</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Price</p>
                            <p className="text-primary-600 font-semibold">MWK {trip.price}</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectTrip(trip)}
                        className="btn-primary whitespace-nowrap"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="p-3 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <QrCode className="text-primary-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Digital Tickets</h3>
              <p className="text-sm text-gray-600">Get instant QR code tickets via email or WhatsApp</p>
            </div>
            <div className="card text-center">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <CreditCard className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">Pay with card, mobile money, or cash on pickup</p>
            </div>
            <div className="card text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <RefreshCw className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Easy Cancellation</h3>
              <p className="text-sm text-gray-600">Cancel or modify your booking anytime</p>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Management Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ticket number, passenger name, phone..."
                className="input-field pl-10"
              />
            </div>
            <select className="input-field w-48">
              <option>All Status</option>
              <option>Active</option>
              <option>Used</option>
              <option>Cancelled</option>
              <option>Refunded</option>
            </select>
          </div>

          <Table
            data={tickets}
            columns={[
              { key: 'id', header: 'Ticket ID' },
              { key: 'passengerName', header: 'Passenger' },
              { key: 'passengerPhone', header: 'Phone' },
              { key: 'seatNumber', header: 'Seat' },
              {
                key: 'price',
                header: 'Price',
                render: (ticket) => `MWK ${ticket.price - (ticket.discount || 0)}`,
              },
              {
                key: 'paymentMethod',
                header: 'Payment',
                render: (ticket) => (
                  <span className="capitalize">{ticket.paymentMethod.replace('-', ' ')}</span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (ticket) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'used' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (ticket) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowQRModal(true);
                      }}
                      className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                      title="View QR Code"
                    >
                      <QrCode size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Print"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowEditModal(true);
                      }}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowReassignModal(true);
                      }}
                      className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                      title="Reassign Trip"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{todaySales.length}</p>
                </div>
                <Calendar className="text-primary-600" size={32} />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">MWK {todayRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <TicketIcon className="text-purple-600" size={32} />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">All Ticket Transactions</h2>
            <Table
              data={tickets}
              columns={[
                { key: 'id', header: 'Ticket ID' },
                { key: 'passengerName', header: 'Passenger' },
                { key: 'seatNumber', header: 'Seat' },
                {
                  key: 'price',
                  header: 'Amount',
                  render: (ticket) => `MWK ${ticket.price - (ticket.discount || 0)}`,
                },
                {
                  key: 'paymentMethod',
                  header: 'Payment Method',
                  render: (ticket) => ticket.paymentMethod.replace('-', ' '),
                },
                {
                  key: 'createdAt',
                  header: 'Date',
                  render: (ticket) => format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm'),
                },
              ]}
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Cash</p>
                <p className="text-xl font-semibold">
                  MWK {tickets.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.price, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Card</p>
                <p className="text-xl font-semibold">
                  MWK {tickets.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.price, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Mobile Money</p>
                <p className="text-xl font-semibold">
                  MWK {tickets.filter(t => t.paymentMethod === 'mobile-money').reduce((sum, t) => sum + t.price, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Booking Modal */}
      {showTicketModal && selectedTrip && (
        <Modal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedTrip(null);
          }}
          title="Book Ticket"
          size="xl"
        >
          <div className="space-y-6">
            {/* Trip Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {(() => {
                const route = routes.find(r => r.id === selectedTrip.routeId);
                return route ? (
                  <>
                    <h3 className="font-semibold mb-2">{route.name}</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedTrip.scheduledDeparture), 'MMM dd, yyyy HH:mm')} - 
                      {format(new Date(selectedTrip.scheduledArrival), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-sm text-gray-600">Price: MWK {selectedTrip.price}</p>
                  </>
                ) : null;
              })()}
            </div>

            {/* Seat Selection */}
            <div>
              <h3 className="font-semibold mb-3">Select Seat</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-2">
                  {generateSeatMap(selectedTrip.totalSeats, tickets.filter(t => t.tripId === selectedTrip.id).map(t => t.seatNumber)).map((row) =>
                    row.map((seat) => (
                      <button
                        key={seat.number}
                        onClick={() => setPassengerForm({ ...passengerForm, seatNumber: seat.number })}
                        disabled={seat.booked}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          seat.booked
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : passengerForm.seatNumber === seat.number
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {seat.number}
                      </button>
                    ))
                  )}
                </div>
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary-600 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Passenger Details</h3>
              <input
                type="text"
                placeholder="Full Name *"
                value={passengerForm.name}
                onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={passengerForm.phone}
                  onChange={(e) => setPassengerForm({ ...passengerForm, phone: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Passport/ID Number"
                  value={passengerForm.passport}
                  onChange={(e) => setPassengerForm({ ...passengerForm, passport: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={passengerForm.email}
                  onChange={(e) => setPassengerForm({ ...passengerForm, email: e.target.value })}
                  className="input-field"
                />
                <select
                  value={passengerForm.gender}
                  onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value as any })}
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="grid grid-cols-3 gap-3">
                {['cash', 'card', 'mobile-money'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPassengerForm({ ...passengerForm, paymentMethod: method as any })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      passengerForm.paymentMethod === method
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="capitalize">{method.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code (Optional)</label>
              <input
                type="text"
                placeholder="Enter promo code"
                value={passengerForm.promoCode}
                onChange={(e) => setPassengerForm({ ...passengerForm, promoCode: e.target.value })}
                className="input-field"
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Ticket Price</span>
                <span className="font-semibold">MWK {selectedTrip.price}</span>
              </div>
              {passengerForm.promoCode && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Discount ({passengerForm.promoCode})</span>
                  <span className="font-semibold">-MWK 25</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  MWK {selectedTrip.price - (passengerForm.promoCode ? 25 : 0)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleIssueTicket}
                disabled={!passengerForm.name || !passengerForm.phone || !passengerForm.seatNumber}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Issue Ticket
              </button>
              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTrip(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <Modal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedTicket(null);
          }}
          title="Ticket Issued Successfully"
          size="md"
        >
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <QRCodeSVG value={selectedTicket.qrCode} size={200} />
            </div>
            <div>
              <p className="font-semibold text-lg">{selectedTicket.passengerName}</p>
              <p className="text-sm text-gray-600">Seat: {selectedTicket.seatNumber}</p>
              <p className="text-sm text-gray-600">Ticket ID: {selectedTicket.id}</p>
              <p className="text-sm text-gray-600 mt-2">Price: MWK {selectedTicket.price - (selectedTicket.discount || 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-primary">
                <Printer className="inline mr-2" size={16} />
                Print
              </button>
              <button
                onClick={() => {
                  const whatsappUrl = `https://wa.me/${selectedTicket.passengerPhone.replace(/\D/g, '')}?text=Your ticket: ${selectedTicket.id}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="btn-secondary"
              >
                <MessageCircle className="inline mr-2" size={16} />
                WhatsApp
              </button>
              <button
                onClick={() => {
                  const smsUrl = `sms:${selectedTicket.passengerPhone}?body=Your ticket: ${selectedTicket.id}`;
                  window.open(smsUrl);
                }}
                className="btn-secondary"
              >
                <Phone className="inline mr-2" size={16} />
                SMS
              </button>
              {selectedTicket.passengerEmail && (
                <button
                  onClick={() => {
                    const mailtoUrl = `mailto:${selectedTicket.passengerEmail}?subject=Ticket Confirmation&body=Your ticket: ${selectedTicket.id}`;
                    window.open(mailtoUrl);
                  }}
                  className="btn-secondary"
                >
                  <Mail className="inline mr-2" size={16} />
                  Email
                </button>
              )}
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="btn-primary w-full"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Ticket Modal */}
      {showEditModal && selectedTicket && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTicket(null);
          }}
          title="Edit Ticket"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passenger Name</label>
              <input
                type="text"
                defaultValue={selectedTicket.passengerName}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue={selectedTicket.passengerPhone}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seat Number</label>
                <input
                  type="text"
                  defaultValue={selectedTicket.seatNumber}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    if (!selectedTicket) return;
                    await updateTicket(selectedTicket.id, {
                      passengerName: (document.querySelector('input[placeholder="Full Name"]') as HTMLInputElement)?.value || selectedTicket.passengerName,
                      passengerPhone: (document.querySelector('input[placeholder="Phone"]') as HTMLInputElement)?.value || selectedTicket.passengerPhone,
                      seatNumber: (document.querySelector('input[placeholder="Seat Number"]') as HTMLInputElement)?.value || selectedTicket.seatNumber,
                    });
                    alert('Ticket updated successfully!');
                    setShowEditModal(false);
                    await refetchTickets();
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="btn-primary flex-1"
              >
                Update Ticket
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reassign Trip Modal */}
      {showReassignModal && selectedTicket && (
        <Modal
          isOpen={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedTicket(null);
          }}
          title="Reassign to Another Trip"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select New Trip</label>
              <select className="input-field">
                <option>Select Trip</option>
                {trips.map(trip => {
                  const route = routes.find(r => r.id === trip.routeId);
                  return (
                    <option key={trip.id} value={trip.id}>
                      {route?.name} - {format(new Date(trip.scheduledDeparture), 'MMM dd, yyyy HH:mm')}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select New Seat</label>
              <input
                type="text"
                placeholder="Enter seat number"
                className="input-field"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    if (!selectedTicket) return;
                    const newTripId = (document.querySelector('select') as HTMLSelectElement)?.value;
                    const newSeatNumber = (document.querySelector('input[placeholder="Enter seat number"]') as HTMLInputElement)?.value;
                    
                    if (!newTripId || !newSeatNumber) {
                      alert('Please select trip and seat');
                      return;
                    }

                    await updateTicket(selectedTicket.id, {
                      tripId: newTripId,
                      seatNumber: newSeatNumber,
                    });
                    
                    alert('Passenger reassigned successfully!');
                    setShowReassignModal(false);
                    await refetchTickets();
                    await refetchTrips();
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="btn-primary flex-1"
              >
                Reassign
              </button>
              <button
                onClick={() => setShowReassignModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TicketingDashboard;

