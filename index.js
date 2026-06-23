#!/usr/bin/env node
"use strict";

// ─── openmodelmap CLI ───────────────────────────────────────────
// Query the OpenModelMap OMS API from the terminal.
//
// Usage:
//   npx openmodelmap <model-name>       quick search
//   npx openmodelmap recommend          interactive constraint-based recommendation
//   npx openmodelmap qwen3
//   npx openmodelmap deepseek
//
// Docs: https://openmodelmap.com
// Repo: https://github.com/duola15/openmodelmap-cli
// ────────────────────────────────────────────────────────────────

const API_BASE = process.env.OPENMODELMAP_API || "https://openmodelmap.com";

const GRADE_COLORS = {
  S: "\x1b[38;5;135m",
  A: "\x1b[34m",
  B: "\x1b[36m",
  C: "\x1b[33m",
  D: "\x1b[90m",
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";

function c(tag, text) {
  const codes = { bold: BOLD, dim: DIM, green: GREEN, yellow: YELLOW, reset: RESET };
  return (codes[tag] || "") + text + RESET;
}

function gradeColor(grade) {
  return (GRADE_COLORS[grade] || "") + BOLD + grade + RESET;
}

function apiGet(path) {
  const url = API_BASE + path;
  const proto = url.startsWith("https") ? require("https") : require("http");
  return new Promise((resolve, reject) => {
    proto
      .get(url, { headers: { Accept: "application/json", "User-Agent": "openmodelmap-cli/1.0" }, timeout: 10000 }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            reject(new Error(`Invalid response (HTTP ${res.statusCode})`));
          }
        });
      })
      .on("error", reject)
      .on("timeout", function () {
        this.destroy();
        reject(new Error("Request timed out"));
      });
  });
}

function displayResult(model, i) {
  const score = model.oms_score != null ? `${model.oms_score}/100` : "N/A";
  const grade = model.oms_grade ? ` ${gradeColor(model.oms_grade)}级` : "";

  console.log("");
  console.log(
    `  ${c("bold", `#${model.rank || i + 1}`)}  ${c("bold", model.name)}  ${c("dim", (model.org || "") + " · " + (model.task || ""))}`
  );
  if (model.model_size || model.vram) {
    const parts = [];
    if (model.model_size) parts.push(model.model_size);
    if (model.vram && model.vram !== "N/A") parts.push(`VRAM ${model.vram}`);
    console.log(`      ${c("dim", parts.join("  ∣  "))}`);
  }
  console.log("");
  console.log(`  OMS ${c("bold", score)}${grade}`);
  if (model.best_for && model.best_for.length) {
    console.log(`  ${c("dim", "擅长:")}  ${model.best_for.join(" · ")}`);
  }
  if (model.deploy) {
    console.log(`  ${c("dim", "部署:")}  ${model.deploy}`);
  }
  console.log(`  ${c("dim", model.url)}`);
}

// ─── Quick search mode ─────────────────────────────────────────

async function searchMode(query) {
  console.log(`\n  ${c("dim", '🔍 搜索 "' + query + '" ...')}`);

  const { body: data } = await apiGet(`/api/search?q=${encodeURIComponent(query)}&limit=5`);

  if (!data.models || data.models.length === 0) {
    console.log(`\n  ${c("dim", '未找到匹配 "' + query + '" 的模型')}`);
    console.log(`  试试其他关键词，或访问 https://openmodelmap.com\n`);
    process.exit(1);
  }

  console.log(`  ${c("dim", "找到 " + data.models.length + " 个结果")}`);
  for (let i = 0; i < data.models.length; i++) {
    displayResult(data.models[i], i);
  }

  console.log("");
  console.log(`  ${c("dim", "──")}`);
  console.log(`  ${c("dim", "完整对比 & 一键部署 → https://openmodelmap.com")}`);
  console.log("");
}

// ─── Interactive recommend mode ─────────────────────────────────

const TASK_CHOICES = [
  { key: "coding", label: "编程 / Coding" },
  { key: "chat", label: "对话 / Chat" },
  { key: "translation", label: "翻译 / Translation" },
  { key: "image", label: "图片生成 / Image Generation" },
  { key: "multimodal", label: "多模态 / Multimodal" },
  { key: "speech", label: "语音 / Speech" },
  { key: "embedding", label: "嵌入 / Embedding" },
];

const GPU_CHOICES = [
  { key: "4", label: "RTX 3050 / GTX 1660 (4-6 GB)" },
  { key: "8", label: "RTX 4060 / RTX 3070 (8 GB)" },
  { key: "12", label: "RTX 4070 / RTX 3060 (12 GB)" },
  { key: "16", label: "RTX 4080 / RTX 5080 (16 GB)" },
  { key: "24", label: "RTX 4090 / RTX 3090 (24 GB)" },
  { key: "48", label: "A6000 / L40 (48 GB)" },
  { key: "80", label: "A100 / H100 (80 GB)" },
  { key: "0", label: "不限 / No limit" },
];

