//>>built

define("dojox/secure/capability", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.secure.capability");
    dojox.secure.badProps = /^__|^(apply|call|callee|caller|constructor|eval|prototype|this|unwatch|valueOf|watch)$|__$/;
    dojox.secure.capability = {keywords:["break", "case", "catch", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "false", "finally", "for", "function", "if", "in", "instanceof", "new", "null", "yield", "return", "switch", "throw", "true", "try", "typeof", "var", "void", "while"], validate:function (script, safeLibraries, safeGlobals) {
        var keywords = this.keywords;
        for (var i = 0; i < keywords.length; i++) {
            safeGlobals[keywords[i]] = true;
        }
        var badThis = "|this| keyword in object literal without a Class call";
        var blocks = [];
        if (script.match(/[\u200c-\u200f\u202a-\u202e\u206a-\u206f\uff00-\uffff]/)) {
            throw new Error("Illegal unicode characters detected");
        }
        if (script.match(/\/\*@cc_on/)) {
            throw new Error("Conditional compilation token is not allowed");
        }
        script = script.replace(/\\["'\\\/bfnrtu]/g, "@").replace(/\/\/.*|\/\*[\w\W]*?\*\/|("[^"]*")|('[^']*')/g, function (t) {
            return t.match(/^\/\/|^\/\*/) ? " " : "0";
        }).replace(/\.\s*([a-z\$_A-Z][\w\$_]*)|([;,{])\s*([a-z\$_A-Z][\w\$_]*\s*):/g, function (t, prop, prefix, key) {
            prop = prop || key;
            if (/^__|^(apply|call|callee|caller|constructor|eval|prototype|this|unwatch|valueOf|watch)$|__$/.test(prop)) {
                throw new Error("Illegal property name " + prop);
            }
            return (prefix && (prefix + "0:")) || "~";
        });
        script.replace(/([^\[][\]\}]\s*=)|((\Wreturn|\S)\s*\[\s*\+?)|([^=!][=!]=[^=])/g, function (oper) {
            if (!oper.match(/((\Wreturn|[=\&\|\:\?\,])\s*\[)|\[\s*\+$/)) {
                throw new Error("Illegal operator " + oper.substring(1));
            }
        });
        script = script.replace(new RegExp("(" + safeLibraries.join("|") + ")[\\s~]*\\(", "g"), function (call) {
            return "new(";
        });
        function findOuterRefs(block, func) {
            var outerRefs = {};
            block.replace(/#\d+/g, function (b) {
                var refs = blocks[b.substring(1)];
                for (var i in refs) {
                    if (i == badThis) {
                        throw i;
                    }
                    if (i == "this" && refs[":method"] && refs["this"] == 1) {
                        i = badThis;
                    }
                    if (i != ":method") {
                        outerRefs[i] = 2;
                    }
                }
            });
            block.replace(/(\W|^)([a-z_\$A-Z][\w_\$]*)/g, function (t, a, identifier) {
                if (identifier.charAt(0) == "_") {
                    throw new Error("Names may not start with _");
                }
                outerRefs[identifier] = 1;
            });
            return outerRefs;
        }
        var newScript, outerRefs;
        function parseBlock(t, func, a, b, params, block) {
            block.replace(/(^|,)0:\s*function#(\d+)/g, function (t, a, b) {
                var refs = blocks[b];
                refs[":method"] = 1;
            });
            block = block.replace(/(^|[^_\w\$])Class\s*\(\s*([_\w\$]+\s*,\s*)*#(\d+)/g, function (t, p, a, b) {
                var refs = blocks[b];
                delete refs[badThis];
                return (p || "") + (a || "") + "#" + b;
            });
            outerRefs = findOuterRefs(block, func);
            function parseVars(t, a, b, decl) {
                decl.replace(/,?([a-z\$A-Z][_\w\$]*)/g, function (t, identifier) {
                    if (identifier == "Class") {
                        throw new Error("Class is reserved");
                    }
                    delete outerRefs[identifier];
                });
            }
            if (func) {
                parseVars(t, a, a, params);
            }
            block.replace(/(\W|^)(var) ([ \t,_\w\$]+)/g, parseVars);
            return (a || "") + (b || "") + "#" + (blocks.push(outerRefs) - 1);
        }
        do {
            newScript = script.replace(/((function|catch)(\s+[_\w\$]+)?\s*\(([^\)]*)\)\s*)?{([^{}]*)}/g, parseBlock);
        } while (newScript != script && (script = newScript));
        parseBlock(0, 0, 0, 0, 0, script);
        for (i in outerRefs) {
            if (!(i in safeGlobals)) {
                throw new Error("Illegal reference to " + i);
            }
        }
    }};
});

