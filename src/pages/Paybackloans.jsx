import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
// import Header from '../components/Header';
import { Check, X, Eye, Search } from 'lucide-react';
// import './CashoutPage.css';

const AdminPaybacksPage = () => {
  const { currentUser } = useAuth();
  const [pendingPaybacks, setPendingPaybacks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fadingCards, setFadingCards] = useState(new Set());

  // Fetch pending paybacks
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'loans'),
      where('paymentStatus', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const paybacks = [];
      
      for (const docSnapshot of snapshot.docs) {
        const paybackData = {
          id: docSnapshot.id,
          ...docSnapshot.data()
        };
        
        // Fetch user details if not already present
        if (!paybackData.userName && paybackData.userId) {
          try {
            const userDoc = await getDoc(doc(db, 'users', paybackData.userId));
            if (userDoc.exists()) {
              paybackData.userName = userDoc.data().name || 'Unknown User';
              paybackData.userEmail = userDoc.data().email || 'No email provided';
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            paybackData.userName = 'Unknown User';
            paybackData.userEmail = 'No email provided';
          }
        }
        
        paybacks.push(paybackData);
      }
      
      // Sort by payment timestamp (newest first)
      paybacks.sort((a, b) => {
        const aTime = a.paymentTimestamp?.toDate?.() || new Date(0);
        const bTime = b.paymentTimestamp?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      setPendingPaybacks(paybacks);
      setFetching(false);
    }, (err) => {
      console.error('Error fetching pending paybacks:', err);
      setFetching(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Show alert with auto-dismiss
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  // Handle approve action
  const handleApprove = async (paybackId) => {
    try {
      // Add to fading cards for animation
      setFadingCards(prev => new Set(prev).add(paybackId));
      
      // Wait for animation to start
      setTimeout(async () => {
        const paybackRef = doc(db, 'loans', paybackId);
        await updateDoc(paybackRef, {
          paymentStatus: 'approved',
          adminReviewedAt: serverTimestamp()
        });
        
        // Remove from fading cards after a delay
        setTimeout(() => {
          setFadingCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(paybackId);
            return newSet;
          });
        }, 300);
        
        showAlert('Payment approved successfully!', 'success');
      }, 100);
    } catch (err) {
      console.error('Error approving payment:', err);
      showAlert('Failed to approve payment. Please try again.', 'error');
    }
  };

  // Handle deny action
  const handleDeny = async (paybackId) => {
    try {
      // Add to fading cards for animation
      setFadingCards(prev => new Set(prev).add(paybackId));
      
      // Wait for animation to start
      setTimeout(async () => {
        const paybackRef = doc(db, 'loans', paybackId);
        await updateDoc(paybackRef, {
          paymentStatus: 'denied',
          adminReviewedAt: serverTimestamp()
        });
        
        // Remove from fading cards after a delay
        setTimeout(() => {
          setFadingCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(paybackId);
            return newSet;
          });
        }, 300);
        
        showAlert('Payment denied.', 'error');
      }, 100);
    } catch (err) {
      console.error('Error denying payment:', err);
      showAlert('Failed to deny payment. Please try again.', 'error');
    }
  };

  // Open image modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Filter paybacks based on search term
  const filteredPaybacks = pendingPaybacks.filter(payback => {
    const userName = payback.userName || '';
    const userEmail = payback.userEmail || '';
    const searchLower = searchTerm.toLowerCase();
    
    return userName.toLowerCase().includes(searchLower) || 
           userEmail.toLowerCase().includes(searchLower);
  });

  return (
    <div className="whatsapp-container">
      {/* <Header /> */}
      
      {/* Alert Container */}
      {alert && (
        <div 
          className={`alert alert-${alert.type}`}
          onClick={() => setAlert(null)}
        >
          {alert.message}
        </div>
      )}

      <div className="main-content">
        <h1 className="page-title">Loan Repayment Management</h1>
        
        {/* Search Bar */}
        <div className="card">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {/* Pending Paybacks List */}
        <div className="card">
          <h2 className="card-title">Pending Loan Repayments</h2>
          
          {fetching ? (
            <div className="loading-indicator">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p>Loading pending paybacks...</p>
            </div>
          ) : filteredPaybacks.length === 0 ? (
            <p className="empty-state">No pending loan repayments at the moment.</p>
          ) : (
            <div className="payback-grid">
              {filteredPaybacks.map((payback) => {
                const isFading = fadingCards.has(payback.id);
                return (
                  <div 
                    key={payback.id} 
                    className={`admin-payback-card animate-slideUp ${isFading ? 'fade-out' : ''}`}
                  >
                    <div className="payback-header">
                      <div className="user-info">
                        <h3>{payback.userName || 'Unknown User'}</h3>
                        <p>{payback.userEmail || 'No email provided'}</p>
                      </div>
                      <div className={`status-badge pending`}>
                        Pending
                      </div>
                    </div>
                    
                    <div className="payback-details">
                      <div className="detail-row">
                        <span className="detail-label">Loan Amount:</span>
                        <span className="detail-value">${payback.amount}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Interest (10%):</span>
                        <span className="detail-value">${(payback.amount * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Total Payable:</span>
                        <span className="detail-value">${payback.totalPayable?.toFixed(2) || (payback.amount * 1.1).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Paid Amount:</span>
                        <span className="detail-value">${payback.paidAmount}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Payment Date:</span>
                        <span className="detail-value">{formatDate(payback.paymentTimestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="proof-section">
                      <span className="proof-label">Proof of Payment:</span>
                      {payback.proofImageUrl ? (
                        <div 
                          className="proof-thumbnail"
                          onClick={() => openImageModal(payback.proofImageUrl)}
                        >
                          <img src={payback.proofImageUrl} alt="Proof of payment" />
                          <div className="proof-overlay">
                            <Eye size={20} />
                          </div>
                        </div>
                      ) : (
                        <span className="no-proof">No proof provided</span>
                      )}
                    </div>
                    
                    <div className="action-buttons">
                      <button 
                        className="approve-button"
                        onClick={() => handleApprove(payback.id)}
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button 
                        className="deny-button"
                        onClick={() => handleDeny(payback.id)}
                      >
                        <X size={16} />
                        Deny
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {showModal && (
        <div className="proof-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeImageModal}>
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Proof of payment" />
          </div>
        </div>
      )}
      
      <style jsx>{`
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--text-light);
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #f9fafb;
          outline: none;
          transition: all 0.25s ease;
          font-size: 0.95rem;
          color: var(--text);
        }
        
        .search-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          background: #fff;
        }
        
        .payback-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .admin-payback-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 20px;
          box-shadow: var(--elevation);
          transition: all 0.25s ease;
          border: 1px solid var(--border);
        }
        
        .admin-payback-card:hover {
          box-shadow: var(--elevation-hover);
          transform: translateY(-3px);
        }
        
        .admin-payback-card.fade-out {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.3s ease-out;
        }
        
        .payback-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .user-info h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
        }
        
        .user-info p {
          margin: 4px 0 0;
          font-size: 0.9rem;
          color: var(--text-light);
        }
        
        .status-badge {
          padding: 6px 12px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-badge.pending {
          background: var(--warning-bg);
          color: var(--warning);
        }
        
        .status-badge.approved {
          background: var(--success-bg);
          color: var(--success);
        }
        
        .status-badge.denied {
          background: var(--error-bg);
          color: var(--error);
        }
        
        .payback-details {
          margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .detail-label {
          color: var(--text-light);
          font-size: 0.9rem;
        }
        
        .detail-value {
          font-weight: 600;
          color: var(--text);
        }
        
        .proof-section {
          margin-bottom: 16px;
        }
        
        .proof-label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-light);
          font-size: 0.9rem;
        }
        
        .proof-thumbnail {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }
        
        .proof-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .proof-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .proof-thumbnail:hover .proof-overlay {
          opacity: 1;
        }
        
        .no-proof {
          color: var(--muted);
          font-style: italic;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        
        .approve-button, .deny-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .approve-button {
          background: var(--success);
          color: white;
        }
        
        .approve-button:hover {
          background: #059669;
          transform: translateY(-2px);
        }
        
        .deny-button {
          background: var(--error);
          color: white;
        }
        
        .deny-button:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }
        
        .proof-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }
        
        .modal-content img {
          max-width: 100%;
          max-height: 80vh;
          border-radius: 8px;
        }
        
        .modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        @media (max-width: 768px) {
          .payback-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPaybacksPage;