import Api from "api.js";
import Page from "page.js";

let openContextMenu = (selector, trigger='right') => {
    $.contextMenu({
        selector: selector,
        trigger: trigger,
        callback: function (key, options) {
            Page.id = $(this).find('#ttp-name').data('id');
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
                    $(this).find('.ttp-classification').attr("src", `/static/assets/classifications/${classification}.svg`);
                });
            } else {
                const name = `${Page.id}_${key}`;
                const ext = key.split('.').pop();
                const code = Page.screens.code.language(ext).bootstrap();
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
                    '!undefined': {name: 'Unclassified', icon: 'undefined'},
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
            'linux-python.py': {name: 'Attach Linux - python', icon: 'linux'},
            'linux-x86.c': {name: 'Attach Linux - x86', icon: 'linux'},
            'darwin-python.py': {name: 'Attach MacOS - python', icon: 'apple'},
            'darwin-x86.c': {name: 'Attach MacOS - x86', icon: 'apple'},
            'darwin-arm64.c': {name: 'Attach MacOS - arm64', icon: 'apple'},
            sep2: '---------',
            rename: {name: 'Rename', icon: 'edit'},
            delete: {name: 'Delete', icon: 'delete'}
        }
    });
}

let RightClick = {
    attach: () => {
        $(function () {
            openContextMenu('.ttp-template')
        })
        $(function () {
            openContextMenu('.vertical-ellipsis', 'left')
        })
        $(function () {
            $.contextMenu({
                selector: '.dcf-template',
                callback: function (key, options) {
                    if (key === 'delete') {
                        Api.dcf.delete($(this).find('#platform').data('name')).then(() => {
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