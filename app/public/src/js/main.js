// eslint-disable-next-line import/no-extraneous-dependencies
const io = require('socket.io-client');
require('./spotify');
require('./youtube');

function connectSocket() {
    const socket = io(`http://${window.location.host}/main`);
    const quitBtn = document.getElementById('quit-button');
    quitBtn.addEventListener('click', () => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to quit?')) {
            socket.emit('quit');
            window.location = 'http://www.spacejam.com';
        }
    });
}

connectSocket();
