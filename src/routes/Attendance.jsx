import React, { useState, useRef, useCallback } from 'react';

const AttendanceApp = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'camera', 'preview'
  const [selectedAction, setSelectedAction] = useState(null); // 'checkin' or 'checkout'
  const [capturedImage, setCapturedImage] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      name: 'Prajwal Thombare',
      date: '10-06-2025',
      status: 'Present',
      project: 'Project Name',
      deadline: '26-06-2025',
      checkIn: '10:26 AM',
      checkOut: '6:30 PM',
      checkInImage: '/api/placeholder/60/60',
      checkOutImage: '/api/placeholder/60/60'
    },
    {
      id: 2,
      name: 'Prajwal Thombare',
    
      date: '09-06-2025',
      status: 'Present',
      project: 'Project Name',
      deadline: '26-06-2025',
      checkIn: '10:26 AM',
      checkOut: '6:30 PM',
      checkInImage: '/api/placeholder/60/60',
      checkOutImage: '/api/placeholder/60/60'
    },
    {
      id: 3,
      name: 'Prajwal Thombare',

      date: '08-06-2025',
      status: 'Present',
      project: 'Project Name',
      deadline: '26-06-2025',
      checkIn: '10:26 AM',
      checkOut: '6:30 PM',
      checkInImage: '/api/placeholder/60/60',
      checkOutImage: '/api/placeholder/60/60'
    }
  ]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      // fontFamily: 'system-ui, -apple-system, sans-serif'
      width:'100vw'
    },
    
    header: {
      backgroundColor: '#ffffff',
      padding: '16px 20px',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    
    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333333',
      margin: 0
    },
    
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    
    logoIcon: {
      width: '24px',
      height: '24px',
      backgroundColor: '#007AFF',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    
    menuIcon: {
      width: '24px',
      height: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      cursor: 'pointer'
    },
    
    menuLine: {
      width: '100%',
      height: '2px',
      backgroundColor: '#333333',
      borderRadius: '1px'
    },
    
    content: {
      padding: '20px',
    width: '100%',
      margin: '0 auto'
    },
    
    attendanceCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e8e8e8'
    },
    
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    
    employeeName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333',
      margin: 0
    },
    
    dateStatus: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '4px'
    },
    
    date: {
      fontSize: '14px',
      color: '#666666'
    },
    
    status: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#28a745',
      backgroundColor: '#e8f5e8',
      padding: '4px 8px',
      borderRadius: '12px'
    },
    
    projectInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    
    projectLabel: {
      fontSize: '12px',
      color: '#666666',
      marginBottom: '4px'
    },
    
    projectValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333333'
    },
    
    timeSection: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '16px'
    },
    
    timeBlock: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    
    timeLabel: {
      fontSize: '12px',
      color: '#666666',
      marginBottom: '8px'
    },
    
    timeValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333333',
      marginBottom: '8px'
    },
    
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      backgroundColor: '#e0e0e0',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    
    actionButton: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    
    checkInButton: {
      backgroundColor: '#007AFF',
      color: 'white'
    },
    
    checkOutButton: {
      backgroundColor: '#FF3B30',
      color: 'white'
    },
    
    seeAllButton: {
      backgroundColor: '#007AFF',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginTop: '20px',
      width: '100%'
    },
    
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e0e0e0',
      padding: '12px 0',
      display: 'flex',
      justifyContent: 'space-around'
    },
    
    navItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      color: '#666666'
    },
    
    navItemActive: {
      color: '#007AFF'
    },
    
    navIcon: {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    navLabel: {
      fontSize: '10px'
    },
    
    cameraContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    },
    
    cameraHeader: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: 'white'
    },
    
    cameraTitle: {
      fontSize: '18px',
      fontWeight: '600',
      margin: 0
    },
    
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer'
    },
    
    cameraView: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    
    cameraControls: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    
    captureButton: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      border: '4px solid #007AFF',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    captureInner: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#007AFF'
    },
    
    previewContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    },
    
    previewImage: {
      flex: 1,
      objectFit: 'cover',
      width: '100%'
    },
    
    previewActions: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '16px'
    },
    
    previewButton: {
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    
    saveButton: {
      backgroundColor: '#007AFF',
      color: 'white'
    },
    
    hidden: {
      display: 'none'
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleActionClick = async (action) => {
    setSelectedAction(action);
    setCurrentView('camera');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      setCurrentView('list');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      setCurrentView('preview');
    }
  };

  const handleSave = () => {
    if (capturedImage) {
      const newRecord = {
        id: Date.now(),
        name: 'Current User',
        date: getCurrentDate(),
        status: 'Present',
        project: 'Current Project',
        deadline: '26-06-2025',
        checkIn: selectedAction === 'checkin' ? getCurrentTime() : '--',
        checkOut: selectedAction === 'checkout' ? getCurrentTime() : '--',
        checkInImage: selectedAction === 'checkin' ? capturedImage : '/api/placeholder/60/60',
        checkOutImage: selectedAction === 'checkout' ? capturedImage : '/api/placeholder/60/60'
      };
      
      setAttendanceRecords(prev => [newRecord, ...prev]);
      closeCamera();
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setCurrentView('list');
    setSelectedAction(null);
  };

  const renderAttendanceList = () => (
    <div style={styles.container}>
    

      <div style={styles.content}>
        <h2 style={styles.headerTitle}>Attendance List</h2>
        
        {attendanceRecords.map((record) => (
          <div key={record.id} style={styles.attendanceCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.employeeName}>{record.name}</h3>
              <div style={styles.dateStatus}>
                <span style={styles.date}>{record.date}</span>
                <span style={styles.status}>{record.status}</span>
              </div>
            </div>
            
            <div style={styles.projectInfo}>
              <div>
                <div style={styles.projectLabel}>Project</div>
                <div style={styles.projectValue}>{record.project}</div>
              </div>
              <div>
                <div style={styles.projectLabel}>Deadline</div>
                <div style={styles.projectValue}>{record.deadline}</div>
              </div>
            </div>
            
            <div style={styles.timeSection}>
              <div style={styles.timeBlock}>
                <div style={styles.timeLabel}>Check In</div>
                <div style={styles.timeValue}>{record.checkIn}</div>
                <div 
                  style={{
                    ...styles.avatar,
                    backgroundImage: `url(${record.checkInImage})`
                  }}
                ></div>
              </div>
              <div style={styles.timeBlock}>
                <div style={styles.timeLabel}>Check Out</div>
                <div style={styles.timeValue}>{record.checkOut}</div>
                <div 
                  style={{
                    ...styles.avatar,
                    backgroundImage: `url(${record.checkOutImage})`
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        
        <div style={styles.actionButtons}>
          <button 
            style={{...styles.actionButton, ...styles.checkInButton}}
            onClick={() => handleActionClick('checkin')}
          >
            Check In
          </button>
          <button 
            style={{...styles.actionButton, ...styles.checkOutButton}}
            onClick={() => handleActionClick('checkout')}
          >
            Check Out
          </button>
        </div>
        
        <button style={styles.seeAllButton}>
          See all ↓
        </button>
      </div>

      <div style={styles.bottomNav}>
        <div style={{...styles.navItem, ...styles.navItemActive}}>
          <div style={styles.navIcon}>🏠</div>
          <span style={styles.navLabel}>Home</span>
        </div>
        <div style={styles.navItem}>
          <div style={styles.navIcon}>📊</div>
          <span style={styles.navLabel}>Company</span>
        </div>
        <div style={styles.navItem}>
          <div style={styles.navIcon}>📅</div>
          <span style={styles.navLabel}>Attendance</span>
        </div>
        <div style={styles.navItem}>
          <div style={styles.navIcon}>👤</div>
          <span style={styles.navLabel}>Profile</span>
        </div>
      </div>
    </div>
  );

  const renderCamera = () => (
    <div style={styles.cameraContainer}>
      <div style={styles.cameraHeader}>
        <h2 style={styles.cameraTitle}>
          {selectedAction === 'checkin' ? 'Check In' : 'Check Out'}
        </h2>
        <button style={styles.closeButton} onClick={closeCamera}>×</button>
      </div>
      
      <div style={styles.cameraView}>
        <video
          ref={videoRef}
          style={styles.video}
          autoPlay
          playsInline
          muted
        />
      </div>
      
      <div style={styles.cameraControls}>
        <button style={styles.captureButton} onClick={capturePhoto}>
          <div style={styles.captureInner}></div>
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div style={styles.previewContainer}>
      <div style={styles.cameraHeader}>
        <h2 style={styles.cameraTitle}>Preview</h2>
        <button style={styles.closeButton} onClick={closeCamera}>×</button>
      </div>
      
      <img 
        src={capturedImage} 
        alt="Captured selfie" 
        style={styles.previewImage}
      />
      
      <div style={styles.previewActions}>
        <button 
          style={{...styles.previewButton, ...styles.cancelButton}}
          onClick={() => setCurrentView('camera')}
        >
          ← Back
        </button>
        <button 
          style={{...styles.previewButton, ...styles.saveButton}}
          onClick={handleSave}
        >
          Save ✓
        </button>
      </div>
    </div>
  );

  return (
    <>
      {currentView === 'list' && renderAttendanceList()}
      {currentView === 'camera' && renderCamera()}
      {currentView === 'preview' && renderPreview()}
      <canvas ref={canvasRef} style={styles.hidden} />
    </>
  );
};

export default AttendanceApp;