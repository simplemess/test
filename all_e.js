/* ========================================================================
 * Bootstrap Dropdowns Enhancement: dropdowns-enhancement.js v3.1.1 (Beta 1)
 * http://behigh.github.io/bootstrap_dropdowns_enhancement/
 * ========================================================================
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function($) {
    "use strict";

    var toggle   = '[data-toggle="dropdown"]',
        disabled = '.disabled, :disabled',
        backdrop = '.dropdown-backdrop',
        menuClass = 'dropdown-menu',
        subMenuClass = 'dropdown-submenu',
        namespace = '.bs.dropdown.data-api',
        eventNamespace = '.bs.dropdown',
        openClass = 'show', // open
        touchSupport = 'ontouchstart' in document.documentElement,
        opened;


    function Dropdown(element) {
        $(element).on('click' + eventNamespace, this.toggle)
    }

    var proto = Dropdown.prototype;

    proto.toggle = function(event) {
        var $element = $(this);

        if ($element.is(disabled)) return;

        var $parent = getParent($element);
        var isActive = $parent.hasClass(openClass);
        var isSubMenu = $parent.hasClass(subMenuClass);
        var menuTree = isSubMenu ? getSubMenuParents($parent) : null;

        closeOpened(event, menuTree);

        if (!isActive) {
            if (!menuTree)
                menuTree = [$parent];

            if (touchSupport && !$parent.closest('.navbar-nav').length && !menuTree[0].find(backdrop).length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="' + backdrop.substr(1) + '"/>').appendTo(menuTree[0]).on('click', closeOpened)
            }

            for (var i = 0, s = menuTree.length; i < s; i++) {
                if (!menuTree[i].hasClass(openClass)) {
                    menuTree[i].addClass(openClass);

                    // bootstrap 4+
                    menuTree[i].find('.' + menuClass).addClass(openClass);
                    positioning(menuTree[i].children('.' + menuClass), menuTree[i]);
                }
            }
            opened = menuTree[0];
        }

        return false;
    };

    proto.keydown = function (e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) return;

        var $parent = getParent($this);
        var isActive = $parent.hasClass(openClass);

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus');
            return $this.trigger('click')
        }

        var desc = ' li:not(.divider):visible a';
        var desc1 = 'li:not(.divider):visible > input:not(disabled) ~ label';
        var $items = $parent.find(desc1 + ', ' + '[role="menu"]' + desc + ', [role="listbox"]' + desc);

        if (!$items.length) return;

        var index = $items.index($items.filter(':focus'));

        if (e.keyCode == 38 && index > 0)                 index--;                        // up
        if (e.keyCode == 40 && index < $items.length - 1) index++;                        // down
        if (!~index)                                      index = 0;

        $items.eq(index).trigger('focus')
    };

    proto.change = function (e) {
        var
            $parent,
            $menu,
            $toggle,
            selector,
            text = '',
            $items,
			maxItems,
			maxText;

        $menu = $(this).closest('.' + menuClass);

        $toggle = $menu.parent().find('[data-label-placement]');

        if (!$toggle || !$toggle.length) {
            $toggle = $menu.parent().find(toggle);
        }

        if (!$toggle || !$toggle.length || $toggle.data('placeholder') === false)
            return; // do nothing, no control

        ($toggle.data('placeholder') == undefined && $toggle.data('placeholder', $.trim($toggle.text())));
        text = $.data($toggle[0], 'placeholder');

		maxItems = parseInt($toggle.data('maxItems'));
		if (isNaN(maxItems)) {
			maxItems = 1;
		}

		(!(maxText = $toggle.data('maxText')) && (maxText = '%s selected'));

        $items = $menu.find('li > input:checked');

        if ($items.length) {
            text = [];
            $items.each(function () {
                var str = $(this).parent().find('label').eq(0),
                    label = str.find('.data-label');

                if (label.length) {
                    var p = $('<p></p>');
                    p.append(label.clone());
                    str = p.html();
                }
                else {
                    str = str.html();
                }


                str && text.push($.trim(str));
            });

            text = text.length > maxItems ? maxText.replace('%s', text.length) : text.join(', ');
        }

        var caret = $toggle.find('.caret');

        $toggle.html(text || '&nbsp;');
        if (caret.length)
            $toggle.append(' ') && caret.appendTo($toggle);

    };

    function positioning($menu, $control) {
        if ($menu.hasClass('pull-center')) {
            $menu.css('margin-right', $menu.outerWidth() / -2);
        }

        if ($menu.hasClass('pull-middle')) {
            $menu.css('margin-top', ($menu.outerHeight() / -2) - ($control.outerHeight() / 2));
        }
    }

    function closeOpened(event, menuTree) {
        if (opened) {

            if (!menuTree) {
                menuTree = [opened];
            }

            var parent;

            if (opened[0] !== menuTree[0][0]) {
                parent = opened;
            } else {
                parent = menuTree[menuTree.length - 1];
                if (parent.parent().hasClass(menuClass)) {
                    parent = parent.parent();
                }
            }
            parent.find('.' + openClass).removeClass(openClass);

            // bootstrap 4+
            parent.find('.' + menuClass).removeClass(openClass);

            if (parent.hasClass(openClass))
                parent.removeClass(openClass);

            if (parent === opened) {
                opened = null;
                $(backdrop).remove();
            }
        }
    }

    function getSubMenuParents($submenu) {
        var result = [$submenu];
        var $parent;
        while (!$parent || $parent.hasClass(subMenuClass)) {
            $parent = ($parent || $submenu).parent();
            if ($parent.hasClass(menuClass)) {
                $parent = $parent.parent();
            }
            if ($parent.children(toggle)) {
                result.unshift($parent);
            }
        }
        return result;
    }

    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent()
    }

    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    var old = $.fn.dropdown;

    $.fn.dropdown = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.dropdown');

            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)));
            if (typeof option == 'string') data[option].call($this);
        })
    };

    $.fn.dropdown.Constructor = Dropdown;

    $.fn.dropdown.clearMenus = function(e) {
        $(backdrop).remove();
        $('.' + openClass + ' ' + toggle).each(function () {
            var $parent = getParent($(this));
            var relatedTarget = { relatedTarget: this };
            if (!$parent.hasClass(openClass)) return;
            $parent.trigger(e = $.Event('hide' + eventNamespace, relatedTarget));
            if (e.isDefaultPrevented()) return;
            $parent.removeClass(openClass).trigger('hidden' + eventNamespace, relatedTarget);
        });
        return this;
    };


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this
    };


    // load default
    $(document).ready(function($) {
        $('.' + menuClass).each(function(index, el) {
            proto.change.call(el, null);
        });
    });

    $(document).off(namespace)
        .on('click' + namespace, closeOpened)
        .on('click' + namespace, toggle, proto.toggle)
        .on('click' + namespace, '.dropdown-menu > li > input[type="checkbox"] ~ label, .dropdown-menu > li > input[type="checkbox"], .dropdown-menu.noclose > li', function (e) {
            e.stopPropagation()
        })
        .on('change' + namespace, '.dropdown-menu > li > input[type="checkbox"], .dropdown-menu > li > input[type="radio"]', proto.change)
        .on('keydown' + namespace, toggle + ', [role="menu"], [role="listbox"]', proto.keydown)
}(jQuery));

/*! tooltipster v4.2.8 */!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],function(a){return b(a)}):"object"==typeof exports?module.exports=b(require("jquery")):b(jQuery)}(this,function(a){function b(a){this.$container,this.constraints=null,this.__$tooltip,this.__init(a)}function c(b,c){var d=!0;return a.each(b,function(a,e){return void 0===c[a]||b[a]!==c[a]?(d=!1,!1):void 0}),d}function d(b){var c=b.attr("id"),d=c?h.window.document.getElementById(c):null;return d?d===b[0]:a.contains(h.window.document.body,b[0])}function e(){if(!g)return!1;var a=g.document.body||g.document.documentElement,b=a.style,c="transition",d=["Moz","Webkit","Khtml","O","ms"];if("string"==typeof b[c])return!0;c=c.charAt(0).toUpperCase()+c.substr(1);for(var e=0;e<d.length;e++)if("string"==typeof b[d[e]+c])return!0;return!1}var f={animation:"fade",animationDuration:350,content:null,contentAsHTML:!1,contentCloning:!1,debug:!0,delay:300,delayTouch:[300,500],functionInit:null,functionBefore:null,functionReady:null,functionAfter:null,functionFormat:null,IEmin:6,interactive:!1,multiple:!1,parent:null,plugins:["sideTip"],repositionOnScroll:!1,restoration:"none",selfDestruction:!0,theme:[],timer:0,trackerInterval:500,trackOrigin:!1,trackTooltip:!1,trigger:"hover",triggerClose:{click:!1,mouseleave:!1,originClick:!1,scroll:!1,tap:!1,touchleave:!1},triggerOpen:{click:!1,mouseenter:!1,tap:!1,touchstart:!1},updateAnimation:"rotate",zIndex:9999999},g="undefined"!=typeof window?window:null,h={hasTouchCapability:!(!g||!("ontouchstart"in g||g.DocumentTouch&&g.document instanceof g.DocumentTouch||g.navigator.maxTouchPoints)),hasTransitions:e(),IE:!1,semVer:"4.2.8",window:g},i=function(){this.__$emitterPrivate=a({}),this.__$emitterPublic=a({}),this.__instancesLatestArr=[],this.__plugins={},this._env=h};i.prototype={__bridge:function(b,c,d){if(!c[d]){var e=function(){};e.prototype=b;var g=new e;g.__init&&g.__init(c),a.each(b,function(a,b){0!=a.indexOf("__")&&(c[a]?f.debug&&console.log("The "+a+" method of the "+d+" plugin conflicts with another plugin or native methods"):(c[a]=function(){return g[a].apply(g,Array.prototype.slice.apply(arguments))},c[a].bridged=g))}),c[d]=g}return this},__setWindow:function(a){return h.window=a,this},_getRuler:function(a){return new b(a)},_off:function(){return this.__$emitterPrivate.off.apply(this.__$emitterPrivate,Array.prototype.slice.apply(arguments)),this},_on:function(){return this.__$emitterPrivate.on.apply(this.__$emitterPrivate,Array.prototype.slice.apply(arguments)),this},_one:function(){return this.__$emitterPrivate.one.apply(this.__$emitterPrivate,Array.prototype.slice.apply(arguments)),this},_plugin:function(b){var c=this;if("string"==typeof b){var d=b,e=null;return d.indexOf(".")>0?e=c.__plugins[d]:a.each(c.__plugins,function(a,b){return b.name.substring(b.name.length-d.length-1)=="."+d?(e=b,!1):void 0}),e}if(b.name.indexOf(".")<0)throw new Error("Plugins must be namespaced");return c.__plugins[b.name]=b,b.core&&c.__bridge(b.core,c,b.name),this},_trigger:function(){var a=Array.prototype.slice.apply(arguments);return"string"==typeof a[0]&&(a[0]={type:a[0]}),this.__$emitterPrivate.trigger.apply(this.__$emitterPrivate,a),this.__$emitterPublic.trigger.apply(this.__$emitterPublic,a),this},instances:function(b){var c=[],d=b||".tooltipstered";return a(d).each(function(){var b=a(this),d=b.data("tooltipster-ns");d&&a.each(d,function(a,d){c.push(b.data(d))})}),c},instancesLatest:function(){return this.__instancesLatestArr},off:function(){return this.__$emitterPublic.off.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this},on:function(){return this.__$emitterPublic.on.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this},one:function(){return this.__$emitterPublic.one.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this},origins:function(b){var c=b?b+" ":"";return a(c+".tooltipstered").toArray()},setDefaults:function(b){return a.extend(f,b),this},triggerHandler:function(){return this.__$emitterPublic.triggerHandler.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this}},a.tooltipster=new i,a.Tooltipster=function(b,c){this.__callbacks={close:[],open:[]},this.__closingTime,this.__Content,this.__contentBcr,this.__destroyed=!1,this.__$emitterPrivate=a({}),this.__$emitterPublic=a({}),this.__enabled=!0,this.__garbageCollector,this.__Geometry,this.__lastPosition,this.__namespace="tooltipster-"+Math.round(1e6*Math.random()),this.__options,this.__$originParents,this.__pointerIsOverOrigin=!1,this.__previousThemes=[],this.__state="closed",this.__timeouts={close:[],open:null},this.__touchEvents=[],this.__tracker=null,this._$origin,this._$tooltip,this.__init(b,c)},a.Tooltipster.prototype={__init:function(b,c){var d=this;if(d._$origin=a(b),d.__options=a.extend(!0,{},f,c),d.__optionsFormat(),!h.IE||h.IE>=d.__options.IEmin){var e=null;if(void 0===d._$origin.data("tooltipster-initialTitle")&&(e=d._$origin.attr("title"),void 0===e&&(e=null),d._$origin.data("tooltipster-initialTitle",e)),null!==d.__options.content)d.__contentSet(d.__options.content);else{var g,i=d._$origin.attr("data-tooltip-content");i&&(g=a(i)),g&&g[0]?d.__contentSet(g.first()):d.__contentSet(e)}d._$origin.removeAttr("title").addClass("tooltipstered"),d.__prepareOrigin(),d.__prepareGC(),a.each(d.__options.plugins,function(a,b){d._plug(b)}),h.hasTouchCapability&&a(h.window.document.body).on("touchmove."+d.__namespace+"-triggerOpen",function(a){d._touchRecordEvent(a)}),d._on("created",function(){d.__prepareTooltip()})._on("repositioned",function(a){d.__lastPosition=a.position})}else d.__options.disabled=!0},__contentInsert:function(){var a=this,b=a._$tooltip.find(".tooltipster-content"),c=a.__Content,d=function(a){c=a};return a._trigger({type:"format",content:a.__Content,format:d}),a.__options.functionFormat&&(c=a.__options.functionFormat.call(a,a,{origin:a._$origin[0]},a.__Content)),"string"!=typeof c||a.__options.contentAsHTML?b.empty().append(c):b.text(c),a},__contentSet:function(b){return b instanceof a&&this.__options.contentCloning&&(b=b.clone(!0)),this.__Content=b,this._trigger({type:"updated",content:b}),this},__destroyError:function(){throw new Error("This tooltip has been destroyed and cannot execute your method call.")},__geometry:function(){var b=this,c=b._$origin,d=b._$origin.is("area");if(d){var e=b._$origin.parent().attr("name");c=a('img[usemap="#'+e+'"]')}var f=c[0].getBoundingClientRect(),g=a(h.window.document),i=a(h.window),j=c,k={available:{document:null,window:null},document:{size:{height:g.height(),width:g.width()}},window:{scroll:{left:h.window.scrollX||h.window.document.documentElement.scrollLeft,top:h.window.scrollY||h.window.document.documentElement.scrollTop},size:{height:i.height(),width:i.width()}},origin:{fixedLineage:!1,offset:{},size:{height:f.bottom-f.top,width:f.right-f.left},usemapImage:d?c[0]:null,windowOffset:{bottom:f.bottom,left:f.left,right:f.right,top:f.top}}};if(d){var l=b._$origin.attr("shape"),m=b._$origin.attr("coords");if(m&&(m=m.split(","),a.map(m,function(a,b){m[b]=parseInt(a)})),"default"!=l)switch(l){case"circle":var n=m[0],o=m[1],p=m[2],q=o-p,r=n-p;k.origin.size.height=2*p,k.origin.size.width=k.origin.size.height,k.origin.windowOffset.left+=r,k.origin.windowOffset.top+=q;break;case"rect":var s=m[0],t=m[1],u=m[2],v=m[3];k.origin.size.height=v-t,k.origin.size.width=u-s,k.origin.windowOffset.left+=s,k.origin.windowOffset.top+=t;break;case"poly":for(var w=0,x=0,y=0,z=0,A="even",B=0;B<m.length;B++){var C=m[B];"even"==A?(C>y&&(y=C,0===B&&(w=y)),w>C&&(w=C),A="odd"):(C>z&&(z=C,1==B&&(x=z)),x>C&&(x=C),A="even")}k.origin.size.height=z-x,k.origin.size.width=y-w,k.origin.windowOffset.left+=w,k.origin.windowOffset.top+=x}}var D=function(a){k.origin.size.height=a.height,k.origin.windowOffset.left=a.left,k.origin.windowOffset.top=a.top,k.origin.size.width=a.width};for(b._trigger({type:"geometry",edit:D,geometry:{height:k.origin.size.height,left:k.origin.windowOffset.left,top:k.origin.windowOffset.top,width:k.origin.size.width}}),k.origin.windowOffset.right=k.origin.windowOffset.left+k.origin.size.width,k.origin.windowOffset.bottom=k.origin.windowOffset.top+k.origin.size.height,k.origin.offset.left=k.origin.windowOffset.left+k.window.scroll.left,k.origin.offset.top=k.origin.windowOffset.top+k.window.scroll.top,k.origin.offset.bottom=k.origin.offset.top+k.origin.size.height,k.origin.offset.right=k.origin.offset.left+k.origin.size.width,k.available.document={bottom:{height:k.document.size.height-k.origin.offset.bottom,width:k.document.size.width},left:{height:k.document.size.height,width:k.origin.offset.left},right:{height:k.document.size.height,width:k.document.size.width-k.origin.offset.right},top:{height:k.origin.offset.top,width:k.document.size.width}},k.available.window={bottom:{height:Math.max(k.window.size.height-Math.max(k.origin.windowOffset.bottom,0),0),width:k.window.size.width},left:{height:k.window.size.height,width:Math.max(k.origin.windowOffset.left,0)},right:{height:k.window.size.height,width:Math.max(k.window.size.width-Math.max(k.origin.windowOffset.right,0),0)},top:{height:Math.max(k.origin.windowOffset.top,0),width:k.window.size.width}};"html"!=j[0].tagName.toLowerCase();){if("fixed"==j.css("position")){k.origin.fixedLineage=!0;break}j=j.parent()}return k},__optionsFormat:function(){return"number"==typeof this.__options.animationDuration&&(this.__options.animationDuration=[this.__options.animationDuration,this.__options.animationDuration]),"number"==typeof this.__options.delay&&(this.__options.delay=[this.__options.delay,this.__options.delay]),"number"==typeof this.__options.delayTouch&&(this.__options.delayTouch=[this.__options.delayTouch,this.__options.delayTouch]),"string"==typeof this.__options.theme&&(this.__options.theme=[this.__options.theme]),null===this.__options.parent?this.__options.parent=a(h.window.document.body):"string"==typeof this.__options.parent&&(this.__options.parent=a(this.__options.parent)),"hover"==this.__options.trigger?(this.__options.triggerOpen={mouseenter:!0,touchstart:!0},this.__options.triggerClose={mouseleave:!0,originClick:!0,touchleave:!0}):"click"==this.__options.trigger&&(this.__options.triggerOpen={click:!0,tap:!0},this.__options.triggerClose={click:!0,tap:!0}),this._trigger("options"),this},__prepareGC:function(){var b=this;return b.__options.selfDestruction?b.__garbageCollector=setInterval(function(){var c=(new Date).getTime();b.__touchEvents=a.grep(b.__touchEvents,function(a,b){return c-a.time>6e4}),d(b._$origin)||b.close(function(){b.destroy()})},2e4):clearInterval(b.__garbageCollector),b},__prepareOrigin:function(){var a=this;if(a._$origin.off("."+a.__namespace+"-triggerOpen"),h.hasTouchCapability&&a._$origin.on("touchstart."+a.__namespace+"-triggerOpen touchend."+a.__namespace+"-triggerOpen touchcancel."+a.__namespace+"-triggerOpen",function(b){a._touchRecordEvent(b)}),a.__options.triggerOpen.click||a.__options.triggerOpen.tap&&h.hasTouchCapability){var b="";a.__options.triggerOpen.click&&(b+="click."+a.__namespace+"-triggerOpen "),a.__options.triggerOpen.tap&&h.hasTouchCapability&&(b+="touchend."+a.__namespace+"-triggerOpen"),a._$origin.on(b,function(b){a._touchIsMeaningfulEvent(b)&&a._open(b)})}if(a.__options.triggerOpen.mouseenter||a.__options.triggerOpen.touchstart&&h.hasTouchCapability){var b="";a.__options.triggerOpen.mouseenter&&(b+="mouseenter."+a.__namespace+"-triggerOpen "),a.__options.triggerOpen.touchstart&&h.hasTouchCapability&&(b+="touchstart."+a.__namespace+"-triggerOpen"),a._$origin.on(b,function(b){!a._touchIsTouchEvent(b)&&a._touchIsEmulatedEvent(b)||(a.__pointerIsOverOrigin=!0,a._openShortly(b))})}if(a.__options.triggerClose.mouseleave||a.__options.triggerClose.touchleave&&h.hasTouchCapability){var b="";a.__options.triggerClose.mouseleave&&(b+="mouseleave."+a.__namespace+"-triggerOpen "),a.__options.triggerClose.touchleave&&h.hasTouchCapability&&(b+="touchend."+a.__namespace+"-triggerOpen touchcancel."+a.__namespace+"-triggerOpen"),a._$origin.on(b,function(b){a._touchIsMeaningfulEvent(b)&&(a.__pointerIsOverOrigin=!1)})}return a},__prepareTooltip:function(){var b=this,c=b.__options.interactive?"auto":"";return b._$tooltip.attr("id",b.__namespace).css({"pointer-events":c,zIndex:b.__options.zIndex}),a.each(b.__previousThemes,function(a,c){b._$tooltip.removeClass(c)}),a.each(b.__options.theme,function(a,c){b._$tooltip.addClass(c)}),b.__previousThemes=a.merge([],b.__options.theme),b},__scrollHandler:function(b){var c=this;if(c.__options.triggerClose.scroll)c._close(b);else if(d(c._$origin)&&d(c._$tooltip)){var e=null;if(b.target===h.window.document)c.__Geometry.origin.fixedLineage||c.__options.repositionOnScroll&&c.reposition(b);else{e=c.__geometry();var f=!1;if("fixed"!=c._$origin.css("position")&&c.__$originParents.each(function(b,c){var d=a(c),g=d.css("overflow-x"),h=d.css("overflow-y");if("visible"!=g||"visible"!=h){var i=c.getBoundingClientRect();if("visible"!=g&&(e.origin.windowOffset.left<i.left||e.origin.windowOffset.right>i.right))return f=!0,!1;if("visible"!=h&&(e.origin.windowOffset.top<i.top||e.origin.windowOffset.bottom>i.bottom))return f=!0,!1}return"fixed"==d.css("position")?!1:void 0}),f)c._$tooltip.css("visibility","hidden");else if(c._$tooltip.css("visibility","visible"),c.__options.repositionOnScroll)c.reposition(b);else{var g=e.origin.offset.left-c.__Geometry.origin.offset.left,i=e.origin.offset.top-c.__Geometry.origin.offset.top;c._$tooltip.css({left:c.__lastPosition.coord.left+g,top:c.__lastPosition.coord.top+i})}}c._trigger({type:"scroll",event:b,geo:e})}return c},__stateSet:function(a){return this.__state=a,this._trigger({type:"state",state:a}),this},__timeoutsClear:function(){return clearTimeout(this.__timeouts.open),this.__timeouts.open=null,a.each(this.__timeouts.close,function(a,b){clearTimeout(b)}),this.__timeouts.close=[],this},__trackerStart:function(){var a=this,b=a._$tooltip.find(".tooltipster-content");return a.__options.trackTooltip&&(a.__contentBcr=b[0].getBoundingClientRect()),a.__tracker=setInterval(function(){if(d(a._$origin)&&d(a._$tooltip)){if(a.__options.trackOrigin){var e=a.__geometry(),f=!1;c(e.origin.size,a.__Geometry.origin.size)&&(a.__Geometry.origin.fixedLineage?c(e.origin.windowOffset,a.__Geometry.origin.windowOffset)&&(f=!0):c(e.origin.offset,a.__Geometry.origin.offset)&&(f=!0)),f||(a.__options.triggerClose.mouseleave?a._close():a.reposition())}if(a.__options.trackTooltip){var g=b[0].getBoundingClientRect();g.height===a.__contentBcr.height&&g.width===a.__contentBcr.width||(a.reposition(),a.__contentBcr=g)}}else a._close()},a.__options.trackerInterval),a},_close:function(b,c,d){var e=this,f=!0;if(e._trigger({type:"close",event:b,stop:function(){f=!1}}),f||d){c&&e.__callbacks.close.push(c),e.__callbacks.open=[],e.__timeoutsClear();var g=function(){a.each(e.__callbacks.close,function(a,c){c.call(e,e,{event:b,origin:e._$origin[0]})}),e.__callbacks.close=[]};if("closed"!=e.__state){var i=!0,j=new Date,k=j.getTime(),l=k+e.__options.animationDuration[1];if("disappearing"==e.__state&&l>e.__closingTime&&e.__options.animationDuration[1]>0&&(i=!1),i){e.__closingTime=l,"disappearing"!=e.__state&&e.__stateSet("disappearing");var m=function(){clearInterval(e.__tracker),e._trigger({type:"closing",event:b}),e._$tooltip.off("."+e.__namespace+"-triggerClose").removeClass("tooltipster-dying"),a(h.window).off("."+e.__namespace+"-triggerClose"),e.__$originParents.each(function(b,c){a(c).off("scroll."+e.__namespace+"-triggerClose")}),e.__$originParents=null,a(h.window.document.body).off("."+e.__namespace+"-triggerClose"),e._$origin.off("."+e.__namespace+"-triggerClose"),e._off("dismissable"),e.__stateSet("closed"),e._trigger({type:"after",event:b}),e.__options.functionAfter&&e.__options.functionAfter.call(e,e,{event:b,origin:e._$origin[0]}),g()};h.hasTransitions?(e._$tooltip.css({"-moz-animation-duration":e.__options.animationDuration[1]+"ms","-ms-animation-duration":e.__options.animationDuration[1]+"ms","-o-animation-duration":e.__options.animationDuration[1]+"ms","-webkit-animation-duration":e.__options.animationDuration[1]+"ms","animation-duration":e.__options.animationDuration[1]+"ms","transition-duration":e.__options.animationDuration[1]+"ms"}),e._$tooltip.clearQueue().removeClass("tooltipster-show").addClass("tooltipster-dying"),e.__options.animationDuration[1]>0&&e._$tooltip.delay(e.__options.animationDuration[1]),e._$tooltip.queue(m)):e._$tooltip.stop().fadeOut(e.__options.animationDuration[1],m)}}else g()}return e},_off:function(){return this.__$emitterPrivate.off.apply(this.__$emitterPrivate,Array.prototype.slice.apply(arguments)),this},_on:function(){return this.__$emitterPrivate.on.apply(this.__$emitterPrivate,Array.prototype.slice.apply(arguments)),this},_one:function(){return this.__$emitterPrivate.one.apply(this.__$emitterPrivate,Array.prototype.slice.apply(arguments)),this},_open:function(b,c){var e=this;if(!e.__destroying&&d(e._$origin)&&e.__enabled){var f=!0;if("closed"==e.__state&&(e._trigger({type:"before",event:b,stop:function(){f=!1}}),f&&e.__options.functionBefore&&(f=e.__options.functionBefore.call(e,e,{event:b,origin:e._$origin[0]}))),f!==!1&&null!==e.__Content){c&&e.__callbacks.open.push(c),e.__callbacks.close=[],e.__timeoutsClear();var g,i=function(){"stable"!=e.__state&&e.__stateSet("stable"),a.each(e.__callbacks.open,function(a,b){b.call(e,e,{origin:e._$origin[0],tooltip:e._$tooltip[0]})}),e.__callbacks.open=[]};if("closed"!==e.__state)g=0,"disappearing"===e.__state?(e.__stateSet("appearing"),h.hasTransitions?(e._$tooltip.clearQueue().removeClass("tooltipster-dying").addClass("tooltipster-show"),e.__options.animationDuration[0]>0&&e._$tooltip.delay(e.__options.animationDuration[0]),e._$tooltip.queue(i)):e._$tooltip.stop().fadeIn(i)):"stable"==e.__state&&i();else{if(e.__stateSet("appearing"),g=e.__options.animationDuration[0],e.__contentInsert(),e.reposition(b,!0),h.hasTransitions?(e._$tooltip.addClass("tooltipster-"+e.__options.animation).addClass("tooltipster-initial").css({"-moz-animation-duration":e.__options.animationDuration[0]+"ms","-ms-animation-duration":e.__options.animationDuration[0]+"ms","-o-animation-duration":e.__options.animationDuration[0]+"ms","-webkit-animation-duration":e.__options.animationDuration[0]+"ms","animation-duration":e.__options.animationDuration[0]+"ms","transition-duration":e.__options.animationDuration[0]+"ms"}),setTimeout(function(){"closed"!=e.__state&&(e._$tooltip.addClass("tooltipster-show").removeClass("tooltipster-initial"),e.__options.animationDuration[0]>0&&e._$tooltip.delay(e.__options.animationDuration[0]),e._$tooltip.queue(i))},0)):e._$tooltip.css("display","none").fadeIn(e.__options.animationDuration[0],i),e.__trackerStart(),a(h.window).on("resize."+e.__namespace+"-triggerClose",function(b){var c=a(document.activeElement);(c.is("input")||c.is("textarea"))&&a.contains(e._$tooltip[0],c[0])||e.reposition(b)}).on("scroll."+e.__namespace+"-triggerClose",function(a){e.__scrollHandler(a)}),e.__$originParents=e._$origin.parents(),e.__$originParents.each(function(b,c){a(c).on("scroll."+e.__namespace+"-triggerClose",function(a){e.__scrollHandler(a)})}),e.__options.triggerClose.mouseleave||e.__options.triggerClose.touchleave&&h.hasTouchCapability){e._on("dismissable",function(a){a.dismissable?a.delay?(m=setTimeout(function(){e._close(a.event)},a.delay),e.__timeouts.close.push(m)):e._close(a):clearTimeout(m)});var j=e._$origin,k="",l="",m=null;e.__options.interactive&&(j=j.add(e._$tooltip)),e.__options.triggerClose.mouseleave&&(k+="mouseenter."+e.__namespace+"-triggerClose ",l+="mouseleave."+e.__namespace+"-triggerClose "),e.__options.triggerClose.touchleave&&h.hasTouchCapability&&(k+="touchstart."+e.__namespace+"-triggerClose",l+="touchend."+e.__namespace+"-triggerClose touchcancel."+e.__namespace+"-triggerClose"),j.on(l,function(a){if(e._touchIsTouchEvent(a)||!e._touchIsEmulatedEvent(a)){var b="mouseleave"==a.type?e.__options.delay:e.__options.delayTouch;e._trigger({delay:b[1],dismissable:!0,event:a,type:"dismissable"})}}).on(k,function(a){!e._touchIsTouchEvent(a)&&e._touchIsEmulatedEvent(a)||e._trigger({dismissable:!1,event:a,type:"dismissable"})})}e.__options.triggerClose.originClick&&e._$origin.on("click."+e.__namespace+"-triggerClose",function(a){e._touchIsTouchEvent(a)||e._touchIsEmulatedEvent(a)||e._close(a)}),(e.__options.triggerClose.click||e.__options.triggerClose.tap&&h.hasTouchCapability)&&setTimeout(function(){if("closed"!=e.__state){var b="",c=a(h.window.document.body);e.__options.triggerClose.click&&(b+="click."+e.__namespace+"-triggerClose "),e.__options.triggerClose.tap&&h.hasTouchCapability&&(b+="touchend."+e.__namespace+"-triggerClose"),c.on(b,function(b){e._touchIsMeaningfulEvent(b)&&(e._touchRecordEvent(b),e.__options.interactive&&a.contains(e._$tooltip[0],b.target)||e._close(b))}),e.__options.triggerClose.tap&&h.hasTouchCapability&&c.on("touchstart."+e.__namespace+"-triggerClose",function(a){e._touchRecordEvent(a)})}},0),e._trigger("ready"),e.__options.functionReady&&e.__options.functionReady.call(e,e,{origin:e._$origin[0],tooltip:e._$tooltip[0]})}if(e.__options.timer>0){var m=setTimeout(function(){e._close()},e.__options.timer+g);e.__timeouts.close.push(m)}}}return e},_openShortly:function(a){var b=this,c=!0;if("stable"!=b.__state&&"appearing"!=b.__state&&!b.__timeouts.open&&(b._trigger({type:"start",event:a,stop:function(){c=!1}}),c)){var d=0==a.type.indexOf("touch")?b.__options.delayTouch:b.__options.delay;d[0]?b.__timeouts.open=setTimeout(function(){b.__timeouts.open=null,b.__pointerIsOverOrigin&&b._touchIsMeaningfulEvent(a)?(b._trigger("startend"),b._open(a)):b._trigger("startcancel")},d[0]):(b._trigger("startend"),b._open(a))}return b},_optionsExtract:function(b,c){var d=this,e=a.extend(!0,{},c),f=d.__options[b];return f||(f={},a.each(c,function(a,b){var c=d.__options[a];void 0!==c&&(f[a]=c)})),a.each(e,function(b,c){void 0!==f[b]&&("object"!=typeof c||c instanceof Array||null==c||"object"!=typeof f[b]||f[b]instanceof Array||null==f[b]?e[b]=f[b]:a.extend(e[b],f[b]))}),e},_plug:function(b){var c=a.tooltipster._plugin(b);if(!c)throw new Error('The "'+b+'" plugin is not defined');return c.instance&&a.tooltipster.__bridge(c.instance,this,c.name),this},_touchIsEmulatedEvent:function(a){for(var b=!1,c=(new Date).getTime(),d=this.__touchEvents.length-1;d>=0;d--){var e=this.__touchEvents[d];if(!(c-e.time<500))break;e.target===a.target&&(b=!0)}return b},_touchIsMeaningfulEvent:function(a){return this._touchIsTouchEvent(a)&&!this._touchSwiped(a.target)||!this._touchIsTouchEvent(a)&&!this._touchIsEmulatedEvent(a)},_touchIsTouchEvent:function(a){return 0==a.type.indexOf("touch")},_touchRecordEvent:function(a){return this._touchIsTouchEvent(a)&&(a.time=(new Date).getTime(),this.__touchEvents.push(a)),this},_touchSwiped:function(a){for(var b=!1,c=this.__touchEvents.length-1;c>=0;c--){var d=this.__touchEvents[c];if("touchmove"==d.type){b=!0;break}if("touchstart"==d.type&&a===d.target)break}return b},_trigger:function(){var b=Array.prototype.slice.apply(arguments);return"string"==typeof b[0]&&(b[0]={type:b[0]}),b[0].instance=this,b[0].origin=this._$origin?this._$origin[0]:null,b[0].tooltip=this._$tooltip?this._$tooltip[0]:null,this.__$emitterPrivate.trigger.apply(this.__$emitterPrivate,b),a.tooltipster._trigger.apply(a.tooltipster,b),this.__$emitterPublic.trigger.apply(this.__$emitterPublic,b),this},_unplug:function(b){var c=this;if(c[b]){var d=a.tooltipster._plugin(b);d.instance&&a.each(d.instance,function(a,d){c[a]&&c[a].bridged===c[b]&&delete c[a]}),c[b].__destroy&&c[b].__destroy(),delete c[b]}return c},close:function(a){return this.__destroyed?this.__destroyError():this._close(null,a),this},content:function(a){var b=this;if(void 0===a)return b.__Content;if(b.__destroyed)b.__destroyError();else if(b.__contentSet(a),null!==b.__Content){if("closed"!==b.__state&&(b.__contentInsert(),b.reposition(),b.__options.updateAnimation))if(h.hasTransitions){var c=b.__options.updateAnimation;b._$tooltip.addClass("tooltipster-update-"+c),setTimeout(function(){"closed"!=b.__state&&b._$tooltip.removeClass("tooltipster-update-"+c)},1e3)}else b._$tooltip.fadeTo(200,.5,function(){"closed"!=b.__state&&b._$tooltip.fadeTo(200,1)})}else b._close();return b},destroy:function(){var b=this;if(b.__destroyed)b.__destroyError();else{"closed"!=b.__state?b.option("animationDuration",0)._close(null,null,!0):b.__timeoutsClear(),b._trigger("destroy"),b.__destroyed=!0,b._$origin.removeData(b.__namespace).off("."+b.__namespace+"-triggerOpen"),a(h.window.document.body).off("."+b.__namespace+"-triggerOpen");var c=b._$origin.data("tooltipster-ns");if(c)if(1===c.length){var d=null;"previous"==b.__options.restoration?d=b._$origin.data("tooltipster-initialTitle"):"current"==b.__options.restoration&&(d="string"==typeof b.__Content?b.__Content:a("<div></div>").append(b.__Content).html()),d&&b._$origin.attr("title",d),b._$origin.removeClass("tooltipstered"),b._$origin.removeData("tooltipster-ns").removeData("tooltipster-initialTitle")}else c=a.grep(c,function(a,c){return a!==b.__namespace}),b._$origin.data("tooltipster-ns",c);b._trigger("destroyed"),b._off(),b.off(),b.__Content=null,b.__$emitterPrivate=null,b.__$emitterPublic=null,b.__options.parent=null,b._$origin=null,b._$tooltip=null,a.tooltipster.__instancesLatestArr=a.grep(a.tooltipster.__instancesLatestArr,function(a,c){return b!==a}),clearInterval(b.__garbageCollector)}return b},disable:function(){return this.__destroyed?(this.__destroyError(),this):(this._close(),this.__enabled=!1,this)},elementOrigin:function(){return this.__destroyed?void this.__destroyError():this._$origin[0]},elementTooltip:function(){return this._$tooltip?this._$tooltip[0]:null},enable:function(){return this.__enabled=!0,this},hide:function(a){return this.close(a)},instance:function(){return this},off:function(){return this.__destroyed||this.__$emitterPublic.off.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this},on:function(){return this.__destroyed?this.__destroyError():this.__$emitterPublic.on.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this},one:function(){return this.__destroyed?this.__destroyError():this.__$emitterPublic.one.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this},open:function(a){return this.__destroyed?this.__destroyError():this._open(null,a),this},option:function(b,c){return void 0===c?this.__options[b]:(this.__destroyed?this.__destroyError():(this.__options[b]=c,this.__optionsFormat(),a.inArray(b,["trigger","triggerClose","triggerOpen"])>=0&&this.__prepareOrigin(),"selfDestruction"===b&&this.__prepareGC()),this)},reposition:function(a,b){var c=this;return c.__destroyed?c.__destroyError():"closed"!=c.__state&&d(c._$origin)&&(b||d(c._$tooltip))&&(b||c._$tooltip.detach(),c.__Geometry=c.__geometry(),c._trigger({type:"reposition",event:a,helper:{geo:c.__Geometry}})),c},show:function(a){return this.open(a)},status:function(){return{destroyed:this.__destroyed,enabled:this.__enabled,open:"closed"!==this.__state,state:this.__state}},triggerHandler:function(){return this.__destroyed?this.__destroyError():this.__$emitterPublic.triggerHandler.apply(this.__$emitterPublic,Array.prototype.slice.apply(arguments)),this}},a.fn.tooltipster=function(){var b=Array.prototype.slice.apply(arguments),c="You are using a single HTML element as content for several tooltips. You probably want to set the contentCloning option to TRUE.";if(0===this.length)return this;if("string"==typeof b[0]){var d="#*$~&";return this.each(function(){var e=a(this).data("tooltipster-ns"),f=e?a(this).data(e[0]):null;if(!f)throw new Error("You called Tooltipster's \""+b[0]+'" method on an uninitialized element');if("function"!=typeof f[b[0]])throw new Error('Unknown method "'+b[0]+'"');this.length>1&&"content"==b[0]&&(b[1]instanceof a||"object"==typeof b[1]&&null!=b[1]&&b[1].tagName)&&!f.__options.contentCloning&&f.__options.debug&&console.log(c);var g=f[b[0]](b[1],b[2]);return g!==f||"instance"===b[0]?(d=g,!1):void 0}),"#*$~&"!==d?d:this}a.tooltipster.__instancesLatestArr=[];var e=b[0]&&void 0!==b[0].multiple,g=e&&b[0].multiple||!e&&f.multiple,h=b[0]&&void 0!==b[0].content,i=h&&b[0].content||!h&&f.content,j=b[0]&&void 0!==b[0].contentCloning,k=j&&b[0].contentCloning||!j&&f.contentCloning,l=b[0]&&void 0!==b[0].debug,m=l&&b[0].debug||!l&&f.debug;return this.length>1&&(i instanceof a||"object"==typeof i&&null!=i&&i.tagName)&&!k&&m&&console.log(c),this.each(function(){var c=!1,d=a(this),e=d.data("tooltipster-ns"),f=null;e?g?c=!0:m&&(console.log("Tooltipster: one or more tooltips are already attached to the element below. Ignoring."),console.log(this)):c=!0,c&&(f=new a.Tooltipster(this,b[0]),e||(e=[]),e.push(f.__namespace),d.data("tooltipster-ns",e),d.data(f.__namespace,f),f.__options.functionInit&&f.__options.functionInit.call(f,f,{origin:this}),f._trigger("init")),a.tooltipster.__instancesLatestArr.push(f)}),this},b.prototype={__init:function(b){this.__$tooltip=b,this.__$tooltip.css({left:0,overflow:"hidden",position:"absolute",top:0}).find(".tooltipster-content").css("overflow","auto"),this.$container=a('<div class="tooltipster-ruler"></div>').append(this.__$tooltip).appendTo(h.window.document.body)},__forceRedraw:function(){var a=this.__$tooltip.parent();this.__$tooltip.detach(),this.__$tooltip.appendTo(a)},constrain:function(a,b){return this.constraints={width:a,height:b},this.__$tooltip.css({display:"block",height:"",overflow:"auto",width:a}),this},destroy:function(){this.__$tooltip.detach().find(".tooltipster-content").css({display:"",overflow:""}),this.$container.remove()},free:function(){return this.constraints=null,this.__$tooltip.css({display:"",height:"",overflow:"visible",width:""}),this},measure:function(){this.__forceRedraw();var a=this.__$tooltip[0].getBoundingClientRect(),b={size:{height:a.height||a.bottom-a.top,width:a.width||a.right-a.left}};if(this.constraints){var c=this.__$tooltip.find(".tooltipster-content"),d=this.__$tooltip.outerHeight(),e=c[0].getBoundingClientRect(),f={height:d<=this.constraints.height,width:a.width<=this.constraints.width&&e.width>=c[0].scrollWidth-1};b.fits=f.height&&f.width}return h.IE&&h.IE<=11&&b.size.width!==h.window.document.documentElement.clientWidth&&(b.size.width=Math.ceil(b.size.width)+1),b}};var j=navigator.userAgent.toLowerCase();-1!=j.indexOf("msie")?h.IE=parseInt(j.split("msie")[1]):-1!==j.toLowerCase().indexOf("trident")&&-1!==j.indexOf(" rv:11")?h.IE=11:-1!=j.toLowerCase().indexOf("edge/")&&(h.IE=parseInt(j.toLowerCase().split("edge/")[1]));var k="tooltipster.sideTip";return a.tooltipster._plugin({name:k,instance:{__defaults:function(){return{arrow:!0,distance:6,functionPosition:null,maxWidth:null,minIntersection:16,minWidth:0,position:null,side:"top",viewportAware:!0}},__init:function(a){var b=this;b.__instance=a,b.__namespace="tooltipster-sideTip-"+Math.round(1e6*Math.random()),b.__previousState="closed",b.__options,b.__optionsFormat(),b.__instance._on("state."+b.__namespace,function(a){"closed"==a.state?b.__close():"appearing"==a.state&&"closed"==b.__previousState&&b.__create(),b.__previousState=a.state}),b.__instance._on("options."+b.__namespace,function(){b.__optionsFormat()}),b.__instance._on("reposition."+b.__namespace,function(a){b.__reposition(a.event,a.helper)})},__close:function(){this.__instance.content()instanceof a&&this.__instance.content().detach(),this.__instance._$tooltip.remove(),this.__instance._$tooltip=null},__create:function(){var b=a('<div class="tooltipster-base tooltipster-sidetip"><div class="tooltipster-box"><div class="tooltipster-content"></div></div><div class="tooltipster-arrow"><div class="tooltipster-arrow-uncropped"><div class="tooltipster-arrow-border"></div><div class="tooltipster-arrow-background"></div></div></div></div>');this.__options.arrow||b.find(".tooltipster-box").css("margin",0).end().find(".tooltipster-arrow").hide(),this.__options.minWidth&&b.css("min-width",this.__options.minWidth+"px"),this.__options.maxWidth&&b.css("max-width",this.__options.maxWidth+"px"),
this.__instance._$tooltip=b,this.__instance._trigger("created")},__destroy:function(){this.__instance._off("."+self.__namespace)},__optionsFormat:function(){var b=this;if(b.__options=b.__instance._optionsExtract(k,b.__defaults()),b.__options.position&&(b.__options.side=b.__options.position),"object"!=typeof b.__options.distance&&(b.__options.distance=[b.__options.distance]),b.__options.distance.length<4&&(void 0===b.__options.distance[1]&&(b.__options.distance[1]=b.__options.distance[0]),void 0===b.__options.distance[2]&&(b.__options.distance[2]=b.__options.distance[0]),void 0===b.__options.distance[3]&&(b.__options.distance[3]=b.__options.distance[1])),b.__options.distance={top:b.__options.distance[0],right:b.__options.distance[1],bottom:b.__options.distance[2],left:b.__options.distance[3]},"string"==typeof b.__options.side){var c={top:"bottom",right:"left",bottom:"top",left:"right"};b.__options.side=[b.__options.side,c[b.__options.side]],"left"==b.__options.side[0]||"right"==b.__options.side[0]?b.__options.side.push("top","bottom"):b.__options.side.push("right","left")}6===a.tooltipster._env.IE&&b.__options.arrow!==!0&&(b.__options.arrow=!1)},__reposition:function(b,c){var d,e=this,f=e.__targetFind(c),g=[];e.__instance._$tooltip.detach();var h=e.__instance._$tooltip.clone(),i=a.tooltipster._getRuler(h),j=!1,k=e.__instance.option("animation");switch(k&&h.removeClass("tooltipster-"+k),a.each(["window","document"],function(d,k){var l=null;if(e.__instance._trigger({container:k,helper:c,satisfied:j,takeTest:function(a){l=a},results:g,type:"positionTest"}),1==l||0!=l&&0==j&&("window"!=k||e.__options.viewportAware))for(var d=0;d<e.__options.side.length;d++){var m={horizontal:0,vertical:0},n=e.__options.side[d];"top"==n||"bottom"==n?m.vertical=e.__options.distance[n]:m.horizontal=e.__options.distance[n],e.__sideChange(h,n),a.each(["natural","constrained"],function(a,d){if(l=null,e.__instance._trigger({container:k,event:b,helper:c,mode:d,results:g,satisfied:j,side:n,takeTest:function(a){l=a},type:"positionTest"}),1==l||0!=l&&0==j){var h={container:k,distance:m,fits:null,mode:d,outerSize:null,side:n,size:null,target:f[n],whole:null},o="natural"==d?i.free():i.constrain(c.geo.available[k][n].width-m.horizontal,c.geo.available[k][n].height-m.vertical),p=o.measure();if(h.size=p.size,h.outerSize={height:p.size.height+m.vertical,width:p.size.width+m.horizontal},"natural"==d?c.geo.available[k][n].width>=h.outerSize.width&&c.geo.available[k][n].height>=h.outerSize.height?h.fits=!0:h.fits=!1:h.fits=p.fits,"window"==k&&(h.fits?"top"==n||"bottom"==n?h.whole=c.geo.origin.windowOffset.right>=e.__options.minIntersection&&c.geo.window.size.width-c.geo.origin.windowOffset.left>=e.__options.minIntersection:h.whole=c.geo.origin.windowOffset.bottom>=e.__options.minIntersection&&c.geo.window.size.height-c.geo.origin.windowOffset.top>=e.__options.minIntersection:h.whole=!1),g.push(h),h.whole)j=!0;else if("natural"==h.mode&&(h.fits||h.size.width<=c.geo.available[k][n].width))return!1}})}}),e.__instance._trigger({edit:function(a){g=a},event:b,helper:c,results:g,type:"positionTested"}),g.sort(function(a,b){if(a.whole&&!b.whole)return-1;if(!a.whole&&b.whole)return 1;if(a.whole&&b.whole){var c=e.__options.side.indexOf(a.side),d=e.__options.side.indexOf(b.side);return d>c?-1:c>d?1:"natural"==a.mode?-1:1}if(a.fits&&!b.fits)return-1;if(!a.fits&&b.fits)return 1;if(a.fits&&b.fits){var c=e.__options.side.indexOf(a.side),d=e.__options.side.indexOf(b.side);return d>c?-1:c>d?1:"natural"==a.mode?-1:1}return"document"==a.container&&"bottom"==a.side&&"natural"==a.mode?-1:1}),d=g[0],d.coord={},d.side){case"left":case"right":d.coord.top=Math.floor(d.target-d.size.height/2);break;case"bottom":case"top":d.coord.left=Math.floor(d.target-d.size.width/2)}switch(d.side){case"left":d.coord.left=c.geo.origin.windowOffset.left-d.outerSize.width;break;case"right":d.coord.left=c.geo.origin.windowOffset.right+d.distance.horizontal;break;case"top":d.coord.top=c.geo.origin.windowOffset.top-d.outerSize.height;break;case"bottom":d.coord.top=c.geo.origin.windowOffset.bottom+d.distance.vertical}"window"==d.container?"top"==d.side||"bottom"==d.side?d.coord.left<0?c.geo.origin.windowOffset.right-this.__options.minIntersection>=0?d.coord.left=0:d.coord.left=c.geo.origin.windowOffset.right-this.__options.minIntersection-1:d.coord.left>c.geo.window.size.width-d.size.width&&(c.geo.origin.windowOffset.left+this.__options.minIntersection<=c.geo.window.size.width?d.coord.left=c.geo.window.size.width-d.size.width:d.coord.left=c.geo.origin.windowOffset.left+this.__options.minIntersection+1-d.size.width):d.coord.top<0?c.geo.origin.windowOffset.bottom-this.__options.minIntersection>=0?d.coord.top=0:d.coord.top=c.geo.origin.windowOffset.bottom-this.__options.minIntersection-1:d.coord.top>c.geo.window.size.height-d.size.height&&(c.geo.origin.windowOffset.top+this.__options.minIntersection<=c.geo.window.size.height?d.coord.top=c.geo.window.size.height-d.size.height:d.coord.top=c.geo.origin.windowOffset.top+this.__options.minIntersection+1-d.size.height):(d.coord.left>c.geo.window.size.width-d.size.width&&(d.coord.left=c.geo.window.size.width-d.size.width),d.coord.left<0&&(d.coord.left=0)),e.__sideChange(h,d.side),c.tooltipClone=h[0],c.tooltipParent=e.__instance.option("parent").parent[0],c.mode=d.mode,c.whole=d.whole,c.origin=e.__instance._$origin[0],c.tooltip=e.__instance._$tooltip[0],delete d.container,delete d.fits,delete d.mode,delete d.outerSize,delete d.whole,d.distance=d.distance.horizontal||d.distance.vertical;var l=a.extend(!0,{},d);if(e.__instance._trigger({edit:function(a){d=a},event:b,helper:c,position:l,type:"position"}),e.__options.functionPosition){var m=e.__options.functionPosition.call(e,e.__instance,c,l);m&&(d=m)}i.destroy();var n,o;"top"==d.side||"bottom"==d.side?(n={prop:"left",val:d.target-d.coord.left},o=d.size.width-this.__options.minIntersection):(n={prop:"top",val:d.target-d.coord.top},o=d.size.height-this.__options.minIntersection),n.val<this.__options.minIntersection?n.val=this.__options.minIntersection:n.val>o&&(n.val=o);var p;p=c.geo.origin.fixedLineage?c.geo.origin.windowOffset:{left:c.geo.origin.windowOffset.left+c.geo.window.scroll.left,top:c.geo.origin.windowOffset.top+c.geo.window.scroll.top},d.coord={left:p.left+(d.coord.left-c.geo.origin.windowOffset.left),top:p.top+(d.coord.top-c.geo.origin.windowOffset.top)},e.__sideChange(e.__instance._$tooltip,d.side),c.geo.origin.fixedLineage?e.__instance._$tooltip.css("position","fixed"):e.__instance._$tooltip.css("position",""),e.__instance._$tooltip.css({left:d.coord.left,top:d.coord.top,height:d.size.height,width:d.size.width}).find(".tooltipster-arrow").css({left:"",top:""}).css(n.prop,n.val),e.__instance._$tooltip.appendTo(e.__instance.option("parent")),e.__instance._trigger({type:"repositioned",event:b,position:d})},__sideChange:function(a,b){a.removeClass("tooltipster-bottom").removeClass("tooltipster-left").removeClass("tooltipster-right").removeClass("tooltipster-top").addClass("tooltipster-"+b)},__targetFind:function(a){var b={},c=this.__instance._$origin[0].getClientRects();if(c.length>1){var d=this.__instance._$origin.css("opacity");1==d&&(this.__instance._$origin.css("opacity",.99),c=this.__instance._$origin[0].getClientRects(),this.__instance._$origin.css("opacity",1))}if(c.length<2)b.top=Math.floor(a.geo.origin.windowOffset.left+a.geo.origin.size.width/2),b.bottom=b.top,b.left=Math.floor(a.geo.origin.windowOffset.top+a.geo.origin.size.height/2),b.right=b.left;else{var e=c[0];b.top=Math.floor(e.left+(e.right-e.left)/2),e=c.length>2?c[Math.ceil(c.length/2)-1]:c[0],b.right=Math.floor(e.top+(e.bottom-e.top)/2),e=c[c.length-1],b.bottom=Math.floor(e.left+(e.right-e.left)/2),e=c.length>2?c[Math.ceil((c.length+1)/2)-1]:c[c.length-1],b.left=Math.floor(e.top+(e.bottom-e.top)/2)}return b}}}),a});
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports._AjaxForm = void 0;

