/*
  backToTop.js

  Description:
  spÃ©cificitÃ© js de ce composant permet de gere juste sont apparition au scroll

  HTML:
  Ajouter l'attribut [data-e-backtotop] sur un Ã©lÃ©ment HTML
*/

(function (window, document, E, undefined) {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var back2top = document.querySelector("[data-e-backtotop]");

    if (!back2top) return;

    function back2TopStatus() {
      document.documentElement.scrollTop >= 100 ? back2top.classList.add("is-active") : back2top.classList.remove("is-active");
    }

    if (AB.mediaQuery.is("smallOnly")) {
      window.addEventListener("E-scroll", back2TopStatus);
    }
  });
})(window, document, window.E || {});

/*
    toggle.js
    ---------
  
    Description:
    -----------
    Ouvrir/fermer un panneau par injection de classe.
    Utiliser le CSS pour l'affichage en vous appuyant sur les classes injectÃ©es.
  
    HTML:
    ----
    - data-e-toggle' : Ã  appliquer sur l'Ã©lÃ©ment qui dÃ©clenche l'ouverture et la fermeture de la cible
    - data-e-toggle-target' : cible du plugin
    - data-e-toggle-close' (optionnel) Ã  appliquer sur les Ã©lÃ©ments qui dÃ©lenchent la fermeture de la cible
  
    Exemple:
    ----
    <button data-e-toggle='{"target": "legal"}'>Mentions lÃ©gales</button>
    <div data-e-toggle-target="legal">
      <p>Lorem ipsum dolor sit amet.</p>
    </div>
    <button data-e-toggle-close='{"target": "legal"}'>Mentions lÃ©gales</button>
  
    Options facultatives:
    ----
    "autoClose"       : si true la cible se fermera automatiquement si l'utilisateur clique en dehors (false par dÃ©faut)
    "autoCloseWrap"   : spÃ©cifier un sÃ©lecteur pointant vers l'Ã©lÃ©ment parent le plus proche pour restreindre le fonctionnement du toggle Ã  ce bloc (rÃ©sout les soucis de toggle imbriquÃ©s)
    "opened"          : si true la cible est ouverte dÃ¨s le chargement (false par dÃ©faut)
    "delayClose"      : null  // delai de fermeture automatique en ms
    "delayOpen"       : null  // delai d'ouverture automatique en ms
    "mq"              : spÃ©cifier des breakpoints dans lesquels le toggle doit se dÃ©clencher (mq pour "media query"), prend en argument un tableau (Ex: ["smallOnly", "mediumOnly"] )
    "blockScroll"     : si true bloque le scroll Ã  l'ouverture de la cible sur mobile seulement (false par dÃ©faut)
  
    MÃ©thodes:
    ----
    "open"            : utilie la mÃ©thode "_updateDom" pour ouvrir la cible et Ã©met un event
    "close"           : utilie la mÃ©thode "_updateDom" pour fermer la cible et Ã©met un event
    "_updateDom"      : met Ã  jour les classes et attributs ARIA sur la data-e-toggle et data-e-toggle-target
    "closeOthers"     : si "autoClose" est Ã  true ferme les autres toggles ouverts
    "closeOthersWrap" : si "autoCloseWrap" est Ã  true ferme les autres toggles ouverts dans le sÃ©lecteur spÃ©cifiÃ©
    "_delayOpen"      : dÃ©clenche la mÃ©thode "open" avec le dÃ©lai spÃ©cifiÃ©
    "_delayClose"     : dÃ©clenche la mÃ©thode "close" avec le dÃ©lai spÃ©cifiÃ©
  */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eToggle";
  var attr = "data-e-toggle";
  var target = attr + "-target";
  var closeTrigger = attr + "-close";
  var defaults = {
    target: "",
    autoClose: false,
    autoCloseWrap: "", // selecteur
    opened: false,
    delayClose: null,
    delayOpen: null,
    mq: "",
    blockScroll: false,
  };

  if (E.plugins[pluginName]) return;

  var _delayClose = function () {
    var that = this;
    that.timerClose = setTimeout(that.close.bind(that), that.settings.delayClose);
  };

  var _delayOpen = function () {
    var that = this;
    that.timerOpen = setTimeout(that.open.bind(that), that.settings.delayOpen);
  };

  var _updateDom = function () {
    if (this.isClosed) {
      this.el.setAttribute("aria-expanded", "false");
      this.el.classList.remove("is-active");
      this.content.setAttribute("aria-hidden", "true");
      this.content.classList.remove("is-opened");
    } else {
      this.el.setAttribute("aria-expanded", "true");
      this.el.classList.add("is-active");
      this.content.setAttribute("aria-hidden", "false");
      this.content.classList.add("is-opened");
    }
  };

  var _events = function () {
    var that = this;

    this.el.addEventListener("click", this.toggle.bind(this));

    if (!(this.el.tagName === "A" || this.el.tagName === "BUTTON")) {
      this.el.addEventListener("keydown", function (e) {
        if (E.keyNames[e.which] === "enter") that.toggle(e);
      });
    }

    // Boutons de fermeture
    document.addEventListener("click", function (e) {
      for (var target = e.target; target && target !== this; target = target.parentNode) {
        if (target.matches("[" + closeTrigger + '="' + that.settings.target + '"]')) {
          e.preventDefault();
          that.close();
          break;
        }
      }
    });

    if (that.settings.autoClose) {
      document.addEventListener("e-toggle.close-all", that.close.bind(that));
    }
  };

  function Plugin(el, options) {
    this.el = el;

    var dataOptions = E.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
    this.settings = E.extend(true, defaults, options, dataOptions);

    this.isClosed = true;
    this.inMediaQuery = true;
    this.timerClose;
    this.timerOpen;
    this.init();
  }

  Plugin.prototype = {
    init: function () {
      if (this.settings.mq) {
        if (Array.isArray(this.settings.mq)) {
          this.inMediaQuery = this.settings.mq.some(function (mq) {
            return AB.mediaQuery.is(mq);
          });
        } else {
          this.inMediaQuery = AB.mediaQuery.is(this.settings.mq);
        }
      }

      if (!this.settings.target || !this.inMediaQuery) return;

      this.content = document.querySelector("[" + target + '="' + this.settings.target + '"]');

      // si pas de target, on return...
      if (!this.content) return;

      this.settings.opened ? this.open() : this.close();
      _updateDom.call(this);

      // dÃ©finir aria-labelledby
      if (this.el.hasAttribute("id")) {
        this.content.setAttribute("aria-labelledby", this.el.getAttribute("id"));
      }

      // pour accÃ©der au trigger depuis le target (voir searchBar.js)
      this.content.eToggleNode = this.el;

      _events.call(this);

      // on lance le timer de fermeture
      if (this.settings.delayClose) _delayClose.call(this);
      if (this.settings.delayOpen) _delayOpen.call(this);
    },

    toggle: function (e) {
      e.preventDefault();

      // remove focus on button
      this.el.blur();

      // on vide les timers qui ne sont plus nÃ©cessaires
      if (this.settings.delayClose) clearTimeout(this.timerClose);
      if (this.settings.delayOpen) clearTimeout(this.timerOpen);

      this.isClosed ? this.open() : this.close();
    },

    close: function () {
      var that = this;

      if (this.isClosed) return;

      this.isClosed = true;

      if (this.settings.blockScroll && AB.mediaQuery.is("smallOnly")) E.noScroll.allow();

      // update du DOM
      _updateDom.call(this);

      // trigger event to listen outside
      var event = new CustomEvent("onToggleClose", {
        detail: { toggle: that },
      });
      this.el.dispatchEvent(event);
    },

    open: function () {
      var that = this;

      if (!this.isClosed) return;

      this.isClosed = false;

      if (this.settings.blockScroll && AB.mediaQuery.is("smallOnly")) E.noScroll.prevent();

      if (this.settings.autoClose) this.closeOthers();

      if (this.settings.autoCloseWrap) this.closeOthersWrap();

      // on lance le timer de fermeture
      if (this.settings.delayClose) this.delayClose();

      // update du DOM
      _updateDom.call(this);

      // trigger event to listen outside
      var event = new CustomEvent("onToggleOpen", {
        detail: { toggle: that },
      });
      this.el.dispatchEvent(event);
    },

    // close other toggles with autoClose: true
    closeOthers: function () {
      var openedToggles = document.querySelectorAll("[" + attr + '][aria-expanded="true"]');

      // s'il n'y a pas de toggles ouverts
      if (openedToggles.length <= 0) return this;

      for (var i = 0, len = openedToggles.length; i < len; i++) {
        // s'il n'y a pas l'option autoClose
        if (openedToggles[i] === this.el || !openedToggles[i].eToggle.settings.autoClose) continue;

        openedToggles[i].eToggle.close();
      }
    },

    closeOthersWrap: function () {
      var openedTogglesWrapParent = this.el.closest(this.settings.autoCloseWrap);
      var itemToggle = openedTogglesWrapParent.querySelectorAll('[aria-expanded="true"]');

      for (var i = 0, len = itemToggle.length; i < len; i++) {
        itemToggle[i].eToggle.close();
      }
    },
  };

  E.plugins[pluginName] = function (options) {
    var elements = document.querySelectorAll("[" + attr + "]");
    for (var i = 0, len = elements.length; i < len; i++) {
      if (elements[i][pluginName]) continue;
      elements[i][pluginName] = new Plugin(elements[i], options);
    }
  };

  E.updaters[pluginName] = E.plugins[pluginName];
  document.addEventListener("DOMContentLoaded", E.plugins[pluginName]);

  document.addEventListener("DOMContentLoaded", function () {
    // close quand on clique sur la page
    document.addEventListener("click", function (e) {
      var target = e.target,
        event = new CustomEvent("e-toggle.close-all"),
        inToggle = target.closest("[data-e-toggle], [data-e-toggle-target]");

      if (!inToggle) document.dispatchEvent(event);
    });
  });
})(window, document, window.E || {});

