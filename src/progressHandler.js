const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { translateText } = require('./translateText');
const { detectReadmeLang } = require('./detectReadmeLang');

exports.handleTranslationProgress = async (targetLangs, readmePath, apiKey) => {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "生成多语言README"
    }, async (progress) => {
        for (const eachTargetLang of targetLangs) {
            progress.report({ message: `正在生成 ${eachTargetLang} 版本...` });
            const content = fs.readFileSync(readmePath, 'utf8');
            const translated = await translateText(content, eachTargetLang, apiKey);
            //////// ↓ getReadmeInfo
            const originalReadmePath = path.join(path.dirname(readmePath), 'README.md');
            const originalContent = fs.readFileSync(originalReadmePath, 'utf8');
            const detectedOriginalREADMELang = await detectReadmeLang(originalContent, apiKey);
            //////// ↑ getReadmeInfo

            if (translated) {
                const allLangs = [detectedOriginalREADMELang.toLowerCase(), ...targetLangs.map(l => l.toLowerCase())];
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
                    const filename = languageCode.toLowerCase() === detectedOriginalREADMELang.toLowerCase()
                        ? 'README.md'
                        : `README_${languageCode.toLowerCase()}.md`;
                    return languageCode.toLowerCase() === detectedOriginalREADMELang.toLowerCase()
                        ? `**${displayName}**`
                        : `[${displayName}](${filename})`;
                }).join(' | ');

                const translatedWithNav = `<!-- LANG_NAV -->
${navItems}

${translated}`;

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
        }
    });
};