var _fw = require("../../utils/fw");

var _utils = require("../../utils/utils");

var _user = require("./user");

var $ = window.jQuery;

function AjaxForm($form) {
  this._construct($form);
}

AjaxForm.prototype = {
  _classes: {
    _error: 'alert alert-danger',
    _success: 'alert alert-info'
  },
  _construct: function _construct($form) {
    var _this = this;

    this._$form = $form;
    this._$modal = $form.closest('.modal');
    this._$message = $('<div />');
    this._$btnSubmit = this._$form.find('button[type="submit"]');
    this._$captcha = this._$form.find('img.captcha');
    this._$recaptcha = this._$form.find('span.recaptcha');
    this._$btnSubmit = this._$form.find('button[type="submit"], button.submit');
    this._$loader = this._$form.find('.loader');

    if (!this._$loader.length) {
      this._$loader = $('<div class="loader" />').appendTo(this._$form);
    }

    this._$message.insertBefore(this._$form).hide();

    this._$form.submit($.proxy(this._formSubmit, this));

    this._$btnSubmit.click($.proxy(this._btnSubmitClick, this));

    this._$message.click(function () {
      return _this._$message.fadeOut();
    });

    if (this._$modal.length) {
      // form inside modal
      this._$modal.on('shown.bs.modal', $.proxy(this._onShown, this));

      this._$modal.on('hide.bs.modal', $.proxy(this._onHide, this));
    } else {
      // normal form
      this._onShown();
    }
  },
  _onShown: function _onShown() {
    this._reloadCaptcha();

    this._$form[0].reset();

    this._$form.show();

    this._$message.empty().hide();
  },
  _onHide: function _onHide() {
    this._$form[0].reset();

    this._$message.empty().hide();
  },
  _reloadCaptcha: function _reloadCaptcha() {
    if (this._$captcha.length > 0) {
      var captcha = this._$captcha.data('Captcha');

      if (!captcha) return;

      captcha._reload();
    }

    if (this._$recaptcha.length > 0) {
      this._$recaptcha.data('reset')();
    }
  },
  _showMessages: function _showMessages(messages, error) {
    var html = '';

    for (var i = 0; i < messages.length; i += 1) {
      html += "".concat(messages[i], "<br />");
    }

    this._$message.attr('class', error ? this._classes._error : this._classes._success).html(html).fadeIn();
  },
  _btnSubmitClick: function _btnSubmitClick(e) {
    if (this._$btnSubmit.is(':disabled')) return;

    this._formSubmit(e);
  },
  _formSubmit: function _formSubmit(e) {
    var _this2 = this;

    e.preventDefault();

    if (!this._checkValid()) {
      this._showMessages(['Please fill all required fields.'], true);

      return;
    }

    if (this._$form.data('loading')) return;

    this._$form.data('loading', true);

    var data = this._getData();

    this._$btnSubmit.attr('disabled', 'disabled');

    this._$loader._showLoading();

    this._$message.hide();

    _utils["default"]._ajax(this._$form.attr('action') || this._$form.data('action'), ['type', 'POST', 'data', data]).done(function (response) {
      if (response.redirect) {
        setTimeout(function () {
          return window.location.href = response.redirect;
        }, 1e3);
      }

      if (!response.success) {
        _this2._showMessages(response.messages, true);
      } else {
        _this2._showMessages(response.messages);

        if (_this2._$modal.length && _this2._$modal.data('autodismiss')) {
          setTimeout(function () {
            return _this2._$modal.modal('hide');
          }, 1e3);
        }

        if (_this2._$form.data('once')) {
          _this2._$form.hide();
        }

        if (_this2._$form.data('user')) {
          _user._userUtils._reload();
        }
      }
    }).always(function () {
      _this2._reloadCaptcha();

      _this2._$form.data('loading', false);

      _this2._$loader.empty();

      _this2._$btnSubmit.removeAttr('disabled');
    });
  },
  _getInputs: function _getInputs() {
    return this._$form.find('input,textarea');
  },
  _checkValid: function _checkValid() {
    var valid = true;

    this._getInputs().each(function (i, el) {
      var $input = $(el);

      if ($input.attr('required') && $input.val().trim().length === 0) {
        $input.focus();
        $input.addClass('is-invalid').one('focus', function () {
          return $input.removeClass('is-invalid');
        });
        valid = false;
      }
    });

    return valid;
  },
  _getData: function _getData() {
    var data = {};

    this._getInputs().not('[type="radio"],[type="checkbox"]').each(function (i, el) {
      var $input = $(el);
      data[$input.attr('name')] = $input.val();
    });

    this._getInputs().filter('[type="checkbox"]').each(function (i, el) {
      var $input = $(el);
      data[$input.attr('name')] = $input.is(':checked') ? $input.val() : 0;
    });

    this._getInputs().filter('[type="radio"]:checked').each(function (i, el) {
      var $input = $(el);
      data[$input.attr('name')] = $input.val();
    });

    return data;
  }
};
var _AjaxForm = AjaxForm;
exports._AjaxForm = _AjaxForm;

