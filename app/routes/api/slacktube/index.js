const express = require('express');
const slackTube = require('../../../services/slack-tube');

const router = express.Router();

router.get('/playing', (req, res, next) => {
    slackTube
        .getPlaying()
        .then(({ link, title }) => {
            res.json({
                text: `Playing: ${link || title}.`
            });
        })
        .catch(next);
});

router.post('/playing', (req, res, next) => {
    const { text } = req.body;
    if (!text) {
        throw Object.assign(Error('Missing text.'), { statusCode: 400 })
    }
    slackTube
        .play(text)
        .then(({ link, title }) => {
            res.json({
                text: `Playing: ${link || title}.`
            });
        })
        .catch(next)
});

module.exports = router;
