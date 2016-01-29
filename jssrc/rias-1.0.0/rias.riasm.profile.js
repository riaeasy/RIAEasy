
var profile = (function(){
	return {
		basePath: "../../../../js-lib-src/dojo-1.10.4-src",///相对于本文件的路径，接下类的编译都从这里开始计算。关联编译配置的文件位置。
		releaseDir: "../../RSServer/riasmLib/dojo",///相对于 basePath，编译目标目录，编译器会覆盖它发现的一切。
		releaseName: "",
		action: "release",//一般就这样写，不要修改。
		//默认值为"shrinksafe"。若该值为false，则关闭压缩。shrinksafe.keeplines, closure, closure.keeplines comments,comments.keeplines///dojo1.7+建议用closure。
		layerOptimize: false,//"comments.keeplines",
		//设置那些不是层的模块的压缩设置，默认为false，其他值和layerOptimize相同///dojo1.7+建议用closure。
		optimize: false,//"comments.keeplines",
		//处理CSS的优化。默认为false。若为comments则去除注释和换行，并连接任何@import命令。其他可选的值有comments.keeplines，剔除注释和连接@import命令，但是保留换行。
		cssOptimize: "comments",
		//决定编译过程中是否最小化。如果为真则标记为miniExcludes的文件被排除在外就像tests那样，demo和其他元素对于编译不是必需的。默认的为false。
		mini: true,
		stripConsole: "none",///处理输出代码中的conole语名， 默认为"normal", 会删除所以console语句，除了console.error 和 console.warn.最需注意的是，这个特征只在优化级别时才适用。否则它会被忽略。 另外可能的值为"none", "warn" 和"all"
		//selectorEngine: "lite",///标识默认的选择器引擎。这不会直接使代码变小，它确保选择器引擎不包含其他的调用。默认没有设置，Dojo包含两个引擎lite和acme。

		defaultConfig: {///应用中的 html 中需要的 dojoConfig
			hasCache:{
				"dojo-built": 1,
				"dojo-loader": 1,
				//"config-selectorEngine": "lite",///不能指定 selectorEngine，否则会导致 dojo/selector/_loader 加载 dojo/selector/lite 出错.
				"dom": 1,
				"host-browser": 1
			},
			has: {
				"dojo-publish-privates": 1,
				"dojo-undef-api": 1
			},
			bindEncoding: 'UTF-8',
			isDebug: 1,
			"config-deferredInstrumentation": 1,//是否自动加载那些会报告un-handled rejected promises的代码
			"config-dojo-loader-catches": 1,//是否 catch 加载模块时的error handling
			"dojo-trace-api": 1,//Disables the tracing of module loading.是否跟踪模块加载过程
			//"dojo-log-api": 1,//是否记录加载器的日志？
			parseOnLoad: 1,///mobile 需要同步加载
			async: 1,///mobile 需要同步加载
			//cacheBust: new Date(),
			waitSeconds: 30,
			//locale: 'zh-cn',
			//extraLocale: ['en'],
			packages: [
				{name: 'dijit', location: '../dijit'},
				{name: 'dojox', location: '../dojox'},
				{name: 'rias', location: '../../rias', main: 'rias'},
				{name: 'webApp', location: '../../webApp', main: "webApp"},
				{name: 'act', location: '../../act', main: "act"}
			]
		},

		staticHasFeatures: {//build 时使用的额外的 dojoConfig
			"config-deferredInstrumentation": 1,//是否自动加载那些会报告un-handled rejected promises的代码
			"config-dojo-loader-catches": 1,//是否 catch 加载模块时的error handling
			"config-tlmSiblingOfDojo": 1,//是否支持非标准的模块解析代码
			"dojo-amd-factory-scan": 1,//是否扫描所有的模块对AMD的支持
			"dojo-combo-api": 0,//是否支持一些老式的加载器API
			"dojo-config-api": 1,//是否保证 build 是可以配置的
			"dojo-config-addOnLoad": 1,		// hardcoded to 1 in the source
			"dojo-config-require": 1,//是否可以配置require()
			"dojo-debug-messages": 1,//是否包含检测diagnostic 信息
			"dojo-dom-ready-api": 1,//是否保证 DOM ready API 是可用的//设为0才能支持 Rhino
			"dojo-firebug": 1,//是否为那些没有开发者控制台（developer console）的浏览器启用firebug lite (e.g. IE6)
			"dojo-guarantee-console": 1,//是否使那些不能使用控制台的浏览器可以使用console(e.g. IE6)
			"dojo-has-api": 1,//是否使得 has 功能检测API 是可用的
			"dojo-inject-api": 1,//是否支持跨域加载模块
			"dojo-loader": 1,//是否使得加载器是可用的
			"dojo-log-api": 1,//是否记录加载器的日志？
			"dojo-modulePaths": 1,//是否支持那些和加载模块相关的老式API
			"dojo-moduleUrl": 1,//是否那些和加载模块相关的老式API
			"dojo-publish-privates": 1,//是否显示加载器的一些内部信息
			"dojo-requirejs-api": 1,//是否支持RequireJS。
			"dojo-sniff": 1,//是否当从一个CDN加载模块的时候，启用一些老式的模块加载行为？//设为0才能支持 Rhino
			//"dojo-sync-loader": 1,//是否采用同步加载器
			"dojo-test-sniff": 1,//Disables some features for testing purposes.是否包含测试代码
			"dojo-timeout-api": 1,//Disables code dealing with modules that don’t load.？//设为0才能支持 Rhino
			"dojo-trace-api": 1,//Disables the tracing of module loading.是否跟踪模块加载过程
			"dojo-undef-api": 1,//是否包含对模块卸载的支持
			"dojo-v1x-i18n-Api": 1,//启动对v1.x 国际化加载的支持 （ Dijit需要使用）
			"dojo-xhr-factory": 1,///Rhino需要设为0
			"dom": 1,//Ensures the DOM code is available.保证DOM 代码可用//设为0才能支持 Rhino
			"host-browser": 1,//确定构建的代码是用于浏览器平台的//设为0才能支持 Rhino
			"host-rhino": 0,
			"host-node": 0,
			"extend-dojo": 1,//Ensures pre-Dojo 2.0 behavior is maintained.保证  pre-Dojo 2.0行为是被维护的。

			//"dom-addeventlistener": 0,///old ie = 0
			"touch": 1,
			"dojo-bidi" : 0,
			"dojo-parser": 1,
			"dojo-mobile-parser": 1,

			// Other configuration switches that are hardcoded in the source.
			// Setting some of these to false may reduce code size, but unclear what they all mean.
			"config-publishRequireResult": true,
			"dojo-gettext-api": true,			// apparently unused
			"dojo-loader-eval-hint-url": true,

			// Browser flags
			"webkit": true,	// this is actually a number like 525 but I don't think anyone is using it
			"air": false,
			"ff": undefined,
			"mozilla": undefined,
			"ie": undefined,

			// Configuration settings
			//"config-selectorEngine": "lite",
			"dijit-legacy-requires": false,		// don't load unrequested modules for back-compat
			"dom-quirks": false,				// we assume/require that the app is in strict mode
			"quirks": false,					// we assume/require that the app is in strict mode

			// Flags for old IE browser bugs / non-standard behavior
			"array-extensible": true,		// false for old IE
			"bug-for-in-skips-shadowed": 0,	// false for old IE
			"dom-attributes-explicit": true,	// everyone except IE6, 7
			"dom-attributes-specified-flag": true,	//everyone except IE6-8
			"dom-addeventlistener": true,		// everyone except IE
			"native-xhr": true,			// has XMLHTTPRequest
			"ie-event-behavior": undefined,
			"dojo-force-activex-xhr": false,	// true is for IE path

			// Flags for features
			"dom-matches-selector": true,
			"dom-qsa": true,
			"dom-qsa2.1": true,
			"dom-qsa3": true,
			"json-parse": true,
			"json-stringify": true,

			// Behavior that varies by browser, but is constant across webkit mobile browsers
			"events-keypress-typed": true,		// whether printable characters generate keypress event?
			"events-mouseenter": false,		// this is set by mouse.html but never used
			"highcontrast": false,			// safari always displays background images, even when device in high-contrast mode
			"textarea-needs-help-shrinking": true,
			"css-user-select": "'WebkitUserSelect'"

			// Values which can be different across mobile devices, so intentionally not specified in this list.
			// "event-orientationchange": true,
			// "safari": true,
			// "android": true
			// "wii": true
		},

		packages:[{///需要 build 系统处理的内容
			name: "dojo",
			location: "dojo"///相对于 basePath
		},{
			name: "dijit",
			location: "dijit"///相对于 basePath
		}],

		layers: {/// build 系统处理后生成的打包文件，一个 layer 对应一个文件。
			"dojo/dojo": {
				include: [///合并到打包后的文件
					"dojo/i18n",
					"dojo/_base/kernel",
					"dojo/_base/declare",
					"dojo/_base/sniff",
					"dojo/_base/lang",
					"dojo/_base/config",
					"dojo/_base/array",
					"dojo/_base/Deferred",
					"dojo/_base/loader",
					"dojo/_base/NodeList",
					"dojo/_base/query",
					"dojo/_base/unload",
					"dojo/_base/url",
					"dojo/_base/json",
					"dojo/_base/Color",
					"dojo/_base/connect",
					"dojo/_base/window",
					"dojo/window",
					"dojo/_base/event",
					"dojo/_base/html",
					"dojo/_base/browser",
					"dojo/_base/xhr",
					"dojo/_base/fx",

					"dojo/regexp",
					"dojo/has",
					"dojo/sniff",

					"dojo/cache",
					"dojo/errors/create", // createError
					"dojo/number",
					"dojo/string",
					"dojo/aspect",
					"dojo/Deferred",
					"dojo/promise/all",
					"dojo/when",
					"dojo/topic",

					"dojo/dom",
					"dojo/dom-construct",
					"dojo/dom-geometry",
					"dojo/dom-class",
					"dojo/dom-style",
					"dojo/dom-attr",
					"dojo/dom-prop",

					//"dojo/selector/_loader",
					//"dojo/selector/lite",

					"dojo/parser",
					"dojo/query",
					"dojo/ready",
					"dojo/cookie",

					"dojo/on",
					"dojo/touch",
					"dojo/keys",
					"dojo/mouse",

					"dojo/fx",
					"dojo/fx/easing",
					"dojo/fx/Toggler"
				],
				exclude: [///不合并到打包后的文件，即使上面 include 有定义或递归引用
					//"dojo/_base/kernel",
					//"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					//"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				],
				customBase: true,///最好只把 dojo/dojo 设为 customBase，未做深入解析。
				boot: true///同上
			},
			"dijit/dijit": {
				include: [
					"dijit/_base",
					"dijit/_base/focus",
					"dijit/_base/manager",
					"dijit/_base/place",
					"dijit/_base/popup",
					"dijit/_base/scroll",
					"dijit/_base/sniff",
					"dijit/_base/typematic",
					"dijit/_base/wai",
					"dijit/_base/window"
				],
				exclude: [
					"dojo/dojo"//,
					//"dojo/_base/kernel",
					//"dojo/on",///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
					//"dojo/request/watch"///has!dom-addeventlistener 需要检测浏览器，不能预先设定值
				]
			}
		}
	};
})();
 