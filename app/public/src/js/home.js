// eslint-disable-next-line import/no-extraneous-dependencies
const io = require('socket.io-client');

let currentTrack;
let requestedBy;
let queuedTracks;

function displayNowPlaying(trackInfo) {
    currentTrack = currentTrack
        || document.getElementById('current-track');
    requestedBy = requestedBy
        || document.getElementById('requested-by');

    // eslint-disable-next-line quotes
    currentTrack.innerText = `${trackInfo.artist} - "${trackInfo.name}"`;
    requestedBy.innerText = `Requested by: ${trackInfo.requestedBy}`;
}

function displayQueue(tracks) {
    queuedTracks = queuedTracks ||
            document.getElementById('queued-tracks');

    let html;

    if (tracks.length) {
        // eslint-disable-next-line prefer-template
        html = '<ol>' +
                tracks.map(track =>
                    // eslint-disable-next-line prefer-template
                    '<li>' +
                        // eslint-disable-next-line quotes
                        `${track.artist} - "${track.name}"` +
                        `<br/> Requested by: ${track.requestedBy}` +
                    // eslint-disable-next-line prefer-template
                    '</li>'
                ).join('') +
            // eslint-disable-next-line prefer-template
            '</ol>';
    } else {
        html = '<p>No tracks are currently queued.</p>'
    }

    queuedTracks.innerHTML = html;
}

function connectSocket() {
    const socket = io(`http://${window.location.host}`);
    socket.on('now playing', (trackInfo) => {
        displayNowPlaying(trackInfo);
    });

    socket.on('tracks queued', (tracks) => {
        displayQueue(tracks)
    });
}

connectSocket();
