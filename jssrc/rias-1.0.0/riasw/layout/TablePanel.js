//RIAStudio client runtime widget - TablePanel

define([
	"rias",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/_FormMixin"
], function(rias, Panel, _FormMixin) {

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/TablePanel.css"
	//]);

	var _tableAttr = {
		border: "0px",
		cellpadding: "0px",
		"border-collapse": "collapse",
		"border-spacing": 0,
		cellspacing: 0,
		//void:不显示外侧边框,above:显示上部的外侧边框,below:显示下部的外侧边框,hsides:显示上部和下部的外侧边框,vsides:显示左边和右边的外侧边框,
		//lhs:显示左边的外侧边框,rhs:显示右边的外侧边框,box:在所有四个边上显示外侧边框,border:在所有四个边上显示外侧边框。
		frame: "void",
		//none:没有线条,groups:位于行组和列组之间的线条,rows:位于行之间的线条,cols:位于列之间的线条,all:位于行和列之间的线条。
		rules: "none"
	};
	var riaswType = "rias.riasw.form.TablePanel";
	var Widget = rias.declare(riaswType, [Panel, _FormMixin], {

		/// containerNode 和 domNode 分离，可以 overflow。
		/// _wrapper 的作用在于 有 overflow 时，containerNode 可以获取正确的 width。
		templateString:
			"<div role='region' class='dijit dijitReset'>"+
				//"<div data-dojo-attach-point='_wrapper' class='dijit dijitReset riaswPanelWrapper'>"+
					"<div role='region' data-dojo-attach-point='containerNode,focusNode' class='riaswTablePanelContent'></div>"+
				//"</div>" +
			"</div>",
		baseClass: "riaswTablePanel",

		tableFullWidth: true,
		tableFullHeight: false,
		rows: 1,
		cols: 1,
		//rowHeights: [],
		//colWidths: [],

		//cellLabels: [],///TODO:zensst.实现批量 label

		postMixInProperties: function(){
			this._widgets = [];
			if(!this.rowHeights){
				this.rowHeights = [];
			}
			if(!this.colWidths){
				this.colWidths = [];
			}
			this._tableAttr = rias.mixinDeep({}, _tableAttr, this.tableAttr);
			this.inherited(arguments);
		},

		_onTableStyle: function(value, oldValue){
			this.tableStyle = value;
			this.resize();
		},
		_onRowStyle: function(value, oldValue){
			this.rowStyle = value;
			this.resize();
		},
		_onColStyle: function(value, oldValue){
			this.colStyle = value;
			this.resize();
		},
		_onCellStyle: function(value, oldValue){
			this.cellStyle = value;
			this.resize();
		},
		/*_onChildLabelWidth: function(value, oldValue){
			this.childLabelWidth = value;
			this.resize();
		},
		_onChildShowLabel: function(value, oldValue){
			this.childShowLabel = !!value;
			this.resize();
		},*/
		_onChildStyle: function(value, oldValue){
			this.childStyle = !!value;
			this.resize();
		},
		_onRowHeights: function(value, oldValue){
			this.rowHeights = value;
			this.resize();
		},
		_onColWidths: function(value, oldValue){
			this.colWidths = value;
			this.resize();
		},

		buildRendering: function(){
			this.inherited(arguments);

			var tn = this.tableNode = rias.dom.create("table", this._tableAttr);// self.tableNode,
			tn._tablePanel = this;
			rias.dom.addClass(tn, this._baseClass0 + "Table");
			rias.dom.setStyle(tn, this.tableStyle);
			this.containerNode.appendChild(tn);

			var tr = rias.dom.create("tr");
			rias.dom.addClass(tr, this._baseClass0 + "Row");
			rias.dom.setStyle(tr, this.rowStyle);
			tn.appendChild(tr);
			var td = rias.dom.create("td");
			rias.dom.addClass(td, this._baseClass0 + "Col");
			rias.dom.setStyle(td, this.colStyle);
			tr.appendChild(td);

		},
		postCreate: function(){
			this.inherited(arguments);
			///不初始化（不触发）_on
			this._initAttr([{
				name: "rowStyle",
				initialize: false
			}, {
				name: "colStyle",
				initialize: false
			}, {
				name: "cellStyle",
				initialize: false
			/*}, {
				name: "childLabelWidth",
				initialize: false
			}, {
				name: "childShowLabel",
				initialize: false
			*/}, {
				name: "childStyle",
				initialize: false
			}, {
				name: "rowHeights",
				initialize: false
			}, {
				name: "colWidths",
				initialize: false
			}]);
		},
		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
		},
		destroyDescendants: function(/*Boolean*/ preserveDom){
			var self = this;
			rias.forEach(this._widgets, function(w){
				self.removeChild(w, true);
			});
			this.inherited(arguments);
		},
		destroy: function(){
			if(this.tableNode){
				this.containerNode.removeChild(this.tableNode);
			}
			this.inherited(arguments);
		},

		_getContentBox: function(){
			var self = this,
				noheight = !rias.dom.hasHeight(this.domNode.style, this.region),
				box;
			rias.dom.noOverflowCall(this.domNode, function(){
				box = rias.dom.getContentMargin(self.domNode);
				rias.dom.floorBox(box);
				rias.dom.setMarginSize(self.containerNode, {
					h: noheight ? NaN : box.h,
					w: box.w
				});
				if(noheight){
					self.containerNode.style.height = "auto";
				}
				box = rias.dom.getContentMargin(self.containerNode);
				rias.dom.floorBox(box);
				rias.dom.setMarginSize(self.tableNode, {
					//h: noheight ? NaN : box.h,
					w: box.w
				});
				if(noheight){
					self.tableNode.style.height = "auto";
				}
			}, this);
			return this._doBeforeLayout(box);
		},
		_layoutChildren: function(){
			var self = this,
				fn = rias.dom.focusedNode,/// this.focused 时，没有 this._focusedNode， 取 rias.dom.focusedNode
				tn = self.tableNode,
				tr = tn.childNodes[0], td = tr.childNodes[0],
				r, c, rc = self.rows - 1, cc = self.cols - 1, cx, rx,
				rs = self.rowHeights, cs = self.colWidths,
				pos;

			rias.dom.noOverflowCall(this.containerNode, function(){
				/// <table>的 boxSize 是不确定的，会改变。如果这里 setMarginBox，则后面必须再次获取新的 _contentBox
				rias.forEach(self._widgets, function(child){
					if(child){
						if(child.__display0 == undefined){
							//child.__display0 = child.domNode.style.display;
							//child.__display0 = child.domNode.style.visibility;
							child.__display0 = child.domNode.style.opacity;
						}
						//child.domNode.style.visibility = "hidden";
						//child.domNode.style.display = "none";
						child.domNode.style.opacity = 0;
						if(child.position){
							if(child.position.row > rc){
								rc = child.position.row;
							}
							if(child.position.col > cc){
								cc = child.position.col;
							}
						}
						self.containerNode.appendChild(child.domNode);///td = table[0][0]
					}
				});
				//while(tn.childNodes.length > 1){
				//	tn.removeChild(tn.childNodes[tn.childNodes.length - 1]);
				//}
				//while(tr.childNodes.length > 1){
				//	tr.removeChild(tr.childNodes[tr.childNodes.length - 1]);
				//}
				rias.dom.empty(tn);

				///不处理 rowHeight，直接使用设计期的值。
				//if(!rias.isArray(rs) || rs.length == 0){
				//	rs = [];
				//	rx = rias.toFixed(100 / (rc + 1), 2) + "%";
				//	r = 0;
				//}else if(rs.length < rc + 1){
				//	rx = rs[rs.length - 1];
				//	r = rs.length;
				//}
				//for(r = rs.length; r <= rc; r++){
				//	rs.push(rx);
				//}
				if(rias.isArray(cs)){
					cx = cs[cs.length - 1];
					c = cs.length;
				}else{
					cs = [];
					cx = rias.toFixed(100 / (cc + 1), 2) + "%";
					c = 0;
				}
				//for(; c <= cc; c++){
				//	cs.push(cx);
				//}
				for(c = 0; c < cs.length; c++){
					cx = cs[c];
					if(rias.isNumberLike(cx)){
						cs[c] = cx + "px";
					}
				}

				for(r = 0; r <= rc; r++){
					tr = rias.dom.create("tr");
					rias.dom.addClass(tr, self._baseClass0 + "Row");
					rias.dom.setStyle(tr, self.rowStyle);
					tn.appendChild(tr);
					if(rs.length > r){
						if(rs[r]){
							rias.dom.setStyle(tr, "height", rs[r]);
						}
					}
					for(c = 0; c <= cc; c++){
						td = rias.dom.create("td");
						rias.dom.addClass(td, self._baseClass0 + "Col");
						rias.dom.setStyle(td, self.colStyle);
						rias.dom.setStyle(td, self.cellStyle);
						//if(r === 0 && cs.length > c){
						if(cs.length > c){
							if(cs[c]){
								rias.dom.setStyle(td, "width", cs[c]);
							}
						}
						tr.appendChild(td);
					}
				}

				rias.forEach(self._widgets, function(child){
					pos = rias.mixin({
						row: 0,
						col: 0,
						rowSpan: 1,
						colSpan: 1
					}, child.position);
					///ie 没有 tn.rows
					//tr = tn.rows[pos.row];
					tr = tn.childNodes[pos.row];
					if(tr){
						///ie 没有 tr.cells
						//td = tr.cells[pos.col];
						td = tr.childNodes[pos.col];
						if(td){
							///td._riasrWidget = child;///还是取 td.firstNode._riasrWidget 好些。
							rias.dom.setStyle(td, child.cellStyle);
							//if(self.childStyle){
							//	child.set("style", rias.mixinDeep({}, self.childStyle, rias.dom.styleToObject(child.style)));
							//}
							rias.dom.setStyle(child.domNode, rias.mixinDeep({}, self.childStyle, rias.dom.styleToObject(child.style)));
							td.appendChild(child.domNode);
							//console.debug("td.appendChild - " + child.id);
						}
					}
				});
				rias.forEach(self._widgets, function(child){
					pos = rias.mixin({
						row: 0,
						col: 0,
						rowSpan: 1,
						colSpan: 1
					}, child.position);
					///ie 没有 tn.rows
					//tr = tn.rows[pos.row];
					tr = tn.childNodes[pos.row];
					if(tr){
						///ie 没有 tr.cells
						//td = tr.cells[pos.col];
						td = tr.childNodes[pos.col];
						if(td && child.domNode.parentNode === td && rias.dom.visible(child.domNode.parentNode)){///有可能处在“合并单元格”中，导致错位
							if(td.colSpan < pos.colSpan){///防止同一个单元格有多个 child 时重复处理。
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
				});

				rias.forEach(self._widgets, function(child){
					//child.domNode.style.visibility = child.__display0;
					//child.domNode.style.display = child.__display0;
					child.domNode.style.opacity = child.__display0;
					delete child.__display0;
					//rias.dom.setStyle(td, child.cellStyle);
					if(rias.isFunction(child.resize)){
						child.resize();
					}
					if(fn && rias.dom.isDescendant(fn, child.domNode ? child.domNode : child) && fn.focus){
						self.defer(function(){
							fn.focus();
						});
					}
				});
				/// <table>的 boxSize 是不确定的，会改变。如果前面 setMarginBox，则这里必须重新获取新的 _contentBox。
				//self._contentBox = rias.dom.getMarginBox(self.domNode);
			}, this);
			//console.debug("_layoutChildren - " + this.id);
		},
		layout: function(){
			var v;
			v = this._started && !this.__updateSize && this.get("visible");
			if(!v){
				this.set("needLayout", true);
				return;
			}
			rias.debounce(this.id + "layout", function(){
				if(!this._canResize()){
					return;
				}
				if(v = this._beforeLayout()){
					//console.debug(this.id + " layout...", this._widgets.length);
					if(this.isDestroyed(true, true)){
						return;
					}
					/// 由于 debounce 的存在，有可能在执行到这里时，this 已经不可见，所以需要 set("needLayout", true)
					if(!this._started || this.__updateSize || !this.get("visible")){
						//this.set("needLayout", true);
						//this._needResizeChild = true;///该值不确定，不可这里设置
						return;
					}
					//console.debug(this.id + " layout debounce callback...");
					var p = rias.dom.getStyle(this.containerNode, "opacity");
					rias.dom.setStyle(this.containerNode, "opacity", 0.5);

					this._layoutChildren();
					this.set("needLayout", false);
					this._needResizeChild = false;

					rias.dom.setStyle(this.containerNode, "opacity", p);

					this.afterLayout();
				}
			}, this, 330, function(){
				//console.debug(this.id + " layout debounce pass...", this._widgets.length);
			})();
		},
		/*resize: function(changeSize, resultSize){
			if(!this._canResize()){
				return;
			}
			var args = arguments;
			//rias.debounce(this.id + "resize", function(){
		 if(!this._canResize()){
		 return;
		 }
		 this.inherited(args);
			//}, this, 30, function(){
				//console.debug(this.id + " layout debounce pass...", this._widgets.length);
			//})();
		},*/

		getChildren: function(){
			// Override _LayoutWidget.getChildren() to only return real children, not the splitters.
			return this._widgets;///优化速度。
		},
		addChild: function(child, insertIndex){
			var self = this;
			var t = self._widgets,
				i = rias.indexOf(t, child);

			//console.debug("addChild - " + child.id);
			insertIndex = (insertIndex < t.length ? (insertIndex >= 0 ? insertIndex : t.length) : t.length);
			if(insertIndex != i){
				if(i >= 0){
					self._widgets.splice(i, 1);///删除缓冲。
				}
				self._widgets.splice(insertIndex, 0, child);///依赖 self._children 来保证顺序。
				if(!child.__riasrChildParams){
					child.__riasrChildParams = self.childParams;
					for(var pn in child.__riasrChildParams){
						child.set(pn, child.__riasrChildParams[pn]);
					}
					if(self.childLabelWidth){
						child.set("labelWidth", self.childLabelWidth);
					}
					//if(child.showLabel !== undefined && !child.params.hasOwnProperty("showLabel")){
					if(self.childShowLabel){
						child.set("showLabel", self.childShowLabel);
					}
				}
				//if(self.childStyle){
				//	child.set("style", rias.mixinDeep({}, self.childStyle, rias.dom.styleToObject(child.style)));
				//}
				///TODO:zensst.尚未 startup 的，在 startup 的时候有可能会重新 display
				//child.__display0 = child.domNode.style.display;
				//child.__display0 = child.domNode.style.visibility;
				child.__display0 = child.domNode.style.opacity;
				//child.domNode.style.display = "none";/// 避免扰乱 overflow
				//child.domNode.style.visibility = "hidden";
				child.domNode.style.opacity = 0;
				self.inherited(arguments);
			}
		},
		removeChild: function(/*dijit/_WidgetBase*/ child, noresize){
			var self = this;
			var t = self._widgets,
				i = (rias.isNumber(child) ? child : rias.indexOf(t, child));
			if(i >= 0){
				t.splice(i, 1);///删除缓冲。
				delete child.__display0;
				delete child.__riasrChildParams;
				self.inherited(arguments);
			}
		}
	});

	Widget.ChildWidgetProperties = {
		position: {
			row: 0,
			col: 0,
			colSpan: 1,
			rowSpan: 1
		},
		cellStyle: {}
	};
	//无需 extend，也可以避免覆盖其他 Widget 的 ChildWidgetProperties。
	//_WidgetBase.extend(Widget.ChildWidgetProperties);


	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTablePanelIcon",
		iconClass16: "riaswTablePanelIcon16",
		defaultParams: {
			tableAttr: {
				border: "0px",
				cellpadding: "0px",
				//void:不显示外侧边框,above:显示上部的外侧边框,below:显示下部的外侧边框,hsides:显示上部和下部的外侧边框,vsides:显示左边和右边的外侧边框,
				//lhs:显示左边的外侧边框,rhs:显示右边的外侧边框,box:在所有四个边上显示外侧边框,border:在所有四个边上显示外侧边框。
				frame: "void",
				//none:没有线条,groups:位于行组和列组之间的线条,rows:位于行之间的线条,cols:位于列之间的线条,all:位于行和列之间的线条。
				rules: "none",
				style: {
					//width: "100%",
					//margin: "auto"///左右居中
				}
			}
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			"caption": {
				"datatype": "string",
				"description": "The Caption of the TablePanel.",
				"hidden": false
			}
		}
	};

	return Widget;

});