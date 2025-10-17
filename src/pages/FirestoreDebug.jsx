import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, limit, orderBy, startAfter } from "firebase/firestore";
import Layout from "../components/Layout";

const FirestoreDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    collections: [],
    depositsData: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const debugFirestore = async () => {
      try {
        console.log("FirestoreDebug: Starting debug process...");
        
        // Try to get data from different possible collection names
        const possibleCollections = [
          "deposits", "Deposits", "deposit", "Deposit",
          "transactions", "Transactions", "transaction", "Transaction",
          "payments", "Payments", "payment", "Payment"
        ];
        const collectionData = {};
        
        for (const collectionName of possibleCollections) {
          try {
            console.log(`FirestoreDebug: Checking collection '${collectionName}'...`);
            // Try with different possible order fields
            const possibleOrderFields = ["createdAt", "created_at", "timestamp", "date"];
            
            let querySnapshot;
            let success = false;
            
            for (const orderField of possibleOrderFields) {
              try {
                const q = query(
                  collection(db, collectionName), 
                  orderBy(orderField, "desc"),
                  limit(3)
                );
                querySnapshot = await getDocs(q);
                console.log(`FirestoreDebug: Found ${querySnapshot.docs.length} documents in '${collectionName}' ordered by '${orderField}'`);
                success = true;
                break;
              } catch (orderErr) {
                console.log(`FirestoreDebug: Could not order by '${orderField}' in '${collectionName}':`, orderErr.message);
              }
            }
            
            // If ordering failed, try without ordering
            if (!success) {
              try {
                const q = query(collection(db, collectionName), limit(3));
                querySnapshot = await getDocs(q);
                console.log(`FirestoreDebug: Found ${querySnapshot.docs.length} documents in '${collectionName}' (no ordering)`);
              } catch (noOrderErr) {
                throw noOrderErr;
              }
            }
            
            collectionData[collectionName] = {
              count: querySnapshot.docs.length,
              documents: querySnapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
              }))
            };
          } catch (err) {
            console.log(`FirestoreDebug: Error accessing '${collectionName}':`, err.message);
            collectionData[collectionName] = {
              error: err.message
            };
          }
        }
        
        setDebugInfo({
          collections: collectionData,
          error: null,
          loading: false
        });
      } catch (err) {
        console.error("FirestoreDebug: General error:", err);
        setDebugInfo({
          collections: [],
          error: err.message,
          loading: false
        });
      }
    };

    debugFirestore();
  }, []);

  if (debugInfo.loading) {
    return (
      <Layout>
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Firestore Debug
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <p>Debugging Firestore collections...</p>
                  <div className="mt-4">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
  }

  if (debugInfo.error) {
    return (
      <Layout>
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Firestore Debug
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <p className="text-red-500">Error: {debugInfo.error}</p>
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

  // Find the collection with the most documents
  let bestCollection = null;
  let maxCount = 0;
  
  Object.entries(debugInfo.collections).forEach(([collectionName, data]) => {
    if (!data.error && data.count > maxCount) {
      maxCount = data.count;
      bestCollection = collectionName;
    }
  });

  return (
    <Layout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Firestore Debug Information
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Analysis Results
                  </h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    {bestCollection ? (
                      <div>
                        <p className="text-green-600 font-medium">
                          Found data in collection: "{bestCollection}" ({maxCount} documents)
                        </p>
                        <p className="mt-2">
                          You should update your DepositsPage to use this collection name.
                        </p>
                        <button 
                          onClick={() => {
                            // Copy the suggested code to clipboard
                            const code = `const q = query(collection(db, "${bestCollection}"), orderBy("createdAt", "desc"));`;
                            navigator.clipboard.writeText(code);
                            alert("Suggested code copied to clipboard!");
                          }}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Copy Suggested Code
                        </button>
                      </div>
                    ) : (
                      <p className="text-yellow-600">
                        No collections with data found. Check your Firestore database or security rules.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Collection Analysis
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Information about collections in your Firestore database
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    {Object.entries(debugInfo.collections).map(([collectionName, data]) => (
                      <div key={collectionName} className="mb-6 p-4 border border-gray-200 rounded">
                        <h4 className="text-md font-medium text-gray-900">
                          Collection: "{collectionName}"
                        </h4>
                        {data.error ? (
                          <p className="text-red-500 mt-1">Error: {data.error}</p>
                        ) : (
                          <div className="mt-2">
                            <p>Document count: {data.count}</p>
                            {data.count > 0 && (
                              <div className="mt-2">
                                <h5 className="text-sm font-medium text-gray-700">Sample documents:</h5>
                                <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-x-auto max-h-40 overflow-y-auto">
                                  {JSON.stringify(data.documents, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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

export default FirestoreDebug;