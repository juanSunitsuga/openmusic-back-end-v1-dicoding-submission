const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        (async () => {
            const autoBind = (await import('auto-bind')).default;
            autoBind(this);
        })();
    }

    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const songId = await this._service.addSong(request.payload);

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan',
                data: { songId },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this.handleServerError(h, error);
        }
    }

    async getSongsHandler(request) {
        const params = request.query;
        const songs = await this._service.getSongs(params);
        return {
            status: 'success',
            data: {
                songs: songs.map(song => ({
                    id: song.id,
                    title: song.title,
                    performer: song.performer,
                })),
            },
        };
    }

    async getSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getSongById(id);

            return {
                status: 'success',
                data: { song },
            };
        } catch (error) {
            return this.handleServerError(h, error);
        }
    }

    async putSongByIdHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;
            await this._service.editSongById(id, request.payload);

            return {
                status: 'success',
                message: 'Lagu berhasil diperbarui',
            };
        } catch (error) {
            return this.handleServerError(h, error);
        }
    }

    async deleteSongByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteSongById(id);
            return {
                status: 'success',
                message: 'Lagu berhasil dihapus',
            };
        } catch (error) {
            return this.handleServerError(h, error);
        }
    }

    handleServerError(h, error) {
        if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
    }
}

module.exports = SongsHandler;
