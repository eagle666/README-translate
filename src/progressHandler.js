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

            const translatedWithNav = `${translated}`;
            const originalWithNav = `${originalContent}`;
            fs.writeFileSync(originalReadmePath, originalWithNav);


            const newPath = path.join(
                path.dirname(readmePath),
                `README_${eachTargetLang}.md`
            );
            fs.writeFileSync(newPath, translatedWithNav);
        }
    });
};