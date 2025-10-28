import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalCashouts, setTotalCashouts] = useState(0);
  const [pendingCashouts, setPendingCashouts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [depositsError, setDepositsError] = useState(false);
  const [cashoutsError, setCashoutsError] = useState(false);
  const [usersError, setUsersError] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to format tooltip time
  const formatTooltipTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    });
  };

  // Function to fetch users 
  useEffect(() => {
    if (!db) {
      setUsersError('Firestore instance not available');
      setLoading(false);
      return;
    }
  
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setUsers(data);
          setTotalUsers(data.length);
          setLoading(false);
          setUsersError(false);
        } catch (err) {
          console.error('Error processing users snapshot:', err);
          setUsersError('Failed to process users data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching users:', err);
        if (err.code === 'permission-denied') {
          setUsersError('Permission denied. Check Firestore rules.');
        } else {
          setUsersError('Failed to load users: ' + (err.message || 'Unknown error'));
        }
        setLoading(false);
      }
    );
  
    return () => unsub();
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium text-gray-900">{formatTooltipTime(data.timestamp)}</p>
          <p className="text-indigo-600">Deposits: ${data.deposits.toFixed(2)}</p>
          <p className="text-red-600">Cashouts: ${data.cashouts.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // Function to generate live scrolling data
  const generateLiveScrollingData = (deposits, cashouts, maxPoints = 20) => {
    const combined = [];

    deposits.forEach((d) => {
      const timestamp = d.timestamp?.toDate?.() || new Date(d.timestamp);
      combined.push({
        timestamp,
        name: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deposits: Number(d.amount) || 0,
        cashouts: 0,
      });
    });

    cashouts.forEach((c) => {
      const timestamp = c.timestamp?.toDate?.() || new Date(c.timestamp);
      combined.push({
        timestamp,
        name: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        deposits: 0,
        cashouts: Number(c.amount) || 0,
      });
    });

    // Sort by timestamp
    combined.sort((a, b) => a.timestamp - b.timestamp);

    // Keep only the last 'maxPoints'
    return combined.slice(-maxPoints);
  };

  useEffect(() => {
    if (!db) {
      console.error('Firestore database instance not available');
      setDepositsError(true);
      setCashoutsError(true);
      return;
    }

    // Store raw data for live chart
    let depositsData = [];
    let cashoutsData = [];

    // Set up real-time listener for deposits
    const depositsQuery = query(collection(db, 'deposits'), orderBy('timestamp', 'desc'));
    const unsubscribeDeposits = onSnapshot(
      depositsQuery,
      (snapshot) => {
        try {
          let sum = 0;
          depositsData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.amount) {
              sum += parseFloat(data.amount);
            }
            depositsData.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp
            });
          });
          setTotalDeposits(sum);
          setDepositsError(false);
          
          // Update chart data with live scrolling
          const liveData = generateLiveScrollingData(depositsData, cashoutsData);
          setChartData(liveData);
          
          // Update recent activity
          setRecentActivity(prev => {
            const newActivity = depositsData.slice(0, 3).map(deposit => ({
              id: deposit.id,
              type: 'deposit',
              userId: deposit.userId,
              amount: deposit.amount,
              timestamp: deposit.timestamp?.toDate?.() || new Date()
            }));
            return [...newActivity, ...prev].slice(0, 6);
          });
        } catch (error) {
          console.error('Error processing deposits data:', error);
          setDepositsError(true);
        }
      },
      (error) => {
        console.error('Error fetching deposits:', error);
        setDepositsError(true);
      }
    );

    // Set up real-time listener for cashouts
    const cashoutsQuery = query(collection(db, 'cashouts'), orderBy('timestamp', 'desc'));
    const unsubscribeCashouts = onSnapshot(
      cashoutsQuery,
      (snapshot) => {
        try {
          let sum = 0;
          let pendingCount = 0;
          cashoutsData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.amount) {
              sum += parseFloat(data.amount);
            }
            if (data.status === 'Pending') {
              pendingCount += 1;
            }
            cashoutsData.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp
            });
          });
          setTotalCashouts(sum);
          setPendingCashouts(pendingCount);
          setCashoutsError(false);
          
          // Update chart data with live scrolling
          const liveData = generateLiveScrollingData(depositsData, cashoutsData);
          setChartData(liveData);
          
          // Update recent activity
          setRecentActivity(prev => {
            const newActivity = cashoutsData.slice(0, 3).map(cashout => ({
              id: cashout.id,
              type: 'cashout',
              userId: cashout.userId,
              amount: cashout.amount,
              status: cashout.status,
              timestamp: cashout.timestamp?.toDate?.() || new Date()
            }));
            return [...newActivity, ...prev].slice(0, 6);
          });
        } catch (error) {
          console.error('Error processing cashouts data:', error);
          setCashoutsError(true);
        }
      },
      (error) => {
        console.error('Error fetching cashouts:', error);
        setCashoutsError(true);
      }
    );

    // Clean up listeners on component unmount
    return () => {
      unsubscribeDeposits();
      unsubscribeCashouts();
    };
  }, []);

  // Format currency values
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Stats cards
  const stats = [
    {
      id: 1,
      name: 'Total Deposits',
      value: depositsError ? 'N/A' : formatCurrency(totalDeposits),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      iconColor: 'bg-indigo-500',
    },
    {
      id: 2,
      name: 'Total Cashouts',
      value: cashoutsError ? 'N/A' : formatCurrency(totalCashouts),
      change: '+8.2%',
      changeType: 'positive',
      icon: CreditCard,
      iconColor: 'bg-red-500',
    },
    {
      id: 3,
      name: 'Pending Cashouts',
      value: cashoutsError ? 'N/A' : pendingCashouts,
      change: '+3.1%',
      changeType: 'negative',
      icon: Activity,
      iconColor: 'bg-yellow-500',
    },
    {
      id: 4,
      name: 'Total Users',
      value: usersError ? 'N/A' : totalUsers,
      change: '+5.4%',
      changeType: 'positive',
      icon: Users,
      iconColor: 'bg-green-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconColor}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-1 text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Live Transactions</h3>
          <div className="h-80 overflow-x-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  minTickGap={15}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="deposits" 
                  fill="#4f46e5" 
                  name="Deposits"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
                <Bar 
                  dataKey="cashouts" 
                  fill="#ef4444" 
                  name="Cashouts"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Trend</h3>
          <div className="h-80 overflow-x-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  minTickGap={15}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="#4f46e5" 
                  activeDot={{ r: 8 }} 
                  name="Deposits"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
                <Line 
                  type="monotone" 
                  dataKey="cashouts" 
                  stroke="#ef4444" 
                  name="Cashouts"
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {activity.type === 'deposit' ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-indigo-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                        <span className="ml-3 text-sm font-medium text-gray-900 capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.userId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(activity.amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.type === 'deposit' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          activity.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.status || 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.timestamp)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;