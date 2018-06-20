const request = require('request-promise-native');
const auth = require('./auth');
const { extractID, processRequestError } = require('./util');


const API_BASE = 'https://api.spotify.com/';
const TRACK_ENDPOINT = trackId => `${API_BASE}v1/tracks/${trackId}`;

function findTrack(track) {

    const id = extractID(track);
    const market = process.env.MARKET || 'US';
    return auth.getToken()
        .then(token => request.get({
            uri: TRACK_ENDPOINT(id),
            json: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }))
        .catch(processRequestError)
        .then(({ artists, name, uri, markets }) => {
            // eslint-disable-next-line camelcase
            if (markets && !markets.includes(market)) {
                const error = new Error('Track is not playable in US.');
                error.statusCode = 405;
                throw error;
            }

            const artist = artists
                .map(a => a.name)
                .join(', ');

            return {
                uri,
                name,
                artist
            };
        });
}

module.exports = {
    findTrack
};
