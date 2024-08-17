require('dotenv',).config();
const Hapi = require('@hapi/hapi');

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
    },);

    await server.register([
        {
            plugin: songs,
            options: {
                service: new SongsService(),
                validator: SongsValidator
            }
        },
        {
            plugin: albums,
            options: {
                service: new AlbumsService(),
                validator: AlbumsValidator
            }
        }
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
