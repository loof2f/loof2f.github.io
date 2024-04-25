const body = document.querySelector('body');
const html = document.querySelector('html');

let WINDOW_INNERWIDTH = window.innerWidth;


// Set scrollbar property
document.documentElement.style.setProperty('--scrollbar-width', `${window.innerWidth - document.documentElement.clientWidth}px`);


// Delete self functionality
deleteInstance = (instance) => {
    instance = null;
};


// Cookie management
const setCookie = (name, value, days = 90, path = '/') => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path + '; SameSite=Lax';
}

const getCookie = (name) => {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}


// Resize event
window.addEventListener('resize', (event) => {
    WINDOW_INNERWIDTH = window.innerWidth;
});


// File input triggers
const fileButtons = document.querySelectorAll('.button.file-input');
fileButtons.forEach((trigger) => {
    const input = trigger.querySelector('input');
    const status = trigger.querySelector('.status');

    input.addEventListener('change', (event) => {
        if (input.files && input.files[0]) {
            status.innerText = input.files[0].name;
        } else {
            status.innerText = 'No file chosen';
        }
    });

    trigger.addEventListener('click', (event) => {
        if (event.target != input) {
            input.click();
        }
    });
});


// Info notices
setInfoNoticeHeader = (header) => {
    const notice = header.closest('.info-notice');
    const noticeId = notice.getAttribute('data-notice-id');
    let forced = false;

    // See if a cookie has been set for this notice, in order to automatically
    // close or open the notice on load
    if (noticeId) {
        const result = getCookie(noticeId);

        if (result == 'true') {
            notice.classList.add('active');
            forced = true;
        } else if (result == 'false') {
            notice.classList.remove('active');
            forced = true;
        }
    }

    // If no cookie has been set, check whether the notice should be opened
    // automatically on load
    if (!forced && notice.hasAttribute('data-open-active')) {
        notice.classList.add('active');
    }

    header.addEventListener('click', (event) => {
        notice.classList.toggle('active');

        if (noticeId) {
            setCookie(noticeId, notice.classList.contains('active'));
        }
    });
};

const infoNoticeHeaders = document.querySelectorAll('.info-notice .info-notice-header');
infoNoticeHeaders.forEach((header) => {
    setInfoNoticeHeader(header);
});


// Menu triggers
const menuTriggers = document.querySelectorAll('.menu-wrapper .menu-trigger');
menuTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
        const menu = trigger.closest('.menu-wrapper').querySelector('.menu');

        if (menu) {
            menu.classList.toggle('active');
        }
    });
});


// General POST function
post = (url, data, dataIsJson = false) => {
    let headers = {
        'X-CSRFToken': document.querySelector('input[name=csrfmiddlewaretoken]').value,
    };

    if (!data || dataIsJson === true) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        headers: headers,
        method: 'POST',
        body: data,
    })
    .then((response) => {
        return response.json();
    })
    .then((json) => {
        return json;
    })
    .catch((error) => {
        console.log(error);
    });
};


// Scroll to bottom function
scrollBottom = (elem) => {
    let scrollHeight = elem.scrollHeight * 2;
    elem.scrollTop = scrollHeight;
};


// Side nav
const sliderNav = document.querySelector('.slider-nav');

if (sliderNav) {
    new SliderNav(sliderNav);
}


// Submenus
const subMenuTriggers = document.querySelectorAll('.submenu');
subMenuTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
        if (event.target.classList.contains('submenu')) {
            trigger.classList.toggle('active');
        }
    });

    document.addEventListener('click', (event) => {
        if (!trigger.classList.contains('active')) {
            return;
        }

        if (event.target != trigger && !event.target.closest('.submenu')) {
            trigger.classList.toggle('active');
        }
    });
});


// Submit form function
submitForm = (trigger, clickCallback) => {
    const data = new URLSearchParams(new FormData(trigger));
    const clickReset = trigger.getAttribute('data-click-reset');

    if (clickReset) {
        trigger.reset();
    }

    post(clickCallback, data).then((data) => {
        const responseCallback = trigger.getAttribute('data-response-callback');

        if (responseCallback) {
            window[responseCallback](trigger, data);
        }
    });
};


// Tab wrappers
const tabWrappers = document.querySelectorAll('.tabs-wrapper');
tabWrappers.forEach((wrapper) => {
    const triggers = wrapper.querySelectorAll('[data-tabs]');

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            const activeTabs = trigger.getAttribute('data-tabs').split(',');
            const related = wrapper.querySelectorAll('[data-tab], [data-tabs]');

            // If no results, set no-results class
            if (trigger.getAttribute('data-has-results') == 'false') {
                document.body.classList.add('no-results');
            } else {
                document.body.classList.remove('no-results');
            }

            related.forEach((related) => {
                const tab = related.getAttribute('data-tab');

                if (activeTabs.includes(tab)) {
                    related.classList.add('active');
                } else {
                    related.classList.remove('active');
                }
            });

            trigger.classList.add('active');
        });
    });


    // Sticky header
    const header = wrapper.querySelector('.tab-headers.sticky');

    if (header) {
        document.addEventListener('scroll', (event) => {
            const top = wrapper.getBoundingClientRect().top;

            if ((WINDOW_INNERWIDTH >= 1050 && top < 50) || (WINDOW_INNERWIDTH < 1050 && top < 0)) {
                wrapper.classList.add('fixed');
            } else {
                wrapper.classList.remove('fixed');
            }
        });
    }
});


// Toggle buttons
const toggleButtons = document.querySelectorAll('.button.toggle, span.toggle');
toggleButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        if (button.classList.contains('noswitch')) {
            return;
        }

        button.classList.toggle('active');

        if (button.classList.contains('toggle-parent')) {
            button.parentElement.classList.toggle('active');
        }
    });
});


