import React, { useState, useEffect, useRef } from "react";

// =========================================================================
// MALL HUNT — v0.2
// Прототип игры типа Pokemon Go внутри торгового центра
// =========================================================================

// --- Тема ------------------------------------------------------------------
const THEME = {
  bg: "#0A0E27",
  surface: "#141B3A",
  surfaceHi: "#1E2851",
  line: "#2A3566",
  cyan: "#00F5D4",
  pink: "#FF006E",
  yellow: "#FFD60A",
  violet: "#8338EC",
  green: "#06D6A0",
  text: "#F5F5F7",
  textDim: "#8B93B8",
};

const RARITY = {
  common:    { label: "обычный",    color: "#8B93B8", glow: "rgba(139,147,184,.5)", points: 10  },
  rare:      { label: "редкий",     color: "#00F5D4", glow: "rgba(0,245,212,.6)",   points: 30  },
  epic:      { label: "эпический",  color: "#8338EC", glow: "rgba(131,56,236,.7)",  points: 80  },
  legendary: { label: "легендарный",color: "#FFD60A", glow: "rgba(255,214,10,.8)",  points: 250 },
};

// --- Существа (12 штук) ---------------------------------------------------
const CREATURES = [
  { id: "vhodillo",    name: "Входилло",    rarity: "common",    zone: "entrance",
    desc: "Добродушный дух главных дверей. Здоровается со всеми, кто заходит в ТЦ." },
  { id: "fontanik",    name: "Фонтаник",    rarity: "common",    zone: "fountain",
    desc: "Водяной дух, обитающий в главном фонтане. Любит бросать брызги." },
  { id: "popkornik",   name: "Попкорник",   rarity: "common",    zone: "cinema",
    desc: "Пушистое создание, рождённое из забытого ведёрка попкорна." },
  { id: "karamelka",   name: "Карамелька",  rarity: "common",    zone: "candy",
    desc: "Сладкая и липкая. Любит прилипать к витринам кондитерских." },
  { id: "chekistik",   name: "Чекистик",    rarity: "common",    zone: "food",
    desc: "Живой чек из фудкорта. Знает, сколько стоит каждое блюдо." },
  { id: "shopoglot",   name: "Шопоглот",    rarity: "rare",      zone: "food",
    desc: "Оживший пакет. Ест чеки и забытые купоны." },
  { id: "pufik",       name: "Пуфик",       rarity: "rare",      zone: "kids",
    desc: "Облачко-подушка. Мягкий и абсолютно безобидный." },
  { id: "chasenysh",   name: "Часёныш",     rarity: "rare",      zone: "cinema",
    desc: "Следит за временем сеансов. Всегда знает, когда начнётся кино." },
  { id: "eskalatron",  name: "Эскалатрон",  rarity: "epic",      zone: "escalator",
    desc: "Механический страж движущихся лестниц. Очень серьёзен." },
  { id: "lampushkin",  name: "Лампопушкин", rarity: "epic",      zone: "books",
    desc: "Призрак старой лампы. Появляется там, где есть книги." },
  { id: "neonik",      name: "Неоник",      rarity: "epic",      zone: "arcade",
    desc: "Неоновая вывеска, сбежавшая из игрового зала. Мерцает розовым." },
  { id: "mrampampam",  name: "Мрампампам",  rarity: "legendary", zone: "arcade",
    desc: "Легенда ТЦ. Никто не знает, откуда он приходит и куда уходит." },
];

// --- Зоны ------------------------------------------------------------------
const ZONES = [
  { id: "entrance",  name: "Главный вход",    x: 50,  y: 280, r: 34 },
  { id: "fountain",  name: "Фонтан",          x: 180, y: 200, r: 42 },
  { id: "food",      name: "Фудкорт",         x: 340, y: 120, r: 46 },
  { id: "cinema",    name: "Кинотеатр",       x: 480, y: 210, r: 44 },
  { id: "kids",      name: "Детская зона",    x: 140, y: 380, r: 44 },
  { id: "candy",     name: "Сладкий угол",    x: 320, y: 340, r: 36 },
  { id: "books",     name: "Книжный",         x: 470, y: 380, r: 38 },
  { id: "escalator", name: "Эскалатор",       x: 260, y: 240, r: 28 },
  { id: "arcade",    name: "Аркада",          x: 560, y: 310, r: 40 },
];

// --- Задания (квесты) ------------------------------------------------------
const QUESTS = [
  { id: "q1", title: "Первая охота",      desc: "Поймай любое существо",                  target: 1, metric: "catches",    reward: 20 },
  { id: "q2", title: "Упорный охотник",   desc: "Поймай 3 существа",                      target: 3, metric: "catches",    reward: 50 },
  { id: "q3", title: "Гурман",            desc: "Поймай кого-нибудь в Фудкорте",          target: 1, metric: "food",       reward: 40 },
  { id: "q4", title: "Меткий",            desc: "Поймай существо идеально",               target: 1, metric: "perfect",    reward: 75 },
  { id: "q5", title: "Редкая находка",    desc: "Поймай редкое или лучше",                target: 1, metric: "rare+",      reward: 100 },
  { id: "q6", title: "Собиратель",        desc: "Собери 5 разных существ",                target: 5, metric: "unique",     reward: 150 },
];

// --- Магазин ----------------------------------------------------------------
const SHOP_ITEMS = [
  { id: "s1", name: "Бесплатный попкорн",       partner: "Кинотеатр",  price: 300,  icon: "🍿", color: "#FFD60A" },
  { id: "s2", name: "Скидка 10% в фудкорте",    partner: "Food court", price: 200,  icon: "🍔", color: "#F77F00" },
  { id: "s3", name: "Жетон в аркаду",           partner: "Arcade",     price: 150,  icon: "🎮", color: "#FF006E" },
  { id: "s4", name: "Мороженое в подарок",      partner: "IceFun",     price: 250,  icon: "🍦", color: "#4CC9F0" },
  { id: "s5", name: "Скидка 20% на игрушки",    partner: "ToyWorld",   price: 400,  icon: "🧸", color: "#B388EB" },
  { id: "s6", name: "Набор стикеров",           partner: "MALL HUNT",  price: 500,  icon: "✨", color: "#00F5D4" },
  { id: "s7", name: "Футболка охотника",        partner: "MALL HUNT",  price: 1500, icon: "👕", color: "#06D6A0" },
];

// --- Мок-рейтинг -----------------------------------------------------------
const MOCK_LEADERBOARD = [
  { name: "Айдана",  avatar: "🦄", points: 1250, you: false },
  { name: "Тимур",   avatar: "🐺", points: 1100, you: false },
  { name: "Санжар",  avatar: "🦁", points: 950,  you: false },
  { name: "Арина",   avatar: "🦋", points: 870,  you: false },
  { name: "Данияр",  avatar: "🐼", points: 800,  you: false },
  { name: "Алиса",   avatar: "🐰", points: 720,  you: false },
];

// =========================================================================
// =========================================================================
// СЕТЕВОЙ СЛОЙ — встроенный, без внешних импортов (для артефакта)
// =========================================================================
//
// В реальном Vite-проекте разбивается на:
//   src/lib/api.js, src/lib/mockBackend.js, src/lib/useGame.js
// Здесь склеено в один файл для работы в артефакте.
//
// Использует существующие CREATURES и ZONES, где:
//   CREATURE.id = slug, CREATURE.zone = slug зоны
//   ZONE.id = slug

const API_BASE = ""; // в prod: "https://api.mallhunt.app"
const TOKEN_KEY = "mh_player_token";
const MALL_SLUG = "mega-almaty";
const SPAWN_POLL_INTERVAL = 6000;
const SPAWN_TTL_MS = 45_000;
const SPAWN_INTERVAL_MS = 8000;
const MAX_ACTIVE_SPAWNS = 4;

const authStorage = {
  get:   () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set:   (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch {} },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} },
};

const conn = { isMock: false, reason: null };

// =========================================================================
// MOCK BACKEND — in-memory симуляция сервера
// =========================================================================
const mockBackend = (() => {
  const state = { user: null, catches: [], activeSpawns: [], otpCodes: new Map() };
  const wsSubscribers = new Map();
  const emitWS = (msg) => { for (const h of wsSubscribers.values()) h(msg); };

  let spawnTimer = null, expireTimer = null;

  const weightedPick = (weights) => {
    const entries = Object.entries(weights);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
    return entries[0][0];
  };

  const tick = () => {
    if (state.activeSpawns.length >= MAX_ACTIVE_SPAWNS) return;
    const busyZones = new Set(state.activeSpawns.map(s => s.zoneSlug));
    const freeZones = ZONES.filter(z => !busyZones.has(z.id));
    if (freeZones.length === 0) return;

    const zone = freeZones[Math.floor(Math.random() * freeZones.length)];
    const rarity = weightedPick({ common: 60, rare: 25, epic: 12, legendary: 3 });
    const candidates = CREATURES.filter(c => c.rarity === rarity);
    if (candidates.length === 0) return;

    const pool = [];
    for (const c of candidates) {
      const w = c.zone === zone.id ? 3 : 1;
      for (let i = 0; i < w; i++) pool.push(c);
    }
    const creature = pool[Math.floor(Math.random() * pool.length)];

    const spawn = {
      id: (crypto.randomUUID?.() || `spawn-${Math.random().toString(36).slice(2)}`),
      mallSlug: MALL_SLUG, zoneSlug: zone.id,
      creatureSlug: creature.id, creatureName: creature.name,
      rarity: creature.rarity, basePoints: RARITY[creature.rarity].points,
      spawnedAt: Date.now(), expiresAt: Date.now() + SPAWN_TTL_MS,
    };
    state.activeSpawns.push(spawn);
    emitWS({ type: "spawn_created", payload: spawn });
  };

  const expire = () => {
    const now = Date.now();
    const alive = [];
    for (const s of state.activeSpawns) {
      if (s.expiresAt > now) alive.push(s);
      else emitWS({ type: "spawn_expired", payload: { id: s.id } });
    }
    state.activeSpawns = alive;
  };

  const start = () => {
    if (spawnTimer) return;
    setTimeout(tick, 500);
    spawnTimer = setInterval(tick, SPAWN_INTERVAL_MS);
    expireTimer = setInterval(expire, 2000);
  };
  const stop = () => {
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    if (expireTimer) { clearInterval(expireTimer); expireTimer = null; }
  };

  const httpError = (status, code) => Object.assign(new Error(code), { status, code });
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const handle = async (path, options = {}) => {
    await delay(60 + Math.random() * 80);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;
    const segments = path.split("?")[0].split("/").filter(Boolean);

    if (path === "/auth/phone/request" && method === "POST") {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      state.otpCodes.set(body.phone, code);
      console.log(`[demo sms] ${body.phone}: код ${code}`);
      return { ok: true, phone: body.phone, debugCode: code };
    }
    if (path === "/auth/phone/verify" && method === "POST") {
      const saved = state.otpCodes.get(body.phone);
      if (!saved) throw httpError(401, "no_code");
      if (saved !== body.code) throw httpError(401, "wrong_code");
      state.otpCodes.delete(body.phone);
      state.user = { id: 1, display_name: `Игрок ${body.phone.slice(-4)}`, avatar_emoji: "🦊",
                     phone: body.phone, points: 0, catches_total: 0 };
      start();
      return { token: "mock_" + Date.now(), user: state.user };
    }
    if (path === "/auth/telegram" && method === "POST") {
      state.user = { id: 1, display_name: body.first_name || "Айдар", avatar_emoji: "🦊",
                     telegram_id: body.id, points: 0, catches_total: 0 };
      start();
      return { token: "mock_" + Date.now(), user: state.user };
    }

    if (path === "/me") return state.user;
    if (path === "/me/collection") {
      return { creatures: CREATURES.map(c => ({
        id: c.id, slug: c.id, name: c.name, rarity: c.rarity, description: c.desc,
        caught_count: state.catches.filter(ca => ca.creature_slug === c.id).length,
        last_caught_at: state.catches.find(ca => ca.creature_slug === c.id)?.caught_at || null,
      })) };
    }

    if (segments[0] === "malls" && segments[2] === "zones") {
      return { zones: ZONES.map(z => ({
        id: z.id, slug: z.id, name: z.name,
        map_x: z.x, map_y: z.y, map_radius: z.r, mall_slug: segments[1],
      })) };
    }
    if (segments[0] === "malls" && segments[2] === "spawns") {
      return { spawns: state.activeSpawns.map(s => ({
        id: s.id, zoneSlug: s.zoneSlug, creatureSlug: s.creatureSlug,
        creatureName: s.creatureName, rarity: s.rarity, expiresAt: s.expiresAt,
      })) };
    }

    if (segments[0] === "spawns" && segments[2] === "catch" && method === "POST") {
      const spawnId = segments[1];
      const idx = state.activeSpawns.findIndex(s => s.id === spawnId);
      if (idx === -1) throw httpError(409, "spawn_not_found");
      const spawn = state.activeSpawns[idx];
      state.activeSpawns.splice(idx, 1);
      const points = body.quality === "perfect" ? Math.round(spawn.basePoints * 1.5) : spawn.basePoints;
      state.user.points += points;
      state.user.catches_total += 1;
      state.catches.push({ creature_slug: spawn.creatureSlug, caught_at: new Date().toISOString(),
                           quality: body.quality, points_earned: points });
      emitWS({ type: "spawn_caught", payload: { spawnId } });
      return {
        ok: true,
        creature: { slug: spawn.creatureSlug, name: spawn.creatureName, rarity: spawn.rarity },
        quality: body.quality, pointsEarned: points,
        user: { points: state.user.points, catchesTotal: state.user.catches_total },
      };
    }

    if (path.startsWith("/leaderboard")) {
      const others = [
        { id: 2, display_name: "Айдана", avatar_emoji: "🐱", points: 480, catches_total: 28 },
        { id: 3, display_name: "Тимур",  avatar_emoji: "🐻", points: 350, catches_total: 19 },
        { id: 4, display_name: "Санжар", avatar_emoji: "🐸", points: 290, catches_total: 15 },
        { id: 5, display_name: "Арина",  avatar_emoji: "🦄", points: 210, catches_total: 12 },
      ];
      const me = state.user ? {
        id: state.user.id, display_name: state.user.display_name, avatar_emoji: state.user.avatar_emoji,
        points: state.user.points, catches_total: state.user.catches_total,
      } : null;
      const all = me ? [me, ...others] : others;
      all.sort((a, b) => b.points - a.points);
      return { leaderboard: all };
    }

    throw httpError(404, "not_found");
  };

  return {
    handle,
    subscribeWS: (slug, h) => wsSubscribers.set(slug, h),
    unsubscribeWS: (slug) => { wsSubscribers.delete(slug); if (wsSubscribers.size === 0) stop(); },
  };
})();

