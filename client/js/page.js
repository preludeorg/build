import Api from "api.js";
import Templates from "dom/templates.js";
import RightClick from "dom/rightclick.js";
import Code from "screens/code.js";
import { hideElements, showElements } from "./dom/helpers";


let Page = {
    id: null,
    screens: {
        code: new Code(),
    },
    build: () => {
        Api.ttp.manifest().then(manifest => {
            Object.values(manifest).forEach(ttp => {
                Page.addTTP(ttp);
            });
        }).finally(() => {
            RightClick.attach();
            hideElements('#spinner')
        });
    },
    show: (id = null, data = null) => {
        Page.id = id;
        hideElements('.screen')
        document.querySelector('#screen-code').style.display = "block"
        document.querySelector('#dcf-results').replaceChildren();
        showElements('.panel-bottom')
        showElements('.splitter-horizontal')

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
        document.querySelector('#manifest').prepend(template.dom);
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
        document.querySelector('#plugins').append(template.dom);
    },
    listen() {
        document.querySelector('#add-ttp').addEventListener('click', function () {
            Api.ttp.save({ name: 'Change me' }).then(ttp => {
                let template = Page.addTTP(ttp);
                const nameElem = template.dom.querySelector('#ttp-name')
                nameElem.setAttribute('contentEditable', 'true');
                nameElem.focus()
            });
        });

        document.querySelector('#deploy-dcf').addEventListener('click', function () {
            Page.screens.code.test();
        });

        document.querySelector('#manifest-filter').addEventListener("keyup", function (e) {
            let filter = e.target.value.toLowerCase();

            document.querySelectorAll("#manifest > li").forEach(el => {
                let match = el.dataset.tokens.includes(filter)
                if (match) {
                    el.style.display = ""
                } else {
                    el.style.display = "none"
                }
            })
        });

        document.querySelector('#dcf-close').addEventListener('click', function () {
            hideElements('.screen')
            hideElements('.panel-bottom')
            hideElements('.splitter-horizontal')
            showElements('#screen-welcome')
        })
    }
};

export default Page;
