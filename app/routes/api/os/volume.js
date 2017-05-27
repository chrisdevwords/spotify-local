const express = require('express');
const osVolume = require('../../../services/os/volume');


const router = express.Router();

router.get('/', (req, res, next) =>

    osVolume
        .getVolume()
        .then((resp) => {
            res.json(resp);
        })
        .catch(next)
);
 
router.post('/', ({ body }, res, next) => {

    const { volume } = body;

    osVolume
        .setVolume(volume)
        .then((resp) => {
            res.json(resp);
        })
        .catch(next);

});

module.exports = router;
