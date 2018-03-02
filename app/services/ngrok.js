const ngrok = require('ngrok');
const lambda = require('./aws/lambda');

function connect(params) {
    return new Promise((resolve, reject) => {
        const cb = (err, url) => {
            if (err) {
                reject(err);
            } else {
                resolve(url)
            }
        };
        try {
            ngrok.connect(params, cb);
        } catch (err) {
            reject(err);
        }
    });
}


function openTunnel(port, lambdaNames, lambdaRegion = 'us-east-1') {
    return connect({ addr: port })
        .then((url) => {
            if (lambdaNames) {
                return lambda
                    .updateLambdaTunnel(lambdaNames, url, lambdaRegion)
                    .then(() => ({
                        lambdaNames,
                        url
                    }))
            }
            return { url };
        });
}

module.exports = {
    connect,
    openTunnel
};
