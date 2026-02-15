---
title: "Command Line Commander: Google CLIで構築する軽量マルチエージェント環境"
date: "2026-02-23"
excerpt: "重厚なPythonフレームワークはもう要らない。Unix哲学に従い、gcloud CLI、jq、およびShell Scriptを組み合わせて、ターミナル上で動作する軽量かつ強力なAIエージェントチームを構築する方法。"
coverImage: "/images/posts/google_cli_agent.svg"
category: "DevOps Logic"
---

## GUIから「黒い画面」への回帰

2024年、私たちはブラウザ上のチャットボットに熱狂しました。
しかし2026年の今、エンジニアは気づき始めています。「ブラウザのタブを行き来するのは効率が悪い」と。

私たちの主戦場はターミナルです。
`git` でコミットし、`kubectl` でデプロイし、`vim` で設定ファイルを弄る。
なぜAIだけが、そこから切り離されているのでしょうか？

## Google CLI as an Agent Interface

GoogleのVertex AI CLI (`gcloud ai`) や Gemini CLI は、単なるAPIラッパーではありません。
これらは **Standard Streams (標準入出力)** をサポートしています。

つまり、Unix哲学の「フィルター」としてAIを扱えるのです。

```bash
# Unix Philosophy with AI
cat server.log | agent-analyzer | agent-fixer | kubectl apply -f -
```

これが、2026年の「Antigravity」なアプローチです。
Pythonの依存関係地獄 (`pip install ...`) は必要ありません。必要なのはシェルだけです。

## 実践：Reviewer & Fixer パイプライン

具体的な例を見てみましょう。
「gitの差分を見て、レビューし、修正パッチを作る」というマルチエージェントワークフローを、わずか数行のシェルスクリプトで実装します。

### Agent 1: The Reviewer

まず、コードの差分を受け取り、問題点をJSONで出力するエージェントです。

```bash
#!/bin/bash
# reviewer.sh

# プロンプトの構築
PROMPT="あなたはシニアエンジニアです。以下のgit diffを見て、重大なバグがあれば指摘してください。JSON形式で出力すること。"

# gcloudコマンドでGeminiを呼び出す
gcloud ai predict --model=gemini-1.5-pro \
  --prompt="$PROMPT $(cat)" \
  | jq -r '.predictions[0]'
```

### Agent 2: The Coder

次に、Reviewerの指摘（JSON）と元のコードを受け取り、修正パッチを作るエージェントです。

```bash
#!/bin/bash
# coder.sh

INPUT=$(cat) # Reviewerからの入力を受け取る

gcloud ai predict --model=gemini-1.5-pro \
  --prompt="以下のレビュー指摘に基づいて、修正パッチ(git apply用)を作成してください。\n$INPUT" \
  | jq -r '.predictions[0]'
```

### パイプラインの結合

これらをパイプで繋ぐだけで、立派なマルチエージェントシステムが完成します。

```bash
git diff | ./reviewer.sh | ./coder.sh > fix.patch
```

## 拡張：Human-in-the-loop

もちろん、AIが勝手にパッチを適用するのは危険です。
間に `gum` などのCLIツールを挟むことで、人間による承認フローを組み込めます。

```bash
git diff | ./reviewer.sh | ./coder.sh > fix.patch

# パッチの内容をプレビュー
cat fix.patch | bat --language=diff

# ユーザーに確認
if gum confirm "Apply this patch?"; then
  git apply fix.patch
  echo "Patch applied!"
else
  echo "Aborted."
fi
```

## 結論

AIエージェントを作るのに、複雑なLangChainやAutoGenは必ずしも必要ありません。
Unix哲学――「1つのプログラムは1つのことをうまくやる」「テキストストリームで協調する」――に従えば、あなたのターミナル自体が最強のエージェント実行環境になるのです。

黒い画面の中で、AIを指揮しましょう。
