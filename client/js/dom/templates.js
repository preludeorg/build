import Api from "/client/js/api.js";
import Page from "/client/js/page.js";

class TTP {
    constructor(ttp) {
        this.ttp = ttp;
        this.dom = $('#ttp-template').clone()
            .data('tokens', JSON.stringify(this.ttp).toLowerCase())
            .show();
    }
    write() {
        let self = this;
        this.dom.find('#ttp-name').data('id', this.ttp.id).text(this.ttp.name)
            .blur(function() {
                Api.ttp.save({id: self.ttp.id, name: $(this).text()}).then(() => {
                    $(this).attr('contentEditable', 'false');
                });
            }).on('keydown',function(e){
                let key = e.keyCode || e.charCode;
                if (key === 13) {
                    $(this).blur();
                }
            });
        this.dom.find('.ttp-classification')
            .attr("src",`/client/assets/classifications/${this.ttp.classification}.svg`);
        $('ul.context-menu-list').find(`li.context-menu-item.context-menu-icon.context-menu-icon-${this.ttp.classification}`)
            .addClass('context-menu-active');
    }
    setClick() {
        this.dom.on('click', (ev) => {
            if (!$(ev.target).hasClass("vertical-ellipsis")) {
                this.dom.toggleClass('ttp-highlight');
            }
        })
        this.dom.find('#ttp-row').on('click', (ev) => {
            ev.preventDefault();

            this.dom.find('.dropdown-arrow').toggleClass('dropdown-arrow-active');
            this.dom.find('img').toggleClass('image-active');

            const visibleDCF = this.dom.find('#dcf-listing');
            if (visibleDCF.children().length > 0) {
                visibleDCF.empty();
                return;
            }
            Api.ttp.get(this.ttp.id).then(entry => {
                entry.dcf.forEach(name => {
                    const dcf = new DCF(name);
                    dcf.write();
                    dcf.setClick();
                    this.dom.find('#dcf-listing').append(dcf.dom);
                });
                Page.id = this.ttp.id;
            }).catch(err => {
                console.error(err);
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
        this.dom = $('#dcf-template').clone().show();
    }
    write() {
        this.dom.find('#platform-logo')
            .attr("src",`/client/assets/logos/${this.platform.substr(0, this.platform.indexOf('-'))}.svg`);
        this.dom.find('#platform').data('name', this.name).text(this.platform);
    }
    setClick() {
        this.dom.on('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();

            $('.dcf-template').removeClass('dcf-highlight');
            this.dom.addClass('dcf-highlight');

            Api.dcf.get(this.name).then(dcf => {
                Page.show(this.id, {name: this.name, code: dcf.code});
            }).catch(err => {
                console.error(err);
            });
        });
    }
}

class Plugin {
    constructor(plugin) {
        this.plugin = plugin;
        this.dom = $('<li>').append(this.plugin.name());
    }
    setClick() {
        this.dom.on('click', (ev) => {
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

let Templates = {
    ttp: (ttp) => {
        return new TTP(ttp);
    },
    dcf: (name) => {
        return new DCF(name);
    },
    plugin: (plugin) => {
        return new Plugin(plugin);
    }
};

export default Templates;