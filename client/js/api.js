class Routes {
    constructor(host, account, token) {
        this.host = host;
        this.headers = {
            'account': account,
            'token': token,
            'content-type': 'application/json'
        }
    }
    async handleRoute(route, options) {
        const promise = fetch(route, options).catch(err => {
            console.error(`Error fetching ${route}: ${err}`);
            return {};
        });
        return await promise.then(res => res.json());
    }
}

class TTPRoutes extends Routes {
    constructor(host, account, token) {
        super(host, account, token);
    }
    async manifest() {
        return await this.handleRoute(`${this.host}/manifest`, {headers: this.headers});
    }
    async get(id) {
        return await this.handleRoute(`${this.host}/manifest/${id}`, {headers: this.headers});
    }
    async save(procedure) {
        const data = JSON.stringify(procedure);
        return await this.handleRoute(`${this.host}/manifest`, {
            method: 'PUT',
            body: data,
            headers: this.headers
        });
    }
    async delete(id) {
        return await this.handleRoute(`${this.host}/manifest/${id}`, {method: 'DELETE', headers: this.headers});
    }
    async history(name) {
        return await this.handleRoute(`${this.host}/probe/${name}`, {headers: this.headers});
    }
}

class DCFRoutes extends Routes {
    constructor(host, account, token) {
        super(host, account, token);
    }
    async get(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}`, {headers: this.headers});
    }
    async save(name, code) {
        const data = JSON.stringify({code: code});
        return await this.handleRoute(`${this.host}/dcf/${name}`, {
            method: 'POST',
            body: data,
            headers: this.headers
        });
    }
    async delete(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}`, {method: 'DELETE', headers: this.headers});
    }
    async submit(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}/submit`,{
            method: 'POST',
            body: JSON.stringify({}),
            headers: this.headers
        });
    }
}

let Api = {
    login: (host, account, token) => {
        Api.ttp = new TTPRoutes(host, account, token);
        Api.dcf = new DCFRoutes(host, account, token);
    },
    async ping(host, account, token) {
        const headers = {account: account, token: token};
        return fetch(`${host}/ping`, {headers: headers});
    }
};

export default Api;