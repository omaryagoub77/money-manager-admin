import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const MyCashOuts = () => {
  const [cashouts, setCashouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log("MyCashOuts: Starting data fetch for user:", currentUser.uid);
    
    // Real-time listener for cashouts for the current user
    const q = query(
      collection(db, "cashouts"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );
    
    const unsub = onSnapshot(q, 
      (snapshot) => {
        try {
          console.log("MyCashOuts: Snapshot received");
          console.log("MyCashOuts: Number of docs in snapshot:", snapshot.docs.length);
          
          const data = snapshot.docs.map((doc) => {
            const docData = doc.data();
            console.log("MyCashOuts: Document ID:", doc.id, "Data:", docData);
            return {
              id: doc.id,
              ...docData,
            };
          });
          
          console.log("MyCashOuts: Processed data:", data);
          setCashouts(data);
          setLoading(false);
          console.log("MyCashOuts: Data fetch completed");
        } catch (err) {
          console.error("MyCashOuts: Error processing snapshot:", err);
          setError("Error processing cashout data: " + err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error("MyCashOuts: Firebase error:", err);
        console.error("MyCashOuts: Firebase error code:", err.code);
        console.error("MyCashOuts: Firebase error message:", err.message);
        
        if (err.code === 'permission-denied') {
          setError("Permission denied. Check Firestore security rules.");
        } else {
          setError("Failed to load cashouts: " + err.message);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log("MyCashOuts: Unsubscribing from listener");
      unsub();
    };
  }, [currentUser]);

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
                My Cash Outs
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                  <p>Loading your cash outs...</p>
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
                My Cash Outs
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

  if (!currentUser) {
    return (
      <Layout>
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                My Cash Outs
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                  <p>Please log in to view your cash outs.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  console.log("MyCashOuts: Rendering with cashouts array length:", cashouts.length);

  return (
    <Layout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              My Cash Outs
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your Cash Out History
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Total cash outs: {cashouts.length}
                  </p>

                  <div className="mt-4 flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                              {cashouts.length > 0 ? (
                                cashouts.map((cashout) => (
                                  <tr key={cashout.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        ${cashout.amount ? parseFloat(cashout.amount).toFixed(2) : '0.00'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{cashout.message || 'No message'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {formatTimestamp(cashout.timestamp)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {cashout.imageUrl && (
                                        <img
                                          src={cashout.imageUrl}
                                          alt="Cash Out Proof"
                                          className="w-16 h-16 object-cover rounded"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                          cashout.status || "Pending"
                                        )}`}
                                      >
                                        {cashout.status || "Pending"}
                                      </span>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {cashout.status === "Pending" && "Waiting for admin approval"}
                                        {cashout.status === "Accepted" && "Approved"}
                                        {cashout.status === "Denied" && "Rejected"}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" className="text-center py-6 text-gray-500">
                                    You haven't made any cash out requests yet.
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

export default MyCashOuts;