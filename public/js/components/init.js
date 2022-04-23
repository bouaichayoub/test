/*!
 * JavaScript Cookie v2.1.3
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
  var registeredInModuleLoader = false;
  if (typeof define === "function" && define.amd) {
    define(factory);
    registeredInModuleLoader = true;
  }
  if (typeof exports === "object") {
    module.exports = factory();
    registeredInModuleLoader = true;
  }
  if (!registeredInModuleLoader) {
    var OldCookies = window.Cookies;
    var api = (window.Cookies = factory());
    api.noConflict = function () {
      window.Cookies = OldCookies;
      return api;
    };
  }
})(function () {
  function extend() {
    var i = 0;
    var result = {};
    for (; i < arguments.length; i++) {
      var attributes = arguments[i];
      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }
    return result;
  }

  function init(converter) {
    function api(key, value, attributes) {
      var result;
      if (typeof document === "undefined") {
        return;
      }

      // Write

      if (arguments.length > 1) {
        attributes = extend(
          {
            path: "/",
          },
          api.defaults,
          attributes
        );

        if (typeof attributes.expires === "number") {
          var expires = new Date();
          expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e5);
          attributes.expires = expires;
        }

        try {
          result = JSON.stringify(value);
          if (/^[\{\[]/.test(result)) {
            value = result;
          }
        } catch (e) {}

        if (!converter.write) {
          value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
        } else {
          value = converter.write(value, key);
        }

        key = encodeURIComponent(String(key));
        key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
        key = key.replace(/[\(\)]/g, escape);

        return (document.cookie = [
          key,
          "=",
          value,
          attributes.expires ? "; expires=" + attributes.expires.toUTCString() : "", // use expires attribute, max-age is not supported by IE
          attributes.path ? "; path=" + attributes.path : "",
          attributes.domain ? "; domain=" + attributes.domain : "",
          attributes.secure ? "; secure" : "",
        ].join(""));
      }

      // Read

      if (!key) {
        result = {};
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all. Also prevents odd result when
      // calling "get()"
      var cookies = document.cookie ? document.cookie.split("; ") : [];
      var rdecode = /(%[0-9A-Z]{2})+/g;
      var i = 0;

      for (; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        var cookie = parts.slice(1).join("=");

        if (cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }

        try {
          var name = parts[0].replace(rdecode, decodeURIComponent);
          cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

          if (this.json) {
            try {
              cookie = JSON.parse(cookie);
            } catch (e) {}
          }

          if (key === name) {
            result = cookie;
            break;
          }

          if (!key) {
            result[name] = cookie;
          }
        } catch (e) {}
      }

      return result;
    }

    api.set = api;
    api.get = function (key) {
      return api.call(api, key);
    };
    api.getJSON = function () {
      return api.apply(
        {
          json: true,
        },
        [].slice.call(arguments)
      );
    };
    api.defaults = {};

    api.remove = function (key, attributes) {
      api(
        key,
        "",
        extend(attributes, {
          expires: -1,
        })
      );
    };

    api.withConverter = init;

    return api;
  }

  return init(function () {});
});

(function (window, undefined) {
  "use strict";

  /*
    https://developer.mozilla.org/en/docs/Web/API/Element/matches
  */
  if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector;

  /*
    https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String/startsWith
    La mÃ©thode startsWith() renvoie un boolÃ©en indiquant si la chaine de caractÃ¨res commence par la deuxiÃ¨me chaine de caractÃ¨res fournie en argument.
    str.endsWith(chaÃ®neRecherchÃ©e[, position]);
  */
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
    };
  }

  /*
    https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String/endsWith
    La mÃ©thode endsWith() renvoie un boolÃ©en indiquant si la chaine de caractÃ¨res se termine par la deuxiÃ¨me chaine de caractÃ¨res fournie en argument.
    str.startsWith(chaÃ®neRecherchÃ©e [, position]);
  * */
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== "number" || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }

  /*
  https://developer.mozilla.org/fr/docs/Web/API/CustomEvent
  Polyfill pour utiliser la fonctionnalitÃ© Constructor CustomEvent().
  */
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;

  /*
  https://developer.mozilla.org/fr/docs/Web/API/Element/closest
  Polyfill pour element.closest()
  */
  if (!Element.prototype.closest) {
    Element.prototype.closest = function (selector) {
      var el = this;
      while (el.matches && !el.matches(selector)) el = el.parentNode;
      return el.matches ? el : null;
    };
  }

  /*
  https://developer.mozilla.org/fr/docs/Web/API/ChildNode/remove
  Polyfill pour element.remove()
  */
  if (!("remove" in Element.prototype)) {
    Element.prototype.remove = function () {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }

  /*
  https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/isInteger
  Polyfill pour Number.isInteger
  */
  Number.isInteger =
    Number.isInteger ||
    function (value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };

  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/findIndex
  if (!Array.prototype.findIndex && Object.defineProperties) {
    Object.defineProperty(Array.prototype, "findIndex", {
      value: function (predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== "function") {
          throw new TypeError("predicate must be a function");
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, Â« kValue, k, O Â»)).
          // d. If testResult is true, return k.
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return k;
          }
          // e. Increase k by 1.
          k++;
        }

        // 7. Return -1.
        return -1;
      },
      configurable: true,
      writable: true,
    });
  }

  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/find
  if (!Array.prototype.find && Object.defineProperties) {
    Object.defineProperty(Array.prototype, "find", {
      value: function (predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        var len = o.length >>> 0;

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== "function") {
          throw new TypeError("predicate must be a function");
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        var thisArg = arguments[1];

        // 5. Let k be 0.
        var k = 0;

        // 6. Repeat, while k < len
        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, Â« kValue, k, O Â»)).
          // d. If testResult is true, return kValue.
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          }
          // e. Increase k by 1.
          k++;
        }

        // 7. Return undefined.
        return undefined;
      },
      configurable: true,
      writable: true,
    });
  }

  // insertAdjacentElement, insertAdjacentHTML, insertAdjacentText
  if (typeof HTMLElement != "undefined" && !HTMLElement.prototype.insertAdjacentElement) {
    HTMLElement.prototype.insertAdjacentElement = function (where, parsedNode) {
      switch (where) {
        case "beforebegin":
          this.parentNode.insertBefore(parsedNode, this);
          break;
        case "afterbegin":
          console.log("afterBegin", parsedNode, this.firstChild);
          this.insertBefore(parsedNode, this.firstChild);
          break;
        case "beforeend":
          this.appendChild(parsedNode);
          break;
        case "afterend":
          if (this.nextSibling) this.parentNode.insertBefore(parsedNode, this.nextSibling);
          else this.parentNode.appendChild(parsedNode);
          break;
      }
    };

    HTMLElement.prototype.insertAdjacentHTML = function (where, htmlStr) {
      var r = this.ownerDocument.createRange();
      r.setStartBefore(this);
      var parsedHTML = r.createContextualFragment(htmlStr);
      this.insertAdjacentElement(where, parsedHTML);
    };

    HTMLElement.prototype.insertAdjacentText = function (where, txtStr) {
      var parsedText = document.createTextNode(txtStr);
      this.insertAdjacentElement(where, parsedText);
    };
  }

  // https://developer.mozilla.org/fr/docs/Web/API/NodeList/forEach
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  if (!Array.prototype.includes) {
    Array.prototype.includes = function (search) {
      return !!~this.indexOf(search);
    };
  }

  if (!Object.values) {
    Object.values = function (obj) {
      return Object.keys(obj).map(function (e) {
        return obj[e];
      });
    };
  }
})(window);

