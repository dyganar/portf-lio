(function (f) {
  function r(a, c) {
    this.carouselRoot = f(a);
    var b = this;
    this._isAnimating = this._lockYAxis = !1;
    this._upEvent = this._moveEvent = this._downEvent = '';
    this._totalItemsWidth;
    this._itemWidths;
    this._startAccelerationX;
    this._accelerationX;
    this._latestDragX;
    this._startTime = 0;
    this.settings = f.extend({
    }, f.fn.touchCarousel.defaults, c);
    this._dragContainer = this.carouselRoot.find('.touchcarousel-container');
    this._dragContainerStyle = this._dragContainer[0].style;
    this._itemsWrapper = this._dragContainer.wrap(f('<div class="touchcarousel-wrapper" />')).parent();
    var e = this._dragContainer.find('.touchcarousel-item');
    this.items = [
    ];
    this.numItems = e.length;
    var d = navigator.userAgent.toLowerCase(),
    d = function (b) {
      b = /(chrome)[ \/]([\w.]+)/.exec(b) || /(webkit)[ \/]([\w.]+)/.exec(b) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(b) || /(msie) ([\w.]+)/.exec(b) || 0 > b.indexOf('compatible') && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(b) || [
      ];
      return {
        browser: b[1] || '',
        version: b[2] || '0'
      }
    }(d),
    g = {
    };
    d.browser && (g[d.browser] = !0, g.version = d.version);
    g.chrome && (g.webkit = !0);
    b._browser = g;
    this._decelerationAnim;
    this._successfullyDragged = !1;
    this._moveDist = this._prevMouseX = this._startMouseX = 0;
    this._useWebkitTransition = this._wasBlocked = this._blockClickEvents = !1;
    'ontouchstart' in window ? (this.hasTouch = !0, this._downEvent = 'touchstart.rs', this._moveEvent = 'touchmove.rs', this._upEvent = 'touchend.rs', this._baseFriction = this.settings.baseTouchFriction)  : (this.hasTouch = !1, this._baseFriction = this.settings.baseMouseFriction, this.settings.dragUsingMouse ? (this._downEvent = 'mousedown.rs', this._moveEvent = 'mousemove.rs', this._upEvent = 'mouseup.rs', this._grabCursor, this._grabbingCursor, d = b._browser, d.msie || d.opera ? this._grabCursor = this._grabbingCursor = 'move' : d.mozilla && (this._grabCursor = '-moz-grab', this._grabbingCursor = '-moz-grabbing'), this._setGrabCursor())  : this._itemsWrapper.addClass('auto-cursor'));
    (this.hasTouch || this.settings.useWebkit3d) && 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix && (this._dragContainer.css({
      '-webkit-transform-origin': '0 0',
      '-webkit-transform': 'translateZ(0)'
    }), this._useWebkitTransition = !0);
    this._useWebkitTransition ? (this._xProp = '-webkit-transform', this._xPref = 'translate3d(', this._xSuf = 'px, 0, 0)')  : (this._xProp = 'left', this._xPref = '', this._xSuf = 'px');
    this.hasTouch && (this.settings.directionNavAutoHide = !1);
    this.settings.directionNav || (this._arrowRightBlocked = this.settings.loopItems ? this._arrowLeftBlocked = !0 : this._arrowLeftBlocked = !1, this.settings.loopItems = !0);
    var l,
    k,
    h = 0;
    e.eq(this.numItems - 1).addClass('last');
    e.each(function (a) {
      k = f(this);
      l = {
      };
      l.item = k;
      l.index = a;
      l.posX = h;
      l.width = k.outerWidth(!0) || b.settings.itemFallbackWidth;
      if (!0 === b.settings.multiRow) {
        var c = Math.max(1, Math.floor(b._dragContainer.height() / k.outerHeight(!0)));
        if (0 == (a + 1) % c || a == b.numItems - 1) h += k.outerWidth(!0)
      } else h += l.width;
      if (this.hasTouch) {
        console.log('cliquei');
        var d;
        k.find('a').each(function () {
          d = f(this);
          d.data('tc-href', d.attr('href'));
          d.data('tc-target', d.attr('target'));
          d.attr('href', '#');
          d.bind('click', function (a) {
            a.preventDefault();
            if (b._successfullyDragged) return !1;
            a = f(this).data('tc-href');
            var c = f(this).data('tc-target');
            c && '_self' !== c.toLowerCase() ? window.open(a)  :
            window.location.href = a
          })
        })
      } else k.find('a').bind('click.touchcarousel', function (a) {
        if (b._successfullyDragged) return a.preventDefault(),
        !1
      });
      k.find('.non-draggable').bind(b._downEvent, function (a) {
        b._successfullyDragged = !1;
        a.stopImmediatePropagation()
      });
      b.items.push(l)
    });
    this._maxXPos = this._totalItemsWidth = h;
    this._itemsPerMove = 0 < this.settings.itemsPerMove ? this.settings.itemsPerMove : 1;
    if (this.settings.pagingNav) {
      if (this._pagingEnabled = this.settings.snapToItems = !0, this._numPages = Math.ceil(this.numItems / this._itemsPerMove), this._currPageId = 0, this.settings.pagingNavControls) {
        this._pagingNavContainer = f('<div class="tc-paging-container"><div class="tc-paging-centerer"><div class="tc-paging-centerer-inside"></div></div></div>');
        e = this._pagingNavContainer.find('.tc-paging-centerer-inside');
        for (g = 1; g <= this._numPages; g++) d = f('<a class="tc-paging-item" href="#">' + g + '</a>').data('tc-id', g),
        g === this._currPageId + 1 && d.addClass('current'),
        e.append(d);
        this._pagingItems = e.find('.tc-paging-item').click(function (a) {
          a.preventDefault();
          b.goTo((f(a.currentTarget).data('tc-id') - 1) * b._itemsPerMove)
        });
        this._itemsWrapper.after(this._pagingNavContainer)
      }
    } else this._pagingEnabled = !1;
    this._dragContainer.css({
      width: h + 5
    });
    this.settings.directionNav && (this._itemsWrapper.after('<a href=\'#\' class=\'arrow-holder left\'><span class=\'arrow-icon left\'></span></a> <a href=\'#\' class=\'arrow-holder right\'><span class=\'arrow-icon right\'></span></a>'), this.arrowLeft = this.carouselRoot.find('.arrow-holder.left'), this.arrowRight = this.carouselRoot.find('.arrow-holder.right'), 1 > this.arrowLeft.length || 1 > this.arrowRight.length ? this.settings.directionNav = !1 : this.settings.directionNavAutoHide && (this.arrowLeft.hide(), this.arrowRight.hide(), this.carouselRoot.one('mousemove.arrowshover', function () {
      b.arrowLeft.fadeIn('fast');
      b.arrowRight.fadeIn('fast')
    }), this.carouselRoot.hover(function () {
      b.arrowLeft.fadeIn('fast');
      b.arrowRight.fadeIn('fast')
    }, function () {
      b.arrowLeft.fadeOut('fast');
      b.arrowRight.fadeOut('fast')
    })), this._updateDirectionNav(0), this.settings.directionNav && (this.arrowRight.click(function (a) {
      a.preventDefault();
      (b.settings.loopItems && !b._blockClickEvents || !b._arrowRightBlocked) && b.next()
    }), this.arrowLeft.click(function (a) {
      a.preventDefault();
      (b.settings.loopItems && !b._blockClickEvents || !b._arrowLeftBlocked) && b.prev()
    })));
    this.carouselWidth;
    this._resizeEvent = 'onorientationchange' in window ? 'orientationchange.touchcarousel' : 'resize.touchcarousel';
    var m;
    f(window).bind(this._resizeEvent, function () {
      m && clearTimeout(m);
      m = setTimeout(function () {
        b.updateCarouselSize(!1)
      }, 100)
    });
    this.settings.scrollbar ? (this._scrollbarHolder = f('<div class=\'scrollbar-holder\'><div class=\'scrollbar' + ('light' === this.settings.scrollbarTheme.toLowerCase() ? ' light' : ' dark') + '\'></div></div>'), this._scrollbarHolder.appendTo(this.carouselRoot), this.scrollbarJQ = this._scrollbarHolder.find('.scrollbar'), this._scrollbarHideTimeout = '', this._scrollbarStyle = this.scrollbarJQ[0].style, this._scrollbarDist = 0, this.settings.scrollbarAutoHide ? (this._scrollbarVisible = !1, this.scrollbarJQ.css('opacity', 0))  : this._scrollbarVisible = !0)  : this.settings.scrollbarAutoHide = !1;
    this.updateCarouselSize(!0);
    this._itemsWrapper.bind(this._downEvent, function (a) {
      b._onDragStart(a)
    });
    this.settings.autoplay && 0 < this.settings.autoplayDelay ? (this._isHovering = !1, this.autoplayTimer = '', this.wasAutoplayRunning = !0, this.hasTouch || this.carouselRoot.hover(function () {
      b._isHovering = !0;
      b._stopAutoplay()
    }, function () {
      b._isHovering = !1;
      b._resumeAutoplay()
    }), this.autoplay = !0, this._releaseAutoplay())  : this.autoplay = !1;
    this.settings.keyboardNav && f(document).bind('keydown.touchcarousel', function (a) {
      b._blockClickEvents || (37 === a.keyCode ? b.prev()  : 39 === a.keyCode && b.next())
    });
    this.carouselRoot.css('overflow', 'visible')
  }
  r.prototype = {
    goTo: function (a, c) {
      var b = this.items[a];
      b && (!c && this.autoplay && this.settings.autoplayStopAtAction && this.stopAutoplay(), this._updatePagingNav(a), this.endPos = this._getXPos(), b = - b.posX, 0 < b ? b = 0 : b < this.carouselWidth - this._maxXPos && (b = this.carouselWidth - this._maxXPos), this.animateTo(b, this.settings.transitionSpeed, 'easeInOutSine'))
    },
    next: function (a) {
      var c = this._getXPos(),
      b = this._getItemAtPos(c).index;
      this._pagingEnabled ? (c = this._currPageId + 1, b = c > this._numPages - 1 ? this.settings.loopItems ? 0 : (this._numPages - 1) * this._itemsPerMove : c * this._itemsPerMove)  : (b += this._itemsPerMove, this.settings.loopItems && c <= this.carouselWidth - this._maxXPos && (b = 0), b > this.numItems - 1 && (b = this.numItems - 1));
      this.goTo(b, a)
    },
    prev: function (a) {
      var c = this._getXPos(),
      b = this._getItemAtPos(c).index;
      this._pagingEnabled ? (c = this._currPageId - 1, b = 0 > c ? this.settings.loopItems ? (this._numPages - 1) * this._itemsPerMove : 0 : c * this._itemsPerMove)  : (b -=
      this._itemsPerMove, 0 > b && (b = this.settings.loopItems ? 0 > c ? 0 : this.numItems - 1 : 0));
      this.goTo(b, a)
    },
    getCurrentId: function () {
      return this._getItemAtPos(this._getXPos()).index
    },
    getLastItemShowing: function () {
      return this._getLastItemAtPos(this._getXPos()).index
    },
    setXPos: function (a, c) {
      c ? this._scrollbarStyle[this._xProp] = this._xPref + a + this._xSuf : this._dragContainerStyle[this._xProp] = this._xPref + a + this._xSuf
    },
    stopAutoplay: function () {
      this._stopAutoplay();
      this.wasAutoplayRunning = this.autoplay = !1
    },
    resumeAutoplay: function () {
      this.autoplay = !0;
      this.wasAutoplayRunning || this._resumeAutoplay()
    },
    updateCarouselSize: function (a) {
      if (!this.settings.multiRow) {
        for (var c = 0, b = 0; b < this.numItems; b++) this.items[b].width = this.items[b].item.outerWidth(!0),
        this.items[b].posX = c,
        c += this.items[b].width;
        this._maxXPos = this._totalItemsWidth = c
      }
      this.carouselWidth = this.carouselRoot.width();
      if (this.settings.scrollToLast) {
        c = 0;
        if (this._pagingEnabled) if (b = this.numItems % this._itemsPerMove, 0 < b) for (b = this.numItems - b; b < this.numItems; b++) c += this.items[b].width;
         else c = this.carouselWidth;
         else c = this.items[this.numItems - 1].width;
        this._maxXPos = this._totalItemsWidth + this.carouselWidth - c
      } else this._maxXPos = this._totalItemsWidth;
      this.settings.scrollbar && (b = Math.round(this._scrollbarHolder.width() / (this._maxXPos / this.carouselWidth)), this.scrollbarJQ.css('width', b), this._scrollbarDist = this._scrollbarHolder.width() - b);
      if (!this.settings.scrollToLast) {
        if (this.carouselWidth >= this._totalItemsWidth) {
          this._wasBlocked = !0;
          this.settings.loopItems || (this._arrowRightBlocked = !0, this.arrowRight.addClass('disabled'), this._arrowLeftBlocked = !0, this.arrowLeft.addClass('disabled'));
          this.setXPos(0);
          return
        }
        this._wasBlocked && (this._arrowLeftBlocked = this._arrowRightBlocked = this._wasBlocked = !1)
      }
      a || (a = this.endPos = this._getXPos(), 0 < a ? a = 0 : a < this.carouselWidth - this._maxXPos && (a = this.carouselWidth - this._maxXPos), this.animateTo(a, 300, 'easeInOutSine'))
    },
    animateTo: function (a, c, b, e, d, g, l) {
      function k() {
        h._isAnimating = !1;
        h._releaseAutoplay();
        h.settings.scrollbarAutoHide && h._hideScrollbar();
        null !== h.settings.onAnimComplete && h.settings.onAnimComplete.call(h);
        h.settings.lastReachedEventCalled = !1
      }
      null !== this.settings.onAnimStart && this.settings.onAnimStart.call(this);
      this.autoplay && this.autoplayTimer && (this.wasAutoplayRunning = !0, this._stopAutoplay());
      this._stopAnimation();
      var h = this,
      m = this.settings.scrollbar,
      n = h._xProp,
      p = h._xPref,
      q = h._xSuf,
      r = {
        containerPos: this.endPos
      },
      t = {
        containerPos: a
      },
      x = {
        containerPos: d
      };
      d = e ? d : a;
      var u = h._dragContainerStyle;
      h._isAnimating = !0;
      if (m) {
        var v = this._scrollbarStyle,
        w = h._maxXPos - h.carouselWidth;
        this.settings.scrollbarAutoHide && (this._scrollbarVisible || this._showScrollbar())
      }
      this._updateDirectionNav(d);
      this._decelerationAnim = f(r).animate(t, {
        duration: c,
        easing: b,
        step: function () {
          m && (v[n] = p + Math.round( - this.containerPos / w * h._scrollbarDist) + q);
          u[n] = p + Math.round(this.containerPos) + q
        },
        complete: function () {
          e ? h._decelerationAnim = f(t).animate(x, {
            duration: g,
            easing: l,
            step: function () {
              m && (v[n] = p + Math.round( - this.containerPos / w * h._scrollbarDist) + q);
              u[n] = p + Math.round(this.containerPos) + q
            },
            complete: function () {
              m && (v[n] = p + Math.round( - x.containerPos / w * h._scrollbarDist) +
              q);
              u[n] = p + Math.round(x.containerPos) + q;
              k()
            }
          })  : (m && (v[n] = p + Math.round( - t.containerPos / w * h._scrollbarDist) + q), u[n] = p + Math.round(t.containerPos) + q, k())
        }
      })
    },
    destroy: function () {
      this.stopAutoplay();
      this._itemsWrapper.unbind(this._downEvent);
      f(document).unbind(this._moveEvent).unbind(this._upEvent);
      f(window).unbind(this._resizeEvent);
      this.settings.keyboardNav && f(document).unbind('keydown.touchcarousel');
      this.carouselRoot.remove()
    },
    destroy2: function () {
      this.stopAutoplay();
      this._itemsWrapper.unbind(this._downEvent);
      f(document).unbind(this._moveEvent).unbind(this._upEvent);
      f(window).unbind(this._resizeEvent);
      this.settings.keyboardNav && f(document).unbind('keydown.touchcarousel');
      var a = this._itemsWrapper.html();
      this._itemsWrapper.remove();
      this.carouselRoot.prepend(a)
    },
    _updatePagingNav: function (a) {
      this._pagingEnabled && (this._currPageId = a = this._getPageIdFromItemId(a), this.settings.pagingNavControls && (this._pagingItems.removeClass('current'), this._pagingItems.eq(a).addClass('current')))
    },
    _getPageIdFromItemId: function (a) {
      for (var c = this._itemsPerMove, b = 0; b < this._numPages; b++) if (a >= b * c && a < b * c + c) return b;
      return 0 > a ? 0 : a >= this._numPages ? this._numPages - 1 : !1
    },
    _enableArrows: function () {
      this.settings.loopItems || (this._arrowLeftBlocked ? (this._arrowLeftBlocked = !1, this.arrowLeft.removeClass('disabled'))  : this._arrowRightBlocked && (this._arrowRightBlocked = !1, this.arrowRight.removeClass('disabled')))
    },
    _disableLeftArrow: function () {
      this._arrowLeftBlocked || this.settings.loopItems || (this._arrowLeftBlocked = !0, this.arrowLeft.addClass('disabled'), this._arrowRightBlocked && (this._arrowRightBlocked = !1, this.arrowRight.removeClass('disabled')))
    },
    _disableRightArrow: function () {
      this._arrowRightBlocked || this.settings.loopItems || (this._arrowRightBlocked = !0, this.arrowRight.addClass('disabled'), this._arrowLeftBlocked && (this._arrowLeftBlocked = !1, this.arrowLeft.removeClass('disabled')))
    },
    _getLastItemAtPos: function (a) {
      a = - a;
      for (var c = [
      ], b = 0; b < this.numItems; b++) currItem = this.items[b],
      this.carouselRoot.width() + a >= currItem.posX + currItem.width && c.push(currItem);
      return c.pop()
    },
    _getItemAtPos: function (a) {
      a = - a;
      for (var c, b = 0; b < this.numItems; b++) if (c = this.items[b], a >= c.posX && a < c.posX + c.width) return c;
      return - 1
    },
    _releaseAutoplay: function () {
      this.autoplay && this.wasAutoplayRunning && (this._isHovering || this._resumeAutoplay(), this.wasAutoplayRunning = !1)
    },
    _hideScrollbar: function () {
      var a = this;
      this._scrollbarVisible = !1;
      this._scrollbarHideTimeout && clearTimeout(this._scrollbarHideTimeout);
      this._scrollbarHideTimeout = setTimeout(function () {
        a.scrollbarJQ.animate({
          opacity: 0
        }, 150, 'linear')
      }, 450)
    },
    _showScrollbar: function () {
      this._scrollbarVisible = !0;
      this._scrollbarHideTimeout && clearTimeout(this._scrollbarHideTimeout);
      this.scrollbarJQ.stop().animate({
        opacity: 1
      }, 150, 'linear')
    },
    _stopAnimation: function () {
      this._decelerationAnim && this._decelerationAnim.stop()
    },
    _resumeAutoplay: function () {
      if (this.autoplay) {
        var a = this;
        this.autoplayTimer || (this.autoplayTimer = setInterval(function () {
          a._isDragging || a._isAnimating || a.next(!0)
        }, this.settings.autoplayDelay))
      }
    },
    _stopAutoplay: function () {
      this.autoplayTimer && (clearInterval(this.autoplayTimer), this.autoplayTimer = '')
    },
    _getXPos: function (a) {
      a = a ? this.scrollbarJQ : this._dragContainer;
      return this._useWebkitTransition ? (a = a.css('-webkit-transform').replace(/^matrix\(/i, '').split(/, |\)$/g), parseInt(a[4], 10))  : Math.round(a.position().left)
    },
    _onDragStart: function (a) {
      if (!this._isDragging) {
        this.autoplay && this.settings.autoplayStopAtAction && this.stopAutoplay();
        this._stopAnimation();
        this.settings.scrollbarAutoHide && this._showScrollbar();
        var c;
        if (this.hasTouch) if (this._lockYAxis = !1, (c = a.originalEvent.touches) && 0 < c.length) c = c[0];
         else return !1;
         else c = a,
        a.preventDefault();
        this._setGrabbingCursor();
        this._isDragging = !0;
        var b = this;
        this._useWebkitTransition && b._dragContainer.css({
          '-webkit-transition-duration': '0',
          '-webkit-transition-property': 'none'
        });
        f(document).bind(this._moveEvent, function (a) {
          b._onDragMove(a)
        });
        f(document).bind(this._upEvent, function (a) {
          b._onDragRelease(a)
        });
        this._startPos = this._getXPos();
        this._accelerationX = c.clientX;
        this._successfullyDragged = !1;
        this._startTime = a.timeStamp || (new Date).getTime();
        this._moveDist = 0;
        this._prevMouseX = this._startMouseX = c.clientX;
        this._startMouseY = c.clientY
      }
    },
    _onDragMove: function (a) {
      var c = a.timeStamp || (new Date).getTime(),
      b;
      if (this.hasTouch) {
        if (this._lockYAxis) return !1;
        b = a.originalEvent.touches;
        if (1 < b.length) return !1;
        b = b[0];
        if (Math.abs(b.clientY - this._startMouseY) > Math.abs(b.clientX - this._startMouseX) + 3) return this.settings.lockAxis && (this._lockYAxis = !0),
        !1
      } else b = a;
      a.preventDefault();
      this._latestDragX = b.clientX;
      this._lastDragPosition = this._currentDragPosition;
      a = b.clientX - this._prevMouseX;
      this._lastDragPosition != a && (this._currentDragPosition = a);
      if (0 != a) {
        var e = this._startPos + this._moveDist;
        0 <= e ? (a /= 4, this._disableLeftArrow())  : e <= this.carouselWidth - this._maxXPos ? (this._disableRightArrow(), a /= 4)  : this._enableArrows();
        this._moveDist += a;
        this.setXPos(e);
        - this._getXPos() >= this._maxXPos - this.carouselWidth && null !== this.settings.onLastReached && 0 >= a && !this.settings.lastReachedEventCalled && (this.settings.onLastReached.call(this), this.settings.lastReachedEventCalled = !0);
        this.settings.scrollbar && this.setXPos( - e / (this._maxXPos - this.carouselWidth) * this._scrollbarDist, !0)
      }
      this._prevMouseX = b.clientX;
      350 < c - this._startTime && (this._startTime = c, this._accelerationX = b.clientX);
      null !== this.settings.onDragStart && this.settings.onDragStart.call(this);
      return !1
    },
    _onDragRelease: function (a) {
      if (this._isDragging) {
        var c = function (a) {
          0 < a ? a = 0 : a < b.carouselWidth - b._maxXPos && (a = b.carouselWidth - b._maxXPos);
          return a
        },
        b = this;
        this._isDragging = !1;
        this._setGrabCursor();
        this.endPos = this._getXPos();
        this.isdrag = !1;
        f(document).unbind(this._moveEvent).unbind(this._upEvent);
        if (this.endPos == this._startPos) {
          this._successfullyDragged = !1;
          this.settings.scrollbarAutoHide && this._hideScrollbar();
          return
        }
        this._successfullyDragged = !0;
        var e = this._latestDragX - this._accelerationX;
        a = Math.max(40, (a.timeStamp || (new Date).getTime()) - this._startTime);
        var d = 0.5;
        a = Math.abs(e) / a;
        if (this.settings.snapToItems) {
          this.autoplay && this.settings.autoplayStopAtAction && this.stopAutoplay();
          var e = 0 < this._startMouseX - this._prevMouseX,
          d = c(this._getXPos()),
          g = this._getItemAtPos(d).index;
          this._pagingEnabled ? (e && (d = Math.max(d - this.carouselWidth - 1, 1 - b._maxXPos), g = this._getItemAtPos(d).index, void 0 === g && (g = this.numItems - 1)), g = this._getPageIdFromItemId(g) * this._itemsPerMove)  : g += e ? this._itemsPerMove : - this._itemsPerMove + 1;
          g = e ? Math.min(g, this.numItems - 1)  : Math.max(g, 0);
          d = this.items[g];
          this._updatePagingNav(g);
          d && (d = c( - d.posX), c = Math.abs(this.endPos - d), a = Math.max(1.08 * c / a, 150), g = 180 > a, c *= 0.08, e && (c *= - 1), this.animateTo(g ? d + c : d, Math.min(a, 400), 'easeOutSine', g, d, 300, 'easeOutCubic'))
        } else c = 0,
        2 >= a ? (d = 3.5 * this._baseFriction, c = 0)  : 2 < a && 3 >= a ? (d = 4 * this._baseFriction, c = 200)  : 3 < a && (c = 300, 4 < a && (a = 4, c = 400, d = 6 * this._baseFriction), d = 5 * this._baseFriction),
        e = a * a * 2 / (2 * d) * (0 > e ? - 1 : 1),
        d = 2 * a / d + c,
        0 < this.endPos + e ? 0 < this.endPos ? this.animateTo(0, 800, 'easeOutCubic')  : this.animateTo(this.carouselWidth / 10 * ((c + 200) / 1000), 1.1 * Math.abs(this.endPos) / a, 'easeOutSine', !0, 0, 400, 'easeOutCubic')  : this.endPos + e < this.carouselWidth - this._maxXPos ? this.endPos < this.carouselWidth - this._maxXPos ?
        this.animateTo(this.carouselWidth - this._maxXPos, 800, 'easeOutCubic')  : this.animateTo(this.carouselWidth - this._maxXPos - this.carouselWidth / 10 * ((c + 200) / 1000), 1.1 * Math.abs(this.carouselWidth - this._maxXPos - this.endPos) / a, 'easeOutSine', !0, this.carouselWidth - this._maxXPos, 400, 'easeOutCubic')  : this.animateTo(this.endPos + e, d, 'easeOutCubic');
        null !== this.settings.onDragRelease && this.settings.onDragRelease.call(this)
      }
      return !1
    },
    _updateDirectionNav: function (a) {
      void 0 === a && (a = this._getXPos());
      this.settings.loopItems || (0 <= a ? this._disableLeftArrow()  : a <= this.carouselWidth - this._maxXPos ? this._disableRightArrow()  : this._enableArrows())
    },
    _setGrabCursor: function () {
      this._grabCursor ? this._itemsWrapper.css('cursor', this._grabCursor)  : (this._itemsWrapper.removeClass('grabbing-cursor'), this._itemsWrapper.addClass('grab-cursor'))
    },
    _setGrabbingCursor: function () {
      this._grabbingCursor ? this._itemsWrapper.css('cursor', this._grabbingCursor)  : (this._itemsWrapper.removeClass('grab-cursor'), this._itemsWrapper.addClass('grabbing-cursor'))
    }
  };
  f.fn.touchCarousel = function (a) {
    return this.each(function () {
      var c = new r(f(this), a);
      f(this).data('touchCarousel', c)
    })
  };
  f.fn.touchCarousel.defaults = {
    itemsPerMove: 1,
    snapToItems: !1,
    pagingNav: !1,
    pagingNavControls: !0,
    multiRow: !1,
    autoplay: !1,
    autoplayDelay: 3000,
    autoplayStopAtAction: !0,
    scrollbar: !0,
    scrollbarAutoHide: !1,
    scrollbarTheme: 'dark',
    transitionSpeed: 600,
    directionNav: !0,
    directionNavAutoHide: !1,
    loopItems: !1,
    keyboardNav: !1,
    dragUsingMouse: !0,
    scrollToLast: !1,
    itemFallbackWidth: 500,
    baseMouseFriction: 0.0012,
    baseTouchFriction: 0.0008,
    lockAxis: !0,
    useWebkit3d: !1,
    onLastReached: null,
    onAnimStart: null,
    onAnimComplete: null,
    onDragStart: null,
    onDragRelease: null
  };
  f.fn.touchCarousel.settings = {
  };
  f.extend(jQuery.easing, {
    easeInOutSine: function (a, c, b, e, d) {
      return - e / 2 * (Math.cos(Math.PI * c / d) - 1) + b
    },
    easeOutSine: function (a, c, b, e, d) {
      return e * Math.sin(c / d * (Math.PI / 2)) + b
    },
    easeOutCubic: function (a, c, b, e, d) {
      return e * ((c = c / d - 1) * c * c + 1) + b
    }
  })
}) (jQuery);