// =========================================================================
// HTTP-клиент с fallback в mock
// =========================================================================
const request = async (path, options = {}) => {
  // Если API_BASE пустой — бэкенд не сконфигурирован, сразу в mock.
  // Это предотвращает множество странных ошибок когда Vercel возвращает
  // HTML вместо JSON на несуществующие пути.
  if (!API_BASE && !conn.isMock) {
    conn.isMock = true;
    conn.reason = "no_api_base";
    console.info("[api] VITE_API_URL не задан — работаем в MOCK-режиме");
  }
  if (conn.isMock) return mockBackend.handle(path, options);

  const token = authStorage.get();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  try {
    const res = await fetch(API_BASE + path, {
      ...options, headers,
      signal: AbortSignal.timeout?.(4000) ?? undefined,
    });
    if (res.status === 401 && !path.startsWith("/auth")) {
      authStorage.clear();
      throw Object.assign(new Error("unauthorized"), { status: 401, code: "unauthorized" });
    }
    const text = await res.text();
    // Если пришёл HTML вместо JSON — сервер сломан или не тот URL
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw Object.assign(new Error("invalid_response"),
          { status: res.status, code: "invalid_response" });
      }
    }
    if (!res.ok) {
      throw Object.assign(new Error(data?.error || "request_failed"),
                         { status: res.status, code: data?.error, data });
    }
    return data;
  } catch (e) {
    // Сетевые / парсинговые ошибки → fallback в mock
    if (e.name === "TypeError" || e.name === "TimeoutError"
        || e.name === "AbortError" || e.code === "invalid_response") {
      console.warn("[api] backend unreachable → MOCK mode:", e.message);
      conn.isMock = true; conn.reason = "backend_unreachable";
      return mockBackend.handle(path, options);
    }
    throw e;
  }
};

const gameAPI = {
  loginTelegram:    (d)           => request("/auth/telegram",     { method: "POST", body: JSON.stringify(d) }),
  requestPhoneCode: (phone)       => request("/auth/phone/request",{ method: "POST", body: JSON.stringify({ phone }) }),
  verifyPhoneCode:  (phone, code) => request("/auth/phone/verify", { method: "POST", body: JSON.stringify({ phone, code }) }),
  me:          ()           => request("/me"),
  collection:  ()           => request("/me/collection"),
  zones:       (slug)       => request(`/malls/${slug}/zones`),
  spawns:      (slug)       => request(`/malls/${slug}/spawns`),
  catchSpawn:  (id, qr, q)  => request(`/spawns/${id}/catch`,
                                       { method: "POST", body: JSON.stringify({ qrSecret: qr, quality: q }) }),
  leaderboard: (limit = 50) => request(`/leaderboard?limit=${limit}`),
};

class GameSocket {
  constructor(mallSlug) {
    this.mallSlug = mallSlug;
    this.ws = null; this.listeners = new Map();
    this.reconnectTimer = null; this.shouldReconnect = true;
  }
  connect() {
    if (conn.isMock) {
      mockBackend.subscribeWS(this.mallSlug, (msg) => this._emit(msg));
      return;
    }
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const host = API_BASE ? new URL(API_BASE).host : location.host;
    try {
      this.ws = new WebSocket(`${proto}//${host}/ws?mall=${encodeURIComponent(this.mallSlug)}`);
      this.ws.onmessage = (e) => { try { this._emit(JSON.parse(e.data)); } catch {} };
      this.ws.onclose = () => {
        if (this.shouldReconnect) this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };
      this.ws.onerror = () => {};
    } catch {}
  }
  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    if (conn.isMock) mockBackend.unsubscribeWS(this.mallSlug);
  }
  on(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
    return () => this.listeners.get(type)?.delete(handler);
  }
  _emit({ type, payload }) { this.listeners.get(type)?.forEach(h => h(payload)); }
}

// =========================================================================
// useGame — главный хук
// =========================================================================
function useGame() {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [activeSpawnsRaw, setActiveSpawnsRaw] = useState([]);
  const [collection, setCollection] = useState([]);
  const [isMock, setIsMock] = useState(false);

  const wsRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    const boot = async () => {
      if (authStorage.get()) {
        try {
          const me = await gameAPI.me();
          if (me) {
            setUser(me);
            try { setCollection((await gameAPI.collection()).creatures); } catch {}
          }
        } catch { authStorage.clear(); }
      }
      setIsMock(conn.isMock);
      setIsBooting(false);
    };
    boot();
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadSpawns = async () => {
      try {
        const { spawns } = await gameAPI.spawns(MALL_SLUG);
        setActiveSpawnsRaw(spawns);
        setIsMock(conn.isMock);
      } catch {}
    };
    loadSpawns();
    pollRef.current = setInterval(loadSpawns, SPAWN_POLL_INTERVAL);

    const ws = new GameSocket(MALL_SLUG);
    wsRef.current = ws;
    const off1 = ws.on("spawn_created", (p) => {
      setActiveSpawnsRaw(prev => prev.some(s => s.id === p.id) ? prev : [...prev, p]);
    });
    const off2 = ws.on("spawn_expired", ({ id }) => {
      setActiveSpawnsRaw(prev => prev.filter(s => s.id !== id));
    });
    const off3 = ws.on("spawn_caught", ({ spawnId }) => {
      setActiveSpawnsRaw(prev => prev.filter(s => s.id !== spawnId));
    });
    ws.connect();
    return () => {
      clearInterval(pollRef.current);
      off1(); off2(); off3();
      ws.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setActiveSpawnsRaw(prev => prev.filter(s => new Date(s.expiresAt).getTime() > now));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const reloadCollection = async () => {
    try { setCollection((await gameAPI.collection()).creatures); } catch {}
  };

  const loginWithTelegram = async (tgData) => {
    const payload = tgData || {
      id: 123456, first_name: "Айдар",
      auth_date: Math.floor(Date.now() / 1000), hash: "mock",
    };
    const { token, user } = await gameAPI.loginTelegram(payload);
    authStorage.set(token);
    setUser(user);
    setIsMock(conn.isMock);
    await reloadCollection();
  };
  const requestPhoneCode = (phone) => gameAPI.requestPhoneCode(phone);
  const verifyPhoneCode = async (phone, code) => {
    const { token, user } = await gameAPI.verifyPhoneCode(phone, code);
    authStorage.set(token);
    setUser(user);
    setIsMock(conn.isMock);
    await reloadCollection();
  };
  const logout = () => {
    authStorage.clear();
    setUser(null);
    setActiveSpawnsRaw([]);
    setCollection([]);
  };

  const tryCatch = async (spawnId, quality, qrSecret) => {
    try {
      // qrSecret передаётся извне (из QR-сканера). Если его нет — подставляем
      // заглушку, которая пройдёт валидацию только в mock-режиме.
      const secret = qrSecret || "mock_qr_demo";
      const res = await gameAPI.catchSpawn(spawnId, secret, quality);
      if (res.ok) {
        setUser(u => u ? { ...u, points: res.user.points, catches_total: res.user.catchesTotal } : u);
        setActiveSpawnsRaw(prev => prev.filter(s => s.id !== spawnId));
        await reloadCollection();
      }
      return res;
    } catch (e) {
      return { ok: false, code: e.data?.code || e.code || "unknown_error" };
    }
  };

  const activeSpawns = activeSpawnsRaw.map(s => {
    const zone = ZONES.find(z => z.id === s.zoneSlug);
    const creature = CREATURES.find(c => c.id === s.creatureSlug);
    return { ...s, zone, creature: creature || { id: s.creatureSlug, name: s.creatureName, rarity: s.rarity } };
  });
  const caughtIds = collection.filter(c => (c.caught_count || 0) > 0).map(c => c.id);

  return {
    user, isBooting, isMock,
    activeSpawns, collection, caughtIds,
    loginWithTelegram, requestPhoneCode, verifyPhoneCode, logout,
    tryCatch,
  };
}

// =========================================================================
// QR-СКАНЕР
// =========================================================================
// Встроенная упрощённая версия. В реальном Vite-проекте полная версия
// с fallback на @zxing/browser живёт в src/lib/qrScanner.js.
//
// Здесь используем только native BarcodeDetector — работает в Chrome/Edge/
// Android Chrome и самых современных браузерах. На iOS Safari 18+ может
// не работать из-за бага WebKit — клиент увидит ошибку и предложит
// режим "без QR".

function parseQRPayload(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    let params;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      params = new URL(raw).searchParams;
    } else if (raw.includes("=")) {
      params = new URLSearchParams(raw.split("?").pop());
    } else {
      return null;
    }
    const mallSlug = params.get("mall");
    const zoneSlug = params.get("zone");
    const qrSecret = params.get("t");
    if (!mallSlug || !zoneSlug || !qrSecret) return null;
    return { mallSlug, zoneSlug, qrSecret };
  } catch {
    return null;
  }
}

async function hasNativeBarcodeDetector() {
  if (typeof window === "undefined" || !("BarcodeDetector" in window)) return false;
  try {
    const formats = await window.BarcodeDetector.getSupportedFormats();
    return formats.includes("qr_code");
  } catch {
    return false;
  }
}

class QRScannerInline {
  constructor() {
    this.video = null;
    this.running = false;
    this.onDetect = null;
    this._timer = null;
  }

  async start(videoEl, onDetect) {
    if (this.running) return;
    this.video = videoEl;
    this.onDetect = onDetect;
    this.running = true;

    const native = await hasNativeBarcodeDetector();
    if (!native) {
      // В артефакте нет @zxing — помечаем что сканер недоступен
      this.running = false;
      return { available: false };
    }

    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    let lastValue = null;
    let lastEmit = 0;

    const tick = async () => {
      if (!this.running || !this.video) return;
      if (this.video.readyState >= 2) {
        try {
          const codes = await detector.detect(this.video);
          if (codes.length > 0) {
            const value = codes[0].rawValue;
            const now = Date.now();
            if (value !== lastValue || now - lastEmit > 1500) {
              lastValue = value;
              lastEmit = now;
              const parsed = parseQRPayload(value);
              this.onDetect?.({ rawValue: value, parsed });
            }
          }
        } catch {}
      }
      this._timer = setTimeout(() => {
        if (this.running) requestAnimationFrame(tick);
      }, 120);
    };
    tick();
    return { available: true };
  }

  stop() {
    this.running = false;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this.video = null;
    this.onDetect = null;
  }
}

