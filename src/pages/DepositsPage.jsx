// src/pages/DepositsPage.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Layout from "../components/Layout";

const DepositsPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("DepositsPage: Starting data fetch...");
    
    // Real-time listener for deposits, ordered by timestamp descending
    // Changed from "createdAt" to "timestamp" based on debug data
    const q = query(collection(db, "deposits"), orderBy("timestamp", "desc"));
    
    const unsub = onSnapshot(q, 
      (snapshot) => {
        try {
          console.log("DepositsPage: Snapshot received");
          console.log("DepositsPage: Number of docs in snapshot:", snapshot.docs.length);
          
          if (snapshot.docs.length === 0) {
            console.log("DepositsPage: No documents found in 'deposits' collection");
          }
          
          const data = snapshot.docs.map((doc) => {
            const docData = doc.data();
            console.log("DepositsPage: Document ID:", doc.id, "Data:", docData);
            return {
              id: doc.id,
              ...docData,
            };
          });
          
          console.log("DepositsPage: Processed data:", data);
          setDeposits(data);
          setLoading(false);
          console.log("DepositsPage: Data fetch completed");
        } catch (err) {
          console.error("DepositsPage: Error processing snapshot:", err);
          setError("Error processing deposit data: " + err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error("DepositsPage: Firebase error:", err);
        console.error("DepositsPage: Firebase error code:", err.code);
        console.error("DepositsPage: Firebase error message:", err.message);
        
        if (err.code === 'permission-denied') {
          setError("Permission denied. Check Firestore security rules.");
        } else if (err.code === 'not-found') {
          setError("Collection 'deposits' not found.");
        } else {
          setError("Failed to load deposits: " + err.message);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log("DepositsPage: Unsubscribing from listener");
      unsub();
    };
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Denied":
        return "bg-red-100 text-red-800";
      case "Pending":
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

  if (loading) {
    return (
      <Layout>
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Deposit Management
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                  <p>Loading deposits...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Deposit Management
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <p className="text-red-500">Error: {error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  console.log("DepositsPage: Rendering with deposits array length:", deposits.length);

  return (
    <Layout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Deposit Management
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Deposits
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Total deposits: {deposits.length}
                  </p>

                  <div className="mt-4 flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Image
                                </th>
                              </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                              {deposits.length > 0 ? (
                                deposits.map((deposit) => (
                                  <tr key={deposit.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{deposit.userId || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        ${deposit.amount ? parseFloat(deposit.amount).toFixed(2) : '0.00'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{deposit.message || 'No message'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {formatTimestamp(deposit.timestamp)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {deposit.imageUrl && (
                                        <img
                                          src={deposit.imageUrl}
                                          alt="Deposit Proof"
                                          className="w-16 h-16 object-cover rounded"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                    </td>
               
                                    
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="7" className="text-center py-6 text-gray-500">
                                    No deposits yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DepositsPage;