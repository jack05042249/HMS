const { merge } = require('lodash');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const env = process.env.NODE_ENV || 'development';

console.log('Reading config env: ', env);
const resolveConfigFile = env => {
    const path = resolve(`${__dirname}/config.${env}.json`);
    if (!existsSync(path)) {
        throw new Error(`Config file ${path} does not exist`);
    }
    const raw = readFileSync(path);
    try {
        return JSON.parse(raw);
    }
    catch (err) {
        throw new Error(`Could not deserialize ${path}`);
    }
};
const config = {};
merge(config, resolveConfigFile('default'));
merge(config, resolveConfigFile(env));

module.exports = { config }
