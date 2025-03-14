// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// import OpenAI from "openai";
const OpenAI = require("openai").default;


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


/*
// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";

const openai = new OpenAI({
		baseURL: 'https://api.deepseek.com',
		apiKey: '<DeepSeek API Key>'
});

async function main() {
  const completion = await openai.chat.completions.create({
	messages: [{ role: "system", content: "You are a helpful assistant." }],
	model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();
*/


async function translateText(text, targetLang, apiKey) {
	try {
		const openai = new OpenAI({
			baseURL: 'https://api.deepseek.com',
			apiKey: apiKey
		});
		const completion = await openai.chat.completions.create({
			messages: [{
				role: 'user',
				content: `将以下内容翻译为${targetLang}语言，保持markdown格式：\n${text}`
			}],
			model: 'deepseek-chat'
		});
		return completion.choices[0].message.content;
	} catch (error) {
		vscode.window.showErrorMessage('翻译失败: ' + error.message);
		return null;
	}
}

async function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "readme-translate" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('readme-translate.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from README-translate!');
	});

	const generateDisposable = vscode.commands.registerCommand('readme-translate.generateMultiLang', async (uri) => {
		const config = vscode.workspace.getConfiguration('readmeTranslate');
		const apiKey = config.get('apiKey');
		const targetLangs = config.get('targetLanguages');

		if (!apiKey) {
			vscode.window.showErrorMessage('请先配置DeepSeek API密钥');
			return;
		}

		try {
			const readmePath = uri.fsPath;
			const content = fs.readFileSync(readmePath, 'utf8');

			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "生成多语言README"
			}, async (progress) => {
				for (const lang of targetLangs) {
					progress.report({ message: `正在生成 ${lang} 版本...` });
					const translated = await translateText(content, lang, apiKey);
					if (translated) {
						const newPath = path.join(
							path.dirname(readmePath),
							`README_${lang}.md`
						);
						fs.writeFileSync(newPath, translated);
					}
				}
			});

			vscode.window.showInformationMessage(`成功生成${targetLangs.length}种语言版本`);
		} catch (error) {
			vscode.window.showErrorMessage('生成失败: ' + error.message);
		}
	});

	context.subscriptions.push(disposable, generateDisposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
