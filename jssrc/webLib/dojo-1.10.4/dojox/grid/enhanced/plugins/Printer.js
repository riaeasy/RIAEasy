//>>built

define("dojox/grid/enhanced/plugins/Printer", ["dojo/_base/declare", "dojo/_base/html", "dojo/_base/Deferred", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/xhr", "dojo/_base/array", "dojo/query", "dojo/DeferredList", "../_Plugin", "../../EnhancedGrid", "./exporter/TableWriter"], function (declare, html, Deferred, lang, has, xhr, array, query, DeferredList, _Plugin, EnhancedGrid, TableWriter) {
    var Printer = declare("dojox.grid.enhanced.plugins.Printer", _Plugin, {name:"printer", constructor:function (grid) {
        this.grid = grid;
        this._mixinGrid(grid);
        grid.setExportFormatter(function (data, cell, rowIndex, rowItem) {
            return cell.format(rowIndex, rowItem);
        });
    }, _mixinGrid:function () {
        var g = this.grid;
        g.printGrid = lang.hitch(this, this.printGrid);
        g.printSelected = lang.hitch(this, this.printSelected);
        g.exportToHTML = lang.hitch(this, this.exportToHTML);
        g.exportSelectedToHTML = lang.hitch(this, this.exportSelectedToHTML);
        g.normalizePrintedGrid = lang.hitch(this, this.normalizeRowHeight);
    }, printGrid:function (args) {
        this.exportToHTML(args, lang.hitch(this, this._print));
    }, printSelected:function (args) {
        this.exportSelectedToHTML(args, lang.hitch(this, this._print));
    }, exportToHTML:function (args, onExported) {
        args = this._formalizeArgs(args);
        var _this = this;
        this.grid.exportGrid("table", args, function (str) {
            _this._wrapHTML(args.title, args.cssFiles, args.titleInBody + str).then(onExported);
        });
    }, exportSelectedToHTML:function (args, onExported) {
        args = this._formalizeArgs(args);
        var _this = this;
        this.grid.exportSelected("table", args.writerArgs, function (str) {
            _this._wrapHTML(args.title, args.cssFiles, args.titleInBody + str).then(onExported);
        });
    }, _loadCSSFiles:function (cssFiles) {
        var dl = array.map(cssFiles, function (cssFile) {
            cssFile = lang.trim(cssFile);
            if (cssFile.substring(cssFile.length - 4).toLowerCase() === ".css") {
                return xhr.get({url:cssFile});
            } else {
                var d = new Deferred();
                d.callback(cssFile);
                return d;
            }
        });
        return DeferredList.prototype.gatherResults(dl);
    }, _print:function (htmlStr) {
        var win, _this = this, fillDoc = function (w) {
            var doc = w.document;
            doc.open();
            doc.write(htmlStr);
            doc.close();
            _this.normalizeRowHeight(doc);
        };
        if (!window.print) {
            return;
        } else {
            if (has("chrome") || has("opera")) {
                win = window.open("javascript: ''", "", "status=0,menubar=0,location=0,toolbar=0,width=1,height=1,resizable=0,scrollbars=0");
                fillDoc(win);
                win.print();
                win.close();
            } else {
                var fn = this._printFrame, dn = this.grid.domNode;
                if (!fn) {
                    var frameId = dn.id + "_print_frame";
                    if (!(fn = html.byId(frameId))) {
                        fn = html.create("iframe");
                        fn.id = frameId;
                        fn.frameBorder = 0;
                        html.style(fn, {width:"1px", height:"1px", position:"absolute", right:0, bottom:0, border:"none", overflow:"hidden"});
                        if (!has("ie")) {
                            html.style(fn, "visibility", "hidden");
                        }
                        dn.appendChild(fn);
                    }
                    this._printFrame = fn;
                }
                win = fn.contentWindow;
                fillDoc(win);
                win.focus();
                win.print();
            }
        }
    }, _wrapHTML:function (title, cssFiles, body_content) {
        return this._loadCSSFiles(cssFiles).then(function (cssStrs) {
            var i, sb = ["<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">", "<html ", html._isBodyLtr() ? "" : "dir=\"rtl\"", "><head><title>", title, "</title><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"></meta>"];
            for (i = 0; i < cssStrs.length; ++i) {
                sb.push("<style type=\"text/css\">", cssStrs[i], "</style>");
            }
            sb.push("</head>");
            if (body_content.search(/^\s*<body/i) < 0) {
                body_content = "<body>" + body_content + "</body>";
            }
            sb.push(body_content, "</html>");
            return sb.join("");
        });
    }, normalizeRowHeight:function (doc) {
        var views = query(".grid_view", doc.body);
        var headPerView = array.map(views, function (view) {
            return query(".grid_header", view)[0];
        });
        var rowsPerView = array.map(views, function (view) {
            return query(".grid_row", view);
        });
        var rowCount = rowsPerView[0].length;
        var i, v, h, maxHeight = 0;
        for (v = views.length - 1; v >= 0; --v) {
            h = html.contentBox(headPerView[v]).h;
            if (h > maxHeight) {
                maxHeight = h;
            }
        }
        for (v = views.length - 1; v >= 0; --v) {
            html.style(headPerView[v], "height", maxHeight + "px");
        }
        for (i = 0; i < rowCount; ++i) {
            maxHeight = 0;
            for (v = views.length - 1; v >= 0; --v) {
                h = html.contentBox(rowsPerView[v][i]).h;
                if (h > maxHeight) {
                    maxHeight = h;
                }
            }
            for (v = views.length - 1; v >= 0; --v) {
                html.style(rowsPerView[v][i], "height", maxHeight + "px");
            }
        }
        var left = 0, ltr = html._isBodyLtr();
        for (v = 0; v < views.length; ++v) {
            html.style(views[v], ltr ? "left" : "right", left + "px");
            left += html.marginBox(views[v]).w;
        }
    }, _formalizeArgs:function (args) {
        args = (args && lang.isObject(args)) ? args : {};
        args.title = String(args.title) || "";
        if (!lang.isArray(args.cssFiles)) {
            args.cssFiles = [args.cssFiles];
        }
        args.titleInBody = args.title ? ["<h1>", args.title, "</h1>"].join("") : "";
        return args;
    }});
    EnhancedGrid.registerPlugin(Printer, {"dependency":["exporter"]});
    return Printer;
});

