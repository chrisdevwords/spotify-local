# Local Spotify Server
Local Express server that controls Spotify through REST endpoints. Tunnel with [NGROK](http://ngrok.io) to expose endpoints.

## Running Locally
```
$ npm i && npm start
```


## ENV Vars for API Key
In order to access the Spotify API to verify playlist info, you'll need to save 
Spotify App Client ID and Secret in a local .env file in the root directory of the project.
It will need to contain the following values:
```
SPOTIFY_CLIENT_ID=XXXX
SPOTIFY_SECRET=XXXX
```
For more information on Spotify API Authorization or to obtain your own credentials, see: [The Spotify API Authorization Guide](https://developer.spotify.com/web-api/authorization-guide/).
