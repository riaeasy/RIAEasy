require({cache:{
'riasbi/riasbiMetas':function(){
//RIAStudio business intelligence widget Metadata.

define([
	"rias/riasBase"
], function(rias) {

	var result = {
	};

	return result;

});
},
'riasbi/main':function(){

//RIAStudio business intelligence(riasbi).

define([
	"riasw/riaswBase",
	"dojo/i18n!riasbi/nls/riasbiI18n"
], function(rias, riasbiI18n) {

/// riasbi ******************************************************************************///

	rias.i18n.riasbi = riasbiI18n;///需要这里先赋值。

	var riasbi = rias.getObject("riasbi", true);
	riasbi._scopeName = "riasbi";
	dojo.scopeMap.riasbi = ["riasbi", riasbi];
	//rias.riasbi = riasbi;

	rias._initRiasbi = function(){
		var d = rias.newDeferred("_initRiasbi", rias.defaultDeferredTimeout, function(){
			this.cancel();
		});
		rias.require([
			"riasbi/riasbiBase"
		], function(rias){
			rias.require([
				"riasbi/riasbiMetas"
			], function(riasbiMetas){
				try{
					rias.theme.loadCss([
						rias.toUrl("riasbi/resources/riasbi.css")
					]);

					if(riasbiMetas === "not-a-module"){
						rias.has.add("riasbi", 0, 0, 1);
						d.reject(false);
					}else{
						rias.registerRiaswMetas(1, riasbiMetas);
						d.resolve(riasbi);
					}
				}catch(e){
					rias.has.add("riasbi", 0, 0, 1);
					d.resolve(false);
				}
			});
		});
		return d.promise;
	};

	return riasbi;

});

},
'riasbi/fx/split':function(){

define([
	"riasw/riaswBase",
	"riasw/fx"
], function(rias, fx) {

	var _dom = rias.dom;

	rias.mixin(fx, {
		_split: function(/*Object*/ args){
			// summary:
			//		Split a node into rectangular pieces and animate them.
			// description:
			//		Returns an animation that will split the node into a grid
			//		of pieces that move independently.
			// args:
			//		- args.crop: Boolean - If true, pieces will only be visible inside node's boundaries
			//		- args.rows: Integer - The number of horizontal pieces (default is 3)
			//		- args.columns: Integer - The number of vertical pieces (default is 3)
			//		- args.pieceAnimation: Function(piece, x, y, coords) - Returns either the dojo.Animation
			//		  or an array of dojo.Animation objects for the piece at location (x, y) in the node's grid;
			//		  coords is the result of dojo.coords(args.node, true);

			args.rows = args.rows || 3;
			args.columns = args.columns || 3;
			args.duration = args.duration || rias.defaultDuration * 2;//1000;

			var node = args.node = _dom.byId(args.node),
				parentNode = node.parentNode,
				pNode = parentNode,
				body = _dom.body(),
				_pos = "position";

			while(pNode && pNode !== body && _dom.getStyle(pNode, _pos) === "static"){
				pNode = pNode.parentNode;
			}

			var pCoords = pNode !== body ? _dom.getPosition(pNode, true) : { x: 0, y: 0 },
				coords = _dom.getPosition(node, true),
				nodeHeight = _dom.getStyle(node, "height"),
				nodeWidth = _dom.getStyle(node, "width"),
				hBorder = _dom.getStyle(node, "borderLeftWidth") + _dom.getStyle(node, "borderRightWidth"),
				vBorder = _dom.getStyle(node, "borderTopWidth") + _dom.getStyle(node, "borderBottomWidth"),
				pieceHeight = Math.ceil(nodeHeight / args.rows),
				pieceWidth = Math.ceil(nodeWidth / args.columns),
				container = _dom.create(node.tagName, {
					style: {
						position: "absolute",
						padding: 0,
						margin: 0,
						border:"none",
						top: coords.y - pCoords.y + "px",
						left: coords.x - pCoords.x + "px",
						height: nodeHeight + vBorder + "px",
						width: nodeWidth + hBorder + "px",
						background: "none",
						overflow: args.crop ? "hidden" : "visible",
						zIndex: _dom.getStyle(node, "zIndex")
					}
				}, node, "after"),
				animations = [],
				pieceHelper = _dom.create(node.tagName, {
					style: {
						position: "absolute",
						border: "none",
						padding: 0,
						margin: 0,
						height: pieceHeight + hBorder + "px",
						width: pieceWidth + vBorder + "px",
						overflow: "hidden"
					}
				});

			// Create the pieces and their animations
			for(var y = 0, ly = args.rows; y < ly; y++){
				for(var x = 0, lx = args.columns; x < lx; x++){
					// Create the piece
					var piece = rias.clone(pieceHelper),
						pieceContents = rias.clone(node),
						pTop = y * pieceHeight,
						pLeft = x * pieceWidth
						;

					// IE hack
					pieceContents.style.filter = "";

					// removing the id attribute from the cloned nodes
					_dom.removeAttr(pieceContents, "id");

					_dom.setStyle(piece, {
						border: "none",
						overflow: "hidden",
						top: pTop + "px",
						left: pLeft + "px"
					});
					_dom.setStyle(pieceContents, {
						position: "static",
						opacity: "1",
						marginTop: -pTop + "px",
						marginLeft: -pLeft + "px"
					});
					piece.appendChild(pieceContents);
					container.appendChild(piece);

					var pieceAnimation = args.pieceAnimation(piece, x, y, coords);
					if(rias.isArray(pieceAnimation)){
						// if pieceAnimation is an array, append its elements
						animations = animations.concat(pieceAnimation);
					}else{
						// otherwise, append it
						animations.push(pieceAnimation);
					}
				}
			}

			var anim = fx.combine(animations),
				_hEnd = rias.after(anim, "onEnd", function(){
					_hEnd.remove();
					_hEnd = undefined;
					container.parentNode.removeChild(container);
				}, true);
			if(args.onPlay){
				var _hPlaya = rias.after(anim, "onPlay", function(){
					_hPlaya.remove();
					_hPlaya = undefined;
					args.onPlay();
				}, true);
			}
			if(args.onEnd){
				var _hEnda = rias.after(anim, "onEnd", function(){
					_hEnda.remove();
					_hEnda = undefined;
					args.onEnd();
				});
			}

			return anim; // dojo.Animation
		},

		explode: function(/*Object*/ args){
			// summary:
			//		Explode a node into rectangular pieces
			// description:
			//		Returns an animation that will split the node into a grid
			//		of pieces that fly away from the center.
			// args:
			//		- args.rows: Integer - The number of horizontal pieces (default is 3)
			//		- args.columns: Integer - The number of vertical pieces (default is 3)
			//		- args.random: Float - If set, pieces fly to random distances, for random durations,
			//							   and in slightly random directions.  The value defines how much
			//							   randomness is introduced.
			//		- args.distance: Float - Multiplier for the distance the pieces fly (even when random)
			//		- args.fade: Boolean - If true, pieces fade out while in motion (default is true)
			//		- args.fadeEasing: Function - If args.fade is true, the fade animations use this easing function
			//		- args.unhide: Boolean - If true, the animation is reversed
			//		- args.sync: Boolean - If args.unhide is true, all the pieces converge at the same time
			//							   (default is true)

			var node = args.node = _dom.byId(args.node);
			args.rows = args.rows || 3;
			args.columns = args.columns || 3;
			args.distance = args.distance || 1;
			args.duration = args.duration || rias.defaultDuration * 2;// 1000;
			args.random = args.random || 0;
			if(!args.fade){
				args.fade = true;
			}
			if(typeof args.sync === "undefined"){
				args.sync = true;
			}
			args.random = Math.abs(args.random);

			// Returns the animation object for each piece
			args.pieceAnimation = function(piece, x, y, coords){
				var pieceHeight = coords.h / args.rows,
					pieceWidth = coords.w / args.columns,
					distance = args.distance * 2,
					duration = args.duration || rias.defaultDuration,
					ps = piece.style,
					startTop = parseInt(ps.top),
					startLeft = parseInt(ps.left),
					delay = 0,
					randomX = 0,
					randomY = 0;

				if(args.random){
					var seed = (Math.random() * args.random) + Math.max(1 - args.random, 0);
					distance *= seed;
					duration *= seed;
					// To syncronize, give each piece an appropriate delay so they end together
					delay = ((args.unhide && args.sync) || (!args.unhide && !args.sync)) ? (args.duration - duration) : 0;
					// Slightly randomize the direction of each piece
					randomX = Math.random() - 0.5;
					randomY = Math.random() - 0.5;
				}

				var distanceY = ((coords.h - pieceHeight) / 2 - pieceHeight * y),
					distanceX = ((coords.w - pieceWidth) / 2 - pieceWidth * x),
					distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)),
					endTop = parseInt(startTop - distanceY * distance + distanceXY * randomY),
					endLeft = parseInt(startLeft - distanceX * distance + distanceXY * randomX)
					;

				// Create the animation objects for the piece
				// These are separate anim objects so they can have different curves
				var pieceSlide = fx.animateProperty({
					node: piece,
					duration: duration,
					delay: delay,
					easing: (args.easing || (args.unhide ? fx.easing.sinOut : fx.easing.circOut)),
					beforeBegin: (args.unhide ? function(){
						if(args.fade){
							_dom.setStyle(piece, {
								opacity: "0"
							});
						}
						ps.top = endTop + "px";
						ps.left = endLeft + "px";
					} : undefined),
					properties: {
						top: (args.unhide ? { start: endTop, end: startTop } : { start: startTop, end: endTop }),
						left: (args.unhide ? { start: endLeft, end: startLeft } : { start: startLeft, end: endLeft })
					}
				});
				if(args.fade){
					var pieceFade = fx.animateProperty({
						node: piece,
						duration: duration,
						delay: delay,
						easing: (args.fadeEasing || fx.easing.quadOut),
						properties: {
							opacity: (args.unhide ? { start: "0", end: "1" } : { start: "1", end: "0" })
						}
					});

					// return both animations as an array
					return (args.unhide ? [pieceFade, pieceSlide] : [pieceSlide, pieceFade]);
				}else{
					// Otherwise return only the slide animation
					return pieceSlide;
				}
			};

			var anim = fx._split(args),
				_h;
			if(args.unhide){
				_h = rias.after(anim, "onEnd", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, {opacity: "1" });
				});
			}else{
				_h = rias.after(anim, "onPlay", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "0" });
				});
			}
			return anim; // dojo.Animation
		},

		converge: function(/*Object*/ args){
			args.unhide = true;
			return fx.explode(args);
		},

		disintegrate: function(/*Object*/ args){
			// summary:
			//		Split a node into rectangular pieces and let them fall
			// description:
			//		Returns an animation that will split the node into a grid
			//		of pieces that drop.
			// args:
			//		- args.rows: Integer - The number of horizontal pieces (default is 5)
			//		- args.columns: Integer - The number of vertical pieces (default is 5)
			//		- args.interval: Float - The number of milliseconds between each piece's animation
			//		- args.distance: Float - The number of the node's heights to drop (default is 1.5)
			//		- args.fade: Boolean - If true, pieces fade out while in motion (default is true)
			//		- args.random: Float - If set, pieces fall in random order. The value defines how much
			//							   randomness is introduced.
			//		- args.reverseOrder: Boolean - If true, pieces animate in reversed order
			//		- args.unhide: Boolean - If true, the peices fall from above and land in place
			var node = args.node = _dom.byId(args.node);

			args.rows = args.rows || 5;
			args.columns = args.columns || 5;
			args.duration = args.duration || rias.defaultDuration * 3;//1500;
			args.interval = args.interval || args.duration / (args.rows + args.columns * 2);
			args.distance = args.distance || 1.5;
			args.random = args.random || 0;
			if(typeof args.fade === "undefined"){
				args.fade = true;
			}

			var random = Math.abs(args.random),
				duration = args.duration - (args.rows + args.columns) * args.interval;

			// Returns the animation object for each piece
			args.pieceAnimation = function(piece, x, y, coords){

				var randomDelay = Math.random() * (args.rows + args.columns) * args.interval,
					ps = piece.style,

				// If distance is negative, start from the top right instead of bottom left
					uniformDelay = (args.reverseOrder || args.distance < 0) ?
						((x + y) * args.interval) :
						(((args.rows + args.columns) - (x + y)) * args.interval),
					delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay,
				// Create the animation object for the piece
					properties = {}
					;
				if(args.unhide){
					properties.top = {
						start: (parseInt(ps.top) - coords.h * args.distance),
						end: parseInt(ps.top)
					};
					if(args.fade){
						properties.opacity = {start: "0", end: "1"};
					}
				}else{
					properties.top = {
						end: (parseInt(ps.top) + coords.h * args.distance)
					};
					if(args.fade){
						properties.opacity = {end: "0"};
					}
				}
				var pieceAnimation = fx.animateProperty({
					node: piece,
					duration: duration,
					delay: delay,
					easing: (args.easing || (args.unhide ? fx.easing.sinIn : fx.easing.circIn)),
					properties: properties,
					beforeBegin: (args.unhide ? function(){
						if(args.fade){
							_dom.setStyle(piece, { opacity: "0" });
						}
						ps.top = properties.top.start + "px";
					} : undefined)
				});

				return pieceAnimation;
			};

			var anim = fx._split(args),
				_h;
			if(args.unhide){
				_h = rias.after(anim, "onEnd", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "1" });
				});
			}else{
				_h = rias.after(anim, "onPlay", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "0" });
				});
			}
			return anim; // dojo.Animation
		},

		build: function(/*Object*/ args){
			args.unhide = true;
			return fx.disintegrate(args);
		},

		shear: function(/*Object*/ args){
			// summary:
			//		Split a node into rectangular pieces and slide them in alternating directions
			// description:
			//		Returns an animation that will split the node into a grid
			//		of pieces that slide in alternating directions.
			// args:
			//		- args.rows: Integer - The number of horizontal pieces (default is 6)
			//		- args.columns: Integer - The number of vertical pieces (default is 6)
			//		- args.interval: Float - The number of milliseconds between each piece's animation (default is 0)
			//		- args.distance: Float - The multiple of the node's dimensions to slide (default is 1)
			//		- args.fade: Boolean - If true, pieces fade out while in motion (default is true)
			//		- args.random: Float - If true, pieces have a random delay. The value defines how much
			//							   randomness is introduced
			//		- args.reverseOrder: Boolean - If true, pieces animate in reversed order
			//		- args.unhide: Boolean - If true, the animation is reversed

			var node = args.node = _dom.byId(args.node);

			args.rows = args.rows || 6;
			args.columns = args.columns || 6;
			args.duration = args.duration || rias.defaultDuraion * 2;//1000;
			args.interval = args.interval || 0;
			args.distance = args.distance || 1;
			args.random = args.random || 0;
			if(typeof(args.fade) === "undefined"){
				args.fade = true;
			}
			var random = Math.abs(args.random),
				duration = (args.duration - (args.rows + args.columns) * Math.abs(args.interval))
				;

			// Returns the animation object for each piece
			args.pieceAnimation = function(piece, x, y, coords){

				// Since x an y start at 0, the opposite is true...
				var colIsOdd = !(x % 2),
					rowIsOdd = !(y % 2),
					randomDelay = Math.random() * duration,
					uniformDelay = (args.reverseOrder) ?
						(((args.rows + args.columns) - (x + y)) * args.interval) :
						((x + y) * args.interval),
					delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay,
					properties = {},
					ps = piece.style
					;

				if(args.fade){
					properties.opacity = (args.unhide ? { start: "0", end: "1" } : { end: "0" });
				}

				// If we have only rows or columns, ignore the other dimension
				if(args.columns === 1){
					colIsOdd = rowIsOdd;
				}else if(args.rows === 1){
					rowIsOdd = !colIsOdd;
				}

				// Determine the piece's direction
				var left = parseInt(ps.left),
					top = parseInt(ps.top),
					distanceX = args.distance*coords.w,
					distanceY = args.distance*coords.h
					;
				if(args.unhide){
					if(colIsOdd === rowIsOdd){
						properties.left = colIsOdd ? {start: (left - distanceX), end: left} : {start: (left + distanceX), end: left};
					}else{
						properties.top = colIsOdd ? {start: (top + distanceY), end: top} : {start: (top - distanceY), end: top};
					}
				}else{
					if(colIsOdd === rowIsOdd){
						properties.left = colIsOdd ? {end: (left - distanceX)} : {end: (left + distanceX)};
					}else{
						properties.top = colIsOdd ? {end: (top + distanceY)} : {end: (top - distanceY)};
					}
				}

				// Create the animation object for the piece
				var pieceAnimation = fx.animateProperty({
					node: piece,
					duration: duration,
					delay: delay,
					easing: (args.easing || fx.easing.sinInOut),
					properties: properties,
					beforeBegin: (args.unhide ? function(){
						if(args.fade){
							ps.opacity = "0";
						}
						if(colIsOdd === rowIsOdd){
							ps.left = properties.left.start + "px";
						}else{
							ps.top = properties.top.start + "px";
						}
					} : undefined)
				});

				return pieceAnimation;
			};

			var anim = fx._split(args),
				_h;
			if(args.unhide){
				_h = rias.after(anim, "onEnd", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "1" });
				});
			}else{
				_h = rias.after(anim, "onPlay", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "0" });
				});
			}
			return anim; // dojo.Animation
		},

		unShear: function(/*Object*/ args){
			args.unhide = true;
			return fx.shear(args);
		},

		pinwheel: function(/*Object*/ args){
			// summary:
			//		Split a node into rectangular pieces and wipe them in alternating directions
			// description:
			//		Returns an animation that will split the node into a grid
			//		of pieces that wipe in alternating directions.
			// args:
			//		- args.rows: Integer - The number of horizontal pieces (default is 4)
			//		- args.columns: Integer - The number of vertical pieces (default is 4)
			//		- args.interval: Float - The number of milliseconds between each piece's animation (default is 0)
			//		- args.distance: Float - The percentage of the piece's dimensions the piece should wipe
			//		- args.fade: Boolean - If true, pieces fade out while in motion (default is true)
			//		- args.random: Float - If true, pieces have a random delay. The value defines how much
			//							   randomness is introduced.
			//		- args.unhide: Boolean - If true, the animation is reversed

			var node = args.node = _dom.byId(args.node);

			args.rows = args.rows || 4;
			args.columns = args.columns || 4;
			args.duration = args.duration || rias.defaultDuration * 2;// 1000;
			args.interval = args.interval || 0;
			args.distance = args.distance || 1;
			args.random = args.random || 0;
			if(typeof args.fade === "undefined"){
				args.fade = true;
			}
			var duration = (args.duration - (args.rows + args.columns) * Math.abs(args.interval));

			// Returns the animation object for each piece
			args.pieceAnimation = function(piece, x, y, coords){
				var pieceHeight = coords.h / args.rows,
					pieceWidth = coords.w / args.columns,

				// because x an y start at 0, the opposite is true...
					colIsOdd = !(x % 2),
					rowIsOdd = !(y % 2),

					randomDelay = Math.random() * duration,
					uniformDelay = (args.interval < 0) ?
						(((args.rows + args.columns) - (x + y)) * args.interval * -1) :
						((x + y) * args.interval),
					delay = randomDelay * args.random + Math.max(1 - args.random, 0) * uniformDelay,
					properties = {},
					ps = piece.style
					;

				if(args.fade){
					properties.opacity = (args.unhide ? {start: 0, end: 1} : {end:0});
				}

				// If we have only rows or columns, ignore the other dimension
				if(args.columns === 1){
					colIsOdd = !rowIsOdd;
				}else if(args.rows === 1){
					rowIsOdd = colIsOdd;
				}

				// Determine the piece's direction
				var left = parseInt(ps.left),
					top = parseInt(ps.top)
					;
				if(colIsOdd){
					if(rowIsOdd){
						properties.top = args.unhide ?
						{ start: top + pieceHeight * args.distance, end: top} :
						{ start: top, end: top + pieceHeight * args.distance} ;
					}else{
						properties.left = args.unhide ?
						{ start: left + pieceWidth * args.distance, end: left } :
						{ start: left, end: left + pieceWidth * args.distance } ;
					}
				}
				if(colIsOdd !== rowIsOdd){
					properties.width = args.unhide ?
					{ start: pieceWidth * (1 - args.distance), end: pieceWidth } :
					{ start: pieceWidth, end: pieceWidth * (1 - args.distance) } ;
				}else{
					properties.height = args.unhide ?
					{ start: pieceHeight * (1 - args.distance), end: pieceHeight } :
					{ start: pieceHeight, end: pieceHeight * (1 - args.distance) } ;
				}

				// Create the animation object for the piece
				var pieceAnimation = fx.animateProperty({
					node: piece,
					duration: duration,
					delay: delay,
					easing: (args.easing || fx.easing.sinInOut),
					properties: properties,
					beforeBegin: (args.unhide ? function(){
						if(args.fade){
							_dom.style(piece, "opacity", 0);
						}
						if(colIsOdd){
							if(rowIsOdd){
								ps.top = (top + pieceHeight * (1 - args.distance)) + "px";
							}else{
								ps.left = (left + pieceWidth * (1 - args.distance)) + "px";
							}
						}else{
							ps.left = left + "px";
							ps.top = top + "px";
						}
						if(colIsOdd !== rowIsOdd){
							ps.width = (pieceWidth * (1 - args.distance)) + "px";
						}else{
							ps.height = (pieceHeight * (1 - args.distance)) + "px";
						}
					} : undefined)
				});

				return pieceAnimation;
			};

			var anim = fx._split(args),
				_h;
			if(args.unhide){
				_h = rias.after(anim, "onEnd", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "1" });
				});
			}else{
				_h = rias.after(anim, "play", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "0" });
				});
			}
			return anim; // dojo.Animation
		},

		unPinwheel: function(/*Object*/ args){
			args.unhide = true;
			return fx.pinwheel(args); // dojo.Animation
		},

		blockFadeOut: function(/*Object*/ args){
			// summary:
			//		Split a node into rectangular pieces and fade them
			// description:
			//		Returns an animation that will split the node into a grid
			//		of pieces that fade in or out.
			// args:
			//		- args.rows: Integer - The number of horizontal pieces (default is 5)
			//		- args.columns: Integer - The number of vertical pieces (default is 5)
			//		- args.interval: Float - The number of milliseconds between each piece's animation (default is 0)
			//		- args.random: Float - If true, pieces have a random delay. The value defines how much
			//							   randomness is introduced
			//		- args.reverseOrder: Boolean - If true, pieces animate in reversed order
			//		- args.unhide: Boolean - If true, the animation is reversed

			var node = args.node = _dom.byId(args.node);

			args.rows = args.rows || 5;
			args.columns = args.columns || 5;
			args.duration = args.duration || rias.defaultDuration * 2;//1000;
			args.interval = args.interval || args.duration / (args.rows + args.columns * 2);
			args.random = args.random || 0;
			var random = Math.abs(args.random),
				duration = args.duration - (args.rows + args.columns) * args.interval
				;

			// Returns the animation object for each piece
			args.pieceAnimation = function(piece, x, y, coords){
				var randomDelay = Math.random() * args.duration,
					uniformDelay = (args.reverseOrder) ?
						(((args.rows + args.columns) - (x + y)) * Math.abs(args.interval)) :
						((x + y) * args.interval),
					delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay,
				// Create the animation object for the piece
					pieceAnimation = fx.animateProperty({
						node: piece,
						duration: duration,
						delay: delay,
						easing: (args.easing || fx.easing.sinInOut),
						properties: {
							opacity: (args.unhide ? {start: "0", end: "1"} : {start: "1", end: "0"})
						},
						beforeBegin: (args.unhide ? function(){
							_dom.setStyle(piece, { opacity: "0" });
						} : function(){
							piece.style.filter = "";
						})
					});

				return pieceAnimation;
			};
			var anim = fx._split(args),
				_h;
			if(args.unhide){
				_h = rias.after(anim, "onEnd", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "1" });
				});
			}else{
				_h = rias.after(anim, "onPlay", function(){
					_h.remove();
					_h = undefined;
					_dom.setStyle(node, { opacity: "0" });
				});
			}
			return anim; // dojo.Animation
		},

		blockFadeIn: function(/*Object*/ args){
			args.unhide = true;
			return fx.blockFadeOut(args); // dojo.Animation
		}
	});

	return fx;
});
},
'riasbi/fx/flip':function(){

define([
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

},
'riasbi/fx/scroll':function(){

define([
	"riasw/riaswBase",
	"riasw/fx"
], function(rias, fx) {

	var _dom = rias.dom;

	fx.smoothScroll = function(/* Object */args){
		// summary:
		//		Returns an animation that will smooth-scroll to a node
		// description:
		//		This implementation support either horizontal or vertical scroll, as well as
		//		both. In addition, element in iframe can be scrolled to correctly.
		// args:
		//		- offset: {x: int, y: int} this will be added to the target position
		//		- duration: Duration of the animation in milliseconds.
		//		- win: a node or window object to scroll

		if(!args.target){
			args.target = _dom.getPosition(args.node);
		}

		var isWindow = rias[(rias.has("ie") ? "isObject" : "isFunction")](args.win.scrollTo),
			delta = {
				x: args.target.x, y: args.target.y
			};
		if(!isWindow){
			var winPos = _dom.getPosition(args.win);
			delta.x -= winPos.x;
			delta.y -= winPos.y;
		}
		var _anim = (isWindow) ? (function(val){
			args.win.scrollTo(val[0], val[1]);
		}) : (function(val){
			args.win.scrollLeft = val[0];
			args.win.scrollTop = val[1];
		});
		var anim = new fx.Animation(rias.mixin({
			beforeBegin: function(){
				if(this.curve){
					delete this.curve;
				}
				var current = isWindow ? _dom.docScroll() : {
					x: args.win.scrollLeft,
					y: args.win.scrollTop
				};
				this.curve = new fx._Line([current.x, current.y], [current.x + delta.x, current.y + delta.y]);
			},
			onAnimate: _anim
		},args));

		return anim; // dojo.Animation
	};

	return fx;
});
},
'riasbi/fx':function(){

//RIAStudio business intelligence fx-ext.

define([
	"riasw/riaswBase",
	"riasw/fx",

	"riasbi/fx/split",
	"riasbi/fx/flip",
	"riasbi/fx/scroll"
], function(rias, fx) {

	return fx;

});
},
'*now':function(r){r(['dojo/i18n!*preload*riasbi/nls/riasbiBase*["ar","ca","cs","da","de","el","en-gb","en-us","es-es","fi-fi","fr-fr","he-il","hu","it-it","ja-jp","ko-kr","nl-nl","nb","pl","pt-br","pt-pt","ru","sk","sl","sv","th","tr","zh-tw","zh-cn","ROOT"]']);}
}});

//RIAStudio business intelligence(riasbi).

define("riasbi/riasbiBase", [
	"riasw/riaswBase",
	"riasbi/riasbiMetas",
	"riasbi/fx"
], function (rias) {

	return rias;

});