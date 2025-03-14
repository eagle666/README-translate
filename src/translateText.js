const OpenAI = require("openai").default;
const vscode = require('vscode');
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
}// 导出函数
module.exports = {
    translateText
};
