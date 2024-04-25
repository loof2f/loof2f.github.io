class CustomSelectInput {
    constructor(container) {
        this.container = container;
        this.initialise();
    }

    initialise() {
        this.options = this.container.querySelectorAll('.option');

        this.options.forEach((option) => {
            this.listenOptionClick(option);
        });
    }

    selectOption(option) {
        const input = option.querySelector('input');

        input.checked = true;
        option.classList.add('active');
    }

    unselectOption(option) {
        const input = option.querySelector('input');

        input.checked = false;
        option.classList.remove('active');
    }


    // Listeners
    listenOptionClick(option) {
        option.addEventListener('click', (event) => {
            if (this.container.closest('.async-field-wrapper.active') == undefined && !this.container.classList.contains('always-open')) {
                return;
            }

            if (!this.container.classList.contains('multi')) {
                this.options.forEach((option) => {
                    this.unselectOption(option);
                });
            }

            if (option.classList.contains('active')) {
                this.unselectOption(option);
            } else {
                this.selectOption(option);
            }
            
            this.container.classList.toggle('active');
        });
    }
}


class ImageInput {
    constructor(container) {
        this.container = container;
        this.initialise();
    }

    initialise() {
        this.actionPopup = this.container.querySelector('.action-popup');
        this.clearInput = this.container.querySelector('input[type="checkbox"]');
        this.clearInputTrigger = this.container.querySelector('.clear-input');
        this.fieldContainer = this.container.closest('.async-field-wrapper');
        this.fileInput = this.container.querySelector('input[type=file]');
        this.previewContainer = this.container.querySelector('.layer');
        
        this.listenClearInput();
        this.listenCloseActionPopup();
        this.listenFileChange();
        this.listenOpenActionPopup();
    }


    // Listeners
    listenClearInput() {
        if (!this.clearInputTrigger) {
            return;
        }

        this.clearInputTrigger.addEventListener('click', (event) => {
            if (this.previewContainer.closest('.active') == undefined) {
                return;
            }

            this.clearInput.checked = true;
            this.previewContainer.style.backgroundImage = '';
            this.fieldContainer.classList.remove('popup-active');
        });
    }

    listenCloseActionPopup() {
        if (!this.actionPopup) {
            return;
        }

        this.actionPopup.addEventListener('click', (event) => {
            if (event.target == this.actionPopup) {
                this.fieldContainer.classList.remove('active');
                this.fieldContainer.classList.remove('popup-active');
            }
        });
    }

    listenFileChange() {
        this.fileInput.addEventListener('change', (event) => {
            const input = this.fileInput;
            const fieldContainer = this.fieldContainer;
            const previewContainer = this.previewContainer;

            if (input.files && input.files[0]) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    if (input.files[0].type.match('image.*')) {
                        previewContainer.style.backgroundImage = `url(${e.target.result})`;
                    } else {
                        previewContainer.style.backgroundImage = '';
                    }
                };

                reader.readAsDataURL(input.files[0]);
            }

            fieldContainer.classList.remove('popup-active');
        });
    }

    listenOpenActionPopup() {
        if (!this.actionPopup) {
            return;
        }

        const triggers = this.fieldContainer.querySelectorAll('.action-popup-trigger');

        triggers.forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                if (this.fieldContainer.classList.contains('active')) {
                    this.fieldContainer.classList.add('popup-active');
                }
            });
        });
    }
}


class OptionalField {
    constructor(container, callback=null) {
        this.callback = callback;
        this.container = container;
        this.clearOnChange = container.hasAttribute('data-clear-on-change');
        this.noDeactivate =  container.hasAttribute('data-no-deactivate');
        this.toggleOptionalField = this.toggleOptionalField.bind(this);

        this.initialise();
    }

    clearData() {
        if (this.clearOnChange) {
            this.inputs.forEach((input) => {
                const toggleRequired = !input.hasAttribute('data-keep-optional');
                input.value = '';

                if (this.container.classList.contains('reversed')) {
                    input.disabled = this.container.classList.contains('active');

                    if (toggleRequired) {
                        input.required = !this.container.classList.contains('active');
                    }
                } else {
                    input.disabled = !this.container.classList.contains('active');

                    if (toggleRequired) {
                        input.required = this.container.classList.contains('active');
                    }
                }
            });
        }
    }

    deactivate() {
        this.container.classList.remove('active');
        this.clearData();
    }

    initialise() {
        this.checkbox = this.container.querySelector('.checkbox');
        this.inputs = this.container.querySelectorAll('input,select');

        this.checkbox.addEventListener('click', this.toggleOptionalField);
        this.listenInput();

        // Make sure to fully reset field when starting in an inactive state,
        // this ensures correct input states and data
        if (!this.container.classList.contains('active')) {
            this.clearData();
        }
    }

    listenInput() {
        const inputs = this.container.querySelectorAll('input:not([type="submit"])');

        inputs.forEach((input) => {
            input.addEventListener('input', (event) => {
                this.setValidState();
            });
        });
    }

    setValidState() {
        const inputs = this.container.querySelectorAll('input:not([type="submit"])');
        let missingData = false;

        inputs.forEach((input) => {
            if (!input.value || input.value == 0 || input.value == '') {
                missingData = true;
            }
        });

        if (!missingData) {
            this.container.classList.add('valid');
        } else {
            this.container.classList.remove('valid');
        }
    }

    toggleOptionalField() {
        if (this.container.classList.contains('valid') && !this.clearOnChange) {
            return;
        }

        if (this.container.classList.contains('active') && this.noDeactivate === true) {
            return;
        }

        this.container.classList.toggle('active');
        this.clearData();

        if (this.callback) {
            this.callback(this.container);
        }
    }
}


setExchangeRateTriggers = (mainContainer) => {
    const exchangeInputs = mainContainer.querySelectorAll('input[type="number"][data-exchange-rate]');

    exchangeInputs.forEach((input) => {
        const container = input.closest('.price-input');
        const trigger = container.querySelector('.convert');

        trigger.addEventListener('click', (event) => {
            const ownRate = input.getAttribute('data-exchange-rate');
            const price = input.value;

            if (!price) {
                return;
            }

            let rateInputs = exchangeInputs;

            if (input.hasAttribute('data-exchange-rate-contained')) {
                rateInputs = input.closest('.exchange-container').querySelectorAll('input[type="number"][data-exchange-rate]');
            }

            // Update prices of fields
            rateInputs.forEach((_input) => {
                const otherRate = _input.getAttribute('data-exchange-rate');
                const ratio = (1 / ownRate) * otherRate;

                _input.value = (price * ratio).toFixed(2);
            });
        });
    });
}


document.addEventListener('DOMContentLoaded', (event) => {
    const imageInputContainers = document.querySelectorAll('.banner-image-input, .profile-image-input');

    imageInputContainers.forEach((container) => {
        new ImageInput(container);
    });


    const customSelectContainers = document.querySelectorAll('.custom-select-input');

    customSelectContainers.forEach((container) => {
        new CustomSelectInput(container);
    });


    const optionalFields = document.querySelectorAll('.optional-field-container:not(.custom)');

    optionalFields.forEach((field) => {
        new OptionalField(field);
    });


    setExchangeRateTriggers(document);
});
