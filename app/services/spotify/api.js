

function findTrack(track) {
    return Promise.resolve({
        uri: track,
        title: track,
        artist: track
    });
}

module.exports = {
    findTrack
};
