//>>built

define("dojo/errors/create", ["../_base/lang"], function (lang) {
    return function (name, ctor, base, props) {
        base = base || Error;
        var ErrorCtor = function (message) {
            if (base === Error) {
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, ErrorCtor);
                }
                var err = Error.call(this, message), prop;
                for (prop in err) {
                    if (err.hasOwnProperty(prop)) {
                        this[prop] = err[prop];
                    }
                }
                this.message = message;
                this.stack = err.stack;
            } else {
                base.apply(this, arguments);
            }
            if (ctor) {
                ctor.apply(this, arguments);
            }
        };
        ErrorCtor.prototype = lang.delegate(base.prototype, props);
        ErrorCtor.prototype.name = name;
        ErrorCtor.prototype.constructor = ErrorCtor;
        return ErrorCtor;
    };
});

