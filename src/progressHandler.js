const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { translateText } = require('./translateText');
const { detectReadmeLang } = require('./detectReadmeLang');
const { generateNavItems, formatNavBar } = require('./navGenerator');

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
                // 母体语言与选中的语言，都丢入allLangs数组，用于生成导航栏
                const allLangs = [...new Set([
                    detectedOriginalREADMELang.toLowerCase(),
                    ...targetLangs.map(l => l.toLowerCase())
                ])];

                const navItems = generateNavItems(detectedOriginalREADMELang.toLowerCase(), allLangs);
                const currentLang = readmePath.endsWith('README.md')
                    ? (await detectReadmeLang(originalContent, apiKey)).toLowerCase()
                    : path.basename(readmePath).replace('README_', '').replace('.md', '').toLowerCase();
                const navBar = formatNavBar(navItems, currentLang);

                const translatedWithNav = `<!-- LANG_NAV -->
${navBar}

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