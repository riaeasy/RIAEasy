//>>built
define("dojox/socket/Reconnect",["dojox/socket","dojo/aspect"],function(c,g){c.Reconnect=function(a,b){var d=b.reconnectTime||1E4,e,f;b=b||{};g.after(a,"onclose",function(b){clearTimeout(e);b.wasClean||a.disconnected(function(){c.replace(a,f=a.reconnect())})},!0);a.disconnected||(a.disconnected=function(a){setTimeout(function(){a();e=setTimeout(function(){2>f.readyState&&(d=b.reconnectTime||1E4)},1E4)},d);d*=b.backoffRate||2});a.reconnect||(a.reconnect=function(){return a.args?c.LongPoll(a.args):
c.WebSocket({url:a.URL||a.url})});return a};return c.Reconnect});
/// Reconnect.js.map