/******/ (function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/ var installedModules = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/ module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/ __webpack_require__.c = installedModules;
  /******/
  /******/ // define getter function for harmony exports
  /******/ __webpack_require__.d = function (exports, name, getter) {
    /******/ if (!__webpack_require__.o(exports, name)) {
      /******/ Object.defineProperty(exports, name, {
        /******/ configurable: false,
        /******/ enumerable: true,
        /******/ get: getter,
        /******/
      });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/ __webpack_require__.n = function (module) {
    /******/ var getter =
      module && module.__esModule
        ? /******/ function getDefault() {
            return module["default"];
          }
        : /******/ function getModuleExports() {
            return module;
          };
    /******/ __webpack_require__.d(getter, "a", getter);
    /******/ return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/ __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/ __webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/ return __webpack_require__((__webpack_require__.s = 1));
  /******/
})(
  /************************************************************************/
  /******/ [
    /* 0 */
    /***/ function (module, exports) {
      // polyfill customEvent pour IE
      (function () {
        if (typeof window.CustomEvent === "function") return false;
        function CustomEvent(event, params) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
          var evt = document.createEvent("CustomEvent");
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
      })();

      // main public AB object
      window.AB = {
        // deep extend function
        extend: function () {
          var extended = {},
            deep = false,
            i = 0,
            length = arguments.length;

          if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
            deep = arguments[0];
            i++;
          }

          var merge = function (obj) {
            for (var prop in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                if (deep && Object.prototype.toString.call(obj[prop]) === "[object Object]") {
                  extended[prop] = window.AB.extend(true, extended[prop], obj[prop]);
                } else {
                  extended[prop] = obj[prop];
                }
              }
            }
          };

          for (; i < length; i++) {
            merge(arguments[i]);
          }

          return extended;
        },

        // test if a string is a JSON
        isJson: function (str) {
          try {
            JSON.parse(str);
          } catch (e) {
            return false;
          }
          return true;
        },

        plugins: {},
      };

      /***/
    },
    /* 1 */
    /***/ function (module, exports, __webpack_require__) {
      "use strict";

      var AB = __webpack_require__(0),
        abMediaQuery = __webpack_require__(2);

      var pluginName = "interchange",
        attr = "data-ab-interchange",
        attrSrc = "data-ab-interchange-src";

      var Plugin = function (el, options) {
        this.el = el;

        var dataOptions = window.AB.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
        this.settings = window.AB.extend(true, Plugin.defaults, options, dataOptions);

        this.rules = [];
        this.currentPath = "";
        this.settings.mode = this._defineMode();
        this.lazySettings = this.settings.lazySettings;
        this.isLazy = this.settings.lazy;
        this.replaced = false;
        this.animated = false; // for requestAnimationFrame
        this.lazyTimer; // for delayed setTimeout

        this.init();
      };

      Plugin.defaults = {
        mode: "background",
        lazy: false,
        lazySettings: {
          placeholder: false,
          offscreen: 1.5,
          delayed: false,
          layout: "fluid", // 'fixed': fixed dimensions
        },
      };

      Plugin.prototype = {
        init: function () {
          var that = this;

          // no need when using 'picture' on browsers supporting that, except when using lazy loading
          if (this.el.parentNode.matches("picture") && window.HTMLPictureElement && !this.isLazy) return this;

          // replace anyway after a delay (for offline support)
          if (this.isLazy && this.lazySettings.delayed) {
            this.lazyTimer = setTimeout(function () {
              that.isLazy = false;
              that._replace();
            }, this.lazySettings.delayed);
          }

          this._setPlaceholder()._events()._generateRules();

          if (this._updatePath()) {
            this._replace();
          }
        },

        _defineMode: function () {
          // in case of <img /> there is no doubt
          if (this.el.nodeName === "IMG" || this.el.parentNode.matches("picture")) return "img";

          return this.settings.mode;
        },

        _getWidthHeight: function () {
          var width = this.el.getAttribute("width"),
            height = this.el.getAttribute("height"),
            widthObj = {},
            heightObj = {};

          if (window.AB.isJson(width) && window.AB.isJson(height)) {
            widthObj = JSON.parse(width);
            heightObj = JSON.parse(height);

            for (var key in widthObj) {
              if (widthObj.hasOwnProperty(key)) {
                if (window.AB.mediaQuery.is(key)) {
                  width = widthObj[key];
                  height = heightObj[key];
                }
              }
            }
          }

          return {
            width: width,
            height: height,
          };
        },

        _setPlaceholder: function () {
          var placeholderNode = document.createElement("div"),
            imgNode = document.createElement("img"),
            alt = this.el.getAttribute("alt"),
            widthHeight = this._getWidthHeight(),
            width = widthHeight.width,
            height = widthHeight.height,
            isNotReady = !this.lazySettings.placeholder || this.el.nodeName === "IMG" || this.el.parentNode.matches("picture") || !width || !height;

          if (isNotReady) return this;

          this.el.innerHTML = "";

          this.el.style.overflow = "hidden";
          this.el.style.position = "relative";
          this.el.classList.add("ab-interchange-loading");

          if (this.lazySettings.layout === "fixed") {
            this.el.style.height = height + "px";
            this.el.style.width = width + "px";
          }

          placeholderNode.classList.add("ab-interchange-placeholder");
          placeholderNode.style.paddingTop = ((height / width) * 100).toFixed(2) + "%";

          imgNode.style.position = "absolute";
          imgNode.style.top = 0;
          imgNode.style.right = 0;
          imgNode.style.bottom = 0;
          imgNode.style.left = 0;
          imgNode.style.maxHeight = "100%";
          imgNode.style.minHeight = "100%";
          imgNode.style.maxWidth = "100%";
          imgNode.style.minWidth = "100%";
          imgNode.style.height = 0;
          imgNode.alt = alt === null ? "" : alt; // always put an 'alt'

          this.el.appendChild(placeholderNode);
          this.el.appendChild(imgNode);

          return this;
        },

        _events: function () {
          var that = this;

          // update path, then replace
          window.addEventListener("changed.ab-mediaquery", that._resetDisplay.bind(that));

          if (that.isLazy) window.addEventListener("scroll", that._requestAnimationFrame.bind(that));

          return that;
        },

        _generateRules: function () {
          var rulesList = [],
            // retro compatibility: sources inside 'attr'
            getAttrSrc = this.el.getAttribute(attrSrc) ? this.el.getAttribute(attrSrc) : this.el.getAttribute(attr),
            rules = getAttrSrc.match(/\[[^\]]+\]/g);

          for (var i = 0, len = rules.length; i < len; i++) {
            var rule = rules[i].slice(1, -1).split(", "),
              path = rule.slice(0, -1).join(""),
              query = rule[rule.length - 1];

            rulesList.push({
              path: path,
              query: query,
            });
          }

          this.rules = rulesList;

          return this;
        },

        _updatePath: function () {
          var path = "",
            rules = this.rules;

          // if already replaced, we stop
          if (this.replaced) return false;

          // Iterate through each rule
          for (var i = 0, len = rules.length; i < len; i++) {
            if (window.AB.mediaQuery.is(rules[i].query)) path = rules[i].path;
          }

          // if path hasn't changed, return
          if (this.currentPath === path) return false;

          this.currentPath = path;

          return true;
        },

        _onScroll: function () {
          // when inView, no need to use 'delayed'
          if (this._inView()) {
            clearTimeout(this.lazyTimer);
            this._replace();
          }

          this.animated = false;
          return this;
        },

        _requestAnimationFrame: function () {
          if (this.replaced) return this;

          if (!this.animated) window.requestAnimationFrame(this._onScroll.bind(this));

          this.animated = true;
        },

        _resetDisplay: function () {
          this.replaced = false;

          if (this._updatePath()) {
            this._setPlaceholder();
            this._replace();
          }
        },

        _inView: function () {
          var windowHeight = window.innerHeight,
            rect = this.el.getBoundingClientRect(),
            elHeight = this.el.offsetHeight,
            checkTop = -elHeight - windowHeight * (this.lazySettings.offscreen - 1),
            checkBottom = windowHeight + windowHeight * (this.lazySettings.offscreen - 1);

          return rect.top >= checkTop && rect.top <= checkBottom;
        },

        _triggerEvent: function () {
          this.el.classList.remove("ab-interchange-loading");
          var event = new CustomEvent("replaced.ab-interchange", {
            detail: {
              element: this.el,
            },
          });
          window.dispatchEvent(event);
        },

        _replace: function () {
          // if lazy load and not into view: stop
          if (this.isLazy && !this._inView()) return this;

          if (this.settings.mode === "img") {
            this._replaceImg();
          } else if (this.settings.mode === "background") {
            this._replaceBackground();
          } else if (this.settings.mode === "ajax") {
            this._replaceAjax();
          }

          // we are done
          this.replaced = true;
        },

        _replaceImg: function () {
          var replaceNode;

          if (this.lazySettings.placeholder) replaceNode = this.el.querySelector("img");
          else replaceNode = this.el;

          if (replaceNode.src === this.currentPath) return this;

          replaceNode.src = this.currentPath;

          replaceNode.addEventListener("load", this._triggerEvent.bind(this));
        },

        _replaceBackground: function () {
          if (this.el.style.backgroundImage === 'url("' + this.currentPath + '")') return this;

          if (this.currentPath) this.el.style.backgroundImage = "url(" + this.currentPath + ")";
          else this.el.style.backgroundImage = "none";

          this.el.addEventListener("load", this._triggerEvent.bind(this));
        },

        _replaceAjax: function () {
          var that = this;

          if (!this.currentPath) {
            this.el.innerHTML = "";
            return this;
          }

          var request = new XMLHttpRequest();
          request.open("GET", this.currentPath, true);

          request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
              that.el.innerHTML = this.response;
              that._triggerEvent();
            } else {
              that.el.innerHTML = "";
            }
          };

          request.onerror = function () {
            this.el.innerHTML = "";
          };

          request.send();
        },
      };

      window.abInterchange = function (options) {
        var elements = document.querySelectorAll("[" + attr + "]");
        for (var i = 0, len = elements.length; i < len; i++) {
          if (elements[i][pluginName]) continue;
          elements[i][pluginName] = new Plugin(elements[i], options);
        }
      };

      /***/
    },
    /* 2 */
    /***/ function (module, exports, __webpack_require__) {
      "use strict";

      var AB = __webpack_require__(0);

      var Plugin = function (opt) {
        this.settings = window.AB.extend(true, Plugin.defaults, opt);
        this.queries = this.settings.bp;
        this.current = [];
        this.animated = false;

        this._init();
      };

      Plugin.defaults = {
        bp: {},
      };

      Plugin.prototype = {
        _init: function () {
          this.current = this._getCurrent();
          this._watcher();

          return this;
        },

        _getCurrent: function () {
          var sizes = [];

          for (var key in this.queries) {
            if (!this.queries.hasOwnProperty(key)) continue;

            if (window.matchMedia(this.queries[key]).matches) sizes.push(key);
          }

          return sizes;
        },

        _watcher: function () {
          var that = this;

          window.addEventListener("resize", function () {
            if (!that.animated) {
              window.requestAnimationFrame(that._updateSizes.bind(that));
              that.animated = true;
            }
          });
        },

        _updateSizes: function () {
          var newSize = this._getCurrent(),
            event = new CustomEvent("changed.ab-mediaquery");

          this.animated = false;

          // check if it's updated
          if (newSize.join("|") !== this.current.join("|")) {
            this.current = newSize;
            window.dispatchEvent(event);
          }
        },

        is: function (size) {
          return window.matchMedia(this.queries[size]).matches;
        },
      };

      window.abMediaQuery = function (opt) {
        window.AB.mediaQuery = new Plugin(opt);
      };

      /***/
    },
    /******/
  ]
);
(function (window, undefined) {
  "use strict";

  try {
    window._longTasks = [];
    new window.PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        window._longTasks.push(entry.toJSON());
      });
    }).observe({ entryTypes: ["longtask"] });
  } catch (error) {}

  // IE8 needs the console object to be created
  if (!window.console) {
    window.console = {
      log: function () {},
      warn: function () {},
      error: function () {},
      time: function () {},
      debug: function () {},
      timeEnd: function () {},
    };
  }

  // Create E global object
  // Use it to store variables, functions, etc...
  window.E = {
    version: "6.28.1", // remplacÃ© via gulp-replace par le tag de version
    updaters: {}, // utilisÃ© pour rÃ©initialiser les plugin aprÃ¨s rÃ©ponse ajax
    plugins: {}, // on garde les fonctions d'appel des plugins (pour les Ã©vboquer aprÃ¨s un appel Ajax par ex.)
    test: {}, // modernizr-like
  };

  // Pour reinitialiser les plugins en cas d'update du DOM (AJAX...)
  E.launchUpdaters = function () {
    for (var key in E.updaters) {
      if (!E.updaters.hasOwnProperty(key)) continue;
      E.updaters[key]();
    }

    // init des faux boutons
    E.fakeBtn();
  };

  var axsStyles = (document.head || document.getElementsByTagName("head")[0]).appendChild(document.createElement("style"));
  document.addEventListener("mousedown", function () {
    axsStyles.innerHTML = "* {outline:none;}";
  });
  document.addEventListener("keydown", function () {
    axsStyles.innerHTML = "*:focus {outline:2px solid #000; outline-color:#000;}";
  });

  // Event pour remplacer 'load' sur window (parfois bloquÃ© par des scripts tiers...)
  function triggerTimeoutReady(e) {
    var event = new CustomEvent("readyPlayerOne");

    if (E.triggerTimeoutReady) return;

    if (e.type === "load") {
      E.triggerTimeoutReady = true;
      document.dispatchEvent(event);
      return;
    }

    setTimeout(function () {
      if (E.triggerTimeoutReady) return;

      E.triggerTimeoutReady = true;
      document.dispatchEvent(event);
    }, 2000);
  }

  document.addEventListener("DOMContentLoaded", triggerTimeoutReady);
  window.addEventListener("load", triggerTimeoutReady);
})(window);

