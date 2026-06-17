// Workspace state (CONTEXT.md sections 3.2 to 3.10). Mirrors the prototype's
// single state object plus actions, but every data call goes through the real
// api seam (lib/api-client). Filters recompute counts and the funnel locally,
// exactly like the prototype; editing the detected-skill chips re-runs
// retrieval. No em dashes, no emojis.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { applyFilters, computeFunnel, estimateCount } from "@/lib/engine/filter";
import type { Candidate, Funnel, RepoFacet, SearchFilters } from "@/lib/types";

export type AppView = "search" | "results" | "actions";

export interface EmailPayload {
  candidateName: string;
  candidateLogin: string;
  subject: string;
  body: string;
  step: number;
  skills: string[];
}

export interface ChatItem {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
  email?: EmailPayload;
}

interface AppState {
  view: AppView;
  query: string;
  skills: string[];
  candidates: Candidate[];
  total: number;
  repos: RepoFacet[];
  filters: SearchFilters;
  shortlist: string[];
  history: string[];
  chat: ChatItem[];
  searchId: string | null;
  shortlistId: string | null;
  loading: boolean;
  profileLogin: string | null;
  profile: Candidate | null;
  profileLoading: boolean;
  toastMsg: string | null;

  // derived
  filtered: () => Candidate[];
  count: () => number;
  funnel: () => Funnel;
  shortlistCandidates: () => Candidate[];

  // actions
  setView: (v: AppView) => void;
  newSearch: () => void;
  submitSearch: (q: string) => Promise<void>;
  rerunWithSkills: () => Promise<void>;
  setSeniority: (s: SearchFilters["seniority"]) => void;
  setLocation: (loc: string) => void;
  toggleRepo: (repoKey: string) => void;
  addSkill: (label: string) => void;
  removeSkill: (index: number) => void;
  reorderSkills: (from: number, to: number) => void;
  toggleShortlist: (login: string) => void;
  saveShortlist: () => void;
  openProfile: (login: string) => Promise<void>;
  closeProfile: () => void;
  pushChat: (item: ChatItem) => number;
  updateChat: (index: number, patch: Partial<ChatItem>) => void;
  sendChat: (text: string) => Promise<void>;
  runAction: (act: "refine" | "draft" | "sequence") => Promise<void>;
  toast: (msg: string) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "search",
      query: "",
      skills: [],
      candidates: [],
      total: 0,
      repos: [],
      filters: { seniority: "Any", location: "", repos: [] },
      shortlist: [],
      history: [],
      chat: [],
      searchId: null,
      shortlistId: null,
      loading: false,
      profileLogin: null,
      profile: null,
      profileLoading: false,
      toastMsg: null,

      filtered: () => applyFilters(get().candidates, get().filters),
      count: () => {
        const s = get();
        return estimateCount(s.total, s.filters, s.filtered().length);
      },
      funnel: () => {
        const s = get();
        return computeFunnel(s.total, s.filters, s.count());
      },
      shortlistCandidates: () => {
        const s = get();
        return s.shortlist
          .map((l) => s.candidates.find((c) => c.login === l))
          .filter((c): c is Candidate => Boolean(c));
      },

      setView: (v) => set({ view: v }),

      newSearch: () => set({ view: "search", query: "" }),

      submitSearch: async (raw) => {
        const q = (raw || "").trim();
        if (!q) return;
        const history = get().history.includes(q)
          ? get().history
          : [q, ...get().history].slice(0, 8);
        set({
          query: q,
          history,
          filters: { seniority: "Any", location: "", repos: [] },
          shortlist: [],
          chat: [],
          view: "results",
          loading: true,
          candidates: [],
        });
        try {
          const res = await api.search(q, get().filters);
          if (get().query !== q) return; // stale
          set({
            skills: res.detectedSkills,
            candidates: res.candidates,
            total: res.total,
            repos: res.repos,
            searchId: res.searchId,
            loading: false,
          });
        } catch {
          set({ loading: false });
          get().toast("Search failed. Try again in a moment.");
        }
      },

      rerunWithSkills: async () => {
        const { query, filters, skills } = get();
        if (!query) return;
        try {
          const res = await api.search(query, filters, skills);
          if (get().query !== query) return;
          set({
            candidates: res.candidates,
            total: res.total,
            repos: res.repos,
            searchId: res.searchId,
          });
        } catch {
          get().toast("Could not refresh results.");
        }
      },

      setSeniority: (s) => set({ filters: { ...get().filters, seniority: s } }),
      setLocation: (loc) => set({ filters: { ...get().filters, location: loc } }),
      toggleRepo: (repoKey) => {
        const repos = get().filters.repos.slice();
        const i = repos.indexOf(repoKey);
        if (i >= 0) repos.splice(i, 1);
        else repos.push(repoKey);
        set({ filters: { ...get().filters, repos } });
      },

      addSkill: (label) => {
        const v = label.trim();
        if (!v) return;
        set({ skills: [...get().skills, v] });
        void get().rerunWithSkills();
      },
      removeSkill: (index) => {
        const skills = get().skills.slice();
        skills.splice(index, 1);
        set({ skills });
        void get().rerunWithSkills();
      },
      reorderSkills: (from, to) => {
        if (from === to) return;
        const skills = get().skills.slice();
        const [m] = skills.splice(from, 1);
        skills.splice(to, 0, m);
        set({ skills });
        void get().rerunWithSkills();
      },

