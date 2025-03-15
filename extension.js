// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// import OpenAI from "openai";
const OpenAI = require("openai").default;
const { translateText } = require('./src/translateText.js');
// const { generateNavLangItems } = require('./src/generateNavLangItems.js');

// 导入detectReadmeLang函数
const { detectReadmeLang } = require('./src/detectReadmeLang.js');

// 使用config会导致和配置项重名报错，因此改为configuration
const configuration = require('./src/configuration.js');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
/**
 * 当扩展被激活时调用的函数。
 * @param {vscode.ExtensionContext} context - 扩展的上下文对象，包含扩展的生命周期信息。
 */
/**
 * 此注释部分可能用于描述后续代码功能或模块用途
 * 这里可以详细说明函数、类或模块的具体作用
 * 例如：这里将定义一个重要的工具函数，用于处理特定任务
 */



async function activate(context) {

	const generateDisposable = vscode.commands.registerCommand('readme-translate.generateMultiLang', async (uri) => {
		const config = vscode.workspace.getConfiguration('readmeTranslate');
		const apiKey = config.get('apiKey');
		const langOptions = config.inspect('targetLanguages').defaultValue;

		if (!apiKey) {
			vscode.window.showErrorMessage('请先配置DeepSeek API密钥');
			return;
		}

		try {
			const readmePath = uri.fsPath;
			const content = fs.readFileSync(readmePath, 'utf8');

			// // 显示多选界面
			// const selectedLangs = await vscode.window.showQuickPick([
			// 	{ label: 'English', value: 'en' },
			// 	{ label: '中文', value: 'zh' },
			// 	{ label: '한국어', value: 'ko' },
			// 	{ label: '日本語', value: 'ja' },
			// 	{ label: 'Español', value: 'es' },
			// 	{ label: 'Français', value: 'fr' },
			// 	{ label: 'Deutsch', value: 'de' },
			// 	{ label: 'Русский', value: 'ru' }
			// ], {
			// 	placeHolder: '选择要生成的语言版本',
			// 	canPickMany: true
			// });

			// 显示多选界面
			const selectedLangs = await vscode.window.showQuickPick(configuration.targetLanguages, {
				placeHolder: '选择要生成的语言版本',
				canPickMany: true
			});

			console.log('用户选择结果:', selectedLangs);
			if (!selectedLangs || selectedLangs.length === 0) {
				vscode.window.showWarningMessage('未选择任何目标语言');
				return;
			}

			const targetLangs = selectedLangs.map(selectedLanguage => selectedLanguage.value);
			// const targetLangs = selectedLangs;

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "生成多语言README"
			}, async (progress) => {
				for (const eachTargetLang of targetLangs) {
					progress.report({ message: `正在生成 ${eachTargetLang} 版本...` });
					const translated = await translateText(content, eachTargetLang, apiKey);
					// 检测 README 文件的语言
					// 读取原始README.md文件内容
					const originalReadmePath = path.join(path.dirname(readmePath), 'README.md');
					const originalContent = fs.readFileSync(originalReadmePath, 'utf8');
					const detectedOriginalREADMELang = await detectReadmeLang(originalContent, apiKey);
					console.log('检测到的语言:', detectedOriginalREADMELang);

					if (translated) {
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
					//////////
				}
			});

			vscode.window.showInformationMessage(`成功生成${targetLangs.length}种语言版本`);
		} catch (error) {
			vscode.window.showErrorMessage('生成失败: ' + error.message);
		}
	});

	context.subscriptions.push(generateDisposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

