import Api from "api.js";

class Server {
    name() {
        return $('<img src="/static/assets/servers.svg"></img> <span>Servers</span>');
    }
    write(sidebar) {
        const creds = Api.credentials();
        let contents = sidebar.find('#plugin-contents').empty();
        sidebar.find('#plugin-name').html(this.name());
        sidebar.find('#plugin-description').text('' +
            'By default, Operator is backed by the managed Prelude Server. ' +
            'You can host alternative Server instances and log in below.');

        contents.append($('<div id="server-selection">'))
        $('#server-selection').append($('<div id="prelude-server" class="active-server">').text("Prelude"));
        $('#server-selection').append($('<div id="custom-server">').text("Custom"));

        contents.append($('<div id="prelude-container">'));
        contents.append($('<div id="custom-container">'));

        $('#prelude-container').append($('<input id="i-ip-prelude" class="plugin-input" placeholder="127.0.0.1:3000" readonly>'));
        $('#prelude-container').append($('<input id="i-account-prelude" class="plugin-input" placeholder="Enter a username" type="text" spellcheck="false">'));
        $('#prelude-container').append($('<div id="prelude-submit" class="plugin-button">').text('Connect to Prelude server'));
        $('#prelude-submit').on('click', (ev) => {
            const host = "";
            const account = $('#i-account-prelude').val();
            const token = "";
            Api.ping(host, account, token).then(() => {
                Api.setCredentials(host, account, token);
                location.reload();
            }).catch(err => {
               console.error(`Unable to connect to ${host}, ${err}`);
            }).finally(() => {
               $('#spinner').hide();
            });
        });

        $('#custom-container').append($('<input id="i-ip" class="plugin-input" placeholder="Enter an IP" spellcheck="false">'));
        $('#custom-container').append($('<input id="i-account" class="plugin-input" placeholder="Enter a username" type="text" spellcheck="false">'));
        $('#custom-container').append($('<input id="i-token" class="plugin-input" placeholder="Enter a token" type="password">'));
        $('#custom-container').append($('<button id="custom-submit" class="plugin-button">').text('Connect to custom server'));
        $('#custom-submit').on('click', (ev) => {
            ev.stopPropagation();
            ev.preventprelude();

            $('#spinner').show();
            const host = $('#i-ip').val();
            const account = $('#i-account').val();
            const token = $('#i-token').val();
            Api.ping(host, account, token).then(() => {
                Api.setCredentials(host, account, token);
                location.reload();
            }).catch(err => {
               console.error(`Unable to connect to ${host}, ${err}`);
            }).finally(() => {
               $('#spinner').hide();
            });
        });

        $("#prelude-server").on('click', (ev) => {
            $('#custom-container').hide();
            $('#prelude-container').show();
            $('#prelude-server').addClass('active-server');
            $('#custom-server').removeClass('active-server');
        })

        $("#custom-server").on('click', (ev) => {
            $('#custom-container').show();
            $('#prelude-container').hide();
            $('#custom-server').addClass('active-server');
            $('#prelude-server').removeClass('active-server');
        })

        if (creds.host.includes('localhost')) {
            $('#prelude-submit').text('Connected to Prelude server');
            $('#custom-submit').text('Connect to custom server');
        } else {
            $('#custom-submit').text('Connected to custom server');
            $('#prelude-submit').text('Connect to Prelude server');
        }
    }
}

export default Server;