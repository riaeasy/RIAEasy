//>>built

define("dojo/errors/RequestError", ["./create"], function (create) {
    return create("RequestError", function (message, response) {
        this.response = response;
    });
});

