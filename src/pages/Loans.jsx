import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Wallet,
  Banknote
} from "lucide-react";

const CashOut = () => {
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [processing, setProcessing] = useState({});

  // 🟢 Listen to USERS collection in real-time
  useEffect(() => {
    const userQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(userQuery, 
      (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
      },
      (err) => {
        console.error("Error loading users:", err);
        setError("Failed to load users: " + err.message);
      }
    );
    return () => unsubUsers();
  }, []);

  // 🟣 Listen to LOANS collection and merge with USERS
  useEffect(() => {
    const loanQuery = query(collection(db, "loans"), orderBy("timestamp", "desc"));
    const unsubLoans = onSnapshot(
      loanQuery,
      (snapshot) => {
        try {
          const loanData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Merge each loan with corresponding user's name
          const mergedData = loanData.map(loan => {
           const user = users.find((u) => u.uid === loan.userId);
            return {
              ...loan,
              userName: user ? user.fullName || "Unnamed User" : "Unknown User",
            };
          });

          setLoans(mergedData);
          setLoading(false);
        } catch (err) {
          console.error("Error merging loan data:", err);
          setError("Error processing loan data: " + err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load loans: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubLoans();
  }, [users]);

  // 🔵 Utility functions
  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "Pending":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateLoanStatus = async (loanId, newStatus) => {
    try {
      const loanRef = doc(db, "loans", loanId);
      await updateDoc(loanRef, { status: newStatus });
      console.log(`Loan ${loanId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating loan status:", err);
      setError("Failed to update loan status: " + err.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    return timestamp.toString();
  };

  // 🧮 Calculations
  const totalLoans = loans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const pendingLoans = loans.filter(l => l.status === 'pending').length;
  const paidLoans = loans.filter(l => l.status === 'accepted').length;
  const declinedLoans = loans.filter(l => l.status === 'denied').length;
  const totalPaidAmount = loans.filter(l => l.status === 'accepted').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const totalDeclinedAmount = loans.filter(l => l.status === 'denied').reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  // 🔍 Filters
  const filteredLoans = loans.filter(l => {
    const matchesSearch = 
      (l.userName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.userId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.message?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 🕓 Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading loans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total loans</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalLoans.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending loans</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{pendingLoans}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid loans</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{paidLoans}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Declined loans</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{declinedLoans}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Accepted Amount</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalPaidAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Declined Amount</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalDeclinedAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-lg font-medium text-gray-900">Loans Records</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, user ID or message..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-gray-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="accepted">Paid</option>
                <option value="denied">Declined</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{loan.userName}</div>
                      <div className="text-xs text-gray-500 italic">ID: {loan.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${loan.amount ? parseFloat(loan.amount).toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(loan.status)}`}>
                        {loan.status === "accepted" ? "Paid" : loan.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(loan.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {loan.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              disabled={!!processing[loan.id]}
                              onClick={async () => {
                                const ok = window.confirm('Mark this loan as Paid?');
                                if (!ok) return;
                                setProcessing(prev => ({ ...prev, [loan.id]: true }));
                                try {
                                  await updateLoanStatus(loan.id, "accepted");
                                } finally {
                                  setProcessing(prev => {
                                    const copy = { ...prev };
                                    delete copy[loan.id];
                                    return copy;
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                            >
                              {processing[loan.id] ? 'Processing...' : 'Pay'}
                            </button>

                            <button
                              disabled={!!processing[loan.id]}
                              onClick={async () => {
                                const ok = window.confirm('Mark this loan as Declined?');
                                if (!ok) return;
                                setProcessing(prev => ({ ...prev, [loan.id]: true }));
                                try {
                                  await updateLoanStatus(loan.id, "denied");
                                } finally {
                                  setProcessing(prev => {
                                    const copy = { ...prev };
                                    delete copy[loan.id];
                                    return copy;
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                            >
                              {processing[loan.id] ? 'Processing...' : 'Decline'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">{loan.status === 'accepted' ? 'Paid' : loan.status}</span>
                        )}

                        {loan.imageUrl && (
                          <button
                            onClick={() => window.open(loan.imageUrl, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="View proof"
                          >
                            <Wallet className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No loans found.
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

export default CashOut;
