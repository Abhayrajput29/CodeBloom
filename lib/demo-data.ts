export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  author: string;
  handle: string;
  initials: string;
  avatarTone: string;
  tags: string[];
  status: string;
  statusTone: "green" | "blue" | "amber";
  repo: string;
  demo?: string;
  votes: number;
  comments: number;
  time: string;
  art: "garden" | "ledger" | "terminal" | "atlas" | "orbit" | "studio";
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "signal-garden",
    name: "Signal Garden",
    tagline: "A calmer way to understand your notifications.",
    description:
      "A tiny open-source inbox that groups noisy events into patterns you can actually act on. Built for teams who want fewer pings and better context.",
    author: "Amira Chen",
    handle: "amiracodes",
    initials: "AC",
    avatarTone: "plum",
    tags: ["TypeScript", "Next.js", "Open source"],
    status: "Just launched",
    statusTone: "green",
    repo: "github.com/amira/signal-garden",
    demo: "signal.garden",
    votes: 284,
    comments: 38,
    time: "2h ago",
    art: "garden",
    featured: true,
  },
  {
    slug: "ledger-leaf",
    name: "Ledger Leaf",
    tagline: "Personal finance, without the spreadsheet dread.",
    description:
      "A privacy-first spending journal with thoughtful defaults, local-first storage, and tiny visualizations that make the month feel manageable.",
    author: "Noah Williams",
    handle: "nwbuilds",
    initials: "NW",
    avatarTone: "blue",
    tags: ["React", "Rust", "Privacy"],
    status: "In beta",
    statusTone: "blue",
    repo: "github.com/noahw/ledger-leaf",
    demo: "ledgerleaf.app",
    votes: 196,
    comments: 24,
    time: "5h ago",
    art: "ledger",
  },
  {
    slug: "patchwork-cli",
    name: "Patchwork CLI",
    tagline: "Make your git history read like a story.",
    description:
      "A terminal companion that turns scattered commits into clean, reviewable release notes. Small, scriptable, and happy in your existing workflow.",
    author: "Ishan Rao",
    handle: "ishanbuilds",
    initials: "IR",
    avatarTone: "mint",
    tags: ["CLI", "Go", "Developer tools"],
    status: "Open source",
    statusTone: "amber",
    repo: "github.com/ishan/patchwork",
    votes: 143,
    comments: 19,
    time: "8h ago",
    art: "terminal",
  },
  {
    slug: "little-atlas",
    name: "Little Atlas",
    tagline: "Save the places you want to remember.",
    description:
      "A shared map for curious people: notes, lists, and neighborhood guides that stay personal until you choose to share them.",
    author: "Sofia Martinez",
    handle: "sofiamakes",
    initials: "SM",
    avatarTone: "coral",
    tags: ["Maps", "Svelte", "Community"],
    status: "Just launched",
    statusTone: "green",
    repo: "github.com/sofia/little-atlas",
    demo: "littleatlas.city",
    votes: 128,
    comments: 16,
    time: "12h ago",
    art: "atlas",
  },
  {
    slug: "orbit-notes",
    name: "Orbit Notes",
    tagline: "Your thoughts, connected by what matters.",
    description:
      "A local-first canvas for technical notes. Link ideas as you go and let the structure emerge naturally, without a setup ritual.",
    author: "Kai Okafor",
    handle: "kaiokafor",
    initials: "KO",
    avatarTone: "gold",
    tags: ["Local-first", "Tauri", "Notes"],
    status: "In beta",
    statusTone: "blue",
    repo: "github.com/kai/orbit-notes",
    votes: 97,
    comments: 12,
    time: "1d ago",
    art: "orbit",
  },
  {
    slug: "tiny-studio",
    name: "Tiny Studio",
    tagline: "A little design system starter for teams of one.",
    description:
      "Tokens, components, and sensible spacing in one tidy workspace. Start small, keep the parts you love, and ship a more consistent interface.",
    author: "Lena Park",
    handle: "lenaparkdev",
    initials: "LP",
    avatarTone: "pink",
    tags: ["Design systems", "CSS", "Open source"],
    status: "Open source",
    statusTone: "amber",
    repo: "github.com/lena/tiny-studio",
    votes: 76,
    comments: 9,
    time: "1d ago",
    art: "studio",
  },
];

export type Notice = {
  id: string;
  initials: string;
  tone: string;
  name: string;
  action: string;
  subject: string;
  time: string;
  unread?: boolean;
};

export const notifications: Notice[] = [
  { id: "n1", initials: "NW", tone: "blue", name: "Noah Williams", action: "left a thoughtful note on", subject: "Signal Garden", time: "12 min ago", unread: true },
  { id: "n2", initials: "PM", tone: "coral", name: "Priya Mehta", action: "and 8 others upvoted", subject: "your project update", time: "1 hour ago", unread: true },
  { id: "n3", initials: "JR", tone: "mint", name: "Jordan Reed", action: "started following your work", subject: "", time: "3 hours ago" },
  { id: "n4", initials: "AC", tone: "plum", name: "Amira Chen", action: "published a new project", subject: "Signal Garden", time: "Yesterday" },
];

export const pendingRequests = [
  { id: "r1", name: "Ravi Kapoor", handle: "ravikcodes", initials: "RK", tone: "gold", note: "Hey! I’m exploring local-first sync for a small notes app. I’d love to hear how you approached conflict resolution in Orbit Notes.", time: "35 min ago", mutual: "2 projects in common" },
  { id: "r2", name: "Maya Johnson", handle: "mayajdev", initials: "MJ", tone: "pink", note: "Your write-up on accessible command palettes was super useful. Would you be open to a quick chat about keyboard testing?", time: "Yesterday", mutual: "Follows your work" },
];

export const conversations = [
  { name: "Amira Chen", handle: "amiracodes", initials: "AC", tone: "plum", preview: "I can share the approach we used for event grouping.", time: "10:42 AM", unread: true },
  { name: "Noah Williams", handle: "nwbuilds", initials: "NW", tone: "blue", preview: "Thanks for the thoughtful review!", time: "Yesterday" },
  { name: "Lena Park", handle: "lenaparkdev", initials: "LP", tone: "pink", preview: "That sounds good — I’ll try it this weekend.", time: "Monday" },
];
