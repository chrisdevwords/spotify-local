const express = require('express');
const dotenv = require('dotenv');
const queue = require('./routes/api/spotify/queue');
const playing = require('./routes/api/spotify/playing');
const playlist = require('./routes/api/spotify/playlist');
const shuffle = require('./routes/api/spotify/shuffle');
const pause = require('./routes/api/spotify/pause');
const spotifyVolume = require('./routes/api/spotify/volume');
const osVolume = require('./routes/api/os/volume');
const speech = require('./routes/api/os/speech');

const middleware = require('./middleware');
const errorManager = require('./middleware/error-manager');
const spotifyLocal = require('./services/spotify/local');
const spotifyApi = require('./services/spotify/api');
const ngrok = require('./services/ngrok');

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const {
    AWS_FUNCTION_NAME,
    AWS_REGION,
    TUNNEL,
    DEFAULT_PLAYLIST
} = process.env;

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
app.use('/api/spotify/volume', spotifyVolume);
app.use('/api/spotify/pause', pause);
app.use('/api/os/speech', speech);
app.use('/api/os/volume', osVolume);

errorManager.configure(app);

const server = app.listen(PORT, () => {
    /* eslint-disable no-console */
    console.log(`Listening on http://${HOST}:${PORT}`);

    if (DEFAULT_PLAYLIST) {
        spotifyApi.findPlaylist(DEFAULT_PLAYLIST)
            .then(spotifyLocal.setPlaylist)
            .then(() => {
                spotifyLocal.start();
            })
            .catch((err) => {
                console.log('Error getting playlist', err);
            });
    } else {
        spotifyLocal.start();
    }

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