// ИКОНКИ СУЩЕСТВ (SVG)
// =========================================================================
const CreatureArt = ({ id, size = 80 }) => {
  const s = size;
  const props = { width: s, height: s, viewBox: "0 0 100 100" };

  switch (id) {
    case "vhodillo":
      return (
        <svg {...props}>
          <rect x="28" y="20" width="44" height="70" rx="6" fill="#B08968" stroke="#7F5539" strokeWidth="2.5"/>
          <rect x="33" y="25" width="34" height="30" fill="#DDA15E"/>
          <rect x="33" y="58" width="34" height="28" fill="#DDA15E"/>
          <circle cx="62" cy="55" r="3" fill="#FFD60A"/>
          <circle cx="62" cy="55" r="1.5" fill="#7F5539"/>
          <circle cx="40" cy="42" r="5" fill="#fff"/>
          <circle cx="55" cy="42" r="5" fill="#fff"/>
          <circle cx="40" cy="43" r="2.5" fill="#0A0E27"/>
          <circle cx="55" cy="43" r="2.5" fill="#0A0E27"/>
          <path d="M40 70 Q47 75 54 70" stroke="#7F5539" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "fontanik":
      return (
        <svg {...props}>
          <defs>
            <radialGradient id="f-grad" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#A2E4FF" />
              <stop offset="100%" stopColor="#0096C7" />
            </radialGradient>
          </defs>
          <path d="M50 15 Q20 60 20 75 a30 30 0 0 0 60 0 Q80 60 50 15 Z" fill="url(#f-grad)"/>
          <ellipse cx="38" cy="65" rx="8" ry="10" fill="#fff"/>
          <ellipse cx="62" cy="65" rx="8" ry="10" fill="#fff"/>
          <circle cx="38" cy="67" r="4" fill="#0A0E27"/>
          <circle cx="62" cy="67" r="4" fill="#0A0E27"/>
          <circle cx="39" cy="65" r="1.5" fill="#fff"/>
          <circle cx="63" cy="65" r="1.5" fill="#fff"/>
          <path d="M42 80 Q50 85 58 80" stroke="#0A0E27" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "popkornik":
      return (
        <svg {...props}>
          <defs>
            <pattern id="stripe" patternUnits="userSpaceOnUse" width="8" height="28">
              <rect width="4" height="28" fill="#fff"/>
            </pattern>
          </defs>
          {[[30,40],[50,30],[70,40],[40,55],[60,55],[50,48]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="14" fill="#FFE66D" stroke="#FFB703" strokeWidth="2"/>
          ))}
          <rect x="28" y="60" width="44" height="28" rx="2" fill="#E63946"/>
          <rect x="28" y="60" width="44" height="28" rx="2" fill="url(#stripe)"/>
          <circle cx="42" cy="72" r="3" fill="#0A0E27"/>
          <circle cx="58" cy="72" r="3" fill="#0A0E27"/>
          <path d="M44 80 Q50 84 56 80" stroke="#0A0E27" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "karamelka":
      return (
        <svg {...props}>
          <circle cx="50" cy="50" r="28" fill="#FF006E"/>
          <path d="M22 50 Q10 45 8 50 Q10 55 22 50 Z" fill="#FF006E"/>
          <path d="M78 50 Q90 45 92 50 Q90 55 78 50 Z" fill="#FF006E"/>
          <circle cx="50" cy="50" r="28" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4 5"/>
          <circle cx="42" cy="47" r="4" fill="#fff"/>
          <circle cx="58" cy="47" r="4" fill="#fff"/>
          <circle cx="42" cy="48" r="2" fill="#0A0E27"/>
          <circle cx="58" cy="48" r="2" fill="#0A0E27"/>
          <path d="M42 58 Q50 64 58 58" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "chekistik":
      return (
        <svg {...props}>
          <path d="M30 15 L70 15 L70 85 L65 82 L60 85 L55 82 L50 85 L45 82 L40 85 L35 82 L30 85 Z"
                fill="#fff" stroke="#8B93B8" strokeWidth="1.5"/>
          <line x1="35" y1="25" x2="65" y2="25" stroke="#8B93B8" strokeWidth="1"/>
          <line x1="35" y1="30" x2="60" y2="30" stroke="#8B93B8" strokeWidth="1"/>
          <line x1="35" y1="60" x2="55" y2="60" stroke="#8B93B8" strokeWidth="1"/>
          <line x1="35" y1="65" x2="60" y2="65" stroke="#8B93B8" strokeWidth="1"/>
          <line x1="35" y1="70" x2="50" y2="70" stroke="#8B93B8" strokeWidth="1"/>
          <circle cx="42" cy="42" r="4" fill="#0A0E27"/>
          <circle cx="58" cy="42" r="4" fill="#0A0E27"/>
          <circle cx="42.5" cy="41" r="1.2" fill="#fff"/>
          <circle cx="58.5" cy="41" r="1.2" fill="#fff"/>
          <path d="M42 50 Q50 54 58 50" stroke="#FF006E" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "shopoglot":
      return (
        <svg {...props}>
          <path d="M25 35 L75 35 L72 85 Q50 92 28 85 Z" fill="#F77F00" stroke="#D62828" strokeWidth="2"/>
          <path d="M32 35 Q32 20 42 20 Q42 30 42 35" stroke="#D62828" strokeWidth="3" fill="none"/>
          <path d="M68 35 Q68 20 58 20 Q58 30 58 35" stroke="#D62828" strokeWidth="3" fill="none"/>
          <circle cx="40" cy="55" r="6" fill="#fff"/>
          <circle cx="60" cy="55" r="6" fill="#fff"/>
          <circle cx="40" cy="56" r="3" fill="#0A0E27"/>
          <circle cx="60" cy="56" r="3" fill="#0A0E27"/>
          <path d="M35 72 Q50 80 65 72 Q60 76 50 76 Q40 76 35 72 Z" fill="#0A0E27"/>
          <path d="M40 72 L42 76 M46 72 L46 77 M54 72 L54 77 M60 72 L58 76" stroke="#fff" strokeWidth="1"/>
        </svg>
      );
    case "pufik":
      return (
        <svg {...props}>
          <path d="M20 60 Q15 45 30 42 Q30 28 48 30 Q55 22 70 32 Q85 32 82 50 Q90 58 80 70 Q70 80 50 78 Q30 80 22 72 Q15 68 20 60 Z"
                fill="#B388EB" stroke="#8338EC" strokeWidth="2"/>
          <circle cx="42" cy="55" r="5" fill="#fff"/>
          <circle cx="62" cy="55" r="5" fill="#fff"/>
          <circle cx="42" cy="56" r="2.5" fill="#0A0E27"/>
          <circle cx="62" cy="56" r="2.5" fill="#0A0E27"/>
          <ellipse cx="36" cy="65" rx="4" ry="2" fill="#FF006E" opacity=".6"/>
          <ellipse cx="66" cy="65" rx="4" ry="2" fill="#FF006E" opacity=".6"/>
          <path d="M46 66 Q50 70 54 66" stroke="#0A0E27" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "chasenysh":
      return (
        <svg {...props}>
          <circle cx="50" cy="50" r="35" fill="#C1121F" stroke="#780000" strokeWidth="3"/>
          <circle cx="50" cy="50" r="28" fill="#FDF0D5"/>
          {[0,1,2,3].map(i => (
            <line key={i} x1={50 + Math.cos(i*Math.PI/2 - Math.PI/2)*22} y1={50 + Math.sin(i*Math.PI/2 - Math.PI/2)*22}
                  x2={50 + Math.cos(i*Math.PI/2 - Math.PI/2)*26} y2={50 + Math.sin(i*Math.PI/2 - Math.PI/2)*26}
                  stroke="#780000" strokeWidth="2"/>
          ))}
          <line x1="50" y1="50" x2="50" y2="35" stroke="#0A0E27" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="50" y1="50" x2="62" y2="55" stroke="#0A0E27" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="3" fill="#0A0E27"/>
          <circle cx="40" cy="44" r="3" fill="#0A0E27"/>
          <circle cx="60" cy="44" r="3" fill="#0A0E27"/>
          <circle cx="40.5" cy="43.5" r="1" fill="#fff"/>
          <circle cx="60.5" cy="43.5" r="1" fill="#fff"/>
        </svg>
      );
    case "eskalatron":
      return (
        <svg {...props}>
          <rect x="28" y="30" width="44" height="50" rx="4" fill="#00F5D4" stroke="#0A0E27" strokeWidth="2"/>
          <rect x="22" y="38" width="8" height="34" rx="2" fill="#06D6A0"/>
          <rect x="70" y="38" width="8" height="34" rx="2" fill="#06D6A0"/>
          <rect x="34" y="40" width="32" height="20" rx="2" fill="#0A0E27"/>
          <circle cx="42" cy="50" r="4" fill="#FFD60A"/>
          <circle cx="58" cy="50" r="4" fill="#FFD60A"/>
          <rect x="40" y="65" width="20" height="4" rx="1" fill="#0A0E27"/>
          <rect x="36" y="80" width="10" height="12" fill="#06D6A0" stroke="#0A0E27" strokeWidth="2"/>
          <rect x="54" y="80" width="10" height="12" fill="#06D6A0" stroke="#0A0E27" strokeWidth="2"/>
          <rect x="44" y="22" width="3" height="8" fill="#FF006E"/>
          <rect x="53" y="22" width="3" height="8" fill="#FF006E"/>
        </svg>
      );
    case "lampushkin":
      return (
        <svg {...props}>
          <ellipse cx="50" cy="45" rx="30" ry="28" fill="#06D6A0" opacity=".35"/>
          <path d="M35 25 Q50 15 65 25 L68 55 Q50 62 32 55 Z" fill="#06D6A0" stroke="#0A0E27" strokeWidth="2"/>
          <rect x="44" y="55" width="12" height="6" fill="#8B5A3C"/>
          <path d="M32 60 Q35 80 28 88 M50 62 Q50 82 45 90 M68 60 Q65 80 72 88" stroke="#06D6A0" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="43" cy="38" r="4" fill="#fff"/>
          <circle cx="57" cy="38" r="4" fill="#fff"/>
          <circle cx="43" cy="39" r="2" fill="#0A0E27"/>
          <circle cx="57" cy="39" r="2" fill="#0A0E27"/>
          <circle cx="50" cy="35" r="10" fill="#FFD60A" opacity=".4"/>
        </svg>
      );
    case "neonik":
      return (
        <svg {...props}>
          <path d="M25 40 L25 70 M25 40 Q25 30 35 30 L45 30 M35 55 L45 55 M45 30 L45 70"
                stroke="#FF006E" strokeWidth="5" fill="none" strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #FF006E)" }}/>
          <path d="M55 30 L55 70 M55 30 L75 30 M55 50 L70 50 M55 70 L75 70"
                stroke="#00F5D4" strokeWidth="5" fill="none" strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #00F5D4)" }}/>
          <circle cx="33" cy="42" r="2.5" fill="#FFD60A"/>
          <circle cx="42" cy="42" r="2.5" fill="#FFD60A"/>
          <path d="M32 50 Q37 54 42 50" stroke="#FFD60A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case "mrampampam":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="m-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD60A"/>
              <stop offset="50%" stopColor="#FF006E"/>
              <stop offset="100%" stopColor="#8338EC"/>
            </linearGradient>
          </defs>
          <polygon points="50,12 62,35 88,38 68,55 76,82 50,68 24,82 32,55 12,38 38,35"
                   fill="url(#m-grad)" stroke="#FFD60A" strokeWidth="2"/>
          <circle cx="50" cy="45" r="16" fill="#0A0E27"/>
          <circle cx="43" cy="42" r="4" fill="#fff"/>
          <circle cx="57" cy="42" r="4" fill="#fff"/>
          <circle cx="44" cy="43" r="2" fill="#FFD60A"/>
          <circle cx="58" cy="43" r="2" fill="#FFD60A"/>
          <path d="M42 52 Q50 58 58 52" stroke="#FFD60A" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    default:
      return <svg {...props}><circle cx="50" cy="50" r="30" fill="#888"/></svg>;
  }
};

// =========================================================================
// ОНБОРДИНГ — первый вход
// =========================================================================
const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      art: <CreatureArt id="mrampampam" size={140}/>,
      title: "Добро пожаловать!",
      text: "В нашем торговом центре спрятались 12 существ. Они появляются в разных зонах и ждут, когда их найдут.",
    },
    {
      art: (
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full"
               style={{ background: `${THEME.cyan}44`, filter: "blur(20px)" }}/>
          <div className="relative w-32 h-32 rounded-2xl flex items-center justify-center"
               style={{ background: THEME.surface, border: `2px solid ${THEME.cyan}` }}>
            <svg viewBox="0 0 10 10" width="70" height="70">
              {[[0,0,3,3],[7,0,3,3],[0,7,3,3],[1,1,1,1],[8,1,1,1],[1,8,1,1],
                [4,0,1,1],[5,1,1,1],[4,2,1,1],[6,3,1,1],[4,4,1,1],[5,5,1,1]]
                .map(([x,y,w,h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#fff"/>)}
            </svg>
          </div>
        </div>
      ),
      title: "Ищи по карте",
      text: "На карте ТЦ видно, где сейчас есть существо. Подбегай к этому месту и сканируй QR-код — существо появится.",
    },
    {
      art: (
        <div className="flex gap-3 items-end">
          <CreatureArt id="pufik" size={60}/>
          <CreatureArt id="popkornik" size={80}/>
          <CreatureArt id="karamelka" size={60}/>
        </div>
      ),
      title: "Лови и получай призы!",
      text: "За каждого пойманного существа дают очки. Обменивай их в магазине на попкорн, скидки и призы от ТЦ.",
    },
  ];
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="h-full flex flex-col px-6 pt-12 pb-10"
         style={{ background: `radial-gradient(ellipse at top, ${THEME.violet}22 0%, ${THEME.bg} 60%)` }}>
      <div className="flex gap-1.5 mb-8">
        {steps.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
               style={{ background: i <= step ? THEME.cyan : THEME.line }}/>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-10" key={step} style={{ animation: "float 3s ease-in-out infinite" }}>
          {current.art}
        </div>
        <h2 style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 30, lineHeight: 1.1 }}>
          {current.title}
        </h2>
        <p className="mt-5 text-base leading-relaxed max-w-xs"
           style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
          {current.text}
        </p>
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 rounded-2xl font-bold transition active:scale-95"
                  style={{ background: THEME.surfaceHi, color: THEME.text,
                           fontFamily: "'Onest', sans-serif", border: `1px solid ${THEME.line}` }}>
            Назад
          </button>
        )}
        <button onClick={() => isLast ? onComplete() : setStep(step + 1)}
                className="flex-1 py-4 rounded-2xl font-bold transition active:scale-95"
                style={{ background: THEME.cyan, color: THEME.bg, fontFamily: "'Onest', sans-serif" }}>
          {isLast ? "Начать охоту!" : "Дальше"}
        </button>
      </div>

      {!isLast && (
        <button onClick={onComplete} className="mt-3 text-xs py-2" style={{ color: THEME.textDim }}>
          пропустить
        </button>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
};

// =========================================================================
// ВХОД
// =========================================================================
const LoginScreen = ({ onLogin, onRequestCode }) => {
  const [phase, setPhase] = useState("main");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [hint, setHint] = useState(null); // для показа debugCode в mock-режиме

  const requestCode = async () => {
    setRequesting(true);
    setHint(null);
    try {
      const res = await onRequestCode(phone);
      if (res?.debugCode) setHint(`демо: код = ${res.debugCode}`);
      setPhase("code");
    } catch {
      setHint("не удалось отправить SMS");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-10"
         style={{ background: `radial-gradient(ellipse at top, ${THEME.violet}33 0%, ${THEME.bg} 60%)` }}>
      <div className="text-center pt-8">
        <div className="inline-flex items-center justify-center mb-4" style={{ transform: "rotate(-3deg)" }}>
          <div className="relative">
            <div className="absolute inset-0 blur-xl" style={{ background: THEME.cyan, opacity: .4 }}/>
            <CreatureArt id="mrampampam" size={110}/>
          </div>
        </div>
        <h1 className="text-5xl mb-2" style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, letterSpacing: "-.02em", lineHeight: "1" }}>
          MALL<br/>
          <span style={{ color: THEME.cyan }}>HUNT</span>
        </h1>
        <p className="mt-4 text-sm" style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
          лови существ, которые прячутся<br/>в разных уголках торгового центра
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {phase === "main" && (
          <>
            <button
              onClick={() => onLogin({ name: "Айдар", avatar: "🦊", via: "telegram" })}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition active:scale-95"
              style={{ background: "#229ED9", color: "#fff", fontFamily: "'Onest', sans-serif" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.9 8.16l-1.97 9.28c-.15.66-.54.82-1.1.51l-3.03-2.23-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.1 5.64-5.1c.25-.22-.05-.34-.38-.12l-6.97 4.39-3-.94c-.65-.2-.66-.65.14-.96l11.75-4.53c.54-.2 1.02.13.84.99z"/>
              </svg>
              Войти через Telegram
            </button>
            <button
              onClick={() => setPhase("phone")}
              className="w-full py-4 rounded-2xl font-bold text-base transition active:scale-95"
              style={{ background: THEME.surfaceHi, color: THEME.text, fontFamily: "'Onest', sans-serif",
                       border: `1px solid ${THEME.line}` }}>
              Войти по номеру телефона
            </button>
            <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: THEME.textDim }}>
              Нажимая «войти», вы соглашаетесь с правилами игры.<br/>
              Игрокам до 14 лет — с разрешения родителей.
            </p>
          </>
        )}

        {phase === "phone" && (
          <div className="space-y-3">
            <label className="text-sm" style={{ color: THEME.textDim }}>Номер телефона</label>
            <input
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full py-4 px-4 rounded-2xl outline-none"
              style={{ background: THEME.surfaceHi, color: THEME.text,
                       border: `1px solid ${THEME.line}`, fontFamily: "'Onest', sans-serif" }}/>
            <button
              onClick={requestCode}
              disabled={phone.length < 5 || requesting}
              className="w-full py-4 rounded-2xl font-bold transition active:scale-95 disabled:opacity-40"
              style={{ background: THEME.cyan, color: THEME.bg, fontFamily: "'Onest', sans-serif" }}>
              {requesting ? "Отправляем..." : "Получить код"}
            </button>
            {hint && (
              <div className="text-xs text-center py-2"
                   style={{ color: THEME.yellow, fontFamily: "'Onest', sans-serif" }}>
                {hint}
              </div>
            )}
            <button onClick={() => setPhase("main")} className="w-full text-sm py-2" style={{ color: THEME.textDim }}>
              ← назад
            </button>
          </div>
        )}

        {phase === "code" && (
          <div className="space-y-3">
            <label className="text-sm" style={{ color: THEME.textDim }}>Код из SMS</label>
            <input
              type="text"
              placeholder="• • • •"
              maxLength="4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full py-4 px-4 rounded-2xl outline-none text-center text-3xl tracking-widest"
              style={{ background: THEME.surfaceHi, color: THEME.text,
                       border: `1px solid ${THEME.line}`, fontFamily: "'Bungee', sans-serif" }}/>
            <button
              onClick={() => onLogin({ via: "phone", phone, code })}
              disabled={code.length !== 4}
              className="w-full py-4 rounded-2xl font-bold transition active:scale-95 disabled:opacity-40"
              style={{ background: THEME.cyan, color: THEME.bg, fontFamily: "'Onest', sans-serif" }}>
              Войти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// ПАНЕЛЬ С ОЧКАМИ (общая)
// =========================================================================
const PointsBadge = ({ points, color = THEME.yellow }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
       style={{ background: `${color}18`, border: `1px solid ${color}55` }}>
    <span style={{ color }}>✦</span>
    <span style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 13 }}>
      {points}
    </span>
  </div>
);

// =========================================================================
// КАРТА
// =========================================================================
const MapScreen = ({ activeSpawns, onZoneTap, user, caughtIds, points, newsFeed }) => {
  // случайная позиция «вы здесь»
  const [youPos] = useState({ x: 210, y: 250 });

  return (
    <div className="h-full overflow-y-auto pb-24" style={{ background: THEME.bg }}>
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
           style={{ background: `linear-gradient(180deg, ${THEME.bg} 70%, transparent)` }}>
        <div>
          <div className="text-xs" style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
            Привет, {user.name} {user.avatar}
          </div>
          <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 20, lineHeight: 1 }}>
            MEGA <span style={{ color: THEME.cyan }}>MALL</span>
          </div>
        </div>
        <PointsBadge points={points}/>
      </div>

      {/* Лента событий */}
      {newsFeed.length > 0 && (
        <div className="mx-5 mb-3 p-3 rounded-xl flex items-center gap-3 overflow-hidden"
             style={{ background: `${THEME.pink}12`, border: `1px solid ${THEME.pink}40` }}>
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: THEME.pink }}/>
            <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: THEME.pink }}/>
          </div>
          <div className="text-xs overflow-hidden whitespace-nowrap text-ellipsis"
               style={{ color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
            {newsFeed[0]}
          </div>
        </div>
      )}

      <div className="mx-5 mb-3 p-3 rounded-xl flex items-center gap-3"
           style={{ background: `${THEME.cyan}15`, border: `1px solid ${THEME.cyan}40` }}>
        <div className="relative">
          <div className="w-2 h-2 rounded-full" style={{ background: THEME.cyan }}/>
          <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping" style={{ background: THEME.cyan }}/>
        </div>
        <div className="text-xs" style={{ color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
          активных существ: <b>{activeSpawns.length}</b> — беги их ловить!
        </div>
      </div>

      {/* SVG-карта */}
      <div className="mx-4 rounded-3xl overflow-hidden" style={{ background: THEME.surface, border: `1px solid ${THEME.line}` }}>
        <svg viewBox="0 0 620 460" className="w-full">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={THEME.line} strokeWidth=".5" opacity=".5"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width="620" height="460" fill="url(#grid)"/>

          <path d="M20 60 L600 60 L600 440 L20 440 Z M20 250 L120 250 L120 330 L20 330"
                fill="none" stroke={THEME.line} strokeWidth="2"/>
          <path d="M50 280 Q130 240 180 200 Q260 180 340 120 Q420 160 480 210 Q520 260 560 310 Q500 360 470 380 Q400 360 320 340 Q240 360 140 380 Q90 330 50 280"
                fill="none" stroke={THEME.line} strokeWidth="2" strokeDasharray="4 6" opacity=".6"/>

          <text x="310" y="85" textAnchor="middle" fill={THEME.textDim} fontSize="10" fontFamily="Onest, sans-serif" letterSpacing="2">
            ВЕРХНИЙ ЯРУС
          </text>
          <text x="310" y="430" textAnchor="middle" fill={THEME.textDim} fontSize="10" fontFamily="Onest, sans-serif" letterSpacing="2">
            НИЖНИЙ ЯРУС
          </text>

          {/* Зоны */}
          {ZONES.map(zone => {
            const spawn = activeSpawns.find(s => s.zone === zone.id);
            const creature = spawn ? CREATURES.find(c => c.id === spawn.creatureId) : null;
            const rar = creature ? RARITY[creature.rarity] : null;

            return (
              <g key={zone.id} onClick={() => onZoneTap(zone, spawn, creature)} style={{ cursor: "pointer" }}>
                <circle cx={zone.x} cy={zone.y} r={zone.r}
                        fill={spawn ? `${rar.color}20` : `${THEME.surfaceHi}`}
                        stroke={spawn ? rar.color : THEME.line}
                        strokeWidth={spawn ? 2 : 1.5}/>
                {spawn && (
                  <>
                    <circle cx={zone.x} cy={zone.y} r={zone.r} fill="none" stroke={rar.color} strokeWidth="2">
                      <animate attributeName="r" values={`${zone.r};${zone.r + 18}`} dur="1.8s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite"/>
                    </circle>
                    <g transform={`translate(${zone.x - 22}, ${zone.y - 22})`} filter="url(#glow)">
                      <foreignObject width="44" height="44">
                        <div style={{ width: 44, height: 44 }}>
                          <CreatureArt id={creature.id} size={44}/>
                        </div>
                      </foreignObject>
                    </g>
                  </>
                )}
                <text x={zone.x} y={zone.y + zone.r + 14} textAnchor="middle"
                      fill={spawn ? rar.color : THEME.textDim}
                      fontSize="11"
                      fontFamily="Onest, sans-serif"
                      fontWeight={spawn ? 700 : 400}>
                  {zone.name}
                </text>
              </g>
            );
          })}

          {/* ВЫ ЗДЕСЬ — маркер игрока */}
          <g>
            <circle cx={youPos.x} cy={youPos.y} r="14" fill={`${THEME.pink}33`}>
              <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".6;0;0.6" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx={youPos.x} cy={youPos.y} r="8" fill={THEME.pink} stroke="#fff" strokeWidth="2"/>
            <text x={youPos.x} y={youPos.y + 25} textAnchor="middle"
                  fill={THEME.pink} fontSize="9" fontFamily="Onest, sans-serif" fontWeight="700">
              ВЫ ЗДЕСЬ
            </text>
          </g>
        </svg>
      </div>

      {/* Список активных */}
      <div className="mx-5 mt-5">
        <div className="text-xs mb-3 uppercase tracking-widest" style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
          Сейчас можно поймать
        </div>
        {activeSpawns.length === 0 && (
          <div className="text-sm p-6 text-center rounded-2xl"
               style={{ background: THEME.surface, color: THEME.textDim, border: `1px dashed ${THEME.line}` }}>
            Пока никого… подожди немного 👀
          </div>
        )}
        <div className="space-y-2">
          {activeSpawns.map(spawn => {
            const creature = CREATURES.find(c => c.id === spawn.creatureId);
            const zone = ZONES.find(z => z.id === spawn.zone);
            const rar = RARITY[creature.rarity];
            return (
              <div key={spawn.zone}
                   onClick={() => onZoneTap(zone, spawn, creature)}
                   className="flex items-center gap-4 p-3 rounded-2xl transition active:scale-98 cursor-pointer"
                   style={{ background: THEME.surface, border: `1px solid ${rar.color}55` }}>
                <CreatureArt id={creature.id} size={52}/>
                <div className="flex-1">
                  <div style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 15 }}>
                    {creature.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase"
                          style={{ background: `${rar.color}22`, color: rar.color, fontFamily: "'Onest', sans-serif" }}>
                      {rar.label}
                    </span>
                    <span className="text-xs" style={{ color: THEME.textDim }}>
                      📍 {zone.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ color: rar.color, fontFamily: "'Bungee', sans-serif", fontSize: 14 }}>
                    +{rar.points}
                  </div>
                  <div style={{ color: THEME.textDim, fontSize: 9 }}>очков</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// AR DEMO — реальный marker-based AR через MindAR + Three.js
// =========================================================================
// Загружает MindAR лениво (через CDN) чтобы не раздувать основной бандл.
// Использует placeholder-сферу вместо GLTF — это прототип, проверяем
// работоспособность технологии до вложения в 3D-моделлинг.
//
// Тестовый маркер — официальный пример "card.mind" от MindAR.
// Для теста распечатай картинку с их репозитория или открой на втором экране:
//   https://raw.githubusercontent.com/hiukim/mind-ar-js/master/examples/image-tracking/assets/card-example/card.png
// =========================================================================

const MINDAR_CDN = "https://esm.sh/mind-ar@1.2.5/dist/mindar-image-three.prod.js";
const THREE_CDN  = "https://esm.sh/three@0.160.0";
const DEFAULT_MARKER = "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind";
const SAMPLE_TARGET_IMAGE = "https://raw.githubusercontent.com/hiukim/mind-ar-js/master/examples/image-tracking/assets/card-example/card.png";

const ArDemoScreen = ({ onBack }) => {
  const containerRef = useRef(null);
  const arRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro | loading | scanning | found
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage] = useState("");
  const [error, setError] = useState(null);
  const [catches, setCatches] = useState(0);
  const [showTargetHelper, setShowTargetHelper] = useState(false);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      try { arRef.current?.stop(); } catch {}
    };
  }, []);

  const startAR = async () => {
    setError(null);
    setPhase("loading");
    setLoadProgress(0);

    try {
      // Динамически подгружаем Three.js + MindAR
      setLoadStage("three.js");
      setLoadProgress(10);
      const THREE = await import(/* @vite-ignore */ THREE_CDN);

      setLoadStage("mindar");
      setLoadProgress(40);
      const MindARModule = await import(/* @vite-ignore */ MINDAR_CDN);
      const MindARThree = MindARModule.MindARThree;

      setLoadStage("сцена");
      setLoadProgress(75);

      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: DEFAULT_MARKER,
        uiScanning: "no",
        uiLoading: "no",
        maxTrack: 1,
      });

      arRef.current = {
        stop: () => {
          try {
            mindarThree.renderer?.setAnimationLoop(null);
            mindarThree.stop?.();
          } catch {}
        },
      };

      const { scene, camera, renderer } = mindarThree;

      // Освещение для 3D-существа
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(1, 2, 3);
      scene.add(dir);

      const anchor = mindarThree.addAnchor(0);

      // --- Placeholder существо: стилизованная сияющая сфера с глазками ---
      const creatureGroup = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 0.4,
          metalness: 0.3, roughness: 0.4,
        })
      );
      creatureGroup.add(body);

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const eyeGeom = new THREE.SphereGeometry(0.06, 16, 16);
      const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
      leftEye.position.set(-0.12, 0.08, 0.26);
      creatureGroup.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
      rightEye.position.set(0.12, 0.08, 0.26);
      creatureGroup.add(rightEye);

      // Аура
      const aura = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 32, 32),
        new THREE.MeshBasicMaterial({
          color: 0x00f5d4, transparent: true, opacity: 0.15,
          side: THREE.BackSide,
        })
      );
      creatureGroup.add(aura);

      creatureGroup.position.z = 0.3;
      anchor.group.add(creatureGroup);

      // Обработка попадания в маркер
      anchor.onTargetFound = () => setPhase("found");
      anchor.onTargetLost = () => setPhase("scanning");

      // Тап по существу → поимка
      const handleTap = () => {
        if (!anchor.visible) return;
        // Анимация "поимки" — существо масштабируется до нуля и исчезает
        const startScale = creatureGroup.scale.x;
        const startTime = performance.now();
        const duration = 600;
        const animate = () => {
          const elapsed = performance.now() - startTime;
          const t = Math.min(elapsed / duration, 1);
          const scale = startScale * (1 - t);
          creatureGroup.scale.set(scale, scale, scale);
          creatureGroup.rotation.y = t * Math.PI * 4;
          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            setCatches(c => c + 1);
            // Возвращаем существо через 2 секунды
            setTimeout(() => {
              creatureGroup.scale.set(1, 1, 1);
              creatureGroup.rotation.y = 0;
            }, 2000);
          }
        };
        animate();
      };
      renderer.domElement.addEventListener("click", handleTap);
      renderer.domElement.addEventListener("touchstart", handleTap, { passive: true });

      setLoadProgress(100);
      await mindarThree.start();

      // Рендер-цикл с анимацией
      renderer.setAnimationLoop(() => {
        const t = performance.now() / 1000;
        if (creatureGroup.scale.x > 0.01) {
          creatureGroup.rotation.y += 0.008;
          creatureGroup.position.y = Math.sin(t * 2) * 0.08;
        }
        renderer.render(scene, camera);
      });

      setPhase("scanning");
    } catch (e) {
      console.error("[ar-demo] failed to start:", e);
      setError(e.message || "не удалось запустить AR");
      setPhase("intro");
    }
  };

  // --- РЕНДЕР ---

  if (phase === "intro") {
    return (
      <div className="absolute inset-0 flex flex-col" style={{ background: THEME.bg }}>
        <div className="px-5 pt-6 pb-4 flex items-center gap-3"
             style={{ borderBottom: `1px solid ${THEME.line}` }}>
          <button onClick={onBack}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: THEME.surfaceHi, color: THEME.text }}>
            ←
          </button>
          <div>
            <div className="font-bold text-base" style={{ color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
              AR 3D · превью
            </div>
            <div className="text-[10px] uppercase tracking-widest"
                 style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
              прототип · не в продакшене
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-6 space-y-4">
          <div className="rounded-3xl p-6 text-center"
               style={{ background: `linear-gradient(135deg, ${THEME.violet}33, ${THEME.cyan}22)`,
                        border: `1px solid ${THEME.line}` }}>
            <div className="text-5xl mb-3">🎯</div>
            <div className="font-bold text-xl mb-2"
                 style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif" }}>
              Настоящий AR
            </div>
            <div className="text-sm leading-relaxed"
                 style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
              Существо появится на реальной поверхности — привязанное к
              распечатанной картинке-маркеру.
            </div>
          </div>

          <div className="rounded-2xl p-4"
               style={{ background: THEME.surfaceHi, border: `1px solid ${THEME.line}` }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: THEME.yellow, fontFamily: "'Onest', sans-serif" }}>
              Для теста нужно
            </div>
            <ol className="space-y-3 text-sm" style={{ color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
              <li className="flex gap-3">
                <span className="font-bold" style={{ color: THEME.cyan }}>1.</span>
                <span>Открой картинку-маркер на другом экране
                  (компьютер, планшет) или распечатай</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold" style={{ color: THEME.cyan }}>2.</span>
                <span>Нажми «Включить камеру» ниже</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold" style={{ color: THEME.cyan }}>3.</span>
                <span>Наведи камеру телефона на картинку</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold" style={{ color: THEME.cyan }}>4.</span>
                <span>Появится 3D-существо на картинке — тапни по нему чтобы поймать</span>
              </li>
            </ol>
            <button onClick={() => setShowTargetHelper(true)}
                    className="mt-4 text-xs underline"
                    style={{ color: THEME.cyan, fontFamily: "'Onest', sans-serif" }}>
              Показать картинку-маркер →
            </button>
          </div>

          <div className="text-xs p-3 rounded-xl"
               style={{ background: `${THEME.yellow}15`, color: THEME.yellow,
                        border: `1px solid ${THEME.yellow}44`,
                        fontFamily: "'Onest', sans-serif" }}>
            ⚠ Будет скачано ~10 MB (MindAR + Three.js). На 3G это 15-30 секунд.
          </div>

          {error && (
            <div className="text-xs p-3 rounded-xl"
                 style={{ background: `${THEME.pink}15`, color: THEME.pink,
                          border: `1px solid ${THEME.pink}44`,
                          fontFamily: "'Onest', sans-serif" }}>
              {error}
            </div>
          )}

          <button onClick={startAR}
                  className="w-full py-4 rounded-2xl font-bold transition active:scale-95"
                  style={{ background: THEME.cyan, color: THEME.bg, fontFamily: "'Onest', sans-serif" }}>
            Включить камеру →
          </button>
        </div>

        {/* Модалка с картинкой-маркером */}
        {showTargetHelper && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-50"
               style={{ background: "rgba(0,0,0,.85)" }}
               onClick={() => setShowTargetHelper(false)}>
            <div className="bg-white rounded-3xl p-4 max-w-[90%]"
                 onClick={(e) => e.stopPropagation()}>
              <img src={SAMPLE_TARGET_IMAGE} alt="Тестовый маркер"
                   className="w-full rounded-xl" crossOrigin="anonymous"/>
              <div className="mt-3 text-xs text-center font-mono text-gray-600">
                Наведи камеру сюда. Или открой URL{" "}
                <a href={SAMPLE_TARGET_IMAGE} className="underline break-all" target="_blank" rel="noopener">
                  на другом устройстве
                </a>
              </div>
              <button onClick={() => setShowTargetHelper(false)}
                      className="mt-3 w-full py-2 rounded-xl bg-black text-white text-sm font-bold">
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8"
           style={{ background: THEME.bg }}>
        <div className="text-4xl mb-5 animate-spin" style={{ animationDuration: "2s" }}>🌀</div>
        <div className="font-bold text-lg mb-1"
             style={{ color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
          Загружаем AR-движок
        </div>
        <div className="text-xs mb-6"
             style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
          стадия: {loadStage}
        </div>

        <div className="w-full max-w-xs h-2 rounded-full overflow-hidden"
             style={{ background: THEME.surfaceHi }}>
          <div className="h-full transition-all duration-300"
               style={{ width: `${loadProgress}%`, background: THEME.cyan }}/>
        </div>
        <div className="mt-2 text-xs" style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
          {loadProgress}%
        </div>
      </div>
    );
  }

  // phase === "scanning" | "found"
  return (
    <div className="absolute inset-0" style={{ background: "#000" }}>
      {/* MindAR сам создаёт video и canvas внутри контейнера */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden"/>

      {/* Overlay UI */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10"
           style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.6), transparent)" }}>
        <button onClick={onBack}
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{ background: "rgba(0,0,0,.5)", color: "#fff" }}>
          ←
        </button>
        <div className="px-3 py-1.5 rounded-full backdrop-blur-md"
             style={{ background: "rgba(0,0,0,.5)", color: "#fff",
                      fontFamily: "'Onest', sans-serif", fontSize: 12 }}>
          Поймано: <span className="font-bold" style={{ color: THEME.cyan }}>{catches}</span>
        </div>
      </div>

      {/* Подсказка внизу */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="rounded-2xl p-4 text-center backdrop-blur-md"
             style={{ background: "rgba(0,0,0,.65)", color: "#fff",
                      border: `1px solid ${phase === "found" ? THEME.cyan + "88" : "rgba(255,255,255,.15)"}`,
                      fontFamily: "'Onest', sans-serif", fontSize: 13 }}>
          {phase === "scanning" ? (
            <>
              <div className="mb-1" style={{ color: THEME.cyan }}>● сканирую картинку...</div>
              <div className="text-xs opacity-70">Наведи камеру на картинку-маркер</div>
            </>
          ) : (
            <>
              <div className="mb-1 font-bold" style={{ color: THEME.cyan }}>✓ существо найдено!</div>
              <div className="text-xs opacity-70">Тапни по нему чтобы поймать</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// AR-РЕЖИМ ПОИМКИ
// Единый экран: камера + 3D-эффект существа + бросок шара свайпом
// =========================================================================
const ARScreen = ({ zone, creature, onCaught, onEscaped, onCancel, expectedZoneSlug, onQRScanned, qrScanEnabled = true }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | requesting | ready | error
  const [cameraError, setCameraError] = useState(null);
  const [phase, setPhase] = useState("permission"); // permission | scanning | spawned | catching | caught | escaped
  const [creaturePos, setCreaturePos] = useState({ x: 50, y: 58, depth: 1 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [floatY, setFloatY] = useState(0);
  const [throwsLeft, setThrowsLeft] = useState(3);
  const [ball, setBall] = useState(null);
  const [catchQuality, setCatchQuality] = useState(null);
  const [particles, setParticles] = useState([]);
  const [qrStatus, setQrStatus] = useState("idle"); // idle | scanning | matched | mismatched | unavailable
  const [qrMessage, setQrMessage] = useState(null);

  const rar = RARITY[creature.rarity];

  // --- Проверка возможности включить камеру (не включает её) ------------
  const diagnoseCameraEnv = () => {
    if (typeof window === "undefined") return { ok: false, reason: "нет window" };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { ok: false, reason: "браузер не поддерживает camera API" };
    }
    const isSecure = window.isSecureContext || location.protocol === "https:" || location.hostname === "localhost";
    if (!isSecure) {
      return { ok: false, reason: "нужен HTTPS (сейчас открыто по HTTP)" };
    }
    // Проверка, что мы не в запертом iframe
    try {
      if (window.self !== window.top) {
        // в iframe — может быть ОК, если allow=camera выставлен, но заранее не узнать
      }
    } catch (e) { /* cross-origin — ничего */ }
    return { ok: true };
  };

  // --- Запуск камеры по нажатию кнопки ----------------------------------
  const requestCamera = async () => {
    const diag = diagnoseCameraEnv();
    if (!diag.ok) {
      setCameraStatus("error");
      setCameraError(diag.reason);
      return;
    }
    setCameraStatus("requesting");
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // playsInline уже в JSX, но подстрахуемся атрибутами для Safari
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("webkit-playsinline", "true");
        await videoRef.current.play();
      }
      setCameraReady(true);
      setCameraStatus("ready");
    } catch (e) {
      setCameraStatus("error");
      // Читаем тип ошибки
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setCameraError("доступ к камере отклонён. Разреши в настройках браузера.");
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setCameraError("камера не найдена на устройстве");
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        setCameraError("камера занята другим приложением");
      } else if (e.name === "OverconstrainedError") {
        // Пробуем fallback без facingMode
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setCameraReady(true);
          setCameraStatus("ready");
          return;
        } catch (e2) {
          setCameraError("не удалось открыть ни одну камеру");
        }
      } else if (e.name === "SecurityError") {
        setCameraError("заблокировано политикой безопасности (iframe?)");
      } else {
        setCameraError(`ошибка: ${e.name || "неизвестно"}`);
      }
    }
  };

  // Остановка камеры и сканера при размонтировании
  useEffect(() => {
    return () => {
      qrScannerRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // --- QR-сканер: запускается когда камера готова (phase === scanning) ---
  useEffect(() => {
    if (!cameraReady || phase !== "scanning" || !qrScanEnabled) return;

    const scanner = new QRScannerInline();
    qrScannerRef.current = scanner;
    setQrStatus("scanning");

    scanner.start(videoRef.current, ({ rawValue, parsed }) => {
      if (!parsed) {
        setQrMessage("QR не распознан — попробуй ближе");
        return;
      }
      // Проверяем, что это QR нужной зоны (и нужного ТЦ)
      if (parsed.zoneSlug !== expectedZoneSlug) {
        setQrStatus("mismatched");
        setQrMessage(`Это QR зоны «${parsed.zoneSlug}», а существо в «${expectedZoneSlug}»`);
        return;
      }
      // Совпало! Пробрасываем qrSecret в родительский компонент
      setQrStatus("matched");
      setQrMessage(null);
      scanner.stop();
      onQRScanned?.(parsed.qrSecret);
    }).then(res => {
      if (res && !res.available) {
        setQrStatus("unavailable");
        setQrMessage("QR-сканер недоступен в этом браузере (демо-режим)");
      }
    }).catch((e) => {
      setQrStatus("unavailable");
      setQrMessage("Сканер не запустился: " + (e?.message || "unknown"));
    });

    return () => scanner.stop();
  }, [cameraReady, phase, qrScanEnabled, expectedZoneSlug]);

  // --- Фазы: scanning → spawned -----------------------------------------
  useEffect(() => {
    if (phase === "scanning") {
      const t = setTimeout(() => {
        setPhase("spawned");
        // Вспышка частиц при появлении
        const burst = Array.from({ length: 14 }, (_, i) => ({
          id: Date.now() + i,
          angle: (i / 14) * Math.PI * 2,
          born: Date.now(),
        }));
        setParticles(burst);
        setTimeout(() => setParticles([]), 900);
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // --- Покачивание существа (sine) --------------------------------------
  useEffect(() => {
    if (phase !== "spawned" && phase !== "catching") return;
    let raf;
    const start = Date.now();
    const tick = () => {
      const t = (Date.now() - start) / 1000;
      setFloatY(Math.sin(t * 1.8) * 10);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // --- Дрейф существа (перемещается в пространстве) ---------------------
  useEffect(() => {
    if (phase !== "spawned") return;
    const interval = setInterval(() => {
      setCreaturePos(p => ({
        x: Math.max(28, Math.min(72, p.x + (Math.random() - 0.5) * 8)),
        y: Math.max(50, Math.min(64, p.y + (Math.random() - 0.5) * 3)),
        depth: 0.85 + Math.random() * 0.35,
      }));
    }, 2200);
    return () => clearInterval(interval);
  }, [phase]);

  // --- Параллакс от гироскопа / мыши ------------------------------------
  useEffect(() => {
    const handleOrient = (e) => {
      if (e.gamma == null) return;
      setParallax({
        x: Math.max(-20, Math.min(20, e.gamma / 3)),
        y: Math.max(-12, Math.min(12, ((e.beta || 45) - 45) / 5)),
      });
    };
    const handleMouse = (e) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      setParallax({ x: (nx - 0.5) * 24, y: (ny - 0.5) * 12 });
    };
    window.addEventListener("deviceorientation", handleOrient);
    window.addEventListener("mousemove", handleMouse);
    return () => {
      window.removeEventListener("deviceorientation", handleOrient);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  // --- Обработка свайпа --------------------------------------------------
  const touchStart = useRef(null);
  const handleStart = (e) => {
    if (phase !== "spawned") return;
    const pt = e.touches?.[0] || e;
    touchStart.current = { x: pt.clientX, y: pt.clientY, time: Date.now() };
  };
  const handleEnd = (e) => {
    if (phase !== "spawned" || !touchStart.current || !containerRef.current) return;
    const pt = e.changedTouches?.[0] || e;
    const ts = touchStart.current;
    const dx = pt.clientX - ts.x;
    const dy = pt.clientY - ts.y;
    const dt = Date.now() - ts.time;
    const rect = containerRef.current.getBoundingClientRect();
    touchStart.current = null;

    // Требования: быстрый свайп вверх минимум 50px
    if (dy > -50 || dt > 900) return;

    // Точка "прицеливания" — куда направлен свайп (в процентах экрана)
    const aimX = ((pt.clientX - rect.left) / rect.width) * 100;
    const aimY = ((pt.clientY - rect.top) / rect.height) * 100;
    throwBall(aimX, aimY);
  };

  const throwBall = (aimX, aimY) => {
    setPhase("catching");
    const startX = 50, startY = 95;
    const duration = 750;
    const t0 = Date.now();

    const step = () => {
      const elapsed = Date.now() - t0;
      const t = Math.min(elapsed / duration, 1);
      // Парабола: пик подъёма посередине
      const arcPeak = 25;
      const x = startX + (aimX - startX) * t;
      const y = startY + (aimY - startY) * t - arcPeak * Math.sin(t * Math.PI);
      setBall({ x, y, t });
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        // Проверяем попадание — расстояние от точки прилёта до существа
        const dist = Math.hypot(aimX - creaturePos.x, aimY - creaturePos.y);
        if (dist < 14) {
          const quality = dist < 6 ? "perfect" : "good";
          setCatchQuality(quality);
          setPhase("caught");
          // Вспышка поимки
          const burst = Array.from({ length: 20 }, (_, i) => ({
            id: Date.now() + i,
            angle: (i / 20) * Math.PI * 2,
            born: Date.now(),
          }));
          setParticles(burst);
          setTimeout(() => onCaught(quality), 1700);
        } else {
          // Промах
          setBall(null);
          const next = throwsLeft - 1;
          setThrowsLeft(next);
          if (next <= 0) {
            setPhase("escaped");
            setTimeout(onEscaped, 1600);
          } else {
            setPhase("spawned");
            // Существо уворачивается
            setCreaturePos(p => ({
              x: Math.max(28, Math.min(72, p.x + (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 10))),
              y: Math.max(50, Math.min(62, p.y + (Math.random() - 0.5) * 6)),
              depth: p.depth,
            }));
          }
        }
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <div ref={containerRef}
         className="h-full relative overflow-hidden select-none"
         style={{ background: "#000", touchAction: "none" }}
         onTouchStart={handleStart} onTouchEnd={handleEnd}
         onMouseDown={handleStart} onMouseUp={handleEnd}>

      {/* Видео с камеры */}
      <video ref={videoRef} playsInline muted autoPlay
             className="absolute inset-0 w-full h-full object-cover"
             style={{ display: cameraReady ? "block" : "none" }}/>

      {/* Fallback: стилизованный интерьер ТЦ */}
      {!cameraReady && (
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 60% 30% at 30% 25%, #FFE4A0 0%, transparent 60%),
              radial-gradient(ellipse 50% 40% at 75% 35%, #FFB0C8 0%, transparent 55%),
              radial-gradient(ellipse 80% 50% at 50% 100%, #3A4A7A 0%, #1A2540 60%),
              linear-gradient(180deg, #2A3566 0%, #1A2540 55%, #0A1420 100%)
            `,
            filter: "blur(1.5px)",
          }}/>
          {/* «огни витрин» */}
          {[[12,22,55,"#FFD60A"],[82,30,70,"#FF6B9D"],[35,18,35,"#00F5D4"],[68,55,40,"#8338EC"],[20,50,30,"#FFB4A2"]].map(([x,y,s,c],i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${x}%`, top: `${y}%`, width: s, height: s,
              background: c, filter: "blur(28px)", opacity: .55, transform: "translate(-50%,-50%)",
            }}/>
          ))}
          {/* Намёк на пол */}
          <div className="absolute bottom-0 left-0 right-0" style={{
            height: "35%",
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,.5))",
          }}/>
        </div>
      )}

      {/* Тёмный вверх/низ для читаемости UI */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, transparent 18%, transparent 72%, rgba(0,0,0,.75) 100%)",
      }}/>

      {/* AR-сетка на полу */}
      {(phase === "scanning" || phase === "spawned" || phase === "catching") && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none"
             viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <radialGradient id="ar-floor-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={rar.color} stopOpacity=".5"/>
              <stop offset="60%" stopColor={rar.color} stopOpacity=".2"/>
              <stop offset="100%" stopColor={rar.color} stopOpacity="0"/>
            </radialGradient>
          </defs>
          <g transform="translate(50, 72)">
            {[...Array(7)].map((_, i) => (
              <ellipse key={`r${i}`} cx="0" cy="0" rx={8 + i * 6} ry={2.5 + i * 1.8}
                       fill="none" stroke="url(#ar-floor-grad)" strokeWidth=".2"
                       style={{ animation: phase === "scanning" ? `pulseRing 2s ${i * 0.15}s infinite` : "none" }}/>
            ))}
            {[...Array(12)].map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return <line key={`l${i}`} x1="0" y1="0"
                           x2={Math.cos(a) * 50} y2={Math.sin(a) * 14}
                           stroke="url(#ar-floor-grad)" strokeWidth=".12"/>;
            })}
          </g>
        </svg>
      )}

      {/* Пульс при сканировании */}
      {phase === "scanning" && (
        <div className="absolute left-1/2 z-10" style={{ top: "58%", transform: "translate(-50%, -50%)" }}>
          <div className="relative">
            {[0, 1, 2].map(i => (
              <div key={i} className="absolute rounded-full border-2"
                   style={{
                     width: 80, height: 80, borderColor: rar.color,
                     left: -40, top: -40,
                     animation: `scanPulse 1.8s ${i * 0.5}s infinite`,
                   }}/>
            ))}
          </div>
        </div>
      )}

      {/* Существо + тень на полу */}
      {(phase === "spawned" || phase === "catching" || phase === "caught") && (
        <>
          {/* Тень под существом */}
          <div className="absolute pointer-events-none"
               style={{
                 left: `${creaturePos.x}%`,
                 top: `${creaturePos.y + 8}%`,
                 width: 120 * creaturePos.depth,
                 height: 20 * creaturePos.depth,
                 transform: "translate(-50%, -50%)",
                 background: `radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%)`,
                 filter: "blur(4px)",
                 transition: "left 1.5s cubic-bezier(.4,0,.2,1), top 1.5s cubic-bezier(.4,0,.2,1)",
               }}/>
          {/* Свечение редкости */}
          <div className="absolute pointer-events-none"
               style={{
                 left: `${creaturePos.x}%`,
                 top: `${creaturePos.y}%`,
                 width: 180 * creaturePos.depth,
                 height: 180 * creaturePos.depth,
                 transform: `translate(-50%, -50%) translateY(${floatY}px)`,
                 background: `radial-gradient(circle, ${rar.color}44 0%, transparent 65%)`,
                 filter: "blur(12px)",
                 transition: "left 1.5s cubic-bezier(.4,0,.2,1), top 1.5s cubic-bezier(.4,0,.2,1)",
               }}/>
          {/* Существо */}
          <div className="absolute pointer-events-none"
               style={{
                 left: `${creaturePos.x}%`,
                 top: `${creaturePos.y}%`,
                 transform: `
                   translate(-50%, -50%)
                   translate(${parallax.x}px, ${parallax.y * 0.5}px)
                   translateY(${floatY}px)
                   scale(${creaturePos.depth})
                   perspective(600px)
                   rotateY(${parallax.x * 0.8}deg)
                   rotateX(${-parallax.y * 0.4}deg)
                 `,
                 transition: "left 1.5s cubic-bezier(.4,0,.2,1), top 1.5s cubic-bezier(.4,0,.2,1)",
                 filter: `drop-shadow(0 10px 16px rgba(0,0,0,.6))`,
               }}>
            <CreatureArt id={creature.id} size={140}/>
          </div>
        </>
      )}

      {/* Частицы */}
      {particles.map(p => {
        const elapsed = Date.now() - p.born;
        const t = Math.min(elapsed / 800, 1);
        const dist = 60 + t * 40;
        const opacity = 1 - t;
        return (
          <div key={p.id} className="absolute pointer-events-none rounded-full"
               style={{
                 left: `${creaturePos.x}%`,
                 top: `${creaturePos.y}%`,
                 width: 8, height: 8,
                 background: rar.color,
                 boxShadow: `0 0 12px ${rar.color}`,
                 opacity,
                 transform: `translate(-50%, -50%) translate(${Math.cos(p.angle) * dist}px, ${Math.sin(p.angle) * dist}px)`,
               }}/>
        );
      })}

      {/* Шар */}
      {ball && (
        <div className="absolute pointer-events-none rounded-full"
             style={{
               left: `${ball.x}%`,
               top: `${ball.y}%`,
               width: 38, height: 38,
               transform: `translate(-50%, -50%) rotate(${ball.t * 720}deg)`,
               background: `radial-gradient(circle at 30% 25%, #fff 0%, ${THEME.cyan} 45%, #064E4A 100%)`,
               boxShadow: `0 0 24px ${THEME.cyan}, inset -4px -6px 10px rgba(0,0,0,.4), inset 3px 3px 6px rgba(255,255,255,.3)`,
               border: "2px solid #fff",
             }}/>
      )}

      {/* Верхняя панель */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <button onClick={onCancel}
                className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition"
                style={{ background: "rgba(0,0,0,.5)", color: "#fff", border: "1px solid rgba(255,255,255,.15)" }}>
          ✕
        </button>
        <div className="px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2"
             style={{ background: "rgba(0,0,0,.5)", color: "#fff",
                      fontFamily: "'Onest', sans-serif", fontSize: 12,
                      border: "1px solid rgba(255,255,255,.15)" }}>
          <span>📍</span>{zone.name}
        </div>
        <div className="flex gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
             style={{ background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.15)" }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full transition"
                 style={{
                   background: i < throwsLeft ? rar.color : "rgba(255,255,255,.2)",
                   boxShadow: i < throwsLeft ? `0 0 6px ${rar.color}` : "none",
                 }}/>
          ))}
        </div>
      </div>

      {/* Имя существа */}
      {(phase === "spawned" || phase === "catching") && (
        <div className="absolute left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
             style={{ top: 80 }}>
          <div style={{
            fontFamily: "'Bungee', sans-serif", color: "#fff", fontSize: 26,
            textShadow: `0 0 24px ${rar.color}, 0 2px 4px rgba(0,0,0,.9)`,
            letterSpacing: "-.01em",
          }}>{creature.name}</div>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
               style={{
                 background: rar.color, color: "#000",
                 fontFamily: "'Onest', sans-serif", fontWeight: 800, fontSize: 10,
               }}>
            {rar.label}
          </div>
        </div>
      )}

      {/* Экран запроса камеры */}
      {phase === "permission" && (
        <div className="absolute inset-0 z-30 flex items-end pointer-events-auto"
             style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(12px)" }}>
          <div className="w-full p-6 pb-10" style={{
            background: `linear-gradient(180deg, transparent, ${THEME.surface} 30%)`,
          }}>
            {/* Превью существа сверху */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full" style={{
                  background: `radial-gradient(circle, ${rar.color}66, transparent 65%)`,
                  filter: "blur(20px)",
                  transform: "scale(1.5)",
                }}/>
                <CreatureArt id={creature.id} size={100}/>
              </div>
            </div>
            <div className="text-center mb-1" style={{
              fontFamily: "'Bungee', sans-serif", color: "#fff", fontSize: 22,
              textShadow: `0 0 20px ${rar.color}`,
            }}>
              {creature.name} рядом!
            </div>
            <div className="text-center text-xs mb-6" style={{
              color: THEME.textDim, fontFamily: "'Onest', sans-serif",
            }}>
              📍 {zone.name} • <span style={{ color: rar.color }}>{rar.label}</span>
            </div>

            {/* Кнопка: включить камеру */}
            <button
              onClick={async () => {
                await requestCamera();
                setPhase("scanning");
              }}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition"
              style={{
                background: rar.color, color: "#0A0E27",
                fontFamily: "'Onest', sans-serif",
                boxShadow: `0 4px 20px ${rar.color}66`,
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 10.5l4.77-8.26a12 12 0 0 0-9.22 15.81l4.45-7.55zM21.5 9h-7.76l-.04-.02L17.82 2A9.94 9.94 0 0 0 12 0c-1.55 0-3.04.36-4.36.98l7.7 13.33L21.5 9zm.24 1.14a12 12 0 0 1-9.36 13.7L21.74 10.1zM7.71 14L2.05 9.54A11.93 11.93 0 0 0 0 12c0 6.34 4.94 11.52 11.19 11.96L7.71 14z"/>
              </svg>
              Включить AR-режим
            </button>

            {/* Диагностика при ошибке */}
            {cameraStatus === "error" && cameraError && (
              <div className="mt-3 p-3 rounded-xl text-xs text-center"
                   style={{
                     background: `${THEME.pink}15`,
                     border: `1px solid ${THEME.pink}55`,
                     color: THEME.pink,
                     fontFamily: "'Onest', sans-serif",
                   }}>
                ⚠ {cameraError}
              </div>
            )}
            {cameraStatus === "requesting" && (
              <div className="mt-3 p-3 rounded-xl text-xs text-center"
                   style={{
                     background: `${THEME.cyan}15`,
                     border: `1px solid ${THEME.cyan}55`,
                     color: THEME.cyan,
                     fontFamily: "'Onest', sans-serif",
                   }}>
                Разреши доступ к камере в окне браузера...
              </div>
            )}

            {/* Альтернатива: играть без камеры */}
            <button
              onClick={() => setPhase("scanning")}
              className="w-full mt-3 py-3 rounded-2xl text-sm active:scale-95 transition"
              style={{
                background: "transparent", color: THEME.textDim,
                fontFamily: "'Onest', sans-serif",
                border: `1px solid ${THEME.line}`,
              }}>
              Играть без камеры (2D-режим)
            </button>

            <div className="text-center text-[11px] mt-4 px-3 leading-relaxed"
                 style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
              камера нужна только чтобы увидеть существо в реальном мире.<br/>
              видео с камеры никуда не отправляется.
            </div>
          </div>
        </div>
      )}

      {/* Нижняя панель */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10 px-6 pointer-events-none">
        {phase === "scanning" && (
          <div className="inline-block backdrop-blur-md py-2.5 px-5 rounded-2xl max-w-[90%]"
               style={{ background: "rgba(0,0,0,.55)", color: "#fff",
                        fontFamily: "'Onest', sans-serif", fontSize: 13,
                        border: "1px solid rgba(255,255,255,.15)" }}>
            {qrStatus === "matched" ? (
              <>
                <span style={{ color: "#4ade80" }}>✓</span> QR распознан — готовимся к поимке
              </>
            ) : qrStatus === "mismatched" ? (
              <>
                <span style={{ color: THEME.pink }}>⚠</span> {qrMessage || "не та зона"}
              </>
            ) : qrStatus === "unavailable" ? (
              <>
                <span style={{ color: THEME.yellow }}>●</span> демо-режим — наведи камеру на зону
              </>
            ) : qrScanEnabled ? (
              <>
                <span style={{ color: rar.color }}>●</span> наведи камеру на QR-код зоны
              </>
            ) : (
              <>
                <span style={{ color: rar.color }}>●</span> ищем существо рядом с меткой...
              </>
            )}
          </div>
        )}
        {phase === "spawned" && (
          <div className="inline-block backdrop-blur-md py-3 px-5 rounded-2xl"
               style={{ background: "rgba(0,0,0,.55)", color: "#fff",
                        fontFamily: "'Onest', sans-serif",
                        border: "1px solid rgba(255,255,255,.15)" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>свайп вверх — бросить шар ↑</div>
            <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 3 }}>
              целься в существо • 3 попытки
            </div>
          </div>
        )}
      </div>

      {/* Индикатор свайпа (подсказка) */}
      {phase === "spawned" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none"
             style={{ animation: "swipeHint 2s ease-out infinite" }}>
          <svg width="30" height="50" viewBox="0 0 30 50" fill="none">
            <path d="M15 45 L15 10 M5 20 L15 10 L25 20" stroke="#fff" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
          </svg>
        </div>
      )}

      {/* Результат */}
      {phase === "caught" && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-center" style={{ animation: "pop .5s cubic-bezier(.34,1.56,.64,1)" }}>
            <div style={{
              fontFamily: "'Bungee', sans-serif",
              color: catchQuality === "perfect" ? THEME.yellow : THEME.cyan,
              fontSize: catchQuality === "perfect" ? 46 : 40,
              textShadow: `0 0 40px ${catchQuality === "perfect" ? THEME.yellow : THEME.cyan}, 0 4px 8px rgba(0,0,0,.9)`,
              letterSpacing: "-.02em",
            }}>
              {catchQuality === "perfect" ? "ИДЕАЛЬНО!" : "ПОЙМАЛ!"}
            </div>
            <div className="mt-2" style={{
              color: "#fff", fontFamily: "'Onest', sans-serif", fontSize: 14, opacity: .8,
              textShadow: "0 2px 4px rgba(0,0,0,.9)",
            }}>
              +{catchQuality === "perfect" ? Math.round(rar.points * 1.5) : rar.points} очков
            </div>
          </div>
        </div>
      )}
      {phase === "escaped" && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-center" style={{ animation: "pop .5s cubic-bezier(.34,1.56,.64,1)" }}>
            <div style={{
              fontFamily: "'Bungee', sans-serif", color: THEME.pink, fontSize: 38,
              textShadow: `0 0 40px ${THEME.pink}, 0 4px 8px rgba(0,0,0,.9)`,
            }}>
              УБЕЖАЛ…
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pop { 0% { transform: scale(.3); opacity: 0 } 60% { transform: scale(1.15); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes scanPulse { 0% { transform: scale(.5); opacity: .9 } 100% { transform: scale(2.2); opacity: 0 } }
        @keyframes pulseRing { 0%, 100% { opacity: .3 } 50% { opacity: 1 } }
        @keyframes swipeHint { 0% { transform: translateX(-50%) translateY(0); opacity: .7 } 100% { transform: translateX(-50%) translateY(-40px); opacity: 0 } }
      `}</style>
    </div>
  );
};

// =========================================================================
// ЗАДАНИЯ
// =========================================================================
const QuestsScreen = ({ stats, claimedIds, onClaim, points }) => {
  const getProgress = (q) => {
    switch (q.metric) {
      case "catches": return stats.catches;
      case "perfect": return stats.perfect;
      case "food":    return stats.byZone.food || 0;
      case "rare+":   return stats.rarePlus;
      case "unique":  return stats.unique;
      default:        return 0;
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-24" style={{ background: THEME.bg }}>
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
           style={{ background: `linear-gradient(180deg, ${THEME.bg} 70%, transparent)` }}>
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: THEME.textDim }}>задания</div>
          <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 22, lineHeight: 1 }}>
            ежедневные
          </div>
        </div>
        <PointsBadge points={points}/>
      </div>

      <div className="px-5 space-y-3">
        {QUESTS.map(q => {
          const progress = Math.min(getProgress(q), q.target);
          const completed = progress >= q.target;
          const claimed = claimedIds.includes(q.id);
          const pct = (progress / q.target) * 100;

          return (
            <div key={q.id} className="p-4 rounded-2xl"
                 style={{ background: THEME.surface,
                          border: `1px solid ${completed && !claimed ? THEME.yellow + "99" : THEME.line}`,
                          opacity: claimed ? .5 : 1 }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-3">
                  <div style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 14 }}>
                    {q.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
                    {q.desc}
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0"
                     style={{ background: `${THEME.yellow}22` }}>
                  <span style={{ color: THEME.yellow }}>✦</span>
                  <span style={{ color: THEME.yellow, fontFamily: "'Bungee', sans-serif", fontSize: 12 }}>
                    +{q.reward}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: THEME.surfaceHi }}>
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{
                         width: `${pct}%`,
                         background: completed
                           ? `linear-gradient(90deg, ${THEME.yellow}, ${THEME.pink})`
                           : THEME.cyan
                       }}/>
                </div>
                <div className="text-xs whitespace-nowrap" style={{ color: THEME.textDim }}>
                  {progress} / {q.target}
                </div>
              </div>

              {completed && !claimed && (
                <button onClick={() => onClaim(q)}
                        className="mt-3 w-full py-2.5 rounded-xl font-bold transition active:scale-95"
                        style={{ background: THEME.yellow, color: THEME.bg, fontFamily: "'Onest', sans-serif" }}>
                  Забрать награду
                </button>
              )}
              {claimed && (
                <div className="mt-3 text-center text-xs" style={{ color: THEME.green }}>
                  ✓ получено
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-5 mt-6 p-4 rounded-2xl text-center text-xs"
           style={{ background: THEME.surface, color: THEME.textDim, border: `1px dashed ${THEME.line}` }}>
        задания обновляются каждый день в 00:00
      </div>
    </div>
  );
};

// =========================================================================
// МАГАЗИН НАГРАД
// =========================================================================
const ShopScreen = ({ points, onBack, onBuy, purchasedIds }) => (
  <div className="h-full overflow-y-auto pb-10" style={{ background: THEME.bg }}>
    <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
         style={{ background: `linear-gradient(180deg, ${THEME.bg} 70%, transparent)` }}>
      <button onClick={onBack} className="text-2xl" style={{ color: THEME.text }}>←</button>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-widest" style={{ color: THEME.textDim }}>магазин</div>
        <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 20, lineHeight: 1 }}>
          НАГРАДЫ
        </div>
      </div>
      <PointsBadge points={points}/>
    </div>

    <div className="px-5 mb-4">
      <div className="p-3 rounded-xl text-xs"
           style={{ background: `${THEME.cyan}12`, border: `1px solid ${THEME.cyan}40`,
                    color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
        💡 После покупки ты получишь QR-код. Покажи его на кассе партнёра, чтобы получить приз.
      </div>
    </div>

    <div className="px-5 space-y-3">
      {SHOP_ITEMS.map(item => {
        const canAfford = points >= item.price;
        const purchased = purchasedIds.includes(item.id);
        return (
          <div key={item.id} className="p-4 rounded-2xl flex items-center gap-4"
               style={{ background: THEME.surface,
                        border: `1px solid ${canAfford ? item.color + "55" : THEME.line}`,
                        opacity: purchased ? .5 : 1 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                 style={{ background: `${item.color}22` }}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 14, lineHeight: 1.2 }}>
                {item.name}
              </div>
              <div className="text-xs mt-1" style={{ color: THEME.textDim }}>
                от {item.partner}
              </div>
            </div>
            <button onClick={() => canAfford && !purchased && onBuy(item)}
                    disabled={!canAfford || purchased}
                    className="px-3 py-2 rounded-xl font-bold transition active:scale-95 disabled:opacity-40 flex-shrink-0"
                    style={{
                      background: purchased ? THEME.green : (canAfford ? item.color : THEME.surfaceHi),
                      color: purchased ? THEME.bg : (canAfford ? THEME.bg : THEME.textDim),
                      fontFamily: "'Bungee', sans-serif", fontSize: 12, minWidth: 75,
                    }}>
              {purchased ? "✓" : `✦ ${item.price}`}
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

// =========================================================================
// РЕЙТИНГ
// =========================================================================
const LeaderboardScreen = ({ user, points, onBack }) => {
  const withYou = [...MOCK_LEADERBOARD, { name: user.name, avatar: user.avatar, points, you: true }]
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <div className="h-full overflow-y-auto pb-10" style={{ background: THEME.bg }}>
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
           style={{ background: `linear-gradient(180deg, ${THEME.bg} 70%, transparent)` }}>
        <button onClick={onBack} className="text-2xl" style={{ color: THEME.text }}>←</button>
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: THEME.textDim }}>рейтинг</div>
          <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 20, lineHeight: 1 }}>
            ТОП ОХОТНИКОВ
          </div>
        </div>
      </div>

      {/* Пьедестал */}
      <div className="flex items-end justify-center gap-3 px-5 mt-2 mb-6 h-40">
        {[withYou[1], withYou[0], withYou[2]].map((p, idx) => {
          const place = idx === 1 ? 1 : (idx === 0 ? 2 : 3);
          const heights = { 1: 130, 2: 95, 3: 70 };
          const colors = { 1: THEME.yellow, 2: THEME.textDim, 3: "#CD7F32" };
          return (
            <div key={p.name + p.rank} className="flex flex-col items-center flex-1">
              <div className="text-2xl mb-1">{p.avatar}</div>
              <div className="text-xs mb-1 text-center truncate w-full"
                   style={{ color: p.you ? THEME.cyan : THEME.text, fontFamily: "'Onest', sans-serif", fontWeight: 700 }}>
                {p.you ? "Вы" : p.name}
              </div>
              <div className="w-full rounded-t-lg flex items-start justify-center pt-2"
                   style={{ height: heights[place], background: `${colors[place]}33`,
                            border: `1px solid ${colors[place]}`, borderBottom: "none" }}>
                <div style={{ fontFamily: "'Bungee', sans-serif", color: colors[place], fontSize: 22 }}>
                  {place}
                </div>
              </div>
              <div className="text-xs" style={{ color: THEME.textDim, fontFamily: "'Bungee', sans-serif",
                              background: THEME.surface, width: "100%", textAlign: "center", paddingBlock: 4 }}>
                {p.points}
              </div>
            </div>
          );
        })}
      </div>

      {/* Остальные */}
      <div className="px-5 space-y-2">
        {withYou.slice(3).map((p) => (
          <div key={p.name + p.rank}
               className="flex items-center gap-3 p-3 rounded-xl"
               style={{
                 background: p.you ? `${THEME.cyan}12` : THEME.surface,
                 border: `1px solid ${p.you ? THEME.cyan + "55" : THEME.line}`
               }}>
            <div className="w-7 text-center" style={{ color: THEME.textDim, fontFamily: "'Bungee', sans-serif", fontSize: 14 }}>
              {p.rank}
            </div>
            <div className="text-2xl">{p.avatar}</div>
            <div className="flex-1" style={{ color: p.you ? THEME.cyan : THEME.text, fontFamily: "'Onest', sans-serif", fontWeight: 600 }}>
              {p.you ? "Вы" : p.name}
            </div>
            <div style={{ color: THEME.yellow, fontFamily: "'Bungee', sans-serif", fontSize: 14 }}>
              ✦ {p.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// КОЛЛЕКЦИЯ
// =========================================================================
const CollectionScreen = ({ caughtIds, onSelect, points }) => (
  <div className="h-full overflow-y-auto pb-24" style={{ background: THEME.bg }}>
    <div className="sticky top-0 z-10 p-5 pb-3 flex items-end justify-between"
         style={{ background: `linear-gradient(180deg, ${THEME.bg} 70%, transparent)` }}>
      <div>
        <div className="text-xs uppercase tracking-widest" style={{ color: THEME.textDim }}>коллекция</div>
        <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 28, lineHeight: 1 }}>
          {caughtIds.length} <span style={{ color: THEME.textDim }}>/ {CREATURES.length}</span>
        </div>
      </div>
      <PointsBadge points={points}/>
    </div>

    <div className="mx-5 h-2 rounded-full overflow-hidden" style={{ background: THEME.surface }}>
      <div className="h-full rounded-full transition-all duration-700"
           style={{
             width: `${(caughtIds.length / CREATURES.length) * 100}%`,
             background: `linear-gradient(90deg, ${THEME.cyan}, ${THEME.pink}, ${THEME.yellow})`
           }}/>
    </div>

    <div className="grid grid-cols-2 gap-3 p-5">
      {CREATURES.map(c => {
        const caught = caughtIds.includes(c.id);
        const rar = RARITY[c.rarity];
        return (
          <div key={c.id}
               onClick={() => caught && onSelect(c)}
               className="p-4 rounded-2xl relative overflow-hidden transition active:scale-95"
               style={{
                 background: caught ? THEME.surface : THEME.bg,
                 border: `1px solid ${caught ? rar.color + "66" : THEME.line}`,
                 cursor: caught ? "pointer" : "default"
               }}>
            {caught ? (
              <>
                <div className="flex justify-center py-2">
                  <CreatureArt id={c.id} size={70}/>
                </div>
                <div className="text-center mt-2" style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 12 }}>
                  {c.name}
                </div>
                <div className="text-center mt-1 text-[9px] uppercase tracking-wider"
                     style={{ color: rar.color, fontFamily: "'Onest', sans-serif" }}>
                  {rar.label}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center py-2 opacity-30">
                  <div style={{ filter: "brightness(0)" }}>
                    <CreatureArt id={c.id} size={70}/>
                  </div>
                </div>
                <div className="text-center mt-2" style={{ color: THEME.textDim, fontFamily: "'Bungee', sans-serif", fontSize: 12 }}>
                  ? ? ?
                </div>
                <div className="text-center mt-1 text-[9px] uppercase tracking-wider"
                     style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
                  не найдено
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const CreatureDetail = ({ creature, onClose }) => {
  const rar = RARITY[creature.rarity];
  const zone = ZONES.find(z => z.id === creature.zone);
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center"
         style={{ background: "rgba(10,14,39,.8)", backdropFilter: "blur(6px)" }}
         onClick={onClose}>
      <div className="w-full rounded-t-3xl p-6 pt-8"
           style={{ background: THEME.surface, border: `1px solid ${rar.color}55` }}
           onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ background: THEME.line }}/>
        <div className="flex items-center gap-4">
          <CreatureArt id={creature.id} size={100}/>
          <div className="flex-1">
            <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 22 }}>
              {creature.name}
            </div>
            <div className="text-xs uppercase tracking-widest mt-1"
                 style={{ color: rar.color, fontFamily: "'Onest', sans-serif" }}>
              {rar.label} · +{rar.points} очков
            </div>
          </div>
        </div>
        <div className="text-sm mt-5" style={{ color: THEME.text, fontFamily: "'Onest', sans-serif", lineHeight: 1.6 }}>
          {creature.desc}
        </div>
        <div className="mt-4 text-xs" style={{ color: THEME.textDim }}>
          📍 обитает в зоне <b style={{ color: rar.color }}>{zone?.name}</b>
        </div>
        <button onClick={onClose}
                className="w-full mt-6 py-3 rounded-xl font-bold"
                style={{ background: THEME.cyan, color: THEME.bg, fontFamily: "'Onest', sans-serif" }}>
          Класс!
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// ПРОФИЛЬ
// =========================================================================
const ProfileScreen = ({ user, caughtIds, points, onLogout, onShop, onLeaderboard, onArDemo, purchasedIds }) => {
  const byRarity = CREATURES.reduce((acc, c) => {
    const caught = caughtIds.includes(c.id);
    acc[c.rarity] = acc[c.rarity] || { caught: 0, total: 0 };
    acc[c.rarity].total++;
    if (caught) acc[c.rarity].caught++;
    return acc;
  }, {});

  return (
    <div className="h-full overflow-y-auto pb-24" style={{ background: THEME.bg }}>
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl mb-3"
             style={{ background: `linear-gradient(135deg, ${THEME.violet}, ${THEME.pink})` }}>
          {user.avatar}
        </div>
        <div style={{ fontFamily: "'Bungee', sans-serif", color: THEME.text, fontSize: 24 }}>
          {user.name}
        </div>
        <div className="text-xs mt-1" style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif" }}>
          вход через {user.via === "telegram" ? "Telegram" : "телефон"}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
             style={{ background: `${THEME.yellow}22`, border: `1px solid ${THEME.yellow}66` }}>
          <span style={{ color: THEME.yellow, fontSize: 18 }}>✦</span>
          <span style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 18 }}>
            {points} очков
          </span>
        </div>
      </div>

      {/* Главные действия */}
      <div className="mx-5 grid grid-cols-2 gap-3 mb-4">
        <button onClick={onShop}
                className="p-4 rounded-2xl text-left transition active:scale-95"
                style={{ background: `linear-gradient(135deg, ${THEME.yellow}dd, ${THEME.pink}dd)`, color: THEME.bg }}>
          <div className="text-2xl mb-1">🎁</div>
          <div style={{ fontFamily: "'Bungee', sans-serif", fontSize: 14 }}>Магазин</div>
          <div className="text-xs opacity-80" style={{ fontFamily: "'Onest', sans-serif" }}>
            обменять очки
          </div>
        </button>
        <button onClick={onLeaderboard}
                className="p-4 rounded-2xl text-left transition active:scale-95"
                style={{ background: `linear-gradient(135deg, ${THEME.cyan}dd, ${THEME.violet}dd)`, color: THEME.bg }}>
          <div className="text-2xl mb-1">🏆</div>
          <div style={{ fontFamily: "'Bungee', sans-serif", fontSize: 14 }}>Рейтинг</div>
          <div className="text-xs opacity-80" style={{ fontFamily: "'Onest', sans-serif" }}>
            топ охотников
          </div>
        </button>
      </div>

      {/* AR Demo promo — новая фича на тесте */}
      <div className="mx-5 mb-4">
        <button onClick={onArDemo}
                className="w-full p-4 rounded-2xl text-left transition active:scale-95 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, #1a1a2e, #0F1115)`,
                         border: `1px solid ${THEME.cyan}44` }}>
          <div className="absolute top-2 right-3 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
               style={{ background: `${THEME.cyan}22`, color: THEME.cyan,
                        fontFamily: "'Onest', sans-serif", border: `1px solid ${THEME.cyan}44` }}>
            новое · бета
          </div>
          <div className="text-3xl mb-2">🎯</div>
          <div style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 15 }}>
            3D-AR режим
          </div>
          <div className="text-xs opacity-70 mt-1" style={{ color: THEME.text, fontFamily: "'Onest', sans-serif" }}>
            настоящее AR с 3D-существом, привязанным к маркеру →
          </div>
        </button>
      </div>

      <div className="mx-5 mb-3">
        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: THEME.textDim }}>
          прогресс по редкости
        </div>
      </div>
      <div className="mx-5 space-y-2">
        {Object.entries(RARITY).map(([key, r]) => {
          const stats = byRarity[key] || { caught: 0, total: 0 };
          return (
            <div key={key} className="p-3 rounded-2xl flex items-center gap-3"
                 style={{ background: THEME.surface, border: `1px solid ${r.color}33` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: `${r.color}22` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color, boxShadow: `0 0 12px ${r.color}` }}/>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider" style={{ color: r.color, fontFamily: "'Onest', sans-serif" }}>
                  {r.label}
                </div>
                <div style={{ color: THEME.text, fontFamily: "'Bungee', sans-serif", fontSize: 16 }}>
                  {stats.caught} / {stats.total}
                </div>
              </div>
              <div style={{ color: THEME.textDim, fontSize: 11 }}>
                {stats.total > 0 ? Math.round((stats.caught / stats.total) * 100) : 0}%
              </div>
            </div>
          );
        })}
      </div>

      {purchasedIds.length > 0 && (
        <>
          <div className="mx-5 mt-6 mb-2">
            <div className="text-xs uppercase tracking-widest" style={{ color: THEME.textDim }}>
              мои призы
            </div>
          </div>
          <div className="mx-5 space-y-2">
            {purchasedIds.map(id => {
              const item = SHOP_ITEMS.find(i => i.id === id);
              return item && (
                <div key={id} className="p-3 rounded-xl flex items-center gap-3"
                     style={{ background: THEME.surface, border: `1px dashed ${item.color}66` }}>
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1 text-sm" style={{ color: THEME.text }}>{item.name}</div>
                  <div className="text-xs px-2 py-1 rounded-full"
                       style={{ color: item.color, background: `${item.color}22` }}>
                    QR
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button onClick={onLogout}
              className="mx-5 mt-6 w-[calc(100%-2.5rem)] py-3 rounded-xl"
              style={{ background: THEME.surface, color: THEME.pink, fontFamily: "'Onest', sans-serif",
                       border: `1px solid ${THEME.pink}55` }}>
        Выйти
      </button>

      <div className="text-xs text-center mt-6 px-6" style={{ color: THEME.textDim }}>
        прототип v0.2 • бэкенд пока мокнут,<br/>
        спавны генерируются случайно каждые 8 секунд
      </div>
    </div>
  );
};

// =========================================================================
// НИЖНЯЯ НАВИГАЦИЯ
// =========================================================================
const BottomNav = ({ tab, setTab, hasCompletedQuests }) => {
  const items = [
    { id: "map",        label: "Карта",     icon: "◉" },
    { id: "quests",     label: "Задания",   icon: "✓" },
    { id: "collection", label: "Коллекция", icon: "✦" },
    { id: "profile",    label: "Я",         icon: "◈" },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-2"
         style={{ background: `linear-gradient(0deg, ${THEME.bg} 50%, transparent)` }}>
      <div className="flex rounded-2xl p-1.5"
           style={{ background: THEME.surface, border: `1px solid ${THEME.line}` }}>
        {items.map(it => {
          const active = tab === it.id;
          return (
            <button key={it.id}
                    onClick={() => setTab(it.id)}
                    className="flex-1 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition relative"
                    style={{
                      background: active ? THEME.cyan : "transparent",
                      color: active ? THEME.bg : THEME.textDim,
                      fontFamily: "'Onest', sans-serif"
                    }}>
              <span style={{ fontSize: 16 }}>{it.icon}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold">{it.label}</span>
              {it.id === "quests" && hasCompletedQuests && !active && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full" style={{ background: THEME.yellow }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// =========================================================================
export default function MallHuntPrototype() {
  // --- Сетевое состояние из useGame ---------------------------------
  const {
    user, isBooting, isMock,
    activeSpawns,       // уже обогащённый: { id, zone, creature, rarity, expiresAt }
    caughtIds,
    loginWithTelegram, requestPhoneCode, verifyPhoneCode, logout,
    tryCatch,
  } = useGame();

  // --- UI state (остаётся локальным) --------------------------------
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("map");
  const [screen, setScreen] = useState(null); // ar | shop | leaderboard
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [scannedQRSecret, setScannedQRSecret] = useState(null);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [toast, setToast] = useState(null);

  // --- Локальная геймификация (квесты/магазин пока без бэка) --------
  const [stats, setStats] = useState({ catches: 0, perfect: 0, rarePlus: 0, unique: 0, byZone: {} });
  const [claimedQuests, setClaimedQuests] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);

  // Удобный алиас для очков (вытаскиваем из user)
  const points = user?.points ?? 0;

  // --- Генератор псевдо-новостей (для атмосферы) --------------------
  useEffect(() => {
    if (!user || !onboarded) return;
    const names = ["Айдана", "Тимур", "Санжар", "Арина", "Данияр", "Алиса"];
    const generateNews = () => {
      const player = names[Math.floor(Math.random() * names.length)];
      const creature = CREATURES[Math.floor(Math.random() * CREATURES.length)];
      const minutes = 1 + Math.floor(Math.random() * 8);
      setNewsFeed(prev => [
        `🎯 ${player} поймал ${creature.name} · ${minutes} мин назад`,
        ...prev,
      ].slice(0, 5));
    };
    generateNews();
    const id = setInterval(generateNews, 11000);
    return () => clearInterval(id);
  }, [user, onboarded]);

  const showToast = (msg, color = THEME.cyan) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  // --- Адаптер для MapScreen ----------------------------------------
  // MapScreen ожидает формат { zone, creatureId } в activeSpawns,
  // но наш useGame возвращает { id, zone, creature, rarity }.
  // Приводим на месте:
  const mapSpawns = activeSpawns.map(s => ({
    id: s.id,
    zone: s.zone?.id || s.zoneSlug,
    creatureId: s.creature?.id || s.creatureSlug,
    spawnedAt: s.spawnedAt,
    ttl: Math.max(0, new Date(s.expiresAt).getTime() - Date.now()),
  }));

  // --- Обработчики --------------------------------------------------
  const handleZoneTap = (zone, spawn, creature) => {
    if (!spawn) {
      showToast(`${zone.name} — здесь никого нет`, THEME.textDim);
      return;
    }
    // spawn тут пришёл из MapScreen в её формате {zone, creatureId, ...}
    // нам нужен реальный spawn из activeSpawns, чтобы знать его id
    const realSpawn = activeSpawns.find(s =>
      (s.zone?.id || s.zoneSlug) === zone.id
    );
    if (!realSpawn) {
      showToast("Существо исчезло…", THEME.textDim);
      return;
    }
    setCurrentEncounter({ zone, creature, spawn: realSpawn });
    setScannedQRSecret(null);
    setScreen("ar");
  };

  const handleCaught = async (quality) => {
    if (!currentEncounter) return;
    const c = currentEncounter.creature;
    const zoneId = currentEncounter.zone.id;
    const spawnId = currentEncounter.spawn.id;
    const qrSecretAtTime = scannedQRSecret; // снимок до сброса state

    // Закрываем AR-экран заранее — бэк ответит быстро, UX ощущается живее
    setScreen(null);
    setCurrentEncounter(null);
    setScannedQRSecret(null);

    const result = await tryCatch(spawnId, quality, qrSecretAtTime);

    if (result.ok) {
      const earned = result.pointsEarned;
      const wasNew = !caughtIds.includes(c.id);
      setStats(prev => ({
        catches: prev.catches + 1,
        perfect: prev.perfect + (quality === "perfect" ? 1 : 0),
        rarePlus: prev.rarePlus + (["rare","epic","legendary"].includes(c.rarity) ? 1 : 0),
        unique: wasNew ? prev.unique + 1 : prev.unique,
        byZone: { ...prev.byZone, [zoneId]: (prev.byZone[zoneId] || 0) + 1 },
      }));
      showToast(
        quality === "perfect" ? `${c.name} +${earned} очков (бонус!)` : `${c.name} +${earned} очков`,
        quality === "perfect" ? THEME.yellow : THEME.cyan
      );
    } else {
      // Возможные коды: spawn_not_found, wrong_zone_qr, zone_cooldown,
      //                 cross_zone_fast, user_banned
      const messages = {
        spawn_not_found: "Существо уже исчезло…",
        wrong_zone_qr:   "QR не совпадает с зоной",
        zone_cooldown:   "Подожди — ты недавно ловил здесь",
        cross_zone_fast: "Слишком быстро между зонами",
        user_banned:     "Аккаунт заблокирован",
      };
      showToast(messages[result.code] || "Не получилось поймать", THEME.pink);
    }
  };

  const handleEscaped = () => {
    setScreen(null);
    setCurrentEncounter(null);
    setScannedQRSecret(null);
    showToast("Существо убежало… попробуй ещё раз", THEME.pink);
  };

  const handleCancelEncounter = () => {
    setScreen(null);
    setCurrentEncounter(null);
    setScannedQRSecret(null);
  };

  const handleClaimQuest = (q) => {
    setClaimedQuests(prev => [...prev, q.id]);
    // Квесты пока локальные — очки прибавляем через локальный setUser?
    // useGame не даёт прямого доступа, так что оставляем визуально.
    // В бэкенде нужен отдельный POST /me/quests/:id/claim.
    showToast(`Задание выполнено! +${q.reward} очков (локально)`, THEME.yellow);
  };

  const handleBuy = (item) => {
    if (points < item.price) return;
    setPurchasedIds(prev => [...prev, item.id]);
    showToast(`${item.name} куплено! QR в профиле`, THEME.green);
  };

  // Проверка, есть ли завершённые но не забранные квесты
  const hasCompletedQuests = QUESTS.some(q => {
    if (claimedQuests.includes(q.id)) return false;
    const progress = (() => {
      switch (q.metric) {
        case "catches": return stats.catches;
        case "perfect": return stats.perfect;
        case "food":    return stats.byZone.food || 0;
        case "rare+":   return stats.rarePlus;
        case "unique":  return stats.unique;
        default:        return 0;
      }
    })();
    return progress >= q.target;
  });

  return (
    <div className="mh-app-shell"
         style={{
           minHeight: "100dvh",
           width: "100%",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           background: `radial-gradient(ellipse at top left, ${THEME.violet}22 0%, #050814 60%)`,
           fontFamily: "'Onest', sans-serif"
         }}>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
      <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Onest:wght@300;400;500;700;800&display=swap" rel="stylesheet"/>

      {/* На мобильных: fullscreen. На десктопе: фрейм "телефон в браузере" */}
      <div className="mh-phone-frame relative overflow-hidden"
           style={{
             background: THEME.bg,
           }}>
        {/* Notch — только на десктопной рамке */}
        <div className="mh-notch absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full z-50"
             style={{ background: "#000" }}/>

        <div className="h-full relative">
          {/* Индикатор режима (mock vs live) — видно только в dev */}
          {isMock && user && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[60] px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest"
                 style={{ background: `${THEME.yellow}22`, color: THEME.yellow,
                          fontFamily: "'Onest', sans-serif",
                          border: `1px solid ${THEME.yellow}44` }}>
              offline demo
            </div>
          )}

          {isBooting ? (
            <div className="h-full flex items-center justify-center">
              <div style={{ color: THEME.textDim, fontFamily: "'Onest', sans-serif", fontSize: 13 }}>
                загрузка...
              </div>
            </div>
          ) : !user ? (
            <LoginScreen
              onRequestCode={requestPhoneCode}
              onLogin={async (creds) => {
              try {
                if (creds.via === "telegram") {
                  await loginWithTelegram(null);
                } else if (creds.via === "phone" && creds.phone && creds.code) {
                  await verifyPhoneCode(creds.phone, creds.code);
                }
                setTab("map");
              } catch (e) {
                showToast("Ошибка входа", THEME.pink);
              }
            }}/>
          ) : !onboarded ? (
            <OnboardingScreen onComplete={() => setOnboarded(true)}/>
          ) : screen === "ar" ? (
            <ARScreen
              zone={currentEncounter.zone}
              creature={currentEncounter.creature}
              expectedZoneSlug={currentEncounter.zone.id}
              onQRScanned={(secret) => setScannedQRSecret(secret)}
              qrScanEnabled={!isMock}
              onCaught={handleCaught}
              onEscaped={handleEscaped}
              onCancel={handleCancelEncounter}/>
          ) : screen === "shop" ? (
            <ShopScreen points={points} purchasedIds={purchasedIds}
                        onBack={() => setScreen(null)} onBuy={handleBuy}/>
          ) : screen === "leaderboard" ? (
            <LeaderboardScreen user={user} points={points} onBack={() => setScreen(null)}/>
          ) : screen === "ar-demo" ? (
            <ArDemoScreen onBack={() => setScreen(null)}/>
          ) : (
            <>
              {tab === "map" && (
                <MapScreen activeSpawns={mapSpawns} onZoneTap={handleZoneTap}
                           user={user} caughtIds={caughtIds} points={points} newsFeed={newsFeed}/>
              )}
              {tab === "quests" && (
                <QuestsScreen stats={stats} claimedIds={claimedQuests}
                              onClaim={handleClaimQuest} points={points}/>
              )}
              {tab === "collection" && (
                <CollectionScreen caughtIds={caughtIds} onSelect={setSelectedCreature} points={points}/>
              )}
              {tab === "profile" && (
                <ProfileScreen user={user} caughtIds={caughtIds} points={points}
                               purchasedIds={purchasedIds}
                               onShop={() => setScreen("shop")}
                               onLeaderboard={() => setScreen("leaderboard")}
                               onArDemo={() => setScreen("ar-demo")}
                               onLogout={() => {
                                 logout();
                                 setOnboarded(false);
                                 setStats({ catches: 0, perfect: 0, rarePlus: 0, unique: 0, byZone: {} });
                                 setClaimedQuests([]);
                                 setPurchasedIds([]);
                               }}/>
              )}
              <BottomNav tab={tab} setTab={setTab} hasCompletedQuests={hasCompletedQuests}/>
            </>
          )}

          {selectedCreature && (
            <CreatureDetail creature={selectedCreature} onClose={() => setSelectedCreature(null)}/>
          )}

          {toast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg max-w-[85%]"
                 style={{
                   background: THEME.surface,
                   border: `1px solid ${toast.color}66`,
                   color: toast.color,
                   fontFamily: "'Onest', sans-serif",
                   fontSize: 13,
                   fontWeight: 600,
                   animation: "slideDown .3s ease-out"
                 }}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { transform: translate(-50%, -30px); opacity: 0 } to { transform: translate(-50%, 0); opacity: 1 } }
      `}</style>
    </div>
  );
}
