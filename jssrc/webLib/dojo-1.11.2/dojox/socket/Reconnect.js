//>>built
define("dojox/socket/Reconnect",["dojox/socket","dojo/aspect"],function(c,h){c.Reconnect=function(a,b){b=b||{};var e=b.reconnectTime||1E4,k=b.backoffRate||2,d=e,f,g;h.after(a,"onclose",function(b){clearTimeout(f);b.wasClean||a.disconnected(function(){c.replace(a,g=a.reconnect())})},!0);a.disconnected||(a.disconnected=function(a){setTimeout(function(){a();f=setTimeout(function(){2>g.readyState&&(d=e)},e)},d);d*=k});a.reconnect||(a.reconnect=function(){return a.args?c.LongPoll(a.args):c.WebSocket({url:a.URL||
a.url})});return a};return c.Reconnect});
/// Reconnect.js.map