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

		/////  ↓ 配置项
		const config = vscode.workspace.getConfiguration('readmeTranslate');
		const apiKey = config.get('apiKey');
		const langOptions = config.inspect('targetLanguages').defaultValue;
		/////  ↑ 配置项

		if (!apiKey) {
			vscode.window.showErrorMessage('请先配置DeepSeek API密钥');
			return;
		}

		try {
			const readmePath = uri.fsPath;
			const content = fs.readFileSync(readmePath, 'utf8');

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

			// 调用进度处理模块
			const { handleTranslationProgress } = require('./src/progressHandler');
			await handleTranslationProgress(targetLangs, readmePath, apiKey);
			// 调用进度处理模块


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

