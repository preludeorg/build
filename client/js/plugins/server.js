import Api from "api.js";
import { hideElements, htmlToElement, showElements } from "../dom/helpers";

class Server {
    name() {
        return '&#9678; Server';
    }
    write(sidebar) {
        const creds = Api.credentials();
        const contents = sidebar.querySelector('#plugin-contents')
        contents.replaceChildren()

        sidebar.querySelector('#plugin-name').innerHTML = this.name();
        sidebar.querySelector('#plugin-description').textContent = '' +
            'By default, Operator is backed by the managed Prelude Server. ' +
            'You can host alternative Server instances and log in below.' +
            `You are logged into ${creds.host} as ${creds.account}.`;

        const formElem = htmlToElement(`
         <form>
            <input name="i-ip" class="plugin-input" placeholder="Enter an IP" spellcheck="false">
            <input name="i-account" class="plugin-input" placeholder="Enter account ID" type="text" spellcheck="false">
            <input name="i-token" class="plugin-input" placeholder="Enter a token" type="password">
            <button type="submit" class="plugin-button">Login</button>
         </form>
        `)

        formElem.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            showElements("#spinner")
            const host = formData.get("i-ip");
            const account = formData.get('i-account');
            const token = formData.get('i-token');

            Api.ping(host, account, token).then(() => {
                Api.setCredentials(host, account, token);
                location.reload();
            }).catch(err => {
                console.error(`Unable to connect to ${host}, ${err}`);
            }).finally(() => {
                hideElements('#spinner')
            });
        });

        contents.append(formElem);
    }
}

export default Server;
