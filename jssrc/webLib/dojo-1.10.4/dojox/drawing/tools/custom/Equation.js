//>>built

define("dojox/drawing/tools/custom/Equation", ["dojo/_base/lang", "../../util/oo", "../../manager/_registry", "../TextBlock"], function (lang, oo, registry, TextBlock) {
    var Equation = oo.declare(TextBlock, function (options) {
    }, {customType:"equation"});
    lang.setObject("dojox.drawing.tools.custom.Equation", Equation);
    Equation.setup = {name:"dojox.drawing.tools.custom.Equation", tooltip:"Equation Tool", iconClass:"iconEq"};
    registry.register(Equation.setup, "tool");
    return Equation;
});

