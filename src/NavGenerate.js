
function generateNavLangItems(currentLang, targetLangs) {
    // 生成语言导航栏（包含英文）
    // const allLangs = ['en', ...targetLangs];
    const allLangs = [detectedOriginalREADMELang.toLowerCase(), ...targetLangs.map(l => l.toLowerCase())];
    console.log('当前allLangs:', allLangs);
    console.log('检测到的原始语言:', detectedOriginalREADMELang);
    console.log('当前目标语言:', eachTargetLang);
    // console.log('生成的导航栏项:', navItems);
    const navItems = allLangs.map((languageCode) => {
        const displayName = {
            en: 'English',
            zh: '中文',
            ko: '한국어',
            ja: '日本語',
            es: 'Español',
            fr: 'Français',
            de: 'Deutsch',
            ru: 'Русский'
        }[languageCode.toLowerCase()];
        const filename = languageCode.toLowerCase() === detectedOriginalREADMELang.toLowerCase() ? 'README.md' : `README_${languageCode.toLowerCase()}.md`;
        return languageCode.toLowerCase() === detectedOriginalREADMELang.toLowerCase() ? `**${displayName}**` : `[${displayName}](${filename})`;
    }).join(' | ');

    const translatedWithNav = `<!-- LANG_NAV -->
${navItems}

${translated}`;

    // 更新原始README文件
    const originalReadmePath = path.join(path.dirname(readmePath), 'README.md');
    const originalContent = fs.readFileSync(originalReadmePath, 'utf8');
    if (!originalContent.includes('<!-- LANG_NAV -->')) {
        const originalWithNav = `<!-- LANG_NAV -->
${navItems}

${originalContent}`;
        fs.writeFileSync(originalReadmePath, originalWithNav);
    }

    const newPath = path.join(
        path.dirname(readmePath),
        `README_${eachTargetLang}.md`
    );
    fs.writeFileSync(newPath, translatedWithNav);
}


module.exports = {
    generateNavLangItems
};