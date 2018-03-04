const url = require('url');

const DEFAULT_PL = 'https://www.youtube.com/watch?v=eyU3bRy2x44';
const NOW_PLAYING = 'now playing';

let _nowPlaying = {playlist: null, video: null, position: 0};
let _socket;

function parseVideo(link) {

    let video;
    const position = link.query.t || 0;

    if (link.query.v) {
        video = link.query.v;
    } else if (link.host.includes('youtu.be')) {
        video = link.path.split('/').pop()
    }

    return [video, position];
}

function parsePlaylist(link) {
    // extract id and type,
    if (link.query.list) {
        return {list: link.query.list, type: 'playlist', index: 0}
    }
    return null;
}

function parseSearchQuery(text) {
    return {list: text, listType: 'search', index: 0}
}

function play(text) {

    let playlist;

    let video;
    let position = 0;

    const link = url.parse(text, true, true);

    // todo verify against youtube data api

    if (link.protocol) {
        playlist = parsePlaylist(link);
        [video, position] = parseVideo(link);
    } else {
        playlist = parseSearchQuery(text)
    }

    if (playlist || video) {
        _nowPlaying = {
            video,
            position,
            playlist,
            // todo fetch title and link from youtube api
            title: text,
            link: link.protocol ? link.href : null
        };
        _socket.emit(NOW_PLAYING, _nowPlaying);
        return Promise.resolve(_nowPlaying);
    }

    throw Object.assign(Error(`"${text}" is not a valid Youtube link.`));
}

function getPlaying() {
    return Promise.resolve(_nowPlaying)
}

function init(io, defaultPlaylist = DEFAULT_PL) {
    _socket = io;
    play(defaultPlaylist);
}

module.exports = {
    play,
    getPlaying,
    init,
    NOW_PLAYING
};
