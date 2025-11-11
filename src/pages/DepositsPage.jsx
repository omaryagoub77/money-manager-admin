import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye,
  Download
} from "lucide-react";

const DepositsPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  // 🟣 Listen to DEPOSITS collection and merge with USERS
  useEffect(() => {
    const depositQuery = query(collection(db, "deposits"), orderBy("timestamp", "desc"));
    const unsubDeposits = onSnapshot(
      depositQuery,
      (snapshot) => {
        try {
          const depositData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Merge each deposit with corresponding user's name
          const mergedData = depositData.map(deposit => {
            const user = users.find((u) => u.uid === deposit.userId);
            return {
              ...deposit,
              userName: user ? user.fullName || "Unnamed User" : "Unknown User",
            };
          });

          setDeposits(mergedData);
          setLoading(false);
        } catch (err) {
          console.error("Error merging deposit data:", err);
          setError("Error processing deposit data: " + err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load deposits: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubDeposits();
  }, [users]);

  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to update deposit status
  const updateDepositStatus = async (depositId, newStatus) => {
    try {
      const depositRef = doc(db, "deposits", depositId);
      await updateDoc(depositRef, {
        status: newStatus
      });
      console.log(`Deposit ${depositId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating deposit status:", err);
      setError("Failed to update deposit status: " + err.message);
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
  const totalDeposits = deposits.reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
  const pendingDeposits = deposits.filter(deposit => deposit.status === 'pending').length;
  const acceptedDeposits = deposits.filter(deposit => deposit.status === 'accepted').length;
  const deniedDeposits = deposits.filter(deposit => deposit.status === 'denied').length;
  
  // New calculated values for Total Accepted Amount and Total Declined Amount
  const totalAcceptedAmount = deposits
    .filter(deposit => deposit.status === 'accepted')
    .reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
  
  const totalDeclinedAmount = deposits
    .filter(deposit => deposit.status === 'denied')
    .reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);

  // Filter deposits based on search term and status filter
  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = 
      (deposit.userName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deposit.userId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deposit.message?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || deposit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open image modal
  const openImageModal = (deposit) => {
    setSelectedDeposit(deposit);
    setShowModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowModal(false);
    setSelectedDeposit(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deposits...</p>
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

  console.log("DepositsPage: Rendering with deposits array length:", deposits.length);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Deposits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalDeposits.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Deposits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{pendingDeposits}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved Deposits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{acceptedDeposits}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Denied Deposits</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{deniedDeposits}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        {/* New card for Total Accepted Amount */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Accepted Amount</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalAcceptedAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
          <h2 className="text-lg font-medium text-gray-900">Deposit Records</h2>
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
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="denied">Denied</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposits table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-scroll">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proof
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
              {filteredDeposits.length > 0 ? (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deposit.userName}</div>
                      <div className="text-xs text-gray-500 italic">ID: {deposit.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${deposit.amount ? parseFloat(deposit.amount).toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          deposit.status || "pending"
                        )}`}
                      >
                        {deposit.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {deposit.imageUrl ? (
                        <button 
                          onClick={() => openImageModal(deposit)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400">No proof</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(deposit.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {/* Actions area */}
                        {deposit.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              disabled={!!processing[deposit.id]}
                              onClick={async () => {
                                const ok = window.confirm('Mark this deposit as Accepted?');
                                if (!ok) return;
                                setProcessing(prev => ({ ...prev, [deposit.id]: true }));
                                try {
                                  await updateDepositStatus(deposit.id, "accepted");
                                  console.log('Deposit accepted:', deposit.id);
                                } finally {
                                  setProcessing(prev => {
                                    const copy = { ...prev };
                                    delete copy[deposit.id];
                                    return copy;
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                            >
                              {processing[deposit.id] ? 'Processing...' : 'Approve'}
                            </button>

                            <button
                              disabled={!!processing[deposit.id]}
                              onClick={async () => {
                                const ok = window.confirm('Mark this deposit as Denied?');
                                if (!ok) return;
                                setProcessing(prev => ({ ...prev, [deposit.id]: true }));
                                try {
                                  await updateDepositStatus(deposit.id, "denied");
                                  console.log('Deposit denied:', deposit.id);
                                } finally {
                                  setProcessing(prev => {
                                    const copy = { ...prev };
                                    delete copy[deposit.id];
                                    return copy;
                                  });
                                }
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                            >
                              {processing[deposit.id] ? 'Processing...' : 'Deny'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">{deposit.status || 'No actions'}</span>
                        )}

                        {/* View proof/download button (always visible if image exists) */}
                        {deposit.imageUrl ? (
                          <button
                            onClick={() => window.open(deposit.imageUrl, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            title="View proof in new tab"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No deposits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white  rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-scroll">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Deposit Proof</h3>
              <button 
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">User Name</h4>
                  <p className="text-sm text-gray-900">{selectedDeposit.userName || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">User ID</h4>
                  <p className="text-sm text-gray-900">{selectedDeposit.userId || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Amount</h4>
                  <p className="text-sm text-gray-900">${selectedDeposit.amount ? parseFloat(selectedDeposit.amount).toFixed(2) : '0.00'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      selectedDeposit.status || "pending"
                    )}`}
                  >
                    {selectedDeposit.status || "pending"}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedDeposit.timestamp)}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Message</h4>
                  <p className="text-sm text-gray-900">{selectedDeposit.message || 'No message'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Proof Image</h4>
                <div className="border border-gray-200 rounded-lg ">
                  {selectedDeposit.imageUrl ? (
                    <img 
                      src={selectedDeposit.imageUrl} 
                      alt="Deposit Proof" 
                      className="w-full h-auto max-h-[60vh] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-500">
                      No image available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeImageModal}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedDeposit.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateDepositStatus(selectedDeposit.id, "accepted");
                        closeImageModal();
                      }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateDepositStatus(selectedDeposit.id, "denied");
                        closeImageModal();
                      }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700"
                    >
                      Deny
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositsPage;