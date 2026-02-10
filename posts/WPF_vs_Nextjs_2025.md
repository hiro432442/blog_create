---
title: 'WPF vs Web (Next.js): デスクトップアプリエンジニアが感じる「違和感」と「感動」'
date: '2026-02-15'
category: 'Tech'
---

![WPF vs Next.js Concept](/images/wpf_next_hero.svg)

# はじめに：XAMLの温もりを捨てて、荒野へ

あなたはVisual Studioの「デバッグ開始」ボタンを押したときの安心感を知っていますか？
型安全なC#の世界、強力なIntelliSense、そして何より**「そこにあり続ける」ステート（状態）**。
WPFやWindows Formsで育った私たちにとって、デスクトップアプリ開発は「箱庭」のような心地よさがありました。

しかし2026年、世界はWeb一色です。「Next.js」「React」「Vercel」……。
意を決してその世界に飛び込んだとき、最初に感じるのは**「違和感」**ではないでしょうか？

「なぜ変数が勝手に初期化されるんだ？」
「データバインディングはどこに行った？」
「HTMLとCSS、弱すぎないか？」

この記事では、元WPFガチ勢のエンジニアが、Next.js（React）の世界に来て感じた「メンタルモデルの断絶」と、その先にある「感動」について語ります。

---

![State Management Difference](/images/wpf_next_state.svg)

# 1. ステートの寿命：「彫刻」と「パラパラ漫画」

WPFエンジニアがWeb（特にReact）で最も躓くのが、**「ステート（状態）の生存期間」**です。

### WPF: 彫刻（Stateful）
WPFのViewModelは、一度インスタンス化されれば、ウィンドウが閉じるまでそこに「生きて」います。
クラスのメンバ変数 `private int _count;` は、あなたが書き換えるまで永遠にその値を保持します。

```csharp
// WPF ViewModel
public class CounterViewModel : INotifyPropertyChanged {
    private int _count = 0; // ずっとここにいる
    public int Count { get { ... } set { ... } }
}
```

### React: パラパラ漫画（Stateless/Snapshot）
対してReactのコンポーネントは、**「関数」**です。
画面描画のたびに呼び出され、実行され、そして**即座に死にます**。

```tsx
// React Component
export default function Counter() {
    // この関数はレンダリングのたびに "ゼロから" 実行される
    const [count, setCount] = useState(0); 
    // useStateという "フック" だけが、時間の壁を超えて値を記憶している
    ...
}
```

最初はこれが恐怖でした。「毎回死ぬ？ そんな効率の悪いことしていいのか？」と。
しかし、これこそがWebの強さなのです。
**「ある瞬間のUIは、ある瞬間のStateのみによって決定される」**（UI = f(State)）。
WPFのように「あれ、この変数いつの間にか書き換わったけど、画面更新イベント発火したっけ？」というバグから解放されるのです。

---

![Data Binding Flow](/images/wpf_next_flow.svg)

# 2. データバインディング：「魔法」と「儀式」

### WPF: 双方向バインディングの甘い罠
WPFのXAMLにおける `{Binding Path=Name, Mode=TwoWay}` は魔法でした。
TextBox書き換えるだけで、ViewModelの値も変わる。最高に楽です。しかし、アプリが複雑になると「誰がいつデータを変えたのか」が追えなくなります。

### React: 単方向データフローの規律
Reactには双方向バインディングはありません（基本的には）。
値は上から下へ（Props）、変更要求は下から上へ（Event）。

```tsx
<input 
  value={text}            // 表示するのは親から来た値
  onChange={(e) => setText(e.target.value)} // 変えてくれと頼むだけ
/>
```

最初は「めんどくさい！」と感じました。いちいちイベントハンドラを書くのかと。
しかし、これは**「データの流れを可視化する儀式」**なのです。
コードを見れば、データの出入りが100%追える。ReduxやZustandなどのステート管理ライブラリを使っても、この原則は変わりません。
デバッグのしやすさは、魔法のないWebの方に軍配が上がります。

---

# 3. サーバーとの距離：「遠距離恋愛」から「同棲」へ

かつてのWeb開発（SPA）では、フロントエンドからバックエンドAPIを叩くのは「非同期通信」という名の遠距離恋愛でした。
`useEffect` で `fetch` して、ローディング状態を管理して、エラーハンドリングして……。WPFで `db.Users.ToList()` と書いていた頃が懐かしい。

しかし、**Next.js (App Router)** はその距離を一気に詰めました。**Server Components** の登場です。

```tsx
// app/users/page.tsx (Server Component)
import { db } from '@/lib/db';

export default async function UsersPage() {
    // フロントエンドのファイルなのに、DBに直結できる！
    const users = await db.user.findMany();

    return (
        <ul>
            {users.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    );
}
```

見てください、このコード。まるでWPFのコードビハインドでDBを叩いているかのようではありませんか？
**「サーバー側でHTMLを作ってからブラウザに送る」**。
これは、古き良きWebへの回帰でありつつ、デスクトップアプリエンジニアが最も直感的に理解できるモデルです。
非同期処理 (`async/await`) さえ理解していれば、WPFエンジニアはNext.jsで最強になれるポテンシャルを持っています。

---

# 4. 私たちが持ち込める武器

Webの世界に来て、WPFの知識は無駄になったでしょうか？
いいえ、全く逆です。

1.  **型への執着 (TypeScript)**:
    JavaScriptの「なんでもあり」な世界に、私たちが愛したC#のような秩序（型）をもたらすTypeScript。WPFエンジニアなら息をするように書けるはずです。
2.  **MVVMのメンタルモデル**:
    Reactの `Custom Hook` は、実質 `ViewModel` です。
    「ロジック」と「ビュー」を分離する嗅覚は、コンポーネント設計において強力な武器になります。
3.  **非同期処理の勘所**:
    C#の `Task` / `async` / `await` で苦しんだ経験は、そのままJSの `Promise` に生きます。

# 結論：違和感を楽しもう

WPFからNext.jsへの移行は、**「ステートフル（永続）」から「ステートレス（瞬間）」への哲学の転換**です。
最初は戸惑いますが、その「不自由さ」の中にこそ、Web特有の「スケーラビリティ」と「予測可能性」があることに気づくはずです。

恐れることはありません。
文法が違うだけで、私たちが積み上げてきた「エンジニアリングの筋肉」は、Webの世界でも確実に通用します。

さあ、`npm run dev` を叩きましょう。
そこには、Visual Studioの起動を待つ時間よりも速く立ち上がる、新しい世界が待っています。
