# openmodelmap

> CLI for [OpenModelMap](https://openmodelmap.com) — the Chinese open-source AI model discovery engine.

Find the right model for your hardware. Compare benchmarks. Get deploy commands. All from your terminal.

## Quick Start

```bash
npx openmodelmap qwen3        # Search
npx openmodelmap recommend     # Interactive: task + GPU → best model
```

---

## What You Get

```
npx openmodelmap deepseek

🔍 "deepseek" ...

  DeepSeek-V3.2
  DeepSeek · text-generation

  MMLU 90.5 · HumanEval 94.2 · C-Eval 92.0
  Deploy: ollama run deepseek-v3
  → https://openmodelmap.com/model/deepseek-ai/DeepSeek-V3.2
```

---

## Discover Models

| Resource | URL |
|----------|-----|
| 🏆 Rankings | https://openmodelmap.com/rankings |
| 🆕 Latest Models | https://openmodelmap.com/latest |
| 🖥️ Hardware Matching | https://openmodelmap.com/hardware |
| 📋 Model Directory | https://openmodelmap.com |

---

## Install

```bash
npm install -g openmodelmap
```

## Features

- Zero dependencies, single-file Node.js
- MMLU / HumanEval / C-Eval benchmarks
- Hardware VRAM matching
- Ollama / vLLM / Docker deploy commands
- OMS 5-dimension scoring

## APIs

| API | Endpoint |
|-----|----------|
| Search | /api/search?q=... |
| Recommend | /api/recommend?task=...&gpu_memory=... |
| OMS Model | /api/oms/v1/model/:org/:name |
| OMS Top | /api/oms/v1/top?limit=20 |

Full docs: https://openmodelmap.com/oms/api

## License

MIT · https://openmodelmap.com
