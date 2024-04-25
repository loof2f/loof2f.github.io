class SliderNav {
    constructor(container) {
        this.container = container;
        this.initialise();
    }

    initialise() {
        this.active = false;

        this.setNavTriggers();
    }

    async setNavTriggers() {
        // Toggle triggers
        const toggleTriggers = document.querySelectorAll('.toggle-slider-nav');

        toggleTriggers.forEach((trigger) => {
            trigger.addEventListener('click', (event) => {
                if (this.active) {
                    this.stopFlow();
                } else {
                    this.startFlow();
                }
            });
        });

        // Handle trigger
        const handle = this.container.querySelector('.handle');

        if (handle) {
            new Handle(this, handle);
        }

        // Close if user clicks outside of nav
        if (window.innerWidth > 1050) {
            document.addEventListener('click', (event) => {
                if (!this.active) { return; }

                if (!event.target.closest('.slider-nav') && !event.target.closest('.toggle-slider-nav')) {
                    this.stopFlow();
                }
            });
        } else {
            this.container.addEventListener('click', (event) => {
                if (event.target == this.container) {
                    this.stopFlow();
                }
            });
        }
    }

    startFlow() {
        this.active = true;
        this.container.classList.add('active');
        document.body.classList.add('popup-active');
    }

    async stopFlow() {
        this.active = false;
        this.container.classList.remove('active');
        this.container.querySelector('.handle-container').style.transform = `translate3d(0, 0px, 3px)`;
        document.body.classList.remove('popup-active');
    }
}
