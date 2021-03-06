
const express = require('express');
const spotifyLocal = require('../../../services/spotify/local');
const spotifyTracks = require('../../../services/spotify/api/track');

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

    spotifyTracks.findTrack(track)
        .then(result =>
            spotifyLocal.playTrack(
                Object.assign(result, { requestedBy })
            )
        )
        .then((resp) => {
            res.json({ track: resp });
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