/*
test.js
*/

(function (window, document, E, undefined) {
  "use strict";

  // iOS
  if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && !window.MSStream) {
    E.test.ios = true;
    document.documentElement.classList.add("ios");
  } else {
    E.test.ios = false;
    document.documentElement.classList.add("no-ios");
  }

  // IE11
  if (!!window.MSInputMethodContext && !!document.documentMode) {
    E.test.ie11 = true;
    document.documentElement.classList.add("ie11");
  } else {
    E.test.ie11 = false;
    document.documentElement.classList.add("no-ie11");
  }

  // Android
  if (navigator.userAgent.match(/android/i)) {
    E.test.android = true;
    document.documentElement.classList.add("android");
  } else {
    E.test.android = false;
    document.documentElement.classList.add("no-android");
  }

  // localStorage / sessionStorage
  try {
    localStorage.setItem("testStorage", "true");
    localStorage.removeItem("testStorage");

    E.test.localstorage = true;
    document.documentElement.classList.add("localstorage");
  } catch (t) {
    E.test.localstorage = false;
    document.documentElement.classList.add("no-localstorage");
  }

  // touchevents
  var touchevents = "ontouchstart" in window;
  E.test.touchevents = touchevents;
  document.documentElement.classList.add(touchevents ? "touchevents" : "no-touchevents");

  // DarkMode
  function switchDarkMode(status) {
    document.documentElement.classList[status.matches ? "add" : "remove"]("darkMode--on");
    E.isDarkMode = status.matches;
  }

  if (window.matchMedia("(prefers-color-scheme)").media !== "not all") {
    var darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    E.test.darkMode = true;
    document.documentElement.classList.add("darkMode");
    switchDarkMode(darkModeMediaQuery);

    darkModeMediaQuery.addListener(switchDarkMode);
  } else {
    E.test.darkMode = false;
    document.documentElement.classList.add("no-darkMode");
  }

  // object-fit
  var objectfit = "objectFit" in document.documentElement.style === true;
  E.test.objectfit = objectfit;
  document.documentElement.classList.add(objectfit ? "objectfit" : "no-objectfit");

  // JavaScript
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
})(window, document, window.E || {});

