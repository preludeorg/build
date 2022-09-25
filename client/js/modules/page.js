import Api from "./api.js";

export default class Page {
    constructor() {
        this.id = null;
        Api.attach('http://localhost:3000/prelude', 'gogo');
    }
    build() {
        Api.ttp.manifest().then(manifest => {
            Object.values(manifest).forEach(ttp => {
                this.addTTP(ttp);
            });
        }).finally(() => {
            $('#spinner').hide();
        });
    }
    addTTP(ttp) {
        console.log(ttp)
    }
    addDCF(name) {

    }
    listen() {
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
}