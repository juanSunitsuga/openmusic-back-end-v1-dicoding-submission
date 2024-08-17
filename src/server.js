require('dotenv').config();
const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

// albums - submission 1
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs - submission 1
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
    const server = Hapi.server({
        port: 5000,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // Register plugins
    await server.register([
        {
            plugin: songs,
            options: {
                service: new SongsService(),
                validator: SongsValidator,
            },
        },
        {
            plugin: albums,
            options: {
                service: new AlbumsService(),
                validator: AlbumsValidator,
            },
        },
    ]);

    // Adding onPreResponse extension for centralized error handling
    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        // Continue with the existing response if it's not a ClientError
        return response.continue || response;
    });

    // Start the server
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
