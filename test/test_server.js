
const mocha = require('mocha');
const request = require('supertest');

const { describe, it, beforeEach, afterEach } = mocha;

describe('The Express Server', () => {

    let server;

    beforeEach((done) => {
        delete require.cache[require.resolve('../app/server')];
        server = require('../app/server');
        done();
    });

    afterEach((done) => {
        server.close(done);
    });

    context('with a valid route', () => {
        it('sends a statusCode 200', (done) => {
            request(server)
                .get('/')
                .expect(200, done);
        });
    });

    context('with an invalid route', () => {
        it('sends a statusCode 404', (done) => {
            request(server)
                .get('/foo')
                .expect(404, done);
        });
    });
});
