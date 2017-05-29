const {  describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const { extractID } = require('../../../app/services/spotify/api/util');


describe('The Spotify API Utils', () => {
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
});
