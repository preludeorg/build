import Api from "api.js";

class Server {
    name() {
        return '&#9678; Server';
    }
    write(sidebar) {
        const creds = Api.credentials();
        let contents = sidebar.find('#plugin-contents').empty();
        sidebar.find('#plugin-name').html(this.name());
        sidebar.find('#plugin-description').text('' +
            'By default, Operator is backed by the managed Prelude Server. ' +
            'You can host alternative Server instances and log in below.' +
            `You are logged into ${creds.host} as ${creds.account}.`);

        contents.append($('<div id="server-selection">'))
        $('#server-selection').append($('<div id="default-server" class="active-server">').text("Default"));
        $('#server-selection').append($('<div id="custom-server">').text("Custom"));

        contents.append($('<div id="default-container">'));
        contents.append($('<div id="custom-container">'));

        $('#default-container').append($('<div id="default-submit" class="plugin-button">').text('Connect to Prelude server')).on('click', (ev) => {
            const host = '';
            const account = '';
            const token = '';
            Api.ping(host, account, token).then(() => {
                Api.setCredentials(host, account, token);
                location.reload();
            }).catch(err => {
               console.error(`Unable to connect to ${host}, ${err}`);
            }).finally(() => {
               $('#spinner').hide();
            });
        });

        const ip = $('<input id="i-ip" class="plugin-input" placeholder="Enter an IP" spellcheck="false">');
        const account = $('<input id="i-account" class="plugin-input" placeholder="Enter a username" type="text" spellcheck="false">');
        const token = $('<input id="i-token" class="plugin-input" placeholder="Enter a token" type="password">');
        const submit = $('<button class="plugin-button">').text('Connect to custom server').on('click', (ev) => {
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
        $('#custom-container').append(ip);
        $('#custom-container').append(account);
        $('#custom-container').append(token);
        $('#custom-container').append(submit);

        $("#default-server").on('click', (ev) => {
            $('#custom-container').hide();
            $('#default-container').show();
            $('#default-server').toggleClass('active-server')
            $('#custom-server').toggleClass('active-server')
        })

        $("#custom-server").on('click', (ev) => {
            $('#custom-container').show();
            $('#default-container').hide();
            $('#default-server').toggleClass('active-server')
            $('#custom-server').toggleClass('active-server')
        })
    }
}

export default Server;