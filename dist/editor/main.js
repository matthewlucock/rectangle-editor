(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* MIT license */
var cssKeywords = require('color-name');

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var v;

	if (max === 0) {
		s = 0;
	} else {
		s = (delta / max * 1000) / 10;
	}

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	v = ((max / 255) * 1000) / 10;

	return [h, s, v];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

},{"color-name":4}],2:[function(require,module,exports){
var conversions = require('./conversions');
var route = require('./route');

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;

},{"./conversions":1,"./route":3}],3:[function(require,module,exports){
var conversions = require('./conversions');

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

// https://jsperf.com/object-keys-vs-for-in-with-closure/3
var models = Object.keys(conversions);

function buildGraph() {
	var graph = {};

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};


},{"./conversions":1}],4:[function(require,module,exports){
module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};
},{}],5:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');
var swizzle = require('simple-swizzle');

var reverseNames = {};

// create a list of reverse color names
for (var name in colorNames) {
	if (colorNames.hasOwnProperty(name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var keyword = /(\D+)/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = Math.round((parseInt(hexAlpha + hexAlpha, 16) / 255) * 100) / 100;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			rgb[3] = parseFloat(match[4]);
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		rgb = colorNames[match[1]];

		if (!rgb) {
			return null;
		}

		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d*[\.]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = num.toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}

},{"color-name":4,"simple-swizzle":9}],6:[function(require,module,exports){
'use strict';

var colorString = require('color-string');
var convert = require('color-convert');

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
});

var limiters = {};