/*
clipboard.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.clipboard = {
    copy: function (val) {
      var inputNode = document.createElement("input");

      document.body.appendChild(inputNode);
      inputNode.value = typeof val === "string" ? val : val.value ? val.value : val.textContent;
      inputNode.select();
      document.execCommand("copy");
      inputNode.remove();
    },
  };
})(window, document, window.E || {});

/*
debounce.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.debounce = function (callback, delay) {
    var timer;

    return function () {
      var args = arguments,
        that = this;

      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        callback.apply(that, args);
      }, delay);
    };
  };

  // debounce rapide via requestAnimationFrame
  var debounce = function (type, name) {
    var running = false;

    var func = function () {
      if (running) return;

      running = true;
      window.requestAnimationFrame(function () {
        window.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    window.addEventListener(type, func);
  };

  /* init - you can init any event */
  debounce("resize", "E-resize");
  debounce("scroll", "E-scroll");
  debounce("mousemove", "E-mousemove");
  debounce("touchmove", "E-touchmove");
})(window, document, window.E || {});

/*
  encrypt.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.encrypt = {
    hexa: function (string) {
      return string
        .split("")
        .map(function (char) {
          return char.charCodeAt(0).toString(16).padStart(2, "0");
        })
        .join("");
    },
  };
})(window, document, window.E || {});

/*
extend.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.extend = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;

    // Check if a deep merge
    if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
      deep = arguments[0];
      i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          // If deep merge and property is an object, merge properties
          if (deep && Object.prototype.toString.call(obj[prop]) === "[object Object]") {
            extended[prop] = E.extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    // Loop through each object and conduct a merge
    for (; i < length; i++) {
      var obj = arguments[i];
      merge(obj);
    }

    return extended;
  };
})(window, document, window.E || {});

/*
  fakeBtn.js

  Description:
  -----------
  Quand un bouton n'est pas possible (uniquement dans ce cas !!!)
*/

(function (window, document, E, undefined) {
  "use strict";

  var initFakeBtn = function (node) {
    // inutile d'init plusieurs fois un fakeBtn
    if (node.eFakebtn) return;

    node.eFakebtn = true;
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");

    node.addEventListener("keypress", function (ev) {
      if (ev.keyCode === 32 || ev.keyCode === 13) {
        node.click();
      }
    });
  };

  E.fakeBtn = function () {
    var fakeBtnNodes = document.querySelectorAll("[data-e-fakebtn]");
    fakeBtnNodes.forEach(initFakeBtn);
  };
})(window, document, window.E || {});

/*
  getCoords.js

  Description:
  -----------
  Retourne la position (X et Y) d'un Ã©lÃ©ment par rapport au document
*/

(function (window, document, E, undefined) {
  "use strict";

  E.getCoords = function (el) {
    // crossbrowser version
    var box = el.getBoundingClientRect(),
      body = document.body,
      docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {
      top: Math.round(top),
      left: Math.round(left),
    };
  };
})(window, document, window.E || {});

/*
  getUrlParameter.js

  Description:
  -----------
  RÃ©cupÃ©rer la valeur d'un paramÃ¨tre dans l'URL

  JS usage:
  --------
  E.getUrlParameter('toto');
*/

(function (window, document, E, undefined) {
  "use strict";

  E.getUrlParameter = function (paramName) {
    var paramsString = window.location.search.substring(1),
      paramList = paramsString.split("&"),
      param = [],
      obj = {},
      paramStore = [];

    for (var i = 0, len = paramList.length; i < len; i++) {
      param = paramList[i].split("=");

      if (paramName) {
        if (param[0] === paramName) {
          return param[1];
        }
      } else {
        obj = {};
        obj[param[0]] = param[1];
        paramStore.push(obj);
      }
    }

    if (!paramName) return paramStore;
  };
})(window, document, window.E || {});

/*
isJson.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.isJson = function (str) {
    try {
      str = JSON.parse(str);
    } catch (e) {
      return false;
    }

    // str doit Ãªtre un object et pas null
    if (typeof str === "object" && str !== null) {
      return true;
    }

    return false;
  };
})(window, document, window.E || {});

/*
  isValidDate.js

  Description:
  -----------
  VÃ©rifie la validitÃ© d'une date
*/

