const PATH = require('path');
const appleScript = require('../../lib/apple-script');
const events = require('./events');
const spotifyUser = require('./api/user');
const spotifyPlaylist = require('./api/playlist');

const INVALID_VOLUME = 'Volume must be a number between 0 and 100.';
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
const SCRIPT_SET_VOLUME = vol =>
    `tell application "Spotify" to set sound volume to ${vol}`;
const SCRIPT_GET_VOLUME = PATH.resolve(
    __dirname, ROOT, 'apple-script/get-volume.scpt'
);
const SCRIPT_SHUFFLE_ON =
    'tell application "Spotify" to set shuffling to true';
const SCRIPT_SHUFFLE_OFF =
    'tell application "Spotify" to set shuffling to false';
const SCRIPT_NEXT = 'tell application "Spotify" to play next track';
const SCRIPT_PLAY = track =>
    `tell application "Spotify" to play track "${track}"`;
const SCRIPT_PLAYLIST = pl =>
    `tell application "Spotify" to play track "${pl}"`;

const _defaultPlaylist = {
    uri: 'spotify:user:spotify:playlist:37i9dQZF1DX0XUsuxWHRQd',
    title: 'Default Playlist'
};

const _queue = [];

let _playlist = _defaultPlaylist;
let _currentTrack;
let _timer;
let _socket;
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

function getVolume() {
    return appleScript
        .execFile(SCRIPT_GET_VOLUME)
        .then(volume => ({
            volume,
            message: `Volume is at ${volume}.`
        }));
}

function setVolume(volume) {
    if (isNaN(volume) || volume < 0 || volume > 100) {
        const error = new Error(INVALID_VOLUME);
        error.statusCode = 400;
        return Promise.reject(error);
    }
    return appleScript
        .execString(SCRIPT_SET_VOLUME(volume))
        .then(() => ({
            message: `Volume set to ${volume}.`,
            volume
        }));
}

function setPlaylist(playlist) {

    if (_paused) {
        return resume()
            .then(() => setPlaylist(playlist))
    }

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

function playTrack(track) {

    if (_paused) {
        return resume()
            .then(() => playTrack(track))
    }

    return appleScript
        .execString(SCRIPT_PLAY(track.uri))
        .then(() => {
            _currentTrack = track;
            _socket.emit(events.NOW_PLAYING, _currentTrack);
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
                _socket.emit(events.NOW_PLAYING, _currentTrack);
            } else if (_currentTrack.uri !== trackInfo.uri) {
                if (_queue.length) {
                    // tell spotify to play the next queued track
                    const track = _queue.shift();
                    _socket.emit(events.TRACKS_QUEUED, _queue);
                    return playTrack(track)
                        .then(nowPlaying)
                }
                // set the current track to what's current playing
                _currentTrack = Object.assign(
                    { requestedBy: _playlist.title },
                    trackInfo
                );
                _socket.emit(events.NOW_PLAYING, _currentTrack);
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
        const track = _queue.shift();
        _socket.emit(events.TRACKS_QUEUED, _queue);
        return playTrack(track)
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
    _socket.emit(events.TRACKS_QUEUED, _queue);
    return Promise.resolve({
        track,
        position
    });
}

function getQueuedTrack(index) {

    if (isNaN(index)) {
        return Promise.reject({
            message: 'Index must be a number.',
            statusCode: 400
        });
    }

    const track = _queue[index];
    if (track) {
        return Promise.resolve(track)
    }
    return Promise.reject({
        message: `No track at index: ${index}.`,
        statusCode: 404
    });
}

function deQueueTrack(index) {

    if (isNaN(index)) {
        return Promise.reject({
            message: 'Index must be a number.',
            statusCode: 400
        });
    }
    const track = _queue.splice(index, 1)[0];
    if (track) {
        _socket.emit(events.TRACKS_QUEUED, _queue);
        return Promise.resolve(track);
    }
    return Promise.reject({
        message: `No track at index: ${index}.`,
        statusCode: 404
    });
}

function clearQueue() {
    _socket.emit(events.TRACKS_QUEUED, []);
    return Promise.resolve(_queue.splice(0, _queue.length));
}

function queueAlbum(album) {
    const position = _queue.length + 1;
    const { tracks } = album;
    tracks.forEach(track => _queue.push(track));
    _socket.emit(events.TRACKS_QUEUED, _queue);
    return Promise.resolve({
        position,
        album
    });
}

function checkPlaylist() {
    spotifyUser
        .getCurrentPlaylist()
        .then((uri) => {
            if (uri && uri !== _playlist.uri) {
                return spotifyPlaylist
                    .findPlaylist(uri);
            }
            return null;
        })
        .then((newPlaylist) => {
            if (newPlaylist) {
                // eslint-disable-next-line no-console
                console.log('Playlist changed:', newPlaylist);
                _playlist = newPlaylist;
                _currentTrack.requestedBy = newPlaylist.title;
                _socket.emit(events.NOW_PLAYING, _currentTrack);
            }
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
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

function init(socket) {
    _socket = socket;
    start();
    setInterval(checkPlaylist, 60000);
}

module.exports = {
    pause,
    resume,
    getPaused,
    getVolume,
    setVolume,
    nextTrack,
    queueTrack,
    queueAlbum,
    playTrack,
    setPlaylist,
    getPlaylist,
    start,
    init,
    nowPlaying,
    getQueue: () => Promise.resolve(_queue.concat()),
    clearQueue,
    getQueuedTrack,
    deQueueTrack,
    currentTrack: () => Promise.resolve(_currentTrack),
    getShuffle,
    toggleShuffle
};