      toggleShortlist: (login) => {
        const sl = get().shortlist.slice();
        const i = sl.indexOf(login);
        if (i >= 0) sl.splice(i, 1);
        else sl.push(login);
        set({ shortlist: sl });
        get().saveShortlist();
      },

      // Best-effort save. Persists to localStorage via the store, and to the
      // database per user when signed in (the route handles auth). Debounced.
      saveShortlist: () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
          try {
            const res = await fetch("/api/shortlists", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: get().shortlistId ?? undefined,
                name: get().query ? get().query.slice(0, 60) : "Shortlist",
                logins: get().shortlist,
              }),
            });
            if (res.ok) {
              const data = (await res.json()) as { id: string };
              if (data.id) set({ shortlistId: data.id });
            }
          } catch {
            // ignore: localStorage persistence already covers reloads
          }
        }, 600);
      },

      openProfile: async (login) => {
        set({ profileLogin: login, profileLoading: true, profile: null });
        const inMemory = get().candidates.find((c) => c.login === login);
        if (inMemory) {
          set({ profile: inMemory, profileLoading: false });
          return;
        }
        try {
          const p = await api.getProfile(login);
          if (get().profileLogin !== login) return;
          set({ profile: p, profileLoading: false });
        } catch {
          set({ profileLoading: false });
          get().toast("Could not load that profile.");
        }
      },
      closeProfile: () => set({ profileLogin: null, profile: null }),

      pushChat: (item) => {
        const chat = [...get().chat, item];
        set({ chat });
        return chat.length - 1;
      },
      updateChat: (index, patch) => {
        const chat = get().chat.slice();
        if (chat[index]) chat[index] = { ...chat[index], ...patch };
        set({ chat });
      },

      sendChat: async (text) => {
        const t = text.trim();
        if (!t) return;
        get().pushChat({ role: "user", content: t });
        const idx = get().pushChat({ role: "assistant", content: "", typing: true });
        const history = get().chat
          .filter((c) => !c.typing)
          .slice(-8)
          .map((c) => ({ role: c.role, content: c.content }));
        const shortlist = get()
          .shortlistCandidates()
          .map((c) => ({ login: c.login, name: c.name }));
        try {
          await api.chat(
            history,
            get().query,
            shortlist,
            (full) => {
              get().updateChat(idx, { content: full, typing: false });
            },
            get().searchId ?? undefined
          );
        } catch {
          get().updateChat(idx, {
            content: "Chat is unavailable right now. Try again shortly.",
            typing: false,
          });
        }
      },

      runAction: async (act) => {
        const sl = get().shortlistCandidates();
        if (act === "refine") {
          get().pushChat({ role: "user", content: "Help me refine my shortlist" });
          const idx = get().pushChat({ role: "assistant", content: "", typing: true });
          try {
            await api.chat(
              [{ role: "user", content: "refine" }],
              get().query,
              sl.map((c) => ({ login: c.login, name: c.name })),
              (full) => get().updateChat(idx, { content: full, typing: false }),
              get().searchId ?? undefined
            );
          } catch {
            get().updateChat(idx, {
              content: "Chat is unavailable right now.",
              typing: false,
            });
          }
          return;
        }
        if (!sl.length) {
          get().pushChat({
            role: "assistant",
            content:
              "Your shortlist is empty. Star a few candidates in the results view and I will draft outreach grounded in their actual contributions.",
          });
          return;
        }
        if (act === "draft") {
          get().pushChat({ role: "user", content: "Draft outreach for my shortlist" });
          for (const c of sl) {
            const idx = get().pushChat({ role: "assistant", content: "", typing: true });
            try {
              const mail = await api.draftOutreach(c, get().query, 1);
              get().updateChat(idx, {
                typing: false,
                content: "",
                email: {
                  candidateName: c.name,
                  candidateLogin: c.login,
                  subject: mail.subject,
                  body: mail.body,
                  step: mail.sequenceStep,
                  skills: c.skills,
                },
              });
            } catch {
              get().updateChat(idx, {
                typing: false,
                content: `Could not draft a message for ${c.name}.`,
              });
            }
          }
          return;
        }
        if (act === "sequence") {
          const c = sl[0];
          get().pushChat({ role: "user", content: "Create a 3-step email sequence for " + c.name });
          for (let step = 1; step <= 3; step++) {
            const idx = get().pushChat({ role: "assistant", content: "", typing: true });
            try {
              const mail = await api.draftOutreach(c, get().query, step);
              get().updateChat(idx, {
                typing: false,
                content: "",
                email: {
                  candidateName: c.name,
                  candidateLogin: c.login,
                  subject: mail.subject,
                  body: mail.body,
                  step: mail.sequenceStep,
                  skills: c.skills,
                },
              });
            } catch {
              get().updateChat(idx, {
                typing: false,
                content: `Could not draft step ${step} for ${c.name}.`,
              });
            }
          }
        }
      },

      toast: (msg) => {
        set({ toastMsg: msg });
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => set({ toastMsg: null }), 2600);
      },
    }),
    {
      name: "shipscout-app",
      // Persist enough to survive a reload: history plus the current search and
      // shortlist so the shortlist sidebar resolves names after a refresh.
      partialize: (s) => ({
        history: s.history,
        shortlist: s.shortlist,
        shortlistId: s.shortlistId,
        query: s.query,
        skills: s.skills,
        candidates: s.candidates,
        total: s.total,
        repos: s.repos,
      }),
    }
  )
);
