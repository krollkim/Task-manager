import React from 'react';
import { useAuth } from './AuthContext';

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      console.log('Client ID from env:', clientId);
      
      if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        throw new Error('Google Client ID not configured properly');
      }

      // Simple OAuth popup approach - use current origin
      const currentOrigin = window.location.origin;
      const redirectUri = encodeURIComponent(`${currentOrigin}/auth-callback.html`);
      const scope = encodeURIComponent('openid email profile');
      const responseType = 'token id_token';
      const state = Math.random().toString(36).substring(7);
      const nonce = Math.random().toString(36).substring(7);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=${responseType}&` +
        `state=${state}&` +
        `nonce=${nonce}`;

      console.log('Opening OAuth URL:', authUrl);

      // Open popup
      const popup = window.open(
        authUrl,
        'google-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked by browser. Please allow popups for this site.');
      }

      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }
        
        // Ignore MetaMask messages
        if (event.data && event.data.target === 'metamask-inpage') {
          return;
        }
        
        // Ignore React DevTools messages
        if (event.data && event.data.source === 'react-devtools-content-script') {
          return;
        }
        
        // Only log OAuth-related messages
        if (event.data && (event.data.type === 'GOOGLE_AUTH_SUCCESS' || event.data.type === 'GOOGLE_AUTH_ERROR')) {
          console.log('OAuth message received:', event.data.type);
        }
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          console.log('Google auth success:', event.data);
          window.removeEventListener('message', messageListener);
          
          try {
            popup.close();
          } catch (e) {
            // Ignore cross-origin errors when closing
          }
          
          // Process the token
          loginWithGoogle(event.data.token).then(() => {
            onSuccess?.();
          }).catch((error) => {
            onError?.(error);
          });
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.error('Google auth error:', event.data.error);
          window.removeEventListener('message', messageListener);
          
          try {
            popup.close();
          } catch (e) {
            // Ignore cross-origin errors when closing
          }
          
          onError?.(new Error(event.data.error));
        } else {
          console.log('Unknown message type:', event.data.type);
        }
      };

      window.addEventListener('message', messageListener);

      // Add timeout to detect if OAuth flow is taking too long
      const timeout = setTimeout(() => {
        console.log('OAuth timeout - checking if popup is still open');
        try {
          if (popup && !popup.closed) {
            console.log('Popup is still open after timeout - user might still be on Google login page');
          }
        } catch (e) {
          console.log('Could not check popup status due to cross-origin policy');
        }
      }, 30000); // 30 seconds timeout

      // Fallback: check if popup is closed without success
      const checkClosed = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkClosed);
            clearTimeout(timeout);
            window.removeEventListener('message', messageListener);
            console.log('Popup closed by user');
            onError?.(new Error('Authentication was cancelled'));
          }
        } catch (error) {
          // Cross-origin error - popup might be on Google's domain
          // This is expected and we'll rely on the message listener
          // Silently ignore these errors to avoid console spam
        }
      }, 2000); // Increased interval to reduce cross-origin errors

      console.log('Google OAuth popup opened');
      
    } catch (error) {
      console.error('Google login error:', error);
      onError?.(error);
    }
  };

  const handleGoogleButtonClick = () => {
    handleGoogleLogin();
  };

  // Debug info - remove this in production
  const debugInfo = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    console.log('=== Google OAuth Debug Info ===');
    console.log('Client ID configured:', !!clientId);
    console.log('Client ID value:', clientId);
    console.log('Current origin:', window.location.origin);
    console.log('Redirect URI:', 'http://localhost:3000/auth-callback.html');
    console.log('==============================');
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleButtonClick}
        className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-3"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
      
      {/* Debug button - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={debugInfo}
          className="mt-2 text-xs text-gray-500 underline"
          type="button"
        >
          Debug OAuth Config
        </button>
      )}
    </div>
  );
};

export default GoogleLogin; 