/*
    sticky.js
   */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eSticky";
  var attr = "data-e-sticky";
  var container = "data-e-sticky-container";
  var containerMain = "data-e-sticky-container-main";
  var defaults = {
    container: "",
    keepBottom: false, // passer en true si Ã©lÃ©ment est positionnÃ© avec un bottom
    hAlign: "right",
  };

  var _resetPositionHorizontal = function () {
    if (this.settings.hAlign === "right") {
      this.el.style.right = 0;
      this.el.style.left = "auto";
    } else {
      this.el.style.left = 0;
      this.el.style.right = "auto";
    }
  };

  var _setStickyTop = function () {
    if (this.mode === "top") return;

    this.mode = "top";
    _resetPositionHorizontal.call(this);

    this.el.style.position = "absolute";
    this.el.style.bottom = "auto";

    if (this.settings.keepBottom) {
      this.el.style.top = 0;
    } else {
      this.el.style.top = this.originalStyles.top + "px";
    }

    this.el.classList.remove("c-sticky--fixed");
    this.el.classList.add("c-sticky--unstickyTop");
    this.el.classList.remove("c-sticky--unstickyBottom");
  };

  var _setStickyBottom = function () {
    if (this.mode === "bottom") return;

    this.mode = "bottom";
    _resetPositionHorizontal.call(this);

    this.el.style.position = "absolute";
    this.el.style.top = "auto";

    if (this.settings.keepBottom) {
      this.el.style.bottom = this.originalStyles.bottom + "px";
    } else {
      this.el.style.bottom = 0;
    }

    this.el.classList.remove("c-sticky--fixed");
    this.el.classList.remove("c-sticky--unstickyTop");
    this.el.classList.add("c-sticky--unstickyBottom");
  };

  var _setPositionHorizontal = function () {
    var container = !this.container ? this.containerMain : this.container,
      containerBoxLeft = container.getBoundingClientRect().left + "px";

    if (this.settings.hAlign === "right") {
      this.el.style.right = containerBoxLeft;
    } else {
      this.el.style.left = containerBoxLeft;
    }
  };

  var _setSticky = function () {
    // toujours besoin de recalculer la position horizontale
    _setPositionHorizontal.call(this);

    if (this.mode === "fixed") return;

    this.mode = "fixed";
    this.el.style.position = "fixed";

    if (this.settings.keepBottom) {
      this.el.style.top = "auto";
      this.el.style.bottom = this.originalStyles.bottom + "px";
    } else {
      this.el.style.top = this.originalStyles.top + "px";
      this.el.style.bottom = "auto";
    }

    this.el.classList.add("c-sticky--fixed");
    this.el.classList.remove("c-sticky--unstickyTop");
    this.el.classList.remove("c-sticky--unstickyBottom");

    return;
  };

  var _setStickyMode = function () {
    var boundingClientRect = this.container.getBoundingClientRect();
    this.elHeight = this.el.offsetHeight;

    // composant positionnÃ© en BAS
    if (this.settings.keepBottom) {
      if (boundingClientRect.top + this.elHeight + parseInt(this.originalStyles.bottom, 10) > window.innerHeight) {
        _setStickyTop.call(this);
        return;
      }

      if (boundingClientRect.bottom < window.innerHeight) {
        _setStickyBottom.call(this);
        return;
      }
    } else {
      // composant positionnÃ© en HAUT
      if (boundingClientRect.top > 0 || this.elHeight >= window.innerHeight) {
        _setStickyTop.call(this);
        return;
      }

      if (boundingClientRect.bottom - parseInt(this.originalStyles.top, 10) - this.elHeight < 0) {
        _setStickyBottom.call(this);
        return;
      }
    }

    _setSticky.call(this);
  };

  var _events = function () {
    window.addEventListener("E-scroll", _setStickyMode.bind(this));
    window.addEventListener("E-resize", _setStickyMode.bind(this));
  };

  function Plugin() {
    this.mode = "";
  }

  Plugin.prototype = {
    init: function () {
      // pas pour mobile
      if (!AB.mediaQuery.is("medium")) return;

      this.originalStyles = {
        top: parseInt(window.getComputedStyle(this.el).top, 10),
        bottom: parseInt(window.getComputedStyle(this.el).bottom, 10),
      };

      this.elHeight = this.el.offsetHeight;

      // container principal utilisÃ© si pas de container cible
      this.containerMain = document.querySelector("[" + containerMain + "]") || document.body;

      // container cible pour limiter la zone sticky
      if (this.settings.container) {
        this.container = document.querySelector("[" + container + "=" + this.settings.container + "]");
      }

      // pas de container spÃ©cifique ou si ce container n'existe pas
      if (!this.settings.container || !this.container) {
        this.container = this.containerMain;
      }

      this.el.classList.add("c-sticky");

      _setStickyMode.call(this);
      _events.call(this);
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});

