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
        playlistId: path[path.length - 1]
    }
}

const PLAYLIST_ENDPOINT = playlistId =>
    `${API_BASE}v1/playlists/${playlistId}`;


function findPlaylist(playlist) {
    const { playlistId } = parsePlaylist(playlist);
    return auth.getToken()
        .then(token => request.get({
            uri: PLAYLIST_ENDPOINT(playlistId),
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
