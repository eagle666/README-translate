const { detectReadmeLang } = require('../src/detectReadmeLang');
const assert = require('assert');
const sinon = require('sinon');

const READMEString = "**English** | [中文](README_zh.md)\n\n# README Translation Plugin Usage Guide\n\n## Right-click Operation\n1. Right-click on `README.md`  \n2. Select **\"Generate Multilingual README\"**\n3. Wait approximately 8-9 seconds  \n4. Choose target language from the pop-up list  \n\n## API Key Configuration (Completed)\n### Package Configuration Update\n- Modified `package.json` declarations to enable API authentication\n\n### User Configuration Path\n1. Press <kbd>F1</kbd> to open command palette  \n2. Type: `Preferences: Open Settings (UI)`\n3. Search settings for: `README Translate`  \n4. Input your DeepSeek API Key in the designated field  \n5. **Save Settings** to activate translation capabilities\n\n---\n\n**Contribution Welcome**  \nWe welcome community improvements through:  ";



console.log(READMEString);

// describe('语言检测测试', () => {
//     afterEach(() => {
//         sinon.restore();
//     });

//     it('应正确识别英文内容', async () => {
//         const stub = sinon.stub().resolves({ choices: [{ message: { content: 'en' } }] });
//         sinon.stub(require('openai').default.prototype.chat.completions, 'create').callsFake(stub);

//         const result = await detectReadmeLang('# English Title\nThis is sample content', 'test-key');
//         assert.strictEqual(result, 'en');
//     });

//     it('应正确识别中文内容', async () => {
//         const stub = sinon.stub().resolves({ choices: [{ message: { content: 'zh' } }] });
//         sinon.stub(require('openai').default.prototype.chat.completions, 'create').callsFake(stub);

//         const result = await detectReadmeLang('## 中文标题\n这是示例内容', 'test-key');
//         assert.strictEqual(result, 'zh');
//     });

//     it('应处理API异常', async () => {
//         sinon.stub(require('openai').default.prototype.chat.completions, 'create').rejects(new Error('API错误'));

//         const result = await detectReadmeLang('test content', 'invalid-key');
//         assert.strictEqual(result, null);
//     });
// });