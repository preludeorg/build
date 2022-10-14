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
                name: "New Linux test",
                items: {
                    'linux.c': {name: 'linux.c', icon: 'linux'},
                    'linux.cs': {name: 'linux.cs', icon: 'linux'},
                    'linux.swift': {name: 'linux.swift', icon: 'linux'}
                }
            },
            fold2: {
                name: "New MacOS test",
                items: {
                    'darwin.c': {name: 'darwin.c', icon: 'apple'},
                    'darwin.cs': {name: 'darwin.cs', icon: 'apple'},
                    'darwin.swift': {name: 'darwin.swift', icon: 'apple'}
                }
            },
            sep1: '---------',
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