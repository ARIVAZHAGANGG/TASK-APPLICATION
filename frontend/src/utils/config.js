const getEnv = (key, defaultValue) => {
    let value = process.env[key];
    
    // Check if value exists and strip accidental 'KEY=' prefix
    if (value && value.startsWith(`${key}=`)) {
        value = value.substring(key.length + 1);
    }

    if (!value || value.includes('YOUR_') || value.includes('PLACEHOLDER')) {
        return defaultValue;
    }
    return value;
};

// Clean the API URL
const rawApiUrl = getEnv('REACT_APP_API_URL', 'http://localhost:5005/api');

// Extract the base domain/host for Socket.io (no /api prefix)
const getBaseUrl = (url) => {
    try {
        const parsed = new URL(url);
        // If the user provided something like https://host.com/api/auth/login
        // we want to strip everything after the host unless they explicitly want a subpath
        // For this app, we assume the backend is at /api
        return `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
        // Fallback for relative paths or invalid URLs
        return url.split('/api')[0];
    }
};

export const SOCKET_URL = getBaseUrl(rawApiUrl);
export const BASE_API_URL = `${SOCKET_URL}/api`;

export const GOOGLE_CLIENT_ID = getEnv(
    'REACT_APP_GOOGLE_CLIENT_ID', 
    '1081329535093-4lbrbt4o3v2r51he2tkv7tspbk2qmtf9.apps.googleusercontent.com'
);

console.log('🌐 API Configuration:', {
    SOCKET_URL,
    BASE_API_URL,
    GOOGLE_CLIENT_ID_SET: !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE'
});