var _default = function _default() {
  _fw["default"].bind('form.ajax', AjaxForm, 'AjaxForm');
};

exports["default"] = _default;

},{"../../utils/fw":21,"../../utils/utils":24,"./user":13}],2:[function(require,module,exports){
"use strict";

var _cookie = require("../../utils/cookie");

var _user = require("./user");

var _menu = require("./menu");

var _search = require("./search");

var _tooltipster = require("./tooltipster");

var _captcha = require("./captcha");

var _ajaxform = require("./ajaxform");

var _shorting = require("./shorting");

var _protection = require("./protection");

var _bookmark = require("./bookmark");

var _watchcontrol = require("./watchcontrol");

var _watch = require("./watch");

var _watchrating = require("./watchrating");

var _home = require("./home");

var _tabs = require("./tabs");

// import FW from '../../utils/fw';
var $ = window.jQuery;
window.Cookie = _cookie["default"];
$.fn.extend(true, {
  _showLoading: function _showLoading() {
    this.html('<div class="loading"><div></div></div>');
  },
  _scrollFocus: function _scrollFocus() {
    $('html,body').animate({
      scrollTop: this.offset().top
    }, 'slow');
  }
});
(0, _tabs["default"])();
(0, _home["default"])();
(0, _user["default"])();
(0, _search["default"])();
(0, _menu["default"])();
(0, _tooltipster["default"])();
(0, _captcha["default"])();
(0, _ajaxform["default"])();
(0, _shorting["default"])();
(0, _protection["default"])();
(0, _bookmark["default"])();
(0, _watchcontrol["default"])();
(0, _watch["default"])();
(0, _watchrating["default"])();
$('[data-go]').click(function (e) {
  return $($(e.currentTarget).data('go'))._scrollFocus();
});
$('#filter-toggler').click(function () {
  return $('.filters').toggle();
});
$('.tip').tooltip();
$(document).activate(); // modal replacement

$(document).on('click', '[data-rmodal]', function (e) {
  e.preventDefault();
  var $current = $('.modal.show');

  if ($current.length) {
    var $md = $('.modal.show');

    if ($md.hasClass('fade')) {
      $md.removeClass('fade').on('hidden.bs.modal', function () {
        $md.addClass('fade');
      }).modal('hide');
    }
  }

  $($(e.currentTarget).data('rmodal')).modal('show');
});

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('./sw.js');
}

},{"../../utils/cookie":19,"./ajaxform":1,"./bookmark":3,"./captcha":4,"./home":5,"./menu":6,"./protection":7,"./search":8,"./shorting":9,"./tabs":10,"./tooltipster":12,"./user":13,"./watch":14,"./watchcontrol":15,"./watchrating":16}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var _utils = require("../../utils/utils");

