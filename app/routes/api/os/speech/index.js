
const express = require('express');
const speech = require('../../../../services/os/speech');

const router = express.Router();

router.post('/', ({ body }, res, next) => {

    const { message } = body;
    speech.say(message.trim())
        .then(() => {
            res.json({})
        })
        .catch(next);
});

module.exports = router;
