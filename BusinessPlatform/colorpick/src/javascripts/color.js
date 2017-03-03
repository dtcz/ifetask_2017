/*
    自己写的插件，有点垃圾，先用着，别细看，我正在完善
 */
(function(window, undefined){
    "use strict";
    //支持十六进制颜色值,RGB,HSL,HSB四种，不支持RGBA,HSLA等
    //调色板与HSB关联，以RGB为核心进行颜色转换
    
    var regHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, //十六进制，类似#000或者#123456
        regRGB = /^(rgb|RGB)/,
        regHSL = /^(hsl|HSL)/,
        regHSB = /^(hsb|HSB)/;

    function Color(color){
        return new Color.prototype.init(color);
    }

    Color.prototype.toHSB = function (){
        if(this.rgb){
            this.hsb = RGBToHSB(this.rgb);
        } else if(this.hsl){
            this.hsb = HSLToHSB(this.hsl);
        } else if(this.hex){
            this.hsb = HexToHSB(this.hex);
        }
        return this;
    }
    Color.prototype.toRGB = function (){
        if(this.hsb){
            this.rgb = HSBToRGB(this.hsb);
        } else if(this.hsl){
            this.rgb = HSLToRGB(this.hsl);
        } else if(this.hex){
            this.rgb = hexToRGB(this.hex);
        }
        return this;
    }
    Color.prototype.toHex = function (){
        if(this.rgb){
           this.hex = RGBToHex(this.rgb);
        } else if(this.hsl){
            this.hex = HSLToHex(this.hsl);
        } else if(this.hsb){
            this.hex = HSBToHex(this.hsb);
        }
        return this;
    }
    Color.prototype.toHSL = function (){
        if(this.rgb){
            this.hsl = RGBToHSL(this.rgb);
        } else if(this.hsb){
            this.hsl = HSBToHSL(this.hsb);
        } else if(this.hex){
            this.hsl = HexToHSL(this.hex);
        }
        return this;
    }

    Color.prototype.init = function (color){
        if(regHSB.test(color)){
            var tColor = color.replace(/(?:\(|\)|hsb)*/ig,"").split(",").map(function (value){
                return parseInt(value, 10);
            });
            this.hsb = {
                hue: tColor[0], 
                saturation: tColor[1]/100,
                brightness: tColor[2]/100
            }
            this.toRGB().toHex().toHSL();
        } else if(regRGB.test(color)){
            var tColor = color.replace(/(?:\(|\)|rgb)*/ig,"").split(",").map(function (value){
                return parseInt(value, 10)/255;
            });
            this.rgb = {
                red: tColor[0],
                green: tColor[1],
                blue: tColor[2]
            }
            this.toHex().toHSL().toHSB();
        } else if(regHex.test(color)){
            this.hex = hexFormat(color);
            this.toRGB().toHSL().toHSB();
        } else if(regHSL.test(color)){
            var tColor = color.replace(/(?:\(|\)|hsl)*/ig,"").split(",").map(function (value){
                return parseInt(value, 10);
            });
            this.hsl = {
                hue: tColor[0]/360,
                saturation: tColor[1]/100,
                lightness: tColor[2]/100
            }
            this.toRGB().toHex().toHSB();
        }else {
            return false;
        }
    }

    Color.prototype.init.prototype = Color.prototype;

    function RGBToHex(rgb){
        var strHex = "#";
        for(var i in rgb){
            var hex = Math.round(rgb[i]*255).toString(16);
            strHex += hex.length === 1 ? '0' + hex : hex;
        }
        return strHex;
    }

    function RGBToHSL(rgb){
        var r = rgb.red,
            g = rgb.green,
            b = rgb.blue,
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            h, s,
            l = (max + min) / 2;

        if(max == min){
            h = s = 0;
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            hue: h,
            saturation: s,
            lightness: l
        }
    }

    function RGBToHSB(rgb){
        var min = Math.min(rgb.red, rgb.green, rgb.blue), 
            max = Math.max(rgb.red, rgb.green, rgb.blue),
            delta = delta = max - min,
            hsb = {};

        hsb.brightness = max;

        if( delta == 0 ) { // white, grey, black
            hsb.hue = hsb.saturation = 0;
        } else { // chroma
            hsb.saturation = delta / max;
            if( rgb.red == max ) {
                hsb.hue = (rgb.green - rgb.blue )/delta; // between yellow & magenta
            }
            else if( rgb.green == max ) {
                hsb.hue = 2 + (rgb.blue - rgb.red )/delta; // between cyan & yellow
            }
            else {
                hsb.hue = 4 + (rgb.red - rgb.green)/delta; // between magenta & cyan
            }
        }
        hsb.hue = ((hsb.hue * 60) + 360) % 360;
        return hsb;
    }

    function hexFormat(color){
        if(color.length === 4){
            var strHex = "#";
            for(var i = 1; i < color.length; i++){
                strHex += (color[i] + color[i]);
            }
            color = strHex;
        }
        return color;
    }
    
    function hexToRGB(hex){
        hex = hexFormat(hex.toLowerCase());
        var tColor = [];
        for(var i = 1; i < 7; i += 2){
            tColor.push(parseInt("0x" + hex.slice(i, i + 2), 16)/255);
        }
        return {
            red: tColor[0],
            green: tColor[1],
            blue: tColor[2]
        }
    }
    function hexToHSL(hex){
        RGBToHSL(hexToRGB(hex));
    }
    function hexToHSB(hex){
        RGBToHSB(hexToRGB(hex));
    }

    function HSBToRGB(hsb){
        var rgb = {},
            h = hsb.hue/60%6,
            i = Math.floor(h),
            f = h - i,
            p = hsb.brightness * (1 - hsb.saturation),
            q = hsb.brightness * (1 - hsb.saturation * f),
            t = hsb.brightness * (1 - hsb.saturation * (1 - f));

        switch(i) {
            case 0:
                rgb.red = hsb.brightness;
                rgb.green = t;
                rgb.blue = p;
                break;
            case 1:
                rgb.red = q;
                rgb.green = hsb.brightness;
                rgb.blue = p;
                break;
            case 2:
                rgb.red = p;
                rgb.green = hsb.brightness;
                rgb.blue = t;
                break;
            case 3:
                rgb.red = p;
                rgb.green = q;
                rgb.blue = hsb.brightness;
                break;
            case 4:
                rgb.red = t;
                rgb.green = p;
                rgb.blue = hsb.brightness;
                break;
            default:        
                rgb.red = hsb.brightness;
                rgb.green = p;
                rgb.blue = q;
                break;
        }
        return rgb;
    }
    function HSBToHex(hsb){
        RGBToHex(HSBToRGB(hsb));
    }
    function HSBToHSL(hsb){
        RGBToHSL(HSBToRGB(hsb));
    }

    function HSLToRGB(hsl){
        var h = hsl.hue,
            s = hsl.saturation,
            l = hsl.lightness,
            r, g, b;
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function (p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return {
            red: r,
            green: g,
            blue: b
        };
    }
    function HSLToHex(hsl){
        RGBToHex(HSLToRGB(hsl));
    }
    function HSLToHSB(hsl){
        RGBToHSB(HSLToRGB(hsl));
    }


    window.Color = Color;
})(window);

// console.log(Color('hsb(100, 100%, 100%)'));
// console.log(Color('rgb(85, 255, 0)'));
// console.log(Color('#55ff00'));
// console.log(Color('hsl(100, 100%, 50%)'));
