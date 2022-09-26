import Api from "/client/js/api.js";
import Templates from "/client/js/dom/templates.js";
import RightClick from "/client/js/dom/rightclick.js";
import Server from "/client/js/plugins/server.js";
import Code from "/client/js/screens/code.js";

let Page = {
    id: null,
    screens: {
        code: new Code(),
    },
    build: () => {
        $('#manifest').empty();
        $('#plugins').empty();

        Api.ttp.manifest().then(manifest => {
            Object.values(manifest).forEach(ttp => {
                Page.addTTP(ttp);
            });
        }).finally(() => {
            RightClick.attach();
            Page.addPlugin(new Server());
            $('#spinner').hide();
        });
    },
    show: (id=null, data=null) => {
        Page.id = id;
        $('#screen-code').show();
        Page.screens.code.write(data);
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
            Api.ttp.save({name: 'Change me'}).then(ttp => {
                let template = Page.addTTP(ttp);
                template.dom.find('#ttp-name').attr('contentEditable', 'true').focus();
            });
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
    }
};

export default Page;