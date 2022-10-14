
import Api from "api.js";
import Page from "page.js";

class TTP {
    constructor(ttp) {
        this.ttp = ttp;

        this.dom = document.querySelector("#ttp-template")
            .content
            .firstElementChild
            .cloneNode(true)

        this.dom.dataset.tokens = JSON.stringify(this.ttp).toLowerCase()
        this.allowToggle = true
    }

    write() {
        let self = this;
        const nameElement = this.dom.querySelector('#ttp-name')
        console.log(this.ttp)
        nameElement.dataset.id = this.ttp.id
        nameElement.textContent = this.ttp.name

        nameElement.addEventListener('blur', (e) => {
            Api.ttp.save({ id: self.ttp.id, name: e.target.textContent }).then(() => {
                e.target.setAttribute('contentEditable', false)
            });
        });

        nameElement.addEventListener('keydown', (e) => {
            let key = e.keyCode || e.charCode;
            if (key === 13) {
                e.target.blur()
            }
        });
    }

    setClick() {
        this.dom.querySelector('#ttp-row').addEventListener('click', (ev) => {
            ev.preventDefault();

            if (!this.allowToggle) {
                return
            }

            this.allowToggle = false;

            Page.id = this.ttp.id;
            this.dom.classList.toggle('ttp-highlight');
            this.dom.querySelector('.dropdown-arrow').classList.toggle('dropdown-arrow-active');
            this.dom.querySelector('img').classList.toggle('image-active');

            const visibleDCF = this.dom.querySelector('#dcf-listing');
            if (visibleDCF.children.length > 0) {
                visibleDCF.replaceChildren();
                this.allowToggle = true
                return;
            }

            Api.ttp.get(this.ttp.id).then(entry => {
                entry.dcf.forEach(name => {
                    const dcf = new DCF(name);
                    dcf.write();
                    dcf.setClick();
                    this.dom.querySelector('#dcf-listing').append(dcf.dom);
                });
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                this.allowToggle = true
            });
        });
    }
}

class DCF {
    constructor(name) {
        const [id, platform] = name.split('_');
        this.name = name;
        this.id = id;
        this.platform = platform;
        this.dom = document.querySelector("#dcf-template")
            .content
            .firstElementChild
            .cloneNode(true)
    }
    write() {
        this.dom.querySelector('#platform-logo')
            .setAttribute("src", `/static/assets/logos/${this.platform.substr(0, this.platform.indexOf('-'))}.svg`);
        const platformElement = this.dom.querySelector('#platform')
        platformElement.dataset.name = this.name
        platformElement.textContent = this.platform
    }

    setClick() {
        this.dom.addEventListener('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();

            document.querySelectorAll('.dcf-template').forEach(el => { el.classList.remove("dcf-highlight") })
            this.dom.classList.add('dcf-highlight');

            Api.dcf.get(this.name).then(dcf => {
                Page.show(this.id, { name: this.name, code: dcf.code });
            }).catch(err => {
                console.error(err);
            });
        });
    }
}

class Plugin {
    constructor(plugin) {
        this.plugin = plugin;
        this.dom = document.createElement("li")
        this.dom.append(this.plugin.name());
    }
    setClick() {
        this.dom.addEventListener('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();

            const sidebar = $('#plugin-template');
            if (sidebar.is(":visible")) {
                sidebar.hide();
            } else {
                sidebar.show();
                this.plugin.write(sidebar);
            }
        });
    }
}

class Tab {
    constructor(name) {
        this.name = name.split('_')[1];
        this.platform = this.name.split('-')[0];
    }
    write() {
        $('#dcf-name').text(this.name);
        $('#dcf-platform').attr("src", `/static/assets/logos/${this.platform}.svg`);
    }
}

let Templates = {
    ttp: (ttp) => {
        return new TTP(ttp);
    },
    dcf: (name) => {
        return new DCF(name);
    },
    plugin: (plugin) => {
        return new Plugin(plugin);
    },
    tab: (name) => {
        return new Tab(name);
    }
};

export default Templates;
