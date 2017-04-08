
const PATH = require('path');
const fs = require('fs');
const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const {
    getToken,
    extractID,
    findTrack,
    parsePlaylist,
    TOKEN_ERROR,
} = require('../../../app/services/spotify/api');


const openTrackMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/tracks/${id}`
    );
};

const openMock = (filePath) => {

    const ROOT = '../../../';
    const file = PATH.resolve(__dirname, ROOT, `test/mock/${filePath}.json`)

    return new Promise((resolve, reject) => {
        fs.readFile(file, (error, data) => {
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

    describe('parsePlaylist', () => {
        context('with a uri to a Spotify Playlist', () => {

            const playlist = 'spotify:user:awpoops:playlist:41H6FNittv54UTD5TWII82';

            it('extracts the playlist Id', () => {
                const { playlistId } = parsePlaylist(playlist);
                expect(playlistId).to.eq('41H6FNittv54UTD5TWII82');
            });

            it('extracts the user Id', () => {
                const { userId } = parsePlaylist(playlist);
                expect(userId).to.eq('awpoops');
            });
        });

        context('with an http link to a Spotify Playlist', () => {

            const playlist = 'https://open.spotify.com/user/spotify/playlist/7yza99mVQaqnk4Hqs4T3kq';

            it('extracts the playlist Id', () => {
                const { playlistId } = parsePlaylist(playlist);
                expect(playlistId).to.eq('7yza99mVQaqnk4Hqs4T3kq');
            });

            it('extracts the user Id', () => {
                const { userId } = parsePlaylist(playlist);
                expect(userId).to.eq('spotify');
            });
        });

        context('with an invalid link', () => {
            const playlist =  'http://google.com';

            it('returns an undefined playlistId', () => {
                const { playlistId } = parsePlaylist(playlist);
                expect(playlistId).to.eq(undefined);
            });

            it('returns an undefined userId', () => {
                const { userId } = parsePlaylist(playlist);
                expect(userId).to.eq(undefined);
            });

        });
    });

    describe('getToken', () => {
        context('with a valid auth token', () => {
            beforeEach((done) => {
                sinon
                    .stub(request, 'post')
                    .callsFake(() =>
                        openMock('spotify/token/success')
                            .then(JSON.stringify)
                    );
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

    describe('findPlaylist', () =>{
        context('with a valid playlist uri', () => {
            it.skip('resolve with playlist info', (done) => {
                done()
            });
        });

        context('with an invalid playlist uri', () => {
            it.skip('throws a 404', (done) =>{
                done();
            });
            it.skip('throws an error message', (done) =>{
                done();
            });
        });
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
