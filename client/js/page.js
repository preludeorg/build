import Api from "/client/js/api.js";
import Templates from "/client/js/dom/templates.js";
import Servers from "/client/js/plugins/servers.js";
import Code from "/client/js/screens/code.js";

let Page = {
    id: null,
    screens: {
        code: new Code(),
    },
    build: (host, account, token) => {
        $('#manifest').empty();
        $('#plugins').empty();

        Api.attach(host, account, token);
        Api.ttp.manifest().then(manifest => {
            Object.values(manifest).forEach(ttp => {
                Page.addTTP(ttp);
            });
        }).finally(() => {
            Page.addPlugin(new Servers());
            $('#spinner').hide();
        });
    },
    show: (name, id=null, data=null) => {
        Page.id = id;
        $('.screen').each(function(i, obj) { $(this).hide() });
        $(`#screen-${name}`).show();
        Page.screens[name].write(data);
    },
    addTTP: (ttp) => {
        const template = Templates.ttp(ttp);
        template.write();
        template.setClick();
        $('#manifest').prepend(template.dom);
        return template;
    },
    addDCF: (name) => {
        const template = Templates.dcf(name);
        template.write();
        template.setClick();
        return template;
    },
    addPlugin: (plugin) => {
        const template = Templates.plugin(plugin);
        template.setClick();
        $('#plugins').append(template.dom);
    },
    listen() {
        $("#add-ttp").click(function(){
            function uuid() {
                return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            }
            let template = Page.addTTP({id: uuid(), name: 'Change me'});
            template.dom.find('#ttp-name').attr('contentEditable', 'true').focus();
        });
        $("#deploy-dcf").click(function(){
            Page.screens.code.test();
        });
        $('#manifest-filter').keyup(function() {
            let filter = $(this).val().toLowerCase();
            $("#manifest > li").each(function() {
                let match = $(this).data('tokens').includes(filter);
                if (match)  {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        });
        $(function() {
            $.contextMenu({
                selector: '.ttp-template',
                callback: function(key, options) {
                    if (key === 'delete') {
                        Api.ttp.delete($(this).find('#ttp-name').data('id')).then(() => {
                            $(this).remove();
                        });
                    } else if (key === 'rename') {
                        $(this).find('#ttp-name').attr('contentEditable', 'true').focus();
                    } else if (key.startsWith('!')) {
                        const classification = key.substring(key.indexOf('!')+1);
                        Api.ttp.save({id: Page.id, classification: classification}).then(() => {
                            let menu = $('ul.context-menu-list');
                            menu.find(`li.context-menu-item.context-menu-icon`)
                                .removeClass('context-menu-active');
                            menu.find(`li.context-menu-item.context-menu-icon.context-menu-icon-${key.substring(key.indexOf('!')+1)}`)
                                .addClass('context-menu-active');
                            $(`${options.selector}`).find('.ttp-classification')
                                .attr("src",`/client/assets/classifications/${classification}.svg`);
                        });
                    } else {
                        const name = `${Page.id}_${key}`;
                        const code = Page.screens.code.mode('c').bootstrap();
                        Api.dcf.save(name, code).then(() => {
                            const template = Page.addDCF(name);
                            $(this).find('#dcf-listing').append(template.dom);
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                },
                items: {
                    fold1: {
                        name: "Apply classification",
                        items: {
                            '!unknown': {name: 'Unclassified', icon: 'unknown'},
                            '!security': {name: 'Security', icon: 'security'},
                            '!network': {name: 'Network', icon: 'network'},
                            '!user': {name: 'User Account', icon: 'user'},
                            '!fs': {name: 'File System', icon: 'fs'},
                            '!application': {name: 'Application', icon: 'application'},
                            '!process': {name: 'Process', icon: 'process'},
                            '!behavior': {name: 'Behavior', icon: 'behavior'}
                        }
                    },
                    sep1: '---------',
                    'linux-x86.c': {name: 'Add DCF - Linux (x86)', icon: 'linux'},
                    'darwin-x86.c': {name: 'Add DCF - MacOS (x86)', icon: 'apple'},
                    'darwin-arm64.c': {name: 'Add DCF - MacOS (arm64)', icon: 'apple'},
                    sep2: '---------',
                    rename: {name: 'Rename', icon: 'edit'},
                    delete: {name: 'Delete', icon: 'delete'}
                }
            });
        });
        $(function() {
            $.contextMenu({
                selector: '.dcf-template',
                callback: function(key, options) {
                    if (key === 'delete') {
                        Api.dcf.save($(this).find('#platform').data('name')).then(() => {
                            $(this).remove();
                        });
                    }
                },
                items: {
                    delete: {name: 'Delete', icon: 'delete'}
                }
            });
        });
    }
};

export default Page;