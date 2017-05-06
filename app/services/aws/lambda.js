
const AWS = require('aws-sdk');


const lambda = new AWS.Lambda({ region :'us-east-1' });

function updateLambdaConfig(functionName, config) {
    const params = Object.assign(
        { FunctionName: functionName },
        config
    );
    return new Promise((resolve, reject) => {
        const cb = (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        };

        try {
            lambda.updateFunctionConfiguration(params, cb);
        } catch (err) {
            reject(err);
        }
    });
}

function getLambdaConfig(functionName) {
    return new Promise((resolve, reject) => {
        const cb = (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        };
        try {
            const params = {
                FunctionName: functionName
            };
            lambda.getFunctionConfiguration(params, cb);
        } catch (err) {
            reject(err);
        }
    });


}

function updateLambdaTunnel(functionName, ngrokTunnel) {

    return getLambdaConfig(functionName)
        .then(({Environment}) => {
            const {Variables} = Environment;
            const updatedVars = Object.assign(
                {},
                Variables,
                { SPOTIFY_LOCAL_URL: ngrokTunnel }
            );
            return updateLambdaConfig(functionName, {
                Environment: Object.assign(
                    {},
                    Environment,
                    {Variables: updatedVars}
                )
            })
        });
}

module.exports = {
    updateLambdaTunnel
};
