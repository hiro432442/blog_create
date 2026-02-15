---
title: "Embedding the Brain: Building a 'Local Copilot' for your WPF App"
date: "2026-02-19"
excerpt: "Your users expect an 'Ask AI' button. Learn how to embed a local LLM (Phi-4/Llama-3) directly into your legacy WPF application using semantic kernel, ONNX Runtime, and WebView2 for the chat UI."
coverImage: "/images/posts/wpf_local_ai.svg"
category: "AI Engineering"
---

## The "Ask AI" Requirement

It's 2026. Every application, from Notepad to Photoshop, has an "Ask Copilot" button.
Your legacy enterprise WPF app, built in 2012 to manage warehouse inventory, is next on the list.
The CEO wants it. But there's a catch: **"No data can leave the company network."**

So, OpenAI API is out. Azure OpenAI is out.
You need **Local AI**.

## The Stack: WPF + WebView2 + ONNX

To build a modern AI assistant inside a WPF app, we use a hybrid stack:

1.  **WPF**: The host process and existing business logic.
2.  **Microsoft.Extensions.AI**: The unified abstraction layer for AI services.
3.  **ONNX Runtime GenAI**: To run optimized models (like Phi-4-mini) on the user's NPU/GPU.
4.  **WebView2**: To render the rich chat interface (Markdown support, code highlighting).

## Step 1: The Model (ONNX)

First, we grab a quantized model.
`Phi-4-mini-int4-onnx` is perfect. It's 2GB, runs on a modern laptop CPU/NPU, and is smart enough for "Summarize this log" or "Find the error in this invoice."

```csharp
// Infrastructure/AiService.cs
using Microsoft.ML.OnnxRuntimeGenAI;

public class LocalAiService
{
    private Model _model;
    private Tokenizer _tokenizer;

    public void LoadModel(string modelPath)
    {
        // Zero network calls. Pure local loading.
        _model = new Model(modelPath);
        _tokenizer = new Tokenizer(_model);
    }

    public async IAsyncEnumerable<string> StreamResponse(string prompt)
    {
        // System prompt injection for context
        var fullPrompt = $"<|system|>You are a helpful assistant for the Warehouse App.<|end|>\n<|user|>{prompt}<|end|>\n<|assistant|>";
        
        // Streaming generation logic...
        yield return token;
    }
}
```

## Step 2: The UI (WebView2)

Don't try to build a chat bubble UI in XAML. It's painful.
Use HTML/CSS/JS via **WebView2**.

Host a local `chat.html` file that uses a simple Markdown renderer (like `marked.js`).
Use `WebView2`'s messaging bridge to send prompts from JS to C#, and stream tokens back from C# to JS.

```csharp
// Views/ChatWindow.xaml.cs
private async void OnWebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
{
    var userPrompt = e.TryGetWebMessageAsString();
    
    await foreach (var token in _aiService.StreamResponse(userPrompt))
    {
        // Stream text back to JS function 'appendToken'
        await webView.CoreWebView2.ExecuteScriptAsync($"appendToken('{HttpUtility.JavaScriptStringEncode(token)}')");
    }
}
```

## Step 3: Semantic Kernel (Function Calling)

This is where it gets useful. You don't just want a chatbot; you want an *Agent*.
We use **Semantic Kernel** to expose your internal WPF methods to the AI.

```csharp
[KernelFunction, Description("Searches the inventory database for a product ID.")]
public string SearchInventory(string productId)
{
    return _inventoryService.GetStock(productId).ToString();
}
```

Now, when the user asks "How many widgets do we have?", the local LLM decides to call `SearchInventory`, gets the JSON result, and generates a natural language answer. **All on-device.**

## Conclusion

You don't need to rewrite your 15-year-old WPF app to make it modern.
By embedding a local "Brain" (ONNX) and a modern "Face" (WebView2), you can give your legacy application a new lease on life.

The future of Desktop is Local AI. And it's ready today.
