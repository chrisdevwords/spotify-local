const request = require('request-promise-native');
const lambdaService = require('../../aws/lambda');

const TOKEN_ERROR = 'Error getting Spotify Token';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

let _accessToken;
let _refreshToken;
let _refreshTimeout;

function generateClientCreds() {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } = process.env;
    const creds = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_SECRET}`;
    return new Buffer(creds).toString('base64');
}


function updateLambdaAccessToken() {
    const { AWS_FUNCTION_NAME, AWS_REGION } = process.env;
    if (!AWS_FUNCTION_NAME) {
        return Promise.resolve([]);
    }
    return lambdaService.updateLambdaEnvVars(
        AWS_FUNCTION_NAME,
        {
            SPOTIFY_USER_ACCESS_TOKEN: _accessToken,
        },
        AWS_REGION
    ).then((resp) => {
        /* eslint-disable no-console */
        const lambdaNames = resp.map(funcConfig => funcConfig.FunctionName);
        console.log('Lambda Access Token updated for lambdas:', lambdaNames);
        /* eslint-enable no-console */
        return resp
    });
}

function getToken() {

    const clientCreds = generateClientCreds();

    return request
        .post({
            uri: TOKEN_ENDPOINT,
            headers: {
                Authorization: `Basic ${clientCreds}`,
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        })
        .then(resp =>
            JSON.parse(resp).access_token
        )
        .catch(({ statusCode = 500 }) => {
            const err = new Error(TOKEN_ERROR);
            err.statusCode = statusCode;
            throw err;
        });
}

function refreshAccessToken() {
    clearTimeout(_refreshTimeout);

    const clientCreds = generateClientCreds();
    let refreshInterval;
    /* eslint-disable no-console */
    console.log('Refreshing access token...');
    /* eslint-enable no-console */
    request
        .post({
            uri: TOKEN_ENDPOINT,
            headers: {
                Authorization: `Basic ${clientCreds}`,
                'content-type': 'application/x-www-form-urlencoded'
            },
            form: {
                grant_type: 'refresh_token',
                refresh_token: _refreshToken
            },
            json: true
        })
        .then((resp) => {
            _accessToken = resp.access_token;
            _refreshToken = resp.refresh_token || _refreshToken;
            refreshInterval = resp.expires_in * 1000 * 0.75;
            /* eslint-disable no-console */
            console.log('Spotify access token refreshed...');
            console.log(_accessToken);
            console.log('-');
            /* eslint-enable no-console */
            return updateLambdaAccessToken();
        })
        .then(() => {
            _refreshTimeout = setTimeout(refreshAccessToken, refreshInterval);
            return true;
        })
        .catch((errResp) => {
            _refreshToken = null;
            _accessToken = null;
            /* eslint-disable no-console */
            console.log('Error refreshing access token...');
            console.log(errResp.options);
            console.log(errResp.statusCode, errResp.error);
            console.log('-');
            /* eslint-enable no-console */
        });
}

function createAccessToken(code) {
    clearTimeout(_refreshTimeout);

    const clientCreds = generateClientCreds();
    const { PORT = 5000 }  = process.env;
    const redirectUri =  `http://localhost:${PORT}/login/callback`;
    let refreshInterval;
    return request
        .post({
            url: TOKEN_ENDPOINT,
            headers: {
                Authorization: `Basic ${clientCreds}`,
            },
            form: {
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code
            },
            json: true
        })
        .then((resp) => {
            _accessToken = resp.access_token;
            _refreshToken = resp.refresh_token;
            refreshInterval = resp.expires_in * 1000 * 0.75;
            /* eslint-disable no-console */
            console.log('Spotify access token created...');
            console.log(_accessToken);
            console.log('-');
            /* eslint-enable no-console */
            return updateLambdaAccessToken();
        })
        .then(() => {
            _refreshTimeout = setTimeout(refreshAccessToken, refreshInterval);
            return true;
        })
}

module.exports = {
    getToken,
    getAccessToken:() => _accessToken,
    createAccessToken,
    TOKEN_ERROR
};
