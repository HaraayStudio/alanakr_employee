import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';

const BASE_URL = "https://api.alankardigitalhub.in/api";

const CheckInCheckoutSystem = () => {
  const [step, setStep] = useState('initial');
  const [actionType, setActionType] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [employeeId, setEmployeeId] = useState('1'); // Change this to actual employee ID
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  const getAddressFromCoords = useCallback((lat, lng) => {
    return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
  }, []);

  const requestLocationPermission = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!mountedRef.current) return;
          resolve(position);
        },
        (error) => {
          if (!mountedRef.current) return;
          
          let errorMsg = 'Location access denied';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location unavailable. Please enable GPS/Location Services.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timeout. Please try again.';
              break;
            default:
              errorMsg = 'Failed to get location: ' + error.message;
          }
          
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const handleStartAction = useCallback(async (type) => {
    setActionType(type);
    setError('');
    setIsLoading(true);
    
    try {
      // Get location first
      const position = await requestLocationPermission();
      const { latitude, longitude } = position.coords;
      
      if (!mountedRef.current) return;
      
      setLocation({ latitude, longitude });
      setAddress(getAddressFromCoords(latitude, longitude));
      setTimestamp(new Date().toISOString());
      
      // Move to camera step
      setStep('camera');
      
      // Trigger file input
      setTimeout(() => {
        if (fileInputRef.current && mountedRef.current) {
          fileInputRef.current.click();
        }
      }, 300);
      
    } catch (err) {
      console.error('Start action error:', err);
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to get location. Please enable location services.');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [requestLocationPermission, getAddressFromCoords]);

  const addOverlayToImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = canvasRef.current;
      
      img.onload = () => {
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Add overlay
        const overlayHeight = Math.max(120, img.height * 0.15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
        
        // Add text
        const fontSize = Math.max(20, img.width * 0.02);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Arial`;
        
        const padding = Math.max(15, img.width * 0.015);
        const lineHeight = fontSize * 1.5;
        
        ctx.fillText(
          actionType === 'check_in' ? '✓ CHECK IN' : '✓ CHECK OUT',
          padding,
          canvas.height - overlayHeight + lineHeight
        );
        
        ctx.font = `${fontSize * 0.85}px Arial`;
        ctx.fillText(
          `📍 ${address}`,
          padding,
          canvas.height - overlayHeight + lineHeight * 2.2
        );
        ctx.fillText(
          `🕒 ${new Date(timestamp).toLocaleString()}`,
          padding,
          canvas.height - overlayHeight + lineHeight * 3.4
        );
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image'));
            return;
          }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, [actionType, address, timestamp]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Add overlay to image
      const processedBlob = await addOverlayToImage(file);
      
      if (!mountedRef.current) return;
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(processedBlob);
      
      // Store the processed image
      setImageFile(processedBlob);
      setCapturedImage(imageUrl);
      setStep('preview');
      
    } catch (err) {
      console.error('Image processing error:', err);
      if (!mountedRef.current) return;
      setError('Failed to process image. Please try again.');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [addOverlayToImage]);

  const handleRetake = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setImageFile(null);
    setError('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setStep('camera');
    
    // Trigger file input again
    setTimeout(() => {
      if (fileInputRef.current && mountedRef.current) {
        fileInputRef.current.click();
      }
    }, 300);
  }, [capturedImage]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile, 'selfie.jpg');
      formData.append('employeeId', employeeId);
      formData.append('type', actionType);
      formData.append('latitude', location?.latitude || 0);
      formData.append('longitude', location?.longitude || 0);
      formData.append('address', address);
      formData.append('timestamp', timestamp);
      
      const response = await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Attendance marked:', result);
      
      if (!mountedRef.current) return;
      
      setStep('success');
      setTimeout(() => {
        if (mountedRef.current) resetFlow();
      }, 3000);
      
    } catch (err) {
      console.error('Submit error:', err);
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to submit attendance. Please try again.');
      setIsLoading(false);
    }
  }, [imageFile, actionType, location, address, timestamp, employeeId]);

  const resetFlow = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setStep('initial');
    setActionType(null);
    setCapturedImage(null);
    setImageFile(null);
    setLocation(null);
    setAddress('');
    setTimestamp('');
    setError('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [capturedImage]);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    iconWrapper: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px'
    },
    icon: {
      width: '40px',
      height: '40px',
      color: 'white'
    },
    mainTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '8px',
      margin: 0
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '8px',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#718096',
      margin: 0
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    checkInButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      padding: '20px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      transition: 'transform 0.2s',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    checkOutButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      padding: '20px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      transition: 'transform 0.2s',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    },
    buttonIcon: {
      width: '24px',
      height: '24px'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    cameraScreen: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    cameraCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      textAlign: 'center'
    },
    cameraIconWrapper: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      animation: 'pulse 2s ease-in-out infinite'
    },
    cameraIcon: {
      width: '50px',
      height: '50px',
      color: 'white'
    },
    cameraTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '12px',
      margin: '0 0 12px 0'
    },
    cameraSubtitle: {
      fontSize: '16px',
      color: '#718096',
      marginBottom: '24px',
      margin: '0 0 24px 0'
    },
    infoBox: {
      background: '#f7fafc',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      textAlign: 'left'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
      fontSize: '14px',
      color: '#4a5568'
    },
    infoItemLast: {
      marginBottom: 0
    },
    infoIcon: {
      width: '20px',
      height: '20px',
      color: '#667eea',
      flexShrink: 0
    },
    hiddenInput: {
      display: 'none'
    },
    captureButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      padding: '18px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      width: '100%',
      marginBottom: '12px'
    },
    cancelButton: {
      background: '#f7fafc',
      color: '#4a5568',
      border: '2px solid #e2e8f0',
      borderRadius: '16px',
      padding: '18px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%'
    },
    previewScreen: {
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    previewContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto'
    },
    previewImage: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      borderRadius: '12px'
    },
    previewControls: {
      background: '#1a202c',
      padding: '20px',
      display: 'flex',
      gap: '16px'
    },
    retakeButton: {
      flex: 1,
      background: '#2d3748',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    confirmButton: {
      flex: 1,
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    successContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    successContent: {
      textAlign: 'center'
    },
    successIconWrapper: {
      width: '100px',
      height: '100px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px'
    },
    successIcon: {
      width: '60px',
      height: '60px',
      color: 'white'
    },
    successTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '12px',
      margin: '0 0 12px 0'
    },
    successMessage: {
      fontSize: '18px',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '8px',
      margin: '0 0 8px 0'
    },
    successTime: {
      fontSize: '16px',
      color: 'rgba(255,255,255,0.7)',
      margin: 0
    },
    errorBox: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    errorIcon: {
      width: '24px',
      height: '24px',
      color: '#dc2626',
      flexShrink: 0,
      marginTop: '2px'
    },
    errorText: {
      color: '#dc2626',
      fontSize: '14px',
      margin: 0,
      textAlign: 'left'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(255,255,255,0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },
    loadingText: {
      color: '#4a5568',
      fontSize: '16px',
      margin: 0
    },
    hiddenCanvas: {
      display: 'none'
    }
  };

  if (step === 'initial') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <Clock style={styles.icon} />
            </div>
            <h1 style={styles.mainTitle}>Attendance</h1>
            <p style={styles.subtitle}>Mark your attendance with a selfie</p>
          </div>
          
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle style={styles.errorIcon} />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleStartAction('check_in')} 
              style={{...styles.checkInButton, ...(isLoading ? styles.buttonDisabled : {})}}
              disabled={isLoading}
            >
              <CheckCircle style={styles.buttonIcon} />
              <span>{isLoading && actionType === 'check_in' ? 'Starting...' : 'Check In'}</span>
            </button>
            
            <button 
              onClick={() => handleStartAction('check_out')} 
              style={{...styles.checkOutButton, ...(isLoading ? styles.buttonDisabled : {})}}
              disabled={isLoading}
            >
              <XCircle style={styles.buttonIcon} />
              <span>{isLoading && actionType === 'check_out' ? 'Starting...' : 'Check Out'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'camera') {
    return (
      <div style={styles.cameraScreen}>
        <div style={styles.cameraCard}>
          <div style={styles.cameraIconWrapper}>
            <Camera style={styles.cameraIcon} />
          </div>
          
          <h2 style={styles.cameraTitle}>
            {actionType === 'check_in' ? 'Check In' : 'Check Out'}
          </h2>
          <p style={styles.cameraSubtitle}>
            {isLoading ? 'Processing...' : 'Tap below to take a selfie'}
          </p>
          
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle style={styles.errorIcon} />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}
          
          <div style={styles.infoBox}>
            <div style={styles.infoItem}>
              <MapPin style={styles.infoIcon} />
              <span>{address}</span>
            </div>
            <div style={{...styles.infoItem, ...styles.infoItemLast}}>
              <Clock style={styles.infoIcon} />
              <span>{new Date(timestamp).toLocaleString()}</span>
            </div>
          </div>
          
          {isLoading ? (
            <div>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Processing image...</p>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileUpload}
                style={styles.hiddenInput}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={styles.captureButton}
              >
                <Camera style={styles.buttonIcon} />
                <span>Take Selfie</span>
              </button>
              <button onClick={resetFlow} style={styles.cancelButton}>
                Cancel
              </button>
            </>
          )}
        </div>
        
        <canvas ref={canvasRef} style={styles.hiddenCanvas} />
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div style={styles.previewScreen}>
        <div style={styles.previewContainer}>
          <img src={capturedImage} alt="Captured selfie" style={styles.previewImage} />
        </div>
        
        {error && (
          <div style={{...styles.errorBox, margin: '20px', marginBottom: '0'}}>
            <AlertCircle style={styles.errorIcon} />
            <p style={styles.errorText}>{error}</p>
          </div>
        )}
        
        <div style={styles.previewControls}>
          <button 
            onClick={handleRetake} 
            disabled={isLoading} 
            style={{
              ...styles.retakeButton,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
          >
            Retake
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            style={{
              ...styles.confirmButton,
              ...(isLoading ? styles.buttonDisabled : {})
            }}
          >
            <CheckCircle style={styles.buttonIcon} />
            <span>{isLoading ? 'Submitting...' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={styles.successContainer}>
        <div style={styles.card}>
          <div style={styles.successContent}>
            <div style={styles.successIconWrapper}>
              <CheckCircle style={styles.successIcon} />
            </div>
            <h2 style={styles.successTitle}>Success!</h2>
            <p style={styles.successMessage}>
              {actionType === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully
            </p>
            <p style={styles.successTime}>
              {new Date(timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CheckInCheckoutSystem;