
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
const _defaultPlaylist = 'spotify:user:spotify_uk_:playlist:2HSnhAB2ugTyXcWteTOOKy';
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
        applescript.execString(script, cb);
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
        applescript.execFile(file, cb);
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
        })
        .then((currentTrack) => {
            start();
            //console.log('currentTrack', currentTrack);
            return currentTrack;
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
    return execString(SCRIPT_PLAYLIST(playlist))
       .then((data) => {
           // console.log('shuffling playlist', data);
           _playlist = playlist;
           // todo if this works, return the current playing track
           return data;
       });
}

function checkCurrentTrack() {
    nowPlaying()
        .then((trackInfo) => {
            if (!trackInfo.uri) {
                //console.log('need to play playlist', trackInfo);
                return shufflePlaylist(_playlist)
                    .then(nowPlaying); // todo should run on a timeout
            }
            if (!_currentTrack) {
                _currentTrack = Object.assign({
                    requestedBy: 'Default Playlist',
                    trackInfo
                });
            } else if (_currentTrack.uri !== trackInfo.uri) {
                if (_queue.length) {
                    // tell spotify to play the next queued track
                    return playTrack(_queue.shift())
                }
                // set the current track to what's current playing
                _currentTrack = Object.assign({
                    requestedBy: 'Default Playlist',
                    trackInfo
                });
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
    clearInterval(_timer);
    _timer = setTimeout(checkCurrentTrack, 250);
}

module.exports = {
    queueTrack,
    playTrack,
    start,
    nowPlaying,
    getQueue: () => Promise.resolve(_queue),
    currentTrack: () => Promise.resolve(_currentTrack)
};