var _toast = require("./toast");

var _user = require("./user");

var $ = window.jQuery;

function Bookmark($ctl) {
  this._construct($ctl);
}

Bookmark.prototype = {
  _construct: function _construct($ctl) {
    var _this = this;

    this._$ctl = $ctl;
    this._id = $ctl.data('id');
    this._fetched = false;
    this._folders = $ctl.data('folders');
    if (this._$ctl.data('move')) this._$ctl.data('action', 'add');

    this._$ctl.click($.proxy(this._clickHandler, this));

    $(document).on('user.loaded', function () {
      return _this._fetchStatus();
    });
  },
  _fetchStatus: function _fetchStatus() {
    var _this2 = this;

    if (!this._$ctl.data('fetch')) return;

    _utils["default"]._ajax('ajax/user/watchlist-status', ['data', ['id', this._id]]).done(function (resp) {
      if (resp.success) {
        _this2._$ctl.data('action', resp.data ? 'remove' : 'add');

        _this2._updateLayout();
      }
    });
  },
  _toggleAction: function _toggleAction() {
    var act = this._$ctl.data('action') === 'add' ? 'remove' : 'add';
    act = this._$ctl.data('move') ? 'add' : act;

    this._$ctl.data('action', act);
  },
  _updateLayout: function _updateLayout() {
    var act = this._$ctl.data('action');

    if (act && this._$ctl.data(act)) {
      this._$ctl.html(this._$ctl.data(act));
    }
  },
  _clickHandler: function _clickHandler() {
    if (!/^\/user/.test(window.location.href) && !_user._userUtils._isLoggedIn()) {
      _user._userUtils._requireLogin();

      return;
    }

    if (this._$ctl.data('action') === 'remove') {
      this._addToFolder('remove');

      return;
    }

    if (this._folders) {
      this._showFolders();
    } else {
      this._addToFolder('planned');
    }
  },
  _showFolders: function _showFolders() {
    var _this3 = this;

    if (!this._folders) return;

    this._$ctl.find('.dropdown-menu').remove();

    var $menu = $('<div class="dropdown-menu">').append('<div class="dropdown-header">Choose a folder:</div>');
    Object.keys(this._folders).forEach(function (k) {
      $("<span class=\"dropdown-item\">".concat(_this3._folders[k], "</span>")).appendTo($menu).click(function () {
        _this3._addToFolder(k, _this3._folders[k]);

        $menu.remove();
      });
    });

    this._$ctl.attr('data-toggle', 'dropdown').addClass('dropdown').append($menu);
  },
  _addToFolder: function _addToFolder(folder, folderText) {
    var _this4 = this;

    _utils["default"]._ajax('ajax/user/watchlist-edit', ['type', 'POST', 'data', ['id', this._id, 'folder', folder]]).done(function (resp) {
      (0, _toast["default"])(resp.messages.join('<br/>'));
      if (!resp.success) return;

      _this4._toggleAction();

      _this4._updateLayout();

      if (folder !== 'remove' && folderText && _this4._$ctl.data('update')) {
        _this4._$ctl.html(_this4._$ctl.data('update').replace('$0', folderText));
      }

      if (folder === 'remove' && _this4._$ctl.data('item-closet')) {
        _this4._$ctl.closest(_this4._$ctl.data('item-closet')).fadeOut();
      } // dropdown toggle - show


      _this4._$ctl.parent().removeClass('show');
    });
  }
};

function WatchStatusClick($ctl) {
  _utils["default"]._ajax('ajax/user/watchlist-status', ['data', ['id', $ctl.data('id'), 'value', $ctl.data('value') ? 0 : 1]]).done(function () {
    $ctl.html($ctl.hasClass('unwatched') ? $ctl.data('watched') : $ctl.data('unwatched'));
    $ctl.toggleClass('unwatched');
    $ctl.data('value', !$ctl.data('value'));
  });
}

var _default = function _default() {
  _fw["default"].bind('.bookmark', Bookmark, 'Bookmark'); // FW.bind('.watchstatus', WatchStatus, 'watchstatus');


  $(document).on('click', '.watchstatus', function (e) {
    WatchStatusClick($(e.currentTarget));
  });
};

exports["default"] = _default;

},{"../../utils/fw":21,"../../utils/utils":24,"./toast":11,"./user":13}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var $ = window.jQuery;

function Captcha($img) {
  this._construct($img);
}

Captcha.prototype = {
  _construct: function _construct($img) {
    this._$img = $img;
    this._$reloader = $img.siblings('.reloader');

    if (!this._$reloader.length) {
      this._$reloader = $img;
    }

    this._$reloader.css('cursor', 'pointer').addClass('tip').attr('title', 'Click to reload').tooltip('update').click($.proxy(this._reload, this));
  },
  _reload: function _reload() {
    var src = this._$img.data('src') || this._$img.attr('src');

    this._$img.attr('src', src.replace(/\?.*?$/, "?".concat(Math.random())));
  }
};

var _default = function _default() {
  _fw["default"].bind('img.captcha', Captcha, 'Captcha');
};

exports["default"] = _default;

},{"../../utils/fw":21}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var $ = window.jQuery;
var Swiper = window.Swiper;

function MainSlider($wrapper) {
  var swiper = new Swiper($wrapper[0], {
    autoplay: {
      delay: 5e3,
      disableOnInteraction: true
    },
    grabCursor: true,
    pagination: {
      el: '.paging',
      clickable: true,
      type: 'bullets'
    }
  });
}

;

var SmallSlider = function SmallSlider($wrapper) {
  var $content = $wrapper.find('.content');
  new Swiper($content[0], {
    autoplay: {
      delay: 8e3,
      disableOnInteraction: true
    },
    // loop: true,
    slidesPerView: 'auto',
    slidesPerGroup: 3,
    grabCursor: true,
    navigation: {
      nextEl: '.next',
      prevEl: '.prev'
    }
  }).on('slideChange', function () {
    setTimeout(function () {
      $(window).trigger('scroll');
    }, 100);
  });
};

var _default = function _default() {
  _fw["default"].bind('#slider', MainSlider, 'MainSlider');

  _fw["default"].bind('.slider-sm', SmallSlider, 'SmallSlider');
};

exports["default"] = _default;

},{"../../utils/fw":21}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var $ = window.jQuery;

function Menu() {
  if (window.screen.width > 1024) return;
  var $toggler = $('#menu-toggler');
  var $menu = $('#menu');
  var $children = $menu.children('li');
  $toggler.click(function () {
    $menu.toggle();

    if ($menu.is(':visible')) {
      $(document).on('click.menu', function (e) {
        var $target = $(e.target);

        if (!$target.closest($toggler).length && !$target.closest($menu).length) {
          $menu.hide();
        }
      });
    } else {
      $(document).off('click.menu');
    }
  });
  $children.each(function (i, li) {
    var $li = $(li);
    var $a = $li.children('a');
    var $i = $a.children('i');
    var origClass = $i.attr('class');
    var expandedClass = 'fa fa-minus';
    var $sub = $li.children('ul');

    var hide = function hide() {
      $i.attr('class', origClass);
      $sub.hide();
    };

    var show = function show() {
      $i.attr('class', expandedClass);
      $sub.show();
      $children.not($li).each(function (i, el) {
        $(el).data('hide')();
      });
    };

    $li.data('hide', hide);
    $a.click(function () {
      if ($sub.is(':hidden')) {
        show();
      } else {
        hide();
      }
    });
  });
}

