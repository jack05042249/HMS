import axios from 'axios';

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;