
const PATH = require('path');
const fs = require('fs');
const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { extractID, findTrack } = require('../../../app/services/spotify/api');


const openMock = (options) => {
    const id = options.uri.split('/').pop();
    const ROOT = '../../../';
    const filePath = PATH.resolve(__dirname, ROOT, `test/mock/spotify/tracks/${id}.json`);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (error, data) => {
            if(error) {
                reject(error);
            } else {
                const json = JSON.parse(data.toString());
                if (json.error) {
                    reject({
                        message: json.error.message,
                        statusCode : json.error.status
                    });
                } else {
                    resolve(json);
                }
            }
        });
    });
};

describe('The Spotify API Helper', () => {

    beforeEach((done) => {
        sinon
            .stub(request, 'get', openMock);
        done();

    });

    afterEach((done) => {
        request.get.restore();
        done();
    });

    describe('extractID', () => {
        context('with a uri for a Spotify Track', () => {
            it('extracts the id', (done) =>{
                const uri = 'spotify:track:6tgqAuaIBeLPJ5BT0gHGXY';
                expect(extractID(uri))
                    .to.eq('6tgqAuaIBeLPJ5BT0gHGXY');
                done();
            });
        });

        context('with an http link for a Spotify Track', () => {
            it('extracts the id', (done) =>{
                const link = 'https://open.spotify.com/track/4k1IS2uF2dGcU3GzOOZqqb';
                expect(extractID(link))
                    .to.eq('4k1IS2uF2dGcU3GzOOZqqb');
                done();
            });
        });

        context('with an id for a Spotify Track', () => {
            it('extracts the id', (done) =>{
                const id = '6FWoYwZa13llS7nj0SG65F';
                expect(extractID(id))
                    .to.eq(id);
                done();
            });
        });
    });

    describe('findTrack', () => {
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
        });

        context('with a valid but non-existent track id', () => {
            it('throws a 404', (done) => {
                findTrack('xxxxxxxxxxxxxxxxxxxxxx')
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