var _default = Menu;
exports["default"] = _default;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _protection = require("../../utils/protection");

var $ = window.jQuery;

var _default = function _default() {
  (0, _protection["default"])();
};

exports["default"] = _default;

},{"../../utils/protection":23}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var _utils = require("../../utils/utils");

var _autocomplete = require("../../utils/autocomplete");

var $ = window.jQuery;

function SearchAutoComplete($input) {
  this._construct($input);

  this._setup();
}

SearchAutoComplete.prototype = $.extend({}, _autocomplete["default"].prototype, {
  _setup: function _setup() {
    var _this = this;

    this._$headerSearch = this._$form.closest('#search');
    this._$suggestions = this._$form.find('.suggestions');

    this._setOptions(_utils["default"]._arrayToObject(['source', this._$form.data('source') || 'ajax/film/search']));

    this._$verify = this._$form.find('input[name="vrf"]');

    if (!this._$verify.length) {
      this._$verify = $('<input/>').attr('type', 'hidden').attr('name', 'vrf').appendTo(this._$form);
    }

    this._$input.keydown(function () {
      return _this._updateVerifyValue(false);
    }).keyup(function () {
      return _this._updateVerifyValue(false);
    });
  },
  _updateVerifyValue: function _updateVerifyValue(isAjax) {
    var vrf = _utils["default"]._encryptData(this._$input.val());

    if (isAjax) {
      this._options.extra.vrf = vrf;
    } else {
      this._$verify.val(vrf);
    }
  },
  __startLookup: function __startLookup() {
    this._updateVerifyValue(true);
  },
  __show: function __show(resp) {
    this._$suggestions.hide();

    if (resp.html.trim().length > 0) {
      this._$suggestions.html(resp.html).slideDown().activate();
    }
  },
  __hide: function __hide() {
    this._$suggestions.empty().hide();
  },
  __close: function __close() {
    this._$headerSearch.removeClass('show');
  }
});

function SearchHandler() {
  var $toggler = $('#search-toggler');
  var $search = $('#search');
  var $input = $search.find('input');
  $toggler.click(function () {
    $search.toggle();

    if ($search.is(':visible')) {
      $input.focus();
      $(document).on('click.search', function (e) {
        var $target = $(e.target);

        if (!$target.closest($toggler).length && !$target.closest($search).length) {
          $search.hide();
        }
      });
    } else {
      $(document).off('click.search');
    }
  });
}

var _default = function _default() {
  SearchHandler();

  _fw["default"].bind('#search input, input.autocomplete', SearchAutoComplete, 'SearchAutoComplete');
};

exports["default"] = _default;

},{"../../utils/autocomplete":17,"../../utils/fw":21,"../../utils/utils":24}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var $ = window.jQuery;

function Shorting($wrapper) {
  this._construct($wrapper);
}

Shorting.prototype = {
  _construct: function _construct($wrapper) {
    this._$wrapper = $wrapper;
    var type = $wrapper.data('type');
    var max = $wrapper.data('max');
    if ($wrapper.data('desktop') === 'no' && window.screen.width > 768) return;

    if (type === 'link') {
      this._handleLinks(max || 5);
    } else {
      this._handleText(max || 80);
    }
  },
  _getMoreBtn: function _getMoreBtn(value) {
    var $btn = $('<span class="more"></span>'); // const more = '[ more ]';
    // const less = '[ less ]';

    var more = '<i class="fa fa-plus"></i> more';
    var less = '<i class="fa fa-minus"></i> less';
    return $btn.html(value ? more : less);
  },
  _handleLinks: function _handleLinks(limit) {
    var _this = this;

    var origHtml = this._$wrapper.html();

    var $casts = this._$wrapper.find('a');

    var collapse;
    var expande;

    if ($casts.length > limit) {
      collapse = function collapse() {
        var html = '';
        $casts.slice(0, limit).each(function (i, el) {
          html += (html.length > 0 ? ', ' : '') + $(el).prop('outerHTML');
        });
        html += '...';

        _this._$wrapper.html(html);

        _this._getMoreBtn(true).click(expande).appendTo(_this._$wrapper);
      };

      expande = function expande() {
        _this._$wrapper.html(origHtml);

        _this._getMoreBtn(false).click(collapse).appendTo(_this._$wrapper);
      };

      collapse();
    }
  },
  _handleText: function _handleText(height) {
    var _this2 = this;

    var origHtml = this._$wrapper.html();

    var words = this._$wrapper.html().split(' ');

    var colapse;
    var expande;

    var origHeight = this._$wrapper.height();

    var limitWords = Math.ceil(words.length / origHeight * height);

    if (words.length > limitWords) {
      var _short = "".concat(words.slice(0, limitWords).join(' '), "...");

      colapse = function colapse() {
        _this2._$wrapper.html(_short);

        _this2._getMoreBtn(true).click(expande).appendTo(_this2._$wrapper);
      };

      expande = function expande() {
        _this2._$wrapper.html(origHtml);

        _this2._getMoreBtn(false).click(colapse).appendTo(_this2._$wrapper);
      };

      colapse();
    }
  }
};

var _default = function _default() {
  _fw["default"].bind('.shorting', Shorting, 'Shorting');
};

exports["default"] = _default;

},{"../../utils/fw":21}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var $ = window.jQuery;

function Tabs($wrapper) {
  this._construct($wrapper);
}

Tabs.prototype = {
  _construct: function _construct($wrapper) {
    this._$wrapper = $wrapper;
    this._$tabs = this._$wrapper.children('span,a');
    this._$contents = $wrapper.closest('section').find('.tab-content');

    this._$tabs.click($.proxy(this._tabClick, this));
  },
  _tabClick: function _tabClick(e) {
    var $tab = $(e.currentTarget);

    if (this._$wrapper.data('link')) {
      return;
    }

    e.preventDefault();

    this._$tabs.removeClass('active');

    $tab.addClass('active');

    this._$contents.hide().filter("[data-name=\"".concat($tab.data('name'), "\"]")).show();
  }
};

var _default = function _default() {
  _fw["default"].bind('.tabs', Tabs, 'Tabs');
};

exports["default"] = _default;

},{"../../utils/fw":21}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var $ = window.jQuery;
var $container;

function create(msg, timeout) {
  var _msg = msg;

  if (msg instanceof Array) {
    _msg = msg.join('<br />');
  }

  var $item = $('<div />').hide().html(_msg).fadeIn().click(function () {
    return $item.remove();
  });

  if (!$container) {
    $container = $('<div id="toast-wrapper" />').appendTo(document.body);
  }

  $container.prepend($item);
  setTimeout(function () {
    return $item.remove();
  }, timeout || 3e3);
}

var _default = create;
exports["default"] = _default;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var $ = window.jQuery; // tooltipster

try {
  $.tooltipster.setDefaults({
    debug: false
  });
} catch (err) {}

function Tooltipster($element) {
  if (window.screen.width < 1024) return;
  if (typeof $element.tooltipster !== 'function') return;
  $element.tooltipster({
    contentAsHTML: true,
    updateAnimation: false,
    arrow: false,
    side: ['right', 'left'],
    interactive: true,
    delay: 100,
    minWidth: 260,
    maxWidth: 260,
    content: '<div class="loading"><div></div></div>',
    functionBefore: function functionBefore(instance, helper) {
      var $origin = $(helper.origin);

      if ($origin.data('loaded') !== true) {
        $.ajax({
          url: "ajax/film/tooltip/".concat($origin.data('tip')),
          dataType: 'html',
          success: function success(data) {
            instance.content(data);
            $origin.data('loaded', true);
          }
        });
      }
    },
    functionPosition: function functionPosition(instance, helper, position) {
      var newPosition = position;
      newPosition.coord.top -= (helper.geo.origin.size.height - position.size.height) / 2;
      newPosition.coord.top += helper.geo.origin.size.height * 0.2;
      return newPosition;
    }
  });

  var update = function update() {
    return setTimeout(function () {
      return $('.tooltipster-base').activate();
    }, 200);
  };

  $.tooltipster.on('updated', update);
  $.tooltipster.on('before', update);
}

var _default = function _default() {
  _fw["default"].bind('[data-tip]', Tooltipster, 'Tooltipster');
};

exports["default"] = _default;

},{"../../utils/fw":21}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports._userUtils = void 0;

var _localstorage = require("../../utils/localstorage");

var _utils = require("../../utils/utils");

var _toast = require("./toast");

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var $ = window.jQuery;
var user;
var $panel;
var userSettings = {};
var localSettings = {};
var syncSettingTimer;
var syncTrackingTimer;
var userUtils = {
  _KEY_AUTO_NEXT: 'auto_next',
  _KEY_AUTO_PLAY: 'auto_play',
  _KEY_TRACKING: 'playing',
  _getUser: function _getUser() {
    return user;
  },
  _isLoggedIn: function _isLoggedIn() {
    return user && user.user_id;
  },
  _requireLogin: function _requireLogin() {
    $('#md-login').modal();
  },
  _reload: function _reload() {
    var _this = this;

    $.ajax('ajax/user/panel').done(function (resp) {
      user = resp.user || {};

      _this._setOptions(user.settings || {}, true);

      $panel.html(resp.html);
      $(document).trigger('user.loaded');
    });
  },
  _setOptions: function _setOptions(options, fromServer) {
    var _this2 = this;

    Object.keys(options).forEach(function (k) {
      if (fromServer) userSettings[k] = "".concat(options[k]);

      _this2._setOption(k, options[k], fromServer);
    });
  },
  _setOption: function _setOption(key, value, skipSync) {
    localSettings[key] = "".concat(value);

    _localstorage["default"].set(key, value);

    if (!skipSync && typeof userSettings[key] !== 'undefined') {
      this._syncSettings();
    }
  },
  _getOption: function _getOption(key) {
    return _localstorage["default"].get(key);
  },
  _trackEpisode: function _trackEpisode(filmHashId, episodeHashId) {
    var queued = {};

    try {
      queued = JSON.parse(_localstorage["default"].get(this._KEY_TRACKING));
    } catch (e) {}

    if (!queued || _typeof(queued) !== 'object' || Object.keys(queued).length >= 100) queued = {};
    queued[filmHashId] = episodeHashId;

    _localstorage["default"].set(this._KEY_TRACKING, JSON.stringify(queued));

    this._syncTracking();
  },
  _syncTracking: function _syncTracking() {
    var _this3 = this;

    if (!this._isLoggedIn()) return;
    if (syncTrackingTimer) clearTimeout(syncTrackingTimer);
    syncTrackingTimer = setTimeout(function () {
      _utils["default"]._ajax('ajax/user/playing', ['type', 'POST', 'data', ['data', _localstorage["default"].get(_this3._KEY_TRACKING)]]).done(function (resp) {
        if (resp.success) {
          _localstorage["default"].remove(_this3._KEY_TRACKING);
        }
      });
    }, 300);
  },
  _syncSettings: function _syncSettings() {
    if (!this._isLoggedIn()) return;
    if (syncSettingTimer) clearTimeout(syncSettingTimer);
    syncSettingTimer = setTimeout(function () {
      _utils["default"]._ajax('ajax/user/update', ['type', 'POST', 'data', ['settings', localSettings]]).done(function (resp) {
        if (resp.success && resp.messages) {
          (0, _toast["default"])(resp.messages);
        }
      });
    }, 300);
  }
};
var _userUtils = userUtils;
exports._userUtils = _userUtils;

var _default = function _default() {
  $panel = $('#user');

  userUtils._reload();
};

exports["default"] = _default;

},{"../../utils/localstorage":22,"../../utils/utils":24,"./toast":11}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var _user = require("./user");

var _cookie = require("../../utils/cookie");

var _localstorage = require("../../utils/localstorage");

var _utils = require("../../utils/utils");

var $ = window.jQuery;

function Watch($wrapper) {
  this._construct($wrapper);
}

