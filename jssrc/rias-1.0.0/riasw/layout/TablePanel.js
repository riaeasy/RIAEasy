//RIAStudio client runtime widget - TablePanel

define([
	"rias",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/_FormMixin"
], function(rias, Panel, _FormMixin) {

	rias.theme.loadCss([
		"layout/TablePanel.css"
	]);

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
	var riasType = "rias.riasw.form.TablePanel";
	var Widget = rias.declare(riasType, [Panel, _FormMixin], {
		baseClass: "riaswTablePanel",

		//tabIndex: "0",
		//_setCaptionAttr: { node: "titleNode", type: "innerHTML" }, // override default where title becomes a hover tooltip
		//showCaption: false,
		//caption: "",

		gutters: false,

		rows: 1,
		cols: 1,
		rowHeights: [],
		colWidths: [],
		tableAttr: {},
		cellStyle: {},
		childLabelWidth: "80px",
		///cellshowLabel: 0,///无法批量处理，只能由 cell 的 ChildWidget自己控制。

		_onCellStyle: function(value, oldValue){
			this.cellStyle = value;
			this.resize();
		},
		_onChildLabelWidth: function(value, oldValue){
			this.childLabelWidth = value;
			this.resize();
		},
		_onChildShowLabel: function(value, oldValue){
			this.childShowLabel = !!value;
			this.resize();
		},
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
			rias.dom.addClass(tn, this.baseClass + "Table");
			this.containerNode.appendChild(tn);

			var tr = rias.dom.create("tr");
			rias.dom.addClass(tr, this.baseClass + "Row");
			tn.appendChild(tr);
			var td = rias.dom.create("td");
			rias.dom.addClass(td, this.baseClass + "Col");
			tr.appendChild(td);

		},
		postCreate: function(){
			this.inherited(arguments);
			this._widgets = [];
			this._tableAttr = rias.mixinDeep({}, _tableAttr, this.tableAttr);
			///不初始化（不触发）_on
			this._initAttr([{
				name: "cellStyle",
				initialize: false
			}, {
				name: "childLabelWidth",
				initialize: false
			}, {
				name: "childShowLabel",
				initialize: false
			}, {
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
			rias.forEach(this._widgets, function(w){
				rias.destroy(w, preserveDom);
			});
			this.inherited(arguments);
		},
		destroy: function(){
			if(this.tableNode){
				///是否会导致 _widgets/child 出错？
				///是否 orphan(child)
				this.containerNode.removeChild(this.tableNode);
			}
			this.inherited(arguments);
		},

		_internalLayou: function(){
			var self = this,
				fn = rias.dom.focusedNode(),
				tn = self.tableNode,// ? self.tableNode : self.tableNode = rias.dom.create("table", self._tableAttr),// self.tableNode,
				tr = tn.childNodes[0], td = tr.childNodes[0],
				r, c, rc = self.rows - 1, cc = self.cols - 1, cx, rx,
				rs = self.rowHeights, cs = self.colWidths,
				w, pos;
			//tn._tablePanel = self;
			//rias.dom.addClass(tn, self.baseClass + "Table");
			//self.containerNode.appendChild(tn);
			rias.forEach(self._widgets, function(child){
				w = child._riasrWidget || rias.by(child);
				if(w && w.position){
					if(w.position.row > rc){
						rc = w.position.row;
					}
					if(w.position.col > cc){
						cc = w.position.col;
					}
				}
				self.containerNode.appendChild(child.domNode);///td = table[0][0]
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
			for(; c <= cc; c++){
				cs.push(cx);
			}
			for(c = 0; c < cs.length; c++){
				cx = cs[c];
				if(rias.likeNumber(cx)){
					cs[c] = cx + "px";
				}
			}

			for(r = 0; r <= rc; r++){
				//if(r > 0){
				tr = rias.dom.create("tr");
				rias.dom.addClass(tr, self.baseClass + "Row");
				tn.appendChild(tr);
				//}
				if(rs.length > r){
					if(rs[r]){
						rias.dom.setStyle(tr, "height", rs[r]);
					}
				}
				for(c = 0; c <= cc; c++){
					//if(r > 0 || c > 0){
					td = rias.dom.create("td");
					rias.dom.addClass(td, self.baseClass + "Col");
					tr.appendChild(td);
					//}
					//if(r === 0 && cs.length > c){
					if(cs.length > c){
						if(cs[c]){
							rias.dom.setStyle(td, "width", cs[c]);
						}
					}
					rias.dom.setStyle(td, self.cellStyle);
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
						//if(rias.isObjectSimple(child.cellStyle)){
						rias.dom.setStyle(td, child.cellStyle);
						//}
						td.appendChild(child.domNode);
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

			//if(self.tableNode){
			//	self.containerNode.removeChild(self.tableNode);
			//}
			//self.tableNode = tn;
			//self.containerNode.appendChild(self.tableNode);

			rias.forEach(self._widgets, function(child){
				if(rias.isFunction(child.resize)){
					child.resize();
				}
				if(fn && rias.dom.isDescendant(fn, child.domNode ? child.domNode : child) && fn.focus){
					fn.focus();
				}
			});
		},
		_layoutChildren: function(){
			var self = this,
				cn = this.containerNode,
				vf,
				vfx,
				vfy,
				p;

			//this.inherited(arguments);
			if(!this._started) {
				return;
			}
			///FIXME:zensst. debounce 下 p 被修改的问题。
			p = 1;//rias.dom.getStyle(cn, "opacity");
			rias.dom.setStyle(cn, "opacity", 0);

			rias.debounce(this.id + "_layoutChildren", function(){
				vf = rias.dom.getStyle(cn, "overflow");
				vfx = rias.dom.getStyle(cn, "overflow-x");
				vfy = rias.dom.getStyle(cn, "overflow-y");
				rias.dom.setStyle(cn, "overflow", "hidden");
				self._internalLayou();
				if(vf !== undefined){
					rias.dom.setStyle(cn, "overflow", vf);
				}else{
					if(vfx !== undefined){
						rias.dom.setStyle(cn, "overflow-x", vfx);
					}
					if(vfy !== undefined){
						rias.dom.setStyle(cn, "overflow-y", vfy);
					}
				}
				rias.dom.setStyle(cn, "opacity", p);
			}, self, 50, function(){
			})();
		},
		resize: function(changeSize, resultSize){
			this.inherited(arguments);
		},

		addChild: function(child, insertIndex){
			var self = this;
			var t = self._widgets,
				i = rias.indexOf(t, child);

			//rias.dom.setStyle(this.containerNode, "opacity", 0);

			insertIndex = (insertIndex < t.length ? (insertIndex >= 0 ? insertIndex : t.length) : t.length);
			if(insertIndex != i){
				if(i >= 0){
					self._widgets.splice(i, 1);///删除缓冲。
				}
				self._widgets.splice(insertIndex, 0, child);///依赖 self._children 来保证顺序。
				//if(child.labelWidth !== undefined && !child.params.hasOwnProperty("labelWidth")){
				if(child.params.labelWidth === undefined){
					child.set("labelWidth", self.childLabelWidth);
				}
				//if(child.showLabel !== undefined && !child.params.hasOwnProperty("showLabel")){
				if(child.params.showLabel === undefined){
					child.set("showLabel", self.childShowLabel);
				}
				if(self.childStyle){
					child.set("style", rias.mixinDeep({}, self.childStyle, rias.dom.styleToObject(child.style)));
				}
				////self.inherited 会导致 self._children 改变，所以先执行 self._children
				self.inherited(arguments);///保证 _riasrOwner 及 _riasrChildren 的正确。
			}
		},
		removeChild: function(/*dijit/_WidgetBase*/ child){
			var self = this;
			var t = self._widgets,
				i = (rias.isNumber(child) ? child : rias.indexOf(t, child));
			if(i >= 0){
				t.splice(i, 1);///删除缓冲。
				self.inherited(arguments);///保证 _riasrOwner 及 _riasrChildren 的正确。
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
	//rias.extend(_WidgetBase, Widget.ChildWidgetProperties);


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
					margin: "auto"///左右居中
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
		},
		childProperty: {
			position: {
				datatype: "object",
				"description": "The Position of the TablePanel.",
				title: "position",
				"hidden": false
			}
		}
	};

	return Widget;

});