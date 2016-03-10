//>>built

define("dijit/form/DataList", ["dojo/_base/declare", "dojo/dom", "dojo/_base/lang", "dojo/query", "dojo/store/Memory", "../registry"], function (declare, dom, lang, query, MemoryStore, registry) {
    function toItem(option) {
        return {id:option.value, value:option.value, name:lang.trim(option.innerText || option.textContent || "")};
    }
    return declare("dijit.form.DataList", MemoryStore, {constructor:function (params, srcNodeRef) {
        this.domNode = dom.byId(srcNodeRef);
        lang.mixin(this, params);
        if (this.id) {
            registry.add(this);
        }
        this.domNode.style.display = "none";
        this.inherited(arguments, [{data:query("option", this.domNode).map(toItem)}]);
    }, destroy:function () {
        registry.remove(this.id);
    }, fetchSelectedItem:function () {
        var option = query("> option[selected]", this.domNode)[0] || query("> option", this.domNode)[0];
        return option && toItem(option);
    }});
});

