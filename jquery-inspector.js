// Generated by CoffeeScript PHP 1.3.1
(function() {

  $.widget('ui.inspector', {
    options: {
      blockTransition: true,
      blockTransitionMessage: 'If you move from this page but please stay because inspection will be disabled.',
      blanlUrl: 'about:blank',
      proxyUrlParam: 'url',
      hoverId: '-inspector-hover',
      hoverStyle: 'background-color:red;opacity:0.3;',
      highlightClass: '-inspector-highlight',
      highlightStyle: 'border:2px solid #f00 !important;opacity:0.3',
      selectorBuilder: function(el) {
        var $body, $el, by_id, sel, tag,
          _this = this;
        $el = $(el);
        $body = $('body');
        tag = el.tagName.toLowerCase();
        sel = tag;
        if ($el.attr('id') != null) {
          by_id = '#' + $el.attr('id');
          if ($body.find(by_id).length === 1) {
            return by_id;
          }
        }
        if ($el.attr('class') != null) {
          $.each($el.attr('class').split(/\s+/), function(i, c) {
            c = c.replace(/\s/g, '');
            if (c !== _this.options.highlightClass) {
              return sel += '.' + c;
            }
          });
        }
        return sel;
      },
      selectorPathBuilder: function(el, delimiter) {
        var $body, $el, elements, paths,
          _this = this;
        paths = [];
        $el = $(el);
        elements = [];
        $body = $('body');
        if (delimiter === void 0) {
          delimiter = ' ';
        }
        $el.parentsUntil('body').andSelf().each(function() {
          return elements.push(this);
        });
        $.each(elements, function(i, e) {
          var sel;
          sel = _this.options.selectorBuilder.call(_this, e, $body);
          if (sel.indexOf('#') >= 0 && $body.find(sel).length === 1) {
            paths = [];
          }
          return paths.push(sel);
        });
        return paths.join(delimiter);
      },
      proxiedUrlBuilder: function(url) {
        if (this.options.proxyUrlParam != null) {
          return this.options.proxyUrl + '?' + this.options.proxyUrlParam + '=' + encodeURI(url);
        } else {
          return this.options.proxyUrl + '/' + encodeURI(url);
        }
      }
    },
    _create: function() {
      var _this = this;
      this.iframe = this.element;
      this.$iframe = $(this.iframe);
      this.loading = false;
      this.loaded = true;
      this.pick_on_load = false;
      this.highlight_on_load = null;
      this.picking = false;
      $(window).bind('beforeunload', function(ev) {
        var blocker;
        alert('parent');
        if (_this.transitionBlocker != null) {
          blocker = _this.transitionBlocker;
          return _this.$iframe.each(function() {
            return $(this.contentWindow).unbind('beforeunload', blocker);
          });
        }
      });
      return this.$iframe.load(function() {
        var $highlight, blocker;
        _this.loding = false;
        _this.loaded = true;
        _this.$doc = _this.$iframe.contents();
        _this.doc = _this.$doc[0];
        _this.$body = _this.$doc.find('body');
        _this.$body.find('*').click(function(ev) {
          console.log('click');
          console.log(_this.picking);
          if (_this.picking === true) {
            ev.stopPropagation();
            ev.preventDefault();
            return false;
          } else {

          }
        });
        if (_this.options.blockTransition === true) {
          blocker = _this.transitionBlocker = function(ev) {
            alert('child');
            return ev.returnValue = _this.options.blockTransitionMessage;
          };
          _this.$iframe.each(function() {
            return $(this.contentWindow).bind('beforeunload', blocker);
          });
        }
        _this.$hover = $("<div id='" + _this.options.hoverId + "' />").hide().attr('style', _this.options.hoverStyle).attr('pointer-events', 'none').css({
          display: 'block',
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: '0px',
          height: '0px',
          'z-index': 99999,
          'pointer-events': 'none'
        });
        _this.$body.append(_this.$hover);
        $highlight = $("<style type='text/css'> ." + _this.options.highlightClass + " { " + _this.options.highlightStyle + " } </style>");
        _this.$body.append($highlight);
        if (_this.options.onAfterLoad != null) {
          _this.options.onAfterLoad.call(_this);
        }
        if (_this.pick_on_load === true) {
          _this.pick();
          _this.pick_on_load = false;
        }
        if (_this.highlight_on_load != null) {
          _this.highlight(_this.highlight_on_load);
          return _this.highlight_on_load = null;
        }
      });
    },
    proxiedUrl: function(url) {
      return this.options.proxiedUrlBuilder.call(this, url);
    },
    selectorPath: function(el, delimiter) {
      return this.options.selectorPathBuilder.call(this, el, delimiter);
    },
    load: function(url) {
      this.loading = true;
      this.loaded = false;
      this.pick_on_load = false;
      this.highlight_on_load = null;
      this.picking = false;
      this.url = url;
      this.$iframe.each(function() {
        return $(this.contentWindow).unbind('beforeunload');
      });
      if (this.options.onBeforeLoad != null) {
        this.options.onBeforeLoad.call(this, url);
      }
      this.$iframe.attr('src', this.options.blankUrl);
      this.$iframe.attr('src', this.proxiedUrl(url));
      return this;
    },
    pick: function(continues, onPick) {
      var _this = this;
      if (this.loaded !== true) {
        this.pick_on_load = true;
        return;
      }
      this.$iframe.bind('mouseenter', function() {
        return _this.$hover.show();
      }).bind('mouseout', function() {
        return _this.$hover.hide();
      });
      this.$body.bind('mousemove', function(ev) {
        _this.hovering = _this.doc.elementFromPoint(ev.clientX, ev.clientY);
        _this.$hovering = $(_this.hovering);
        _this.$hover.offset(_this.$hovering.offset()).width(_this.$hovering.width()).height(_this.$hovering.height());
        if (_this.options.onHover != null) {
          return _this.options.onHover.call(_this, _this.hovering);
        }
      }).bind('mouseup', function(ev) {
        var cb;
        cb = onPick || _this.options.onPick;
        if (cb != null) {
          cb.call(_this, _this.hovering, _this.selector);
        }
        if (!(continues != null)) {
          _this.cancelPicking();
        }
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      });
      this.picking = true;
      return this;
    },
    cancelPicking: function() {
      if (this.picking !== true) {
        return;
      }
      if (this.clickBlocker != null) {
        console.log('unblock click');
        this.$body.find('*').unbind('click', this.clickBlocker);
      }
      this.clickBlocker = null;
      this.$iframe.unbind('mouseenter mouseout');
      this.$body.unbind('mousemove mouseup');
      this.$hover.hide();
      return this.picking = false;
    },
    highlight: function(selector, reset) {
      if (this.loaded !== true) {
        this.highlight_on_load = selector;
      }
      if (reset === true) {
        this.resetHighlight();
      }
      this.$doc.find(selector).addClass(this.options.highlightClass);
      return this;
    },
    resetHighlight: function() {
      if (this.loaded !== true) {
        return;
      }
      this.$doc.find("." + this.options.highlightClass).removeClass(this.options.highlightClass);
      return this;
    }
  });

}).call(this);
