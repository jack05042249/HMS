const STAGE_API = process.env.REACT_APP_API_URL;

const config = {
    development: {
        API_URL: '/basic-api/basic-api',
    },
    production: {
        API_URL: STAGE_API ? STAGE_API: 'http://16.171.15.89:8000'
    },
};

export default config[process.env.NODE_ENV || 'development'];


