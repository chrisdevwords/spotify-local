const http = require('http');
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
const login = require('./routes/auth/login');
const tube = require('./routes/api/slacktube');

const middleware = require('./middleware');
const errorManager = require('./middleware/error-manager');
const spotifyLocal = require('./services/spotify/local');
const spotifyPlaylist = require('./services/spotify/api/playlist');
const slackTube = require('./services/slack-tube');
const ngrok = require('./services/ngrok');
const localTunnel = require('./services/local-tunnel');
const authService = require('./services/spotify/api/auth');
const sockets = require('./sockets');

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const {
    AWS_FUNCTION_NAME,
    AWS_REGION,
    TUNNEL,
    USE_LOCAL_TUNNEL,
    DEFAULT_PLAYLIST,
    DEFAULT_YOUTUBE
} = process.env;

middleware.configure(app);

// routes
app.get('/', (req, res) => {
    const accessToken = authService.getAccessToken();
    const docLink = 'https://app.swaggerhub.com/api/' +
                    'chrisdevwords/LocalSpotify/0.0.1';
    res.render('index', {
        docLink,
        accessToken
    });
});

app.use('/login', login);
app.use('/api/spotify/queue', queue);
app.use('/api/spotify/playlist', playlist);
app.use('/api/spotify/playing', playing);
app.use('/api/spotify/shuffle', shuffle);
app.use('/api/spotify/pause', pause);
app.use('/api/spotify/volume', spotifyVolume);
app.use('/api/os/speech', speech);
app.use('/api/os/volume', osVolume);
app.use('/api/tube', tube);

errorManager.configure(app);

const server = http.createServer(app);
const io = sockets.create(server);

server.listen(PORT, () => {
    /* eslint-disable no-console */
    console.log(`Listening on http://${HOST}:${PORT}`);

    if (DEFAULT_PLAYLIST) {
        spotifyPlaylist.findPlaylist(DEFAULT_PLAYLIST)
            .then(spotifyLocal.setPlaylist)
            .then(() => {
                spotifyLocal.init(io.spotify);
            })
            .catch((err) => {
                console.log('Error getting playlist', err);
            });
    } else {
        spotifyLocal.init(io.spotify);
    }

    slackTube.init(io.youtube, DEFAULT_YOUTUBE);

    if (TUNNEL) {
        const tunnel = USE_LOCAL_TUNNEL ? localTunnel : ngrok;
        tunnel.openTunnel(PORT, AWS_FUNCTION_NAME, AWS_REGION)
            .then(({ url, lambdaNames }) => {
                console.log('Server Public URL:', url);
                if (lambdaNames) {
                    console.log('Lambdas:', lambdaNames, ' config updated.');
                }
            })
            .catch((err) => {
                console.log(err);
            });
        /* eslint-enable no-console */
    }
});

module.exports = server;
