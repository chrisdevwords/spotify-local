const express = require('express');
const spotifyLocal = require('../../../services/spotify/local');

// eslint-disable-next-line babel/new-cap
const router = express.Router();

router.get('/', (req, res, next) =>
    spotifyLocal
        .getShuffle()
        .then((shuffling) => {
            let message = '';
            if (shuffling) {
                message = 'Player is shuffling.';
            } else {
                message = 'Player is not shuffling.';
            }
            res.json({
                message,
                shuffling
            });
        })
        .catch(next)
);

router.post('/', (req, res, next) =>

    spotifyLocal
        .toggleShuffle()
        .then((shuffling) => {
            let message = '';
            if (shuffling) {
                message = 'Player is shuffling.';
            } else {
                message = 'Player is not shuffling.';
            }
            res.json({
                message,
                shuffling
            });
        })
        .catch(next)
);

module.exports = router;
