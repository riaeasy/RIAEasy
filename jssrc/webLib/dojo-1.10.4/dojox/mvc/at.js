//>>built

define("dojox/mvc/at", ["dojo/_base/kernel", "dojo/_base/lang", "./sync", "./_atBindingExtension"], function (kernel, lang, sync) {
    kernel.experimental("dojox.mvc");
    var at = function (target, targetProp) {
        return {atsignature:"dojox.mvc.at", target:target, targetProp:targetProp, bindDirection:sync.both, direction:function (bindDirection) {
            this.bindDirection = bindDirection;
            return this;
        }, transform:function (converter) {
            this.converter = converter;
            return this;
        }, equals:function (equals) {
            this.equalsCallback = equals;
            return this;
        }};
    };
    at.from = sync.from;
    at.to = sync.to;
    at.both = sync.both;
    return lang.setObject("dojox.mvc.at", at);
});

