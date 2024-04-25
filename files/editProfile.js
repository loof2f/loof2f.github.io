class EditProfileSegment {
    constructor(container, url) {
        this.container = container;
        this.url = url;
        this.initialise();
    }

    focusInput(input) {
        this.container.classList.add('active');

        // Native ES6 input focus sets the cursor at the start of the
        // input. Hence we have to remove and reset the value to make
        // the cursor appear at the end of the input
        if (input && (input.type == 'text' || input.type == 'textarea')) {
            const value = input.value;
            input.value = '';
            input.focus();
            input.value = value;
        }

        // Open popup if present
        this.container.classList.add('popup-active');
    }

    initialise() {
        // Form submit handlers
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();

            this.container.classList.remove('active');
            let input = this.container.querySelector('input');
            input.blur();
            this.saveField(input);
        });

        // Set edit triggers
        const editTriggers = this.container.querySelectorAll('.edit-trigger');
        editTriggers.forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                const field = this.container;
                let input = field.querySelector('input');

                if (!input) {
                    input = field.querySelector('textarea');
                }

                if (field.classList.contains('active')) {
                    field.classList.remove('active');

                    if (input) {
                        this.saveField(input);
                        input.blur();
                    }
                } else {
                    this.focusInput(input);
                }
            });
        });

        // Textarea auto-height
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach((textarea) => {
            textarea.style.height = `${textarea.scrollHeight}px`;

            textarea.addEventListener('input', (event) => {
                textarea.style.height = `${textarea.scrollHeight}px`;
            });
        });
    }

    async saveField(input) {
        const fieldName = input.name;
        const data = new FormData(this.container);

        post(this.url, data).then((resp) => {
            const errorContainer = input.closest('.async-field-wrapper').querySelector('.errors');

            if (resp['errors']) {
                if (resp['errors'][fieldName]) {
                    const errors = resp['errors'][fieldName];
                    errorContainer.innerHTML = errors.join('<br/>');

                    this.focusInput(input);
                    return;
                }
            }

            errorContainer.innerHTML = '';
        });
    }
}


document.addEventListener('DOMContentLoaded', (event) => {
    const subForms = document.querySelectorAll('form');

    subForms.forEach((subForm) => {
        new EditProfileSegment(subForm, subForm.getAttribute('data-url'));
    });
});