(function (window, document, E, undefined) {
  "use strict";

  E.isValidDate = function (dateString, option) {
    var regex_date = /^(\d{2}|\d{1})\/(\d{2}|\d{1})\/\d{4}$/;
    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (!regex_date.test(dateString)) return false;

    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;

    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) monthLength[1] = 29;

    return day > 0 && day <= monthLength[month - 1];
  };
})(window, document, window.E || {});

/*
  keyName.js

  Description:
  -----------
  Keycodes (qui se souvient des keycodes ?)

  JS usage:
  --------
  document.addEventListener('keydown', function(e) {
    var keycode = e.which;
    if (E.keyNames[keycode] === 'escape') {
      // ...
    }
  });
*/

(function (window, document, E, undefined) {
  "use strict";

  E.keyNames = {
    40: "down",
    38: "up",
    37: "left",
    39: "right",
    9: "tab",
    17: "ctrl",
    13: "enter",
    27: "escape",
    32: "space",
    33: "prev",
    34: "next",
    36: "start",
    35: "end",
    16: "shift",
  };
})(window, document, window.E || {});

/*
morphing.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var _getPos = function (elem, context) {
    var position = {};
    var elemPos = elem.getBoundingClientRect();

    position.top = elemPos.top - context.top;
    position.left = elemPos.left - context.left;
    position.width = elemPos.width;
    position.height = elemPos.height;

    return position;
  };

  E.morphing = function (elem, params) {
    var fakeNode = elem;
    var params = params;
    var contextNode = params.context;
    var originNode = params.origin;
    var targetNode = params.target;

    // VÃ©rifier option mobile:
    if (params.noMobile && AB.mediaQuery.is("smallOnly")) return;

    var _inTheEnd = function (e) {
      if (e.propertyName === "width" || e.propertyName === "left" || e.propertyName === "height") {
        fakeNode.removeAttribute("style");
        fakeNode.classList.remove("is-morphing-move");
        contextNode.classList.remove("is-morphing");

        fakeNode.removeEventListener("transitionend", _inTheEnd);
      }
    };

    var contextPos = contextNode.getBoundingClientRect();
    var originPos = _getPos(originNode, contextPos);
    var targetPos = _getPos(targetNode, contextPos);

    //--- Animations:
    contextNode.classList.add("is-morphing");
    fakeNode.classList.add("is-morphing-move");

    fakeNode.style.top = originPos.top + "px";
    fakeNode.style.left = originPos.left + "px";
    fakeNode.style.width = originNode.offsetWidth + "px";
    fakeNode.style.height = originNode.offsetHeight + "px";

    window.setTimeout(function () {
      fakeNode.style.top = targetPos.top + "px";
      fakeNode.style.left = targetPos.left + "px";
      fakeNode.style.width = targetNode.offsetWidth + "px";
      fakeNode.style.height = targetNode.offsetHeight + "px";
    }, 20);

    fakeNode.addEventListener("transitionend", _inTheEnd);
  };
})(window, document, window.E || {});

/*
  noScroll.js

  Assigner l'attribut [data-e-noscroll] au wrapper du contenu du site pour Ã©viter un effet de scroll
*/

(function (window, document, E, undefined) {
  "use strict";

  E.noScroll = {
    siteWrapperAttr: "[data-e-no-scroll]",
    noScrollClass: "no-scroll",
    currentPos: 0,

    prevent: function () {
      var siteWrapper = document.querySelectorAll(this.siteWrapperAttr);
      this.currentPos = window.pageYOffset;

      document.documentElement.classList.add(this.noScrollClass);

      if (E.test.touchevents) {
        // si pas de wrapper, on applique au body
        if (siteWrapper.length <= 0) {
          document.body.style.position = "fixed";
          document.body.style.top = -this.currentPos + "px";
          document.body.style.left = 0;
          document.body.style.right = 0;
          return;
        }

        for (var i = 0, len = siteWrapper.length; i < len; i++) {
          siteWrapper[i].style.position = "fixed";
          siteWrapper[i].style.top = -this.currentPos + "px";
          siteWrapper[i].style.left = 0;
          siteWrapper[i].style.right = 0;
        }
      }
    },

    allow: function () {
      var siteWrapper = document.querySelectorAll(this.siteWrapperAttr);

      document.documentElement.classList.remove(this.noScrollClass);

      if (E.test.touchevents) {
        if (siteWrapper.length <= 0) {
          document.body.style.position = "static";
          window.scrollTo(0, this.currentPos);
          return;
        }

        for (var i = 0, len = siteWrapper.length; i < len; i++) {
          siteWrapper[i].style.position = "static";
        }

        window.scrollTo(0, this.currentPos);
      }
    },
  };
})(window, document, window.E || {});

/*
  populate.js

  test: https://codepen.io/lordfpx/pen/jQBvqZ?editors=0010
*/

(function (window, document, E, undefined) {
  "use strict";

  var populateForm = function (form, name, value) {
    var element = form.elements.namedItem(name),
      type = element.type || element[0].type;

    if ("undefined" === typeof value || null === value) {
      value = "";
    }

    if (element._flatpickr) {
      // utilisation de la mÃ©thode propriÃ©taire
      element._flatpickr.setDate(value, true);
    } else {
      switch (type) {
        case "radio":
          element.forEach(function (node) {
            node.checked = value.indexOf(node.value) > -1;
          });
          break;

        case "checkbox":
          if (element.length) {
            element.forEach(function (node) {
              node.checked = true;
            });
          } else {
            element.checked = true;
          }
          break;

        case "select-multiple":
          var values = value.constructor === Array ? value : [value];

          if (element.tagName === "SELECT") {
            element.querySelectorAll("option").forEach(function (option) {
              option.selected = values.indexOf(option.value) > -1;
            });
          } else {
            element.forEach(function (node) {
              node.querySelectorAll("option").forEach(function (option) {
                option.selected = values.indexOf(option.value) > -1;
              });
            });
          }
          break;

        case "select":
        case "select-one":
          if (element.tagName === "SELECT") {
            element.querySelector('[value="' + value.toString() || value + '"]').selected = true;
          } else {
            element.forEach(function (node) {
              node.querySelector('[value="' + value.toString() || value + '"]').selected = true;
            });
          }
          break;

        case "date":
          if (element.length) {
            element.forEach(function (node) {
              node.value = new Date(value).toISOString().split("T")[0];
            });
          } else {
            element.value = new Date(value).toISOString().split("T")[0];
          }
          break;

        default:
          if (element.length) {
            element.forEach(function (node) {
              node.value = value;
            });
          } else {
            element.value = value;
          }
          break;
      }
    }

    form.dispatchEvent(
      new CustomEvent("ePopulate.field", {
        detail: {
          name: name,
          value: value,
          element: element,
        },
      })
    );
  };

  E.populate = function (form, data) {
    for (var key in data) {
      if (data.hasOwnProperty(key) && form.elements.namedItem(key)) {
        populateForm(form, key, data[key]);
      }
    }

    form.dispatchEvent(new CustomEvent("ePopulate.done"));
  };
})(window, document, window.E || {});

