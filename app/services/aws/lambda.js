const AWS = require('aws-sdk');


function updateLambdaConfig(lambda, functionName, config) {
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

function getLambdaConfig(lambda, functionName) {
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

function updateLambdaFunction(functionName, envVars, region = 'us-east-1') {
    const {
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY
    } = process.env;

    const lambdaClient = new AWS.Lambda({
        region,
        accessKeyId:AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    });

    return getLambdaConfig(lambdaClient, functionName)
        .then(({ Environment = {} }) => {
            const { Variables = {} } = Environment;
            const updatedVars = Object.assign(
                {},
                Variables,
                envVars
            );
            return updateLambdaConfig(lambdaClient, functionName, {
                Environment: Object.assign(
                    {},
                    Environment,
                    {Variables: updatedVars}
                )
            })
        });
}

const updateLambdaEnvVars = (funcNames, envVars, region = 'us-east-1') =>
    Promise.all(
        funcNames.split(',').map(functionName =>
            updateLambdaFunction(functionName, envVars, region)
        )
    );

const updateLambdaTunnel = (funcNames, ngrokUrl, region = 'us-east-1') =>
    updateLambdaEnvVars(
        funcNames,
        { SPOTIFY_LOCAL_URL: ngrokUrl },
        region
    );

module.exports = {
    updateLambdaEnvVars,
    updateLambdaTunnel
};
