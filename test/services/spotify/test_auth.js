const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { openMock } = require('./mock');
const {
    getToken,
    TOKEN_ERROR
} = require('../../../app/services/spotify/api/auth');


const openTokenMock = (options) =>
    openMock('spotify/token/success')
        .then(JSON.stringify);

describe('The Spotify API Auth Module', ()=> {

    describe('getToken', () => {

        context('with a valid auth token', () => {
            beforeEach((done) => {
                sinon
                    .stub(request, 'post')
                    .callsFake(openTokenMock);
                done();
            });

            afterEach((done) => {
                request.post.restore();
                done();
            });

            it('resolve with an access token', (done) => {
                getToken()
                    .then((token) => {
                        expect(token).to.be.a.string;
                        done();
                    })
                    .catch(done);
            });
        });

        context('with missing spotify api creds', () => {
            beforeEach((done) => {
                sinon
                    .stub(request, 'post')
                    .rejects({ statusCode: 400});
                done();
            });

            afterEach((done) => {
                request.post.restore();
                done();
            });

            it('throws a 400', (done) => {
                getToken()
                    .then(() => {
                        done(Error('Error should be thrown'))
                    })
                    .catch((err) => {
                        expect(err.statusCode).to.eq(400);
                        done();
                    })
                    .catch(done);
            });
            it('throws an error message', (done) => {
                getToken()
                    .then(() => {
                        done(Error('Error should be thrown'))
                    })
                    .catch((err) => {
                        expect(err.message).to.eq(TOKEN_ERROR);
                        done();
                    })
                    .catch(done);
            });
        });
    });
})
