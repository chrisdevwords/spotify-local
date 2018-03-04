const socketIO = require('socket.io');
const spotify = require('./services/spotify/local');
const slackTube = require('./services/slack-tube');
const { NOW_PLAYING, TRACKS_QUEUED } = require('./services/spotify/events');

let _io;
let _spotify;
let _youtube;

function create(server) {
    _io = socketIO(server);
    _spotify = _io.of('/spotify');
    _spotify.on('connection', (socket) => {
        // eslint-disable-next-line no-console
        spotify
            .currentTrack()
            .then((currentTrack) => {
                socket.emit(NOW_PLAYING, currentTrack);
                return spotify.getQueue();
            })
            .then((queue) => {
                socket.emit(TRACKS_QUEUED, queue);
            });
    });
    _youtube = _io.of('/youtube');
    _youtube.on('connection', (socket) => {
        slackTube
            .getPlaying()
            .then((playing) => {
                socket.emit(slackTube.NOW_PLAYING, playing);
            });
    });
    return { io: _io, spotify: _spotify, youtube: _youtube }
}

function getIO() {
    return _io;
}

module.exports = {
    getIO,
    create
};
