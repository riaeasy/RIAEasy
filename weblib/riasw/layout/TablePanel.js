//RIAStudio client runtime widget - TablePanel

define([
	"riasw/riaswBase",
	"riasw/layout/Panel",
	"riasw/sys/_TemplatedMixin"
], function(rias, Panel) {

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/TablePanel.css"
	//]);

	var _tableAttr = {
		cellpadding: "0",
		cellspacing: "0",
		border: "0",
		"border-collapse": "collapse",
		"border-spacing": "0",
		//void:不显示外侧边框,above:显示上部的外侧边框,below:显示下部的外侧边框,hsides:显示上部和下部的外侧边框,vsides:显示左边和右边的外侧边框,
		//lhs:显示左边的外侧边框,rhs:显示右边的外侧边框,box:在所有四个边上显示外侧边框,border:在所有四个边上显示外侧边框。
		frame: "void",
		//none:没有线条,groups:位于行组和列组之间的线条,rows:位于行之间的线条,cols:位于列之间的线条,all:位于行和列之间的线条。
		rules: "none"
	};
	var riaswType = "riasw.layout.TablePanel";
	var Widget = rias.declare(riaswType, [Panel], {

		/// containerNode 和 domNode 分离，可以 overflow。
		/// _wrapper 的作用在于 有 overflow 时，containerNode 可以获取正确的 width。
		templateString:
			"<div role='region' class='dijitReset' data-dojo-attach-point='containerNode,focusNode'>"+
				//"<div data-dojo-attach-point='_wrapper' class='dijitReset riaswPanelWrapper'>"+
					//"<div role='region' data-dojo-attach-point='containerNode,focusNode' class='riaswTablePanelContent'></div>"+
				//"</div>" +
			"</div>",
		baseClass: "riaswTablePanel",

		alwaysContainerLayout: true,

		tableFullWidth: true,
		tableFullHeight: false,
		rows: 1,
		cols: 1,
		//rowHeights: [],
		//colWidths: [],

		//cellLabels: [],///TODO:zensst.实现批量 label

		postMixInProperties: function(){
			this.inherited(arguments);
			this._widgets = [];
			if(!this.rowHeights){
				this.rowHeights = [];
			}
			if(!this.colWidths){
				this.colWidths = [];
			}
			this._tableAttr = rias.mixinDeep({}, _tableAttr, this.tableAttr);
		},
		buildRendering: function(){
			this.inherited(arguments);

			var tn = this.tableNode = rias.dom.create("table", this._tableAttr);// self.tableNode,
			tn._tablePanel = this;
			rias.dom.addClass(tn, this._baseClass0 + "Table");
			rias.dom.setStyle(tn, this.tableStyle);
			this.containerNode.appendChild(tn);
		},
		/*destroyDescendants: function(preserveDom){
			var self = this;
			rias.forEach(this._widgets, function(w){
				self.removeChild(w, true);
			});
			this.inherited(arguments);
		},*/
		_onDestroy: function(){
			if(this._debounceSetupTableHandle){
				this._debounceSetupTableHandle.remove();
				this._debounceSetupTableHandle = undefined;
			}
			this.__setupChildren = undefined;
			if(this.tableNode){
				rias.dom.destroy(this.tableNode);
				this.tableNode = undefined;
			}
			this.inherited(arguments);
		},

		_onTableStyleAttr: function(value, oldValue){
			this.tableStyle = value;
			if(this._started){
				this.resize();
			}
		},
		_onCellStyleAttr: function(value, oldValue){
			this.cellStyle = value;
			if(this._started){
				this.resize();
			}
		},
		_onChildStyleAttr: function(value, oldValue){
			this.childStyle = value;
			if(this._started){
				this.resize();
			}
		},
		_onRowStyleAttr: function(value, oldValue){
			this.rowStyle = value;
			if(this._started){
				this.resize();
			}
		},
		_onColStyleAttr: function(value, oldValue){
			this.colStyle = value;
			if(this._started){
				this.resize();
			}
		},
		_onRowHeightsAttr: function(value, oldValue){
			this.rowHeights = value;
			if(this._started){
				this.resize();
			}
		},
		_onColWidthsAttr: function(value, oldValue){
			this.colWidths = value;
			if(this._started){
				this.resize();
			}
		},

		_layoutChildren: function(){
			var self = this;
			/// <table>的 boxSize 是不确定的，会改变。如果这里 setMarginBox，则后面必须再次获取新的 _contentBox
			rias.forEach(self._widgets, function(child){
				if(child.resize){
					child.resize();
				}
			});
			/// <table>的 boxSize 是不确定的，会改变。如果前面 setMarginBox，则这里必须重新获取新的 _contentBox。
			//self._contentBox = rias.dom.getMarginBox(self.domNode);
			//console.debug("_layoutChildren - " + this.id);
		},
		_beforeLayout: function(){
			var self = this,
				noheight = !rias.dom.hasHeight(this.domNode.style, this.region, false),
				box;
			box = rias.dom.getContentBox(self.domNode);
			//rias.dom.floorBox(box);
			if(this.domNode !== this.containerNode){
				rias.dom.setMarginSize(self.containerNode, {
					h: noheight ? NaN : box.h,
					w: box.w
				});
				//if(noheight){
				//	self.containerNode.style.height = "auto";
				//}
				box = rias.dom.getContentBox(self.containerNode);
				//rias.dom.floorBox(box);
			}
			//rias.dom.setMarginSize(self.tableNode, {
			//	//h: noheight ? NaN : box.h,
			//	w: box.w
			//});
			//if(noheight){
			//	//self.tableNode.style.height = "auto";
			//}
			this._contentBox = box;
			return this.beforeLayout(this._contentBox, true);
		},

		getChildren: function(){
			// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
			return this._widgets;///优化速度。
		},
		debounceSetupTableDelay: 30,
		_setupTable: function(child, delay){
			//if(this._rcnt == undefined){
			//	this._rcnt = 0;
			//}
			//this._rcnt++;
			if(!this._canDoDom()){
				return;
			}
			var self = this;
			function _do(children){
				//var _dt0 = new Date();
				var fn = self._focusManager.get("currNode"),/// this.focused 时，没有 this._focusedNode， 取 this._focusManager.get("currNode")
					tn = self.tableNode,
					tr, td,
					r, c, rs = self.rows, cs = self.cols,
					rh = self.rowHeights, cw = self.colWidths, cx,
					pos;
				///debounce 后，有可能 this 的状态已经改变。
				if(self._canDoDom()){
					rias.forEach(self._widgets, function(_child){
						if(_child && _child.domNode){
							pos = rias.mixin({
								row: 1,
								col: 1,
								rowSpan: 1,
								colSpan: 1
							}, _child.rc);
							if(pos){
								if(pos.row < 1){
									console.error(_child.id + " - The rc.row needs >= 0.", _child);
									pos.row = _child.row = 1;
								}
								if(pos.col < 1){
									console.error(_child.id + " - The rc.col needs >= 0.", _child);
									pos.col = _child.col = 1;
								}
								if(pos.row + pos.rowSpan - 1 > rs){
									rs = pos.row + pos.rowSpan - 1;
								}
								if(pos.col + pos.colSpan - 1 > cs){
									cs = pos.col + pos.colSpan - 1;
								}
							}
						}
					});

					if(!children){
						rias.dom.empty(tn);
					}else{
						///ie 没有 tn.rows
						//tr = tn.rows[pos.row];
						while(tn.childNodes.length - 1 > rs){
							tn.removeChild(tn.childNodes[tn.childNodes.length - 1]);
						}
						for(r = 0; r <= rs; r++){
							///ie 没有 tr.cells
							//td = tr.cells[pos.col];
							tr = tn.childNodes[r];
							if(tr){
								while(tr.childNodes.length - 1 > cs){
									tr.removeChild(tr.childNodes[tr.childNodes.length - 1]);
								}
							}
						}
					}
					if(rias.isArray(cw)){
						cx = cw[cw.length - 1];
						c = cw.length;
					}else{
						cw = [];
						cx = rias.toFixed(100 / (cs + 1), 2) + "%";
						c = 0;
					}
					///还是在设计期显式设置好些，后续 col 都自动吧。
					//for(; c <= cs; c++){
					//	cw[c] = cx;
					//}
					for(r = 0; r <= rs; r++){
						if(tn.childNodes.length > r){
							tr = tn.childNodes[r];
						}else{
							tr = rias.dom.create("tr");
							tr.__pos = r;
							if(r === 0){
								rias.dom.addClass(tr, self._baseClass0 + "RowHeader");
							}else{
								rias.dom.addClass(tr, self._baseClass0 + "Row");
								rias.dom.setStyle(tr, self.rowStyle);
								if(rh.length >= r){
									if(rh[r - 1]){
										rias.dom.setStyle(tr, "height", rh[r - 1]);
									}
								}
							}
							tn.appendChild(tr);
						}
						for(c = 0; c <= cs; c++){
							if(tr.childNodes.length > c){
								td = tr.childNodes[c];
							}else{
								td = rias.dom.create("td");
								td.__pos = Number(r + "." + c);
								if(c === 0){
									rias.dom.addClass(td, self._baseClass0 + "ColHeader");
								}else{
									if(r > 0){
										rias.dom.addClass(td, self._baseClass0 + "Col");
										rias.dom.setStyle(td, self.colStyle);
										rias.dom.setStyle(td, self.cellStyle);
									}
									if(cw.length >= c){
										if(cw[c - 1]){
											rias.dom.setStyle(td, "width", cw[c - 1]);
										}
									}
								}
								tr.appendChild(td);
							}
						}
					}

					rias.forEach(children || self._widgets, function(_child){
						pos = rias.mixin({
							row: 1,
							col: 1,
							rowSpan: 1,
							colSpan: 1
						}, _child.rc);
						///ie 没有 tn.rows
						//tr = tn.rows[pos.row];
						tr = tn.childNodes[pos.row];
						if(tr){
							///ie 没有 tr.cells
							//td = tr.cells[pos.col];
							td = tr.childNodes[pos.col];
							if(td && _child.domNode.parentNode !== td){
								///td.__riasrWidget = _child;///还是取 td.firstNode.__riasrWidget 好些。
								rias.dom.setStyle(td, _child.cellStyle);
								td.appendChild(_child.domNode);
							}
						}
					});
					rias.forEach(children || self._widgets, function(_child){
						pos = rias.mixin({
							row: 1,
							col: 1,
							rowSpan: 1,
							colSpan: 1
						}, _child.rc);
						///ie 没有 tn.rows
						//tr = tn.rows[pos.row];
						tr = tn.childNodes[pos.row];
						if(tr){
							///ie 没有 tr.cells
							//td = tr.cells[pos.col];
							td = tr.childNodes[pos.col];
							if(td && _child.domNode.parentNode === td && rias.dom.visible(td)){///有可能处在“合并单元格”中，导致错位
								if(td.colSpan < pos.colSpan){///防止同一个单元格有多个 _child 时重复处理。
									for(c = pos.col + pos.colSpan - 1; c > pos.col; c--){
										///ie 没有 tr.cells
										//if(tr.childNodes[c]){
										//	tr.removeChild(tr.childNodes[c]);
										//}
										rias.dom.visible(tr.childNodes[c], false);
									}
									for(r = td.rowSpan; r < pos.rowSpan; r++){
										///从被合并行开始，不 减 1
										tr = tn.childNodes[pos.row + r];
										for(c = pos.col + pos.colSpan - 1; c >= pos.col; c--){
											//if(tr.childNodes[c]){
											//	tr.removeChild(tr.childNodes[c]);
											//}
											rias.dom.visible(tr.childNodes[c], false);
										}
									}
									td.colSpan = pos.colSpan;
								}else{
									for(r = td.rowSpan; r < pos.rowSpan; r++){
										///从被合并行开始，不 减 1
										tr = tn.childNodes[pos.row + r];
										for(c = pos.col + pos.colSpan - 1; c >= pos.col; c--){
											//if(tr.childNodes[c]){
											//	tr.removeChild(tr.childNodes[c]);
											//}
											rias.dom.visible(tr.childNodes[c], false);
										}
									}
								}
								if(td.rowSpan < pos.rowSpan){
									td.rowSpan = pos.rowSpan;
								}
							}
						}
						//_child.domNode.style.display = _child.__riasrDisplay0 ? _child.__riasrDisplay0 : "";
						//delete _child.__riasrDisplay0;
					});

					rias.forEach(self._widgets, function(_child){
						if(fn && rias.dom.isDescendant(fn, _child.domNode ? _child.domNode : _child) && fn.focus){
							self.defer(function(){
								fn.focus();
							});
						}
					});
					//console.debug("_setupTable - " + (new Date() - _dt0) + " ms - " + this.id + " - " + this._rcnt);
				}
			}

			if(child){
				if(!this.__setupChildren){
					this.__setupChildren = [];
				}
				this.__setupChildren.push(child);
			}
			this._debounceSetupTableHandle = rias._debounce(this.id + "_setupTable", function(){
				this._debounceSetupTableHandle = undefined;
				_do(this.__setupChildren.length ? this.__setupChildren : undefined);
				this.__setupChildren = [];
			}, (delay == undefined ? this.debounceSetupTableDelay : delay), this, function(){
				//console.debug("debounceSetupTable pass... - " + this.id);
			})();
		},
		_setupChild: function(/*_WidgetBase*/child, /*int*/ insertIndex){
			this.inherited(arguments);
			this._setupTable(child);
		},
		addChild: function(child, insertIndex){
			var t = this._widgets,
				i = rias.indexOf(t, child);

			//console.debug("addChild - " + child.id);
			insertIndex = (insertIndex < t.length ? (insertIndex >= 0 ? insertIndex : t.length) : t.length);
			if(insertIndex !== i){
				if(i >= 0){
					this._widgets.splice(i, 1);///删除缓冲。
				}
				this._widgets.splice(insertIndex, 0, child);///依赖 self._children 来保证顺序。
				if(this.childParams){
					for(var pn in this.childParams){
						if(!(pn in child.params)){///闪避 child 自身的 params 设置
							child.set(pn, this.childParams[pn]);
						}
					}
				}
				child.set("style", rias.mixinDeep({}, this.childStyle, rias.dom.styleToObject(child.style)));
				//child.__riasrDisplay0 = child.domNode.style.display;
				//child.domNode.style.display = "none";
				///尚未 startup 的，在 startup 的时候有可能会重新 display，故，不建议用 display 和 visibility
				this.inherited(arguments);
			}
		},
		removeChild: function(/*_WidgetBase*/ child){
			var t = this._widgets,
				i = (rias.isNumber(child) ? child : rias.indexOf(t, child));
			if(i >= 0){
				t.splice(i, 1);///删除缓冲。
				this.inherited(arguments);
				this._setupTable();
			}
		}
	});

	Widget.ChildWidgetProperties = {
		rc: {
			row: 1,
			col: 1,
			colSpan: 1,
			rowSpan: 1
		},
		cellStyle: {}
	};
	//无需 extend，也可以避免覆盖其他 Widget 的 ChildWidgetProperties。
	//_Widget.extend(Widget.ChildWidgetProperties);

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});