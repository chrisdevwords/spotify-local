const socketIO = require('socket.io');
const spotify = require('./services/spotify/local');
const { NOW_PLAYING, TRACKS_QUEUED } = require('./services/spotify/events');

let _io;

function create(server) {
    _io = socketIO(server);
    _io.on('connection', (socket) => {
        // eslint-disable-next-line no-console
        spotify
            .currentTrack()
            .then((currentTrack) => {
                socket.emit(NOW_PLAYING, currentTrack);
                return spotify.getQueue()
            })
            .then((queue) => {
                socket.emit(TRACKS_QUEUED, queue)
            });
    });
    return _io
}

function getIO() {
    return _io;
}

module.exports = {
    getIO,
    create
};
