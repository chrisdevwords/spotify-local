const appleScript = require('../../lib/apple-script');
const spotifyLocal = require('../spotify/local');


function say(text) {

    let currentVol;

    const duration = Math.floor((text.length / 15)) * 1000;

    return spotifyLocal
        .getVolume()
        .then(({ volume }) => {
            currentVol = volume;
            return spotifyLocal.setVolume(0)
        })
        .then(() => {
            setTimeout(() => {
                spotifyLocal.setVolume(currentVol);
            }, duration);
            return appleScript
                .execString(`say "${text}"`);
        });
}

module.exports = {
    say
};
