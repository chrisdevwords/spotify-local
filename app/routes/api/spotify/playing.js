
const express = require('express');
const spotifyLocal = require('../../../services/spotify/local');
const spotifyApi = require('../../../services/spotify/api');

// eslint-disable-next-line babel/new-cap
const router = express.Router();

router.get('/', (req, res, next) => {
    spotifyLocal.currentTrack()
        .then((track) => {
            res.json({
                track
            });
        })
        .catch(next);
});

router.post('/', (req, res, next) => {

    const { track, requestedBy } = req.body;

    spotifyApi.findTrack(track)
        .then(result =>
            spotifyLocal.playTrack(
                Object.assign(result, { requestedBy })
            )
        )
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);
});

router.delete('/', (req, res, next) => {

    spotifyLocal
        .nextTrack()
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);
});

module.exports = router;
