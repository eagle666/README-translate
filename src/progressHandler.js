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
                // 母体语言与选中的语言，都丢入allLangs数组，用于生成导航栏
                const allLangs = [detectedOriginalREADMELang.toLowerCase(), ...targetLangs.map(l => l.toLowerCase())];


                //////////////  ↓  navItems的返回结果为markdown的导航栏，例如：[English](README.md) | [中文](README_zh.md) | [한국어](README_ko.md) | [日本語](README_ja.md) | [Español](README_es.md) | [Français](README_fr.md) | [Deutsch](README_de.md) | [Русский](README_ru.md)
                const navItems = allLangs.map((languageCode) => {

                    //////////// ↓ 通过语言代码获取对应的显示名称
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
                    //////////// ↑ 通过语言代码获取对应的显示名称

                    ////  ↓ 生成文件名的逻辑
                    const filename = languageCode.toLowerCase() === detectedOriginalREADMELang.toLowerCase()
                        ? 'README.md'
                        : `README_${languageCode.toLowerCase()}.md`;
                    ////  ↑ 生成文件名的逻辑

                    return languageCode.toLowerCase() === detectedOriginalREADMELang.toLowerCase()
                        ? `**${displayName}**`
                        : `[${displayName}](${filename})`;
                }).join(' | ');
                //////////////  ↑  navItems的返回结果为markdown的导航栏，例如：[English](README.md) | [中文](README_zh.md) | [한국어](README_ko.md) | [日本語](README_ja.md) | [Español](README_es.md) | [Français](README_fr.md) | [Deutsch](README_de.md) | [Русский](README_ru.md)


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