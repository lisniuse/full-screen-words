import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as randomWords from 'random-words';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DATA_DIR = path.join(process.cwd(), '..', 'data');

console.log('OPENROUTER_API_KEY', OPENROUTER_API_KEY);

// 配置代理
const proxy = process.env.HTTP_PROXY || 'http://127.0.0.1:7890';
const httpsAgent = new HttpsProxyAgent(proxy);

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.post('/api/word-info', async (req, res) => {
  const { word } = req.body;
  
  // 参数校验
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: '无效的单词参数' });
  }

  // 验证是否是 random-words 包中的单词
  const wordList = randomWords.wordList;
  if (!wordList.includes(word)) {
    return res.status(400).json({ error: '不支持的单词' });
  }

  const wordFilePath = path.join(DATA_DIR, `${word}.json`);
  
  try {
    if (fs.existsSync(wordFilePath)) {
      const cachedData = fs.readFileSync(wordFilePath, 'utf8');
      return res.json(cachedData);
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        messages: [{
          role: 'user',
          content: `分析英语单词 "${word}" 并按以下 JSON 格式返回信息：
          {
            "forms": {
              "base": {
                "value": "单词原形",
                "examples": [
                  {
                    "en": "英文例句1",
                    "zh": "中文翻译1"
                  },
                  {
                    "en": "英文例句2",
                    "zh": "中文翻译2"
                  }
                ]
              },
              "past": {
                "value": "过去式（如果是动词）",
                "examples": [
                  {
                    "en": "过去式英文例句1",
                    "zh": "过去式中文翻译1"
                  },
                  {
                    "en": "过去式英文例句2",
                    "zh": "过去式中文翻译2"
                  }
                ]
              },
              "pastParticiple": {
                "value": "过去分词（如果是动词）",
                "examples": [
                  {
                    "en": "过去分词英文例句1",
                    "zh": "过去分词中文翻译1"
                  },
                  {
                    "en": "过去分词英文例句2",
                    "zh": "过去分词中文翻译2"
                  }
                ]
              }
            }
          }
          
          注意：
          1. 如果某个变形形式不存在，整个对象设为 null
          2. 必须严格按照这个 JSON 格式返回
          3. 只返回 JSON 字符串，不要包含其他说明文字
          4. 每种形式都需要提供 2 个例句
          5. 例句必须是完整的英文句子
          6. 每个例句都必须提供准确的中文翻译`
        }],
        model: 'deepseek/deepseek-r1-distill-qwen-32b:free',
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    let wordInfo = response.data.choices[0].message.content;
    
    // 处理返回内容中的 Markdown 代码块标记
    wordInfo = wordInfo.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    fs.writeFileSync(wordFilePath, wordInfo);
    res.json(wordInfo);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});