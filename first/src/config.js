const STAGE_API = process.env.REACT_APP_API_URL;

const config = {
    development: {
        API_URL: 'http://172.105.92.67:8000/',
    },
    production: {
        API_URL: STAGE_API ? STAGE_API: 'http://16.171.15.89:8000'
    },
};

export default config[process.env.NODE_ENV || 'development'];


