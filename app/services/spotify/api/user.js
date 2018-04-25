const request = require('request-promise-native');
const {processRequestError} = require('./util');
const auth = require('./auth');

const API_BASE = 'https://api.spotify.com/v1/me';


function getNowPlaying() {

    const token = auth.getAccessToken();
    if (!token) {
        return Promise.resolve({});
    }
    return request
        .get({
            uri: `${API_BASE}/player/currently-playing`,
            json: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .catch(processRequestError)
}

function getCurrentPlaylist() {
    return getNowPlaying()
        .then(({context}) => {
            if (context && context.type === 'playlist') {
                return context.uri;
            }
            return null;
        })
}

module.exports = {
    getNowPlaying,
    getCurrentPlaylist
};
