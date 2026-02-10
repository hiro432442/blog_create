---
title: '「なぜ本番だけで動かない？」Next.js Hydration Errorとの深夜の激闘記'
date: '2026-02-19'
category: 'Tech'
---

![Hydration Error Nightmare](/images/tech_hero.svg)

# はじめに：画面が「一瞬チカッとした」その後に

ローカル開発環境（`npm run dev`）では完璧でした。
UIは美しく、アニメーションは滑らかに動き、コンソールにはエラーひとつない。

「よし、デプロイだ」

Vercelにプッシュし、生成されたURLを開く。
サイトが表示される。完璧だ。
……と思った次の瞬間、**画面が一瞬「カッ」と点滅し、レイアウトが崩れ、コンソール真っ赤な血文字が溢れ出したのです。**

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
Warning: Expected server HTML to contain a matching <div> in <div>.
```

Next.js初心者が必ず通る道、「Hydration Error（ハイドレーション・エラー）」。
これは単なるバグではありません。**「サーバー（SSR）」という並行世界と、「ブラウザ（CSR）」という現実世界の整合性が取れなくなった時の、時空の歪み**なのです。

この記事では、この怪奇現象の正体と、それをねじ伏せるための泥臭い格闘の記録をお届けします。

---

![Hydration Mismatch Diagram](/images/hydration_mismatch.svg)

# 1. 怪奇現象の正体：ドッペルゲンガーの不一致

なぜこのエラーが起きるのか？
それを理解するには、Next.jsが何をしているかを知る必要があります。

1.  **Server (Node.js)**: Reactコンポーネントを実行し、HTML文字列を生成してブラウザに送る。（SSR）
2.  **Client (Browser)**: HTMLを表示した後、JSをダウンロードし、そのHTMLに「命（イベントハンドラ）」を吹き込む。（Hydration）

Hydrationとは、直訳すれば「水分補給」。
カピカピに乾いたHTML（サーバー生成）に、インタラクティブなJSの水を注ぎ込んで、Reactとして蘇らせる儀式です。

この儀式の際、Reactは厳格なチェックを行います。
**「サーバーで作ったHTMLと、今ブラウザで計算したDOMツリーは、完全に一致しているか？」**

もし1ミリでも違えばアウトです。
Reactは混乱し、「話が違う！」と叫んで、SSRされたHTMLを破棄してクライアント側で再レンダリングします（これが画面のチラつきの正体）。

---

# 2. よくある「犯人」たち

私が深夜のデバッグで見つけ出した、代表的な犯人たちを紹介します。

### Case 1: `window` is not defined
一番の初歩的な罠です。

```tsx
// ❌ ダメな例
const width = window.innerWidth; // サーバーには window なんてない！

export default function Header() {
  return <div>Width: {width}</div>;
}
```

サーバー（Node.js）には `window` オブジェクトがありません。ここで落ちます。
あるいは、ガード節を入れても……

```tsx
// ❌ 惜しい例
const width = typeof window !== 'undefined' ? window.innerWidth : 0;

export default function Header() {
  // サーバー: 0
  // クライアント: 1920
  // -> Mismatch!!!
  return <div>Width: {width}</div>;
}
```

サーバーとクライアントで変数の値が違うため、Mismatchになります。

**解決策**: `useEffect` でマウント後に値を取る。

```tsx
// ✅ 正解
const [width, setWidth] = useState(0);

useEffect(() => {
  setWidth(window.innerWidth);
}, []);
```

### Case 2: 時空の歪み（Timestamp）

```tsx
// ❌ 絶対にやってはいけない
export default function Clock() {
  return <div>Current Time: {new Date().toLocaleTimeString()}</div>;
}
```

サーバーでレンダリングした時刻（10:00:00）と、ブラウザでレンダリングした時刻（10:00:01）。
絶対に一致しません。ミリ秒単位でズレます。
**「レンダリング中に、不確定な値（現在時刻、乱数）を使ってはいけない」**。これは鉄則です。

### Case 3: ブラウザの余計なお世話 (HTML仕様違反)

```tsx
<p>
  <div>ここはブロック要素です</div>
</p>
```

HTMLの仕様上、`<p>` タグの中に `<div>` を入れることはできません。
サーバーはそのまま吐き出しますが、ブラウザは親切心で勝手にDOM構造を修正します（`<p>`を閉じてしまう）。
その結果、Reactが想定していたDOM構造と食い違い、Hydration Errorになります。

---

# 3. 解決策：泥臭く戦え

### 1. `useEffect` で逃げる
「サーバーとクライアントで値が違う」なら、**「サーバーでは何も表示しない」**のが一番安全です。

```tsx
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) return null; // サーバーでは虚無を返す

return <ComponentOnlyClientCanSee />;
```

### 2. `dynamic` import (ssr: false)
特定のコンポーネントだけSSRを無効化する、Next.jsの必殺技です。
重いチャートライブラリなど、クライアントでしか動かないものに有効です。

```tsx
import dynamic from 'next/dynamic';

const NoSSRComponent = dynamic(() => import('./Chart'), { 
  ssr: false,
  loading: () => <p>Loading...</p> // スケルトンを表示
});
```

### 3. 禁断の `suppressHydrationWarning`
「タイムスタンプがズレるのはわかってる。頼むから黙っててくれ」。
Reactにそう懇願する属性です。

```tsx
<div suppressHydrationWarning>
  {new Date().toLocaleTimeString()}
</div>
```

これは最終手段です。多用すると、本当に重大な不整合を見逃すことになります。

---

![Hydration Timeline](/images/hydration_timeline.svg)

# 結論：Hydration Errorは「先生」である

エラーと格闘して朝を迎えたとき、私は気づきました。
Hydration Errorは、私をいじめているのではありません。
**「Web標準（HTML構造）を守れ」**
**「副作用（Side Effect）と純粋関数（Pure Function）を区別しろ」**
そう教えてくれる、厳しくも正しい先生だったのです。

このエラーが出なくなるとき、あなたは真に「Reactのライフサイクル」を理解したと言えます。
さあ、コンソールを開いてください。
赤文字と向き合いましょう。それが、Webエンジニアの業（カルマ）なのですから。
