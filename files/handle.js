class Handle {
    constructor(parentPopup, handle) {
        this.parentPopup = parentPopup;
        this.handle = handle;
        this.container = handle.closest('.handle-container');
        this.initialise();
    }

    initialise() {
        // Interaction values
        this.active = false;
        this.currentTarget = undefined;
        this.currentTouchPosition = null;
        this.currentTranslateY = 0;
        this.postHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--full-post-height')) - 42 || window.innerHeight - 42;
        this.startTouchPosition = null;
        this.startTranslateY = 0;

        // Set event listeners
        this.ListenTouchEnd();
        this.ListenTouchMove();
        this.ListenTouchStart();
    }

    move(translateY) {
        this.container.style.height = `${(-1 * translateY) - 85}px`;
        this.container.style.transform = `translate3d(0, ${translateY}px, 3px)`;
    };

    setTransform = (offset, end=false) => {
        let translateY = (-1 * offset) + this.startTranslateY;

        if (Math.abs(translateY) > this.postHeight - 65) {
            translateY = -1 * (this.postHeight - 65);
        }

        if (translateY < 0) {
            translateY = 0;
        }

        if (end) {
            const containerHeight = Math.min(this.container.offsetHeight, this.postHeight);
            const fullVisible = this.postHeight - (this.postHeight - containerHeight);
            
            if (translateY + 42 > fullVisible * 0.65) {
                return this.parentPopup.stopFlow();
            }
        }

        this.move(translateY);
    };


    // Event listeners
    ListenTouchEnd() {
        this.handle.addEventListener('touchend', (event) => {
            // Perform actions
            this.setTransform(this.startTouchPosition - this.currentTouchPosition, true);

            // Reset values
            this.active = false;
            this.currentTouchPosition = null;
            this.startTouchPosition = null;
        });
    }

    ListenTouchMove() {
        this.handle.addEventListener('touchmove', (event) => {
            this.currentTouchPosition = event.changedTouches[0].screenY;
            this.setTransform(this.startTouchPosition - this.currentTouchPosition);
        }, {passive: true});
    }

    ListenTouchStart() {
        this.handle.addEventListener('touchstart', (event) => {
            this.currentTarget = event.target;
            this.currentTouchPosition = event.changedTouches[0].screenY;
            this.startTouchPosition = event.changedTouches[0].screenY;
            this.startTranslateY = parseInt(this.container.style.transform.split(',')[1]) || 0;
        }, {passive: true});
    }
}
