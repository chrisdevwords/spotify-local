
const express = require('express');
const ngrok = require('ngrok');
const dotenv = require('dotenv');
const queue = require('./routes/api/spotify/queue');
const playing = require('./routes/api/spotify/playing');
const playlist = require('./routes/api/spotify/playlist');
const shuffle = require('./routes/api/spotify/shuffle');
const pause = require('./routes/api/spotify/pause');

const middleware = require('./middleware');
const errorManager = require('./middleware/error-manager');
const spotifyLocal = require('./services/spotify/local');

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const tunnel = process.env.TUNNEL;

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
    // eslint-disable-next-line no-console
    console.log(`Listening on http://${HOST}:${PORT}`);
    spotifyLocal.start();
    if (tunnel) {
        ngrok.connect({ addr: PORT }, (err, url) => {
            // eslint-disable-next-line no-console
            console.log('Publicly accessible at', url);
        });
    }
});

module.exports = server;
