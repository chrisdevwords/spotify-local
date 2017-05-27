
const express = require('express');
const spotifyApi = require('../../../services/spotify/api');
const spotifyLocal = require('../../../services/spotify/local');

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

router.delete('/', (req, res, next) => {

    spotifyLocal
        .clearQueue()
        .then((tracks) => {
            res.json({ tracks })
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

router.get('/:index', (req, res, next) => {
    const { index } = req.params;
    spotifyLocal
        .getQueuedTrack(index)
        .then((track) => {
            res.json({ track })
        })
        .catch(next);
});

router.delete('/:index', (req, res, next) => {
    const { index } = req.params;
    spotifyLocal
        .deQueueTrack(index)
        .then((track) => {
            res.json({ track })
        })
        .catch(next);
});

module.exports = router;
