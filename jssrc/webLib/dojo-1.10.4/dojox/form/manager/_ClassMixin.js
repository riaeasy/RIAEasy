//>>built

define("dojox/form/manager/_ClassMixin", ["dojo/_base/lang", "dojo/_base/kernel", "dojo/dom-class", "./_Mixin", "dojo/_base/declare"], function (lang, dojo, domClass, _Mixin, declare) {
    var fm = lang.getObject("dojox.form.manager", true), aa = fm.actionAdapter, ia = fm.inspectorAdapter;
    return declare("dojox.form.manager._ClassMixin", null, {gatherClassState:function (className, names) {
        var result = this.inspect(ia(function (name, node) {
            return domClass.contains(node, className);
        }), names);
        return result;
    }, addClass:function (className, names) {
        this.inspect(aa(function (name, node) {
            domClass.add(node, className);
        }), names);
        return this;
    }, removeClass:function (className, names) {
        this.inspect(aa(function (name, node) {
            domClass.remove(node, className);
        }), names);
        return this;
    }});
});