/*
scrollTo.js
*/

(function (window, document, E, undefined) {
  "use strict";

  E.scrollTo = function (options) {
    // settings
    var next = options.next;
    var center = options.center || false;
    var offset = options.offset || 0;
    var duration = options.duration || 600;
    var wrapper = options.wrapper || false;
    var currentPosition = 0;
    var nextPosition = 0;
    var diffPosition = 0;
    var startTime = null;
    var currentTime = 0;
    var nextHeight = next.offsetHeight;
    var windowHeight = window.innerHeight;
    var bodyScrollTo = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

    // fonction de dÃ©placement
    function move(val) {
      wrapper ? (wrapper.scrollTop = val) : window.scrollTo(0, val);
    }

    // fonction de easing
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) {
        return (c / 2) * t * t + b;
      }
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    // calcul animation avec requestAnimationFrame
    function animateScroll(time) {
      if (time === undefined) {
        time = new Date().getTime();
      }

      if (startTime === null) {
        startTime = time;
      }

      currentTime = time - startTime;

      // on scroll...
      var val = easeInOutQuad(currentTime, currentPosition, diffPosition, duration);
      move(val);

      // on continue jusqu'Ã  la fin...
      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        window.removeEventListener("wheel", preventScroll, passiveOption);
        window.removeEventListener("touchmove", preventScroll, passiveOption);
      }
    }

    // on chercher un wrapper (modale par exemple) s'il n'est pas spÃ©cifiÃ©
    if (!wrapper) {
      if (AB.mediaQuery.is("smallOnly")) wrapper = next.closest(".c-fullModal, .c-modal__content");
      else wrapper = next.closest(".c-fullModal, .c-modal__overlay");
    }

    // si wrapper, on scroll le wrapper
    if (wrapper) {
      currentPosition = wrapper.scrollTop;
      nextPosition = next.offsetTop;
    } else {
      currentPosition = bodyScrollTo;
      nextPosition = E.getCoords(next).top;
    }

    // si l'Ã©tape est plus petite que la fenÃªtre, on centre
    if (center && nextHeight + offset < windowHeight) {
      nextPosition = nextPosition - windowHeight / 2 + nextHeight / 2;
    }

    nextPosition = nextPosition - offset;

    // nÃ©cessaire pour Chrome
    var supportsPassive = false;
    try {
      window.addEventListener(
        "test",
        null,
        Object.defineProperty({}, "passive", {
          get: function () {
            supportsPassive = true;
          },
        })
      );
    } catch (e) {}
    var passiveOption = supportsPassive ? { passive: false } : false;

    function preventScroll(e) {
      e.preventDefault();
    }

    window.addEventListener("wheel", preventScroll, passiveOption);
    window.addEventListener("touchmove", preventScroll, passiveOption);

    // on a besoin de la diffÃ©rence
    diffPosition = nextPosition - currentPosition;

    requestAnimationFrame(animateScroll);
  };
})(window, document, window.E || {});

/*
  serializeForm.js

  Description:
  Retourne une sÃ©rialisation de tous les Ã©lÃ©ments valides d'un formulaire et leurs valeurs.

  E.serializeForm(formNode)
  "formNode" Ã©tant un formulaire
*/

(function (window, document, E, undefined) {
  "use strict";

  function isRadioCheckbox(el) {
    return el.getAttribute("type") === "checkbox" || el.getAttribute("type") === "radio";
  }

  E.serializeForm = function (formNode) {
    var items = {};
    var el = null;
    var formElsNode = formNode.elements;

    for (var i = 0, len = formElsNode.length; i < len; i++) {
      el = formElsNode[i];

      // enfant de fieldset disabled
      if (el.closest("fieldset") && el.closest("fieldset").disabled) continue;

      // disabled
      if (el.disabled) continue;

      // checkbox ou radio unchecked
      if (isRadioCheckbox(el) && !el.checked) continue;

      // fieldset, reset, submit, button
      if (el.type === "fieldset") continue;

      if (el.name && (el.willValidate || el.readOnly === true || el.type === "hidden")) {
        items[el.name] = el.value;
      }
    }

    return items;
  };
})(window, document, window.E || {});

/*
  storage.js

  Methods to get, set, remove storage (local/session).
  Cookies is used as fallback.

  LocalStorage will behave like cookie:

  - if localStorage is available:
    - if date: use localStorage
    - else: use sessionStorage

  - else localStorage is unvailable: cookie (through js-cookie: https://github.com/js-cookie/js-cookie)

  Storage with '-date' suffix is to mimic cookie expire.

  Aide:
  "E.storage.setItem(STRING, STRING[, NUMBER])":
    "CrÃ©er un storage, [NUMBER] est l'expiration en jours (si en heure: h/24). Si pas de [NUMBER], ce sera sessionStorage",

  "E.storage.getItem(STRING)":
    "Lire un storage",

  "E.storage.removeItem(STRING|ARRAY)":
    "Effacer un storage ou un array de storages",

  "E.storage.getItemsStartsWith(STRING)":
    "return un array de storages commenÃ§ant par STRING"
*/

