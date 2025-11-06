import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';

const CheckInCheckoutSystem = () => {
  const [step, setStep] = useState('initial'); // initial, permissions, camera, preview, success
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

  const handleStartAction = (type) => {
    setActionType(type);
    setError('');
    setStep('permissions');
  };

  const requestCameraPermission = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      
      // Stop the stream immediately - we just wanted to get permission
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
    
    // Request camera first
    const cameraGranted = await requestCameraPermission();
    if (!cameraGranted) return;
    
    // Then request location
    try {
      const position = await requestLocationPermission();
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      
      // Get address
      const addr = await getAddressFromCoords(latitude, longitude);
      setAddress(addr);
      
      // Set timestamp
      setTimestamp(new Date().toISOString());
      
      // Both permissions granted, proceed to camera
      await startCamera();
      setStep('camera');
      
    } catch (err) {
      // Location failed, but don't stop the process
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
    // Mock geocoding - Replace with your backend API
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0);
    
    // Add overlay with address and time
    const overlayHeight = 120;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(actionType === 'check_in' ? '✓ CHECK IN' : '✓ CHECK OUT', 20, canvas.height - 85);
    
    ctx.font = '20px Arial';
    ctx.fillText(`📍 ${address}`, 20, canvas.height - 55);
    ctx.fillText(`🕒 ${new Date(timestamp).toLocaleString()}`, 20, canvas.height - 25);
    
    // Convert to blob
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCapturedImage({ blob, url });
      setStep('preview');
      
      // Stop camera
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
      formData.append('employeeId', '12345'); // Replace with actual employee ID
      formData.append('type', actionType);
      formData.append('latitude', location?.latitude || 0);
      formData.append('longitude', location?.longitude || 0);
      formData.append('address', address);
      formData.append('timestamp', timestamp);
      
      // Replace with your actual API endpoint
      // const response = await fetch('/api/attendance/submit', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      //   body: formData
      // });
      
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

  // Permission Request Screen
  if (step === 'permissions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-10 h-10 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Permissions Required</h2>
            <p className="text-gray-600 text-sm">We need access to capture your attendance</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className={`border-2 rounded-xl p-4 transition-all ${
              permissionStatus.camera === 'granted' ? 'border-green-500 bg-green-50' :
              permissionStatus.camera === 'denied' ? 'border-red-500 bg-red-50' :
              'border-gray-300 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    permissionStatus.camera === 'granted' ? 'bg-green-500' :
                    permissionStatus.camera === 'denied' ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}>
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Camera</h3>
                    <p className="text-xs text-gray-600">Required for selfie</p>
                  </div>
                </div>
                {permissionStatus.camera === 'granted' && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {permissionStatus.camera === 'denied' && (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>

            <div className={`border-2 rounded-xl p-4 transition-all ${
              permissionStatus.location === 'granted' ? 'border-green-500 bg-green-50' :
              permissionStatus.location === 'denied' ? 'border-red-500 bg-red-50' :
              'border-gray-300 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    permissionStatus.location === 'granted' ? 'bg-green-500' :
                    permissionStatus.location === 'denied' ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Location</h3>
                    <p className="text-xs text-gray-600">Required for address</p>
                  </div>
                </div>
                {permissionStatus.location === 'granted' && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {permissionStatus.location === 'denied' && (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>👆 Tip:</strong> When browser asks, click <strong>"Allow"</strong> to grant permissions.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRequestBothPermissions}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Settings className="w-5 h-5" />
              <span>{isLoading ? 'Requesting...' : 'Grant Permissions'}</span>
            </button>

            <button
              onClick={resetFlow}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>

          {(permissionStatus.camera === 'denied' || permissionStatus.location === 'denied') && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>⚠️ Permission Denied?</strong>
              </p>
              <p className="text-xs text-yellow-700 mb-2">
                Click the <strong>lock icon</strong> or <strong>info icon</strong> in your browser's address bar, then enable Camera and Location.
              </p>
              <button
                onClick={handleRequestBothPermissions}
                className="text-xs text-yellow-900 underline font-semibold"
              >
                Try Again
              </button>
              <br /><br /><br /><br />
              <br /><br /><br /><br />
              <br /><br /><br /><br />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial Screen
  if (step === 'initial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance</h1>
            <p className="text-gray-600">Mark your attendance with a selfie</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleStartAction('check_in')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg">Check In</span>
            </button>
            
            <button
              onClick={() => handleStartAction('check_out')}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <XCircle className="w-6 h-6" />
              <span className="text-lg">Check Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera Screen
  if (step === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6">
            <h2 className="text-white text-xl font-bold text-center">
              {actionType === 'check_in' ? 'Check In' : 'Check Out'}
            </h2>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-white text-sm mb-4 space-y-1">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{address}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-black p-6 flex justify-center space-x-4">
          <button
            onClick={resetFlow}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-all"
          >
            Cancel
          </button>
          <button
            onClick={capturePhoto}
            className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-full flex items-center space-x-2 transition-all shadow-lg"
          >
            <Camera className="w-5 h-5" />
            <span>Capture</span>
          </button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Preview Screen
  if (step === 'preview') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          <img
            src={capturedImage?.url}
            alt="Captured selfie"
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="bg-black p-6 flex justify-center space-x-4">
          <button
            onClick={handleRetake}
            disabled={isLoading}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50"
          >
            Retake
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full flex items-center space-x-2 transition-all shadow-lg disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isLoading ? 'Submitting...' : 'Confirm'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Success!</h2>
          <p className="text-gray-600 mb-2">
            {actionType === 'check_in' ? 'Check-in' : 'Check-out'} recorded successfully
          </p>
          <p className="text-sm text-gray-500">
            {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CheckInCheckoutSystem;