const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { openMock } = require('./mock');
const {
    findAlbum
} = require('../../../app/services/spotify/api/album');
const auth = require('../../../app/services/spotify/api/auth');



const openAlbumMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/albums/${id}`
    );
};


describe('The Spotify API Album Helper', () => {

    beforeEach(() => {
        sinon.stub(auth, 'getToken').resolves('foo');
    });

    afterEach(() => {
        auth.getToken.restore();
    });



    describe('findAlbum', () => {

        beforeEach((done) => {
            sinon
                .stub(request, 'get')
                .callsFake(openAlbumMock);
            done();
        });

        afterEach((done) => {
            request.get.restore();
            done();
        });

        context('with a uri for a Spotify Album', () => {
            const link = 'spotify:album:51XjnQQ9SR8VSEpxPO9vrW';

            it('fetches the tracks', (done) => {
                findAlbum(link)
                    .then(({ tracks }) => {
                        expect(tracks).to.be.an('array');
                        expect(tracks.length).to.eq(7);
                        done();
                    })
                    .catch(done);
            });

            it('parses the tracks', (done) => {
                findAlbum(link)
                    .then(({ tracks }) => {
                        tracks.forEach(({ artist, uri, name }) => {
                           expect(uri).to.be.a('string');
                           expect(name).to.be.a('string');
                           expect(artist).to.eq('Steely Dan');
                        });
                        done();
                    })
                    .catch(done);
            });

            it('fetches the album name', (done) => {
                findAlbum(link)
                    .then(({ name }) => {
                        expect(name).to.eq('Aja');
                        done();
                    })
                    .catch(done);
            });

            it('fetches the album artist', (done) => {
                findAlbum(link)
                    .then(({ artist }) => {
                        expect(artist).to.eq('Steely Dan');
                        done();
                    })
                    .catch(done);
            });
        });

        context('with an invalid album id', () => {
            it('throws a 400', (done) => {
                findAlbum('foo')
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
                findAlbum('foo')
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

        context('with a valid but non-existent album id', () => {

            const id = 'xxxxxxxxxxxxxxxxxxxxxx';

            it('throws a 404', (done) => {
                findAlbum(id)
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

            it('throws an album not found message', (done) => {
                findAlbum(id)
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
    });
});