(function (window, document, E, undefined) {
  "use strict";

  // js-cookie respecte le norme RFC 6265, https://github.com/js-cookie/js-cookie#encoding, mais pas JBoss :-(
  E.Cookies = window.Cookies.withConverter({
    read: function (value, name) {
      return decodeURIComponent(value);
    },
    write: function (value, name) {
      return encodeURIComponent(value);
    },
  });

  E.storage = (function () {
    var hasLocalStorage = E.test.localstorage;

    /**
     * Get item and return its value || null
     * E.storage.getItem('toto');
     *
     * @param  {string} key
     */
    function getItem(key) {
      var data;

      if (E.debug) console.log("getItem", key);

      if (hasLocalStorage) {
        if (localStorage.getItem(key + "-date")) {
          data = window.localStorage.getItem(key);
        } else {
          data = window.sessionStorage.getItem(key);

          // si pas de seessionStorage && pas de date,
          // c'est peut Ãªtre un localStorage normal ?
          if (!data) data = window.localStorage.getItem(key);
        }
      } else {
        // patch avant refonte TEL
        if (key.startsWith("VENTE-")) {
          data = E.Cookies.get(key.slice("VENTE-".length));
        } else {
          data = E.Cookies.get(key);
        }
      }

      return data ? data : null;
    }

    /**
     * Set item with optional expiration
     * if date expiration is set
     *    > remove session storage, overrid storage with same key that has date
     *    > create two localstorage, one with value, one with date expiration
     * if date is not set
     *    >  remove local storage, overrid storage with same key that has not date
     *    >  create session storage
     *
     * E.storage.setItem('toto', 'string' [, 10]);
     *
     * @param  {string} key
     * @param  {string} value
     * @param  {number} date
     */
    function setItem(key, value, date) {
      if (!key) return false;

      if (E.debug) console.log("setItem: ", key, value, date);

      if (hasLocalStorage) {
        if (date) {
          window.sessionStorage.removeItem(key);

          window.localStorage.setItem(key, value);
          window.localStorage.setItem(key + "-date", _calcDateExpires(date));
        } else {
          window.localStorage.removeItem(key);
          window.localStorage.removeItem(key + "-date");

          window.sessionStorage.setItem(key, value);
        }
      } else {
        // patch avant refonte TEL
        if (key.startsWith("VENTE-")) {
          E.Cookies.set(key.slice("VENTE-".length), value, { expires: date });
        } else {
          E.Cookies.set(key, value, { expires: date });
        }
      }
    }

    /**
     * remove item(s)
     * E.storage.removeItem('toto');
     * E.storage.removeItem(['toto', 'blabla']);
     *
     * @param  {string|Array} key - can be an item or an array of items
     */
    function removeItem(key) {
      if (E.debug) console.log("removeItem", key);

      if (Array.isArray(key)) {
        for (var i = 0, len = key.length; i < len; i++) {
          var item = key[i];
          window.localStorage.removeItem(item);
          window.localStorage.removeItem(item + "-date");
          window.sessionStorage.removeItem(item);
          E.Cookies.remove(item);

          // patch avant refonte TEL
          E.Cookies.remove(item.slice("VENTE-".length));
        }
      } else {
        window.localStorage.removeItem(key);
        window.localStorage.removeItem(key + "-date");
        window.sessionStorage.removeItem(key);
        E.Cookies.remove(key);

        // patch avant refonte TEL
        E.Cookies.remove(key.slice("VENTE-".length));
      }
    }

    /**
     * calculate date expiration (https://github.com/js-cookie/js-cookie/blob/master/src/js.cookie.js lines 53 + 79)
     * return string or empty string ''
     *
     * @param  {number} date
     */
    function _calcDateExpires(date) {
      var d = date;
      if (typeof date === "number") {
        var expires = new Date();
        expires.setMilliseconds(expires.getMilliseconds() + d * 864e5);
        d = expires.getTime();
      }

      return d ? d : "";
    }

    /**
     * get items that start with 'keyword', get local AND session storage with fallback cookie, push item in storageArray
     * return array or empty array
     *
     * @param  {string} keyword
     */
    function getItemsStartsWith(keyword) {
      var storageArray = [],
        keysLocal,
        keysSession,
        keysCookie,
        i,
        len,
        key;

      if (hasLocalStorage) {
        keysLocal = Object.keys(localStorage);
        keysSession = Object.keys(sessionStorage);

        for (i = 0, len = keysLocal.length; i < len; i++) {
          key = keysLocal[i];

          // if key begins with keyword
          if (key.startsWith(keyword)) storageArray.push(key);
        }

        for (i = 0, len = keysSession.length; i < len; i++) {
          key = keysSession[i];

          // if key begins with keyword
          if (key.startsWith(keyword)) storageArray.push(key);
        }
      } else {
        keysCookie = Object.keys(E.Cookies.get());

        for (i = 0, len = keysCookie.length; i < len; i++) {
          key = keysCookie[i];

          // if key begins with keyword
          if (key.startsWith(keyword)) storageArray.push(key);
        }
      }

      return storageArray;
    }

    return {
      getItem: getItem,
      setItem: setItem,
      removeItem: removeItem,
      getItemsStartsWith: getItemsStartsWith,
    };
  })();

  document.addEventListener("DOMContentLoaded", function () {
    // simulate cookie expiration: localStorage only
    if (E.test.localstorage) {
      var keys = Object.keys(window.localStorage);

      for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];

        // if key has a date expiration, compare with today and remove local storage
        if (key.endsWith("-date")) {
          var localStorageDate = Date.parse(window.localStorage.getItem(key)),
            today = new Date(),
            storage = key.split("-date")[0];

          /* Pour faire des tests en local
            var nextMonth = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 30);
            today = nextMonth;
            */

          // verify if localStorageDate actually return a date value
          if (localStorageDate && today > localStorageDate) {
            // Effacer tous les localStorage VENTE (exception du comportement normal)
            if (key === "VENTE-storageDate-date") {
              E.storage.removeItem(E.storage.getItemsStartsWith("VENTE-"));
            }

            window.localStorage.removeItem(storage);
            window.localStorage.removeItem(key);
          }

          // remove useless item with date
          if (window.localStorage.getItem(storage) === null) {
            window.localStorage.removeItem(key);
          }
        }
      }
    }
  });
})(window, document, window.E || {});

(function (window, document, E, undefined) {
  var DURATION = 0.083;

  ("use strict");

  E.telStorage = function (obj, callback) {
    if (obj.hasOwnProperty("removeStorage") && obj.removeStorage.length) {
      obj.removeStorage.forEach(function (storage) {
        E.storage.removeItem(storage);
      });
    }

    if (obj.hasOwnProperty("setStorage") && obj.setStorage.length) {
      E.storage.setItem("VENTE-storageDate", new Date().getTime(), DURATION);

      obj.setStorage.forEach(function (storage) {
        var key = Object.keys(storage)[0];
        E.storage.setItem(key, storage[key], DURATION);
      });
    }

    if (callback) setTimeout(callback, 5000);
  };
})(window, document, window.E || {});

/*

  templateEngine.js

  Description:
  -----------
  Mini template engine
  Tutoriel: http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
  Version plus rÃ©cente: https://github.com/krasimir/absurd/blob/master/lib/processors/html/helpers/TemplateEngine.js

  HTML:
  ----
  JS supportÃ© (possible d'Ã©tendre) :
  var | if | for | else | switch | case | break

  <script data-tpl="voteEspritService" type="text/template">
    <div>[% this.truc %]</div>
    [% if (this.machin) { %]
      <div>...</div>
    [% } %]
  </script>

  JS usage:
  --------
  var templateX = document.querySelector('[data-tpl="templateX"]').innerHTML,
      data = {
        truc: 'xxx',
        machin: true
      };

  E.templateEngine(templateX, data); // data est un objet
*/

