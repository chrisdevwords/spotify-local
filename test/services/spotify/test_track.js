const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { openMock } = require('./mock');
const {
    findTrack
} = require('../../../app/services/spotify/api/track');
const auth = require('../../../app/services/spotify/api/auth');


const openTrackMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/tracks/${id}`
    );
};

describe('The Spotify API Track Helper', () => {

    beforeEach(() => {
        sinon.stub(auth, 'getToken').resolves('foo');
    });

    afterEach(() => {
        auth.getToken.restore();
    });

    describe('findTrack', () => {

        beforeEach((done) => {
            sinon
                .stub(request, 'get')
                .callsFake(openTrackMock);
            done();

        });

        afterEach((done) => {
            request.get.restore();
            done();
        });

        context('with a uri for a Spotify Track', () => {
            it('fetches the artist', (done) =>{
                findTrack('19oPsdlHwigJm2Ewk1ypRb')
                    .then((track) => {
                        expect(track.artist)
                            .to.eq('Eddie Rabbitt');
                        done();
                    })
                    .catch(done);
            });

            it('fetches multiple artists', (done) => {
                findTrack('0wFkjAM4VVoepQdYB6kl4U')
                    .then((track) => {
                        expect(track.artist)
                            .to.eq('Prince, Eric Leeds')
                        done();
                    })
                    .catch(done);
            });

            it('fetches the track name', (done) => {
                findTrack('6tASfEUyB7lE2r6DLzURji')
                    .then((track) => {
                        expect(track.name)
                            .to.eq('Club Tropicana')
                        done();
                    })
                    .catch(done);
            });

            it('fetches the uri', (done) => {
                findTrack('6tASfEUyB7lE2r6DLzURji')
                    .then((track) => {
                        expect(track.uri)
                            .to.eq('spotify:track:6tASfEUyB7lE2r6DLzURji');
                        done();
                    })
                    .catch(done);
            });
        });

        context('with an invalid track id', () => {
            it('throws a 400', (done) => {
                findTrack('foo')
                    .then(() => {
                        done(Error('Error should be thrown.'))
                    })
                    .catch(({ statusCode }) => {
                        expect(statusCode)
                            .to.eq(400);
                        done();
                    })
                    .catch(done);
            });

            it('throws an invalid id message', (done) => {
                findTrack('foo')
                    .then(() => {
                        done(Error('Error should be thrown.'))
                    })
                    .catch(({ message }) => {
                        expect(message)
                            .to.eq('invalid id');
                        done();
                    })
                    .catch(done);
            });
        });

        context('with a valid but non-existent track id', () => {

            const trackId = 'xxxxxxxxxxxxxxxxxxxxxx';

            it('throws a 404', (done) => {
                findTrack(trackId)
                    .then(() => {
                        done(Error('Error should be thrown.'))
                    })
                    .catch(({ statusCode }) => {
                        expect(statusCode)
                            .to.eq(404);
                        done();
                    })
                    .catch(done);
            });

            it('throws an track not found message', (done) => {
                findTrack(trackId)
                    .then(() => {
                        done(Error('Error should be thrown.'))
                    })
                    .catch(({ message }) => {
                        expect(message)
                            .to.eq('non existing id');
                        done();
                    })
                    .catch(done);
            });
        });

        context('with a uri for a track not playable in the US', () => {
            it('throws a 405', (done) => {
                findTrack('6ny5w1J69fN2ztPl7tGYZX')
                    .then(() => {
                        done(Error('Error should be thrown.'))
                    })
                    .catch(({ statusCode }) => {
                        expect(statusCode)
                            .to.eq(405);
                        done();
                    })
                    .catch(done);
            });
        });
    });
});
