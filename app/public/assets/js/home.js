
(function init() {

    let currentTrack;
    let requestedBy;
    let queuedTracks;

    function fetchPlaying() {
        return fetch('/api/spotify/playing')
            .then(resp => resp.json());
    }

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

    function fetchQueue() {
        return fetch('/api/spotify/queue')
            .then(resp => resp.json());
    }

    function update() {
        return Promise.all([
            fetchPlaying(),
            fetchQueue()
        ]).then(([{ track }, { tracks }]) => {
            displayNowPlaying(track);
            displayQueue(tracks);
            return true;
        });
    }

    function start() {
        setTimeout(() => {
            update()
                .then(start)
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.log(err);
                });
        }, 2000)
    }

    start();
}());
