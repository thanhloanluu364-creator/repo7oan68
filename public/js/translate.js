<!-- GOOGLE TRANSLATE -->
<script>
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: 'en',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        'google_translate_element'
    );
}
</script>

<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

<body class="min-h-screen w-full flex justify-center">

<!-- Widget -->
<div class="absolute top-0 right-0" id="google_translate_element"></div>

<script>
(function () {
    const LANG_MAP = {
        // English
        'US':'en','GB':'en','CA':'en','AU':'en','NZ':'en','IE':'en','SG':'en',

        // Asia
        'VN':'vi','JP':'ja','KR':'ko','CN':'zh-CN','TW':'zh-TW','HK':'zh-TW',
        'TH':'th','ID':'id','MY':'ms','PH':'tl','IN':'hi','PK':'ur','BD':'bn',
        'LK':'si','NP':'ne','MM':'my','KH':'km','LA':'lo','MN':'mn',

        // Europe
        'FR':'fr','DE':'de','IT':'it','ES':'es','PT':'pt','NL':'nl','BE':'fr',
        'CH':'de','AT':'de','PL':'pl','CZ':'cs','SK':'sk','HU':'hu',
        'RO':'ro','BG':'bg','HR':'hr','SI':'sl','RS':'sr','BA':'bs',
        'ME':'sr','MK':'mk','AL':'sq','GR':'el','UA':'uk','RU':'ru',
        'LT':'lt','LV':'lv','EE':'et',

        // Scandinavia
        'SE':'sv','NO':'no','DK':'da','FI':'fi','IS':'is',

        // Middle East
        'SA':'ar','AE':'ar','EG':'ar','IQ':'ar','MA':'ar','DZ':'ar',
        'QA':'ar','KW':'ar','OM':'ar','BH':'ar','JO':'ar','SY':'ar',
        'LB':'ar','YE':'ar','IL':'he','IR':'fa','AF':'fa','TR':'tr',

        // Latin America
        'MX':'es','AR':'es','CO':'es','CL':'es','PE':'es','VE':'es',
        'UY':'es','PY':'es','BO':'es','EC':'es','GT':'es','CU':'es',
        'DO':'es','HN':'es','SV':'es','NI':'es','CR':'es','PA':'es',

        // Brazil
        'BR':'pt',

        // Africa
        'ZA':'en','NG':'en','KE':'en','GH':'en','TZ':'sw','UG':'en',
        'CM':'fr','CI':'fr','SN':'fr','ML':'fr','NE':'fr','BF':'fr',
        'ET':'am','SD':'ar','SS':'en','ZM':'en','ZW':'en',

        // Others
        'KZ':'kk','UZ':'uz','GE':'ka','AM':'hy','AZ':'az'
    };

    // ── Overlay ──
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:999999;
        background:rgba(255,255,255,0.85);
        backdrop-filter:blur(6px);
        display:flex;align-items:center;justify-content:center;
        transition:opacity .4s;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width:42px;height:42px;
        border:4px solid #eee;
        border-top:4px solid #1877f2;
        border-radius:50%;
        animation:spin .7s linear infinite;
    `;

    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin{to{transform:rotate(360deg)}}`;

    document.head.appendChild(style);
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    function removeOverlay() {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 400);
    }

    async function getCountry() {
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            return data.country_code;
        } catch {
            return null;
        }
    }

    function applyTranslate(lang) {
        const interval = setInterval(() => {
            const select = document.querySelector(".goog-te-combo");
            if (select) {
                select.value = lang;
                select.dispatchEvent(new Event("change"));
                clearInterval(interval);
            }
        }, 300);
    }

    async function init() {
        const country = await getCountry();
        const lang = LANG_MAP[country];

        if (!lang || lang === 'en') {
            removeOverlay();
            return;
        }

        applyTranslate(lang);

        setTimeout(removeOverlay, 1500);
    }

    window.addEventListener("load", init);
})();
</script>

</body>
