const OpenAI = require("openai").default;
const vscode = require('vscode');

async function detectReadmeLang(content, apiKey) {
    try {
        const openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: apiKey
        });
        const completion = await openai.chat.completions.create({
            messages: [{
                role: 'user',
                // content: `将以下内容翻译为${targetLang}语言，保持markdown格式：\n${text}`
                // content: `将该内容翻译成${targetLang}语言，其他格式等都保持一致不变：\n${text}`
                content: `你是一个语言检测机器人，判断该文档使用的最主要语言（仅输出小写的en/zh/ko/ja/es/fr/de/ru/other，不要带引号或空格）。英文返回'en'，中文返回'zh'，韩文返回'ko'，日文返回'ja'，西班牙文返回'es'，法文返回'fr'，德文返回'de'，俄文返回'ru'，其他语言返回'other'。文档片段：\n${content.substring(0, 300)}`
            }],
            model: 'deepseek-chat'
        });
        return completion.choices[0].message.content.toLowerCase().trim();
        console.log('检测到原始语言代码:', completion.choices[0].message.content);
    } catch (error) {
        vscode.window.showErrorMessage('README语言检测失败: ' + error.message);
        return null;
    }
}

module.exports = { detectReadmeLang };