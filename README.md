# Local Spotify Server
Local Express server that controls Mac OSX Spotify playback via REST endpoints with [AppleScript](https://developer.spotify.com/applescript-api/). 
Tunnel with [NGROK](http://ngrok.io) to expose endpoints.


## Requirements
1. Mac OSX
2. Spotify (with a premium account)
3. [Node JS >= 6.9.4](https://github.com/creationix/nvm)
4. [Spotify Application Developer Credentials](https://developer.spotify.com/my-applications/#!/) (Client ID and Secret)


## Running Locally
```
$ npm i && npm start
```
This will run the server locally on localhost 5000. You should also see an NGROK tunnel exposing the server publicly. 
Spotify should immediately begin playing on the Mac running server. 
Note, in order to take control of Spotify playback, you will need to quit the server. 


## Running in Development Mode
If developing locally, you can run the server w/ nodemon by running:
```bash
$ npm run start:dev
```
The server does not open its own NGROK tunnel in development mode. 
To open an NGROK tunnel for the dev server, open another tab and run:
```bash
$ npm run tunnel
```
Please note that each time you make changes to the code, the server will restart and reset the queue and the default playlist.


## Tests
There is partial test mocha test coverage.
```bash
$ npm test
```


## ENV Vars for Spotify API Access
In order to access the Spotify API, you'll need to save 
Spotify App Client ID and Secret in a local .env file in the root directory of the project.
It will need to contain the following values:
```
SPOTIFY_CLIENT_ID=XXXX
SPOTIFY_SECRET=XXXX
```
For more information on Spotify API Authorization or to obtain your own credentials, see: [The Spotify API Authorization Guide](https://developer.spotify.com/web-api/authorization-guide/).

## ENV Var for Market
By default the server is configured to play tracks only avaible in the US market.
Change the market by adding an env var specifying [your country code](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) to an .env file:
```
MARKET=GB
```

## ENV Vars for Slack Integration
If you would like to run the [AWS Lambda Slack Integration](https://github.com/chrisdevwords/slack-spotify-lambda),
the environment var for the `SPOTIFY_LOCAL_URL` can be updated everytime the server is started by adding the following
to the .env file:
```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX-XXX
AWS_REGION=us-east-1
AWS_FUNCTION_NAME=myFunctionName
AWS_REGION=us-east-1
```

## Swagger Docs
1. Docs are viewable [on swaggerhub](https://swaggerhub.com/apis/chrisdevwords/LocalSpotify/0.0.1). 
2. A [swagger.yaml](docs/swagger.yaml) file is also included with the project. 
