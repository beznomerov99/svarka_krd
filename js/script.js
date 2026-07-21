// Active navigation by URL
(function () {
    // при наличии переходов между страницами подсвечиваем нужный пункт по URL

    const path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    const clean = path === '' || path === '/' ? '/' : path.replace(/^\//, '');

    const map = {
        'index.html': '#home',
        'services.html': '#services',
        'prices.html': '#prices',
        'works.html': '#clients',
        'about.html': '#about',
        '': '#home',
        '/': '#home'
    };

    const hash = map[clean] || map[''] || '#home';
    const link = document.querySelector(`.nav a[data-nav="${hash}"]`) || document.querySelector(`.nav a[href="${hash}"]`);
    if (!link) return;

    document.querySelectorAll('.nav a.nav-link, .nav a').forEach((a) => a.classList.remove('active'));
    link.classList.add('active');
})();

function scrollToSection(selector) {
    const element = document.querySelector(selector);
    const header = document.querySelector('.header');

    if (!element) return;

    const offset = header.offsetHeight;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
    });
}

function setActiveNav(navLink) {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const allLinks = nav.querySelectorAll('a');
    allLinks.forEach((a) => a.classList.remove('active'));

    if (navLink) navLink.classList.add('active');
}

function findNavLinkByHash(hash) {
    // hash например: "#services"
    return document.querySelector(`.nav a[href="${hash}"]`);
}

function findNavLinkByHome() {
    // Главная: href="#" + data-nav="#home"
    return document.querySelector('.nav a[data-nav="#home"]') || document.querySelector('.nav a[href="#"]');
}

// Works gallery scroll + navigation highlighting
document.addEventListener('DOMContentLoaded', function () {
    const grid = document.querySelector('.works__grid');
    const leftBtn = document.querySelector('.works__arrow--left');
    const rightBtn = document.querySelector('.works__arrow--right');

    if (grid && leftBtn && rightBtn) {
        leftBtn.addEventListener('click', function () {
            grid.scrollBy({ left: -400, behavior: 'smooth' });
        });

        rightBtn.addEventListener('click', function () {
            grid.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    const navHomeLink = findNavLinkByHome();
    const servicesLink = findNavLinkByHash('#services');
    const worksLink = findNavLinkByHash('#clients');
    const aboutLink = findNavLinkByHash('#about');
    const pricesLink = findNavLinkByHash('#prices');

    // Быстрый отклик по клику: сразу выставляем active
    if (servicesLink) {
        servicesLink.addEventListener('click', function (e) {
            e.preventDefault();
            setActiveNav(servicesLink);
            scrollToSection('#services');
        });
    }

   if (aboutLink) {
    aboutLink.addEventListener('click', function (e) {
        e.preventDefault();
        setActiveNav(aboutLink);
        scrollToSection('#about');
    });
}

    const contactsLink = findNavLinkByHash('#contacts');
    if (contactsLink) {
        contactsLink.addEventListener('click', function (e) {
            e.preventDefault();
            setActiveNav(contactsLink);
            scrollToSection('#contacts');
        });
    }

    if (navHomeLink) {
        navHomeLink.addEventListener('click', function (e) {
            // href="#" иначе браузер прыгнет на верх
            e.preventDefault();
            setActiveNav(navHomeLink);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Кнопка "Мои услуги" в hero
    const heroServicesBtn = document.querySelector('.hero__buttons .btn');
    if (heroServicesBtn) {
        heroServicesBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (servicesLink) setActiveNav(servicesLink);
            scrollToSection('#services');
        });
    }

    // Модальное окно "Цены"
    const pricesModal = document.getElementById('pricesModal');
    const pricesModalClose = document.getElementById('modalClose');

    if (pricesLink && pricesModal) {
        pricesLink.addEventListener('click', function (e) {
            e.preventDefault();
            pricesModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setActiveNav(pricesLink);
        });

        function closePrices() {
            pricesModal.classList.remove('active');
            document.body.style.overflow = '';

            // Снимаем подсветку «Цены» — дальше её выставит IntersectionObserver,
            // но на месте закрытия сделаем быстрый пересчёт по scrollY.
            if (window.scrollY < 50 && navHomeLink) {
                setActiveNav(navHomeLink);
            }
        }


        if (pricesModalClose) {
            pricesModalClose.addEventListener('click', closePrices);
        }

        pricesModal.addEventListener('click', function (e) {
            if (e.target === pricesModal || e.target.classList.contains('modal__overlay')) {
                closePrices();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && pricesModal.classList.contains('active')) {
                closePrices();
            }
        });
    }

    // IntersectionObserver для подсветки секций
    const sectionMap = [
        { id: '#services', el: document.querySelector('#services'), link: servicesLink },
        { id: '#about', el: document.querySelector('#about'), link: aboutLink }
    ];

    const header = document.querySelector('.header');
    const headerHeight = header ? header.getBoundingClientRect().height : 90;

    const io = new IntersectionObserver(
        (entries) => {
            // Ищем наиболее пересекающуюся (top-most) секцию
            const visible = entries
                .filter((en) => en.isIntersecting)
                .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));

            if (visible.length) {
                const topEntry = visible[0];
                const match = sectionMap.find((m) => m.el === topEntry.target);
                if (match && match.link) setActiveNav(match.link);
            } else {
                // Если ничего не видно — считаем, что мы близко к верху (hero)
                if (window.scrollY < 50 && navHomeLink) setActiveNav(navHomeLink);
            }
        },
        {
            root: null,
            rootMargin: `-${headerHeight + 20}px 0px -60% 0px`,
            threshold: 0.01
        }
    );

    sectionMap.forEach((m) => {
        if (m.el) io.observe(m.el);
    });

    // стартовая установка
    if (window.scrollY < 50 && navHomeLink) setActiveNav(navHomeLink);

    // Важно: при быстрых возвратах/колесе IntersectionObserver может снова подсветить
    // #services. Ставим «ручной» приоритет назад к верху.
    let lastScrollY = window.scrollY;


    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const now = Date.now();
        const goingUp = y < lastScrollY;
        lastScrollY = y;
        lastScrollAt = now;

        // Когда реально близко к верху — принудительно включаем «Главная».
        if (y < 80 && goingUp && navHomeLink) {
            setActiveNav(navHomeLink);
        }
    }, { passive: true });
});
// Mobile only: auto-show card prices on scroll via IntersectionObserver
(function initMobileCardPrices() {
    const isMobile = window.matchMedia('(max-width: 992px)').matches;
    if (!isMobile) return;

    const prices = document.querySelectorAll('.card__price');
    if (!prices.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // показываем только 1 раз
                }
            });
        },
        { threshold: 0.3 }
    );

    prices.forEach((price) => observer.observe(price));
})();

function openPricesModal() {
    const modal = document.getElementById('pricesModal');

    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePricesModal() {
    const modal = document.getElementById('pricesModal');

    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
}
