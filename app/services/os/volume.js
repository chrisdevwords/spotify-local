const appleScript = require('../../lib/apple-script');


const INVALID_VOLUME = 'Volume must be a number between 0 and 100.';
const SET_VOLUME = level =>
    `set volume output volume ${level}`;
const GET_VOLUME = 'return output volume of (get volume settings)';

function getVolume() {

    return appleScript
        .execString(GET_VOLUME)
        .then(Number)
        .then(volume => ({ volume }))
}

function setVolume(volume) {
    if (isNaN(volume) || volume < 0 || volume > 100) {
        const error = new Error(INVALID_VOLUME);
        error.statusCode = 400;
        return Promise.reject(error);
    }
    return appleScript
        .execString(SET_VOLUME(volume))
        .then(getVolume)
}

module.exports = {
    getVolume,
    setVolume
};
