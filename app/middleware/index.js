
const morgan = require('morgan');
const body = require('body-parser');


function configure(app) {

    app.use(body.urlencoded({ extended : true }));
    app.use(body.json());
    app.use(morgan('dev'));

    app.use((req, res, next) => {
        res.setHeader(
            'Access-Control-Allow-Origin',
            'https://app.swaggerhub.com'
        );
        res.setHeader(
            'Access-Control-Allow-Headers',
            ' Origin, X-Requested-With, Content-Type, Accept'
        );
        next();
    });
    return app;
}

module.exports = {
    configure
};
