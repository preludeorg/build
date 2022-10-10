import Api from "api.js";
import Page from "page.js";

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
    }
    setClick() {
        this.dom.on('click', (ev) => {
            if (!$(ev.target).hasClass("vertical-ellipsis")) {
                this.dom.toggleClass('ttp-highlight');
            }
        })
        this.dom.find('#ttp-row').on('click', (ev) => {
            ev.preventDefault();

            Page.id = this.ttp.id;
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
            .attr("src",`/static/assets/logos/${this.platform.substr(0, this.platform.indexOf('-'))}.svg`);
        this.dom.find('#platform').data('name', this.name).text(this.platform);
    }
    setClick() {
        this.dom.on('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();

            $('.dcf-template').removeClass('dcf-highlight');
            this.dom.addClass('dcf-highlight');

            Api.dcf.get(this.name).then(dcf => {
                if (!Page.dcfTabs.includes(this.name)) {
                    let tab = new Tab(this.name);
                    tab.write(this, tab);
                    tab.setClick(this, tab);  
                }        
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

class Tab {
    constructor(name) {
        this.name = name.split('_')[1];
        this.platform = this.name.split('-')[0];
        this.dom = $('#dcf-tab-template').clone().show();
    }
    write(dcf, tab) {
        $('#tab-container').prepend(tab.dom);     
        Page.dcfTabs.push(dcf.name);

        $('#dcf-name').data('name', this.name).text(this.name);
        $('#dcf-platform').attr("src",`/static/assets/logos/${this.platform}.svg`);
    }
    setClick(dcf, tab) {
        this.dom.find("#dcf-tab-info").on('click', (ev) => {
            Api.dcf.get(dcf.name).then(dcf => {
                Page.show(this.name.split('_')[0], {name: this.name, code: dcf.code});
            }).catch(err => {
                console.error(err);
            });
        })
        this.dom.find("#dcf-close").on('click', (ev) => {
            if ($('#tab-container').children("li").length === 1) {
                $('.screen').each(function(i, obj) { $(this).hide() });
                $('.panel-bottom').hide();
                $('.splitter-horizontal').hide();
                $('#screen-welcome').show();
            }
            Page.dcfTabs.pop(tab.name);
            this.dom.remove();
        })
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