(function () {

    // 🌍 CONFIG
    const CONFIG = {
        API_URL: "https://libretranslate.de/translate",
        DEFAULT_LANG: "en",
        CACHE_KEY: "tl_cache_v2",
        LANG_KEY: "tl_lang",
    };

    // 🌍 FULL MAP
    const LANG_MAP = {
        'VN':'vi','US':'en','GB':'en','CA':'en','AU':'en',
        'JP':'ja','KR':'ko','CN':'zh-CN','TW':'zh-TW',
        'TH':'th','ID':'id','MY':'ms','PH':'tl',
        'IN':'hi','FR':'fr','DE':'de','IT':'it','ES':'es',
        'PT':'pt','RU':'ru','UA':'uk','SA':'ar','AE':'ar',
        'TR':'tr','BR':'pt','MX':'es','AR':'es','CO':'es'
    };

    let cache = new Map(JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || "[]"));

    function saveCache() {
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify([...cache]));
    }

    // 🌀 UI BUTTON
    function createLangSwitcher(currentLang) {
        const select = document.createElement("select");
        select.style.cssText = `
            position:fixed;bottom:20px;right:20px;
            z-index:999999;padding:6px;border-radius:6px;
        `;

        const langs = ["en","vi","ja","ko","zh-CN","es","fr","de","ru"];
        langs.forEach(l => {
            const opt = document.createElement("option");
            opt.value = l;
            opt.textContent = l.toUpperCase();
            if (l === currentLang) opt.selected = true;
            select.appendChild(opt);
        });

        select.onchange = () => {
            localStorage.setItem(CONFIG.LANG_KEY, select.value);
            location.reload();
        };

        document.body.appendChild(select);
    }

    // 🌍 IP detect
    async function getCountry() {
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            return data.country_code;
        } catch {
            return null;
        }
    }

    // ⚡ Batch translate
    async function translateBatch(texts, lang) {
        const uncached = texts.filter(t => !cache.has(t));

        if (uncached.length) {
            try {
                const res = await fetch(CONFIG.API_URL, {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({
                        q: uncached,
                        source: "en",
                        target: lang
                    })
                });

                const data = await res.json();

                uncached.forEach((t, i) => {
                    cache.set(t, data.translatedText[i]);
                });

                saveCache();
            } catch {}
        }

        return texts.map(t => cache.get(t) || t);
    }

    // 🧠 GET TEXT NODES
    function getTextNodes(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];

        while (walker.nextNode()) {
            const n = walker.currentNode;
            if (
                n.nodeValue.trim().length > 2 &&
                !n.parentNode.closest("script,style,textarea,code") &&
                !n._translated
            ) {
                nodes.push(n);
            }
        }

        return nodes;
    }

    // 🚀 TRANSLATE DOM
    async function translateDOM(root, lang) {
        const nodes = getTextNodes(root);
        const texts = nodes.map(n => n.nodeValue.trim());

        const results = await translateBatch(texts, lang);

        nodes.forEach((n, i) => {
            n.nodeValue = n.nodeValue.replace(texts[i], results[i]);
            n._translated = true;
        });
    }

    // 👀 SPA OBSERVER
    function observe(lang) {
        const observer = new MutationObserver(muts => {
            muts.forEach(m => {
                m.addedNodes.forEach(n => {
                    translateDOM(n, lang);
                });
            });
        });

        observer.observe(document.body, { childList:true, subtree:true });
    }

    // 🌀 LOADING
    function showLoading() {
        const div = document.createElement("div");
        div.id = "tl_loading";
        div.style.cssText = `
            position:fixed;inset:0;z-index:999999;
            background:rgba(255,255,255,0.6);
            display:flex;align-items:center;justify-content:center;
        `;
        div.innerHTML = "🌐 Translating...";
        document.body.appendChild(div);
    }

    function hideLoading() {
        const el = document.getElementById("tl_loading");
        el && el.remove();
    }

    // 🎯 MAIN
    async function run() {
        showLoading();

        let lang = localStorage.getItem(CONFIG.LANG_KEY);

        if (!lang) {
            const country = await getCountry();
            const browserLang = navigator.language.slice(0,2);
            lang = LANG_MAP[country] || browserLang || CONFIG.DEFAULT_LANG;
        }

        createLangSwitcher(lang);

        if (lang === "en") {
            hideLoading();
            return;
        }

        await translateDOM(document.body, lang);
        observe(lang);

        hideLoading();
    }

    if (document.body) run();
    else document.addEventListener("DOMContentLoaded", run);

})();
