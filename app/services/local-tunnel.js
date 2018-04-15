const localTunnel = require('localtunnel');
const lambda = require('./aws/lambda');

function connect(port) {
    return new Promise((resolve, reject) => {
        try {
            localTunnel(port, (err, tunnel) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tunnel.url)
                }
            })
        } catch (err) {
            reject(err);
        }
    });
}


function openTunnel(port, lambdaNames, lambdaRegion = 'us-east-1') {
    return connect(port)
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
