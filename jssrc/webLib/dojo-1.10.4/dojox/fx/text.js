//>>built

define("dojox/fx/text", ["dojo/_base/lang", "./_base", "dojo/_base/fx", "dojo/fx", "dojo/fx/easing", "dojo/dom", "dojo/dom-style", "dojo/_base/html", "dojo/_base/connect"], function (lang, dojoxFx, baseFx, coreFx, easingLib, dom, domStyle, htmlLib, connectUtil) {
    var textFx = lang.getObject("dojox.fx.text", true);
    textFx._split = function (args) {
        var node = args.node = dom.byId(args.node), s = node.style, cs = domStyle.getComputedStyle(node), nodeCoords = htmlLib.coords(node, true);
        args.duration = args.duration || 1000;
        args.words = args.words || false;
        var originalHTML = (args.text && typeof (args.text) == "string") ? args.text : node.innerHTML, originalHeight = s.height, originalWidth = s.width, animations = [];
        domStyle.set(node, {height:cs.height, width:cs.width});
        var tagReg = /(<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>)/g;
        var reg = (args.words ? /(<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>)\s*|([^\s<]+\s*)/g : /(<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>)\s*|([^\s<]\s*)/g);
        var pieces = (typeof args.text == "string") ? args.text.match(reg) : node.innerHTML.match(reg);
        var html = "";
        var numPieces = 0;
        var number = 0;
        for (var i = 0; i < pieces.length; i++) {
            var piece = pieces[i];
            if (!piece.match(tagReg)) {
                html += "<span>" + piece + "</span>";
                numPieces++;
            } else {
                html += piece;
            }
        }
        node.innerHTML = html;
        function animatePieces(piece) {
            var next = piece.nextSibling;
            if (piece.tagName == "SPAN" && piece.childNodes.length == 1 && piece.firstChild.nodeType == 3) {
                var pieceCoords = htmlLib.coords(piece, true);
                number++;
                domStyle.set(piece, {padding:0, margin:0, top:(args.crop ? "0px" : pieceCoords.t + "px"), left:(args.crop ? "0px" : pieceCoords.l + "px"), display:"inline"});
                var pieceAnimation = args.pieceAnimation(piece, pieceCoords, nodeCoords, number, numPieces);
                if (lang.isArray(pieceAnimation)) {
                    animations = animations.concat(pieceAnimation);
                } else {
                    animations[animations.length] = pieceAnimation;
                }
            } else {
                if (piece.firstChild) {
                    animatePieces(piece.firstChild);
                }
            }
            if (next) {
                animatePieces(next);
            }
        }
        animatePieces(node.firstChild);
        var anim = coreFx.combine(animations);
        connectUtil.connect(anim, "onEnd", anim, function () {
            node.innerHTML = originalHTML;
            domStyle.set(node, {height:originalHeight, width:originalWidth});
        });
        if (args.onPlay) {
            connectUtil.connect(anim, "onPlay", anim, args.onPlay);
        }
        if (args.onEnd) {
            connectUtil.connect(anim, "onEnd", anim, args.onEnd);
        }
        return anim;
    };
    textFx.explode = function (args) {
        var node = args.node = dom.byId(args.node);
        var s = node.style;
        args.distance = args.distance || 1;
        args.duration = args.duration || 1000;
        args.random = args.random || 0;
        if (typeof (args.fade) == "undefined") {
            args.fade = true;
        }
        if (typeof (args.sync) == "undefined") {
            args.sync = true;
        }
        args.random = Math.abs(args.random);
        args.pieceAnimation = function (piece, pieceCoords, coords, number, numPieces) {
            var pieceHeight = pieceCoords.h;
            var pieceWidth = pieceCoords.w;
            var distance = args.distance * 2;
            var duration = args.duration;
            var startTop = parseFloat(piece.style.top);
            var startLeft = parseFloat(piece.style.left);
            var delay = 0;
            var randomX = 0;
            var randomY = 0;
            if (args.random) {
                var seed = (Math.random() * args.random) + Math.max(1 - args.random, 0);
                distance *= seed;
                duration *= seed;
                delay = ((args.unhide && args.sync) || (!args.unhide && !args.sync)) ? (args.duration - duration) : 0;
                randomX = Math.random() - 0.5;
                randomY = Math.random() - 0.5;
            }
            var distanceY = ((coords.h - pieceHeight) / 2 - (pieceCoords.y - coords.y));
            var distanceX = ((coords.w - pieceWidth) / 2 - (pieceCoords.x - coords.x));
            var distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
            var endTop = startTop - distanceY * distance + distanceXY * randomY;
            var endLeft = startLeft - distanceX * distance + distanceXY * randomX;
            var pieceSlide = baseFx.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || (args.unhide ? easingLib.sinOut : easingLib.circOut)), beforeBegin:(args.unhide ? function () {
                if (args.fade) {
                    domStyle.set(piece, "opacity", 0);
                }
                piece.style.position = args.crop ? "relative" : "absolute";
                piece.style.top = endTop + "px";
                piece.style.left = endLeft + "px";
            } : function () {
                piece.style.position = args.crop ? "relative" : "absolute";
            }), properties:{top:(args.unhide ? {start:endTop, end:startTop} : {start:startTop, end:endTop}), left:(args.unhide ? {start:endLeft, end:startLeft} : {start:startLeft, end:endLeft})}});
            if (args.fade) {
                var pieceFade = baseFx.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.fadeEasing || easingLib.quadOut), properties:{opacity:(args.unhide ? {start:0, end:1} : {end:0})}});
                return (args.unhide ? [pieceFade, pieceSlide] : [pieceSlide, pieceFade]);
            } else {
                return pieceSlide;
            }
        };
        var anim = textFx._split(args);
        return anim;
    };
    textFx.converge = function (args) {
        args.unhide = true;
        return textFx.explode(args);
    };
    textFx.disintegrate = function (args) {
        var node = args.node = dom.byId(args.node);
        var s = node.style;
        args.duration = args.duration || 1500;
        args.distance = args.distance || 1.5;
        args.random = args.random || 0;
        if (!args.fade) {
            args.fade = true;
        }
        var random = Math.abs(args.random);
        args.pieceAnimation = function (piece, pieceCoords, coords, number, numPieces) {
            var pieceHeight = pieceCoords.h;
            var pieceWidth = pieceCoords.w;
            var interval = args.interval || (args.duration / (1.5 * numPieces));
            var duration = (args.duration - numPieces * interval);
            var randomDelay = Math.random() * numPieces * interval;
            var uniformDelay = (args.reverseOrder || args.distance < 0) ? (number * interval) : ((numPieces - number) * interval);
            var delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay;
            var properties = {};
            if (args.unhide) {
                properties.top = {start:(parseFloat(piece.style.top) - coords.h * args.distance), end:parseFloat(piece.style.top)};
                if (args.fade) {
                    properties.opacity = {start:0, end:1};
                }
            } else {
                properties.top = {end:(parseFloat(piece.style.top) + coords.h * args.distance)};
                if (args.fade) {
                    properties.opacity = {end:0};
                }
            }
            var pieceAnimation = baseFx.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || (args.unhide ? easingLib.sinIn : easingLib.circIn)), properties:properties, beforeBegin:(args.unhide ? function () {
                if (args.fade) {
                    domStyle.set(piece, "opacity", 0);
                }
                piece.style.position = args.crop ? "relative" : "absolute";
                piece.style.top = properties.top.start + "px";
            } : function () {
                piece.style.position = args.crop ? "relative" : "absolute";
            })});
            return pieceAnimation;
        };
        var anim = textFx._split(args);
        return anim;
    };
    textFx.build = function (args) {
        args.unhide = true;
        return textFx.disintegrate(args);
    };
    textFx.blockFadeOut = function (args) {
        var node = args.node = dom.byId(args.node);
        var s = node.style;
        args.duration = args.duration || 1000;
        args.random = args.random || 0;
        var random = Math.abs(args.random);
        args.pieceAnimation = function (piece, pieceCoords, coords, number, numPieces) {
            var interval = args.interval || (args.duration / (1.5 * numPieces));
            var duration = (args.duration - numPieces * interval);
            var randomDelay = Math.random() * numPieces * interval;
            var uniformDelay = (args.reverseOrder) ? ((numPieces - number) * interval) : (number * interval);
            var delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay;
            var pieceAnimation = baseFx.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || easingLib.sinInOut), properties:{opacity:(args.unhide ? {start:0, end:1} : {end:0})}, beforeBegin:(args.unhide ? function () {
                domStyle.set(piece, "opacity", 0);
            } : undefined)});
            return pieceAnimation;
        };
        var anim = textFx._split(args);
        return anim;
    };
    textFx.blockFadeIn = function (args) {
        args.unhide = true;
        return textFx.blockFadeOut(args);
    };
    textFx.backspace = function (args) {
        var node = args.node = dom.byId(args.node);
        var s = node.style;
        args.words = false;
        args.duration = args.duration || 2000;
        args.random = args.random || 0;
        var random = Math.abs(args.random);
        var delay = 10;
        args.pieceAnimation = function (piece, pieceCoords, coords, number, numPieces) {
            var interval = args.interval || (args.duration / (1.5 * numPieces)), text = ("textContent" in piece) ? piece.textContent : piece.innerText, whitespace = text.match(/\s/g);
            if (typeof (args.wordDelay) == "undefined") {
                args.wordDelay = interval * 2;
            }
            if (!args.unhide) {
                delay = (numPieces - number - 1) * interval;
            }
            var beforeBegin, onEnd;
            if (args.fixed) {
                if (args.unhide) {
                    var beforeBegin = function () {
                        domStyle.set(piece, "opacity", 0);
                    };
                }
            } else {
                if (args.unhide) {
                    var beforeBegin = function () {
                        piece.style.display = "none";
                    };
                    var onEnd = function () {
                        piece.style.display = "inline";
                    };
                } else {
                    var onEnd = function () {
                        piece.style.display = "none";
                    };
                }
            }
            var pieceAnimation = baseFx.animateProperty({node:piece, duration:1, delay:delay, easing:(args.easing || easingLib.sinInOut), properties:{opacity:(args.unhide ? {start:0, end:1} : {end:0})}, beforeBegin:beforeBegin, onEnd:onEnd});
            if (args.unhide) {
                var randomDelay = Math.random() * text.length * interval;
                var wordDelay = randomDelay * random / 2 + Math.max(1 - random / 2, 0) * args.wordDelay;
                delay += randomDelay * random + Math.max(1 - random, 0) * interval * text.length + (wordDelay * (whitespace && text.lastIndexOf(whitespace[whitespace.length - 1]) == text.length - 1));
            }
            return pieceAnimation;
        };
        var anim = textFx._split(args);
        return anim;
    };
    textFx.type = function (args) {
        args.unhide = true;
        return textFx.backspace(args);
    };
    return textFx;
});

