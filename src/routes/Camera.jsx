import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';

const CheckInCheckoutSystem = () => {
  const [step, setStep] = useState('initial');
  const [actionType, setActionType] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState({ camera: 'prompt', location: 'prompt' });
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }
          
          const handleLoadedMetadata = () => {
            setIsCameraReady(true);
            resolve(true);
          };
          
          const handleError = () => {
            reject(new Error('Video failed to load'));
          };
          
          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          videoRef.current.addEventListener('error', handleError, { once: true });
          
          // Cleanup timeout
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
              videoRef.current.removeEventListener('error', handleError);
            }
            reject(new Error('Video load timeout'));
          }, 5000);
        });
      }
      
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to start camera. Please try again.');
      return false;
    }
  }, [stopCamera]);

  const getAddressFromCoords = useCallback((lat, lng) => {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }, []);

  const requestLocationPermission = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!mountedRef.current) return;
          setPermissionStatus(prev => ({ ...prev, location: 'granted' }));
          resolve(position);
        },
        (error) => {
          if (!mountedRef.current) return;
          setPermissionStatus(prev => ({ ...prev, location: 'denied' }));
          
          let errorMsg = 'Location access denied';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location access denied. Please click "Allow" when browser asks for location permission.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location unavailable. Please turn on GPS/Location Services.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timeout. Please try again.';
              break;
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
      // Request location first (faster)
      const position = await requestLocationPermission();
      const { latitude, longitude } = position.coords;
      
      if (!mountedRef.current) return;
      
      setLocation({ latitude, longitude });
      setAddress(getAddressFromCoords(latitude, longitude));
      setTimestamp(new Date().toISOString());
      
      // Then start camera
      const cameraStarted = await startCamera();
      
      if (cameraStarted && mountedRef.current) {
        setPermissionStatus(prev => ({ ...prev, camera: 'granted' }));
        setStep('camera');
      } else {
        throw new Error('Camera failed to start');
      }
    } catch (err) {
      console.error('Start action error:', err);
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to start. Please grant permissions.');
      setStep('permissions');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [requestLocationPermission, startCamera, getAddressFromCoords]);

  const handleRequestBothPermissions = useCallback(async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Request location first
      const position = await requestLocationPermission();
      const { latitude, longitude } = position.coords;
      
      if (!mountedRef.current) return;
      
      setLocation({ latitude, longitude });
      setAddress(getAddressFromCoords(latitude, longitude));
      setTimestamp(new Date().toISOString());
      
      // Then start camera
      const cameraStarted = await startCamera();
      
      if (cameraStarted && mountedRef.current) {
        setPermissionStatus(prev => ({ ...prev, camera: 'granted' }));
        setStep('camera');
      } else {
        throw new Error('Camera failed to start');
      }
    } catch (err) {
      console.error('Permission error:', err);
      if (!mountedRef.current) return;
      setError(err.message || 'Failed to get permissions');
      setPermissionStatus(prev => ({ 
        ...prev, 
        camera: streamRef.current ? 'granted' : 'denied',
        location: location ? 'granted' : 'denied'
      }));
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [requestLocationPermission, startCamera, getAddressFromCoords, location]);

  const capturePhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !isCameraReady) {
      setError('Camera not ready. Please wait.');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0);
    
    const overlayHeight = 120;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(actionType === 'check_in' ? '✓ CHECK IN' : '✓ CHECK OUT', 20, canvas.height - 85);
    
    ctx.font = '20px Arial';
    ctx.fillText(`📍 ${address}`, 20, canvas.height - 55);
    ctx.fillText(`🕒 ${new Date(timestamp).toLocaleString()}`, 20, canvas.height - 25);
    
    canvas.toBlob((blob) => {
      if (!mountedRef.current) return;
      const url = URL.createObjectURL(blob);
      setCapturedImage({ blob, url });
      setStep('preview');
      stopCamera();
    }, 'image/jpeg', 0.85);
  }, [actionType, address, timestamp, isCameraReady, stopCamera]);

  const handleRetake = useCallback(async () => {
    setCapturedImage(null);
    setError('');
    setIsLoading(true);
    
    const cameraStarted = await startCamera();
    
    if (cameraStarted && mountedRef.current) {
      setStep('camera');
    }
    
    setIsLoading(false);
  }, [startCamera]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', capturedImage.blob, 'selfie.jpg');
      formData.append('employeeId', '12345');
      formData.append('type', actionType);
      formData.append('latitude', location?.latitude || 0);
      formData.append('longitude', location?.longitude || 0);
      formData.append('address', address);
      formData.append('timestamp', timestamp);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!mountedRef.current) return;
      
      setStep('success');
      setTimeout(() => {
        if (mountedRef.current) resetFlow();
      }, 3000);
      
    } catch (err) {
      if (!mountedRef.current) return;
      setError('Failed to submit attendance. Please try again.');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [capturedImage, actionType, location, address, timestamp]);

  const resetFlow = useCallback(() => {
    setStep('initial');
    setActionType(null);
    setCapturedImage(null);
    setLocation(null);
    setAddress('');
    setTimestamp('');
    setError('');
    setPermissionStatus({ camera: 'prompt', location: 'prompt' });
    stopCamera();
  }, [stopCamera]);

  if (step === 'permissions') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <Settings style={styles.icon} className="spin-icon" />
            </div>
            <h2 style={styles.title}>Permissions Required</h2>
            <p style={styles.subtitle}>We need access to capture your attendance</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle style={styles.errorIcon} />
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          <div style={styles.permissionsList}>
            <div style={{
              ...styles.permissionItem,
              ...(permissionStatus.camera === 'granted' ? styles.permissionGranted : {}),
              ...(permissionStatus.camera === 'denied' ? styles.permissionDenied : {})
            }}>
              <div style={styles.permissionContent}>
                <div style={styles.permissionInfo}>
                  <div style={{
                    ...styles.permissionIconWrapper,
                    ...(permissionStatus.camera === 'granted' ? styles.iconGranted : {}),
                    ...(permissionStatus.camera === 'denied' ? styles.iconDenied : {})
                  }}>
                    <Camera style={styles.permissionIcon} />
                  </div>
                  <div>
                    <h3 style={styles.permissionName}>Camera</h3>
                    <p style={styles.permissionDesc}>Required for selfie</p>
                  </div>
                </div>
                {permissionStatus.camera === 'granted' && (
                  <CheckCircle style={styles.statusIconGranted} />
                )}
                {permissionStatus.camera === 'denied' && (
                  <XCircle style={styles.statusIconDenied} />
                )}
              </div>
            </div>

            <div style={{
              ...styles.permissionItem,
              ...(permissionStatus.location === 'granted' ? styles.permissionGranted : {}),
              ...(permissionStatus.location === 'denied' ? styles.permissionDenied : {})
            }}>
              <div style={styles.permissionContent}>
                <div style={styles.permissionInfo}>
                  <div style={{
                    ...styles.permissionIconWrapper,
                    ...(permissionStatus.location === 'granted' ? styles.iconGranted : {}),
                    ...(permissionStatus.location === 'denied' ? styles.iconDenied : {})
                  }}>
                    <MapPin style={styles.permissionIcon} />
                  </div>
                  <div>
                    <h3 style={styles.permissionName}>Location</h3>
                    <p style={styles.permissionDesc}>Required for address</p>
                  </div>
                </div>
                {permissionStatus.location === 'granted' && (
                  <CheckCircle style={styles.statusIconGranted} />
                )}
                {permissionStatus.location === 'denied' && (
                  <XCircle style={styles.statusIconDenied} />
                )}
              </div>
            </div>
          </div>

          <div style={styles.tipBox}>
            <p style={styles.tipText}>
              <strong>👆 Tip:</strong> When browser asks, click <strong>"Allow"</strong> to grant permissions.
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={handleRequestBothPermissions}
              disabled={isLoading}
              style={{
                ...styles.primaryButton,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              <Settings style={styles.buttonIcon} />
              <span>{isLoading ? 'Requesting...' : 'Grant Permissions'}</span>
            </button>

            <button onClick={resetFlow} style={styles.secondaryButton}>
              Cancel
            </button>
          </div>

          {(permissionStatus.camera === 'denied' || permissionStatus.location === 'denied') && (
            <div style={styles.warningBox}>
              <p style={styles.warningTitle}>
                <strong>⚠️ Permission Denied?</strong>
              </p>
              <p style={styles.warningText}>
                Click the <strong>lock icon</strong> or <strong>info icon</strong> in your browser's address bar, then enable Camera and Location.
              </p>
              <button onClick={handleRequestBothPermissions} style={styles.tryAgainButton}>
                Try Again
              </button>
            </div>
          )}
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-icon {
            animation: spin 3s linear infinite;
          }
        `}</style>
      </div>
    );
  }

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
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => handleStartAction('check_in')} 
              style={styles.checkInButton}
              disabled={isLoading}
            >
              <CheckCircle style={styles.buttonIcon} />
              <span>{isLoading && actionType === 'check_in' ? 'Starting...' : 'Check In'}</span>
            </button>
            
            <button 
              onClick={() => handleStartAction('check_out')} 
              style={styles.checkOutButton}
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
      <div style={styles.fullscreen}>
        <div style={styles.videoContainer}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={styles.video}
          />
          
          {!isCameraReady && (
            <div style={styles.loadingOverlay}>
              <div style={styles.loadingSpinner}>
                <Settings style={styles.spinnerIcon} className="spin-icon" />
                <p style={styles.loadingText}>Starting camera...</p>
              </div>
            </div>
          )}
          
          <div style={styles.topOverlay}>
            <h2 style={styles.cameraTitle}>
              {actionType === 'check_in' ? 'Check In' : 'Check Out'}
            </h2>
          </div>
          
          <div style={styles.bottomOverlay}>
            <div style={styles.infoBox}>
              <div style={styles.infoItem}>
                <MapPin style={styles.infoIcon} />
                <span>{address}</span>
              </div>
              <div style={styles.infoItem}>
                <Clock style={styles.infoIcon} />
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.cameraControls}>
          <button onClick={resetFlow} style={styles.cancelButton}>
            Cancel
          </button>
          <button 
            onClick={capturePhoto} 
            style={{
              ...styles.captureButton,
              ...(!isCameraReady ? styles.buttonDisabled : {})
            }}
            disabled={!isCameraReady}
          >
            <Camera style={styles.buttonIcon} />
            <span>Capture</span>
          </button>
        </div>
        
        <canvas ref={canvasRef} style={styles.hiddenCanvas} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-icon {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div style={styles.fullscreen}>
        <div style={styles.previewContainer}>
          <img src={capturedImage?.url} alt="Captured selfie" style={styles.previewImage} />
        </div>
        
        <div style={styles.cameraControls}>
          <button 
            onClick={handleRetake} 
            disabled={isLoading} 
            style={{
              ...styles.cancelButton,
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

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  successContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '2rem',
    maxWidth: '28rem',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconWrapper: {
    background: '#e0e7ff',
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  icon: {
    width: '2.5rem',
    height: '2.5rem',
    color: '#4f46e5',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  mainTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
  },
  errorIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#dc2626',
    marginTop: '0.125rem',
    marginRight: '0.75rem',
    flexShrink: 0,
  },
  errorText: {
    color: '#991b1b',
    fontSize: '0.875rem',
    margin: 0,
  },
  permissionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  permissionItem: {
    border: '2px solid #d1d5db',
    borderRadius: '0.75rem',
    padding: '1rem',
    background: 'white',
    transition: 'all 0.3s',
  },
  permissionGranted: {
    borderColor: '#10b981',
    background: '#f0fdf4',
  },
  permissionDenied: {
    borderColor: '#ef4444',
    background: '#fef2f2',
  },
  permissionContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  permissionIconWrapper: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#d1d5db',
  },
  iconGranted: {
    background: '#10b981',
  },
  iconDenied: {
    background: '#ef4444',
  },
  permissionIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: 'white',
  },
  permissionName: {
    fontWeight: 600,
    color: '#1f2937',
    margin: 0,
  },
  permissionDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  statusIconGranted: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#10b981',
  },
  statusIconDenied: {
    width: '1.5rem',
    height: '1.5rem',
    color: '#ef4444',
  },
  tipBox: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  tipText: {
    fontSize: '0.875rem',
    color: '#1e40af',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  primaryButton: {
    width: '100%',
    background: '#4f46e5',
    color: 'white',
    fontWeight: 'bold',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  secondaryButton: {
    width: '100%',
    background: '#e5e7eb',
    color: '#374151',
    fontWeight: 600,
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
  },
  checkInButton: {
    width: '100%',
    background: '#10b981',
    color: 'white',
    fontWeight: 'bold',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '1.125rem',
  },
  checkOutButton: {
    width: '100%',
    background: '#ef4444',
    color: 'white',
    fontWeight: 'bold',
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '1.125rem',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  warningBox: {
    marginTop: '1.5rem',
    background: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: '0.75rem',
    padding: '1rem',
  },
  warningTitle: {
    fontSize: '0.875rem',
    color: '#92400e',
    marginBottom: '0.5rem',
    margin: 0,
  },
  warningText: {
    fontSize: '0.75rem',
    color: '#b45309',
    marginBottom: '0.5rem',
    margin: '0.5rem 0',
  },
  tryAgainButton: {
    fontSize: '0.75rem',
    color: '#78350f',
    textDecoration: 'underline',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  fullscreen: {
    position: 'fixed',
    inset: 0,
    background: 'black',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingSpinner: {
    textAlign: 'center',
  },
  spinnerIcon: {
    width: '3rem',
    height: '3rem',
    color: 'white',
    marginBottom: '1rem',
  },
  loadingText: {
    color: 'white',
    fontSize: '1rem',
    margin: 0,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent)',
    padding: '1.5rem',
  },
  cameraTitle: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
    padding: '1.5rem',
  },
  infoBox: {
    color: 'white',
    fontSize: '0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
  },
  infoIcon: {
    width: '1rem',
    height: '1rem',
    marginRight: '0.5rem',
  },
  cameraControls: {
    background: 'black',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  cancelButton: {
    background: '#4b5563',
    color: 'white',
    fontWeight: 'bold',
    padding: '0.75rem 2rem',
    borderRadius: '9999px',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
  },
  captureButton: {
    background: 'white',
    color: 'black',
    fontWeight: 'bold',
    padding: '0.75rem 2rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  confirmButton: {
    background: '#10b981',
    color: 'white',
    fontWeight: 'bold',
    padding: '0.75rem 2rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  hiddenCanvas: {
    display: 'none',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
    background: 'black',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  successContent: {
    textAlign: 'center',
  },
  successIconWrapper: {
    background: '#d1fae5',
    width: '6rem',
    height: '6rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  successIcon: {
    width: '3rem',
    height: '3rem',
    color: '#10b981',
  },
  successTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1rem',
    margin: '0 0 1rem 0',
  },
  successMessage: {
    color: '#6b7280',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  successTime: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    margin: 0,
  },
};

export default CheckInCheckoutSystem;