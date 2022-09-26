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
    async history(name) {
        return await this.handleRoute(`${this.host}/probe/${name}`, {});
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
}

let Api = {
    credentials: () => {
        let host = localStorage.getItem('PRELUDE_SERVER') || 'http://localhost:3000';
        let account = localStorage.getItem('PRELUDE_ACCOUNT_ID') || 'prelude';
        let token = localStorage.getItem('PRELUDE_ACCOUNT_TOKEN') || 'goober';
        return {host: host, account: account, token: token};
    },
    login: () => {
        const creds = Api.credentials();
        Api.ttp = new TTPRoutes(creds.host, creds.account, creds.token);
        Api.dcf = new DCFRoutes(creds.host, creds.account, creds.token);
    },
    async ping(host, account, token) {
        const headers = {account: account, token: token};
        return fetch(`${host}/ping`, {headers: headers});
    }
};

export default Api;