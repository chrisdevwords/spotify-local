
const request = require('request-promise-native');

const TOKEN_ERROR = 'Error getting Spotify Token';

const API_BASE = 'https://api.spotify.com/';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const TRACK_ENDPOINT = trackId => `${API_BASE}v1/tracks/${trackId}`;
const PLAYLIST_ENDPOINT = (userId, playlistId) =>
    `${API_BASE}v1/users/${userId}/playlists/${playlistId}`;

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

function parsePlaylist(val) {
    let path;
    if (val.indexOf('http') > -1) {
        path = val.substr(
            val.indexOf('://') + 3,
            val.length
        ).split('/');
    } else {
        path = val.split(':');
    }
    return {
        userId: path[2],
        playlistId: path[4]
    }
}

function getToken() {

    const { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } = process.env;
    const creds = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_SECRET}`;
    const encoded = new Buffer(creds).toString('base64');

    return request
        .post({
            uri: TOKEN_ENDPOINT,
            headers: {
                Authorization: `Basic ${encoded}`,
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        })
        .then(resp =>
            JSON.parse(resp).access_token
        )
        .catch(({ statusCode=500 }) => {
            const err = new Error(TOKEN_ERROR);
            err.statusCode = statusCode;
            throw err;
        });
}

function findPlaylist(playlist) {

    const { userId, playlistId } = parsePlaylist(playlist);
    return getToken()
        .then(token =>
            request.get({
                // eslint-disable-next-line babel/new-cap
                uri: PLAYLIST_ENDPOINT(userId, playlistId),
                json: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        )
        .then(({ uri, name }) =>
            ({
                title: name,
                uri
            })
        );
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
    getToken,
    findTrack,
    findPlaylist,
    parsePlaylist,
    extractID,
    TOKEN_ERROR
};
