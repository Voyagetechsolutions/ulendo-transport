import { useState } from 'react';
import { Search, QrCode, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Download, Printer, Users, Wifi, WifiOff, Send } from 'lucide-react';
import Modal from '../components/shared/Modal';
import Table from '../components/shared/Table';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useTrips, useTickets, useLuggage, useRoutes, useBuses, useDrivers, useTerminals } from '../hooks/useSupabaseData';
import { updateTicket, updateTrip } from '../services/supabaseService';
import type { Trip, Ticket } from '../types';
import { format } from 'date-fns';

const CheckInDashboard = () => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'manifest' | 'operations'>('checkin');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInMethod, setCheckInMethod] = useState<'qr' | 'manual'>('qr');
  const [scannedTicket, setScannedTicket] = useState<Ticket | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Fetch data from Supabase
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { tickets, loading: ticketsLoading, refetch: refetchTickets } = useTickets();
  const { luggage, loading: luggageLoading } = useLuggage();
  const { routes, loading: routesLoading } = useRoutes();
  const { buses, loading: busesLoading } = useBuses();
  const { drivers, loading: driversLoading } = useDrivers();
  const { terminals, loading: terminalsLoading } = useTerminals();

  const isLoading = tripsLoading || ticketsLoading || luggageLoading || routesLoading || busesLoading || driversLoading || terminalsLoading;

  // Get active trips for today
  const activeTrips = trips.filter(trip => {
    const today = new Date().toDateString();
    const tripDate = new Date(trip.scheduledDeparture).toDateString();
    return tripDate === today && (trip.status === 'scheduled' || trip.status === 'boarding');
  });

  // Get tickets for selected trip
  const tripTickets = selectedTrip
    ? tickets.filter(t => t.tripId === selectedTrip.id)
    : [];

  // Get luggage for selected trip
  const tripLuggage = selectedTrip
    ? luggage.filter(l => l.tripId === selectedTrip.id)
    : [];

  const handleQRScan = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId || t.qrCode === ticketId);
    if (ticket) {
      // Check if already checked in
      if (ticket.checkedIn) {
        alert('This ticket has already been checked in.');
        return;
      }

      // Check if ticket is for selected trip
      if (selectedTrip && ticket.tripId !== selectedTrip.id) {
        alert('This ticket is not for the selected trip.');
        return;
      }

      setScannedTicket(ticket);
      setShowCheckInModal(true);
    } else {
      alert('Invalid ticket. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    if (!scannedTicket) return;

    try {
      await updateTicket(scannedTicket.id, { checkedIn: true });
      alert(`Passenger ${scannedTicket.passengerName} checked in successfully!`);
      setShowCheckInModal(false);
      setScannedTicket(null);
      await refetchTickets();
    } catch (error: any) {
      alert(`Error checking in: ${error.message}`);
    }
  };

  const handleManualSearch = () => {
    const ticket = tickets.find(t =>
      t.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.passengerPhone.includes(searchQuery) ||
      t.seatNumber.toLowerCase() === searchQuery.toLowerCase()
    );

    if (ticket) {
      if (ticket.checkedIn) {
        alert('This ticket has already been checked in.');
        return;
      }
      setScannedTicket(ticket);
      setShowCheckInModal(true);
    } else {
      alert('No ticket found. Please try again.');
    }
  };

  const boardedCount = tripTickets.filter(t => t.checkedIn).length;
  const notBoardedCount = tripTickets.filter(t => !t.checkedIn).length;

  const route = selectedTrip ? routes.find(r => r.id === selectedTrip.routeId) : null;
  const bus = selectedTrip ? buses.find(b => b.id === selectedTrip.busId) : null;
  const driver = selectedTrip ? drivers.find(d => d.id === selectedTrip.driverId) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-In Dashboard</h1>
          <p className="text-gray-600 mt-1">Passenger check-in and trip operations</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Check-In Dashboard</h1>
          <p className="text-gray-600 mt-1">Passenger check-in and trip operations</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Offline Mode Toggle */}
          <div className="flex items-center gap-2">
            {isOffline ? (
              <>
                <WifiOff className="text-red-600" size={20} />
                <span className="text-sm text-red-600 font-medium">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="text-green-600" size={20} />
                <span className="text-sm text-green-600 font-medium">Online</span>
              </>
            )}
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isOffline ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isOffline ? 'Go Online' : 'Go Offline'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'checkin', label: 'Check-In' },
          { id: 'manifest', label: 'Passenger Manifest' },
          { id: 'operations', label: 'Trip Operations' },
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

      {/* Check-In Tab */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {/* Terminal Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Select Terminal / Pickup Point</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {terminals.map((terminal) => (
                <button
                  key={terminal.id}
                  onClick={() => setSelectedTerminal(terminal.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedTerminal === terminal.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="text-primary-600" size={20} />
                    <p className="font-semibold">{terminal.name}</p>
                  </div>
                  <p className="text-sm text-gray-600">{terminal.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{terminal.address}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Trip Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Select Active Trip</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTrips.map((trip) => {
                const route = routes.find(r => r.id === trip.routeId);
                return (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedTrip?.id === trip.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{route?.name || 'Route'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'boarding' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(trip.scheduledDeparture), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Available: {trip.availableSeats} / {trip.totalSeats}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTrip && (
            <>
              {/* Check-In Method Selection */}
              <div className="card">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setCheckInMethod('qr')}
                    className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                      checkInMethod === 'qr'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <QrCode className="mx-auto mb-2 text-primary-600" size={32} />
                    <p className="font-medium">QR Code Check-In</p>
                    <p className="text-sm text-gray-600">Scan passenger ticket QR code</p>
                  </button>
                  <button
                    onClick={() => setCheckInMethod('manual')}
                    className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                      checkInMethod === 'manual'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Search className="mx-auto mb-2 text-primary-600" size={32} />
                    <p className="font-medium">Manual Check-In</p>
                    <p className="text-sm text-gray-600">Search by name, ticket, seat, or ID</p>
                  </button>
                </div>

                {/* QR Check-In */}
                {checkInMethod === 'qr' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <QrCode className="mx-auto mb-4 text-gray-400" size={64} />
                      <p className="text-gray-600 mb-4">Position QR code within the frame</p>
                      {isOffline && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <WifiOff size={16} />
                            <span className="text-sm font-medium">Offline Mode: Data will sync when online</span>
                          </div>
                        </div>
                      )}
                      <input
                        type="text"
                        placeholder="Or enter ticket ID / QR code manually"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleQRScan(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="input-field max-w-md mx-auto"
                      />
                      <button
                        onClick={() => {
                          const input = prompt('Enter ticket ID or QR code:');
                          if (input) handleQRScan(input);
                        }}
                        className="btn-primary mt-4"
                      >
                        Scan QR Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Check-In */}
                {checkInMethod === 'manual' && (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="Search by name, ticket number, seat number, ID/Passport..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleManualSearch();
                            }
                          }}
                          className="input-field pl-10"
                        />
                      </div>
                      <button
                        onClick={handleManualSearch}
                        className="btn-primary"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Boarded</p>
                      <p className="text-2xl font-bold text-green-600">{boardedCount}</p>
                    </div>
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Not Boarded</p>
                      <p className="text-2xl font-bold text-red-600">{notBoardedCount}</p>
                    </div>
                    <XCircle className="text-red-600" size={32} />
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Passengers</p>
                      <p className="text-2xl font-bold text-gray-900">{tripTickets.length}</p>
                    </div>
                    <Users className="text-primary-600" size={32} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Passenger Manifest Tab */}
      {activeTab === 'manifest' && (
        <div className="space-y-6">
          {!selectedTrip ? (
            <div className="card text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Please select a trip from the Check-In tab first</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Passenger Manifest</h2>
                    <p className="text-sm text-gray-600">
                      {route?.name} - {format(new Date(selectedTrip.scheduledDeparture), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-secondary">
                      <Printer className="inline mr-2" size={16} />
                      Print Manifest
                    </button>
                    <button className="btn-primary">
                      <Download className="inline mr-2" size={16} />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  {['All', 'Boarded', 'Not Boarded', 'Late', 'Cancelled'].map((filter) => (
                    <button
                      key={filter}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'All'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Manifest Table */}
                <Table
                  data={tripTickets}
                  columns={[
                    { key: 'seatNumber', header: 'Seat' },
                    { key: 'passengerName', header: 'Passenger Name' },
                    { key: 'passengerPhone', header: 'Phone' },
                    {
                      key: 'checkedIn',
                      header: 'Status',
                      render: (ticket) => (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.checkedIn
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {ticket.checkedIn ? 'Boarded' : 'Not Boarded'}
                        </span>
                      ),
                    },
                    {
                      key: 'luggage',
                      header: 'Luggage',
                      render: (ticket) => {
                        const luggage = tripLuggage.filter(l => l.ticketId === ticket.id);
                        return luggage.length > 0 ? `${luggage.length} bag(s)` : 'None';
                      },
                    },
                  ]}
                />
              </div>

              {/* Boarded Passengers Only */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Boarded Passengers Only</h2>
                <Table
                  data={tripTickets.filter(t => t.checkedIn)}
                  columns={[
                    { key: 'seatNumber', header: 'Seat' },
                    { key: 'passengerName', header: 'Passenger Name' },
                    { key: 'passengerPhone', header: 'Phone' },
                    {
                      key: 'luggage',
                      header: 'Luggage',
                      render: (ticket) => {
                        const luggage = tripLuggage.filter(l => l.ticketId === ticket.id);
                        return luggage.length > 0 ? `${luggage.length} bag(s)` : 'None';
                      },
                    },
                  ]}
                  emptyMessage="No passengers boarded yet"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Trip Operations Tab */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {!selectedTrip ? (
            <div className="card text-center py-12">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Please select a trip from the Check-In tab first</p>
            </div>
          ) : (
            <>
              {/* Trip Information */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Trip Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Route</p>
                    <p className="font-semibold">{route?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bus</p>
                    <p className="font-semibold">{bus?.plateNumber || 'N/A'} - {bus?.model || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Driver</p>
                    <p className="font-semibold">{driver?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{driver?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTrip.status === 'boarding' ? 'bg-green-100 text-green-700' :
                      selectedTrip.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedTrip.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup Points */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Pickup Points</h2>
                <div className="space-y-3">
                  {route && (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="text-primary-600" size={20} />
                        <div>
                          <p className="font-medium">{route.origin}</p>
                          <p className="text-sm text-gray-600">Main Terminal</p>
                        </div>
                        <div className="ml-auto">
                          <p className="text-sm text-gray-600">Scheduled</p>
                          <p className="font-medium">{format(new Date(selectedTrip.scheduledDeparture), 'HH:mm')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="text-primary-600" size={20} />
                        <div>
                          <p className="font-medium">{route.destination}</p>
                          <p className="text-sm text-gray-600">Main Terminal</p>
                        </div>
                        <div className="ml-auto">
                          <p className="text-sm text-gray-600">Scheduled</p>
                          <p className="font-medium">{format(new Date(selectedTrip.scheduledArrival), 'HH:mm')}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Trip Controls */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Trip Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Time
                    </label>
                    <input
                      type="datetime-local"
                      defaultValue={selectedTrip.actualDeparture || selectedTrip.scheduledDeparture}
                      className="input-field"
                    />
                    <button
                      onClick={async () => {
                        try {
                          if (!selectedTrip) return;
                          const departureTime = (document.querySelector('input[type="datetime-local"]') as HTMLInputElement)?.value;
                          await updateTrip(selectedTrip.id, {
                            actualDeparture: departureTime,
                            status: 'in-transit',
                          });
                          alert('Departure marked successfully!');
                          await refetchTrips();
                        } catch (error: any) {
                          alert(`Error: ${error.message}`);
                        }
                      }}
                      className="btn-primary mt-2 w-full"
                    >
                      <Clock className="inline mr-2" size={16} />
                      Mark Departure
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Time
                    </label>
                    <input
                      type="datetime-local"
                      defaultValue={selectedTrip.actualArrival || selectedTrip.scheduledArrival}
                      className="input-field"
                    />
                    <button
                      onClick={async () => {
                        try {
                          if (!selectedTrip) return;
                          const arrivalTime = (document.querySelectorAll('input[type="datetime-local"]')[1] as HTMLInputElement)?.value;
                          await updateTrip(selectedTrip.id, {
                            actualArrival: arrivalTime,
                            status: 'arrived',
                          });
                          alert('Arrival marked successfully!');
                          await refetchTrips();
                        } catch (error: any) {
                          alert(`Error: ${error.message}`);
                        }
                      }}
                      className="btn-primary mt-2 w-full"
                    >
                      <Clock className="inline mr-2" size={16} />
                      Mark Arrival
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={async () => {
                      try {
                        if (!selectedTrip) return;
                        await updateTrip(selectedTrip.id, { status: 'boarding' });
                        alert('Trip marked as ready for departure!');
                        await refetchTrips();
                      } catch (error: any) {
                        alert(`Error: ${error.message}`);
                      }
                    }}
                    className="btn-primary w-full"
                  >
                    <Send className="inline mr-2" size={16} />
                    Mark as Ready for Departure
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This will send a departure notification to the admin dashboard
                  </p>
                </div>
              </div>

              {/* Driver Dashboard Summary */}
              <div className="card">
                <h2 className="text-lg font-semibold mb-4">Driver Dashboard Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Passengers</p>
                    <p className="text-2xl font-bold">{tripTickets.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Boarded</p>
                    <p className="text-2xl font-bold text-green-600">{boardedCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Luggage Count</p>
                    <p className="text-2xl font-bold">{tripLuggage.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Available Seats</p>
                    <p className="text-2xl font-bold">{selectedTrip.availableSeats}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Check-In Confirmation Modal */}
      {showCheckInModal && scannedTicket && (
        <Modal
          isOpen={showCheckInModal}
          onClose={() => {
            setShowCheckInModal(false);
            setScannedTicket(null);
          }}
          title="Check-In Confirmation"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Ticket Information</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scannedTicket.checkedIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {scannedTicket.checkedIn ? 'Already Checked In' : 'Valid'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passenger:</span>
                  <span className="font-medium">{scannedTicket.passengerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seat Number:</span>
                  <span className="font-medium">{scannedTicket.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket ID:</span>
                  <span className="font-medium">{scannedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{scannedTicket.passengerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Luggage:</span>
                  <span className="font-medium">
                    {tripLuggage.filter(l => l.ticketId === scannedTicket.id).length} bag(s)
                  </span>
                </div>
              </div>
            </div>

            {!scannedTicket.checkedIn && (
              <>
                {/* Security Alerts */}
                {(() => {
                  const ticketTrip = trips.find(t => t.id === scannedTicket.tripId);
                  const isExpired = ticketTrip && new Date(ticketTrip.scheduledDeparture) < new Date();
                  const isWrongTrip = selectedTrip && scannedTicket.tripId !== selectedTrip.id;
                  
                  return (
                    <div className="space-y-2 mb-4">
                      {isExpired && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">Warning: This ticket is for a past trip</span>
                          </div>
                        </div>
                      )}
                      {isWrongTrip && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">Warning: This ticket is for a different trip</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    className="btn-primary flex-1"
                  >
                    <CheckCircle className="inline mr-2" size={16} />
                    Confirm Check-In
                  </button>
                  <button
                    onClick={() => {
                      setShowCheckInModal(false);
                      setScannedTicket(null);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CheckInDashboard;

