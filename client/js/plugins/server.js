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
        $('#server-selection').append($('<div id="default-server" class="active-server">').text("Default"));
        $('#server-selection').append($('<div id="custom-server">').text("Custom"));

        contents.append($('<div id="default-container">'));
        contents.append($('<div id="custom-container">'));

        $('#default-container').append($('<input id="i-ip-prelude" class="plugin-input" placeholder="127.0.0.1:3000" readonly>'));
        $('#default-container').append($('<input id="i-account-prelude" class="plugin-input" placeholder="Enter a username" type="text" spellcheck="false">'));
        $('#default-container').append($('<div id="default-submit" class="plugin-button">').text('Connect to Prelude server'));
        $('#default-submit').on('click', (ev) => {
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
            ev.preventDefault();

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

        $("#default-server").on('click', (ev) => {
            $('#custom-container').hide();
            $('#default-container').show();
            $('#default-server').addClass('active-server');
            $('#custom-server').removeClass('active-server');
        })

        $("#custom-server").on('click', (ev) => {
            $('#custom-container').show();
            $('#default-container').hide();
            $('#custom-server').addClass('active-server');
            $('#default-server').removeClass('active-server');
        })

        if (creds.host.includes('localhost')) {
            $('#default-submit').text('Connected to Prelude server');
            $('#custom-submit').text('Connect to custom server');
        } else {
            $('#custom-submit').text('Connected to custom server');
            $('#default-submit').text('Connect to Prelude server');
        }
    }
}

export default Server;