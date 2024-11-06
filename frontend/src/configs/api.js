import axios from 'axios';

// const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const REACT_APP_API_URL = "http://localhost:9000"

console.log('REACT_APP_API_URL', REACT_APP_API_URL);

if (!REACT_APP_API_URL) {
    throw new Error('REACT_APP_API_URL is not defined');
}

const api = axios.create({
    baseURL: REACT_APP_API_URL,
});

export default api;