/*
    scrollTo.js
    -----------
  
    Description:
    Permet de crÃ©er un scrollTo
    - insÃ©rer l'attribut [data-e-scrollTo] dans une ancre <a> et dÃ©finir l'ancre dans un attribut href sur lequel il doit pointer
    - pour des raisons d'accessibilitÃ©, l'attribut ne marche que si la balise <a> a une ancre spÃ©cifiÃ©e
  
    HTML:
    exemple :
    <a data-e-scrollto href="#monID">Tata</a>
    <button data-e-scrollto='{"target": ".toto"}'>Tata</a>
  */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eScrollto";
  var attr = "data-e-scrollto";
  var defaults = {
    speed: 500,
    offset: 0,
    target: undefined,
  };

  var _getTarget = function () {
    if (this.settings.target === undefined) {
      var id = this.el.getAttribute("href");

      if (id && id.startsWith("#")) return document.querySelector(id);
    } else {
      if (this.settings.target) return document.querySelector(this.settings.target);
    }

    return false;
  };

  function Plugin() {
    this.target = null;
  }

  Plugin.prototype = {
    init: function () {
      this.el.addEventListener("click", this.scroll.bind(this));
    },

    scroll: function () {
      this.target = _getTarget.call(this);

      if (!this.target) return;

      E.scrollTo({
        next: this.target,
        offset: this.settings.offset,
      });
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});

