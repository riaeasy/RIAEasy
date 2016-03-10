//>>built

define("dojox/mvc/_base", ["dojo/_base/kernel", "dojo/_base/lang", "./getStateful", "./StatefulModel", "./Bind", "./_DataBindingMixin", "./_patches"], function (kernel, lang, getStateful, StatefulModel) {
    kernel.experimental("dojox.mvc");
    var mvc = lang.getObject("dojox.mvc", true);
    mvc.newStatefulModel = function (args) {
        if (args.data) {
            return getStateful(args.data, StatefulModel.getStatefulOptions);
        } else {
            if (args.store && lang.isFunction(args.store.query)) {
                var model;
                var result = args.store.query(args.query);
                if (result.then) {
                    return (result.then(function (data) {
                        model = getStateful(data, StatefulModel.getStatefulOptions);
                        model.store = args.store;
                        return model;
                    }));
                } else {
                    model = getStateful(result, StatefulModel.getStatefulOptions);
                    model.store = args.store;
                    return model;
                }
            }
        }
    };
    return mvc;
});

