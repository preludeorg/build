import Api from "/client/js/api.js";

class Servers {
    name() {
        return '&#9678; Servers';
    }
    write(sidebar) {
        let contents = sidebar.find('#plugin-contents').empty();
        sidebar.find('#plugin-name').html(this.name());
        sidebar.find('#plugin-description').text('' +
            'By default, Operator runs against your local system. ' +
            'You can host additional Operator instances in server mode and send code files to them instead.');

        const ip = $('<input id="i-ip" class="plugin-input" placeholder="Enter an IP">');
        const token = $('<input id="i-token" class="plugin-input" placeholder="Enter a token" type="password">');
        const submit = $('<button class="plugin-button">').text('Add').on('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();

            const host = $('#i-ip').val();
            const token = $('#i-token').val();
            Api.ping(host, token).then(about => {
                Local.keychain.add('operators', about.name, {
                    host: host,
                    token: token
                });
                this.write(sidebar);
            }).catch(err => {
               console.error(`Unable to connect to ${host}, ${err}`);
            });
        });
        contents.append(ip);
        contents.append(token);
        contents.append(submit);
        contents.append($('<ul id="servers">'))
        this.refreshServers(contents);
        this.listen();
    }
    refreshServers(container) {
        container.find('#servers').empty();

        Object.keys(Local.keychain.read().servers).forEach(server => {
            const option = $(`<input id="${server}" type="checkbox" name="server-group" class="servers-checkbox">`).val(server);
            const name = $(`<label for="${server}" class="servers-label">`).append($(`<span>`).text(server.charAt(0).toUpperCase() + server.slice(1)));            const btnDelete = $('<button class="servers-button">').text('Remove').on('click', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();

                Local.keychain.remove('servers', server);
                this.refreshServers(container);
            });
            name.append(btnDelete);
            container.find('#servers').append($(`<li id="server-${server}" class="server">`).append(option).append(name));
        });
    }
    listen() {
        $('input[name=server-group]').change(function() {
            $('input[type=checkbox]').prop('checked', false);
            $('.server').removeClass('server-active');
            //Basic.bus.emit('switch:server', $(this).val());
            $(`#${$(this)[0].id}`).prop('checked', true);
            $(`#server-${$(this)[0].id}`).addClass('server-active');
        });
    }
}

export default Servers;