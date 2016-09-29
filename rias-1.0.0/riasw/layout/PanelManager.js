
//RIAStudio client runtime widget - CaptionPanel

define([
	"rias"
], function(rias){

	var _startZ = 100;

	var riaswType = "rias.riasw.layout.PanelManager";
	var Widget = rias.declare(riaswType, null, {

		_allPanel: [],///单例下使用，这里定义可以共用。
		_selectedStack: [],
		_startZ: _startZ,
		_currentZModal: _startZ,
		_currentZTop: _startZ,
		_currentZNormal: _startZ,
		_currentZCaption: _startZ,
		selected: null,

		destroy: function(){
			this.inherited(arguments);
			this.selected = undefined;
			this._allPanel = undefined;
			this._selectedStack = undefined;
			//this.selectPanel();///没必要处理。
		},

		addPanel: function(win){
			this._allPanel.push(win);
		},
		unselectPanel: function(win){
			if(win.get("selected")){
				this.selectPanel(win, "unselect");
			}
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

		selectPanel: function(win, mode){
			var self = this,
				i, z, zt, h,
				ws, ms, ts, cs;

			function _visible(d){
				return d.isShown() && d.get("visible");
			}
			function _select(h, value, z){
				//value = !!value;
				if(value){
					if(!h.get("selected")){///避免改变顺序，已经 selected 的不再调整顺序
						rias.removeItems(self._selectedStack, h);
						self._selectedStack.push(h);
					}
					self.selected = h;
				}
				h.set("zIndex", z);
				if(h.get("selected") != value){
					if(value){
						h.set("selected", value);
					}else if(win && (h === win || !_contains(h, win))){///如果 h == win， 或者 win 不是 h 的子 Panel，则 unSelected
						h.set("selected", value);
					}
				}
			}
			function _contains(parent, child){
				return rias.dom.isDescendant(child.domNode, parent.domNode);
			}
			function _sort(a, b){
				h = (a === win || win && _contains(a, win)) ? 1
					: (b === win || win && _contains(b, win)) ? -1
					: _contains(a, b) ? -1
					: _contains(b, a) ? 1
					: rias.toInt(a.get("zIndex"), 0, true) - rias.toInt(b.get("zIndex"), 0, true);
				return (_visible(a) ? (_visible(b) ? h : 1) : (_visible(b) ? -1 : h));
			}

			if(!rias.isInstanceOf(win, "rias.riasw.layout.CaptionPanel") || win.isDestroyed(true)){
				win = undefined;
			}
			//FIXME:zensst.尚不能正确地取到应该 selected 的 win
			if(win && rias.isString(mode)){
				mode = mode.charAt(0).toLowerCase();
				i = rias.indexOf(self._selectedStack, win);
				_select(win, false, win.zIndex);
				win = undefined;
				/*z = self._selectedStack.length - 1;
				zt = i;
				if(i >= 0){
					if(mode == "u" || mode == "n"){
						while(i < z){
							i++;
							if(win = self._selectedStack[i]){
								if(!win.isDestroyed(true)){
									break;
								}
							}
						}
					}
					if(!win){
						i = zt;
						while(i > 0){
							i--;
							if(win = self._selectedStack[i]){
								if(!win.isDestroyed(true)){
									break;
								}
							}
						}
					}
				}
				if(!win){
					win = self._selectedStack[z];
				}*/
			}
			if(!win || self.selected === win){
				///不指定 win、或 win 已经 selected，以及没有 destroy，则直接返回。
				if(self.selected && !self.selected.isDestroyed(true) && _visible(self.selected)){
					///已经是 selected，则不触发 onSelected
					if(!self.selected.get("selected")){
						self.selected.set("selected", true);///需要先 set 以避免循环
						self.selected.select(true);
					}
					return self.selected;
				}
				/*z = zt = self._startZ + ((self._allPanel.length + 20) << 1);
				for(i = self._allPanel.length - 1; i >= 0; i--){
					z -= 2;
					h = self._allPanel[i];
					_select(h, false, z);
				}*/
				return undefined;
			}
			self.selected = null;
			if(!rias.isDestroyed(win, true) && (!_visible(win) || win.isHidden() || win.isCollapsed())){
				///非可见时，直接返回，在 restore 后处理。
				///不是 restoring 才 restore，避免递归调用。
				if(win._playingDeferred){
					rias.when(win._playingDeferred, function(){
						win.restore(true);
					});
				}else{
					win.restore(true);
				}
				return self.selected;
			}
			///因为需要处理 css，应该包含未显示的
			ws = rias.filter(self._allPanel, function(w){
				return !w.isDestroyed(true) && rias.isInstanceOf(w, "rias.riasw.layout.DialogPanel") && !w.isModal() && !w.isTip() && !w.isTop();// && (!win || w !== win);
			});
			ms = rias.filter(self._allPanel, function(w){
				return !w.isDestroyed(true) && rias.isInstanceOf(w, "rias.riasw.layout.DialogPanel") && (w.isModal() || w.isTip());// && (!win || w !== win);
			});
			ts = rias.filter(self._allPanel, function(w){
				return !w.isDestroyed(true) && rias.isInstanceOf(w, "rias.riasw.layout.DialogPanel") && w.isTop();// && (!win || w !== win);
			});
			cs = rias.filter(self._allPanel, function(w){
				return !w.isDestroyed(true) && rias.isInstanceOf(w, "rias.riasw.layout.CaptionPanel") && !rias.contains(ws, w) && !rias.contains(ms, w) && !rias.contains(ts, w);// && (!win || w !== win);
			});
			try{
				ws.sort(_sort);
				ms.sort(_sort);
				ts.sort(_sort);
				cs.sort(_sort);
				z = zt = self._startZ + ((ms.length + ts.length + ws.length + cs.length + cs.length + 20) << 1);
				self._currentZModal = (z -= 2);
				for(i = ms.length - 1; i >= 0; i--){
					z -= 2;
					h = ms[i];
					///modal 以最后一个为 selected
					if(!self.selected && _visible(h)){
						_select(h, true, zt);
					}else{
						_select(h, false, z);
					}
				}
				z -= 2;///需要比上一级低。
				zt = z;
				self._currentZTop = (z -= 2);
				for(i = ts.length - 1; i >= 0; i--){
					z -= 2;
					h = ts[i];
					//if(!self.selected && (!win || h === win) && _visible(h)){
					if(!self.selected && (h === win) && _visible(h)){
						_select(h, true, zt);
					}else{
						_select(h, false, z);
					}
				}
				z -= 2;///需要比上一级低。
				zt = z;
				self._currentZNormal = (z -= 2);
				for(i = ws.length - 1; i >= 0; i--){
					z -= 2;
					h = ws[i];
					//if(!self.selected && (!win || h === win) && _visible(h)){
					if(!self.selected && (h === win) && _visible(h)){
						_select(h, true, zt);
					}else{
						_select(h, false, z);
					}
				}
				z -= 2;///需要比上一级低。
				zt = z;
				self._currentZCaption = (z -= 2);
				for(i = cs.length - 1; i >= 0; i--){
					z -= 2;
					h = cs[i];
					//if(!self.selected && (!win || h === win) && _visible(h)){
					if(!self.selected && (h === win) && _visible(h)){
						_select(h, true, zt);
					}else{
						_select(h, false, z);
					}
				}
			}catch(e){
			}
			if(self.selected && !rias.dom.contains(self.selected, rias.dom.focusedNode)){
				self.selected.focus();
			}
			//console.debug("selected: " + self.selected.id);
			return self.selected;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "dijitNoIcon",
		iconClass16: "dijitNoIcon",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	Widget.singleton = new Widget({
		//ownerRiasw: rias.webApp
	});

	return Widget;

});
