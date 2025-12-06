import { useState, useEffect } from 'react';
import {
  getBuses,
  getDrivers,
  getRoutes,
  getTerminals,
  getTrips,
  getTickets,
  getLuggage,
  getStaff,
  getActivityLogs,
  getNotifications,
  getPromoCodes,
} from '../services/supabaseService';
import type {
  Bus,
  Driver,
  Route,
  Terminal,
  Trip,
  Ticket,
  Luggage,
  Staff,
  ActivityLog,
  Notification,
  PromoCode,
} from '../types';

export const useBuses = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const data = await getBuses();
        setBuses(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch buses');
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getBuses();
      setBuses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buses');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  return { buses, loading, error, refetch };
};

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const data = await getDrivers();
        setDrivers(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch drivers');
        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drivers');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  return { drivers, loading, error, refetch };
};

export const useRoutes = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const data = await getRoutes();
        setRoutes(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch routes');
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getRoutes();
      setRoutes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  return { routes, loading, error, refetch };
};

export const useTerminals = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        setLoading(true);
        const data = await getTerminals();
        setTerminals(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch terminals');
        setTerminals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTerminals();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getTerminals();
      setTerminals(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch terminals');
      setTerminals([]);
    } finally {
      setLoading(false);
    }
  };

  return { terminals, loading, error, refetch };
};

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await getTrips();
        setTrips(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trips');
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      setTrips(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  return { trips, loading, error, refetch };
};

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await getTickets();
        setTickets(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tickets');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return { tickets, loading, error, refetch };
};

export const useLuggage = () => {
  const [luggage, setLuggage] = useState<Luggage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLuggage = async () => {
      try {
        setLoading(true);
        const data = await getLuggage();
        setLuggage(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch luggage');
        setLuggage([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLuggage();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getLuggage();
      setLuggage(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch luggage');
      setLuggage([]);
    } finally {
      setLoading(false);
    }
  };

  return { luggage, loading, error, refetch };
};

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await getStaff();
        setStaff(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch staff');
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getStaff();
      setStaff(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  return { staff, loading, error, refetch };
};

export const useActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getActivityLogs();
        setActivityLogs(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch activity logs');
        setActivityLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs();
      setActivityLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activity logs');
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return { activityLogs, loading, error, refetch };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return { notifications, loading, error, refetch };
};

export const usePromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromoCodes = async () => {
      try {
        setLoading(true);
        const data = await getPromoCodes();
        setPromoCodes(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch promo codes');
        setPromoCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoCodes();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getPromoCodes();
      setPromoCodes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promo codes');
      setPromoCodes([]);
    } finally {
      setLoading(false);
    }
  };

  return { promoCodes, loading, error, refetch };
};

