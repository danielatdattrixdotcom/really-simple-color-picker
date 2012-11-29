/**
 * Really Simple Color Picker in jQuery (Modified)
 *
 * - Multi-Palette
 * - Strings for color values
 *
 * Licensed under the MIT (MIT-LICENSE.txt) licenses.
 *
 * Copyright (c) 2012 Daniel Anderson (www.dattrix.com)
 */

/**
 * Really Simple Color Picker in jQuery
 *
 * Licensed under the MIT (MIT-LICENSE.txt) licenses.
 *
 * Copyright (c) 2008 Lakshan Perera (www.laktek.com)
 *                    Daniel Lacy (daniellacy.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


(function ($) {
    /**
     * Create a couple private variables.
    **/
    var selectorOwner,
        activePalette,
        cItterate       = 0,
        templates       = {
            control : $('<div class="colorPicker-picker">&nbsp;</div>'),
            tabs : $('<div class="colorPicker-tabs"></div>'),
            tab : $('<div class="colorPicker-tab">&nbsp;</div>'),
            palette : $('<div id="colorPicker_palette" class="colorPicker-palette" />'),
            swatches : $('<div class="colorPicker-swatches"></div>'),
            swatch  : $('<div class="colorPicker-swatch">&nbsp;</div>'),
            hexLabel: $('<label for="colorPicker_hex">Color</label>'),
            hexField: $('<input type="text" id="colorPicker_hex" />')
        },
        transparent     = "CLEAR",
        none = "None",
        lastColor;

    /**
     * Create our colorPicker function
    **/
    $.fn.colorPicker = function (options) {
        return this.each(function () {
            // Setup time. Clone new elements from our templates, set some IDs, make shortcuts, jazzercise.
            var element      = $(this),
                opts         = $.extend({}, $.fn.colorPicker.defaults, options),
                defaultColor = (opts.pickerDefault) ? opts.pickerDefault : opts.tabs[0].colors[0],
                newControl   = templates.control.clone(),
                newTabs      = templates.tabs.clone(),
                newSwatches  = templates.swatches.clone(),
                newPalette   = templates.palette.clone().attr('id', 'colorPicker_palette-' + cItterate),
                newHexLabel  = templates.hexLabel.clone(),
                newHexField  = templates.hexField.clone(),
                paletteId    = newPalette[0].id,
                currentTab,
                autocompleteColors = [];

            newTabs.appendTo(newPalette);

            $.each(opts.tabs, function (i) {
                var tab = templates.tab.clone();
                tab.text(opts.tabs[i].name);
                tab.attr('pickerindex',i);

                tab.bind('click', function() {
                    currentTab = $(this);
                    $(this).parent().attr('activeTab',$(this).text());

                    $(this).parent().children().each(function(){
                        if ($(this).text() != $(this).parent().attr('activeTab')) {
                            $(this).removeClass('active');
                        } else {
                            $(this).addClass('active');
                        }
                    })

                    $(this).parent().parent().children().filter('.colorPicker-swatches').children().each(function() {
                        if ($(this).attr('tab') == currentTab.text()) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                });
                tab.appendTo(newTabs);

                tab_colors = opts.tabs[i].colors;

                $.each(tab_colors, function (i) {
                    swatch = templates.swatch.clone();
                    swatch.attr('tab',tab.text());

                    autocompleteColors.push(this[0]);

                    if (this[0] === transparent) {
                        swatch.addClass('transparentSwatch');
                    } else if (this[0] == none) {
                        swatch.addClass('noneSwatch');
                    } else {
                        swatch.css("background-color", "#" + this[1]);
                    }

                    swatch.attr('colorstring',this[0]);
                    $.fn.colorPicker.bindPalette(newHexField, swatch);

                    if (typeof currentTab == "undefined" && this[0] == defaultColor[0]) {
                        currentTab = $(tab);
                        defaultColor = this;
                    }
                    swatch.appendTo(newSwatches);
                });
            });

            if(typeof currentTab == "undefined") {
                currentTab = newTabs.children().first();
                newControl.addClass('add-color');
            } else if (typeof opts.pickerDefault == "undefined") {
                newControl.addClass('add-color');
            }

            newSwatches.children().each(function(){
                 if (currentTab.text() == $(this).attr('tab')) {
                    $(this).show();
                 } else {
                    $(this).hide();
                 }
             });

             currentTab.click();

            newSwatches.appendTo(newPalette);

            newHexLabel.attr('for', 'colorPicker_hex-' + cItterate);

            newHexField.attr({
                'id'    : 'colorPicker_hex-' + cItterate,
                'value' : defaultColor[0]
            });

            newHexField.bind("keyup", function (event) {
                if (event.keyCode === 27) {
                    $.fn.colorPicker.hidePalette(paletteId);
                }
            });

            newHexField.bind("click", function (event) {
                $(this).select();
            });

            $(newHexField).autocompleteArray(autocompleteColors, {delay: 40, onItemSelect: function(e){
                var acf = $(e).text();
                for (var ti = 0; ti < opts.tabs.length; ti++) {
                    for (var i = 0; i < opts.tabs[ti].colors.length; i++) {
                        var swatch_color = opts.tabs[ti].colors[i][0];
                        var swatch_hex = opts.tabs[ti].colors[i][1];
                        if (acf == swatch_color) {
                            $.fn.colorPicker.changeColor(swatch_color, swatch_hex);
                            $.fn.colorPicker.hidePalette(paletteId);
                        }
                    }
                }
            }});

            $('<div class="colorPicker_hexWrap" />').append(newHexLabel).appendTo(newPalette);

            newPalette.find('.colorPicker_hexWrap').append(newHexField);

            $("body").append(newPalette);

            newPalette.hide();


            /**
             * Build replacement interface for original color input.
            **/
            newControl.css("background-color", $.fn.colorPicker.toHex(defaultColor[1]));
            newControl.attr('data-content',defaultColor[0]);

            newControl.bind("click", function () {
                $.fn.colorPicker.togglePalette($('#' + paletteId), $(this));
            });

            element.after(newControl);

            if (element.val() == transparent) {
                newControl.addClass('transparentSwatch');
            }

            element.bind("change", function () {
                element.next(".colorPicker-picker").css(
                    "background-color", $.fn.colorPicker.toHex($(this).attr("hexcolor"))
                );
                element.next(".colorPicker-picker").attr('data-content', element.val());
                if (element.val() == transparent) {
                    element.next(".colorPicker-picker").addClass('transparentSwatch');
                } else {
                    element.next(".colorPicker-picker").removeClass('transparentSwatch');
                }
            });

            // Hide the original input.
            element.val(defaultColor[0]).hide();

            cItterate++;
        });
    };

    /**
     * Extend colorPicker with... all our functionality.
    **/
    $.extend(true, $.fn.colorPicker, {
        /**
         * Return a Hex color, convert an RGB value and return Hex, or return false.
         *
         * Inspired by http://code.google.com/p/jquery-color-utils
        **/
        toHex : function (color) {
            // If we have a standard or shorthand Hex color, return that value.
            if (color.match(/[0-9A-F]{6}|[0-9A-F]{3}$/i)) {
                return (color.charAt(0) === "#") ? color : ("#" + color);

            // Alternatively, check for RGB color, then convert and return it as Hex.
            } else if (color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/)) {
                var c = ([parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)]),
                    pad = function (str) {
                        if (str.length < 2) {
                            for (var i = 0, len = 2 - str.length; i < len; i++) {
                                str = '0' + str;
                            }
                        }

                        return str;
                    };

                if (c.length === 3) {
                    var r = pad(c[0].toString(16)),
                        g = pad(c[1].toString(16)),
                        b = pad(c[2].toString(16));

                    return '#' + r + g + b;
                }

            // Otherwise we wont do anything.
            } else {
                return false;

            }
        },

        /**
         * Check whether user clicked on the selector or owner.
        **/
        checkMouse : function (event, paletteId) {
            var selector = activePalette,
                selectorParent = $(event.target).parents("#" + selector.attr('id')).length;

            if (event.target === $(selector)[0] || event.target === selectorOwner || selectorParent > 0) {
                return;
            }

            $.fn.colorPicker.hidePalette();
        },

        /**
         * Hide the color palette modal.
        **/
        hidePalette : function (paletteId) {
            $(document).unbind("mousedown", $.fn.colorPicker.checkMouse);

            $('.colorPicker-palette').hide();
        },

        /**
         * Show the color palette modal.
        **/
        showPalette : function (palette) {
            var hexColor = selectorOwner.prev("input").val();

            palette.css({
                top: selectorOwner.offset().top + (selectorOwner.outerHeight()),
                left: selectorOwner.offset().left
            });

            $("#color_value").val(hexColor);

            palette.show();

            $(document).bind("mousedown", $.fn.colorPicker.checkMouse);
        },

        /**
         * Toggle visibility of the colorPicker palette.
        **/
        togglePalette : function (palette, origin) {
            // selectorOwner is the clicked .colorPicker-picker.
            if (origin) {
                selectorOwner = origin;
            }

            activePalette = palette;

            if (activePalette.is(':visible')) {
                $.fn.colorPicker.hidePalette();

            } else {
                $.fn.colorPicker.showPalette(palette);

            }
        },

        /**
         * Update the input with a newly selected color.
        **/
        changeColor : function (value, hex_value) {
            selectorOwner.css("background-color", hex_value);
            if (value == transparent) {
                selectorOwner.addClass('transparentSwatch');
            } else {
                selectorOwner.removeClass('transparentSwatch');
            }

            selectorOwner.prev("input").attr("hexcolor",hex_value);
            selectorOwner.prev("input").val(value).change();

            $.fn.colorPicker.hidePalette();
        },

        /**
         * Bind events to the color palette swatches.
        */
        bindPalette : function (paletteInput, element) {
            var color = element.attr('colorstring');
            var color_hex = $.fn.colorPicker.toHex(element.css("background-color"));

            element.bind({
                click : function (ev) {
                    color = $(this).attr('colorstring');
                    color_hex = $.fn.colorPicker.toHex($(this).css("background-color"));

                    lastColor = color;

                    $.fn.colorPicker.changeColor(color, color_hex);
                },
                mouseover : function (ev) {
                    lastColor = paletteInput.val();

                    $(this).css("border-color", "#598FEF");

                    paletteInput.val(color);
                },
                mouseout : function (ev) {
                    $(this).css("border-color", "#000");

                    paletteInput.val(selectorOwner.css("background-color"));

                    paletteInput.val(lastColor);
                }
            });
        }
    });

    /**
     * Default colorPicker options.
     *
     * These are publibly available for global modification using a setting such as:
     *
     * $.fn.colorPicker.defaults.colors = ['151337', '111111']
     *
     * They can also be applied on a per-bound element basis like so:
     *
     * $('#element1').colorPicker({pickerDefault: 'efefef', transparency: true});
     * $('#element2').colorPicker({pickerDefault: '333333', colors: ['333333', '111111']});
     *
    **/
    $.fn.colorPicker.defaults = {

    };

})(jQuery);