/*
    storageLink.js
    --------------
  
    Description:
    CrÃ©er un ou plusieurs localStorage au clic
    Optionel: permet de supprimer des localStorage
  
    HTML:
    data-e-storage='[{"item": "VENTE-choixEnergie", "value": "G", "day": 0.083}, {"item": "VENTE-storageDate", "value": "", "day": 0.083}, {"item": "VENTE-choixStatut", "value": "EMDM", "day": 0.083}]'
    data-e-storage='{"item": "VENTE-choixEnergiexxx", "value": "G", "day": 0.083}'
  
    Pour supprimer, ajouter en plus cet attribut avec 1 localStorage ou un array de localStorage
    data-e-storage-remove='["VENTE-choixMarque", "VENTE-trDemande", "VENTE-codePostal", "VENTE-codeINSEE", "VENTE-nomCommune"]'
    data-e-storage-remove ne peut PAS s'utiliser sans data-e-storage
  */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eStorage",
    attr = "data-e-storage",
    triggerDel = "data-e-storage-remove";

  var _delStorage = function (e) {
    if (this.removeDatas) E.storage.removeItem(this.removeDatas);
  };

  var _setStorage = function (e) {
    var items = this.datas;

    // si on doit supprimer des storages
    _delStorage.call(this);

    if (!this.datas) return this;

    // si c'est un Array
    if (items.constructor === Array) {
      for (var i = 0, len = items.length; i < len; i++) {
        var item = items[i];

        // specifique Ã  TEL
        if (item.item === "VENTE-storageDate") item.value = new Date().getTime();

        E.storage.setItem(item.item, item.value, item.day);
      }

      return this;
    }

    // specifique Ã  TEL
    if (items.item === "VENTE-storageDate") items.value = new Date().getTime();

    E.storage.setItem(items.item, items.value, items.day);
  };

  var _init = function () {
    this.item.addEventListener("click", _setStorage.bind(this));
  };

  function Plugin(el) {
    this.item = el;

    this.datas = E.isJson(this.item.getAttribute(attr)) ? JSON.parse(this.item.getAttribute(attr)) : null;
    this.removeDatas = E.isJson(this.item.getAttribute(triggerDel)) ? JSON.parse(this.item.getAttribute(triggerDel)) : null;

    _init.call(this);
  }

  Plugin.prototype = {};

  E.plugins[pluginName] = function () {
    var elements = document.querySelectorAll("[" + attr + "]");
    for (var i = 0, len = elements.length; i < len; i++) {
      if (elements[i][pluginName]) continue;
      elements[i][pluginName] = new Plugin(elements[i]);
    }
  };

  E.updaters[pluginName] = E.plugins[pluginName];
  document.addEventListener("DOMContentLoaded", E.plugins[pluginName]);
})(window, document, window.E || {});

