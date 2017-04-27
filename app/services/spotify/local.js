
const PATH = require('path');
const appleScript = require('../../lib/apple-script')

const ROOT = '../../../';
const SCRIPT_NOW_PLAYING = PATH.resolve(
    __dirname, ROOT, 'apple-script/currentsong.scpt'
);
const SCRIPT_IS_SHUFFLING = PATH.resolve(
    __dirname, ROOT, 'apple-script/get-shuffling.scpt'
);
const SCRIPT_STATUS = 'tell application "Spotify" to return player state';
const SCRIPT_PAUSE = 'tell application "Spotify" to pause';
const SCRIPT_RESUME = 'tell application "Spotify" to play';
const SCRIPT_SHUFFLE_ON =
    'tell application "Spotify" to set shuffling to true';
const SCRIPT_SHUFFLE_OFF =
    'tell application "Spotify" to set shuffling to false';
const SCRIPT_NEXT = 'tell application "Spotify" to play next track';
const SCRIPT_PLAY = track =>
    `tell application "Spotify" to play track "${track}"`;
const SCRIPT_PLAYLIST = pl =>
    `tell application "Spotify" to play track "${pl}"`;
const URI_PLAYLIST = id => `spotify:user:spotify:playlist:${id}`;

const _defaultPlaylist = {
    uri: URI_PLAYLIST('37i9dQZF1DX0XUsuxWHRQd'),
    title: 'Default Playlist'
};

const _queue = [];

let _playlist = _defaultPlaylist;
let _currentTrack;
let _timer;
let _paused = false;

function delayCall(f, delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            f().then(resolve).catch(reject);
        }, delay)
    });
}

function getPaused() {
    return Promise.resolve({
        paused: _paused
    });
}

function getShuffle() {
    return appleScript
        .execFile(SCRIPT_IS_SHUFFLING)
        .then(answer => answer === 'true');
}

function toggleShuffle() {
    return getShuffle()
        .then((shuffling) => {
            let SCRIPT;
            if (shuffling) {
                SCRIPT = SCRIPT_SHUFFLE_OFF;
            } else {
                SCRIPT =  SCRIPT_SHUFFLE_ON;
            }
            return appleScript
                .execString(SCRIPT)
                .then(() => !shuffling)
        })
}

function setPlaylist(playlist) {
    return appleScript
        .execString(SCRIPT_PLAYLIST(playlist.uri))
        .then(() => {
            _playlist = playlist;
            return {
                message: 'Default playlist changed.',
                playlist
            }
        })
        .catch(err =>
            Promise.reject({
                statusCode: err.statusCode || 500,
                message: 'Local error setting playlist.',
                playlist
            })
        );
}

function getPlaylist() {
    return Promise.resolve({
        playlist: _playlist
    });
}

function nowPlaying() {
    return appleScript
        .execFile(SCRIPT_NOW_PLAYING)
        .then((data) => {
            const [uri, name, artist] = data.split('::');
            return {
                uri,
                name,
                artist
            };
        });
}


function pause() {
    _paused = true;
    return appleScript
        .execString(SCRIPT_PAUSE)
        .then(() => ({
            paused: _paused
        }));
}

function resume() {
    return appleScript
        .execString(SCRIPT_RESUME)
        .then(() => delayCall(nowPlaying, 500))
        .then(() => {
            _paused = false;
            return {
                paused: _paused
            };
        })
}


function playTrack(track) {
    return appleScript
        .execString(SCRIPT_PLAY(track.uri))
        .then(() => {
            _currentTrack = track;
            return track;
        });
}

function shufflePlaylist(playlist) {
    return appleScript
        .execString(SCRIPT_PLAYLIST(playlist.uri))
        .then(() => appleScript.execString(SCRIPT_SHUFFLE_ON))
        .then(() => {
            _playlist = playlist;
            // eslint-disable-next-line no-use-before-define
            return checkCurrentTrack();
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

function nextTrack() {


    if (_paused) {
        return resume().then(nextTrack)
    }

    const skippedTrack = _currentTrack;
    if (_queue.length) {
        return playTrack(_queue.shift())
            .then(() => delayCall(checkCurrentTrack, 500))
            .then(currentTrack => ({
                skippedTrack,
                currentTrack
            }));
    }
    return appleScript
        .execString(SCRIPT_NEXT)
        .then(() => delayCall(checkCurrentTrack, 500))
        .then((currentTrack) => {
            if (currentTrack.uri === skippedTrack.uri) {
                return shufflePlaylist(_playlist);
            }
            return currentTrack;
        })
        .then(currentTrack => ({
            skippedTrack,
            currentTrack
        }));
}

function queueTrack(track) {
    const position = _queue.push(track);
    return Promise.resolve({
        track,
        position
    });
}

function queueAlbum(album) {
    const position = _queue.length + 1;
    const { tracks } = album;
    tracks.forEach(track => _queue.push(track));
    return Promise.resolve({
        position,
        album
    });
}

function start() {
    clearTimeout(_timer);
    _timer = setTimeout(() => {
        if (_paused) {
            start();
            return false;
        }
        checkCurrentTrack()
            .then((/*currentTrack*/) => {
                start();
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.log('Playback error:', err);
            });
        return true;
    }, 300);
}

module.exports = {
    pause,
    resume,
    getPaused,
    nextTrack,
    queueTrack,
    queueAlbum,
    playTrack,
    setPlaylist,
    getPlaylist,
    start,
    nowPlaying,
    getQueue: () => Promise.resolve(_queue),
    currentTrack: () => Promise.resolve(_currentTrack),
    getShuffle,
    toggleShuffle
};
