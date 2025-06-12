# chad-chat

Welcome to **chad-chat** — your digital laboratory for AI banter and multi-LLM mischief! 🧪💬

Ever wanted to wrangle a squad of language models, sync your wildest conversations, and experiment with the bleeding edge of AI—all in one stylish playground? You're in the right timeline. Built for the T3 Chat Cloneathon, chad-chat is where ideas spark, personalities (AI and human) collide, and inspiration is just one message away.

> ⚡️ Side effects may include spontaneous brainstorming, worldline shifts, and the urge to build something cool.

---

## 🚀 Features

- **Multi-LLM Playground:**  
  Chat with a whole crew of language models (LLMs) — swap between them like you're flipping channels in the multiverse! 🌌
- **Conversation Sync:**  
  Your chat history and threads are always saved — never lose a vital message, even if you accidentally diverge from the main worldline. 🕰️💾
- **Modern UI:**  
  Modular, reusable, and as smooth as a well-oiled gadget. Powered by shadcn/ui. 🎛️✨
- **Experimentation Hub:**  
  Try out new models, prompts, and features in a safe, sandboxed environment. Go wild — we won't judge. 🧑‍🔬🧪

---

## 🧪 Tech Stack

- **Frontend:**  
  - [React](https://react.dev/) (with [@tanstack/react-router](https://tanstack.com/router/latest)) ⚛️
  - Vite ⚡️
  - shadcn/ui component system 🧩
  - TypeScript 🦕

- **Backend:**  
  - Node.js (Bun for package management) 🍞
  - [Prisma ORM](https://www.prisma.io/) with **PostgreSQL** 🐘
  - Modular service, domain, and repository layers 🗂️
  - Auth via [better-auth](https://github.com/your-org/better-auth) with Prisma adapter 🔐

- **Monorepo Tooling:**  
  - [Turborepo](https://turbo.build/) for monorepo management 🏎️
  - Biome for formatting and linting 🌳

---

## 🏗️ Project Structure

```
chad-chat/
  apps/
    hub/        # Frontend (React, TanStack Router, shadcn/ui)
    brain/      # Backend entrypoint
  packages/
    brain/
      domain/   # Domain-driven design: entities, factories, values
      repository/ # Prisma ORM, database access, migrations
      service/  # Business logic, auth, config
    shared/
      ui/       # Reusable UI components, chat UIs, shadcn/ui wrappers
      typescript-config/
      clients/
  turbo/        # Turborepo generators and templates
```

- **apps/hub:**  
  The main web app, built with React and TanStack Router. Your portal to the multiverse of chat. 🖥️🚪
- **apps/brain:**  
  Backend entrypoint, orchestrating services and database access. The brains behind the banter. 🧠
- **packages/brain/domain:**  
  Domain logic: entities, value objects, and factories. The DNA of your chat world. 🧬
- **packages/brain/repository:**  
  Prisma schema, migrations, and database adapters (PostgreSQL). Where your data finds a home. 🏡
- **packages/brain/service:**  
  Business logic, authentication, and configuration. The secret sauce. 🥫
- **packages/shared/ui:**  
  Design system and chat UI components (shadcn/ui, chat, markdown, audio, etc). The wardrobe and props for your chat stage. 🎭

---

## 🕹️ Getting Started

Ready to fire up your own lab? 🧑‍🔬

1. **Install dependencies:**  
   ```sh
   bun install
   ```

2. **Set up your database:**  
   - Copy `.env.example` to `.env` and configure your PostgreSQL connection. 📝
   - Run Prisma migrations:
     ```sh
     bunx prisma migrate deploy
     ```

3. **Start the dev environment:**  
   ```sh
   turbo run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) and start chatting!** 🎉

---

## 🏡 Self-Hosting (WIP)

Dreaming of running chad-chat from your own secret lab? 🏰

Self-hosting support is coming soon! 🛠️  
Stay tuned for updates on how to deploy chad-chat on your own infrastructure. (No microwave time machine required — just a bit of patience as we stabilize the worldline.)

---

## 🧑‍🔬 Contributing

Pull requests and lab memos welcome! 📝
Help us build the ultimate chat playground — your contributions may just shift the worldline. ✨

Whether you're a code sorcerer, a documentation wizard, or just have a wild idea, hop in! The more, the merrier. 🧙‍♂️🤝

---

## ⚠️ Disclaimer

This project is for experimentation and fun.  
May cause time paradoxes, spontaneous inspiration, or the urge to shout mysterious phrases at your computer. 🌀

Proceed at your own risk — and remember, the only constant is change (and maybe a little chaos). Divergence is expected. 🦋

---

## 🧭 License

MIT — because the best worldlines are open source. 📜
