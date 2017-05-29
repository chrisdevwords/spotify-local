
function extractID(val) {

    const i = val.indexOf('://');
    let s = val;

    if (i > -1) {
        s = val.slice(i + 3, val.length);
    }

    let id = s.split(':').pop();

    if (id === s) {
        id = s.split('/').pop()
    }

    return id;
}

function processRequestError(req) {
    if (req instanceof Error && req.name !== 'StatusCodeError') {
        /* eslint-disable no-console */
        console.log('Error Processing Request');
        console.log(req.stack);
        console.log('---');
        /* eslint-enable no-console */
        throw req;
    }
    const { statusCode = 500, error } = req;
    const err = new Error(error.error.message);
    err.statusCode = statusCode || 500;
    throw err;
}

module.exports = {
    extractID,
    processRequestError
};
