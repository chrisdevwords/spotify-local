
const PATH = require('path');
const applescript = require('applescript');


const ROOT = '../../../';
const SCRIPT_NOW_PLAYING = PATH.resolve(
    __dirname, ROOT, 'apple-script/currentsong.scpt'
);
const SCRIPT_STATUS = 'tell application "Spotify" to return player state';
const SCRIPT_PAUSE = 'tell application "Spotify" to pause';
const SCRIPT_RESUME = 'tell application "Spotify" to play';
const SCRIPT_PLAY = track =>
    `tell application "Spotify" to play track "${track}"`;
const SCRIPT_PLAYLIST = pl =>
    `tell application "Spotify" to play track "${pl}"`;
const URI_PLAYLIST = id => `spotify:user:spotify_uk_:playlist:${id}`;

const _defaultPlaylist = {
    // eslint-disable-next-line babel/new-cap
    uri: URI_PLAYLIST('2HSnhAB2ugTyXcWteTOOKy'),
    title: 'Default Playlist'
};
const _queue = [];
let _playlist = _defaultPlaylist;
let _currentTrack;
let _timer;

function execString(script) {
    return new Promise((resolve, reject) => {
        const cb = (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        };
        try {
            applescript.execString(script, cb);
        } catch (err) {
            reject(err);
        }
    });
}

function execFile(file) {
    return new Promise((resolve, reject) => {
        const cb =  (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        };
        try {
            applescript.execFile(file, cb);
        } catch (err) {
            reject(err);
        }
    });
}

function nowPlaying() {
    return execFile(SCRIPT_NOW_PLAYING)
        .then((data) => {
            const [uri, name, artist] = data.split('::');
            return {
                uri,
                name,
                artist
            };
        });
}

function playTrack(track) {
    // eslint-disable-next-line babel/new-cap
    return execString(SCRIPT_PLAY(track.uri))
        .then(() => {
            _currentTrack = track;
            return track;
        });
}

function shufflePlaylist(playlist) {
    // eslint-disable-next-line babel/new-cap
    return execString(SCRIPT_PLAYLIST(playlist.uri))
       .then(() => {
           _playlist = playlist;
           return nowPlaying();
       });
}

function checkCurrentTrack() {
    return nowPlaying()
        .then((trackInfo) => {
            if (!trackInfo.uri) {
                return shufflePlaylist(_playlist)
                    .then(nowPlaying);
            }
            if (!_currentTrack) {
                _currentTrack = Object.assign(
                    { requestedBy: _playlist.title },
                    trackInfo
                );
            } else if (_currentTrack.uri !== trackInfo.uri) {
                if (_queue.length) {
                    // tell spotify to play the next queued track
                    return playTrack(_queue.shift())
                        .then(nowPlaying)
                }
                // set the current track to what's current playing
                _currentTrack = Object.assign(
                    { requestedBy: _playlist.title },
                    trackInfo
                );
            }
            return _currentTrack;
        });
}

function queueTrack(track) {
    const position = _queue.push(track);
    return Promise.resolve({
        track,
        position
    });
}

function start() {
    clearTimeout(_timer);
    _timer = setTimeout(() => {
        checkCurrentTrack()
            .then((/*currentTrack*/) => {
                start();
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.log('Playback error:', err);
            });
    }, 250);
}

module.exports = {
    queueTrack,
    playTrack,
    start,
    nowPlaying,
    getQueue: () => Promise.resolve(_queue),
    currentTrack: () => Promise.resolve(_currentTrack)
};
