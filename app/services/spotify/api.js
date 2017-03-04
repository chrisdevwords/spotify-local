
const request = require('request-promise-native');


const API_BASE = 'https://api.spotify.com/';
const TRACK_ENDPOINT = trackId => `${API_BASE}v1/tracks/${trackId}`;

function extractID(val) {

    const i = val.indexOf('://');
    let s = val;

    if (i > -1) {
        s = val.slice(i + 3, val.length);
    }

    let id = s.split(':').pop();

    if (id === s) {
        id = s.split('/').pop()
    }

    return id;
}

function findTrack(track) {

    const id = extractID(track);

    return request
        .get({
            // eslint-disable-next-line babel/new-cap
            uri: TRACK_ENDPOINT(id),
            json: true
        })
        .then(({ artists, name, uri, available_markets }) => {

            if (!available_markets.includes('US')) {
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
    findTrack,
    extractID
};
