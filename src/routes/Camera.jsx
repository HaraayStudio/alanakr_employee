import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import styles from './Camera.module.scss';

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
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const checkPermissions = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const locationPermission = await navigator.permissions.query({ name: 'geolocation' });
      
      return {
        camera: cameraPermission.state,
        location: locationPermission.state
      };
    } catch (err) {
      return { camera: 'prompt', location: 'prompt' };
    }
  };

  const handleStartAction = async (type) => {
    setActionType(type);
    setError('');
    
    // Check if we already have permissions
    const permissions = await checkPermissions();
    
    if (permissions.camera === 'granted' && permissions.location === 'granted') {
      // Already have permissions, go straight to camera
      try {
        const position = await requestLocationPermission();
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        const addr = await getAddressFromCoords(latitude, longitude);
        setAddress(addr);
        setTimestamp(new Date().toISOString());
        
        await startCamera();
        setStep('camera');
      } catch (err) {
        setStep('permissions');
      }
    } else {
      // Need to request permissions
      setStep('permissions');
    }
  };

  const requestCameraPermission = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus(prev => ({ ...prev, camera: 'granted' }));
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      setPermissionStatus(prev => ({ ...prev, camera: 'denied' }));
      setError('Camera access denied. Please click "Allow" when browser asks for camera permission.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by your browser'));
        return;
      }

      setIsLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus(prev => ({ ...prev, location: 'granted' }));
          setIsLoading(false);
          resolve(position);
        },
        (error) => {
          setPermissionStatus(prev => ({ ...prev, location: 'denied' }));
          setIsLoading(false);
          
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
          
          setError(errorMsg);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleRequestBothPermissions = async () => {
    setError('');
    
    const cameraGranted = await requestCameraPermission();
    if (!cameraGranted) return;
    
    try {
      const position = await requestLocationPermission();
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      
      const addr = await getAddressFromCoords(latitude, longitude);
      setAddress(addr);
      
      setTimestamp(new Date().toISOString());
      
      await startCamera();
      setStep('camera');
      
    } catch (err) {
      console.error('Location error:', err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      return true;
    } catch (err) {
      setError('Failed to start camera. Please try again.');
      return false;
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
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
      const url = URL.createObjectURL(blob);
      setCapturedImage({ blob, url });
      setStep('preview');
      
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleRetake = async () => {
    setCapturedImage(null);
    setError('');
    await startCamera();
    setStep('camera');
  };

  const handleSubmit = async () => {
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
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('success');
      setTimeout(() => resetFlow(), 3000);
      
    } catch (err) {
      setError('Failed to submit attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('initial');
    setActionType(null);
    setCapturedImage(null);
    setLocation(null);
    setAddress('');
    setTimestamp('');
    setError('');
    stopCamera();
  };

  if (step === 'permissions') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <Settings className={styles.spinIcon} />
            </div>
            <h2 className={styles.title}>Permissions Required</h2>
            <p className={styles.subtitle}>We need access to capture your attendance</p>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <div className={styles.permissionsList}>
            <div className={`${styles.permissionItem} ${
              permissionStatus.camera === 'granted' ? styles.granted :
              permissionStatus.camera === 'denied' ? styles.denied : ''
            }`}>
              <div className={styles.permissionContent}>
                <div className={styles.permissionInfo}>
                  <div className={`${styles.permissionIconWrapper} ${
                    permissionStatus.camera === 'granted' ? styles.granted :
                    permissionStatus.camera === 'denied' ? styles.denied : ''
                  }`}>
                    <Camera className={styles.permissionIcon} />
                  </div>
                  <div>
                    <h3 className={styles.permissionName}>Camera</h3>
                    <p className={styles.permissionDesc}>Required for selfie</p>
                  </div>
                </div>
                {permissionStatus.camera === 'granted' && (
                  <CheckCircle className={styles.statusIconGranted} />
                )}
                {permissionStatus.camera === 'denied' && (
                  <XCircle className={styles.statusIconDenied} />
                )}
              </div>
            </div>

            <div className={`${styles.permissionItem} ${
              permissionStatus.location === 'granted' ? styles.granted :
              permissionStatus.location === 'denied' ? styles.denied : ''
            }`}>
              <div className={styles.permissionContent}>
                <div className={styles.permissionInfo}>
                  <div className={`${styles.permissionIconWrapper} ${
                    permissionStatus.location === 'granted' ? styles.granted :
                    permissionStatus.location === 'denied' ? styles.denied : ''
                  }`}>
                    <MapPin className={styles.permissionIcon} />
                  </div>
                  <div>
                    <h3 className={styles.permissionName}>Location</h3>
                    <p className={styles.permissionDesc}>Required for address</p>
                  </div>
                </div>
                {permissionStatus.location === 'granted' && (
                  <CheckCircle className={styles.statusIconGranted} />
                )}
                {permissionStatus.location === 'denied' && (
                  <XCircle className={styles.statusIconDenied} />
                )}
              </div>
            </div>
          </div>

          <div className={styles.tipBox}>
            <p className={styles.tipText}>
              <strong>👆 Tip:</strong> When browser asks, click <strong>"Allow"</strong> to grant permissions.
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleRequestBothPermissions}
              disabled={isLoading}
              className={styles.primaryButton}
            >
              <Settings />
              <span>{isLoading ? 'Requesting...' : 'Grant Permissions'}</span>
            </button>

            <button onClick={resetFlow} className={styles.secondaryButton}>
              Cancel
            </button>
          </div>

          {(permissionStatus.camera === 'denied' || permissionStatus.location === 'denied') && (
            <div className={styles.warningBox}>
              <p className={styles.warningTitle}>
                <strong>⚠️ Permission Denied?</strong>
              </p>
              <p className={styles.warningText}>
                Click the <strong>lock icon</strong> or <strong>info icon</strong> in your browser's address bar, then enable Camera and Location.
              </p>
              <button onClick={handleRequestBothPermissions} className={styles.tryAgainButton}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'initial') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <Clock />
            </div>
            <h1 className={styles.mainTitle}>Attendance</h1>
            <p className={styles.subtitle}>Mark your attendance with a selfie</p>
          </div>
          
          <div className={styles.buttonGroup}>
            <button onClick={() => handleStartAction('check_in')} className={styles.checkInButton}>
              <CheckCircle />
              <span>Check In</span>
            </button>
            
            <button onClick={() => handleStartAction('check_out')} className={styles.checkOutButton}>
              <XCircle />
              <span>Check Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'camera') {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.videoContainer}>
          <video ref={videoRef} autoPlay playsInline className={styles.video} />
          
          <div className={styles.topOverlay}>
            <h2 className={styles.cameraTitle}>
              {actionType === 'check_in' ? 'Check In' : 'Check Out'}
            </h2>
          </div>
          
          <div className={styles.bottomOverlay}>
            <div className={styles.infoBox}>
              <div className={styles.infoItem}>
                <MapPin className={styles.infoIcon} />
                <span>{address}</span>
              </div>
              <div className={styles.infoItem}>
                <Clock className={styles.infoIcon} />
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.cameraControls}>
          <button onClick={resetFlow} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={capturePhoto} className={styles.captureButton}>
            <Camera />
            <span>Capture</span>
          </button>
        </div>
        
        <canvas ref={canvasRef} className={styles.hiddenCanvas} />
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.previewContainer}>
          <img src={capturedImage?.url} alt="Captured selfie" className={styles.previewImage} />
        </div>
        
        <div className={styles.cameraControls}>
          <button onClick={handleRetake} disabled={isLoading} className={styles.cancelButton}>
            Retake
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className={styles.confirmButton}>
            <CheckCircle />
            <span>{isLoading ? 'Submitting...' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className={styles.successContainer}>
        <div className={styles.card}>
          <div className={styles.successContent}>
            <div className={styles.successIconWrapper}>
              <CheckCircle className={styles.successIcon} />
            </div>
            <h2 className={styles.successTitle}>Success!</h2>
            <p className={styles.successMessage}>
              {actionType === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully
            </p>
            <p className={styles.successTime}>
              {new Date(timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// SCSS Module (CheckInCheckout.module.scss)
const scssContent = `
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.successContainer {
  @extend .container;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  max-width: 28rem;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.iconWrapper {
  background: #e0e7ff;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;

  svg {
    width: 2.5rem;
    height: 2.5rem;
    color: #4f46e5;
  }
}

.spinIcon {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.mainTitle {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

.errorBox {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
}

.errorIcon {
  width: 1.25rem;
  height: 1.25rem;
  color: #dc2626;
  margin-top: 0.125rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.errorText {
  color: #991b1b;
  font-size: 0.875rem;
}

.permissionsList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.permissionItem {
  border: 2px solid #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem;
  background: white;
  transition: all 0.3s;

  &.granted {
    border-color: #10b981;
    background: #f0fdf4;
  }

  &.denied {
    border-color: #ef4444;
    background: #fef2f2;
  }
}

.permissionContent {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.permissionInfo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.permissionIconWrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1d5db;

  &.granted {
    background: #10b981;
  }

  &.denied {
    background: #ef4444;
  }
}

.permissionIcon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.permissionName {
  font-weight: 600;
  color: #1f2937;
}

.permissionDesc {
  font-size: 0.75rem;
  color: #6b7280;
}

.statusIconGranted {
  width: 1.5rem;
  height: 1.5rem;
  color: #10b981;
}

.statusIconDenied {
  width: 1.5rem;
  height: 1.5rem;
  color: #ef4444;
}

.tipBox {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.tipText {
  font-size: 0.875rem;
  color: #1e40af;
}

.buttonGroup {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.primaryButton {
  width: 100%;
  background: #4f46e5;
  color: white;
  font-weight: bold;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: #4338ca;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.secondaryButton {
  width: 100%;
  background: #e5e7eb;
  color: #374151;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;

  &:hover {
    background: #d1d5db;
  }
}

.checkInButton {
  width: 100%;
  background: #10b981;
  color: white;
  font-weight: bold;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  font-size: 1.125rem;

  &:hover {
    background: #059669;
    transform: scale(1.05);
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.checkOutButton {
  @extend .checkInButton;
  background: #ef4444;

  &:hover {
    background: #dc2626;
  }
}

.warningBox {
  margin-top: 1.5rem;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.75rem;
  padding: 1rem;
}

.warningTitle {
  font-size: 0.875rem;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.warningText {
  font-size: 0.75rem;
  color: #b45309;
  margin-bottom: 0.5rem;
}

.tryAgainButton {
  font-size: 0.75rem;
  color: #78350f;
  text-decoration: underline;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.fullscreen {
  position: fixed;
  inset: 0;
  background: black;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.videoContainer {
  flex: 1;
  position: relative;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.topOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
  padding: 1.5rem;
}

.cameraTitle {
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}

.bottomOverlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1.5rem;
}

.infoBox {
  color: white;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.infoItem {
  display: flex;
  align-items: center;
}

.infoIcon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.cameraControls {
  background: black;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cancelButton {
  background: #4b5563;
  color: white;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #374151;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.captureButton {
  background: white;
  color: black;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f3f4f6;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.confirmButton {
  background: #10b981;
  color: white;
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.hiddenCanvas {
  display: none;
}

.previewContainer {
  flex: 1;
  position: relative;
}

.previewImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.successContent {
  text-align: center;
}

.successIconWrapper {
  background: #d1fae5;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.successIcon {
  width: 3rem;
  height: 3rem;
  color: #10b981;
}

.successTitle {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.successMessage {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.successTime {
  font-size: 0.875rem;
  color: #9ca3af;
}
`;

export default CheckInCheckoutSystem;