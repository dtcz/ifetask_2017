"use strict";
//event module
var EventUtil = (function (){
    var addEvent =  document.addEventListener ? function (elem, eventName, func){ 
            elem.addEventListener(eventName, func, false);
        } : function (elem, eventName, func){
            elem.attachEvent("on" + eventName,func);
        };
    var removeEvent =  document.removeEventListener ? function (elem, eventName, func) {
            elem.removeEventListener(eventName, func, false);
        } : function (elem, eventName, func) {
            elem.detachEvent("on" + eventName, func);
        };
    var delegateEvent = function (element, tag, eventName, listener) {
        var fn = (function (){
            return function (event){
                event = event || window.event;
                var target = event.target || event.srcElement;
                if(target.tagName.toLowerCase() === tag.toLowerCase()){
                    return listener.apply(target, arguments);
                }
            }
        })();
        this.on(element, eventName, fn);
    }
    return {
        on: addEvent,
        remove: removeEvent,
        delegate: delegateEvent
    }
})();

(function (window, undefined){
    var TagCloud = function(options){
        
    }
    TagCloud.prototype = {
        constructor: TagCloud
            
    }
    window.TagCloud = TagCloud;
})(window);

window.onload = function (){
    var tagCloud = new TagCloud({

    });
    tagCloud.start
}
