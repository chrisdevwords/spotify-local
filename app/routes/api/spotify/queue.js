
const express = require('express');
const spotifyApi = require('../../../services/spotify/api');
const spotifyLocal = require('../../../services/spotify/local');

// eslint-disable-next-line babel/new-cap
const router = express.Router();

router.get('/', (req, res, next) => {
    spotifyLocal.getQueue()
        .then((tracks) => {
            res.json({ tracks });
        })
        .catch(next);
});

router.post('/', (req, res, next) => {

    const { track, requestedBy } = req.body;

    spotifyApi
        .findTrack(track)
        .then(result =>
            spotifyLocal.queueTrack(
                Object.assign(result, { requestedBy })
            )
        )
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);
});

router.post('/album', (req, res, next) => {
    const { album, requestedBy } = req.body;
    spotifyApi
        .findAlbum(album)
        .then((result) => {
            const tracks = result.tracks.map(
                track => Object.assign(track, { requestedBy })
            );
            return Object.assign(
                result,
                { tracks }
            );
        })
        .then(spotifyLocal.queueAlbum)
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);
});

module.exports = router;
