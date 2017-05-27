const appleScript = require('../../lib/apple-script');
const spotifyLocal = require('../spotify/local');


let _speaking = false;

function say(text) {

    let currentVol;

    if (_speaking) {
        const error = new Error(
            'Someone else is talking. Wait your turn.'
        );
        error.statusCode = 429;
        throw error;
    }

    const duration = Math.floor((text.length / 15)) * 1000;

    _speaking = true;

    spotifyLocal
        .getVolume()
        .then(({ volume }) => {
            currentVol = volume;
            return spotifyLocal.setVolume(0)
        })
        .then(() => {
            setTimeout(() => {
                spotifyLocal.setVolume(currentVol);
                _speaking = false;
            }, duration);
            return appleScript
                .execString(`say "${text}"`);
        }).catch(() => {
            _speaking = false;
        });
    return Promise.resolve({ });
}

module.exports = {
    say
};
