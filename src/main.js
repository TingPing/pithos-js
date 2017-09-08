/* main.js
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

pkg.initGettext();
pkg.initFormat();
pkg.require({
    'Gio': '2.0',
    'Gtk': '3.0',
    'Soup': '2.4',
    'Pithos': '1.0',
});

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Window = imports.window.Window;

/* exported main */
function main(argv) {
    let app = new Gtk.Application({
        application_id: 'io.github.Pithos',
        flags: Gio.ApplicationFlags.FLAGS_NONE,
    });

    app.connect('activate', app => {
        let win = app.active_window;
        if (!win)
            win = new Window(app);
        win.present();
    });

    return app.run(argv);
}
