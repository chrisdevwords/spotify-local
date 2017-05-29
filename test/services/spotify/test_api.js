const PATH = require('path');
const fs = require('fs');
const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const {
    extractID,
    findTrack,
    findAlbum,
    findPlaylist,
    parsePlaylist,
    TOKEN_ERROR,
} = require('../../../app/services/spotify/api');
const auth = require('../../../app/services/spotify/api/auth');


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
                        error: {
                            error: json.error
                        },
                        statusCode : json.error.status
                    });
                } else {
                    resolve(json);
                }
            }
        });
    });
};

const openTrackMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/tracks/${id}`
    );
};

const openPlaylistMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/playlists/${id}`
    );
};

const openAlbumMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/albums/${id}`
    );
};


describe('The Spotify API Helper', () => {

    beforeEach(() => {
        sinon.stub(auth, 'getToken').resolves('foo');
    });

    afterEach(() => {
        auth.getToken.restore();
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

        context('with a uri for a Spotify Album', () => {
            it('extracts the id', (done) =>{
                const link = 'spotify:album:51XjnQQ9SR8VSEpxPO9vrW';
                expect(extractID(link))
                    .to.eq('51XjnQQ9SR8VSEpxPO9vrW');
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
        });
    });

    describe('findPlaylist', () =>{

        context('with valid api creds', () => {
            beforeEach((done) => {
                sinon.stub(request, 'get')
                    .callsFake(openPlaylistMock);
                done();
            });

            afterEach((done) =>{
                request.get.restore();
                done();
            });

            context('with a valid playlist uri', () => {

                const pl = 'spotify:user:spotify:playlist:37i9dQZF1DX0XUsuxWHRQd';

                it('resolve with playlist info', (done) => {
                    findPlaylist(pl)
                        .then(({ title, uri }) => {
                            expect(title).to.eq('RapCaviar');
                            done();
                        })
                        .catch(done);
                });
            });

            context('with an invalid playlist uri', () => {

                const pl = 'spotify:user:spotify:playlist:foo';

                it('throws a 404', (done) => {
                    findPlaylist(pl)
                        .then(() => {
                            done(Error('This should throw an error.'))
                        })
                        .catch((err) => {
                            expect(err.statusCode).to.eq(404);
                            done();
                        })
                        .catch(done);
                });

                it('throws an error message', (done) => {
                    findPlaylist(pl)
                        .then(() => {
                            done(Error('This should throw an error.'))
                        })
                        .catch((err) => {
                            expect(err.message).to.eq('Invalid playlist Id');
                            done();
                        })
                        .catch(done);
                });
            });
        });
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
