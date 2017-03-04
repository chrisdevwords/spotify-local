

function extractID(val) {

    let i = val.indexOf('://');
    let s;

    if (i > -1) {
        s = val.slice(i + 3, val.length);
    } else {
        s = val;
    }

    let id = s.split(':').pop();

    if (id === s) {
        id = s.split('/').pop()
    }
    return id || val;
}

function findTrack(track) {
    return Promise.resolve({
        uri: track,
        title: track,
        artist: track
    });
}

module.exports = {
    findTrack,
    extractID
};
