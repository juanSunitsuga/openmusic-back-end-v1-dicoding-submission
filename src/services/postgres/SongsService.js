const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {
        const id = `song-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId],
        };

        const fetch = await this._pool.query(query);

        if (!fetch.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return fetch.rows[0].id;
    }

    async getSongs(params) {
        const { title, performer } = params;
        let query = {
            text: 'SELECT id, title, performer FROM songs',
            values: [],
        };

        const conditions = [];
        if (title) {
            conditions.push(`title ILIKE $${conditions.length + 1}`);
            query.values.push(`%${title}%`);
        }
        if (performer) {
            conditions.push(`performer ILIKE $${conditions.length + 1}`);
            query.values.push(`%${performer}%`);
        }

        if (conditions.length > 0) {
            query.text += ` WHERE ${conditions.join(' AND ')}`;
        }

        const fetch = await this._pool.query(query);
        return fetch.rows;
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const fetch = await this._pool.query(query);

        if (!fetch.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return fetch.rows[0];
    }

    async editSongById(id, { title, year, performer, genre, duration }) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
            values: [title, year, performer, genre, duration, id],
        };
        const fetch = await this._pool.query(query);

        if (!fetch.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }

        return fetch.rows[0].id;
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const fetch = await this._pool.query(query);

        if (!fetch.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsService;
