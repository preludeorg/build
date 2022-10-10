import Api from "api.js";
import Templates from "dom/templates.js";
import RightClick from "dom/rightclick.js";
import Code from "screens/code.js";

let Page = {
    id: null,
    screens: {
        code: new Code(),
    },
    dcfTabs: [],
    build: () => {
        Api.ttp.manifest().then(manifest => {
            Object.values(manifest).forEach(ttp => {
                Page.addTTP(ttp);
            });
        }).finally(() => {
            RightClick.attach();
            $('#spinner').hide();
        });
    },
    show: (id=null, data=null) => {
        Page.id = id;
        $('.screen').each(function(i, obj) { $(this).hide() });
        $('#screen-code').show();
        $('#dcf-results').empty();
        $('.panel-bottom').show();
        $('.splitter-horizontal').show();
        $(".panel-top").resizable('destroy');
        $(".panel-top").resizable({
            handleSelector: ".splitter-horizontal",
            resizeWidth: false,
            onDragEnd: function (event, el, opt) {
                Page.screens.code.resize(data);
            }
        });
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