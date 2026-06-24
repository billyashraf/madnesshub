/**
 * Seed script — run once to populate demo data.
 * Usage: npm run seed
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");

// ── Inline schemas (mirrors the real ones without Next.js path aliases) ──────

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    bio: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    tags: [{ type: String }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    readingTime: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const User = models.User ?? model("User", UserSchema);
const Post = models.Post ?? model("Post", PostSchema);

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

// ── Demo content ──────────────────────────────────────────────────────────────

const ADMIN = {
  username: "admin",
  name: "Admin",
  email: "admin@madnesshub.com",
  password: "Demo1234!",
  bio: "Creator and curator of madnesshub. Writing about AI, the web, and game design.",
  role: "admin",
};

const POSTS = [
  {
    title: "The Future of AI: What Comes Next",
    tags: ["ai", "technology", "future"],
    coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    content: `# The Future of AI: What Comes Next

Artificial intelligence has moved from science fiction to daily reality faster than almost anyone predicted. But where exactly are we headed — and what should we actually be paying attention to?

## The Current Landscape

In the past few years, large language models have gone from curiosities to genuine productivity multipliers. Developers use them to write and review code. Designers use them to iterate on ideas in seconds. Writers use them to draft, outline, and refine. The tools aren't perfect — but they've crossed the threshold from "interesting demo" to "changes how I work."

What's easy to miss in the hype is how much of this progress is **infrastructure**, not just model capability. Better APIs, faster inference, cheaper compute, and smarter tooling have made AI accessible to anyone with a laptop and a credit card.

## What Actually Changes Everything

Three shifts are happening simultaneously that will compound over the next five years:

**1. Agents, not just chat**

The chatbot era was a warm-up act. The real disruption happens when AI can take autonomous action — browsing the web, writing and executing code, booking meetings, managing files — with minimal human supervision. Early agentic products are already showing what this looks like. The jump from "AI that answers questions" to "AI that completes tasks" is not incremental. It's categorical.

**2. Multimodality becomes the default**

Text-only models are already feeling dated. The next generation of tools treats images, audio, video, and text as first-class inputs. This matters for medicine (reading scans), education (explaining visuals), and creative work (generating and editing media). When AI can reason about anything a human can perceive, the use-case ceiling disappears.

**3. Personalization at scale**

The most underrated trend: AI that learns from you specifically. Not a generic assistant, but one that knows your writing style, your codebase, your decision-making patterns, your communication preferences. The competitive moat shifts from model capability to personal context. The tools that win will be the ones that accumulate the richest picture of how you actually work.

## What This Means for the Rest of Us

The uncomfortable truth is that AI doesn't eliminate work — it eliminates the *friction* of certain kinds of work and raises the bar for everything else. Tasks that used to take hours can now take minutes. That's not a threat; it's a leverage multiplier if you learn to use it.

The people who thrive won't be those who avoid AI, or those who blindly outsource everything to it. They'll be the ones who develop a sharp intuition for *when* to use it, *how* to prompt it effectively, and *where* human judgment still matters.

The future of AI isn't a single dramatic moment. It's hundreds of small moments where something that used to be hard becomes easy — and that changes what you decide to attempt.

> The real question isn't "will AI replace me?" It's "what will I do with the time AI gives back?"

Start there.`,
  },
  {
    title: "The Fall of Traditional Web Development",
    tags: ["webdev", "javascript", "opinion"],
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80",
    content: `# The Fall of Traditional Web Development

There's a quiet panic spreading through the web development community, and it's not hard to understand why.

For over a decade, web development was a clear career path with a stable playbook: learn HTML, CSS, and JavaScript. Pick a framework (React, Vue, Angular). Understand REST APIs. Deploy to a server. Get hired. Repeat.

That playbook is dissolving — and faster than most people realize.

## The Complexity Trap

Modern web development has become genuinely absurd in its complexity. Consider what it now takes to build a "simple" web app:

- A JavaScript framework (and its ecosystem)
- A meta-framework on top of that (Next.js, Nuxt, SvelteKit...)
- A bundler, a transpiler, and a package manager
- TypeScript (because plain JS is apparently insufficient)
- A CSS solution (Tailwind, CSS Modules, styled-components, or all three, arguing with each other)
- A state management library (or five)
- An ORM, a database client, and a migration system
- Auth, caching, rate limiting, error tracking, logging, CI/CD

We've built a Rube Goldberg machine and called it "the modern stack." Junior developers often spend their first six months just learning *how to build* instead of *what to build*.

## The Abstraction Rebellion

Something interesting is happening in response. Developers are pushing back.

HTMX went from a niche curiosity to a legitimate movement. "Just use vanilla JS" threads get thousands of upvotes. SQLite being used in production is no longer embarrassing — it's celebrated. The idea that a single developer can build and ship a full product without a team, a DevOps pipeline, and three subscription tools is making a comeback.

This isn't nostalgia. It's a rational correction. Simpler tools have real advantages: they're easier to debug, faster to learn, cheaper to run, and less likely to break when a dependency updates.

## What's Actually Falling

Traditional web development isn't dying — it's fragmenting. The middle is collapsing.

At one end: sophisticated enterprise applications where complexity is genuinely warranted. Real-time collaboration, multi-tenant architecture, edge personalization — these benefit from the full modern stack and teams of specialists.

At the other end: the vast majority of websites and tools, which are far simpler than the stack we use to build them. These are increasingly well-served by AI-generated code, no-code platforms, and leaner frameworks.

The "full stack developer who knows everything" was always a myth. Now it's a myth with an expiration date.

## The Path Forward

The developers who will thrive aren't the ones who memorized the React lifecycle or know every CSS property by heart. They're the ones who:

1. **Understand fundamentals deeply** — HTTP, the DOM, how browsers work, what a database actually does
2. **Reach for the right tool, not the fashionable one** — a WordPress site or a vanilla JS app is often the correct answer
3. **Ship things** — building and finishing products matters more than which tools you used

The fall of traditional web development isn't a crisis. It's a correction. The craft isn't going anywhere. It's getting leaner, more pragmatic, and more interesting.

The developers who adapt will have more options — not fewer.`,
  },
  {
    title: "Game Design and Gamification: Lessons for Product Builders",
    tags: ["gamedesign", "product", "ux", "gamification"],
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80",
    content: `# Game Design and Gamification: Lessons for Product Builders

The best products in the world have borrowed heavily from game design — often without admitting it. Understanding *why* games are compelling is one of the most underrated skills a product builder can develop.

## Why Games Work

Games are systems engineered to produce one specific outcome: *voluntary engagement*. Nobody is forced to play. There's no external reward (usually no money, no career advancement, no social obligation). And yet people spend thousands of hours in worlds that don't exist, solving problems that don't matter, competing with people they'll never meet.

That's remarkable. And it has almost nothing to do with graphics or story.

Games work because they nail four things that most software completely ignores:

**Clear goals.** You always know what you're trying to do. The objective is visible, legible, and achievable. There's no ambiguity about what "success" looks like right now.

**Immediate feedback.** Every action produces a visible result. You swing the sword — the enemy reacts. You place a block — the structure changes. Feedback loops are tight, constant, and satisfying.

**A calibrated difficulty curve.** Good games are never too easy or too hard. They stay in the *flow zone* — challenging enough to demand focus, manageable enough to feel possible. This is the state of effortless engagement that Mihaly Csikszentmihalyi described in his research. Games engineer it deliberately.

**A sense of progress.** Players can always see how far they've come. Level numbers, skill trees, maps uncovered, achievements unlocked. Progress is tangible and continuous, even when the big goal is far away.

## Where Most Gamification Goes Wrong

Gamification has a reputation problem — and it deserves it. Most attempts at gamification are just **points, badges, and leaderboards** bolted onto software that isn't fun to use.

This fails because it mistakes the output of a well-designed game (rewards) for the input (good design). Points aren't engaging because they're points. They're engaging because they represent meaningful progress in a system people already care about.

Slapping a badge on a frustrating onboarding flow doesn't make it a game. It makes it a frustrating onboarding flow with an irrelevant badge.

## What Actually Transfers to Products

The principles that make games compelling translate directly to software — when applied at the design level, not the reward layer:

**Reduce time-to-first-win.** Games teach you by letting you succeed quickly. The first levels are almost always easy. You ship your first Minecraft house in twenty minutes. Products should find their equivalent: what's the fastest path to the user experiencing the core value? Every step before that is friction.

**Make progress visible.** Profile completion percentages, streaks, "you've used this 10 times" milestones — these work because they make invisible progress visible. The key is that the progress has to feel *meaningful*, not manufactured.

**Celebrate small victories.** A confetti animation, a sound effect, a brief congratulations message — these are cheap to build and have a disproportionate effect on how people feel about software. Don't save celebration for major milestones. Find moments to acknowledge small wins.

**Design for mastery.** The most loyal users are the ones who feel like experts. Building features that reveal depth over time — keyboard shortcuts, advanced settings, power-user workflows — rewards people who invest in learning your product. Expertise feels good. Design for it.

## The Underlying Principle

Games and great products share a core belief: the experience itself should be rewarding. Not just the outcome — the *doing*.

When a product is genuinely well-designed, you don't need to layer on artificial incentives. The progression feels natural, the feedback feels satisfying, and the user feels capable rather than confused.

The goal isn't to make your app feel like a game. It's to make it feel like *effort that's worth it* — which is exactly what every great game does.

> Design for the feeling, not the feature list. The best games don't describe fun. They produce it.`,
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("✓ Connected to MongoDB");

  // Check if already seeded
  const existing = await User.findOne({ username: ADMIN.username });
  if (existing) {
    console.log("⚠ Admin user already exists — skipping seed.");
    console.log("  Delete the admin user from Atlas to re-seed.");
    await mongoose.disconnect();
    return;
  }

  // Create admin user (hash password manually since we're outside Next.js)
  const hashed = await bcrypt.hash(ADMIN.password, 12);
  const user = await User.create({ ...ADMIN, password: hashed });
  console.log(`✓ Created admin user: ${user.email}`);

  // Create posts
  for (const post of POSTS) {
    const slug = `${slugify(post.title, { lower: true, strict: true })}-${Date.now().toString(36)}`;
    await Post.create({
      title: post.title,
      slug,
      content: post.content,
      coverImage: post.coverImage,
      tags: post.tags,
      status: "published",
      author: user._id,
      readingTime: readingTime(post.content),
    });
    console.log(`✓ Created post: "${post.title}"`);
    // Small delay so slugs differ
    await new Promise((r) => setTimeout(r, 5));
  }

  console.log("\n🎉 Seed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
