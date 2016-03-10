//>>built

require({cache:{"url:dojox/atom/widget/templates/EntryHeader.html":"<span dojoAttachPoint=\"entryHeaderNode\" class=\"entryHeaderNode\"></span>\n", "url:dojox/atom/widget/templates/FeedEntryViewer.html":"<div class=\"feedEntryViewer\">\n    <table border=\"0\" width=\"100%\" class=\"feedEntryViewerMenuTable\" dojoAttachPoint=\"feedEntryViewerMenu\" style=\"display: none;\">\n        <tr width=\"100%\"  dojoAttachPoint=\"entryCheckBoxDisplayOptions\">\n            <td align=\"right\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"displayOptions\" dojoAttachEvent=\"onclick:_toggleOptions\"></span>\n            </td>\n        </tr>\n        <tr class=\"feedEntryViewerDisplayCheckbox\" dojoAttachPoint=\"entryCheckBoxRow\" width=\"100%\" style=\"display: none;\">\n            <td dojoAttachPoint=\"feedEntryCelltitle\">\n                <input type=\"checkbox\" name=\"title\" value=\"Title\" dojoAttachPoint=\"feedEntryCheckBoxTitle\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelTitle\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellauthors\">\n                <input type=\"checkbox\" name=\"authors\" value=\"Authors\" dojoAttachPoint=\"feedEntryCheckBoxAuthors\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelAuthors\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellcontributors\">\n                <input type=\"checkbox\" name=\"contributors\" value=\"Contributors\" dojoAttachPoint=\"feedEntryCheckBoxContributors\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelContributors\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellid\">\n                <input type=\"checkbox\" name=\"id\" value=\"Id\" dojoAttachPoint=\"feedEntryCheckBoxId\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelId\"></label>\n            </td>\n            <td rowspan=\"2\" align=\"right\">\n                <span class=\"feedEntryViewerMenu\" dojoAttachPoint=\"close\" dojoAttachEvent=\"onclick:_toggleOptions\"></span>\n            </td>\n\t\t</tr>\n\t\t<tr class=\"feedEntryViewerDisplayCheckbox\" dojoAttachPoint=\"entryCheckBoxRow2\" width=\"100%\" style=\"display: none;\">\n            <td dojoAttachPoint=\"feedEntryCellupdated\">\n                <input type=\"checkbox\" name=\"updated\" value=\"Updated\" dojoAttachPoint=\"feedEntryCheckBoxUpdated\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelUpdated\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellsummary\">\n                <input type=\"checkbox\" name=\"summary\" value=\"Summary\" dojoAttachPoint=\"feedEntryCheckBoxSummary\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelSummary\"></label>\n            </td>\n            <td dojoAttachPoint=\"feedEntryCellcontent\">\n                <input type=\"checkbox\" name=\"content\" value=\"Content\" dojoAttachPoint=\"feedEntryCheckBoxContent\" dojoAttachEvent=\"onclick:_toggleCheckbox\"/>\n\t\t\t\t<label for=\"title\" dojoAttachPoint=\"feedEntryCheckBoxLabelContent\"></label>\n            </td>\n        </tr>\n    </table>\n    \n    <table class=\"feedEntryViewerContainer\" border=\"0\" width=\"100%\">\n        <tr class=\"feedEntryViewerTitle\" dojoAttachPoint=\"entryTitleRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryTitleHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryTitleNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n\n        <tr class=\"feedEntryViewerAuthor\" dojoAttachPoint=\"entryAuthorRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryAuthorHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryAuthorNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n\n        <tr class=\"feedEntryViewerContributor\" dojoAttachPoint=\"entryContributorRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryContributorHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryContributorNode\" class=\"feedEntryViewerContributorNames\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n        \n        <tr class=\"feedEntryViewerId\" dojoAttachPoint=\"entryIdRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryIdHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryIdNode\" class=\"feedEntryViewerIdText\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerUpdated\" dojoAttachPoint=\"entryUpdatedRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryUpdatedHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryUpdatedNode\" class=\"feedEntryViewerUpdatedText\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerSummary\" dojoAttachPoint=\"entrySummaryRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entrySummaryHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entrySummaryNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    \n        <tr class=\"feedEntryViewerContent\" dojoAttachPoint=\"entryContentRow\" style=\"display: none;\">\n            <td>\n                <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n                    <tr class=\"graphic-tab-lgray\">\n\t\t\t\t\t\t<td class=\"lp2\">\n\t\t\t\t\t\t\t<span class=\"lp\" dojoAttachPoint=\"entryContentHeader\"></span>\n\t\t\t\t\t\t</td>\n                    </tr>\n                    <tr>\n                        <td dojoAttachPoint=\"entryContentNode\">\n                        </td>\n                    </tr>\n                </table>\n            </td>\n        </tr>\n    </table>\n</div>\n"}});
define("dojox/atom/widget/FeedEntryViewer", ["dojo/_base/kernel", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/fx", "dojo/_base/array", "dojo/dom-style", "dojo/dom-construct", "dijit/_Widget", "dijit/_Templated", "dijit/_Container", "dijit/layout/ContentPane", "../io/Connection", "dojo/text!./templates/FeedEntryViewer.html", "dojo/text!./templates/EntryHeader.html", "dojo/i18n!./nls/FeedEntryViewer"], function (dojo, connect, declare, fx, arrayUtil, domStyle, domConstruct, _Widget, _Templated, _Container, ContentPane, Connection, template, headerTemplate, i18nViewer) {
    dojo.experimental("dojox.atom.widget.FeedEntryViewer");
    var FeedEntryViewer = declare("dojox.atom.widget.FeedEntryViewer", [_Widget, _Templated, _Container], {entrySelectionTopic:"", _validEntryFields:{}, displayEntrySections:"", _displayEntrySections:null, enableMenu:false, enableMenuFade:false, _optionButtonDisplayed:true, templateString:template, _entry:null, _feed:null, _editMode:false, postCreate:function () {
        if (this.entrySelectionTopic !== "") {
            this._subscriptions = [dojo.subscribe(this.entrySelectionTopic, this, "_handleEvent")];
        }
        var _nlsResources = i18nViewer;
        this.displayOptions.innerHTML = _nlsResources.displayOptions;
        this.feedEntryCheckBoxLabelTitle.innerHTML = _nlsResources.title;
        this.feedEntryCheckBoxLabelAuthors.innerHTML = _nlsResources.authors;
        this.feedEntryCheckBoxLabelContributors.innerHTML = _nlsResources.contributors;
        this.feedEntryCheckBoxLabelId.innerHTML = _nlsResources.id;
        this.close.innerHTML = _nlsResources.close;
        this.feedEntryCheckBoxLabelUpdated.innerHTML = _nlsResources.updated;
        this.feedEntryCheckBoxLabelSummary.innerHTML = _nlsResources.summary;
        this.feedEntryCheckBoxLabelContent.innerHTML = _nlsResources.content;
    }, startup:function () {
        if (this.displayEntrySections === "") {
            this._displayEntrySections = ["title", "authors", "contributors", "summary", "content", "id", "updated"];
        } else {
            this._displayEntrySections = this.displayEntrySections.split(",");
        }
        this._setDisplaySectionsCheckboxes();
        if (this.enableMenu) {
            domStyle.set(this.feedEntryViewerMenu, "display", "");
            if (this.entryCheckBoxRow && this.entryCheckBoxRow2) {
                if (this.enableMenuFade) {
                    fx.fadeOut({node:this.entryCheckBoxRow, duration:250}).play();
                    fx.fadeOut({node:this.entryCheckBoxRow2, duration:250}).play();
                }
            }
        }
    }, clear:function () {
        this.destroyDescendants();
        this._entry = null;
        this._feed = null;
        this.clearNodes();
    }, clearNodes:function () {
        arrayUtil.forEach(["entryTitleRow", "entryAuthorRow", "entryContributorRow", "entrySummaryRow", "entryContentRow", "entryIdRow", "entryUpdatedRow"], function (node) {
            domStyle.set(this[node], "display", "none");
        }, this);
        arrayUtil.forEach(["entryTitleNode", "entryTitleHeader", "entryAuthorHeader", "entryContributorHeader", "entryContributorNode", "entrySummaryHeader", "entrySummaryNode", "entryContentHeader", "entryContentNode", "entryIdNode", "entryIdHeader", "entryUpdatedHeader", "entryUpdatedNode"], function (part) {
            while (this[part].firstChild) {
                domConstruct.destroy(this[part].firstChild);
            }
        }, this);
    }, setEntry:function (entry, feed, leaveMenuState) {
        this.clear();
        this._validEntryFields = {};
        this._entry = entry;
        this._feed = feed;
        if (entry !== null) {
            if (this.entryTitleHeader) {
                this.setTitleHeader(this.entryTitleHeader, entry);
            }
            if (this.entryTitleNode) {
                this.setTitle(this.entryTitleNode, this._editMode, entry);
            }
            if (this.entryAuthorHeader) {
                this.setAuthorsHeader(this.entryAuthorHeader, entry);
            }
            if (this.entryAuthorNode) {
                this.setAuthors(this.entryAuthorNode, this._editMode, entry);
            }
            if (this.entryContributorHeader) {
                this.setContributorsHeader(this.entryContributorHeader, entry);
            }
            if (this.entryContributorNode) {
                this.setContributors(this.entryContributorNode, this._editMode, entry);
            }
            if (this.entryIdHeader) {
                this.setIdHeader(this.entryIdHeader, entry);
            }
            if (this.entryIdNode) {
                this.setId(this.entryIdNode, this._editMode, entry);
            }
            if (this.entryUpdatedHeader) {
                this.setUpdatedHeader(this.entryUpdatedHeader, entry);
            }
            if (this.entryUpdatedNode) {
                this.setUpdated(this.entryUpdatedNode, this._editMode, entry);
            }
            if (this.entrySummaryHeader) {
                this.setSummaryHeader(this.entrySummaryHeader, entry);
            }
            if (this.entrySummaryNode) {
                this.setSummary(this.entrySummaryNode, this._editMode, entry);
            }
            if (this.entryContentHeader) {
                this.setContentHeader(this.entryContentHeader, entry);
            }
            if (this.entryContentNode) {
                this.setContent(this.entryContentNode, this._editMode, entry);
            }
        }
        this._displaySections();
    }, setTitleHeader:function (titleHeaderNode, entry) {
        if (entry.title && entry.title.value && entry.title.value !== null) {
            var _nlsResources = i18nViewer;
            var titleHeader = new EntryHeader({title:_nlsResources.title});
            titleHeaderNode.appendChild(titleHeader.domNode);
        }
    }, setTitle:function (titleAnchorNode, editMode, entry) {
        if (entry.title && entry.title.value && entry.title.value !== null) {
            if (entry.title.type == "text") {
                var titleNode = document.createTextNode(entry.title.value);
                titleAnchorNode.appendChild(titleNode);
            } else {
                var titleViewNode = document.createElement("span");
                var titleView = new ContentPane({refreshOnShow:true, executeScripts:false}, titleViewNode);
                titleView.attr("content", entry.title.value);
                titleAnchorNode.appendChild(titleView.domNode);
            }
            this.setFieldValidity("title", true);
        }
    }, setAuthorsHeader:function (authorHeaderNode, entry) {
        if (entry.authors && entry.authors.length > 0) {
            var _nlsResources = i18nViewer;
            var authorHeader = new EntryHeader({title:_nlsResources.authors});
            authorHeaderNode.appendChild(authorHeader.domNode);
        }
    }, setAuthors:function (authorsAnchorNode, editMode, entry) {
        authorsAnchorNode.innerHTML = "";
        if (entry.authors && entry.authors.length > 0) {
            for (var i in entry.authors) {
                if (entry.authors[i].name) {
                    var anchor = authorsAnchorNode;
                    if (entry.authors[i].uri) {
                        var link = document.createElement("a");
                        anchor.appendChild(link);
                        link.href = entry.authors[i].uri;
                        anchor = link;
                    }
                    var name = entry.authors[i].name;
                    if (entry.authors[i].email) {
                        name = name + " (" + entry.authors[i].email + ")";
                    }
                    var authorNode = document.createTextNode(name);
                    anchor.appendChild(authorNode);
                    var breakNode = document.createElement("br");
                    authorsAnchorNode.appendChild(breakNode);
                    this.setFieldValidity("authors", true);
                }
            }
        }
    }, setContributorsHeader:function (contributorsHeaderNode, entry) {
        if (entry.contributors && entry.contributors.length > 0) {
            var _nlsResources = i18nViewer;
            var contributorHeader = new EntryHeader({title:_nlsResources.contributors});
            contributorsHeaderNode.appendChild(contributorHeader.domNode);
        }
    }, setContributors:function (contributorsAnchorNode, editMode, entry) {
        if (entry.contributors && entry.contributors.length > 0) {
            for (var i in entry.contributors) {
                var contributorNode = document.createTextNode(entry.contributors[i].name);
                contributorsAnchorNode.appendChild(contributorNode);
                var breakNode = document.createElement("br");
                contributorsAnchorNode.appendChild(breakNode);
                this.setFieldValidity("contributors", true);
            }
        }
    }, setIdHeader:function (idHeaderNode, entry) {
        if (entry.id && entry.id !== null) {
            var _nlsResources = i18nViewer;
            var idHeader = new EntryHeader({title:_nlsResources.id});
            idHeaderNode.appendChild(idHeader.domNode);
        }
    }, setId:function (idAnchorNode, editMode, entry) {
        if (entry.id && entry.id !== null) {
            var idNode = document.createTextNode(entry.id);
            idAnchorNode.appendChild(idNode);
            this.setFieldValidity("id", true);
        }
    }, setUpdatedHeader:function (updatedHeaderNode, entry) {
        if (entry.updated && entry.updated !== null) {
            var _nlsResources = i18nViewer;
            var updatedHeader = new EntryHeader({title:_nlsResources.updated});
            updatedHeaderNode.appendChild(updatedHeader.domNode);
        }
    }, setUpdated:function (updatedAnchorNode, editMode, entry) {
        if (entry.updated && entry.updated !== null) {
            var updatedNode = document.createTextNode(entry.updated);
            updatedAnchorNode.appendChild(updatedNode);
            this.setFieldValidity("updated", true);
        }
    }, setSummaryHeader:function (summaryHeaderNode, entry) {
        if (entry.summary && entry.summary.value && entry.summary.value !== null) {
            var _nlsResources = i18nViewer;
            var summaryHeader = new EntryHeader({title:_nlsResources.summary});
            summaryHeaderNode.appendChild(summaryHeader.domNode);
        }
    }, setSummary:function (summaryAnchorNode, editMode, entry) {
        if (entry.summary && entry.summary.value && entry.summary.value !== null) {
            var summaryViewNode = document.createElement("span");
            var summaryView = new ContentPane({refreshOnShow:true, executeScripts:false}, summaryViewNode);
            summaryView.attr("content", entry.summary.value);
            summaryAnchorNode.appendChild(summaryView.domNode);
            this.setFieldValidity("summary", true);
        }
    }, setContentHeader:function (contentHeaderNode, entry) {
        if (entry.content && entry.content.value && entry.content.value !== null) {
            var _nlsResources = i18nViewer;
            var contentHeader = new EntryHeader({title:_nlsResources.content});
            contentHeaderNode.appendChild(contentHeader.domNode);
        }
    }, setContent:function (contentAnchorNode, editMode, entry) {
        if (entry.content && entry.content.value && entry.content.value !== null) {
            var contentViewNode = document.createElement("span");
            var contentView = new ContentPane({refreshOnShow:true, executeScripts:false}, contentViewNode);
            contentView.attr("content", entry.content.value);
            contentAnchorNode.appendChild(contentView.domNode);
            this.setFieldValidity("content", true);
        }
    }, _displaySections:function () {
        domStyle.set(this.entryTitleRow, "display", "none");
        domStyle.set(this.entryAuthorRow, "display", "none");
        domStyle.set(this.entryContributorRow, "display", "none");
        domStyle.set(this.entrySummaryRow, "display", "none");
        domStyle.set(this.entryContentRow, "display", "none");
        domStyle.set(this.entryIdRow, "display", "none");
        domStyle.set(this.entryUpdatedRow, "display", "none");
        for (var i in this._displayEntrySections) {
            var section = this._displayEntrySections[i].toLowerCase();
            if (section === "title" && this.isFieldValid("title")) {
                domStyle.set(this.entryTitleRow, "display", "");
            }
            if (section === "authors" && this.isFieldValid("authors")) {
                domStyle.set(this.entryAuthorRow, "display", "");
            }
            if (section === "contributors" && this.isFieldValid("contributors")) {
                domStyle.set(this.entryContributorRow, "display", "");
            }
            if (section === "summary" && this.isFieldValid("summary")) {
                domStyle.set(this.entrySummaryRow, "display", "");
            }
            if (section === "content" && this.isFieldValid("content")) {
                domStyle.set(this.entryContentRow, "display", "");
            }
            if (section === "id" && this.isFieldValid("id")) {
                domStyle.set(this.entryIdRow, "display", "");
            }
            if (section === "updated" && this.isFieldValid("updated")) {
                domStyle.set(this.entryUpdatedRow, "display", "");
            }
        }
    }, setDisplaySections:function (sectionsArray) {
        if (sectionsArray !== null) {
            this._displayEntrySections = sectionsArray;
            this._displaySections();
        } else {
            this._displayEntrySections = ["title", "authors", "contributors", "summary", "content", "id", "updated"];
        }
    }, _setDisplaySectionsCheckboxes:function () {
        var items = ["title", "authors", "contributors", "summary", "content", "id", "updated"];
        for (var i in items) {
            if (arrayUtil.indexOf(this._displayEntrySections, items[i]) == -1) {
                domStyle.set(this["feedEntryCell" + items[i]], "display", "none");
            } else {
                this["feedEntryCheckBox" + items[i].substring(0, 1).toUpperCase() + items[i].substring(1)].checked = true;
            }
        }
    }, _readDisplaySections:function () {
        var checkedList = [];
        if (this.feedEntryCheckBoxTitle.checked) {
            checkedList.push("title");
        }
        if (this.feedEntryCheckBoxAuthors.checked) {
            checkedList.push("authors");
        }
        if (this.feedEntryCheckBoxContributors.checked) {
            checkedList.push("contributors");
        }
        if (this.feedEntryCheckBoxSummary.checked) {
            checkedList.push("summary");
        }
        if (this.feedEntryCheckBoxContent.checked) {
            checkedList.push("content");
        }
        if (this.feedEntryCheckBoxId.checked) {
            checkedList.push("id");
        }
        if (this.feedEntryCheckBoxUpdated.checked) {
            checkedList.push("updated");
        }
        this._displayEntrySections = checkedList;
    }, _toggleCheckbox:function (checkBox) {
        if (checkBox.checked) {
            checkBox.checked = false;
        } else {
            checkBox.checked = true;
        }
        this._readDisplaySections();
        this._displaySections();
    }, _toggleOptions:function (checkBox) {
        if (this.enableMenu) {
            var fade = null;
            var anim;
            var anim2;
            if (this._optionButtonDisplayed) {
                if (this.enableMenuFade) {
                    anim = fx.fadeOut({node:this.entryCheckBoxDisplayOptions, duration:250});
                    connect.connect(anim, "onEnd", this, function () {
                        domStyle.set(this.entryCheckBoxDisplayOptions, "display", "none");
                        domStyle.set(this.entryCheckBoxRow, "display", "");
                        domStyle.set(this.entryCheckBoxRow2, "display", "");
                        fx.fadeIn({node:this.entryCheckBoxRow, duration:250}).play();
                        fx.fadeIn({node:this.entryCheckBoxRow2, duration:250}).play();
                    });
                    anim.play();
                } else {
                    domStyle.set(this.entryCheckBoxDisplayOptions, "display", "none");
                    domStyle.set(this.entryCheckBoxRow, "display", "");
                    domStyle.set(this.entryCheckBoxRow2, "display", "");
                }
                this._optionButtonDisplayed = false;
            } else {
                if (this.enableMenuFade) {
                    anim = fx.fadeOut({node:this.entryCheckBoxRow, duration:250});
                    anim2 = fx.fadeOut({node:this.entryCheckBoxRow2, duration:250});
                    connect.connect(anim, "onEnd", this, function () {
                        domStyle.set(this.entryCheckBoxRow, "display", "none");
                        domStyle.set(this.entryCheckBoxRow2, "display", "none");
                        domStyle.set(this.entryCheckBoxDisplayOptions, "display", "");
                        fx.fadeIn({node:this.entryCheckBoxDisplayOptions, duration:250}).play();
                    });
                    anim.play();
                    anim2.play();
                } else {
                    domStyle.set(this.entryCheckBoxRow, "display", "none");
                    domStyle.set(this.entryCheckBoxRow2, "display", "none");
                    domStyle.set(this.entryCheckBoxDisplayOptions, "display", "");
                }
                this._optionButtonDisplayed = true;
            }
        }
    }, _handleEvent:function (entrySelectionEvent) {
        if (entrySelectionEvent.source != this) {
            if (entrySelectionEvent.action == "set" && entrySelectionEvent.entry) {
                this.setEntry(entrySelectionEvent.entry, entrySelectionEvent.feed);
            } else {
                if (entrySelectionEvent.action == "delete" && entrySelectionEvent.entry && entrySelectionEvent.entry == this._entry) {
                    this.clear();
                }
            }
        }
    }, setFieldValidity:function (field, isValid) {
        if (field) {
            var lowerField = field.toLowerCase();
            this._validEntryFields[field] = isValid;
        }
    }, isFieldValid:function (field) {
        return this._validEntryFields[field.toLowerCase()];
    }, getEntry:function () {
        return this._entry;
    }, getFeed:function () {
        return this._feed;
    }, destroy:function () {
        this.clear();
        arrayUtil.forEach(this._subscriptions, dojo.unsubscribe);
    }});
    var EntryHeader = FeedEntryViewer.EntryHeader = declare("dojox.atom.widget.EntryHeader", [_Widget, _Templated, _Container], {title:"", templateString:headerTemplate, postCreate:function () {
        this.setListHeader();
    }, setListHeader:function (title) {
        this.clear();
        if (title) {
            this.title = title;
        }
        var textNode = document.createTextNode(this.title);
        this.entryHeaderNode.appendChild(textNode);
    }, clear:function () {
        this.destroyDescendants();
        if (this.entryHeaderNode) {
            for (var i = 0; i < this.entryHeaderNode.childNodes.length; i++) {
                this.entryHeaderNode.removeChild(this.entryHeaderNode.childNodes[i]);
            }
        }
    }, destroy:function () {
        this.clear();
    }});
    return FeedEntryViewer;
});

