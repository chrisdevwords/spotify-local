const request = require('request-promise-native');
const auth = require('./auth');
const { extractID, processRequestError } = require('./util');


const API_BASE = 'https://api.spotify.com/';
const ALBUM_ENDPOINT = id => `${API_BASE}v1/albums/${id}`;

function findAlbum(link) {
    const id = extractID(link);
    return auth.getToken()
        .then(token => request.get({
            uri: ALBUM_ENDPOINT(id),
            json: true,
            headers: {
                Authorization: `Bearer ${token}`
            }
        }))
        .catch(processRequestError)
        .then(({ tracks, name, artists }) => {

            const albumArtist = artists
                .map(a => a.name)
                .join(', ');

            const parsedTracks = tracks.items
                .filter(track =>
                    track.available_markets.includes('US')
                )
                .map((track) => {
                    const artist = track.artists
                        .map(a => a.name)
                        .join(', ');

                    return {
                        uri: track.uri,
                        name: track.name,
                        artist
                    };
                });

            return {
                name,
                artist: albumArtist,
                tracks: parsedTracks
            }
        });
}

module.exports = {
    findAlbum
};
