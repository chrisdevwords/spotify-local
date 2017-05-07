const express = require('express');
const spotifyLocal = require('../../../services/spotify/local');

const router = express.Router();

router.get('/', (req, res, next) =>
    spotifyLocal
        .getVolume()
        .then((resp) => {
            res.json(resp);
        })
        .catch(next)
);

router.post('/', ({ body }, res, next) => {

    const { volume } = body;

    spotifyLocal
        .setVolume(volume)
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);

});

module.exports = router;
