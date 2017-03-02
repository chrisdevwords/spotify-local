

function logError(err, req, res, next) {
    const { statusCode = 500 } = err;
    if (statusCode === 500) {
        // eslint-disable-next-line no-console
        console.log(err.stack || err);
    }
    next(err);
}

function throw404(req, res, next) {
    const err = new Error('Page not found.');
    err.statusCode = 404;
    return next(err);
}

function renderError(err, req, res, next) {

    if (res.headersSent) {
        return next(err)
    }

    const statusCode = err.statusCode || err.code || 500;
    return res
        .status(statusCode)
        .json({
            statusCode,
            message: err.message
        });
}


function configure(app) {
    app.use(logError);
    app.use(throw404);
    app.use(renderError);
}

module.exports = {
    configure,
    logError,
    throw404,
    renderError
};
