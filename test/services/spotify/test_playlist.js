const sinon = require('sinon');
const request = require('request-promise-native');
const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { openMock } = require('./mock');
const {
    findPlaylist,
    parsePlaylist
} = require('../../../app/services/spotify/api/playlist');
const auth = require('../../../app/services/spotify/api/auth');


const openPlaylistMock = (options) => {
    const id = options.uri.split('/').pop();
    return openMock(
        `spotify/playlists/${id}`
    );
};

describe('The Spotify API Playlist Helper', () => {

    beforeEach(() => {
        sinon.stub(auth, 'getToken').resolves('foo');
    });

    afterEach(() => {
        auth.getToken.restore();
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
});
