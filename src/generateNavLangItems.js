const path = require('path');

function generateNavLangItems(targetLangs, currentLang) {
    const allLangs = ['en', ...targetLangs];
    return allLangs.map((langCode) => {
        const displayName = {
            en: 'English',
            zh: '中文',
            ko: '한국어',
            ja: '日本語',
            es: 'Español',
            fr: 'Français',
            de: 'Deutsch',
            ru: 'Русский'
        }[langCode];

        const filename = langCode === 'en'
            ? 'README.md'
            : `README_${langCode}.md`;

        return langCode === currentLang
            ? `**${displayName}**`
            : `[${displayName}](${filename})`;
    }).join(' | ');
}

module.exports = {
    generateNavLangItems
};