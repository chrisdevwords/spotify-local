const request = require('request-promise-native');
const auth = require('./auth');
const { processRequestError } = require('./util');


const API_BASE = 'https://api.spotify.com/';

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

const PLAYLIST_ENDPOINT = (userId, playlistId) =>
    `${API_BASE}v1/users/${userId}/playlists/${playlistId}`;


function findPlaylist(playlist) {
    const { userId, playlistId } = parsePlaylist(playlist);
    return auth.getToken()
        .then(token => request.get({
            uri: PLAYLIST_ENDPOINT(userId, playlistId),
            json: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }))
        .catch(processRequestError)
        .then(({ uri, name }) =>
            ({
                title: name,
                uri
            })
        );
}

module.exports = {
    findPlaylist,
    parsePlaylist
};
