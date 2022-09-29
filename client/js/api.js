class Routes {
    constructor(host, account, token) {
        this.host = host;
        this.headers = {
            'account': account,
            'token': token,
            'content-type': 'application/json'
        }
    }
    async handleRoute(route, options, json=true) {
        options['headers'] = this.headers;
        const promise = fetch(route, options).catch(err => {
            console.error(`Error fetching ${route}: ${err}`);
            return {};
        });
        if (json) {
            return await promise.then(res => res.json());
        }
        return await promise;
    }
}

class TTPRoutes extends Routes {
    constructor(host, account, token) {
        super(host, account, token);
    }
    async manifest() {
        return await this.handleRoute(`${this.host}/manifest`, {});
    }
    async get(id) {
        return await this.handleRoute(`${this.host}/manifest/${id}`, {});
    }
    async save(procedure) {
        const data = JSON.stringify(procedure);
        return await this.handleRoute(`${this.host}/manifest`, {method: 'PUT', body: data});
    }
    async delete(id) {
        return await this.handleRoute(`${this.host}/manifest/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({}),
        }, false);
    }
}

class DCFRoutes extends Routes {
    constructor(host, account, token) {
        super(host, account, token);
    }
    async get(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}`, {});
    }
    async save(name, code) {
        const data = JSON.stringify({code: code});
        return await this.handleRoute(`${this.host}/dcf/${name}`, {
            method: 'POST',
            body: data
        }, false);
    }
    async delete(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}`, {method: 'DELETE'});
    }
    async submit(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}/submit`,{
            method: 'POST',
            body: JSON.stringify({})
        }, false);
    }
    async history(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}/links`, {});
    }
}

let Api = {
    credentials: () => {
        const freshAccount = Array.from(
            Array(20), () => Math.floor(Math.random() * 36).toString(36)
        ).join('');
        const host = localStorage.getItem('PRELUDE_SERVER') || 'http://localhost:3000';
        const account = localStorage.getItem('PRELUDE_ACCOUNT_ID') || freshAccount;
        const token = localStorage.getItem('PRELUDE_ACCOUNT_TOKEN') || '';
        return {host: host, account: account, token: token};
    },
    setCredentials(host, account, token) {
        localStorage.setItem('PRELUDE_SERVER', host);
        localStorage.setItem('PRELUDE_ACCOUNT_ID', account);
        localStorage.setItem('PRELUDE_ACCOUNT_TOKEN', token);
    },
    login: () => {
        const creds = Api.credentials();
        Api.setCredentials(creds.host, creds.account, creds.token);
        Api.ttp = new TTPRoutes(creds.host, creds.account, creds.token);
        Api.dcf = new DCFRoutes(creds.host, creds.account, creds.token);
    },
    async ping(host, account, token) {
        const headers = {account: account, token: token};
        return fetch(`${host}/ping`, {headers: headers});
    }
};

export default Api;