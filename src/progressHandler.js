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

                    ////////////////////////////////////////////////////////////////////////////////////////////////

                    // 原写法
                    vscode.window.showWarningMessage('detectedOriginalREADMELang', detectedOriginalREADMELang.toLowerCase());

                    const currentLang = readmePath.endsWith('README.md')
                        ? detectedOriginalREADMELang.toLowerCase()
                        : eachTargetLang.toLowerCase();

                    // const navItems = allLangs.map((languageCode) => {
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

                    return languageCode.toLowerCase() === currentLang
                        ? `**${displayName}**`
                        : `[${displayName}](${filename})`;
                }).join(' | ');
                // `.join(' | ')` 是 JavaScript 数组的一个方法，用于将数组中的所有元素连接成一个字符串，并用指定的分隔符分隔这些元素。
                // 在这段代码中，`navItems` 是一个由 `map` 方法生成的数组，数组中的每个元素是一个导航项（例如 `**English**` 或 `[中文](README_zh.md)`）。
                // `.join(' | ')` 会将这些导航项用 ` | ` 连接起来，形成一个完整的导航栏字符串，例如 `**English** | [中文](README_zh.md) | [한국어](README_ko.md)`。
                // 需要注意的是，` | ` 是添加在每个元素之间，而不是每个元素的后面。最后一个元素后面不会有 ` | `。

                ///////////// 问题之所在 ↑

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