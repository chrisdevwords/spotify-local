const express = require('express');
const dotenv = require('dotenv');
const queue = require('./routes/api/spotify/queue');
const playing = require('./routes/api/spotify/playing');
const playlist = require('./routes/api/spotify/playlist');
const shuffle = require('./routes/api/spotify/shuffle');
const pause = require('./routes/api/spotify/pause');

const middleware = require('./middleware');
const errorManager = require('./middleware/error-manager');
const spotifyLocal = require('./services/spotify/local');
const ngrok = require('./services/ngrok');

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const {AWS_FUNCTION_NAME, AWS_REGION, TUNNEL} = process.env;

middleware.configure(app);

// routes
app.get('/', (req, res) => {
    const docLink = 'https://app.swaggerhub.com/api/' +
        'chrisdevwords/LocalSpotify/0.0.1';
    res.render('index', {
        docLink
    })
});
app.use('/api/spotify/queue', queue);
app.use('/api/spotify/playlist', playlist);
app.use('/api/spotify/playing', playing);
app.use('/api/spotify/shuffle', shuffle);
app.use('/api/spotify/pause', pause);

errorManager.configure(app);

const server = app.listen(PORT, () => {
    /* eslint-disable no-console */
    console.log(`Listening on http://${HOST}:${PORT}`);
    spotifyLocal.start();

    if (TUNNEL) {
        ngrok.openTunnel(PORT, AWS_FUNCTION_NAME, AWS_REGION)
            .then(({ url, lambdaName }) => {
                console.log('Server Public URL:', url);
                if (lambdaName) {
                    console.log('Lambda:', lambdaName, ' config updated.');
                }
            })
            .catch((err) => {
                console.log(err);
            });
        /* eslint-enable no-console */
    }
});

module.exports = server;
