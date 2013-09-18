/*!
 * jQuery Multiple Selector Plugin
 *
 * Copyright 2013 Hideki Abe <hideki.abe@skyward-design.net>
 * Released under the MIT license
 *
 * Version: 0.1.0
 * Date: 2013-09-18
 */
;(function ($, window, document, undefined) {
    "use strict";

    var pluginName = "multipleSelector",
        defaults = {
            containerSelector: ".container",
            choicesSelector: ".multipleselector-choices",
            choicesItemSelector: ".multipleselector-item",
            dataSelector: ".multipleselector-data",
            dialogClosebtnSelector: ".multipleselector-close",
            containerSpace: 0,
            cssAnimation: false
        },
        $window = $(window);

    function MultipleSelector(element, options) {
        this.element = element;
        this.$element = $(element);

        this.options = $.extend({}, defaults, options);

        this.$container = null;
        this.$dialog = null;
        this.$choices = null;
        this.$data = null;
        this.screenWidth = 0;
        this.scrollTop = 0;
        this.placeholder = "";
        this.useCssAnimation = false;
        this.isDialogOpen = false;
        this.isAnimate = false;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    MultipleSelector.prototype = {
        setScreenWidth: function () {
            var screenWidth = this.screenWidth = $window.innerWidth();
            this.$container.css("width", screenWidth - this.options.containerSpace);
            this.$dialog.css("width", screenWidth - this.options.containerSpace);

            if (this.isDialogOpen) {
                this.$container.css("marginLeft", screenWidth * -1);
            }
        },

        containerTransitionEnd: function () {
            if (this.isDialogOpen) {
                this.isDialogOpen = false;
            } else if (this.isAnimate) {
                $window.scrollTop(1);
                this.$dialog.addClass("is-visible").focus();
                this.isDialogOpen = true;
                this.isAnimate = false;
            }
        },

        dialogTranstionEnd: function () {
            if (this.isAnimate && this.isDialogOpen) {
                $window.scrollTop(this.scrollTop + 1);    // +1px ... Android 2.3 bug.
                this.$container.css("marginLeft", this.options.containerSpace / 2);
                // Set isDialogOpen flag ... see containerTransitionEnd function.
                this.isAnimate = false;
            }
        },

        openDialog: function (e) {
            var self = this;

            e.preventDefault();
            this.scrollTop = $window.scrollTop();

            if (this.useCssAnimation) {
                this.isAnimate = true;
                this.$container.css("marginLeft", this.screenWidth * -1);
            } else {
                this.$container.animate(
                    { marginLeft: self.screenWidth * -1 },
                    function () {
                        self.$dialog.fadeIn().focus();
                        self.isDialogOpen = true;
                    }
                );
            }
        },

        closeDialog: function (e) {
            var self = this;

            e.preventDefault();

            if (this.useCssAnimation) {
                this.isAnimate = true;
                this.$dialog.removeClass("is-visible");
            } else {
                this.$dialog.fadeOut(function () {
                    $window.scrollTop(self.scrollTop);

                    self.$container.animate({ marginLeft: self.options.containerSpace / 2 });
                    self.isDialogOpen = false;
                });
            }

            this.$element.trigger(pluginName + ".selected");
        },

        refrectSelect: function () {
            var self = this,
                $checked = this.$dialog.find("input:checked"),
                inputName = $checked.eq(0).attr("name"),
                choicesStack = [],
                inputStack = [];

            if ($checked.length > 0) {
                $.each($checked, function (index, elem) {
                    var $elem = $(elem),
                        label = $elem.siblings("label").text(),
                        value = $elem.val();

                    choicesStack.push($("<span class='" + self.options.choicesItemSelector + "'>" + label + "</span>"));
                    inputStack.push($("<input type='hidden' name='" + inputName + "' value='" + value + "'>"));
                });
            } else {
                choicesStack.push(this.placeholder);
            }

            this.$choices.empty().append(choicesStack);
            this.$data.empty().append(inputStack);
        },

        init: function() {
            var $document = $(document),
                style = document.body.style;

            this.$container = $document.find(this.options.containerSelector);
            this.$dialog = $document.find("#" + this.$element.data("dialog-id"));
            this.$dialog.attr("tabIndex", -1);
            this.$choices = this.$element.find(this.options.choicesSelector);
            this.$data = this.$element.find(this.options.dataSelector);
            this.placeholder = this.$choices.text();

            $window.on("load resize", $.proxy(this.setScreenWidth, this));
            this.$element.on("click", $.proxy(this.openDialog, this));
            this.$element.on(pluginName + ".selected", $.proxy(this.refrectSelect, this));
            this.$dialog.on("click", ".multipleselect__btn-close", $.proxy(this.closeDialog, this));

            this.refrectSelect();

            // Judgement css transitions
            // See Also: http://caniuse.com/css-transitions
            if (this.options.cssAnimation && ("WebkitTransition" in style || "transition" in style)) {
                this.useCssAnimation = true;
                $("html").addClass("csstransitions");
                this.$container.on("webkitTransitionEnd transitionend", $.proxy(this.containerTransitionEnd, this));
                this.$dialog.on("webkitTransitionEnd transitionend", $.proxy(this.dialogTranstionEnd, this));
            }
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new MultipleSelector(this, options));
            }
        });
    };
})(jQuery, window, document);
