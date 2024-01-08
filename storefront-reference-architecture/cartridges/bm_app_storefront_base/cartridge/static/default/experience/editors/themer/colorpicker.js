/**
 * SLDS Color Picker
 */
(() => {
    /** The main Editor element to be tinkered with */
    var rootEditorElement;
    /** The main Editor element to be tinkered with */
    var currentHSV;
    /** the list of colors */
    const colorsArray = [
        '#e3abec', '#c2dbf7', '#9fd6ff', '#9de7da', '#9df0c0', '#fff099', '#fed49a',
        '#d073e0', '#86baf3', '#5ebbff', '#44d8be', '#3be282', '#ffe654', '#ffb758',
        '#bd35bd', '#5779c1', '#00a1e0', '#00aea9', '#3cba4c', '#f5bc25', '#f99221',
        '#580d8c', '#001970', '#0a2399', '#0b7477', '#41693d', '#b67e11', '#b85d0d',
        '#FFFFFF', '#DDDDDD', '#BBBBBB', '#999999', '#666666', '#333333', '#000000']

    /**
     * Generates the selection of colors privided by the color picker
     */
    function generateColorsHTML(list) {
        var markup = list.reduce((soFar, element) => soFar + `
            <li class="slds-color-picker__swatch" role="presentation">
                <a class="slds-color-picker__swatch-trigger" href="#" role="option" tabindex="-1">
                    <span class="slds-swatch" style="background:${element}">
                        <span class="slds-assistive-text">${element}</span>
                    </span>
                </a>
            </li>        
        `, '')

        return markup;
    }

    /**
     * initializes the base markup before page is ready. This is not part of the API, and called explicitely at the end of this module.
     */
    function init() {
        rootEditorElement = document.createElement('div');
        rootEditorElement.innerHTML = `
    <div class="slds-color-picker">
    <div class="slds-form-element slds-color-picker__summary">
        <div class="slds-form-element__control">
            <button class="slds-button slds-color-picker__summary-button slds-button_icon slds-button_icon-more" title="Choose Color">
                <span class="slds-swatch" style="background:hsl(220, 46%, 55%)">
                    <span class="slds-assistive-text">hsl(220, 46%, 55%)</span>
                </span>
                <svg class="slds-button__icon slds-button__icon_small slds-m-left_xx-small" aria-hidden="true" viewBox="0 0 24 24" >
                    <path d="M3.8 6.5h16.4c.4 0 .8.6.4 1l-8 9.8c-.3.3-.9.3-1.2 0l-8-9.8c-.4-.4-.1-1 .4-1z"></path>
                </svg>
            <span class="slds-assistive-text">Choose a color. Current color: #5679C0</span>
</button>
        <div class="slds-color-picker__summary-input">
            <input type="text" id="color-picker-summary-input" class="slds-input" value="#5679C0" />
        </div>
    </div>
</div>
    <section aria-describedby="dialog-body-id-9" aria-label="Choose a color" class="slds-popover slds-color-picker__selector slds-hide" role="dialog">
        <div class="slds-popover__body" id="dialog-body-id-9">
            <div class="slds-tabs_default">
                <ul class="slds-tabs_default__nav" role="tablist">
                    <li class="slds-tabs_default__item colorpicker-default-tab slds-is-active" title="Default" role="presentation">
                        <a class="slds-tabs_default__link" href="javascript:void(0);" role="tab" tabindex="0" aria-selected="true" aria-controls="color-picker-default" id="color-picker-default__item">Default</a>
                    </li>
                    <li class="slds-tabs_default__item colorpicker-custom-tab" title="Custom" role="presentation">
                        <a class="slds-tabs_default__link" href="javascript:void(0);" role="tab" tabindex="-1" aria-selected="false" aria-controls="color-picker-custom" id="color-picker-custom__item">Custom</a>
                    </li>
                </ul>
                <div id="color-picker-default" class="slds-tabs_default__content slds-show" role="tabpanel" aria-labelledby="color-picker-default__item">
                    <ul class="slds-color-picker__swatches" role="listbox">
                        ${generateColorsHTML(colorsArray)}
                    </ul>
                </div>
                <div id="color-picker-custom" class="slds-tabs_default__content slds-hide" role="tabpanel" aria-labelledby="color-picker-custom__item">
                    <div class="slds-color-picker__custom">
                        <p id="color-picker-instructions" class="slds-assistive-text">Use arrow keys to select a saturation and brightness, on an x and y axis.</p>
                        <div class="slds-color-picker__custom-range" style="background:hsl(220, 100%, 50%)">
                            <a class="slds-color-picker__range-indicator" style="bottom:45%;left:46%" href="#" aria-live="assertive" aria-atomic="true" aria-describedby="color-picker-instructions" draggable="true">
                                <span class="slds-assistive-text">Saturation: 46%. Brightness: 45%.</span>
                            </a>
                        </div>
                        <div class="slds-color-picker__hue-and-preview">
                            <label class="slds-assistive-text" for="color-picker-input-range-9">Select Hue</label>
                            <input type="range" class="slds-color-picker__hue-slider" min="0" max="360" id="color-picker-input-range-9" value="208" />
                            <span class="slds-swatch" style="background:#5679C0">
                                <span class="slds-assistive-text" aria-hidden="true">#5679C0</span>
                            </span>
                        </div>
                        <div class="slds-color-picker__custom-inputs">
                            <div class="slds-form-element slds-color-picker__input-custom-hex">
                                <label class="slds-form-element__label" for="color-picker-input-hex-9">Hex</label>
                                <div class="slds-form-element__control">
                                    <input type="text" id="color-picker-input-hex-9" disabled="true" class="slds-input" value="#5679C0" />
                                </div>
                            </div>
                            <div class="slds-form-element">
                                <label class="slds-form-element__label" for="color-picker-input-r-9">
                                    <abbr title="Red">R</abbr>
                                </label>
                                <div class="slds-form-element__control">
                                    <input type="text" id="color-picker-input-r-9" disabled="true" class="slds-input" value="86" />
                                </div>
                            </div>
                            <div class="slds-form-element">
                                <label class="slds-form-element__label" for="color-picker-input-g-9">
                                    <abbr title="Green">G</abbr>
                                </label>
                                <div class="slds-form-element__control">
                                    <input type="text" id="color-picker-input-g-9" disabled="true" class="slds-input" value="121" />
                                </div>
                            </div>
                            <div class="slds-form-element">
                                <label class="slds-form-element__label" disabled="true" for="color-picker-input-b-9">
                                    <abbr title="blue">B</abbr>
                                </label>
                                <div class="slds-form-element__control">
                                    <input type="text" id="color-picker-input-b-9" disabled="true" class="slds-input" value="192" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer class="slds-popover__footer">
            <div class="slds-color-picker__selector-footer">
                <button class="slds-button slds-button_neutral" id="cancel-button">Cancel</button>
                <button class="slds-button slds-button_brand" id="confirm-button">Done</button>
            </div>
        </footer>
    </section>
</div >`;
        // show "Loading.. "
        document.body.appendChild(rootEditorElement);

        var r = rootEditorElement.querySelector('#color-picker-input-r-9').value;
        var g = rootEditorElement.querySelector('#color-picker-input-g-9').value;
        var b = rootEditorElement.querySelector('#color-picker-input-b-9').value;
        currentHSV = ColorUtils.rgbToHsv({ r, g, b })
    };

    var ColorUtils = {
        /**
         * Converts an RGB color value to HSV. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
         * Assumes r, g, and b are contained in the set [0, 255] and
         * returns h, s, and v in the set [0, 1].
         *
         * @param   Number  r       The red color value
         * @param   Number  g       The green color value
         * @param   Number  b       The blue color value
         * @return  Array           The HSV representation
         */
        rgbToHsv: function rgbToHsv(rgb) {
            let r = rgb.r;
            let g = rgb.g;
            let b = rgb.b;
            r /= 255, g /= 255, b /= 255;

            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max == 0 ? 0 : d / max;

            if (max == min) {
                h = 0; // achromatic
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h, s, v };
        },



        /**
         * Converts an HSV color value to RGB. Conversion formula
         * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
         * Assumes h, s, and v are contained in the set [0, 1] and
         * returns r, g, and b in the set [0, 255].
         *
         * @param   Number  h       The hue
         * @param   Number  s       The saturation
         * @param   Number  v       The value
         * @return  Array           The RGB representation
         */
        hsvToRgb: function hsvToRgb(hsv) {
            let h = hsv.h;
            let s = hsv.s;
            let v = hsv.v;
            var r, g, b;

            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }

            return {r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255)};
        },
        componentToHex: function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },

        rgbToHex: function rgbToHex(rgb) {
            return "#" + this.componentToHex(rgb.r) + this.componentToHex(rgb.g) + this.componentToHex(rgb.b);
        }
    };

    function toggleColorPanelVisibility() {
        rootEditorElement.querySelector('.slds-color-picker__selector').classList.toggle("slds-hide");
        rootEditorElement.querySelector('.slds-color-picker__selector').classList.toggle("slds-show");
    }

    function switchElementsVisibility(selectorToHide, selectorToShow) {
        rootEditorElement.querySelector(selectorToHide).classList.add("slds-hide");
        rootEditorElement.querySelector(selectorToHide).classList.remove("slds-show");

        rootEditorElement.querySelector(selectorToShow).classList.add("slds-show");
        rootEditorElement.querySelector(selectorToShow).classList.remove("slds-hide");
    }

    function satLumHandler(event) {
        event.preventDefault();
        var saturation = event.layerX / event.currentTarget.offsetWidth;
        var value = 1 - (event.layerY / event.currentTarget.offsetHeight);
        rootEditorElement.querySelector('.slds-color-picker__range-indicator').style.left = saturation * 100 + '%';
        rootEditorElement.querySelector('.slds-color-picker__range-indicator').style.bottom = (value * 100) + '%';
        updateCustomUI({ s: saturation, v: value })
    }

    function hueHandler(event) {
        event.preventDefault();
        rootEditorElement.querySelector('.slds-color-picker__custom-range').style.background = `hsl(${event.currentTarget.value}, 100%, 50%)`;
        updateCustomUI({ h: event.currentTarget.value / 360 })
    }

    function updateCustomUI(updatedObject) {
        currentHSV = Object.assign(currentHSV, updatedObject);
        var rgb = ColorUtils.hsvToRgb(currentHSV);

        rootEditorElement.querySelector('#color-picker-input-r-9').value = rgb.r;
        rootEditorElement.querySelector('#color-picker-input-g-9').value = rgb.g;
        rootEditorElement.querySelector('#color-picker-input-b-9').value = rgb.b;
        var hex = ColorUtils.rgbToHex(rgb);
        rootEditorElement.querySelector('#color-picker-input-hex-9').value = hex;
        rootEditorElement.querySelector('#color-picker-custom .slds-swatch').style.backgroundColor = hex;
    }

    /** the page designer signals readiness to show this editor and provides an optionally pre selected value */
    listen('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        const selectedValue = typeof value === 'object' && value !== null && typeof value.value === 'string' ? value.value : null;

        rootEditorElement.querySelector('.slds-color-picker__summary-button').addEventListener('click', toggleColorPanelVisibility);
        rootEditorElement.querySelector('.colorpicker-custom-tab').addEventListener('click', () => switchElementsVisibility('#color-picker-default', '#color-picker-custom'));
        rootEditorElement.querySelector('.colorpicker-default-tab').addEventListener('click', () => switchElementsVisibility('#color-picker-custom', '#color-picker-default'));
        rootEditorElement.querySelectorAll('.slds-tabs_default__item').forEach(tab => tab.addEventListener('click', (event) => {
            rootEditorElement.querySelectorAll('.slds-tabs_default__item').forEach((element) => element.classList.remove('slds-is-active'));
            event.currentTarget.classList.add('slds-is-active');
        }));
        rootEditorElement.querySelector('#cancel-button').addEventListener('click', toggleColorPanelVisibility);
        rootEditorElement.querySelector('#confirm-button').addEventListener('click', () => {
            var selectedColor = rootEditorElement.querySelector('#color-picker-input-hex-9').value
            rootEditorElement.querySelector('#color-picker-summary-input').value = selectedColor;
            rootEditorElement.querySelector('#color-picker-summary-input').dispatchEvent(new Event('change'));
            toggleColorPanelVisibility();
        });

        rootEditorElement.querySelector('.slds-color-picker__custom-range').addEventListener('dragover', satLumHandler);
        rootEditorElement.querySelector('.slds-color-picker__custom-range').addEventListener('drop', satLumHandler);
        rootEditorElement.querySelector('.slds-color-picker__custom-range').addEventListener('click', satLumHandler);
        rootEditorElement.querySelector('#color-picker-input-range-9').addEventListener('input', hueHandler);

        rootEditorElement.querySelectorAll('.slds-color-picker__swatch-trigger').forEach(
            function (element) {
                element.addEventListener('click', function (event) {
                    event.preventDefault();
                    var selectedColor = event.target.querySelector('.slds-assistive-text').innerHTML;
                    rootEditorElement.querySelector('#color-picker-summary-input').value = selectedColor;
                    rootEditorElement.querySelector('#color-picker-summary-input').dispatchEvent(new Event('change'));
                    toggleColorPanelVisibility();
                });
            });

        rootEditorElement.querySelector('#color-picker-summary-input').addEventListener('change', function (event) {
            const selectedValue = event.target.value;
            rootEditorElement.querySelector('.slds-color-picker__summary-button .slds-swatch').style.backgroundColor = selectedValue;

            emit({
                type: 'sfcc:interacted'
            });
            emit({
                type: 'sfcc:value',
                payload: selectedValue ? { value: selectedValue } : null
            });
        });

        if (selectedValue) {
            rootEditorElement.querySelector('#color-picker-summary-input').value = selectedValue;
            rootEditorElement.querySelector('#color-picker-summary-input').dispatchEvent(new Event('change'));
        }

    });
    // When a value was selected
    listen('sfcc:value', value => { });
    // When the editor must require the user to select something
    listen('sfcc:required', value => { });
    // When the editor is asked to disable its controls
    listen('sfcc:disabled', value => {
        if (rootEditorElement) {
            rootEditorElement.querySelector('.recommendation-selection').disabled = true;
        }
    });

    init();

})();
