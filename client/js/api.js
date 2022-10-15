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
        options['headers'] = Object.assign(options['headers'] || {}, this.headers);
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
    async manifest(nocache=false) {
        let options = {};
        if (nocache) {
            options['headers'] = {'nocache': '-'};
        }
        return await this.handleRoute(`${this.host}/manifest`, options);
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
    async list() {
        let options = {'headers': {'nocache': '-'}};
        return await this.handleRoute(`${this.host}/dcf`, options);
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
        return await this.handleRoute(`${this.host}/dcf/${name}`, {method: 'DELETE'}, false);
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
        const host = localStorage.getItem('PRELUDE_SERVER');
        const account = localStorage.getItem('PRELUDE_ACCOUNT_ID');
        const token = localStorage.getItem('PRELUDE_ACCOUNT_TOKEN');
        return {
            host: host || 'http://localhost:3000',
            account: account || '',
            token: token || 'goober'
        };
    },
    setCredentials: (host, account, token) => {
        localStorage.setItem('PRELUDE_SERVER', host);
        localStorage.setItem('PRELUDE_ACCOUNT_ID', account);
        localStorage.setItem('PRELUDE_ACCOUNT_TOKEN', token);
    },
    login: (callback) => {
        const creds = Api.credentials();
        Api.register(creds).then(res => {
            const accountID = res['account_id'];
            Api.setCredentials(creds.host, accountID, creds.token);
            Api.ttp = new TTPRoutes(creds.host, accountID, creds.token);
            Api.dcf = new DCFRoutes(creds.host, accountID, creds.token);
            callback();
        }).catch(() => {
            $('#spinner').hide();
        });
    },
    register: (creds) => {
        const routes = new Routes(creds.host, creds.account, creds.token);
        return routes.handleRoute(`${creds.host}/register`, {method: 'POST'}, true);
    },
    async ping(host, account, token) {
        const headers = {account: account, token: token};
        return fetch(`${host}/ping`, {headers: headers});
    }
};

export default Api;