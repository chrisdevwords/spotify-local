const appleScript = require('../../lib/apple-script');


function say(text) {
    return appleScript
        .execString(`say "${text}"`);
}

module.exports = {
    say
};
