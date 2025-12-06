import { useState } from 'react';
import { 
  Calendar, 
  Bus, 
  DollarSign, 
  Wrench,
  Users,
  MapPin,
  FileText,
  Bell,
  Activity,
  Plus,
  Edit,
  Download,
  Package,
  CheckSquare,
  Star,
  Clock,
  Percent
} from 'lucide-react';
import StatCard from '../components/shared/StatCard';
import Modal from '../components/shared/Modal';
import Table from '../components/shared/Table';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useTrips, useTickets, useBuses, useDrivers, useRoutes, useTerminals, useActivityLogs, useNotifications, useLuggage } from '../hooks/useSupabaseData';
import { createTrip, updateTrip, createBus, updateBus, createDriver, updateDriver, createRoute, updateRoute, createTerminal, updateTerminal } from '../services/supabaseService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'trips' | 'fleet' | 'monitoring' | 'reports' | 'logs' | 'notifications'>('overview');
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tripForm, setTripForm] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    scheduledDeparture: '',
    scheduledArrival: '',
    price: '',
  });
  const [busForm, setBusForm] = useState({
    plateNumber: '',
    model: '',
    capacity: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive',
    lastMaintenance: '',
  });
  const [driverForm, setDriverForm] = useState({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'on-leave' | 'suspended',
  });
  const [routeForm, setRouteForm] = useState({
    name: '',
    origin: '',
    destination: '',
    distance: '',
    duration: '',
    price: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [terminalForm, setTerminalForm] = useState({
    name: '',
    location: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch data from Supabase
  const { trips, loading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { tickets, loading: ticketsLoading } = useTickets();
  const { buses, loading: busesLoading, refetch: refetchBuses } = useBuses();
  const { drivers, loading: driversLoading, refetch: refetchDrivers } = useDrivers();
  const { routes, loading: routesLoading, refetch: refetchRoutes } = useRoutes();
  const { terminals, loading: terminalsLoading, refetch: refetchTerminals } = useTerminals();
  const { activityLogs, loading: logsLoading } = useActivityLogs();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const { luggage, loading: luggageLoading } = useLuggage();

  const isLoading = tripsLoading || ticketsLoading || busesLoading || driversLoading || routesLoading || terminalsLoading || logsLoading || notificationsLoading || luggageLoading;

  // Calculate stats
  const totalTripsToday = trips.filter(t => 
    new Date(t.scheduledDeparture).toDateString() === new Date().toDateString()
  ).length;
  
  const totalPassengers = tickets.length;
  const totalSeats = trips.reduce((sum, t) => sum + t.totalSeats, 0);
  const bookedSeats = trips.reduce((sum, t) => sum + (t.totalSeats - t.availableSeats), 0);
  const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  const revenueToday = tickets.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.createdAt).toDateString() === today;
  }).reduce((sum, t) => sum + (t.price - (t.discount || 0)), 0);
  
  const revenueWeekly = tickets.reduce((sum, t) => sum + (t.price - (t.discount || 0)), 0);
  const revenueMonthly = revenueWeekly * 4; // Approximation
  
  const activeBuses = buses.filter(b => b.status === 'active').length;
  const maintenanceBuses = buses.filter(b => b.status === 'maintenance').length;
  const outOfServiceBuses = buses.filter(b => b.status === 'inactive').length;
  
  const pendingLuggage = luggage.filter(l => 
    l.status === 'checked-in' || l.status === 'loaded'
  ).length;
  
  const pendingCheckIns = tickets.filter(t => !t.checkedIn).length;

  // Chart data
  const dailySalesData = [
    { date: 'Mon', sales: 1200 },
    { date: 'Tue', sales: 1900 },
    { date: 'Wed', sales: 3000 },
    { date: 'Thu', sales: 2500 },
    { date: 'Fri', sales: 3200 },
    { date: 'Sat', sales: 2800 },
    { date: 'Sun', sales: 2100 },
  ];

  const passengerVolumeData = [
    { date: 'Mon', passengers: 45 },
    { date: 'Tue', passengers: 62 },
    { date: 'Wed', passengers: 98 },
    { date: 'Thu', passengers: 78 },
    { date: 'Fri', passengers: 105 },
    { date: 'Sat', passengers: 92 },
    { date: 'Sun', passengers: 68 },
  ];

  const routePerformanceData = routes.map(route => ({
    name: route.name,
    trips: Math.floor(Math.random() * 20) + 10,
    revenue: Math.floor(Math.random() * 5000) + 2000,
  }));

  const busUtilizationData = [
    { name: 'Active', value: activeBuses, color: '#0ea5e9' },
    { name: 'Maintenance', value: maintenanceBuses, color: '#f59e0b' },
    { name: 'Inactive', value: buses.length - activeBuses - maintenanceBuses, color: '#6b7280' },
  ];

  const handleManage = (type: string) => {
    setSelectedModal(type);
    setSelectedItem(null);
    // Reset forms
    if (type === 'bus') {
      setBusForm({ plateNumber: '', model: '', capacity: '', status: 'active', lastMaintenance: '' });
    } else if (type === 'driver') {
      setDriverForm({ name: '', licenseNumber: '', phone: '', email: '', status: 'active' });
    } else if (type === 'route') {
      setRouteForm({ name: '', origin: '', destination: '', distance: '', duration: '', price: '', status: 'active' });
    } else if (type === 'terminal') {
      setTerminalForm({ name: '', location: '', address: '', status: 'active' });
    }
  };

  const handleEdit = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedModal(type);
    // Populate forms
    if (type === 'bus') {
      setBusForm({
        plateNumber: item.plateNumber,
        model: item.model,
        capacity: item.capacity.toString(),
        status: item.status,
        lastMaintenance: item.lastMaintenance || '',
      });
    } else if (type === 'driver') {
      setDriverForm({
        name: item.name,
        licenseNumber: item.licenseNumber,
        phone: item.phone,
        email: item.email,
        status: item.status,
      });
    } else if (type === 'route') {
      setRouteForm({
        name: item.name,
        origin: item.origin,
        destination: item.destination,
        distance: item.distance.toString(),
        duration: item.duration.toString(),
        price: item.price.toString(),
        status: item.status,
      });
    } else if (type === 'terminal') {
      setTerminalForm({
        name: item.name,
        location: item.location,
        address: item.address,
        status: item.status,
      });
    }
  };

  const handleCreateTrip = async () => {
    try {
      const selectedRoute = routes.find(r => r.id === tripForm.routeId);
      const selectedBus = buses.find(b => b.id === tripForm.busId);
      
      if (!selectedRoute || !selectedBus) {
        alert('Please select route and bus');
        return;
      }

      await createTrip({
        routeId: tripForm.routeId,
        busId: tripForm.busId,
        driverId: tripForm.driverId,
        scheduledDeparture: tripForm.scheduledDeparture,
        scheduledArrival: tripForm.scheduledArrival,
        status: 'scheduled',
        availableSeats: selectedBus.capacity,
        totalSeats: selectedBus.capacity,
        price: parseFloat(tripForm.price),
      });

      alert('Trip created successfully!');
      setSelectedModal(null);
      setSelectedItem(null);
      await refetchTrips();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateTrip = async () => {
    try {
      await updateTrip(selectedItem.id, {
        routeId: tripForm.routeId,
        busId: tripForm.busId,
        driverId: tripForm.driverId,
        scheduledDeparture: tripForm.scheduledDeparture,
        scheduledArrival: tripForm.scheduledArrival,
        price: parseFloat(tripForm.price),
      });

      alert('Trip updated successfully!');
      setSelectedModal(null);
      setSelectedItem(null);
      await refetchTrips();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Operations hub and system management</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Operations hub and system management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'analytics', label: 'Analytics' },
          { id: 'trips', label: 'Trip Management' },
          { id: 'fleet', label: 'Fleet & Drivers' },
          { id: 'monitoring', label: 'Real-Time Monitoring' },
          { id: 'reports', label: 'Reports' },
          { id: 'logs', label: 'System Logs' },
          { id: 'notifications', label: 'Notifications' },
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Trips Today"
              value={totalTripsToday}
              icon={Calendar}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Total Passengers"
              value={totalPassengers}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Occupancy Rate"
              value={`${occupancyRate}%`}
              icon={Percent}
              color="green"
            />
            <StatCard
              title="Revenue Today"
              value={`MWK ${revenueToday.toLocaleString()}`}
              icon={DollarSign}
              color="green"
              trend={{ value: 15, isPositive: true }}
            />
            <StatCard
              title="Active Buses"
              value={`${activeBuses}/${buses.length}`}
              icon={Bus}
              color="blue"
            />
            <StatCard
              title="Out of Service"
              value={outOfServiceBuses}
              icon={Wrench}
              color="red"
            />
            <StatCard
              title="Pending Luggage"
              value={pendingLuggage}
              icon={Package}
              color="yellow"
            />
            <StatCard
              title="Pending Check-Ins"
              value={pendingCheckIns}
              icon={CheckSquare}
              color="yellow"
            />
          </div>

          {/* Live Notifications */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="text-primary-600" size={20} />
              Live Notifications
            </h2>
            <div className="space-y-3">
              {notifications.filter(n => !n.read).slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    notification.type === 'error' ? 'bg-red-50 border-red-500' :
                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.createdAt), 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleManage('bus')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Bus className="text-primary-600 mb-2" size={24} />
                <p className="font-medium">Manage Buses</p>
              </button>
              <button
                onClick={() => handleManage('driver')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Users className="text-primary-600 mb-2" size={24} />
                <p className="font-medium">Manage Drivers</p>
              </button>
              <button
                onClick={() => handleManage('route')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <MapPin className="text-primary-600 mb-2" size={24} />
                <p className="font-medium">Manage Routes</p>
              </button>
              <button
                onClick={() => handleManage('terminal')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <MapPin className="text-primary-600 mb-2" size={24} />
                <p className="font-medium">Manage Terminals</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Daily Sales</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Passenger Volume Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Passenger Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={passengerVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passengers" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Route Performance */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Route Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={routePerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trips" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bus Utilization */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Bus Utilization Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={busUtilizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {busUtilizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trip Punctuality Score */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Trip Punctuality Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary-600">87%</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: '87%' }} />
                </div>
                <p className="text-sm text-gray-600 mt-2">On-time performance this month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Management Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Trip Management</h2>
            <button
              onClick={() => {
                setSelectedItem(null);
                setTripForm({
                  routeId: '',
                  busId: '',
                  driverId: '',
                  scheduledDeparture: '',
                  scheduledArrival: '',
                  price: '',
                });
                setSelectedModal('trip');
              }}
              className="btn-primary"
            >
              <Plus className="inline mr-2" size={16} />
              Create New Trip
            </button>
          </div>

          <div className="card">
            <div className="mb-4 flex gap-4">
              <select className="input-field">
                <option>All Routes</option>
                {routes.map(r => <option key={r.id}>{r.name}</option>)}
              </select>
              <select className="input-field">
                <option>All Status</option>
                <option>Scheduled</option>
                <option>Boarding</option>
                <option>In Transit</option>
                <option>Arrived</option>
                <option>Cancelled</option>
              </select>
              <input type="date" className="input-field" />
            </div>

            <Table
              data={trips}
              columns={[
                { key: 'id', header: 'Trip ID' },
                {
                  key: 'routeId',
                  header: 'Route',
                  render: (trip) => {
                    const route = routes.find(r => r.id === trip.routeId);
                    return route ? `${route.origin} → ${route.destination}` : 'N/A';
                  },
                },
                {
                  key: 'scheduledDeparture',
                  header: 'Departure',
                  render: (trip) => format(new Date(trip.scheduledDeparture), 'MMM dd, yyyy HH:mm'),
                },
                {
                  key: 'availableSeats',
                  header: 'Capacity',
                  render: (trip) => `${trip.totalSeats - trip.availableSeats}/${trip.totalSeats}`,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (trip) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      trip.status === 'boarding' ? 'bg-green-100 text-green-700' :
                      trip.status === 'in-transit' ? 'bg-purple-100 text-purple-700' :
                      trip.status === 'arrived' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {trip.status}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (trip) => (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(trip);
                          setTripForm({
                            routeId: trip.routeId,
                            busId: trip.busId,
                            driverId: trip.driverId,
                            scheduledDeparture: trip.scheduledDeparture,
                            scheduledArrival: trip.scheduledArrival,
                            price: trip.price.toString(),
                          });
                          setSelectedModal('trip');
                        }}
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Fleet & Driver Management Tab */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Management */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Fleet Management</h2>
                <button
                  onClick={() => handleManage('bus')}
                  className="btn-primary text-sm"
                >
                  <Plus className="inline mr-2" size={14} />
                  Add Bus
                </button>
              </div>
              <div className="space-y-3">
                {buses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No data available</p>
                  </div>
                ) : (
                  buses.map((bus) => (
                  <div key={bus.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{bus.plateNumber}</p>
                        <p className="text-sm text-gray-600">{bus.model}</p>
                        <p className="text-sm text-gray-600">Capacity: {bus.capacity} seats</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bus.status === 'active' ? 'bg-green-100 text-green-700' :
                        bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {bus.status}
                      </span>
                    </div>
                    {bus.lastMaintenance && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                        <Clock size={12} />
                        <span>Last maintenance: {format(new Date(bus.lastMaintenance), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(bus, 'bus')}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button className="text-xs text-primary-600 hover:underline">Service History</button>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>

            {/* Driver Management */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Driver Management</h2>
                <button
                  onClick={() => handleManage('driver')}
                  className="btn-primary text-sm"
                >
                  <Plus className="inline mr-2" size={14} />
                  Add Driver
                </button>
              </div>
              <div className="space-y-3">
                {drivers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No data available</p>
                  </div>
                ) : (
                  drivers.map((driver) => {
                  const driverTrips = trips.filter(t => t.driverId === driver.id).length;
                  return (
                    <div key={driver.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{driver.name}</p>
                          <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                          <p className="text-sm text-gray-600">{driver.phone}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.status === 'active' ? 'bg-green-100 text-green-700' :
                          driver.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {driver.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                        <span>Trips: {driverTrips}</span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(driver, 'driver')}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button className="text-xs text-primary-600 hover:underline">View Schedule</button>
                      </div>
                    </div>
                  );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Routes & Terminals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Routes</h2>
                <button
                  onClick={() => handleManage('route')}
                  className="btn-primary text-sm"
                >
                  <Plus className="inline mr-2" size={14} />
                  Add Route
                </button>
              </div>
              <Table
                data={routes}
                columns={[
                  { key: 'name', header: 'Route' },
                  {
                    key: 'price',
                    header: 'Price',
                    render: (route) => `MWK ${route.price}`,
                  },
                  {
                    key: 'duration',
                    header: 'Duration',
                    render: (route) => `${route.duration} hrs`,
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (route) => (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {route.status}
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Terminals</h2>
                <button
                  onClick={() => handleManage('terminal')}
                  className="btn-primary text-sm"
                >
                  <Plus className="inline mr-2" size={14} />
                  Add Terminal
                </button>
              </div>
              {terminals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {terminals.map((terminal) => (
                    <div key={terminal.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{terminal.name}</p>
                          <p className="text-sm text-gray-600">{terminal.location}</p>
                          <p className="text-xs text-gray-500">{terminal.address}</p>
                        </div>
                        <button
                          onClick={() => handleEdit(terminal, 'terminal')}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Reports & Analytics</h2>
            <div className="flex gap-2">
              <button className="btn-secondary">
                <Download className="inline mr-2" size={16} />
                Export CSV
              </button>
              <button className="btn-secondary">
                <FileText className="inline mr-2" size={16} />
                Export PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="font-semibold mb-2">Revenue Reports</h3>
              <p className="text-2xl font-bold text-primary-600">MWK {revenueMonthly.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Monthly Revenue</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily</span>
                  <span className="font-medium">MWK {revenueToday.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Weekly</span>
                  <span className="font-medium">MWK {revenueWeekly.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-2">Trip Occupancy Trends</h3>
              <p className="text-2xl font-bold text-green-600">{occupancyRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Average Occupancy</p>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: `${occupancyRate}%` }} />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-2">Popular Routes</h3>
              <div className="space-y-2 mt-4">
                {routes.slice(0, 3).map((route) => {
                  const routeTrips = trips.filter(t => t.routeId === route.id).length;
                  return (
                    <div key={route.id} className="flex justify-between items-center">
                      <span className="text-sm">{route.name}</span>
                      <span className="text-sm font-medium">{routeTrips} trips</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Driver Performance</h3>
            <Table
              data={drivers}
              columns={[
                { key: 'name', header: 'Driver' },
                { key: 'licenseNumber', header: 'License' },
                {
                  key: 'trips',
                  header: 'Trips Completed',
                  render: (driver) => trips.filter(t => t.driverId === driver.id).length,
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  render: () => (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span>4.8</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (driver) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {driver.status}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Luggage Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Luggage</span>
                  <span className="font-medium">{luggage.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lost Luggage</span>
                  <span className="font-medium text-red-600">{luggage.filter(l => l.status === 'lost').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collected</span>
                  <span className="font-medium text-green-600">{luggage.filter(l => l.status === 'collected').length}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Check-In Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tickets</span>
                  <span className="font-medium">{tickets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Checked In</span>
                  <span className="font-medium text-green-600">{tickets.filter(t => t.checkedIn).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-yellow-600">{tickets.filter(t => !t.checkedIn).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Live Trip Tracker</h2>
            <Table
              data={trips}
              columns={[
                { key: 'id', header: 'Trip ID' },
                {
                  key: 'routeId',
                  header: 'Route',
                  render: (trip) => {
                    const route = routes.find(r => r.id === trip.routeId);
                    return route ? `${route.origin} → ${route.destination}` : 'N/A';
                  },
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (trip) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trip.status === 'in-transit' ? 'bg-green-100 text-green-700' :
                      trip.status === 'boarding' ? 'bg-blue-100 text-blue-700' :
                      trip.status === 'delayed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status}
                    </span>
                  ),
                },
                {
                  key: 'availableSeats',
                  header: 'Passengers',
                  render: (trip) => `${trip.totalSeats - trip.availableSeats}/${trip.totalSeats}`,
                },
                {
                  key: 'scheduledDeparture',
                  header: 'Departure',
                  render: (trip) => new Date(trip.scheduledDeparture).toLocaleTimeString(),
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Bus Status</h3>
              <div className="space-y-3">
                {buses.map((bus) => (
                  <div key={bus.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{bus.plateNumber}</p>
                      <p className="text-sm text-gray-600">{bus.model}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bus.status === 'active' ? 'bg-green-100 text-green-700' :
                      bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {bus.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Active Drivers</h3>
              <div className="space-y-3">
                {drivers.filter(d => d.status === 'active').map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                    </div>
                    <Activity className="text-green-600" size={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
          <Table
            data={activityLogs}
            columns={[
              { key: 'timestamp', header: 'Time', render: (log) => new Date(log.timestamp).toLocaleString() },
              { key: 'userId', header: 'User ID' },
              { key: 'action', header: 'Action' },
              { key: 'resource', header: 'Resource' },
              { key: 'details', header: 'Details' },
            ]}
          />
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card ${!notification.read ? 'border-l-4 border-primary-600' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.type === 'success' ? 'bg-green-100 text-green-700' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  notification.type === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {notification.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trip Management Modal */}
      {selectedModal === 'trip' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedModal(null);
            setSelectedItem(null);
          }}
          title={selectedItem ? 'Edit Trip' : 'Create New Trip'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Route *</label>
              <select
                value={tripForm.routeId}
                onChange={(e) => setTripForm({ ...tripForm, routeId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Route</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} - MWK {route.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus *</label>
                <select
                  value={tripForm.busId}
                  onChange={(e) => setTripForm({ ...tripForm, busId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Bus</option>
                  {buses.filter(b => b.status === 'active').map(bus => (
                    <option key={bus.id} value={bus.id}>
                      {bus.plateNumber} - {bus.capacity} seats
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver *</label>
                <select
                  value={tripForm.driverId}
                  onChange={(e) => setTripForm({ ...tripForm, driverId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Driver</option>
                  {drivers.filter(d => d.status === 'active').map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Departure *</label>
                <input
                  type="datetime-local"
                  value={tripForm.scheduledDeparture}
                  onChange={(e) => setTripForm({ ...tripForm, scheduledDeparture: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Arrival *</label>
                <input
                  type="datetime-local"
                  value={tripForm.scheduledArrival}
                  onChange={(e) => setTripForm({ ...tripForm, scheduledArrival: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (MWK) *</label>
              <input
                type="number"
                value={tripForm.price}
                onChange={(e) => setTripForm({ ...tripForm, price: e.target.value })}
                className="input-field"
                placeholder="Enter ticket price"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={selectedItem ? handleUpdateTrip : handleCreateTrip}
                className="btn-primary flex-1"
              >
                {selectedItem ? 'Update Trip' : 'Create Trip'}
              </button>
              <button
                onClick={() => {
                  setSelectedModal(null);
                  setSelectedItem(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bus Management Modal */}
      {selectedModal === 'bus' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedModal(null);
            setSelectedItem(null);
          }}
          title={selectedItem ? 'Edit Bus' : 'Add New Bus'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
              <input
                type="text"
                value={busForm.plateNumber}
                onChange={(e) => setBusForm({ ...busForm, plateNumber: e.target.value })}
                className="input-field"
                placeholder="e.g., UL-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
              <input
                type="text"
                value={busForm.model}
                onChange={(e) => setBusForm({ ...busForm, model: e.target.value })}
                className="input-field"
                placeholder="e.g., Mercedes Sprinter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
              <input
                type="number"
                value={busForm.capacity}
                onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })}
                className="input-field"
                placeholder="Number of seats"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={busForm.status}
                onChange={(e) => setBusForm({ ...busForm, status: e.target.value as any })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance</label>
              <input
                type="date"
                value={busForm.lastMaintenance}
                onChange={(e) => setBusForm({ ...busForm, lastMaintenance: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    if (!busForm.plateNumber || !busForm.model || !busForm.capacity) {
                      alert('Please fill all required fields');
                      return;
                    }
                    if (selectedItem) {
                      await updateBus(selectedItem.id, {
                        plateNumber: busForm.plateNumber,
                        model: busForm.model,
                        capacity: parseInt(busForm.capacity),
                        status: busForm.status,
                        lastMaintenance: busForm.lastMaintenance || undefined,
                      });
                      alert('Bus updated successfully!');
                    } else {
                      await createBus({
                        plateNumber: busForm.plateNumber,
                        model: busForm.model,
                        capacity: parseInt(busForm.capacity),
                        status: busForm.status,
                        lastMaintenance: busForm.lastMaintenance || undefined,
                      });
                      alert('Bus created successfully!');
                    }
                    setSelectedModal(null);
                    setSelectedItem(null);
                    await refetchBuses();
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="btn-primary flex-1"
              >
                {selectedItem ? 'Update Bus' : 'Create Bus'}
              </button>
              <button
                onClick={() => {
                  setSelectedModal(null);
                  setSelectedItem(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Driver Management Modal */}
      {selectedModal === 'driver' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedModal(null);
            setSelectedItem(null);
          }}
          title={selectedItem ? 'Edit Driver' : 'Add New Driver'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={driverForm.name}
                onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                className="input-field"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
              <input
                type="text"
                value={driverForm.licenseNumber}
                onChange={(e) => setDriverForm({ ...driverForm, licenseNumber: e.target.value })}
                className="input-field"
                placeholder="e.g., DL-12345"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="+265..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                  className="input-field"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={driverForm.status}
                onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value as any })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    if (!driverForm.name || !driverForm.licenseNumber || !driverForm.phone || !driverForm.email) {
                      alert('Please fill all required fields');
                      return;
                    }
                    if (selectedItem) {
                      await updateDriver(selectedItem.id, {
                        name: driverForm.name,
                        licenseNumber: driverForm.licenseNumber,
                        phone: driverForm.phone,
                        email: driverForm.email,
                        status: driverForm.status,
                      });
                      alert('Driver updated successfully!');
                    } else {
                      await createDriver({
                        name: driverForm.name,
                        licenseNumber: driverForm.licenseNumber,
                        phone: driverForm.phone,
                        email: driverForm.email,
                        status: driverForm.status,
                      });
                      alert('Driver created successfully!');
                    }
                    setSelectedModal(null);
                    setSelectedItem(null);
                    await refetchDrivers();
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="btn-primary flex-1"
              >
                {selectedItem ? 'Update Driver' : 'Create Driver'}
              </button>
              <button
                onClick={() => {
                  setSelectedModal(null);
                  setSelectedItem(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Route Management Modal */}
      {selectedModal === 'route' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedModal(null);
            setSelectedItem(null);
          }}
          title={selectedItem ? 'Edit Route' : 'Add New Route'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Route Name *</label>
              <input
                type="text"
                value={routeForm.name}
                onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Lilongwe - Blantyre"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin *</label>
                <input
                  type="text"
                  value={routeForm.origin}
                  onChange={(e) => setRouteForm({ ...routeForm, origin: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Lilongwe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                <input
                  type="text"
                  value={routeForm.destination}
                  onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Blantyre"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km) *</label>
                <input
                  type="number"
                  value={routeForm.distance}
                  onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })}
                  className="input-field"
                  placeholder="350"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours) *</label>
                <input
                  type="number"
                  value={routeForm.duration}
                  onChange={(e) => setRouteForm({ ...routeForm, duration: e.target.value })}
                  className="input-field"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (MWK) *</label>
                <input
                  type="number"
                  value={routeForm.price}
                  onChange={(e) => setRouteForm({ ...routeForm, price: e.target.value })}
                  className="input-field"
                  placeholder="250"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={routeForm.status}
                onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as any })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    if (!routeForm.name || !routeForm.origin || !routeForm.destination || !routeForm.distance || !routeForm.duration || !routeForm.price) {
                      alert('Please fill all required fields');
                      return;
                    }
                    if (selectedItem) {
                      await updateRoute(selectedItem.id, {
                        name: routeForm.name,
                        origin: routeForm.origin,
                        destination: routeForm.destination,
                        distance: parseInt(routeForm.distance),
                        duration: parseInt(routeForm.duration),
                        price: parseFloat(routeForm.price),
                        status: routeForm.status,
                      });
                      alert('Route updated successfully!');
                    } else {
                      await createRoute({
                        name: routeForm.name,
                        origin: routeForm.origin,
                        destination: routeForm.destination,
                        distance: parseInt(routeForm.distance),
                        duration: parseInt(routeForm.duration),
                        price: parseFloat(routeForm.price),
                        status: routeForm.status,
                      });
                      alert('Route created successfully!');
                    }
                    setSelectedModal(null);
                    setSelectedItem(null);
                    await refetchRoutes();
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="btn-primary flex-1"
              >
                {selectedItem ? 'Update Route' : 'Create Route'}
              </button>
              <button
                onClick={() => {
                  setSelectedModal(null);
                  setSelectedItem(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Terminal Management Modal */}
      {selectedModal === 'terminal' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedModal(null);
            setSelectedItem(null);
          }}
          title={selectedItem ? 'Edit Terminal' : 'Add New Terminal'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terminal Name *</label>
              <input
                type="text"
                value={terminalForm.name}
                onChange={(e) => setTerminalForm({ ...terminalForm, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Lilongwe Main Terminal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                value={terminalForm.location}
                onChange={(e) => setTerminalForm({ ...terminalForm, location: e.target.value })}
                className="input-field"
                placeholder="e.g., Lilongwe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                value={terminalForm.address}
                onChange={(e) => setTerminalForm({ ...terminalForm, address: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Full address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select
                value={terminalForm.status}
                onChange={(e) => setTerminalForm({ ...terminalForm, status: e.target.value as any })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={async () => {
                  try {
                    if (!terminalForm.name || !terminalForm.location || !terminalForm.address) {
                      alert('Please fill all required fields');
                      return;
                    }
                    if (selectedItem) {
                      await updateTerminal(selectedItem.id, {
                        name: terminalForm.name,
                        location: terminalForm.location,
                        address: terminalForm.address,
                        status: terminalForm.status,
                      });
                      alert('Terminal updated successfully!');
                    } else {
                      await createTerminal({
                        name: terminalForm.name,
                        location: terminalForm.location,
                        address: terminalForm.address,
                        status: terminalForm.status,
                      });
                      alert('Terminal created successfully!');
                    }
                    setSelectedModal(null);
                    setSelectedItem(null);
                    await refetchTerminals();
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }
                }}
                className="btn-primary flex-1"
              >
                {selectedItem ? 'Update Terminal' : 'Create Terminal'}
              </button>
              <button
                onClick={() => {
                  setSelectedModal(null);
                  setSelectedItem(null);
                }}
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

export default AdminDashboard;

