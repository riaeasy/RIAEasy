
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
				return testResourceRe.test(mid) || mid === "dojo/robot" || mid === "dojo/robotx";
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

		basePath: "../../../js-lib-src/dojo-1.12.2-src",///相对于本文件的路径，接下类的编译都从这里开始计算。关联编译配置的文件位置。
		releaseDir: "../dojo-1.12.2-web-min",///相对于 build.bat 的 basePath（即 build 所用的 dojo 的目录），编译目标目录，编译器会覆盖它发现的一切。
		releaseName: "riaeasy-v2017-b1",///releaseDir 的子目录
		action: "release",//一般就这样写，不要修改。
		//默认值为"shrinksafe"。若该值为false，则关闭压缩。shrinksafe.keeplines, closure, closure.keeplines, comments,comments.keeplines///dojo1.7+建议用closure。
		layerOptimize: "closure",//"comments.keeplines",//"closure",
		//设置那些不是层的模块的压缩设置，默认为false，其他值和layerOptimize相同///dojo1.7+建议用closure。
		optimize: false,//"closure",
		//处理CSS的优化。默认为false。若为comments则去除注释和换行，并连接任何@import命令。其他可选的值有comments.keeplines，剔除注释和连接@import命令，但是保留换行。
		cssOptimize: true,//true,
		//决定编译过程中是否最小化。如果为真则标记为miniExcludes的文件被排除在外就像tests那样，demo和其他元素对于编译不是必需的。默认的为false。
		mini: true,///确定整个编译是否为"mini"， 如果为true, 不会复制标记了miniExclude的文件，如测试，DEMO，以及不需要被编译（复制，最小化）的文件。 默认为false.
		stripConsole: "none",///处理输出代码中的console语名， 默认为"normal", 会删除所有console语句，除了console.error 和 console.warn.最需注意的是，这个特征只在优化级别时才适用。否则它会被忽略。 另外可能的值为"none", "warn" 和"all"
		//selectorEngine: "lite",///标识默认的选择器引擎。这不会直接使代码变小，它确保选择器引擎不包含其他的调用。默认没有设置，Dojo包含两个引擎lite和acme。

		///build 后 dojo 的缺省 config，会导致 build 的结果直接采用这些默认值，如果不是明确用于某个明确项目，不要显式设置。
		defaultConfig: {
			isDebug: 1,
			parseOnLoad: 0,
			async: 1,
			//cacheBust: new Date(),
			waitSeconds: 15,
			//locale: 'zh-cn',
			extraLocale: ['en'],
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
				//"riasw-bidi" : 0,

				///以下为 dojo 缺省的 dojoConfig
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
				"dojo-sniff": 1,//是否包含浏览器探测代码//设为0才能支持 Rhino
				"dojo-sync-loader": 1,//是否支持同步加载器
				"dojo-test-sniff": 1,//Disables some features for testing purposes.是否包含浏览器探测代码
				"config-deferredInstrumentation": 1,//是否自动加载那些会报告un-handled rejected promises的代码
				"config-tlmSiblingOfDojo": 1,//是否支持非标准的模块解析代码

				"dojo-built": 1
			},
			packages: [
				//{name: 'dijit', location: '../dijit'},
				//{name: 'dojox', location: '../dojox'},
				//{name: 'rias', location: '../../../RIASServer/weblib/rias', main: "rias"},
				//{name: 'riasw', location: '../../../RIASServer/weblib/riasw'}
				//{name: 'riasd', location: '../../../RIASServer/weblib/riasd', main: "riasd"}
			]
		},

		localeList: 'zh,en',///打包后直接加载的 i18n 包
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
			//"riasw-bidi" : 0,

			///以下为 dojo 缺省的 dojoConfig
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
			"dojo-sync-loader": 1,//是否支持同步加载器，是否禁止使用1.7版本之前的加载器
			"dojo-test-sniff": 0,//Disables some features for testing purposes.是否包含测试代码
			"config-deferredInstrumentation": 1,//是否禁止自动加载dojo/promise/instrumentation模块. 该模块用于监测被拒绝的承诺，将末被处理的错误输出到控制台
			"config-tlmSiblingOfDojo": 1,//是否支持非标准的模块解析代码

			"dojo-built": 1
		},

		packages:[{///需要 build 系统处理的内容
			name: "dojo",
			location: "dojo"///相对于 basePath
		//},{
		//	name: "dijit",
		//	location: "dijit"///相对于 basePath
		//},{
		//	name: "dojox",
		//	location: "dojox"///相对于 basePath
		},{
			name: "rias",
			location: "../../RIASServer/weblib/rias", ///相对于 basePath
			main: "main"
		},{
			name: "riasw",
			location: "../../RIASServer/weblib/riasw", ///相对于 basePath
			main: "main"
		},{
			name: "riasd",
			location: "../../RIASServer/weblib/riasd", ///相对于 basePath
			main: "main"
		},{
			name: "riasbi",
			location: "../../RIASServer/weblib/riasbi", ///相对于 basePath
			main: "main"
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
					//"dojo/_base/unload",
					//"dojo/_base/url",
					"dojo/_base/json",
					"dojo/_base/Color",
					//"dojo/_base/html",
					"dojo/_base/browser",
					"dojo/_base/connect",
					"dojo/_base/event",
					"dojo/_base/window",
					"dojo/main",
					"dojo/has",
					"dojo/sniff",
					"dojo/i18n",
					"dojo/colors",

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

					"dojo/window",
					"dojo/on",
					"dojo/touch",
					"dojo/keys",
					"dojo/mouse",
					"dojo/Evented",

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

					"dojo/parser",
					"dojo/dom",
					"dojo/dom-construct",
					"dojo/dom-geometry",
					"dojo/dom-class",
					"dojo/dom-style",
					"dojo/dom-attr",
					"dojo/dom-prop",
					"dojo/dom-form",
					"dojo/uacss",
					"dojo/hccss",
					"dojo/selector/acme",
					"dojo/selector/lite",
					"dojo/selector/_loader",
					"dojo/query",
					"dojo/NodeList-dom",
					"dojo/NodeList-traverse",
					//"dojo/cookie",
					"dojo/ready",
					"dojo/domReady",

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
					"dojo/dnd/TimedMoveable"
				],
				exclude: [///不合并到打包后的文件，即使上面 include 有定义或递归引用
					//"dojo/_base/kernel",
					//"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					//"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				],
				customBase: true,///true 表示强行合并到 dojo/dojo。
				boot: true///同上
			},
			"rias/riasBase": {
				include: [///合并到打包后的文件
					//"rias/riasBase"
				],
				exclude: [
					"dojo/dojo"
				]
			},
			"rias/encoding": {
				include: [///合并到打包后的文件
				/*	"rias/encoding/digests/_base",
					"rias/encoding/digests/MD5",
					//"rias/encoding/digests/SHA1",
					//"rias/encoding/digests/SHA224",
					//"rias/encoding/digests/SHA256",
					//"rias/encoding/digests/SHA384",
					//"rias/encoding/digests/SHA512",
					"rias/encoding/crypto/_base",
					"rias/encoding/crypto/SimpleAES",
					//"rias/encoding/crypto/Blowfish",
					//"rias/encoding/crypto/RSAKey",
					//"rias/encoding/compression/lzw",
					//"rias/encoding/compression/splay",
					//"rias/encoding/bits",
					//"rias/encoding/ascii85",
					//"rias/encoding/easy64",
					"rias/encoding/base64",
					"rias/encoding"*/
				],
				exclude: [
					"dojo/dojo",
					"rias/riasBase"
				]
			},
			"riasw/riaswBase": {
				include: [///合并到打包后的文件
					"riasw/main"
					//"riasw/riaswBase"
				],
				exclude: [
					"dojo/dojo",
					"rias/riasBase",
					"rias/encoding"
				]
			},
			"riasw/riaswCommon": {
				include: [///合并到打包后的文件
					//"riasw/main",
					//"riasw/riaswBase",

				/*	"riasw/sys/_WidgetBase",
					"riasw/sys/_Gutter",
					"riasw/sys/_Splitter",
					"riasw/sys/ToggleSplitter",
					"riasw/sys/Tag",
					"riasw/sys/ContainerTag",
					"riasw/sys/Label",
					"riasw/sys/TimerLabel",
					"riasw/sys/Module",
					"riasw/sys/Underlay",
					"riasw/sys/Dialog",
					"riasw/sys/Form",
					"riasw/sys/Desktop",
					"riasw/sys/Scene",
					"riasw/sys/DefaultError",
					"riasw/sys/Tooltip",
					"riasw/sys/ToolButton",
					"riasw/sys/Toolbar",
					"riasw/sys/ToolbarSeparator",
					"riasw/sys/ToolbarLineBreak",
					"riasw/sys/Menu",
					"riasw/sys/MenuSeparator",
					"riasw/sys/PopupMenuItem",
					"riasw/sys/RadioMenuItem",
					"riasw/form/ButtonBox",
					"riasw/form/CheckBox",
					"riasw/form/RadioBox",
					"riasw/form/ComboBox",
					"riasw/form/DateTextBox",
					"riasw/form/TimeTextBox",
					"riasw/form/CurrencyTextBox",
					//"riasw/form/TextArea",
					"riasw/form/NumberSpinner",
					"riasw/form/TimeSpinner",
					"riasw/form/ComboButton",
					"riasw/form/RadioButton",
					"riasw/form/Uploader",
					"riasw/form/ProgressBar",
					//"riasw/form/HSlider",
					//"riasw/form/VSlider",
					"riasw/layout/Fieldset",
					"riasw/layout/TablePanel",
					"riasw/layout/AccordionPanel",
					"riasw/layout/TabPanel",
					"riasw/layout/DockBar",
					"riasw/tree/Tree",
					"riasw/tree/TreeModel",
					"riasw/grid/DGrid",
					"riasw/store/MemoryStore",
					"riasw/store/JsonXhrStore",
					"riasw/store/Cache"*/
				],
				exclude: [
					"dojo/dojo",
					"rias/main",
					"rias/encoding",
					"riasw/riaswBase"
				]
			},
			"riasw/editor/HTMLEditor": {
				include: [///合并到打包后的文件
					//"riasw/editor/HTMLEditor"
				],
				exclude: [
					"dojo/dojo",
					"rias/riasBase",
					"rias/encoding",
					"riasw/riaswBase",
					"riasw/riaswCommon"
				]
			},
			"riasd/main": {
				include: [///合并到打包后的文件
					"riasd/main",
					"riasd/riasdMetas",
					"riasd/module/fileSelector",
					"riasd/module/visualEditor"
					//"riasd/riasdBase",

				/*	"riasd/riasdMetas",
					//"riasd/dijitMetas",
					//"riasd/dojoMetas",
					//"riasd/dojoxMetas",
					"riasd/editorMetas",
					"riasd/formMetas",
					"riasd/gridMetas",
					"riasd/layoutMetas",
					"riasd/mobileMetas",
					"riasd/sysMetas",
					"riasd/treeMetas",
					"riasd/widgetMetas",

					"riasd/sys/OutlineTree",
					"riasd/sys/WidgetPalette",
					"riasd/module/fileSelector",
					"riasd/module/visualEditor"*/
				],
				exclude: [
					"dojo/dojo",
					"rias/riasBase",
					"rias/encoding",
					"riasw/riaswBase",
					"riasw/riaswCommon",
					"riasw/tree/Tree",
					"riasw/editor/HTMLEditor"
				]
			},
			"riasbi/riasbiBase": {
				include: [///合并到打包后的文件
					"riasbi/main"
					//"riasbi/riasbiBase"
				],
				exclude: [
					"dojo/dojo",
					"rias/riasBase",
					"rias/encoding",
					"riasw/riaswBase",
					"riasw/riaswCommon",
					"riasw/editor/HTMLEditor",
					"riasd/riasdBase"
				]
			}
		}
	};
})();
 