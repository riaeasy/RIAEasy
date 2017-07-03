
define("riasbi/fx/scroll", [
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