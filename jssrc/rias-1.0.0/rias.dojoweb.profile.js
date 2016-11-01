
var profile = (function(){
	var testResourceRe = /^(dojo|dijit|dojox)\/(tests(?:DOH)?|demos)\//,
		nodeModulesRe = /\/node_modules\//,

		copyOnly = function(filename, mid){
			var list = {
				"dojo/dojo.profile":1,
				"dojo/package.json":1,
				"dojo/OpenAjax":1,
				"dojo/tests":1,
				// these are test modules that are not intended to ever be built
				"dojo/tests/_base/loader/requirejs/requirejs-setup":1,
				"dojo/tests/_base/loader/requirejs/dataMain":1,
				"dojo/tests/_base/loader/requirejs/depoverlap":1,
				"dojo/tests/_base/loader/requirejs/simple-tests":1,
				"dojo/tests/_base/loader/requirejs/relative/relative-tests":1,
				"dojo/tests/_base/loader/requirejs/exports/exports-tests":1
			};
			return (mid in list) ||
				/^dojo\/_base\/config\w+$/.test(mid) ||
				(/^dojo\/resources\//.test(mid) && !/\.css$/.test(filename)) ||
				/(png|jpg|jpeg|gif|tiff)$/.test(filename) ||
				nodeModulesRe.test(mid) ||
				/built\-i18n\-test\/152\-build/.test(mid);
		};

	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid) || mid=="dojo/robot" || mid=="dojo/robotx";
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid){
				return !testResourceRe.test(mid) && !copyOnly(filename, mid) && /\.js$/.test(filename);
			},

			miniExclude: function(filename, mid){
				return nodeModulesRe.test(mid);
			}
		},

		basePath: "../../../js-lib-src/dojo-1.11.2-src",///相对于本文件的路径，接下类的编译都从这里开始计算。关联编译配置的文件位置。
		releaseDir: "../dojo-1.11.2-web-min",///相对于 build.bat 的 basePath（即 build 所用的 dojo 的目录），编译目标目录，编译器会覆盖它发现的一切。
		releaseName: "",
		action: "release",//一般就这样写，不要修改。
		//默认值为"shrinksafe"。若该值为false，则关闭压缩。shrinksafe.keeplines, closure, closure.keeplines, comments,comments.keeplines///dojo1.7+建议用closure。
		layerOptimize: "closure",
		//设置那些不是层的模块的压缩设置，默认为false，其他值和layerOptimize相同///dojo1.7+建议用closure。
		optimize: "closure",
		//处理CSS的优化。默认为false。若为comments则去除注释和换行，并连接任何@import命令。其他可选的值有comments.keeplines，剔除注释和连接@import命令，但是保留换行。
		cssOptimize: false,
		//决定编译过程中是否最小化。如果为真则标记为miniExcludes的文件被排除在外就像tests那样，demo和其他元素对于编译不是必需的。默认的为false。
		mini: true,
		stripConsole: "none",///处理输出代码中的console语名， 默认为"normal", 会删除所有console语句，除了console.error 和 console.warn.最需注意的是，这个特征只在优化级别时才适用。否则它会被忽略。 另外可能的值为"none", "warn" 和"all"
		//selectorEngine: "lite",///标识默认的选择器引擎。这不会直接使代码变小，它确保选择器引擎不包含其他的调用。默认没有设置，Dojo包含两个引擎lite和acme。

		///build 后 dojo 的缺省 config，会导致 build 的结果直接采用这些默认值，如果不是明确用于某个明确项目，不要显式设置。
		defaultConfig: {
			bindEncoding: 'UTF-8',
			isDebug: 1,
			parseOnLoad: 0,
			async: 1,
			//cacheBust: new Date(),
			waitSeconds: 15,
			//locale: 'zh-cn',
			//extraLocale: ['en'],
			hasCache:{
				///以下为 defaultConfig
				"dojo-undef-api": 1,//是否包含对模块卸载的支持
				"dojo-requirejs-api": 1,//是否支持RequireJS。
				"dojo-parser": 1,
				"dojo-mobile-parser": 1,
				"config-dojo-loader-catches": 1,//是否 catch 加载模块时的error handling
				//"dom-addeventlistener": 0,///old ie = 0
				"touch": 1,
				//"dojo-bidi" : 0,

				///以下为 dojoConfig
				"host-browser": 1,//确定构建的代码是用于浏览器平台的//设为0才能支持 Rhino
				"dom": 1,//Ensures the DOM code is available.保证DOM 代码可用//设为0才能支持 Rhino
				"dojo-amd-factory-scan": 1,//是否扫描所有的模块对AMD的支持
				"dojo-loader": 1,//是否使得加载器是可用的
				"dojo-has-api": 1,//是否使得 has 功能检测API 是可用的
				"dojo-inject-api": 1,//是否支持跨域加载模块
				"dojo-timeout-api": 1,//Disables code dealing with modules that don’t load.？//设为0才能支持 Rhino
				"dojo-trace-api": 1,//Disables the tracing of module loading.是否跟踪模块加载过程
				"dojo-log-api": 1,//是否记录加载器的日志？
				"dojo-dom-ready-api": 1,//是否保证 DOM ready API 是可用的//设为0才能支持 Rhino
				"dojo-publish-privates": 1,//是否显示加载器的一些内部信息
				"dojo-config-api": 1,//是否保证 build 是可以配置的
				"dojo-sniff": 1,//是否当从一个CDN加载模块的时候，启用一些老式的模块加载行为？//设为0才能支持 Rhino
				"dojo-sync-loader": 1,//是否支持同步加载器
				"dojo-test-sniff": 1,//Disables some features for testing purposes.是否包含测试代码
				"config-deferredInstrumentation": 1,//是否自动加载那些会报告un-handled rejected promises的代码
				"config-tlmSiblingOfDojo": 1,//是否支持非标准的模块解析代码

				"dojo-built": 1
			},
			packages: [
				{name: 'dijit', location: '../dijit'},
				{name: 'dojox', location: '../dojox'},
				{name: 'rias', location: '../../../RSServer/jssrc/rias-1.0.0', main: "rias"}
			]
		},
		///build 时 has 的预设值，会直接导致 build 的结果直接采用这些默认值进行 build，如果不是明确用于某个明确项目，不要显式设置。
		///需要与上面的 defaultConfig 的 hasCache 配合使用，即显式设置 defaultConfig 中的非 dojo 的缺省 config 值
		staticHasFeatures: {
			/*这些值不建议预设
			"dojo-combo-api": 0,//是否支持一些老式的加载器API
			"dojo-config-addOnLoad": 1,
			"dojo-firebug": 1,//是否为那些没有开发者控制台（developer console）的浏览器启用firebug lite (e.g. IE6)
			"dojo-guarantee-console": 1,//是否使那些不能使用控制台的浏览器可以使用console(e.g. IE6)
			"config-selectorEngine": "lite",
			"dojo-debug-messages": 1,//是否包含检测diagnostic 信息
			"dojo-modulePaths": 1,//是否支持那些和加载模块相关的老式API
			"dojo-moduleUrl": 1,//是否那些和加载模块相关的老式API
			"dojo-xhr-factory": 1,///Rhino需要设为0
			"host-rhino": 0,
			"host-node": 0,
			"extend-dojo": 1,//Ensures pre-Dojo 2.0 behavior is maintained.保证  pre-Dojo 2.0行为是被维护的。
			*/

			//"dojo-preload-i18n-Api": 0,///设为 1，会导致 require 时默认加载 nls/*_ROOT.js
			//"dojo-v1x-i18n-Api": 0,//启动对v1.x 国际化加载的支持 （ Dijit需要使用）

			///以下为 defaultConfig
			"dojo-undef-api": 1,//是否包含对模块卸载的支持
			"dojo-requirejs-api": 1,//是否支持RequireJS。
			"dojo-parser": 1,
			"dojo-mobile-parser": 1,
			"dojo-config-require": 1,//是否可以配置require()
			"config-dojo-loader-catches": 1,//是否 catch 加载模块时的error handling
			//"dom-addeventlistener": 0,///old ie = 0
			"touch": 1,
			//"dojo-bidi" : 0,

			///以下为 dojoConfig
			"host-browser": 1,//确定构建的代码是用于浏览器平台的//设为0才能支持 Rhino
			"dom": 1,//Ensures the DOM code is available.保证DOM 代码可用//设为0才能支持 Rhino
			"dojo-amd-factory-scan": 1,//是否扫描所有的模块对AMD的支持
			"dojo-loader": 1,//是否使得加载器是可用的
			"dojo-has-api": 1,//是否使得 has 功能检测API 是可用的
			"dojo-inject-api": 1,//是否支持跨域加载模块
			"dojo-timeout-api": 1,//Disables code dealing with modules that don’t load.？//设为0才能支持 Rhino
			"dojo-trace-api": 1,//Disables the tracing of module loading.是否跟踪模块加载过程
			"dojo-log-api": 1,//是否记录加载器的日志？
			"dojo-dom-ready-api": 1,//是否保证 DOM ready API 是可用的//设为0才能支持 Rhino
			"dojo-publish-privates": 1,//是否显示加载器的一些内部信息
			"dojo-config-api": 1,//是否保证 build 是可以配置的
			"dojo-sniff": 1,//是否当从一个CDN加载模块的时候，启用一些老式的模块加载行为？//设为0才能支持 Rhino
			"dojo-sync-loader": 1,//是否支持同步加载器
			"dojo-test-sniff": 1,//Disables some features for testing purposes.是否包含测试代码
			"config-deferredInstrumentation": 1,//是否自动加载那些会报告un-handled rejected promises的代码
			"config-tlmSiblingOfDojo": 1//是否支持非标准的模块解析代码
		},

		packages:[{///需要 build 系统处理的内容
			name: "dojo",
			location: "dojo"///相对于 basePath
		},{
			name: "dijit",
			location: "dijit"///相对于 basePath
		},{
			name: "dojox",
			location: "dojox"///相对于 basePath
		},{
			name: "rias",
			location: "../../RSServer/jssrc/rias-1.0.0",///相对于 basePath
			main: "rias"
		}],

		///非常重要：鉴于 declare.extend 不能 extend ctor.base，不能引入需要 rias.hack 后的子类。
		layers: {/// build 系统处理后生成的打包文件，一个 layer 对应一个文件。
			"dojo/dojo": {
				include: [///合并到打包后的文件
					"dojo/_base/kernel",
					"dojo/_base/declare",
					"dojo/_base/sniff",
					"dojo/_base/lang",
					"dojo/_base/config",
					"dojo/_base/array",
					"dojo/_base/Deferred",
					"dojo/_base/loader",
					"dojo/_base/unload",
					"dojo/_base/url",
					"dojo/_base/json",
					"dojo/_base/Color",
					"dojo/main",
					"dojo/has",
					"dojo/sniff",
					"dojo/i18n",

					"dojo/cache",
					"dojo/errors/create",
					"dojo/errors/CancelError",
					"dojo/number",
					"dojo/currency",
					"dojo/string",
					"dojo/aspect",
					"dojo/Deferred",
					"dojo/promise/tracer",
					"dojo/promise/Promise",
					"dojo/promise/instrumentation",
					"dojo/promise/all",
					"dojo/promise/first",
					"dojo/when",
					"dojo/topic",
					"dojo/hash",

					"dojo/cldr/monetary",
					"dojo/cldr/supplemental",
					"dojo/date",
					"dojo/date/locale",
					"dojo/date/stamp",

					"dojo/errors/RequestError",
					"dojo/errors/RequestTimeoutError",

					"dojo/Stateful",
					"dijit/Destroyable",

					"dojo/_base/connect",
					"dojo/_base/event",
					"dojo/_base/window",
					"dojo/window",
					"dojo/on",
					"dojo/touch",
					"dojo/keys",
					"dojo/mouse",
					"dojo/Evented",
					//"dojox/gesture/tap",
					//"dojox/gesture/swipe",

					"dojox/encoding/digests/_base",
					"dojox/encoding/digests/MD5",
					//"dojox/encoding/digests/SHA1",
					//"dojox/encoding/digests/SHA224",
					//"dojox/encoding/digests/SHA256",
					//"dojox/encoding/digests/SHA384",
					//"dojox/encoding/digests/SHA512",
					"dojox/encoding/crypto/_base",
					"dojox/encoding/crypto/SimpleAES",
					//"dojox/encoding/crypto/Blowfish",
					//"dojox/encoding/crypto/RSAKey",
					//"dojox/encoding/compression/lzw",
					//"dojox/encoding/compression/splay",
					//"dojox/encoding/bits",
					//"dojox/encoding/ascii85",
					//"dojox/encoding/easy64",
					"dojox/encoding/base64",

					//"dojo/html",
					//"dojox/html/entities",
					"dojo/parser",
					//"dojo/_base/html",
					"dojo/_base/browser",
					"dojo/dom",
					"dojo/dom-construct",
					"dojo/dom-geometry",
					"dojo/dom-class",
					"dojo/dom-style",
					"dojo/dom-attr",
					"dojo/dom-prop",
					"dojo/dom-form",
					"dojo/NodeList-fx",
					"dojo/hccss",
					"dojo/query",
					"dojo/NodeList-dom",
					"dojo/NodeList-traverse",
					"dojo/ready",
					"dojo/domReady",
					"dojo/cookie",
					//"dojo/throttle",

					//"dojo/dnd/autoscroll",
					//"dojo/dnd/AutoSource",
					//"dojo/dnd/Avatar",
					//"dojo/dnd/common",
					//"dojo/dnd/Container",
					//"dojo/dnd/Manager",
					//"dojo/dnd/move",
					//"dojo/dnd/Moveable",
					//"dojo/dnd/Mover",
					//"dojo/dnd/Selector",
					//"dojo/dnd/Source",
					//"dojo/dnd/Target",
					//"dojo/dnd/TimedMoveable",

					"dojo/_base/xhr",
					"dojo/io-query",
					"dojo/request",
					"dojo/request/util",
					"dojo/request/watch",
					"dojo/request/xhr",
					"dojo/request/notify",
					"dojo/io/iframe",
					"dojo/io/script",

					"dojo/regexp"
				],
				exclude: [///不合并到打包后的文件，即使上面 include 有定义或递归引用
					//"dojo/_base/kernel",
					//"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					//"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				],
				customBase: true,///true 表示强行合并到 dojo/dojo。
				boot: true///同上
			},
			"dijit/main": {
				include: [
					"dojo/dnd/autoscroll",
					"dojo/dnd/AutoSource",
					"dojo/dnd/Avatar",
					"dojo/dnd/common",
					"dojo/dnd/Container",
					"dojo/dnd/Manager",
					"dojo/dnd/move",
					"dojo/dnd/Moveable",
					"dojo/dnd/Mover",
					"dojo/dnd/Selector",
					"dojo/dnd/Source",
					"dojo/dnd/Target",
					"dojo/dnd/TimedMoveable",

					"dojo/_base/fx",
					"dojo/fx",
					"dojo/fx/easing",
					"dojo/fx/Toggler",
					"dojox/fx/_base",
					"dojox/fx/split",
					"dojox/fx/flip",
					"dojox/fx/scroll",

					//"dijit/_base",///废弃
					//"dijit/_base/manager",///废弃，但是很多地方在用 dijit.defaultDuration
					//"dijit/_base/focus",///废弃，同上

					"dijit/_WidgetBase",
					"dijit/_Widget",
					"dijit/_Container",
					"dijit/_Contained",
					"dijit/_CssStateMixin",
					"dijit/_KeyNavMixin",
					"dijit/_KeyNavContainer",
					"dijit/_FocusMixin",
					"dijit/_OnDijitClickMixin",
					//"dijit/_Templated",///废弃
					"dijit/_TemplatedMixin",
					"dijit/_WidgetsInTemplateMixin",
					//"dijit/_PaletteMixin",

					"dijit/typematic",

					"dijit/registry",
					"dijit/a11y",
					"dijit/a11yclick",

					"dijit/focus",
					"dijit/hccss",
					"dijit/place",
					"dijit/popup",
					"dijit/selection",
					"dijit/Viewport",
					//"dijit/layout/utils",

					//"dijit/form/_AutoCompleterMixin",
					//"dijit/_HasDropDown",
					//"dijit/form/_ButtonMixin",
					//"dijit/form/_FormMixin",
					//"dijit/form/_FormValueMixin",
					//"dijit/form/_FormValueWidget",
					//"dijit/form/_FormWidget",
					//"dijit/form/_FormWidgetMixin",
					//"dijit/form/Form",
					//"dijit/form/Button",
					//"dijit/form/ValidationTextBox",

					//"dijit/tree/_dndContainer",
					//"dijit/tree/_dndSelector",
					//"dijit/Tree",
					//"dijit/DialogUnderlay",
					//"dijit/TooltipDialog",
					//"dijit/Menu",
					//"dijit/MenuBar",
					//"dijit/MenuBarItem",
					//"dijit/MenuSeparator",
					//"dijit/PopupMenuItem",
					//"dijit/PopupMenuBarItem",
					//"dijit/Toolbar",
					//"dijit/ToolbarSeparator",
					"dijit/Tooltip"
				],
				exclude: [
					"dojo/dojo"//,
					//"dojo/_base/kernel",
					//"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					//"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				]
			},
			 /*"dijit/Editor": {
				include: [
					"dijit/_editor/plugins/AlwaysShowToolbar",
					"dijit/_editor/plugins/FullScreen",
					"dijit/_editor/plugins/NewPage",
					"dijit/_editor/plugins/Print",
					"dijit/_editor/plugins/ViewSource",
					"dijit/_editor/plugins/FontChoice",
					"dijit/_editor/plugins/EnterKeyHandling",
					"dijit/_editor/plugins/ToggleDir",
					"dijit/_editor/plugins/LinkDialog",
					"dijit/_editor/plugins/TabIndent",
					"dojox/editor/plugins/ResizeTableColumn",
					"dojox/editor/plugins/AutoSave",
					"dojox/editor/plugins/AutoUrlLink",
					"dojox/editor/plugins/BidiSupport",
					"dojox/editor/plugins/Blockquote",
					"dojox/editor/plugins/Breadcrumb",
					"dojox/editor/plugins/CollapsibleToolbar",
					"dojox/editor/plugins/EntityPalette",
					"dojox/editor/plugins/FindReplace",
					"dojox/editor/plugins/InsertAnchor",
					"dojox/editor/plugins/InsertEntity",
					"dojox/editor/plugins/LocalImage",
					"dojox/editor/plugins/NormalizeIndentOutdent",
					"dojox/editor/plugins/NormalizeStyle",
					"dojox/editor/plugins/PageBreak",
					"dojox/editor/plugins/PasteFromWord",
					"dojox/editor/plugins/PrettyPrint",
					"dojox/editor/plugins/Preview",
					"dojox/editor/plugins/SafePaste",
					"dojox/editor/plugins/Save",
					"dojox/editor/plugins/ShowBlockNodes",
					"dojox/editor/plugins/Smiley",
					"dojox/editor/plugins/SpellCheck",
					"dojox/editor/plugins/StatusBar",
					"dojox/editor/plugins/TablePlugins",
					"dojox/editor/plugins/TextColor",
					"dojox/editor/plugins/ToolbarLineBreak",
					"dojox/editor/plugins/UploadImage"
				],
				exclude: [
					"dojo/main",
					"dijit/main",
					"dojo/_base/kernel",
					"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				]
			}*/
			"rias/rias": {
				include: [///合并到打包后的文件
					/*"dojo/_base/kernel",
					"dojo/_base/declare",
					"dojo/_base/sniff",
					"dojo/_base/lang",
					"dojo/_base/config",
					"dojo/_base/array",
					"dojo/_base/Deferred",
					"dojo/_base/loader",
					"dojo/_base/unload",
					"dojo/_base/url",
					"dojo/_base/json",
					"dojo/_base/Color",
					"dojo/main",
					"dojo/has",
					"dojo/sniff",
					"dojo/i18n",

					"dojo/cache",
					"dojo/errors/create",
					"dojo/errors/CancelError",
					"dojo/number",
					"dojo/currency",
					"dojo/string",
					"dojo/aspect",
					"dojo/Deferred",
					"dojo/promise/tracer",
					"dojo/promise/Promise",
					"dojo/promise/instrumentation",
					"dojo/promise/all",
					"dojo/promise/first",
					"dojo/when",
					"dojo/topic",
					"dojo/hash",

					"dojo/cldr/supplemental",
					"dojo/date",
					"dojo/date/locale",
					"dojo/date/stamp",

					"dojo/errors/RequestError",
					"dojo/errors/RequestTimeoutError",

					"dojo/Stateful",
					"dijit/Destroyable",

					"dojo/_base/connect",
					"dojo/_base/event",
					"dojo/_base/window",
					"dojo/window",
					"dojo/on",
					"dojo/touch",
					"dojo/keys",
					"dojo/mouse",
					"dojo/Evented",
					//"dojox/gesture/tap",
					//"dojox/gesture/swipe",

					"dojox/encoding/digests/_base",
					"dojox/encoding/digests/MD5",
					//"dojox/encoding/digests/SHA1",
					//"dojox/encoding/digests/SHA224",
					//"dojox/encoding/digests/SHA256",
					//"dojox/encoding/digests/SHA384",
					//"dojox/encoding/digests/SHA512",
					"dojox/encoding/crypto/_base",
					"dojox/encoding/crypto/SimpleAES",
					//"dojox/encoding/crypto/Blowfish",
					//"dojox/encoding/crypto/RSAKey",
					//"dojox/encoding/compression/lzw",
					//"dojox/encoding/compression/splay",
					//"dojox/encoding/bits",
					//"dojox/encoding/ascii85",
					//"dojox/encoding/easy64",
					"dojox/encoding/base64",

					//"dojo/html",
					"dojox/html/entities",
					"dojo/parser",
					//"dojo/_base/html",
					"dojo/_base/browser",
					"dojo/dom",
					"dojo/dom-construct",
					"dojo/dom-geometry",
					"dojo/dom-class",
					"dojo/dom-style",
					"dojo/dom-attr",
					"dojo/dom-prop",
					"dojo/dom-form",
					"dojo/NodeList-fx",

					"dojo/query",
					"dojo/NodeList-dom",
					"dojo/NodeList-traverse",
					"dojo/ready",
					"dojo/domReady",
					"dojo/cookie",
					//"dojo/throttle",

					"dojo/dnd/autoscroll",
					"dojo/dnd/AutoSource",
					"dojo/dnd/Avatar",
					"dojo/dnd/common",
					"dojo/dnd/Container",
					"dojo/dnd/Manager",
					"dojo/dnd/move",
					"dojo/dnd/Moveable",
					"dojo/dnd/Mover",
					"dojo/dnd/Selector",
					"dojo/dnd/Source",
					"dojo/dnd/Target",
					"dojo/dnd/TimedMoveable",

					"dojo/_base/xhr",
					"dojo/io-query",
					"dojo/request",
					"dojo/request/util",
					"dojo/request/watch",
					"dojo/request/xhr",
					"dojo/request/notify",
					"dojo/io/iframe",
					"dojo/io/script",

					"dojo/regexp",

					"dojo/_base/fx",
					"dojo/fx",
					"dojo/fx/easing",
					"dojo/fx/Toggler",
					"dojox/fx/_base",
					"dojox/fx/split",
					"dojox/fx/flip",
					"dojox/fx/scroll",

					//"dijit/_base",///废弃
					//"dijit/_base/manager",///废弃，但是很多地方在用 dijit.defaultDuration
					//"dijit/_base/focus",///废弃，同上

					"dijit/_WidgetBase",
					"dijit/_Widget",
					"dijit/_Container",
					"dijit/_Contained",
					"dijit/_CssStateMixin",
					"dijit/_KeyNavMixin",
					"dijit/_KeyNavContainer",
					"dijit/_FocusMixin",
					"dijit/_OnDijitClickMixin",
					//"dijit/_Templated",///废弃
					"dijit/_TemplatedMixin",
					"dijit/_WidgetsInTemplateMixin",
					"dijit/_PaletteMixin",

					"dijit/typematic",

					"dijit/registry",
					"dijit/a11y",
					"dijit/a11yclick",

					"dijit/focus",
					"dijit/hccss",
					"dijit/place",
					"dijit/popup",
					"dijit/selection",
					"dijit/Viewport",
					"dijit/layout/utils",

					"dijit/form/_AutoCompleterMixin",
					"dijit/_HasDropDown",
					"dijit/form/_ButtonMixin",
					"dijit/form/_FormMixin",
					"dijit/form/_FormValueMixin",
					"dijit/form/_FormValueWidget",
					"dijit/form/_FormWidget",
					"dijit/form/_FormWidgetMixin",
					//"dijit/form/Form",
					//"dijit/form/Button",
					//"dijit/form/ValidationTextBox",

					//"dijit/tree/_dndContainer",
					//"dijit/tree/_dndSelector",
					//"dijit/Tree",
					//"dijit/DialogUnderlay",
					//"dijit/TooltipDialog",
					//"dijit/Menu",
					//"dijit/MenuBar",
					//"dijit/MenuBarItem",
					//"dijit/MenuSeparator",
					//"dijit/PopupMenuItem",
					//"dijit/PopupMenuBarItem",
					//"dijit/Toolbar",
					//"dijit/ToolbarSeparator",
					"dijit/Tooltip",*/

					//"rias/main",
					"rias/riasw/riaswMappers",
					"rias/riasw/layout/DialogPanel",
					"rias/riasw/widget/Tooltip",
					"rias/riasw/studio/Module",
					"rias/riasw/studio/App",
					"rias/riasw/studio/DefaultError",
					"rias/riasw/store/MemoryStore",
					"rias/riasw/riastudio",
					"rias/riasw/validate"
				],
				exclude: [
					"dojo/dojo",
					"dijit/main"
					//"dojo/_base/kernel",
					//"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					//"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				]
			}
		}
	};
})();
 