// Share URL buttons
const shareUrlButtons = document.querySelectorAll('.share-link-container .button');
shareUrlButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();

        if (navigator.share) {
            navigator.share({
                title: 'Share F2F Campaign link',
                url: button.getAttribute('data-url'),
            })
            .catch(console.error);
        } else {
            const container = button.closest('.share-link-container');
            const fallback = container.querySelector('.share-link');
            fallback.select();

            const toast = document.createElement('div');
            toast.classList.add('toast-messages');

            const inner = document.createElement('div');
            inner.classList.add('inner');

            if (document.execCommand('copy')) {
                toast.classList.add('success');
                inner.innerText = 'Copied link';
            } else {
                toast.classList.add('error');
                inner.innerText = 'Something went wrong';
            }

            toast.appendChild(inner);
            document.body.appendChild(toast);
        }
    });
});


const height = window.visualViewport.height;
const viewport = window.visualViewport;
const size = document.querySelector('#size-indicator');

size.innerText = height;

popupFix = (popup) => {
    const inner = popup.querySelector(':scope > .inner');

    let fixPosition = 0;
    let lastRun = 0;

    debounce = (func, delay) => {
        const time = Date.now();

        if (time - lastRun > delay) {
            func();
            lastRun = time;
        }
    };

    isIos = () => {
        const iosPlatforms = [
            'iPad', 'iPhone', 'iPod'
        ];

        return iosPlatforms.includes(window.navigator.platform) || (window.navigator.userAgent.includes('Mac') && 'ontouched' in document);
    };

    setMargin = () => {
        const scrollY = window.pageYOffset;
        const pageHeight = document.body.clientHeight;
        const viewPortHeight = window.visualViewport.height;
        const viewPortOffset = height - viewPortHeight;

        let bottomOffset = pageHeight - (scrollY + viewPortHeight);

        size.style.top = `${scrollY}px`;
        size.innerText = `${pageHeight} / ${viewPortHeight} / ${scrollY} / ${bottomOffset}`;

        if (bottomOffset < 0) {
            bottomOffset = 0;
            size.style.top = `${viewPortOffset}px`;
        }

        // Set inner bottom offset
        inner.style.position = 'absolute';
        inner.style.bottom = `${bottomOffset}px`;

        // Outer popup should be converted to absolute
        popup.style.position = 'absolute';
        popup.style.height = `${pageHeight}px`;
        popup.style.bottom = 'auto';
    };

    localShowPopup = (force=false) => {
        const viewPortHeight = window.visualViewport.height;

        const scrollY = window.pageYOffset;
        const pageHeight = document.body.clientHeight;

        // Put popup back in default position
        if (!force && height == viewPortHeight) {
            inner.style.bottom = `0px`;
            inner.style.position = 'fixed';
            inner.style.top = 'auto';

            popup.style.bottom = '0px';
            popup.style.height = `auto`;
            popup.style.position = 'fixed';

            inner.classList.remove('virtual-keyboard');
        } else {
            inner.classList.add('virtual-keyboard');

            // Check if repositioning is needed
            debounce(setMargin, 0);
        }
    };

    if (isIos()) {
        window.addEventListener('scroll', localShowPopup);
        window.visualViewport.addEventListener('resize', (event) => {
            this.localShowPopup(true);
        });
    }
};


// Splashscreen
const splash = document.querySelector('.splash');
if (splash) {
    if (getCookie('splash')) {
        splash.remove();
    } else {
        document.body.classList.add('popup-active');

        setTimeout(function() {
            splash.classList.add('transition');
            document.body.classList.remove('popup-active');

            setTimeout(function() {
                setCookie('splash', true);
                splash.classList.remove();
            }, 200);
        }, Math.random() * (1800 - 1200) + 1200);
    }
}


// Prev url logic
const updatePrevUrls = () => {
    const prevUrlProviders = document.querySelectorAll('[data-prev-url-provider]');

    prevUrlProviders.forEach((provider) => {
        let prevUrl = provider.getAttribute('data-prev-url-provider');

        if (provider.hasAttribute('data-prev-url-path')) {
            prevUrl = window.location.pathname ;
        }

        if (!prevUrl) { return; }

        const id = provider.getAttribute('data-prev-url-id');
        const prevUrlReceivers = provider.querySelectorAll(`:not([data-prev-url-replaced])[data-prev-url-receiver][data-prev-url-id="${id}"]`);

        prevUrlReceivers.forEach((receiver) => {
            const method = receiver.getAttribute('data-prev-url-receiver');

            if (method == 'append') {
                const href = receiver.href;

                if (href.includes('?')) {
                    receiver.href = `${href}&prev=${prevUrl}`;
                } else {
                    receiver.href = `${href}?prev=${prevUrl}`;
                }
            } else if (method == 'replace') {
                receiver.href = prevUrl;
            }

            receiver.setAttribute('data-prev-url-replaced', 'true');
        });
    });
};


document.addEventListener('DOMContentLoaded', (event) => {
    // Prev URL logic
    updatePrevUrls();


    // Cookie notice
    const cookieNotice = document.querySelector('.cookie-notice');

    if (getCookie('ca')) {
        cookieNotice.remove();
        return;
    }

    if (cookieNotice == undefined) {
        return;
    }

    cookieNotice.classList.add('show');

    const acceptButton = cookieNotice.querySelector('.accept-cookies');

    acceptButton.addEventListener('click', (event) => {
        setCookie('ca', true);
        cookieNotice.remove();
    });
});

const clearLocalStorage = () => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("preferencesSet");
    localStorage.removeItem("shownFeedShortcuts");
}

const onLogoutClicked = (e) => {
    e.preventDefault();
    clearLocalStorage();
    window.location.href = e.target.href;
}