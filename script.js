// Modern ES6+ JavaScript with improved performance and accessibility

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scrolling for anchor links
const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            targetElement.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });

            if (!targetElement.hasAttribute('tabindex')) {
                targetElement.setAttribute('tabindex', '-1');
            }
            targetElement.focus({ preventScroll: true });

            if (history.pushState) {
                history.pushState(null, '', targetId);
            } else {
                window.location.hash = targetId;
            }
        });
    });
};

const initMobileNav = () => {
    const toggleButton = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('#primary-nav');

    if (!toggleButton || !navMenu) return;

    if (!navMenu.hasAttribute('tabindex')) {
        navMenu.setAttribute('tabindex', '-1');
    }

    let lastFocusedElement = null;

    const getFocusableMenuElements = () =>
        Array.from(navMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(
            (el) => el instanceof HTMLElement
        );

    const closeMenu = (restoreFocus = false) => {
        document.body.classList.remove('nav-open');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Open menu');
        if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus({ preventScroll: true });
        }
    };

    const openMenu = () => {
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.classList.add('nav-open');
        toggleButton.setAttribute('aria-expanded', 'true');
        toggleButton.setAttribute('aria-label', 'Close menu');
        const firstFocusable = getFocusableMenuElements()[0];
        if (firstFocusable instanceof HTMLElement) {
            firstFocusable.focus({ preventScroll: true });
        } else {
            navMenu.focus({ preventScroll: true });
        }
    };

    toggleButton.addEventListener('click', () => {
        const isOpen = document.body.classList.contains('nav-open');
        if (isOpen) closeMenu();
        else openMenu();
    });

    navMenu.addEventListener('click', (e) => {
        if (e.target instanceof Element && e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (!document.body.classList.contains('nav-open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeMenu(true);
            return;
        }

        if (e.key !== 'Tab') return;

        const focusable = getFocusableMenuElements();
        if (focusable.length === 0) {
            e.preventDefault();
            navMenu.focus({ preventScroll: true });
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus({ preventScroll: true });
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus({ preventScroll: true });
        }
    });
};

// Fade-in animation on scroll using Intersection Observer
const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll('.section-container');
    if (animatedElements.length === 0) return;

    if (prefersReducedMotion) {
        animatedElements.forEach((element) => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    animatedElements.forEach((element) => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
};

// Optimize header on scroll
const initHeaderOptimization = () => {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const scrollY = window.scrollY;

        header.classList.toggle('scrolled', scrollY > 100);

        if (scrollY > lastScrollY && scrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollY = scrollY;
        ticking = false;
    };

    const requestHeaderUpdate = () => {
        if (ticking) return;
        requestAnimationFrame(updateHeader);
        ticking = true;
    };

    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
};

const initBackToTop = () => {
    const button = document.querySelector('.back-to-top');
    if (!button) return;

    let ticking = false;
    const update = () => {
        button.classList.toggle('is-visible', window.scrollY > 600);
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    requestUpdate();

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
};

const initActiveSectionNav = () => {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (navLinks.length === 0) return;

    const sections = navLinks
        .map((link) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return null;
            return document.querySelector(href);
        })
        .filter((node) => node instanceof HTMLElement);

    if (sections.length === 0) return;

    const setActive = (activeId) => {
        navLinks.forEach((link) => {
            const id = link.getAttribute('href')?.slice(1);
            if (id === activeId) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            const candidates = entries
                .filter((e) => e.isIntersecting)
                .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

            const best = candidates[0]?.target;
            if (best instanceof HTMLElement && best.id) setActive(best.id);
        },
        { threshold: [0.2, 0.35, 0.5], rootMargin: '-20% 0px -65% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
};

const initProjectsSearch = () => {
    const input = document.getElementById('projects-search');
    const count = document.querySelector('.projects-count');
    const emptyState = document.querySelector('.projects-empty');
    const cards = Array.from(document.querySelectorAll('.projects-grid .project-card'));

    if (!(input instanceof HTMLInputElement) || cards.length === 0) return;

    const normalized = (value) => (value ?? '').toString().toLowerCase().trim();

    const updateCount = (visibleCount) => {
        if (!(count instanceof HTMLElement)) return;
        count.textContent = `${visibleCount} of ${cards.length} shown`;
    };

    const applyFilter = () => {
        const query = normalized(input.value);
        const rawQuery = input.value.trim();
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = normalized(card.textContent);
            const isMatch = query.length === 0 || haystack.includes(query);
            card.style.display = isMatch ? '' : 'none';
            if (isMatch) visibleCount += 1;
        });

        updateCount(visibleCount);

        if (emptyState instanceof HTMLElement) {
            const shouldShowEmptyState = visibleCount === 0;
            emptyState.hidden = !shouldShowEmptyState;
            if (shouldShowEmptyState && rawQuery.length > 0) {
                emptyState.textContent = `No achievements found for "${rawQuery}".`;
            } else {
                emptyState.textContent = 'No achievements found.';
            }
        }
    };

    let rafId = 0;
    const schedule = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(applyFilter);
    };

    input.addEventListener('input', schedule);
    applyFilter();
};

const initResumeModal = () => {
    const modal = document.getElementById('resume-modal');
    if (!(modal instanceof HTMLDialogElement)) return;

    const closeButton = modal.querySelector('.resume-modal-close');
    const frame = modal.querySelector('.resume-frame');
    const error = modal.querySelector('.resume-modal-error');
    if (!(frame instanceof HTMLIFrameElement)) return;

    const close = () => {
        frame.removeAttribute('src');
        if (error instanceof HTMLElement) error.hidden = true;
        modal.close();
    };

    closeButton?.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });

    const open = async (pdfUrl) => {
        if (typeof modal.showModal !== 'function') {
            window.open(pdfUrl, '_blank', 'noopener,noreferrer');
            return true;
        }

        const isFileProtocol = window.location.protocol === 'file:';

        if (isFileProtocol) {
            if (error instanceof HTMLElement) error.hidden = true;
            frame.src = pdfUrl;
            modal.showModal();
            return true;
        }

        try {
            // Some static servers don't implement HEAD correctly; use a tiny GET instead.
            const res = await fetch(pdfUrl, { headers: { Range: 'bytes=0-0' } });
            const ok = res.ok || res.status === 206;
            if (error instanceof HTMLElement) error.hidden = ok;
            if (ok) frame.src = pdfUrl;
            else frame.removeAttribute('src');
            modal.showModal();
            return ok;
        } catch {
            if (error instanceof HTMLElement) error.hidden = false;
            frame.src = pdfUrl;
            modal.showModal();
            return false;
        }
    };

    document.querySelectorAll('[data-resume-open]').forEach((el) => {
        if (!(el instanceof HTMLAnchorElement)) return;
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const href = el.getAttribute('href');
            if (!href) return;
            open(href);
        });
    });
};

const init = () => {
    initSmoothScrolling();
    initMobileNav();
    initScrollAnimations();
    initHeaderOptimization();
    initBackToTop();
    initActiveSectionNav();
    initProjectsSearch();
    initResumeModal();
};

document.addEventListener('DOMContentLoaded', init, { once: true });
