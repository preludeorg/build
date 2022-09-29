import Api from "../api.js";

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

        const ip = $('<input id="i-ip" class="plugin-input" placeholder="Enter an IP" spellcheck="false">');
        const account = $('<input id="i-account" class="plugin-input" placeholder="Enter account ID" type="text" spellcheck="false">');
        const token = $('<input id="i-token" class="plugin-input" placeholder="Enter a token" type="password">');
        const submit = $('<button class="plugin-button">').text('Login').on('click', (ev) => {
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
        contents.append(ip);
        contents.append(account);
        contents.append(token);
        contents.append(submit);
    }
}

export default Server;