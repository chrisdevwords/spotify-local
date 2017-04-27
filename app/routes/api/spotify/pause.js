

const express = require('express');
const spotifyLocal = require('../../../services/spotify/local');

const router = express.Router();

router.get('/', (req, res, next) => {
    spotifyLocal
        .getPaused()
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);
});

router.post('/', (req, res, next) => {

    const { paused } = req.body;

    if (paused) {
        spotifyLocal
            .pause()
            .then((resp) => {
                res.json(resp);
            })
            .catch(next);
    } else {
        spotifyLocal
            .resume()
            .then((resp) => {
                res.json(resp);
            })
            .catch(next);
    }


});

module.exports = router;
