(function () {

    // 🌍 FULL COUNTRY → LANG
    const LANG_MAP = {
        'VN':'vi',
        'US':'en','GB':'en','CA':'en','AU':'en','NZ':'en','IE':'en','SG':'en',

        'JP':'ja','KR':'ko','CN':'zh-CN','TW':'zh-TW','HK':'zh-TW',
        'TH':'th','ID':'id','MY':'ms','PH':'tl',
        'IN':'hi','PK':'ur','BD':'bn','LK':'si','NP':'ne',
        'KH':'km','LA':'lo','MM':'my','MN':'mn',

        'FR':'fr','DE':'de','IT':'it','ES':'es','PT':'pt',
        'NL':'nl','BE':'fr','CH':'de','AT':'de','LU':'fr',

        'SE':'sv','NO':'no','DK':'da','FI':'fi','IS':'is',

        'PL':'pl','CZ':'cs','SK':'sk','HU':'hu',
        'RO':'ro','BG':'bg','HR':'hr','SI':'sl',
        'RS':'sr','BA':'bs','ME':'sr','MK':'mk','AL':'sq',

        'LT':'lt','LV':'lv','EE':'et',

        'GR':'el','CY':'el','MT':'mt',

        'SA':'ar','AE':'ar','EG':'ar','IQ':'ar','MA':'ar','DZ':'ar',
        'IL':'he','IR':'fa','AF':'fa','TR':'tr','QA':'ar','KW':'ar','OM':'ar',

        'MX':'es','AR':'es','CO':'es','CL':'es','PE':'es',
        'VE':'es','UY':'es','PY':'es','BO':'es','EC':'es',
        'GT':'es','CU':'es','DO':'es','HN':'es','SV':'es','NI':'es','CR':'es','PA':'es',

        'BR':'pt',

        'ZA':'en','NG':'en','KE':'en','GH':'en',
        'TZ':'sw','UG':'en','ET':'am','CM':'fr',
        'SN':'fr','CI':'fr','ML':'fr','NE':'fr',
        'SD':'ar','LY':'ar','TN':'ar',

        'RU':'ru','UA':'uk','BY':'ru','KZ':'kk','UZ':'uz','TM':'tk','KG':'ky','TJ':'tg',

        'FJ':'en','PG':'en','WS':'sm','TO':'to',

        'GE':'ka','AM':'hy','AZ':'az'
    };

    const API_URL = "https://libretranslate.de/translate";

    const cache = new Map(JSON.parse(localStorage.getItem("tl_cache") || "[]"));

    function saveCache() {
        localStorage.setItem("tl_cache", JSON.stringify([...cache]));
    }

    // 🌀 Loading
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:999999;
        background:rgba(255,255,255,0.6);
        backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;
        font-family:sans-serif;
    `;
    overlay.innerHTML = `<div>🌐 Translating...</div>`;
    document.body.appendChild(overlay);

    function removeOverlay() {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 300);
    }

    // 🌍 Get country
    async function getCountry() {
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            return (data.country_code || "").toUpperCase();
        } catch {
            return "";
        }
    }

    // ⚡ Batch translate
    async function translateBatch(texts, lang) {
        const uncached = texts.filter(t => !cache.has(t));

        if (uncached.length) {
            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        q: uncached,
                        source: "en",
                        target: lang,
                        format: "text"
                    })
                });

                const data = await res.json();

                uncached.forEach((t, i) => {
                    cache.set(t, data.translatedText[i]);
                });

                saveCache();

            } catch (e) {}
        }

        return texts.map(t => cache.get(t) || t);
    }

    // 🧠 Collect text nodes
    function getTextNodes(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const nodes = [];

        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (
                node.nodeValue.trim().length > 2 &&
                !node.parentNode.closest("script,style,textarea,code")
            ) {
                nodes.push(node);
            }
        }

        return nodes;
    }

    // 🚀 Translate DOM
    async function translateDOM(root, lang) {
        const nodes = getTextNodes(root);
        const texts = nodes.map(n => n.nodeValue.trim());

        const translated = await translateBatch(texts, lang);

        nodes.forEach((node, i) => {
            node.nodeValue = node.nodeValue.replace(texts[i], translated[i]);
        });
    }

    // 👀 Observe SPA
    function observe(lang) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(n => {
                    translateDOM(n, lang);
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 🎯 Main
    async function run() {
        const country = await getCountry();
        const browserLang = navigator.language.slice(0,2);

        const lang = LANG_MAP[country] || browserLang || 'en';

        if (lang === 'en') {
            removeOverlay();
            return;
        }

        await translateDOM(document.body, lang);
        observe(lang);

        removeOverlay();
    }

    if (document.body) run();
    else document.addEventListener("DOMContentLoaded", run);

})();
