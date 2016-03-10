//>>built

define("dojox/atom/io/model", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/date/stamp", "dojox/xml/parser"], function (dojo, declare, lang, stamp, parser) {
    var model = {};
    dojo.setObject("dojox.atom.io.model", model);
    model._Constants = {"ATOM_URI":"http://www.w3.org/2005/Atom", "ATOM_NS":"http://www.w3.org/2005/Atom", "PURL_NS":"http://purl.org/atom/app#", "APP_NS":"http://www.w3.org/2007/app"};
    model._actions = {"link":function (obj, node) {
        if (obj.links === null) {
            obj.links = [];
        }
        var link = new model.Link();
        link.buildFromDom(node);
        obj.links.push(link);
    }, "author":function (obj, node) {
        if (obj.authors === null) {
            obj.authors = [];
        }
        var person = new model.Person("author");
        person.buildFromDom(node);
        obj.authors.push(person);
    }, "contributor":function (obj, node) {
        if (obj.contributors === null) {
            obj.contributors = [];
        }
        var person = new model.Person("contributor");
        person.buildFromDom(node);
        obj.contributors.push(person);
    }, "category":function (obj, node) {
        if (obj.categories === null) {
            obj.categories = [];
        }
        var cat = new model.Category();
        cat.buildFromDom(node);
        obj.categories.push(cat);
    }, "icon":function (obj, node) {
        obj.icon = parser.textContent(node);
    }, "id":function (obj, node) {
        obj.id = parser.textContent(node);
    }, "rights":function (obj, node) {
        obj.rights = parser.textContent(node);
    }, "subtitle":function (obj, node) {
        var cnt = new model.Content("subtitle");
        cnt.buildFromDom(node);
        obj.subtitle = cnt;
    }, "title":function (obj, node) {
        var cnt = new model.Content("title");
        cnt.buildFromDom(node);
        obj.title = cnt;
    }, "updated":function (obj, node) {
        obj.updated = model.util.createDate(node);
    }, "issued":function (obj, node) {
        obj.issued = model.util.createDate(node);
    }, "modified":function (obj, node) {
        obj.modified = model.util.createDate(node);
    }, "published":function (obj, node) {
        obj.published = model.util.createDate(node);
    }, "entry":function (obj, node) {
        if (obj.entries === null) {
            obj.entries = [];
        }
        var entry = obj.createEntry ? obj.createEntry() : new model.Entry();
        entry.buildFromDom(node);
        obj.entries.push(entry);
    }, "content":function (obj, node) {
        var cnt = new model.Content("content");
        cnt.buildFromDom(node);
        obj.content = cnt;
    }, "summary":function (obj, node) {
        var summary = new model.Content("summary");
        summary.buildFromDom(node);
        obj.summary = summary;
    }, "name":function (obj, node) {
        obj.name = parser.textContent(node);
    }, "email":function (obj, node) {
        obj.email = parser.textContent(node);
    }, "uri":function (obj, node) {
        obj.uri = parser.textContent(node);
    }, "generator":function (obj, node) {
        obj.generator = new model.Generator();
        obj.generator.buildFromDom(node);
    }};
    model.util = {createDate:function (node) {
        var textContent = parser.textContent(node);
        if (textContent) {
            return stamp.fromISOString(lang.trim(textContent));
        }
        return null;
    }, escapeHtml:function (str) {
        return str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/'/gm, "&#39;");
    }, unEscapeHtml:function (str) {
        return str.replace(/&lt;/gm, "<").replace(/&gt;/gm, ">").replace(/&quot;/gm, "\"").replace(/&#39;/gm, "'").replace(/&amp;/gm, "&");
    }, getNodename:function (node) {
        var name = null;
        if (node !== null) {
            name = node.localName ? node.localName : node.nodeName;
            if (name !== null) {
                var nsSep = name.indexOf(":");
                if (nsSep !== -1) {
                    name = name.substring((nsSep + 1), name.length);
                }
            }
        }
        return name;
    }};
    model.Node = declare(null, {constructor:function (name_space, name, attributes, content, shortNs) {
        this.name_space = name_space;
        this.name = name;
        this.attributes = [];
        if (attributes) {
            this.attributes = attributes;
        }
        this.content = [];
        this.rawNodes = [];
        this.textContent = null;
        if (content) {
            this.content.push(content);
        }
        this.shortNs = shortNs;
        this._objName = "Node";
        this.nodeType = "Node";
    }, buildFromDom:function (node) {
        this._saveAttributes(node);
        this.name_space = node.namespaceURI;
        this.shortNs = node.prefix;
        this.name = model.util.getNodename(node);
        for (var x = 0; x < node.childNodes.length; x++) {
            var c = node.childNodes[x];
            if (model.util.getNodename(c) != "#text") {
                this.rawNodes.push(c);
                var n = new model.Node();
                n.buildFromDom(c, true);
                this.content.push(n);
            } else {
                this.content.push(c.nodeValue);
            }
        }
        this.textContent = parser.textContent(node);
    }, _saveAttributes:function (node) {
        if (!this.attributes) {
            this.attributes = [];
        }
        var hasAttributes = function (node) {
            var attrs = node.attributes;
            if (attrs === null) {
                return false;
            }
            return (attrs.length !== 0);
        };
        if (hasAttributes(node) && this._getAttributeNames) {
            var names = this._getAttributeNames(node);
            if (names && names.length > 0) {
                for (var x in names) {
                    var attrib = node.getAttribute(names[x]);
                    if (attrib) {
                        this.attributes[names[x]] = attrib;
                    }
                }
            }
        }
    }, addAttribute:function (name, value) {
        this.attributes[name] = value;
    }, getAttribute:function (name) {
        return this.attributes[name];
    }, _getAttributeNames:function (node) {
        var names = [];
        for (var i = 0; i < node.attributes.length; i++) {
            names.push(node.attributes[i].nodeName);
        }
        return names;
    }, toString:function () {
        var xml = [];
        var x;
        var name = (this.shortNs ? this.shortNs + ":" : "") + this.name;
        var cdata = (this.name == "#cdata-section");
        if (cdata) {
            xml.push("<![CDATA[");
            xml.push(this.textContent);
            xml.push("]]>");
        } else {
            xml.push("<");
            xml.push(name);
            if (this.name_space) {
                xml.push(" xmlns='" + this.name_space + "'");
            }
            if (this.attributes) {
                for (x in this.attributes) {
                    xml.push(" " + x + "='" + this.attributes[x] + "'");
                }
            }
            if (this.content) {
                xml.push(">");
                for (x in this.content) {
                    xml.push(this.content[x]);
                }
                xml.push("</" + name + ">\n");
            } else {
                xml.push("/>\n");
            }
        }
        return xml.join("");
    }, addContent:function (content) {
        this.content.push(content);
    }});
    model.AtomItem = declare(model.Node, {constructor:function (args) {
        this.ATOM_URI = model._Constants.ATOM_URI;
        this.links = null;
        this.authors = null;
        this.categories = null;
        this.contributors = null;
        this.icon = this.id = this.logo = this.xmlBase = this.rights = null;
        this.subtitle = this.title = null;
        this.updated = this.published = null;
        this.issued = this.modified = null;
        this.content = null;
        this.extensions = null;
        this.entries = null;
        this.name_spaces = {};
        this._objName = "AtomItem";
        this.nodeType = "AtomItem";
    }, _getAttributeNames:function () {
        return null;
    }, _accepts:{}, accept:function (tag) {
        return Boolean(this._accepts[tag]);
    }, _postBuild:function () {
    }, buildFromDom:function (node) {
        var i, c, n;
        for (i = 0; i < node.attributes.length; i++) {
            c = node.attributes.item(i);
            n = model.util.getNodename(c);
            if (c.prefix == "xmlns" && c.prefix != n) {
                this.addNamespace(c.nodeValue, n);
            }
        }
        c = node.childNodes;
        for (i = 0; i < c.length; i++) {
            if (c[i].nodeType == 1) {
                var name = model.util.getNodename(c[i]);
                if (!name) {
                    continue;
                }
                if (c[i].namespaceURI != model._Constants.ATOM_NS && name != "#text") {
                    if (!this.extensions) {
                        this.extensions = [];
                    }
                    var extensionNode = new model.Node();
                    extensionNode.buildFromDom(c[i]);
                    this.extensions.push(extensionNode);
                }
                if (!this.accept(name.toLowerCase())) {
                    continue;
                }
                var fn = model._actions[name];
                if (fn) {
                    fn(this, c[i]);
                }
            }
        }
        this._saveAttributes(node);
        if (this._postBuild) {
            this._postBuild();
        }
    }, addNamespace:function (fullName, shortName) {
        if (fullName && shortName) {
            this.name_spaces[shortName] = fullName;
        }
    }, addAuthor:function (name, email, uri) {
        if (!this.authors) {
            this.authors = [];
        }
        this.authors.push(new model.Person("author", name, email, uri));
    }, addContributor:function (name, email, uri) {
        if (!this.contributors) {
            this.contributors = [];
        }
        this.contributors.push(new model.Person("contributor", name, email, uri));
    }, addLink:function (href, rel, hrefLang, title, type) {
        if (!this.links) {
            this.links = [];
        }
        this.links.push(new model.Link(href, rel, hrefLang, title, type));
    }, removeLink:function (href, rel) {
        if (!this.links || !lang.isArray(this.links)) {
            return;
        }
        var count = 0;
        for (var i = 0; i < this.links.length; i++) {
            if ((!href || this.links[i].href === href) && (!rel || this.links[i].rel === rel)) {
                this.links.splice(i, 1);
                count++;
            }
        }
        return count;
    }, removeBasicLinks:function () {
        if (!this.links) {
            return;
        }
        var count = 0;
        for (var i = 0; i < this.links.length; i++) {
            if (!this.links[i].rel) {
                this.links.splice(i, 1);
                count++;
                i--;
            }
        }
        return count;
    }, addCategory:function (scheme, term, label) {
        if (!this.categories) {
            this.categories = [];
        }
        this.categories.push(new model.Category(scheme, term, label));
    }, getCategories:function (scheme) {
        if (!scheme) {
            return this.categories;
        }
        var arr = [];
        for (var x in this.categories) {
            if (this.categories[x].scheme === scheme) {
                arr.push(this.categories[x]);
            }
        }
        return arr;
    }, removeCategories:function (scheme, term) {
        if (!this.categories) {
            return;
        }
        var count = 0;
        for (var i = 0; i < this.categories.length; i++) {
            if ((!scheme || this.categories[i].scheme === scheme) && (!term || this.categories[i].term === term)) {
                this.categories.splice(i, 1);
                count++;
                i--;
            }
        }
        return count;
    }, setTitle:function (str, type) {
        if (!str) {
            return;
        }
        this.title = new model.Content("title");
        this.title.value = str;
        if (type) {
            this.title.type = type;
        }
    }, addExtension:function (name_space, name, attributes, content, shortNS) {
        if (!this.extensions) {
            this.extensions = [];
        }
        this.extensions.push(new model.Node(name_space, name, attributes, content, shortNS || "ns" + this.extensions.length));
    }, getExtensions:function (name_space, name) {
        var arr = [];
        if (!this.extensions) {
            return arr;
        }
        for (var x in this.extensions) {
            if ((this.extensions[x].name_space === name_space || this.extensions[x].shortNs === name_space) && (!name || this.extensions[x].name === name)) {
                arr.push(this.extensions[x]);
            }
        }
        return arr;
    }, removeExtensions:function (name_space, name) {
        if (!this.extensions) {
            return;
        }
        for (var i = 0; i < this.extensions.length; i++) {
            if ((this.extensions[i].name_space == name_space || this.extensions[i].shortNs === name_space) && this.extensions[i].name === name) {
                this.extensions.splice(i, 1);
                i--;
            }
        }
    }, destroy:function () {
        this.links = null;
        this.authors = null;
        this.categories = null;
        this.contributors = null;
        this.icon = this.id = this.logo = this.xmlBase = this.rights = null;
        this.subtitle = this.title = null;
        this.updated = this.published = null;
        this.issued = this.modified = null;
        this.content = null;
        this.extensions = null;
        this.entries = null;
    }});
    model.Category = declare(model.Node, {constructor:function (scheme, term, label) {
        this.scheme = scheme;
        this.term = term;
        this.label = label;
        this._objName = "Category";
        this.nodeType = "Category";
    }, _postBuild:function () {
    }, _getAttributeNames:function () {
        return ["label", "scheme", "term"];
    }, toString:function () {
        var s = [];
        s.push("<category ");
        if (this.label) {
            s.push(" label=\"" + this.label + "\" ");
        }
        if (this.scheme) {
            s.push(" scheme=\"" + this.scheme + "\" ");
        }
        if (this.term) {
            s.push(" term=\"" + this.term + "\" ");
        }
        s.push("/>\n");
        return s.join("");
    }, buildFromDom:function (node) {
        this._saveAttributes(node);
        this.label = this.attributes.label;
        this.scheme = this.attributes.scheme;
        this.term = this.attributes.term;
        if (this._postBuild) {
            this._postBuild();
        }
    }});
    model.Content = declare(model.Node, {constructor:function (tagName, value, src, type, xmlLang) {
        this.tagName = tagName;
        this.value = value;
        this.src = src;
        this.type = type;
        this.xmlLang = xmlLang;
        this.HTML = "html";
        this.TEXT = "text";
        this.XHTML = "xhtml";
        this.XML = "xml";
        this._useTextContent = "true";
        this.nodeType = "Content";
    }, _getAttributeNames:function () {
        return ["type", "src"];
    }, _postBuild:function () {
    }, buildFromDom:function (node) {
        var type = node.getAttribute("type");
        if (type) {
            type = type.toLowerCase();
            if (type == "xml" || "text/xml") {
                type = this.XML;
            }
        } else {
            type = "text";
        }
        if (type === this.XML) {
            if (node.firstChild) {
                var i;
                this.value = "";
                for (i = 0; i < node.childNodes.length; i++) {
                    var c = node.childNodes[i];
                    if (c) {
                        this.value += parser.innerXML(c);
                    }
                }
            }
        } else {
            if (node.innerHTML) {
                this.value = node.innerHTML;
            } else {
                this.value = parser.textContent(node);
            }
        }
        this._saveAttributes(node);
        if (this.attributes) {
            this.type = this.attributes.type;
            this.scheme = this.attributes.scheme;
            this.term = this.attributes.term;
        }
        if (!this.type) {
            this.type = "text";
        }
        var lowerType = this.type.toLowerCase();
        if (lowerType === "html" || lowerType === "text/html" || lowerType === "xhtml" || lowerType === "text/xhtml") {
            this.value = this.value ? model.util.unEscapeHtml(this.value) : "";
        }
        if (this._postBuild) {
            this._postBuild();
        }
    }, toString:function () {
        var s = [];
        s.push("<" + this.tagName + " ");
        if (!this.type) {
            this.type = "text";
        }
        if (this.type) {
            s.push(" type=\"" + this.type + "\" ");
        }
        if (this.xmlLang) {
            s.push(" xml:lang=\"" + this.xmlLang + "\" ");
        }
        if (this.xmlBase) {
            s.push(" xml:base=\"" + this.xmlBase + "\" ");
        }
        if (this.type.toLowerCase() == this.HTML) {
            s.push(">" + model.util.escapeHtml(this.value) + "</" + this.tagName + ">\n");
        } else {
            s.push(">" + this.value + "</" + this.tagName + ">\n");
        }
        var ret = s.join("");
        return ret;
    }});
    model.Link = declare(model.Node, {constructor:function (href, rel, hrefLang, title, type) {
        this.href = href;
        this.hrefLang = hrefLang;
        this.rel = rel;
        this.title = title;
        this.type = type;
        this.nodeType = "Link";
    }, _getAttributeNames:function () {
        return ["href", "jrefLang", "rel", "title", "type"];
    }, _postBuild:function () {
    }, buildFromDom:function (node) {
        this._saveAttributes(node);
        this.href = this.attributes.href;
        this.hrefLang = this.attributes.hreflang;
        this.rel = this.attributes.rel;
        this.title = this.attributes.title;
        this.type = this.attributes.type;
        if (this._postBuild) {
            this._postBuild();
        }
    }, toString:function () {
        var s = [];
        s.push("<link ");
        if (this.href) {
            s.push(" href=\"" + this.href + "\" ");
        }
        if (this.hrefLang) {
            s.push(" hrefLang=\"" + this.hrefLang + "\" ");
        }
        if (this.rel) {
            s.push(" rel=\"" + this.rel + "\" ");
        }
        if (this.title) {
            s.push(" title=\"" + this.title + "\" ");
        }
        if (this.type) {
            s.push(" type = \"" + this.type + "\" ");
        }
        s.push("/>\n");
        return s.join("");
    }});
    model.Person = declare(model.Node, {constructor:function (personType, name, email, uri) {
        this.author = "author";
        this.contributor = "contributor";
        if (!personType) {
            personType = this.author;
        }
        this.personType = personType;
        this.name = name || "";
        this.email = email || "";
        this.uri = uri || "";
        this._objName = "Person";
        this.nodeType = "Person";
    }, _getAttributeNames:function () {
        return null;
    }, _postBuild:function () {
    }, accept:function (tag) {
        return Boolean(this._accepts[tag]);
    }, buildFromDom:function (node) {
        var c = node.childNodes;
        for (var i = 0; i < c.length; i++) {
            var name = model.util.getNodename(c[i]);
            if (!name) {
                continue;
            }
            if (c[i].namespaceURI != model._Constants.ATOM_NS && name != "#text") {
                if (!this.extensions) {
                    this.extensions = [];
                }
                var extensionNode = new model.Node();
                extensionNode.buildFromDom(c[i]);
                this.extensions.push(extensionNode);
            }
            if (!this.accept(name.toLowerCase())) {
                continue;
            }
            var fn = model._actions[name];
            if (fn) {
                fn(this, c[i]);
            }
        }
        this._saveAttributes(node);
        if (this._postBuild) {
            this._postBuild();
        }
    }, _accepts:{"name":true, "uri":true, "email":true}, toString:function () {
        var s = [];
        s.push("<" + this.personType + ">\n");
        if (this.name) {
            s.push("\t<name>" + this.name + "</name>\n");
        }
        if (this.email) {
            s.push("\t<email>" + this.email + "</email>\n");
        }
        if (this.uri) {
            s.push("\t<uri>" + this.uri + "</uri>\n");
        }
        s.push("</" + this.personType + ">\n");
        return s.join("");
    }});
    model.Generator = declare(model.Node, {constructor:function (uri, version, value) {
        this.uri = uri;
        this.version = version;
        this.value = value;
    }, _postBuild:function () {
    }, buildFromDom:function (node) {
        this.value = parser.textContent(node);
        this._saveAttributes(node);
        this.uri = this.attributes.uri;
        this.version = this.attributes.version;
        if (this._postBuild) {
            this._postBuild();
        }
    }, toString:function () {
        var s = [];
        s.push("<generator ");
        if (this.uri) {
            s.push(" uri=\"" + this.uri + "\" ");
        }
        if (this.version) {
            s.push(" version=\"" + this.version + "\" ");
        }
        s.push(">" + this.value + "</generator>\n");
        var ret = s.join("");
        return ret;
    }});
    model.Entry = declare(model.AtomItem, {constructor:function (id) {
        this.id = id;
        this._objName = "Entry";
        this.feedUrl = null;
    }, _getAttributeNames:function () {
        return null;
    }, _accepts:{"author":true, "content":true, "category":true, "contributor":true, "created":true, "id":true, "link":true, "published":true, "rights":true, "summary":true, "title":true, "updated":true, "xmlbase":true, "issued":true, "modified":true}, toString:function (amPrimary) {
        var s = [];
        var i;
        if (amPrimary) {
            s.push("<?xml version='1.0' encoding='UTF-8'?>");
            s.push("<entry xmlns='" + model._Constants.ATOM_URI + "'");
        } else {
            s.push("<entry");
        }
        if (this.xmlBase) {
            s.push(" xml:base=\"" + this.xmlBase + "\" ");
        }
        for (i in this.name_spaces) {
            s.push(" xmlns:" + i + "=\"" + this.name_spaces[i] + "\"");
        }
        s.push(">\n");
        s.push("<id>" + (this.id ? this.id : "") + "</id>\n");
        if (this.issued && !this.published) {
            this.published = this.issued;
        }
        if (this.published) {
            s.push("<published>" + stamp.toISOString(this.published) + "</published>\n");
        }
        if (this.created) {
            s.push("<created>" + stamp.toISOString(this.created) + "</created>\n");
        }
        if (this.issued) {
            s.push("<issued>" + stamp.toISOString(this.issued) + "</issued>\n");
        }
        if (this.modified) {
            s.push("<modified>" + stamp.toISOString(this.modified) + "</modified>\n");
        }
        if (this.modified && !this.updated) {
            this.updated = this.modified;
        }
        if (this.updated) {
            s.push("<updated>" + stamp.toISOString(this.updated) + "</updated>\n");
        }
        if (this.rights) {
            s.push("<rights>" + this.rights + "</rights>\n");
        }
        if (this.title) {
            s.push(this.title.toString());
        }
        if (this.summary) {
            s.push(this.summary.toString());
        }
        var arrays = [this.authors, this.categories, this.links, this.contributors, this.extensions];
        for (var x in arrays) {
            if (arrays[x]) {
                for (var y in arrays[x]) {
                    s.push(arrays[x][y]);
                }
            }
        }
        if (this.content) {
            s.push(this.content.toString());
        }
        s.push("</entry>\n");
        return s.join("");
    }, getEditHref:function () {
        if (this.links === null || this.links.length === 0) {
            return null;
        }
        for (var x in this.links) {
            if (this.links[x].rel && this.links[x].rel == "edit") {
                return this.links[x].href;
            }
        }
        return null;
    }, setEditHref:function (url) {
        if (this.links === null) {
            this.links = [];
        }
        for (var x in this.links) {
            if (this.links[x].rel && this.links[x].rel == "edit") {
                this.links[x].href = url;
                return;
            }
        }
        this.addLink(url, "edit");
    }});
    model.Feed = declare(model.AtomItem, {_accepts:{"author":true, "content":true, "category":true, "contributor":true, "created":true, "id":true, "link":true, "published":true, "rights":true, "summary":true, "title":true, "updated":true, "xmlbase":true, "entry":true, "logo":true, "issued":true, "modified":true, "icon":true, "subtitle":true}, addEntry:function (entry) {
        if (!entry.id) {
            throw new Error("The entry object must be assigned an ID attribute.");
        }
        if (!this.entries) {
            this.entries = [];
        }
        entry.feedUrl = this.getSelfHref();
        this.entries.push(entry);
    }, getFirstEntry:function () {
        if (!this.entries || this.entries.length === 0) {
            return null;
        }
        return this.entries[0];
    }, getEntry:function (entryId) {
        if (!this.entries) {
            return null;
        }
        for (var x in this.entries) {
            if (this.entries[x].id == entryId) {
                return this.entries[x];
            }
        }
        return null;
    }, removeEntry:function (entry) {
        if (!this.entries) {
            return;
        }
        var count = 0;
        for (var i = 0; i < this.entries.length; i++) {
            if (this.entries[i] === entry) {
                this.entries.splice(i, 1);
                count++;
            }
        }
        return count;
    }, setEntries:function (arrayOfEntry) {
        for (var x in arrayOfEntry) {
            this.addEntry(arrayOfEntry[x]);
        }
    }, toString:function () {
        var s = [];
        var i;
        s.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        s.push("<feed xmlns=\"" + model._Constants.ATOM_URI + "\"");
        if (this.xmlBase) {
            s.push(" xml:base=\"" + this.xmlBase + "\"");
        }
        for (i in this.name_spaces) {
            s.push(" xmlns:" + i + "=\"" + this.name_spaces[i] + "\"");
        }
        s.push(">\n");
        s.push("<id>" + (this.id ? this.id : "") + "</id>\n");
        if (this.title) {
            s.push(this.title);
        }
        if (this.copyright && !this.rights) {
            this.rights = this.copyright;
        }
        if (this.rights) {
            s.push("<rights>" + this.rights + "</rights>\n");
        }
        if (this.issued) {
            s.push("<issued>" + stamp.toISOString(this.issued) + "</issued>\n");
        }
        if (this.modified) {
            s.push("<modified>" + stamp.toISOString(this.modified) + "</modified>\n");
        }
        if (this.modified && !this.updated) {
            this.updated = this.modified;
        }
        if (this.updated) {
            s.push("<updated>" + stamp.toISOString(this.updated) + "</updated>\n");
        }
        if (this.published) {
            s.push("<published>" + stamp.toISOString(this.published) + "</published>\n");
        }
        if (this.icon) {
            s.push("<icon>" + this.icon + "</icon>\n");
        }
        if (this.language) {
            s.push("<language>" + this.language + "</language>\n");
        }
        if (this.logo) {
            s.push("<logo>" + this.logo + "</logo>\n");
        }
        if (this.subtitle) {
            s.push(this.subtitle.toString());
        }
        if (this.tagline) {
            s.push(this.tagline.toString());
        }
        var arrays = [this.alternateLinks, this.authors, this.categories, this.contributors, this.otherLinks, this.extensions, this.entries];
        for (i in arrays) {
            if (arrays[i]) {
                for (var x in arrays[i]) {
                    s.push(arrays[i][x]);
                }
            }
        }
        s.push("</feed>");
        return s.join("");
    }, createEntry:function () {
        var entry = new model.Entry();
        entry.feedUrl = this.getSelfHref();
        return entry;
    }, getSelfHref:function () {
        if (this.links === null || this.links.length === 0) {
            return null;
        }
        for (var x in this.links) {
            if (this.links[x].rel && this.links[x].rel == "self") {
                return this.links[x].href;
            }
        }
        return null;
    }});
    model.Service = declare(model.AtomItem, {constructor:function (href) {
        this.href = href;
    }, buildFromDom:function (node) {
        var i;
        this.workspaces = [];
        if (node.tagName != "service") {
            return;
        }
        if (node.namespaceURI != model._Constants.PURL_NS && node.namespaceURI != model._Constants.APP_NS) {
            return;
        }
        var ns = node.namespaceURI;
        this.name_space = node.namespaceURI;
        var workspaces;
        if (typeof (node.getElementsByTagNameNS) != "undefined") {
            workspaces = node.getElementsByTagNameNS(ns, "workspace");
        } else {
            workspaces = [];
            var temp = node.getElementsByTagName("workspace");
            for (i = 0; i < temp.length; i++) {
                if (temp[i].namespaceURI == ns) {
                    workspaces.push(temp[i]);
                }
            }
        }
        if (workspaces && workspaces.length > 0) {
            var wkLen = 0;
            var workspace;
            for (i = 0; i < workspaces.length; i++) {
                workspace = (typeof (workspaces.item) === "undefined" ? workspaces[i] : workspaces.item(i));
                var wkspace = new model.Workspace();
                wkspace.buildFromDom(workspace);
                this.workspaces[wkLen++] = wkspace;
            }
        }
    }, getCollection:function (url) {
        for (var i = 0; i < this.workspaces.length; i++) {
            var coll = this.workspaces[i].collections;
            for (var j = 0; j < coll.length; j++) {
                if (coll[j].href == url) {
                    return coll;
                }
            }
        }
        return null;
    }});
    model.Workspace = declare(model.AtomItem, {constructor:function (title) {
        this.title = title;
        this.collections = [];
    }, buildFromDom:function (node) {
        var name = model.util.getNodename(node);
        if (name != "workspace") {
            return;
        }
        var c = node.childNodes;
        var len = 0;
        for (var i = 0; i < c.length; i++) {
            var child = c[i];
            if (child.nodeType === 1) {
                name = model.util.getNodename(child);
                if (child.namespaceURI == model._Constants.PURL_NS || child.namespaceURI == model._Constants.APP_NS) {
                    if (name === "collection") {
                        var coll = new model.Collection();
                        coll.buildFromDom(child);
                        this.collections[len++] = coll;
                    }
                } else {
                    if (child.namespaceURI === model._Constants.ATOM_NS) {
                        if (name === "title") {
                            this.title = parser.textContent(child);
                        }
                    }
                }
            }
        }
    }});
    model.Collection = declare(model.AtomItem, {constructor:function (href, title) {
        this.href = href;
        this.title = title;
        this.attributes = [];
        this.features = [];
        this.children = [];
        this.memberType = null;
        this.id = null;
    }, buildFromDom:function (node) {
        this.href = node.getAttribute("href");
        var c = node.childNodes;
        for (var i = 0; i < c.length; i++) {
            var child = c[i];
            if (child.nodeType === 1) {
                var name = model.util.getNodename(child);
                if (child.namespaceURI == model._Constants.PURL_NS || child.namespaceURI == model._Constants.APP_NS) {
                    if (name === "member-type") {
                        this.memberType = parser.textContent(child);
                    } else {
                        if (name == "feature") {
                            if (child.getAttribute("id")) {
                                this.features.push(child.getAttribute("id"));
                            }
                        } else {
                            var unknownTypeChild = new model.Node();
                            unknownTypeChild.buildFromDom(child);
                            this.children.push(unknownTypeChild);
                        }
                    }
                } else {
                    if (child.namespaceURI === model._Constants.ATOM_NS) {
                        if (name === "id") {
                            this.id = parser.textContent(child);
                        } else {
                            if (name === "title") {
                                this.title = parser.textContent(child);
                            }
                        }
                    }
                }
            }
        }
    }});
    return model;
});

