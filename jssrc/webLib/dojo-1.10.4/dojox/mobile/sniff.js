//>>built

define("dojox/mobile/sniff", ["dojo/_base/kernel", "dojo/sniff"], function (kernel, has) {
    kernel.deprecated("dojox/mobile/sniff", "Use dojo/sniff instead", "2.0");
    has.add("iphone", has("ios"));
    return has;
});

