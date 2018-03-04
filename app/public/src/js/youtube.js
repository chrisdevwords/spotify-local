// eslint-disable-next-line import/no-extraneous-dependencies
const io = require('socket.io-client');

let YT;
let player;
const tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    ({ YT } = window);
    player = new YT.Player('yt-player', {
        enablejsapi: 1,
        width: '100%',
        height: '100%',
        autoplay: true,
        events: {
            onReady: window.onPlayerReady,
            onStateChange: window.onPlayerStateChange
        }
    });
    window.ytPlayer = player;
}


function playVideo(id, position) {
    player.loadPlaylist(id)
    if (position) {
        setTimeout(() => { player.seekTo(position + 1) }, 1000);
    }
}

function playPlaylist(playlist, position) {
    player.loadPlaylist(playlist);
    if (position) {
        setTimeout(() => { player.seekTo(position + 1) }, 1000);
    }
}

function onPlayerReady() {

    const socket = io(`http://${window.location.host}/youtube`);

    socket.on('now playing', (evt) => {
        // console.log(evt);
        const { video, playlist, position } = evt;
        if (video) {
            playVideo(video, position)
        } else if (playlist) {
            playPlaylist(playlist, position)
        }
        player.setLoop(true);
        player.mute();
        switch (player.getPlayerState()) {
            case YT.PlayerState.ENDED:
            case YT.PlayerState.UNSTARTED:
                player.playVideo();
                break;
            default:
                break;
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // console.log('Video ended.')
    }
}

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
window.onPlayerReady = onPlayerReady;
window.onPlayerStateChange = onPlayerStateChange;