Watch.prototype = {
  _construct: function _construct($wrapper) {
    var _this = this;

    this._$wrapper = $wrapper;
    this._$player = $wrapper.find('#player');
    this._filmHashId = $wrapper.data('id');
    this._filmType = $wrapper.data('type');
    this._$serversWrapper = $wrapper.find('#episodes');
    this._$commentWrapper = $wrapper.find('#comment');
    this._autoNextCtl = $('.ctl.onoff[data-name="autonext"]').data('ControlOnOff');
    this._autoPlayCtl = $('.ctl.onoff[data-name="autoplay"]').data('ControlOnOff');
    this._forceAutoPlay = false;
    this._preload = true;

    this._loadServers(function () {
      _this._$seasons = $wrapper.find('#seasons input');
      _this._$servers = $wrapper.find('#servers .server');
      _this._$ranges = $wrapper.find('#ranges');
      _this._$episodeBlocks = $wrapper.find('.episodes');
      _this._$episodes = _this._$episodeBlocks.find('a');

      _this._$episodes.click($.proxy(_this._episodeClick, _this));

      _this._$servers.click($.proxy(_this._serverClick, _this));

      _this._activeWatchingEpisode();

      _this._registerSeasons();

      _this._$player.find('#play').click(function () {
        _this._forceAutoPlay = true;

        _this._loadCurrent();
      });

      if (_this._preload || _this._autoPlayCtl._value()) {
        _this._loadCurrent();
      }
    });

    this._registerPlayerEvents();

    this._registerShortcutsForwarding();
  },
  _showShareModal: function _showShareModal() {
    var cookieKey = 'share';
    if (_cookie["default"].get(cookieKey) || typeof window.atwpjp === 'undefined') return;

    _cookie["default"].set(cookieKey, 1, 86400);

    $('#md-share').modal();
  },
  _loadCurrent: function _loadCurrent() {
    this._loadEpisode(this._getCurrentEpisode());
  },
  _loadEpisode: function _loadEpisode($episode) {
    var _this2 = this;

    if (!$episode.length || $episode.data('loading')) return;
    $episode.data('loading', true);

    if (!$episode.data('dontShowRange')) {
      this._showRangeOfEpisode($episode);
    }

    $episode.data('dontShowRange', false);

    this._$player._showLoading();

    this._saveWatchingEpisode($episode);

    this._pushHistoryState($episode);

    this._loadDisqusComment();

    this._$episodes.removeClass('active');

    $episode.addClass('active');

    _utils["default"]._ajax("ajax/episode/info".concat(window.location.search), ['data', ['id', $episode.data('id')]]).done(function (response) {
      if (response.error) {
        _this2._showMessage('An error occurred, please refresh this page then try again');

        return;
      }

      var k = 'url';

      var url = _utils["default"]._decryptData(response[k]);

      _this2._renderIframe(url);
    }).fail(function () {
      _this2._showMessage('Server error, please refresh this page and try again');
    }).always(function () {
      $episode.data('loading', false);
    });
  },
  _renderIframe: function _renderIframe(url_) {
    var url = url_;

    if (this._forceAutoPlay || this._autoPlayCtl._value()) {
      url += "".concat(url.indexOf('?') < 0 ? '?' : '&', "autostart=true");
    }

    var $iframe = $('<iframe />').attr('src', url).attr('allow', 'autoplay; fullscreen').attr('frameborder', 'no').attr('scrolling', 'no').attr('allowfullscreen', 'yes').css('width', '100%').css('height', '100%');

    this._$player.empty().append($iframe);

    this._forceAutoPlay = false;
  },
  _episodeClick: function _episodeClick(e) {
    e.preventDefault();
    var $episode = $(e.currentTarget);
    this._forceAutoPlay = true;

    this._applyEpisodeServers($episode); // this._focusPlayer();


    $episode.data('dontShowRange', true);

    this._loadEpisode($episode);
  },
  _serverClick: function _serverClick(e) {
    var $server = $(e.currentTarget);

    var $epsiode = this._getCurrentEpisode();

    this._$servers.removeClass('active');

    $server.addClass('active');

    _localstorage["default"].set('lastServer', $server.data('id'));

    $epsiode.data('id', $server.data('episodeId'));
    $epsiode.data('dontShowRange', true);
    this._forceAutoPlay = true;
    this._forceAutoPlay = true; // this._focusPlayer();

    this._loadEpisode($epsiode);
  },
  _getCurrentEpisode: function _getCurrentEpisode() {
    var $episode = this._$episodes.filter('.active');

    if (!$episode.length) {
      $episode = this._$episodes.first();
    }

    return $episode;
  },
  _getNextEpisode: function _getNextEpisode() {
    var $currentEpisode = this._getCurrentEpisode();

    var $nextEpispde = $currentEpisode.closest('.episode').next().find('a'); // may be is end of range

    if (!$nextEpispde.length) {
      $nextEpispde = $currentEpisode.closest('.range').next().find('a:first');
    }

    if ($nextEpispde.length) {
      return $nextEpispde;
    }

    return false;
  },
  _loadServers: function _loadServers(completeCallback) {
    var _this3 = this;

    var recaptcha = window.grecaptcha || undefined;
    var recaptchaKey = window.recaptcha_key || undefined;

    if (!recaptchaKey) {
      this._loadServersVerified(completeCallback, '');
    } else {
      recaptcha.ready(function () {
        recaptcha.execute(recaptchaKey, {
          action: 'load_server'
        }).then(function (token) {
          _this3._loadServersVerified(completeCallback, token);
        });
      });
    }
  },
  _loadServersVerified: function _loadServersVerified(completeCallback, token) {
    var _this4 = this;

    this._$serversWrapper._showLoading();

    _utils["default"]._ajax("/ajax/film/servers".concat(window.location.search), ['data', ['id', this._filmHashId, 'vrf', _utils["default"]._encryptData(this._filmHashId), 'episode', this._$wrapper.data('epid') || undefined, 'token', token]]).done(function (response) {
      if (response.error) {
        _this4._showMessage(response.error);

        return;
      }

      _this4._$serversWrapper.html(response.html).activate();

      if (typeof completeCallback === 'function') {
        completeCallback();
      }
    }).fail(function () {
      _this4._showMessage('Server error, please try again');
    });
  },
  _showRangeOfEpisode: function _showRangeOfEpisode($episode) {
    // const $currentEp = this._getCurrentEpisode();
    var range = $episode.closest('.range').data('range');
    var seasonNumber = $episode.closest('.episodes').data('season');

    var $season = this._$seasons.filter("[value=\"".concat(seasonNumber, "\"]"));

    $season.click();

    this._createSeasonRange($season, range);

    this._showSeason($season, range);

    this._showRange(range);

    this._applyEpisodeServers($episode);
  },
  _registerSeasons: function _registerSeasons() {
    var _this5 = this;

    this._$seasons.change(function (e) {
      var $season = $(e.target);

      _this5._createSeasonRange($season);

      _this5._showSeason($season);
    });
  },
  _applyEpisodeServers: function _applyEpisodeServers($episode) {
    var episodes = $episode.data('ep');
    var serverIds = Object.keys(episodes);

    var lastServerId = _localstorage["default"].get('lastServer');

    this._$servers.hide().removeClass('active');

    for (var i = 0; i < serverIds.length; i++) {
      this._$servers.filter("[data-id=\"".concat(serverIds[i], "\"]")).data('episodeId', episodes[serverIds[i]]).show();
    }

    var $targetServer = lastServerId ? this._$servers.filter("[data-id=\"".concat(lastServerId, "\"]")) : this._$servers.filter(':visible').first();
    $targetServer.addClass('active'); // default

    $episode.data('id', $targetServer.data('episodeId'));
  },
  _createSeasonRange: function _createSeasonRange($season, activeRange) {
    var _this6 = this;

    var ranges = $season.data('ranges');

    this._$ranges.empty();

    if (ranges.length <= 1) return;

    var _activeRange = activeRange || ranges[0];

    for (var i = 0; i < ranges.length; i++) {
      $('<li />').addClass(_activeRange == ranges[i] ? 'active' : '').attr('data-range', ranges[i]).text(ranges[i]).click(function (e) {
        var $range = $(e.target);

        _this6._$ranges.find('li').removeClass('active');

        $range.addClass('active');

        _this6._showRange($range.text());
      }).appendTo(this._$ranges);
    }
  },
  _showSeason: function _showSeason($season, defaultRange) {
    this._$episodeBlocks.hide();

    var $block = this._$episodeBlocks.filter("[data-season=\"".concat($season.val(), "\"]"));

    if (this._filmType == 'series' || this._$episodes.length > 1) {
      $block.fadeIn();

      if (defaultRange) {
        $block.find(".range[data-range=\"".concat(defaultRange, "\"]")).hide().first().show();
      } else {
        $block.find('.range').hide().first().show();
      }
    }
  },
  _showRange: function _showRange(range) {
    var $ranges = this._$episodeBlocks.filter(':visible').find('.range');

    $ranges.hide();
    $ranges.filter("[data-range=\"".concat(range, "\"]")).fadeIn();
  },
  // disqus comments
  _loadDisqusComment: function _loadDisqusComment() {
    var $season = this._$seasons.filter(':checked');

    this._loadSeasonComment($season);
  },
  _loadSeasonComment: function _loadSeasonComment($season) {
    if (typeof $season === 'undefined' || !$season.length) {
      this._disqusConfig(this._$commentWrapper.data('identifier'));
    } else {
      this._disqusConfig($season.data('comment-identifier'));
    }
  },
  _disqusConfig: function _disqusConfig(identifier) {
    if (this._lastLoadedCommentIdentifier == identifier) return;
    this._lastLoadedCommentIdentifier = identifier;

    var url = this._$commentWrapper.data('url');

    try {
      window.disqus_config = function config() {
        this.page.identifier = identifier;
        this.page.url = url;
      };
    } catch (err) {}

    this._discusReload();
  },
  _discusReload: function _discusReload() {
    if (!this._commentLoaded) {
      this._commentLoaded = true;
      var d = document;
      var s = d.createElement('script');
      s.src = this._$commentWrapper.data('src');
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    }

    try {
      window.DISQUS.reset({
        reload: true
      });
    } catch (err) {}
  },
  // end disqus comments
  _showMessage: function _showMessage(msg) {
    var $msg = $('<div class="message" />').text(msg);

    var playerH = this._$player.height();

    this._$player.empty().append($msg);

    var offsetTop = (playerH - $msg.height()) / 2;
    $msg.css('top', "".concat(offsetTop / playerH * 100, "%"));
  },
  _pushHistoryState: function _pushHistoryState($episode) {
    if (typeof window.history.replaceState !== 'function') return;
    window.history.replaceState({
      name: $episode.data('id')
    }, document.title, $episode.attr('href'));
  },
  _activeWatchingEpisode: function _activeWatchingEpisode() {
    if (/[.-][\w]+\/([\w-]+)($|\?)/i.test(window.location.href)) {
      return;
    }

    var kname = this._getWatchingEpisode();

    var $episode = this._$episodes.filter("[data-kname=\"".concat(kname, "\"]:first"));

    if (!$episode.length) {
      $episode = this._$episodes.filter('.active');
    }

    if ($episode.length) {
      this._$episodes.removeClass('active');

      $episode.addClass('active');

      this._showRangeOfEpisode($episode);
    }
  },
  _getWatchingEpisode: function _getWatchingEpisode() {
    return _localstorage["default"].get("_watching.".concat(this._filmHashId));
  },
  _saveWatchingEpisode: function _saveWatchingEpisode($episode) {
    _localstorage["default"].set("_watching.".concat(this._filmHashId), $episode.data('kname'));

    _user._userUtils._trackEpisode(this._filmHashId, $episode.data('id'));
  },
  _focusPlayer: function _focusPlayer() {
    this._$player._scrollFocus();
  },
  _handleAutoNext: function _handleAutoNext() {
    if (!this._autoNextCtl._value()) return;

    var $episode = this._getNextEpisode();

    if ($episode) {
      this._loadEpisode($episode);
    }
  },
  _handlePlayerError: function _handlePlayerError() {
    var $nextServer = this._$servers.filter('.active').next();

    if ($nextServer) {
      $nextServer.click();
    }
  },
  _registerPlayerEvents: function _registerPlayerEvents() {
    var _this7 = this;

    $(window).on('message', function (e) {
      var message = e.message || e.data || e.originalEvent.data;

      switch (message) {
        case 'player.play':
          _this7._showShareModal();

          break;

        case 'player.complete':
          _this7._handleAutoNext();

          break;

        case 'player.error':
          _this7._handlePlayerError();

          break;

        default:
          break;
      }
    });
  },
  _registerShortcutsForwarding: function _registerShortcutsForwarding() {
    $(window).keydown(function (e) {
      if ('INPUT,TEXTAREA'.indexOf($(e.target).prop('tagName')) !== -1) return; // prevent scrolling (disqus) while pressing SPACE
      // up arrow, down arrow

      if ([32, 38, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      }

      var $iframe = $('#player > iframe');

      if ($iframe.length) {
        $iframe[0].contentWindow.postMessage(JSON.stringify({
          keyCode: e.keyCode
        }), '*');
      }
    });
  }
};

var _default = function _default() {
  _fw["default"].bind('#watch', Watch, 'Watch');
};

exports["default"] = _default;

},{"../../utils/cookie":19,"../../utils/fw":21,"../../utils/localstorage":22,"../../utils/utils":24,"./user":13}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var _localstorage = require("../../utils/localstorage");

var _ajaxform = require("./ajaxform");

var _utils = require("../../utils/utils");

var _user = require("./user");

var $ = window.jQuery;

function ControlOnOff($control) {
  this._construct($control);
}

ControlOnOff.prototype = {
  _icons: {
    _on: '<i class="fa fa-check-circle"></i>',
    _off: '<i class="fa fa-circle" style="font-weight:400"></i>'
  },
  _construct: function _construct($control) {
    this._$control = $control;
    this._name = $control.data('name');
    this._origHtml = $control.html();
    this._default = _user._userUtils._getOption(this._name) || !!$control.data('default');
    this._$target = $control.data('target') ? $($control.data('target')) : null;

    this._render(this._value(), true);

    this._$control.click($.proxy(this._toggle, this));
  },
  _toggle: function _toggle() {
    var newValue = !this._value();

    this._set(newValue);

    this._render(newValue);
  },
  _render: function _render(value, isFirst) {
    if (this._$target) {
      if (value) {
        if (isFirst) {
          this._$target.show();
        } else {
          this._$target.slideDown();
        }
      } else if (isFirst) {
        this._$target.hide();
      } else {
        this._$target.slideUp();
      }

      return;
    }

    this._$control.html("".concat(value ? this._icons._on : this._icons._off, " ").concat(this._origHtml));
  },
  _set: function _set(value) {
    var val = value ? 1 : 0;
    if (!this._name) return;

    _localstorage["default"].set(this._name, val);

    _user._userUtils._setOption(this._name, val);
  },
  _value: function _value() {
    var value = _localstorage["default"].get(this._name);

    if (value) {
      value = !!parseInt(value, 10);
    } else {
      value = this._default;
    }

    return value;
  }
};

function ControlLight($control) {
  var value = false;
  var $overlay;
  var $player = $('#player');

  var toggle = function toggle() {
    if (!value) {
      $player.css('z-index', 15);
      $overlay.fadeIn('slow');
    } else {
      $overlay.fadeOut('slow', function () {
        $player.removeAttr('style');
      });
    }

    value = !value;
  };

  $overlay = $('<div />').css('width', '100%').css('height', '100%').css('position', 'fixed').css('left', 0).css('top', 0).css('z-index', 11).css('background', '#000').css('opacity', '0.95').css('display', 'none').appendTo(document.body).click(toggle);
  $control.click(toggle);
}

function ReportForm($control) {
  this._construct($control);

  this._setup();
}

ReportForm.prototype = $.extend({}, _ajaxform._AjaxForm.prototype, {
  _setup: function _setup() {
    this._$form.data('action', 'ajax/film/report');

    this._$episode = this._$modal.find('.episode span');

    this._$modal.on('shown.bs.modal', $.proxy(this._updateLayout, this));
  },
  _updateLayout: function _updateLayout() {
    this._$episode.text(this._getEpisodeName());
  },
  _checkValid: function _checkValid() {
    var data = this._getData();

    return data !== false;
  },
  _getData: function _getData() {
    var message = $.trim(this._$form.find('textarea[name="message"]').val());
    var issue = [];

    this._$form.find('input[type="checkbox"]:checked').each(function (i, el) {
      return issue.push(el.value);
    });

    if (!message && (!issue.length || issue.join('').indexOf('other') > -1)) {
      return false;
    }

    var data = _utils["default"]._arrayToObject(['message', message, 'episode', this._getEpisodeId()]);

    data.issue = issue;
    return data;
  },
  _getEpisodeName: function _getEpisodeName() {
    return $('#episodes .episodes a.active').text();
  },
  _getEpisodeId: function _getEpisodeId() {
    return $('#episodes .episodes a.active').data('id') || '';
  }
});

var _default = function _default() {
  _fw["default"].bind('#md-report form', ReportForm, 'ReportForm');

  _fw["default"].bind('.ctl.onoff', ControlOnOff, 'ControlOnOff');

  _fw["default"].bind('.ctl.light', ControlLight, 'ControlLight');
};

exports["default"] = _default;

},{"../../utils/fw":21,"../../utils/localstorage":22,"../../utils/utils":24,"./ajaxform":1,"./user":13}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fw = require("../../utils/fw");

var _cookie = require("../../utils/cookie");

var _utils = require("../../utils/utils");

var $ = window.jQuery;

function Rating($wrapper) {
  this._construct($wrapper);
}

Rating.prototype = {
  _classes: {
    _none: 'fa fa-star none',
    _half: 'fa fa-star-half',
    _full: 'fa fa-star'
  },
  _captions: {
    1: 'Too Bad',
    2: 'Bad',
    3: 'Too Bored',
    4: 'Bored',
    5: 'Fine',
    6: 'Fine',
    7: 'Good',
    8: 'Like it',
    9: 'Amazing',
    10: 'Excellent'
  },
  _construct: function _construct($wrapper) {
    this._filmId = $wrapper.data('id');
    this._$wrapper = $wrapper.find('.rating');
    this._$label = this._$wrapper.find('.text');
    this._$starsWrapper = this._$wrapper.find('.stars');
    this._value = this._$wrapper.data('value');
    this._count = this._$wrapper.data('count');

    this._$label.data('original', this._$label.html()); // _render stars


    this._render();

    this._reset();

    if (!this._rated()) {
      this._bindStars();
    }
  },
  _render: function _render() {
    var html = '';
    var $icon;
    var i;

    for (i = 1; i <= 5; i += 1) {
      $icon = $('<i />');
      html += $('<span />').append($icon).addClass(this._classes._full) // as background
      .attr('data-value', i * 2).prop('outerHTML');
    }

    this._$starsWrapper.html(html);

    this._$stars = this._$starsWrapper.find('span.fa');
  },
  _bindStars: function _bindStars() {
    this._$stars.mousemove($.proxy(this._starHover, this)).mouseout($.proxy(this._reset, this)).click($.proxy(this._starClick, this));
  },
  _unbindStars: function _unbindStars() {
    this._$stars.unbind('click').unbind('mousemove').unbind('mouseout');
  },
  _showStarAt: function _showStarAt(index, fullStar, showCaption) {
    var cls = '';
    var i = 0;
    var $startAt;
    var val;

    for (; i < this._$stars.length; i += 1) {
      $startAt = $(this._$stars[i]);
      val = $startAt.data('value');

      if (i < index) {
        cls = this._classes._full;
      } else if (i === index) {
        if (fullStar) {
          cls = this._classes._full;
        } else {
          cls = this._classes._half;
          val -= 1;
        }

        if (showCaption) {
          this._showCaption(this._captions[val]);
        }
      } else {
        cls = this._classes._none;
      }

      cls += showCaption ? ' active' : '';
      $('i', $startAt).attr('class', cls).data('value', val);
    }
  },
  _showCaption: function _showCaption(text) {
    this._$label.text(text);
  },
  _markRated: function _markRated() {
    var stack = JSON.parse(_cookie["default"].get('rated')) || {};
    stack[this._filmId] = 1;

    _cookie["default"].set('rated', JSON.stringify(stack));
  },
  _rated: function _rated() {
    return !!(JSON.parse(_cookie["default"].get('rated')) || {})[this._filmId];
  },
  _starClick: function _starClick(e) {
    var _this = this;

    var $star = $(e.currentTarget);
    var value = $star.find('i').data('value');

    this._unbindStars();

    this._markRated();

    _utils["default"]._ajax('ajax/film/rate', ['type', 'POST', 'data', ['id', this._filmId, 'score', value, 's', Math.random()]]).done(function (data) {
      var text = _this._$label.data('text').replace('$1', data.avg).replace('$2', data.count_format);

      _this._$label.html(text);
    });
  },
  _starHover: function _starHover(e) {
    var $star = $(e.currentTarget);

    this._showStarAt($star.index(), e.offsetX > $star.width() / 2, true);
  },
  _reset: function _reset() {
    var i;

    for (i = 1; i < 5; i += 1) {
      if (this._value > i * 2 && this._value <= (i + 1) * 2) {
        this._showStarAt(i, this._value === (i + 1) * 2, false);
      }
    }

    this._$label.html(this._$label.data('original'));
  }
};

var _default = function _default() {
  _fw["default"].bind('#watch', Rating, 'Rating');
};

exports["default"] = _default;

},{"../../utils/cookie":19,"../../utils/fw":21,"../../utils/utils":24}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var $ = window.jQuery;
var defaults = {
  source: '',
  query: 'keyword',
  extra: {},
  delay: 250,
  minLen: 1
};

function AutoCompleteAbstract($input) {
  this._construct($input);
}

