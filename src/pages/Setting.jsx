import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc, setDoc, query, orderBy, limit } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminInterestSettings = () => {
  const [interest, setInterest] = useState("10.00"); // Default to 10% instead of 0.10
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [historyData, setHistoryData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [interestDocId, setInterestDocId] = useState(null);

  useEffect(() => {
    const fetchInterest = async () => {
      try {
        const q = query(collection(db, "interest"), orderBy("timestamp", "desc"), limit(10));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const docData = snap.docs[0];
          // Convert decimal to percentage for display
          setInterest((docData.data().interest).toFixed(2));
          setInterestDocId(docData.id);
          
          // Prepare history data for chart (already converting to percentage)
          const history = snap.docs.map(doc => ({
            date: new Date(doc.data().timestamp?.toDate() || Date.now()).toLocaleDateString(),
            rate: parseFloat(doc.data().interest) 
          })).reverse();
          setHistoryData(history);
        } else {
          setInterest("10.00"); // Default to 10% instead of 0.10
        }
      } catch (error) {
        console.error("Error fetching interest:", error);
        setMessage("Failed to load interest rate");
        setMessageType("error");
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchInterest();
  }, []);

  const handleSave = async () => {
    // Validate input for percentage range (1-100)
    if (isNaN(interest) || interest < 1 || interest > 100) {
      setMessage("Please enter a valid interest rate between 1% and 100%");
      setMessageType("error");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);
    try {
      const timestamp = new Date();
      if (interestDocId) {
        // Update existing document
        const interestDoc = doc(db, "interest", interestDocId);
        // Convert percentage to decimal for storage
        await updateDoc(interestDoc, { 
          interest: Number(interest) ,
          timestamp: timestamp
        });
      } else {
        // Create new document
        await setDoc(doc(db, "interest", "globalRate"), { 
          interest: Number(interest) ,
          timestamp: timestamp
        });
        setInterestDocId("globalRate");
      }
      
      setMessage("Interest rate updated successfully!");
      setMessageType("success");
      
      // Update history data with percentage value
      setHistoryData(prev => [
        ...prev.slice(-9), // Keep only last 10 records
        { 
          date: timestamp.toLocaleDateString(), 
          rate: Number(interest) 
        }
      ]);
    } catch (error) {
      console.error("Error updating interest:", error);
      setMessage("Failed to update interest rate");
      setMessageType("error");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading interest rate...</p>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-10 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Interest Rate Settings
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Current Interest Rate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="1"
              max="100"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none pr-12"
              disabled={saving}
              placeholder="Enter interest rate (1–100)"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              %
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter as a percentage (e.g., 5 for 5%)</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 w-full disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          >
            {showHistory ? "Hide" : "Show"} Rate History
          </button>
        </div>
        
        {showHistory && historyData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Interest Rate History
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                  <Tooltip 
                    formatter={(value) => `${value.toFixed(2)}%`}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      {message && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ${
            messageType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminInterestSettings;