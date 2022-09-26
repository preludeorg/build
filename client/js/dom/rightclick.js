import Api from "../api";

let RightClick = {
    attach: () => {
        $(function () {
            $.contextMenu({
                selector: '.ttp-template',
                callback: function (key, options) {
                    if (key === 'delete') {
                        Api.ttp.delete($(this).find('#ttp-name').data('id')).then(() => {
                            $(this).remove();
                        });
                    } else if (key === 'rename') {
                        $(this).find('#ttp-name').attr('contentEditable', 'true').focus();
                    } else if (key.startsWith('!')) {
                        const classification = key.substring(key.indexOf('!') + 1);
                        Api.ttp.save({id: Page.id, classification: classification}).then(() => {
                            let menu = $('ul.context-menu-list');
                            menu.find(`li.context-menu-item.context-menu-icon`)
                                .removeClass('context-menu-active');
                            menu.find(`li.context-menu-item.context-menu-icon.context-menu-icon-${key.substring(key.indexOf('!') + 1)}`)
                                .addClass('context-menu-active');
                            $(`${options.selector}`).find('.ttp-classification')
                                .attr("src", `/client/assets/classifications/${classification}.svg`);
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
        })
        $(function () {
            $.contextMenu({
                selector: '.dcf-template',
                callback: function (key, options) {
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
        })
    }
}

export default RightClick;