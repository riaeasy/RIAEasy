
define("riasbi/fx/flip", [
	"riasw/riaswBase",
	"riasw/fx"
], function(rias, fx) {

	var _dom = rias.dom;

	// because ShrinkSafe will eat this up:
	var borderConst = "border",
		widthConst = "Width",
		heightConst = "Height",
		topConst = "Top",
		rightConst = "Right",
		leftConst = "Left",
		bottomConst = "Bottom";

	fx.flip = function(/*Object*/ args){
		// summary:
		//		Animate a node flipping following a specific direction
		// description:
		//		Returns an animation that will flip the
		//		node around a central axis:
		//
		//		if args.dir is "left" or "right" --> y axis
		//
		//		if args.dir is "top" or "bottom" --> x axis
		//
		//		This effect is obtained using a border distortion applied to a helper node.
		//
		//		The user can specify three background colors for the helper node:
		//
		//		- darkColor: the darkest color reached during the animation
		//		- lightColor: the brightest color
		//		- endColor: the final backgroundColor for the node
		//
		//		Other arguments:
		//
		//		- depth: Float
		//			 - 0 <= depth <= 1 overrides the computed "depth"
		//			- (0: min distortion, 1: max distortion)
		//
		//		- whichAnim: String
		//			- "first"			 : the first half animation
		//			- "last"			 : the second one
		//			- "both" (default) : both
		//
		//		- axis: String
		//			- "center" (default)	  : the node is flipped around his center
		//			- "shortside"			  : the node is flipped around his "short" (in perspective) side
		//			- "longside"			  : the node is flipped around his "long" (in perspective) side
		//			- "cube"				  : the node flips around the central axis of the cube
		//
		//		- shift: Integer:
		//			node translation, perpendicular to the rotation axis
		//
		// example:
		//	|	var anim = dojox.fx.flip({
		//	|		node: dojo.byId("nodeId"),
		//	|		dir: "top",
		//	|		darkColor: "#555555",
		//	|		lightColor: "#dddddd",
		//	|		endColor: "#666666",
		//	|		depth: .5,
		//	|		shift: 50,
		//	|		duration:300
		//	|	  });

		var helperNode = _dom.create("div"),
			node = args.node = _dom.byId(args.node),
			s = node.style,
			dims = null,
			hs = null,
			pn = null,
			lightColor = args.lightColor || "#dddddd",
			darkColor = args.darkColor || "#555555",
			bgColor = _dom.getStyle(node, "backgroundColor"),
			endColor = args.endColor || bgColor,
			staticProps = {},
			anims = [],
			duration = (args.duration ? args.duration : rias.defaultDuration) / 2,
			dir = args.dir || "left",
			pConst = 0.9,
			transparentColor = "transparent",
			whichAnim = args.whichAnim,
			axis = args.axis || "center",
			depth = args.depth
			;
		// IE6 workaround: IE6 doesn't support transparent borders
		var convertColor = function(color){
			return ((new rias.Color(color)).toHex() === "#000000") ? "#000001" : color;
		};

		if(rias.has("ie") < 7){
			endColor = convertColor(endColor);
			lightColor = convertColor(lightColor);
			darkColor = convertColor(darkColor);
			bgColor = convertColor(bgColor);
			transparentColor = "black";
			helperNode.style.filter = "chroma(color='#000000')";
		}

		var init = (function(n){
			return function(){
				var ret = _dom.getPosition(n, true);
				dims = {
					top: ret.y,
					left: ret.x,
					width: ret.w,
					height: ret.h
				};
			};
		})(node);
		init();
		// helperNode initialization
		hs = {
			position: "absolute",
			top: dims.top + "px",
			left: dims.left + "px",
			height: "0",
			width: "0",
			zIndex: args.zIndex || (s.zIndex || 0),
			border: "0 solid " + transparentColor,
			fontSize: "0",
			visibility: "hidden"
		};
		var props = [ {},
			{
				top: dims.top,
				left: dims.left
			}
		];
		var dynProperties = {
			left: [leftConst, rightConst, topConst, bottomConst, widthConst, heightConst, "end" + heightConst + "Min", leftConst, "end" + heightConst + "Max"],
			right: [rightConst, leftConst, topConst, bottomConst, widthConst, heightConst, "end" + heightConst + "Min", leftConst, "end" + heightConst + "Max"],
			top: [topConst, bottomConst, leftConst, rightConst, heightConst, widthConst, "end" + widthConst + "Min", topConst, "end" + widthConst + "Max"],
			bottom: [bottomConst, topConst, leftConst, rightConst, heightConst, widthConst, "end" + widthConst + "Min", topConst, "end" + widthConst + "Max"]
		};
		// property names
		pn = dynProperties[dir];

		// .4 <= pConst <= .9
		if(typeof depth !== "undefined"){
			depth = Math.max(0, Math.min(1, depth)) / 2;
			pConst = 0.4 + (0.5 - depth);
		}else{
			pConst = Math.min(0.9, Math.max(0.4, dims[pn[5].toLowerCase()] / dims[pn[4].toLowerCase()]));
		}
		var p0 = props[0];
		for(var i = 4; i < 6; i++){
			if(axis === "center" || axis === "cube"){ // find a better name for "cube"
				dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()] * pConst;
				dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()] / pConst;
			}else if(axis === "shortside"){
				dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()];
				dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()] / pConst;
			}else if(axis === "longside"){
				dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()] * pConst;
				dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()];
			}
		}
		if(axis === "center"){
			p0[pn[2].toLowerCase()] = dims[pn[2].toLowerCase()] - (dims[pn[8]] - dims[pn[6]]) / 4;
		}else if(axis === "shortside"){
			p0[pn[2].toLowerCase()] = dims[pn[2].toLowerCase()] - (dims[pn[8]] - dims[pn[6]]) / 2;
		}

		staticProps[pn[5].toLowerCase()] = dims[pn[5].toLowerCase()] + "px";
		staticProps[pn[4].toLowerCase()] = "0";
		staticProps[borderConst + pn[1] + widthConst] = dims[pn[4].toLowerCase()] + "px";
		staticProps[borderConst + pn[1] + "Color"] = bgColor;

		p0[borderConst + pn[1] + widthConst] = 0;
		p0[borderConst + pn[1] + "Color"] = darkColor;
		p0[borderConst + pn[2] + widthConst] = p0[borderConst + pn[3] + widthConst] = axis !== "cube"
			? (dims["end" + pn[5] + "Max"] - dims["end" + pn[5] + "Min"]) / 2
			: dims[pn[6]] / 2
		;
		p0[pn[7].toLowerCase()] = dims[pn[7].toLowerCase()] + dims[pn[4].toLowerCase()] / 2 + (args.shift || 0);
		p0[pn[5].toLowerCase()] = dims[pn[6]];

		var p1 = props[1];
		p1[borderConst + pn[0] + "Color"] = { start: lightColor, end: endColor };
		p1[borderConst + pn[0] + widthConst] = dims[pn[4].toLowerCase()];
		p1[borderConst + pn[2] + widthConst] = 0;
		p1[borderConst + pn[3] + widthConst] = 0;
		p1[pn[5].toLowerCase()] = { start: dims[pn[6]], end: dims[pn[5].toLowerCase()] };

		rias.mixin(hs, staticProps);
		_dom.setStyle(helperNode, hs);
		_dom.body().appendChild(helperNode);

		var finalize = function(){
			//helperNode.parentNode.removeChild(helperNode);
			_dom.destroy(helperNode);
			// fixes a flicker when the animation ends
			s.backgroundColor = endColor;
			s.visibility = "visible";
		};
		if(whichAnim === "last"){
			for(i in p0){
				p0[i] = {
					start: p0[i]
				};
			}
			p0[borderConst + pn[1] + "Color"] = {
				start: darkColor,
				end: endColor
			};
			p1 = p0;
		}
		if(!whichAnim || whichAnim === "first"){
			anims.push(fx.animateProperty({
				node: helperNode,
				duration: duration,
				properties: p0
			}));
		}
		if(!whichAnim || whichAnim === "last"){
			anims.push(fx.animateProperty({
				node: helperNode,
				duration: duration,
				properties: p1,
				onEnd: finalize
			}));
		}

		// hide the original node
		var _hPlay = rias.after(anims[0], "play", function(){
			_hPlay.remove();
			_hPlay = undefined;
			helperNode.style.visibility = "visible";
			s.visibility = "hidden";
		}, true);

		return fx.chain(anims);

	};

	fx.flipCube = function(/*Object*/ args){
		// summary:
		//		An extension to `dojox.fx.flip` providing a more 3d-like rotation
		// description:
		//		An extension to `dojox.fx.flip` providing a more 3d-like rotation.
		//		Behaves the same as `dojox.fx.flip`, using the same attributes and
		//		other standard `dojo.Animation` properties.
		// example:
		//		See `dojox.fx.flip`
		var anims = [],
			mb = _dom.getMarginBox(args.node),
			shiftX = mb.w / 2,
			shiftY = mb.h / 2,
			dims = {
				top: {
					pName: "height",
					args:[
						{
							whichAnim: "first",
							dir: "top",
							shift: -shiftY
						},
						{
							whichAnim: "last",
							dir: "bottom",
							shift: shiftY
						}
					]
				},
				right: {
					pName: "width",
					args:[
						{
							whichAnim: "first",
							dir: "right",
							shift: shiftX
						},
						{
							whichAnim: "last",
							dir: "left",
							shift: -shiftX
						}
					]
				},
				bottom: {
					pName: "height",
					args:[
						{
							whichAnim: "first",
							dir: "bottom",
							shift: shiftY
						},
						{
							whichAnim: "last",
							dir: "top",
							shift: -shiftY
						}
					]
				},
				left: {
					pName: "width",
					args:[
						{
							whichAnim: "first",
							dir: "left",
							shift: -shiftX
						},
						{
							whichAnim: "last",
							dir: "right",
							shift: shiftX
						}
					]
				}
			}
			;
		var d = dims[args.dir || "left"],
			p = d.args
			;
		args.duration = (args.duration ? args.duration : rias.defaultDuration) * 2;
		args.depth = 0.8;
		args.axis = "cube";
		for(var i = p.length - 1; i >= 0; i--){
			rias.mixin(args, p[i]);
			anims.push(fx.flip(args));
		}
		return fx.combine(anims);
	};

	fx.flipPage = function(/*Object*/ args){
		// summary:
		//		An extension to `dojox.fx.flip` providing a page flip like animation.
		// description:
		//		An extension to `dojox.fx.flip` providing a page flip effect.
		//		Behaves the same as `dojox.fx.flip`, using the same attributes and
		//		other standard `dojo.Animation` properties.
		// example:
		//		See `dojox.fx.flip`
		var n = args.node,
			coords = _dom.getPosition(n, true),
			x = coords.x,
			y = coords.y,
			w = coords.w,
			h = coords.h,
			bgColor = _dom.getStyle(n, "backgroundColor"),
			lightColor = args.lightColor || "#dddddd",
			darkColor = args.darkColor,
			helperNode = _dom.create("div"),
			anims = [],
			hn = [],
			dir = args.dir || "right",
			pn = {
				left: ["left", "right", "x", "w"],
				top: ["top", "bottom", "y", "h"],
				right: ["left", "left", "x", "w"],
				bottom: ["top", "top", "y", "h"]
			},
			shiftMultiplier = {
				right: [1, -1],
				left: [-1, 1],
				top: [-1, 1],
				bottom: [1, -1]
			};
		var getFinalize = function(x){
			return function(){
				_hEnd.remove();
				_hEnd = undefined;
				_dom.destroy(x);
			};
		};
		_dom.setStyle(helperNode, {
			position: "absolute",
			width  : w + "px",
			height : h + "px",
			top	   : y + "px",
			left   : x + "px",
			visibility: "hidden"
		});
		var hs = [],
			r,
			d,
			wa,
			endColor,
			startColor,
			finalize;
		for(var i = 0; i < 2; i++){
			r = i % 2;
			d = r ? pn[dir][1] : dir;
			wa = r ? "last" : "first";
			endColor = r ? bgColor : lightColor;
			startColor = r ? endColor : args.startColor || n.style.backgroundColor;
			hn[i] = rias.clone(helperNode);
			finalize = getFinalize(hn[i]);
			_dom.body().appendChild(hn[i]);
			hs[i] = {
				backgroundColor: r ? startColor : bgColor
			};

			hs[i][pn[dir][0]] = coords[pn[dir][2]] + shiftMultiplier[dir][0] * i * coords[pn[dir][3]] + "px";
			_dom.setStyle(hn[i], hs[i]);
			anims.push(fx.flip({
				node: hn[i],
				dir: d,
				axis: "shortside",
				depth: args.depth,
				duration: args.duration / 2,
				shift: shiftMultiplier[dir][i] * coords[pn[dir][3]] / 2,
				darkColor: darkColor,
				lightColor: lightColor,
				whichAnim: wa,
				endColor: endColor
			}));
			var _hEnd = rias.after(anims[i], "onEnd", finalize);
		}
		return fx.chain(anims);
	};

	fx.flipGrid = function(/*Object*/ args){
		// summary:
		//		An extension to `dojox.fx.flip` providing a decomposition in rows * cols flipping elements
		// description:
		//		An extension to `dojox.fx.flip` providing a page flip effect.
		//		Behaves the same as `dojox.fx.flip`, using the same attributes and
		//		other standard `dojo.Animation` properties and
		//
		//		- cols: Integer columns
		//		- rows: Integer rows
		//		- duration: the single flip duration
		// example:
		//		See `dojox.fx.flip`
		var rows = args.rows || 4,
			cols = args.cols || 4,
			anims = [],
			helperNode = _dom.create("div"),
			n = args.node,
			coords = _dom.getPosition(n, true),
			x = coords.x,
			y = coords.y,
			nw = coords.w,
			nh = coords.h,
			w = coords.w / cols,
			h = coords.h / rows,
			cAnims = [];
		var getAdjustClip = function(xn, yCounter, xCounter){
			return function(){
				if(!(yCounter % 2)){
					_dom.setStyle(xn, {
						clip: "rect(" + yCounter * h + "px," + (nw - (xCounter + 1) * w ) + "px," + ((yCounter + 1) * h) + "px,0px)"
					});
				}else{
					_dom.setStyle(xn, {
						clip: "rect(" + yCounter * h + "px," + nw + "px," + ((yCounter + 1) * h) + "px," + ((xCounter + 1) * w) + "px)"
					});
				}
			};
		};
		var getRemoveHelper = function(xn){
			return function(){
				_dom.destroy(xn);
			};
		};
		_dom.setStyle(helperNode, {
			position: "absolute",
			width: w + "px",
			height: h + "px",
			backgroundColor: _dom.getStyle(n, "backgroundColor")
		});
		var r,
			d,
			signum,
			hn,
			i, j, l,
			adjustClip,
			a,
			removeHelper,
			_h = [];
		for(i = 0; i < rows; i++){
			r = i % 2;
			d = r ? "right" : "left";
			signum = r ? 1 : -1;
			// cloning
			var cn = rias.clone(n);
			_dom.setStyle(cn, {
				position: "absolute",
				width: nw + "px",
				height: nh + "px",
				top: y + "px",
				left: x + "px",
				clip: "rect(" + i * h + "px," + nw + "px," + nh + "px,0)"
			});
			_dom.body().appendChild(cn);
			anims[i] = [];
			for(j = 0; j < cols; j++){
				hn = rias.clone(helperNode);
				l = r ? j : cols - (j + 1);
				adjustClip = getAdjustClip(cn, i, j);
				_dom.body().appendChild(hn);
				_dom.setStyle(hn, {
					left: x + l * w + "px",
					top: y + i * h + "px",
					visibility: "hidden"
				});
				a = fx.flipPage({
					node: hn,
					dir: d,
					duration: args.duration || rias.defaultDuration * 2,// 900,
					shift: signum * w/2,
					depth: 0.2,
					darkColor: args.darkColor,
					lightColor: args.lightColor,
					startColor: args.startColor || args.node.style.backgroundColor
				});
				removeHelper = getRemoveHelper(hn);
				_h.push(rias.after(a, "play", adjustClip));
				_h.push(rias.after(a, "play", removeHelper));
				anims[i].push(a);
			}
			cAnims.push(fx.chain(anims[i]));
		}

		a = fx.combine(cAnims);
		var _hPlay = rias.after(cAnims[0], "play", function(){
				_hPlay.remove();
				_hPlay = undefined;
				_dom.setStyle(n, {
					visibility: "hidden"
				});
			}),
			_hEnd = rias.after(a, "onEnd", function(){
				_hEnd.remove();
				_hEnd = undefined;
				rias.forEach(_h, function(item){
					item.remove();
				});
				_h = [];
			});
		return a;
	};

	return fx;

});
