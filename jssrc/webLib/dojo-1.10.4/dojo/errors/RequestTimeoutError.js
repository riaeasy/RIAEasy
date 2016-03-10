//>>built

define("dojo/errors/RequestTimeoutError", ["./create", "./RequestError"], function (create, RequestError) {
    return create("RequestTimeoutError", null, RequestError, {dojoType:"timeout"});
});

