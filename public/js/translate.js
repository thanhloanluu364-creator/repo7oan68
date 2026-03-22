(function () {
    const LANG_MAP = {
        'US':'en','GB':'en','CA':'en','AU':'en','NZ':'en','IE':'en','SG':'en',

        'JP':'ja','KR':'ko','CN':'zh-CN','TW':'zh-TW','HK':'zh-TW',
        'TH':'th','ID':'id','MY':'ms','PH':'tl','IN':'hi','PK':'ur','BD':'bn',

        'FR':'fr','DE':'de','IT':'it','ES':'es','PT':'pt','NL':'nl',
        'BE':'fr','CH':'de','AT':'de',

        'SE':'sv','NO':'no','DK':'da','FI':'fi',

        'PL':'pl','CZ':'cs','HU':'hu','RO':'ro','BG':'bg',

        'GR':'el','TR':'tr',

        'SA':'ar','AE':'ar','EG':'ar',

        'RU':'ru','UA':'uk',

        'BR':'pt','MX':'es','AR':'es','CO':'es',

        'VN':'vi'
    };

    // ───────── Overlay ─────────
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:999999;
        background:rgba(255,255,255,0.75);
        backdrop-filter:blur(6px);
        display:flex;align-items:center;justify-content:center;
        transition:opacity .4s;
    `;

    overlay.innerHTML = `
        <div style="
            width:40px;height:40px;
            border:3px solid #ddd;
            border-top-color:#1877f2;
            border-radius:50%;
            animation:spin .7s linear infinite">
        </div>
    `;

    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    function hideOverlay() {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);
    }

    // ───────── Detect Country (PRO) ─────────
    async function getCountry() {
        const apis = [
            'https://ipapi.co/json/',
            'https://api.country.is/',
            'https://ipwho.is/'
        ];

        for (let url of apis) {
            try {
                const res = await fetch(url);
                const data = await res.json();
                return (data.country || data.country_code || '').toUpperCase();
            } catch (e) {}
        }
        return '';
    }

    // ───────── Load Google Translate ─────────
    function loadTranslate(lang) {
        return new Promise(resolve => {
            window.googleTranslateElementInit = function () {
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: lang,
                    autoDisplay: false
                }, 'google_translate_element');

                resolve();
            };

            const s = document.createElement('script');
            s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            document.body.appendChild(s);
        });
    }

    // ───────── Force translate ─────────
    function triggerTranslate(lang) {
        const interval = setInterval(() => {
            const select = document.querySelector('.goog-te-combo');
            if (select) {
                select.value = lang;
                select.dispatchEvent(new Event('change'));
                clearInterval(interval);
                setTimeout(hideOverlay, 1200);
            }
        }, 300);
    }

    // ───────── MAIN ─────────
    async function init() {
        let cached = localStorage.getItem('auto_lang');

        if (!cached) {
            const country = await getCountry();
            cached = LANG_MAP[country] || 'en';
            localStorage.setItem('auto_lang', cached);
        }

        if (cached === 'en') {
            hideOverlay();
            return;
        }

        // tạo container ẩn
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.display = 'none';
        document.body.appendChild(div);

        await loadTranslate(cached);
        triggerTranslate(cached);
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

})();
