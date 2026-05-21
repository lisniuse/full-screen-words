import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private readonly config: ConfigService) {}

  async fetchWordInfo(word: string): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('未配置 OPENROUTER_API_KEY');
    }
    const model =
      this.config.get<string>('OPENROUTER_MODEL') ??
      'deepseek/deepseek-r1-distill-qwen-32b:free';

    const proxy = this.config.get<string>('HTTP_PROXY');
    const httpsAgent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    const prompt = `分析英语单词 "${word}" 并按以下 JSON 格式返回信息：
{
  "forms": {
    "base": {
      "value": "单词原形",
      "examples": [
        { "en": "英文例句1", "zh": "中文翻译1" },
        { "en": "英文例句2", "zh": "中文翻译2" }
      ]
    },
    "past":            { "value": "过去式（如果是动词）", "examples": [{ "en": "", "zh": "" }, { "en": "", "zh": "" }] },
    "pastParticiple":  { "value": "过去分词（如果是动词）", "examples": [{ "en": "", "zh": "" }, { "en": "", "zh": "" }] }
  }
}

注意：
1. 如果某个变形形式不存在，整个对象设为 null
2. 必须严格按照这个 JSON 格式返回
3. 只返回 JSON 字符串，不要包含其他说明文字
4. 每种形式都需要提供 2 个例句
5. 例句必须是完整的英文句子
6. 每个例句都必须提供准确的中文翻译`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          messages: [{ role: 'user', content: prompt }],
          model,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5321',
            'Content-Type': 'application/json',
          },
          httpsAgent,
          timeout: 60000,
        },
      );

      let content: string = response.data.choices?.[0]?.message?.content ?? '';
      content = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

      // 必须验证返回是合法 JSON 且结构包含 forms，否则不入库
      try {
        const parsed = JSON.parse(content);
        if (!parsed || typeof parsed !== 'object' || !parsed.forms) {
          throw new Error('返回缺少 forms 字段');
        }
      } catch (e: any) {
        this.logger.warn(
          `OpenRouter returned unparseable payload (word=${word}): ${e.message}`,
        );
        throw new BadGatewayException('词义返回格式错误，请重试');
      }

      return content;
    } catch (err: any) {
      if (err instanceof BadGatewayException) throw err;
      this.logger.error(`OpenRouter request failed: ${err.message}`);
      throw new InternalServerErrorException('词义请求失败');
    }
  }
}
