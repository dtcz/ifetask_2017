"use strict";
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

function addEvent(elem, event, func){
    if(elem.addEventListener){
        elem.addEventListener(event, func, false);
    }else if(elem.attachEvent){
        elem.attachEvent('on'+event, func);
    }
}

function removeEvent(elem, event, func){
    if(elem.removeEventListener){
        elem.removeEventListener(event, func, false);
    }else if(elem.detachEvent){
        elem.detachEvent('on'+event, func);
    }
}

function delegateEvent(element, tag, eventName, listener) {
    var fn = (function (){
        return function (event){
            event = event || window.event;
            var target = event.target || event.srcElement;
            if(target.tagName.toLowerCase() === tag.toLowerCase()){
                return listener.call(target, arguments);
            }
        }
    })();
    addEvent(element, eventName, fn);
}

//拖动，有待改进为插件形式
function drag(target, parent, callback) {
    var parentWidth = parent.clientWidth,
        parentHeight = parent.clientHeight,
        parentLeft = parent.offsetLeft,
        parentTop = parent.offsetTop,
        targetWidth = target.offsetWidth,
        targetHeight = target.offsetHeight;

    var dragMove = function(event) {
        event = event ? event : window.event;
        var x = Math.min(Math.max(event.clientX - parentLeft- targetWidth/2, -targetWidth/2), parentWidth - targetWidth/2),
            y = Math.min(Math.max(event.clientY - parentTop - targetHeight/2, -targetHeight/2), parentHeight - targetHeight/2);
        target.style.left = x + 'px';
        target.style.top = y + 'px';
        if(callback){
            callback(x + targetWidth/2, y + targetHeight/2);
        }
    }

    var dragStart = function() {
        addEvent(document, 'mousemove', dragMove);
    }

    var dragEnd = function() {
        removeEvent(document, 'mousemove', dragMove);
    }

    addEvent(target, 'mousedown', dragStart);
    addEvent(document, 'mouseup', dragEnd);
}

var buttonHandler = function (){
    
}

window.onload = function (){
    var colorPicker = document.querySelector('.colorpicker'),
        draggableObj1 = document.querySelectorAll('.drag')[0],
        draggableObj2 = document.querySelectorAll('.drag')[1],
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
    
    var updateColor = function (color){
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

    drag(draggableObj1, colorField, function (x, y){
        colorNow = Color('hsb(' + Math.round(colorNow.hsb.hue) + ',' + Math.round(x*100/colorField.clientWidth) + '%,' + Math.round((colorField.clientHeight - y)*100/colorField.clientHeight) +'%)');
        updateColor(colorNow);
    });

    drag(draggableObj2, colorSelector, function (x, y){
        colorNow = Color('hsb(' + Math.round((colorSelector.clientHeight - y)*360/colorSelector.clientHeight) + ',' + Math.round(colorNow.hsb.saturation*100) + '%,' + Math.round(colorNow.hsb.brightness*100) +'%)');
        updateColor(colorNow);
        colorField.style.backgroundColor = 'hsl(' + Math.round(colorNow.hsl.hue*360) + ', 100%, 50%)';
    });

    addEvent(colorField, 'click', function (event){
        var x = event.clientX - this.offsetLeft,
            y = event.clientY - this.offsetTop;
        draggableObj1.style.left = x - draggableObj1.offsetWidth/2 + 'px';
        draggableObj1.style.top = y - draggableObj1.offsetHeight/2 + 'px';
        colorNow = Color('hsb(' + Math.round(colorNow.hsb.hue) + ',' + Math.round(x*100/colorField.clientWidth) + '%,' + Math.round((colorField.clientHeight - y)*100/colorField.clientHeight) +'%)');
        updateColor(colorNow);
    });

    addEvent(colorSelector, 'click', function (event){
        var x = event.clientX - this.offsetLeft,
            y = event.clientY - this.offsetTop;
        draggableObj2.style.left = x - draggableObj2.offsetWidth/2 + 'px';
        draggableObj2.style.top = y - draggableObj2.offsetHeight/2 + 'px';
        colorNow = Color('hsb(' + Math.round((this.clientHeight - y)*360/this.clientHeight) + ',' + Math.round(colorNow.hsb.saturation*100) + '%,' + Math.round(colorNow.hsb.brightness*100) +'%)');
        updateColor(colorNow);
        colorField.style.backgroundColor = 'hsl(' + Math.round(colorNow.hsl.hue*360) + ', 100%, 50%)';
    });

    //阻止图片拖动
    document.ondragstart = function() {
        return false;
    }
    
    delegateEvent(colorPicker, 'input', 'change', function (){
        var colorType = this.parentNode.className;

        switch(colorType){
            case 'rgb':
                colorNow = Color('rgb(' + R.value + ',' + G.value + ',' + B.value + ')');
                updateColor(colorNow);
                updateView(colorNow);
                break;
            case 'hsl':
                colorNow = Color('hsl(' + H.value + ',' + S.value + ',' + L.value + ')');
                updateColor(colorNow);
                updateView(colorNow);
                break;
            case 'hex':
                colorNow =  Color('#' + hex.value);
                updateColor(colorNow);
                updateView(colorNow);
                break;
            default: break;
        }

    });
}
