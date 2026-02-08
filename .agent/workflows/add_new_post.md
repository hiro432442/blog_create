---
description: Create and publish a new blog post
---

1. Create a new markdown file in the `posts/` directory.
   - Filename format: `your-topic-name.md`
2. Add the required YAML frontmatter at the top of the file:
   ```markdown
   ---
   title: 'Your Post Title'
   date: 'YYYY-MM-DD'
   ---
   ```
3. Write your blog post content below the frontmatter using Markdown.
4. (Optional) Run `npm run build` locally to verify that the post generates correctly.
5. Commit and push your changes to GitHub:
   ```powershell
   git add posts/your-topic-name.md
   git commit -m "Add new post: Your Post Title"
   git push origin main
   ```
6. The GitHub Action will automatically build and deploy your site.
