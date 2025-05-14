const N = {
  context: void 0,
  registry: void 0,
  effects: void 0,
  done: !1,
  getContextId() {
    return ln(this.context.count);
  },
  getNextContextId() {
    return ln(this.context.count++);
  }
};
function ln(e) {
  const t = String(e), n = t.length - 1;
  return N.context.id + (n ? String.fromCharCode(96 + n) : "") + t;
}
function hr(e) {
  N.context = e;
}
const pr = !1, mr = (e, t) => e === t, st = Symbol("solid-proxy"), Tn = typeof Proxy == "function", lt = {
  equals: mr
};
let Dn = Nn;
const ve = 1, at = 2, Rn = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var T = null;
let Et = null, br = null, _ = null, V = null, ue = null, mt = 0;
function yr(e, t) {
  const n = _, r = T, o = e.length === 0, i = r, s = o ? Rn : {
    owned: null,
    cleanups: null,
    context: i ? i.context : null,
    owner: i
  }, l = o ? e : () => e(() => Z(() => He(s)));
  T = s, _ = null;
  try {
    return Ie(l, !0);
  } finally {
    _ = n, T = r;
  }
}
function I(e, t) {
  t = t ? Object.assign({}, lt, t) : lt;
  const n = {
    value: e,
    observers: null,
    observerSlots: null,
    comparator: t.equals || void 0
  }, r = (o) => (typeof o == "function" && (o = o(n.value)), $n(n, o));
  return [_n.bind(n), r];
}
function fe(e, t, n) {
  const r = Ut(e, t, !1, ve);
  Ze(r);
}
function U(e, t, n) {
  Dn = Cr;
  const r = Ut(e, t, !1, ve);
  (!n || !n.render) && (r.user = !0), ue ? ue.push(r) : Ze(r);
}
function W(e, t, n) {
  n = n ? Object.assign({}, lt, n) : lt;
  const r = Ut(e, t, !0, 0);
  return r.observers = null, r.observerSlots = null, r.comparator = n.equals || void 0, Ze(r), _n.bind(r);
}
function Z(e) {
  if (_ === null) return e();
  const t = _;
  _ = null;
  try {
    return e();
  } finally {
    _ = t;
  }
}
function ct(e, t, n) {
  const r = Array.isArray(e);
  let o, i = n && n.defer;
  return (s) => {
    let l;
    if (r) {
      l = Array(e.length);
      for (let u = 0; u < e.length; u++) l[u] = e[u]();
    } else l = e();
    if (i)
      return i = !1, s;
    const a = Z(() => t(l, o, s));
    return o = l, a;
  };
}
function bt(e) {
  U(() => Z(e));
}
function X(e) {
  return T === null || (T.cleanups === null ? T.cleanups = [e] : T.cleanups.push(e)), e;
}
function an() {
  return T;
}
function wr(e, t) {
  const n = T, r = _;
  T = e, _ = null;
  try {
    return Ie(t, !0);
  } catch (o) {
    Ft(o);
  } finally {
    T = n, _ = r;
  }
}
function yt(e, t) {
  const n = Symbol("context");
  return {
    id: n,
    Provider: Sr(n),
    defaultValue: e
  };
}
function wt(e) {
  let t;
  return T && T.context && (t = T.context[e.id]) !== void 0 ? t : e.defaultValue;
}
function xr(e) {
  const t = W(e), n = W(() => Tt(t()));
  return n.toArray = () => {
    const r = n();
    return Array.isArray(r) ? r : r != null ? [r] : [];
  }, n;
}
function _n() {
  if (this.sources && this.state)
    if (this.state === ve) Ze(this);
    else {
      const e = V;
      V = null, Ie(() => ft(this), !1), V = e;
    }
  if (_) {
    const e = this.observers ? this.observers.length : 0;
    _.sources ? (_.sources.push(this), _.sourceSlots.push(e)) : (_.sources = [this], _.sourceSlots = [e]), this.observers ? (this.observers.push(_), this.observerSlots.push(_.sources.length - 1)) : (this.observers = [_], this.observerSlots = [_.sources.length - 1]);
  }
  return this.value;
}
function $n(e, t, n) {
  let r = e.value;
  return (!e.comparator || !e.comparator(r, t)) && (e.value = t, e.observers && e.observers.length && Ie(() => {
    for (let o = 0; o < e.observers.length; o += 1) {
      const i = e.observers[o], s = Et && Et.running;
      s && Et.disposed.has(i), (s ? !i.tState : !i.state) && (i.pure ? V.push(i) : ue.push(i), i.observers && In(i)), s || (i.state = ve);
    }
    if (V.length > 1e6)
      throw V = [], new Error();
  }, !1)), t;
}
function Ze(e) {
  if (!e.fn) return;
  He(e);
  const t = mt;
  vr(
    e,
    e.value,
    t
  );
}
function vr(e, t, n) {
  let r;
  const o = T, i = _;
  _ = T = e;
  try {
    r = e.fn(t);
  } catch (s) {
    return e.pure && (e.state = ve, e.owned && e.owned.forEach(He), e.owned = null), e.updatedAt = n + 1, Ft(s);
  } finally {
    _ = i, T = o;
  }
  (!e.updatedAt || e.updatedAt <= n) && (e.updatedAt != null && "observers" in e ? $n(e, r) : e.value = r, e.updatedAt = n);
}
function Ut(e, t, n, r = ve, o) {
  const i = {
    fn: e,
    state: r,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: t,
    owner: T,
    context: T ? T.context : null,
    pure: n
  };
  return T === null || T !== Rn && (T.owned ? T.owned.push(i) : T.owned = [i]), i;
}
function ut(e) {
  if (e.state === 0) return;
  if (e.state === at) return ft(e);
  if (e.suspense && Z(e.suspense.inFallback)) return e.suspense.effects.push(e);
  const t = [e];
  for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < mt); )
    e.state && t.push(e);
  for (let n = t.length - 1; n >= 0; n--)
    if (e = t[n], e.state === ve)
      Ze(e);
    else if (e.state === at) {
      const r = V;
      V = null, Ie(() => ft(e, t[0]), !1), V = r;
    }
}
function Ie(e, t) {
  if (V) return e();
  let n = !1;
  t || (V = []), ue ? n = !0 : ue = [], mt++;
  try {
    const r = e();
    return Ar(n), r;
  } catch (r) {
    n || (ue = null), V = null, Ft(r);
  }
}
function Ar(e) {
  if (V && (Nn(V), V = null), e) return;
  const t = ue;
  ue = null, t.length && Ie(() => Dn(t), !1);
}
function Nn(e) {
  for (let t = 0; t < e.length; t++) ut(e[t]);
}
function Cr(e) {
  let t, n = 0;
  for (t = 0; t < e.length; t++) {
    const r = e[t];
    r.user ? e[n++] = r : ut(r);
  }
  if (N.context) {
    if (N.count) {
      N.effects || (N.effects = []), N.effects.push(...e.slice(0, n));
      return;
    }
    hr();
  }
  for (N.effects && !N.count && (e = [...N.effects, ...e], n += N.effects.length, delete N.effects), t = 0; t < n; t++) ut(e[t]);
}
function ft(e, t) {
  e.state = 0;
  for (let n = 0; n < e.sources.length; n += 1) {
    const r = e.sources[n];
    if (r.sources) {
      const o = r.state;
      o === ve ? r !== t && (!r.updatedAt || r.updatedAt < mt) && ut(r) : o === at && ft(r, t);
    }
  }
}
function In(e) {
  for (let t = 0; t < e.observers.length; t += 1) {
    const n = e.observers[t];
    n.state || (n.state = at, n.pure ? V.push(n) : ue.push(n), n.observers && In(n));
  }
}
function He(e) {
  let t;
  if (e.sources)
    for (; e.sources.length; ) {
      const n = e.sources.pop(), r = e.sourceSlots.pop(), o = n.observers;
      if (o && o.length) {
        const i = o.pop(), s = n.observerSlots.pop();
        r < o.length && (i.sourceSlots[s] = r, o[r] = i, n.observerSlots[r] = s);
      }
    }
  if (e.tOwned) {
    for (t = e.tOwned.length - 1; t >= 0; t--) He(e.tOwned[t]);
    delete e.tOwned;
  }
  if (e.owned) {
    for (t = e.owned.length - 1; t >= 0; t--) He(e.owned[t]);
    e.owned = null;
  }
  if (e.cleanups) {
    for (t = e.cleanups.length - 1; t >= 0; t--) e.cleanups[t]();
    e.cleanups = null;
  }
  e.state = 0;
}
function Pr(e) {
  return e instanceof Error ? e : new Error(typeof e == "string" ? e : "Unknown error", {
    cause: e
  });
}
function Ft(e, t = T) {
  throw Pr(e);
}
function Tt(e) {
  if (typeof e == "function" && !e.length) return Tt(e());
  if (Array.isArray(e)) {
    const t = [];
    for (let n = 0; n < e.length; n++) {
      const r = Tt(e[n]);
      Array.isArray(r) ? t.push.apply(t, r) : t.push(r);
    }
    return t;
  }
  return e;
}
function Sr(e, t) {
  return function(r) {
    let o;
    return fe(
      () => o = Z(() => (T.context = {
        ...T.context,
        [e]: r.value
      }, xr(() => r.children))),
      void 0
    ), o;
  };
}
function L(e, t) {
  return Z(() => e(t || {}));
}
function tt() {
  return !0;
}
const Dt = {
  get(e, t, n) {
    return t === st ? n : e.get(t);
  },
  has(e, t) {
    return t === st ? !0 : e.has(t);
  },
  set: tt,
  deleteProperty: tt,
  getOwnPropertyDescriptor(e, t) {
    return {
      configurable: !0,
      enumerable: !0,
      get() {
        return e.get(t);
      },
      set: tt,
      deleteProperty: tt
    };
  },
  ownKeys(e) {
    return e.keys();
  }
};
function Ot(e) {
  return (e = typeof e == "function" ? e() : e) ? e : {};
}
function Er() {
  for (let e = 0, t = this.length; e < t; ++e) {
    const n = this[e]();
    if (n !== void 0) return n;
  }
}
function se(...e) {
  let t = !1;
  for (let s = 0; s < e.length; s++) {
    const l = e[s];
    t = t || !!l && st in l, e[s] = typeof l == "function" ? (t = !0, W(l)) : l;
  }
  if (Tn && t)
    return new Proxy(
      {
        get(s) {
          for (let l = e.length - 1; l >= 0; l--) {
            const a = Ot(e[l])[s];
            if (a !== void 0) return a;
          }
        },
        has(s) {
          for (let l = e.length - 1; l >= 0; l--)
            if (s in Ot(e[l])) return !0;
          return !1;
        },
        keys() {
          const s = [];
          for (let l = 0; l < e.length; l++)
            s.push(...Object.keys(Ot(e[l])));
          return [...new Set(s)];
        }
      },
      Dt
    );
  const n = {}, r = /* @__PURE__ */ Object.create(null);
  for (let s = e.length - 1; s >= 0; s--) {
    const l = e[s];
    if (!l) continue;
    const a = Object.getOwnPropertyNames(l);
    for (let u = a.length - 1; u >= 0; u--) {
      const f = a[u];
      if (f === "__proto__" || f === "constructor") continue;
      const c = Object.getOwnPropertyDescriptor(l, f);
      if (!r[f])
        r[f] = c.get ? {
          enumerable: !0,
          configurable: !0,
          get: Er.bind(n[f] = [c.get.bind(l)])
        } : c.value !== void 0 ? c : void 0;
      else {
        const d = n[f];
        d && (c.get ? d.push(c.get.bind(l)) : c.value !== void 0 && d.push(() => c.value));
      }
    }
  }
  const o = {}, i = Object.keys(r);
  for (let s = i.length - 1; s >= 0; s--) {
    const l = i[s], a = r[l];
    a && a.get ? Object.defineProperty(o, l, a) : o[l] = a ? a.value : void 0;
  }
  return o;
}
function he(e, ...t) {
  if (Tn && st in e) {
    const o = new Set(t.length > 1 ? t.flat() : t[0]), i = t.map((s) => new Proxy(
      {
        get(l) {
          return s.includes(l) ? e[l] : void 0;
        },
        has(l) {
          return s.includes(l) && l in e;
        },
        keys() {
          return s.filter((l) => l in e);
        }
      },
      Dt
    ));
    return i.push(
      new Proxy(
        {
          get(s) {
            return o.has(s) ? void 0 : e[s];
          },
          has(s) {
            return o.has(s) ? !1 : s in e;
          },
          keys() {
            return Object.keys(e).filter((s) => !o.has(s));
          }
        },
        Dt
      )
    ), i;
  }
  const n = {}, r = t.map(() => ({}));
  for (const o of Object.getOwnPropertyNames(e)) {
    const i = Object.getOwnPropertyDescriptor(e, o), s = !i.get && !i.set && i.enumerable && i.writable && i.configurable;
    let l = !1, a = 0;
    for (const u of t)
      u.includes(o) && (l = !0, s ? r[a][o] = i.value : Object.defineProperty(r[a], o, i)), ++a;
    l || (s ? n[o] = i.value : Object.defineProperty(n, o, i));
  }
  return [...r, n];
}
let Or = 0;
function kr() {
  return N.context ? N.getNextContextId() : `cl-${Or++}`;
}
const Lr = (e) => `Stale read from <${e}>.`;
function Ge(e) {
  const t = e.keyed, n = W(() => e.when, void 0, void 0), r = t ? n : W(n, void 0, {
    equals: (o, i) => !o == !i
  });
  return W(
    () => {
      const o = r();
      if (o) {
        const i = e.children;
        return typeof i == "function" && i.length > 0 ? Z(
          () => i(
            t ? o : () => {
              if (!Z(r)) throw Lr("Show");
              return n();
            }
          )
        ) : i;
      }
      return e.fallback;
    },
    void 0,
    void 0
  );
}
const Tr = [
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
], Dr = /* @__PURE__ */ new Set([
  "className",
  "value",
  "readOnly",
  "noValidate",
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  ...Tr
]), Rr = /* @__PURE__ */ new Set([
  "innerHTML",
  "textContent",
  "innerText",
  "children"
]), _r = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
  className: "class",
  htmlFor: "for"
}), $r = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
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
function Nr(e, t) {
  const n = $r[e];
  return typeof n == "object" ? n[t] ? n.$ : void 0 : n;
}
const Ir = /* @__PURE__ */ new Set([
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
]), Mr = /* @__PURE__ */ new Set([
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
]), zr = {
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace"
}, Br = (e) => W(() => e());
function Ur(e, t, n) {
  let r = n.length, o = t.length, i = r, s = 0, l = 0, a = t[o - 1].nextSibling, u = null;
  for (; s < o || l < i; ) {
    if (t[s] === n[l]) {
      s++, l++;
      continue;
    }
    for (; t[o - 1] === n[i - 1]; )
      o--, i--;
    if (o === s) {
      const f = i < r ? l ? n[l - 1].nextSibling : n[i - l] : a;
      for (; l < i; ) e.insertBefore(n[l++], f);
    } else if (i === l)
      for (; s < o; )
        (!u || !u.has(t[s])) && t[s].remove(), s++;
    else if (t[s] === n[i - 1] && n[l] === t[o - 1]) {
      const f = t[--o].nextSibling;
      e.insertBefore(n[l++], t[s++].nextSibling), e.insertBefore(n[--i], f), t[o] = n[i];
    } else {
      if (!u) {
        u = /* @__PURE__ */ new Map();
        let c = l;
        for (; c < i; ) u.set(n[c], c++);
      }
      const f = u.get(t[s]);
      if (f != null)
        if (l < f && f < i) {
          let c = s, d = 1, g;
          for (; ++c < o && c < i && !((g = u.get(t[c])) == null || g !== f + d); )
            d++;
          if (d > f - l) {
            const h = t[s];
            for (; l < f; ) e.insertBefore(n[l++], h);
          } else e.replaceChild(n[l++], t[s++]);
        } else s++;
      else t[s++].remove();
    }
  }
}
const cn = "_$DX_DELEGATE";
function Oe(e, t, n, r) {
  let o;
  const i = () => {
    const l = document.createElement("template");
    return l.innerHTML = e, l.content.firstChild;
  }, s = () => (o || (o = i())).cloneNode(!0);
  return s.cloneNode = s, s;
}
function xt(e, t = window.document) {
  const n = t[cn] || (t[cn] = /* @__PURE__ */ new Set());
  for (let r = 0, o = e.length; r < o; r++) {
    const i = e[r];
    n.has(i) || (n.add(i), t.addEventListener(i, Kr));
  }
}
function Xe(e, t, n) {
  ke(e) || (n == null ? e.removeAttribute(t) : e.setAttribute(t, n));
}
function Fr(e, t, n, r) {
  ke(e) || (r == null ? e.removeAttributeNS(t, n) : e.setAttributeNS(t, n, r));
}
function Vr(e, t, n) {
  ke(e) || (n ? e.setAttribute(t, "") : e.removeAttribute(t));
}
function te(e, t) {
  ke(e) || (t == null ? e.removeAttribute("class") : e.className = t);
}
function jr(e, t, n, r) {
  if (r)
    Array.isArray(n) ? (e[`$$${t}`] = n[0], e[`$$${t}Data`] = n[1]) : e[`$$${t}`] = n;
  else if (Array.isArray(n)) {
    const o = n[0];
    e.addEventListener(t, n[0] = (i) => o.call(e, n[1], i));
  } else e.addEventListener(t, n, typeof n != "function" && n);
}
function Wr(e, t, n = {}) {
  const r = Object.keys(t || {}), o = Object.keys(n);
  let i, s;
  for (i = 0, s = o.length; i < s; i++) {
    const l = o[i];
    !l || l === "undefined" || t[l] || (un(e, l, !1), delete n[l]);
  }
  for (i = 0, s = r.length; i < s; i++) {
    const l = r[i], a = !!t[l];
    !l || l === "undefined" || n[l] === a || !a || (un(e, l, !0), n[l] = a);
  }
  return n;
}
function Hr(e, t, n) {
  if (!t) return n ? Xe(e, "style") : t;
  const r = e.style;
  if (typeof t == "string") return r.cssText = t;
  typeof n == "string" && (r.cssText = n = void 0), n || (n = {}), t || (t = {});
  let o, i;
  for (i in n)
    t[i] == null && r.removeProperty(i), delete n[i];
  for (i in t)
    o = t[i], o !== n[i] && (r.setProperty(i, o), n[i] = o);
  return n;
}
function Gr(e, t = {}, n, r) {
  const o = {};
  return fe(
    () => o.children = Ye(e, t.children, o.children)
  ), fe(() => typeof t.ref == "function" && Mn(t.ref, e)), fe(() => Xr(e, t, n, !0, o, !0)), o;
}
function Mn(e, t, n) {
  return Z(() => e(t, n));
}
function z(e, t, n, r) {
  if (n !== void 0 && !r && (r = []), typeof t != "function") return Ye(e, t, r, n);
  fe((o) => Ye(e, t(), o, n), r);
}
function Xr(e, t, n, r, o = {}, i = !1) {
  t || (t = {});
  for (const s in o)
    if (!(s in t)) {
      if (s === "children") continue;
      o[s] = fn(e, s, null, o[s], n, i, t);
    }
  for (const s in t) {
    if (s === "children")
      continue;
    const l = t[s];
    o[s] = fn(e, s, l, o[s], n, i, t);
  }
}
function Yr(e) {
  let t, n;
  return !ke() || !(t = N.registry.get(n = Jr())) ? e() : (N.completed && N.completed.add(t), N.registry.delete(n), t);
}
function ke(e) {
  return !!N.context && !0 && (!e || e.isConnected);
}
function qr(e) {
  return e.toLowerCase().replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function un(e, t, n) {
  const r = t.trim().split(/\s+/);
  for (let o = 0, i = r.length; o < i; o++)
    e.classList.toggle(r[o], n);
}
function fn(e, t, n, r, o, i, s) {
  let l, a, u, f, c;
  if (t === "style") return Hr(e, n, r);
  if (t === "classList") return Wr(e, n, r);
  if (n === r) return r;
  if (t === "ref")
    i || n(e);
  else if (t.slice(0, 3) === "on:") {
    const d = t.slice(3);
    r && e.removeEventListener(d, r, typeof r != "function" && r), n && e.addEventListener(d, n, typeof n != "function" && n);
  } else if (t.slice(0, 10) === "oncapture:") {
    const d = t.slice(10);
    r && e.removeEventListener(d, r, !0), n && e.addEventListener(d, n, !0);
  } else if (t.slice(0, 2) === "on") {
    const d = t.slice(2).toLowerCase(), g = Ir.has(d);
    if (!g && r) {
      const h = Array.isArray(r) ? r[0] : r;
      e.removeEventListener(d, h);
    }
    (g || n) && (jr(e, d, n, g), g && xt([d]));
  } else if (t.slice(0, 5) === "attr:")
    Xe(e, t.slice(5), n);
  else if (t.slice(0, 5) === "bool:")
    Vr(e, t.slice(5), n);
  else if ((c = t.slice(0, 5) === "prop:") || (u = Rr.has(t)) || !o && ((f = Nr(t, e.tagName)) || (a = Dr.has(t))) || (l = e.nodeName.includes("-") || "is" in s)) {
    if (c)
      t = t.slice(5), a = !0;
    else if (ke(e)) return n;
    t === "class" || t === "className" ? te(e, n) : l && !a && !u ? e[qr(t)] = n : e[f || t] = n;
  } else {
    const d = o && t.indexOf(":") > -1 && zr[t.split(":")[0]];
    d ? Fr(e, d, t, n) : Xe(e, _r[t] || t, n);
  }
  return n;
}
function Kr(e) {
  let t = e.target;
  const n = `$$${e.type}`, r = e.target, o = e.currentTarget, i = (a) => Object.defineProperty(e, "target", {
    configurable: !0,
    value: a
  }), s = () => {
    const a = t[n];
    if (a && !t.disabled) {
      const u = t[`${n}Data`];
      if (u !== void 0 ? a.call(t, u, e) : a.call(t, e), e.cancelBubble) return;
    }
    return t.host && typeof t.host != "string" && !t.host._$host && t.contains(e.target) && i(t.host), !0;
  }, l = () => {
    for (; s() && (t = t._$host || t.parentNode || t.host); ) ;
  };
  if (Object.defineProperty(e, "currentTarget", {
    configurable: !0,
    get() {
      return t || document;
    }
  }), e.composedPath) {
    const a = e.composedPath();
    i(a[0]);
    for (let u = 0; u < a.length - 2 && (t = a[u], !!s()); u++) {
      if (t._$host) {
        t = t._$host, l();
        break;
      }
      if (t.parentNode === o)
        break;
    }
  } else l();
  i(r);
}
function Ye(e, t, n, r, o) {
  const i = ke(e);
  if (i) {
    !n && (n = [...e.childNodes]);
    let a = [];
    for (let u = 0; u < n.length; u++) {
      const f = n[u];
      f.nodeType === 8 && f.data.slice(0, 2) === "!$" ? f.remove() : a.push(f);
    }
    n = a;
  }
  for (; typeof n == "function"; ) n = n();
  if (t === n) return n;
  const s = typeof t, l = r !== void 0;
  if (e = l && n[0] && n[0].parentNode || e, s === "string" || s === "number") {
    if (i || s === "number" && (t = t.toString(), t === n))
      return n;
    if (l) {
      let a = n[0];
      a && a.nodeType === 3 ? a.data !== t && (a.data = t) : a = document.createTextNode(t), n = Te(e, n, r, a);
    } else
      n !== "" && typeof n == "string" ? n = e.firstChild.data = t : n = e.textContent = t;
  } else if (t == null || s === "boolean") {
    if (i) return n;
    n = Te(e, n, r);
  } else {
    if (s === "function")
      return fe(() => {
        let a = t();
        for (; typeof a == "function"; ) a = a();
        n = Ye(e, a, n, r);
      }), () => n;
    if (Array.isArray(t)) {
      const a = [], u = n && Array.isArray(n);
      if (Rt(a, t, n, o))
        return fe(() => n = Ye(e, a, n, r, !0)), () => n;
      if (i) {
        if (!a.length) return n;
        if (r === void 0) return n = [...e.childNodes];
        let f = a[0];
        if (f.parentNode !== e) return n;
        const c = [f];
        for (; (f = f.nextSibling) !== r; ) c.push(f);
        return n = c;
      }
      if (a.length === 0) {
        if (n = Te(e, n, r), l) return n;
      } else u ? n.length === 0 ? dn(e, a, r) : Ur(e, n, a) : (n && Te(e), dn(e, a));
      n = a;
    } else if (t.nodeType) {
      if (i && t.parentNode) return n = l ? [t] : t;
      if (Array.isArray(n)) {
        if (l) return n = Te(e, n, r, t);
        Te(e, n, null, t);
      } else n == null || n === "" || !e.firstChild ? e.appendChild(t) : e.replaceChild(t, e.firstChild);
      n = t;
    }
  }
  return n;
}
function Rt(e, t, n, r) {
  let o = !1;
  for (let i = 0, s = t.length; i < s; i++) {
    let l = t[i], a = n && n[e.length], u;
    if (!(l == null || l === !0 || l === !1)) if ((u = typeof l) == "object" && l.nodeType)
      e.push(l);
    else if (Array.isArray(l))
      o = Rt(e, l, a) || o;
    else if (u === "function")
      if (r) {
        for (; typeof l == "function"; ) l = l();
        o = Rt(
          e,
          Array.isArray(l) ? l : [l],
          Array.isArray(a) ? a : [a]
        ) || o;
      } else
        e.push(l), o = !0;
    else {
      const f = String(l);
      a && a.nodeType === 3 && a.data === f ? e.push(a) : e.push(document.createTextNode(f));
    }
  }
  return o;
}
function dn(e, t, n = null) {
  for (let r = 0, o = t.length; r < o; r++) e.insertBefore(t[r], n);
}
function Te(e, t, n, r) {
  if (n === void 0) return e.textContent = "";
  const o = r || document.createTextNode("");
  if (t.length) {
    let i = !1;
    for (let s = t.length - 1; s >= 0; s--) {
      const l = t[s];
      if (o !== l) {
        const a = l.parentNode === e;
        !i && !s ? a ? e.replaceChild(o, l) : e.insertBefore(o, n) : a && l.remove();
      } else i = !0;
    }
  } else e.insertBefore(o, n);
  return [o];
}
function Jr() {
  return N.getNextContextId();
}
const Zr = "http://www.w3.org/2000/svg";
function zn(e, t = !1) {
  return t ? document.createElementNS(Zr, e) : document.createElement(e);
}
function Qr(e) {
  const { useShadow: t } = e, n = document.createTextNode(""), r = () => e.mount || document.body, o = an();
  let i, s = !!N.context;
  return U(
    () => {
      s && (an().user = s = !1), i || (i = wr(o, () => W(() => e.children)));
      const l = r();
      if (l instanceof HTMLHeadElement) {
        const [a, u] = I(!1), f = () => u(!0);
        yr((c) => z(l, () => a() ? c() : i(), null)), X(f);
      } else {
        const a = zn(e.isSVG ? "g" : "div", e.isSVG), u = t && a.attachShadow ? a.attachShadow({
          mode: "open"
        }) : a;
        Object.defineProperty(a, "_$host", {
          get() {
            return n.parentNode;
          },
          configurable: !0
        }), z(u, i), l.appendChild(a), e.ref && e.ref(a), X(() => l.removeChild(a));
      }
    },
    void 0,
    {
      render: !s
    }
  ), n;
}
function eo(e, t) {
  const n = W(e);
  return W(() => {
    const r = n();
    switch (typeof r) {
      case "function":
        return Z(() => r(t));
      case "string":
        const o = Mr.has(r), i = N.context ? Yr() : zn(r, o);
        return Gr(i, t, o), i;
    }
  });
}
function to(e) {
  const [, t] = he(e, ["component"]);
  return eo(() => e.component, t);
}
xt(["click"]);
function no(e) {
  return (...t) => {
    for (const n of e)
      n && n(...t);
  };
}
const dt = (e) => typeof e == "function" && !e.length ? e() : e;
function ro(e, ...t) {
  return typeof e == "function" ? e(...t) : e;
}
const oo = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;
function gn(e) {
  const t = {};
  let n;
  for (; n = oo.exec(e); )
    t[n[1]] = n[2];
  return t;
}
function Vt(e, t) {
  if (typeof e == "string") {
    if (typeof t == "string")
      return `${e};${t}`;
    e = gn(e);
  } else typeof t == "string" && (t = gn(t));
  return { ...e, ...t };
}
function Qe(...e) {
  return no(e);
}
function io(e) {
  return typeof e == "function";
}
function so(e) {
  return (t) => `${e()}-${t}`;
}
function Se(e, t) {
  return e ? e === t || e.contains(t) : !1;
}
function Bn(e) {
  return de(e).defaultView || window;
}
function de(e) {
  return e ? e.ownerDocument || e : document;
}
var Un = /* @__PURE__ */ ((e) => (e.Escape = "Escape", e.Enter = "Enter", e.Tab = "Tab", e.Space = " ", e.ArrowDown = "ArrowDown", e.ArrowLeft = "ArrowLeft", e.ArrowRight = "ArrowRight", e.ArrowUp = "ArrowUp", e.End = "End", e.Home = "Home", e.PageDown = "PageDown", e.PageUp = "PageUp", e))(Un || {});
function lo(e) {
  return typeof window < "u" && window.navigator != null ? e.test(
    // @ts-ignore
    window.navigator.userAgentData?.platform || window.navigator.platform
  ) : !1;
}
function ao() {
  return lo(/^Mac/i);
}
function Ce(e, t) {
  return t && (io(t) ? t(e) : t[0](t[1], e)), e?.defaultPrevented;
}
function hn(e) {
  return (t) => {
    for (const n of e)
      Ce(t, n);
  };
}
function co(e) {
  return ao() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}
function uo() {
}
function fo(e) {
  return [e.clientX, e.clientY];
}
function go(e, t) {
  const [n, r] = e;
  let o = !1;
  const i = t.length;
  for (let s = i, l = 0, a = s - 1; l < s; a = l++) {
    const [u, f] = t[l], [c, d] = t[a], [, g] = t[a === 0 ? s - 1 : a - 1] || [0, 0], h = (f - d) * (n - u) - (u - c) * (r - f);
    if (d < f) {
      if (r >= d && r < f) {
        if (h === 0)
          return !0;
        h > 0 && (r === d ? r > g && (o = !o) : o = !o);
      }
    } else if (f < d) {
      if (r > f && r <= d) {
        if (h === 0)
          return !0;
        h < 0 && (r === d ? r < g && (o = !o) : o = !o);
      }
    } else if (r === f && (n >= c && n <= u || n >= u && n <= c))
      return !0;
  }
  return o;
}
function vt(e, t) {
  return se(e, t);
}
var Ue = /* @__PURE__ */ new Map(), pn = /* @__PURE__ */ new Set();
function mn() {
  if (typeof window > "u")
    return;
  const e = (n) => {
    if (!n.target)
      return;
    let r = Ue.get(n.target);
    r || (r = /* @__PURE__ */ new Set(), Ue.set(n.target, r), n.target.addEventListener(
      "transitioncancel",
      t
    )), r.add(n.propertyName);
  }, t = (n) => {
    if (!n.target)
      return;
    const r = Ue.get(n.target);
    if (r && (r.delete(n.propertyName), r.size === 0 && (n.target.removeEventListener(
      "transitioncancel",
      t
    ), Ue.delete(n.target)), Ue.size === 0)) {
      for (const o of pn)
        o();
      pn.clear();
    }
  };
  document.body.addEventListener("transitionrun", e), document.body.addEventListener("transitionend", t);
}
typeof document < "u" && (document.readyState !== "loading" ? mn() : document.addEventListener("DOMContentLoaded", mn));
function ho(e) {
  const [t, n] = I(e.defaultValue?.()), r = W(() => e.value?.() !== void 0), o = W(() => r() ? e.value?.() : t());
  return [o, (s) => {
    Z(() => {
      const l = ro(s, o());
      return Object.is(l, o()) || (r() || n(l), e.onChange?.(l)), l;
    });
  }];
}
function po(e) {
  const [t, n] = ho(e);
  return [() => t() ?? !1, n];
}
function mo(e) {
  return (t) => (e(t), () => e(void 0));
}
function At(e) {
  const [t, n] = he(e, ["as"]);
  if (!t.as)
    throw new Error("[kobalte]: Polymorphic is missing the required `as` prop.");
  return (
    // @ts-ignore: Props are valid but not worth calculating
    L(to, se(n, {
      get component() {
        return t.as;
      }
    }))
  );
}
var bo = Object.defineProperty, yo = (e, t) => {
  for (var n in t) bo(e, n, {
    get: t[n],
    enumerable: !0
  });
};
function Fn(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (n = Fn(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function wo() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (t = Fn(e)) && (r && (r += " "), r += t);
  return r;
}
const jt = "-", xo = (e) => {
  const t = Ao(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (s) => {
      const l = s.split(jt);
      return l[0] === "" && l.length !== 1 && l.shift(), Vn(l, t) || vo(s);
    },
    getConflictingClassGroupIds: (s, l) => {
      const a = n[s] || [];
      return l && r[s] ? [...a, ...r[s]] : a;
    }
  };
}, Vn = (e, t) => {
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], r = t.nextPart.get(n), o = r ? Vn(e.slice(1), r) : void 0;
  if (o)
    return o;
  if (t.validators.length === 0)
    return;
  const i = e.join(jt);
  return t.validators.find(({
    validator: s
  }) => s(i))?.classGroupId;
}, bn = /^\[(.+)\]$/, vo = (e) => {
  if (bn.test(e)) {
    const t = bn.exec(e)[1], n = t?.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, Ao = (e) => {
  const {
    theme: t,
    prefix: n
  } = e, r = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  return Po(Object.entries(e.classGroups), n).forEach(([i, s]) => {
    _t(s, r, i, t);
  }), r;
}, _t = (e, t, n, r) => {
  e.forEach((o) => {
    if (typeof o == "string") {
      const i = o === "" ? t : yn(t, o);
      i.classGroupId = n;
      return;
    }
    if (typeof o == "function") {
      if (Co(o)) {
        _t(o(r), t, n, r);
        return;
      }
      t.validators.push({
        validator: o,
        classGroupId: n
      });
      return;
    }
    Object.entries(o).forEach(([i, s]) => {
      _t(s, yn(t, i), n, r);
    });
  });
}, yn = (e, t) => {
  let n = e;
  return t.split(jt).forEach((r) => {
    n.nextPart.has(r) || n.nextPart.set(r, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(r);
  }), n;
}, Co = (e) => e.isThemeGetter, Po = (e, t) => t ? e.map(([n, r]) => {
  const o = r.map((i) => typeof i == "string" ? t + i : typeof i == "object" ? Object.fromEntries(Object.entries(i).map(([s, l]) => [t + s, l])) : i);
  return [n, o];
}) : e, So = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  const o = (i, s) => {
    n.set(i, s), t++, t > e && (t = 0, r = n, n = /* @__PURE__ */ new Map());
  };
  return {
    get(i) {
      let s = n.get(i);
      if (s !== void 0)
        return s;
      if ((s = r.get(i)) !== void 0)
        return o(i, s), s;
    },
    set(i, s) {
      n.has(i) ? n.set(i, s) : o(i, s);
    }
  };
}, jn = "!", Eo = (e) => {
  const {
    separator: t,
    experimentalParseClassName: n
  } = e, r = t.length === 1, o = t[0], i = t.length, s = (l) => {
    const a = [];
    let u = 0, f = 0, c;
    for (let b = 0; b < l.length; b++) {
      let p = l[b];
      if (u === 0) {
        if (p === o && (r || l.slice(b, b + i) === t)) {
          a.push(l.slice(f, b)), f = b + i;
          continue;
        }
        if (p === "/") {
          c = b;
          continue;
        }
      }
      p === "[" ? u++ : p === "]" && u--;
    }
    const d = a.length === 0 ? l : l.substring(f), g = d.startsWith(jn), h = g ? d.substring(1) : d, m = c && c > f ? c - f : void 0;
    return {
      modifiers: a,
      hasImportantModifier: g,
      baseClassName: h,
      maybePostfixModifierPosition: m
    };
  };
  return n ? (l) => n({
    className: l,
    parseClassName: s
  }) : s;
}, Oo = (e) => {
  if (e.length <= 1)
    return e;
  const t = [];
  let n = [];
  return e.forEach((r) => {
    r[0] === "[" ? (t.push(...n.sort(), r), n = []) : n.push(r);
  }), t.push(...n.sort()), t;
}, ko = (e) => ({
  cache: So(e.cacheSize),
  parseClassName: Eo(e),
  ...xo(e)
}), Lo = /\s+/, To = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: o
  } = t, i = [], s = e.trim().split(Lo);
  let l = "";
  for (let a = s.length - 1; a >= 0; a -= 1) {
    const u = s[a], {
      modifiers: f,
      hasImportantModifier: c,
      baseClassName: d,
      maybePostfixModifierPosition: g
    } = n(u);
    let h = !!g, m = r(h ? d.substring(0, g) : d);
    if (!m) {
      if (!h) {
        l = u + (l.length > 0 ? " " + l : l);
        continue;
      }
      if (m = r(d), !m) {
        l = u + (l.length > 0 ? " " + l : l);
        continue;
      }
      h = !1;
    }
    const b = Oo(f).join(":"), p = c ? b + jn : b, y = p + m;
    if (i.includes(y))
      continue;
    i.push(y);
    const w = o(m, h);
    for (let v = 0; v < w.length; ++v) {
      const x = w[v];
      i.push(p + x);
    }
    l = u + (l.length > 0 ? " " + l : l);
  }
  return l;
};
function Do() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = Wn(t)) && (r && (r += " "), r += n);
  return r;
}
const Wn = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Wn(e[r])) && (n && (n += " "), n += t);
  return n;
};
function Ro(e, ...t) {
  let n, r, o, i = s;
  function s(a) {
    const u = t.reduce((f, c) => c(f), e());
    return n = ko(u), r = n.cache.get, o = n.cache.set, i = l, l(a);
  }
  function l(a) {
    const u = r(a);
    if (u)
      return u;
    const f = To(a, n);
    return o(a, f), f;
  }
  return function() {
    return i(Do.apply(null, arguments));
  };
}
const D = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, Hn = /^\[(?:([a-z-]+):)?(.+)\]$/i, _o = /^\d+\/\d+$/, $o = /* @__PURE__ */ new Set(["px", "full", "screen"]), No = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, Io = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, Mo = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/, zo = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, Bo = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, ae = (e) => _e(e) || $o.has(e) || _o.test(e), pe = (e) => Me(e, "length", Xo), _e = (e) => !!e && !Number.isNaN(Number(e)), kt = (e) => Me(e, "number", _e), Fe = (e) => !!e && Number.isInteger(Number(e)), Uo = (e) => e.endsWith("%") && _e(e.slice(0, -1)), P = (e) => Hn.test(e), me = (e) => No.test(e), Fo = /* @__PURE__ */ new Set(["length", "size", "percentage"]), Vo = (e) => Me(e, Fo, Gn), jo = (e) => Me(e, "position", Gn), Wo = /* @__PURE__ */ new Set(["image", "url"]), Ho = (e) => Me(e, Wo, qo), Go = (e) => Me(e, "", Yo), Ve = () => !0, Me = (e, t, n) => {
  const r = Hn.exec(e);
  return r ? r[1] ? typeof t == "string" ? r[1] === t : t.has(r[1]) : n(r[2]) : !1;
}, Xo = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  Io.test(e) && !Mo.test(e)
), Gn = () => !1, Yo = (e) => zo.test(e), qo = (e) => Bo.test(e), Ko = () => {
  const e = D("colors"), t = D("spacing"), n = D("blur"), r = D("brightness"), o = D("borderColor"), i = D("borderRadius"), s = D("borderSpacing"), l = D("borderWidth"), a = D("contrast"), u = D("grayscale"), f = D("hueRotate"), c = D("invert"), d = D("gap"), g = D("gradientColorStops"), h = D("gradientColorStopPositions"), m = D("inset"), b = D("margin"), p = D("opacity"), y = D("padding"), w = D("saturate"), v = D("scale"), x = D("sepia"), A = D("skew"), C = D("space"), O = D("translate"), R = () => ["auto", "contain", "none"], B = () => ["auto", "hidden", "clip", "visible", "scroll"], j = () => ["auto", P, t], E = () => [P, t], Y = () => ["", ae, pe], S = () => ["auto", _e, P], $ = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"], M = () => ["solid", "dashed", "dotted", "double", "none"], H = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], G = () => ["start", "end", "center", "between", "around", "evenly", "stretch"], F = () => ["", "0", P], Q = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], ee = () => [_e, P];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [Ve],
      spacing: [ae, pe],
      blur: ["none", "", me, P],
      brightness: ee(),
      borderColor: [e],
      borderRadius: ["none", "", "full", me, P],
      borderSpacing: E(),
      borderWidth: Y(),
      contrast: ee(),
      grayscale: F(),
      hueRotate: ee(),
      invert: F(),
      gap: E(),
      gradientColorStops: [e],
      gradientColorStopPositions: [Uo, pe],
      inset: j(),
      margin: j(),
      opacity: ee(),
      padding: E(),
      saturate: ee(),
      scale: ee(),
      sepia: F(),
      skew: ee(),
      space: E(),
      translate: E()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", P]
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
        columns: [me]
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
        object: [...$(), P]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: B()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": B()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": B()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: R()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": R()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": R()
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
        inset: [m]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [m]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [m]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [m]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [m]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [m]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [m]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [m]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [m]
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
        z: ["auto", Fe, P]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: j()
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
        flex: ["1", "auto", "initial", "none", P]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: F()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: F()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", Fe, P]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [Ve]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", Fe, P]
        }, P]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": S()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": S()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [Ve]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [Fe, P]
        }, P]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": S()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": S()
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
        "auto-cols": ["auto", "min", "max", "fr", P]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", P]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [d]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [d]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [d]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: ["normal", ...G()]
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
        content: ["normal", ...G(), "baseline"]
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
        "place-content": [...G(), "baseline"]
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
        p: [y]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [y]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [y]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [y]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [y]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [y]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [y]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [y]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [y]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [b]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [b]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [b]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [b]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [b]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [b]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [b]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [b]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [b]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [C]
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
        "space-y": [C]
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
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", P, t]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [P, t, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [P, t, "none", "full", "min", "max", "fit", "prose", {
          screen: [me]
        }, me]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [P, t, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [P, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [P, t, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [P, t, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", me, pe]
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
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", kt]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [Ve]
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
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", P]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", _e, kt]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", ae, P]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", P]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", P]
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
        "placeholder-opacity": [p]
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
        "text-opacity": [p]
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
        decoration: [...M(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", ae, pe]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", ae, P]
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
        indent: E()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", P]
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
        content: ["none", P]
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
        "bg-opacity": [p]
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
        bg: [...$(), jo]
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
        bg: ["auto", "cover", "contain", Vo]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, Ho]
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
        from: [h]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [h]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [h]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [g]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [g]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [g]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [i]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [i]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [i]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [i]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [i]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [i]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [i]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [i]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [i]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [i]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [i]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [i]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [i]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [i]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [i]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [l]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [l]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [l]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [l]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [l]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [l]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [l]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [l]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [l]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [p]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...M(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [l]
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
        "divide-y": [l]
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
        "divide-opacity": [p]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: M()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [o]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [o]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [o]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": [o]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": [o]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [o]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [o]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [o]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [o]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [o]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...M()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [ae, P]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [ae, pe]
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
        ring: Y()
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
        "ring-opacity": [p]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [ae, pe]
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
        shadow: ["", "inner", "none", me, Go]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [Ve]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [p]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...H(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": H()
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
        brightness: [r]
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
        "drop-shadow": ["", "none", me, P]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [u]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [f]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [c]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [w]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [x]
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
        "backdrop-brightness": [r]
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
        "backdrop-grayscale": [u]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [f]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [c]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [p]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [w]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [x]
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
        "border-spacing": [s]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [s]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [s]
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
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", P]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: ee()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", P]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: ee()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", P]
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
        scale: [v]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [v]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [v]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [Fe, P]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [O]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [O]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [A]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [A]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", P]
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
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", P]
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
        "scroll-m": E()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": E()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": E()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": E()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": E()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": E()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": E()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": E()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": E()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": E()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": E()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": E()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": E()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": E()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": E()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": E()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": E()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": E()
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
        "will-change": ["auto", "scroll", "contents", "transform", P]
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
        stroke: [ae, pe, kt]
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
}, Jo = /* @__PURE__ */ Ro(Ko);
function Zo(...e) {
  return Jo(wo(e));
}
function Qo(e, t) {
  const n = new Array();
  for (let r = 0; r < e.length; r += t)
    n.push(e.slice(r, r + t));
  return n;
}
var ei = /* @__PURE__ */ new Set(["Avst", "Arab", "Armi", "Syrc", "Samr", "Mand", "Thaa", "Mend", "Nkoo", "Adlm", "Rohg", "Hebr"]), ti = /* @__PURE__ */ new Set(["ae", "ar", "arc", "bcc", "bqi", "ckb", "dv", "fa", "glk", "he", "ku", "mzn", "nqo", "pnb", "ps", "sd", "ug", "ur", "yi"]);
function ni(e) {
  if (Intl.Locale) {
    const n = new Intl.Locale(e).maximize().script ?? "";
    return ei.has(n);
  }
  const t = e.split("-")[0];
  return ti.has(t);
}
function ri(e) {
  return ni(e) ? "rtl" : "ltr";
}
function Xn() {
  let e = typeof navigator < "u" && // @ts-ignore
  (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([e]);
  } catch {
    e = "en-US";
  }
  return {
    locale: e,
    direction: ri(e)
  };
}
var $t = Xn(), We = /* @__PURE__ */ new Set();
function wn() {
  $t = Xn();
  for (const e of We)
    e($t);
}
function oi() {
  const [e, t] = I($t), n = W(() => e());
  return bt(() => {
    We.size === 0 && window.addEventListener("languagechange", wn), We.add(t), X(() => {
      We.delete(t), We.size === 0 && window.removeEventListener("languagechange", wn);
    });
  }), {
    locale: () => n().locale,
    direction: () => n().direction
  };
}
var ii = yt();
function si() {
  const e = oi();
  return wt(ii) || e;
}
const li = ["top", "right", "bottom", "left"], ye = Math.min, K = Math.max, gt = Math.round, nt = Math.floor, oe = (e) => ({
  x: e,
  y: e
}), ai = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, ci = {
  start: "end",
  end: "start"
};
function Nt(e, t, n) {
  return K(e, ye(t, n));
}
function Le(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function we(e) {
  return e.split("-")[0];
}
function ze(e) {
  return e.split("-")[1];
}
function Yn(e) {
  return e === "x" ? "y" : "x";
}
function Wt(e) {
  return e === "y" ? "height" : "width";
}
function be(e) {
  return ["top", "bottom"].includes(we(e)) ? "y" : "x";
}
function Ht(e) {
  return Yn(be(e));
}
function ui(e, t, n) {
  n === void 0 && (n = !1);
  const r = ze(e), o = Ht(e), i = Wt(o);
  let s = o === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[i] > t.floating[i] && (s = ht(s)), [s, ht(s)];
}
function fi(e) {
  const t = ht(e);
  return [It(e), t, It(t)];
}
function It(e) {
  return e.replace(/start|end/g, (t) => ci[t]);
}
function di(e, t, n) {
  const r = ["left", "right"], o = ["right", "left"], i = ["top", "bottom"], s = ["bottom", "top"];
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? o : r : t ? r : o;
    case "left":
    case "right":
      return t ? i : s;
    default:
      return [];
  }
}
function gi(e, t, n, r) {
  const o = ze(e);
  let i = di(we(e), n === "start", r);
  return o && (i = i.map((s) => s + "-" + o), t && (i = i.concat(i.map(It)))), i;
}
function ht(e) {
  return e.replace(/left|right|bottom|top/g, (t) => ai[t]);
}
function hi(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function qn(e) {
  return typeof e != "number" ? hi(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function pt(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: o
  } = e;
  return {
    width: r,
    height: o,
    top: n,
    left: t,
    right: t + r,
    bottom: n + o,
    x: t,
    y: n
  };
}
function xn(e, t, n) {
  let {
    reference: r,
    floating: o
  } = e;
  const i = be(t), s = Ht(t), l = Wt(s), a = we(t), u = i === "y", f = r.x + r.width / 2 - o.width / 2, c = r.y + r.height / 2 - o.height / 2, d = r[l] / 2 - o[l] / 2;
  let g;
  switch (a) {
    case "top":
      g = {
        x: f,
        y: r.y - o.height
      };
      break;
    case "bottom":
      g = {
        x: f,
        y: r.y + r.height
      };
      break;
    case "right":
      g = {
        x: r.x + r.width,
        y: c
      };
      break;
    case "left":
      g = {
        x: r.x - o.width,
        y: c
      };
      break;
    default:
      g = {
        x: r.x,
        y: r.y
      };
  }
  switch (ze(t)) {
    case "start":
      g[s] -= d * (n && u ? -1 : 1);
      break;
    case "end":
      g[s] += d * (n && u ? -1 : 1);
      break;
  }
  return g;
}
const pi = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: o = "absolute",
    middleware: i = [],
    platform: s
  } = n, l = i.filter(Boolean), a = await (s.isRTL == null ? void 0 : s.isRTL(t));
  let u = await s.getElementRects({
    reference: e,
    floating: t,
    strategy: o
  }), {
    x: f,
    y: c
  } = xn(u, r, a), d = r, g = {}, h = 0;
  for (let m = 0; m < l.length; m++) {
    const {
      name: b,
      fn: p
    } = l[m], {
      x: y,
      y: w,
      data: v,
      reset: x
    } = await p({
      x: f,
      y: c,
      initialPlacement: r,
      placement: d,
      strategy: o,
      middlewareData: g,
      rects: u,
      platform: s,
      elements: {
        reference: e,
        floating: t
      }
    });
    f = y ?? f, c = w ?? c, g = {
      ...g,
      [b]: {
        ...g[b],
        ...v
      }
    }, x && h <= 50 && (h++, typeof x == "object" && (x.placement && (d = x.placement), x.rects && (u = x.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: o
    }) : x.rects), {
      x: f,
      y: c
    } = xn(u, d, a)), m = -1);
  }
  return {
    x: f,
    y: c,
    placement: d,
    strategy: o,
    middlewareData: g
  };
};
async function qe(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: o,
    platform: i,
    rects: s,
    elements: l,
    strategy: a
  } = e, {
    boundary: u = "clippingAncestors",
    rootBoundary: f = "viewport",
    elementContext: c = "floating",
    altBoundary: d = !1,
    padding: g = 0
  } = Le(t, e), h = qn(g), b = l[d ? c === "floating" ? "reference" : "floating" : c], p = pt(await i.getClippingRect({
    element: (n = await (i.isElement == null ? void 0 : i.isElement(b))) == null || n ? b : b.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(l.floating)),
    boundary: u,
    rootBoundary: f,
    strategy: a
  })), y = c === "floating" ? {
    x: r,
    y: o,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, w = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(l.floating)), v = await (i.isElement == null ? void 0 : i.isElement(w)) ? await (i.getScale == null ? void 0 : i.getScale(w)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, x = pt(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: l,
    rect: y,
    offsetParent: w,
    strategy: a
  }) : y);
  return {
    top: (p.top - x.top + h.top) / v.y,
    bottom: (x.bottom - p.bottom + h.bottom) / v.y,
    left: (p.left - x.left + h.left) / v.x,
    right: (x.right - p.right + h.right) / v.x
  };
}
const mi = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: o,
      rects: i,
      platform: s,
      elements: l,
      middlewareData: a
    } = t, {
      element: u,
      padding: f = 0
    } = Le(e, t) || {};
    if (u == null)
      return {};
    const c = qn(f), d = {
      x: n,
      y: r
    }, g = Ht(o), h = Wt(g), m = await s.getDimensions(u), b = g === "y", p = b ? "top" : "left", y = b ? "bottom" : "right", w = b ? "clientHeight" : "clientWidth", v = i.reference[h] + i.reference[g] - d[g] - i.floating[h], x = d[g] - i.reference[g], A = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(u));
    let C = A ? A[w] : 0;
    (!C || !await (s.isElement == null ? void 0 : s.isElement(A))) && (C = l.floating[w] || i.floating[h]);
    const O = v / 2 - x / 2, R = C / 2 - m[h] / 2 - 1, B = ye(c[p], R), j = ye(c[y], R), E = B, Y = C - m[h] - j, S = C / 2 - m[h] / 2 + O, $ = Nt(E, S, Y), M = !a.arrow && ze(o) != null && S !== $ && i.reference[h] / 2 - (S < E ? B : j) - m[h] / 2 < 0, H = M ? S < E ? S - E : S - Y : 0;
    return {
      [g]: d[g] + H,
      data: {
        [g]: $,
        centerOffset: S - $ - H,
        ...M && {
          alignmentOffset: H
        }
      },
      reset: M
    };
  }
}), bi = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: o,
        middlewareData: i,
        rects: s,
        initialPlacement: l,
        platform: a,
        elements: u
      } = t, {
        mainAxis: f = !0,
        crossAxis: c = !0,
        fallbackPlacements: d,
        fallbackStrategy: g = "bestFit",
        fallbackAxisSideDirection: h = "none",
        flipAlignment: m = !0,
        ...b
      } = Le(e, t);
      if ((n = i.arrow) != null && n.alignmentOffset)
        return {};
      const p = we(o), y = be(l), w = we(l) === l, v = await (a.isRTL == null ? void 0 : a.isRTL(u.floating)), x = d || (w || !m ? [ht(l)] : fi(l)), A = h !== "none";
      !d && A && x.push(...gi(l, m, h, v));
      const C = [l, ...x], O = await qe(t, b), R = [];
      let B = ((r = i.flip) == null ? void 0 : r.overflows) || [];
      if (f && R.push(O[p]), c) {
        const $ = ui(o, s, v);
        R.push(O[$[0]], O[$[1]]);
      }
      if (B = [...B, {
        placement: o,
        overflows: R
      }], !R.every(($) => $ <= 0)) {
        var j, E;
        const $ = (((j = i.flip) == null ? void 0 : j.index) || 0) + 1, M = C[$];
        if (M) {
          var Y;
          const G = c === "alignment" ? y !== be(M) : !1, F = ((Y = B[0]) == null ? void 0 : Y.overflows[0]) > 0;
          if (!G || F)
            return {
              data: {
                index: $,
                overflows: B
              },
              reset: {
                placement: M
              }
            };
        }
        let H = (E = B.filter((G) => G.overflows[0] <= 0).sort((G, F) => G.overflows[1] - F.overflows[1])[0]) == null ? void 0 : E.placement;
        if (!H)
          switch (g) {
            case "bestFit": {
              var S;
              const G = (S = B.filter((F) => {
                if (A) {
                  const Q = be(F.placement);
                  return Q === y || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  Q === "y";
                }
                return !0;
              }).map((F) => [F.placement, F.overflows.filter((Q) => Q > 0).reduce((Q, ee) => Q + ee, 0)]).sort((F, Q) => F[1] - Q[1])[0]) == null ? void 0 : S[0];
              G && (H = G);
              break;
            }
            case "initialPlacement":
              H = l;
              break;
          }
        if (o !== H)
          return {
            reset: {
              placement: H
            }
          };
      }
      return {};
    }
  };
};
function vn(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function An(e) {
  return li.some((t) => e[t] >= 0);
}
const yi = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n
      } = t, {
        strategy: r = "referenceHidden",
        ...o
      } = Le(e, t);
      switch (r) {
        case "referenceHidden": {
          const i = await qe(t, {
            ...o,
            elementContext: "reference"
          }), s = vn(i, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: An(s)
            }
          };
        }
        case "escaped": {
          const i = await qe(t, {
            ...o,
            altBoundary: !0
          }), s = vn(i, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: An(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
async function wi(e, t) {
  const {
    placement: n,
    platform: r,
    elements: o
  } = e, i = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)), s = we(n), l = ze(n), a = be(n) === "y", u = ["left", "top"].includes(s) ? -1 : 1, f = i && a ? -1 : 1, c = Le(t, e);
  let {
    mainAxis: d,
    crossAxis: g,
    alignmentAxis: h
  } = typeof c == "number" ? {
    mainAxis: c,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: c.mainAxis || 0,
    crossAxis: c.crossAxis || 0,
    alignmentAxis: c.alignmentAxis
  };
  return l && typeof h == "number" && (g = l === "end" ? h * -1 : h), a ? {
    x: g * f,
    y: d * u
  } : {
    x: d * u,
    y: g * f
  };
}
const xi = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: o,
        y: i,
        placement: s,
        middlewareData: l
      } = t, a = await wi(t, e);
      return s === ((n = l.offset) == null ? void 0 : n.placement) && (r = l.arrow) != null && r.alignmentOffset ? {} : {
        x: o + a.x,
        y: i + a.y,
        data: {
          ...a,
          placement: s
        }
      };
    }
  };
}, vi = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: r,
        placement: o
      } = t, {
        mainAxis: i = !0,
        crossAxis: s = !1,
        limiter: l = {
          fn: (b) => {
            let {
              x: p,
              y
            } = b;
            return {
              x: p,
              y
            };
          }
        },
        ...a
      } = Le(e, t), u = {
        x: n,
        y: r
      }, f = await qe(t, a), c = be(we(o)), d = Yn(c);
      let g = u[d], h = u[c];
      if (i) {
        const b = d === "y" ? "top" : "left", p = d === "y" ? "bottom" : "right", y = g + f[b], w = g - f[p];
        g = Nt(y, g, w);
      }
      if (s) {
        const b = c === "y" ? "top" : "left", p = c === "y" ? "bottom" : "right", y = h + f[b], w = h - f[p];
        h = Nt(y, h, w);
      }
      const m = l.fn({
        ...t,
        [d]: g,
        [c]: h
      });
      return {
        ...m,
        data: {
          x: m.x - n,
          y: m.y - r,
          enabled: {
            [d]: i,
            [c]: s
          }
        }
      };
    }
  };
}, Ai = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: o,
        rects: i,
        platform: s,
        elements: l
      } = t, {
        apply: a = () => {
        },
        ...u
      } = Le(e, t), f = await qe(t, u), c = we(o), d = ze(o), g = be(o) === "y", {
        width: h,
        height: m
      } = i.floating;
      let b, p;
      c === "top" || c === "bottom" ? (b = c, p = d === (await (s.isRTL == null ? void 0 : s.isRTL(l.floating)) ? "start" : "end") ? "left" : "right") : (p = c, b = d === "end" ? "top" : "bottom");
      const y = m - f.top - f.bottom, w = h - f.left - f.right, v = ye(m - f[b], y), x = ye(h - f[p], w), A = !t.middlewareData.shift;
      let C = v, O = x;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (O = w), (r = t.middlewareData.shift) != null && r.enabled.y && (C = y), A && !d) {
        const B = K(f.left, 0), j = K(f.right, 0), E = K(f.top, 0), Y = K(f.bottom, 0);
        g ? O = h - 2 * (B !== 0 || j !== 0 ? B + j : K(f.left, f.right)) : C = m - 2 * (E !== 0 || Y !== 0 ? E + Y : K(f.top, f.bottom));
      }
      await a({
        ...t,
        availableWidth: O,
        availableHeight: C
      });
      const R = await s.getDimensions(l.floating);
      return h !== R.width || m !== R.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Ct() {
  return typeof window < "u";
}
function Be(e) {
  return Kn(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function J(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function le(e) {
  var t;
  return (t = (Kn(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Kn(e) {
  return Ct() ? e instanceof Node || e instanceof J(e).Node : !1;
}
function ne(e) {
  return Ct() ? e instanceof Element || e instanceof J(e).Element : !1;
}
function ie(e) {
  return Ct() ? e instanceof HTMLElement || e instanceof J(e).HTMLElement : !1;
}
function Cn(e) {
  return !Ct() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof J(e).ShadowRoot;
}
function et(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: o
  } = re(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !["inline", "contents"].includes(o);
}
function Ci(e) {
  return ["table", "td", "th"].includes(Be(e));
}
function Pt(e) {
  return [":popover-open", ":modal"].some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function Gt(e) {
  const t = Xt(), n = ne(e) ? re(e) : e;
  return ["transform", "translate", "scale", "rotate", "perspective"].some((r) => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((r) => (n.willChange || "").includes(r)) || ["paint", "layout", "strict", "content"].some((r) => (n.contain || "").includes(r));
}
function Pi(e) {
  let t = xe(e);
  for (; ie(t) && !Ne(t); ) {
    if (Gt(t))
      return t;
    if (Pt(t))
      return null;
    t = xe(t);
  }
  return null;
}
function Xt() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
function Ne(e) {
  return ["html", "body", "#document"].includes(Be(e));
}
function re(e) {
  return J(e).getComputedStyle(e);
}
function St(e) {
  return ne(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function xe(e) {
  if (Be(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Cn(e) && e.host || // Fallback.
    le(e)
  );
  return Cn(t) ? t.host : t;
}
function Jn(e) {
  const t = xe(e);
  return Ne(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : ie(t) && et(t) ? t : Jn(t);
}
function Ke(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = Jn(e), i = o === ((r = e.ownerDocument) == null ? void 0 : r.body), s = J(o);
  if (i) {
    const l = Mt(s);
    return t.concat(s, s.visualViewport || [], et(o) ? o : [], l && n ? Ke(l) : []);
  }
  return t.concat(o, Ke(o, [], n));
}
function Mt(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Zn(e) {
  const t = re(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const o = ie(e), i = o ? e.offsetWidth : n, s = o ? e.offsetHeight : r, l = gt(n) !== i || gt(r) !== s;
  return l && (n = i, r = s), {
    width: n,
    height: r,
    $: l
  };
}
function Yt(e) {
  return ne(e) ? e : e.contextElement;
}
function $e(e) {
  const t = Yt(e);
  if (!ie(t))
    return oe(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: o,
    $: i
  } = Zn(t);
  let s = (i ? gt(n.width) : n.width) / r, l = (i ? gt(n.height) : n.height) / o;
  return (!s || !Number.isFinite(s)) && (s = 1), (!l || !Number.isFinite(l)) && (l = 1), {
    x: s,
    y: l
  };
}
const Si = /* @__PURE__ */ oe(0);
function Qn(e) {
  const t = J(e);
  return !Xt() || !t.visualViewport ? Si : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Ei(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== J(e) ? !1 : t;
}
function Ee(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(), i = Yt(e);
  let s = oe(1);
  t && (r ? ne(r) && (s = $e(r)) : s = $e(e));
  const l = Ei(i, n, r) ? Qn(i) : oe(0);
  let a = (o.left + l.x) / s.x, u = (o.top + l.y) / s.y, f = o.width / s.x, c = o.height / s.y;
  if (i) {
    const d = J(i), g = r && ne(r) ? J(r) : r;
    let h = d, m = Mt(h);
    for (; m && r && g !== h; ) {
      const b = $e(m), p = m.getBoundingClientRect(), y = re(m), w = p.left + (m.clientLeft + parseFloat(y.paddingLeft)) * b.x, v = p.top + (m.clientTop + parseFloat(y.paddingTop)) * b.y;
      a *= b.x, u *= b.y, f *= b.x, c *= b.y, a += w, u += v, h = J(m), m = Mt(h);
    }
  }
  return pt({
    width: f,
    height: c,
    x: a,
    y: u
  });
}
function qt(e, t) {
  const n = St(e).scrollLeft;
  return t ? t.left + n : Ee(le(e)).left + n;
}
function er(e, t, n) {
  n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), o = r.left + t.scrollLeft - (n ? 0 : (
    // RTL <body> scrollbar.
    qt(e, r)
  )), i = r.top + t.scrollTop;
  return {
    x: o,
    y: i
  };
}
function Oi(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: o
  } = e;
  const i = o === "fixed", s = le(r), l = t ? Pt(t.floating) : !1;
  if (r === s || l && i)
    return n;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = oe(1);
  const f = oe(0), c = ie(r);
  if ((c || !c && !i) && ((Be(r) !== "body" || et(s)) && (a = St(r)), ie(r))) {
    const g = Ee(r);
    u = $e(r), f.x = g.x + r.clientLeft, f.y = g.y + r.clientTop;
  }
  const d = s && !c && !i ? er(s, a, !0) : oe(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - a.scrollLeft * u.x + f.x + d.x,
    y: n.y * u.y - a.scrollTop * u.y + f.y + d.y
  };
}
function ki(e) {
  return Array.from(e.getClientRects());
}
function Li(e) {
  const t = le(e), n = St(e), r = e.ownerDocument.body, o = K(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), i = K(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + qt(e);
  const l = -n.scrollTop;
  return re(r).direction === "rtl" && (s += K(t.clientWidth, r.clientWidth) - o), {
    width: o,
    height: i,
    x: s,
    y: l
  };
}
function Ti(e, t) {
  const n = J(e), r = le(e), o = n.visualViewport;
  let i = r.clientWidth, s = r.clientHeight, l = 0, a = 0;
  if (o) {
    i = o.width, s = o.height;
    const u = Xt();
    (!u || u && t === "fixed") && (l = o.offsetLeft, a = o.offsetTop);
  }
  return {
    width: i,
    height: s,
    x: l,
    y: a
  };
}
function Di(e, t) {
  const n = Ee(e, !0, t === "fixed"), r = n.top + e.clientTop, o = n.left + e.clientLeft, i = ie(e) ? $e(e) : oe(1), s = e.clientWidth * i.x, l = e.clientHeight * i.y, a = o * i.x, u = r * i.y;
  return {
    width: s,
    height: l,
    x: a,
    y: u
  };
}
function Pn(e, t, n) {
  let r;
  if (t === "viewport")
    r = Ti(e, n);
  else if (t === "document")
    r = Li(le(e));
  else if (ne(t))
    r = Di(t, n);
  else {
    const o = Qn(e);
    r = {
      x: t.x - o.x,
      y: t.y - o.y,
      width: t.width,
      height: t.height
    };
  }
  return pt(r);
}
function tr(e, t) {
  const n = xe(e);
  return n === t || !ne(n) || Ne(n) ? !1 : re(n).position === "fixed" || tr(n, t);
}
function Ri(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = Ke(e, [], !1).filter((l) => ne(l) && Be(l) !== "body"), o = null;
  const i = re(e).position === "fixed";
  let s = i ? xe(e) : e;
  for (; ne(s) && !Ne(s); ) {
    const l = re(s), a = Gt(s);
    !a && l.position === "fixed" && (o = null), (i ? !a && !o : !a && l.position === "static" && !!o && ["absolute", "fixed"].includes(o.position) || et(s) && !a && tr(e, s)) ? r = r.filter((f) => f !== s) : o = l, s = xe(s);
  }
  return t.set(e, r), r;
}
function _i(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: o
  } = e;
  const s = [...n === "clippingAncestors" ? Pt(t) ? [] : Ri(t, this._c) : [].concat(n), r], l = s[0], a = s.reduce((u, f) => {
    const c = Pn(t, f, o);
    return u.top = K(c.top, u.top), u.right = ye(c.right, u.right), u.bottom = ye(c.bottom, u.bottom), u.left = K(c.left, u.left), u;
  }, Pn(t, l, o));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top
  };
}
function $i(e) {
  const {
    width: t,
    height: n
  } = Zn(e);
  return {
    width: t,
    height: n
  };
}
function Ni(e, t, n) {
  const r = ie(t), o = le(t), i = n === "fixed", s = Ee(e, !0, i, t);
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = oe(0);
  function u() {
    a.x = qt(o);
  }
  if (r || !r && !i)
    if ((Be(t) !== "body" || et(o)) && (l = St(t)), r) {
      const g = Ee(t, !0, i, t);
      a.x = g.x + t.clientLeft, a.y = g.y + t.clientTop;
    } else o && u();
  i && !r && o && u();
  const f = o && !r && !i ? er(o, l) : oe(0), c = s.left + l.scrollLeft - a.x - f.x, d = s.top + l.scrollTop - a.y - f.y;
  return {
    x: c,
    y: d,
    width: s.width,
    height: s.height
  };
}
function Lt(e) {
  return re(e).position === "static";
}
function Sn(e, t) {
  if (!ie(e) || re(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return le(e) === n && (n = n.ownerDocument.body), n;
}
function nr(e, t) {
  const n = J(e);
  if (Pt(e))
    return n;
  if (!ie(e)) {
    let o = xe(e);
    for (; o && !Ne(o); ) {
      if (ne(o) && !Lt(o))
        return o;
      o = xe(o);
    }
    return n;
  }
  let r = Sn(e, t);
  for (; r && Ci(r) && Lt(r); )
    r = Sn(r, t);
  return r && Ne(r) && Lt(r) && !Gt(r) ? n : r || Pi(e) || n;
}
const Ii = async function(e) {
  const t = this.getOffsetParent || nr, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: Ni(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function Mi(e) {
  return re(e).direction === "rtl";
}
const rr = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Oi,
  getDocumentElement: le,
  getClippingRect: _i,
  getOffsetParent: nr,
  getElementRects: Ii,
  getClientRects: ki,
  getDimensions: $i,
  getScale: $e,
  isElement: ne,
  isRTL: Mi
};
function or(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function zi(e, t) {
  let n = null, r;
  const o = le(e);
  function i() {
    var l;
    clearTimeout(r), (l = n) == null || l.disconnect(), n = null;
  }
  function s(l, a) {
    l === void 0 && (l = !1), a === void 0 && (a = 1), i();
    const u = e.getBoundingClientRect(), {
      left: f,
      top: c,
      width: d,
      height: g
    } = u;
    if (l || t(), !d || !g)
      return;
    const h = nt(c), m = nt(o.clientWidth - (f + d)), b = nt(o.clientHeight - (c + g)), p = nt(f), w = {
      rootMargin: -h + "px " + -m + "px " + -b + "px " + -p + "px",
      threshold: K(0, ye(1, a)) || 1
    };
    let v = !0;
    function x(A) {
      const C = A[0].intersectionRatio;
      if (C !== a) {
        if (!v)
          return s();
        C ? s(!1, C) : r = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      C === 1 && !or(u, e.getBoundingClientRect()) && s(), v = !1;
    }
    try {
      n = new IntersectionObserver(x, {
        ...w,
        // Handle <iframe>s
        root: o.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(x, w);
    }
    n.observe(e);
  }
  return s(!0), i;
}
function Bi(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: o = !0,
    ancestorResize: i = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: l = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = r, u = Yt(e), f = o || i ? [...u ? Ke(u) : [], ...Ke(t)] : [];
  f.forEach((p) => {
    o && p.addEventListener("scroll", n, {
      passive: !0
    }), i && p.addEventListener("resize", n);
  });
  const c = u && l ? zi(u, n) : null;
  let d = -1, g = null;
  s && (g = new ResizeObserver((p) => {
    let [y] = p;
    y && y.target === u && g && (g.unobserve(t), cancelAnimationFrame(d), d = requestAnimationFrame(() => {
      var w;
      (w = g) == null || w.observe(t);
    })), n();
  }), u && !a && g.observe(u), g.observe(t));
  let h, m = a ? Ee(e) : null;
  a && b();
  function b() {
    const p = Ee(e);
    m && !or(m, p) && n(), m = p, h = requestAnimationFrame(b);
  }
  return n(), () => {
    var p;
    f.forEach((y) => {
      o && y.removeEventListener("scroll", n), i && y.removeEventListener("resize", n);
    }), c?.(), (p = g) == null || p.disconnect(), g = null, a && cancelAnimationFrame(h);
  };
}
const Ui = xi, Fi = vi, Vi = bi, ji = Ai, Wi = yi, Hi = mi, Gi = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), o = {
    platform: rr,
    ...n
  }, i = {
    ...o.platform,
    _c: r
  };
  return pi(e, t, {
    ...o,
    platform: i
  });
};
var Xi = /* @__PURE__ */ Oe('<svg display=block viewBox="0 0 30 30"style=transform:scale(1.02)><g><path fill=none d=M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z></path><path stroke=none d=M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z>'), Kt = yt();
function Jt() {
  const e = wt(Kt);
  if (e === void 0)
    throw new Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");
  return e;
}
var zt = 30, En = zt / 2, Yi = {
  top: 180,
  right: -90,
  bottom: 0,
  left: 90
};
function Zt(e) {
  const t = Jt(), n = vt({
    size: zt
  }, e), [r, o] = he(n, ["ref", "style", "size"]), i = () => t.currentPlacement().split("-")[0], s = qi(t.contentRef), l = () => s()?.getPropertyValue("background-color") || "none", a = () => s()?.getPropertyValue(`border-${i()}-color`) || "none", u = () => s()?.getPropertyValue(`border-${i()}-width`) || "0px", f = () => Number.parseInt(u()) * 2 * (zt / r.size), c = () => `rotate(${Yi[i()]} ${En} ${En}) translate(0 2)`;
  return L(At, se({
    as: "div",
    ref(d) {
      var g = Qe(t.setArrowRef, r.ref);
      typeof g == "function" && g(d);
    },
    "aria-hidden": "true",
    get style() {
      return Vt({
        // server side rendering
        position: "absolute",
        "font-size": `${r.size}px`,
        width: "1em",
        height: "1em",
        "pointer-events": "none",
        fill: l(),
        stroke: a(),
        "stroke-width": f()
      }, r.style);
    }
  }, o, {
    get children() {
      var d = Xi(), g = d.firstChild, h = g.firstChild;
      return h.nextSibling, fe(() => Xe(g, "transform", c())), d;
    }
  }));
}
function qi(e) {
  const [t, n] = I();
  return U(() => {
    const r = e();
    r && n(Bn(r).getComputedStyle(r));
  }), t;
}
function Ki(e) {
  const t = Jt(), [n, r] = he(e, ["ref", "style"]);
  return L(At, se({
    as: "div",
    ref(o) {
      var i = Qe(t.setPositionerRef, n.ref);
      typeof i == "function" && i(o);
    },
    "data-popper-positioner": "",
    get style() {
      return Vt({
        position: "absolute",
        top: 0,
        left: 0,
        "min-width": "max-content"
      }, n.style);
    }
  }, r));
}
function On(e) {
  const {
    x: t = 0,
    y: n = 0,
    width: r = 0,
    height: o = 0
  } = e ?? {};
  if (typeof DOMRect == "function")
    return new DOMRect(t, n, r, o);
  const i = {
    x: t,
    y: n,
    width: r,
    height: o,
    top: n,
    right: t + r,
    bottom: n + o,
    left: t
  };
  return {
    ...i,
    toJSON: () => i
  };
}
function Ji(e, t) {
  return {
    contextElement: e,
    getBoundingClientRect: () => {
      const r = t(e);
      return r ? On(r) : e ? e.getBoundingClientRect() : On();
    }
  };
}
function Zi(e) {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(e);
}
var Qi = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
function es(e, t) {
  const [n, r] = e.split("-"), o = Qi[n];
  return r ? n === "left" || n === "right" ? `${o} ${r === "start" ? "top" : "bottom"}` : r === "start" ? `${o} ${t === "rtl" ? "right" : "left"}` : `${o} ${t === "rtl" ? "left" : "right"}` : `${o} center`;
}
function ts(e) {
  const t = vt({
    getAnchorRect: (d) => d?.getBoundingClientRect(),
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
  }, e), [n, r] = I(), [o, i] = I(), [s, l] = I(t.placement), a = () => Ji(t.anchorRef?.(), t.getAnchorRect), {
    direction: u
  } = si();
  async function f() {
    const d = a(), g = n(), h = o();
    if (!d || !g)
      return;
    const m = (h?.clientHeight || 0) / 2, b = typeof t.gutter == "number" ? t.gutter + m : t.gutter ?? m;
    g.style.setProperty("--kb-popper-content-overflow-padding", `${t.overflowPadding}px`), d.getBoundingClientRect();
    const p = [
      // https://floating-ui.com/docs/offset
      Ui(({
        placement: A
      }) => {
        const C = !!A.split("-")[1];
        return {
          mainAxis: b,
          crossAxis: C ? void 0 : t.shift,
          alignmentAxis: t.shift
        };
      })
    ];
    if (t.flip !== !1) {
      const A = typeof t.flip == "string" ? t.flip.split(" ") : void 0;
      if (A !== void 0 && !A.every(Zi))
        throw new Error("`flip` expects a spaced-delimited list of placements");
      p.push(Vi({
        padding: t.overflowPadding,
        fallbackPlacements: A
      }));
    }
    (t.slide || t.overlap) && p.push(Fi({
      mainAxis: t.slide,
      crossAxis: t.overlap,
      padding: t.overflowPadding
    })), p.push(ji({
      padding: t.overflowPadding,
      apply({
        availableWidth: A,
        availableHeight: C,
        rects: O
      }) {
        const R = Math.round(O.reference.width);
        A = Math.floor(A), C = Math.floor(C), g.style.setProperty("--kb-popper-anchor-width", `${R}px`), g.style.setProperty("--kb-popper-content-available-width", `${A}px`), g.style.setProperty("--kb-popper-content-available-height", `${C}px`), t.sameWidth && (g.style.width = `${R}px`), t.fitViewport && (g.style.maxWidth = `${A}px`, g.style.maxHeight = `${C}px`);
      }
    })), t.hideWhenDetached && p.push(Wi({
      padding: t.detachedPadding
    })), h && p.push(Hi({
      element: h,
      padding: t.arrowPadding
    }));
    const y = await Gi(d, g, {
      placement: t.placement,
      strategy: "absolute",
      middleware: p,
      platform: {
        ...rr,
        isRTL: () => u() === "rtl"
      }
    });
    if (l(y.placement), t.onCurrentPlacementChange?.(y.placement), !g)
      return;
    g.style.setProperty("--kb-popper-content-transform-origin", es(y.placement, u()));
    const w = Math.round(y.x), v = Math.round(y.y);
    let x;
    if (t.hideWhenDetached && (x = y.middlewareData.hide?.referenceHidden ? "hidden" : "visible"), Object.assign(g.style, {
      top: "0",
      left: "0",
      transform: `translate3d(${w}px, ${v}px, 0)`,
      visibility: x
    }), h && y.middlewareData.arrow) {
      const {
        x: A,
        y: C
      } = y.middlewareData.arrow, O = y.placement.split("-")[0];
      Object.assign(h.style, {
        left: A != null ? `${A}px` : "",
        top: C != null ? `${C}px` : "",
        [O]: "100%"
      });
    }
  }
  U(() => {
    const d = a(), g = n();
    if (!d || !g)
      return;
    const h = Bi(d, g, f, {
      // JSDOM doesn't support ResizeObserver
      elementResize: typeof ResizeObserver == "function"
    });
    X(h);
  }), U(() => {
    const d = n(), g = t.contentRef?.();
    !d || !g || queueMicrotask(() => {
      d.style.zIndex = getComputedStyle(g).zIndex;
    });
  });
  const c = {
    currentPlacement: s,
    contentRef: () => t.contentRef?.(),
    setPositionerRef: r,
    setArrowRef: i
  };
  return L(Kt.Provider, {
    value: c,
    get children() {
      return t.children;
    }
  });
}
var ir = Object.assign(ts, {
  Arrow: Zt,
  Context: Kt,
  usePopperContext: Jt,
  Positioner: Ki
}), ns = "data-kb-top-layer", sr, Bt = !1, ge = [];
function Je(e) {
  return ge.findIndex((t) => t.node === e);
}
function rs(e) {
  return ge[Je(e)];
}
function os(e) {
  return ge[ge.length - 1].node === e;
}
function lr() {
  return ge.filter((e) => e.isPointerBlocking);
}
function is() {
  return [...lr()].slice(-1)[0];
}
function Qt() {
  return lr().length > 0;
}
function ar(e) {
  const t = Je(is()?.node);
  return Je(e) < t;
}
function ss(e) {
  ge.push(e);
}
function ls(e) {
  const t = Je(e);
  t < 0 || ge.splice(t, 1);
}
function as() {
  for (const {
    node: e
  } of ge)
    e.style.pointerEvents = ar(e) ? "none" : "auto";
}
function cs(e) {
  if (Qt() && !Bt) {
    const t = de(e);
    sr = document.body.style.pointerEvents, t.body.style.pointerEvents = "none", Bt = !0;
  }
}
function us(e) {
  if (Qt())
    return;
  const t = de(e);
  t.body.style.pointerEvents = sr, t.body.style.length === 0 && t.body.removeAttribute("style"), Bt = !1;
}
var q = {
  layers: ge,
  isTopMostLayer: os,
  hasPointerBlockingLayer: Qt,
  isBelowPointerBlockingLayer: ar,
  addLayer: ss,
  removeLayer: ls,
  indexOf: Je,
  find: rs,
  assignPointerEventToLayers: as,
  disableBodyPointerEvents: cs,
  restoreBodyPointerEvents: us
}, kn = "interactOutside.pointerDownOutside", Ln = "interactOutside.focusOutside";
function fs(e, t) {
  let n, r = uo;
  const o = () => de(t()), i = (c) => e.onPointerDownOutside?.(c), s = (c) => e.onFocusOutside?.(c), l = (c) => e.onInteractOutside?.(c), a = (c) => {
    const d = c.target;
    return !(d instanceof HTMLElement) || d.closest(`[${ns}]`) || !Se(o(), d) || Se(t(), d) ? !1 : !e.shouldExcludeElement?.(d);
  }, u = (c) => {
    function d() {
      const g = t(), h = c.target;
      if (!g || !h || !a(c))
        return;
      const m = hn([i, l]);
      h.addEventListener(kn, m, {
        once: !0
      });
      const b = new CustomEvent(kn, {
        bubbles: !1,
        cancelable: !0,
        detail: {
          originalEvent: c,
          isContextMenu: c.button === 2 || co(c) && c.button === 0
        }
      });
      h.dispatchEvent(b);
    }
    c.pointerType === "touch" ? (o().removeEventListener("click", d), r = d, o().addEventListener("click", d, {
      once: !0
    })) : d();
  }, f = (c) => {
    const d = t(), g = c.target;
    if (!d || !g || !a(c))
      return;
    const h = hn([s, l]);
    g.addEventListener(Ln, h, {
      once: !0
    });
    const m = new CustomEvent(Ln, {
      bubbles: !1,
      cancelable: !0,
      detail: {
        originalEvent: c,
        isContextMenu: !1
      }
    });
    g.dispatchEvent(m);
  };
  U(() => {
    dt(e.isDisabled) || (n = window.setTimeout(() => {
      o().addEventListener("pointerdown", u, !0);
    }, 0), o().addEventListener("focusin", f, !0), X(() => {
      window.clearTimeout(n), o().removeEventListener("click", r), o().removeEventListener("pointerdown", u, !0), o().removeEventListener("focusin", f, !0);
    }));
  });
}
function ds(e) {
  const t = (n) => {
    n.key === Un.Escape && e.onEscapeKeyDown?.(n);
  };
  U(() => {
    if (dt(e.isDisabled))
      return;
    const n = e.ownerDocument?.() ?? de();
    n.addEventListener("keydown", t), X(() => {
      n.removeEventListener("keydown", t);
    });
  });
}
var cr = yt();
function gs() {
  return wt(cr);
}
function hs(e) {
  let t;
  const n = gs(), [r, o] = he(e, ["ref", "disableOutsidePointerEvents", "excludedElements", "onEscapeKeyDown", "onPointerDownOutside", "onFocusOutside", "onInteractOutside", "onDismiss", "bypassTopMostLayerCheck"]), i = /* @__PURE__ */ new Set([]), s = (c) => {
    i.add(c);
    const d = n?.registerNestedLayer(c);
    return () => {
      i.delete(c), d?.();
    };
  };
  fs({
    shouldExcludeElement: (c) => t ? r.excludedElements?.some((d) => Se(d(), c)) || [...i].some((d) => Se(d, c)) : !1,
    onPointerDownOutside: (c) => {
      !t || q.isBelowPointerBlockingLayer(t) || !r.bypassTopMostLayerCheck && !q.isTopMostLayer(t) || (r.onPointerDownOutside?.(c), r.onInteractOutside?.(c), c.defaultPrevented || r.onDismiss?.());
    },
    onFocusOutside: (c) => {
      r.onFocusOutside?.(c), r.onInteractOutside?.(c), c.defaultPrevented || r.onDismiss?.();
    }
  }, () => t), ds({
    ownerDocument: () => de(t),
    onEscapeKeyDown: (c) => {
      !t || !q.isTopMostLayer(t) || (r.onEscapeKeyDown?.(c), !c.defaultPrevented && r.onDismiss && (c.preventDefault(), r.onDismiss()));
    }
  }), bt(() => {
    if (!t)
      return;
    q.addLayer({
      node: t,
      isPointerBlocking: r.disableOutsidePointerEvents,
      dismiss: r.onDismiss
    });
    const c = n?.registerNestedLayer(t);
    q.assignPointerEventToLayers(), q.disableBodyPointerEvents(t), X(() => {
      t && (q.removeLayer(t), c?.(), q.assignPointerEventToLayers(), q.restoreBodyPointerEvents(t));
    });
  }), U(ct([() => t, () => r.disableOutsidePointerEvents], ([c, d]) => {
    if (!c)
      return;
    const g = q.find(c);
    g && g.isPointerBlocking !== d && (g.isPointerBlocking = d, q.assignPointerEventToLayers()), d && q.disableBodyPointerEvents(c), X(() => {
      q.restoreBodyPointerEvents(c);
    });
  }, {
    defer: !0
  }));
  const f = {
    registerNestedLayer: s
  };
  return L(cr.Provider, {
    value: f,
    get children() {
      return L(At, se({
        as: "div",
        ref(c) {
          var d = Qe((g) => t = g, r.ref);
          typeof d == "function" && d(c);
        }
      }, o));
    }
  });
}
function ps(e = {}) {
  const [t, n] = po({
    value: () => dt(e.open),
    defaultValue: () => !!dt(e.defaultOpen),
    onChange: (s) => e.onOpenChange?.(s)
  }), r = () => {
    n(!0);
  }, o = () => {
    n(!1);
  };
  return {
    isOpen: t,
    setIsOpen: n,
    open: r,
    close: o,
    toggle: () => {
      t() ? o() : r();
    }
  };
}
var rt = (e) => typeof e == "function" ? e() : e, ms = (e) => {
  const t = W(() => {
    const s = rt(e.element);
    if (s)
      return getComputedStyle(s);
  }), n = () => t()?.animationName ?? "none", [r, o] = I(rt(e.show) ? "present" : "hidden");
  let i = "none";
  return U((s) => {
    const l = rt(e.show);
    return Z(() => {
      if (s === l) return l;
      const a = i, u = n();
      l ? o("present") : u === "none" || t()?.display === "none" ? o("hidden") : o(s === !0 && a !== u ? "hiding" : "hidden");
    }), l;
  }), U(() => {
    const s = rt(e.element);
    if (!s) return;
    const l = (u) => {
      u.target === s && (i = n());
    }, a = (u) => {
      const c = n().includes(u.animationName);
      u.target === s && c && r() === "hiding" && o("hidden");
    };
    s.addEventListener("animationstart", l), s.addEventListener("animationcancel", a), s.addEventListener("animationend", a), X(() => {
      s.removeEventListener("animationstart", l), s.removeEventListener("animationcancel", a), s.removeEventListener("animationend", a);
    });
  }), {
    present: () => r() === "present" || r() === "hiding",
    state: r,
    setState: o
  };
}, bs = ms, ys = bs, ws = {};
yo(ws, {
  Arrow: () => Zt,
  Content: () => tn,
  Portal: () => nn,
  Root: () => rn,
  Tooltip: () => As,
  Trigger: () => on
});
var ur = yt();
function en() {
  const e = wt(ur);
  if (e === void 0)
    throw new Error("[kobalte]: `useTooltipContext` must be used within a `Tooltip` component");
  return e;
}
function tn(e) {
  const t = en(), n = vt({
    id: t.generateId("content")
  }, e), [r, o] = he(n, ["ref", "style"]);
  return U(() => X(t.registerContentId(o.id))), L(Ge, {
    get when() {
      return t.contentPresent();
    },
    get children() {
      return L(ir.Positioner, {
        get children() {
          return L(hs, se({
            ref(i) {
              var s = Qe((l) => {
                t.setContentRef(l);
              }, r.ref);
              typeof s == "function" && s(i);
            },
            role: "tooltip",
            disableOutsidePointerEvents: !1,
            get style() {
              return Vt({
                "--kb-tooltip-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                position: "relative"
              }, r.style);
            },
            onFocusOutside: (i) => i.preventDefault(),
            onDismiss: () => t.hideTooltip(!0)
          }, () => t.dataset(), o));
        }
      });
    }
  });
}
function nn(e) {
  const t = en();
  return L(Ge, {
    get when() {
      return t.contentPresent();
    },
    get children() {
      return L(Qr, e);
    }
  });
}
function xs(e, t, n) {
  const r = e.split("-")[0], o = t.getBoundingClientRect(), i = n.getBoundingClientRect(), s = [], l = o.left + o.width / 2, a = o.top + o.height / 2;
  switch (r) {
    case "top":
      s.push([o.left, a]), s.push([i.left, i.bottom]), s.push([i.left, i.top]), s.push([i.right, i.top]), s.push([i.right, i.bottom]), s.push([o.right, a]);
      break;
    case "right":
      s.push([l, o.top]), s.push([i.left, i.top]), s.push([i.right, i.top]), s.push([i.right, i.bottom]), s.push([i.left, i.bottom]), s.push([l, o.bottom]);
      break;
    case "bottom":
      s.push([o.left, a]), s.push([i.left, i.top]), s.push([i.left, i.bottom]), s.push([i.right, i.bottom]), s.push([i.right, i.top]), s.push([o.right, a]);
      break;
    case "left":
      s.push([l, o.top]), s.push([i.right, i.top]), s.push([i.left, i.top]), s.push([i.left, i.bottom]), s.push([i.right, i.bottom]), s.push([l, o.bottom]);
      break;
  }
  return s;
}
var Ae = {}, vs = 0, De = !1, ce, je, Re;
function rn(e) {
  const t = `tooltip-${kr()}`, n = `${++vs}`, r = vt({
    id: t,
    openDelay: 700,
    closeDelay: 300,
    skipDelayDuration: 300
  }, e), [o, i] = he(r, ["id", "open", "defaultOpen", "onOpenChange", "disabled", "triggerOnFocusOnly", "openDelay", "closeDelay", "skipDelayDuration", "ignoreSafeArea", "forceMount"]);
  let s;
  const [l, a] = I(), [u, f] = I(), [c, d] = I(), [g, h] = I(i.placement), m = ps({
    open: () => o.open,
    defaultOpen: () => o.defaultOpen,
    onOpenChange: (S) => o.onOpenChange?.(S)
  }), {
    present: b
  } = ys({
    show: () => o.forceMount || m.isOpen(),
    element: () => c() ?? null
  }), p = () => {
    Ae[n] = w;
  }, y = () => {
    for (const S in Ae)
      S !== n && (Ae[S](!0), delete Ae[S]);
  }, w = (S = !1) => {
    S || o.closeDelay && o.closeDelay <= 0 ? (window.clearTimeout(s), s = void 0, m.close()) : s || (s = window.setTimeout(() => {
      s = void 0, m.close();
    }, o.closeDelay)), window.clearTimeout(ce), ce = void 0, o.skipDelayDuration && o.skipDelayDuration >= 0 && (Re = window.setTimeout(() => {
      window.clearTimeout(Re), Re = void 0;
    }, o.skipDelayDuration)), De && (window.clearTimeout(je), je = window.setTimeout(() => {
      delete Ae[n], je = void 0, De = !1;
    }, o.closeDelay));
  }, v = () => {
    clearTimeout(s), s = void 0, y(), p(), De = !0, m.open(), window.clearTimeout(ce), ce = void 0, window.clearTimeout(je), je = void 0, window.clearTimeout(Re), Re = void 0;
  }, x = () => {
    y(), p(), !m.isOpen() && !ce && !De ? ce = window.setTimeout(() => {
      ce = void 0, De = !0, v();
    }, o.openDelay) : m.isOpen() || v();
  }, A = (S = !1) => {
    !S && o.openDelay && o.openDelay > 0 && !s && !Re ? x() : v();
  }, C = () => {
    window.clearTimeout(ce), ce = void 0, De = !1;
  }, O = () => {
    window.clearTimeout(s), s = void 0;
  }, R = (S) => Se(u(), S) || Se(c(), S), B = (S) => {
    const $ = u(), M = c();
    if (!(!$ || !M))
      return xs(S, $, M);
  }, j = (S) => {
    const $ = S.target;
    if (R($)) {
      O();
      return;
    }
    if (!o.ignoreSafeArea) {
      const M = B(g());
      if (M && go(fo(S), M)) {
        O();
        return;
      }
    }
    s || w();
  };
  U(() => {
    if (!m.isOpen())
      return;
    const S = de();
    S.addEventListener("pointermove", j, !0), X(() => {
      S.removeEventListener("pointermove", j, !0);
    });
  }), U(() => {
    const S = u();
    if (!S || !m.isOpen())
      return;
    const $ = (H) => {
      const G = H.target;
      Se(G, S) && w(!0);
    }, M = Bn();
    M.addEventListener("scroll", $, {
      capture: !0
    }), X(() => {
      M.removeEventListener("scroll", $, {
        capture: !0
      });
    });
  }), X(() => {
    clearTimeout(s), Ae[n] && delete Ae[n];
  });
  const Y = {
    dataset: W(() => ({
      "data-expanded": m.isOpen() ? "" : void 0,
      "data-closed": m.isOpen() ? void 0 : ""
    })),
    isOpen: m.isOpen,
    isDisabled: () => o.disabled ?? !1,
    triggerOnFocusOnly: () => o.triggerOnFocusOnly ?? !1,
    contentId: l,
    contentPresent: b,
    openTooltip: A,
    hideTooltip: w,
    cancelOpening: C,
    generateId: so(() => r.id),
    registerContentId: mo(a),
    isTargetOnTooltip: R,
    setTriggerRef: f,
    setContentRef: d
  };
  return L(ur.Provider, {
    value: Y,
    get children() {
      return L(ir, se({
        anchorRef: u,
        contentRef: c,
        onCurrentPlacementChange: h
      }, i));
    }
  });
}
function on(e) {
  let t;
  const n = en(), [r, o] = he(e, ["ref", "onPointerEnter", "onPointerLeave", "onPointerDown", "onClick", "onFocus", "onBlur"]);
  let i = !1, s = !1, l = !1;
  const a = () => {
    i = !1;
  }, u = () => {
    !n.isOpen() && (s || l) && n.openTooltip(l);
  }, f = (p) => {
    n.isOpen() && !s && !l && n.hideTooltip(p);
  }, c = (p) => {
    Ce(p, r.onPointerEnter), !(p.pointerType === "touch" || n.triggerOnFocusOnly() || n.isDisabled() || p.defaultPrevented) && (s = !0, u());
  }, d = (p) => {
    Ce(p, r.onPointerLeave), p.pointerType !== "touch" && (s = !1, l = !1, n.isOpen() ? f() : n.cancelOpening());
  }, g = (p) => {
    Ce(p, r.onPointerDown), i = !0, de(t).addEventListener("pointerup", a, {
      once: !0
    });
  }, h = (p) => {
    Ce(p, r.onClick), s = !1, l = !1, f(!0);
  }, m = (p) => {
    Ce(p, r.onFocus), !(n.isDisabled() || p.defaultPrevented || i) && (l = !0, u());
  }, b = (p) => {
    Ce(p, r.onBlur);
    const y = p.relatedTarget;
    n.isTargetOnTooltip(y) || (s = !1, l = !1, f(!0));
  };
  return X(() => {
    de(t).removeEventListener("pointerup", a);
  }), L(At, se({
    as: "button",
    ref(p) {
      var y = Qe((w) => {
        n.setTriggerRef(w), t = w;
      }, r.ref);
      typeof y == "function" && y(p);
    },
    get "aria-describedby"() {
      return Br(() => !!n.isOpen())() ? n.contentId() : void 0;
    },
    onPointerEnter: c,
    onPointerLeave: d,
    onPointerDown: g,
    onClick: h,
    onFocus: m,
    onBlur: b
  }, () => n.dataset(), o));
}
var As = Object.assign(rn, {
  Arrow: Zt,
  Content: tn,
  Portal: nn,
  Trigger: on
});
const fr = on, dr = (e) => L(rn, se({
  gutter: 4
}, e)), gr = (e) => {
  const [t, n] = he(e, ["class"]);
  return L(nn, {
    get children() {
      return L(tn, se({
        get class() {
          return Zo("z-50 origin-[var(--kb-popover-content-transform-origin)] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", t.class);
        }
      }, n));
    }
  });
};
var Cs = /* @__PURE__ */ Oe('<div><span></span><div class="w-full h-0.5 bg-black"></div><div><span></span><span>'), Ps = /* @__PURE__ */ Oe('<div class="flex flex-col gap-2"><div><svg width=16px height=100% viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z"fill=#000000></path></svg></div><div><svg class=rotate-180 width=16px height=100% viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 8L2 8L2 6L8 5.24536e-07L14 6L14 8L10 8L10 16L6 16L6 8Z"fill=#000000>'), Ss = /* @__PURE__ */ Oe('<div class="flex items-center"><div class="flex gap-2">');
const ot = (e) => {
  let t = "", n = "", r = "", o = "";
  e.size === "small" ? (t = "text-sm", n = "text-base", r = "p-1 gap-0", o = "pl-0 text-xs align-top") : e.size === "medium" ? (t = "text-lg", n = "text-xl", r = "p-2 gap-1", o = "pl-0 text-sm align-top") : e.size === "large" ? (t = "text-2xl", n = "text-3xl", r = "p-4 gap-2", o = "pl-0 text-lg align-top") : e.size === "xlarge" && (t = "text-4xl", n = "text-5xl", r = "p-5 gap-2", o = "pl-1 text-2xl align-top");
  const i = r + " rounded-md shadow-md grid grid-cols-1 bg-blue-300" + (e.class || ""), s = t, l = "font-bold lining-nums bg-transparent text-center focus:outline-none leading-none cursor-text " + n;
  let a, u = "";
  return U(ct(() => e.value, () => {
    e.min !== void 0 && e.value < e.min && e.onChange(e.min), e.max !== void 0 && e.value > e.max && e.onChange(e.max);
  })), bt(() => {
    const f = () => {
      a ? U(() => {
        a.addEventListener("blur", () => {
          const c = a.textContent;
          if (!c) {
            a.textContent = u;
            return;
          }
          c !== u && (u = c, e.onChange(Number(c)));
        });
      }) : setTimeout(f, 100);
    };
    f();
  }), (() => {
    var f = Ss(), c = f.firstChild;
    return z(c, L(dr, {
      get children() {
        return [L(fr, {
          class: "cursor-default",
          get children() {
            var d = Cs(), g = d.firstChild, h = g.nextSibling, m = h.nextSibling, b = m.firstChild, p = b.nextSibling;
            te(d, i), te(g, s), z(g, () => e.title);
            var y = a;
            return typeof y == "function" ? Mn(y, b) : a = b, Xe(b, "contenteditable", !0), te(b, l), z(b, () => e.value), te(p, o), z(p, () => e.units || ""), d;
          }
        }), L(Ge, {
          get when() {
            return e.description;
          },
          get children() {
            return L(gr, {
              get children() {
                return e.description;
              }
            });
          }
        })];
      }
    }), null), z(c, L(Ge, {
      get when() {
        return e.increment;
      },
      get children() {
        var d = Ps(), g = d.firstChild, h = g.nextSibling;
        return g.$$click = () => {
          e.onChange(e.value + e.increment), u = e.value.toString();
        }, te(g, "rounded-md shadow-md px-5 bg-blue-300 h-1/2 cursor-pointer hover:bg-blue-400 active:bg-blue-500 " + t), h.$$click = () => {
          e.onChange(e.value - e.increment), u = e.value.toString();
        }, te(h, "rounded-md shadow-md px-5 bg-blue-300 h-1/2 cursor-pointer hover:bg-blue-400 active:bg-blue-500 " + t), d;
      }
    }), null), f;
  })();
};
xt(["click"]);
var Es = /* @__PURE__ */ Oe('<div><span></span><div class="w-full h-0.5 bg-black"></div><div><span></span><span>'), Os = /* @__PURE__ */ Oe('<div class="flex items-center">');
const it = (e) => {
  const t = e.color || "#93c5fd", n = "#fef9c3", [r, o] = I(""), [i, s] = I(t);
  let l = "", a = "", u = "", f = "";
  e.size === "small" ? (l = "text-sm", a = "text-base", u = "p-1 gap-0", f = "pl-0 text-xs align-top") : e.size === "medium" ? (l = "text-lg", a = "text-xl", u = "p-2 gap-1", f = "pl-0 text-sm align-top") : e.size === "large" ? (l = "text-2xl", a = "text-3xl", u = "p-4 gap-2", f = "pl-0 text-lg align-top") : e.size === "xlarge" && (l = "text-4xl", a = "text-5xl", u = "p-5 gap-2", f = "pl-1 text-2xl align-top");
  const c = u + " rounded-md shadow-md grid grid-cols-1" + (e.class || ""), d = l, g = "overflow-hidden text-ellipsis font-bold lining-nums " + a;
  return U(ct(() => e.value, () => {
    e.reactive && (s(n), o("none"), setTimeout(() => {
      s(e.color || t), o("background-color 0.75s");
    }, 100));
  })), U(ct(() => e.color, () => {
    e.color && s(e.color);
  })), (() => {
    var h = Os();
    return z(h, L(dr, {
      get children() {
        return [L(fr, {
          class: "cursor-default",
          get children() {
            var m = Es(), b = m.firstChild, p = b.nextSibling, y = p.nextSibling, w = y.firstChild, v = w.nextSibling;
            return te(m, c), te(b, d), z(b, () => e.title), te(w, g), z(w, () => e.value), te(v, f), z(v, () => e.units || ""), fe((x) => {
              var A = i(), C = r();
              return A !== x.e && ((x.e = A) != null ? m.style.setProperty("background-color", A) : m.style.removeProperty("background-color")), C !== x.t && ((x.t = C) != null ? m.style.setProperty("transition", C) : m.style.removeProperty("transition")), x;
            }, {
              e: void 0,
              t: void 0
            }), m;
          }
        }), L(Ge, {
          get when() {
            return e.description;
          },
          get children() {
            return L(gr, {
              get children() {
                return e.description;
              }
            });
          }
        })];
      }
    })), h;
  })();
};
xt(["click"]);
class k {
  data;
  intype;
  constructor(t, n = "native") {
    this.data = t, this.intype = n;
  }
  static makeData(t, n = "native") {
    if (n === "generic") {
      let r = new Uint8Array(t.length + 8), o = new BigUint64Array([BigInt(t.length)]);
      return r.set(new Uint8Array(o.buffer), 0), r.set(t, 8), new k(r, n);
    }
    return new k(t, n);
  }
  static fromData(t, n = "native") {
    return new k(t, n);
  }
  // Shorthands for fromValue
  static str32(t, n = "native") {
    return k.fromValue(t, "string32", n);
  }
  static str512(t, n = "native") {
    return k.fromValue(t, "string512", n);
  }
  static int8(t, n = "native") {
    return k.fromValue(t, "int8", n);
  }
  static uint8(t, n = "native") {
    return k.fromValue(t, "uint8", n);
  }
  static int32(t, n = "native") {
    return k.fromValue(t, "int32", n);
  }
  static uint32(t, n = "native") {
    return k.fromValue(t, "uint32", n);
  }
  static int64(t, n = "native") {
    return k.fromValue(t, "int64", n);
  }
  static uint64(t, n = "native") {
    return k.fromValue(t, "uint64", n);
  }
  static f32(t, n = "native") {
    return k.fromValue(t, "float32", n);
  }
  static f64(t, n = "native") {
    return k.fromValue(t, "float64", n);
  }
  static bool(t, n = "native") {
    return k.fromValue(t, "bool", n);
  }
  static fromValue(t, n, r = "native") {
    let o;
    if (n === "string32") {
      const i = new TextEncoder();
      o = new Uint8Array(32), o.set(i.encode(t + "\0"), 0);
    } else if (n === "string512") {
      const i = new TextEncoder();
      o = new Uint8Array(512), o.set(i.encode(t + "\0"), 0);
    } else n === "int8" ? o = new Uint8Array(new Int8Array([t]).buffer) : n === "int16" ? o = new Uint8Array(new Int16Array([t]).buffer) : n === "int32" ? o = new Uint8Array(new Int32Array([t]).buffer) : n === "int64" ? o = new Uint8Array(new BigInt64Array([BigInt(t)]).buffer) : n === "uint8" ? o = new Uint8Array([t]) : n === "uint16" ? o = new Uint8Array(new Uint16Array([t]).buffer) : n === "uint32" ? o = new Uint8Array(new Uint32Array([t]).buffer) : n === "uint64" ? o = new Uint8Array(new BigUint64Array([BigInt(t)]).buffer) : n === "float32" ? o = new Uint8Array(new Float32Array([t]).buffer) : n === "float64" ? o = new Uint8Array(new Float64Array([t]).buffer) : n === "bool" ? (o = new Uint8Array(1), o.set([t ? 1 : 0], 0)) : (console.log("MxGenericType.fromValue: Could not convert from unknown type <" + n + ">."), o = new Uint8Array([]));
    if (r === "generic") {
      let i = new Uint8Array(o.length + 8), s = new BigUint64Array([BigInt(o.length)]);
      return i.set(new Uint8Array(s.buffer), 0), i.set(o, 8), new k(i, r);
    }
    return new k(o, r);
  }
  static concatData(t) {
    if (t.length === 1)
      return t[0].data;
    let n = 0;
    t.forEach((i) => {
      n += i.data.length;
    });
    let r = new Uint8Array(n), o = 0;
    return t.forEach((i) => {
      r.set(i.data, o), o += i.data.length;
    }), r;
  }
  splitChunks(t, n) {
    const r = new Array();
    for (let o = 0; o < t.length; o += n)
      r.push(t.slice(o, o + n));
    return r;
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
    const r = new Uint8Array(this.data.buffer, n);
    if (t === "string")
      return new TextDecoder().decode(r).split("\0").shift();
    if (t === "stringarray") {
      const o = new TextDecoder(), i = this.splitChunks(r, 512), s = new Array();
      for (let l = 0; l < i.length; l++) {
        let a = o.decode(i[l]).split("\0").shift();
        a && s.push(a);
      }
      return s;
    } else if (t === "float32") {
      const o = new Float32Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "float64") {
      const o = new Float64Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "int8") {
      const o = new Int8Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "uint8") {
      const o = new Int8Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "int16") {
      const o = new Int16Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "uint16") {
      const o = new Uint16Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "int32") {
      const o = new Int32Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else if (t === "uint32") {
      const o = new Uint32Array(r.buffer, n);
      return o.length === 1 ? o[0] : Array.from(o);
    } else return t === "int64" ? new DataView(r.buffer, n).getBigInt64(0, !0) : t === "uint64" ? new DataView(r.buffer, n).getBigUint64(0, !0) : t === "bool" ? r.length === 1 ? r[0] === 1 : Array.from([...r].map(Boolean)) : (console.log("MxGenericType.astype: Could not convert from unknown type <" + t + ">."), null);
  }
  unpack(t) {
    if (this.data.byteLength === 0)
      return null;
    let n = 0;
    this.intype === "generic" && this.data.byteLength > 8 && (n = 8), n += this.data.byteOffset;
    const r = new DataView(this.data.buffer, n);
    let o = 0;
    const i = new Array();
    for (; o < this.data.length - n; ) {
      const s = new Array();
      for (const l of t)
        if (l === "str512") {
          const a = new TextDecoder();
          s.push(a.decode(r.buffer.slice(r.byteOffset + o)).split("\0").shift()), o += 512;
        } else if (l === "str32") {
          const a = new TextDecoder();
          s.push(a.decode(r.buffer.slice(r.byteOffset + o)).split("\0").shift()), o += 32;
        } else if (l === "float32")
          s.push(r.getFloat32(o, !0)), o += 4;
        else if (l === "float64")
          s.push(r.getFloat64(o, !0)), o += 8;
        else if (l === "int8")
          s.push(r.getInt8(o)), o += 1;
        else if (l === "uint8")
          s.push(r.getUint8(o)), o += 1;
        else if (l === "int16")
          s.push(r.getInt16(o, !0)), o += 2;
        else if (l === "uint16")
          s.push(r.getUint16(o, !0)), o += 2;
        else if (l === "int32")
          s.push(r.getInt32(o, !0)), o += 4;
        else if (l === "uint32")
          s.push(r.getUint32(o, !0)), o += 4;
        else if (l === "int64")
          s.push(r.getBigInt64(o, !0)), o += 8;
        else if (l === "uint64")
          s.push(r.getBigUint64(o, !0)), o += 8;
        else if (l === "bool")
          s.push(r.getUint8(o) === 1), o += 1;
        else if (l === "bytearray") {
          const a = Number(r.getBigUint64(o, !0));
          o += 8, s.push(new Uint8Array(r.buffer, r.byteOffset + o, a)), o += a;
        } else
          return console.log("MxGenericType.unpack: Could not convert from unknown type <" + l + ">."), null;
      i.push(s);
    }
    return i;
  }
}
class Pe {
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
          const r = this.deferred_p.get(n.messageid);
          r && r[0](this.make_rpc_response(n, r[1])), this.deferred_p.delete(n.messageid);
        }
      else if (n.type === "evt") {
        const r = this.event_subscriptions.get(n.event);
        r && r(new Uint8Array(n.response));
      }
    }, this.socket.onclose = async () => {
      this.on_change.forEach((t) => t(!1)), this.messageid = 0, this.deferred_p = /* @__PURE__ */ new Map(), this.isready = !1, this.waiting_p = new Array(), setTimeout(() => {
        this.socket = new WebSocket(`${this.address}`), this.setupCallbacks();
      }, 5e3);
    };
  }
  constructor(t, n, r) {
    r ? this.address = `wss://${t}/ws/` : this.address = `ws://${t}:${n}`, this.socket = new WebSocket(`${this.address}`), this.messageid = 0, this.deferred_p = /* @__PURE__ */ new Map(), this.isready = !1, this.waiting_p = new Array(), this.on_change = new Array(), this.event_subscriptions = /* @__PURE__ */ new Map(), this.setupCallbacks();
  }
  on_connection_change(t) {
    this.on_change.push(t);
  }
  static get instance() {
    if (!Pe.s_instance) {
      const t = parseInt(location.port);
      Pe.s_instance = new Pe(location.hostname, isNaN(t) ? 80 : t, location.protocol === "https:");
    }
    return Pe.s_instance;
  }
  get status() {
    return this.socket.readyState;
  }
  async when_ready() {
    return new Promise((t) => {
      this.isready ? t() : this.waiting_p.push(t);
    });
  }
  async rpc_call(t, n = [], r = "native") {
    const [o, i] = this.make_rpc_message(t, n, r !== "none");
    return this.isready || await this.when_ready(), new Promise((s) => {
      this.socket.send(o), this.deferred_p.set(i, [s, r]);
    });
  }
  async subscribe(t, n) {
    const r = this.make_evt_message(t, 0);
    return this.isready || await this.when_ready(), new Promise((o) => {
      this.socket.send(r), this.event_subscriptions.set(t, n), o(k.fromData(new Uint8Array([])));
    });
  }
  async unsubscribe(t) {
    const n = this.make_evt_message(t, 1);
    return this.isready || await this.when_ready(), new Promise((r) => {
      this.socket.send(n), this.event_subscriptions.delete(t), r(k.fromData(new Uint8Array([])));
    });
  }
  // Close the connection if the ws is alive
  close() {
    this.socket.readyState === WebSocket.OPEN && this.socket.close();
  }
  make_rpc_message(t, n, r) {
    const o = this.messageid++, i = btoa(String.fromCharCode.apply(null, Array.from(k.concatData(n))));
    return n.length > 0 ? [JSON.stringify({ type: 0, method: t, args: i, messageid: o, response: r }), o] : [JSON.stringify({ type: 0, method: t, messageid: o, response: r }), o];
  }
  make_rpc_response(t, n) {
    return k.fromData(new Uint8Array(t.response), n);
  }
  make_evt_message(t, n) {
    return JSON.stringify({ type: 1, opcode: n, event: t });
  }
}
class sn {
  static async Create() {
    const t = new sn();
    return await t.setupCalls(), t;
  }
  async setupCalls() {
    const t = await Pe.instance.rpc_call("mulex::RpcGetAllCalls", [], "generic"), n = Qo(t.astype("stringarray"), 2);
    for (const r of n) {
      const o = r[0].split("::").pop(), i = r[1].split("::").pop();
      let s = "native";
      i.includes("void") ? s = "none" : i.includes("RPCGenericType") && (s = "generic"), this[o] = async (l) => await Pe.instance.rpc_call(r[0], l, s);
    }
  }
  constructor() {
  }
}
var ks = /* @__PURE__ */ Oe('<div><div class="flex px-5 mb-5 gap-5"></div><div class="flex px-5 mb-5 gap-5"></div><div class="flex px-5 mb-5 gap-5"></div><div class="flex px-5 mb-5 gap-5">');
const Ls = () => {
  let e;
  bt(async () => {
    e = await sn.Create(), setInterval(() => n(), 1e3);
  });
  async function t(w, v, x) {
    if (e) {
      const A = k.concatData([k.str32("moveAbsolute"), k.int32(w), k.int32(v), k.int32(x)]), C = await e.BckCallUserRpc([k.str32("pmc8742.exe"), k.makeData(A, "generic"), k.int64(10000n)]), [O, R] = C.unpack(["uint8", "int32"])[0];
      R != 0 && console.error("Failed to send command to backend.");
    } else
      console.log("MxRpc not ready.");
  }
  async function n() {
    if (e) {
      const w = k.concatData([k.str32("getPositions")]), v = await e.BckCallUserRpc([k.str32("pmc8742.exe"), k.makeData(w, "generic"), k.int64(10000n)]), [x, A, C, O, R] = v.unpack(["uint8", "int32", "int32", "int32", "int32"])[0];
      s(A), f(C), h(O), y(R);
    } else
      console.log("MxRpc not ready.");
  }
  const [r, o] = I(0), [i, s] = I(0), [l, a] = I(0), [u, f] = I(0), [c, d] = I(0), [g, h] = I(0), [m, b] = I(0), [p, y] = I(0);
  return (() => {
    var w = ks(), v = w.firstChild, x = v.nextSibling, A = x.nextSibling, C = A.nextSibling;
    return z(v, L(ot, {
      title: "Stage 1 Setpoint",
      get value() {
        return r();
      },
      size: "xlarge",
      onChange: (O) => {
        t(1, 2, O), o(O);
      },
      increment: 1
    }), null), z(v, L(it, {
      title: "Stage 1 Step",
      get value() {
        return i();
      },
      reactive: !0,
      size: "xlarge",
      class: "px-5"
    }), null), z(x, L(ot, {
      title: "Stage 2 Setpoint",
      get value() {
        return l();
      },
      size: "xlarge",
      onChange: (O) => {
        t(1, 3, O), a(O);
      },
      increment: 1
    }), null), z(x, L(it, {
      title: "Stage 2 Step",
      get value() {
        return u();
      },
      reactive: !0,
      size: "xlarge",
      class: "px-5"
    }), null), z(A, L(ot, {
      title: "Stage 3 Setpoint",
      get value() {
        return c();
      },
      size: "xlarge",
      onChange: (O) => {
        t(2, 1, O), d(O);
      },
      increment: 1
    }), null), z(A, L(it, {
      title: "Stage 3 Step",
      get value() {
        return g();
      },
      reactive: !0,
      size: "xlarge",
      class: "px-5"
    }), null), z(C, L(ot, {
      title: "Stage 4 Setpoint",
      get value() {
        return m();
      },
      size: "xlarge",
      onChange: (O) => {
        t(2, 4, O), b(O);
      },
      increment: 1
    }), null), z(C, L(it, {
      title: "Stage 4 Step",
      get value() {
        return p();
      },
      reactive: !0,
      size: "xlarge",
      class: "px-5"
    }), null), w;
  })();
}, Ts = "Tilt Stage Control", Ds = Ls, Rs = "1.0.0", _s = "Controls and reports tilt stage position in steps.", $s = "César Godinho";
export {
  $s as author,
  _s as brief,
  Ts as pname,
  Ds as render,
  Rs as version
};
