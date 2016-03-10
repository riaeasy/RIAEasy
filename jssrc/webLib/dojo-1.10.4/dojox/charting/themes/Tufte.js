//>>built

define("dojox/charting/themes/Tufte", ["../SimpleTheme", "dojo/_base/Color", "./common"], function (SimpleTheme, Color, themes) {
    themes.Tufte = new SimpleTheme({chart:{stroke:null, fill:"inherit"}, plotarea:{stroke:null, fill:"transparent"}, axis:{stroke:{width:1, color:"#ccc"}, majorTick:{color:"black", width:1, length:5}, minorTick:{color:"#666", width:1, length:2}, font:"normal normal normal 8pt Tahoma", fontColor:"#999"}, series:{outline:null, stroke:{width:1, color:"black"}, fill:new Color([59, 68, 75, 0.85]), font:"normal normal normal 7pt Tahoma", fontColor:"#717171"}, marker:{stroke:{width:1, color:"black"}, fill:"#333", font:"normal normal normal 7pt Tahoma", fontColor:"black"}, colors:[Color.fromHex("#8a8c8f"), Color.fromHex("#4b4b4b"), Color.fromHex("#3b444b"), Color.fromHex("#2e2d30"), Color.fromHex("#000000")]});
    return themes.Tufte;
});