/*
    Description:
    [data-e-modal] Ã  mettre sur la modal
    [data-e-modal-target] Ã  mettre sur le bouton
    NOTE : [data-e-modal] & [data-e-modal-target] doivent avoir le memem nom
    ex:  [data-e-modal = "myBlock"]  [data-e-modal-target = "myBlock"]
    NOTE : le reste des attribus de la modal sont injecter en js par init()
  
    HTML:
    <div data-e-modal="theName"></div>
    <button data-e-modal-open="theName"></button>
    <h2 data-e-modal-label>Titre de la modale</h2> (pour gÃ©rer l'accessibilitÃ©)
  
    JS usage:
    Initialisation :
    E.plugins.eModal();
  
    Appler une mÃ©thode de l'extÃ©rieur :
    $0.eModal.open();
    $0.eModal.close();
  
    Events sur document:
    'modal.open' et 'modal.close' avec event.detail.instance et event.detail.modal
  */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eModal";
  var attr = "data-e-modal";
  var dataContent = "data-e-modal-content";
  var attrLabel = "data-e-modal-label";
  var dataClose = "data-e-modal-close";
  var dataOpen = "data-e-modal-open";
  var tabbable = "button, input, select, textarea, [tabindex], [contenteditable], a, video, iframe, embed, object, summary";
  var defaults = {
    target: "",
    autoStart: false,
    preventBodyScroll: true,
    mobileOnly: false,
    overlayClose: true,
    moveToBottom: true,
    iframe: "",
  };

  if (E.plugins[pluginName]) return;

  var _getYoutubeId = function (string) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = string.match(regExp);

    return match && match[7].length === 11 ? match[7] : null;
  };

  var _accessKey = function (e) {
    var that = this;
    var keycode = e.which;

    if (this.el.classList.contains("is-active")) {
      if (this.settings.overlayClose && E.keyNames[keycode] === "escape") this.close();

      if (E.keyNames[keycode] === "tab") {
        var lastElement = e.target.classList.contains("is-lastItem");

        if (lastElement) {
          window.setTimeout(function () {
            that.firstTabbable.focus();
          }, 0);
        }
      }
    }
  };

  var _autoStart = function () {
    var that = this;
    var timer = this.settings.autoStart * 1000;

    if (this.settings.autoStart) {
      setTimeout(function () {
        that.open();
      }, timer);
    }
  };

  var _iframe = function () {
    var iframe = document.createElement("iframe");

    this.el.classList.add("c-modal--iframe");

    iframe.setAttribute("src", this.settings.iframe);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("allow", "autoplay;");

    this.main.appendChild(iframe);

    document.dispatchEvent(
      new CustomEvent("modal.iframe", {
        detail: {
          iframeUrl: this.settings.iframe,
          youtubeId: _getYoutubeId(this.settings.iframe),
        },
      })
    );
  };

  var _events = function () {
    var that = this;

    document.addEventListener("keyup", _accessKey.bind(this));

    for (var i = 0, len = this.btnClose.length; i < len; i++) {
      this.btnClose[i].addEventListener("click", this.close.bind(this));
    }

    if (this.settings.overlayClose) {
      this.el.addEventListener("click", function (e) {
        if (e.target.className === "c-modal__overlay") {
          e.stopPropagation();
          that.close();
        }
      });
    }

    this.modalContent.addEventListener("click", function (e) {
      if (e.target.hasAttribute(dataClose)) that.close();
    });

    this.el.addEventListener("transitionend", function (e) {
      if (e.propertyName === "opacity") {
        // DÃ©sactiver transform aprÃ¨s ouverture
        if (e.target.hasAttribute("data-e-modal-content") && that.el.classList.contains("is-active")) {
          that.el.classList.add("is-opened");
        }

        // cacher aprÃ¨s fermeture modale
        if (e.target.hasAttribute("data-e-modal") && !that.el.classList.contains("is-active")) {
          that.el.classList.add(that.hiddenClass);
        }
      }
    });
  };

  function Plugin(el, options) {
    this.el = el;

    var dataOptions = E.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
    this.settings = E.extend(true, defaults, options, dataOptions);

    this.randomId = "-" + Math.random().toString(36).substr(2, 9);
    this.triggerBtn = null;
    this.init();
  }

  Plugin.prototype = {
    init: function () {
      this.hiddenClass = this.el.classList.contains("u-hide") ? "u-hide" : "u-visibilityHidden";

      this.modalContent = this.el.querySelector("[" + dataContent + "]");
      this.modalLabel = this.el.querySelector("[" + attrLabel + "]"); // Ã  terminer
      this.btnClose = this.el.querySelectorAll("[" + dataClose + "]");
      this.main = this.el.querySelector(".c-modal__main");
      this.firstTabbable = this.el.querySelector(tabbable);
      this.modalName = this.settings.target;

      if (this.settings.mobileOnly) {
        this.el.classList.add("c-modal--mobile");
        if (!AB.mediaQuery.is("smallOnly")) {
          this.el.classList.remove(this.hiddenClass);
          return;
        }
      }

      var lastElement = document.createElement("span");

      lastElement.className = "is-lastItem";
      lastElement.setAttribute("tabindex", "0");

      this.modalContent.setAttribute("role", "dialog");
      //this.modalContent.setAttribute('aria-describedby', 'modalDesc'); // pb: oÃ¹ trouver la description ?
      this.modalContent.setAttribute("aria-hidden", "true");

      if (this.modalLabel) {
        this.modalLabel.id = "modelLabel" + this.randomId;
        this.modalContent.setAttribute("aria-labelledby", "modelLabel" + this.randomId);
      }

      this.modalContent.appendChild(lastElement);

      if (this.settings.moveToBottom) document.body.appendChild(this.el);

      _events.call(this);
      _autoStart.call(this);
    },

    open: function (triggerBtn) {
      var that = this;

      if (triggerBtn) this.triggerBtn = triggerBtn;

      if (this.settings.mobileOnly && !AB.mediaQuery.is("smallOnly")) return;

      if (this.settings.preventBodyScroll) E.noScroll.prevent();

      this.modalContent.setAttribute("aria-hidden", "false");
      this.el.classList.remove(this.hiddenClass);

      setTimeout(function () {
        that.el.classList.add("is-active");
        that.el.style.opacity = 1;
        that.firstTabbable.focus({ preventScroll: true });
      }, 100);

      // chargement iframe
      if (this.settings.iframe) _iframe.call(this);

      document.dispatchEvent(
        new CustomEvent("modal.open", {
          detail: {
            instance: this,
            modal: this.el,
          },
        })
      );
    },

    close: function () {
      this.modalContent.setAttribute("aria-hidden", "true");
      this.el.style.opacity = 0;

      this.el.classList.remove("is-opened");
      this.el.classList.remove("is-active");

      if (this.settings.preventBodyScroll) E.noScroll.allow();

      // vide contenu
      if (this.settings.iframe) {
        this.main.innerHTML = "";
      }

      document.dispatchEvent(
        new CustomEvent("modal.close", {
          detail: {
            instance: this,
            modal: this.el,
          },
        })
      );

      // focus sur btn ouverture
      if (this.triggerBtn) {
        this.triggerBtn.focus({ preventScroll: true });
        this.triggerBtn = null; // reset de la valeur
      }
    },
  };

  E.plugins[pluginName] = function (options) {
    var elements = document.querySelectorAll("[" + attr + "]");

    for (var i = 0, len = elements.length; i < len; i++) {
      if (elements[i][pluginName]) continue;
      elements[i][pluginName] = new Plugin(elements[i], options);
    }
  };

  var triggerClick = function (e) {
    var closestBtn = e.target.closest("[" + dataOpen + "]");
    var elements, btnAttr, modal;

    if (!closestBtn) return;

    elements = [].slice.call(document.querySelectorAll("[" + attr + "]"));
    btnAttr = closestBtn.getAttribute(dataOpen);

    modal = elements.find(function (node) {
      return node[pluginName].modalName === btnAttr;
    });

    if (modal) modal[pluginName].open(closestBtn);
  };

  E.updaters[pluginName] = E.plugins[pluginName];
  document.addEventListener("DOMContentLoaded", function () {
    E.plugins[pluginName]();
    document.addEventListener("click", triggerClick);
  });
})(window, document, window.E || {});

