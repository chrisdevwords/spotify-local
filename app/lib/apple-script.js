const applescript = require('applescript');

function execString(script) {
    return new Promise((resolve, reject) => {
        const cb = (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        };
        try {
            applescript.execString(script, cb);
        } catch (err) {
            reject(err);
        }
    });
}

function execFile(file) {
    return new Promise((resolve, reject) => {
        const cb =  (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        };
        try {
            applescript.execFile(file, cb);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    execString,
    execFile
};
