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
const Song = imports.client.Song;

/* exported SongRow */
var SongRow = GObject.registerClass({
    GTypeName: 'PithosSongRow',
    CSSName: 'pithossongrow',
    Template: 'resource:///io/github/Pithos/songRow.ui',
    InternalChildren: ['nameLabel'],
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
    }

    _updateSongName() {
        this._nameLabel.label = `<b>${GLib.markup_escape_text(this.song.song_name, -1)}</b>`;
    }
});

