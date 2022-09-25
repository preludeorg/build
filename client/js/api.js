class Routes {
    constructor(host, token) {
        this.host = host;
        this.headers = {
            token: token
        };
    }
    async handleRoute(route, options) {
        const promise = fetch(route, options).catch(err => {
            console.error(`Error fetching ${route}: ${err}`);
            return {}
        });
        return await promise.then(res => res.json());
    }
}

class TTPRoutes extends Routes {
    constructor(host, token) {
        super(host, token);
    }
    async manifest() {
        return await this.handleRoute(`${this.host}/manifest`, {headers: this.headers});
    }
    async get(id) {
        return await this.handleRoute(`${this.host}/manifest/${id}`, {headers: this.headers});
    }
    async save(procedure) {
        const data = JSON.stringify(procedure);
        return await this.handleRoute(`${this.host}/manifest`, {method: 'PUT', body: data, headers: this.headers});
    }
    async delete(id) {
        return await this.handleRoute(`${this.host}/manifest/${id}`, {method: 'DELETE', headers: this.headers});
    }
    async history(name) {
        return await this.handleRoute(`${this.host}/probe/${name}`, {headers: this.headers});
    }
}

class DCFRoutes extends Routes {
    constructor(host, token) {
        super(host, token);
    }
    async get(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}`, {headers: this.headers});
    }
    async save(name, code) {
        const data = {code: code};
        return await this.handleRoute(`${this.host}/dcf/${name}`, {method: 'POST', body: data, headers: this.headers});
    }
    async delete(name) {
        return await this.handleRoute(`${this.host}/dcf/${name}`, {method: 'DELETE', headers: this.headers});
    }
    async run(name, code) {
        return await this.handleRoute(
            `${this.host}/dcf/${name}/run`,
            {method: 'POST', body: code, headers: this.headers});
    }
}

let Api = {
    attach: (host, token) => {
        Api.ttp = new TTPRoutes(host, token);
        Api.dcf = new DCFRoutes(host, token);
    }
};

export default Api;