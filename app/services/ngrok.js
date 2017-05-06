const ngrok = require('ngrok');
const { updateLambdaTunnel } = require('./aws/lambda');

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


function openTunnel(port, lambdaName, lambdaRegion = 'us-east-1') {
    return connect({ addr: port })
        .then((url) => {
            if (lambdaName) {
                return updateLambdaTunnel(lambdaName, url, lambdaRegion)
                    .then(() => ({
                        lambdaName,
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
