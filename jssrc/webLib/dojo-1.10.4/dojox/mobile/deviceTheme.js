//>>built

(typeof define === "undefined" ? function (deps, def) {
    def();
} : define)(["dojo/_base/config", "dojo/_base/lang", "dojo/_base/window", "require"], function (config, lang, win, require) {
    var dm = lang && lang.getObject("dojox.mobile", true) || {};
    var DeviceTheme = function () {
        if (!win) {
            win = window;
            win.doc = document;
            win._no_dojo_dm = dm;
        }
        config = config || win.mblConfig || {};
        var scripts = win.doc.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            var n = scripts[i];
            var src = n.getAttribute("src") || "";
            if (src.match(/\/deviceTheme\.js/i)) {
                config.baseUrl = src.replace("deviceTheme.js", "../../dojo/");
                var conf = (n.getAttribute("data-dojo-config") || n.getAttribute("djConfig"));
                if (conf) {
                    var obj = eval("({ " + conf + " })");
                    for (var key in obj) {
                        config[key] = obj[key];
                    }
                }
                break;
            } else {
                if (src.match(/\/dojo\.js/i)) {
                    config.baseUrl = src.replace("dojo.js", "");
                    break;
                }
            }
        }
        this.loadCssFile = function (file) {
            var link = win.doc.createElement("link");
            link.href = file;
            link.type = "text/css";
            link.rel = "stylesheet";
            var head = win.doc.getElementsByTagName("head")[0];
            head.insertBefore(link, head.firstChild);
            dm.loadedCssFiles.push(link);
        };
        this.toUrl = function (path) {
            return require ? require.toUrl(path) : config.baseUrl + "../" + path;
        };
        this.setDm = function (_dm) {
            dm = _dm;
        };
        this.themeMap = config.themeMap || [["Holodark", "holodark", []], ["Android 3", "holodark", []], ["Android 4", "holodark", []], ["Android", "android", []], ["BlackBerry", "blackberry", []], ["BB10", "blackberry", []], ["ios7", "ios7", []], ["iPhone;.*OS 7_", "ios7", []], ["iPhone;.*OS 8_", "ios7", []], ["iPad;.*OS 7_", "ios7", []], ["iPad;.*OS 8_", "ios7", []], ["iPhone", "iphone", []], ["iPad", "iphone", [this.toUrl("dojox/mobile/themes/iphone/ipad.css")]], ["WindowsPhone", "windows", []], ["Windows Phone", "windows", []], ["Trident", "iphone", []], ["Custom", "custom", []], [".*", "iphone", []]];
        dm.loadedCssFiles = [];
        this.loadDeviceTheme = function (userAgent) {
            var t = config.mblThemeFiles || dm.themeFiles || ["@theme"];
            var i, j;
            var m = this.themeMap;
            var ua = userAgent || config.mblUserAgent || (location.search.match(/theme=(\w+)/) ? RegExp.$1 : navigator.userAgent);
            for (i = 0; i < m.length; i++) {
                if (ua.match(new RegExp(m[i][0]))) {
                    var theme = m[i][1];
                    if (theme == "windows" && config.mblDisableWindowsTheme) {
                        continue;
                    }
                    var cls = win.doc.documentElement.className;
                    cls = cls.replace(new RegExp(" *" + dm.currentTheme + "_theme"), "") + " " + theme + "_theme";
                    win.doc.documentElement.className = cls;
                    dm.currentTheme = theme;
                    var files = [].concat(m[i][2]);
                    for (j = 0; j < t.length; j++) {
                        var isArray = (t[j] instanceof Array || typeof t[j] == "array");
                        var path;
                        if (!isArray && t[j].indexOf("/") !== -1) {
                            path = t[j];
                        } else {
                            var pkg = isArray ? (t[j][0] || "").replace(/\./g, "/") : "dojox/mobile";
                            var name = (isArray ? t[j][1] : t[j]).replace(/\./g, "/");
                            var f = "themes/" + theme + "/" + (name === "@theme" ? theme : name) + ".css";
                            path = pkg + "/" + f;
                        }
                        files.unshift(this.toUrl(path));
                    }
                    for (var k = 0; k < dm.loadedCssFiles.length; k++) {
                        var n = dm.loadedCssFiles[k];
                        n.parentNode.removeChild(n);
                    }
                    dm.loadedCssFiles = [];
                    for (j = 0; j < files.length; j++) {
                        var cssFilePath = files[j].toString();
                        if (config["dojo-bidi"] == true && cssFilePath.indexOf("_rtl") == -1) {
                            var rtlCssList = "android.css blackberry.css custom.css iphone.css holodark.css base.css Carousel.css ComboBox.css IconContainer.css IconMenu.css ListItem.css RoundRectCategory.css SpinWheel.css Switch.css TabBar.css ToggleButton.css ToolBarButton.css ProgressIndicator.css Accordion.css GridLayout.css FormLayout.css";
                            var cssName = cssFilePath.substr(cssFilePath.lastIndexOf("/") + 1);
                            if (rtlCssList.indexOf(cssName) != -1) {
                                this.loadCssFile(cssFilePath.replace(".css", "_rtl.css"));
                            }
                        }
                        this.loadCssFile(files[j].toString());
                    }
                    if (userAgent && dm.loadCompatCssFiles) {
                        dm.loadCompatCssFiles();
                    }
                    break;
                }
            }
        };
    };
    var deviceTheme = new DeviceTheme();
    deviceTheme.loadDeviceTheme();
    window.deviceTheme = dm.deviceTheme = deviceTheme;
    return deviceTheme;
});

