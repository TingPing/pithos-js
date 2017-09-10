/* window.js
 *
 * Copyright (C) 2017 Patrick Griffis
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

const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Client = imports.client;
const SongRow = imports.songRow.SongRow;

/* exported Window */
var Window = GObject.registerClass({
    GTypeName: 'PithosWindow',
    Template: 'resource:///io/github/Pithos/window.ui',
    InternalChildren: ['songListBox'],
}, class Window extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({application});
        this.songList = Gio.ListStore.new(Client.Song);
        this._songListBox.bind_model(this.songList, song => new SongRow(song));
        this.client = new Client.Client();
        this.client.connect('notify::connected', () => {
            this._onConnected().catch(error => log.warning(error));
        });

        this._init_async();
    }

    async _init_async() {
        try {
            await this.client.login();
        } catch (error) {
            log.warning(error);
        }
    }

    async _onConnected() {
        if (this.client.connected) {
            try {
                let response = await this.client.getStationList();
                let station;
                for (let s of response['stations']) {
                    if (s.isQuickMix) {
                        s['client'] = this.client;
                        station = new Client.Station(s);
                        break;
                    }
                }
                if (!station)
                    return;

                response = await station.getPlaylist();
                for (let item of response['items']) {
                    let song = new Client.Song(item);
                    this.songList.append(song);
                }
            } catch (error) {
                log.warning(error);
            }
        }
    }
});

