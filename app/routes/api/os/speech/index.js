
const express = require('express');
const speech = require('../../../../services/os/speech');

const router = express.Router();

router.post('/', ({ body }, res, next) => {

    const { message } = body;
    speech.say(message.trim())
        .then((resp) => {
            res.json({
                message,
                data: resp
            })
        })
        .catch(next);
});

module.exports = router;
