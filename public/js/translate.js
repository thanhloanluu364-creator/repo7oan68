(function () {
    const LANG_MAP = {
        // English
        US:'en',GB:'en',CA:'en',AU:'en',NZ:'en',IE:'en',SG:'en',

        // Asia
        JP:'ja',KR:'ko',CN:'zh-CN',TW:'zh-TW',HK:'zh-TW',
        TH:'th',ID:'id',MY:'ms',PH:'tl',IN:'hi',PK:'ur',BD:'bn',VN:'vi',

        // Europe
        FR:'fr',DE:'de',IT:'it',ES:'es',PT:'pt',NL:'nl',BE:'fr',
        CH:'de',AT:'de',SE:'sv',NO:'no',DK:'da',FI:'fi',

        // Eastern
        PL:'pl',CZ:'cs',SK:'sk',HU:'hu',RO:'ro',BG:'bg',
        HR:'hr',SI:'sl',RS:'sr',UA:'uk',RU:'ru',

        // Middle East
        SA:'ar',AE:'ar',EG:'ar',IQ:'ar',MA:'ar',IL:'he',IR:'fa',TR:'tr',

        // America
        MX:'es',AR:'es',CO:'es',CL:'es',PE:'es',VE:'es',
        BR:'pt',

        // Africa
        ZA:'en',NG:'en',KE:'en'
    };

    // ───── Overlay ─────
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:999999;
        background:rgba(255,255,255,.7);
        backdrop-filter:blur(5px);
        display:flex;align-items:center;justify-content:center;
    `;
    overlay.innerHTML = `<div style="
        width:35px;height:35px;border:3px solid #ccc;
        border-top-color:#1877f2;border-radius:50%;
        animation:spin .7s linear infinite"></div>`;

    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const removeOverlay = () => overlay.remove();

    // ───── Load Google Translate Script ─────
    function loadTranslate(lang) {
        if (window.google && window.google.translate) return;

        const script = document.createElement('script');
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);

        window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: lang,
                autoDisplay: false
            }, document.createElement('div'));

            // Force translate ngay lập tức
            const interval = setInterval(() => {
                const select = document.querySelector(".goog-te-combo");
                if (select) {
                    select.value = lang;
                    select.dispatchEvent(new Event("change"));
                    clearInterval(interval);
                    setTimeout(removeOverlay, 800);
                }
            }, 100);
        };
    }

    // ───── Get IP Country (FAST + BACKUP) ─────
    async function getCountry() {
        try {
            let r = await fetch("https://ipapi.co/json/");
            let j = await r.json();
            return j.country_code;
        } catch {
            try {
                let r = await fetch("https://api.ipify.org?format=json");
                let ip = (await r.json()).ip;
                let r2 = await fetch(`https://ipwho.is/${ip}`);
                let j2 = await r2.json();
                return j2.country_code;
            } catch {
                return null;
            }
        }
    }

    // ───── Main ─────
    async function run() {
        let saved = localStorage.getItem("lang_set");

        if (saved) {
            loadTranslate(saved);
            return;
        }

        let country = await getCountry();
        let lang = LANG_MAP[country] || 'en';

        localStorage.setItem("lang_set", lang);

        if (lang === 'en') {
            removeOverlay();
            return;
        }

        loadTranslate(lang);
    }

    run();
})();