AutoCompleteAbstract.prototype = {
  _construct: function _construct($input) {
    var _this = this;

    this._$input = $input;
    this._$form = $input.closest('form');
    this._timer = null;
    this._options = defaults;
    this._shown = false;
    this._focus = false;

    this._$form.submit($.proxy(this._submit, this));

    this._$input.attr('autocomplete', 'off').keyup($.proxy(this._keyup, this)).focus(function () {
      _this._focus = true;
    });

    $(document).click(function (e) {
      if (_this._focus && _this._$form[0] !== e.target && !$.contains(_this._$form[0], e.target)) {
        _this._close();
      }
    });
  },
  __show: function __show() {},
  __hide: function __hide() {},
  __close: function __close() {},
  __startLookup: function __startLookup() {},
  _submit: function _submit(e) {
    if (this._value() === '') {
      e.preventDefault();

      this._$input.focus();
    }
  },
  _close: function _close() {
    this._$input.val('');

    this._hide();

    this.__close();
  },
  _closeIfEmpty: function _closeIfEmpty() {
    if (this._value() === '') {
      this.__close();

      this._focus = false;
    }
  },
  _show: function _show() {
    this.__show.apply(this, arguments);

    this._shown = true;
  },
  _hide: function _hide() {
    if (this._timer) clearTimeout(this._timer);

    this.__hide.apply(this, arguments);

    this._shown = false;
  },
  _setOptions: function _setOptions(opts) {
    this._options = $.extend({}, this._options, opts || {});
  },
  _keyup: function _keyup(e) {
    if (this._options.source === '') return;
    if (this._timer) clearTimeout(this._timer);

    switch (e.keyCode) {
      case 27:
        // escape
        this._hide();

        this._closeIfEmpty();

        this._$input.val('');

        break;

      default:
        if (this._value().length < this._options.minLen) {
          this._hide();

          return;
        }

        this._timer = this._lookupTimer($.proxy(this._show, this));
    }
  },
  _value: function _value() {
    return this._$input.val().trim();
  },
  _lookupTimer: function _lookupTimer(cb) {
    var _this2 = this;

    return setTimeout(function () {
      var val = _this2._value();

      _this2.__startLookup(); // avoid user clear input faster than query delay


      if (val.length < _this2._options.minLen) {
        _this2._hide();

        return;
      }

      _this2._options.extra[_this2._options.query] = val;
      $.ajax({
        url: _this2._options.source,
        data: _this2._options.extra
      }).done(cb);
    }, this._options.delay);
  }
};
var _default = AutoCompleteAbstract;
exports["default"] = _default;

},{}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._btoa = exports._atob = void 0;
var base64Key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function atobLookup(chr) {
  var index = base64Key.indexOf(chr); // Throw exception if character is not in the lookup string; should not be hit in tests

  return index < 0 ? undefined : index;
}

function btoaLookup(index) {
  if (index >= 0 && index < 64) {
    return base64Key[index];
  } // Throw INVALID_CHARACTER_ERR exception here -- won't be hit in the tests.


  return undefined;
}
/**
 * btoa() as defined by the HTML and Infra specs, which mostly just references
 * RFC 4648.
 */


function btoa(s) {
  var i; // String conversion as required by Web IDL.

  s = "".concat(s); // "The btoa() method must throw an "InvalidCharacterError" DOMException if
  // data contains any character whose code point is greater than U+00FF."

  for (i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 255) {
      return null;
    }
  }

  var out = '';

  for (i = 0; i < s.length; i += 3) {
    var groupsOfSix = [undefined, undefined, undefined, undefined];
    groupsOfSix[0] = s.charCodeAt(i) >> 2;
    groupsOfSix[1] = (s.charCodeAt(i) & 0x03) << 4;

    if (s.length > i + 1) {
      groupsOfSix[1] |= s.charCodeAt(i + 1) >> 4;
      groupsOfSix[2] = (s.charCodeAt(i + 1) & 0x0f) << 2;
    }

    if (s.length > i + 2) {
      groupsOfSix[2] |= s.charCodeAt(i + 2) >> 6;
      groupsOfSix[3] = s.charCodeAt(i + 2) & 0x3f;
    }

    for (var j = 0; j < groupsOfSix.length; j++) {
      if (typeof groupsOfSix[j] === 'undefined') {
        out += '=';
      } else {
        out += btoaLookup(groupsOfSix[j]);
      }
    }
  }

  return out;
}

function atob(data) {
  // Web IDL requires DOMStrings to just be converted using ECMAScript
  // ToString, which in our case amounts to using a template literal.
  data = "".concat(data); // "Remove all ASCII whitespace from data."

  data = data.replace(/[ \t\n\f\r]/g, ''); // "If data's length divides by 4 leaving no remainder, then: if data ends
  // with one or two U+003D (=) code points, then remove them from data."

  if (data.length % 4 === 0) {
    data = data.replace(/==?$/, '');
  } // "If data's length divides by 4 leaving a remainder of 1, then return
  // failure."
  //
  // "If data contains a code point that is not one of
  //
  // U+002B (+)
  // U+002F (/)
  // ASCII alphanumeric
  //
  // then return failure."


  if (data.length % 4 === 1 || /[^+/0-9A-Za-z]/.test(data)) {
    return null;
  } // "Let output be an empty byte sequence."


  var output = ''; // "Let buffer be an empty buffer that can have bits appended to it."
  //
  // We append bits via left-shift and or.  accumulatedBits is used to track
  // when we've gotten to 24 bits.

  var buffer = 0;
  var accumulatedBits = 0; // "Let position be a position variable for data, initially pointing at the
  // start of data."
  //
  // "While position does not point past the end of data:"

  for (var i = 0; i < data.length; i++) {
    // "Find the code point pointed to by position in the second column of
    // Table 1: The Base 64 Alphabet of RFC 4648. Let n be the number given in
    // the first cell of the same row.
    //
    // "Append to buffer the six bits corresponding to n, most significant bit
    // first."
    //
    // atobLookup() implements the table from RFC 4648.
    buffer <<= 6;
    buffer |= atobLookup(data[i]);
    accumulatedBits += 6; // "If buffer has accumulated 24 bits, interpret them as three 8-bit
    // big-endian numbers. Append three bytes with values equal to those
    // numbers to output, in the same order, and then empty buffer."

    if (accumulatedBits === 24) {
      output += String.fromCharCode((buffer & 0xff0000) >> 16);
      output += String.fromCharCode((buffer & 0xff00) >> 8);
      output += String.fromCharCode(buffer & 0xff);
      buffer = accumulatedBits = 0;
    } // "Advance position by 1."

  } // "If buffer is not empty, it contains either 12 or 18 bits. If it contains
  // 12 bits, then discard the last four and interpret the remaining eight as
  // an 8-bit big-endian number. If it contains 18 bits, then discard the last
  // two and interpret the remaining 16 as two 8-bit big-endian numbers. Append
  // the one or two bytes with values equal to those one or two numbers to
  // output, in the same order."


  if (accumulatedBits === 12) {
    buffer >>= 4;
    output += String.fromCharCode(buffer);
  } else if (accumulatedBits === 18) {
    buffer >>= 2;
    output += String.fromCharCode((buffer & 0xff00) >> 8);
    output += String.fromCharCode(buffer & 0xff);
  } // "Return output."


  return output;
}
/**
 * A lookup table for atob(), which converts an ASCII character to the
 * corresponding six-bit number.
 */


var _atob = atob;
exports._atob = _atob;
var _btoa = btoa;
exports._btoa = _btoa;

},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var Cookie = {
  set: function set(name, value, expr, path, domain) {
    var c = "".concat(name, "=").concat(encodeURIComponent(value.toString()), ";");
    var expires = null;

    if (typeof expr === 'number' || expr instanceof Number) {
      var date = new Date();
      date.setTime(date.getTime() + expr * 1e3);
      expires = date.toUTCString();
    } else if (typeof expr === 'string' || expr instanceof String) {
      expires = expr;
    } else if (expr instanceof Date) {
      expires = expr.toUTCString();
    }

    if (expires) c += "expires=".concat(expires, ";");

    if (typeof domain === 'undefined') {
      c += "domain=".concat(window.location.hostname.replace(/^([^\.]+\.)?([^\.]+\.[\w]+)$/, '.$2'), ";");
    }

    c += "path=".concat(path || '/', ";");
    document.cookie = c;
  },
  get: function get(name) {
    var expr = new RegExp("(^| )".concat(name, "=([^;]+)(;|$)"));
    var m = expr.exec(document.cookie);
    return m ? decodeURIComponent(m[2]) : null;
  },
  remove: function remove(name) {
    this.set(name, 0, new Date(0));
    this.set(name, 0, new Date(0), null, null);
  }
};
var _default = Cookie;
exports["default"] = _default;

},{}],20:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