function Color(obj, model) {
	if (!(this instanceof Color)) {
		return new Color(obj, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (!obj) {
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			var limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
		var result = {};
		var channels = convert[this.model].channels;
		var labels = convert[this.model].labels;

		for (var i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	dark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	light: function () {
		return !this.dark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		var color1 = this.rgb();
		var color2 = mixinColor.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
		var result;

		if (arguments.length) {
			if (modifier) {
				val = modifier(val);
			}

			result = this[model]();
			result.color[channel] = val;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;

},{"color-convert":2,"color-string":5}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],8:[function(require,module,exports){
'use strict';

module.exports = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};

},{}],9:[function(require,module,exports){
'use strict';

var isArrayish = require('is-arrayish');

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};

},{"is-arrayish":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("../vector");
class Canvas {
    constructor() {
        this.element = document.createElement('canvas');
        this.renderingContext = this.element.getContext('2d');
        this._size = new vector_1.Vector2D();
    }
    get size() {
        return this._size;
    }
    set size(size) {
        size.errorIfNotWithinBounds(new vector_1.Vector2D());
        this._size = size;
        this.element.width = this.size.x;
        this.element.height = this.size.y;
    }
    copy(canvasToCopy) {
        this.renderingContext.drawImage(canvasToCopy.element, 0, 0);
    }
    clear() {
        this.renderingContext.clearRect(0, 0, this.size.x, this.size.y);
    }
}
exports.Canvas = Canvas;

},{"../vector":29}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color = require("color");
const vector_1 = require("../vector");
class CanvasRectangle {
    constructor(canvas) {
        this.canvas = canvas;
        this._position = new vector_1.Vector2D();
        this._size = new vector_1.Vector2D();
        this.strokeWidth = 0;
        this.strokeColor = Color('black');
        this.fill = Color('black');
    }
    get position() {
        return this._position;
    }
    set position(position) {
        position.errorIfNotWithinBounds(new vector_1.Vector2D());
        this._position = position;
    }
    get size() {
        return this._size;
    }
    set size(size) {
        size.errorIfNotWithinBounds(new vector_1.Vector2D());
        this._size = size;
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
    set strokeWidth(strokeWidth) {
        if (strokeWidth < 0) {
            throw new Error('The stroke width must not be negative.');
        }
        this._strokeWidth = strokeWidth;
    }
    draw() {
        const { renderingContext } = this.canvas;
        renderingContext.beginPath();
        renderingContext.rect(this.position.x, this.position.y, this.size.x, this.size.y);
        renderingContext.closePath();
        renderingContext.lineWidth = this.strokeWidth;
        renderingContext.strokeStyle = this.strokeColor.string();
        renderingContext.fillStyle = this.fill.string();
        renderingContext.stroke();
        renderingContext.fill();
    }
}
exports.CanvasRectangle = CanvasRectangle;

},{"../vector":29,"color":6}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EditorControlsCategory {
    constructor(name, controlsElement) {
        this.controlsElement = controlsElement;
        this.nameElement = document.createElement('li');
        this.nameElement.classList.add(EditorControlsCategory.nameElementClassName);
        this.nameElement.textContent = name;
        this.controlsElement.classList.add(EditorControlsCategory.controlsCategoryClassName);
        this.hideControls();
    }
    showControls() {
        this.controlsElement.classList.remove(EditorControlsCategory.hiddenClassName);
    }
    hideControls() {
        this.controlsElement.classList.add(EditorControlsCategory.hiddenClassName);
    }
    showCategory() {
        this.nameElement.classList.remove(EditorControlsCategory.hiddenClassName);
    }
    hideCategory() {
        this.nameElement.classList.add(EditorControlsCategory.hiddenClassName);
        this.hideControls();
    }
    select() {
        this.nameElement.classList.add(EditorControlsCategory.categoryNameSelectedClassName);
        this.showControls();
    }
    deselect() {
        this.nameElement.classList.remove(EditorControlsCategory.categoryNameSelectedClassName);
        this.hideControls();
    }
}
EditorControlsCategory.nameElementClassName = 'editor-controls-category-name';
EditorControlsCategory.categoryNameSelectedClassName = ('editor-controls-category-name-selected');
EditorControlsCategory.controlsCategoryClassName = 'editor-controls-category';
EditorControlsCategory.hiddenClassName = 'editor-controls-hidden';
EditorControlsCategory.controlClassName = 'editor-control';
EditorControlsCategory.textInputClassName = 'editor-control-text-input';
EditorControlsCategory.colorInputClassName = 'editor-control-color-input';
exports.EditorControlsCategory = EditorControlsCategory;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("./utilities");
class EditorControlsManager {
    constructor(toolManager) {
        this.toolManager = toolManager;
        this.controlsContainer = document.getElementById(EditorControlsManager.controlsContainerId);
        this.categoryNamesElement = document.getElementById(EditorControlsManager.categoryNamesElementId);
        this.categories = [];
        this.bindListeners();
    }
    errorIfNotManagingCategory(category) {
        if (!this.categories.includes(category)) {
            throw new utilities_1.UnmanagedControlsCategoryError();
        }
    }
    addCategory(category) {
        this.categoryNamesElement.appendChild(category.nameElement);
        this.controlsContainer.appendChild(category.controlsElement);
        this.categories.push(category);
        category.nameElement.addEventListener('click', () => {
            this.selectCategory(category);
        });
    }
    selectCategory(category) {
        this.errorIfNotManagingCategory(category);
        if (this.selectedCategory === category)
            return;
        if (this.selectedCategory)
            this.selectedCategory.deselect();
        this.selectedCategory = category;
        category.select();
    }
    deselectSelectedCategory() {
        if (!this.selectedCategory)
            throw new Error('No category is selected.');
        this.selectedCategory.deselect();
        this.selectedCategory = undefined;
    }
    hideCategory(category) {
        this.errorIfNotManagingCategory(category);
        if (this.selectedCategory === category)
            this.deselectSelectedCategory();
        category.hideCategory();
    }
    bindListeners() {
        this.toolManager.on('add', tool => {
            tool.controlsCategory.hideCategory();
            this.addCategory(tool.controlsCategory);
        });
        this.toolManager.on('select', tool => {
            tool.controlsCategory.showCategory();
            this.selectCategory(tool.controlsCategory);
        });
        this.toolManager.on('deselect', tool => {
            this.hideCategory(tool.controlsCategory);
        });
    }
}
EditorControlsManager.controlsContainerId = 'editor-controls-container';
EditorControlsManager.categoryNamesElementId = ('editor-controls-category-names');
exports.EditorControlsManager = EditorControlsManager;

},{"./utilities":28}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EditorNavManager {
    constructor(layerManager) {
        this.layerManager = layerManager;
        this.visibilityInput = document.getElementById(EditorNavManager.visibilityInputId);
        this.newImageButton = document.getElementById(EditorNavManager.newImageButtonId);
        this.saveAsButton = document.getElementById(EditorNavManager.saveAsButtonId);
        this.bindListeners();
    }
    hideNav() {
        this.visibilityInput.checked = false;
    }
    bindListeners() {
        this.newImageButton.addEventListener('click', this.newImageButtonCallback.bind(this));
        this.saveAsButton.addEventListener('click', this.saveAsButtonCallback.bind(this));
    }
    newImageButtonCallback() {
        this.layerManager.reset();
        this.hideNav();
    }
    saveAsButtonCallback() {
        let fileName = '';
        do {
            fileName = prompt('Please enter a file name.');
        } while (fileName === '');
        if (fileName === null)
            return;
        this.layerManager.downloadMergedFile(fileName);
        this.hideNav();
    }
}
EditorNavManager.visibilityInputId = 'editor-nav-visibility-input';
EditorNavManager.newImageButtonId = 'editor-nav-new-image-button';
EditorNavManager.saveAsButtonId = 'editor-nav-save-as-button';
EditorNavManager.overlayId = 'editor-nav-overlay';
exports.EditorNavManager = EditorNavManager;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("./utilities");
const layerPaneItem_1 = require("./layerPaneItem");
class LayerPane {
    constructor(layerManager) {
        this.layerManager = layerManager;
        this.element = document.getElementById('layer-pane');
        this.createNewLayerButton = document.getElementById(LayerPane.createNewLayerButtonId);
        this.renameLayerButton = document.getElementById(LayerPane.renameLayerButtonId);
        this.deleteLayerButton = document.getElementById(LayerPane.deleteLayerButtonId);
        this.layerListElement = document.getElementById('layer-list');
        this.items = [];
        this.bindListeners();
    }
    getItemFromLayer(layer) {
        for (const item of this.items) {
            if (item.layer === layer)
                return item;
        }
        throw new utilities_1.UnmanagedLayerError();
    }
    addLayer(layer) {
        const paneItem = new layerPaneItem_1.LayerPaneItem(layer);
        this.items.push(paneItem);
        this.layerListElement.appendChild(paneItem.element);
        paneItem.element.addEventListener('click', () => {
            this.layerManager.select(layer);
        });
    }
    removeLayer(layer) {
        const item = this.getItemFromLayer(layer);
        this.items.splice(this.items.indexOf(item), 1);
        item.delete();
    }
    shiftLayerUp(layer) {
        const item = this.getItemFromLayer(layer);
        this.layerListElement.insertBefore(item.element, item.element.previousElementSibling);
    }
    shiftLayerDown(layer) {
        const item = this.getItemFromLayer(layer);
        this.layerListElement.insertBefore(item.element.nextElementSibling, item.element);
    }
    bindListeners() {
        this.createNewLayerButton.addEventListener('click', this.layerManager.addNewRasterLayer.bind(this.layerManager));
        this.renameLayerButton.addEventListener('click', this.layerManager.renameSelectedLayer.bind(this.layerManager));
        this.deleteLayerButton.addEventListener('click', this.layerManager.removeSelectedLayer.bind(this.layerManager));
        this.layerManager.on('add', this.addLayer.bind(this));
        this.layerManager.on('remove', this.removeLayer.bind(this));
        this.layerManager.on('shift-up', this.shiftLayerUp.bind(this));
        this.layerManager.on('shift-down', this.shiftLayerDown.bind(this));
    }
}
LayerPane.createNewLayerButtonId = 'create-new-layer-button';
LayerPane.renameLayerButtonId = 'rename-layer-button';
LayerPane.deleteLayerButtonId = 'delete-layer-button';
exports.LayerPane = LayerPane;

},{"./layerPaneItem":16,"./utilities":28}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
class LayerPaneItem {
    constructor(layer) {
        this.layer = layer;
        this.element = document.createElement('li');
        this.element.classList.add(LayerPaneItem.paneItemClassName);
        this.visibilityButton = document.createElement('button');
        this.visibilityButton.classList.add(LayerPaneItem.visibilityButtonClassName);
        this.element.appendChild(this.visibilityButton);
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.classList.add(LayerPaneItem.thumbnailContainerClassName);
        this.element.appendChild(thumbnailContainer);
        this.thumbnail = new Image();
        this.thumbnail.classList.add(LayerPaneItem.thumbnailClassName);
        thumbnailContainer.appendChild(this.thumbnail);
        this.nameElement = document.createElement('span');
        this.nameElement.classList.add(LayerPaneItem.nameElementClassName);
        this.element.appendChild(this.nameElement);
        const shiftContainer = document.createElement('div');
        shiftContainer.classList.add(LayerPaneItem.shiftContainerClassName);
        this.element.appendChild(shiftContainer);
        this.shiftUpButton = document.createElement('button');
        this.shiftUpButton.classList.add(LayerPaneItem.shiftUpButtonClassName);
        shiftContainer.appendChild(this.shiftUpButton);
        this.shiftDownButton = document.createElement('button');
        this.shiftDownButton.classList.add(LayerPaneItem.shiftDownButtonClassName);
        shiftContainer.appendChild(this.shiftDownButton);
        const shiftButtons = [this.shiftUpButton, this.shiftDownButton];
        for (const button of shiftButtons) {
            button.classList.add(LayerPaneItem.shiftButtonClassName);
        }
        this.layerListeners = {
            'raster-update': this.updateThumbnail.bind(this),
            resize: this.updateThumbnail.bind(this),
            select: this.select.bind(this),
            deselect: this.deselect.bind(this),
            visibility: this.setVisibilityButtonState.bind(this),
            rename: this.setLayerName.bind(this)
        };
        this.setVisibilityButtonState();
        this.updateThumbnail();
        this.setLayerName();
        this.bindListeners();
    }
    select() {
        this.element.classList.add(LayerPaneItem.selectedClassName);
    }
    deselect() {
        this.element.classList.remove(LayerPaneItem.selectedClassName);
    }
    delete() {
        this.element.remove();
        this.unbindLayerListeners();
    }
    updateThumbnail() {
        const rasterCanvasDataURL = this.layer.rasterCanvas.element.toDataURL();
        this.thumbnail.src = rasterCanvasDataURL;
        const aspectRatio = (this.layer.rasterCanvas.size.x / this.layer.rasterCanvas.size.y);
        const thumbnailSize = LayerPaneItem.maximumThumbnailSize.clone();
        if (this.layer.rasterCanvas.size.x > this.layer.rasterCanvas.size.y) {
            thumbnailSize.y /= aspectRatio;
        }
        else {
            thumbnailSize.x *= aspectRatio;
        }
        this.thumbnail.width = thumbnailSize.x;
        this.thumbnail.height = thumbnailSize.y;
    }
    setLayerName() {
        this.nameElement.textContent = this.layer.name;
    }
    setVisibilityButtonState() {
        this.visibilityButton.classList.toggle(LayerPaneItem.visibilityButtonVisibleClassName, this.layer.visible);
    }
    bindListeners() {
        for (const event of Object.keys(this.layerListeners)) {
            const listener = this.layerListeners[event];
            this.layer.on(event, listener);
        }
        this.visibilityButton.addEventListener('click', this.visibilityButtonClickCallback.bind(this));
        this.shiftUpButton.addEventListener('click', () => {
            this.layer.emit('shift-up');
        });
        this.shiftDownButton.addEventListener('click', () => {
            this.layer.emit('shift-down');
        });
    }
    unbindLayerListeners() {
        for (const event of Object.keys(this.layerListeners)) {
            const listener = this.layerListeners[event];
            this.layer.removeListener(event, listener);
        }
    }
    visibilityButtonClickCallback(event) {
        this.layer.visible = !this.layer.visible;
        event.stopPropagation();
    }
}
LayerPaneItem.paneItemClassName = 'layer-pane-item';
LayerPaneItem.selectedClassName = 'layer-pane-item-selected';
LayerPaneItem.visibilityButtonClassName = ('layer-pane-item-visibility-button');
LayerPaneItem.visibilityButtonVisibleClassName = ('layer-pane-item-visibility-button-visible');
LayerPaneItem.thumbnailContainerClassName = 'layer-thumbnail-container';
LayerPaneItem.thumbnailClassName = 'layer-thumbnail';
LayerPaneItem.nameElementClassName = 'layer-name';
LayerPaneItem.shiftContainerClassName = 'layer-shift-container';
LayerPaneItem.shiftButtonClassName = 'layer-shift-button';
LayerPaneItem.shiftDownButtonClassName = 'layer-shift-down-button';
LayerPaneItem.shiftUpButtonClassName = 'layer-shift-up-button';
LayerPaneItem.maximumThumbnailSize = new vector_1.Vector2D(50, 50);
exports.LayerPaneItem = LayerPaneItem;

},{"./vector":29}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const vector_1 = require("../vector");
const canvas_1 = require("../canvas/canvas");
class Layer extends EventEmitter {
    constructor() {
        super();
        this.container = document.createElement('div');
        this.container.classList.add(Layer.containerClassName);
        this.rasterCanvas = new canvas_1.Canvas();
        this.rasterCanvas.element.classList.add(Layer.rasterCanvasClassName);
        this.container.appendChild(this.rasterCanvas.element);
        this._name = '';
        this._visible = true;
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        this.emit('rename', name);
    }
    get size() {
        return this._size;
    }
    set size(size) {
        size.errorIfNotWithinBounds(new vector_1.Vector2D());
        this._size = size;
        this.rasterCanvas.size = size;
        this.emit('resize');
    }
    get visible() {
        return this._visible;
    }
    set visible(visible) {
        this._visible = visible;
        this.container.classList.toggle(Layer.hiddenClassName, !visible);
        this.emit('visibility');
    }
    copy(layer) {
        this.name = layer.name;
        this.size = layer.size;
        this.visible = layer.visible;
        this.rasterCanvas.copy(layer.rasterCanvas);
    }
}
Layer.containerClassName = 'layer-container';
Layer.hiddenClassName = 'layer-hidden';
Layer.rasterCanvasClassName = 'layer-raster-canvas';
exports.Layer = Layer;

},{"../canvas/canvas":10,"../vector":29,"events":7}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const utilities_1 = require("../utilities");
const vector_1 = require("../vector");
const canvas_1 = require("../canvas/canvas");
const raster_1 = require("./raster");
class LayerManager extends EventEmitter {
    constructor() {
        super();
        this.element = document.createElement('div');
        this.element.id = 'layer-manager';
        this.layers = [];
        this._size = new vector_1.Vector2D();
        this.downloadLink = document.getElementById(LayerManager.downloadLinkId);
    }
    get size() {
        return this._size;
    }
    set size(size) {
        size.errorIfNotWithinBounds(new vector_1.Vector2D());
        this._size = size;
        this.element.style.width = utilities_1.convertNumberToPixelLength(size.x);
        this.element.style.height = utilities_1.convertNumberToPixelLength(size.y);
        for (const layer of this.layers)
            layer.size = size;
    }
    errorIfNotManagingLayer(layer) {
        if (!this.layers.includes(layer))
            throw new utilities_1.UnmanagedLayerError();
    }
    add(layer) {
        layer.size = this.size;
        this.element.insertBefore(layer.container, this.element.firstElementChild);
        this.layers.unshift(layer);
        this.emit('add', layer);
        this.select(layer);
        layer.on('shift-up', () => {
            this.shiftUp(layer);
        });
        layer.on('shift-down', () => {
            this.shiftDown(layer);
        });
    }
    remove(layer) {
        this.errorIfNotManagingLayer(layer);
        const layerPosition = this.layers.indexOf(layer);
        this.layers.splice(layerPosition, 1);
        layer.container.remove();
        this.emit('remove', layer);
        if (!this.layers.length)
            this.addNewRasterLayer();
        if (this.selectedLayer === layer) {
            let nextLayerPositionToSelect = layerPosition;
            if (nextLayerPositionToSelect > 0)
                nextLayerPositionToSelect--;
            this.select(this.layers[nextLayerPositionToSelect]);
        }
    }
    select(layer) {
        this.errorIfNotManagingLayer(layer);
        if (this.selectedLayer === layer)
            return;
        if (this.selectedLayer) {
            this.selectedLayer.emit('deselect');
            this.emit('deselect');
        }
        this.selectedLayer = layer;
        layer.emit('select');
        this.emit('select');
    }
    addNewRasterLayer() {
        const layer = new raster_1.RasterLayer();
        LayerManager.createdRasterLayerCount++;
        layer.name = `Layer ${LayerManager.createdRasterLayerCount}`;
        this.add(layer);
    }
    renameSelectedLayer() {
        const newName = prompt('Please enter a name.');
        this.selectedLayer.name = newName;
    }
    removeSelectedLayer() {
        this.remove(this.selectedLayer);
    }
    generateMergedCanvas() {
        const mergedCanvas = new canvas_1.Canvas();
        mergedCanvas.size = this.size;
        for (const layer of this.layers) {
            if (layer.visible)
                mergedCanvas.copy(layer.rasterCanvas);
        }
        return mergedCanvas;
    }
    downloadMergedFile(fileName) {
        const mergedCanvas = this.generateMergedCanvas();
        this.downloadLink.download = `${fileName}.png`;
        this.downloadLink.href = mergedCanvas.element.toDataURL();
        this.downloadLink.click();
    }
    reset() {
        LayerManager.createdRasterLayerCount = 0;
        for (const layer of this.layers.slice())
            this.remove(layer);
    }
    shiftUp(layer) {
        this.errorIfNotManagingLayer(layer);
        const layerPosition = this.layers.indexOf(layer);
        if (layerPosition === this.layers.length - 1)
            return;
        const nextLayer = this.layers[layerPosition + 1];
        this.layers[layerPosition] = nextLayer;
        this.layers[layerPosition + 1] = layer;
        this.element.insertBefore(nextLayer.container, layer.container);
        this.emit('shift-up', layer);
    }
    shiftDown(layer) {
        this.errorIfNotManagingLayer(layer);
        const layerPosition = this.layers.indexOf(layer);
        if (layerPosition === 0)
            return;
        const previousLayer = this.layers[layerPosition - 1];
        this.layers[layerPosition] = previousLayer;
        this.layers[layerPosition - 1] = layer;
        this.element.insertBefore(layer.container, previousLayer.container);
        this.emit('shift-down', layer);
    }
}
LayerManager.downloadLinkId = 'editor-download-link';
LayerManager.createdRasterLayerCount = 0;
exports.LayerManager = LayerManager;

},{"../canvas/canvas":10,"../utilities":28,"../vector":29,"./raster":19,"events":7}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const rectangle_1 = require("../canvas/rectangle");
class RasterLayer extends layer_1.Layer {
    fill(fillColor) {
        const rectangle = new rectangle_1.CanvasRectangle(this.rasterCanvas);
        rectangle.size = this.size;
        rectangle.fill = fillColor;
        rectangle.draw();
        this.emit('raster-update');
    }
}
exports.RasterLayer = RasterLayer;

},{"../canvas/rectangle":11,"./layer":17}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = require("./layer");
const rectangle_1 = require("../canvas/rectangle");
class RectangleLayer extends layer_1.Layer {
    constructor() {
        super();
        this.name = 'Rectangle';
        this.rectangle = new rectangle_1.CanvasRectangle(this.rasterCanvas);
    }
    get position() {
        return this.rectangle.position;
    }
    set position(position) {
        this.rectangle.position = position;
        this.draw();
    }
    get rectangleSize() {
        return this.rectangle.size;
    }
    set rectangleSize(size) {
        this.rectangle.size = size;
        this.draw();
    }
    get strokeWidth() {
        return this.rectangle.strokeWidth;
    }
    set strokeWidth(strokeWidth) {
        this.rectangle.strokeWidth = strokeWidth;
        this.draw();
    }
    get strokeColor() {
        return this.rectangle.strokeColor;
    }
    set strokeColor(strokeColor) {
        this.rectangle.strokeColor = strokeColor;
        this.draw();
    }
    get fill() {
        return this.rectangle.fill;
    }
    set fill(fill) {
        this.rectangle.fill = fill;
        this.draw();
    }
    draw() {
        this.rasterCanvas.clear();
        this.rectangle.draw();
        this.emit('raster-update');
    }
}
exports.RectangleLayer = RectangleLayer;

},{"../canvas/rectangle":11,"./layer":17}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
const manager_1 = require("./layer/manager");
const layerPane_1 = require("./layerPane");
const editorNavManager_1 = require("./editorNavManager");
const manager_2 = require("./tool/manager");
const toolbar_1 = require("./toolbar");
const editorControlsManager_1 = require("./editorControlsManager");
const rectangle_1 = require("./tool/rectangle");
const bucket_1 = require("./tool/bucket");
const canvasPane = document.getElementById('canvas-pane');
const layerManager = new manager_1.LayerManager();
layerManager.size = new vector_1.Vector2D(500, 500);
canvasPane.appendChild(layerManager.element);
const layerPane = new layerPane_1.LayerPane(layerManager);
const editorNavManager = new editorNavManager_1.EditorNavManager(layerManager);
const toolManager = new manager_2.ToolManager();
const toolbar = new toolbar_1.Toolbar(toolManager);
const editorControlsManager = new editorControlsManager_1.EditorControlsManager(toolManager);
const rectangleTool = new rectangle_1.RectangleTool(layerManager);
toolManager.add(rectangleTool);
const bucketTool = new bucket_1.BucketTool(layerManager);
toolManager.add(bucketTool);
layerManager.addNewRasterLayer();

},{"./editorControlsManager":13,"./editorNavManager":14,"./layer/manager":18,"./layerPane":15,"./tool/bucket":22,"./tool/manager":23,"./tool/rectangle":24,"./toolbar":26,"./vector":29}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color = require("color");
const tool_1 = require("./tool");
const editorControlsCategory_1 = require("../editorControlsCategory");
const raster_1 = require("../layer/raster");
class BucketTool extends tool_1.Tool {
    constructor(layerManager) {
        super();
        this.layerManager = layerManager;
        this.toolbarItemId = 'bucket-toolbar-item';
        const controlsElement = document.createElement('ul');
        const colorContainer = document.createElement('li');
        colorContainer.textContent = 'Color';
        this.colorInput = document.createElement('input');
        this.colorInput.type = 'color';
        this.colorInput.classList.add(editorControlsCategory_1.EditorControlsCategory.colorInputClassName);
        colorContainer.appendChild(this.colorInput);
        const applyButtonContainer = document.createElement('li');
        this.applyButton = document.createElement('button');
        this.applyButton.id = 'apply-bucket-tool-button';
        this.applyButton.classList.add('editor-button');
        this.applyButton.textContent = 'Apply';
        applyButtonContainer.appendChild(this.applyButton);
        const controlElements = [
            colorContainer,
            applyButtonContainer
        ];
        for (const element of controlElements) {
            element.classList.add(editorControlsCategory_1.EditorControlsCategory.controlClassName);
            controlsElement.appendChild(element);
        }
        this.controlsCategory = new editorControlsCategory_1.EditorControlsCategory('Bucket', controlsElement);
        this.bindListeners();
    }
    bindListeners() {
        this.layerManager.on('select', this.layerSelectListener.bind(this));
        this.applyButton.addEventListener('click', this.apply.bind(this));
    }
    layerSelectListener() {
        const selectedLayerIsRasterLayer = (this.layerManager.selectedLayer instanceof raster_1.RasterLayer);
        this.colorInput.disabled = !selectedLayerIsRasterLayer;
        this.applyButton.disabled = !selectedLayerIsRasterLayer;
    }
    apply() {
        if (!(this.layerManager.selectedLayer instanceof raster_1.RasterLayer)) {
            throw new Error('The selected layer must be a raster layer.');
        }
        const fillColor = Color(this.colorInput.value);
        this.layerManager.selectedLayer.fill(fillColor);
    }
}
exports.BucketTool = BucketTool;

},{"../editorControlsCategory":12,"../layer/raster":19,"./tool":25,"color":6}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const utilities_1 = require("../utilities");
class ToolManager extends EventEmitter {
    constructor() {
        super();
        this.tools = [];
    }
    errorIfNotManagingTool(tool) {
        if (!this.tools.includes(tool))
            throw new utilities_1.UnmanagedToolError();
    }
    add(tool) {
        this.tools.push(tool);
        this.emit('add', tool);
    }
    select(tool) {
        this.errorIfNotManagingTool(tool);
        if (this.selectedTool === tool)
            return;
        if (this.selectedTool) {
            this.emit('deselect', this.selectedTool);
            this.selectedTool.emit('deselect');
        }
        this.selectedTool = tool;
        this.emit('select', tool);
        tool.emit('select');
    }
}
exports.ToolManager = ToolManager;

},{"../utilities":28,"events":7}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color = require("color");
const tool_1 = require("./tool");
const editorControlsCategory_1 = require("../editorControlsCategory");
const rectangle_1 = require("../layer/rectangle");
class RectangleTool extends tool_1.Tool {
    constructor(layerManager) {
        super();
        this.layerManager = layerManager;
        this.toolbarItemId = 'rectangle-toolbar-item';
        const controlsElement = document.createElement('ul');
        const createRectangleLayerContainer = document.createElement('li');
        this.createRectangleLayerButton = document.createElement('button');
        this.createRectangleLayerButton.id = 'create-rectangle-layer-button';
        this.createRectangleLayerButton.classList.add('editor-button');
        this.createRectangleLayerButton.textContent = 'Create rectangle layer';
        createRectangleLayerContainer.appendChild(this.createRectangleLayerButton);
        const positionContainer = document.createElement('li');
        positionContainer.textContent = 'Position';
        this.positionXInput = document.createElement('input');
        this.positionXInput.placeholder = 'X';
        positionContainer.appendChild(this.positionXInput);
        this.positionYInput = document.createElement('input');
        this.positionYInput.placeholder = 'Y';
        positionContainer.appendChild(this.positionYInput);
        const sizeContainer = document.createElement('li');
        sizeContainer.textContent = 'Size';
        this.sizeXInput = document.createElement('input');
        this.sizeXInput.placeholder = 'X';
        sizeContainer.appendChild(this.sizeXInput);
        this.sizeYInput = document.createElement('input');
        this.sizeYInput.placeholder = 'Y';
        sizeContainer.appendChild(this.sizeYInput);
        const fillContainer = document.createElement('li');
        fillContainer.textContent = 'Fill';
        this.fillInput = document.createElement('input');
        fillContainer.appendChild(this.fillInput);
        const strokeContainer = document.createElement('li');
        strokeContainer.textContent = 'Stroke';
        this.strokeColorInput = document.createElement('input');
        strokeContainer.appendChild(this.strokeColorInput);
        this.strokeWidthInput = document.createElement('input');
        this.strokeWidthInput.placeholder = 'Width';
        strokeContainer.appendChild(this.strokeWidthInput);
        const controlElements = [
            createRectangleLayerContainer,
            positionContainer,
            sizeContainer,
            fillContainer,
            strokeContainer
        ];
        for (const element of controlElements) {
            element.classList.add(editorControlsCategory_1.EditorControlsCategory.controlClassName);
            controlsElement.appendChild(element);
        }
        const numberInputs = [
            this.positionXInput,
            this.positionYInput,
            this.sizeXInput,
            this.sizeYInput,
            this.strokeWidthInput
        ];
        for (const input of numberInputs) {
            input.type = 'number';
            input.size = 5;
            input.min = '0';
            input.step = '1';
            input.classList.add(editorControlsCategory_1.EditorControlsCategory.textInputClassName);
        }
        const colorInputs = [this.fillInput, this.strokeColorInput];
        for (const input of colorInputs) {
            input.type = 'color';
            input.classList.add(editorControlsCategory_1.EditorControlsCategory.colorInputClassName);
        }
        this.controlsCategory = new editorControlsCategory_1.EditorControlsCategory('Rectangle', controlsElement);
        this.bindListeners();
    }
    bindListeners() {
        this.layerManager.on('select', this.layerSelectListener.bind(this));
        this.createRectangleLayerButton.addEventListener('click', () => {
            this.layerManager.add(new rectangle_1.RectangleLayer());
        });
        this.positionXInput.addEventListener('input', this.positionXInputListener.bind(this));
        this.positionYInput.addEventListener('input', this.positionYInputListener.bind(this));
        this.sizeXInput.addEventListener('input', this.sizeXInputListener.bind(this));
        this.sizeYInput.addEventListener('input', this.sizeYInputListener.bind(this));
        this.fillInput.addEventListener('input', this.fillInputListener.bind(this));
        this.strokeColorInput.addEventListener('input', this.strokeColorInputListener.bind(this));
        this.strokeWidthInput.addEventListener('input', this.strokeWidthInputListener.bind(this));
    }
    layerSelectListener() {
        const numberInputs = [
            this.positionXInput,
            this.positionYInput,
            this.sizeXInput,
            this.sizeYInput,
            this.strokeWidthInput
        ];
        const colorInputs = [this.fillInput, this.strokeColorInput];
        const inputs = [...numberInputs, ...colorInputs];
        const { selectedLayer } = this.layerManager;
        if (selectedLayer instanceof rectangle_1.RectangleLayer) {
            this.positionXInput.value = String(selectedLayer.position.x);
            this.positionYInput.value = String(selectedLayer.position.y);
            this.sizeXInput.value = String(selectedLayer.rectangleSize.x);
            this.sizeYInput.value = String(selectedLayer.rectangleSize.y);
            this.fillInput.value = selectedLayer.fill.hex();
            this.strokeColorInput.value = selectedLayer.strokeColor.hex();
            this.strokeWidthInput.value = String(selectedLayer.strokeWidth);
            for (const input of inputs)
                input.disabled = false;
        }
        else {
            for (const input of inputs)
                input.disabled = true;
            for (const input of numberInputs)
                input.value = "";
            for (const input of colorInputs)
                input.value = "#000000";
        }
    }
    positionXInputListener() {
        if (!this.positionXInput.validity.valid)
            return;
        const position = this.layerManager.selectedLayer.position.clone();
        position.x = Number.parseInt(this.positionXInput.value, 10);
        this.layerManager.selectedLayer.position = position;
    }
    positionYInputListener(event) {
        if (!this.positionYInput.validity.valid)
            return;
        const position = this.layerManager.selectedLayer.position.clone();
        position.y = Number.parseInt(this.positionYInput.value, 10);
        this.layerManager.selectedLayer.position = position;
    }
    sizeXInputListener() {
        if (!this.sizeXInput.validity.valid)
            return;
        const size = this.layerManager.selectedLayer.rectangleSize.clone();
        size.x = Number.parseInt(this.sizeXInput.value, 10);
        this.layerManager.selectedLayer.rectangleSize = size;
    }
    sizeYInputListener() {
        if (!this.sizeYInput.validity.valid)
            return;
        const size = this.layerManager.selectedLayer.rectangleSize.clone();
        size.y = Number.parseInt(this.sizeYInput.value, 10);
        this.layerManager.selectedLayer.rectangleSize = size;
    }
    fillInputListener() {
        const fill = Color(this.fillInput.value);
        this.layerManager.selectedLayer.fill = fill;
    }
    strokeColorInputListener() {
        const strokeColor = Color(this.strokeColorInput.value);
        this.layerManager.selectedLayer.strokeColor = strokeColor;
    }
    strokeWidthInputListener() {
        if (!this.strokeWidthInput.validity.valid)
            return;
        const strokeWidth = Number.parseInt(this.strokeWidthInput.value, 10);
        this.layerManager.selectedLayer.strokeWidth = (strokeWidth);
    }
}
exports.RectangleTool = RectangleTool;

},{"../editorControlsCategory":12,"../layer/rectangle":20,"./tool":25,"color":6}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
class Tool extends EventEmitter {
}
exports.Tool = Tool;

},{"events":7}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toolbarItem_1 = require("./toolbarItem");
class Toolbar {
    constructor(toolManager) {
        this.toolManager = toolManager;
        this.element = document.getElementById('toolbar');
        this.itemsListElement = document.getElementById('toolbar-items');
        this.items = [];
        this.bindListeners();
    }
    addTool(tool) {
        const toolbarItem = new toolbarItem_1.ToolbarItem(tool);
        this.items.push(toolbarItem);
        this.itemsListElement.appendChild(toolbarItem.element);
        toolbarItem.element.addEventListener('click', () => {
            this.toolManager.select(tool);
        });
    }
    bindListeners() {
        this.toolManager.on('add', this.addTool.bind(this));
    }
}
exports.Toolbar = Toolbar;

},{"./toolbarItem":27}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToolbarItem {
    constructor(tool) {
        this.tool = tool;
        this.element = document.createElement('li');
        this.element.id = tool.toolbarItemId;
        this.element.classList.add(ToolbarItem.itemClassName);
        this.bindListeners();
    }
    select() {
        this.element.classList.add(ToolbarItem.selectedClassName);
    }
    deselect() {
        this.element.classList.remove(ToolbarItem.selectedClassName);
    }
    bindListeners() {
        this.tool.on('select', this.select.bind(this));
        this.tool.on('deselect', this.deselect.bind(this));
    }
}
ToolbarItem.itemClassName = 'toolbar-item';
ToolbarItem.selectedClassName = 'toolbar-item-selected';
exports.ToolbarItem = ToolbarItem;

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color = require("color");
exports.transparentBlack = Color('black').alpha(0);
class InvalidVectorError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidVectorError';
    }
}
exports.InvalidVectorError = InvalidVectorError;
class UnmanagedLayerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnmanagedLayerError';
    }
}
exports.UnmanagedLayerError = UnmanagedLayerError;
class UnmanagedToolError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnmanagedToolError';
    }
}
exports.UnmanagedToolError = UnmanagedToolError;
class UnmanagedControlsCategoryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnmanagedControlsCategoryError';
    }
}
exports.UnmanagedControlsCategoryError = UnmanagedControlsCategoryError;
exports.convertNumberToPixelLength = (value) => {
    return `${value}px`;
};

},{"color":6}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("./utilities");
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    get isPositive() {
        return this.x >= 0 && this.y >= 0;
    }
    clone() {
        return new Vector2D(this.x, this.y);
    }
    errorIfNotWithinBounds(lowerBound, upperBound) {
        if (this.x < lowerBound.x || this.y < lowerBound.y) {
            throw new utilities_1.InvalidVectorError();
        }
        if (upperBound && (this.x > upperBound.x || this.y > upperBound.y)) {
            throw new utilities_1.InvalidVectorError();
        }
    }
}
exports.Vector2D = Vector2D;

},{"./utilities":28}]},{},[21]);
