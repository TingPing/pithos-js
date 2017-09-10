const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Soup = imports.gi.Soup;
const Pithos = imports.gi.Pithos;


const _session = new Soup.Session();
async function sendMessage(uri, body) {
    return new Promise((resolve) => {
        let message = Soup.Message.new('POST', uri);
        message.set_request('application/json', Soup.MemoryUse.COPY, body);
        _session.queue_message(message, (session, response_message) => {
            if (response_message.status_code !== 200)
                throw new Error(`Network error: ${response_message.status_code}`);
            let response = JSON.parse(response_message.response_body_data.get_data());
            if (response['stat'] !== 'ok')
                throw new Error(`Pandora error: (${response['code']}) ${response['message']}`);
            resolve(response['result']);
        });
    });
}


/*
 * Return object containing only valid properties.
 */
function filterParams(params, properties) {
    let ret = {};
    for (let param in params) {
        if (properties.hasOwnProperty(param)) {
            ret[param] = params[param];
        }
    }
    return ret;
}


/* exported Song */
const SongProperties = {
    songName: GObject.ParamSpec.string('song-name', '', '',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    artistName: GObject.ParamSpec.string('artist-name', '', '',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    albumName: GObject.ParamSpec.string('album-name', '', '',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    albumArtUrl: GObject.ParamSpec.string('album-art_url', '', '',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
};
var Song = GObject.registerClass({
    Properties: SongProperties,
}, class Song extends GObject.Object {
    _init(params) {
        super._init(filterParams(params, SongProperties));
    }
});



/* exported Station */
const StationProperties = {
    // FIXME: spec name stationToken errors
    stationToken: GObject.ParamSpec.string('station-token', '', '',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    client: GObject.ParamSpec.object('client', '', '',
                    GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
                    GObject.Object), // FIXME: Real type,
};
var Station = GObject.registerClass({
    Properties: StationProperties,
}, class Station extends GObject.Object {
    _init(params) {
        super._init(filterParams(params, StationProperties));
    }

    async getPlaylist() {
        return this.client.api_call('station.getPlaylist', {
            stationToken: this.station_token,
            additionalAudioUrl: 'HTTP_128_MP3',
        }, true);
    }
});


/* exported Client */
const ClientProperties = {
    connected: GObject.ParamSpec.boolean('connected', '', '',
                    GObject.ParamFlags.READABLE,
                    false),
};
var Client = GObject.registerClass({
    Properties: ClientProperties,
}, class Client extends GObject.Object {
    _init() {
        super._init();
        this.connected = false;
        this._userId = undefined;
        this._syncTime = undefined;
        this._partnerId = undefined;
        this._timeOffset = undefined;
        this._userAuthToken = undefined;
        this._partnerAuthToken = undefined;
    }

    async login() {
        let result = await this.partnerLogin();
        this._partnerAuthToken = result['partnerAuthToken'];
        this._partnerId = result['partnerId'];

        let pandora_time = Pithos.decrypt_time(result['syncTime']);
        let time = Math.round(Date.now() / 1000);
        this._timeOffset = pandora_time - time;

        result = await this.userLogin();
        this._userAuthToken = result['userAuthToken'];
        this._userId = result['userId'];

        this.connected = true;
        this.notify('connected');
    }

    async api_call(method, body={}, https=false, encrypted=true) {
        let args = {method};
        if (this._partnerId)
            args['partner_id'] = this._partnerId;
        if (this._userId)
            args['user_id'] = this._userId;
        if (this._userAuthToken) {
            args['auth_token'] = GLib.uri_escape_string(this._userAuthToken, null, false);
            body['userAuthToken'] = this._userAuthToken;
        }
        else if (this._partnerAuthToken) {
            args['auth_token'] = GLib.uri_escape_string(this._partnerAuthToken, null, false);
            body['partnerAuthToken'] = this._partnerAuthToken;
        }
        if (this._timeOffset)
            body['syncTime'] = Math.round(Date.now() / 1000) + this._timeOffset;

        const uriArgs = Object.keys(args).map(key => `${key}=${args[key]}`).join('&');
        const uri = `http${https ? 's' : ''}://tuner.pandora.com/services/json/?${uriArgs}`;
        body = JSON.stringify(body);
        log.debug(uri);
        log.debug(body);
        if (encrypted)
            body = Pithos.encrypt_string(body);
        return sendMessage(uri, body);
    }

    async partnerLogin() {
        return this.api_call('auth.partnerLogin', {
            username: 'android',
            password: 'AC7IBG09A3DTSYM4R41UJWL07VLN8JI7',
            deviceModel: 'android-generic',
            version: '5',
        }, true, false);
    }

    async userLogin() {
        return this.api_call('auth.userLogin', {
            loginType: 'user',
            username: '',
            password: '',
        }, true);
    }

    async getStationList() {
        return this.api_call('user.getStationList');
    }
});