/*
    _bannerApp.js
  */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eBannerApp";
  var attr = "data-e-bannerapp";
  var defaults = {};

  function Plugin() {}

  Plugin.prototype = {
    init: function () {
      var osUserAgent = navigator.userAgent;
      var bannerApp = document.querySelector('[data-tpl="bannerApp"]');
      var listUserAgentTest = /Android|iPhone|Windows Phone/i.test(osUserAgent);
      var localStorageTest = Cookies.get("e-bannerApp") !== "closed";

      if (!(AB.mediaQuery.is("smallOnly") && listUserAgentTest && localStorageTest && bannerApp)) return;

      this.metaAppsId = E.bannerApp;
      this.tplBannerApp = bannerApp.innerHTML;
      this.tplLayoutBannerApp = document.querySelector("[data-e-bannerapp]");
      this.iPhoneTest = /iPhone/i.test(osUserAgent);
      // this.WindowsTest = /Windows Phone/i.test(osUserAgent);
      this.AndroidTest = /Android/i.test(osUserAgent);
      this.data = { url: "" };

      this.appearBannerApp();
    },

    // load the bannerApp in the element and get the url
    appearBannerApp: function () {
      var metaRexContent = /app-id=([^\s,]+)/;
      var metaId = "";

      if (this.iPhoneTest) {
        metaId = metaRexContent.exec(this.metaAppsId.iOS)[1];
        this.data.url = "https://itunes.apple.com/fr/app/id" + metaId;
      } else if (this.AndroidTest) {
        metaId = metaRexContent.exec(this.metaAppsId.Android)[1];
        this.data.url = "http://play.google.com/store/apps/details?id=" + metaId;
      }

      if (this.iPhoneTest || this.AndroidTest) {
        this.tplLayoutBannerApp.innerHTML = E.templateEngine(this.tplBannerApp, this.data);
        document.documentElement.classList.add("has-bannerApp");
        this.closeBanner();
      }
    },

    closeBanner: function () {
      var that = this;
      var btnClose = document.querySelector("[data-e-bannerapp-close]");

      if (!btnClose) return;

      btnClose.addEventListener("click", function () {
        Cookies.set("e-bannerApp", "closed", { expires: 7 });
        that.tplLayoutBannerApp.style.display = "none";
      });
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    E.factory.createPlugin(pluginName, attr, defaults, Plugin);
  });
})(window, document, window.E || {});

