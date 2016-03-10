//>>built

require({cache:{"url:dijit/templates/Tree.html":"<div role=\"tree\">\n\t<div class=\"dijitInline dijitTreeIndent\" style=\"position: absolute; top: -9999px\" data-dojo-attach-point=\"indentDetector\"></div>\n\t<div class=\"dijitTreeExpando dijitTreeExpandoLoading\" data-dojo-attach-point=\"rootLoadingIndicator\"></div>\n\t<div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\">\n\t</div>\n</div>\n", "url:dijit/templates/TreeNode.html":"<div class=\"dijitTreeNode\" role=\"presentation\"\n\t><div data-dojo-attach-point=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\"\n\t\t><span data-dojo-attach-point=\"expandoNode\" class=\"dijitInline dijitTreeExpando\" role=\"presentation\"></span\n\t\t><span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span\n\t\t><span data-dojo-attach-point=\"contentNode\"\n\t\t\tclass=\"dijitTreeContent\" role=\"presentation\">\n\t\t\t<span role=\"presentation\" class=\"dijitInline dijitIcon dijitTreeIcon\" data-dojo-attach-point=\"iconNode\"></span\n\t\t\t><span data-dojo-attach-point=\"labelNode,focusNode\" class=\"dijitTreeLabel\" role=\"treeitem\"\n\t\t\t\t   tabindex=\"-1\" aria-selected=\"false\" id=\"${id}_label\"></span>\n\t\t</span\n\t></div>\n\t<div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeNodeContainer\" role=\"presentation\"\n\t\t style=\"display: none;\" aria-labelledby=\"${id}_label\"></div>\n</div>\n"}});
define("dijit/Tree", ["dojo/_base/array", "dojo/aspect", "dojo/cookie", "dojo/_base/declare", "dojo/Deferred", "dojo/promise/all", "dojo/dom", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/errors/create", "dojo/fx", "dojo/has", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/topic", "dojo/touch", "dojo/when", "./a11yclick", "./focus", "./registry", "./_base/manager", "./_Widget", "./_TemplatedMixin", "./_Container", "./_Contained", "./_CssStateMixin", "./_KeyNavMixin", "dojo/text!./templates/TreeNode.html", "dojo/text!./templates/Tree.html", "./tree/TreeStoreModel", "./tree/ForestStoreModel", "./tree/_dndSelector", "dojo/query!css2"], function (array, aspect, cookie, declare, Deferred, all, dom, domClass, domGeometry, domStyle, createError, fxUtils, has, kernel, keys, lang, on, topic, touch, when, a11yclick, focus, registry, manager, _Widget, _TemplatedMixin, _Container, _Contained, _CssStateMixin, _KeyNavMixin, treeNodeTemplate, treeTemplate, TreeStoreModel, ForestStoreModel, _dndSelector) {
    function shimmedPromise(d) {
        return lang.delegate(d.promise || d, {addCallback:function (callback) {
            this.then(callback);
        }, addErrback:function (errback) {
            this.otherwise(errback);
        }});
    }
    var TreeNode = declare("dijit._TreeNode", [_Widget, _TemplatedMixin, _Container, _Contained, _CssStateMixin], {item:null, isTreeNode:true, label:"", _setLabelAttr:function (val) {
        this.labelNode[this.labelType == "html" ? "innerHTML" : "innerText" in this.labelNode ? "innerText" : "textContent"] = val;
        this._set("label", val);
    }, labelType:"text", isExpandable:null, isExpanded:false, state:"NotLoaded", templateString:treeNodeTemplate, baseClass:"dijitTreeNode", cssStateNodes:{rowNode:"dijitTreeRow"}, _setTooltipAttr:{node:"rowNode", type:"attribute", attribute:"title"}, buildRendering:function () {
        this.inherited(arguments);
        this._setExpando();
        this._updateItemClasses(this.item);
        if (this.isExpandable) {
            this.labelNode.setAttribute("aria-expanded", this.isExpanded);
        }
        this.setSelected(false);
    }, _setIndentAttr:function (indent) {
        var pixels = (Math.max(indent, 0) * this.tree._nodePixelIndent) + "px";
        domStyle.set(this.domNode, "backgroundPosition", pixels + " 0px");
        domStyle.set(this.rowNode, this.isLeftToRight() ? "paddingLeft" : "paddingRight", pixels);
        array.forEach(this.getChildren(), function (child) {
            child.set("indent", indent + 1);
        });
        this._set("indent", indent);
    }, markProcessing:function () {
        this.state = "Loading";
        this._setExpando(true);
    }, unmarkProcessing:function () {
        this._setExpando(false);
    }, _updateItemClasses:function (item) {
        var tree = this.tree, model = tree.model;
        if (tree._v10Compat && item === model.root) {
            item = null;
        }
        this._applyClassAndStyle(item, "icon", "Icon");
        this._applyClassAndStyle(item, "label", "Label");
        this._applyClassAndStyle(item, "row", "Row");
        this.tree._startPaint(true);
    }, _applyClassAndStyle:function (item, lower, upper) {
        var clsName = "_" + lower + "Class";
        var nodeName = lower + "Node";
        var oldCls = this[clsName];
        this[clsName] = this.tree["get" + upper + "Class"](item, this.isExpanded);
        domClass.replace(this[nodeName], this[clsName] || "", oldCls || "");
        domStyle.set(this[nodeName], this.tree["get" + upper + "Style"](item, this.isExpanded) || {});
    }, _updateLayout:function () {
        var parent = this.getParent(), markAsRoot = !parent || !parent.rowNode || parent.rowNode.style.display == "none";
        domClass.toggle(this.domNode, "dijitTreeIsRoot", markAsRoot);
        domClass.toggle(this.domNode, "dijitTreeIsLast", !markAsRoot && !this.getNextSibling());
    }, _setExpando:function (processing) {
        var styles = ["dijitTreeExpandoLoading", "dijitTreeExpandoOpened", "dijitTreeExpandoClosed", "dijitTreeExpandoLeaf"], _a11yStates = ["*", "-", "+", "*"], idx = processing ? 0 : (this.isExpandable ? (this.isExpanded ? 1 : 2) : 3);
        domClass.replace(this.expandoNode, styles[idx], styles);
        this.expandoNodeText.innerHTML = _a11yStates[idx];
    }, expand:function () {
        if (this._expandDeferred) {
            return shimmedPromise(this._expandDeferred);
        }
        if (this._collapseDeferred) {
            this._collapseDeferred.cancel();
            delete this._collapseDeferred;
        }
        this.isExpanded = true;
        this.labelNode.setAttribute("aria-expanded", "true");
        if (this.tree.showRoot || this !== this.tree.rootNode) {
            this.containerNode.setAttribute("role", "group");
        }
        domClass.add(this.contentNode, "dijitTreeContentExpanded");
        this._setExpando();
        this._updateItemClasses(this.item);
        if (this == this.tree.rootNode && this.tree.showRoot) {
            this.tree.domNode.setAttribute("aria-expanded", "true");
        }
        var wipeIn = fxUtils.wipeIn({node:this.containerNode, duration:manager.defaultDuration});
        var def = (this._expandDeferred = new Deferred(function () {
            wipeIn.stop();
        }));
        aspect.after(wipeIn, "onEnd", function () {
            def.resolve(true);
        }, true);
        wipeIn.play();
        return shimmedPromise(def);
    }, collapse:function () {
        if (this._collapseDeferred) {
            return shimmedPromise(this._collapseDeferred);
        }
        if (this._expandDeferred) {
            this._expandDeferred.cancel();
            delete this._expandDeferred;
        }
        this.isExpanded = false;
        this.labelNode.setAttribute("aria-expanded", "false");
        if (this == this.tree.rootNode && this.tree.showRoot) {
            this.tree.domNode.setAttribute("aria-expanded", "false");
        }
        domClass.remove(this.contentNode, "dijitTreeContentExpanded");
        this._setExpando();
        this._updateItemClasses(this.item);
        var wipeOut = fxUtils.wipeOut({node:this.containerNode, duration:manager.defaultDuration});
        var def = (this._collapseDeferred = new Deferred(function () {
            wipeOut.stop();
        }));
        aspect.after(wipeOut, "onEnd", function () {
            def.resolve(true);
        }, true);
        wipeOut.play();
        return shimmedPromise(def);
    }, indent:0, setChildItems:function (items) {
        var tree = this.tree, model = tree.model, defs = [];
        var focusedChild = tree.focusedChild;
        var oldChildren = this.getChildren();
        array.forEach(oldChildren, function (child) {
            _Container.prototype.removeChild.call(this, child);
        }, this);
        this.defer(function () {
            array.forEach(oldChildren, function (node) {
                if (!node._destroyed && !node.getParent()) {
                    tree.dndController.removeTreeNode(node);
                    function remove(node) {
                        var id = model.getIdentity(node.item), ary = tree._itemNodesMap[id];
                        if (ary.length == 1) {
                            delete tree._itemNodesMap[id];
                        } else {
                            var index = array.indexOf(ary, node);
                            if (index != -1) {
                                ary.splice(index, 1);
                            }
                        }
                        array.forEach(node.getChildren(), remove);
                    }
                    remove(node);
                    if (tree.persist) {
                        var destroyedPath = array.map(node.getTreePath(), function (item) {
                            return tree.model.getIdentity(item);
                        }).join("/");
                        for (var path in tree._openedNodes) {
                            if (path.substr(0, destroyedPath.length) == destroyedPath) {
                                delete tree._openedNodes[path];
                            }
                        }
                        tree._saveExpandedNodes();
                    }
                    if (tree.lastFocusedChild && !dom.isDescendant(tree.lastFocusedChild, tree.domNode)) {
                        delete tree.lastFocusedChild;
                    }
                    if (focusedChild && !dom.isDescendant(focusedChild, tree.domNode)) {
                        tree.focus();
                    }
                    node.destroyRecursive();
                }
            });
        });
        this.state = "Loaded";
        if (items && items.length > 0) {
            this.isExpandable = true;
            array.forEach(items, function (item) {
                var id = model.getIdentity(item), existingNodes = tree._itemNodesMap[id], node;
                if (existingNodes) {
                    for (var i = 0; i < existingNodes.length; i++) {
                        if (existingNodes[i] && !existingNodes[i].getParent()) {
                            node = existingNodes[i];
                            node.set("indent", this.indent + 1);
                            break;
                        }
                    }
                }
                if (!node) {
                    node = this.tree._createTreeNode({item:item, tree:tree, isExpandable:model.mayHaveChildren(item), label:tree.getLabel(item), labelType:(tree.model && tree.model.labelType) || "text", tooltip:tree.getTooltip(item), ownerDocument:tree.ownerDocument, dir:tree.dir, lang:tree.lang, textDir:tree.textDir, indent:this.indent + 1});
                    if (existingNodes) {
                        existingNodes.push(node);
                    } else {
                        tree._itemNodesMap[id] = [node];
                    }
                }
                this.addChild(node);
                if (this.tree.autoExpand || this.tree._state(node)) {
                    defs.push(tree._expandNode(node));
                }
            }, this);
            array.forEach(this.getChildren(), function (child) {
                child._updateLayout();
            });
        } else {
            this.isExpandable = false;
        }
        if (this._setExpando) {
            this._setExpando(false);
        }
        this._updateItemClasses(this.item);
        var def = all(defs);
        this.tree._startPaint(def);
        return shimmedPromise(def);
    }, getTreePath:function () {
        var node = this;
        var path = [];
        while (node && node !== this.tree.rootNode) {
            path.unshift(node.item);
            node = node.getParent();
        }
        path.unshift(this.tree.rootNode.item);
        return path;
    }, getIdentity:function () {
        return this.tree.model.getIdentity(this.item);
    }, removeChild:function (node) {
        this.inherited(arguments);
        var children = this.getChildren();
        if (children.length == 0) {
            this.isExpandable = false;
            this.collapse();
        }
        array.forEach(children, function (child) {
            child._updateLayout();
        });
    }, makeExpandable:function () {
        this.isExpandable = true;
        this._setExpando(false);
    }, setSelected:function (selected) {
        this.labelNode.setAttribute("aria-selected", selected ? "true" : "false");
        domClass.toggle(this.rowNode, "dijitTreeRowSelected", selected);
    }, focus:function () {
        focus.focus(this.focusNode);
    }});
    if (0) {
        TreeNode.extend({_setTextDirAttr:function (textDir) {
            if (textDir && ((this.textDir != textDir) || !this._created)) {
                this._set("textDir", textDir);
                this.applyTextDir(this.labelNode);
                array.forEach(this.getChildren(), function (childNode) {
                    childNode.set("textDir", textDir);
                }, this);
            }
        }});
    }
    var Tree = declare("dijit.Tree", [_Widget, _KeyNavMixin, _TemplatedMixin, _CssStateMixin], {baseClass:"dijitTree", store:null, model:null, query:null, label:"", showRoot:true, childrenAttr:["children"], paths:[], path:[], selectedItems:null, selectedItem:null, openOnClick:false, openOnDblClick:false, templateString:treeTemplate, persist:false, autoExpand:false, dndController:_dndSelector, dndParams:["onDndDrop", "itemCreator", "onDndCancel", "checkAcceptance", "checkItemAcceptance", "dragThreshold", "betweenThreshold"], onDndDrop:null, itemCreator:null, onDndCancel:null, checkAcceptance:null, checkItemAcceptance:null, dragThreshold:5, betweenThreshold:0, _nodePixelIndent:19, _publish:function (topicName, message) {
        topic.publish(this.id, lang.mixin({tree:this, event:topicName}, message || {}));
    }, postMixInProperties:function () {
        this.tree = this;
        if (this.autoExpand) {
            this.persist = false;
        }
        this._itemNodesMap = {};
        if (!this.cookieName && this.id) {
            this.cookieName = this.id + "SaveStateCookie";
        }
        this.expandChildrenDeferred = new Deferred();
        this.pendingCommandsPromise = this.expandChildrenDeferred.promise;
        this.inherited(arguments);
    }, postCreate:function () {
        this._initState();
        var self = this;
        this.own(on(this.containerNode, on.selector(".dijitTreeNode", touch.enter), function (evt) {
            self._onNodeMouseEnter(registry.byNode(this), evt);
        }), on(this.containerNode, on.selector(".dijitTreeNode", touch.leave), function (evt) {
            self._onNodeMouseLeave(registry.byNode(this), evt);
        }), on(this.containerNode, on.selector(".dijitTreeRow", a11yclick.press), function (evt) {
            self._onNodePress(registry.getEnclosingWidget(this), evt);
        }), on(this.containerNode, on.selector(".dijitTreeRow", a11yclick), function (evt) {
            self._onClick(registry.getEnclosingWidget(this), evt);
        }), on(this.containerNode, on.selector(".dijitTreeRow", "dblclick"), function (evt) {
            self._onDblClick(registry.getEnclosingWidget(this), evt);
        }));
        if (!this.model) {
            this._store2model();
        }
        this.own(aspect.after(this.model, "onChange", lang.hitch(this, "_onItemChange"), true), aspect.after(this.model, "onChildrenChange", lang.hitch(this, "_onItemChildrenChange"), true), aspect.after(this.model, "onDelete", lang.hitch(this, "_onItemDelete"), true));
        this.inherited(arguments);
        if (this.dndController) {
            if (lang.isString(this.dndController)) {
                this.dndController = lang.getObject(this.dndController);
            }
            var params = {};
            for (var i = 0; i < this.dndParams.length; i++) {
                if (this[this.dndParams[i]]) {
                    params[this.dndParams[i]] = this[this.dndParams[i]];
                }
            }
            this.dndController = new this.dndController(this, params);
        }
        this._load();
        this.onLoadDeferred = shimmedPromise(this.pendingCommandsPromise);
        this.onLoadDeferred.then(lang.hitch(this, "onLoad"));
    }, _store2model:function () {
        this._v10Compat = true;
        kernel.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");
        var modelParams = {id:this.id + "_ForestStoreModel", store:this.store, query:this.query, childrenAttrs:this.childrenAttr};
        if (this.params.mayHaveChildren) {
            modelParams.mayHaveChildren = lang.hitch(this, "mayHaveChildren");
        }
        if (this.params.getItemChildren) {
            modelParams.getChildren = lang.hitch(this, function (item, onComplete, onError) {
                this.getItemChildren((this._v10Compat && item === this.model.root) ? null : item, onComplete, onError);
            });
        }
        this.model = new ForestStoreModel(modelParams);
        this.showRoot = Boolean(this.label);
    }, onLoad:function () {
    }, _load:function () {
        this.model.getRoot(lang.hitch(this, function (item) {
            var rn = (this.rootNode = this.tree._createTreeNode({item:item, tree:this, isExpandable:true, label:this.label || this.getLabel(item), labelType:this.model.labelType || "text", textDir:this.textDir, indent:this.showRoot ? 0 : -1}));
            if (!this.showRoot) {
                rn.rowNode.style.display = "none";
                this.domNode.setAttribute("role", "presentation");
                this.domNode.removeAttribute("aria-expanded");
                this.domNode.removeAttribute("aria-multiselectable");
                if (this["aria-label"]) {
                    rn.containerNode.setAttribute("aria-label", this["aria-label"]);
                    this.domNode.removeAttribute("aria-label");
                } else {
                    if (this["aria-labelledby"]) {
                        rn.containerNode.setAttribute("aria-labelledby", this["aria-labelledby"]);
                        this.domNode.removeAttribute("aria-labelledby");
                    }
                }
                rn.labelNode.setAttribute("role", "presentation");
                rn.containerNode.setAttribute("role", "tree");
                rn.containerNode.setAttribute("aria-expanded", "true");
                rn.containerNode.setAttribute("aria-multiselectable", !this.dndController.singular);
            } else {
                this.domNode.setAttribute("aria-multiselectable", !this.dndController.singular);
                this.rootLoadingIndicator.style.display = "none";
            }
            this.containerNode.appendChild(rn.domNode);
            var identity = this.model.getIdentity(item);
            if (this._itemNodesMap[identity]) {
                this._itemNodesMap[identity].push(rn);
            } else {
                this._itemNodesMap[identity] = [rn];
            }
            rn._updateLayout();
            this._expandNode(rn).then(lang.hitch(this, function () {
                if (!this._destroyed) {
                    this.rootLoadingIndicator.style.display = "none";
                    this.expandChildrenDeferred.resolve(true);
                }
            }));
        }), lang.hitch(this, function (err) {
            console.error(this, ": error loading root: ", err);
        }));
    }, getNodesByItem:function (item) {
        if (!item) {
            return [];
        }
        var identity = lang.isString(item) ? item : this.model.getIdentity(item);
        return [].concat(this._itemNodesMap[identity]);
    }, _setSelectedItemAttr:function (item) {
        this.set("selectedItems", [item]);
    }, _setSelectedItemsAttr:function (items) {
        var tree = this;
        return this.pendingCommandsPromise = this.pendingCommandsPromise.always(lang.hitch(this, function () {
            var identities = array.map(items, function (item) {
                return (!item || lang.isString(item)) ? item : tree.model.getIdentity(item);
            });
            var nodes = [];
            array.forEach(identities, function (id) {
                nodes = nodes.concat(tree._itemNodesMap[id] || []);
            });
            this.set("selectedNodes", nodes);
        }));
    }, _setPathAttr:function (path) {
        if (path.length) {
            return shimmedPromise(this.set("paths", [path]).then(function (paths) {
                return paths[0];
            }));
        } else {
            return shimmedPromise(this.set("paths", []).then(function (paths) {
                return paths[0];
            }));
        }
    }, _setPathsAttr:function (paths) {
        var tree = this;
        function selectPath(path, nodes) {
            var nextPath = path.shift();
            var nextNode = array.filter(nodes, function (node) {
                return node.getIdentity() == nextPath;
            })[0];
            if (!!nextNode) {
                if (path.length) {
                    return tree._expandNode(nextNode).then(function () {
                        return selectPath(path, nextNode.getChildren());
                    });
                } else {
                    return nextNode;
                }
            } else {
                throw new Tree.PathError("Could not expand path at " + nextPath);
            }
        }
        return shimmedPromise(this.pendingCommandsPromise = this.pendingCommandsPromise.always(function () {
            return all(array.map(paths, function (path) {
                path = array.map(path, function (item) {
                    return lang.isString(item) ? item : tree.model.getIdentity(item);
                });
                if (path.length) {
                    return selectPath(path, [tree.rootNode]);
                } else {
                    throw new Tree.PathError("Empty path");
                }
            }));
        }).then(function setNodes(newNodes) {
            tree.set("selectedNodes", newNodes);
            return tree.paths;
        }));
    }, _setSelectedNodeAttr:function (node) {
        this.set("selectedNodes", [node]);
    }, _setSelectedNodesAttr:function (nodes) {
        this.dndController.setSelection(nodes);
    }, expandAll:function () {
        var _this = this;
        function expand(node) {
            return _this._expandNode(node).then(function () {
                var childBranches = array.filter(node.getChildren() || [], function (node) {
                    return node.isExpandable;
                });
                return all(array.map(childBranches, expand));
            });
        }
        return shimmedPromise(expand(this.rootNode));
    }, collapseAll:function () {
        var _this = this;
        function collapse(node) {
            var childBranches = array.filter(node.getChildren() || [], function (node) {
                return node.isExpandable;
            }), defs = all(array.map(childBranches, collapse));
            if (!node.isExpanded || (node == _this.rootNode && !_this.showRoot)) {
                return defs;
            } else {
                return defs.then(function () {
                    return _this._collapseNode(node);
                });
            }
        }
        return shimmedPromise(collapse(this.rootNode));
    }, mayHaveChildren:function () {
    }, getItemChildren:function () {
    }, getLabel:function (item) {
        return this.model.getLabel(item);
    }, getIconClass:function (item, opened) {
        return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf";
    }, getLabelClass:function () {
    }, getRowClass:function () {
    }, getIconStyle:function () {
    }, getLabelStyle:function () {
    }, getRowStyle:function () {
    }, getTooltip:function () {
        return "";
    }, _onDownArrow:function (evt, node) {
        var nextNode = this._getNext(node);
        if (nextNode && nextNode.isTreeNode) {
            this.focusNode(nextNode);
        }
    }, _onUpArrow:function (evt, node) {
        var previousSibling = node.getPreviousSibling();
        if (previousSibling) {
            node = previousSibling;
            while (node.isExpandable && node.isExpanded && node.hasChildren()) {
                var children = node.getChildren();
                node = children[children.length - 1];
            }
        } else {
            var parent = node.getParent();
            if (!(!this.showRoot && parent === this.rootNode)) {
                node = parent;
            }
        }
        if (node && node.isTreeNode) {
            this.focusNode(node);
        }
    }, _onRightArrow:function (evt, node) {
        if (node.isExpandable && !node.isExpanded) {
            this._expandNode(node);
        } else {
            if (node.hasChildren()) {
                node = node.getChildren()[0];
                if (node && node.isTreeNode) {
                    this.focusNode(node);
                }
            }
        }
    }, _onLeftArrow:function (evt, node) {
        if (node.isExpandable && node.isExpanded) {
            this._collapseNode(node);
        } else {
            var parent = node.getParent();
            if (parent && parent.isTreeNode && !(!this.showRoot && parent === this.rootNode)) {
                this.focusNode(parent);
            }
        }
    }, focusLastChild:function () {
        var node = this._getLast();
        if (node && node.isTreeNode) {
            this.focusNode(node);
        }
    }, _getFirst:function () {
        return this.showRoot ? this.rootNode : this.rootNode.getChildren()[0];
    }, _getLast:function () {
        var node = this.rootNode;
        while (node.isExpanded) {
            var c = node.getChildren();
            if (!c.length) {
                break;
            }
            node = c[c.length - 1];
        }
        return node;
    }, _getNext:function (node) {
        if (node.isExpandable && node.isExpanded && node.hasChildren()) {
            return node.getChildren()[0];
        } else {
            while (node && node.isTreeNode) {
                var returnNode = node.getNextSibling();
                if (returnNode) {
                    return returnNode;
                }
                node = node.getParent();
            }
            return null;
        }
    }, childSelector:".dijitTreeRow", isExpandoNode:function (node, widget) {
        return dom.isDescendant(node, widget.expandoNode) || dom.isDescendant(node, widget.expandoNodeText);
    }, _onNodePress:function (nodeWidget, e) {
        this.focusNode(nodeWidget);
    }, __click:function (nodeWidget, e, doOpen, func) {
        var domElement = e.target, isExpandoClick = this.isExpandoNode(domElement, nodeWidget);
        if (nodeWidget.isExpandable && (doOpen || isExpandoClick)) {
            this._onExpandoClick({node:nodeWidget});
        } else {
            this._publish("execute", {item:nodeWidget.item, node:nodeWidget, evt:e});
            this[func](nodeWidget.item, nodeWidget, e);
            this.focusNode(nodeWidget);
        }
        e.stopPropagation();
        e.preventDefault();
    }, _onClick:function (nodeWidget, e) {
        this.__click(nodeWidget, e, this.openOnClick, "onClick");
    }, _onDblClick:function (nodeWidget, e) {
        this.__click(nodeWidget, e, this.openOnDblClick, "onDblClick");
    }, _onExpandoClick:function (message) {
        var node = message.node;
        this.focusNode(node);
        if (node.isExpanded) {
            this._collapseNode(node);
        } else {
            this._expandNode(node);
        }
    }, onClick:function () {
    }, onDblClick:function () {
    }, onOpen:function () {
    }, onClose:function () {
    }, _getNextNode:function (node) {
        kernel.deprecated(this.declaredClass + "::_getNextNode(node) is deprecated. Use _getNext(node) instead.", "", "2.0");
        return this._getNext(node);
    }, _getRootOrFirstNode:function () {
        kernel.deprecated(this.declaredClass + "::_getRootOrFirstNode() is deprecated. Use _getFirst() instead.", "", "2.0");
        return this._getFirst();
    }, _collapseNode:function (node) {
        if (node._expandNodeDeferred) {
            delete node._expandNodeDeferred;
        }
        if (node.state == "Loading") {
            return;
        }
        if (node.isExpanded) {
            var ret = node.collapse();
            this.onClose(node.item, node);
            this._state(node, false);
            this._startPaint(ret);
            return ret;
        }
    }, _expandNode:function (node) {
        if (node._expandNodeDeferred) {
            return node._expandNodeDeferred;
        }
        var model = this.model, item = node.item, _this = this;
        if (!node._loadDeferred) {
            node.markProcessing();
            node._loadDeferred = new Deferred();
            model.getChildren(item, function (items) {
                node.unmarkProcessing();
                node.setChildItems(items).then(function () {
                    node._loadDeferred.resolve(items);
                });
            }, function (err) {
                console.error(_this, ": error loading " + node.label + " children: ", err);
                node._loadDeferred.reject(err);
            });
        }
        var def = node._loadDeferred.then(lang.hitch(this, function () {
            var def2 = node.expand();
            this.onOpen(node.item, node);
            this._state(node, true);
            return def2;
        }));
        this._startPaint(def);
        return def;
    }, focusNode:function (node) {
        var scrollLeft = this.domNode.scrollLeft;
        this.focusChild(node);
        this.domNode.scrollLeft = scrollLeft;
    }, _onNodeMouseEnter:function () {
    }, _onNodeMouseLeave:function () {
    }, _onItemChange:function (item) {
        var model = this.model, identity = model.getIdentity(item), nodes = this._itemNodesMap[identity];
        if (nodes) {
            var label = this.getLabel(item), tooltip = this.getTooltip(item);
            array.forEach(nodes, function (node) {
                node.set({item:item, label:label, tooltip:tooltip});
                node._updateItemClasses(item);
            });
        }
    }, _onItemChildrenChange:function (parent, newChildrenList) {
        var model = this.model, identity = model.getIdentity(parent), parentNodes = this._itemNodesMap[identity];
        if (parentNodes) {
            array.forEach(parentNodes, function (parentNode) {
                parentNode.setChildItems(newChildrenList);
            });
        }
    }, _onItemDelete:function (item) {
        var model = this.model, identity = model.getIdentity(item), nodes = this._itemNodesMap[identity];
        if (nodes) {
            array.forEach(nodes, function (node) {
                this.dndController.removeTreeNode(node);
                var parent = node.getParent();
                if (parent) {
                    parent.removeChild(node);
                }
                if (this.lastFocusedChild && !dom.isDescendant(this.lastFocusedChild, this.domNode)) {
                    delete this.lastFocusedChild;
                }
                if (this.focusedChild && !dom.isDescendant(this.focusedChild, this.domNode)) {
                    this.focus();
                }
                node.destroyRecursive();
            }, this);
            delete this._itemNodesMap[identity];
        }
    }, _initState:function () {
        this._openedNodes = {};
        if (this.persist && this.cookieName) {
            var oreo = cookie(this.cookieName);
            if (oreo) {
                array.forEach(oreo.split(","), function (item) {
                    this._openedNodes[item] = true;
                }, this);
            }
        }
    }, _state:function (node, expanded) {
        if (!this.persist) {
            return false;
        }
        var path = array.map(node.getTreePath(), function (item) {
            return this.model.getIdentity(item);
        }, this).join("/");
        if (arguments.length === 1) {
            return this._openedNodes[path];
        } else {
            if (expanded) {
                this._openedNodes[path] = true;
            } else {
                delete this._openedNodes[path];
            }
            this._saveExpandedNodes();
        }
    }, _saveExpandedNodes:function () {
        if (this.persist && this.cookieName) {
            var ary = [];
            for (var id in this._openedNodes) {
                ary.push(id);
            }
            cookie(this.cookieName, ary.join(","), {expires:365});
        }
    }, destroy:function () {
        if (this._curSearch) {
            this._curSearch.timer.remove();
            delete this._curSearch;
        }
        if (this.rootNode) {
            this.rootNode.destroyRecursive();
        }
        if (this.dndController && !lang.isString(this.dndController)) {
            this.dndController.destroy();
        }
        this.rootNode = null;
        this.inherited(arguments);
    }, destroyRecursive:function () {
        this.destroy();
    }, resize:function (changeSize) {
        if (changeSize) {
            domGeometry.setMarginBox(this.domNode, changeSize);
        }
        this._nodePixelIndent = domGeometry.position(this.tree.indentDetector).w || this._nodePixelIndent;
        this.expandChildrenDeferred.then(lang.hitch(this, function () {
            this.rootNode.set("indent", this.showRoot ? 0 : -1);
            this._adjustWidths();
        }));
    }, _outstandingPaintOperations:0, _startPaint:function (p) {
        this._outstandingPaintOperations++;
        if (this._adjustWidthsTimer) {
            this._adjustWidthsTimer.remove();
            delete this._adjustWidthsTimer;
        }
        var oc = lang.hitch(this, function () {
            this._outstandingPaintOperations--;
            if (this._outstandingPaintOperations <= 0 && !this._adjustWidthsTimer && this._started) {
                this._adjustWidthsTimer = this.defer("_adjustWidths");
            }
        });
        when(p, oc, oc);
    }, _adjustWidths:function () {
        if (this._adjustWidthsTimer) {
            this._adjustWidthsTimer.remove();
            delete this._adjustWidthsTimer;
        }
        this.containerNode.style.width = "auto";
        this.containerNode.style.width = this.domNode.scrollWidth > this.domNode.offsetWidth ? "auto" : "100%";
    }, _createTreeNode:function (args) {
        return new TreeNode(args);
    }, focus:function () {
        if (this.lastFocusedChild) {
            this.focusNode(this.lastFocusedChild);
        } else {
            this.focusFirstChild();
        }
    }});
    if (0) {
        Tree.extend({_setTextDirAttr:function (textDir) {
            if (textDir && this.textDir != textDir) {
                this._set("textDir", textDir);
                this.rootNode.set("textDir", textDir);
            }
        }});
    }
    Tree.PathError = createError("TreePathError");
    Tree._TreeNode = TreeNode;
    return Tree;
});