!function (t, n) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = n() : "function" == typeof define && define.amd ? define([], n) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? exports.devtoolsDetector = n() : t.devtoolsDetector = n();
}("undefined" != typeof self ? self : void 0, function () {
  return function (t) {
    var n = {};

    function e(r) {
      if (n[r]) return n[r].exports;
      var i = n[r] = {
        i: r,
        l: !1,
        exports: {}
      };
      return t[r].call(i.exports, i, i.exports, e), i.l = !0, i.exports;
    }

    return e.m = t, e.c = n, e.d = function (t, n, r) {
      e.o(t, n) || Object.defineProperty(t, n, {
        configurable: !1,
        enumerable: !0,
        get: r
      });
    }, e.n = function (t) {
      var n = t && t.__esModule ? function () {
        return t["default"];
      } : function () {
        return t;
      };
      return e.d(n, "a", n), n;
    }, e.o = function (t, n) {
      return Object.prototype.hasOwnProperty.call(t, n);
    }, e.p = "", e(e.s = 6);
  }([function (t, n, e) {
    "use strict";

    (function (t) {
      n.b = function (t) {
        void 0 === t && (t = {});

        for (var n = t.includes, e = void 0 === n ? [] : n, r = t.excludes, i = void 0 === r ? [] : r, o = !1, u = !1, c = 0, a = e; c < a.length; c++) {
          var f = a[c];

          if (!0 === f) {
            o = !0;
            break;
          }
        }

        for (var s = 0, l = i; s < l.length; s++) {
          var f = l[s];

          if (!0 === f) {
            u = !0;
            break;
          }
        }

        return o && !u;
      }, n.c = function (t, n, e) {
        var o = i.a[t];
        if (void 0 === o) return !1;
        return Object(r.compare)(o, n, e);
      }, n.a = function () {
        if ("undefined" != typeof self) return self;
        if ("undefined" != typeof window) return window;
        if (void 0 !== t) return t;
        return this;
      };
      var r = e(11),
          i = (e.n(r), e(4));
    }).call(n, e(10));
  }, function (t, n, e) {
    "use strict";

    e.d(n, "c", function () {
      return f;
    }), e.d(n, "d", function () {
      return s;
    }), e.d(n, "b", function () {
      return l;
    }), e.d(n, "f", function () {
      return d;
    }), e.d(n, "a", function () {
      return h;
    }), e.d(n, "e", function () {
      return p;
    });
    var r,
        i,
        o,
        u = e(3),
        c = e(0),
        a = Object(c.a)(),
        f = "InstallTrigger" in ((null === a || void 0 === a ? void 0 : a.window) || {}) || /firefox/i.test(u.b),
        s = /trident/i.test(u.b) || /msie/i.test(u.b),
        l = /edge/i.test(u.b),
        d = /webkit/i.test(u.b) && !l,
        h = void 0 !== (null === (r = null === a || void 0 === a ? void 0 : a.window) || void 0 === r ? void 0 : r.chrome) || /chrome/i.test(u.b),
        p = "[object SafariRemoteNotification]" === ((null === (o = null === (i = null === a || void 0 === a ? void 0 : a.window) || void 0 === i ? void 0 : i.safari) || void 0 === o ? void 0 : o.pushNotification) || !1).toString() || /safari/i.test(u.b) && !h;
  }, function (t, n, e) {
    "use strict";

    e.d(n, "b", function () {
      return o;
    }), e.d(n, "c", function () {
      return u;
    }), e.d(n, "a", function () {
      return c;
    });
    var r = e(1);

    function i(t) {
      if (console) {
        if (!r.d && !r.b) return console[t];
        if ("log" === t || "clear" === t) return function () {
          for (var n = [], e = 0; e < arguments.length; e++) {
            n[e] = arguments[e];
          }

          console[t].apply(console, n);
        };
      }

      return function () {
        for (var t = [], n = 0; n < arguments.length; n++) {
          t[n] = arguments[n];
        }
      };
    }

    var o = i("log"),
        u = i("table"),
        c = i("clear");
  }, function (t, n, e) {
    "use strict";

    n.a = function () {
      for (var t, n = [], e = 0; e < arguments.length; e++) {
        n[e] = arguments[e];
      }

      if (null === o || void 0 === o ? void 0 : o.document) return (t = o.document).createElement.apply(t, n);
      return {};
    }, e.d(n, "b", function () {
      return u;
    });
    var r,
        i = e(0),
        o = Object(i.a)();
    var u = (null === (r = null === o || void 0 === o ? void 0 : o.navigator) || void 0 === r ? void 0 : r.userAgent) || "xxxxx";
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return r;
    });

    for (var r = {}, i = 0, o = (e(3).b || "").match(/\w+\/(\d|\.)+(\s|$)/gi) || []; i < o.length; i++) {
      var u = o[i].split("/"),
          c = u[0],
          a = u[1];
      r[c] = a;
    }
  }, function (t, n, e) {
    "use strict";

    e.d(n, "b", function () {
      return i;
    }), e.d(n, "d", function () {
      return o;
    }), e.d(n, "c", function () {
      return u;
    }), e.d(n, "a", function () {
      return c;
    }), e.d(n, "e", function () {
      return a;
    });
    var r = e(3),
        i = /ipad/i.test(r.b),
        o = /macintosh/i.test(r.b),
        u = /iphone/i.test(r.b),
        c = /android/i.test(r.b),
        a = /windows/i.test(r.b);
  }, function (t, n, e) {
    "use strict";

    Object.defineProperty(n, "__esModule", {
      value: !0
    }), n.addListener = function (t) {
      l.addListener(t);
    }, n.removeListener = function (t) {
      l.removeListener(t);
    }, n.isLaunch = function () {
      return l.isLaunch();
    }, n.launch = function () {
      l.launch();
    }, n.stop = function () {
      l.stop();
    }, n.setDetectDelay = function (t) {
      l.setDetectDelay(t);
    };
    var r = e(7),
        i = e(8);
    e.d(n, "DevtoolsDetector", function () {
      return r.a;
    }), e.d(n, "checkers", function () {
      return i;
    });
    var o = e(0);
    e.d(n, "match", function () {
      return o.b;
    }), e.d(n, "specificVersionMatch", function () {
      return o.c;
    });
    var u = e(1);
    e.d(n, "isFirefox", function () {
      return u.c;
    }), e.d(n, "isIE", function () {
      return u.d;
    }), e.d(n, "isEdge", function () {
      return u.b;
    }), e.d(n, "isWebkit", function () {
      return u.f;
    }), e.d(n, "isChrome", function () {
      return u.a;
    }), e.d(n, "isSafari", function () {
      return u.e;
    });
    var c = e(2);
    e.d(n, "log", function () {
      return c.b;
    }), e.d(n, "table", function () {
      return c.c;
    }), e.d(n, "clear", function () {
      return c.a;
    });
    var a = e(17);
    e.d(n, "isMobile", function () {
      return a.a;
    });
    var f = e(4);
    e.d(n, "versionMap", function () {
      return f.a;
    });
    var s = e(5);
    e.d(n, "isIpad", function () {
      return s.b;
    }), e.d(n, "isMac", function () {
      return s.d;
    }), e.d(n, "isIphone", function () {
      return s.c;
    }), e.d(n, "isAndroid", function () {
      return s.a;
    }), e.d(n, "isWindows", function () {
      return s.e;
    });
    var l = new r.a({
      checkers: [i.elementIdChecker, i.regToStringChecker, i.functionToStringChecker, i.depRegToStringChecker, i.dateToStringChecker, i.debuggerChecker]
    });
    n["default"] = l;
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return o;
    });

    var r = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        i = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    },
        o = function () {
      function t(t) {
        var n = t.checkers;
        this._listeners = [], this._isOpen = !1, this._detectLoopStopped = !0, this._detectLoopDelay = 500, this._checkers = n.slice();
      }

      return t.prototype.launch = function () {
        this._detectLoopDelay <= 0 && this.setDetectDelay(500), this._detectLoopStopped && (this._detectLoopStopped = !1, this._detectLoop());
      }, t.prototype.stop = function () {
        this._detectLoopStopped || (this._detectLoopStopped = !0, clearTimeout(this._timer));
      }, t.prototype.isLaunch = function () {
        return !this._detectLoopStopped;
      }, t.prototype.setDetectDelay = function (t) {
        this._detectLoopDelay = t;
      }, t.prototype.addListener = function (t) {
        this._listeners.push(t);
      }, t.prototype.removeListener = function (t) {
        this._listeners = this._listeners.filter(function (n) {
          return n !== t;
        });
      }, t.prototype._broadcast = function (t) {
        for (var n = 0, e = this._listeners; n < e.length; n++) {
          var r = e[n];

          try {
            r(t.isOpen, t);
          } catch (t) {}
        }
      }, t.prototype._detectLoop = function () {
        return r(this, void 0, void 0, function () {
          var t,
              n,
              e,
              r,
              o,
              u = this;
          return i(this, function (i) {
            switch (i.label) {
              case 0:
                t = !1, n = "", e = 0, r = this._checkers, i.label = 1;

              case 1:
                return e < r.length ? [4, (o = r[e]).isEnable()] : [3, 6];

              case 2:
                return i.sent() ? (n = o.name, [4, o.isOpen()]) : [3, 4];

              case 3:
                t = i.sent(), i.label = 4;

              case 4:
                if (t) return [3, 6];
                i.label = 5;

              case 5:
                return e++, [3, 1];

              case 6:
                return t != this._isOpen && (this._isOpen = t, this._broadcast({
                  isOpen: t,
                  checkerName: n
                })), this._detectLoopDelay > 0 ? this._timer = setTimeout(function () {
                  return u._detectLoop();
                }, this._detectLoopDelay) : this.stop(), [2];
            }
          });
        });
      }, t;
    }();
  }, function (t, n, e) {
    "use strict";

    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = e(9);
    e.d(n, "depRegToStringChecker", function () {
      return r.a;
    });
    var i = e(12);
    e.d(n, "elementIdChecker", function () {
      return i.a;
    });
    var o = e(13);
    e.d(n, "functionToStringChecker", function () {
      return o.a;
    });
    var u = e(14);
    e.d(n, "regToStringChecker", function () {
      return u.a;
    });
    var c = e(15);
    e.d(n, "debuggerChecker", function () {
      return c.a;
    });
    var a = e(16);
    e.d(n, "dateToStringChecker", function () {
      return a.a;
    });
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return s;
    });

    var r = e(1),
        i = e(2),
        o = e(0),
        u = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        c = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    },
        a = / /,
        f = !1;

    a.toString = function () {
      return f = !0, s.name;
    };

    var s = {
      name: "dep-reg-to-string",
      isOpen: function isOpen() {
        return u(this, void 0, void 0, function () {
          return c(this, function (t) {
            return f = !1, Object(i.c)({
              dep: a
            }), Object(i.a)(), [2, f];
          });
        });
      },
      isEnable: function isEnable() {
        return u(this, void 0, void 0, function () {
          return c(this, function (t) {
            return [2, Object(o.b)({
              includes: [!0],
              excludes: [r.c, r.d]
            })];
          });
        });
      }
    };
  }, function (t, n) {
    var e;

    e = function () {
      return this;
    }();

    try {
      e = e || Function("return this")() || (0, eval)("this");
    } catch (t) {
      "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && (e = window);
    }

    t.exports = e;
  }, function (t, n, e) {
    var r, i, o;
    !function (e, u) {
      i = [], void 0 === (o = "function" == typeof (r = u) ? r.apply(n, i) : r) || (t.exports = o);
    }(0, function () {
      var t = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;

      function n(t) {
        var n = t.replace(/^v/, "").replace(/\+.*$/, ""),
            e = function (t, n) {
          return -1 === t.indexOf(n) ? t.length : t.indexOf(n);
        }(n, "-"),
            r = n.substring(0, e).split(".");

        return r.push(n.substring(e + 1)), r;
      }

      function e(t) {
        return isNaN(Number(t)) ? t : Number(t);
      }

      function r(n) {
        if ("string" != typeof n) throw new TypeError("Invalid argument expected string");
        if (!t.test(n)) throw new Error("Invalid argument not valid semver ('" + n + "' received)");
      }

      function i(t, i) {
        [t, i].forEach(r);

        for (var o = n(t), u = n(i), c = 0; c < Math.max(o.length - 1, u.length - 1); c++) {
          var a = parseInt(o[c] || 0, 10),
              f = parseInt(u[c] || 0, 10);
          if (a > f) return 1;
          if (f > a) return -1;
        }

        var s = o[o.length - 1],
            l = u[u.length - 1];

        if (s && l) {
          var d = s.split(".").map(e),
              h = l.split(".").map(e);

          for (c = 0; c < Math.max(d.length, h.length); c++) {
            if (void 0 === d[c] || "string" == typeof h[c] && "number" == typeof d[c]) return -1;
            if (void 0 === h[c] || "string" == typeof d[c] && "number" == typeof h[c]) return 1;
            if (d[c] > h[c]) return 1;
            if (h[c] > d[c]) return -1;
          }
        } else if (s || l) return s ? -1 : 1;

        return 0;
      }

      var o = [">", ">=", "=", "<", "<="],
          u = {
        ">": [1],
        ">=": [0, 1],
        "=": [0],
        "<=": [-1, 0],
        "<": [-1]
      };
      return i.validate = function (n) {
        return "string" == typeof n && t.test(n);
      }, i.compare = function (t, n, e) {
        !function (t) {
          if ("string" != typeof t) throw new TypeError("Invalid operator type, expected string but got " + _typeof(t));
          if (-1 === o.indexOf(t)) throw new TypeError("Invalid operator, expected one of " + o.join("|"));
        }(e);
        var r = i(t, n);
        return u[e].indexOf(r) > -1;
      }, i;
    });
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return l;
    });

    var r = e(1),
        i = e(2),
        o = e(0),
        u = e(3),
        c = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        a = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    },
        f = Object(u.a)("div"),
        s = !1;

    Object.defineProperty(f, "id", {
      get: function get() {
        return s = !0, l.name;
      },
      configurable: !0
    });
    var l = {
      name: "element-id",
      isOpen: function isOpen() {
        return c(this, void 0, void 0, function () {
          return a(this, function (t) {
            return s = !1, Object(i.b)(f), Object(i.a)(), [2, s];
          });
        });
      },
      isEnable: function isEnable() {
        return c(this, void 0, void 0, function () {
          return a(this, function (t) {
            return [2, Object(o.b)({
              includes: [!0],
              excludes: [r.d, r.b, r.c]
            })];
          });
        });
      }
    };
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return l;
    });

    var r = e(1),
        i = e(2),
        o = e(5),
        u = e(0),
        c = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        a = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    };

    function f() {}

    var s = 0;

    f.toString = function () {
      return s++, "";
    };

    var l = {
      name: "function-to-string",
      isOpen: function isOpen() {
        return c(this, void 0, void 0, function () {
          return a(this, function (t) {
            return s = 0, Object(i.b)(f), Object(i.a)(), [2, 2 === s];
          });
        });
      },
      isEnable: function isEnable() {
        return c(this, void 0, void 0, function () {
          return a(this, function (t) {
            return [2, Object(u.b)({
              includes: [!0],
              excludes: [r.c, (o.b || o.c) && r.a]
            })];
          });
        });
      }
    };
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return s;
    });

    var r = e(2),
        i = e(1),
        o = e(0),
        u = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        c = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    },
        a = / /,
        f = !1;

    a.toString = function () {
      return f = !0, s.name;
    };

    var s = {
      name: "reg-to-string",
      isOpen: function isOpen() {
        return u(this, void 0, void 0, function () {
          return c(this, function (t) {
            return f = !1, Object(r.b)(a), Object(r.a)(), [2, f];
          });
        });
      },
      isEnable: function isEnable() {
        return u(this, void 0, void 0, function () {
          return c(this, function (t) {
            return [2, Object(o.b)({
              includes: [!0],
              excludes: [i.f]
            })];
          });
        });
      }
    };
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return u;
    });

    var r = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        i = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    };

    function o() {
      return performance ? performance.now() : Date.now();
    }

    var u = {
      name: "debugger-checker",
      isOpen: function isOpen() {
        return r(this, void 0, void 0, function () {
          var t;
          return i(this, function (n) {
            return t = o(), function () {}.constructor("debugger")(), [2, o() - t > 200];
          });
        });
      },
      isEnable: function isEnable() {
        return r(this, void 0, void 0, function () {
          return i(this, function (t) {
            return [2, !0];
          });
        });
      }
    };
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return s;
    });

    var r = e(1),
        i = e(2),
        o = e(0),
        u = this && this.__awaiter || function (t, n, e, r) {
      return new (e || (e = Promise))(function (i, o) {
        function u(t) {
          try {
            a(r.next(t));
          } catch (t) {
            o(t);
          }
        }

        function c(t) {
          try {
            a(r["throw"](t));
          } catch (t) {
            o(t);
          }
        }

        function a(t) {
          t.done ? i(t.value) : function (t) {
            return t instanceof e ? t : new e(function (n) {
              n(t);
            });
          }(t.value).then(u, c);
        }

        a((r = r.apply(t, n || [])).next());
      });
    },
        c = this && this.__generator || function (t, n) {
      var e,
          r,
          i,
          o,
          u = {
        label: 0,
        sent: function sent() {
          if (1 & i[0]) throw i[1];
          return i[1];
        },
        trys: [],
        ops: []
      };
      return o = {
        next: c(0),
        "throw": c(1),
        "return": c(2)
      }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
        return this;
      }), o;

      function c(o) {
        return function (c) {
          return function (o) {
            if (e) throw new TypeError("Generator is already executing.");

            for (; u;) {
              try {
                if (e = 1, r && (i = 2 & o[0] ? r["return"] : o[0] ? r["throw"] || ((i = r["return"]) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;

                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                  case 0:
                  case 1:
                    i = o;
                    break;

                  case 4:
                    return u.label++, {
                      value: o[1],
                      done: !1
                    };

                  case 5:
                    u.label++, r = o[1], o = [0];
                    continue;

                  case 7:
                    o = u.ops.pop(), u.trys.pop();
                    continue;

                  default:
                    if (!(i = (i = u.trys).length > 0 && i[i.length - 1]) && (6 === o[0] || 2 === o[0])) {
                      u = 0;
                      continue;
                    }

                    if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                      u.label = o[1];
                      break;
                    }

                    if (6 === o[0] && u.label < i[1]) {
                      u.label = i[1], i = o;
                      break;
                    }

                    if (i && u.label < i[2]) {
                      u.label = i[2], u.ops.push(o);
                      break;
                    }

                    i[2] && u.ops.pop(), u.trys.pop();
                    continue;
                }

                o = n.call(t, u);
              } catch (t) {
                o = [6, t], r = 0;
              } finally {
                e = i = 0;
              }
            }

            if (5 & o[0]) throw o[1];
            return {
              value: o[0] ? o[1] : void 0,
              done: !0
            };
          }([o, c]);
        };
      }
    },
        a = new Date(),
        f = 0;

    a.toString = function () {
      return f++, "";
    };

    var s = {
      name: "date-to-string",
      isOpen: function isOpen() {
        return u(this, void 0, void 0, function () {
          return c(this, function (t) {
            return f = 0, Object(i.b)(a), Object(i.a)(), [2, 2 === f];
          });
        });
      },
      isEnable: function isEnable() {
        return u(this, void 0, void 0, function () {
          return c(this, function (t) {
            return [2, Object(o.b)({
              includes: [r.a],
              excludes: []
            })];
          });
        });
      }
    };
  }, function (t, n, e) {
    "use strict";

    e.d(n, "a", function () {
      return i;
    });
    var r = e(3),
        i = /mobile/i.test(r.b);
  }]);
});

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var $ = window.jQuery;
var FW = {
  bind: function bind(selector, fn, assignId, event) {
    var $doc = $(document);
    $doc.bind(event || 'ActiveHtml', function () {
      $doc.find(selector).each(function (index, element) {
        var $element = $(element);
        var obj;

        if (!assignId || !$element.data(assignId)) {
          obj = new fn($element);
        }

        if (assignId) $element.data(assignId, obj);
      });
    });
  }
};
$.fn.extend(true, {
  activate: function activate() {
    $(document).trigger('ActiveHtml', [this]);
  }
});
$.ajaxSetup({
  dataType: 'json'
});
var _default = FW;
exports["default"] = _default;

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var Cookie = require('./cookie');

var storage = localStorage || {};

var available = function () {
  try {
    storage.setItem('test', 1);
    storage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
}();

var _default = {
  set: function set(name, value) {
    if (available) {
      storage.setItem(name, value);
    } else {
      Cookie.set(name, value, 86400 * 10);
    }
  },
  get: function get(name) {
    try {
      return available ? storage.getItem(name) : Cookie.get(name);
    } catch (e) {
      return null;
    }
  },
  remove: function remove(name) {
    if (available) {
      storage.removeItem(name);
    } else {
      Cookie.remove(name);
    }
  }
};
exports["default"] = _default;

},{"./cookie":19}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = protection;

var _devtoolsdetector = require("./devtoolsdetector");

var _cookie = require("./cookie");

var $ = window.jQuery;

function protection() {
  if (window.location.href.indexOf('dev.') > -1) return;
  if (new RegExp('(Xbox|PlayStation)', 'i').exec(navigator.userAgent)) return;
  $(document).ready(function () {
    try {
      var amungId = $('html').data('aid');
      var url = encodeURIComponent(window.location.href);
      $.get("https://whos.amung.us/pingjs/?k=".concat(amungId, "&c=s&x=").concat(url, "&v=29&r=").concat(Math.ceil(Math.random() * 9999)));
    } catch (err) {}
  });

  var antiDebugCallback = function antiDebugCallback() {
    $('body').empty();

    if (window.location.pathname !== '/') {
      window.location.replace('/');
    }
  }; // anti adblock rules
  // const checkAdbTimer = setInterval(() => {
  //   try {
  //     const fns = ['setTimeout', 'setInterval'];
  //     for (let i = 0; i < fns.length; i++) {
  //       const s = window[fns[i]].toString();
  //       let c = 0;
  //       c += /firefox|chrome/i.test(navigator.userAgent) ? 1 : 0;
  //       c += s.indexOf('[native code]') > -1 ? 1 : 0;
  //       c += s.indexOf(fns[i]) === -1 ? 1 : 0;
  //       if (c === 3) {
  //         $('body').html('AdBlock breaks it!');
  //         clearInterval(checkAdbTimer);
  //       }
  //     }
  //   } catch (err) {}
  // }, 3e3);


  var isWebDriver = !!navigator.webdriver;

  try {
    var m;
    var arr = [];
    Object.keys(window).forEach(function (i) {
      // chromedriver
      m = new RegExp('^([\\w]+)_(Symbol|Array|Promise)', 'i').exec(i);

      if (m) {
        arr.push(m[1]);
      }
    });

    if (arr.length >= 3 && arr[0] === arr[1] && arr[0] === arr[2]) {
      isWebDriver = true;
    }
  } catch (e) {}

  if (isWebDriver) {
    setInterval(function () {
      return antiDebugCallback();
    }, 500);
  }

  _devtoolsdetector["default"].addListener(function (isOpen, detail) {
    if (!isOpen) return;
    if (/Firefox/i.test(navigator.userAgent)) return; // && /(CriOS|iPad|iPhone)/i.test(navigator.userAgent)

    if (detail.checkerName === 'function-to-string') return;
    antiDebugCallback();
  });

  _devtoolsdetector["default"].launch(); // check devtools


  var devToolsDetected;
  var cookieName = 'sourceVersion';

  var checkDevTools = function checkDevTools() {
    var script = document.createElement('script');
    script.innerHTML = '//# sourceMappingURL=/app.js.map';
    document.body.appendChild(script);
    document.body.removeChild(script);
  };

  _cookie["default"].remove(cookieName);

  if (window.location.pathname !== '/') {
    checkDevTools();
    setInterval(checkDevTools, 1500);
    setTimeout(function checkAndProcess() {
      devToolsDetected = devToolsDetected || _cookie["default"].get(cookieName) != null;

      if (devToolsDetected) {
        _cookie["default"].remove(cookieName);

        antiDebugCallback();
      } else {
        setTimeout(checkAndProcess, 1e3);
      }
    }, 200);
  }
}

},{"./cookie":19,"./devtoolsdetector":20}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _base = require("./base64");

var $ = window.jQuery;
var Utils = {
  _ajax: function _ajax(url, arrayToObject) {
    if (new RegExp('local|127\\.0\\.').exec(window.location.hostname)) {
      return $.ajax(url);
    }

    return $.ajax(url, this._arrayToObject(arrayToObject));
  },
  _parseInt: function _parseInt(num) {
    var val = parseInt(num, 10);
    return Number.isNaN(val) ? 0 : val;
  },
  _arrayToObject: function _arrayToObject(keyValuePairs) {
    var obj = {};

    for (var i = 0; i < keyValuePairs.length; i += 2) {
      if (keyValuePairs[i + 1] instanceof Array) {
        obj[keyValuePairs[i]] = this._arrayToObject(keyValuePairs[i + 1]);
      } else {
        obj[keyValuePairs[i]] = keyValuePairs[i + 1];
      }
    }

    return obj;
  },
  _randString: function _randString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for (var i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  },
  _encryptData: function _encryptData(data) {
    var secKey = 'DZmuZuXqa9O0z3b7';

    var _data = encodeURIComponent("".concat(data));

    _data = this._rc4(secKey, _data);
    _data = (0, _base._btoa)(_data);
    return _data;
  },
  _decryptData: function _decryptData(data) {
    var secKey = 'DZmuZuXqa9O0z3b7';
    return decodeURIComponent(this._rc4(secKey, (0, _base._atob)(data)));
  },
  _rc4: function _rc4(key, str) {
    var s = [];
    var j = 0;
    var x;
    var res = '';

    for (var i = 0; i < 256; i++) {
      s[i] = i;
    }

    for (i = 0; i < 256; i++) {
      j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
      x = s[i];
      s[i] = s[j];
      s[j] = x;
    }

    i = 0;
    j = 0;

    for (var y = 0; y < str.length; y++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      x = s[i];
      s[i] = s[j];
      s[j] = x;
      res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
    }

    return res;
  }
};
var _default = Utils;
exports["default"] = _default;

},{"./base64":18}]},{},[2]);