(function (window, document, E, undefined) {
  /* jshint ignore:start */
  // ignorer du linting Ã  cause du new Function indispensable ici!

  E.templateEngine = function (html, options) {
    var re = /\[%(.+?)%\]/g,
      reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g,
      code = "with(obj) { var r=[];\n",
      cursor = 0,
      result,
      match;

    var add = function (line, js) {
      js ? (code += line.match(reExp) ? line + "\n" : "r.push(" + line + ");\n") : (code += line != "" ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : "");
      return add;
    };

    while ((match = re.exec(html))) {
      add(html.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
    }

    add(html.substr(cursor, html.length - cursor));
    code = (code + 'return r.join(""); }').replace(/[\r\t\n]/g, " ");

    try {
      result = new Function("obj", code).apply(options, [options]);
    } catch (err) {
      console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n");
    }

    return result;
  };

  /* jshint ignore:end */
})(window, document, window.E || {});

/*
  transitionend.js
*/

(function (window, document, E, undefined) {
  "use strict";

  var enterClass = "is-transitionEnter";
  var exitClass = "is-transitionExit";

  E.transition = (function () {
    /**
     *
     * @param {HTMLElement} node
     * @param {string} property - propriÃ©tÃ© CSS Ã  surveiller
     * @param {boolean} enterCondition - condition d'entrÃ©e du node
     */
    function addListener(node, property, enterCondition) {
      node.addEventListener("transitionend", function (ev) {
        if (ev.target === node && ev.propertyName === property) {
          if (enterCondition()) {
            node.classList.remove(exitClass);
            node.classList.add(enterClass);
          } else {
            node.classList.remove(enterClass);
            node.classList.add(exitClass);
          }
        }
      });
    }

    function initEnter(node) {
      node.classList.add(enterClass);
    }

    function initExit(node) {
      node.classList.add(exitClass);
    }

    return {
      addListener: addListener,
      initEnter: initEnter,
      initExit: initExit,
    };
  })();
})(window, document, window.E || {});

/*
uid.js

https://github.com/lukeed/uid
*/

(function (window, document, E, undefined) {
  "use strict";

  var IDX = 36;
  var HEX = "";
  var str, num;
  while (IDX--) HEX += IDX.toString(36);

  E.uid = function (len) {
    str = "";
    num = len || 20;
    while (num--) str += HEX[(Math.random() * 36) | 0];
    return str;
  };
})(window, document, window.E || {});

/*
getDeviceInfos.js
*/

(function (window, document, E, undefined) {
  "use strict";

  // NAVIGATEUR-OS
  var guessInfos = {
    header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],

    dataos: [
      { name: "Windows Phone", value: "Windows Phone" },
      { name: "Windows", value: "Win" },
      { name: "iPhone", value: "iPhone" },
      { name: "iPad", value: "iPad" },
      { name: "Kindle", value: "Silk" },
      { name: "Android", value: "Android" },
      { name: "PlayBook", value: "PlayBook" },
      { name: "BlackBerry", value: "BlackBerry" },
      { name: "macOS", value: "Mac" },
      { name: "Linux", value: "Linux" },
      { name: "Palm", value: "Palm" },
    ],

    databrowser: [
      { name: "Internet Explorer", value: "Trident" },
      { name: "Edge", value: "Edge" },
      { name: "Chrome", value: "Chrome" },
      { name: "Firefox", value: "Firefox" },
      { name: "Safari", value: "Safari" },
      { name: "Opera", value: "Opera" },
      { name: "BlackBerry", value: "CLDC" },
      { name: "Mozilla", value: "Mozilla" },
    ],

    init: function () {
      var agent = this.header.join(" ");

      return {
        os: this.matchItem(agent, this.dataos),
        browser: this.matchItem(agent, this.databrowser),
      };
    },

    matchItem: function (string, datum) {
      var regex, match;

      for (var i = 0; i < datum.length; i++) {
        regex = new RegExp(datum[i].value, "i");
        match = regex.test(string);

        if (match) return datum[i].name;
      }

      return "inconnu";
    },
  };

  var deviceInfos = guessInfos.init();
  // END - NAVIGATEUR-OS

  function eUId() {
    if (!E.storage.getItem("eUId")) E.storage.setItem("eUId", E.uid(), 360);

    return E.storage.getItem("eUId");
  }

  E.device = deviceInfos;
  E.device.uid = eUId();
})(window, document, window.E || {});

(function (window, document, E, undefined) {
  "use strict";

  function Factory() {}

  Factory.prototype = {
    setSettings: function (node) {
      var attrValue = node.getAttribute(this.attr);
      var customSettings = E.isJson(attrValue) ? JSON.parse(attrValue) : {};
      return E.extend(true, this.defaultSettings, customSettings);
    },

    createInstance: function (node) {
      // Seulement 1 instance par node
      if (node[this.pluginName]) return;

      var instance = new this.Plugin();
      instance.settings = this.setSettings(node);
      instance.el = node;

      // auto-initialisation de l'instance
      instance.init();

      node[this.pluginName] = instance;
      return instance;
    },

    createPlugin: function (pluginName, attr, defaultSettings, Plugin) {
      var that = this;
      this.pluginName = pluginName;
      this.attr = attr;
      this.defaultSettings = defaultSettings;
      this.Plugin = Plugin;

      // on stock la fonction pour appel futur en cas d'injection du composant dans la page
      if (!E.plugins[pluginName]) {
        E.plugins[pluginName] = function () {
          that.createPlugin(pluginName, attr, defaultSettings, Plugin);
        };
        E.updaters[pluginName] = E.plugins[pluginName];
      }

      var nodes = document.querySelectorAll("[" + attr + "]");
      nodes.forEach(this.createInstance.bind(this));
    },
  };

  E.factory = new Factory();
})(window, document, window.E || {});

(function (window, document, E, undefined) {
  "use strict";

  // activate debug mode
  E.debug = document.documentElement.hasAttribute("data-debug");

  var abInterchangeSettings = {
    lazy: false,
    lazySettings: {
      offscreen: 1.2,
      delayed: 15000,
    },
  };

  // init AB-mediaQuery: https://github.com/lordfpx/AB-mediaQuery
  if (typeof abMediaQuery !== "undefined") {
    abMediaQuery({
      bp: {
        smallOnly: "screen and (max-width: 47.99em)",
        small: "screen and (min-width: 0em)",
        mediumOnly: "screen and (min-width: 48em) and (max-width: 64em)",
        smallMediumDown: "screen and (max-width: 63.99em)",
        medium: "screen and (min-width: 48em)",
        bigMediumUp: "screen and (min-width: 64em)",
        largeOnly: "screen and (min-width: 64.01em) and (max-width: 80em)",
        large: "screen and (min-width: 64.01em)",
        hugeOnly: "screen and (min-width: 80.01em) and (max-width: 120em)",
        huge: "screen and (min-width: 80.01em)",
      },
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // init AB-interchange: https://github.com/lordfpx/AB-interchange
    if (typeof abInterchange !== "undefined") {
      if (document.body.hasAttribute("data-e-interchange-settings")) {
        abInterchangeSettings = JSON.parse(document.body.getAttribute("data-e-interchange-settings"));
      }
      abInterchange(abInterchangeSettings);
      E.updaters.abInterchange = function () {
        abInterchange(abInterchangeSettings);
      };
    }

    // init des faux boutons
    E.fakeBtn();
  });

  if (typeof jQuery !== "undefined") {
    $(document).ajaxComplete(function (event, xhr, settings) {
      // vÃ©rification du format de rÃ©ponse (HTML)
      try {
        $(xhr.responseText);
      } catch (e) {
        return;
      }

      // re-init AB-interchange in xhr
      if ($(xhr.responseText).find("[data-ab-interchange]").length > 0) {
        abInterchange(abInterchangeSettings);
      }

      // reinit des plugins
      E.launchUpdaters();
    });
  }
})(window, document, window.E || {});
