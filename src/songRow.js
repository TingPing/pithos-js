/* songRow.js
 *
 * Copyright (C) 2017 Patrick Griffis <tingping@tingping.se>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Soup = imports.gi.Soup;
const Song = imports.client.Song;


const _session = new Soup.Session();
async function _downloadUrl(uri) {
    return new Promise((resolve) => {
        let message = Soup.Message.new('GET', uri);
        log.info(`Downloading ${uri}`);
        _session.queue_message(message, (session, response_message) => {
            if (response_message.status_code !== 200)
                throw new Error(`Network error: ${response_message.status_code}`);
            resolve(response_message.response_body_data);
        });
    });
}

/* exported SongRow */
var SongRow = GObject.registerClass({
    GTypeName: 'PithosSongRow',
    CssName: 'pithossongrow',
    Template: 'resource:///io/github/Pithos/songRow.ui',
    InternalChildren: ['nameLabel', 'albumImage'],
    Properties: {
        song: GObject.ParamSpec.object('song', '', '',
                GObject.ParamFlags.CONSTRUCT_ONLY | GObject.ParamFlags.READWRITE,
                Song),
    },
}, class SongRow extends Gtk.Box {
    _init(song) {
        super._init({song});
        this.song.connect('notify::song-name', this._updateSongName.bind(this));
        this._updateSongName();
        this._init_async();
    }

    async _init_async() {
        try {
            let data = await _downloadUrl(this.song.album_art_url);
            let loader = GdkPixbuf.PixbufLoader.new_with_mime_type('image/jpeg');
            loader.set_size(96, 96);
            loader.write_bytes(data);
            if (loader.close()) {
                this._albumImage.pixbuf = loader.get_pixbuf();
            }
        }
        catch (error) {
            log.warning(error);
        }
    }

    _updateSongName() {
        let songName = GLib.markup_escape_text(this.song.song_name, -1);
        let artistName = GLib.markup_escape_text(this.song.artist_name, -1);
        let albumName = GLib.markup_escape_text(this.song.album_name, -1);
        this._nameLabel.label = `<b>${songName}</b>\nby <b>${artistName}</b>\nfrom <b>${albumName}</b>`;
    }
});

