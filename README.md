# openmodelmap

> CLI for [OpenModelMap](https://openmodelmap.com) — the Chinese open-source AI model decision standard.

Query OMS scores, best use-cases, and deploy commands for any open-source AI model directly from your terminal.

## Quick Start

```bash
# Quick search
npx openmodelmap qwen3

# Interactive recommendation
npx openmodelmap recommend
```

### Search Mode

```
🔍 搜索 "qwen3" ...

  Qwen3 32B
  Qwen · 文本生成

  OMS 66.1/100 B级
  擅长: 综合能力 · 中文 · 编程
  部署: ollama run qwen3
  https://openmodelmap.com/model/Qwen/Qwen3-32B
```

### Recommend Mode (Interactive)

```bash
npx openmodelmap recommend
```

```
想做什么任务？
[1] 编程 / Coding
[2] 对话 / Chat
[3] 翻译 / Translation
...

用什么显卡？
[1] RTX 4060 / RTX 3070 (8 GB)
[2] RTX 4070 / RTX 3060 (12 GB)
[3] RTX 4090 / RTX 3090 (24 GB)
...

━━━ 推荐结果 ━━━

#1  Qwen3 32B
    OMS 66.1/100 B级
    擅长: 综合能力 · 中文 · 编程
    部署: Ollama
```

## What is OMS?

**OMS (OpenModelMap Score)** is a 5-dimension, 100-point scoring system for open-source AI models:

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| 综合能力 (Comprehensive) | 30% | MMLU / C-Eval / MMLU-Pro |
| 编程能力 (Coding) | 20% | HumanEval |
| 中文能力 (Chinese) | 20% | C-Eval + language support |
| 部署友好 (Deployment) | 15% | GPU memory requirements |
| 许可友好 (License) | 15% | Open-source license tier |

See the full [OMS Methodology 1.0](https://openmodelmap.com/oms/methodology) whitepaper.

## Usage

```bash
# Quick search by model name
npx openmodelmap deepseek

# Interactive recommendation
npx openmodelmap recommend

# Search by organization
npx openmodelmap meta-llama

# Get help
npx openmodelmap --help
```

## APIs Used

This CLI queries two OpenModelMap APIs:

| API | Endpoint | Used by |
|-----|----------|---------|
| Search | `/api/search?q=...` | `npx openmodelmap <name>` |
| Recommend | `/api/recommend?task=...&gpu_memory=...&language=zh` | `npx openmodelmap recommend` |

Both are CORS-enabled, cached, and free to use.

## Features

- **Zero dependencies** — single-file Node.js script, no install needed
- **OMS评分** — 5-dimension scoring at a glance
- **Best-for tags** — what each model excels at
- **Deploy commands** — copy-paste ready `ollama` / `vllm` / `docker` commands
- **Direct links** — jump to full comparison pages

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENMODELMAP_API` | `https://openmodelmap.com` | Custom API endpoint |

## API

This CLI uses the [OpenModelMap Search API](https://openmodelmap.com/api/search?q=qwen3):

```bash
curl "https://openmodelmap.com/api/search?q=qwen3&limit=5"
```

Other APIs:

- [OMS v1 Model API](https://openmodelmap.com/api/oms/v1/model/qwen/qwen3) — full OMS data for a single model
- [OMS v1 Top API](https://openmodelmap.com/api/oms/v1/top?limit=20) — ranked model list
- [OMS Badge API](https://openmodelmap.com/api/oms/badge/qwen/qwen3) — SVG badge for embedding

Full API docs: [openmodelmap.com/oms/api](https://openmodelmap.com/oms/api)

## Install Globally

```bash
npm install -g openmodelmap
openmodelmap qwen3
```

## Support

- Website: [openmodelmap.com](https://openmodelmap.com)
- GitHub: [duola15/openmodelmap-cli](https://github.com/duola15/openmodelmap-cli)

## License

MIT
