const De = {
  context: void 0,
  registry: void 0,
  effects: void 0,
  done: !1,
  getContextId() {
    return ys(this.context.count);
  },
  getNextContextId() {
    return ys(this.context.count++);
  }
};
function ys(e) {
  const t = String(e), n = t.length - 1;
  return De.context.id + (n ? String.fromCharCode(96 + n) : "") + t;
}
function Tf(e) {
  De.context = e;
}
const Lf = !1, Df = (e, t) => e === t, Lr = Symbol("solid-proxy"), Tc = typeof Proxy == "function", Of = Symbol("solid-track"), Dr = {
  equals: Df
};
let Lc = Mc;
const _n = 1, Or = 2, Dc = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var ge = null;
let Tl = null, Rf = null, Pe = null, Qe = null, ln = null, Ur = 0;
function Pr(e, t) {
  const n = Pe, o = ge, r = e.length === 0, l = o, i = r ? Dc : {
    owned: null,
    cleanups: null,
    context: l ? l.context : null,
    owner: l
  }, s = r ? e : () => e(() => bt(() => tr(i)));
  ge = i, Pe = null;
  try {
    return Po(s, !0);
  } finally {
    Pe = n, ge = o;
  }
}
function _e(e, t) {
  t = t ? Object.assign({}, Dr, t) : Dr;
  const n = {
    value: e,
    observers: null,
    observerSlots: null,
    comparator: t.equals || void 0
  }, o = (r) => (typeof r == "function" && (r = r(n.value)), Rc(n, r));
  return [Oc.bind(n), o];
}
function Lt(e, t, n) {
  const o = si(e, t, !1, _n);
  ar(o);
}
function qe(e, t, n) {
  Lc = Vf;
  const o = si(e, t, !1, _n);
  (!n || !n.render) && (o.user = !0), ln ? ln.push(o) : ar(o);
}
function Ke(e, t, n) {
  n = n ? Object.assign({}, Dr, n) : Dr;
  const o = si(e, t, !0, 0);
  return o.observers = null, o.observerSlots = null, o.comparator = n.equals || void 0, ar(o), Oc.bind(o);
}
function bt(e) {
  if (Pe === null) return e();
  const t = Pe;
  Pe = null;
  try {
    return e();
  } finally {
    Pe = t;
  }
}
function Fl(e, t, n) {
  const o = Array.isArray(e);
  let r, l = n && n.defer;
  return (i) => {
    let s;
    if (o) {
      s = Array(e.length);
      for (let d = 0; d < e.length; d++) s[d] = e[d]();
    } else s = e();
    if (l)
      return l = !1, i;
    const a = bt(() => t(s, r, i));
    return r = s, a;
  };
}
function Wr(e) {
  qe(() => bt(e));
}
function Xe(e) {
  return ge === null || (ge.cleanups === null ? ge.cleanups = [e] : ge.cleanups.push(e)), e;
}
function bs() {
  return ge;
}
function Mf(e, t) {
  const n = ge, o = Pe;
  ge = e, Pe = null;
  try {
    return Po(t, !0);
  } catch (r) {
    ci(r);
  } finally {
    ge = n, Pe = o;
  }
}
function Hr(e, t) {
  const n = Symbol("context");
  return {
    id: n,
    Provider: Ff(n),
    defaultValue: e
  };
}
function Gr(e) {
  let t;
  return ge && ge.context && (t = ge.context[e.id]) !== void 0 ? t : e.defaultValue;
}
function $f(e) {
  const t = Ke(e), n = Ke(() => Bl(t()));
  return n.toArray = () => {
    const o = n();
    return Array.isArray(o) ? o : o != null ? [o] : [];
  }, n;
}
function Oc() {
  if (this.sources && this.state)
    if (this.state === _n) ar(this);
    else {
      const e = Qe;
      Qe = null, Po(() => Mr(this), !1), Qe = e;
    }
  if (Pe) {
    const e = this.observers ? this.observers.length : 0;
    Pe.sources ? (Pe.sources.push(this), Pe.sourceSlots.push(e)) : (Pe.sources = [this], Pe.sourceSlots = [e]), this.observers ? (this.observers.push(Pe), this.observerSlots.push(Pe.sources.length - 1)) : (this.observers = [Pe], this.observerSlots = [Pe.sources.length - 1]);
  }
  return this.value;
}
function Rc(e, t, n) {
  let o = e.value;
  return (!e.comparator || !e.comparator(o, t)) && (e.value = t, e.observers && e.observers.length && Po(() => {
    for (let r = 0; r < e.observers.length; r += 1) {
      const l = e.observers[r], i = Tl && Tl.running;
      i && Tl.disposed.has(l), (i ? !l.tState : !l.state) && (l.pure ? Qe.push(l) : ln.push(l), l.observers && $c(l)), i || (l.state = _n);
    }
    if (Qe.length > 1e6)
      throw Qe = [], new Error();
  }, !1)), t;
}
function ar(e) {
  if (!e.fn) return;
  tr(e);
  const t = Ur;
  Nf(
    e,
    e.value,
    t
  );
}
function Nf(e, t, n) {
  let o;
  const r = ge, l = Pe;
  Pe = ge = e;
  try {
    o = e.fn(t);
  } catch (i) {
    return e.pure && (e.state = _n, e.owned && e.owned.forEach(tr), e.owned = null), e.updatedAt = n + 1, ci(i);
  } finally {
    Pe = l, ge = r;
  }
  (!e.updatedAt || e.updatedAt <= n) && (e.updatedAt != null && "observers" in e ? Rc(e, o) : e.value = o, e.updatedAt = n);
}
function si(e, t, n, o = _n, r) {
  const l = {
    fn: e,
    state: o,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: t,
    owner: ge,
    context: ge ? ge.context : null,
    pure: n
  };
  return ge === null || ge !== Dc && (ge.owned ? ge.owned.push(l) : ge.owned = [l]), l;
}
function Rr(e) {
  if (e.state === 0) return;
  if (e.state === Or) return Mr(e);
  if (e.suspense && bt(e.suspense.inFallback)) return e.suspense.effects.push(e);
  const t = [e];
  for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < Ur); )
    e.state && t.push(e);
  for (let n = t.length - 1; n >= 0; n--)
    if (e = t[n], e.state === _n)
      ar(e);
    else if (e.state === Or) {
      const o = Qe;
      Qe = null, Po(() => Mr(e, t[0]), !1), Qe = o;
    }
}
function Po(e, t) {
  if (Qe) return e();
  let n = !1;
  t || (Qe = []), ln ? n = !0 : ln = [], Ur++;
  try {
    const o = e();
    return zf(n), o;
  } catch (o) {
    n || (ln = null), Qe = null, ci(o);
  }
}
function zf(e) {
  if (Qe && (Mc(Qe), Qe = null), e) return;
  const t = ln;
  ln = null, t.length && Po(() => Lc(t), !1);
}
function Mc(e) {
  for (let t = 0; t < e.length; t++) Rr(e[t]);
}
function Vf(e) {
  let t, n = 0;
  for (t = 0; t < e.length; t++) {
    const o = e[t];
    o.user ? e[n++] = o : Rr(o);
  }
  if (De.context) {
    if (De.count) {
      De.effects || (De.effects = []), De.effects.push(...e.slice(0, n));
      return;
    }
    Tf();
  }
  for (De.effects && !De.count && (e = [...De.effects, ...e], n += De.effects.length, delete De.effects), t = 0; t < n; t++) Rr(e[t]);
}
function Mr(e, t) {
  e.state = 0;
  for (let n = 0; n < e.sources.length; n += 1) {
    const o = e.sources[n];
    if (o.sources) {
      const r = o.state;
      r === _n ? o !== t && (!o.updatedAt || o.updatedAt < Ur) && Rr(o) : r === Or && Mr(o, t);
    }
  }
}
function $c(e) {
  for (let t = 0; t < e.observers.length; t += 1) {
    const n = e.observers[t];
    n.state || (n.state = Or, n.pure ? Qe.push(n) : ln.push(n), n.observers && $c(n));
  }
}
function tr(e) {
  let t;
  if (e.sources)
    for (; e.sources.length; ) {
      const n = e.sources.pop(), o = e.sourceSlots.pop(), r = n.observers;
      if (r && r.length) {
        const l = r.pop(), i = n.observerSlots.pop();
        o < r.length && (l.sourceSlots[i] = o, r[o] = l, n.observerSlots[o] = i);
      }
    }
  if (e.tOwned) {
    for (t = e.tOwned.length - 1; t >= 0; t--) tr(e.tOwned[t]);
    delete e.tOwned;
  }
  if (e.owned) {
    for (t = e.owned.length - 1; t >= 0; t--) tr(e.owned[t]);
    e.owned = null;
  }
  if (e.cleanups) {
    for (t = e.cleanups.length - 1; t >= 0; t--) e.cleanups[t]();
    e.cleanups = null;
  }
  e.state = 0;
}
function If(e) {
  return e instanceof Error ? e : new Error(typeof e == "string" ? e : "Unknown error", {
    cause: e
  });
}
function ci(e, t = ge) {
  throw If(e);
}
function Bl(e) {
  if (typeof e == "function" && !e.length) return Bl(e());
  if (Array.isArray(e)) {
    const t = [];
    for (let n = 0; n < e.length; n++) {
      const o = Bl(e[n]);
      Array.isArray(o) ? t.push.apply(t, o) : t.push(o);
    }
    return t;
  }
  return e;
}
function Ff(e, t) {
  return function(o) {
    let r;
    return Lt(
      () => r = bt(() => (ge.context = {
        ...ge.context,
        [e]: o.value
      }, $f(() => o.children))),
      void 0
    ), r;
  };
}
const Bf = Symbol("fallback");
function xs(e) {
  for (let t = 0; t < e.length; t++) e[t]();
}
function Uf(e, t, n = {}) {
  let o = [], r = [], l = [], i = 0, s = t.length > 1 ? [] : null;
  return Xe(() => xs(l)), () => {
    let a = e() || [], d = a.length, p, u;
    return a[Of], bt(() => {
      let w, v, A, k, x, b, _, C, T;
      if (d === 0)
        i !== 0 && (xs(l), l = [], o = [], r = [], i = 0, s && (s = [])), n.fallback && (o = [Bf], r[0] = Pr((P) => (l[0] = P, n.fallback())), i = 1);
      else if (i === 0) {
        for (r = new Array(d), u = 0; u < d; u++)
          o[u] = a[u], r[u] = Pr(g);
        i = d;
      } else {
        for (A = new Array(d), k = new Array(d), s && (x = new Array(d)), b = 0, _ = Math.min(i, d); b < _ && o[b] === a[b]; b++) ;
        for (_ = i - 1, C = d - 1; _ >= b && C >= b && o[_] === a[C]; _--, C--)
          A[C] = r[_], k[C] = l[_], s && (x[C] = s[_]);
        for (w = /* @__PURE__ */ new Map(), v = new Array(C + 1), u = C; u >= b; u--)
          T = a[u], p = w.get(T), v[u] = p === void 0 ? -1 : p, w.set(T, u);
        for (p = b; p <= _; p++)
          T = o[p], u = w.get(T), u !== void 0 && u !== -1 ? (A[u] = r[p], k[u] = l[p], s && (x[u] = s[p]), u = v[u], w.set(T, u)) : l[p]();
        for (u = b; u < d; u++)
          u in A ? (r[u] = A[u], l[u] = k[u], s && (s[u] = x[u], s[u](u))) : r[u] = Pr(g);
        r = r.slice(0, i = d), o = a.slice(0);
      }
      return r;
    });
    function g(w) {
      if (l[u] = w, s) {
        const [v, A] = _e(u);
        return s[u] = A, t(a[u], v);
      }
      return t(a[u]);
    }
  };
}
function ce(e, t) {
  return bt(() => e(t || {}));
}
function Sr() {
  return !0;
}
const Ul = {
  get(e, t, n) {
    return t === Lr ? n : e.get(t);
  },
  has(e, t) {
    return t === Lr ? !0 : e.has(t);
  },
  set: Sr,
  deleteProperty: Sr,
  getOwnPropertyDescriptor(e, t) {
    return {
      configurable: !0,
      enumerable: !0,
      get() {
        return e.get(t);
      },
      set: Sr,
      deleteProperty: Sr
    };
  },
  ownKeys(e) {
    return e.keys();
  }
};
function Ll(e) {
  return (e = typeof e == "function" ? e() : e) ? e : {};
}
function Wf() {
  for (let e = 0, t = this.length; e < t; ++e) {
    const n = this[e]();
    if (n !== void 0) return n;
  }
}
function Zt(...e) {
  let t = !1;
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    t = t || !!s && Lr in s, e[i] = typeof s == "function" ? (t = !0, Ke(s)) : s;
  }
  if (Tc && t)
    return new Proxy(
      {
        get(i) {
          for (let s = e.length - 1; s >= 0; s--) {
            const a = Ll(e[s])[i];
            if (a !== void 0) return a;
          }
        },
        has(i) {
          for (let s = e.length - 1; s >= 0; s--)
            if (i in Ll(e[s])) return !0;
          return !1;
        },
        keys() {
          const i = [];
          for (let s = 0; s < e.length; s++)
            i.push(...Object.keys(Ll(e[s])));
          return [...new Set(i)];
        }
      },
      Ul
    );
  const n = {}, o = /* @__PURE__ */ Object.create(null);
  for (let i = e.length - 1; i >= 0; i--) {
    const s = e[i];
    if (!s) continue;
    const a = Object.getOwnPropertyNames(s);
    for (let d = a.length - 1; d >= 0; d--) {
      const p = a[d];
      if (p === "__proto__" || p === "constructor") continue;
      const u = Object.getOwnPropertyDescriptor(s, p);
      if (!o[p])
        o[p] = u.get ? {
          enumerable: !0,
          configurable: !0,
          get: Wf.bind(n[p] = [u.get.bind(s)])
        } : u.value !== void 0 ? u : void 0;
      else {
        const g = n[p];
        g && (u.get ? g.push(u.get.bind(s)) : u.value !== void 0 && g.push(() => u.value));
      }
    }
  }
  const r = {}, l = Object.keys(o);
  for (let i = l.length - 1; i >= 0; i--) {
    const s = l[i], a = o[s];
    a && a.get ? Object.defineProperty(r, s, a) : r[s] = a ? a.value : void 0;
  }
  return r;
}
function un(e, ...t) {
  if (Tc && Lr in e) {
    const r = new Set(t.length > 1 ? t.flat() : t[0]), l = t.map((i) => new Proxy(
      {
        get(s) {
          return i.includes(s) ? e[s] : void 0;
        },
        has(s) {
          return i.includes(s) && s in e;
        },
        keys() {
          return i.filter((s) => s in e);
        }
      },
      Ul
    ));
    return l.push(
      new Proxy(
        {
          get(i) {
            return r.has(i) ? void 0 : e[i];
          },
          has(i) {
            return r.has(i) ? !1 : i in e;
          },
          keys() {
            return Object.keys(e).filter((i) => !r.has(i));
          }
        },
        Ul
      )
    ), l;
  }
  const n = {}, o = t.map(() => ({}));
  for (const r of Object.getOwnPropertyNames(e)) {
    const l = Object.getOwnPropertyDescriptor(e, r), i = !l.get && !l.set && l.enumerable && l.writable && l.configurable;
    let s = !1, a = 0;
    for (const d of t)
      d.includes(r) && (s = !0, i ? o[a][r] = l.value : Object.defineProperty(o[a], r, l)), ++a;
    s || (i ? n[r] = l.value : Object.defineProperty(n, r, l));
  }
  return [...o, n];
}
let Hf = 0;
function Gf() {
  return De.context ? De.getNextContextId() : `cl-${Hf++}`;
}
const jf = (e) => `Stale read from <${e}>.`;
function Yf(e) {
  const t = "fallback" in e && {
    fallback: () => e.fallback
  };
  return Ke(Uf(() => e.each, e.children, t || void 0));
}
function nr(e) {
  const t = e.keyed, n = Ke(() => e.when, void 0, void 0), o = t ? n : Ke(n, void 0, {
    equals: (r, l) => !r == !l
  });
  return Ke(
    () => {
      const r = o();
      if (r) {
        const l = e.children;
        return typeof l == "function" && l.length > 0 ? bt(
          () => l(
            t ? r : () => {
              if (!bt(o)) throw jf("Show");
              return n();
            }
          )
        ) : l;
      }
      return e.fallback;
    },
    void 0,
    void 0
  );
}
const Kf = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "hidden",
  "indeterminate",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected"
], qf = /* @__PURE__ */ new Set([
  "className",
  "value",
  "readOnly",
  "noValidate",
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  ...Kf
]), Jf = /* @__PURE__ */ new Set([
  "innerHTML",
  "textContent",
  "innerText",
  "children"
]), Zf = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
  className: "class",
  htmlFor: "for"
}), Qf = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
  class: "className",
  novalidate: {
    $: "noValidate",
    FORM: 1
  },
  formnovalidate: {
    $: "formNoValidate",
    BUTTON: 1,
    INPUT: 1
  },
  ismap: {
    $: "isMap",
    IMG: 1
  },
  nomodule: {
    $: "noModule",
    SCRIPT: 1
  },
  playsinline: {
    $: "playsInline",
    VIDEO: 1
  },
  readonly: {
    $: "readOnly",
    INPUT: 1,
    TEXTAREA: 1
  }
});
function Xf(e, t) {
  const n = Qf[e];
  return typeof n == "object" ? n[t] ? n.$ : void 0 : n;
}
const eu = /* @__PURE__ */ new Set([
  "beforeinput",
  "click",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
]), tu = /* @__PURE__ */ new Set([
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animate",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "color-profile",
  "cursor",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignObject",
  "g",
  "glyph",
  "glyphRef",
  "hkern",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "missing-glyph",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "set",
  "stop",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tref",
  "tspan",
  "use",
  "view",
  "vkern"
]), nu = {
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace"
}, ou = (e) => Ke(() => e());
function ru(e, t, n) {
  let o = n.length, r = t.length, l = o, i = 0, s = 0, a = t[r - 1].nextSibling, d = null;
  for (; i < r || s < l; ) {
    if (t[i] === n[s]) {
      i++, s++;
      continue;
    }
    for (; t[r - 1] === n[l - 1]; )
      r--, l--;
    if (r === i) {
      const p = l < o ? s ? n[s - 1].nextSibling : n[l - s] : a;
      for (; s < l; ) e.insertBefore(n[s++], p);
    } else if (l === s)
      for (; i < r; )
        (!d || !d.has(t[i])) && t[i].remove(), i++;
    else if (t[i] === n[l - 1] && n[s] === t[r - 1]) {
      const p = t[--r].nextSibling;
      e.insertBefore(n[s++], t[i++].nextSibling), e.insertBefore(n[--l], p), t[r] = n[l];
    } else {
      if (!d) {
        d = /* @__PURE__ */ new Map();
        let u = s;
        for (; u < l; ) d.set(n[u], u++);
      }
      const p = d.get(t[i]);
      if (p != null)
        if (s < p && p < l) {
          let u = i, g = 1, w;
          for (; ++u < r && u < l && !((w = d.get(t[u])) == null || w !== p + g); )
            g++;
          if (g > p - s) {
            const v = t[i];
            for (; s < p; ) e.insertBefore(n[s++], v);
          } else e.replaceChild(n[s++], t[i++]);
        } else i++;
      else t[i++].remove();
    }
  }
}
const vs = "_$DX_DELEGATE";
function Qt(e, t, n, o) {
  let r;
  const l = () => {
    const s = document.createElement("template");
    return s.innerHTML = e, s.content.firstChild;
  }, i = () => (r || (r = l())).cloneNode(!0);
  return i.cloneNode = i, i;
}
function jr(e, t = window.document) {
  const n = t[vs] || (t[vs] = /* @__PURE__ */ new Set());
  for (let o = 0, r = e.length; o < r; o++) {
    const l = e[o];
    n.has(l) || (n.add(l), t.addEventListener(l, pu));
  }
}
function or(e, t, n) {
  jn(e) || (n == null ? e.removeAttribute(t) : e.setAttribute(t, n));
}
function lu(e, t, n, o) {
  jn(e) || (o == null ? e.removeAttributeNS(t, n) : e.setAttributeNS(t, n, o));
}
function iu(e, t, n) {
  jn(e) || (n ? e.setAttribute(t, "") : e.removeAttribute(t));
}
function Tt(e, t) {
  jn(e) || (t == null ? e.removeAttribute("class") : e.className = t);
}
function su(e, t, n, o) {
  if (o)
    Array.isArray(n) ? (e[`$$${t}`] = n[0], e[`$$${t}Data`] = n[1]) : e[`$$${t}`] = n;
  else if (Array.isArray(n)) {
    const r = n[0];
    e.addEventListener(t, n[0] = (l) => r.call(e, n[1], l));
  } else e.addEventListener(t, n, typeof n != "function" && n);
}
function cu(e, t, n = {}) {
  const o = Object.keys(t || {}), r = Object.keys(n);
  let l, i;
  for (l = 0, i = r.length; l < i; l++) {
    const s = r[l];
    !s || s === "undefined" || t[s] || (Ss(e, s, !1), delete n[s]);
  }
  for (l = 0, i = o.length; l < i; l++) {
    const s = o[l], a = !!t[s];
    !s || s === "undefined" || n[s] === a || !a || (Ss(e, s, !0), n[s] = a);
  }
  return n;
}
function au(e, t, n) {
  if (!t) return n ? or(e, "style") : t;
  const o = e.style;
  if (typeof t == "string") return o.cssText = t;
  typeof n == "string" && (o.cssText = n = void 0), n || (n = {}), t || (t = {});
  let r, l;
  for (l in n)
    t[l] == null && o.removeProperty(l), delete n[l];
  for (l in t)
    r = t[l], r !== n[l] && (o.setProperty(l, r), n[l] = r);
  return n;
}
function fu(e, t = {}, n, o) {
  const r = {};
  return Lt(
    () => r.children = rr(e, t.children, r.children)
  ), Lt(() => typeof t.ref == "function" && ai(t.ref, e)), Lt(() => uu(e, t, n, !0, r, !0)), r;
}
function ai(e, t, n) {
  return bt(() => e(t, n));
}
function Ye(e, t, n, o) {
  if (n !== void 0 && !o && (o = []), typeof t != "function") return rr(e, t, o, n);
  Lt((r) => rr(e, t(), r, n), o);
}
function uu(e, t, n, o, r = {}, l = !1) {
  t || (t = {});
  for (const i in r)
    if (!(i in t)) {
      if (i === "children") continue;
      r[i] = As(e, i, null, r[i], n, l, t);
    }
  for (const i in t) {
    if (i === "children")
      continue;
    const s = t[i];
    r[i] = As(e, i, s, r[i], n, l, t);
  }
}
function du(e) {
  let t, n;
  return !jn() || !(t = De.registry.get(n = gu())) ? e() : (De.completed && De.completed.add(t), De.registry.delete(n), t);
}
function jn(e) {
  return !!De.context && !0 && (!e || e.isConnected);
}
function hu(e) {
  return e.toLowerCase().replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Ss(e, t, n) {
  const o = t.trim().split(/\s+/);
  for (let r = 0, l = o.length; r < l; r++)
    e.classList.toggle(o[r], n);
}
function As(e, t, n, o, r, l, i) {
  let s, a, d, p, u;
  if (t === "style") return au(e, n, o);
  if (t === "classList") return cu(e, n, o);
  if (n === o) return o;
  if (t === "ref")
    l || n(e);
  else if (t.slice(0, 3) === "on:") {
    const g = t.slice(3);
    o && e.removeEventListener(g, o, typeof o != "function" && o), n && e.addEventListener(g, n, typeof n != "function" && n);
  } else if (t.slice(0, 10) === "oncapture:") {
    const g = t.slice(10);
    o && e.removeEventListener(g, o, !0), n && e.addEventListener(g, n, !0);
  } else if (t.slice(0, 2) === "on") {
    const g = t.slice(2).toLowerCase(), w = eu.has(g);
    if (!w && o) {
      const v = Array.isArray(o) ? o[0] : o;
      e.removeEventListener(g, v);
    }
    (w || n) && (su(e, g, n, w), w && jr([g]));
  } else if (t.slice(0, 5) === "attr:")
    or(e, t.slice(5), n);
  else if (t.slice(0, 5) === "bool:")
    iu(e, t.slice(5), n);
  else if ((u = t.slice(0, 5) === "prop:") || (d = Jf.has(t)) || !r && ((p = Xf(t, e.tagName)) || (a = qf.has(t))) || (s = e.nodeName.includes("-") || "is" in i)) {
    if (u)
      t = t.slice(5), a = !0;
    else if (jn(e)) return n;
    t === "class" || t === "className" ? Tt(e, n) : s && !a && !d ? e[hu(t)] = n : e[p || t] = n;
  } else {
    const g = r && t.indexOf(":") > -1 && nu[t.split(":")[0]];
    g ? lu(e, g, t, n) : or(e, Zf[t] || t, n);
  }
  return n;
}
function pu(e) {
  let t = e.target;
  const n = `$$${e.type}`, o = e.target, r = e.currentTarget, l = (a) => Object.defineProperty(e, "target", {
    configurable: !0,
    value: a
  }), i = () => {
    const a = t[n];
    if (a && !t.disabled) {
      const d = t[`${n}Data`];
      if (d !== void 0 ? a.call(t, d, e) : a.call(t, e), e.cancelBubble) return;
    }
    return t.host && typeof t.host != "string" && !t.host._$host && t.contains(e.target) && l(t.host), !0;
  }, s = () => {
    for (; i() && (t = t._$host || t.parentNode || t.host); ) ;
  };
  if (Object.defineProperty(e, "currentTarget", {
    configurable: !0,
    get() {
      return t || document;
    }
  }), e.composedPath) {
    const a = e.composedPath();
    l(a[0]);
    for (let d = 0; d < a.length - 2 && (t = a[d], !!i()); d++) {
      if (t._$host) {
        t = t._$host, s();
        break;
      }
      if (t.parentNode === r)
        break;
    }
  } else s();
  l(o);
}
function rr(e, t, n, o, r) {
  const l = jn(e);
  if (l) {
    !n && (n = [...e.childNodes]);
    let a = [];
    for (let d = 0; d < n.length; d++) {
      const p = n[d];
      p.nodeType === 8 && p.data.slice(0, 2) === "!$" ? p.remove() : a.push(p);
    }
    n = a;
  }
  for (; typeof n == "function"; ) n = n();
  if (t === n) return n;
  const i = typeof t, s = o !== void 0;
  if (e = s && n[0] && n[0].parentNode || e, i === "string" || i === "number") {
    if (l || i === "number" && (t = t.toString(), t === n))
      return n;
    if (s) {
      let a = n[0];
      a && a.nodeType === 3 ? a.data !== t && (a.data = t) : a = document.createTextNode(t), n = go(e, n, o, a);
    } else
      n !== "" && typeof n == "string" ? n = e.firstChild.data = t : n = e.textContent = t;
  } else if (t == null || i === "boolean") {
    if (l) return n;
    n = go(e, n, o);
  } else {
    if (i === "function")
      return Lt(() => {
        let a = t();
        for (; typeof a == "function"; ) a = a();
        n = rr(e, a, n, o);
      }), () => n;
    if (Array.isArray(t)) {
      const a = [], d = n && Array.isArray(n);
      if (Wl(a, t, n, r))
        return Lt(() => n = rr(e, a, n, o, !0)), () => n;
      if (l) {
        if (!a.length) return n;
        if (o === void 0) return n = [...e.childNodes];
        let p = a[0];
        if (p.parentNode !== e) return n;
        const u = [p];
        for (; (p = p.nextSibling) !== o; ) u.push(p);
        return n = u;
      }
      if (a.length === 0) {
        if (n = go(e, n, o), s) return n;
      } else d ? n.length === 0 ? ks(e, a, o) : ru(e, n, a) : (n && go(e), ks(e, a));
      n = a;
    } else if (t.nodeType) {
      if (l && t.parentNode) return n = s ? [t] : t;
      if (Array.isArray(n)) {
        if (s) return n = go(e, n, o, t);
        go(e, n, null, t);
      } else n == null || n === "" || !e.firstChild ? e.appendChild(t) : e.replaceChild(t, e.firstChild);
      n = t;
    }
  }
  return n;
}
function Wl(e, t, n, o) {
  let r = !1;
  for (let l = 0, i = t.length; l < i; l++) {
    let s = t[l], a = n && n[e.length], d;
    if (!(s == null || s === !0 || s === !1)) if ((d = typeof s) == "object" && s.nodeType)
      e.push(s);
    else if (Array.isArray(s))
      r = Wl(e, s, a) || r;
    else if (d === "function")
      if (o) {
        for (; typeof s == "function"; ) s = s();
        r = Wl(
          e,
          Array.isArray(s) ? s : [s],
          Array.isArray(a) ? a : [a]
        ) || r;
      } else
        e.push(s), r = !0;
    else {
      const p = String(s);
      a && a.nodeType === 3 && a.data === p ? e.push(a) : e.push(document.createTextNode(p));
    }
  }
  return r;
}
function ks(e, t, n = null) {
  for (let o = 0, r = t.length; o < r; o++) e.insertBefore(t[o], n);
}
function go(e, t, n, o) {
  if (n === void 0) return e.textContent = "";
  const r = o || document.createTextNode("");
  if (t.length) {
    let l = !1;
    for (let i = t.length - 1; i >= 0; i--) {
      const s = t[i];
      if (r !== s) {
        const a = s.parentNode === e;
        !l && !i ? a ? e.replaceChild(r, s) : e.insertBefore(r, n) : a && s.remove();
      } else l = !0;
    }
  } else e.insertBefore(r, n);
  return [r];
}
function gu() {
  return De.getNextContextId();
}
const mu = "http://www.w3.org/2000/svg";
function Nc(e, t = !1) {
  return t ? document.createElementNS(mu, e) : document.createElement(e);
}
function wu(e) {
  const { useShadow: t } = e, n = document.createTextNode(""), o = () => e.mount || document.body, r = bs();
  let l, i = !!De.context;
  return qe(
    () => {
      i && (bs().user = i = !1), l || (l = Mf(r, () => Ke(() => e.children)));
      const s = o();
      if (s instanceof HTMLHeadElement) {
        const [a, d] = _e(!1), p = () => d(!0);
        Pr((u) => Ye(s, () => a() ? u() : l(), null)), Xe(p);
      } else {
        const a = Nc(e.isSVG ? "g" : "div", e.isSVG), d = t && a.attachShadow ? a.attachShadow({
          mode: "open"
        }) : a;
        Object.defineProperty(a, "_$host", {
          get() {
            return n.parentNode;
          },
          configurable: !0
        }), Ye(d, l), s.appendChild(a), e.ref && e.ref(a), Xe(() => s.removeChild(a));
      }
    },
    void 0,
    {
      render: !i
    }
  ), n;
}
function yu(e, t) {
  const n = Ke(e);
  return Ke(() => {
    const o = n();
    switch (typeof o) {
      case "function":
        return bt(() => o(t));
      case "string":
        const r = tu.has(o), l = De.context ? du() : Nc(o, r);
        return fu(l, t, r), l;
    }
  });
}
function bu(e) {
  const [, t] = un(e, ["component"]);
  return yu(() => e.component, t);
}
var xu = /* @__PURE__ */ Qt("<button>");
const vu = (e) => {
  let t = `cursor-pointer
				   disabled:cursor-not-allowed
				   rounded-md text-center px-4 py-1 `;
  return e.type && e.type === "error" ? t += "bg-red-500 border-red-800 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-200 disabled:text-gray-500 shadow-md" : t += "bg-gray-200 border-gray-400 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-500 disabled:text-gray-600 shadow-md", (() => {
    var n = xu();
    return n.$$click = () => {
      e.onClick && e.onClick();
    }, Ye(n, () => e.children), Lt((o) => {
      var r = `${t} ${e.class || ""}`, l = e.disabled ?? !1;
      return r !== o.e && Tt(n, o.e = r), l !== o.t && (n.disabled = o.t = l), o;
    }, {
      e: void 0,
      t: void 0
    }), n;
  })();
};
jr(["click"]);
function Su(e) {
  return (...t) => {
    for (const n of e)
      n && n(...t);
  };
}
const $r = (e) => typeof e == "function" && !e.length ? e() : e;
function Au(e, ...t) {
  return typeof e == "function" ? e(...t) : e;
}
const ku = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;
function Cs(e) {
  const t = {};
  let n;
  for (; n = ku.exec(e); )
    t[n[1]] = n[2];
  return t;
}
function fi(e, t) {
  if (typeof e == "string") {
    if (typeof t == "string")
      return `${e};${t}`;
    e = Cs(e);
  } else typeof t == "string" && (t = Cs(t));
  return { ...e, ...t };
}
function fr(...e) {
  return Su(e);
}
function Cu(e) {
  return typeof e == "function";
}
function _u(e) {
  return (t) => `${e()}-${t}`;
}
function Un(e, t) {
  return e ? e === t || e.contains(t) : !1;
}
function zc(e) {
  return an(e).defaultView || window;
}
function an(e) {
  return e ? e.ownerDocument || e : document;
}
var Vc = /* @__PURE__ */ ((e) => (e.Escape = "Escape", e.Enter = "Enter", e.Tab = "Tab", e.Space = " ", e.ArrowDown = "ArrowDown", e.ArrowLeft = "ArrowLeft", e.ArrowRight = "ArrowRight", e.ArrowUp = "ArrowUp", e.End = "End", e.Home = "Home", e.PageDown = "PageDown", e.PageUp = "PageUp", e))(Vc || {});
function Eu(e) {
  return typeof window < "u" && window.navigator != null ? e.test(
    // @ts-ignore
    window.navigator.userAgentData?.platform || window.navigator.platform
  ) : !1;
}
function Pu() {
  return Eu(/^Mac/i);
}
function Vn(e, t) {
  return t && (Cu(t) ? t(e) : t[0](t[1], e)), e?.defaultPrevented;
}
function _s(e) {
  return (t) => {
    for (const n of e)
      Vn(t, n);
  };
}
function Tu(e) {
  return Pu() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}
function Lu() {
}
function Du(e) {
  return [e.clientX, e.clientY];
}
function Ou(e, t) {
  const [n, o] = e;
  let r = !1;
  const l = t.length;
  for (let i = l, s = 0, a = i - 1; s < i; a = s++) {
    const [d, p] = t[s], [u, g] = t[a], [, w] = t[a === 0 ? i - 1 : a - 1] || [0, 0], v = (p - g) * (n - d) - (d - u) * (o - p);
    if (g < p) {
      if (o >= g && o < p) {
        if (v === 0)
          return !0;
        v > 0 && (o === g ? o > w && (r = !r) : r = !r);
      }
    } else if (p < g) {
      if (o > p && o <= g) {
        if (v === 0)
          return !0;
        v < 0 && (o === g ? o < w && (r = !r) : r = !r);
      }
    } else if (o === p && (n >= u && n <= d || n >= d && n <= u))
      return !0;
  }
  return r;
}
function Yr(e, t) {
  return Zt(e, t);
}
var Wo = /* @__PURE__ */ new Map(), Es = /* @__PURE__ */ new Set();
function Ps() {
  if (typeof window > "u")
    return;
  const e = (n) => {
    if (!n.target)
      return;
    let o = Wo.get(n.target);
    o || (o = /* @__PURE__ */ new Set(), Wo.set(n.target, o), n.target.addEventListener(
      "transitioncancel",
      t
    )), o.add(n.propertyName);
  }, t = (n) => {
    if (!n.target)
      return;
    const o = Wo.get(n.target);
    if (o && (o.delete(n.propertyName), o.size === 0 && (n.target.removeEventListener(
      "transitioncancel",
      t
    ), Wo.delete(n.target)), Wo.size === 0)) {
      for (const r of Es)
        r();
      Es.clear();
    }
  };
  document.body.addEventListener("transitionrun", e), document.body.addEventListener("transitionend", t);
}
typeof document < "u" && (document.readyState !== "loading" ? Ps() : document.addEventListener("DOMContentLoaded", Ps));
function Ru(e) {
  const [t, n] = _e(e.defaultValue?.()), o = Ke(() => e.value?.() !== void 0), r = Ke(() => o() ? e.value?.() : t());
  return [r, (i) => {
    bt(() => {
      const s = Au(i, r());
      return Object.is(s, r()) || (o() || n(s), e.onChange?.(s)), s;
    });
  }];
}
function Mu(e) {
  const [t, n] = Ru(e);
  return [() => t() ?? !1, n];
}
function $u(e) {
  return (t) => (e(t), () => e(void 0));
}
function Kr(e) {
  const [t, n] = un(e, ["as"]);
  if (!t.as)
    throw new Error("[kobalte]: Polymorphic is missing the required `as` prop.");
  return (
    // @ts-ignore: Props are valid but not worth calculating
    ce(bu, Zt(n, {
      get component() {
        return t.as;
      }
    }))
  );
}
var Nu = Object.defineProperty, zu = (e, t) => {
  for (var n in t) Nu(e, n, {
    get: t[n],
    enumerable: !0
  });
};
function Ic(e) {
  var t, n, o = "";
  if (typeof e == "string" || typeof e == "number") o += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var r = e.length;
    for (t = 0; t < r; t++) e[t] && (n = Ic(e[t])) && (o && (o += " "), o += n);
  } else for (n in e) e[n] && (o && (o += " "), o += n);
  return o;
}
function Vu() {
  for (var e, t, n = 0, o = "", r = arguments.length; n < r; n++) (e = arguments[n]) && (t = Ic(e)) && (o && (o += " "), o += t);
  return o;
}
const ui = "-", Iu = (e) => {
  const t = Bu(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: o
  } = e;
  return {
    getClassGroupId: (i) => {
      const s = i.split(ui);
      return s[0] === "" && s.length !== 1 && s.shift(), Fc(s, t) || Fu(i);
    },
    getConflictingClassGroupIds: (i, s) => {
      const a = n[i] || [];
      return s && o[i] ? [...a, ...o[i]] : a;
    }
  };
}, Fc = (e, t) => {
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], o = t.nextPart.get(n), r = o ? Fc(e.slice(1), o) : void 0;
  if (r)
    return r;
  if (t.validators.length === 0)
    return;
  const l = e.join(ui);
  return t.validators.find(({
    validator: i
  }) => i(l))?.classGroupId;
}, Ts = /^\[(.+)\]$/, Fu = (e) => {
  if (Ts.test(e)) {
    const t = Ts.exec(e)[1], n = t?.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, Bu = (e) => {
  const {
    theme: t,
    prefix: n
  } = e, o = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return Wu(Object.entries(e.classGroups), n).forEach(([l, i]) => {
    Hl(i, o, l, t);
  }), o;
}, Hl = (e, t, n, o) => {
  e.forEach((r) => {
    if (typeof r == "string") {
      const l = r === "" ? t : Ls(t, r);
      l.classGroupId = n;
      return;
    }
    if (typeof r == "function") {
      if (Uu(r)) {
        Hl(r(o), t, n, o);
        return;
      }
      t.validators.push({
        validator: r,
        classGroupId: n
      });
      return;
    }
    Object.entries(r).forEach(([l, i]) => {
      Hl(i, Ls(t, l), n, o);
    });
  });
}, Ls = (e, t) => {
  let n = e;
  return t.split(ui).forEach((o) => {
    n.nextPart.has(o) || n.nextPart.set(o, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(o);
  }), n;
}, Uu = (e) => e.isThemeGetter, Wu = (e, t) => t ? e.map(([n, o]) => {
  const r = o.map((l) => typeof l == "string" ? t + l : typeof l == "object" ? Object.fromEntries(Object.entries(l).map(([i, s]) => [t + i, s])) : l);
  return [n, r];
}) : e, Hu = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, n = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  const r = (l, i) => {
    n.set(l, i), t++, t > e && (t = 0, o = n, n = /* @__PURE__ */ new Map());
  };
  return {
    get(l) {
      let i = n.get(l);
      if (i !== void 0)
        return i;
      if ((i = o.get(l)) !== void 0)
        return r(l, i), i;
    },
    set(l, i) {
      n.has(l) ? n.set(l, i) : r(l, i);
    }
  };
}, Bc = "!", Gu = (e) => {
  const {
    separator: t,
    experimentalParseClassName: n
  } = e, o = t.length === 1, r = t[0], l = t.length, i = (s) => {
    const a = [];
    let d = 0, p = 0, u;
    for (let k = 0; k < s.length; k++) {
      let x = s[k];
      if (d === 0) {
        if (x === r && (o || s.slice(k, k + l) === t)) {
          a.push(s.slice(p, k)), p = k + l;
          continue;
        }
        if (x === "/") {
          u = k;
          continue;
        }
      }
      x === "[" ? d++ : x === "]" && d--;
    }
    const g = a.length === 0 ? s : s.substring(p), w = g.startsWith(Bc), v = w ? g.substring(1) : g, A = u && u > p ? u - p : void 0;
    return {
      modifiers: a,
      hasImportantModifier: w,
      baseClassName: v,
      maybePostfixModifierPosition: A
    };
  };
  return n ? (s) => n({
    className: s,
    parseClassName: i
  }) : i;
}, ju = (e) => {
  if (e.length <= 1)
    return e;
  const t = [];
  let n = [];
  return e.forEach((o) => {
    o[0] === "[" ? (t.push(...n.sort(), o), n = []) : n.push(o);
  }), t.push(...n.sort()), t;
}, Yu = (e) => ({
  cache: Hu(e.cacheSize),
  parseClassName: Gu(e),
  ...Iu(e)
}), Ku = /\s+/, qu = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: o,
    getConflictingClassGroupIds: r
  } = t, l = [], i = e.trim().split(Ku);
  let s = "";
  for (let a = i.length - 1; a >= 0; a -= 1) {
    const d = i[a], {
      modifiers: p,
      hasImportantModifier: u,
      baseClassName: g,
      maybePostfixModifierPosition: w
    } = n(d);
    let v = !!w, A = o(v ? g.substring(0, w) : g);
    if (!A) {
      if (!v) {
        s = d + (s.length > 0 ? " " + s : s);
        continue;
      }
      if (A = o(g), !A) {
        s = d + (s.length > 0 ? " " + s : s);
        continue;
      }
      v = !1;
    }
    const k = ju(p).join(":"), x = u ? k + Bc : k, b = x + A;
    if (l.includes(b))
      continue;
    l.push(b);
    const _ = r(A, v);
    for (let C = 0; C < _.length; ++C) {
      const T = _[C];
      l.push(x + T);
    }
    s = d + (s.length > 0 ? " " + s : s);
  }
  return s;
};
function Ju() {
  let e = 0, t, n, o = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = Uc(t)) && (o && (o += " "), o += n);
  return o;
}
const Uc = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let o = 0; o < e.length; o++)
    e[o] && (t = Uc(e[o])) && (n && (n += " "), n += t);
  return n;
};
function Zu(e, ...t) {
  let n, o, r, l = i;
  function i(a) {
    const d = t.reduce((p, u) => u(p), e());
    return n = Yu(d), o = n.cache.get, r = n.cache.set, l = s, s(a);
  }
  function s(a) {
    const d = o(a);
    if (d)
      return d;
    const p = qu(a, n);
    return r(a, p), p;
  }
  return function() {
    return l(Ju.apply(null, arguments));
  };
}
const Se = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, Wc = /^\[(?:([a-z-]+):)?(.+)\]$/i, Qu = /^\d+\/\d+$/, Xu = /* @__PURE__ */ new Set(["px", "full", "screen"]), ed = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, td = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, nd = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/, od = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, rd = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, on = (e) => xo(e) || Xu.has(e) || Qu.test(e), yn = (e) => To(e, "length", dd), xo = (e) => !!e && !Number.isNaN(Number(e)), Dl = (e) => To(e, "number", xo), Ho = (e) => !!e && Number.isInteger(Number(e)), ld = (e) => e.endsWith("%") && xo(e.slice(0, -1)), te = (e) => Wc.test(e), bn = (e) => ed.test(e), id = /* @__PURE__ */ new Set(["length", "size", "percentage"]), sd = (e) => To(e, id, Hc), cd = (e) => To(e, "position", Hc), ad = /* @__PURE__ */ new Set(["image", "url"]), fd = (e) => To(e, ad, pd), ud = (e) => To(e, "", hd), Go = () => !0, To = (e, t, n) => {
  const o = Wc.exec(e);
  return o ? o[1] ? typeof t == "string" ? o[1] === t : t.has(o[1]) : n(o[2]) : !1;
}, dd = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  td.test(e) && !nd.test(e)
), Hc = () => !1, hd = (e) => od.test(e), pd = (e) => rd.test(e), gd = () => {
  const e = Se("colors"), t = Se("spacing"), n = Se("blur"), o = Se("brightness"), r = Se("borderColor"), l = Se("borderRadius"), i = Se("borderSpacing"), s = Se("borderWidth"), a = Se("contrast"), d = Se("grayscale"), p = Se("hueRotate"), u = Se("invert"), g = Se("gap"), w = Se("gradientColorStops"), v = Se("gradientColorStopPositions"), A = Se("inset"), k = Se("margin"), x = Se("opacity"), b = Se("padding"), _ = Se("saturate"), C = Se("scale"), T = Se("sepia"), P = Se("skew"), N = Se("space"), W = Se("translate"), G = () => ["auto", "contain", "none"], H = () => ["auto", "hidden", "clip", "visible", "scroll"], D = () => ["auto", te, t], M = () => [te, t], V = () => ["", on, yn], R = () => ["auto", xo, te], $ = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], j = () => ["solid", "dashed", "dotted", "double", "none"], I = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], he = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], X = () => ["", "0", te], Q = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], ne = () => [xo, te];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Go],
      spacing: [on, yn],
      blur: ["none", "", bn, te],
      brightness: ne(),
      borderColor: [e],
      borderRadius: ["none", "", "full", bn, te],
      borderSpacing: M(),
      borderWidth: V(),
      contrast: ne(),
      grayscale: X(),
      hueRotate: ne(),
      invert: X(),
      gap: M(),
      gradientColorStops: [e],
      gradientColorStopPositions: [ld, yn],
      inset: D(),
      margin: D(),
      opacity: ne(),
      padding: M(),
      saturate: ne(),
      scale: ne(),
      sepia: X(),
      skew: ne(),
      space: M(),
      translate: M()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", te]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [bn]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": Q()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": Q()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: [...$(), te]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: H()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": H()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": H()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: G()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": G()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": G()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [A]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [A]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [A]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [A]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [A]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [A]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [A]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [A]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [A]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ["auto", Ho, te]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: D()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["wrap", "wrap-reverse", "nowrap"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ["1", "auto", "initial", "none", te]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: X()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: X()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Ho, te]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Go]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Ho, te]
        }, te]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": R()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": R()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [Go]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Ho, te]
        }, te]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": R()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": R()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": ["auto", "min", "max", "fr", te]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", te]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [g]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [g]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [g]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: ["normal", ...he()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": ["start", "end", "center", "stretch"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", "start", "end", "center", "stretch"]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...he(), "baseline"]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", "start", "end", "center", "stretch", "baseline"]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": [...he(), "baseline"]
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", "start", "end", "center", "stretch"]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [b]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [b]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [b]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [b]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [b]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [b]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [b]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [b]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [b]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [k]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [k]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [k]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [k]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [k]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [k]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [k]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [k]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [k]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [N]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      "space-y": [{
        "space-y": [N]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-y-reverse": ["space-y-reverse"],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", te, t]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [te, t, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [te, t, "none", "full", "min", "max", "fit", "prose", {
          screen: [bn]
        }, bn]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [te, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [te, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [te, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [te, t, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", bn, yn]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", Dl]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Go]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", te]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", xo, Dl]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", on, te]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", te]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", te]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: [e]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      "placeholder-opacity": [{
        "placeholder-opacity": [x]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: [e]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      "text-opacity": [{
        "text-opacity": [x]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...j(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", on, yn]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", on, te]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: [e]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: M()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", te]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", te]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      "bg-opacity": [{
        "bg-opacity": [x]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: [...$(), cd]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: ["no-repeat", {
          repeat: ["", "x", "y", "round", "space"]
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ["auto", "cover", "contain", sd]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, fd]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: [e]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: [v]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [v]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [v]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [w]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [w]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [w]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [l]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [l]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [l]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [l]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [l]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [l]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [l]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [l]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [l]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [l]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [l]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [l]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [l]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [l]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [l]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [s]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [s]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [s]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [s]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [s]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [s]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [s]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [s]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [s]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [x]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...j(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [s]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y": [{
        "divide-y": [s]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      "divide-opacity": [{
        "divide-opacity": [x]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: j()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [r]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [r]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [r]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": [r]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": [r]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [r]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [r]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [r]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [r]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [r]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...j()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [on, te]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [on, yn]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: [e]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w": [{
        ring: V()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      "ring-color": [{
        ring: [e]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      "ring-opacity": [{
        "ring-opacity": [x]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [on, yn]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      "ring-offset-color": [{
        "ring-offset": [e]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ["", "inner", "none", bn, ud]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [Go]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [x]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...I(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": I()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ["", "none"]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [n]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [o]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [a]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": ["", "none", bn, te]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [d]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [p]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [u]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [_]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [T]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": ["", "none"]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": [n]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [o]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [a]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": [d]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [p]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [u]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [x]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [_]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [T]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": [i]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [i]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [i]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", te]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: ne()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", te]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: ne()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", te]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ["", "gpu", "none"]
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [C]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [C]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [C]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Ho, te]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [W]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [W]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [P]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [P]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", te]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ["auto", e]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", te]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: [e]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["none", "auto"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "y", "x", ""]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": M()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": M()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": M()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": M()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": M()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": M()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": M()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": M()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": M()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": M()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": M()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": M()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": M()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": M()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": M()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": M()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": M()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": M()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", te]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [e, "none"]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [on, yn, Dl]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [e, "none"]
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    }
  };
}, md = /* @__PURE__ */ Zu(gd);
function wd(...e) {
  return md(Vu(e));
}
function yd(e, t) {
  const n = new Array();
  for (let o = 0; o < e.length; o += t)
    n.push(e.slice(o, o + t));
  return n;
}
var bd = /* @__PURE__ */ new Set(["Avst", "Arab", "Armi", "Syrc", "Samr", "Mand", "Thaa", "Mend", "Nkoo", "Adlm", "Rohg", "Hebr"]), xd = /* @__PURE__ */ new Set(["ae", "ar", "arc", "bcc", "bqi", "ckb", "dv", "fa", "glk", "he", "ku", "mzn", "nqo", "pnb", "ps", "sd", "ug", "ur", "yi"]);
function vd(e) {
  if (Intl.Locale) {
    const n = new Intl.Locale(e).maximize().script ?? "";
    return bd.has(n);
  }
  const t = e.split("-")[0];
  return xd.has(t);
}
function Sd(e) {
  return vd(e) ? "rtl" : "ltr";
}
function Gc() {
  let e = typeof navigator < "u" && // @ts-ignore
  (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([e]);
  } catch {
    e = "en-US";
  }
  return {
    locale: e,
    direction: Sd(e)
  };
}
var Gl = Gc(), qo = /* @__PURE__ */ new Set();
function Ds() {
  Gl = Gc();
  for (const e of qo)
    e(Gl);
}
function Ad() {
  const [e, t] = _e(Gl), n = Ke(() => e());
  return Wr(() => {
    qo.size === 0 && window.addEventListener("languagechange", Ds), qo.add(t), Xe(() => {
      qo.delete(t), qo.size === 0 && window.removeEventListener("languagechange", Ds);
    });
  }), {
    locale: () => n().locale,
    direction: () => n().direction
  };
}
var kd = Hr();
function Cd() {
  const e = Ad();
  return Gr(kd) || e;
}
const _d = ["top", "right", "bottom", "left"], Sn = Math.min, mt = Math.max, Nr = Math.round, Ar = Math.floor, qt = (e) => ({
  x: e,
  y: e
}), Ed = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, Pd = {
  start: "end",
  end: "start"
};
function jl(e, t, n) {
  return mt(e, Sn(t, n));
}
function Yn(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function An(e) {
  return e.split("-")[0];
}
function Lo(e) {
  return e.split("-")[1];
}
function jc(e) {
  return e === "x" ? "y" : "x";
}
function di(e) {
  return e === "y" ? "height" : "width";
}
function vn(e) {
  return ["top", "bottom"].includes(An(e)) ? "y" : "x";
}
function hi(e) {
  return jc(vn(e));
}
function Td(e, t, n) {
  n === void 0 && (n = !1);
  const o = Lo(e), r = hi(e), l = di(r);
  let i = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[l] > t.floating[l] && (i = zr(i)), [i, zr(i)];
}
function Ld(e) {
  const t = zr(e);
  return [Yl(e), t, Yl(t)];
}
function Yl(e) {
  return e.replace(/start|end/g, (t) => Pd[t]);
}
function Dd(e, t, n) {
  const o = ["left", "right"], r = ["right", "left"], l = ["top", "bottom"], i = ["bottom", "top"];
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? r : o : t ? o : r;
    case "left":
    case "right":
      return t ? l : i;
    default:
      return [];
  }
}
function Od(e, t, n, o) {
  const r = Lo(e);
  let l = Dd(An(e), n === "start", o);
  return r && (l = l.map((i) => i + "-" + r), t && (l = l.concat(l.map(Yl)))), l;
}
function zr(e) {
  return e.replace(/left|right|bottom|top/g, (t) => Ed[t]);
}
function Rd(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function Yc(e) {
  return typeof e != "number" ? Rd(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Vr(e) {
  const {
    x: t,
    y: n,
    width: o,
    height: r
  } = e;
  return {
    width: o,
    height: r,
    top: n,
    left: t,
    right: t + o,
    bottom: n + r,
    x: t,
    y: n
  };
}
function Os(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const l = vn(t), i = hi(t), s = di(i), a = An(t), d = l === "y", p = o.x + o.width / 2 - r.width / 2, u = o.y + o.height / 2 - r.height / 2, g = o[s] / 2 - r[s] / 2;
  let w;
  switch (a) {
    case "top":
      w = {
        x: p,
        y: o.y - r.height
      };
      break;
    case "bottom":
      w = {
        x: p,
        y: o.y + o.height
      };
      break;
    case "right":
      w = {
        x: o.x + o.width,
        y: u
      };
      break;
    case "left":
      w = {
        x: o.x - r.width,
        y: u
      };
      break;
    default:
      w = {
        x: o.x,
        y: o.y
      };
  }
  switch (Lo(t)) {
    case "start":
      w[i] -= g * (n && d ? -1 : 1);
      break;
    case "end":
      w[i] += g * (n && d ? -1 : 1);
      break;
  }
  return w;
}
const Md = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: l = [],
    platform: i
  } = n, s = l.filter(Boolean), a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let d = await i.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: p,
    y: u
  } = Os(d, o, a), g = o, w = {}, v = 0;
  for (let A = 0; A < s.length; A++) {
    const {
      name: k,
      fn: x
    } = s[A], {
      x: b,
      y: _,
      data: C,
      reset: T
    } = await x({
      x: p,
      y: u,
      initialPlacement: o,
      placement: g,
      strategy: r,
      middlewareData: w,
      rects: d,
      platform: i,
      elements: {
        reference: e,
        floating: t
      }
    });
    p = b ?? p, u = _ ?? u, w = {
      ...w,
      [k]: {
        ...w[k],
        ...C
      }
    }, T && v <= 50 && (v++, typeof T == "object" && (T.placement && (g = T.placement), T.rects && (d = T.rects === !0 ? await i.getElementRects({
      reference: e,
      floating: t,
      strategy: r
    }) : T.rects), {
      x: p,
      y: u
    } = Os(d, g, a)), A = -1);
  }
  return {
    x: p,
    y: u,
    placement: g,
    strategy: r,
    middlewareData: w
  };
};
async function lr(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: o,
    y: r,
    platform: l,
    rects: i,
    elements: s,
    strategy: a
  } = e, {
    boundary: d = "clippingAncestors",
    rootBoundary: p = "viewport",
    elementContext: u = "floating",
    altBoundary: g = !1,
    padding: w = 0
  } = Yn(t, e), v = Yc(w), k = s[g ? u === "floating" ? "reference" : "floating" : u], x = Vr(await l.getClippingRect({
    element: (n = await (l.isElement == null ? void 0 : l.isElement(k))) == null || n ? k : k.contextElement || await (l.getDocumentElement == null ? void 0 : l.getDocumentElement(s.floating)),
    boundary: d,
    rootBoundary: p,
    strategy: a
  })), b = u === "floating" ? {
    x: o,
    y: r,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, _ = await (l.getOffsetParent == null ? void 0 : l.getOffsetParent(s.floating)), C = await (l.isElement == null ? void 0 : l.isElement(_)) ? await (l.getScale == null ? void 0 : l.getScale(_)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, T = Vr(l.convertOffsetParentRelativeRectToViewportRelativeRect ? await l.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: s,
    rect: b,
    offsetParent: _,
    strategy: a
  }) : b);
  return {
    top: (x.top - T.top + v.top) / C.y,
    bottom: (T.bottom - x.bottom + v.bottom) / C.y,
    left: (x.left - T.left + v.left) / C.x,
    right: (T.right - x.right + v.right) / C.x
  };
}
const $d = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: o,
      placement: r,
      rects: l,
      platform: i,
      elements: s,
      middlewareData: a
    } = t, {
      element: d,
      padding: p = 0
    } = Yn(e, t) || {};
    if (d == null)
      return {};
    const u = Yc(p), g = {
      x: n,
      y: o
    }, w = hi(r), v = di(w), A = await i.getDimensions(d), k = w === "y", x = k ? "top" : "left", b = k ? "bottom" : "right", _ = k ? "clientHeight" : "clientWidth", C = l.reference[v] + l.reference[w] - g[w] - l.floating[v], T = g[w] - l.reference[w], P = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(d));
    let N = P ? P[_] : 0;
    (!N || !await (i.isElement == null ? void 0 : i.isElement(P))) && (N = s.floating[_] || l.floating[v]);
    const W = C / 2 - T / 2, G = N / 2 - A[v] / 2 - 1, H = Sn(u[x], G), D = Sn(u[b], G), M = H, V = N - A[v] - D, R = N / 2 - A[v] / 2 + W, $ = jl(M, R, V), j = !a.arrow && Lo(r) != null && R !== $ && l.reference[v] / 2 - (R < M ? H : D) - A[v] / 2 < 0, I = j ? R < M ? R - M : R - V : 0;
    return {
      [w]: g[w] + I,
      data: {
        [w]: $,
        centerOffset: R - $ - I,
        ...j && {
          alignmentOffset: I
        }
      },
      reset: j
    };
  }
}), Nd = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, o;
      const {
        placement: r,
        middlewareData: l,
        rects: i,
        initialPlacement: s,
        platform: a,
        elements: d
      } = t, {
        mainAxis: p = !0,
        crossAxis: u = !0,
        fallbackPlacements: g,
        fallbackStrategy: w = "bestFit",
        fallbackAxisSideDirection: v = "none",
        flipAlignment: A = !0,
        ...k
      } = Yn(e, t);
      if ((n = l.arrow) != null && n.alignmentOffset)
        return {};
      const x = An(r), b = vn(s), _ = An(s) === s, C = await (a.isRTL == null ? void 0 : a.isRTL(d.floating)), T = g || (_ || !A ? [zr(s)] : Ld(s)), P = v !== "none";
      !g && P && T.push(...Od(s, A, v, C));
      const N = [s, ...T], W = await lr(t, k), G = [];
      let H = ((o = l.flip) == null ? void 0 : o.overflows) || [];
      if (p && G.push(W[x]), u) {
        const $ = Td(r, i, C);
        G.push(W[$[0]], W[$[1]]);
      }
      if (H = [...H, {
        placement: r,
        overflows: G
      }], !G.every(($) => $ <= 0)) {
        var D, M;
        const $ = (((D = l.flip) == null ? void 0 : D.index) || 0) + 1, j = N[$];
        if (j) {
          var V;
          const he = u === "alignment" ? b !== vn(j) : !1, X = ((V = H[0]) == null ? void 0 : V.overflows[0]) > 0;
          if (!he || X)
            return {
              data: {
                index: $,
                overflows: H
              },
              reset: {
                placement: j
              }
            };
        }
        let I = (M = H.filter((he) => he.overflows[0] <= 0).sort((he, X) => he.overflows[1] - X.overflows[1])[0]) == null ? void 0 : M.placement;
        if (!I)
          switch (w) {
            case "bestFit": {
              var R;
              const he = (R = H.filter((X) => {
                if (P) {
                  const Q = vn(X.placement);
                  return Q === b || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  Q === "y";
                }
                return !0;
              }).map((X) => [X.placement, X.overflows.filter((Q) => Q > 0).reduce((Q, ne) => Q + ne, 0)]).sort((X, Q) => X[1] - Q[1])[0]) == null ? void 0 : R[0];
              he && (I = he);
              break;
            }
            case "initialPlacement":
              I = s;
              break;
          }
        if (r !== I)
          return {
            reset: {
              placement: I
            }
          };
      }
      return {};
    }
  };
};
function Rs(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Ms(e) {
  return _d.some((t) => e[t] >= 0);
}
const zd = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n
      } = t, {
        strategy: o = "referenceHidden",
        ...r
      } = Yn(e, t);
      switch (o) {
        case "referenceHidden": {
          const l = await lr(t, {
            ...r,
            elementContext: "reference"
          }), i = Rs(l, n.reference);
          return {
            data: {
              referenceHiddenOffsets: i,
              referenceHidden: Ms(i)
            }
          };
        }
        case "escaped": {
          const l = await lr(t, {
            ...r,
            altBoundary: !0
          }), i = Rs(l, n.floating);
          return {
            data: {
              escapedOffsets: i,
              escaped: Ms(i)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
async function Vd(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, l = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), i = An(n), s = Lo(n), a = vn(n) === "y", d = ["left", "top"].includes(i) ? -1 : 1, p = l && a ? -1 : 1, u = Yn(t, e);
  let {
    mainAxis: g,
    crossAxis: w,
    alignmentAxis: v
  } = typeof u == "number" ? {
    mainAxis: u,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: u.mainAxis || 0,
    crossAxis: u.crossAxis || 0,
    alignmentAxis: u.alignmentAxis
  };
  return s && typeof v == "number" && (w = s === "end" ? v * -1 : v), a ? {
    x: w * p,
    y: g * d
  } : {
    x: g * d,
    y: w * p
  };
}
const Id = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, o;
      const {
        x: r,
        y: l,
        placement: i,
        middlewareData: s
      } = t, a = await Vd(t, e);
      return i === ((n = s.offset) == null ? void 0 : n.placement) && (o = s.arrow) != null && o.alignmentOffset ? {} : {
        x: r + a.x,
        y: l + a.y,
        data: {
          ...a,
          placement: i
        }
      };
    }
  };
}, Fd = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: o,
        placement: r
      } = t, {
        mainAxis: l = !0,
        crossAxis: i = !1,
        limiter: s = {
          fn: (k) => {
            let {
              x,
              y: b
            } = k;
            return {
              x,
              y: b
            };
          }
        },
        ...a
      } = Yn(e, t), d = {
        x: n,
        y: o
      }, p = await lr(t, a), u = vn(An(r)), g = jc(u);
      let w = d[g], v = d[u];
      if (l) {
        const k = g === "y" ? "top" : "left", x = g === "y" ? "bottom" : "right", b = w + p[k], _ = w - p[x];
        w = jl(b, w, _);
      }
      if (i) {
        const k = u === "y" ? "top" : "left", x = u === "y" ? "bottom" : "right", b = v + p[k], _ = v - p[x];
        v = jl(b, v, _);
      }
      const A = s.fn({
        ...t,
        [g]: w,
        [u]: v
      });
      return {
        ...A,
        data: {
          x: A.x - n,
          y: A.y - o,
          enabled: {
            [g]: l,
            [u]: i
          }
        }
      };
    }
  };
}, Bd = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      var n, o;
      const {
        placement: r,
        rects: l,
        platform: i,
        elements: s
      } = t, {
        apply: a = () => {
        },
        ...d
      } = Yn(e, t), p = await lr(t, d), u = An(r), g = Lo(r), w = vn(r) === "y", {
        width: v,
        height: A
      } = l.floating;
      let k, x;
      u === "top" || u === "bottom" ? (k = u, x = g === (await (i.isRTL == null ? void 0 : i.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (x = u, k = g === "end" ? "top" : "bottom");
      const b = A - p.top - p.bottom, _ = v - p.left - p.right, C = Sn(A - p[k], b), T = Sn(v - p[x], _), P = !t.middlewareData.shift;
      let N = C, W = T;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (W = _), (o = t.middlewareData.shift) != null && o.enabled.y && (N = b), P && !g) {
        const H = mt(p.left, 0), D = mt(p.right, 0), M = mt(p.top, 0), V = mt(p.bottom, 0);
        w ? W = v - 2 * (H !== 0 || D !== 0 ? H + D : mt(p.left, p.right)) : N = A - 2 * (M !== 0 || V !== 0 ? M + V : mt(p.top, p.bottom));
      }
      await a({
        ...t,
        availableWidth: W,
        availableHeight: N
      });
      const G = await i.getDimensions(s.floating);
      return v !== G.width || A !== G.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function qr() {
  return typeof window < "u";
}
function Do(e) {
  return Kc(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function wt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Xt(e) {
  var t;
  return (t = (Kc(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Kc(e) {
  return qr() ? e instanceof Node || e instanceof wt(e).Node : !1;
}
function It(e) {
  return qr() ? e instanceof Element || e instanceof wt(e).Element : !1;
}
function Jt(e) {
  return qr() ? e instanceof HTMLElement || e instanceof wt(e).HTMLElement : !1;
}
function $s(e) {
  return !qr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof wt(e).ShadowRoot;
}
function ur(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Ft(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && !["inline", "contents"].includes(r);
}
function Ud(e) {
  return ["table", "td", "th"].includes(Do(e));
}
function Jr(e) {
  return [":popover-open", ":modal"].some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function pi(e) {
  const t = gi(), n = It(e) ? Ft(e) : e;
  return ["transform", "translate", "scale", "rotate", "perspective"].some((o) => n[o] ? n[o] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((o) => (n.willChange || "").includes(o)) || ["paint", "layout", "strict", "content"].some((o) => (n.contain || "").includes(o));
}
function Wd(e) {
  let t = kn(e);
  for (; Jt(t) && !Ao(t); ) {
    if (pi(t))
      return t;
    if (Jr(t))
      return null;
    t = kn(t);
  }
  return null;
}
function gi() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
function Ao(e) {
  return ["html", "body", "#document"].includes(Do(e));
}
function Ft(e) {
  return wt(e).getComputedStyle(e);
}
function Zr(e) {
  return It(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function kn(e) {
  if (Do(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    $s(e) && e.host || // Fallback.
    Xt(e)
  );
  return $s(t) ? t.host : t;
}
function qc(e) {
  const t = kn(e);
  return Ao(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Jt(t) && ur(t) ? t : qc(t);
}
function ir(e, t, n) {
  var o;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const r = qc(e), l = r === ((o = e.ownerDocument) == null ? void 0 : o.body), i = wt(r);
  if (l) {
    const s = Kl(i);
    return t.concat(i, i.visualViewport || [], ur(r) ? r : [], s && n ? ir(s) : []);
  }
  return t.concat(r, ir(r, [], n));
}
function Kl(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Jc(e) {
  const t = Ft(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Jt(e), l = r ? e.offsetWidth : n, i = r ? e.offsetHeight : o, s = Nr(n) !== l || Nr(o) !== i;
  return s && (n = l, o = i), {
    width: n,
    height: o,
    $: s
  };
}
function mi(e) {
  return It(e) ? e : e.contextElement;
}
function vo(e) {
  const t = mi(e);
  if (!Jt(t))
    return qt(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: l
  } = Jc(t);
  let i = (l ? Nr(n.width) : n.width) / o, s = (l ? Nr(n.height) : n.height) / r;
  return (!i || !Number.isFinite(i)) && (i = 1), (!s || !Number.isFinite(s)) && (s = 1), {
    x: i,
    y: s
  };
}
const Hd = /* @__PURE__ */ qt(0);
function Zc(e) {
  const t = wt(e);
  return !gi() || !t.visualViewport ? Hd : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Gd(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== wt(e) ? !1 : t;
}
function Hn(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), l = mi(e);
  let i = qt(1);
  t && (o ? It(o) && (i = vo(o)) : i = vo(e));
  const s = Gd(l, n, o) ? Zc(l) : qt(0);
  let a = (r.left + s.x) / i.x, d = (r.top + s.y) / i.y, p = r.width / i.x, u = r.height / i.y;
  if (l) {
    const g = wt(l), w = o && It(o) ? wt(o) : o;
    let v = g, A = Kl(v);
    for (; A && o && w !== v; ) {
      const k = vo(A), x = A.getBoundingClientRect(), b = Ft(A), _ = x.left + (A.clientLeft + parseFloat(b.paddingLeft)) * k.x, C = x.top + (A.clientTop + parseFloat(b.paddingTop)) * k.y;
      a *= k.x, d *= k.y, p *= k.x, u *= k.y, a += _, d += C, v = wt(A), A = Kl(v);
    }
  }
  return Vr({
    width: p,
    height: u,
    x: a,
    y: d
  });
}
function wi(e, t) {
  const n = Zr(e).scrollLeft;
  return t ? t.left + n : Hn(Xt(e)).left + n;
}
function Qc(e, t, n) {
  n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(), r = o.left + t.scrollLeft - (n ? 0 : (
    // RTL <body> scrollbar.
    wi(e, o)
  )), l = o.top + t.scrollTop;
  return {
    x: r,
    y: l
  };
}
function jd(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: o,
    strategy: r
  } = e;
  const l = r === "fixed", i = Xt(o), s = t ? Jr(t.floating) : !1;
  if (o === i || s && l)
    return n;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, d = qt(1);
  const p = qt(0), u = Jt(o);
  if ((u || !u && !l) && ((Do(o) !== "body" || ur(i)) && (a = Zr(o)), Jt(o))) {
    const w = Hn(o);
    d = vo(o), p.x = w.x + o.clientLeft, p.y = w.y + o.clientTop;
  }
  const g = i && !u && !l ? Qc(i, a, !0) : qt(0);
  return {
    width: n.width * d.x,
    height: n.height * d.y,
    x: n.x * d.x - a.scrollLeft * d.x + p.x + g.x,
    y: n.y * d.y - a.scrollTop * d.y + p.y + g.y
  };
}
function Yd(e) {
  return Array.from(e.getClientRects());
}
function Kd(e) {
  const t = Xt(e), n = Zr(e), o = e.ownerDocument.body, r = mt(t.scrollWidth, t.clientWidth, o.scrollWidth, o.clientWidth), l = mt(t.scrollHeight, t.clientHeight, o.scrollHeight, o.clientHeight);
  let i = -n.scrollLeft + wi(e);
  const s = -n.scrollTop;
  return Ft(o).direction === "rtl" && (i += mt(t.clientWidth, o.clientWidth) - r), {
    width: r,
    height: l,
    x: i,
    y: s
  };
}
function qd(e, t) {
  const n = wt(e), o = Xt(e), r = n.visualViewport;
  let l = o.clientWidth, i = o.clientHeight, s = 0, a = 0;
  if (r) {
    l = r.width, i = r.height;
    const d = gi();
    (!d || d && t === "fixed") && (s = r.offsetLeft, a = r.offsetTop);
  }
  return {
    width: l,
    height: i,
    x: s,
    y: a
  };
}
function Jd(e, t) {
  const n = Hn(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, l = Jt(e) ? vo(e) : qt(1), i = e.clientWidth * l.x, s = e.clientHeight * l.y, a = r * l.x, d = o * l.y;
  return {
    width: i,
    height: s,
    x: a,
    y: d
  };
}
function Ns(e, t, n) {
  let o;
  if (t === "viewport")
    o = qd(e, n);
  else if (t === "document")
    o = Kd(Xt(e));
  else if (It(t))
    o = Jd(t, n);
  else {
    const r = Zc(e);
    o = {
      x: t.x - r.x,
      y: t.y - r.y,
      width: t.width,
      height: t.height
    };
  }
  return Vr(o);
}
function Xc(e, t) {
  const n = kn(e);
  return n === t || !It(n) || Ao(n) ? !1 : Ft(n).position === "fixed" || Xc(n, t);
}
function Zd(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = ir(e, [], !1).filter((s) => It(s) && Do(s) !== "body"), r = null;
  const l = Ft(e).position === "fixed";
  let i = l ? kn(e) : e;
  for (; It(i) && !Ao(i); ) {
    const s = Ft(i), a = pi(i);
    !a && s.position === "fixed" && (r = null), (l ? !a && !r : !a && s.position === "static" && !!r && ["absolute", "fixed"].includes(r.position) || ur(i) && !a && Xc(e, i)) ? o = o.filter((p) => p !== i) : r = s, i = kn(i);
  }
  return t.set(e, o), o;
}
function Qd(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const i = [...n === "clippingAncestors" ? Jr(t) ? [] : Zd(t, this._c) : [].concat(n), o], s = i[0], a = i.reduce((d, p) => {
    const u = Ns(t, p, r);
    return d.top = mt(u.top, d.top), d.right = Sn(u.right, d.right), d.bottom = Sn(u.bottom, d.bottom), d.left = mt(u.left, d.left), d;
  }, Ns(t, s, r));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top
  };
}
function Xd(e) {
  const {
    width: t,
    height: n
  } = Jc(e);
  return {
    width: t,
    height: n
  };
}
function eh(e, t, n) {
  const o = Jt(t), r = Xt(t), l = n === "fixed", i = Hn(e, !0, l, t);
  let s = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = qt(0);
  function d() {
    a.x = wi(r);
  }
  if (o || !o && !l)
    if ((Do(t) !== "body" || ur(r)) && (s = Zr(t)), o) {
      const w = Hn(t, !0, l, t);
      a.x = w.x + t.clientLeft, a.y = w.y + t.clientTop;
    } else r && d();
  l && !o && r && d();
  const p = r && !o && !l ? Qc(r, s) : qt(0), u = i.left + s.scrollLeft - a.x - p.x, g = i.top + s.scrollTop - a.y - p.y;
  return {
    x: u,
    y: g,
    width: i.width,
    height: i.height
  };
}
function Ol(e) {
  return Ft(e).position === "static";
}
function zs(e, t) {
  if (!Jt(e) || Ft(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Xt(e) === n && (n = n.ownerDocument.body), n;
}
function ea(e, t) {
  const n = wt(e);
  if (Jr(e))
    return n;
  if (!Jt(e)) {
    let r = kn(e);
    for (; r && !Ao(r); ) {
      if (It(r) && !Ol(r))
        return r;
      r = kn(r);
    }
    return n;
  }
  let o = zs(e, t);
  for (; o && Ud(o) && Ol(o); )
    o = zs(o, t);
  return o && Ao(o) && Ol(o) && !pi(o) ? n : o || Wd(e) || n;
}
const th = async function(e) {
  const t = this.getOffsetParent || ea, n = this.getDimensions, o = await n(e.floating);
  return {
    reference: eh(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function nh(e) {
  return Ft(e).direction === "rtl";
}
const ta = {
  convertOffsetParentRelativeRectToViewportRelativeRect: jd,
  getDocumentElement: Xt,
  getClippingRect: Qd,
  getOffsetParent: ea,
  getElementRects: th,
  getClientRects: Yd,
  getDimensions: Xd,
  getScale: vo,
  isElement: It,
  isRTL: nh
};
function na(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function oh(e, t) {
  let n = null, o;
  const r = Xt(e);
  function l() {
    var s;
    clearTimeout(o), (s = n) == null || s.disconnect(), n = null;
  }
  function i(s, a) {
    s === void 0 && (s = !1), a === void 0 && (a = 1), l();
    const d = e.getBoundingClientRect(), {
      left: p,
      top: u,
      width: g,
      height: w
    } = d;
    if (s || t(), !g || !w)
      return;
    const v = Ar(u), A = Ar(r.clientWidth - (p + g)), k = Ar(r.clientHeight - (u + w)), x = Ar(p), _ = {
      rootMargin: -v + "px " + -A + "px " + -k + "px " + -x + "px",
      threshold: mt(0, Sn(1, a)) || 1
    };
    let C = !0;
    function T(P) {
      const N = P[0].intersectionRatio;
      if (N !== a) {
        if (!C)
          return i();
        N ? i(!1, N) : o = setTimeout(() => {
          i(!1, 1e-7);
        }, 1e3);
      }
      N === 1 && !na(d, e.getBoundingClientRect()) && i(), C = !1;
    }
    try {
      n = new IntersectionObserver(T, {
        ..._,
        // Handle <iframe>s
        root: r.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(T, _);
    }
    n.observe(e);
  }
  return i(!0), l;
}
function rh(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: l = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: s = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = o, d = mi(e), p = r || l ? [...d ? ir(d) : [], ...ir(t)] : [];
  p.forEach((x) => {
    r && x.addEventListener("scroll", n, {
      passive: !0
    }), l && x.addEventListener("resize", n);
  });
  const u = d && s ? oh(d, n) : null;
  let g = -1, w = null;
  i && (w = new ResizeObserver((x) => {
    let [b] = x;
    b && b.target === d && w && (w.unobserve(t), cancelAnimationFrame(g), g = requestAnimationFrame(() => {
      var _;
      (_ = w) == null || _.observe(t);
    })), n();
  }), d && !a && w.observe(d), w.observe(t));
  let v, A = a ? Hn(e) : null;
  a && k();
  function k() {
    const x = Hn(e);
    A && !na(A, x) && n(), A = x, v = requestAnimationFrame(k);
  }
  return n(), () => {
    var x;
    p.forEach((b) => {
      r && b.removeEventListener("scroll", n), l && b.removeEventListener("resize", n);
    }), u?.(), (x = w) == null || x.disconnect(), w = null, a && cancelAnimationFrame(v);
  };
}
const lh = Id, ih = Fd, sh = Nd, ch = Bd, ah = zd, fh = $d, uh = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = {
    platform: ta,
    ...n
  }, l = {
    ...r.platform,
    _c: o
  };
  return Md(e, t, {
    ...r,
    platform: l
  });
};
var dh = /* @__PURE__ */ Qt('<svg display=block viewBox="0 0 30 30"style=transform:scale(1.02)><g><path fill=none d=M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z></path><path stroke=none d=M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z>'), yi = Hr();
function bi() {
  const e = Gr(yi);
  if (e === void 0)
    throw new Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");
  return e;
}
var ql = 30, Vs = ql / 2, hh = {
  top: 180,
  right: -90,
  bottom: 0,
  left: 90
};
function xi(e) {
  const t = bi(), n = Yr({
    size: ql
  }, e), [o, r] = un(n, ["ref", "style", "size"]), l = () => t.currentPlacement().split("-")[0], i = ph(t.contentRef), s = () => i()?.getPropertyValue("background-color") || "none", a = () => i()?.getPropertyValue(`border-${l()}-color`) || "none", d = () => i()?.getPropertyValue(`border-${l()}-width`) || "0px", p = () => Number.parseInt(d()) * 2 * (ql / o.size), u = () => `rotate(${hh[l()]} ${Vs} ${Vs}) translate(0 2)`;
  return ce(Kr, Zt({
    as: "div",
    ref(g) {
      var w = fr(t.setArrowRef, o.ref);
      typeof w == "function" && w(g);
    },
    "aria-hidden": "true",
    get style() {
      return fi({
        // server side rendering
        position: "absolute",
        "font-size": `${o.size}px`,
        width: "1em",
        height: "1em",
        "pointer-events": "none",
        fill: s(),
        stroke: a(),
        "stroke-width": p()
      }, o.style);
    }
  }, r, {
    get children() {
      var g = dh(), w = g.firstChild, v = w.firstChild;
      return v.nextSibling, Lt(() => or(w, "transform", u())), g;
    }
  }));
}
function ph(e) {
  const [t, n] = _e();
  return qe(() => {
    const o = e();
    o && n(zc(o).getComputedStyle(o));
  }), t;
}
function gh(e) {
  const t = bi(), [n, o] = un(e, ["ref", "style"]);
  return ce(Kr, Zt({
    as: "div",
    ref(r) {
      var l = fr(t.setPositionerRef, n.ref);
      typeof l == "function" && l(r);
    },
    "data-popper-positioner": "",
    get style() {
      return fi({
        position: "absolute",
        top: 0,
        left: 0,
        "min-width": "max-content"
      }, n.style);
    }
  }, o));
}
function Is(e) {
  const {
    x: t = 0,
    y: n = 0,
    width: o = 0,
    height: r = 0
  } = e ?? {};
  if (typeof DOMRect == "function")
    return new DOMRect(t, n, o, r);
  const l = {
    x: t,
    y: n,
    width: o,
    height: r,
    top: n,
    right: t + o,
    bottom: n + r,
    left: t
  };
  return {
    ...l,
    toJSON: () => l
  };
}
function mh(e, t) {
  return {
    contextElement: e,
    getBoundingClientRect: () => {
      const o = t(e);
      return o ? Is(o) : e ? e.getBoundingClientRect() : Is();
    }
  };
}
function wh(e) {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(e);
}
var yh = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
function bh(e, t) {
  const [n, o] = e.split("-"), r = yh[n];
  return o ? n === "left" || n === "right" ? `${r} ${o === "start" ? "top" : "bottom"}` : o === "start" ? `${r} ${t === "rtl" ? "right" : "left"}` : `${r} ${t === "rtl" ? "left" : "right"}` : `${r} center`;
}
function xh(e) {
  const t = Yr({
    getAnchorRect: (g) => g?.getBoundingClientRect(),
    placement: "bottom",
    gutter: 0,
    shift: 0,
    flip: !0,
    slide: !0,
    overlap: !1,
    sameWidth: !1,
    fitViewport: !1,
    hideWhenDetached: !1,
    detachedPadding: 0,
    arrowPadding: 4,
    overflowPadding: 8
  }, e), [n, o] = _e(), [r, l] = _e(), [i, s] = _e(t.placement), a = () => mh(t.anchorRef?.(), t.getAnchorRect), {
    direction: d
  } = Cd();
  async function p() {
    const g = a(), w = n(), v = r();
    if (!g || !w)
      return;
    const A = (v?.clientHeight || 0) / 2, k = typeof t.gutter == "number" ? t.gutter + A : t.gutter ?? A;
    w.style.setProperty("--kb-popper-content-overflow-padding", `${t.overflowPadding}px`), g.getBoundingClientRect();
    const x = [
      // https://floating-ui.com/docs/offset
      lh(({
        placement: P
      }) => {
        const N = !!P.split("-")[1];
        return {
          mainAxis: k,
          crossAxis: N ? void 0 : t.shift,
          alignmentAxis: t.shift
        };
      })
    ];
    if (t.flip !== !1) {
      const P = typeof t.flip == "string" ? t.flip.split(" ") : void 0;
      if (P !== void 0 && !P.every(wh))
        throw new Error("`flip` expects a spaced-delimited list of placements");
      x.push(sh({
        padding: t.overflowPadding,
        fallbackPlacements: P
      }));
    }
    (t.slide || t.overlap) && x.push(ih({
      mainAxis: t.slide,
      crossAxis: t.overlap,
      padding: t.overflowPadding
    })), x.push(ch({
      padding: t.overflowPadding,
      apply({
        availableWidth: P,
        availableHeight: N,
        rects: W
      }) {
        const G = Math.round(W.reference.width);
        P = Math.floor(P), N = Math.floor(N), w.style.setProperty("--kb-popper-anchor-width", `${G}px`), w.style.setProperty("--kb-popper-content-available-width", `${P}px`), w.style.setProperty("--kb-popper-content-available-height", `${N}px`), t.sameWidth && (w.style.width = `${G}px`), t.fitViewport && (w.style.maxWidth = `${P}px`, w.style.maxHeight = `${N}px`);
      }
    })), t.hideWhenDetached && x.push(ah({
      padding: t.detachedPadding
    })), v && x.push(fh({
      element: v,
      padding: t.arrowPadding
    }));
    const b = await uh(g, w, {
      placement: t.placement,
      strategy: "absolute",
      middleware: x,
      platform: {
        ...ta,
        isRTL: () => d() === "rtl"
      }
    });
    if (s(b.placement), t.onCurrentPlacementChange?.(b.placement), !w)
      return;
    w.style.setProperty("--kb-popper-content-transform-origin", bh(b.placement, d()));
    const _ = Math.round(b.x), C = Math.round(b.y);
    let T;
    if (t.hideWhenDetached && (T = b.middlewareData.hide?.referenceHidden ? "hidden" : "visible"), Object.assign(w.style, {
      top: "0",
      left: "0",
      transform: `translate3d(${_}px, ${C}px, 0)`,
      visibility: T
    }), v && b.middlewareData.arrow) {
      const {
        x: P,
        y: N
      } = b.middlewareData.arrow, W = b.placement.split("-")[0];
      Object.assign(v.style, {
        left: P != null ? `${P}px` : "",
        top: N != null ? `${N}px` : "",
        [W]: "100%"
      });
    }
  }
  qe(() => {
    const g = a(), w = n();
    if (!g || !w)
      return;
    const v = rh(g, w, p, {
      // JSDOM doesn't support ResizeObserver
      elementResize: typeof ResizeObserver == "function"
    });
    Xe(v);
  }), qe(() => {
    const g = n(), w = t.contentRef?.();
    !g || !w || queueMicrotask(() => {
      g.style.zIndex = getComputedStyle(w).zIndex;
    });
  });
  const u = {
    currentPlacement: i,
    contentRef: () => t.contentRef?.(),
    setPositionerRef: o,
    setArrowRef: l
  };
  return ce(yi.Provider, {
    value: u,
    get children() {
      return t.children;
    }
  });
}
var oa = Object.assign(xh, {
  Arrow: xi,
  Context: yi,
  usePopperContext: bi,
  Positioner: gh
}), vh = "data-kb-top-layer", ra, Jl = !1, fn = [];
function sr(e) {
  return fn.findIndex((t) => t.node === e);
}
function Sh(e) {
  return fn[sr(e)];
}
function Ah(e) {
  return fn[fn.length - 1].node === e;
}
function la() {
  return fn.filter((e) => e.isPointerBlocking);
}
function kh() {
  return [...la()].slice(-1)[0];
}
function vi() {
  return la().length > 0;
}
function ia(e) {
  const t = sr(kh()?.node);
  return sr(e) < t;
}
function Ch(e) {
  fn.push(e);
}
function _h(e) {
  const t = sr(e);
  t < 0 || fn.splice(t, 1);
}
function Eh() {
  for (const {
    node: e
  } of fn)
    e.style.pointerEvents = ia(e) ? "none" : "auto";
}
function Ph(e) {
  if (vi() && !Jl) {
    const t = an(e);
    ra = document.body.style.pointerEvents, t.body.style.pointerEvents = "none", Jl = !0;
  }
}
function Th(e) {
  if (vi())
    return;
  const t = an(e);
  t.body.style.pointerEvents = ra, t.body.style.length === 0 && t.body.removeAttribute("style"), Jl = !1;
}
var pt = {
  layers: fn,
  isTopMostLayer: Ah,
  hasPointerBlockingLayer: vi,
  isBelowPointerBlockingLayer: ia,
  addLayer: Ch,
  removeLayer: _h,
  indexOf: sr,
  find: Sh,
  assignPointerEventToLayers: Eh,
  disableBodyPointerEvents: Ph,
  restoreBodyPointerEvents: Th
}, Fs = "interactOutside.pointerDownOutside", Bs = "interactOutside.focusOutside";
function Lh(e, t) {
  let n, o = Lu;
  const r = () => an(t()), l = (u) => e.onPointerDownOutside?.(u), i = (u) => e.onFocusOutside?.(u), s = (u) => e.onInteractOutside?.(u), a = (u) => {
    const g = u.target;
    return !(g instanceof HTMLElement) || g.closest(`[${vh}]`) || !Un(r(), g) || Un(t(), g) ? !1 : !e.shouldExcludeElement?.(g);
  }, d = (u) => {
    function g() {
      const w = t(), v = u.target;
      if (!w || !v || !a(u))
        return;
      const A = _s([l, s]);
      v.addEventListener(Fs, A, {
        once: !0
      });
      const k = new CustomEvent(Fs, {
        bubbles: !1,
        cancelable: !0,
        detail: {
          originalEvent: u,
          isContextMenu: u.button === 2 || Tu(u) && u.button === 0
        }
      });
      v.dispatchEvent(k);
    }
    u.pointerType === "touch" ? (r().removeEventListener("click", g), o = g, r().addEventListener("click", g, {
      once: !0
    })) : g();
  }, p = (u) => {
    const g = t(), w = u.target;
    if (!g || !w || !a(u))
      return;
    const v = _s([i, s]);
    w.addEventListener(Bs, v, {
      once: !0
    });
    const A = new CustomEvent(Bs, {
      bubbles: !1,
      cancelable: !0,
      detail: {
        originalEvent: u,
        isContextMenu: !1
      }
    });
    w.dispatchEvent(A);
  };
  qe(() => {
    $r(e.isDisabled) || (n = window.setTimeout(() => {
      r().addEventListener("pointerdown", d, !0);
    }, 0), r().addEventListener("focusin", p, !0), Xe(() => {
      window.clearTimeout(n), r().removeEventListener("click", o), r().removeEventListener("pointerdown", d, !0), r().removeEventListener("focusin", p, !0);
    }));
  });
}
function Dh(e) {
  const t = (n) => {
    n.key === Vc.Escape && e.onEscapeKeyDown?.(n);
  };
  qe(() => {
    if ($r(e.isDisabled))
      return;
    const n = e.ownerDocument?.() ?? an();
    n.addEventListener("keydown", t), Xe(() => {
      n.removeEventListener("keydown", t);
    });
  });
}
var sa = Hr();
function Oh() {
  return Gr(sa);
}
function Rh(e) {
  let t;
  const n = Oh(), [o, r] = un(e, ["ref", "disableOutsidePointerEvents", "excludedElements", "onEscapeKeyDown", "onPointerDownOutside", "onFocusOutside", "onInteractOutside", "onDismiss", "bypassTopMostLayerCheck"]), l = /* @__PURE__ */ new Set([]), i = (u) => {
    l.add(u);
    const g = n?.registerNestedLayer(u);
    return () => {
      l.delete(u), g?.();
    };
  };
  Lh({
    shouldExcludeElement: (u) => t ? o.excludedElements?.some((g) => Un(g(), u)) || [...l].some((g) => Un(g, u)) : !1,
    onPointerDownOutside: (u) => {
      !t || pt.isBelowPointerBlockingLayer(t) || !o.bypassTopMostLayerCheck && !pt.isTopMostLayer(t) || (o.onPointerDownOutside?.(u), o.onInteractOutside?.(u), u.defaultPrevented || o.onDismiss?.());
    },
    onFocusOutside: (u) => {
      o.onFocusOutside?.(u), o.onInteractOutside?.(u), u.defaultPrevented || o.onDismiss?.();
    }
  }, () => t), Dh({
    ownerDocument: () => an(t),
    onEscapeKeyDown: (u) => {
      !t || !pt.isTopMostLayer(t) || (o.onEscapeKeyDown?.(u), !u.defaultPrevented && o.onDismiss && (u.preventDefault(), o.onDismiss()));
    }
  }), Wr(() => {
    if (!t)
      return;
    pt.addLayer({
      node: t,
      isPointerBlocking: o.disableOutsidePointerEvents,
      dismiss: o.onDismiss
    });
    const u = n?.registerNestedLayer(t);
    pt.assignPointerEventToLayers(), pt.disableBodyPointerEvents(t), Xe(() => {
      t && (pt.removeLayer(t), u?.(), pt.assignPointerEventToLayers(), pt.restoreBodyPointerEvents(t));
    });
  }), qe(Fl([() => t, () => o.disableOutsidePointerEvents], ([u, g]) => {
    if (!u)
      return;
    const w = pt.find(u);
    w && w.isPointerBlocking !== g && (w.isPointerBlocking = g, pt.assignPointerEventToLayers()), g && pt.disableBodyPointerEvents(u), Xe(() => {
      pt.restoreBodyPointerEvents(u);
    });
  }, {
    defer: !0
  }));
  const p = {
    registerNestedLayer: i
  };
  return ce(sa.Provider, {
    value: p,
    get children() {
      return ce(Kr, Zt({
        as: "div",
        ref(u) {
          var g = fr((w) => t = w, o.ref);
          typeof g == "function" && g(u);
        }
      }, r));
    }
  });
}
function Mh(e = {}) {
  const [t, n] = Mu({
    value: () => $r(e.open),
    defaultValue: () => !!$r(e.defaultOpen),
    onChange: (i) => e.onOpenChange?.(i)
  }), o = () => {
    n(!0);
  }, r = () => {
    n(!1);
  };
  return {
    isOpen: t,
    setIsOpen: n,
    open: o,
    close: r,
    toggle: () => {
      t() ? r() : o();
    }
  };
}
var kr = (e) => typeof e == "function" ? e() : e, $h = (e) => {
  const t = Ke(() => {
    const i = kr(e.element);
    if (i)
      return getComputedStyle(i);
  }), n = () => t()?.animationName ?? "none", [o, r] = _e(kr(e.show) ? "present" : "hidden");
  let l = "none";
  return qe((i) => {
    const s = kr(e.show);
    return bt(() => {
      if (i === s) return s;
      const a = l, d = n();
      s ? r("present") : d === "none" || t()?.display === "none" ? r("hidden") : r(i === !0 && a !== d ? "hiding" : "hidden");
    }), s;
  }), qe(() => {
    const i = kr(e.element);
    if (!i) return;
    const s = (d) => {
      d.target === i && (l = n());
    }, a = (d) => {
      const u = n().includes(d.animationName);
      d.target === i && u && o() === "hiding" && r("hidden");
    };
    i.addEventListener("animationstart", s), i.addEventListener("animationcancel", a), i.addEventListener("animationend", a), Xe(() => {
      i.removeEventListener("animationstart", s), i.removeEventListener("animationcancel", a), i.removeEventListener("animationend", a);
    });
  }), {
    present: () => o() === "present" || o() === "hiding",
    state: o,
    setState: r
  };
}, Nh = $h, zh = Nh, Vh = {};
zu(Vh, {
  Arrow: () => xi,
  Content: () => Ai,
  Portal: () => ki,
  Root: () => Ci,
  Tooltip: () => Bh,
  Trigger: () => _i
});
var ca = Hr();
function Si() {
  const e = Gr(ca);
  if (e === void 0)
    throw new Error("[kobalte]: `useTooltipContext` must be used within a `Tooltip` component");
  return e;
}
function Ai(e) {
  const t = Si(), n = Yr({
    id: t.generateId("content")
  }, e), [o, r] = un(n, ["ref", "style"]);
  return qe(() => Xe(t.registerContentId(r.id))), ce(nr, {
    get when() {
      return t.contentPresent();
    },
    get children() {
      return ce(oa.Positioner, {
        get children() {
          return ce(Rh, Zt({
            ref(l) {
              var i = fr((s) => {
                t.setContentRef(s);
              }, o.ref);
              typeof i == "function" && i(l);
            },
            role: "tooltip",
            disableOutsidePointerEvents: !1,
            get style() {
              return fi({
                "--kb-tooltip-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                position: "relative"
              }, o.style);
            },
            onFocusOutside: (l) => l.preventDefault(),
            onDismiss: () => t.hideTooltip(!0)
          }, () => t.dataset(), r));
        }
      });
    }
  });
}
function ki(e) {
  const t = Si();
  return ce(nr, {
    get when() {
      return t.contentPresent();
    },
    get children() {
      return ce(wu, e);
    }
  });
}
function Ih(e, t, n) {
  const o = e.split("-")[0], r = t.getBoundingClientRect(), l = n.getBoundingClientRect(), i = [], s = r.left + r.width / 2, a = r.top + r.height / 2;
  switch (o) {
    case "top":
      i.push([r.left, a]), i.push([l.left, l.bottom]), i.push([l.left, l.top]), i.push([l.right, l.top]), i.push([l.right, l.bottom]), i.push([r.right, a]);
      break;
    case "right":
      i.push([s, r.top]), i.push([l.left, l.top]), i.push([l.right, l.top]), i.push([l.right, l.bottom]), i.push([l.left, l.bottom]), i.push([s, r.bottom]);
      break;
    case "bottom":
      i.push([r.left, a]), i.push([l.left, l.top]), i.push([l.left, l.bottom]), i.push([l.right, l.bottom]), i.push([l.right, l.top]), i.push([r.right, a]);
      break;
    case "left":
      i.push([s, r.top]), i.push([l.right, l.top]), i.push([l.left, l.top]), i.push([l.left, l.bottom]), i.push([l.right, l.bottom]), i.push([s, r.bottom]);
      break;
  }
  return i;
}
var zn = {}, Fh = 0, mo = !1, rn, jo, wo;
function Ci(e) {
  const t = `tooltip-${Gf()}`, n = `${++Fh}`, o = Yr({
    id: t,
    openDelay: 700,
    closeDelay: 300,
    skipDelayDuration: 300
  }, e), [r, l] = un(o, ["id", "open", "defaultOpen", "onOpenChange", "disabled", "triggerOnFocusOnly", "openDelay", "closeDelay", "skipDelayDuration", "ignoreSafeArea", "forceMount"]);
  let i;
  const [s, a] = _e(), [d, p] = _e(), [u, g] = _e(), [w, v] = _e(l.placement), A = Mh({
    open: () => r.open,
    defaultOpen: () => r.defaultOpen,
    onOpenChange: (R) => r.onOpenChange?.(R)
  }), {
    present: k
  } = zh({
    show: () => r.forceMount || A.isOpen(),
    element: () => u() ?? null
  }), x = () => {
    zn[n] = _;
  }, b = () => {
    for (const R in zn)
      R !== n && (zn[R](!0), delete zn[R]);
  }, _ = (R = !1) => {
    R || r.closeDelay && r.closeDelay <= 0 ? (window.clearTimeout(i), i = void 0, A.close()) : i || (i = window.setTimeout(() => {
      i = void 0, A.close();
    }, r.closeDelay)), window.clearTimeout(rn), rn = void 0, r.skipDelayDuration && r.skipDelayDuration >= 0 && (wo = window.setTimeout(() => {
      window.clearTimeout(wo), wo = void 0;
    }, r.skipDelayDuration)), mo && (window.clearTimeout(jo), jo = window.setTimeout(() => {
      delete zn[n], jo = void 0, mo = !1;
    }, r.closeDelay));
  }, C = () => {
    clearTimeout(i), i = void 0, b(), x(), mo = !0, A.open(), window.clearTimeout(rn), rn = void 0, window.clearTimeout(jo), jo = void 0, window.clearTimeout(wo), wo = void 0;
  }, T = () => {
    b(), x(), !A.isOpen() && !rn && !mo ? rn = window.setTimeout(() => {
      rn = void 0, mo = !0, C();
    }, r.openDelay) : A.isOpen() || C();
  }, P = (R = !1) => {
    !R && r.openDelay && r.openDelay > 0 && !i && !wo ? T() : C();
  }, N = () => {
    window.clearTimeout(rn), rn = void 0, mo = !1;
  }, W = () => {
    window.clearTimeout(i), i = void 0;
  }, G = (R) => Un(d(), R) || Un(u(), R), H = (R) => {
    const $ = d(), j = u();
    if (!(!$ || !j))
      return Ih(R, $, j);
  }, D = (R) => {
    const $ = R.target;
    if (G($)) {
      W();
      return;
    }
    if (!r.ignoreSafeArea) {
      const j = H(w());
      if (j && Ou(Du(R), j)) {
        W();
        return;
      }
    }
    i || _();
  };
  qe(() => {
    if (!A.isOpen())
      return;
    const R = an();
    R.addEventListener("pointermove", D, !0), Xe(() => {
      R.removeEventListener("pointermove", D, !0);
    });
  }), qe(() => {
    const R = d();
    if (!R || !A.isOpen())
      return;
    const $ = (I) => {
      const he = I.target;
      Un(he, R) && _(!0);
    }, j = zc();
    j.addEventListener("scroll", $, {
      capture: !0
    }), Xe(() => {
      j.removeEventListener("scroll", $, {
        capture: !0
      });
    });
  }), Xe(() => {
    clearTimeout(i), zn[n] && delete zn[n];
  });
  const V = {
    dataset: Ke(() => ({
      "data-expanded": A.isOpen() ? "" : void 0,
      "data-closed": A.isOpen() ? void 0 : ""
    })),
    isOpen: A.isOpen,
    isDisabled: () => r.disabled ?? !1,
    triggerOnFocusOnly: () => r.triggerOnFocusOnly ?? !1,
    contentId: s,
    contentPresent: k,
    openTooltip: P,
    hideTooltip: _,
    cancelOpening: N,
    generateId: _u(() => o.id),
    registerContentId: $u(a),
    isTargetOnTooltip: G,
    setTriggerRef: p,
    setContentRef: g
  };
  return ce(ca.Provider, {
    value: V,
    get children() {
      return ce(oa, Zt({
        anchorRef: d,
        contentRef: u,
        onCurrentPlacementChange: v
      }, l));
    }
  });
}
function _i(e) {
  let t;
  const n = Si(), [o, r] = un(e, ["ref", "onPointerEnter", "onPointerLeave", "onPointerDown", "onClick", "onFocus", "onBlur"]);
  let l = !1, i = !1, s = !1;
  const a = () => {
    l = !1;
  }, d = () => {
    !n.isOpen() && (i || s) && n.openTooltip(s);
  }, p = (x) => {
    n.isOpen() && !i && !s && n.hideTooltip(x);
  }, u = (x) => {
    Vn(x, o.onPointerEnter), !(x.pointerType === "touch" || n.triggerOnFocusOnly() || n.isDisabled() || x.defaultPrevented) && (i = !0, d());
  }, g = (x) => {
    Vn(x, o.onPointerLeave), x.pointerType !== "touch" && (i = !1, s = !1, n.isOpen() ? p() : n.cancelOpening());
  }, w = (x) => {
    Vn(x, o.onPointerDown), l = !0, an(t).addEventListener("pointerup", a, {
      once: !0
    });
  }, v = (x) => {
    Vn(x, o.onClick), i = !1, s = !1, p(!0);
  }, A = (x) => {
    Vn(x, o.onFocus), !(n.isDisabled() || x.defaultPrevented || l) && (s = !0, d());
  }, k = (x) => {
    Vn(x, o.onBlur);
    const b = x.relatedTarget;
    n.isTargetOnTooltip(b) || (i = !1, s = !1, p(!0));
  };
  return Xe(() => {
    an(t).removeEventListener("pointerup", a);
  }), ce(Kr, Zt({
    as: "button",
    ref(x) {
      var b = fr((_) => {
        n.setTriggerRef(_), t = _;
      }, o.ref);
      typeof b == "function" && b(x);
    },
    get "aria-describedby"() {
      return ou(() => !!n.isOpen())() ? n.contentId() : void 0;
    },
    onPointerEnter: u,
    onPointerLeave: g,
    onPointerDown: w,
    onClick: v,
    onFocus: A,
    onBlur: k
  }, () => n.dataset(), r));
}
var Bh = Object.assign(Ci, {
  Arrow: xi,
  Content: Ai,
  Portal: ki,
  Trigger: _i
});
const aa = _i, fa = (e) => ce(Ci, Zt({
  gutter: 4
}, e)), ua = (e) => {
  const [t, n] = un(e, ["class"]);
  return ce(ki, {
    get children() {
      return ce(Ai, Zt({
        get class() {
          return wd("z-50 origin-[var(--kb-popover-content-transform-origin)] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", t.class);
        }
      }, n));
    }
  });
};
jr(["click"]);
var Uh = /* @__PURE__ */ Qt('<div><span></span><div class="w-full h-0.5 bg-black"></div><div><span></span><span>'), Wh = /* @__PURE__ */ Qt('<div class="flex items-center">');
const Us = (e) => {
  const t = e.color || "#93c5fd", n = "#fef9c3", [o, r] = _e(""), [l, i] = _e(t);
  let s = "", a = "", d = "", p = "";
  e.size === "small" ? (s = "text-sm", a = "text-base", d = "p-1 gap-0", p = "pl-0 text-xs align-top") : e.size === "medium" ? (s = "text-lg", a = "text-xl", d = "p-2 gap-1", p = "pl-0 text-sm align-top") : e.size === "large" ? (s = "text-2xl", a = "text-3xl", d = "p-4 gap-2", p = "pl-0 text-lg align-top") : e.size === "xlarge" && (s = "text-4xl", a = "text-5xl", d = "p-5 gap-2", p = "pl-1 text-2xl align-top");
  const u = d + " rounded-md shadow-md grid grid-cols-1" + (e.class || ""), g = s, w = "overflow-hidden text-ellipsis font-bold lining-nums " + a;
  return qe(Fl(() => e.value, () => {
    e.reactive && (i(n), r("none"), setTimeout(() => {
      i(e.color || t), r("background-color 0.75s");
    }, 100));
  })), qe(Fl(() => e.color, () => {
    e.color && i(e.color);
  })), (() => {
    var v = Wh();
    return Ye(v, ce(fa, {
      get children() {
        return [ce(aa, {
          class: "cursor-default",
          get children() {
            var A = Uh(), k = A.firstChild, x = k.nextSibling, b = x.nextSibling, _ = b.firstChild, C = _.nextSibling;
            return Tt(A, u), Tt(k, g), Ye(k, () => e.title), Tt(_, w), Ye(_, () => e.value), Tt(C, p), Ye(C, () => e.units || ""), Lt((T) => {
              var P = l(), N = o();
              return P !== T.e && ((T.e = P) != null ? A.style.setProperty("background-color", P) : A.style.removeProperty("background-color")), N !== T.t && ((T.t = N) != null ? A.style.setProperty("transition", N) : A.style.removeProperty("transition")), T;
            }, {
              e: void 0,
              t: void 0
            }), A;
          }
        }), ce(nr, {
          get when() {
            return e.description;
          },
          get children() {
            return ce(ua, {
              get children() {
                return e.description;
              }
            });
          }
        })];
      }
    })), v;
  })();
};
var Hh = /* @__PURE__ */ Qt('<div><span></span><div class="w-full h-0.5 bg-black"></div><div class="flex border-2 border-black rounded-md place-content-center gap-3 cursor-pointer"><span></span><div><svg class=rotate-180 height=100% viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z"fill=#000000>'), Gh = /* @__PURE__ */ Qt("<div>"), jh = /* @__PURE__ */ Qt('<div class="flex items-center"><div class="flex gap-2">'), Yh = /* @__PURE__ */ Qt('<div class="m-1 px-3 rounded-sm text-left hover:bg-blue-400 active:bg-blue-500 cursor-pointer">');
const Kh = (e) => {
  const [t, n] = _e(e.value), [o, r] = _e(!1);
  let l = "", i = "", s = "", a = "", d = "", p = "";
  e.size === "small" ? (l = "text-sm", i = "text-base", s = "p-1 gap-1", a = "ml-1", d = "16px", p = "") : e.size === "medium" ? (l = "text-lg", i = "text-xl", s = "p-2 gap-1", a = "ml-2 -mt-1", d = "22px", p = "") : e.size === "large" ? (l = "text-2xl", i = "text-3xl", s = "p-4 gap-2", a = "ml-4 -mt-3", d = "26px", p = "") : e.size === "xlarge" && (l = "text-4xl", i = "text-5xl", s = "p-5 gap-2", a = "ml-5 -mt-4", d = "32px", p = "-mb-2");
  const u = s + " rounded-md shadow-md grid grid-cols-1 bg-blue-300" + (e.class || ""), g = l, w = "font-bold bg-transparent text-center mx-auto " + i;
  let v;
  return (() => {
    var A = jh(), k = A.firstChild;
    return Ye(k, ce(fa, {
      get children() {
        return [ce(aa, {
          class: "cursor-default",
          get children() {
            return [(() => {
              var x = Hh(), b = x.firstChild, _ = b.nextSibling, C = _.nextSibling, T = C.firstChild, P = T.nextSibling, N = P.firstChild;
              Tt(x, u), Tt(b, g), Ye(b, () => e.title);
              var W = v;
              return typeof W == "function" ? ai(W, C) : v = C, C.$$click = () => {
                r(!o());
              }, Tt(T, w), Ye(T, t), Tt(P, "p-1 ml-auto " + p), or(N, "width", d), x;
            })(), ce(nr, {
              get when() {
                return o();
              },
              get children() {
                var x = Gh();
                return Tt(x, "absolute z-10 border border-black rounded-md bg-blue-300 shadow-md mx-auto " + a), Ye(x, ce(Yf, {
                  get each() {
                    return e.options;
                  },
                  children: (b) => (() => {
                    var _ = Yh();
                    return _.$$click = () => {
                      n(b), r(!1), e.onSelect(b);
                    }, Ye(_, b), _;
                  })()
                })), Lt((b) => (b = `${v.offsetWidth}px`) != null ? x.style.setProperty("width", b) : x.style.removeProperty("width")), x;
              }
            })];
          }
        }), ce(nr, {
          get when() {
            return e.description;
          },
          get children() {
            return ce(ua, {
              get children() {
                return e.description;
              }
            });
          }
        })];
      }
    })), A;
  })();
};
jr(["click"]);
const qh = !0, Ve = "u-", Jh = "uplot", Zh = Ve + "hz", Qh = Ve + "vt", Xh = Ve + "title", ep = Ve + "wrap", tp = Ve + "under", np = Ve + "over", op = Ve + "axis", Bn = Ve + "off", rp = Ve + "select", lp = Ve + "cursor-x", ip = Ve + "cursor-y", sp = Ve + "cursor-pt", cp = Ve + "legend", ap = Ve + "live", fp = Ve + "inline", up = Ve + "series", dp = Ve + "marker", Ws = Ve + "label", hp = Ve + "value", Jo = "width", Zo = "height", Yo = "top", Hs = "bottom", yo = "left", Rl = "right", Ei = "#000", Gs = Ei + "0", Ml = "mousemove", js = "mousedown", $l = "mouseup", Ys = "mouseenter", Ks = "mouseleave", qs = "dblclick", pp = "resize", gp = "scroll", Js = "change", Ir = "dppxchange", Pi = "--", Oo = typeof window < "u", Zl = Oo ? document : null, So = Oo ? window : null, mp = Oo ? navigator : null;
let fe, Cr;
function Ql() {
  let e = devicePixelRatio;
  fe != e && (fe = e, Cr && ei(Js, Cr, Ql), Cr = matchMedia(`(min-resolution: ${fe - 1e-3}dppx) and (max-resolution: ${fe + 1e-3}dppx)`), Wn(Js, Cr, Ql), So.dispatchEvent(new CustomEvent(Ir)));
}
function gt(e, t) {
  if (t != null) {
    let n = e.classList;
    !n.contains(t) && n.add(t);
  }
}
function Xl(e, t) {
  let n = e.classList;
  n.contains(t) && n.remove(t);
}
function Ae(e, t, n) {
  e.style[t] = n + "px";
}
function Nt(e, t, n, o) {
  let r = Zl.createElement(e);
  return t != null && gt(r, t), n?.insertBefore(r, o), r;
}
function Et(e, t) {
  return Nt("div", e, t);
}
const Zs = /* @__PURE__ */ new WeakMap();
function Kt(e, t, n, o, r) {
  let l = "translate(" + t + "px," + n + "px)", i = Zs.get(e);
  l != i && (e.style.transform = l, Zs.set(e, l), t < 0 || n < 0 || t > o || n > r ? gt(e, Bn) : Xl(e, Bn));
}
const Qs = /* @__PURE__ */ new WeakMap();
function Xs(e, t, n) {
  let o = t + n, r = Qs.get(e);
  o != r && (Qs.set(e, o), e.style.background = t, e.style.borderColor = n);
}
const ec = /* @__PURE__ */ new WeakMap();
function tc(e, t, n, o) {
  let r = t + "" + n, l = ec.get(e);
  r != l && (ec.set(e, r), e.style.height = n + "px", e.style.width = t + "px", e.style.marginLeft = o ? -t / 2 + "px" : 0, e.style.marginTop = o ? -n / 2 + "px" : 0);
}
const Ti = { passive: !0 }, wp = { ...Ti, capture: !0 };
function Wn(e, t, n, o) {
  t.addEventListener(e, n, o ? wp : Ti);
}
function ei(e, t, n, o) {
  t.removeEventListener(e, n, Ti);
}
Oo && Ql();
function zt(e, t, n, o) {
  let r;
  n = n || 0, o = o || t.length - 1;
  let l = o <= 2147483647;
  for (; o - n > 1; )
    r = l ? n + o >> 1 : yt((n + o) / 2), t[r] < e ? n = r : o = r;
  return e - t[n] <= t[o] - e ? n : o;
}
function da(e) {
  return (n, o, r) => {
    let l = -1, i = -1;
    for (let s = o; s <= r; s++)
      if (e(n[s])) {
        l = s;
        break;
      }
    for (let s = r; s >= o; s--)
      if (e(n[s])) {
        i = s;
        break;
      }
    return [l, i];
  };
}
const ha = (e) => e != null, pa = (e) => e != null && e > 0, Qr = da(ha), yp = da(pa);
function bp(e, t, n, o = 0, r = !1) {
  let l = r ? yp : Qr, i = r ? pa : ha;
  [t, n] = l(e, t, n);
  let s = e[t], a = e[t];
  if (t > -1)
    if (o == 1)
      s = e[t], a = e[n];
    else if (o == -1)
      s = e[n], a = e[t];
    else
      for (let d = t; d <= n; d++) {
        let p = e[d];
        i(p) && (p < s ? s = p : p > a && (a = p));
      }
  return [s ?? me, a ?? -me];
}
function Xr(e, t, n, o) {
  let r = rc(e), l = rc(t);
  e == t && (r == -1 ? (e *= n, t /= n) : (e /= n, t *= n));
  let i = n == 10 ? sn : ga, s = r == 1 ? yt : Pt, a = l == 1 ? Pt : yt, d = s(i(ze(e))), p = a(i(ze(t))), u = ko(n, d), g = ko(n, p);
  return n == 10 && (d < 0 && (u = we(u, -d)), p < 0 && (g = we(g, -p))), o || n == 2 ? (e = u * r, t = g * l) : (e = ba(e, u), t = el(t, g)), [e, t];
}
function Li(e, t, n, o) {
  let r = Xr(e, t, n, o);
  return e == 0 && (r[0] = 0), t == 0 && (r[1] = 0), r;
}
const Di = 0.1, nc = {
  mode: 3,
  pad: Di
}, Xo = {
  pad: 0,
  soft: null,
  mode: 0
}, xp = {
  min: Xo,
  max: Xo
};
function Fr(e, t, n, o) {
  return tl(n) ? oc(e, t, n) : (Xo.pad = n, Xo.soft = o ? 0 : null, Xo.mode = o ? 3 : 0, oc(e, t, xp));
}
function se(e, t) {
  return e ?? t;
}
function vp(e, t, n) {
  for (t = se(t, 0), n = se(n, e.length - 1); t <= n; ) {
    if (e[t] != null)
      return !0;
    t++;
  }
  return !1;
}
function oc(e, t, n) {
  let o = n.min, r = n.max, l = se(o.pad, 0), i = se(r.pad, 0), s = se(o.hard, -me), a = se(r.hard, me), d = se(o.soft, me), p = se(r.soft, -me), u = se(o.mode, 0), g = se(r.mode, 0), w = t - e, v = sn(w), A = it(ze(e), ze(t)), k = sn(A), x = ze(k - v);
  (w < 1e-24 || x > 10) && (w = 0, (e == 0 || t == 0) && (w = 1e-24, u == 2 && d != me && (l = 0), g == 2 && p != -me && (i = 0)));
  let b = w || A || 1e3, _ = sn(b), C = ko(10, yt(_)), T = b * (w == 0 ? e == 0 ? 0.1 : 1 : l), P = we(ba(e - T, C / 10), 24), N = e >= d && (u == 1 || u == 3 && P <= d || u == 2 && P >= d) ? d : me, W = it(s, P < N && e >= N ? N : Vt(N, P)), G = b * (w == 0 ? t == 0 ? 0.1 : 1 : i), H = we(el(t + G, C / 10), 24), D = t <= p && (g == 1 || g == 3 && H >= p || g == 2 && H <= p) ? p : -me, M = Vt(a, H > D && t <= D ? D : it(D, H));
  return W == M && W == 0 && (M = 100), [W, M];
}
const Sp = new Intl.NumberFormat(Oo ? mp.language : "en-US"), Oi = (e) => Sp.format(e), xt = Math, Tr = xt.PI, ze = xt.abs, yt = xt.floor, Ne = xt.round, Pt = xt.ceil, Vt = xt.min, it = xt.max, ko = xt.pow, rc = xt.sign, sn = xt.log10, ga = xt.log2, Ap = (e, t = 1) => xt.sinh(e) * t, Nl = (e, t = 1) => xt.asinh(e / t), me = 1 / 0;
function lc(e) {
  return (sn((e ^ e >> 31) - (e >> 31)) | 0) + 1;
}
function ti(e, t, n) {
  return Vt(it(e, t), n);
}
function ma(e) {
  return typeof e == "function";
}
function le(e) {
  return ma(e) ? e : () => e;
}
const kp = () => {
}, wa = (e) => e, ya = (e, t) => t, Cp = (e) => null, ic = (e) => !0, sc = (e, t) => e == t, _p = /\.\d*?(?=9{6,}|0{6,})/gm, Gn = (e) => {
  if (va(e) || Cn.has(e))
    return e;
  const t = `${e}`, n = t.match(_p);
  if (n == null)
    return e;
  let o = n[0].length - 1;
  if (t.indexOf("e-") != -1) {
    let [r, l] = t.split("e");
    return +`${Gn(r)}e${l}`;
  }
  return we(e, o);
};
function In(e, t) {
  return Gn(we(Gn(e / t)) * t);
}
function el(e, t) {
  return Gn(Pt(Gn(e / t)) * t);
}
function ba(e, t) {
  return Gn(yt(Gn(e / t)) * t);
}
function we(e, t = 0) {
  if (va(e))
    return e;
  let n = 10 ** t, o = e * n * (1 + Number.EPSILON);
  return Ne(o) / n;
}
const Cn = /* @__PURE__ */ new Map();
function xa(e) {
  return (("" + e).split(".")[1] || "").length;
}
function cr(e, t, n, o) {
  let r = [], l = o.map(xa);
  for (let i = t; i < n; i++) {
    let s = ze(i), a = we(ko(e, i), s);
    for (let d = 0; d < o.length; d++) {
      let p = e == 10 ? +`${o[d]}e${i}` : o[d] * a, u = (i >= 0 ? 0 : s) + (i >= l[d] ? 0 : l[d]), g = e == 10 ? p : we(p, u);
      r.push(g), Cn.set(g, u);
    }
  }
  return r;
}
const er = {}, Ri = [], Co = [null, null], xn = Array.isArray, va = Number.isInteger, Ep = (e) => e === void 0;
function cc(e) {
  return typeof e == "string";
}
function tl(e) {
  let t = !1;
  if (e != null) {
    let n = e.constructor;
    t = n == null || n == Object;
  }
  return t;
}
function Pp(e) {
  return e != null && typeof e == "object";
}
const Tp = Object.getPrototypeOf(Uint8Array), Sa = "__proto__";
function _o(e, t = tl) {
  let n;
  if (xn(e)) {
    let o = e.find((r) => r != null);
    if (xn(o) || t(o)) {
      n = Array(e.length);
      for (let r = 0; r < e.length; r++)
        n[r] = _o(e[r], t);
    } else
      n = e.slice();
  } else if (e instanceof Tp)
    n = e.slice();
  else if (t(e)) {
    n = {};
    for (let o in e)
      o != Sa && (n[o] = _o(e[o], t));
  } else
    n = e;
  return n;
}
function Re(e) {
  let t = arguments;
  for (let n = 1; n < t.length; n++) {
    let o = t[n];
    for (let r in o)
      r != Sa && (tl(e[r]) ? Re(e[r], _o(o[r])) : e[r] = _o(o[r]));
  }
  return e;
}
const Lp = 0, Dp = 1, Op = 2;
function Rp(e, t, n) {
  for (let o = 0, r, l = -1; o < t.length; o++) {
    let i = t[o];
    if (i > l) {
      for (r = i - 1; r >= 0 && e[r] == null; )
        e[r--] = null;
      for (r = i + 1; r < n && e[r] == null; )
        e[l = r++] = null;
    }
  }
}
function Mp(e, t) {
  if (zp(e)) {
    let i = e[0].slice();
    for (let s = 1; s < e.length; s++)
      i.push(...e[s].slice(1));
    return Vp(i[0]) || (i = Np(i)), i;
  }
  let n = /* @__PURE__ */ new Set();
  for (let i = 0; i < e.length; i++) {
    let a = e[i][0], d = a.length;
    for (let p = 0; p < d; p++)
      n.add(a[p]);
  }
  let o = [Array.from(n).sort((i, s) => i - s)], r = o[0].length, l = /* @__PURE__ */ new Map();
  for (let i = 0; i < r; i++)
    l.set(o[0][i], i);
  for (let i = 0; i < e.length; i++) {
    let s = e[i], a = s[0];
    for (let d = 1; d < s.length; d++) {
      let p = s[d], u = Array(r).fill(void 0), g = t ? t[i][d] : Dp, w = [];
      for (let v = 0; v < p.length; v++) {
        let A = p[v], k = l.get(a[v]);
        A === null ? g != Lp && (u[k] = A, g == Op && w.push(k)) : u[k] = A;
      }
      Rp(u, w, r), o.push(u);
    }
  }
  return o;
}
const $p = typeof queueMicrotask > "u" ? (e) => Promise.resolve().then(e) : queueMicrotask;
function Np(e) {
  let t = e[0], n = t.length, o = Array(n);
  for (let l = 0; l < o.length; l++)
    o[l] = l;
  o.sort((l, i) => t[l] - t[i]);
  let r = [];
  for (let l = 0; l < e.length; l++) {
    let i = e[l], s = Array(n);
    for (let a = 0; a < n; a++)
      s[a] = i[o[a]];
    r.push(s);
  }
  return r;
}
function zp(e) {
  let t = e[0][0], n = t.length;
  for (let o = 1; o < e.length; o++) {
    let r = e[o][0];
    if (r.length != n)
      return !1;
    if (r != t) {
      for (let l = 0; l < n; l++)
        if (r[l] != t[l])
          return !1;
    }
  }
  return !0;
}
function Vp(e, t = 100) {
  const n = e.length;
  if (n <= 1)
    return !0;
  let o = 0, r = n - 1;
  for (; o <= r && e[o] == null; )
    o++;
  for (; r >= o && e[r] == null; )
    r--;
  if (r <= o)
    return !0;
  const l = it(1, yt((r - o + 1) / t));
  for (let i = e[o], s = o + l; s <= r; s += l) {
    const a = e[s];
    if (a != null) {
      if (a <= i)
        return !1;
      i = a;
    }
  }
  return !0;
}
const Aa = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
], ka = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
function Ca(e) {
  return e.slice(0, 3);
}
const Ip = ka.map(Ca), Fp = Aa.map(Ca), Bp = {
  MMMM: Aa,
  MMM: Fp,
  WWWW: ka,
  WWW: Ip
};
function Ko(e) {
  return (e < 10 ? "0" : "") + e;
}
function Up(e) {
  return (e < 10 ? "00" : e < 100 ? "0" : "") + e;
}
const Wp = {
  // 2019
  YYYY: (e) => e.getFullYear(),
  // 19
  YY: (e) => (e.getFullYear() + "").slice(2),
  // July
  MMMM: (e, t) => t.MMMM[e.getMonth()],
  // Jul
  MMM: (e, t) => t.MMM[e.getMonth()],
  // 07
  MM: (e) => Ko(e.getMonth() + 1),
  // 7
  M: (e) => e.getMonth() + 1,
  // 09
  DD: (e) => Ko(e.getDate()),
  // 9
  D: (e) => e.getDate(),
  // Monday
  WWWW: (e, t) => t.WWWW[e.getDay()],
  // Mon
  WWW: (e, t) => t.WWW[e.getDay()],
  // 03
  HH: (e) => Ko(e.getHours()),
  // 3
  H: (e) => e.getHours(),
  // 9 (12hr, unpadded)
  h: (e) => {
    let t = e.getHours();
    return t == 0 ? 12 : t > 12 ? t - 12 : t;
  },
  // AM
  AA: (e) => e.getHours() >= 12 ? "PM" : "AM",
  // am
  aa: (e) => e.getHours() >= 12 ? "pm" : "am",
  // a
  a: (e) => e.getHours() >= 12 ? "p" : "a",
  // 09
  mm: (e) => Ko(e.getMinutes()),
  // 9
  m: (e) => e.getMinutes(),
  // 09
  ss: (e) => Ko(e.getSeconds()),
  // 9
  s: (e) => e.getSeconds(),
  // 374
  fff: (e) => Up(e.getMilliseconds())
};
function Mi(e, t) {
  t = t || Bp;
  let n = [], o = /\{([a-z]+)\}|[^{]+/gi, r;
  for (; r = o.exec(e); )
    n.push(r[0][0] == "{" ? Wp[r[1]] : r[0]);
  return (l) => {
    let i = "";
    for (let s = 0; s < n.length; s++)
      i += typeof n[s] == "string" ? n[s] : n[s](l, t);
    return i;
  };
}
const Hp = new Intl.DateTimeFormat().resolvedOptions().timeZone;
function Gp(e, t) {
  let n;
  return t == "UTC" || t == "Etc/UTC" ? n = new Date(+e + e.getTimezoneOffset() * 6e4) : t == Hp ? n = e : (n = new Date(e.toLocaleString("en-US", { timeZone: t })), n.setMilliseconds(e.getMilliseconds())), n;
}
const _a = (e) => e % 1 == 0, Br = [1, 2, 2.5, 5], jp = cr(10, -32, 0, Br), Ea = cr(10, 0, 32, Br), Yp = Ea.filter(_a), Fn = jp.concat(Ea), $i = `
`, Pa = "{YYYY}", ac = $i + Pa, Ta = "{M}/{D}", Qo = $i + Ta, _r = Qo + "/{YY}", La = "{aa}", Kp = "{h}:{mm}", bo = Kp + La, fc = $i + bo, uc = ":{ss}", de = null;
function Da(e) {
  let t = e * 1e3, n = t * 60, o = n * 60, r = o * 24, l = r * 30, i = r * 365, a = (e == 1 ? cr(10, 0, 3, Br).filter(_a) : cr(10, -3, 0, Br)).concat([
    // minute divisors (# of secs)
    t,
    t * 5,
    t * 10,
    t * 15,
    t * 30,
    // hour divisors (# of mins)
    n,
    n * 5,
    n * 10,
    n * 15,
    n * 30,
    // day divisors (# of hrs)
    o,
    o * 2,
    o * 3,
    o * 4,
    o * 6,
    o * 8,
    o * 12,
    // month divisors TODO: need more?
    r,
    r * 2,
    r * 3,
    r * 4,
    r * 5,
    r * 6,
    r * 7,
    r * 8,
    r * 9,
    r * 10,
    r * 15,
    // year divisors (# months, approx)
    l,
    l * 2,
    l * 3,
    l * 4,
    l * 6,
    // century divisors
    i,
    i * 2,
    i * 5,
    i * 10,
    i * 25,
    i * 50,
    i * 100
  ]);
  const d = [
    //   tick incr    default          year                    month   day                   hour    min       sec   mode
    [i, Pa, de, de, de, de, de, de, 1],
    [r * 28, "{MMM}", ac, de, de, de, de, de, 1],
    [r, Ta, ac, de, de, de, de, de, 1],
    [o, "{h}" + La, _r, de, Qo, de, de, de, 1],
    [n, bo, _r, de, Qo, de, de, de, 1],
    [t, uc, _r + " " + bo, de, Qo + " " + bo, de, fc, de, 1],
    [e, uc + ".{fff}", _r + " " + bo, de, Qo + " " + bo, de, fc, de, 1]
  ];
  function p(u) {
    return (g, w, v, A, k, x) => {
      let b = [], _ = k >= i, C = k >= l && k < i, T = u(v), P = we(T * e, 3), N = zl(T.getFullYear(), _ ? 0 : T.getMonth(), C || _ ? 1 : T.getDate()), W = we(N * e, 3);
      if (C || _) {
        let G = C ? k / l : 0, H = _ ? k / i : 0, D = P == W ? P : we(zl(N.getFullYear() + H, N.getMonth() + G, 1) * e, 3), M = new Date(Ne(D / e)), V = M.getFullYear(), R = M.getMonth();
        for (let $ = 0; D <= A; $++) {
          let j = zl(V + H * $, R + G * $, 1), I = j - u(we(j * e, 3));
          D = we((+j + I) * e, 3), D <= A && b.push(D);
        }
      } else {
        let G = k >= r ? r : k, H = yt(v) - yt(P), D = W + H + el(P - W, G);
        b.push(D);
        let M = u(D), V = M.getHours() + M.getMinutes() / n + M.getSeconds() / o, R = k / o, $ = g.axes[w]._space, j = x / $;
        for (; D = we(D + k, e == 1 ? 0 : 3), !(D > A); )
          if (R > 1) {
            let I = yt(we(V + R, 6)) % 24, Q = u(D).getHours() - I;
            Q > 1 && (Q = -1), D -= Q * o, V = (V + R) % 24;
            let ne = b[b.length - 1];
            we((D - ne) / k, 3) * j >= 0.7 && b.push(D);
          } else
            b.push(D);
      }
      return b;
    };
  }
  return [
    a,
    d,
    p
  ];
}
const [qp, Jp, Zp] = Da(1), [Qp, Xp, eg] = Da(1e-3);
cr(2, -53, 53, [1]);
function dc(e, t) {
  return e.map((n) => n.map(
    (o, r) => r == 0 || r == 8 || o == null ? o : t(r == 1 || n[8] == 0 ? o : n[1] + o)
  ));
}
function hc(e, t) {
  return (n, o, r, l, i) => {
    let s = t.find((v) => i >= v[0]) || t[t.length - 1], a, d, p, u, g, w;
    return o.map((v) => {
      let A = e(v), k = A.getFullYear(), x = A.getMonth(), b = A.getDate(), _ = A.getHours(), C = A.getMinutes(), T = A.getSeconds(), P = k != a && s[2] || x != d && s[3] || b != p && s[4] || _ != u && s[5] || C != g && s[6] || T != w && s[7] || s[1];
      return a = k, d = x, p = b, u = _, g = C, w = T, P(A);
    });
  };
}
function tg(e, t) {
  let n = Mi(t);
  return (o, r, l, i, s) => r.map((a) => n(e(a)));
}
function zl(e, t, n) {
  return new Date(e, t, n);
}
function pc(e, t) {
  return t(e);
}
const ng = "{YYYY}-{MM}-{DD} {h}:{mm}{aa}";
function gc(e, t) {
  return (n, o, r, l) => l == null ? Pi : t(e(o));
}
function og(e, t) {
  let n = e.series[t];
  return n.width ? n.stroke(e, t) : n.points.width ? n.points.stroke(e, t) : null;
}
function rg(e, t) {
  return e.series[t].fill(e, t);
}
const lg = {
  show: !0,
  live: !0,
  isolate: !1,
  mount: kp,
  markers: {
    show: !0,
    width: 2,
    stroke: og,
    fill: rg,
    dash: "solid"
  },
  idx: null,
  idxs: null,
  values: []
};
function ig(e, t) {
  let n = e.cursor.points, o = Et(), r = n.size(e, t);
  Ae(o, Jo, r), Ae(o, Zo, r);
  let l = r / -2;
  Ae(o, "marginLeft", l), Ae(o, "marginTop", l);
  let i = n.width(e, t, r);
  return i && Ae(o, "borderWidth", i), o;
}
function sg(e, t) {
  let n = e.series[t].points;
  return n._fill || n._stroke;
}
function cg(e, t) {
  let n = e.series[t].points;
  return n._stroke || n._fill;
}
function ag(e, t) {
  return e.series[t].points.size;
}
const Vl = [0, 0];
function fg(e, t, n) {
  return Vl[0] = t, Vl[1] = n, Vl;
}
function Er(e, t, n, o = !0) {
  return (r) => {
    r.button == 0 && (!o || r.target == t) && n(r);
  };
}
function Il(e, t, n, o = !0) {
  return (r) => {
    (!o || r.target == t) && n(r);
  };
}
const ug = {
  show: !0,
  x: !0,
  y: !0,
  lock: !1,
  move: fg,
  points: {
    one: !1,
    show: ig,
    size: ag,
    width: 0,
    stroke: cg,
    fill: sg
  },
  bind: {
    mousedown: Er,
    mouseup: Er,
    click: Er,
    // legend clicks, not .u-over clicks
    dblclick: Er,
    mousemove: Il,
    mouseleave: Il,
    mouseenter: Il
  },
  drag: {
    setScale: !0,
    x: !0,
    y: !1,
    dist: 0,
    uni: null,
    click: (e, t) => {
      t.stopPropagation(), t.stopImmediatePropagation();
    },
    _x: !1,
    _y: !1
  },
  focus: {
    dist: (e, t, n, o, r) => o - r,
    prox: -1,
    bias: 0
  },
  hover: {
    skip: [void 0],
    prox: null,
    bias: 0
  },
  left: -10,
  top: -10,
  idx: null,
  dataIdx: null,
  idxs: null,
  event: null
}, Oa = {
  show: !0,
  stroke: "rgba(0,0,0,0.07)",
  width: 2
  //	dash: [],
}, Ni = Re({}, Oa, {
  filter: ya
}), Ra = Re({}, Ni, {
  size: 10
}), Ma = Re({}, Oa, {
  show: !1
}), zi = '12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"', $a = "bold " + zi, Na = 1.5, mc = {
  show: !0,
  scale: "x",
  stroke: Ei,
  space: 50,
  gap: 5,
  alignTo: 1,
  size: 50,
  labelGap: 0,
  labelSize: 30,
  labelFont: $a,
  side: 2,
  //	class: "x-vals",
  //	incrs: timeIncrs,
  //	values: timeVals,
  //	filter: retArg1,
  grid: Ni,
  ticks: Ra,
  border: Ma,
  font: zi,
  lineGap: Na,
  rotate: 0
}, dg = "Value", hg = "Time", wc = {
  show: !0,
  scale: "x",
  auto: !1,
  sorted: 1,
  //	label: "Time",
  //	value: v => stamp(new Date(v * 1e3)),
  // internal caches
  min: me,
  max: -me,
  idxs: []
};
function pg(e, t, n, o, r) {
  return t.map((l) => l == null ? "" : Oi(l));
}
function gg(e, t, n, o, r, l, i) {
  let s = [], a = Cn.get(r) || 0;
  n = i ? n : we(el(n, r), a);
  for (let d = n; d <= o; d = we(d + r, a))
    s.push(Object.is(d, -0) ? 0 : d);
  return s;
}
function ni(e, t, n, o, r, l, i) {
  const s = [], a = e.scales[e.axes[t].scale].log, d = a == 10 ? sn : ga, p = yt(d(n));
  r = ko(a, p), a == 10 && (r = Fn[zt(r, Fn)]);
  let u = n, g = r * a;
  a == 10 && (g = Fn[zt(g, Fn)]);
  do
    s.push(u), u = u + r, a == 10 && !Cn.has(u) && (u = we(u, Cn.get(r))), u >= g && (r = u, g = r * a, a == 10 && (g = Fn[zt(g, Fn)]));
  while (u <= o);
  return s;
}
function mg(e, t, n, o, r, l, i) {
  let a = e.scales[e.axes[t].scale].asinh, d = o > a ? ni(e, t, it(a, n), o, r) : [a], p = o >= 0 && n <= 0 ? [0] : [];
  return (n < -a ? ni(e, t, it(a, -o), -n, r) : [a]).reverse().map((g) => -g).concat(p, d);
}
const za = /./, wg = /[12357]/, yg = /[125]/, yc = /1/, oi = (e, t, n, o) => e.map((r, l) => t == 4 && r == 0 || l % o == 0 && n.test(r.toExponential()[r < 0 ? 1 : 0]) ? r : null);
function bg(e, t, n, o, r) {
  let l = e.axes[n], i = l.scale, s = e.scales[i], a = e.valToPos, d = l._space, p = a(10, i), u = a(9, i) - p >= d ? za : a(7, i) - p >= d ? wg : a(5, i) - p >= d ? yg : yc;
  if (u == yc) {
    let g = ze(a(1, i) - p);
    if (g < d)
      return oi(t.slice().reverse(), s.distr, u, Pt(d / g)).reverse();
  }
  return oi(t, s.distr, u, 1);
}
function xg(e, t, n, o, r) {
  let l = e.axes[n], i = l.scale, s = l._space, a = e.valToPos, d = ze(a(1, i) - a(2, i));
  return d < s ? oi(t.slice().reverse(), 3, za, Pt(s / d)).reverse() : t;
}
function vg(e, t, n, o) {
  return o == null ? Pi : t == null ? "" : Oi(t);
}
const bc = {
  show: !0,
  scale: "y",
  stroke: Ei,
  space: 30,
  gap: 5,
  alignTo: 1,
  size: 50,
  labelGap: 0,
  labelSize: 30,
  labelFont: $a,
  side: 3,
  //	class: "y-vals",
  //	incrs: numIncrs,
  //	values: (vals, space) => vals,
  //	filter: retArg1,
  grid: Ni,
  ticks: Ra,
  border: Ma,
  font: zi,
  lineGap: Na,
  rotate: 0
};
function Sg(e, t) {
  let n = 3 + (e || 1) * 2;
  return we(n * t, 3);
}
function Ag(e, t) {
  let { scale: n, idxs: o } = e.series[0], r = e._data[0], l = e.valToPos(r[o[0]], n, !0), i = e.valToPos(r[o[1]], n, !0), s = ze(i - l), a = e.series[t], d = s / (a.points.space * fe);
  return o[1] - o[0] <= d;
}
const xc = {
  scale: null,
  auto: !0,
  sorted: 0,
  // internal caches
  min: me,
  max: -me
}, Va = (e, t, n, o, r) => r, vc = {
  show: !0,
  auto: !0,
  sorted: 0,
  gaps: Va,
  alpha: 1,
  facets: [
    Re({}, xc, { scale: "x" }),
    Re({}, xc, { scale: "y" })
  ]
}, Sc = {
  scale: "y",
  auto: !0,
  sorted: 0,
  show: !0,
  spanGaps: !1,
  gaps: Va,
  alpha: 1,
  points: {
    show: Ag,
    filter: null
    //  paths:
    //	stroke: "#000",
    //	fill: "#fff",
    //	width: 1,
    //	size: 10,
  },
  //	label: "Value",
  //	value: v => v,
  values: null,
  // internal caches
  min: me,
  max: -me,
  idxs: [],
  path: null,
  clip: null
};
function kg(e, t, n, o, r) {
  return n / 10;
}
const Ia = {
  time: qh,
  auto: !0,
  distr: 1,
  log: 10,
  asinh: 1,
  min: null,
  max: null,
  dir: 1,
  ori: 0
}, Cg = Re({}, Ia, {
  time: !1,
  ori: 1
}), Ac = {};
function Fa(e, t) {
  let n = Ac[e];
  return n || (n = {
    key: e,
    plots: [],
    sub(o) {
      n.plots.push(o);
    },
    unsub(o) {
      n.plots = n.plots.filter((r) => r != o);
    },
    pub(o, r, l, i, s, a, d) {
      for (let p = 0; p < n.plots.length; p++)
        n.plots[p] != r && n.plots[p].pub(o, r, l, i, s, a, d);
    }
  }, e != null && (Ac[e] = n)), n;
}
const Eo = 1, ri = 2;
function Kn(e, t, n) {
  const o = e.mode, r = e.series[t], l = o == 2 ? e._data[t] : e._data, i = e.scales, s = e.bbox;
  let a = l[0], d = o == 2 ? l[1] : l[t], p = o == 2 ? i[r.facets[0].scale] : i[e.series[0].scale], u = o == 2 ? i[r.facets[1].scale] : i[r.scale], g = s.left, w = s.top, v = s.width, A = s.height, k = e.valToPosH, x = e.valToPosV;
  return p.ori == 0 ? n(
    r,
    a,
    d,
    p,
    u,
    k,
    x,
    g,
    w,
    v,
    A,
    ol,
    Ro,
    ll,
    Ua,
    Ha
  ) : n(
    r,
    a,
    d,
    p,
    u,
    x,
    k,
    w,
    g,
    A,
    v,
    rl,
    Mo,
    Fi,
    Wa,
    Ga
  );
}
function Vi(e, t) {
  let n = 0, o = 0, r = se(e.bands, Ri);
  for (let l = 0; l < r.length; l++) {
    let i = r[l];
    i.series[0] == t ? n = i.dir : i.series[1] == t && (i.dir == 1 ? o |= 1 : o |= 2);
  }
  return [
    n,
    o == 1 ? -1 : (
      // neg only
      o == 2 ? 1 : (
        // pos only
        o == 3 ? 2 : (
          // both
          0
        )
      )
    )
  ];
}
function _g(e, t, n, o, r) {
  let l = e.mode, i = e.series[t], s = l == 2 ? i.facets[1].scale : i.scale, a = e.scales[s];
  return r == -1 ? a.min : r == 1 ? a.max : a.distr == 3 ? a.dir == 1 ? a.min : a.max : 0;
}
function cn(e, t, n, o, r, l) {
  return Kn(e, t, (i, s, a, d, p, u, g, w, v, A, k) => {
    let x = i.pxRound;
    const b = d.dir * (d.ori == 0 ? 1 : -1), _ = d.ori == 0 ? Ro : Mo;
    let C, T;
    b == 1 ? (C = n, T = o) : (C = o, T = n);
    let P = x(u(s[C], d, A, w)), N = x(g(a[C], p, k, v)), W = x(u(s[T], d, A, w)), G = x(g(l == 1 ? p.max : p.min, p, k, v)), H = new Path2D(r);
    return _(H, W, G), _(H, P, G), _(H, P, N), H;
  });
}
function nl(e, t, n, o, r, l) {
  let i = null;
  if (e.length > 0) {
    i = new Path2D();
    const s = t == 0 ? ll : Fi;
    let a = n;
    for (let u = 0; u < e.length; u++) {
      let g = e[u];
      if (g[1] > g[0]) {
        let w = g[0] - a;
        w > 0 && s(i, a, o, w, o + l), a = g[1];
      }
    }
    let d = n + r - a, p = 10;
    d > 0 && s(i, a, o - p / 2, d, o + l + p);
  }
  return i;
}
function Eg(e, t, n) {
  let o = e[e.length - 1];
  o && o[0] == t ? o[1] = n : e.push([t, n]);
}
function Ii(e, t, n, o, r, l, i) {
  let s = [], a = e.length;
  for (let d = r == 1 ? n : o; d >= n && d <= o; d += r)
    if (t[d] === null) {
      let u = d, g = d;
      if (r == 1)
        for (; ++d <= o && t[d] === null; )
          g = d;
      else
        for (; --d >= n && t[d] === null; )
          g = d;
      let w = l(e[u]), v = g == u ? w : l(e[g]), A = u - r;
      w = i <= 0 && A >= 0 && A < a ? l(e[A]) : w;
      let x = g + r;
      v = i >= 0 && x >= 0 && x < a ? l(e[x]) : v, v >= w && s.push([w, v]);
    }
  return s;
}
function kc(e) {
  return e == 0 ? wa : e == 1 ? Ne : (t) => In(t, e);
}
function Ba(e) {
  let t = e == 0 ? ol : rl, n = e == 0 ? (r, l, i, s, a, d) => {
    r.arcTo(l, i, s, a, d);
  } : (r, l, i, s, a, d) => {
    r.arcTo(i, l, a, s, d);
  }, o = e == 0 ? (r, l, i, s, a) => {
    r.rect(l, i, s, a);
  } : (r, l, i, s, a) => {
    r.rect(i, l, a, s);
  };
  return (r, l, i, s, a, d = 0, p = 0) => {
    d == 0 && p == 0 ? o(r, l, i, s, a) : (d = Vt(d, s / 2, a / 2), p = Vt(p, s / 2, a / 2), t(r, l + d, i), n(r, l + s, i, l + s, i + a, d), n(r, l + s, i + a, l, i + a, p), n(r, l, i + a, l, i, p), n(r, l, i, l + s, i, d), r.closePath());
  };
}
const ol = (e, t, n) => {
  e.moveTo(t, n);
}, rl = (e, t, n) => {
  e.moveTo(n, t);
}, Ro = (e, t, n) => {
  e.lineTo(t, n);
}, Mo = (e, t, n) => {
  e.lineTo(n, t);
}, ll = Ba(0), Fi = Ba(1), Ua = (e, t, n, o, r, l) => {
  e.arc(t, n, o, r, l);
}, Wa = (e, t, n, o, r, l) => {
  e.arc(n, t, o, r, l);
}, Ha = (e, t, n, o, r, l, i) => {
  e.bezierCurveTo(t, n, o, r, l, i);
}, Ga = (e, t, n, o, r, l, i) => {
  e.bezierCurveTo(n, t, r, o, i, l);
};
function ja(e) {
  return (t, n, o, r, l) => Kn(t, n, (i, s, a, d, p, u, g, w, v, A, k) => {
    let { pxRound: x, points: b } = i, _, C;
    d.ori == 0 ? (_ = ol, C = Ua) : (_ = rl, C = Wa);
    const T = we(b.width * fe, 3);
    let P = (b.size - b.width) / 2 * fe, N = we(P * 2, 3), W = new Path2D(), G = new Path2D(), { left: H, top: D, width: M, height: V } = t.bbox;
    ll(
      G,
      H - N,
      D - N,
      M + N * 2,
      V + N * 2
    );
    const R = ($) => {
      if (a[$] != null) {
        let j = x(u(s[$], d, A, w)), I = x(g(a[$], p, k, v));
        _(W, j + P, I), C(W, j, I, P, 0, Tr * 2);
      }
    };
    if (l)
      l.forEach(R);
    else
      for (let $ = o; $ <= r; $++)
        R($);
    return {
      stroke: T > 0 ? W : null,
      fill: W,
      clip: G,
      flags: Eo | ri
    };
  });
}
function Ya(e) {
  return (t, n, o, r, l, i) => {
    o != r && (l != o && i != o && e(t, n, o), l != r && i != r && e(t, n, r), e(t, n, i));
  };
}
const Pg = Ya(Ro), Tg = Ya(Mo);
function Ka(e) {
  const t = se(e?.alignGaps, 0);
  return (n, o, r, l) => Kn(n, o, (i, s, a, d, p, u, g, w, v, A, k) => {
    [r, l] = Qr(a, r, l);
    let x = i.pxRound, b = (V) => x(u(V, d, A, w)), _ = (V) => x(g(V, p, k, v)), C, T;
    d.ori == 0 ? (C = Ro, T = Pg) : (C = Mo, T = Tg);
    const P = d.dir * (d.ori == 0 ? 1 : -1), N = { stroke: new Path2D(), fill: null, clip: null, band: null, gaps: null, flags: Eo }, W = N.stroke;
    let G = !1;
    if (l - r >= A * 4) {
      let V = (Y) => n.posToVal(Y, d.key, !0), R = null, $ = null, j, I, he, X = b(s[P == 1 ? r : l]), Q = b(s[r]), ne = b(s[l]), oe = V(P == 1 ? Q + 1 : ne - 1);
      for (let Y = P == 1 ? r : l; Y >= r && Y <= l; Y += P) {
        let Me = s[Y], ke = (P == 1 ? Me < oe : Me > oe) ? X : b(Me), ue = a[Y];
        ke == X ? ue != null ? (I = ue, R == null ? (C(W, ke, _(I)), j = R = $ = I) : I < R ? R = I : I > $ && ($ = I)) : ue === null && (G = !0) : (R != null && T(W, X, _(R), _($), _(j), _(I)), ue != null ? (I = ue, C(W, ke, _(I)), R = $ = j = I) : (R = $ = null, ue === null && (G = !0)), X = ke, oe = V(X + P));
      }
      R != null && R != $ && he != X && T(W, X, _(R), _($), _(j), _(I));
    } else
      for (let V = P == 1 ? r : l; V >= r && V <= l; V += P) {
        let R = a[V];
        R === null ? G = !0 : R != null && C(W, b(s[V]), _(R));
      }
    let [D, M] = Vi(n, o);
    if (i.fill != null || D != 0) {
      let V = N.fill = new Path2D(W), R = i.fillTo(n, o, i.min, i.max, D), $ = _(R), j = b(s[r]), I = b(s[l]);
      P == -1 && ([I, j] = [j, I]), C(V, I, $), C(V, j, $);
    }
    if (!i.spanGaps) {
      let V = [];
      G && V.push(...Ii(s, a, r, l, P, b, t)), N.gaps = V = i.gaps(n, o, r, l, V), N.clip = nl(V, d.ori, w, v, A, k);
    }
    return M != 0 && (N.band = M == 2 ? [
      cn(n, o, r, l, W, -1),
      cn(n, o, r, l, W, 1)
    ] : cn(n, o, r, l, W, M)), N;
  });
}
function Lg(e) {
  const t = se(e.align, 1), n = se(e.ascDesc, !1), o = se(e.alignGaps, 0), r = se(e.extend, !1);
  return (l, i, s, a) => Kn(l, i, (d, p, u, g, w, v, A, k, x, b, _) => {
    [s, a] = Qr(u, s, a);
    let C = d.pxRound, { left: T, width: P } = l.bbox, N = (Q) => C(v(Q, g, b, k)), W = (Q) => C(A(Q, w, _, x)), G = g.ori == 0 ? Ro : Mo;
    const H = { stroke: new Path2D(), fill: null, clip: null, band: null, gaps: null, flags: Eo }, D = H.stroke, M = g.dir * (g.ori == 0 ? 1 : -1);
    let V = W(u[M == 1 ? s : a]), R = N(p[M == 1 ? s : a]), $ = R, j = R;
    r && t == -1 && (j = T, G(D, j, V)), G(D, R, V);
    for (let Q = M == 1 ? s : a; Q >= s && Q <= a; Q += M) {
      let ne = u[Q];
      if (ne == null)
        continue;
      let oe = N(p[Q]), Y = W(ne);
      t == 1 ? G(D, oe, V) : G(D, $, Y), G(D, oe, Y), V = Y, $ = oe;
    }
    let I = $;
    r && t == 1 && (I = T + P, G(D, I, V));
    let [he, X] = Vi(l, i);
    if (d.fill != null || he != 0) {
      let Q = H.fill = new Path2D(D), ne = d.fillTo(l, i, d.min, d.max, he), oe = W(ne);
      G(Q, I, oe), G(Q, j, oe);
    }
    if (!d.spanGaps) {
      let Q = [];
      Q.push(...Ii(p, u, s, a, M, N, o));
      let ne = d.width * fe / 2, oe = n || t == 1 ? ne : -ne, Y = n || t == -1 ? -ne : ne;
      Q.forEach((Me) => {
        Me[0] += oe, Me[1] += Y;
      }), H.gaps = Q = d.gaps(l, i, s, a, Q), H.clip = nl(Q, g.ori, k, x, b, _);
    }
    return X != 0 && (H.band = X == 2 ? [
      cn(l, i, s, a, D, -1),
      cn(l, i, s, a, D, 1)
    ] : cn(l, i, s, a, D, X)), H;
  });
}
function Cc(e, t, n, o, r, l, i = me) {
  if (e.length > 1) {
    let s = null;
    for (let a = 0, d = 1 / 0; a < e.length; a++)
      if (t[a] !== void 0) {
        if (s != null) {
          let p = ze(e[a] - e[s]);
          p < d && (d = p, i = ze(n(e[a], o, r, l) - n(e[s], o, r, l)));
        }
        s = a;
      }
  }
  return i;
}
function Dg(e) {
  e = e || er;
  const t = se(e.size, [0.6, me, 1]), n = e.align || 0, o = e.gap || 0;
  let r = e.radius;
  r = // [valueRadius, baselineRadius]
  r == null ? [0, 0] : typeof r == "number" ? [r, 0] : r;
  const l = le(r), i = 1 - t[0], s = se(t[1], me), a = se(t[2], 1), d = se(e.disp, er), p = se(e.each, (w) => {
  }), { fill: u, stroke: g } = d;
  return (w, v, A, k) => Kn(w, v, (x, b, _, C, T, P, N, W, G, H, D) => {
    let M = x.pxRound, V = n, R = o * fe, $ = s * fe, j = a * fe, I, he;
    C.ori == 0 ? [I, he] = l(w, v) : [he, I] = l(w, v);
    const X = C.dir * (C.ori == 0 ? 1 : -1);
    let Q = C.ori == 0 ? ll : Fi, ne = C.ori == 0 ? p : (B, ye, $e, Qn, Tn, Ut, Ln) => {
      p(B, ye, $e, Tn, Qn, Ln, Ut);
    }, oe = se(w.bands, Ri).find((B) => B.series[0] == v), Y = oe != null ? oe.dir : 0, Me = x.fillTo(w, v, x.min, x.max, Y), tt = M(N(Me, T, D, G)), ke, ue, Dt, at = H, Ee = M(x.width * fe), Bt = !1, en = null, vt = null, dn = null, qn = null;
    u != null && (Ee == 0 || g != null) && (Bt = !0, en = u.values(w, v, A, k), vt = /* @__PURE__ */ new Map(), new Set(en).forEach((B) => {
      B != null && vt.set(B, new Path2D());
    }), Ee > 0 && (dn = g.values(w, v, A, k), qn = /* @__PURE__ */ new Map(), new Set(dn).forEach((B) => {
      B != null && qn.set(B, new Path2D());
    })));
    let { x0: Jn, size: $o } = d;
    if (Jn != null && $o != null) {
      V = 1, b = Jn.values(w, v, A, k), Jn.unit == 2 && (b = b.map(($e) => w.posToVal(W + $e * H, C.key, !0)));
      let B = $o.values(w, v, A, k);
      $o.unit == 2 ? ue = B[0] * H : ue = P(B[0], C, H, W) - P(0, C, H, W), at = Cc(b, _, P, C, H, W, at), Dt = at - ue + R;
    } else
      at = Cc(b, _, P, C, H, W, at), Dt = at * i + R, ue = at - Dt;
    Dt < 1 && (Dt = 0), Ee >= ue / 2 && (Ee = 0), Dt < 5 && (M = wa);
    let dr = Dt > 0, En = at - Dt - (dr ? Ee : 0);
    ue = M(ti(En, j, $)), ke = (V == 0 ? ue / 2 : V == X ? 0 : ue) - V * X * ((V == 0 ? R / 2 : 0) + (dr ? Ee / 2 : 0));
    const nt = { stroke: null, fill: null, clip: null, band: null, gaps: null, flags: 0 }, Zn = Bt ? null : new Path2D();
    let tn = null;
    if (oe != null)
      tn = w.data[oe.series[1]];
    else {
      let { y0: B, y1: ye } = d;
      B != null && ye != null && (_ = ye.values(w, v, A, k), tn = B.values(w, v, A, k));
    }
    let Pn = I * ue, ee = he * ue;
    for (let B = X == 1 ? A : k; B >= A && B <= k; B += X) {
      let ye = _[B];
      if (ye == null)
        continue;
      if (tn != null) {
        let st = tn[B] ?? 0;
        if (ye - st == 0)
          continue;
        tt = N(st, T, D, G);
      }
      let $e = C.distr != 2 || d != null ? b[B] : B, Qn = P($e, C, H, W), Tn = N(se(ye, Me), T, D, G), Ut = M(Qn - ke), Ln = M(it(Tn, tt)), ft = M(Vt(Tn, tt)), St = Ln - ft;
      if (ye != null) {
        let st = ye < 0 ? ee : Pn, Ot = ye < 0 ? Pn : ee;
        Bt ? (Ee > 0 && dn[B] != null && Q(qn.get(dn[B]), Ut, ft + yt(Ee / 2), ue, it(0, St - Ee), st, Ot), en[B] != null && Q(vt.get(en[B]), Ut, ft + yt(Ee / 2), ue, it(0, St - Ee), st, Ot)) : Q(Zn, Ut, ft + yt(Ee / 2), ue, it(0, St - Ee), st, Ot), ne(
          w,
          v,
          B,
          Ut - Ee / 2,
          ft,
          ue + Ee,
          St
        );
      }
    }
    return Ee > 0 ? nt.stroke = Bt ? qn : Zn : Bt || (nt._fill = x.width == 0 ? x._fill : x._stroke ?? x._fill, nt.width = 0), nt.fill = Bt ? vt : Zn, nt;
  });
}
function Og(e, t) {
  const n = se(t?.alignGaps, 0);
  return (o, r, l, i) => Kn(o, r, (s, a, d, p, u, g, w, v, A, k, x) => {
    [l, i] = Qr(d, l, i);
    let b = s.pxRound, _ = (I) => b(g(I, p, k, v)), C = (I) => b(w(I, u, x, A)), T, P, N;
    p.ori == 0 ? (T = ol, N = Ro, P = Ha) : (T = rl, N = Mo, P = Ga);
    const W = p.dir * (p.ori == 0 ? 1 : -1);
    let G = _(a[W == 1 ? l : i]), H = G, D = [], M = [];
    for (let I = W == 1 ? l : i; I >= l && I <= i; I += W)
      if (d[I] != null) {
        let X = a[I], Q = _(X);
        D.push(H = Q), M.push(C(d[I]));
      }
    const V = { stroke: e(D, M, T, N, P, b), fill: null, clip: null, band: null, gaps: null, flags: Eo }, R = V.stroke;
    let [$, j] = Vi(o, r);
    if (s.fill != null || $ != 0) {
      let I = V.fill = new Path2D(R), he = s.fillTo(o, r, s.min, s.max, $), X = C(he);
      N(I, H, X), N(I, G, X);
    }
    if (!s.spanGaps) {
      let I = [];
      I.push(...Ii(a, d, l, i, W, _, n)), V.gaps = I = s.gaps(o, r, l, i, I), V.clip = nl(I, p.ori, v, A, k, x);
    }
    return j != 0 && (V.band = j == 2 ? [
      cn(o, r, l, i, R, -1),
      cn(o, r, l, i, R, 1)
    ] : cn(o, r, l, i, R, j)), V;
  });
}
function Rg(e) {
  return Og(Mg, e);
}
function Mg(e, t, n, o, r, l) {
  const i = e.length;
  if (i < 2)
    return null;
  const s = new Path2D();
  if (n(s, e[0], t[0]), i == 2)
    o(s, e[1], t[1]);
  else {
    let a = Array(i), d = Array(i - 1), p = Array(i - 1), u = Array(i - 1);
    for (let g = 0; g < i - 1; g++)
      p[g] = t[g + 1] - t[g], u[g] = e[g + 1] - e[g], d[g] = p[g] / u[g];
    a[0] = d[0];
    for (let g = 1; g < i - 1; g++)
      d[g] === 0 || d[g - 1] === 0 || d[g - 1] > 0 != d[g] > 0 ? a[g] = 0 : (a[g] = 3 * (u[g - 1] + u[g]) / ((2 * u[g] + u[g - 1]) / d[g - 1] + (u[g] + 2 * u[g - 1]) / d[g]), isFinite(a[g]) || (a[g] = 0));
    a[i - 1] = d[i - 2];
    for (let g = 0; g < i - 1; g++)
      r(
        s,
        e[g] + u[g] / 3,
        t[g] + a[g] * u[g] / 3,
        e[g + 1] - u[g] / 3,
        t[g + 1] - a[g + 1] * u[g] / 3,
        e[g + 1],
        t[g + 1]
      );
  }
  return s;
}
const li = /* @__PURE__ */ new Set();
function _c() {
  for (let e of li)
    e.syncRect(!0);
}
Oo && (Wn(pp, So, _c), Wn(gp, So, _c, !0), Wn(Ir, So, () => {
  et.pxRatio = fe;
}));
const $g = Ka(), Ng = ja();
function Ec(e, t, n, o) {
  return (o ? [e[0], e[1]].concat(e.slice(2)) : [e[0]].concat(e.slice(1))).map((l, i) => ii(l, i, t, n));
}
function zg(e, t) {
  return e.map((n, o) => o == 0 ? {} : Re({}, t, n));
}
function ii(e, t, n, o) {
  return Re({}, t == 0 ? n : o, e);
}
function qa(e, t, n) {
  return t == null ? Co : [t, n];
}
const Vg = qa;
function Ig(e, t, n) {
  return t == null ? Co : Fr(t, n, Di, !0);
}
function Ja(e, t, n, o) {
  return t == null ? Co : Xr(t, n, e.scales[o].log, !1);
}
const Fg = Ja;
function Za(e, t, n, o) {
  return t == null ? Co : Li(t, n, e.scales[o].log, !1);
}
const Bg = Za;
function Ug(e, t, n, o, r) {
  let l = it(lc(e), lc(t)), i = t - e, s = zt(r / o * i, n);
  do {
    let a = n[s], d = o * a / i;
    if (d >= r && l + (a < 5 ? Cn.get(a) : 0) <= 17)
      return [a, d];
  } while (++s < n.length);
  return [0, 0];
}
function Pc(e) {
  let t, n;
  return e = e.replace(/(\d+)px/, (o, r) => (t = Ne((n = +r) * fe)) + "px"), [e, t, n];
}
function Wg(e) {
  e.show && [e.font, e.labelFont].forEach((t) => {
    let n = we(t[2] * fe, 1);
    t[0] = t[0].replace(/[0-9.]+px/, n + "px"), t[1] = n;
  });
}
function et(e, t, n) {
  const o = {
    mode: se(e.mode, 1)
  }, r = o.mode;
  function l(c, f, h, m) {
    let y = f.valToPct(c);
    return m + h * (f.dir == -1 ? 1 - y : y);
  }
  function i(c, f, h, m) {
    let y = f.valToPct(c);
    return m + h * (f.dir == -1 ? y : 1 - y);
  }
  function s(c, f, h, m) {
    return f.ori == 0 ? l(c, f, h, m) : i(c, f, h, m);
  }
  o.valToPosH = l, o.valToPosV = i;
  let a = !1;
  o.status = 0;
  const d = o.root = Et(Jh);
  if (e.id != null && (d.id = e.id), gt(d, e.class), e.title) {
    let c = Et(Xh, d);
    c.textContent = e.title;
  }
  const p = Nt("canvas"), u = o.ctx = p.getContext("2d"), g = Et(ep, d);
  Wn("click", g, (c) => {
    c.target === v && (be != ao || Ce != fo) && je.click(o, c);
  }, !0);
  const w = o.under = Et(tp, g);
  g.appendChild(p);
  const v = o.over = Et(np, g);
  e = _o(e);
  const A = +se(e.pxAlign, 1), k = kc(A);
  (e.plugins || []).forEach((c) => {
    c.opts && (e = c.opts(o, e) || e);
  });
  const x = e.ms || 1e-3, b = o.series = r == 1 ? Ec(e.series || [], wc, Sc, !1) : zg(e.series || [null], vc), _ = o.axes = Ec(e.axes || [], mc, bc, !0), C = o.scales = {}, T = o.bands = e.bands || [];
  T.forEach((c) => {
    c.fill = le(c.fill || null), c.dir = se(c.dir, -1);
  });
  const P = r == 2 ? b[1].facets[0].scale : b[0].scale, N = {
    axes: pf,
    series: af
  }, W = (e.drawOrder || ["axes", "series"]).map((c) => N[c]);
  function G(c) {
    const f = c.distr == 3 ? (h) => sn(h > 0 ? h : c.clamp(o, h, c.min, c.max, c.key)) : c.distr == 4 ? (h) => Nl(h, c.asinh) : c.distr == 100 ? (h) => c.fwd(h) : (h) => h;
    return (h) => {
      let m = f(h), { _min: y, _max: S } = c, E = S - y;
      return (m - y) / E;
    };
  }
  function H(c) {
    let f = C[c];
    if (f == null) {
      let h = (e.scales || er)[c] || er;
      if (h.from != null) {
        H(h.from);
        let m = Re({}, C[h.from], h, { key: c });
        m.valToPct = G(m), C[c] = m;
      } else {
        f = C[c] = Re({}, c == P ? Ia : Cg, h), f.key = c;
        let m = f.time, y = f.range, S = xn(y);
        if ((c != P || r == 2 && !m) && (S && (y[0] == null || y[1] == null) && (y = {
          min: y[0] == null ? nc : {
            mode: 1,
            hard: y[0],
            soft: y[0]
          },
          max: y[1] == null ? nc : {
            mode: 1,
            hard: y[1],
            soft: y[1]
          }
        }, S = !1), !S && tl(y))) {
          let E = y;
          y = (L, O, z) => O == null ? Co : Fr(O, z, E);
        }
        f.range = le(y || (m ? Vg : c == P ? f.distr == 3 ? Fg : f.distr == 4 ? Bg : qa : f.distr == 3 ? Ja : f.distr == 4 ? Za : Ig)), f.auto = le(S ? !1 : f.auto), f.clamp = le(f.clamp || kg), f._min = f._max = null, f.valToPct = G(f);
      }
    }
  }
  H("x"), H("y"), r == 1 && b.forEach((c) => {
    H(c.scale);
  }), _.forEach((c) => {
    H(c.scale);
  });
  for (let c in e.scales)
    H(c);
  const D = C[P], M = D.distr;
  let V, R;
  D.ori == 0 ? (gt(d, Zh), V = l, R = i) : (gt(d, Qh), V = i, R = l);
  const $ = {};
  for (let c in C) {
    let f = C[c];
    (f.min != null || f.max != null) && ($[c] = { min: f.min, max: f.max }, f.min = f.max = null);
  }
  const j = e.tzDate || ((c) => new Date(Ne(c / x))), I = e.fmtDate || Mi, he = x == 1 ? Zp(j) : eg(j), X = hc(j, dc(x == 1 ? Jp : Xp, I)), Q = gc(j, pc(ng, I)), ne = [], oe = o.legend = Re({}, lg, e.legend), Y = o.cursor = Re({}, ug, { drag: { y: r == 2 } }, e.cursor), Me = oe.show, tt = Y.show, ke = oe.markers;
  oe.idxs = ne, ke.width = le(ke.width), ke.dash = le(ke.dash), ke.stroke = le(ke.stroke), ke.fill = le(ke.fill);
  let ue, Dt, at, Ee = [], Bt = [], en, vt = !1, dn = {};
  if (oe.live) {
    const c = b[1] ? b[1].values : null;
    vt = c != null, en = vt ? c(o, 1, 0) : { _: 0 };
    for (let f in en)
      dn[f] = Pi;
  }
  if (Me)
    if (ue = Nt("table", cp, d), at = Nt("tbody", null, ue), oe.mount(o, ue), vt) {
      Dt = Nt("thead", null, ue, at);
      let c = Nt("tr", null, Dt);
      Nt("th", null, c);
      for (var qn in en)
        Nt("th", Ws, c).textContent = qn;
    } else
      gt(ue, fp), oe.live && gt(ue, ap);
  const Jn = { show: !0 }, $o = { show: !1 };
  function dr(c, f) {
    if (f == 0 && (vt || !oe.live || r == 2))
      return Co;
    let h = [], m = Nt("tr", up, at, at.childNodes[f]);
    gt(m, c.class), c.show || gt(m, Bn);
    let y = Nt("th", null, m);
    if (ke.show) {
      let L = Et(dp, y);
      if (f > 0) {
        let O = ke.width(o, f);
        O && (L.style.border = O + "px " + ke.dash(o, f) + " " + ke.stroke(o, f)), L.style.background = ke.fill(o, f);
      }
    }
    let S = Et(Ws, y);
    c.label instanceof HTMLElement ? S.appendChild(c.label) : S.textContent = c.label, f > 0 && (ke.show || (S.style.color = c.width > 0 ? ke.stroke(o, f) : ke.fill(o, f)), nt("click", y, (L) => {
      if (Y._lock)
        return;
      On(L);
      let O = b.indexOf(c);
      if ((L.ctrlKey || L.metaKey) != oe.isolate) {
        let z = b.some((F, U) => U > 0 && U != O && F.show);
        b.forEach((F, U) => {
          U > 0 && Ht(U, z ? U == O ? Jn : $o : Jn, !0, Oe.setSeries);
        });
      } else
        Ht(O, { show: !c.show }, !0, Oe.setSeries);
    }, !1), eo && nt(Ys, y, (L) => {
      Y._lock || (On(L), Ht(b.indexOf(c), ho, !0, Oe.setSeries));
    }, !1));
    for (var E in en) {
      let L = Nt("td", hp, m);
      L.textContent = "--", h.push(L);
    }
    return [m, h];
  }
  const En = /* @__PURE__ */ new Map();
  function nt(c, f, h, m = !0) {
    const y = En.get(f) || {}, S = Y.bind[c](o, f, h, m);
    S && (Wn(c, f, y[c] = S), En.set(f, y));
  }
  function Zn(c, f, h) {
    const m = En.get(f) || {};
    for (let y in m)
      (c == null || y == c) && (ei(y, f, m[y]), delete m[y]);
    c == null && En.delete(f);
  }
  let tn = 0, Pn = 0, ee = 0, B = 0, ye = 0, $e = 0, Qn = ye, Tn = $e, Ut = ee, Ln = B, ft = 0, St = 0, st = 0, Ot = 0;
  o.bbox = {};
  let il = !1, hr = !1, Xn = !1, Dn = !1, pr = !1, At = !1;
  function sl(c, f, h) {
    (h || c != o.width || f != o.height) && Ui(c, f), lo(!1), Xn = !0, hr = !0, io();
  }
  function Ui(c, f) {
    o.width = tn = ee = c, o.height = Pn = B = f, ye = $e = 0, tf(), nf();
    let h = o.bbox;
    ft = h.left = In(ye * fe, 0.5), St = h.top = In($e * fe, 0.5), st = h.width = In(ee * fe, 0.5), Ot = h.height = In(B * fe, 0.5);
  }
  const Qa = 3;
  function Xa() {
    let c = !1, f = 0;
    for (; !c; ) {
      f++;
      let h = df(f), m = hf(f);
      c = f == Qa || h && m, c || (Ui(o.width, o.height), hr = !0);
    }
  }
  function ef({ width: c, height: f }) {
    sl(c, f);
  }
  o.setSize = ef;
  function tf() {
    let c = !1, f = !1, h = !1, m = !1;
    _.forEach((y, S) => {
      if (y.show && y._show) {
        let { side: E, _size: L } = y, O = E % 2, z = y.label != null ? y.labelSize : 0, F = L + z;
        F > 0 && (O ? (ee -= F, E == 3 ? (ye += F, m = !0) : h = !0) : (B -= F, E == 0 ? ($e += F, c = !0) : f = !0));
      }
    }), Rn[0] = c, Rn[1] = h, Rn[2] = f, Rn[3] = m, ee -= hn[1] + hn[3], ye += hn[3], B -= hn[2] + hn[0], $e += hn[0];
  }
  function nf() {
    let c = ye + ee, f = $e + B, h = ye, m = $e;
    function y(S, E) {
      switch (S) {
        case 1:
          return c += E, c - E;
        case 2:
          return f += E, f - E;
        case 3:
          return h -= E, h + E;
        case 0:
          return m -= E, m + E;
      }
    }
    _.forEach((S, E) => {
      if (S.show && S._show) {
        let L = S.side;
        S._pos = y(L, S._size), S.label != null && (S._lpos = y(L, S.labelSize));
      }
    });
  }
  if (Y.dataIdx == null) {
    let c = Y.hover, f = c.skip = new Set(c.skip ?? []);
    f.add(void 0);
    let h = c.prox = le(c.prox), m = c.bias ??= 0;
    Y.dataIdx = (y, S, E, L) => {
      if (S == 0)
        return E;
      let O = E, z = h(y, S, E, L) ?? me, F = z >= 0 && z < me, U = D.ori == 0 ? ee : B, Z = Y.left, ae = t[0], ie = t[S];
      if (f.has(ie[E])) {
        O = null;
        let re = null, q = null, K;
        if (m == 0 || m == -1)
          for (K = E; re == null && K-- > 0; )
            f.has(ie[K]) || (re = K);
        if (m == 0 || m == 1)
          for (K = E; q == null && K++ < ie.length; )
            f.has(ie[K]) || (q = K);
        if (re != null || q != null)
          if (F) {
            let ve = re == null ? -1 / 0 : V(ae[re], D, U, 0), Te = q == null ? 1 / 0 : V(ae[q], D, U, 0), He = Z - ve, pe = Te - Z;
            He <= pe ? He <= z && (O = re) : pe <= z && (O = q);
          } else
            O = q == null ? re : re == null ? q : E - re <= q - E ? re : q;
      } else F && ze(Z - V(ae[E], D, U, 0)) > z && (O = null);
      return O;
    };
  }
  const On = (c) => {
    Y.event = c;
  };
  Y.idxs = ne, Y._lock = !1;
  let Je = Y.points;
  Je.show = le(Je.show), Je.size = le(Je.size), Je.stroke = le(Je.stroke), Je.width = le(Je.width), Je.fill = le(Je.fill);
  const Wt = o.focus = Re({}, e.focus || { alpha: 0.3 }, Y.focus), eo = Wt.prox >= 0, to = eo && Je.one;
  let kt = [], no = [], oo = [];
  function Wi(c, f) {
    let h = Je.show(o, f);
    if (h instanceof HTMLElement)
      return gt(h, sp), gt(h, c.class), Kt(h, -10, -10, ee, B), v.insertBefore(h, kt[f]), h;
  }
  function Hi(c, f) {
    if (r == 1 || f > 0) {
      let h = r == 1 && C[c.scale].time, m = c.value;
      c.value = h ? cc(m) ? gc(j, pc(m, I)) : m || Q : m || vg, c.label = c.label || (h ? hg : dg);
    }
    if (to || f > 0) {
      c.width = c.width == null ? 1 : c.width, c.paths = c.paths || $g || Cp, c.fillTo = le(c.fillTo || _g), c.pxAlign = +se(c.pxAlign, A), c.pxRound = kc(c.pxAlign), c.stroke = le(c.stroke || null), c.fill = le(c.fill || null), c._stroke = c._fill = c._paths = c._focus = null;
      let h = Sg(it(1, c.width), 1), m = c.points = Re({}, {
        size: h,
        width: it(1, h * 0.2),
        stroke: c.stroke,
        space: h * 2,
        paths: Ng,
        _stroke: null,
        _fill: null
      }, c.points);
      m.show = le(m.show), m.filter = le(m.filter), m.fill = le(m.fill), m.stroke = le(m.stroke), m.paths = le(m.paths), m.pxAlign = c.pxAlign;
    }
    if (Me) {
      let h = dr(c, f);
      Ee.splice(f, 0, h[0]), Bt.splice(f, 0, h[1]), oe.values.push(null);
    }
    if (tt) {
      ne.splice(f, 0, null);
      let h = null;
      to ? f == 0 && (h = Wi(c, f)) : f > 0 && (h = Wi(c, f)), kt.splice(f, 0, h), no.splice(f, 0, 0), oo.splice(f, 0, 0);
    }
    We("addSeries", f);
  }
  function of(c, f) {
    f = f ?? b.length, c = r == 1 ? ii(c, f, wc, Sc) : ii(c, f, {}, vc), b.splice(f, 0, c), Hi(b[f], f);
  }
  o.addSeries = of;
  function rf(c) {
    if (b.splice(c, 1), Me) {
      oe.values.splice(c, 1), Bt.splice(c, 1);
      let f = Ee.splice(c, 1)[0];
      Zn(null, f.firstChild), f.remove();
    }
    tt && (ne.splice(c, 1), kt.splice(c, 1)[0].remove(), no.splice(c, 1), oo.splice(c, 1)), We("delSeries", c);
  }
  o.delSeries = rf;
  const Rn = [!1, !1, !1, !1];
  function lf(c, f) {
    if (c._show = c.show, c.show) {
      let h = c.side % 2, m = C[c.scale];
      m == null && (c.scale = h ? b[1].scale : P, m = C[c.scale]);
      let y = m.time;
      c.size = le(c.size), c.space = le(c.space), c.rotate = le(c.rotate), xn(c.incrs) && c.incrs.forEach((E) => {
        !Cn.has(E) && Cn.set(E, xa(E));
      }), c.incrs = le(c.incrs || (m.distr == 2 ? Yp : y ? x == 1 ? qp : Qp : Fn)), c.splits = le(c.splits || (y && m.distr == 1 ? he : m.distr == 3 ? ni : m.distr == 4 ? mg : gg)), c.stroke = le(c.stroke), c.grid.stroke = le(c.grid.stroke), c.ticks.stroke = le(c.ticks.stroke), c.border.stroke = le(c.border.stroke);
      let S = c.values;
      c.values = // static array of tick values
      xn(S) && !xn(S[0]) ? le(S) : (
        // temporal
        y ? (
          // config array of fmtDate string tpls
          xn(S) ? hc(j, dc(S, I)) : (
            // fmtDate string tpl
            cc(S) ? tg(j, S) : S || X
          )
        ) : S || pg
      ), c.filter = le(c.filter || (m.distr >= 3 && m.log == 10 ? bg : m.distr == 3 && m.log == 2 ? xg : ya)), c.font = Pc(c.font), c.labelFont = Pc(c.labelFont), c._size = c.size(o, null, f, 0), c._space = c._rotate = c._incrs = c._found = // foundIncrSpace
      c._splits = c._values = null, c._size > 0 && (Rn[f] = !0, c._el = Et(op, g));
    }
  }
  function No(c, f, h, m) {
    let [y, S, E, L] = h, O = f % 2, z = 0;
    return O == 0 && (L || S) && (z = f == 0 && !y || f == 2 && !E ? Ne(mc.size / 3) : 0), O == 1 && (y || E) && (z = f == 1 && !S || f == 3 && !L ? Ne(bc.size / 2) : 0), z;
  }
  const Gi = o.padding = (e.padding || [No, No, No, No]).map((c) => le(se(c, No))), hn = o._padding = Gi.map((c, f) => c(o, f, Rn, 0));
  let Ge, Ie = null, Fe = null;
  const gr = r == 1 ? b[0].idxs : null;
  let Rt = null, zo = !1;
  function ji(c, f) {
    if (t = c ?? [], o.data = o._data = t, r == 2) {
      Ge = 0;
      for (let h = 1; h < b.length; h++)
        Ge += t[h][0].length;
    } else {
      t.length == 0 && (o.data = o._data = t = [[]]), Rt = t[0], Ge = Rt.length;
      let h = t;
      if (M == 2) {
        h = t.slice();
        let m = h[0] = Array(Ge);
        for (let y = 0; y < Ge; y++)
          m[y] = y;
      }
      o._data = t = h;
    }
    if (lo(!0), We("setData"), M == 2 && (Xn = !0), f !== !1) {
      let h = D;
      h.auto(o, zo) ? cl() : gn(P, h.min, h.max), Dn = Dn || Y.left >= 0, At = !0, io();
    }
  }
  o.setData = ji;
  function cl() {
    zo = !0;
    let c, f;
    r == 1 && (Ge > 0 ? (Ie = gr[0] = 0, Fe = gr[1] = Ge - 1, c = t[0][Ie], f = t[0][Fe], M == 2 ? (c = Ie, f = Fe) : c == f && (M == 3 ? [c, f] = Xr(c, c, D.log, !1) : M == 4 ? [c, f] = Li(c, c, D.log, !1) : D.time ? f = c + Ne(86400 / x) : [c, f] = Fr(c, f, Di, !0))) : (Ie = gr[0] = c = null, Fe = gr[1] = f = null)), gn(P, c, f);
  }
  let mr, ro, al, fl, ul, dl, hl, pl, gl, ct;
  function Yi(c, f, h, m, y, S) {
    c ??= Gs, h ??= Ri, m ??= "butt", y ??= Gs, S ??= "round", c != mr && (u.strokeStyle = mr = c), y != ro && (u.fillStyle = ro = y), f != al && (u.lineWidth = al = f), S != ul && (u.lineJoin = ul = S), m != dl && (u.lineCap = dl = m), h != fl && u.setLineDash(fl = h);
  }
  function Ki(c, f, h, m) {
    f != ro && (u.fillStyle = ro = f), c != hl && (u.font = hl = c), h != pl && (u.textAlign = pl = h), m != gl && (u.textBaseline = gl = m);
  }
  function ml(c, f, h, m, y = 0) {
    if (m.length > 0 && c.auto(o, zo) && (f == null || f.min == null)) {
      let S = se(Ie, 0), E = se(Fe, m.length - 1), L = h.min == null ? bp(m, S, E, y, c.distr == 3) : [h.min, h.max];
      c.min = Vt(c.min, h.min = L[0]), c.max = it(c.max, h.max = L[1]);
    }
  }
  const qi = { min: null, max: null };
  function sf() {
    for (let m in C) {
      let y = C[m];
      $[m] == null && // scales that have never been set (on init)
      (y.min == null || // or auto scales when the x scale was explicitly set
      $[P] != null && y.auto(o, zo)) && ($[m] = qi);
    }
    for (let m in C) {
      let y = C[m];
      $[m] == null && y.from != null && $[y.from] != null && ($[m] = qi);
    }
    $[P] != null && lo(!0);
    let c = {};
    for (let m in $) {
      let y = $[m];
      if (y != null) {
        let S = c[m] = _o(C[m], Pp);
        if (y.min != null)
          Re(S, y);
        else if (m != P || r == 2)
          if (Ge == 0 && S.from == null) {
            let E = S.range(o, null, null, m);
            S.min = E[0], S.max = E[1];
          } else
            S.min = me, S.max = -me;
      }
    }
    if (Ge > 0) {
      b.forEach((m, y) => {
        if (r == 1) {
          let S = m.scale, E = $[S];
          if (E == null)
            return;
          let L = c[S];
          if (y == 0) {
            let O = L.range(o, L.min, L.max, S);
            L.min = O[0], L.max = O[1], Ie = zt(L.min, t[0]), Fe = zt(L.max, t[0]), Fe - Ie > 1 && (t[0][Ie] < L.min && Ie++, t[0][Fe] > L.max && Fe--), m.min = Rt[Ie], m.max = Rt[Fe];
          } else m.show && m.auto && ml(L, E, m, t[y], m.sorted);
          m.idxs[0] = Ie, m.idxs[1] = Fe;
        } else if (y > 0 && m.show && m.auto) {
          let [S, E] = m.facets, L = S.scale, O = E.scale, [z, F] = t[y], U = c[L], Z = c[O];
          U != null && ml(U, $[L], S, z, S.sorted), Z != null && ml(Z, $[O], E, F, E.sorted), m.min = E.min, m.max = E.max;
        }
      });
      for (let m in c) {
        let y = c[m], S = $[m];
        if (y.from == null && (S == null || S.min == null)) {
          let E = y.range(
            o,
            y.min == me ? null : y.min,
            y.max == -me ? null : y.max,
            m
          );
          y.min = E[0], y.max = E[1];
        }
      }
    }
    for (let m in c) {
      let y = c[m];
      if (y.from != null) {
        let S = c[y.from];
        if (S.min == null)
          y.min = y.max = null;
        else {
          let E = y.range(o, S.min, S.max, m);
          y.min = E[0], y.max = E[1];
        }
      }
    }
    let f = {}, h = !1;
    for (let m in c) {
      let y = c[m], S = C[m];
      if (S.min != y.min || S.max != y.max) {
        S.min = y.min, S.max = y.max;
        let E = S.distr;
        S._min = E == 3 ? sn(S.min) : E == 4 ? Nl(S.min, S.asinh) : E == 100 ? S.fwd(S.min) : S.min, S._max = E == 3 ? sn(S.max) : E == 4 ? Nl(S.max, S.asinh) : E == 100 ? S.fwd(S.max) : S.max, f[m] = h = !0;
      }
    }
    if (h) {
      b.forEach((m, y) => {
        r == 2 ? y > 0 && f.y && (m._paths = null) : f[m.scale] && (m._paths = null);
      });
      for (let m in f)
        Xn = !0, We("setScale", m);
      tt && Y.left >= 0 && (Dn = At = !0);
    }
    for (let m in $)
      $[m] = null;
  }
  function cf(c) {
    let f = ti(Ie - 1, 0, Ge - 1), h = ti(Fe + 1, 0, Ge - 1);
    for (; c[f] == null && f > 0; )
      f--;
    for (; c[h] == null && h < Ge - 1; )
      h++;
    return [f, h];
  }
  function af() {
    if (Ge > 0) {
      let c = b.some((f) => f._focus) && ct != Wt.alpha;
      c && (u.globalAlpha = ct = Wt.alpha), b.forEach((f, h) => {
        if (h > 0 && f.show && (Ji(h, !1), Ji(h, !0), f._paths == null)) {
          let m = ct;
          ct != f.alpha && (u.globalAlpha = ct = f.alpha);
          let y = r == 2 ? [0, t[h][0].length - 1] : cf(t[h]);
          f._paths = f.paths(o, h, y[0], y[1]), ct != m && (u.globalAlpha = ct = m);
        }
      }), b.forEach((f, h) => {
        if (h > 0 && f.show) {
          let m = ct;
          ct != f.alpha && (u.globalAlpha = ct = f.alpha), f._paths != null && Zi(h, !1);
          {
            let y = f._paths != null ? f._paths.gaps : null, S = f.points.show(o, h, Ie, Fe, y), E = f.points.filter(o, h, S, y);
            (S || E) && (f.points._paths = f.points.paths(o, h, Ie, Fe, E), Zi(h, !0));
          }
          ct != m && (u.globalAlpha = ct = m), We("drawSeries", h);
        }
      }), c && (u.globalAlpha = ct = 1);
    }
  }
  function Ji(c, f) {
    let h = f ? b[c].points : b[c];
    h._stroke = h.stroke(o, c), h._fill = h.fill(o, c);
  }
  function Zi(c, f) {
    let h = f ? b[c].points : b[c], {
      stroke: m,
      fill: y,
      clip: S,
      flags: E,
      _stroke: L = h._stroke,
      _fill: O = h._fill,
      _width: z = h.width
    } = h._paths;
    z = we(z * fe, 3);
    let F = null, U = z % 2 / 2;
    f && O == null && (O = z > 0 ? "#fff" : L);
    let Z = h.pxAlign == 1 && U > 0;
    if (Z && u.translate(U, U), !f) {
      let ae = ft - z / 2, ie = St - z / 2, re = st + z, q = Ot + z;
      F = new Path2D(), F.rect(ae, ie, re, q);
    }
    f ? wl(L, z, h.dash, h.cap, O, m, y, E, S) : ff(c, L, z, h.dash, h.cap, O, m, y, E, F, S), Z && u.translate(-U, -U);
  }
  function ff(c, f, h, m, y, S, E, L, O, z, F) {
    let U = !1;
    O != 0 && T.forEach((Z, ae) => {
      if (Z.series[0] == c) {
        let ie = b[Z.series[1]], re = t[Z.series[1]], q = (ie._paths || er).band;
        xn(q) && (q = Z.dir == 1 ? q[0] : q[1]);
        let K, ve = null;
        ie.show && q && vp(re, Ie, Fe) ? (ve = Z.fill(o, ae) || S, K = ie._paths.clip) : q = null, wl(f, h, m, y, ve, E, L, O, z, F, K, q), U = !0;
      }
    }), U || wl(f, h, m, y, S, E, L, O, z, F);
  }
  const Qi = Eo | ri;
  function wl(c, f, h, m, y, S, E, L, O, z, F, U) {
    Yi(c, f, h, m, y), (O || z || U) && (u.save(), O && u.clip(O), z && u.clip(z)), U ? (L & Qi) == Qi ? (u.clip(U), F && u.clip(F), yr(y, E), wr(c, S, f)) : L & ri ? (yr(y, E), u.clip(U), wr(c, S, f)) : L & Eo && (u.save(), u.clip(U), F && u.clip(F), yr(y, E), u.restore(), wr(c, S, f)) : (yr(y, E), wr(c, S, f)), (O || z || U) && u.restore();
  }
  function wr(c, f, h) {
    h > 0 && (f instanceof Map ? f.forEach((m, y) => {
      u.strokeStyle = mr = y, u.stroke(m);
    }) : f != null && c && u.stroke(f));
  }
  function yr(c, f) {
    f instanceof Map ? f.forEach((h, m) => {
      u.fillStyle = ro = m, u.fill(h);
    }) : f != null && c && u.fill(f);
  }
  function uf(c, f, h, m) {
    let y = _[c], S;
    if (m <= 0)
      S = [0, 0];
    else {
      let E = y._space = y.space(o, c, f, h, m), L = y._incrs = y.incrs(o, c, f, h, m, E);
      S = Ug(f, h, L, m, E);
    }
    return y._found = S;
  }
  function yl(c, f, h, m, y, S, E, L, O, z) {
    let F = E % 2 / 2;
    A == 1 && u.translate(F, F), Yi(L, E, O, z, L), u.beginPath();
    let U, Z, ae, ie, re = y + (m == 0 || m == 3 ? -S : S);
    h == 0 ? (Z = y, ie = re) : (U = y, ae = re);
    for (let q = 0; q < c.length; q++)
      f[q] != null && (h == 0 ? U = ae = c[q] : Z = ie = c[q], u.moveTo(U, Z), u.lineTo(ae, ie));
    u.stroke(), A == 1 && u.translate(-F, -F);
  }
  function df(c) {
    let f = !0;
    return _.forEach((h, m) => {
      if (!h.show)
        return;
      let y = C[h.scale];
      if (y.min == null) {
        h._show && (f = !1, h._show = !1, lo(!1));
        return;
      } else
        h._show || (f = !1, h._show = !0, lo(!1));
      let S = h.side, E = S % 2, { min: L, max: O } = y, [z, F] = uf(m, L, O, E == 0 ? ee : B);
      if (F == 0)
        return;
      let U = y.distr == 2, Z = h._splits = h.splits(o, m, L, O, z, F, U), ae = y.distr == 2 ? Z.map((K) => Rt[K]) : Z, ie = y.distr == 2 ? Rt[Z[1]] - Rt[Z[0]] : z, re = h._values = h.values(o, h.filter(o, ae, m, F, ie), m, F, ie);
      h._rotate = S == 2 ? h.rotate(o, re, m, F) : 0;
      let q = h._size;
      h._size = Pt(h.size(o, re, m, c)), q != null && h._size != q && (f = !1);
    }), f;
  }
  function hf(c) {
    let f = !0;
    return Gi.forEach((h, m) => {
      let y = h(o, m, Rn, c);
      y != hn[m] && (f = !1), hn[m] = y;
    }), f;
  }
  function pf() {
    for (let c = 0; c < _.length; c++) {
      let f = _[c];
      if (!f.show || !f._show)
        continue;
      let h = f.side, m = h % 2, y, S, E = f.stroke(o, c), L = h == 0 || h == 3 ? -1 : 1, [O, z] = f._found;
      if (f.label != null) {
        let rt = f.labelGap * L, ht = Ne((f._lpos + rt) * fe);
        Ki(f.labelFont[0], E, "center", h == 2 ? Yo : Hs), u.save(), m == 1 ? (y = S = 0, u.translate(
          ht,
          Ne(St + Ot / 2)
        ), u.rotate((h == 3 ? -Tr : Tr) / 2)) : (y = Ne(ft + st / 2), S = ht);
        let Nn = ma(f.label) ? f.label(o, c, O, z) : f.label;
        u.fillText(Nn, y, S), u.restore();
      }
      if (z == 0)
        continue;
      let F = C[f.scale], U = m == 0 ? st : Ot, Z = m == 0 ? ft : St, ae = f._splits, ie = F.distr == 2 ? ae.map((rt) => Rt[rt]) : ae, re = F.distr == 2 ? Rt[ae[1]] - Rt[ae[0]] : O, q = f.ticks, K = f.border, ve = q.show ? q.size : 0, Te = Ne(ve * fe), He = Ne((f.alignTo == 2 ? f._size - ve - f.gap : f.gap) * fe), pe = f._rotate * -Tr / 180, Le = k(f._pos * fe), ut = (Te + He) * L, ot = Le + ut;
      S = m == 0 ? ot : 0, y = m == 1 ? ot : 0;
      let Ct = f.font[0], Mt = f.align == 1 ? yo : f.align == 2 ? Rl : pe > 0 ? yo : pe < 0 ? Rl : m == 0 ? "center" : h == 3 ? Rl : yo, jt = pe || m == 1 ? "middle" : h == 2 ? Yo : Hs;
      Ki(Ct, E, Mt, jt);
      let dt = f.font[1] * f.lineGap, _t = ae.map((rt) => k(s(rt, F, U, Z))), $t = f._values;
      for (let rt = 0; rt < $t.length; rt++) {
        let ht = $t[rt];
        if (ht != null) {
          m == 0 ? y = _t[rt] : S = _t[rt], ht = "" + ht;
          let Nn = ht.indexOf(`
`) == -1 ? [ht] : ht.split(/\n/gm);
          for (let lt = 0; lt < Nn.length; lt++) {
            let ws = Nn[lt];
            pe ? (u.save(), u.translate(y, S + lt * dt), u.rotate(pe), u.fillText(ws, 0, 0), u.restore()) : u.fillText(ws, y, S + lt * dt);
          }
        }
      }
      q.show && yl(
        _t,
        q.filter(o, ie, c, z, re),
        m,
        h,
        Le,
        Te,
        we(q.width * fe, 3),
        q.stroke(o, c),
        q.dash,
        q.cap
      );
      let Yt = f.grid;
      Yt.show && yl(
        _t,
        Yt.filter(o, ie, c, z, re),
        m,
        m == 0 ? 2 : 1,
        m == 0 ? St : ft,
        m == 0 ? Ot : st,
        we(Yt.width * fe, 3),
        Yt.stroke(o, c),
        Yt.dash,
        Yt.cap
      ), K.show && yl(
        [Le],
        [1],
        m == 0 ? 1 : 0,
        m == 0 ? 1 : 2,
        m == 1 ? St : ft,
        m == 1 ? Ot : st,
        we(K.width * fe, 3),
        K.stroke(o, c),
        K.dash,
        K.cap
      );
    }
    We("drawAxes");
  }
  function lo(c) {
    b.forEach((f, h) => {
      h > 0 && (f._paths = null, c && (r == 1 ? (f.min = null, f.max = null) : f.facets.forEach((m) => {
        m.min = null, m.max = null;
      })));
    });
  }
  let br = !1, bl = !1, Vo = [];
  function gf() {
    bl = !1;
    for (let c = 0; c < Vo.length; c++)
      We(...Vo[c]);
    Vo.length = 0;
  }
  function io() {
    br || ($p(Xi), br = !0);
  }
  function mf(c, f = !1) {
    br = !0, bl = f, c(o), Xi(), f && Vo.length > 0 && queueMicrotask(gf);
  }
  o.batch = mf;
  function Xi() {
    if (il && (sf(), il = !1), Xn && (Xa(), Xn = !1), hr) {
      if (Ae(w, yo, ye), Ae(w, Yo, $e), Ae(w, Jo, ee), Ae(w, Zo, B), Ae(v, yo, ye), Ae(v, Yo, $e), Ae(v, Jo, ee), Ae(v, Zo, B), Ae(g, Jo, tn), Ae(g, Zo, Pn), p.width = Ne(tn * fe), p.height = Ne(Pn * fe), _.forEach(({ _el: c, _show: f, _size: h, _pos: m, side: y }) => {
        if (c != null)
          if (f) {
            let S = y === 3 || y === 0 ? h : 0, E = y % 2 == 1;
            Ae(c, E ? "left" : "top", m - S), Ae(c, E ? "width" : "height", h), Ae(c, E ? "top" : "left", E ? $e : ye), Ae(c, E ? "height" : "width", E ? B : ee), Xl(c, Bn);
          } else
            gt(c, Bn);
      }), mr = ro = al = ul = dl = hl = pl = gl = fl = null, ct = 1, Bo(!0), ye != Qn || $e != Tn || ee != Ut || B != Ln) {
        lo(!1);
        let c = ee / Ut, f = B / Ln;
        if (tt && !Dn && Y.left >= 0) {
          Y.left *= c, Y.top *= f, so && Kt(so, Ne(Y.left), 0, ee, B), co && Kt(co, 0, Ne(Y.top), ee, B);
          for (let h = 0; h < kt.length; h++) {
            let m = kt[h];
            m != null && (no[h] *= c, oo[h] *= f, Kt(m, Pt(no[h]), Pt(oo[h]), ee, B));
          }
        }
        if (xe.show && !pr && xe.left >= 0 && xe.width > 0) {
          xe.left *= c, xe.width *= c, xe.top *= f, xe.height *= f;
          for (let h in Cl)
            Ae(uo, h, xe[h]);
        }
        Qn = ye, Tn = $e, Ut = ee, Ln = B;
      }
      We("setSize"), hr = !1;
    }
    tn > 0 && Pn > 0 && (u.clearRect(0, 0, p.width, p.height), We("drawClear"), W.forEach((c) => c()), We("draw")), xe.show && pr && (xr(xe), pr = !1), tt && Dn && ($n(null, !0, !1), Dn = !1), oe.show && oe.live && At && (Al(), At = !1), a || (a = !0, o.status = 1, We("ready")), zo = !1, br = !1;
  }
  o.redraw = (c, f) => {
    Xn = f || !1, c !== !1 ? gn(P, D.min, D.max) : io();
  };
  function xl(c, f) {
    let h = C[c];
    if (h.from == null) {
      if (Ge == 0) {
        let m = h.range(o, f.min, f.max, c);
        f.min = m[0], f.max = m[1];
      }
      if (f.min > f.max) {
        let m = f.min;
        f.min = f.max, f.max = m;
      }
      if (Ge > 1 && f.min != null && f.max != null && f.max - f.min < 1e-16)
        return;
      c == P && h.distr == 2 && Ge > 0 && (f.min = zt(f.min, t[0]), f.max = zt(f.max, t[0]), f.min == f.max && f.max++), $[c] = f, il = !0, io();
    }
  }
  o.setScale = xl;
  let vl, Sl, so, co, es, ts, ao, fo, ns, os, be, Ce, pn = !1;
  const je = Y.drag;
  let Be = je.x, Ue = je.y;
  tt && (Y.x && (vl = Et(lp, v)), Y.y && (Sl = Et(ip, v)), D.ori == 0 ? (so = vl, co = Sl) : (so = Sl, co = vl), be = Y.left, Ce = Y.top);
  const xe = o.select = Re({
    show: !0,
    over: !0,
    left: 0,
    width: 0,
    top: 0,
    height: 0
  }, e.select), uo = xe.show ? Et(rp, xe.over ? v : w) : null;
  function xr(c, f) {
    if (xe.show) {
      for (let h in c)
        xe[h] = c[h], h in Cl && Ae(uo, h, c[h]);
      f !== !1 && We("setSelect");
    }
  }
  o.setSelect = xr;
  function wf(c) {
    if (b[c].show)
      Me && Xl(Ee[c], Bn);
    else if (Me && gt(Ee[c], Bn), tt) {
      let h = to ? kt[0] : kt[c];
      h != null && Kt(h, -10, -10, ee, B);
    }
  }
  function gn(c, f, h) {
    xl(c, { min: f, max: h });
  }
  function Ht(c, f, h, m) {
    f.focus != null && Sf(c), f.show != null && b.forEach((y, S) => {
      S > 0 && (c == S || c == null) && (y.show = f.show, wf(S), r == 2 ? (gn(y.facets[0].scale, null, null), gn(y.facets[1].scale, null, null)) : gn(y.scale, null, null), io());
    }), h !== !1 && We("setSeries", c, f), m && Uo("setSeries", o, c, f);
  }
  o.setSeries = Ht;
  function yf(c, f) {
    Re(T[c], f);
  }
  function bf(c, f) {
    c.fill = le(c.fill || null), c.dir = se(c.dir, -1), f = f ?? T.length, T.splice(f, 0, c);
  }
  function xf(c) {
    c == null ? T.length = 0 : T.splice(c, 1);
  }
  o.addBand = bf, o.setBand = yf, o.delBand = xf;
  function vf(c, f) {
    b[c].alpha = f, tt && kt[c] != null && (kt[c].style.opacity = f), Me && Ee[c] && (Ee[c].style.opacity = f);
  }
  let nn, mn, Mn;
  const ho = { focus: !0 };
  function Sf(c) {
    if (c != Mn) {
      let f = c == null, h = Wt.alpha != 1;
      b.forEach((m, y) => {
        if (r == 1 || y > 0) {
          let S = f || y == 0 || y == c;
          m._focus = f ? null : S, h && vf(y, S ? 1 : Wt.alpha);
        }
      }), Mn = c, h && io();
    }
  }
  Me && eo && nt(Ks, ue, (c) => {
    Y._lock || (On(c), Mn != null && Ht(null, ho, !0, Oe.setSeries));
  });
  function Gt(c, f, h) {
    let m = C[f];
    h && (c = c / fe - (m.ori == 1 ? $e : ye));
    let y = ee;
    m.ori == 1 && (y = B, c = y - c), m.dir == -1 && (c = y - c);
    let S = m._min, E = m._max, L = c / y, O = S + (E - S) * L, z = m.distr;
    return z == 3 ? ko(10, O) : z == 4 ? Ap(O, m.asinh) : z == 100 ? m.bwd(O) : O;
  }
  function Af(c, f) {
    let h = Gt(c, P, f);
    return zt(h, t[0], Ie, Fe);
  }
  o.valToIdx = (c) => zt(c, t[0]), o.posToIdx = Af, o.posToVal = Gt, o.valToPos = (c, f, h) => C[f].ori == 0 ? l(
    c,
    C[f],
    h ? st : ee,
    h ? ft : 0
  ) : i(
    c,
    C[f],
    h ? Ot : B,
    h ? St : 0
  ), o.setCursor = (c, f, h) => {
    be = c.left, Ce = c.top, $n(null, f, h);
  };
  function rs(c, f) {
    Ae(uo, yo, xe.left = c), Ae(uo, Jo, xe.width = f);
  }
  function ls(c, f) {
    Ae(uo, Yo, xe.top = c), Ae(uo, Zo, xe.height = f);
  }
  let Io = D.ori == 0 ? rs : ls, Fo = D.ori == 1 ? rs : ls;
  function kf() {
    if (Me && oe.live)
      for (let c = r == 2 ? 1 : 0; c < b.length; c++) {
        if (c == 0 && vt)
          continue;
        let f = oe.values[c], h = 0;
        for (let m in f)
          Bt[c][h++].firstChild.nodeValue = f[m];
      }
  }
  function Al(c, f) {
    if (c != null && (c.idxs ? c.idxs.forEach((h, m) => {
      ne[m] = h;
    }) : Ep(c.idx) || ne.fill(c.idx), oe.idx = ne[0]), Me && oe.live) {
      for (let h = 0; h < b.length; h++)
        (h > 0 || r == 1 && !vt) && Cf(h, ne[h]);
      kf();
    }
    At = !1, f !== !1 && We("setLegend");
  }
  o.setLegend = Al;
  function Cf(c, f) {
    let h = b[c], m = c == 0 && M == 2 ? Rt : t[c], y;
    vt ? y = h.values(o, c, f) ?? dn : (y = h.value(o, f == null ? null : m[f], c, f), y = y == null ? dn : { _: y }), oe.values[c] = y;
  }
  function $n(c, f, h) {
    ns = be, os = Ce, [be, Ce] = Y.move(o, be, Ce), Y.left = be, Y.top = Ce, tt && (so && Kt(so, Ne(be), 0, ee, B), co && Kt(co, 0, Ne(Ce), ee, B));
    let m, y = Ie > Fe;
    nn = me, mn = null;
    let S = D.ori == 0 ? ee : B, E = D.ori == 1 ? ee : B;
    if (be < 0 || Ge == 0 || y) {
      m = Y.idx = null;
      for (let L = 0; L < b.length; L++) {
        let O = kt[L];
        O != null && Kt(O, -10, -10, ee, B);
      }
      eo && Ht(null, ho, !0, c == null && Oe.setSeries), oe.live && (ne.fill(m), At = !0);
    } else {
      let L, O, z;
      r == 1 && (L = D.ori == 0 ? be : Ce, O = Gt(L, P), m = Y.idx = zt(O, t[0], Ie, Fe), z = V(t[0][m], D, S, 0));
      let F = -10, U = -10, Z = 0, ae = 0, ie = !0, re = "", q = "";
      for (let K = r == 2 ? 1 : 0; K < b.length; K++) {
        let ve = b[K], Te = ne[K], He = Te == null ? null : r == 1 ? t[K][Te] : t[K][1][Te], pe = Y.dataIdx(o, K, m, O), Le = pe == null ? null : r == 1 ? t[K][pe] : t[K][1][pe];
        if (At = At || Le != He || pe != Te, ne[K] = pe, K > 0 && ve.show) {
          let ut = pe == null ? -10 : pe == m ? z : V(r == 1 ? t[0][pe] : t[K][0][pe], D, S, 0), ot = Le == null ? -10 : R(Le, r == 1 ? C[ve.scale] : C[ve.facets[1].scale], E, 0);
          if (eo && Le != null) {
            let Ct = D.ori == 1 ? be : Ce, Mt = ze(Wt.dist(o, K, pe, ot, Ct));
            if (Mt < nn) {
              let jt = Wt.bias;
              if (jt != 0) {
                let dt = Gt(Ct, ve.scale), _t = Le >= 0 ? 1 : -1, $t = dt >= 0 ? 1 : -1;
                $t == _t && ($t == 1 ? jt == 1 ? Le >= dt : Le <= dt : (
                  // >= 0
                  jt == 1 ? Le <= dt : Le >= dt
                )) && (nn = Mt, mn = K);
              } else
                nn = Mt, mn = K;
            }
          }
          if (At || to) {
            let Ct, Mt;
            D.ori == 0 ? (Ct = ut, Mt = ot) : (Ct = ot, Mt = ut);
            let jt, dt, _t, $t, Yt, rt, ht = !0, Nn = Je.bbox;
            if (Nn != null) {
              ht = !1;
              let lt = Nn(o, K);
              _t = lt.left, $t = lt.top, jt = lt.width, dt = lt.height;
            } else
              _t = Ct, $t = Mt, jt = dt = Je.size(o, K);
            if (rt = Je.fill(o, K), Yt = Je.stroke(o, K), to)
              K == mn && nn <= Wt.prox && (F = _t, U = $t, Z = jt, ae = dt, ie = ht, re = rt, q = Yt);
            else {
              let lt = kt[K];
              lt != null && (no[K] = _t, oo[K] = $t, tc(lt, jt, dt, ht), Xs(lt, rt, Yt), Kt(lt, Pt(_t), Pt($t), ee, B));
            }
          }
        }
      }
      if (to) {
        let K = Wt.prox, ve = Mn == null ? nn <= K : nn > K || mn != Mn;
        if (At || ve) {
          let Te = kt[0];
          Te != null && (no[0] = F, oo[0] = U, tc(Te, Z, ae, ie), Xs(Te, re, q), Kt(Te, Pt(F), Pt(U), ee, B));
        }
      }
    }
    if (xe.show && pn)
      if (c != null) {
        let [L, O] = Oe.scales, [z, F] = Oe.match, [U, Z] = c.cursor.sync.scales, ae = c.cursor.drag;
        if (Be = ae._x, Ue = ae._y, Be || Ue) {
          let { left: ie, top: re, width: q, height: K } = c.select, ve = c.scales[U].ori, Te = c.posToVal, He, pe, Le, ut, ot, Ct = L != null && z(L, U), Mt = O != null && F(O, Z);
          Ct && Be ? (ve == 0 ? (He = ie, pe = q) : (He = re, pe = K), Le = C[L], ut = V(Te(He, U), Le, S, 0), ot = V(Te(He + pe, U), Le, S, 0), Io(Vt(ut, ot), ze(ot - ut))) : Io(0, S), Mt && Ue ? (ve == 1 ? (He = ie, pe = q) : (He = re, pe = K), Le = C[O], ut = R(Te(He, Z), Le, E, 0), ot = R(Te(He + pe, Z), Le, E, 0), Fo(Vt(ut, ot), ze(ot - ut))) : Fo(0, E);
        } else
          _l();
      } else {
        let L = ze(ns - es), O = ze(os - ts);
        if (D.ori == 1) {
          let Z = L;
          L = O, O = Z;
        }
        Be = je.x && L >= je.dist, Ue = je.y && O >= je.dist;
        let z = je.uni;
        z != null ? Be && Ue && (Be = L >= z, Ue = O >= z, !Be && !Ue && (O > L ? Ue = !0 : Be = !0)) : je.x && je.y && (Be || Ue) && (Be = Ue = !0);
        let F, U;
        Be && (D.ori == 0 ? (F = ao, U = be) : (F = fo, U = Ce), Io(Vt(F, U), ze(U - F)), Ue || Fo(0, E)), Ue && (D.ori == 1 ? (F = ao, U = be) : (F = fo, U = Ce), Fo(Vt(F, U), ze(U - F)), Be || Io(0, S)), !Be && !Ue && (Io(0, 0), Fo(0, 0));
      }
    if (je._x = Be, je._y = Ue, c == null) {
      if (h) {
        if (ms != null) {
          let [L, O] = Oe.scales;
          Oe.values[0] = L != null ? Gt(D.ori == 0 ? be : Ce, L) : null, Oe.values[1] = O != null ? Gt(D.ori == 1 ? be : Ce, O) : null;
        }
        Uo(Ml, o, be, Ce, ee, B, m);
      }
      if (eo) {
        let L = h && Oe.setSeries, O = Wt.prox;
        Mn == null ? nn <= O && Ht(mn, ho, !0, L) : nn > O ? Ht(null, ho, !0, L) : mn != Mn && Ht(mn, ho, !0, L);
      }
    }
    At && (oe.idx = m, Al()), f !== !1 && We("setCursor");
  }
  let wn = null;
  Object.defineProperty(o, "rect", {
    get() {
      return wn == null && Bo(!1), wn;
    }
  });
  function Bo(c = !1) {
    c ? wn = null : (wn = v.getBoundingClientRect(), We("syncRect", wn));
  }
  function is(c, f, h, m, y, S, E) {
    Y._lock || pn && c != null && c.movementX == 0 && c.movementY == 0 || (kl(c, f, h, m, y, S, E, !1, c != null), c != null ? $n(null, !0, !0) : $n(f, !0, !1));
  }
  function kl(c, f, h, m, y, S, E, L, O) {
    if (wn == null && Bo(!1), On(c), c != null)
      h = c.clientX - wn.left, m = c.clientY - wn.top;
    else {
      if (h < 0 || m < 0) {
        be = -10, Ce = -10;
        return;
      }
      let [z, F] = Oe.scales, U = f.cursor.sync, [Z, ae] = U.values, [ie, re] = U.scales, [q, K] = Oe.match, ve = f.axes[0].side % 2 == 1, Te = D.ori == 0 ? ee : B, He = D.ori == 1 ? ee : B, pe = ve ? S : y, Le = ve ? y : S, ut = ve ? m : h, ot = ve ? h : m;
      if (ie != null ? h = q(z, ie) ? s(Z, C[z], Te, 0) : -10 : h = Te * (ut / pe), re != null ? m = K(F, re) ? s(ae, C[F], He, 0) : -10 : m = He * (ot / Le), D.ori == 1) {
        let Ct = h;
        h = m, m = Ct;
      }
    }
    O && (f == null || f.cursor.event.type == Ml) && ((h <= 1 || h >= ee - 1) && (h = In(h, ee)), (m <= 1 || m >= B - 1) && (m = In(m, B))), L ? (es = h, ts = m, [ao, fo] = Y.move(o, h, m)) : (be = h, Ce = m);
  }
  const Cl = {
    width: 0,
    height: 0,
    left: 0,
    top: 0
  };
  function _l() {
    xr(Cl, !1);
  }
  let ss, cs, as, fs;
  function us(c, f, h, m, y, S, E) {
    pn = !0, Be = Ue = je._x = je._y = !1, kl(c, f, h, m, y, S, E, !0, !1), c != null && (nt($l, Zl, ds, !1), Uo(js, o, ao, fo, ee, B, null));
    let { left: L, top: O, width: z, height: F } = xe;
    ss = L, cs = O, as = z, fs = F;
  }
  function ds(c, f, h, m, y, S, E) {
    pn = je._x = je._y = !1, kl(c, f, h, m, y, S, E, !1, !0);
    let { left: L, top: O, width: z, height: F } = xe, U = z > 0 || F > 0, Z = ss != L || cs != O || as != z || fs != F;
    if (U && Z && xr(xe), je.setScale && U && Z) {
      let ae = L, ie = z, re = O, q = F;
      if (D.ori == 1 && (ae = O, ie = F, re = L, q = z), Be && gn(
        P,
        Gt(ae, P),
        Gt(ae + ie, P)
      ), Ue)
        for (let K in C) {
          let ve = C[K];
          K != P && ve.from == null && ve.min != me && gn(
            K,
            Gt(re + q, K),
            Gt(re, K)
          );
        }
      _l();
    } else Y.lock && (Y._lock = !Y._lock, $n(f, !0, c != null));
    c != null && (Zn($l, Zl), Uo($l, o, be, Ce, ee, B, null));
  }
  function _f(c, f, h, m, y, S, E) {
    if (Y._lock)
      return;
    On(c);
    let L = pn;
    if (pn) {
      let O = !0, z = !0, F = 10, U, Z;
      D.ori == 0 ? (U = Be, Z = Ue) : (U = Ue, Z = Be), U && Z && (O = be <= F || be >= ee - F, z = Ce <= F || Ce >= B - F), U && O && (be = be < ao ? 0 : ee), Z && z && (Ce = Ce < fo ? 0 : B), $n(null, !0, !0), pn = !1;
    }
    be = -10, Ce = -10, ne.fill(null), $n(null, !0, !0), L && (pn = L);
  }
  function hs(c, f, h, m, y, S, E) {
    Y._lock || (On(c), cl(), _l(), c != null && Uo(qs, o, be, Ce, ee, B, null));
  }
  function ps() {
    _.forEach(Wg), sl(o.width, o.height, !0);
  }
  Wn(Ir, So, ps);
  const po = {};
  po.mousedown = us, po.mousemove = is, po.mouseup = ds, po.dblclick = hs, po.setSeries = (c, f, h, m) => {
    let y = Oe.match[2];
    h = y(o, f, h), h != -1 && Ht(h, m, !0, !1);
  }, tt && (nt(js, v, us), nt(Ml, v, is), nt(Ys, v, (c) => {
    On(c), Bo(!1);
  }), nt(Ks, v, _f), nt(qs, v, hs), li.add(o), o.syncRect = Bo);
  const vr = o.hooks = e.hooks || {};
  function We(c, f, h) {
    bl ? Vo.push([c, f, h]) : c in vr && vr[c].forEach((m) => {
      m.call(null, o, f, h);
    });
  }
  (e.plugins || []).forEach((c) => {
    for (let f in c.hooks)
      vr[f] = (vr[f] || []).concat(c.hooks[f]);
  });
  const gs = (c, f, h) => h, Oe = Re({
    key: null,
    setSeries: !1,
    filters: {
      pub: ic,
      sub: ic
    },
    scales: [P, b[1] ? b[1].scale : null],
    match: [sc, sc, gs],
    values: [null, null]
  }, Y.sync);
  Oe.match.length == 2 && Oe.match.push(gs), Y.sync = Oe;
  const ms = Oe.key, El = Fa(ms);
  function Uo(c, f, h, m, y, S, E) {
    Oe.filters.pub(c, f, h, m, y, S, E) && El.pub(c, f, h, m, y, S, E);
  }
  El.sub(o);
  function Ef(c, f, h, m, y, S, E) {
    Oe.filters.sub(c, f, h, m, y, S, E) && po[c](null, f, h, m, y, S, E);
  }
  o.pub = Ef;
  function Pf() {
    El.unsub(o), li.delete(o), En.clear(), ei(Ir, So, ps), d.remove(), ue?.remove(), We("destroy");
  }
  o.destroy = Pf;
  function Pl() {
    We("init", e, t), ji(t || e.data, !1), $[P] ? xl(P, $[P]) : cl(), pr = xe.show && (xe.width > 0 || xe.height > 0), Dn = At = !0, sl(e.width, e.height);
  }
  return b.forEach(Hi), _.forEach(lf), n ? n instanceof HTMLElement ? (n.appendChild(d), Pl()) : n(o, Pl) : Pl(), o;
}
et.assign = Re;
et.fmtNum = Oi;
et.rangeNum = Fr;
et.rangeLog = Xr;
et.rangeAsinh = Li;
et.orient = Kn;
et.pxRatio = fe;
et.join = Mp;
et.fmtDate = Mi, et.tzDate = Gp;
et.sync = Fa;
{
  et.addGap = Eg, et.clipGaps = nl;
  let e = et.paths = {
    points: ja
  };
  e.linear = Ka, e.stepped = Lg, e.bars = Dg, e.spline = Rg;
}
var Hg = /* @__PURE__ */ Qt("<div>");
const Gg = (e) => {
  let t, n;
  const [o, r] = _e(0), [l, i] = _e(0), s = Ke(() => a(e.x, e.y));
  function a(p, u) {
    return [p, ...u];
  }
  function d() {
    t && (r(t.getBoundingClientRect().width), i(t.getBoundingClientRect().height), n && n.setSize({
      width: o(),
      height: l()
    }));
  }
  return Wr(() => {
    const p = () => {
      if (t) {
        d();
        const u = {
          width: o(),
          height: l(),
          series: e.series,
          scales: e.scales,
          axes: e.axes,
          bands: e.bands,
          cursor: e.cursor
        };
        n = new et(u, s(), t), window.addEventListener("resize", d), qe(() => {
          if (n && (n.setData(s()), e.autoYScale)) {
            const g = (k, x, b) => {
              let _ = x, C = b;
              if (e.scales && e.scales[k].range) {
                const T = e.scales[k].range;
                T[0] !== null && (_ = x < T[0] ? x : T[0]);
              }
              if (e.scales && e.scales[k]) {
                const T = e.scales[k].range;
                T[1] !== null && (C = b > T[1] ? b : T[1]);
              }
              return [_, C];
            }, w = e.y.flat(), [v, A] = g("y", Math.min(...w), Math.max(...w));
            n.setScale("y", {
              min: v,
              max: A
            });
          }
        }), qe(() => {
          const g = (w) => {
            if (e.scales && e.scales[w] && e.scales[w].range) {
              const v = e.scales[w].range[0], A = e.scales[w].range[1];
              let k = 0, x = 0;
              v !== null && (k = v), A !== null && (x = A), n.setScale(w, {
                min: k,
                max: x
              });
            }
          };
          g("x"), g("y");
        }), Xe(() => {
          n.destroy(), window.removeEventListener("resize", d);
        });
      } else
        setTimeout(p, 10);
    };
    p();
  }), (() => {
    var p = Hg(), u = t;
    return typeof u == "function" ? ai(u, p) : t = p, Lt(() => Tt(p, e.class)), p;
  })();
};
class J {
  data;
  intype;
  constructor(t, n = "native") {
    this.data = t, this.intype = n;
  }
  static makeData(t, n = "native") {
    if (n === "generic") {
      let o = new Uint8Array(t.length + 8), r = new BigUint64Array([BigInt(t.length)]);
      return o.set(new Uint8Array(r.buffer), 0), o.set(t, 8), new J(o, n);
    }
    return new J(t, n);
  }
  static fromData(t, n = "native") {
    return new J(t, n);
  }
  // Shorthands for fromValue
  static str32(t, n = "native") {
    return J.fromValue(t, "string32", n);
  }
  static str512(t, n = "native") {
    return J.fromValue(t, "string512", n);
  }
  static int8(t, n = "native") {
    return J.fromValue(t, "int8", n);
  }
  static uint8(t, n = "native") {
    return J.fromValue(t, "uint8", n);
  }
  static int32(t, n = "native") {
    return J.fromValue(t, "int32", n);
  }
  static uint32(t, n = "native") {
    return J.fromValue(t, "uint32", n);
  }
  static int64(t, n = "native") {
    return J.fromValue(t, "int64", n);
  }
  static uint64(t, n = "native") {
    return J.fromValue(t, "uint64", n);
  }
  static f32(t, n = "native") {
    return J.fromValue(t, "float32", n);
  }
  static f64(t, n = "native") {
    return J.fromValue(t, "float64", n);
  }
  static bool(t, n = "native") {
    return J.fromValue(t, "bool", n);
  }
  static fromValue(t, n, o = "native") {
    let r;
    if (n === "string32") {
      const l = new TextEncoder();
      r = new Uint8Array(32), r.set(l.encode(t + "\0"), 0);
    } else if (n === "string512") {
      const l = new TextEncoder();
      r = new Uint8Array(512), r.set(l.encode(t + "\0"), 0);
    } else n === "int8" ? r = new Uint8Array(new Int8Array([t]).buffer) : n === "int16" ? r = new Uint8Array(new Int16Array([t]).buffer) : n === "int32" ? r = new Uint8Array(new Int32Array([t]).buffer) : n === "int64" ? r = new Uint8Array(new BigInt64Array([BigInt(t)]).buffer) : n === "uint8" ? r = new Uint8Array([t]) : n === "uint16" ? r = new Uint8Array(new Uint16Array([t]).buffer) : n === "uint32" ? r = new Uint8Array(new Uint32Array([t]).buffer) : n === "uint64" ? r = new Uint8Array(new BigUint64Array([BigInt(t)]).buffer) : n === "float32" ? r = new Uint8Array(new Float32Array([t]).buffer) : n === "float64" ? r = new Uint8Array(new Float64Array([t]).buffer) : n === "bool" ? (r = new Uint8Array(1), r.set([t ? 1 : 0], 0)) : (console.log("MxGenericType.fromValue: Could not convert from unknown type <" + n + ">."), r = new Uint8Array([]));
    if (o === "generic") {
      let l = new Uint8Array(r.length + 8), i = new BigUint64Array([BigInt(r.length)]);
      return l.set(new Uint8Array(i.buffer), 0), l.set(r, 8), new J(l, o);
    }
    return new J(r, o);
  }
  static concatData(t) {
    if (t.length === 1)
      return t[0].data;
    let n = 0;
    t.forEach((l) => {
      n += l.data.length;
    });
    let o = new Uint8Array(n), r = 0;
    return t.forEach((l) => {
      o.set(l.data, r), r += l.data.length;
    }), o;
  }
  splitChunks(t, n) {
    const o = new Array();
    for (let r = 0; r < t.length; r += n)
      o.push(t.slice(r, r + n));
    return o;
  }
  static typeFromTypeid(t) {
    switch (t) {
      case 0:
        return "int8";
      case 1:
        return "int16";
      case 2:
        return "int32";
      case 3:
        return "int64";
      case 4:
        return "uint8";
      case 5:
        return "uint16";
      case 6:
        return "uint32";
      case 7:
        return "uint64";
      case 8:
        return "float32";
      case 9:
        return "float64";
      case 10:
        return "string";
      case 11:
        return "bool";
    }
    return "";
  }
  static typeidFromType(t) {
    switch (t.toLowerCase()) {
      case "int8":
        return 0;
      case "int16":
        return 1;
      case "int32":
        return 2;
      case "int64":
        return 3;
      case "uint8":
        return 4;
      case "uint16":
        return 5;
      case "uint32":
        return 6;
      case "uint64":
        return 7;
      case "float32":
        return 8;
      case "float64":
        return 9;
      case "string":
        return 10;
      case "bool":
        return 11;
    }
    return NaN;
  }
  static sizeFromType(t) {
    switch (t.toLowerCase()) {
      case "int8":
        return 1;
      case "int16":
        return 2;
      case "int32":
        return 4;
      case "int64":
        return 8;
      case "uint8":
        return 1;
      case "uint16":
        return 2;
      case "uint32":
        return 4;
      case "uint64":
        return 8;
      case "float32":
        return 4;
      case "float64":
        return 8;
      case "string32":
        return 32;
      case "bool":
        return 1;
    }
    return NaN;
  }
  hexdump() {
    if (this.data.byteLength === 0)
      return [];
    let t = 0;
    return this.intype === "generic" && this.data.byteLength > 8 && (t = 8), Array.from(this.data.slice(t)).map((n) => "0x" + n.toString(16).padStart(2, "0")).reverse();
  }
  astype(t) {
    if (this.data.byteLength === 0)
      return null;
    let n = 0;
    this.intype === "generic" && this.data.byteLength > 8 && (n = 8), n += this.data.byteOffset;
    const o = new Uint8Array(this.data.buffer, n);
    if (t === "string")
      return new TextDecoder().decode(o).split("\0").shift();
    if (t === "stringarray") {
      const r = new TextDecoder(), l = this.splitChunks(o, 512), i = new Array();
      for (let s = 0; s < l.length; s++) {
        let a = r.decode(l[s]).split("\0").shift();
        a && i.push(a);
      }
      return i;
    } else if (t === "float32") {
      const r = new Float32Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "float64") {
      const r = new Float64Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "int8") {
      const r = new Int8Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "uint8") {
      const r = new Int8Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "int16") {
      const r = new Int16Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "uint16") {
      const r = new Uint16Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "int32") {
      const r = new Int32Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else if (t === "uint32") {
      const r = new Uint32Array(o.buffer, n);
      return r.length === 1 ? r[0] : Array.from(r);
    } else return t === "int64" ? new DataView(o.buffer, n).getBigInt64(0, !0) : t === "uint64" ? new DataView(o.buffer, n).getBigUint64(0, !0) : t === "bool" ? o.length === 1 ? o[0] === 1 : Array.from([...o].map(Boolean)) : (console.log("MxGenericType.astype: Could not convert from unknown type <" + t + ">."), null);
  }
  unpack(t) {
    if (this.data.byteLength === 0)
      return null;
    let n = 0;
    this.intype === "generic" && this.data.byteLength > 8 && (n = 8), n += this.data.byteOffset;
    const o = new DataView(this.data.buffer, n);
    let r = 0;
    const l = new Array();
    for (; r < this.data.length - n; ) {
      const i = new Array();
      for (const s of t)
        if (s === "str512") {
          const a = new TextDecoder();
          i.push(a.decode(o.buffer.slice(o.byteOffset + r)).split("\0").shift()), r += 512;
        } else if (s === "str32") {
          const a = new TextDecoder();
          i.push(a.decode(o.buffer.slice(o.byteOffset + r)).split("\0").shift()), r += 32;
        } else if (s === "float32")
          i.push(o.getFloat32(r, !0)), r += 4;
        else if (s === "float64")
          i.push(o.getFloat64(r, !0)), r += 8;
        else if (s === "int8")
          i.push(o.getInt8(r)), r += 1;
        else if (s === "uint8")
          i.push(o.getUint8(r)), r += 1;
        else if (s === "int16")
          i.push(o.getInt16(r, !0)), r += 2;
        else if (s === "uint16")
          i.push(o.getUint16(r, !0)), r += 2;
        else if (s === "int32")
          i.push(o.getInt32(r, !0)), r += 4;
        else if (s === "uint32")
          i.push(o.getUint32(r, !0)), r += 4;
        else if (s === "int64")
          i.push(o.getBigInt64(r, !0)), r += 8;
        else if (s === "uint64")
          i.push(o.getBigUint64(r, !0)), r += 8;
        else if (s === "bool")
          i.push(o.getUint8(r) === 1), r += 1;
        else if (s === "bytearray") {
          const a = Number(o.getBigUint64(r, !0));
          r += 8, i.push(new Uint8Array(o.buffer, o.byteOffset + r, a)), r += a;
        } else
          return console.log("MxGenericType.unpack: Could not convert from unknown type <" + s + ">."), null;
      l.push(i);
    }
    return l;
  }
}
class Ze {
  socket;
  messageid;
  deferred_p;
  isready;
  waiting_p;
  static s_instance;
  address;
  on_change;
  event_subscriptions;
  setupCallbacks() {
    this.socket.onopen = async () => {
      this.isready = !0, this.waiting_p.forEach((t) => t()), this.waiting_p = [], this.on_change.forEach((t) => t(!0));
    }, this.socket.onmessage = async (t) => {
      const n = JSON.parse(await t.data.text());
      if (n.type === "rpc")
        if (!this.deferred_p.has(n.messageid))
          console.log(`MxWebsocket did not expect server message with id: ${n.messageid}`), console.log("Data: ", n);
        else {
          const o = this.deferred_p.get(n.messageid);
          o && o[0](this.make_rpc_response(n, o[1])), this.deferred_p.delete(n.messageid);
        }
      else if (n.type === "evt") {
        const o = this.event_subscriptions.get(n.event);
        o && o(new Uint8Array(n.response));
      }
    }, this.socket.onclose = async () => {
      this.on_change.forEach((t) => t(!1)), this.messageid = 0, this.deferred_p = /* @__PURE__ */ new Map(), this.isready = !1, this.waiting_p = new Array(), setTimeout(() => {
        this.socket = new WebSocket(`${this.address}`), this.setupCallbacks();
      }, 5e3);
    };
  }
  constructor(t, n, o) {
    o ? this.address = `wss://${t}/ws/` : this.address = `ws://${t}:${n}`, this.socket = new WebSocket(`${this.address}`), this.messageid = 0, this.deferred_p = /* @__PURE__ */ new Map(), this.isready = !1, this.waiting_p = new Array(), this.on_change = new Array(), this.event_subscriptions = /* @__PURE__ */ new Map(), this.setupCallbacks();
  }
  on_connection_change(t) {
    this.on_change.push(t);
  }
  static get instance() {
    if (!Ze.s_instance) {
      const t = parseInt(location.port);
      Ze.s_instance = new Ze(location.hostname, isNaN(t) ? 80 : t, location.protocol === "https:");
    }
    return Ze.s_instance;
  }
  get status() {
    return this.socket.readyState;
  }
  async when_ready() {
    return new Promise((t) => {
      this.isready ? t() : this.waiting_p.push(t);
    });
  }
  async rpc_call(t, n = [], o = "native") {
    const [r, l] = this.make_rpc_message(t, n, o !== "none");
    return this.isready || await this.when_ready(), new Promise((i) => {
      this.socket.send(r), this.deferred_p.set(l, [i, o]);
    });
  }
  async subscribe(t, n) {
    const o = this.make_evt_message(t, 0);
    return this.isready || await this.when_ready(), new Promise((r) => {
      this.socket.send(o), this.event_subscriptions.set(t, n), r(J.fromData(new Uint8Array([])));
    });
  }
  async unsubscribe(t) {
    const n = this.make_evt_message(t, 1);
    return this.isready || await this.when_ready(), new Promise((o) => {
      this.socket.send(n), this.event_subscriptions.delete(t), o(J.fromData(new Uint8Array([])));
    });
  }
  // Close the connection if the ws is alive
  close() {
    this.socket.readyState === WebSocket.OPEN && this.socket.close();
  }
  make_rpc_message(t, n, o) {
    const r = this.messageid++, l = btoa(String.fromCharCode.apply(null, Array.from(J.concatData(n))));
    return n.length > 0 ? [JSON.stringify({ type: 0, method: t, args: l, messageid: r, response: o }), r] : [JSON.stringify({ type: 0, method: t, messageid: r, response: o }), r];
  }
  make_rpc_response(t, n) {
    return J.fromData(new Uint8Array(t.response), n);
  }
  make_evt_message(t, n) {
    return JSON.stringify({ type: 1, opcode: n, event: t });
  }
}
class Bi {
  static async Create() {
    const t = new Bi();
    return await t.setupCalls(), t;
  }
  async setupCalls() {
    const t = await Ze.instance.rpc_call("mulex::RpcGetAllCalls", [], "generic"), n = yd(t.astype("stringarray"), 2);
    for (const o of n) {
      const r = o[0].split("::").pop(), l = o[1].split("::").pop();
      let i = "native";
      l.includes("void") ? i = "none" : l.includes("RPCGenericType") && (i = "generic"), this[r] = async (s) => await Ze.instance.rpc_call(o[0], s, i);
    }
  }
  constructor() {
  }
}
class jg {
  root;
  types;
  // MxRdb fetches key types automatically for type inference on read/write
  // leveraging ts type [any]
  async getKeyType(t) {
    if (this.types.has(t))
      return this.types.get(t);
    {
      const n = (await Ze.instance.rpc_call("mulex::RdbGetKeyType", [J.str512(t)])).astype("uint8"), o = J.typeFromTypeid(n);
      return this.types.set(t, o), o;
    }
  }
  constructor(t = "") {
    this.root = t, this.types = /* @__PURE__ */ new Map();
  }
  async read(t) {
    const n = this.root + t, o = await this.getKeyType(n), l = (await Ze.instance.rpc_call("mulex::RdbReadValueDirect", [J.str512(n)], "generic")).astype(o);
    return l === null && console.error("Failed to read key [" + n + "]."), l;
  }
  async write(t, n) {
    const o = this.root + t, r = await this.getKeyType(o);
    r.length === 0 ? console.error("Failed to write key [" + o + "].") : Ze.instance.rpc_call("mulex::RdbWriteValueDirect", [J.str512(o), J.fromValue(n, r, "generic")], "none");
  }
  async create(t, n, o, r = 0) {
    const l = this.root + t;
    (await Ze.instance.rpc_call("mulex::RdbCreateValueDirect", [
      J.str512(l),
      J.uint8(J.typeidFromType(n)),
      J.uint64(BigInt(r)),
      J.fromValue(o, n, "generic")
    ])).astype("bool") || console.error("Failed to create key [" + l + "].");
  }
  delete(t) {
    const n = this.root + t;
    Ze.instance.rpc_call("mulex::RdbDeleteValueDirect", [J.str512(n)], "none");
  }
  watch(t, n) {
    const o = this.root + t;
    Ze.instance.rpc_call("mulex::RdbWatch", [J.str512(o)]).then((r) => {
      Ze.instance.subscribe(r.astype("string"), (l) => {
        const i = J.fromData(l).astype("string"), s = J.fromData(l.subarray(512), "generic");
        n(i, s);
      });
    });
  }
  unwatch(t) {
    const n = this.root + t;
    Ze.instance.rpc_call("mulex::RdbWatch", [J.str512(n)]).then((o) => {
      Ze.instance.unsubscribe(o.astype("string"));
    });
  }
}
var Yg = /* @__PURE__ */ Qt('<div><div class="flex p-5 gap-5"></div><div class="flex p-5 mb-5 gap-5"></div><div class=p-5>');
const Kg = () => {
  let e;
  const t = new jg();
  Wr(async () => {
    e = await Bi.Create();
  });
  async function n(k, x) {
    if (e) {
      const b = J.concatData([J.uint8(k), J.uint8(1), J.f64(x)]), _ = await e.BckCallUserRpc([J.str32("esp301.exe"), J.makeData(b, "generic"), J.int64(10000n)]), [C, T] = _.unpack(["uint8", "int32"])[0];
    } else
      console.log("MxRpc not ready.");
  }
  async function o(k) {
    if (e) {
      const x = J.concatData([J.uint8(k), J.uint8(0)]), b = await e.BckCallUserRpc([J.str32("esp301.exe"), J.makeData(x, "generic"), J.int64(10000n)]), [_, C] = b.unpack(["uint8", "float64"])[0];
      return console.log("status: ", _), C;
    } else
      return console.log("MxRpc not ready."), 0;
  }
  function r(k) {
    return new Promise((x) => setTimeout(x, k));
  }
  async function l() {
    const k = parseInt(i());
    n(k, 0);
    let x = await o(k);
    for (d(x); x != 0; )
      await r(100), x = await o(k), d(x);
    for (n(k, 360), x = await o(k); x < 360; )
      await r(100), x = await o(k), console.log(x), d(x), w((b) => [...b, x]), A((b) => [...b, p()]);
  }
  const [i, s] = _e("0"), [a, d] = _e(0), [p, u] = _e(0), [g, w] = _e([]), [v, A] = _e([]);
  return t.watch("/user/angley", (k, x) => {
    u(x.astype("float64"));
  }), (() => {
    var k = Yg(), x = k.firstChild, b = x.nextSibling, _ = b.nextSibling;
    return Ye(x, ce(Kh, {
      title: "Axis",
      options: ["0", "1", "2"],
      onSelect: (C) => {
        s(C);
      },
      get value() {
        return i();
      },
      size: "xlarge"
    }), null), Ye(x, ce(vu, {
      onClick: l,
      children: "Start"
    }), null), Ye(b, ce(Us, {
      title: "Axis Position",
      get value() {
        return a().toFixed(4);
      },
      reactive: !0,
      size: "xlarge",
      class: "px-5"
    }), null), Ye(b, ce(Us, {
      title: "Wobble Y",
      get value() {
        return p().toFixed(4);
      },
      reactive: !0,
      size: "xlarge",
      class: "px-5"
    }), null), Ye(_, ce(Gg, {
      series: [{}, {
        label: "Waveform",
        stroke: "black"
      }],
      get x() {
        return g();
      },
      get y() {
        return [v()];
      },
      scales: {
        x: {
          time: !1,
          range: [0, 360]
        },
        y: {
          range: [-0.75, -0.25]
        }
      },
      class: "h-56 w-full"
    })), k;
  })();
}, qg = "Calculate/View wobble", Jg = Kg, Zg = "1.0.0", Qg = "View wobble for a given engine.", Xg = "César Godinho";
export {
  Xg as author,
  Qg as brief,
  qg as pname,
  Jg as render,
  Zg as version
};
