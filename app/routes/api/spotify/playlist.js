
const express = require('express');
const spotifyApi = require('../../../services/spotify/api');
const spotifyLocal = require('../../../services/spotify/local');

// eslint-disable-next-line babel/new-cap
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
        .then(({ name, uri }) => {
            spotifyLocal
                .setPlaylist({ name, uri })
                .then((resp) => {
                    res.json(resp);
                })
        })
        .catch(next);

});

module.exports = router;
