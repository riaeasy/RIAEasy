//>>built

define("dojox/robot/recorder", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.robot.recorder");
    dojo.experimental("dojox.robot.recorder");
    (function () {
        var KEYPRESS_MAXIMUM_DELAY = 1000;
        var MOUSEMOVE_MAXIMUM_DELAY = 500;
        var MAXIMUM_DELAY = 10000;
        var commands = [];
        var testNumber = 0;
        var startTime = null;
        var prevTime = null;
        var start = function () {
            alert("Started recording.");
            commands = [];
            startTime = new Date();
            prevTime = new Date();
        };
        var addCommand = function (name, args) {
            if (startTime == null || name == "doh.robot.keyPress" && args[0] == dojo.keys.ENTER && eval("(" + args[2] + ")").ctrl && eval("(" + args[2] + ")").alt) {
                return;
            }
            var dt = Math.max(Math.min(Math.round((new Date()).getTime() - prevTime.getTime()), MAXIMUM_DELAY), 1);
            if (name == "doh.robot.mouseMove") {
                args[2] = dt;
            } else {
                args[1] = dt;
            }
            commands.push({name:name, args:args});
            prevTime = new Date();
        };
        var _optimize = function () {
            var c = commands;
            if (c[0].name == "doh.robot.keyPress" && (c[0].args[0] == dojo.keys.ENTER || c[0].args[0] == 77)) {
                c.splice(0, 1);
            }
            for (var i = c.length - 1; (i >= c.length - 2) && (i >= 0); i--) {
                if (c[i].name == "doh.robot.keyPress" && c[i].args[0] == dojo.keys.ALT || c[i].args[0] == dojo.keys.CTRL) {
                    c.splice(i, 1);
                }
            }
            for (i = 0; i < c.length; i++) {
                var next, nextdt;
                if (c[i + 1] && c[i].name == "doh.robot.mouseMove" && c[i + 1].name == c[i].name && c[i + 1].args[2] < MOUSEMOVE_MAXIMUM_DELAY) {
                    next = c[i + 1];
                    nextdt = 0;
                    while (next && next.name == c[i].name && next.args[2] < MOUSEMOVE_MAXIMUM_DELAY) {
                        c.splice(i + 1, 1);
                        nextdt += next.args[2];
                        c[i].args[0] = next.args[0];
                        c[i].args[1] = next.args[1];
                        next = c[i + 1];
                    }
                    c[i].args[3] = nextdt;
                } else {
                    if (c[i + 1] && c[i].name == "doh.robot.mouseWheel" && c[i + 1].name == c[i].name && c[i + 1].args[1] < MOUSEMOVE_MAXIMUM_DELAY) {
                        next = c[i + 1];
                        nextdt = 0;
                        while (next && next.name == c[i].name && next.args[1] < MOUSEMOVE_MAXIMUM_DELAY) {
                            c.splice(i + 1, 1);
                            nextdt += next.args[1];
                            c[i].args[0] += next.args[0];
                            next = c[i + 1];
                        }
                        c[i].args[2] = nextdt;
                    } else {
                        if (c[i + 2] && c[i].name == "doh.robot.mouseMoveAt" && c[i + 2].name == "doh.robot.scrollIntoView") {
                            var temp = c.splice(i + 2, 1)[0];
                            c.splice(i, 0, temp);
                        } else {
                            if (c[i + 1] && c[i].name == "doh.robot.mousePress" && c[i + 1].name == "doh.robot.mouseRelease" && c[i].args[0] == c[i + 1].args[0]) {
                                c[i].name = "doh.robot.mouseClick";
                                c.splice(i + 1, 1);
                                if (c[i + 1] && c[i + 1].name == "doh.robot.mouseClick" && c[i].args[0] == c[i + 1].args[0]) {
                                    c.splice(i + 1, 1);
                                }
                            } else {
                                if (c[i + 1] && c[i - 1] && c[i - 1].name == "doh.robot.mouseMoveAt" && c[i].name == "doh.robot.mousePress" && c[i + 1].name == "doh.robot.mouseMove") {
                                    var cmd = {name:"doh.robot.mouseMoveAt", args:[c[i - 1].args[0], 1, 100, c[i - 1].args[3] + 1, c[i - 1].args[4]]};
                                    c.splice(i + 1, 0, cmd);
                                } else {
                                    if (c[i + 1] && ((c[i].name == "doh.robot.keyPress" && typeof c[i].args[0] == "string") || c[i].name == "doh.robot.typeKeys") && c[i + 1].name == "doh.robot.keyPress" && typeof c[i + 1].args[0] == "string" && c[i + 1].args[1] <= KEYPRESS_MAXIMUM_DELAY && !eval("(" + c[i].args[2] + ")").ctrl && !eval("(" + c[i].args[2] + ")").alt && !eval("(" + c[i + 1].args[2] + ")").ctrl && !eval("(" + c[i + 1].args[2] + ")").alt) {
                                        c[i].name = "doh.robot.typeKeys";
                                        c[i].args.splice(3, 1);
                                        next = c[i + 1];
                                        var typeTime = 0;
                                        while (next && next.name == "doh.robot.keyPress" && typeof next.args[0] == "string" && next.args[1] <= KEYPRESS_MAXIMUM_DELAY && !eval("(" + next.args[2] + ")").ctrl && !eval("(" + next.args[2] + ")").alt) {
                                            c.splice(i + 1, 1);
                                            c[i].args[0] += next.args[0];
                                            typeTime += next.args[1];
                                            next = c[i + 1];
                                        }
                                        c[i].args[2] = typeTime;
                                        c[i].args[0] = "'" + c[i].args[0] + "'";
                                    } else {
                                        if (c[i].name == "doh.robot.keyPress") {
                                            if (typeof c[i].args[0] == "string") {
                                                c[i].args[0] = "'" + c[i].args[0] + "'";
                                            } else {
                                                if (c[i].args[0] == 0) {
                                                    c.splice(i, 1);
                                                } else {
                                                    for (var j in dojo.keys) {
                                                        if (dojo.keys[j] == c[i].args[0]) {
                                                            c[i].args[0] = "dojo.keys." + j;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        var toggle = function () {
            if (!startTime) {
                start();
            } else {
                stop();
            }
        };
        var stop = function () {
            var dt = Math.round((new Date()).getTime() - startTime.getTime());
            startTime = null;
            _optimize();
            var c = commands;
            console.log("Stop called. Commands: " + c.length);
            if (c.length) {
                var s = "doh.register('dojox.robot.AutoGeneratedTestGroup',{\n";
                s += "     name: 'autotest" + (testNumber++) + "',\n";
                s += "     timeout: " + (dt + 2000) + ",\n";
                s += "     runTest: function(){\n";
                s += "          var d = new doh.Deferred();\n";
                for (var i = 0; i < c.length; i++) {
                    s += "          " + c[i].name + "(";
                    for (var j = 0; j < c[i].args.length; j++) {
                        var arg = c[i].args[j];
                        s += arg;
                        if (j != c[i].args.length - 1) {
                            s += ", ";
                        }
                    }
                    s += ");\n";
                }
                s += "          doh.robot.sequence(function(){\n";
                s += "               if(/*Your condition here*/){\n";
                s += "                    d.callback(true);\n";
                s += "               }else{\n";
                s += "                    d.errback(new Error('We got a failure'));\n";
                s += "               }\n";
                s += "          }, 1000);\n";
                s += "          return d;\n";
                s += "     }\n";
                s += "});\n";
                var div = document.createElement("div");
                div.id = "dojox.robot.recorder";
                div.style.backgroundColor = "white";
                div.style.position = "absolute";
                var scroll = {y:(window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), x:(window.pageXOffset || (window["dojo"] ? dojo._fixIeBiDiScrollLeft(document.documentElement.scrollLeft) : undefined) || document.body.scrollLeft || 0)};
                div.style.left = scroll.x + "px";
                div.style.top = scroll.y + "px";
                var h1 = document.createElement("h1");
                h1.innerHTML = "Your code:";
                div.appendChild(h1);
                var pre = document.createElement("pre");
                if (pre.innerText !== undefined) {
                    pre.innerText = s;
                } else {
                    pre.textContent = s;
                }
                div.appendChild(pre);
                var button = document.createElement("button");
                button.innerHTML = "Close";
                var connect = dojo.connect(button, "onmouseup", function (e) {
                    dojo.stopEvent(e);
                    document.body.removeChild(div);
                    dojo.disconnect(connect);
                });
                div.appendChild(button);
                document.body.appendChild(div);
                commands = [];
            }
        };
        var getSelector = function (node) {
            if (typeof node == "string") {
                return "'" + node + "'";
            } else {
                if (node.id) {
                    return "'" + node.id + "'";
                } else {
                    var nodes = document.getElementsByTagName(node.nodeName);
                    var i;
                    for (i = 0; i < nodes.length; i++) {
                        if (nodes[i] == node) {
                            break;
                        }
                    }
                    return "function(){ return document.getElementsByTagName('" + node.nodeName + "')[" + i + "]; }";
                }
            }
        };
        var getMouseButtonObject = function (b) {
            return "{left:" + (b == 0) + ", middle:" + (b == 1) + ", right:" + (b == 2) + "}";
        };
        var getModifierObject = function (e) {
            return "{'shift':" + (e.shiftKey) + ", 'ctrl':" + (e.ctrlKey) + ", 'alt':" + (e.altKey) + "}";
        };
        dojo.connect(document, "onkeydown", function (e) {
            if ((e.keyCode == dojo.keys.ENTER || e.keyCode == 77) && e.ctrlKey && e.altKey) {
                dojo.stopEvent(e);
                toggle();
            }
        });
        var lastEvent = {type:""};
        var onmousedown = function (e) {
            if (!e || lastEvent.type == e.type && lastEvent.button == e.button) {
                return;
            }
            lastEvent = {type:e.type, button:e.button};
            var selector = getSelector(e.target);
            var coords = dojo.coords(e.target);
            addCommand("doh.robot.mouseMoveAt", [selector, 0, 100, e.clientX - coords.x, e.clientY - coords.y]);
            addCommand("doh.robot.mousePress", [getMouseButtonObject(e.button - (dojo.isIE ? 1 : 0)), 0]);
        };
        var onclick = function (e) {
            if (!e || lastEvent.type == e.type && lastEvent.button == e.button) {
                return;
            }
            lastEvent = {type:e.type, button:e.button};
            var selector = getSelector(e.target);
            var coords = dojo.coords(e.target);
            addCommand("doh.robot.mouseClick", [getMouseButtonObject(e.button - (dojo.isIE ? 1 : 0)), 0]);
        };
        var onmouseup = function (e) {
            if (!e || lastEvent.type == e.type && lastEvent.button == e.button) {
                return;
            }
            lastEvent = {type:e.type, button:e.button};
            var selector = getSelector(e.target);
            var coords = dojo.coords(e.target);
            addCommand("doh.robot.mouseRelease", [getMouseButtonObject(e.button - (dojo.isIE ? 1 : 0)), 0]);
        };
        var onmousemove = function (e) {
            if (!e || lastEvent.type == e.type && lastEvent.pageX == e.pageX && lastEvent.pageY == e.pageY) {
                return;
            }
            lastEvent = {type:e.type, pageX:e.pageX, pageY:e.pageY};
            addCommand("doh.robot.mouseMove", [e.pageX, e.pageY, 0, 100, true]);
        };
        var onmousewheel = function (e) {
            if (!e || lastEvent.type == e.type && lastEvent.pageX == e.pageX && lastEvent.pageY == e.pageY) {
                return;
            }
            lastEvent = {type:e.type, detail:(e.detail ? (e.detail) : (-e.wheelDelta / 120))};
            addCommand("doh.robot.mouseWheel", [lastEvent.detail]);
        };
        var onkeypress = function (e) {
            if (!e || lastEvent.type == e.type && (lastEvent.charCode == e.charCode && lastEvent.keyCode == e.keyCode)) {
                return;
            }
            lastEvent = {type:e.type, charCode:e.charCode, keyCode:e.keyCode};
            addCommand("doh.robot.keyPress", [e.charOrCode == dojo.keys.SPACE ? " " : e.charOrCode, 0, getModifierObject(e)]);
        };
        var onkeyup = function (e) {
            if (!e || lastEvent.type == e.type && (lastEvent.charCode == e.charCode && lastEvent.keyCode == e.keyCode)) {
                return;
            }
            lastEvent = {type:e.type, charCode:e.charCode, keyCode:e.keyCode};
        };
        dojo.connect(document, "onmousedown", onmousedown);
        dojo.connect(document, "onmouseup", onmouseup);
        dojo.connect(document, "onclick", onclick);
        dojo.connect(document, "onkeypress", onkeypress);
        dojo.connect(document, "onkeyup", onkeyup);
        dojo.connect(document, "onmousemove", onmousemove);
        dojo.connect(document, !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll", onmousewheel);
        dojo.addOnLoad(function () {
            if (dojo.window) {
                dojo.connect(dojo.window, "scrollIntoView", function (node) {
                    addCommand("doh.robot.scrollIntoView", [getSelector(node)]);
                });
            }
        });
        dojo.connect(dojo, "connect", function (widget, event, f) {
            if (widget && (!f || !f._mine)) {
                var hitchedf = null;
                if (event.toLowerCase() == "onmousedown") {
                    hitchedf = dojo.hitch(this, onmousedown);
                } else {
                    if (event.toLowerCase() == (!dojo.isMozilla ? "onmousewheel" : "dommousescroll")) {
                        hitchedf = dojo.hitch(this, onmousewheel);
                    } else {
                        if (event.toLowerCase() == "onclick") {
                            hitchedf = dojo.hitch(this, onclick);
                        } else {
                            if (event.toLowerCase() == "onmouseup") {
                                hitchedf = dojo.hitch(this, onmouseup);
                            } else {
                                if (event.toLowerCase() == "onkeypress") {
                                    hitchedf = dojo.hitch(this, onkeypress);
                                } else {
                                    if (event.toLowerCase() == "onkeyup") {
                                        hitchedf = dojo.hitch(this, onkeyup);
                                    }
                                }
                            }
                        }
                    }
                }
                if (hitchedf == null) {
                    return;
                }
                hitchedf._mine = true;
                dojo.connect(widget, event, hitchedf);
            }
        });
    })();
});

