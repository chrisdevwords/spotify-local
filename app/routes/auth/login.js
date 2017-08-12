const querystring = require('querystring');
const express = require('express');
const spotifyAuth = require('../../services/spotify/api/auth');

const router = express.Router();

router.post('/', (req, res) => {

    const {
        SPOTIFY_CLIENT_ID,
        PORT = 5000
    } = process.env;
    const scopes = [
        'playlist-modify-public',
        'playlist-modify-private',
        'playlist-read-private'
    ];
    const qs =  querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scopes: scopes.join(' '),
        redirect_uri: `http://localhost:${PORT}/login/callback`,
        //state: state
    });
    return res.redirect(
        `https://accounts.spotify.com/authorize?${qs}`
    )
});

router.get('/callback', (req, res, next) => {
    const { code, error } = req.query;
    if (error) {
        next(Error(error));
    }
    if (code) {
        spotifyAuth
            .createAccessToken(code)
            .then(() => {
                res.redirect('/')
            })
            .catch(next);
    } else {
        res.redirect('/');
    }
});

module.exports = router;
