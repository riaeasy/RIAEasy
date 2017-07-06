
//RIAStudio client runtime widget - panelManager

define([
	"riasw/hostDojo"
], function(rias){

	///避免循环引用。
	var Dialog;
	rias.require([
		"riasw/sys/Dialog"
	], function(_Dialog) {
		Dialog = _Dialog;
	});

	var _startZ = 100;
	var _deep = 0;

	return {
		_allPanel: [],///还是不共用好些。///单例下使用，这里定义可以共用。
		_selectedStack: [],
		_startZ: _startZ,
		_currentZIndex: _startZ,
		selectedPanel: null,

		///改为 原生对象，没有 constructor
		//constructor: function(params){
		//	this._allPanel = [];
		//	this._selectedStack = [];
		//},
		destroy: function(){
			///注意：没有继承自 Destroyable
			this.inherited(arguments);
			this.selectedPanel = undefined;
			this._allPanel = undefined;
			this._selectedStack = undefined;
		},

		addPanel: function(win){
			this._allPanel.push(win);
		},
		hidePanel: function(win){
			this.unselectPanel(win);
			rias.removeItems(this._selectedStack, function(item){
				return rias.dom.contains(win, item);
			});
		},
		removePanel: function(win){
			this.hidePanel(win);
			rias.removeItems(this._allPanel, win);
		},
		unselectPanel: function(win){
			if(win.get("selected")){
				this.selectPanel(win, "unselect");
			//}else{
			//	this.selectPanel();
			}
		},
		selectPanel: function(win, mode){
			var self = this,
				df = rias.newDeferred(),
				i, z, zt, h,
				ws, ts;

			function _canSelect(d){
				return !d.isDestroyed(true) && !d.isClosed() && d.isShowing();// && d.get("visible");
			}
			function _contains(parent, child){
				return rias.dom.isDescendant(child.domNode, parent.domNode) || child.isContainedOf(parent);/// isContainedOf 已经检测了 _riasrPopupOwner
			}
			function _select(h, value, z){
				//value = !!value;
				if(!self.selectedPanel){///避免改变顺序，已经 selected 的不再调整顺序
					rias.removeItems(self._selectedStack, h);
					self._selectedStack.push(h);
					self.selectedPanel = h;
				}
				h.set("zIndex", z);
				if(h.get("selected") != value){
					h.set("selected", value);
				}
			}
			function _sort(a, b){
				///正序排列，越是上面的 Dialog 越在数组 后面
				function _zIndex(){
					return (a === win || win && _contains(a, win)) ? 1
						: (b === win || win && _contains(b, win)) ? -1
						: a.get("selected") ? 1 : b.get("selected") ? -1
						: rias.toInt(a.get("zIndex"), 0, true) - rias.toInt(b.get("zIndex"), 0, true);
				}
				h = _contains(a, b) ? -1
					: _contains(b, a) ? 1
					: a.isModal() ? b.isModal() ? _zIndex() : 1
					: b.isModal() ? -1
					: a.isTop() || a.isTip() || a.isDropDown() ? b.isTop() || b.isTip() || b.isDropDown() ?  _zIndex() : 1
					: b.isTop() || b.isTip() || b.isDropDown() ? -1
					: _zIndex();
				return (_canSelect(a) ? (_canSelect(b) ? h : 1) : (_canSelect(b) ? -1 : h));
			}
			function _insert(arr, d){
				if(rias.contains(arr, d) && d._riasrPopupElements && d._riasrPopupElements.length){
					d._riasrPopupElements.sort(_sort);
					rias.addItems(arr, arr.indexOf(d), d._riasrPopupElements, false);
					rias.forEach(d._riasrPopupElements, function(w){
						_insert(arr, w);
					});
				}
			}

			if(_deep++ >= (rias.has("rias-selectPanelDeepLimit") || 99)){
				console.error("selectPanel _deep: " + _deep);
				df.resolve(undefined);
				return df.promise;
			}
			//console.debug("selectPanel: ", win ? win.id : "null");
			if(!win){
				win = self.selectedPanel;
			}
			if(win && (!rias.is(win, Dialog) || win.isDestroyed(true))){
				win = undefined;
			}
			//FIXME:zensst.尚不能正确地取到应该 selected 的 win
			if(win && rias.isString(mode)){
				if(mode === "unselect"){
					rias.removeItems(self._selectedStack, win);
					_select(win, false, win.zIndex);
					win = undefined;
				}
			}
			for(i = self._selectedStack.length - 1; i >= 0; i--){
				if(self._selectedStack[i].isDestroyed(true) || self._selectedStack[i].isClosed()){
					self._selectedStack.splice(i, 1);
				}
			}
			///不建议这里选下一个，建议在 _PanelWidget._hide 中处理。
			self.selectedPanel = null;
			if(!rias.isDestroyed(win) && !win.isClosed()){
				///因为需要处理 css，应该包含未显示的
				ts = rias.filter(self._allPanel, function(w){
					return !w.isDestroyed(true) && !w._riasrPopupDialog;
				});
				try{
					ts.sort(_sort);
					ws = [].concat(ts);
					rias.forEach(ts, function(w){
						_insert(ws, w);
					});
					z = zt = self._startZ + ((ws.length + 20) << 1);
					self._currentZIndex = (z - 2);
					for(i = ws.length - 1; i >= 0; i--){
						z -= 2;
						h = ws[i];
						///modal 以最后一个为 selected
						if(_canSelect(h)){
							if(!self.selectedPanel){
								if(h.isModal() || h === win){
									_select(h, true, z);
								}else{
									_select(h, false, z);
								}
							}else if(_contains(h, self.selectedPanel)){
								_select(h, true, z);
							}else{
								_select(h, false, z);
							}
						}else{
							_select(h, false, z);
						}
					}
				}catch(e){
				}
				//console.debug("selectedPanel - " + self.selectedPanel.id);
				if(self.selectedPanel){
					///只有 visible 的 panel 才会成为 selectedPanel，这里 restore 是为了 还原显示。
					//self.selectedPanel.restore(true, true, true).then(function(result){
					//	self.selectedPanel.focus();
						df.resolve(self.selectedPanel);
					//});
				}else{
					df.resolve(undefined);
				}
			}else{
				df.resolve(undefined);
			}
			_deep--;
			return df.promise;
		}

	};

});
