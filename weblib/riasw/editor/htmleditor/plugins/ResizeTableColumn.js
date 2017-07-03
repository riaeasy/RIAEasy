define([
	"riasw/riaswBase",
	"../_Plugin",
	"./TablePlugins"
], function(rias, _Plugin, TablePlugins) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var ResizeTableColumn = rias.declare(pluginsName + ".ResizeTableColumn", [TablePlugins], {

		constructor: function(){
			// summary:
			//		Because IE will ignore the cursor style when the editMode of the document is on,
			//		we need to create a div within the outer document to mimic the behavior of drag&drop
			this.isLtr = this.dir ? (this.dir == "ltr") : rias.dom.isBodyLtr();
			this.ruleDiv = rias.dom.create("div", {
					style: "top: -10000px; z-index: 10001"
				}, rias.dom.desktopBody, "last");
		},

		setEditor: function(editor){
			// summary:
			//		Handle the drag&drop events
			// editor:
			//		The editor which this plugin belongs to
			// tags:
			//		protected
			var ruleDiv = this.ruleDiv;

			this.editor = editor;
			this.editor.customUndo = true;
			this.onEditorLoaded();

			// The content of the editor is loaded asynchronously, so the function
			// should be called when it is loaded.
			editor.onLoadDeferred.then(rias.hitch(this, function(){
				this.on(this.editor.editNode, "mousemove", function(evt){
					var editorCoords = rias.dom.getPosition(editor.iframe, true),
						ex = editorCoords.x, cx = evt.clientX;

					if(!this.isDragging){
						// If it is just a movement, put the div at the edge of the
						// target cell so that when the cursor hover on it, it will
						// change to the col-resize style.
						var obj = evt.target;

						if(obj.tagName && obj.tagName.toLowerCase() == "td"){
							var objCoords = rias.dom.getPosition(obj), ox = objCoords.x, ow = objCoords.w,
								pos = ex + objCoords.x - 2;
							if(this.isLtr){
								ruleDiv.headerColumn = true;
								if(!isBoundary(obj, "first") || cx > ox + ow / 2){
									pos += ow;
									ruleDiv.headerColumn = false;
								}
							}else{
								ruleDiv.headerColumn = false;
								if(isBoundary(obj, "first") && cx > ox + ow / 2){
									pos += ow;
									ruleDiv.headerColumn = true;
								}
							}
							rias.dom.setStyle(ruleDiv, {
								position: "absolute",
								cursor: "col-resize",
								display: "block",
								width: "4px",
								backgroundColor: "transparent",
								top: editorCoords.y + objCoords.y + "px",
								left: pos + "px",
								height: objCoords.h + "px"
							});
							this.activeCell = obj;
						}else{
							rias.dom.setStyle(ruleDiv, {
								display: "none",
								top: "-10000px"
							});
						}
					}else{
						// Begin to drag&drop
						var activeCell = this.activeCell,
							activeCoords = rias.dom.getPosition(activeCell), ax = activeCoords.x, aw = activeCoords.w,
							sibling = nextSibling(activeCell), siblingCoords, sx, sw,
							containerCoords = rias.dom.getPosition(getTable(activeCell).parentNode),
							ctx = containerCoords.x, ctw = containerCoords.w;

						if(sibling){
							siblingCoords = rias.dom.getPosition(sibling);
							sx = siblingCoords.x;
							sw = siblingCoords.w;
						}

						// The leading and trailing columns can only be sized to the extent of the containing div.
						if(this.isLtr &&
							((ruleDiv.headerColumn && sibling && ctx < cx && cx < ax + aw) ||
								((!sibling && ax < cx && cx < ctx + ctw) || (sibling && ax < cx && cx < sx + sw))) ||
							!this.isLtr &&
								((ruleDiv.headerColumn && sibling && ctx > cx && cx > ax) ||
									((!sibling && ax + aw > cx && cx > ctx) || (sibling && ax + aw > cx && cx > sx)))){
							rias.dom.setStyle(ruleDiv, {
								left: ex + cx + "px"
							});
						}
					}
				});

				this.on(ruleDiv, "mousedown", function(evt){
					var editorCoords = rias.dom.getPosition(editor.iframe, true),
						tableCoords = rias.dom.getPosition(getTable(this.activeCell));

					this.isDragging = true;
					rias.dom.setStyle(editor.editNode, {
						cursor: "col-resize"
					});
					rias.dom.setStyle(ruleDiv, {
						width: "1px",
						left: evt.clientX + "px",
						top: editorCoords.y + tableCoords.y + "px",
						height: tableCoords.h + "px",
						backgroundColor: "#777"
					});
				});

				this.on(ruleDiv, "mouseup", function(evt){
					var activeCell = this.activeCell,
						activeCoords = rias.dom.getPosition(activeCell), aw = activeCoords.w, ax = activeCoords.x,
						sibling = nextSibling(activeCell), siblingCoords, sx, sw,
						editorCoords = rias.dom.getPosition(editor.iframe), ex = editorCoords.x,
						table = getTable(activeCell), tableCoords = rias.dom.getPosition(table),
						cs = table.getAttribute("cellspacing"),
						cx = evt.clientX,
						headerCell = getHeaderCell(activeCell), headerSibling,
						newWidth, newSiblingWidth;

					if(!cs || (cs = parseInt(cs, 10)) < 0){ cs = 2; }

					if(sibling){
						siblingCoords = rias.dom.getPosition(sibling);
						sx = siblingCoords.x;
						sw = siblingCoords.w;
						headerSibling = getHeaderCell(sibling);
					}

					// The delta width is either taken from or added to the adjacent column on the trailing edge.
					// Sizing the rightmost or leftmost columns affects only those columns.
					if(this.isLtr){
						if(ruleDiv.headerColumn){
							newWidth = ex + ax + aw - cx;
						}else{
							newWidth = cx - ex - ax;
							if(sibling) { newSiblingWidth = ex + sx + sw - cx - cs; }
						}
					}else{
						if(ruleDiv.headerColumn){
							newWidth = cx - ex - ax;
						}else{
							newWidth = ex + ax + aw - cx;
							if(sibling) { newSiblingWidth = cx - ex - sx - cs; }
						}
					}

					this.isDragging = false;
					marginBox(headerCell, newWidth);
					if(sibling){
						if(!ruleDiv.headerColumn){
							marginBox(headerSibling, newSiblingWidth);
						}
					}
					if(ruleDiv.headerColumn && isBoundary(activeCell, "first") || isBoundary(activeCell, "last")){
						rias.dom.setMarginBox(table, {
							w: tableCoords.w + newWidth - aw
						});
					}
					// Do it again to consolidate the result,
					// because maybe the cell cannot be so narrow as you specified.
					marginBox(headerCell, rias.dom.getPosition(activeCell).w);
					if(sibling){
						marginBox(headerSibling, rias.dom.getPosition(sibling).w);
					}
					rias.dom.setStyle(editor.editNode, {
						cursor: "auto"
					});
					rias.dom.setStyle(ruleDiv, {
						display: "none",
						top: "-10000px"
					});
					this.activeCell = null;
				});
			}));

			function isBoundary(/*DomNode*/ n, /*String*/ b){
				// summary:
				//		Check if the current cell is in the first column or
				//		in the last column.
				// n:
				//		The node of a table cell
				// b:
				//		Indicate if the cell node is compared with the first coluln
				//		or the last column
				var nodes = rias.dom.query("> td", n.parentNode);
				switch(b){
					case "first":
						return nodes[0] == n;
					case "last":
						return nodes[nodes.length - 1] == n;
					default:
						return false;
				}
			}

			function nextSibling(/*DomNode*/ node){
				// summary:
				//		Get the next cell in row
				// node:
				//		The table cell
				node = node.nextSibling
				while(node){
					if(node.tagName && node.tagName.toLowerCase() == "td"){
						break;
					}
					node = node.nextSibling
				}
				return node;
			}

			function getTable(/*DomNode*/ t){
				// summary:
				//		Get the table that this cell belongs to.
				// t:
				//		The table cell
				while((t = t.parentNode) && t.tagName.toLowerCase() != "table"){}
				return t;
			}

			function getHeaderCell(/*DomNode*/ t){
				// summary:
				//		Get the table cell in the first row that shares the same
				//		column with the node t.
				// t:
				//		The node of the table cell
				var tds = rias.dom.query("td", getTable(t)),
					len = tds.length;
				for(var i = 0; i < len; i++){
					if(rias.dom.getPosition(tds[i]).x == rias.dom.getPosition(t).x){
						return tds[i];
					}
				}
				return null;
			}

			function marginBox(/*DomNode*/ node, /*Number*/ width){
				// summary:
				//		In IE, if the border width of the td is not specified in table, the default value is 1px,
				//		though it is marked "medium".
				// node:
				//		The node to be set width
				// width:
				//		The new width of the node
				var px = rias.dom.toPixelValue;
				if(rias.has("ie")){
					var s = node.currentStyle,
						bl = px(node, s.borderLeftWidth), br = px(node, s.borderRightWidth),
						pl = px(node, s.paddingLeft), pr = px(node, s.paddingRight);

					node.style.width = width - bl - br - pl - pr;
				}else{
					rias.dom.setMarginBox(node, {
						w: width
					});
				}
			}
		}
	});

	_Plugin.registry["resizeTableColumn"] = _Plugin.registry["resizetablecolumn"] = function(args){
		return new ResizeTableColumn(rias.mixin({
			//commandName: "resizeTableColumn"
		}, args));
	};

	return ResizeTableColumn;
});