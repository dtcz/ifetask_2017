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
    /*判断是否为空对象*/
    var isEmptyObject = function(target) {
        var key;
        for (key in target) {
            return false;
        }
        return true;
    };
    
    /*合并对象(浅复制)*/
    var extendObject = function() {
        var arg = arguments,
            argLen = arg.length,
            target = arg[0],
            newObj = arg[1],
            isOverRide = (arg[argLen - 1] && typeof arg[argLen - 1] === 'boolean') ? arg[argLen - 1] : false,
            tmp = {},
            i;
        var isArray = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
            //排除将要合并的对象是空对象或者是数组
        if (argLen == 0 || (typeof arg[0] !== 'object') || isEmptyObject(newObj) || (isArray(arg[0]))) {
            return target;
        }
        for (i in target) {
            if (target.hasOwnProperty(i)) {
                if (isOverRide) {
                    for (var m in newObj) {
                        if (newObj.hasOwnProperty(m)) {
                            if (i == m) {
                                target[i] = newObj[m];
                            }
                        }
                    }
                } else {
                    tmp[i] = target[i];
                    for (var k in newObj) {
                        if (newObj.hasOwnProperty(k)) {
                            if (i == k) {
                                tmp[i] = newObj[k];
                            } else {
                                tmp[k] = newObj[k];
                            }
                        }
                    }
                }
            }
        }
        return isOverRide ? target : tmp;
    };

    var Drag = function (options){
        var defaults = {
            target: '.drag',            //拖动目标
            parent: '.drag-area',   //拖动目标所在区域
            horizontal: true,                //在水平方向拖动
            vertical: true,                //在垂直方向拖动
            callback: null
        }

        var settings = extendObject(defaults, options),
            target = document.querySelector(settings.target),
            parent = document.querySelector(settings.parent),
            callback = settings.callback,
            horizontal = settings.horizontal,
            vertical = settings.vertical,
            parentWidth = parent.clientWidth,
            parentHeight = parent.clientHeight,
            parentLeft = parent.offsetLeft,
            parentTop = parent.offsetTop,
            targetWidth = target.offsetWidth,
            targetHeight = target.offsetHeight,
            dragStart, dragMove, dragEnd;

        dragStart = function() {
            EventUtil.on(document, 'mousemove', dragMove);
        }

        dragMove = function(event) {
            event = event ? event : window.event;
            var x = 0, y = 0;
            if(horizontal){
                x = Math.min(Math.max(event.clientX - parentLeft- targetWidth/2, -targetWidth/2), parentWidth - targetWidth/2),
                target.style.left = x + 'px';
            }
            if(vertical){
                y = Math.min(Math.max(event.clientY - parentTop - targetHeight/2, -targetHeight/2), parentHeight - targetHeight/2);
                target.style.top = y + 'px';
            }
            if(callback){
                callback.call(this, {
                    x: x + targetWidth/2,
                    y: y + targetHeight/2,
                    w: parentWidth,
                    h: parentHeight
                });
            }
        }

        dragEnd = function() {
            EventUtil.remove(document, 'mousemove', dragMove);
        }

        EventUtil.on(target, 'mousedown', dragStart);
        EventUtil.on(document, 'mouseup', dragEnd);
    }

    window.Drag = Drag;
})(window);

// create gradient
function createColorSelector(){
    var selector = document.querySelector('.colorselector-bg');
    var selectorCtx = selector.getContext('2d');
    selectorCtx.beginPath();
    var selectorGrd = selectorCtx.createLinearGradient(0, 0, 0, selector.height);
    for (var i = 0; i < 361; i++) {
        selectorGrd.addColorStop(i/360, 'hsl(' + (360 - i) + ', 100%, 50%)');
    };
    selectorCtx.fillStyle = selectorGrd;
    selectorCtx.fillRect(0, 0, 300, 300);
    selectorCtx.closePath();
}

