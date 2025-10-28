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
  const [loans, setloans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    console.log("CashOut: Starting data fetch...");
    
    // Real-time listener for loans, ordered by timestamp descending
    const q = query(collection(db, "loans"), orderBy("timestamp", "desc"));
    
    const unsub = onSnapshot(q, 
      (snapshot) => {
        try {
          console.log("CashOut: Snapshot received");
          console.log("CashOut: Number of docs in snapshot:", snapshot.docs.length);
          
          if (snapshot.docs.length === 0) {
            console.log("CashOut: No documents found in 'loans' collection");
          }
          
          const data = snapshot.docs.map((doc) => {
            const docData = doc.data();
            console.log("CashOut: Document ID:", doc.id, "Data:", docData);
            return {
              id: doc.id,
              ...docData,
            };
          });
          
          console.log("CashOut: Processed data:", data);
          setloans(data);
          setLoading(false);
          console.log("CashOut: Data fetch completed");
        } catch (err) {
          console.error("CashOut: Error processing snapshot:", err);
          setError("Error processing cashout data: " + err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error("CashOut: Firebase error:", err);
        console.error("CashOut: Firebase error code:", err.code);
        console.error("CashOut: Firebase error message:", err.message);
        
        if (err.code === 'permission-denied') {
          setError("Permission denied. Check Firestore security rules.");
        } else if (err.code === 'not-found') {
          setError("Collection 'loans' not found.");
        } else {
          setError("Failed to load loans: " + err.message);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log("CashOut: Unsubscribing from listener");
      unsub();
    };
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to update cashout status
  const updateloanstatus = async (cashoutId, newStatus) => {
    try {
      const cashoutRef = doc(db, "loans", cashoutId);
      await updateDoc(cashoutRef, {
        status: newStatus
      });
      console.log(`Cashout ${cashoutId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating cashout status:", err);
      setError("Failed to update cashout status: " + err.message);
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore timestamp object
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Handle JavaScript Date object
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    return timestamp.toString();
  };

  // Calculate stats
  const totalloans = loans.reduce((sum, cashout) => sum + (parseFloat(cashout.amount) || 0), 0);
  const pendingloans = loans.filter(cashout => cashout.status === 'pending').length;
  const paidloans = loans.filter(cashout => cashout.status === 'accepted').length;
  const declinedloans = loans.filter(cashout => cashout.status === 'denied').length;
  
  // New calculated values
  const totalPaidAmount = loans
    .filter(cashout => cashout.status === 'accepted')
    .reduce((sum, cashout) => sum + (parseFloat(cashout.amount) || 0), 0);
  
  const totalDeclinedAmount = loans
    .filter(cashout => cashout.status === 'denied')
    .reduce((sum, cashout) => sum + (parseFloat(cashout.amount) || 0), 0);

  // Filter loans based on search term and status filter
  const filteredloans = loans.filter(cashout => {
    const matchesSearch = cashout.userId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cashout.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cashout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  console.log("CashOut: Rendering with loans array length:", loans.length);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total loans</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalloans.toFixed(2)}</p>
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
              <p className="mt-2 text-3xl font-bold text-gray-900">{pendingloans}</p>
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
              <p className="mt-2 text-3xl font-bold text-gray-900">{paidloans}</p>
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
              <p className="mt-2 text-3xl font-bold text-gray-900">{declinedloans}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        {/* New card for Total Paid Amount */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Paid Amount</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalPaidAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        {/* New card for Total Declined Amount */}
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

      {/* Filters and search */}
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
                placeholder="Search loans..."
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

      {/* loans table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredloans.length > 0 ? (
                filteredloans.map((cashout) => (
                  <tr key={cashout.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cashout.userId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${cashout.amount ? parseFloat(cashout.amount).toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          cashout.status || "pending"
                        )}`}
                      >
                        {cashout.status === "accepted" ? "Paid" : cashout.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(cashout.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {cashout.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              disabled={!!processing[cashout.id]}
                              onClick={async () => {
                                const ok = window.confirm('Mark this cashout as Paid?');
                                if (!ok) return;
                                setProcessing(prev => ({ ...prev, [cashout.id]: true }));
                                try {
                                  await updateloanstatus(cashout.id, "accepted");
                                  console.log('Cashout paid:', cashout.id);
                                } finally {
                                  setProcessing(prev => {
                                    const copy = { ...prev };
                                    delete copy[cashout.id];
                                    return copy;
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                            >
                              {processing[cashout.id] ? 'Processing...' : 'Pay'}
                            </button>

                            <button
                              disabled={!!processing[cashout.id]}
                              onClick={async () => {
                                const ok = window.confirm('Mark this cashout as Declined?');
                                if (!ok) return;
                                setProcessing(prev => ({ ...prev, [cashout.id]: true }));
                                try {
                                  await updateloanstatus(cashout.id, "denied");
                                  console.log('Cashout declined:', cashout.id);
                                } finally {
                                  setProcessing(prev => {
                                    const copy = { ...prev };
                                    delete copy[cashout.id];
                                    return copy;
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                            >
                              {processing[cashout.id] ? 'Processing...' : 'Decline'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">{cashout.status === 'accepted' ? 'Paid' : cashout.status || 'No actions'}</span>
                        )}

                        {/* If the cashout has an image/proof url show a view button */}
                        {cashout.imageUrl ? (
                          <button
                            onClick={() => window.open(cashout.imageUrl, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="View proof in new tab"
                          >
                            <Wallet className="h-4 w-4" />
                          </button>
                        ) : null}
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