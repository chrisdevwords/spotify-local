
const express = require('express');
const spotifyApi = require('../../../services/spotify/api');
const spotifyLocal = require('../../../services/spotify/local');

const router = express.Router();

router.get('/', (req, res, next) => {

    spotifyLocal
       .getPlaylist()
       .then((resp) => {
           res.json(resp);
       })
       .catch(next);
});

router.post('/', (req, res, next) => {

    spotifyApi
        .findPlaylist(req.body.playlist)
        .then(({ title, uri }) => {
            spotifyLocal
                .setPlaylist({ title, uri })
                .then((resp) => {
                    res.json(resp);
                })
        })
        .catch(next);

});

module.exports = router;
