/**
 * NEUROWELL - Firebase Service & Data Abstraction Layer
 * Works in two modes:
 *   - Firebase mode: Firebase Auth + Firestore
 *   - Offline mode:  localStorage fallback (no config needed)
 *
 * TO CONFIGURE FIREBASE:
 *   1. firebase.google.com → New project → Web app
 *   2. Enable Email/Password auth
 *   3. Create Firestore database
 *   4. Paste your config in FIREBASE_CONFIG below
 */

const FirebaseService = (() => {

  const FIREBASE_CONFIG = {
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId:             "YOUR_APP_ID"
  };

  const IS_CONFIGURED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

  // Local auth store
  const _local = {
    USERS: 'nw_local_users', SESSION: 'nw_local_session',
    getUsers()   { try { return JSON.parse(localStorage.getItem(this.USERS) || '{}'); } catch { return {}; } },
    saveUsers(u) { localStorage.setItem(this.USERS, JSON.stringify(u)); },
    getSession() { try { return JSON.parse(localStorage.getItem(this.SESSION) || 'null'); } catch { return null; } },
    setSession(u){ localStorage.setItem(this.SESSION, JSON.stringify(u)); },
    clearSession(){ localStorage.removeItem(this.SESSION); }
  };

  async function _hash(pw) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + '_nw_v1'));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    } catch { return btoa(pw + '_nw_v1'); }
  }

  let _auth = null, _db = null, _ready = false;
  const _listeners = [];

  async function _loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = Object.assign(document.createElement('script'), { src, onload:res, onerror:rej });
      document.head.appendChild(s);
    });
  }

  const FIREBASE_SDK = [
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
  ];

  function _userKey(uid) { return `nw_userdata_${uid}`; }

  function _deepMerge(a, b) {
    const out = { ...a };
    Object.keys(b || {}).forEach(k => {
      out[k] = (typeof b[k] === 'object' && !Array.isArray(b[k]) && b[k])
        ? _deepMerge(a[k] || {}, b[k]) : b[k];
    });
    return out;
  }

  function _fbErr(code) {
    return ({
      'auth/email-already-in-use': 'Account already exists with this email.',
      'auth/invalid-email':        'Invalid email address.',
      'auth/weak-password':        'Password must be at least 6 characters.',
      'auth/user-not-found':       'No account found with this email.',
      'auth/wrong-password':       'Incorrect password.',
      'auth/too-many-requests':    'Too many attempts. Please wait.',
      'auth/network-request-failed':'Network error. Check your connection.',
    })[code] || 'An error occurred. Please try again.';
  }

  return {
    get isOnline()     { return _ready; },
    get isConfigured() { return IS_CONFIGURED; },

    async init() {
      if (IS_CONFIGURED) {
        try {
          await Promise.all(FIREBASE_SDK.map(_loadScript));
          if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
          _auth = firebase.auth();
          _db   = firebase.firestore();
          _ready = true;
          _auth.onAuthStateChanged(u => {
            const user = u ? { uid:u.uid, email:u.email, displayName:u.displayName || u.email.split('@')[0] } : null;
            _listeners.forEach(fn => fn(user));
          });
          console.info('✅ Firebase connected');
        } catch (e) { console.warn('Firebase failed, using offline mode:', e.message); }
      }
      if (!_ready) {
        const s = _local.getSession();
        if (s) setTimeout(() => _listeners.forEach(fn => fn(s)), 0);
      }
    },

    onAuthChange(fn) { _listeners.push(fn); },

    getCurrentUser() {
      if (_ready && _auth) {
        const u = _auth.currentUser;
        return u ? { uid:u.uid, email:u.email, displayName:u.displayName||u.email.split('@')[0] } : null;
      }
      return _local.getSession();
    },

    async registerUser(email, password, displayName = '') {
      if (!email || !password) return { user:null, error:'Email and password required.' };
      if (password.length < 8) return { user:null, error:'Password must be at least 8 characters.' };

      if (_ready) {
        try {
          const c = await _auth.createUserWithEmailAndPassword(email, password);
          if (displayName) await c.user.updateProfile({ displayName });
          const user = { uid:c.user.uid, email, displayName: displayName||email.split('@')[0] };
          await this.saveUserData(user.uid, { profile:{...user, createdAt:new Date().toISOString()}, wellnessData:{}, history:[], goals:{}, gameData:{} });
          return { user, error:null };
        } catch(e) { return { user:null, error:_fbErr(e.code) }; }
      }

      const users = _local.getUsers();
      if (users[email]) return { user:null, error:'Account already exists with this email.' };
      const hash = await _hash(password);
      const uid  = 'local_' + Date.now().toString(36);
      const user = { uid, email, displayName: displayName||email.split('@')[0], createdAt: new Date().toISOString() };
      users[email] = { ...user, hash };
      _local.saveUsers(users);
      _local.setSession(user);
      await this.saveUserData(uid, { profile:user, wellnessData:{}, history:[], goals:{}, gameData:{} });
      _listeners.forEach(fn => fn(user));
      return { user, error:null };
    },

    async loginUser(email, password) {
      if (!email || !password) return { user:null, error:'Enter your email and password.' };

      if (_ready) {
        try {
          const c = await _auth.signInWithEmailAndPassword(email, password);
          const user = { uid:c.user.uid, email:c.user.email, displayName:c.user.displayName||c.user.email.split('@')[0] };
          await this.syncCloudToLocal(user.uid);
          return { user, error:null };
        } catch(e) { return { user:null, error:_fbErr(e.code) }; }
      }

      const users = _local.getUsers();
      const rec   = users[email];
      if (!rec) return { user:null, error:'No account found with this email.' };
      const hash = await _hash(password);
      if (rec.hash !== hash) return { user:null, error:'Incorrect password.' };
      const user = { uid:rec.uid, email:rec.email, displayName:rec.displayName };
      _local.setSession(user);
      _listeners.forEach(fn => fn(user));
      return { user, error:null };
    },

    async logoutUser() {
      const uid = this.getCurrentUser()?.uid;
      if (uid && _ready) await this.syncLocalToCloud(uid).catch(() => {});
      if (_ready) await _auth.signOut().catch(() => {});
      _local.clearSession();
      _listeners.forEach(fn => fn(null));
    },

    async saveUserData(uid, data) {
      if (_ready) {
        try { await _db.collection('users').doc(uid).set(data, { merge:true }); return true; }
        catch(e) { console.warn('Firestore write failed:', e.message); }
      }
      try {
        const existing = await this.fetchUserData(uid) || {};
        localStorage.setItem(_userKey(uid), JSON.stringify(_deepMerge(existing, data)));
        return true;
      } catch { return false; }
    },

    async fetchUserData(uid) {
      if (_ready) {
        try {
          const doc = await _db.collection('users').doc(uid).get();
          return doc.exists ? doc.data() : null;
        } catch(e) { console.warn('Firestore read failed:', e.message); }
      }
      try { const r = localStorage.getItem(_userKey(uid)); return r ? JSON.parse(r) : null; }
      catch { return null; }
    },

    async updateUserData(uid, updates) {
      if (_ready) {
        try { await _db.collection('users').doc(uid).update(updates); return true; }
        catch(e) { console.warn('Firestore update failed:', e.message); }
      }
      return this.saveUserData(uid, updates);
    },

    async syncLocalToCloud(uid) {
      if (!_ready || !uid) return false;
      try {
        const payload = {
          wellnessData: JSON.parse(localStorage.getItem('nw_wellness_score') || '{}'),
          history:      JSON.parse(localStorage.getItem('nw_digital_twin_history') || '[]'),
          goals:        JSON.parse(localStorage.getItem('nw_goal_engine_v1') || '{}'),
          gameData:     JSON.parse(localStorage.getItem('nw_engagement_v2') || '{}'),
          mood:         JSON.parse(localStorage.getItem('nw_emotion_ai_v1') || '{}'),
          syncedAt:     new Date().toISOString()
        };
        await this.updateUserData(uid, payload);
        return true;
      } catch { return false; }
    },

    async syncCloudToLocal(uid) {
      if (!_ready || !uid) return false;
      try {
        const data = await this.fetchUserData(uid);
        if (!data) return false;
        const MAP = { history:'nw_digital_twin_history', goals:'nw_goal_engine_v1', gameData:'nw_engagement_v2', mood:'nw_emotion_ai_v1', wellnessData:'nw_wellness_score' };
        Object.entries(MAP).forEach(([k, lsKey]) => { if (data[k]) localStorage.setItem(lsKey, JSON.stringify(data[k])); });
        return true;
      } catch { return false; }
    },

    subscribeUserData(uid, callback) {
      if (_ready) return _db.collection('users').doc(uid).onSnapshot(d => { if (d.exists) callback(d.data()); });
      const t = setInterval(async () => { const d = await this.fetchUserData(uid); if (d) callback(d); }, 10000);
      return () => clearInterval(t);
    }
  };
})();