/*
    notification.js
  
    Options:
    ------
    "autoclose" : optionnel, le dÃ©lai avant fermeture de la notification en ms
  */

(function (window, document, E, undefined) {
  "use strict";

  var pluginName = "eNotification";
  var attr = "data-e-notification";
  var closeBtn = "data-e-notification-close";
  var template = [
    '<div class="c-notification__body">',
    '  <button class="c-notification__close" data-e-notification-close type="button">',
    '    <div class="u-visibilityHidden">Fermer la notification</div>',
    '    <div class="c-notification__closeIcon icon icon-close"></div>',
    "  </button>",
    '  <div class="c-notification__main">',
    '    <div class="c-notification__picto"><img src="[% this.imgSrc %]" alt=""></div>',
    '    <div class="c-notification__content">',
    '      <div class="c-notification__title">[% this.title %]</div>',
    '      <div class="c-notification__text">[% this.text %]</div>[% if (this.linkUrl && this.linkText) { %]<a class="c-notification__cta" href="[% this.linkUrl %]"><span class="c-notification__ctaText">[% this.linkText %]</span><span class="c-notification__ctaIcon icon icon-big-chevron-right"></span></a>[% } %]',
    "    </div>",
    "  </div>",
    "</div>",
  ].join("");
  var defaults = {
    modifier: ["c-notification--blue"],
    autoclose: 4000,
    launchNotif: null,
  };

  // possibilitÃ© de mettre en pause un tiemout
  function Timer(callback, delay) {
    var timerId,
      start,
      remaining = delay;

    this.pause = function () {
      if (delay) {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
      }
    };

    this.resume = function () {
      if (delay) {
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
      }
    };

    this.clear = function () {
      window.clearTimeout(timerId);
    };

    if (delay) {
      this.resume();
    }
  }

  var _customEvent = function (eventName, nodeClick) {
    var customData = this.launchNotif.customData;
    var detail = {
      instance: this,
    };

    if (customData) {
      detail.customData = customData;
    }

    if (nodeClick) {
      detail.nodeClick = nodeClick;
    }

    document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  };

  var _clickLink = function (ev, nodeClick) {
    ev.preventDefault();
    _customEvent.call(this, "eNotification.clickLink", nodeClick);
  };

  var _onClick = function (ev) {
    if (ev.target.closest("[" + closeBtn + "]")) {
      this.close();
    } else if (ev.target.closest("a")) {
      _clickLink.call(this, ev, ev.target.closest("a"));
    }
  };

  var _onHover = function (ev) {
    this.timeout.pause();
  };
  var _onOut = function (ev) {
    this.timeout.resume();
  };

  var _build = function () {
    var that = this;

    this.notifNode = document.createElement("div");
    this.notifNode.classList.add("c-notification");
    this.notifNode.setAttribute("role", "status");
    this.notifNode.setAttribute("aria-live", "polite");
    // Ajout des classes modificatrices:
    if (this.settings.modifier) {
      this.settings.modifier.forEach(function (modifClass) {
        that.notifNode.classList.add(modifClass);
      });
    }
    this.notifNode.addEventListener("click", _onClick.bind(this));
    this.notifNode.addEventListener("mouseover", _onHover.bind(this));
    this.notifNode.addEventListener("mouseout", _onOut.bind(this));
    document.body.appendChild(this.notifNode);
  };

  var _init = function () {
    _build.call(this);

    document.addEventListener("eNotification.open", this.triggerNotif.bind(this));

    if (this.settings.launchNotif) {
      this.triggerNotif();
    }
  };

  var _open = function (timer) {
    var that = this;

    this.notifNode.classList.add("is-opened");

    // clear le prÃ©cÃ©dent timeout
    if (this.timeout) {
      this.timeout.clear();
    }

    // nouveau timeout
    this.timeout = new Timer(function () {
      that.close();
    }, timer);
  };

  function Plugin() {
    var el = document.querySelector("[" + attr + "]"),
      dataOptions = {};

    if (el && E.isJson(el.getAttribute(attr))) {
      dataOptions = JSON.parse(el.getAttribute(attr));
    }

    this.settings = E.extend(true, defaults, dataOptions);

    this.timeout = null;
    this.launchNotif = this.settings.launchNotif ? this.settings.launchNotif : null;

    _init.call(this);
  }

  Plugin.prototype = {
    triggerNotif: function (event) {
      var timer = this.settings.autoclose;

      this.launchNotif = event ? event.detail : this.launchNotif;

      if (!this.launchNotif) return;

      timer = this.launchNotif.timer || this.launchNotif.timer === 0 ? this.launchNotif.timer : timer;
      this.notifNode.innerHTML = E.templateEngine(template, this.launchNotif);
      _open.call(this, timer);

      _customEvent.call(this, "eNotification.opened");
    },

    close: function () {
      var that = this;

      function destroyNotif() {
        that.notifNode.removeEventListener("transitionend", destroyNotif);
        that.notifNode.innerHTML = "";
        _customEvent.call(that, "eNotification.closed");
      }

      this.timeout.clear();
      this.notifNode.addEventListener("transitionend", destroyNotif);
      this.notifNode.classList.remove("is-opened");
    },
  };

  E.plugins[pluginName] = function () {
    E.eNotification = new Plugin();
  };

  document.addEventListener("DOMContentLoaded", E.plugins[pluginName]);
})(window, document, window.E || {});
