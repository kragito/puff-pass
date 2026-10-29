/* Puff Pass standalone networking.
   Provides the same small "room" API the game was written against, over PeerJS (WebRTC).
   The host's browser is the hub: it registers the peer id for the room code, everyone else
   connects to it, and the hub relays each member's presence object to the rest. */
(function () {
  'use strict';
  const PREFIX = 'puffpass-bsq-v1-';
  const OPTS = Object.assign({ debug: 0 }, window.PP_PEER_OPTS || {});
  const TIMEOUT = 9000;
  const err = (code, message) => Object.assign(new Error(message || code), { code });
  const later = fn => setTimeout(fn, 0);

  function peerObj(id, presence, isMe) {
    return Object.freeze({ peer: id, by: null, isMe, sameTab: isMe, kind: 'viewer', guest: false, presence: Object.freeze({ ...(presence || {}) }), updatedAt: Date.now() });
  }
  function cleanPresence(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return {};
    try { const s = JSON.stringify(p); if (s.length > 12000) return {}; return JSON.parse(s); } catch (e) { return {}; }
  }

  function openPeer(id) {
    return new Promise((resolve, reject) => {
      if (typeof Peer !== 'function') { reject(err('upstream_error', 'PeerJS missing')); return; }
      const p = id ? new Peer(id, OPTS) : new Peer(OPTS);
      const t = setTimeout(() => { cleanup(); try { p.destroy(); } catch (e) {} reject(err('upstream_error', 'signaling timeout')); }, TIMEOUT);
      const onOpen = () => { cleanup(); resolve(p); };
      const onErr = e => { cleanup(); try { p.destroy(); } catch (x) {} reject(err(e && e.type === 'unavailable-id' ? 'taken' : 'upstream_error', e && e.type)); };
      function cleanup() { clearTimeout(t); p.off('open', onOpen); p.off('error', onErr); }
      p.on('open', onOpen);
      p.on('error', onErr);
    });
  }

  class Room {
    constructor(name) {
      this.name = name;
      this.mine = {};
      this.members = new Map();   // id -> frozen peer object (not including me)
      this.handlers = [];
      this.connHandlers = [];
      this.snap = Object.freeze([]);
      this.selfId = null;
      this.mode = null;
      this.conns = new Map();     // hub: id -> DataConnection
      this.hubConn = null;        // client: connection to hub
      this.peer = null;
      this.closed = false;
      this.isConnected = false;
    }
    self() { return peerObj(this.selfId, this.mine, true); }
    rebuild() { this.snap = Object.freeze([this.self(), ...this.members.values()]); }
    notify(ch) {
      this.rebuild();
      const c = { peers: this.snap, joined: ch.joined || [], left: ch.left || [], updated: ch.updated || [] };
      this.handlers.slice().forEach(h => later(() => { try { h(c); } catch (e) { console.error(e); } }));
    }
    setConnected(v) { if (this.isConnected === v) return; this.isConnected = v; this.connHandlers.slice().forEach(h => later(() => h(v))); }
    fail(code) {
      if (this.closed) return;
      this.closed = true;
      this.setConnected(false);
      const e = { code, message: code };
      (this.errHandlers || []).forEach(h => later(() => h(e)));
      try { this.peer && this.peer.destroy(); } catch (x) {}
    }

    async start(intent) {
      const hubId = PREFIX + this.name;
      if (intent === 'host') {
        const p = await openPeer(hubId);           // rejects with code 'taken' if the room code is in use
        this.startHub(p);
        return;
      }
      if (intent === 'guest') {
        const p = await openPeer(null);
        const conn = await new Promise(resolve => {
          let done = false;
          const finish = v => { if (!done) { done = true; clearTimeout(t); p.off('error', onErr); resolve(v); } };
          const c = p.connect(hubId, { reliable: true, serialization: 'json' });
          const t = setTimeout(() => finish(null), 12000);
          const onErr = e => { if (e && (e.type === 'peer-unavailable' || e.type === 'webrtc' || e.type === 'negotiation-failed')) finish(null); };
          p.on('error', onErr);
          c.on('open', () => finish(c));
        });
        if (!conn) { try { p.destroy(); } catch (e) {} throw err('no_room', 'no room with that code'); }
        this.startClient(p, conn);
        return;
      }
      // 1) try to reach an existing hub
      let p = await openPeer(null);
      const joined = await new Promise(resolve => {
        let done = false;
        const finish = v => { if (!done) { done = true; clearTimeout(t); p.off('error', onErr); resolve(v); } };
        const conn = p.connect(hubId, { reliable: true, serialization: 'json' });
        const t = setTimeout(() => finish(null), 6000);
        const onErr = e => { if (e && e.type === 'peer-unavailable') finish(null); };
        p.on('error', onErr);
        conn.on('open', () => finish(conn));
      });
      if (joined) { this.startClient(p, joined); return; }
      try { p.destroy(); } catch (e) {}
      // 2) nobody there: become the hub
      try { p = await openPeer(hubId); }
      catch (e) {
        if (e.code !== 'taken') throw e;
        // someone became hub at the same moment: join them instead
        p = await openPeer(null);
        const conn = p.connect(hubId, { reliable: true, serialization: 'json' });
        await new Promise((res, rej) => { conn.on('open', res); setTimeout(() => rej(err('upstream_error')), 6000); });
        this.startClient(p, conn);
        return;
      }
      this.startHub(p);
    }

    startClient(p, conn) {
      this.mode = 'client';
      this.peer = p;
      this.selfId = p.id;
      this.hubConn = conn;
      this.rebuild();
      this.setConnected(true);
      this.lastHub = Date.now();
      conn.on('data', d => { this.lastHub = Date.now(); this.onClientData(d); });
      conn.on('close', () => this.hubLost());
      conn.on('error', () => this.hubLost());
      this.hb = setInterval(() => {
        if (this.closed) return clearInterval(this.hb);
        if (Date.now() - this.lastHub > 8000) { clearInterval(this.hb); try { conn.close(); } catch (e) {} this.hubLost(); return; }
        if (conn.open) { try { conn.send({ t: 'hb' }); } catch (e) {} }
      }, 2000);
      p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
      conn.send({ t: 'p', presence: this.mine });
    }
    hubLost() {
      if (this.closed || this.lostHub) return;
      this.lostHub = true;
      clearInterval(this.hb);
      const left = [...this.members.values()];
      this.members.clear();
      this.notify({ left });
      this.setConnected(false);
    }
    onClientData(d) {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'all' && d.peers && typeof d.peers === 'object') {
        const joined = [], updated = [];
        const seen = new Set();
        Object.entries(d.peers).forEach(([id, pres]) => {
          if (id === this.selfId) return;
          seen.add(id);
          const o = peerObj(id, cleanPresence(pres), false);
          (this.members.has(id) ? updated : joined).push(o);
          this.members.set(id, o);
        });
        const left = [];
        [...this.members.keys()].forEach(id => { if (!seen.has(id)) { left.push(this.members.get(id)); this.members.delete(id); } });
        this.notify({ joined, updated, left });
      } else if (d.t === 'p' && typeof d.id === 'string' && d.id !== this.selfId) {
        const isNew = !this.members.has(d.id);
        const o = peerObj(d.id, cleanPresence(d.presence), false);
        this.members.set(d.id, o);
        this.notify(isNew ? { joined: [o] } : { updated: [o] });
      } else if (d.t === 'l' && typeof d.id === 'string') {
        const o = this.members.get(d.id);
        if (o) { this.members.delete(d.id); this.notify({ left: [o] }); }
      }
    }

    startHub(p) {
      this.mode = 'hub';
      this.peer = p;
      this.selfId = p.id;
      this.rebuild();
      this.setConnected(true);
      p.on('connection', conn => {
        conn.on('open', () => {
          this.conns.set(conn.peer, conn);
          const all = { [this.selfId]: this.mine };
          this.members.forEach((o, id) => { all[id] = o.presence; });
          try { conn.send({ t: 'all', peers: all }); } catch (e) {}
        });
        conn.lastSeen = Date.now();
        conn.on('data', d => {
          conn.lastSeen = Date.now();
          if (!d || d.t !== 'p') return;
          const pres = cleanPresence(d.presence);
          const isNew = !this.members.has(conn.peer);
          const o = peerObj(conn.peer, pres, false);
          this.members.set(conn.peer, o);
          this.broadcast({ t: 'p', id: conn.peer, presence: pres }, conn.peer);
          this.notify(isNew ? { joined: [o] } : { updated: [o] });
        });
        const gone = () => {
          if (!this.conns.has(conn.peer)) return;
          this.conns.delete(conn.peer);
          const o = this.members.get(conn.peer);
          this.members.delete(conn.peer);
          this.broadcast({ t: 'l', id: conn.peer });
          if (o) this.notify({ left: [o] });
        };
        conn.on('close', gone);
        conn.on('error', gone);
        conn.gone = gone;
      });
      this.hb = setInterval(() => {
        if (this.closed) return clearInterval(this.hb);
        this.conns.forEach(c => {
          if (Date.now() - (c.lastSeen || 0) > 8000) { try { c.close(); } catch (e) {} if (c.gone) c.gone(); }
        });
        this.broadcast({ t: 'hb' });
      }, 2000);
      // keep the room code registered if the signaling socket drops; open games keep running meanwhile
      p.on('disconnected', () => { if (!this.closed) setTimeout(() => { try { if (!this.closed && p.disconnected) p.reconnect(); } catch (e) {} }, 1000); });
    }
    broadcast(msg, except) {
      this.conns.forEach((c, id) => { if (id !== except && c.open) { try { c.send(msg); } catch (e) {} } });
    }

    api() {
      const r = this;
      return Object.freeze({
        name: r.name,
        presence(patch) {
          if (r.closed) return Promise.reject(err('invalid_argument', 'left'));
          for (const k in patch) { if (patch[k] === null) delete r.mine[k]; else r.mine[k] = patch[k]; }
          const me = r.self();
          r.snap = Object.freeze([me, ...r.members.values()]);
          if (r.mode === 'hub') r.broadcast({ t: 'p', id: r.selfId, presence: r.mine });
          else if (r.hubConn && r.hubConn.open) { try { r.hubConn.send({ t: 'p', presence: r.mine }); } catch (e) {} }
          r.notify({ updated: [me] });
          return Promise.resolve();
        },
        peers: () => r.snap,
        onPeers(h, onError) {
          r.handlers.push(h);
          if (onError) (r.errHandlers = r.errHandlers || []).push(onError);
          later(() => h({ peers: r.snap, joined: [...r.snap], left: [], updated: [] }));
          return () => { r.handlers = r.handlers.filter(x => x !== h); };
        },
        connected: () => r.isConnected,
        hub: () => r.mode === 'hub',
        onConnection(h) { r.connHandlers.push(h); later(() => h(r.isConnected)); return () => { r.connHandlers = r.connHandlers.filter(x => x !== h); }; },
        emit: () => Promise.resolve(),
        on: () => () => {},
        leave() {
          r.closed = true;
          clearInterval(r.hb);
          r.handlers = []; r.connHandlers = [];
          try { r.hubConn && r.hubConn.close(); } catch (e) {}
          r.conns.forEach(c => { try { c.close(); } catch (e) {} });
          setTimeout(() => { try { r.peer && r.peer.destroy(); } catch (e) {} }, 300);
          return Promise.resolve();
        },
      });
    }
  }

  const openRooms = new Set();
  /* The lobby is local only: there's no public room directory without a server, so rooms are joined by code or invite link. */
  const lobbySelf = peerObj('local', {}, true);
  const lobby = Object.freeze({
    presence: () => Promise.resolve(),
    peers: () => Object.freeze([lobbySelf]),
    onPeers(h) { later(() => h({ peers: [lobbySelf], joined: [lobbySelf], left: [], updated: [] })); return () => {}; },
    onConnection(h) { later(() => h(typeof Peer === 'function')); return () => {}; },
    connected: () => typeof Peer === 'function',
    emit: () => Promise.resolve(),
    on: () => () => {},
    async join(name, opts) {
      const room = new Room(name);
      await room.start(opts && opts.as);
      openRooms.add(room);
      return room.api();
    },
  });

  addEventListener('pagehide', () => {
    openRooms.forEach(r => { try { r.hubConn && r.hubConn.close(); r.conns.forEach(c => c.close()); r.peer && r.peer.destroy(); } catch (e) {} });
  });
  window.claude = { use: name => Promise.resolve(name === 'room' && typeof Peer === 'function' ? lobby : null) };
  window.PP_STANDALONE = true;
})();
