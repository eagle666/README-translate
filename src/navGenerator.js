const { detectReadmeLang } = require('./detectReadmeLang');

exports.generateNavItems = (originLangCode, targetLangs) => {
    const uniqueLangs = [...new Set(targetLangs)];
    return uniqueLangs.map((targetLang) => {
        const normalizedTarget = targetLang.toLowerCase();
        const displayName = {
            en: 'English',
            zh: '中文',
            ko: '한국어',
            ja: '日本語',
            es: 'Español',
            fr: 'Français',
            de: 'Deutsch',
            ru: 'Русский'
        }[targetLang.toLowerCase()];

        const filename = targetLang === originLangCode.toLowerCase()
            ? 'README.md'
            : `README_${targetLang}.md`;

        return {
            langCode: targetLang,
            displayName,
            filename,
            isCurrent: false
        };
    });
};

exports.formatNavBar = (items, currentLang) => {
    return items.map(item => {
        return item.langCode.toLowerCase() === currentLang.toLowerCase()
            ? `**${item.displayName}**`
            : `[${item.displayName}](${item.filename})`;
    }).join(' | ');
};