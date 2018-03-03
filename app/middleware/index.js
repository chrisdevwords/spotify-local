
const PATH = require('path');
const nunjucks = require('nunjucks');
const express = require('express');
const morgan = require('morgan');
const body = require('body-parser');


const ROOT = '../../';

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

    app.use(express.static(
        PATH.resolve(__dirname, ROOT, 'app/public/assets')
    ));

    app.use(express.static(
        PATH.resolve(__dirname, ROOT, 'app/public/dist')
    ));

    // nunjucks template engine
    const templateDir = PATH.resolve(__dirname, ROOT, 'app/views');
    app.set('views', templateDir);
    app.set('view engine', 'html.twig');
    nunjucks.configure(
        templateDir,
        {
            watch: true,
            express: app,
            throwOnUndefined: true,
            autoescape: true
        }
    );

    return app;
}

module.exports = {
    configure
};
