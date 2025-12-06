import { useState } from 'react';
import { Search, Plus, QrCode, Package, AlertTriangle, CheckCircle, Printer, DollarSign, Camera, Upload, Download, Clock } from 'lucide-react';
import Modal from '../components/shared/Modal';
import Table from '../components/shared/Table';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useLuggage, useTickets, useTrips, useRoutes } from '../hooks/useSupabaseData';
import { createLuggage, updateLuggage } from '../services/supabaseService';
import type { Luggage } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const LuggageDashboard = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'tracking' | 'lost-found' | 'reports'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedLuggage, setSelectedLuggage] = useState<Luggage | null>(null);
  const [luggageForm, setLuggageForm] = useState({
    ticketId: '',
    passengerName: '',
    bagType: '',
    description: '',
    weight: '',
    fee: '',
  });
  const [issueForm, setIssueForm] = useState({
    luggageId: '',
    issueType: 'missing' as 'missing' | 'damaged' | 'delayed',
    description: '',
    photo: '',
  });

  // Fetch data from Supabase
  const { luggage, loading: luggageLoading, refetch: refetchLuggage } = useLuggage();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { trips, loading: tripsLoading } = useTrips();
  const { routes, loading: routesLoading } = useRoutes();

  const isLoading = luggageLoading || ticketsLoading || tripsLoading || routesLoading;

  const filteredLuggage = luggage.filter(luggage => {
    const searchLower = searchQuery.toLowerCase();
    return (
      luggage.tagId.toLowerCase().includes(searchLower) ||
      luggage.passengerName.toLowerCase().includes(searchLower) ||
      luggage.ticketId.toLowerCase().includes(searchLower)
    );
  });

  const lostLuggage = luggage.filter(l => l.status === 'lost');
  const collectedLuggage = luggage.filter(l => l.status === 'collected');

  const handleRegisterLuggage = async () => {
    try {
      const ticket = tickets.find(t => t.id === luggageForm.ticketId);
      if (!ticket) {
        alert('Please select a valid ticket');
        return;
      }

      const weight = parseFloat(luggageForm.weight);
      const fee = parseFloat(luggageForm.fee) || calculateFee(weight);

      const newLuggage = await createLuggage({
        ticketId: luggageForm.ticketId,
        passengerName: luggageForm.passengerName || ticket.passengerName,
        bagType: luggageForm.bagType,
        description: luggageForm.description,
        weight: weight,
        fee: fee,
        tagId: `LUG-${Date.now()}`,
        qrCode: `LUG-${Date.now()}-QR`,
        status: 'checked-in',
        tripId: ticket.tripId,
      });

      setSelectedLuggage(newLuggage);
      setShowRegisterModal(false);
      setShowQRModal(true);
      
      await refetchLuggage();
      
      // Reset form
      setLuggageForm({
        ticketId: '',
        passengerName: '',
        bagType: '',
        description: '',
        weight: '',
        fee: '',
      });
    } catch (error: any) {
      alert(`Error registering luggage: ${error.message}`);
    }
  };

  const calculateFee = (weight: number) => {
    if (weight <= 10) return 10;
    if (weight <= 20) return 20;
    if (weight <= 30) return 30;
    return 50;
  };

  const dailyLuggageFees = luggage
    .filter(l => {
      const today = new Date().toDateString();
      return new Date(l.createdAt).toDateString() === today;
    })
    .reduce((sum, l) => sum + l.fee, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Luggage Management</h1>
          <p className="text-gray-600 mt-1">Luggage registration, tracking, and lost & found</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Luggage Management</h1>
        <p className="text-gray-600 mt-1">Luggage registration, tracking, and lost & found</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'register', label: 'Luggage Registration' },
          { id: 'tracking', label: 'Luggage Tracking' },
          { id: 'lost-found', label: 'Lost & Found' },
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

      {/* Luggage Registration Tab */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ticket ID, passenger name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn-primary"
            >
              <Plus className="inline mr-2" size={16} />
              Register Luggage
            </button>
          </div>

          <Table
            data={filteredLuggage}
            columns={[
              { key: 'tagId', header: 'Tag ID' },
              { key: 'passengerName', header: 'Passenger' },
              { key: 'bagType', header: 'Bag Type' },
              { key: 'description', header: 'Description' },
              {
                key: 'weight',
                header: 'Weight (kg)',
                render: (luggage) => `${luggage.weight} kg`,
              },
              {
                key: 'fee',
                header: 'Fee',
                render: (luggage) => `MWK ${luggage.fee}`,
              },
              {
                key: 'status',
                header: 'Status',
                render: (luggage) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    luggage.status === 'checked-in' ? 'bg-blue-100 text-blue-700' :
                    luggage.status === 'loaded' ? 'bg-green-100 text-green-700' :
                    luggage.status === 'in-transit' ? 'bg-purple-100 text-purple-700' :
                    luggage.status === 'offloaded' ? 'bg-yellow-100 text-yellow-700' :
                    luggage.status === 'collected' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {luggage.status.replace('-', ' ')}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (luggage) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedLuggage(luggage);
                        setShowQRModal(true);
                      }}
                      className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                      title="View QR Code"
                    >
                      <QrCode size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Print Tag"
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Luggage Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Track Luggage</h2>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Scan QR code or enter tag ID..."
                  className="input-field pl-10"
                />
              </div>
              <button className="btn-primary">Scan QR</button>
            </div>

            <div className="space-y-4">
              {luggage.map((luggage) => {
                const ticket = tickets.find(t => t.id === luggage.ticketId);
                return (
                  <div key={luggage.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Tag ID: {luggage.tagId}</h3>
                        <p className="text-sm text-gray-600">Passenger: {luggage.passengerName}</p>
                        {ticket && <p className="text-sm text-gray-600">Ticket: {ticket.id}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        luggage.status === 'checked-in' ? 'bg-blue-100 text-blue-700' :
                        luggage.status === 'loaded' ? 'bg-green-100 text-green-700' :
                        luggage.status === 'in-transit' ? 'bg-purple-100 text-purple-700' :
                        luggage.status === 'offloaded' ? 'bg-yellow-100 text-yellow-700' :
                        luggage.status === 'collected' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {luggage.status.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`flex items-center gap-2 ${luggage.status === 'checked-in' || luggage.status === 'loaded' || luggage.status === 'in-transit' || luggage.status === 'offloaded' || luggage.status === 'collected' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span>Checked-in</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className={`flex items-center gap-2 ${luggage.status === 'loaded' || luggage.status === 'in-transit' || luggage.status === 'offloaded' || luggage.status === 'collected' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span>Loaded</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className={`flex items-center gap-2 ${luggage.status === 'in-transit' || luggage.status === 'offloaded' || luggage.status === 'collected' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span>In Transit</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className={`flex items-center gap-2 ${luggage.status === 'offloaded' || luggage.status === 'collected' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span>Offloaded</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className={`flex items-center gap-2 ${luggage.status === 'collected' ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={16} />
                        <span>Collected</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Bag Type</p>
                        <p className="font-medium">{luggage.bagType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Weight</p>
                        <p className="font-medium">{luggage.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fee</p>
                        <p className="font-medium">MWK {luggage.fee}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Registered</p>
                        <p className="font-medium">{format(new Date(luggage.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lost & Found Tab */}
      {activeTab === 'lost-found' && (
        <div className="space-y-6">
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">Luggage Issues & Lost & Found</h3>
                <p className="text-sm text-red-700">Report and track missing, damaged, or delayed luggage</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setIssueForm({
                  luggageId: '',
                  issueType: 'missing',
                  description: '',
                  photo: '',
                });
                setShowIssueModal(true);
              }}
              className="btn-primary"
            >
              <Plus className="inline mr-2" size={16} />
              Report Luggage Issue
            </button>
          </div>

          {lostLuggage.length > 0 ? (
            <Table
              data={lostLuggage}
              columns={[
                { key: 'tagId', header: 'Tag ID' },
                { key: 'passengerName', header: 'Passenger' },
                { key: 'bagType', header: 'Bag Type' },
                { key: 'description', header: 'Description' },
                {
                  key: 'status',
                  header: 'Issue Type',
                  render: () => (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Missing
                    </span>
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Reported',
                  render: (luggage) => format(new Date(luggage.createdAt), 'MMM dd, yyyy'),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (luggage) => (
                    <div className="flex gap-2">
                      <button className="btn-primary text-sm">
                        View Details
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await updateLuggage(luggage.id, { status: 'collected' });
                            alert('Luggage marked as resolved!');
                            await refetchLuggage();
                          } catch (error: any) {
                            alert(`Error: ${error.message}`);
                          }
                        }}
                        className="btn-secondary text-sm"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div className="card text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No luggage issues reported</p>
            </div>
          )}

          {/* Issue Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missing Luggage</p>
                  <p className="text-2xl font-bold text-red-600">{lostLuggage.length}</p>
                </div>
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
            <div className="card border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Damaged Luggage</p>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
                <Package className="text-yellow-600" size={32} />
              </div>
            </div>
            <div className="card border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delayed Luggage</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <Clock className="text-blue-600" size={32} />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Resolved Cases</h2>
            {collectedLuggage.length > 0 ? (
              <Table
                data={collectedLuggage}
                columns={[
                  { key: 'tagId', header: 'Tag ID' },
                  { key: 'passengerName', header: 'Passenger' },
                  { key: 'bagType', header: 'Bag Type' },
                  {
                    key: 'createdAt',
                    header: 'Collected',
                    render: (luggage) => format(new Date(luggage.createdAt), 'MMM dd, yyyy'),
                  },
                ]}
              />
            ) : (
              <p className="text-gray-500 text-center py-4">No resolved cases</p>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Luggage Fees</p>
                  <p className="text-2xl font-bold text-gray-900">MWK {dailyLuggageFees.toLocaleString()}</p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lost Luggage</p>
                  <p className="text-2xl font-bold text-gray-900">{lostLuggage.length}</p>
                </div>
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Luggage</p>
                  <p className="text-2xl font-bold text-gray-900">{luggage.length}</p>
                </div>
                <Package className="text-primary-600" size={32} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Trip Luggage Summary</h2>
              <button className="btn-secondary text-sm">
                <Download className="inline mr-2" size={14} />
                Export CSV
              </button>
            </div>
            <Table
              data={trips.map(trip => {
                const tripLuggage = luggage.filter(l => l.tripId === trip.id);
                const route = routes.find(r => r.id === trip.routeId);
                return {
                  id: trip.id,
                  tripId: trip.id,
                  route: route?.name || 'N/A',
                  luggageCount: tripLuggage.length,
                  totalFees: tripLuggage.reduce((sum, l) => sum + l.fee, 0),
                };
              })}
              columns={[
                { key: 'tripId', header: 'Trip ID' },
                { key: 'route', header: 'Route' },
                { key: 'luggageCount', header: 'Luggage Count' },
                {
                  key: 'totalFees',
                  header: 'Total Fees',
                  render: (item) => `MWK ${item.totalFees}`,
                },
              ]}
            />
          </div>

          {/* Luggage Volume Chart */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Luggage Volume Trends</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      )}

      {/* Register Luggage Modal */}
      {showRegisterModal && (
        <Modal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          title="Register Luggage"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket ID *
              </label>
              <select
                value={luggageForm.ticketId}
                onChange={(e) => {
                  const ticket = tickets.find(t => t.id === e.target.value);
                  setLuggageForm({
                    ...luggageForm,
                    ticketId: e.target.value,
                    passengerName: ticket?.passengerName || '',
                  });
                }}
                className="input-field"
              >
                <option value="">Select Ticket</option>
                {tickets.map(ticket => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.id} - {ticket.passengerName} (Seat: {ticket.seatNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passenger Name
              </label>
              <input
                type="text"
                value={luggageForm.passengerName}
                onChange={(e) => setLuggageForm({ ...luggageForm, passengerName: e.target.value })}
                className="input-field"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bag Type *
              </label>
              <select
                value={luggageForm.bagType}
                onChange={(e) => setLuggageForm({ ...luggageForm, bagType: e.target.value })}
                className="input-field"
              >
                <option value="">Select Bag Type</option>
                <option value="Suitcase">Suitcase</option>
                <option value="Backpack">Backpack</option>
                <option value="Duffel Bag">Duffel Bag</option>
                <option value="Box">Box</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={luggageForm.description}
                onChange={(e) => setLuggageForm({ ...luggageForm, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="e.g., Black medium suitcase with wheels"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) *
              </label>
              <input
                type="number"
                value={luggageForm.weight}
                onChange={(e) => {
                  const weight = parseFloat(e.target.value) || 0;
                  setLuggageForm({
                    ...luggageForm,
                    weight: e.target.value,
                    fee: calculateFee(weight).toString(),
                  });
                }}
                className="input-field"
                placeholder="Enter weight in kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee (MWK)
              </label>
              <input
                type="number"
                value={luggageForm.fee}
                onChange={(e) => setLuggageForm({ ...luggageForm, fee: e.target.value })}
                className="input-field"
                placeholder="Auto-calculated based on weight"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleRegisterLuggage}
                disabled={!luggageForm.ticketId || !luggageForm.bagType || !luggageForm.description || !luggageForm.weight}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register & Print Tag
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedLuggage && (
        <Modal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedLuggage(null);
          }}
          title="Luggage Tag QR Code"
          size="md"
        >
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <QRCodeSVG value={selectedLuggage.qrCode} size={200} />
            </div>
            <div>
              <p className="font-semibold">Tag ID: {selectedLuggage.tagId}</p>
              <p className="text-sm text-gray-600">{selectedLuggage.passengerName}</p>
              <p className="text-sm text-gray-600">{selectedLuggage.bagType} - {selectedLuggage.description}</p>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1">
                <Printer className="inline mr-2" size={16} />
                Print Tag
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <Modal
          isOpen={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          title="Report Luggage Issue"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Luggage Tag ID *</label>
              <select
                value={issueForm.luggageId}
                onChange={(e) => setIssueForm({ ...issueForm, luggageId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Luggage</option>
                {luggage.map(luggage => (
                  <option key={luggage.id} value={luggage.id}>
                    {luggage.tagId} - {luggage.passengerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
              <select
                value={issueForm.issueType}
                onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value as any })}
                className="input-field"
              >
                <option value="missing">Missing</option>
                <option value="damaged">Damaged</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={issueForm.description}
                onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <button className="btn-secondary text-sm">
                  <Upload className="inline mr-2" size={14} />
                  Choose File
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  alert('Luggage issue reported successfully!');
                  setShowIssueModal(false);
                }}
                disabled={!issueForm.luggageId || !issueForm.description}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
              <button
                onClick={() => setShowIssueModal(false)}
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

export default LuggageDashboard;

