//>>built

define("dojo/AdapterRegistry", ["./_base/kernel", "./_base/lang"], function (dojo, lang) {
    var AdapterRegistry = dojo.AdapterRegistry = function (returnWrappers) {
        this.pairs = [];
        this.returnWrappers = returnWrappers || false;
    };
    lang.extend(AdapterRegistry, {register:function (name, check, wrap, directReturn, override) {
        this.pairs[((override) ? "unshift" : "push")]([name, check, wrap, directReturn]);
    }, match:function () {
        for (var i = 0; i < this.pairs.length; i++) {
            var pair = this.pairs[i];
            if (pair[1].apply(this, arguments)) {
                if ((pair[3]) || (this.returnWrappers)) {
                    return pair[2];
                } else {
                    return pair[2].apply(this, arguments);
                }
            }
        }
        throw new Error("No match found");
    }, unregister:function (name) {
        for (var i = 0; i < this.pairs.length; i++) {
            var pair = this.pairs[i];
            if (pair[0] == name) {
                this.pairs.splice(i, 1);
                return true;
            }
        }
        return false;
    }});
    return AdapterRegistry;
});