window.onload = function (){
    var colorPicker = document.querySelector('.colorpicker'),
        draggableObj1 = document.querySelector('.drag-1'),
        draggableObj2 = document.querySelector('.drag-2'),
        colorSelector = document.querySelector('.colorselector'),
        colorField = document.querySelector('.colorfield'),
        colorShow = document.querySelector('.colorshow'),
        R = document.getElementById('R'),
        G = document.getElementById('G'),
        B = document.getElementById('B'),
        H = document.getElementById('H'),
        S = document.getElementById('S'),
        L = document.getElementById('L'),
        hex = document.getElementById('hex'),
        colorNow = Color('hsb(0, 100%, 100%)');

    createColorSelector();
    
    var updateValue = function (color){
        R.value = Math.round(color.rgb.red * 255);
        G.value = Math.round(color.rgb.green * 255);
        B.value = Math.round(color.rgb.blue * 255);
        H.value = Math.round(color.hsl.hue * 360);
        S.value = Math.round(color.hsl.saturation * 100);
        L.value = Math.round(color.hsl.lightness * 100);
        hex.value = color.hex;
        colorShow.style.backgroundColor = color.hex;
    }

    var updateView = function (color){
        var h = color.hsb.hue/360,
            s = color.hsb.saturation,
            b = color.hsb.brightness;
        draggableObj1.style.left = colorField.clientWidth * s - 6 + 'px';
        draggableObj1.style.top = colorField.clientHeight * (1-b) - 6 + 'px';
        draggableObj2.style.top = colorSelector.clientHeight * (1-h) - 6 + 'px';
        colorField.style.backgroundColor = 'hsl(' + Math.round(color.hsl.hue*360) + ', 100%, 50%)';
    }

    Drag({
        target: '.drag-1',
        parent: '.colorfield',
        callback: function (data){
            colorNow = Color('hsb(' + Math.round(colorNow.hsb.hue) + ',' + Math.round(data.x*100/data.w) + '%,' + Math.round((data.h - data.y)*100/data.h) +'%)');
            updateValue(colorNow);
        }
    });

    Drag({
        target: '.drag-2',
        parent: '.colorselector',
        horizontal: false,
        callback: function (data){
           colorNow = Color('hsb(' + Math.round((data.h - data.y)*360/data.h) + ',' + Math.round(colorNow.hsb.saturation*100) + '%,' + Math.round(colorNow.hsb.brightness*100) +'%)');
            updateValue(colorNow);
            colorField.style.backgroundColor = 'hsl(' + Math.round(colorNow.hsl.hue*360) + ', 100%, 50%)';
        }
    });

    EventUtil.on(colorField, 'click', function (event){
        var x = event.clientX - this.offsetLeft,
            y = event.clientY - this.offsetTop;
        draggableObj1.style.left = x - draggableObj1.offsetWidth/2 + 'px';
        draggableObj1.style.top = y - draggableObj1.offsetHeight/2 + 'px';
        colorNow = Color('hsb(' + Math.round(colorNow.hsb.hue) + ',' + Math.round(x*100/colorField.clientWidth) + '%,' + Math.round((colorField.clientHeight - y)*100/colorField.clientHeight) +'%)');
        updateValue(colorNow);
    });

    EventUtil.on(colorSelector, 'click', function (event){
        var y = event.clientY - this.offsetTop;
        draggableObj2.style.top = y - draggableObj2.offsetHeight/2 + 'px';
        colorNow = Color('hsb(' + Math.round((this.clientHeight - y)*360/this.clientHeight) + ',' + Math.round(colorNow.hsb.saturation*100) + '%,' + Math.round(colorNow.hsb.brightness*100) +'%)');
        updateValue(colorNow);
        colorField.style.backgroundColor = 'hsl(' + Math.round(colorNow.hsl.hue*360) + ', 100%, 50%)';
    });
    
    EventUtil.delegate(colorPicker, 'input', 'change', function (){
        var colorType = this.parentNode.className;
        switch(colorType){
            case 'rgb':
                colorNow = Color('rgb(' + R.value + ',' + G.value + ',' + B.value + ')');
                break;
            case 'hsl':
                colorNow = Color('hsl(' + H.value + ',' + S.value + ',' + L.value + ')');
                break;
            case 'hex':
                colorNow =  Color('#' + hex.value);
                break;
            default: break;
        }
        updateValue(colorNow);
        updateView(colorNow);
    });
}