function ask(question, choices) {
  return new Promise((resolve) => {
    const readline = require("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("");
    console.log(`  ${c("bold", question)}`);
    choices.forEach((ch, i) => {
      console.log(`  ${c("dim", `[${i + 1}]`)} ${ch.label}`);
    });
    console.log("");

    rl.question(`  ${c("green", "> ")}`, (answer) => {
      rl.close();
      const idx = parseInt(answer.trim()) - 1;
      if (idx >= 0 && idx < choices.length) {
        resolve(choices[idx]);
      } else if (answer.trim().toLowerCase() === "q" || answer.trim() === "") {
        resolve(null);
      } else {
        console.log(`  ${c("yellow", "无效选择，请输入数字")}`);
        resolve(ask(question, choices));
      }
    });
  });
}

async function recommendMode() {
  console.log("");
  console.log(`  ${c("bold", "OpenModelMap 模型推荐")}`);
  console.log(`  ${c("dim", "回答 2 个问题，帮你找到最合适的模型")}`);
  console.log("");
  console.log(`  ${c("dim", "按 Enter 或输入 q 跳过问题 / 退出")}`);

  // Step 1: Task
  const taskChoice = await ask("想做什么任务？", TASK_CHOICES);
  if (!taskChoice) {
    console.log(`\n  ${c("dim", "已取消。访问 https://openmodelmap.com 浏览全部模型")}\n`);
    process.exit(0);
  }
  console.log(`  ${c("green", "✓")} ${taskChoice.label}`);

  // Step 2: GPU
  const gpuChoice = await ask("用什么显卡？", GPU_CHOICES);
  if (!gpuChoice) {
    console.log(`\n  ${c("dim", "已取消。访问 https://openmodelmap.com 浏览全部模型")}\n`);
    process.exit(0);
  }
  console.log(`  ${c("green", "✓")} ${gpuChoice.label}`);

  // Build query
  const params = new URLSearchParams();
  params.set("task", taskChoice.key);
  if (gpuChoice.key !== "0") params.set("gpu_memory", gpuChoice.key);
  params.set("language", "zh");
  params.set("limit", "5");

  console.log(`\n  ${c("dim", "⏳ 正在匹配最佳模型 ...")}`);

  try {
    const { body: data } = await apiGet(`/api/recommend?${params.toString()}`);

    if (!data.models || data.models.length === 0) {
      console.log(`\n  ${c("yellow", "未找到完全匹配的模型")}`);
      if (data.query.gpu_memory) {
        console.log(`  ${c("dim", "提示: 尝试更大显存的显卡，或选择「不限」")}`);
      }
      console.log(`  ${c("dim", "直接浏览: https://openmodelmap.com")}\n`);
      process.exit(1);
    }

    console.log(`\n  ${c("bold", "━━━ 推荐结果 ━━━")}`);
    if (data.applicable > data.returned) {
      console.log(`  ${c("dim", `共 ${data.applicable} 个适用，显示 Top ${data.returned}`)}`);
    }

    for (const m of data.models) {
      displayResult(m, m.rank - 1);
    }

    console.log("");
    console.log(`  ${c("dim", "──")}`);
    console.log(`  ${c("dim", "详细对比 & 一键部署 → https://openmodelmap.com")}`);
    console.log(`  ${c("dim", "Badge 嵌入 → https://openmodelmap.com/oms/badges")}`);
    console.log("");
  } catch (err) {
    console.error(`\n  ❌ ${err.message}\n`);
    process.exit(1);
  }
}

// ─── Help ──────────────────────────────────────────────────────

function showHelp() {
  console.log("");
  console.log(`  ${c("bold", "openmodelmap")} — 开源 AI 模型决策命令行`);
  console.log("");
  console.log(`  ${c("bold", "用法:")}`);
  console.log("    npx openmodelmap <模型名>        快速搜索");
  console.log("    npx openmodelmap recommend        交互式推荐");
  console.log("");
  console.log(`  ${c("bold", "示例:")}`);
  console.log("    npx openmodelmap qwen3");
  console.log("    npx openmodelmap deepseek");
  console.log("    npx openmodelmap recommend");
  console.log("");
  console.log(`  ${c("bold", "推荐模式:")}`);
  console.log("    选择任务类型 + 显卡 → 自动匹配最佳模型");
  console.log("");
  console.log(`  ${c("bold", "环境变量:")}`);
  console.log("    OPENMODELMAP_API  自定义 API 地址");
  console.log("");
  console.log(`  ${c("dim", "npm: npmjs.com/package/openmodelmap")}`);
  console.log(`  ${c("dim", "GitHub: github.com/duola15/openmodelmap-cli")}`);
  console.log("");
}

function showDefault() {
  console.log("");
  console.log(`  ${c("bold", "openmodelmap")} — 开源 AI 模型决策命令行`);
  console.log("");
  console.log(`  ${c("bold", "用法:")}`);
  console.log("    npx openmodelmap <模型名>        快速搜索 OMS 评分");
  console.log("    npx openmodelmap recommend        交互式推荐");
  console.log("");
  console.log(`  ${c("bold", "快速开始:")}`);
  console.log("    npx openmodelmap qwen3");
  console.log("    npx openmodelmap recommend");
  console.log("");
  console.log(`  ${c("dim", "数据来源: openmodelmap.com  |  GitHub: openmodelmap/cli")}`);
  console.log("");
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  const query = process.argv[2];

  if (!query || query === "--help" || query === "-h") {
    if (query === "--help" || query === "-h") showHelp();
    else showDefault();
    process.exit(0);
  }

  _omm_track(query || "help");
  if (query === "recommend") {
    _omm_track("recommend"); return recommendMode();
  }

  // Quick search mode
  try {
    await searchMode(query);
  } catch (err) {
    console.error(`\n  ❌ 请求失败: ${err.message}`);
    console.error(`  ${c("dim", "请确认网络连接正常，或直接访问 https://openmodelmap.com")}\n`);
    process.exit(1);
  }
}

main();

function _omm_track(cmd) { try { require("https").get("https://openmodelmap.com/api/track?event=cli_"+encodeURIComponent(cmd),{timeout:2000},()=>{}).on("error",()=>{}); } catch(_) {} }
