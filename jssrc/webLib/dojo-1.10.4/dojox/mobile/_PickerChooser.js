//>>built

define("dojox/mobile/_PickerChooser", ["dojo/_base/lang", "dojo/_base/window"], function (lang, win) {
    return {load:function (id, parentRequire, loaded) {
        var dm = win.global._no_dojo_dm || lang.getObject("dojox.mobile", true);
        parentRequire([(dm.currentTheme === "android" || dm.currentTheme === "holodark" ? "./ValuePicker" : "./SpinWheel") + id], loaded);
    }};
});

