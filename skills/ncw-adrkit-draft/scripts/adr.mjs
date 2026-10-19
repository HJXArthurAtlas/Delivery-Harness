#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS(function(exports) {
  var ALIAS = Symbol.for("yaml.alias");
  var DOC = Symbol.for("yaml.document");
  var MAP = Symbol.for("yaml.map");
  var PAIR = Symbol.for("yaml.pair");
  var SCALAR = Symbol.for("yaml.scalar");
  var SEQ = Symbol.for("yaml.seq");
  var NODE_TYPE = Symbol.for("yaml.node.type");
  var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
  var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
  var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
  var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
  var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
  var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
  function isCollection(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case MAP:
        case SEQ:
          return true;
      }
    return false;
  }
  function isNode(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case ALIAS:
        case MAP:
        case SCALAR:
        case SEQ:
          return true;
      }
    return false;
  }
  var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
  exports.ALIAS = ALIAS;
  exports.DOC = DOC;
  exports.MAP = MAP;
  exports.NODE_TYPE = NODE_TYPE;
  exports.PAIR = PAIR;
  exports.SCALAR = SCALAR;
  exports.SEQ = SEQ;
  exports.hasAnchor = hasAnchor;
  exports.isAlias = isAlias;
  exports.isCollection = isCollection;
  exports.isDocument = isDocument;
  exports.isMap = isMap;
  exports.isNode = isNode;
  exports.isPair = isPair;
  exports.isScalar = isScalar;
  exports.isSeq = isSeq;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/visit.js
var require_visit = __commonJS(function(exports) {
  var identity = require_identity();
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove node");
  function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      visit_(null, node, visitor_, Object.freeze([]));
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = visit_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = visit_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = visit_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      await visitAsync_(null, node, visitor_, Object.freeze([]));
  }
  visitAsync.BREAK = BREAK;
  visitAsync.SKIP = SKIP;
  visitAsync.REMOVE = REMOVE;
  async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = await visitAsync_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = await visitAsync_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = await visitAsync_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  function initVisitor(visitor) {
    if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
      return Object.assign({
        Alias: visitor.Node,
        Map: visitor.Node,
        Scalar: visitor.Node,
        Seq: visitor.Node
      }, visitor.Value && {
        Map: visitor.Value,
        Scalar: visitor.Value,
        Seq: visitor.Value
      }, visitor.Collection && {
        Map: visitor.Collection,
        Seq: visitor.Collection
      }, visitor);
    }
    return visitor;
  }
  function callVisitor(key, node, visitor, path) {
    if (typeof visitor === "function")
      return visitor(key, node, path);
    if (identity.isMap(node))
      return visitor.Map?.(key, node, path);
    if (identity.isSeq(node))
      return visitor.Seq?.(key, node, path);
    if (identity.isPair(node))
      return visitor.Pair?.(key, node, path);
    if (identity.isScalar(node))
      return visitor.Scalar?.(key, node, path);
    if (identity.isAlias(node))
      return visitor.Alias?.(key, node, path);
    return;
  }
  function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (identity.isCollection(parent)) {
      parent.items[key] = node;
    } else if (identity.isPair(parent)) {
      if (key === "key")
        parent.key = node;
      else
        parent.value = node;
    } else if (identity.isDocument(parent)) {
      parent.contents = node;
    } else {
      const pt = identity.isAlias(parent) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${pt} parent`);
    }
  }
  exports.visit = visit;
  exports.visitAsync = visitAsync;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS(function(exports) {
  var identity = require_identity();
  var visit = require_visit();
  var escapeChars = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  };
  var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);

  class Directives {
    constructor(yaml, tags) {
      this.docStart = null;
      this.docEnd = false;
      this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
      this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
      const copy = new Directives(this.yaml, this.tags);
      copy.docStart = this.docStart;
      return copy;
    }
    atDocument() {
      const res = new Directives(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = true;
          break;
        case "1.2":
          this.atNextDocument = false;
          this.yaml = {
            explicit: Directives.defaultYaml.explicit,
            version: "1.2"
          };
          this.tags = Object.assign({}, Directives.defaultTags);
          break;
      }
      return res;
    }
    add(line, onError) {
      if (this.atNextDocument) {
        this.yaml = { explicit: Directives.defaultYaml.explicit, version: "1.1" };
        this.tags = Object.assign({}, Directives.defaultTags);
        this.atNextDocument = false;
      }
      const parts = line.trim().split(/[ \t]+/);
      const name = parts.shift();
      switch (name) {
        case "%TAG": {
          if (parts.length !== 2) {
            onError(0, "%TAG directive should contain exactly two parts");
            if (parts.length < 2)
              return false;
          }
          const [handle, prefix] = parts;
          this.tags[handle] = prefix;
          return true;
        }
        case "%YAML": {
          this.yaml.explicit = true;
          if (parts.length !== 1) {
            onError(0, "%YAML directive should contain exactly one part");
            return false;
          }
          const [version] = parts;
          if (version === "1.1" || version === "1.2") {
            this.yaml.version = version;
            return true;
          } else {
            const isValid = /^\d+\.\d+$/.test(version);
            onError(6, `Unsupported YAML version ${version}`, isValid);
            return false;
          }
        }
        default:
          onError(0, `Unknown directive ${name}`, true);
          return false;
      }
    }
    tagName(source, onError) {
      if (source === "!")
        return "!";
      if (source[0] !== "!") {
        onError(`Not a valid tag: ${source}`);
        return null;
      }
      if (source[1] === "<") {
        const verbatim = source.slice(2, -1);
        if (verbatim === "!" || verbatim === "!!") {
          onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
          return null;
        }
        if (source[source.length - 1] !== ">")
          onError("Verbatim tags must end with a >");
        return verbatim;
      }
      const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
      if (!suffix)
        onError(`The ${source} tag has no suffix`);
      const prefix = this.tags[handle];
      if (prefix) {
        try {
          return prefix + decodeURIComponent(suffix);
        } catch (error) {
          onError(String(error));
          return null;
        }
      }
      if (handle === "!")
        return source;
      onError(`Could not resolve tag: ${source}`);
      return null;
    }
    tagString(tag) {
      for (const [handle, prefix] of Object.entries(this.tags)) {
        if (tag.startsWith(prefix))
          return handle + escapeTagName(tag.substring(prefix.length));
      }
      return tag[0] === "!" ? tag : `!<${tag}>`;
    }
    toString(doc) {
      const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
      const tagEntries = Object.entries(this.tags);
      let tagNames;
      if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
        const tags = {};
        visit.visit(doc.contents, (_key, node) => {
          if (identity.isNode(node) && node.tag)
            tags[node.tag] = true;
        });
        tagNames = Object.keys(tags);
      } else
        tagNames = [];
      for (const [handle, prefix] of tagEntries) {
        if (handle === "!!" && prefix === "tag:yaml.org,2002:")
          continue;
        if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
          lines.push(`%TAG ${handle} ${prefix}`);
      }
      return lines.join(`
`);
    }
  }
  Directives.defaultYaml = { explicit: false, version: "1.2" };
  Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
  exports.Directives = Directives;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS(function(exports) {
  var identity = require_identity();
  var visit = require_visit();
  function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
      const sa = JSON.stringify(anchor);
      const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
      throw new Error(msg);
    }
    return true;
  }
  function anchorNames(root) {
    const anchors = new Set;
    visit.visit(root, {
      Value(_key, node) {
        if (node.anchor)
          anchors.add(node.anchor);
      }
    });
    return anchors;
  }
  function findNewAnchor(prefix, exclude) {
    for (let i = 1;; ++i) {
      const name = `${prefix}${i}`;
      if (!exclude.has(name))
        return name;
    }
  }
  function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map;
    let prevAnchors = null;
    return {
      onAnchor: (source) => {
        aliasObjects.push(source);
        prevAnchors ?? (prevAnchors = anchorNames(doc));
        const anchor = findNewAnchor(prefix, prevAnchors);
        prevAnchors.add(anchor);
        return anchor;
      },
      setAnchors: () => {
        for (const source of aliasObjects) {
          const ref = sourceObjects.get(source);
          if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
            ref.node.anchor = ref.anchor;
          } else {
            const error = new Error("Failed to resolve repeated object (this should not happen)");
            error.source = source;
            throw error;
          }
        }
      },
      sourceObjects
    };
  }
  exports.anchorIsValid = anchorIsValid;
  exports.anchorNames = anchorNames;
  exports.createNodeAnchors = createNodeAnchors;
  exports.findNewAnchor = findNewAnchor;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS(function(exports) {
  function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length;i < len; ++i) {
          const v0 = val[i];
          const v1 = applyReviver(reviver, val, String(i), v0);
          if (v1 === undefined)
            delete val[i];
          else if (v1 !== v0)
            val[i] = v1;
        }
      } else if (val instanceof Map) {
        for (const k of Array.from(val.keys())) {
          const v0 = val.get(k);
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            val.delete(k);
          else if (v1 !== v0)
            val.set(k, v1);
        }
      } else if (val instanceof Set) {
        for (const v0 of Array.from(val)) {
          const v1 = applyReviver(reviver, val, v0, v0);
          if (v1 === undefined)
            val.delete(v0);
          else if (v1 !== v0) {
            val.delete(v0);
            val.add(v1);
          }
        }
      } else {
        for (const [k, v0] of Object.entries(val)) {
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            delete val[k];
          else if (v1 !== v0)
            val[k] = v1;
        }
      }
    }
    return reviver.call(obj, key, val);
  }
  exports.applyReviver = applyReviver;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS(function(exports) {
  var identity = require_identity();
  function toJS(value, arg, ctx) {
    if (Array.isArray(value))
      return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === "function") {
      if (!ctx || !identity.hasAnchor(value))
        return value.toJSON(arg, ctx);
      const data = { aliasCount: 0, count: 1, res: undefined };
      ctx.anchors.set(value, data);
      ctx.onCreate = (res) => {
        data.res = res;
        delete ctx.onCreate;
      };
      const res = value.toJSON(arg, ctx);
      if (ctx.onCreate)
        ctx.onCreate(res);
      return res;
    }
    if (typeof value === "bigint" && !ctx?.keep)
      return Number(value);
    return value;
  }
  exports.toJS = toJS;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS(function(exports) {
  var applyReviver = require_applyReviver();
  var identity = require_identity();
  var toJS = require_toJS();

  class NodeBase {
    constructor(type) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: type });
    }
    clone() {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      if (!identity.isDocument(doc))
        throw new TypeError("A document argument is required");
      const ctx = {
        anchors: new Map,
        doc,
        keep: true,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this, "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res } of ctx.anchors.values())
          onAnchor(res, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
  }
  exports.NodeBase = NodeBase;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS(function(exports) {
  var anchors = require_anchors();
  var visit = require_visit();
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();

  class Alias extends Node.NodeBase {
    constructor(source) {
      super(identity.ALIAS);
      this.source = source;
      Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    resolve(doc, ctx) {
      if (ctx?.maxAliasCount === 0)
        throw new ReferenceError("Alias resolution is disabled");
      let nodes;
      if (ctx?.aliasResolveCache) {
        nodes = ctx.aliasResolveCache;
      } else {
        nodes = [];
        visit.visit(doc, {
          Node: (_key, node) => {
            if (identity.isAlias(node) || identity.hasAnchor(node))
              nodes.push(node);
          }
        });
        if (ctx)
          ctx.aliasResolveCache = nodes;
      }
      let found = undefined;
      for (const node of nodes) {
        if (node === this)
          break;
        if (node.anchor === this.source)
          found = node;
      }
      if (found && ctx) {
        const { anchors, doc, maxAliasCount } = ctx;
        let data = anchors.get(found);
        if (!data) {
          toJS.toJS(found, null, ctx);
          data = anchors.get(found);
        }
        if (data?.res === undefined) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, found, anchors);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
      }
      return found;
    }
    toJSON(_arg, ctx) {
      if (!ctx)
        return { source: this.source };
      const source = this.resolve(ctx.doc, ctx);
      if (!source) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(msg);
      }
      return ctx.anchors.get(source).res;
    }
    toString(ctx, _onComment, _onChompKeep) {
      const src = `*${this.source}`;
      if (ctx) {
        anchors.anchorIsValid(this.source);
        if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(msg);
        }
        if (ctx.implicitKey)
          return `${src} `;
      }
      return src;
    }
  }
  function getAliasCount(doc, node, anchors) {
    if (identity.isAlias(node)) {
      const source = node.resolve(doc);
      const anchor = anchors && source && anchors.get(source);
      return anchor ? anchor.count * anchor.aliasCount : 0;
    } else if (identity.isCollection(node)) {
      let count = 0;
      for (const item of node.items) {
        const c = getAliasCount(doc, item, anchors);
        if (c > count)
          count = c;
      }
      return count;
    } else if (identity.isPair(node)) {
      const kc = getAliasCount(doc, node.key, anchors);
      const vc = getAliasCount(doc, node.value, anchors);
      return Math.max(kc, vc);
    }
    return 1;
  }
  exports.Alias = Alias;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS(function(exports) {
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();
  var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";

  class Scalar extends Node.NodeBase {
    constructor(value) {
      super(identity.SCALAR);
      this.value = value;
    }
    toJSON(arg, ctx) {
      return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
    }
    toString() {
      return String(this.value);
    }
  }
  Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
  Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
  Scalar.PLAIN = "PLAIN";
  Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
  Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
  exports.Scalar = Scalar;
  exports.isScalarValue = isScalarValue;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS(function(exports) {
  var Alias = require_Alias();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var defaultTagPrefix = "tag:yaml.org,2002:";
  function findTagObject(value, tagName, tags) {
    if (tagName) {
      const match = tags.filter((t) => t.tag === tagName);
      const tagObj = match.find((t) => !t.format) ?? match[0];
      if (!tagObj)
        throw new Error(`Tag ${tagName} not found`);
      return tagObj;
    }
    return tags.find((t) => t.identify?.(value) && !t.format);
  }
  function createNode(value, tagName, ctx) {
    if (identity.isDocument(value))
      value = value.contents;
    if (identity.isNode(value))
      return value;
    if (identity.isPair(value)) {
      const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
      map.items.push(value);
      return map;
    }
    if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
      value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === "object") {
      ref = sourceObjects.get(value);
      if (ref) {
        ref.anchor ?? (ref.anchor = onAnchor(value));
        return new Alias.Alias(ref.anchor);
      } else {
        ref = { anchor: null, node: null };
        sourceObjects.set(value, ref);
      }
    }
    if (tagName?.startsWith("!!"))
      tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
      if (value && typeof value.toJSON === "function") {
        value = value.toJSON();
      }
      if (!value || typeof value !== "object") {
        const node = new Scalar.Scalar(value);
        if (ref)
          ref.node = node;
        return node;
      }
      tagObj = value instanceof Map ? schema[identity.MAP] : (Symbol.iterator in Object(value)) ? schema[identity.SEQ] : schema[identity.MAP];
    }
    if (onTagObj) {
      onTagObj(tagObj);
      delete ctx.onTagObj;
    }
    const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
    if (tagName)
      node.tag = tagName;
    else if (!tagObj.default)
      node.tag = tagObj.tag;
    if (ref)
      ref.node = node;
    return node;
  }
  exports.createNode = createNode;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS(function(exports) {
  var createNode = require_createNode();
  var identity = require_identity();
  var Node = require_Node();
  function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1;i >= 0; --i) {
      const k = path[i];
      if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
        const a = [];
        a[k] = v;
        v = a;
      } else {
        v = new Map([[k, v]]);
      }
    }
    return createNode.createNode(v, undefined, {
      aliasDuplicateObjects: false,
      keepUndefined: false,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema,
      sourceObjects: new Map
    });
  }
  var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;

  class Collection extends Node.NodeBase {
    constructor(type, schema) {
      super(type);
      Object.defineProperty(this, "schema", {
        value: schema,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
    clone(schema) {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (schema)
        copy.schema = schema;
      copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    addIn(path, value) {
      if (isEmptyPath(path))
        this.add(value);
      else {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.addIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
    deleteIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.delete(key);
      const node = this.get(key, true);
      if (identity.isCollection(node))
        return node.deleteIn(rest);
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    getIn(path, keepScalar) {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (rest.length === 0)
        return !keepScalar && identity.isScalar(node) ? node.value : node;
      else
        return identity.isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
      return this.items.every((node) => {
        if (!identity.isPair(node))
          return false;
        const n = node.value;
        return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
      });
    }
    hasIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.has(key);
      const node = this.get(key, true);
      return identity.isCollection(node) ? node.hasIn(rest) : false;
    }
    setIn(path, value) {
      const [key, ...rest] = path;
      if (rest.length === 0) {
        this.set(key, value);
      } else {
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.setIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
  }
  exports.Collection = Collection;
  exports.collectionFromPath = collectionFromPath;
  exports.isEmptyPath = isEmptyPath;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS(function(exports) {
  var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
  function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
      return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
  }
  var lineComment = (str, indent, comment) => str.endsWith(`
`) ? indentComment(comment, indent) : comment.includes(`
`) ? `
` + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
  exports.indentComment = indentComment;
  exports.lineComment = lineComment;
  exports.stringifyComment = stringifyComment;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS(function(exports) {
  var FOLD_FLOW = "flow";
  var FOLD_BLOCK = "block";
  var FOLD_QUOTED = "quoted";
  function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
      return text;
    if (lineWidth < minContentWidth)
      minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
      return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === "number") {
      if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
        folds.push(0);
      else
        end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
      i = consumeMoreIndentedLines(text, i, indent.length);
      if (i !== -1)
        end = i + endStep;
    }
    for (let ch;ch = text[i += 1]; ) {
      if (mode === FOLD_QUOTED && ch === "\\") {
        escStart = i;
        switch (text[i + 1]) {
          case "x":
            i += 3;
            break;
          case "u":
            i += 5;
            break;
          case "U":
            i += 9;
            break;
          default:
            i += 1;
        }
        escEnd = i;
      }
      if (ch === `
`) {
        if (mode === FOLD_BLOCK)
          i = consumeMoreIndentedLines(text, i, indent.length);
        end = i + indent.length + endStep;
        split = undefined;
      } else {
        if (ch === " " && prev && prev !== " " && prev !== `
` && prev !== "\t") {
          const next = text[i + 1];
          if (next && next !== " " && next !== `
` && next !== "\t")
            split = i;
        }
        if (i >= end) {
          if (split) {
            folds.push(split);
            end = split + endStep;
            split = undefined;
          } else if (mode === FOLD_QUOTED) {
            while (prev === " " || prev === "\t") {
              prev = ch;
              ch = text[i += 1];
              overflow = true;
            }
            const j = i > escEnd + 1 ? i - 2 : escStart - 1;
            if (escapedFolds[j])
              return text;
            folds.push(j);
            escapedFolds[j] = true;
            end = j + endStep;
            split = undefined;
          } else {
            overflow = true;
          }
        }
      }
      prev = ch;
    }
    if (overflow && onOverflow)
      onOverflow();
    if (folds.length === 0)
      return text;
    if (onFold)
      onFold();
    let res = text.slice(0, folds[0]);
    for (let i = 0;i < folds.length; ++i) {
      const fold = folds[i];
      const end = folds[i + 1] || text.length;
      if (fold === 0)
        res = `
${indent}${text.slice(0, end)}`;
      else {
        if (mode === FOLD_QUOTED && escapedFolds[fold])
          res += `${text[fold]}\\`;
        res += `
${indent}${text.slice(fold + 1, end)}`;
      }
    }
    return res;
  }
  function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === " " || ch === "\t") {
      if (i < start + indent) {
        ch = text[++i];
      } else {
        do {
          ch = text[++i];
        } while (ch && ch !== `
`);
        end = i;
        start = i + 1;
        ch = text[start];
      }
    }
    return end;
  }
  exports.FOLD_BLOCK = FOLD_BLOCK;
  exports.FOLD_FLOW = FOLD_FLOW;
  exports.FOLD_QUOTED = FOLD_QUOTED;
  exports.foldFlowLines = foldFlowLines;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var foldFlowLines = require_foldFlowLines();
  var getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
  });
  var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
  function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
      return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
      return false;
    for (let i = 0, start = 0;i < strLen; ++i) {
      if (str[i] === `
`) {
        if (i - start > limit)
          return true;
        start = i + 1;
        if (strLen - start <= limit)
          return false;
      }
    }
    return true;
  }
  function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
      return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    let str = "";
    let start = 0;
    for (let i = 0, ch = json[i];ch; ch = json[++i]) {
      if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
        str += json.slice(start, i) + "\\ ";
        i += 1;
        start = i;
        ch = "\\";
      }
      if (ch === "\\")
        switch (json[i + 1]) {
          case "u":
            {
              str += json.slice(start, i);
              const code = json.substr(i + 2, 4);
              switch (code) {
                case "0000":
                  str += "\\0";
                  break;
                case "0007":
                  str += "\\a";
                  break;
                case "000b":
                  str += "\\v";
                  break;
                case "001b":
                  str += "\\e";
                  break;
                case "0085":
                  str += "\\N";
                  break;
                case "00a0":
                  str += "\\_";
                  break;
                case "2028":
                  str += "\\L";
                  break;
                case "2029":
                  str += "\\P";
                  break;
                default:
                  if (code.substr(0, 2) === "00")
                    str += "\\x" + code.substr(2);
                  else
                    str += json.substr(i, 6);
              }
              i += 5;
              start = i + 1;
            }
            break;
          case "n":
            if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
              i += 1;
            } else {
              str += json.slice(start, i) + `

`;
              while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                str += `
`;
                i += 2;
              }
              str += indent;
              if (json[i + 2] === " ")
                str += "\\";
              i += 1;
              start = i + 1;
            }
            break;
          default:
            i += 1;
        }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
  }
  function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes(`
`) || /[ \t]\n|\n[ \t]/.test(value))
      return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
    return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
      qs = doubleQuotedString;
    else {
      const hasDouble = value.includes('"');
      const hasSingle = value.includes("'");
      if (hasDouble && !hasSingle)
        qs = singleQuotedString;
      else if (hasSingle && !hasDouble)
        qs = doubleQuotedString;
      else
        qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
  }
  var blockEndNewlines;
  try {
    blockEndNewlines = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
  }
  function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    if (!blockQuote || /\n[\t ]+$/.test(value)) {
      return quotedString(value, ctx);
    }
    const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
    const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
      return literal ? `|
` : `>
`;
    let chomp;
    let endStart;
    for (endStart = value.length;endStart > 0; --endStart) {
      const ch = value[endStart - 1];
      if (ch !== `
` && ch !== "\t" && ch !== " ")
        break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf(`
`);
    if (endNlPos === -1) {
      chomp = "-";
    } else if (value === end || endNlPos !== end.length - 1) {
      chomp = "+";
      if (onChompKeep)
        onChompKeep();
    } else {
      chomp = "";
    }
    if (end) {
      value = value.slice(0, -end.length);
      if (end[end.length - 1] === `
`)
        end = end.slice(0, -1);
      end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0;startEnd < value.length; ++startEnd) {
      const ch = value[startEnd];
      if (ch === " ")
        startWithSpace = true;
      else if (ch === `
`)
        startNlPos = startEnd;
      else
        break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
      value = value.substring(start.length);
      start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? "2" : "1";
    let header = (startWithSpace ? indentSize : "") + chomp;
    if (comment) {
      header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
      if (onComment)
        onComment();
    }
    if (!literal) {
      const foldedValue = value.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
      let literalFallback = false;
      const foldOptions = getFoldOptions(ctx, true);
      if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
        foldOptions.onOverflow = () => {
          literalFallback = true;
        };
      }
      const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
      if (!literalFallback)
        return `>${header}
${indent}${body}`;
    }
    value = value.replace(/\n+/g, `$&${indent}`);
    return `|${header}
${indent}${start}${value}${end}`;
  }
  function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if (implicitKey && value.includes(`
`) || inFlow && /[[\]{},]/.test(value)) {
      return quotedString(value, ctx);
    }
    if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
      return implicitKey || inFlow || !value.includes(`
`) ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes(`
`)) {
      return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
      if (indent === "") {
        ctx.forceBlockIndent = true;
        return blockString(item, ctx, onComment, onChompKeep);
      } else if (implicitKey && indent === indentStep) {
        return quotedString(value, ctx);
      }
    }
    const str = value.replace(/\n+/g, `$&
${indent}`);
    if (actualString) {
      const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
      const { compat, tags } = ctx.doc.schema;
      if (tags.some(test) || compat?.some(test))
        return quotedString(value, ctx);
    }
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
      if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
        type = Scalar.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
      switch (_type) {
        case Scalar.Scalar.BLOCK_FOLDED:
        case Scalar.Scalar.BLOCK_LITERAL:
          return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
        case Scalar.Scalar.QUOTE_DOUBLE:
          return doubleQuotedString(ss.value, ctx);
        case Scalar.Scalar.QUOTE_SINGLE:
          return singleQuotedString(ss.value, ctx);
        case Scalar.Scalar.PLAIN:
          return plainString(ss, ctx, onComment, onChompKeep);
        default:
          return null;
      }
    };
    let res = _stringify(type);
    if (res === null) {
      const { defaultKeyType, defaultStringType } = ctx.options;
      const t = implicitKey && defaultKeyType || defaultStringType;
      res = _stringify(t);
      if (res === null)
        throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
  }
  exports.stringifyString = stringifyString;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS(function(exports) {
  var anchors = require_anchors();
  var identity = require_identity();
  var stringifyComment = require_stringifyComment();
  var stringifyString = require_stringifyString();
  function createStringifyContext(doc, options) {
    const opt = Object.assign({
      blockQuote: true,
      commentString: stringifyComment.stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: false,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: true,
      indentSeq: true,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: false,
      singleQuote: null,
      trailingComma: false,
      trueStr: "true",
      verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
      case "block":
        inFlow = false;
        break;
      case "flow":
        inFlow = true;
        break;
      default:
        inFlow = null;
    }
    return {
      anchors: new Set,
      doc,
      flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
      inFlow,
      options: opt
    };
  }
  function getTagObject(tags, item) {
    if (item.tag) {
      const match = tags.filter((t) => t.tag === item.tag);
      if (match.length > 0)
        return match.find((t) => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (identity.isScalar(item)) {
      obj = item.value;
      let match = tags.filter((t) => t.identify?.(obj));
      if (match.length > 1) {
        const testMatch = match.filter((t) => t.test);
        if (testMatch.length > 0)
          match = testMatch;
      }
      tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
    } else {
      obj = item;
      tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
      const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
      throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
  }
  function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
    if (!doc.directives)
      return "";
    const props = [];
    const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
    if (anchor && anchors.anchorIsValid(anchor)) {
      anchors$1.add(anchor);
      props.push(`&${anchor}`);
    }
    const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
    if (tag)
      props.push(doc.directives.tagString(tag));
    return props.join(" ");
  }
  function stringify(item, ctx, onComment, onChompKeep) {
    if (identity.isPair(item))
      return item.toString(ctx, onComment, onChompKeep);
    if (identity.isAlias(item)) {
      if (ctx.doc.directives)
        return item.toString(ctx);
      if (ctx.resolvedAliases?.has(item)) {
        throw new TypeError(`Cannot stringify circular structure without alias nodes`);
      } else {
        if (ctx.resolvedAliases)
          ctx.resolvedAliases.add(item);
        else
          ctx.resolvedAliases = new Set([item]);
        item = item.resolve(ctx.doc);
      }
    }
    let tagObj = undefined;
    const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
    tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
      ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
    if (!props)
      return str;
    return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
  }
  exports.createStringifyContext = createStringifyContext;
  exports.stringify = stringify;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS(function(exports) {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = identity.isNode(key) && key.comment || null;
    if (simpleKeys) {
      if (keyComment) {
        throw new Error("With simple keys, key nodes cannot have comments");
      }
      if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
        const msg = "With simple keys, collection cannot be used as a key value";
        throw new Error(msg);
      }
    }
    let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
    ctx = Object.assign({}, ctx, {
      allNullValues: false,
      implicitKey: !explicitKey && (simpleKeys || !allNullValues),
      indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
      if (simpleKeys)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      explicitKey = true;
    }
    if (ctx.inFlow) {
      if (allNullValues || value == null) {
        if (keyCommentDone && onComment)
          onComment();
        return str === "" ? "?" : explicitKey ? `? ${str}` : str;
      }
    } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
      str = `? ${str}`;
      if (keyComment && !keyCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    if (keyCommentDone)
      keyComment = null;
    if (explicitKey) {
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      str = `? ${str}
${indent}:`;
    } else {
      str = `${str}:`;
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (identity.isNode(value)) {
      vsb = !!value.spaceBefore;
      vcb = value.commentBefore;
      valueComment = value.comment;
    } else {
      vsb = false;
      vcb = null;
      valueComment = null;
      if (value && typeof value === "object")
        value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && identity.isScalar(value))
      ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
      ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
    let ws = " ";
    if (keyComment || vsb || vcb) {
      ws = vsb ? `
` : "";
      if (vcb) {
        const cs = commentString(vcb);
        ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
      }
      if (valueStr === "" && !ctx.inFlow) {
        if (ws === `
` && valueComment)
          ws = `

`;
      } else {
        ws += `
${ctx.indent}`;
      }
    } else if (!explicitKey && identity.isCollection(value)) {
      const vs0 = valueStr[0];
      const nl0 = valueStr.indexOf(`
`);
      const hasNewline = nl0 !== -1;
      const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
      if (hasNewline || !flow) {
        let hasPropsLine = false;
        if (hasNewline && (vs0 === "&" || vs0 === "!")) {
          let sp0 = valueStr.indexOf(" ");
          if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
            sp0 = valueStr.indexOf(" ", sp0 + 1);
          }
          if (sp0 === -1 || nl0 < sp0)
            hasPropsLine = true;
        }
        if (!hasPropsLine)
          ws = `
${ctx.indent}`;
      }
    } else if (valueStr === "" || valueStr[0] === `
`) {
      ws = "";
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
      if (valueCommentDone && onComment)
        onComment();
    } else if (valueComment && !valueCommentDone) {
      str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
    } else if (chompKeep && onChompKeep) {
      onChompKeep();
    }
    return str;
  }
  exports.stringifyPair = stringifyPair;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/log.js
var require_log = __commonJS(function(exports) {
  var node_process = __require("process");
  function debug(logLevel, ...messages) {
    if (logLevel === "debug")
      console.log(...messages);
  }
  function warn(logLevel, warning) {
    if (logLevel === "debug" || logLevel === "warn") {
      if (typeof node_process.emitWarning === "function")
        node_process.emitWarning(warning);
      else
        console.warn(warning);
    }
  }
  exports.debug = debug;
  exports.warn = warn;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS(function(exports) {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var MERGE_KEY = "<<";
  var merge = {
    identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
      addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
  };
  var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
  function addMergeToJSMap(ctx, map, value) {
    const source = resolveAliasValue(ctx, value);
    if (identity.isSeq(source))
      for (const it of source.items)
        mergeValue(ctx, map, it);
    else if (Array.isArray(source))
      for (const it of source)
        mergeValue(ctx, map, it);
    else
      mergeValue(ctx, map, source);
  }
  function mergeValue(ctx, map, value) {
    const source = resolveAliasValue(ctx, value);
    if (!identity.isMap(source))
      throw new Error("Merge sources must be maps or map aliases");
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value] of srcMap) {
      if (map instanceof Map) {
        if (!map.has(key))
          map.set(key, value);
      } else if (map instanceof Set) {
        map.add(key);
      } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
        Object.defineProperty(map, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    return map;
  }
  function resolveAliasValue(ctx, value) {
    return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
  }
  exports.addMergeToJSMap = addMergeToJSMap;
  exports.isMergeKey = isMergeKey;
  exports.merge = merge;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS(function(exports) {
  var log = require_log();
  var merge = require_merge();
  var stringify = require_stringify();
  var identity = require_identity();
  var toJS = require_toJS();
  function addPairToJSMap(ctx, map, { key, value }) {
    if (identity.isNode(key) && key.addToJSMap)
      key.addToJSMap(ctx, map, value);
    else if (merge.isMergeKey(ctx, key))
      merge.addMergeToJSMap(ctx, map, value);
    else {
      const jsKey = toJS.toJS(key, "", ctx);
      if (map instanceof Map) {
        map.set(jsKey, toJS.toJS(value, jsKey, ctx));
      } else if (map instanceof Set) {
        map.add(jsKey);
      } else {
        const stringKey = stringifyKey(key, jsKey, ctx);
        const jsValue = toJS.toJS(value, stringKey, ctx);
        if (stringKey in map)
          Object.defineProperty(map, stringKey, {
            value: jsValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        else
          map[stringKey] = jsValue;
      }
    }
    return map;
  }
  function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
      return "";
    if (typeof jsKey !== "object")
      return String(jsKey);
    if (identity.isNode(key) && ctx?.doc) {
      const strCtx = stringify.createStringifyContext(ctx.doc, {});
      strCtx.anchors = new Set;
      for (const node of ctx.anchors.keys())
        strCtx.anchors.add(node.anchor);
      strCtx.inFlow = true;
      strCtx.inStringifyKey = true;
      const strKey = key.toString(strCtx);
      if (!ctx.mapKeyWarned) {
        let jsonStr = JSON.stringify(strKey);
        if (jsonStr.length > 40)
          jsonStr = jsonStr.substring(0, 36) + '..."';
        log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
        ctx.mapKeyWarned = true;
      }
      return strKey;
    }
    return JSON.stringify(jsKey);
  }
  exports.addPairToJSMap = addPairToJSMap;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS(function(exports) {
  var createNode = require_createNode();
  var stringifyPair = require_stringifyPair();
  var addPairToJSMap = require_addPairToJSMap();
  var identity = require_identity();
  function createPair(key, value, ctx) {
    const k = createNode.createNode(key, undefined, ctx);
    const v = createNode.createNode(value, undefined, ctx);
    return new Pair(k, v);
  }

  class Pair {
    constructor(key, value = null) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
      this.key = key;
      this.value = value;
    }
    clone(schema) {
      let { key, value } = this;
      if (identity.isNode(key))
        key = key.clone(schema);
      if (identity.isNode(value))
        value = value.clone(schema);
      return new Pair(key, value);
    }
    toJSON(_, ctx) {
      const pair = ctx?.mapAsMap ? new Map : {};
      return addPairToJSMap.addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
      return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
    }
  }
  exports.Pair = Pair;
  exports.createPair = createPair;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS(function(exports) {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify(collection, ctx, options);
  }
  function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment = null;
      if (identity.isNode(item)) {
        if (!chompKeep && item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
        if (item.comment)
          comment = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (!chompKeep && ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
        }
      }
      chompKeep = false;
      let str = stringify.stringify(item, itemCtx, () => comment = null, () => chompKeep = true);
      if (comment)
        str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
      if (chompKeep && comment)
        chompKeep = false;
      lines.push(blockItemPrefix + str);
    }
    let str;
    if (lines.length === 0) {
      str = flowChars.start + flowChars.end;
    } else {
      str = lines[0];
      for (let i = 1;i < lines.length; ++i) {
        const line = lines[i];
        str += line ? `
${indent}${line}` : `
`;
      }
    }
    if (comment) {
      str += `
` + stringifyComment.indentComment(commentString(comment), indent);
      if (onComment)
        onComment();
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
      indent: itemIndent,
      inFlow: true,
      type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment = null;
      if (identity.isNode(item)) {
        if (item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, false);
        if (item.comment)
          comment = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, false);
          if (ik.comment)
            reqNewline = true;
        }
        const iv = identity.isNode(item.value) ? item.value : null;
        if (iv) {
          if (iv.comment)
            comment = iv.comment;
          if (iv.commentBefore)
            reqNewline = true;
        } else if (item.value == null && ik?.comment) {
          comment = ik.comment;
        }
      }
      if (comment)
        reqNewline = true;
      let str = stringify.stringify(item, itemCtx, () => comment = null);
      reqNewline || (reqNewline = lines.length > linesAtValue || str.includes(`
`));
      if (i < items.length - 1) {
        str += ",";
      } else if (ctx.options.trailingComma) {
        if (ctx.options.lineWidth > 0) {
          reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
        }
        if (reqNewline) {
          str += ",";
        }
      }
      if (comment)
        str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
      lines.push(str);
      linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
      return start + end;
    } else {
      if (!reqNewline) {
        const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
        reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
      }
      if (reqNewline) {
        let str = start;
        for (const line of lines)
          str += line ? `
${indentStep}${indent}${line}` : `
`;
        return `${str}
${indent}${end}`;
      } else {
        return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
      }
    }
  }
  function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
      comment = comment.replace(/^\n+/, "");
    if (comment) {
      const ic = stringifyComment.indentComment(commentString(comment), indent);
      lines.push(ic.trimStart());
    }
  }
  exports.stringifyCollection = stringifyCollection;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS(function(exports) {
  var stringifyCollection = require_stringifyCollection();
  var addPairToJSMap = require_addPairToJSMap();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  function findPair(items, key) {
    const k = identity.isScalar(key) ? key.value : key;
    for (const it of items) {
      if (identity.isPair(it)) {
        if (it.key === key || it.key === k)
          return it;
        if (identity.isScalar(it.key) && it.key.value === k)
          return it;
      }
    }
    return;
  }

  class YAMLMap extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(schema) {
      super(identity.MAP, schema);
      this.items = [];
    }
    static from(schema, obj, ctx) {
      const { keepUndefined, replacer } = ctx;
      const map = new this(schema);
      const add = (key, value) => {
        if (typeof replacer === "function")
          value = replacer.call(obj, key, value);
        else if (Array.isArray(replacer) && !replacer.includes(key))
          return;
        if (value !== undefined || keepUndefined)
          map.items.push(Pair.createPair(key, value, ctx));
      };
      if (obj instanceof Map) {
        for (const [key, value] of obj)
          add(key, value);
      } else if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj))
          add(key, obj[key]);
      }
      if (typeof schema.sortMapEntries === "function") {
        map.items.sort(schema.sortMapEntries);
      }
      return map;
    }
    add(pair, overwrite) {
      let _pair;
      if (identity.isPair(pair))
        _pair = pair;
      else if (!pair || typeof pair !== "object" || !("key" in pair)) {
        _pair = new Pair.Pair(pair, pair?.value);
      } else
        _pair = new Pair.Pair(pair.key, pair.value);
      const prev = findPair(this.items, _pair.key);
      const sortEntries = this.schema?.sortMapEntries;
      if (prev) {
        if (!overwrite)
          throw new Error(`Key ${_pair.key} already set`);
        if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
          prev.value.value = _pair.value;
        else
          prev.value = _pair.value;
      } else if (sortEntries) {
        const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
        if (i === -1)
          this.items.push(_pair);
        else
          this.items.splice(i, 0, _pair);
      } else {
        this.items.push(_pair);
      }
    }
    delete(key) {
      const it = findPair(this.items, key);
      if (!it)
        return false;
      const del = this.items.splice(this.items.indexOf(it), 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const it = findPair(this.items, key);
      const node = it?.value;
      return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
      return !!findPair(this.items, key);
    }
    set(key, value) {
      this.add(new Pair.Pair(key, value), true);
    }
    toJSON(_, ctx, Type) {
      const map = Type ? new Type : ctx?.mapAsMap ? new Map : {};
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const item of this.items)
        addPairToJSMap.addPairToJSMap(ctx, map, item);
      return map;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      for (const item of this.items) {
        if (!identity.isPair(item))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
      }
      if (!ctx.allNullValues && this.hasAllNullValues(false))
        ctx = Object.assign({}, ctx, { allNullValues: true });
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: ctx.indent || "",
        onChompKeep,
        onComment
      });
    }
  }
  exports.YAMLMap = YAMLMap;
  exports.findPair = findPair;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS(function(exports) {
  var identity = require_identity();
  var YAMLMap = require_YAMLMap();
  var map = {
    collection: "map",
    default: true,
    nodeClass: YAMLMap.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(map, onError) {
      if (!identity.isMap(map))
        onError("Expected a mapping for this tag");
      return map;
    },
    createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
  };
  exports.map = map;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS(function(exports) {
  var createNode = require_createNode();
  var stringifyCollection = require_stringifyCollection();
  var Collection = require_Collection();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var toJS = require_toJS();

  class YAMLSeq extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(schema) {
      super(identity.SEQ, schema);
      this.items = [];
    }
    add(value) {
      this.items.push(value);
    }
    delete(key) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return false;
      const del = this.items.splice(idx, 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return;
      const it = this.items[idx];
      return !keepScalar && identity.isScalar(it) ? it.value : it;
    }
    has(key) {
      const idx = asItemIndex(key);
      return typeof idx === "number" && idx < this.items.length;
    }
    set(key, value) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        throw new Error(`Expected a valid index, not ${key}.`);
      const prev = this.items[idx];
      if (identity.isScalar(prev) && Scalar.isScalarValue(value))
        prev.value = value;
      else
        this.items[idx] = value;
    }
    toJSON(_, ctx) {
      const seq = [];
      if (ctx?.onCreate)
        ctx.onCreate(seq);
      let i = 0;
      for (const item of this.items)
        seq.push(toJS.toJS(item, String(i++), ctx));
      return seq;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (ctx.indent || "") + "  ",
        onChompKeep,
        onComment
      });
    }
    static from(schema, obj, ctx) {
      const { replacer } = ctx;
      const seq = new this(schema);
      if (obj && Symbol.iterator in Object(obj)) {
        let i = 0;
        for (let it of obj) {
          if (typeof replacer === "function") {
            const key = obj instanceof Set ? it : String(i++);
            it = replacer.call(obj, key, it);
          }
          seq.items.push(createNode.createNode(it, undefined, ctx));
        }
      }
      return seq;
    }
  }
  function asItemIndex(key) {
    let idx = identity.isScalar(key) ? key.value : key;
    if (idx && typeof idx === "string")
      idx = Number(idx);
    return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
  }
  exports.YAMLSeq = YAMLSeq;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS(function(exports) {
  var identity = require_identity();
  var YAMLSeq = require_YAMLSeq();
  var seq = {
    collection: "seq",
    default: true,
    nodeClass: YAMLSeq.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(seq, onError) {
      if (!identity.isSeq(seq))
        onError("Expected a sequence for this tag");
      return seq;
    },
    createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
  };
  exports.seq = seq;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS(function(exports) {
  var stringifyString = require_stringifyString();
  var string = {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify(item, ctx, onComment, onChompKeep) {
      ctx = Object.assign({ actualString: true }, ctx);
      return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
    }
  };
  exports.string = string;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var nullTag = {
    identify: (value) => value == null,
    createNode: () => new Scalar.Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
  };
  exports.nullTag = nullTag;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var boolTag = {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
    stringify({ source, value }, ctx) {
      if (source && boolTag.test.test(source)) {
        const sv = source[0] === "t" || source[0] === "T";
        if (value === sv)
          return source;
      }
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
  };
  exports.boolTag = boolTag;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS(function(exports) {
  function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === "bigint")
      return String(value);
    const num = typeof value === "number" ? value : Number(value);
    if (!isFinite(num))
      return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
    let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
    if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
      let i = n.indexOf(".");
      if (i < 0) {
        i = n.length;
        n += ".";
      }
      let d = minFractionDigits - (n.length - i - 1);
      while (d-- > 0)
        n += "0";
    }
    return n;
  }
  exports.stringifyNumber = stringifyNumber;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str));
      const dot = str.indexOf(".");
      if (dot !== -1 && str[str.length - 1] === "0")
        node.minFractionDigits = str.length - dot - 1;
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS(function(exports) {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
      return prefix + value.toString(radix);
    return stringifyNumber.stringifyNumber(node);
  }
  var intOct = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: (node) => intStringify(node, 8, "0o")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS(function(exports) {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.boolTag,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float
  ];
  exports.schema = schema;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var map = require_map();
  var seq = require_seq();
  function intIdentify(value) {
    return typeof value === "bigint" || Number.isInteger(value);
  }
  var stringifyJSON = ({ value }) => JSON.stringify(value);
  var jsonScalars = [
    {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify: stringifyJSON
    },
    {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: stringifyJSON
    },
    {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (str) => str === "true",
      stringify: stringifyJSON
    },
    {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
      stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (str) => parseFloat(str),
      stringify: stringifyJSON
    }
  ];
  var jsonError = {
    default: true,
    tag: "",
    test: /^/,
    resolve(str, onError) {
      onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
      return str;
    }
  };
  var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
  exports.schema = schema;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS(function(exports) {
  var node_buffer = __require("buffer");
  var Scalar = require_Scalar();
  var stringifyString = require_stringifyString();
  var binary = {
    identify: (value) => value instanceof Uint8Array,
    default: false,
    tag: "tag:yaml.org,2002:binary",
    resolve(src, onError) {
      if (typeof node_buffer.Buffer === "function") {
        return node_buffer.Buffer.from(src, "base64");
      } else if (typeof atob === "function") {
        const str = atob(src.replace(/[\n\r]/g, ""));
        const buffer = new Uint8Array(str.length);
        for (let i = 0;i < str.length; ++i)
          buffer[i] = str.charCodeAt(i);
        return buffer;
      } else {
        onError("This environment does not support reading binary tags; either Buffer or atob is required");
        return src;
      }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
      if (!value)
        return "";
      const buf = value;
      let str;
      if (typeof node_buffer.Buffer === "function") {
        str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
      } else if (typeof btoa === "function") {
        let s = "";
        for (let i = 0;i < buf.length; ++i)
          s += String.fromCharCode(buf[i]);
        str = btoa(s);
      } else {
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      }
      type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
        const n = Math.ceil(str.length / lineWidth);
        const lines = new Array(n);
        for (let i = 0, o = 0;i < n; ++i, o += lineWidth) {
          lines[i] = str.substr(o, lineWidth);
        }
        str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
  };
  exports.binary = binary;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS(function(exports) {
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  var YAMLSeq = require_YAMLSeq();
  function resolvePairs(seq, onError) {
    if (identity.isSeq(seq)) {
      for (let i = 0;i < seq.items.length; ++i) {
        let item = seq.items[i];
        if (identity.isPair(item))
          continue;
        else if (identity.isMap(item)) {
          if (item.items.length > 1)
            onError("Each pair must have its own sequence indicator");
          const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
          if (item.commentBefore)
            pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
          if (item.comment) {
            const cn = pair.value ?? pair.key;
            cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
          }
          item = pair;
        }
        seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
      }
    } else
      onError("Expected a sequence for this tag");
    return seq;
  }
  function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs = new YAMLSeq.YAMLSeq(schema);
    pairs.tag = "tag:yaml.org,2002:pairs";
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
      for (let it of iterable) {
        if (typeof replacer === "function")
          it = replacer.call(iterable, String(i++), it);
        let key, value;
        if (Array.isArray(it)) {
          if (it.length === 2) {
            key = it[0];
            value = it[1];
          } else
            throw new TypeError(`Expected [key, value] tuple: ${it}`);
        } else if (it && it instanceof Object) {
          const keys = Object.keys(it);
          if (keys.length === 1) {
            key = keys[0];
            value = it[key];
          } else {
            throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
          }
        } else {
          key = it;
        }
        pairs.items.push(Pair.createPair(key, value, ctx));
      }
    return pairs;
  }
  var pairs = {
    collection: "seq",
    default: false,
    tag: "tag:yaml.org,2002:pairs",
    resolve: resolvePairs,
    createNode: createPairs
  };
  exports.createPairs = createPairs;
  exports.pairs = pairs;
  exports.resolvePairs = resolvePairs;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS(function(exports) {
  var identity = require_identity();
  var toJS = require_toJS();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var pairs = require_pairs();

  class YAMLOMap extends YAMLSeq.YAMLSeq {
    constructor() {
      super();
      this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
      this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
      this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
      this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
      this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
      this.tag = YAMLOMap.tag;
    }
    toJSON(_, ctx) {
      if (!ctx)
        return super.toJSON(_);
      const map = new Map;
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const pair of this.items) {
        let key, value;
        if (identity.isPair(pair)) {
          key = toJS.toJS(pair.key, "", ctx);
          value = toJS.toJS(pair.value, key, ctx);
        } else {
          key = toJS.toJS(pair, "", ctx);
        }
        if (map.has(key))
          throw new Error("Ordered maps must not include duplicate keys");
        map.set(key, value);
      }
      return map;
    }
    static from(schema, iterable, ctx) {
      const pairs$1 = pairs.createPairs(schema, iterable, ctx);
      const omap = new this;
      omap.items = pairs$1.items;
      return omap;
    }
  }
  YAMLOMap.tag = "tag:yaml.org,2002:omap";
  var omap = {
    collection: "seq",
    identify: (value) => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: "tag:yaml.org,2002:omap",
    resolve(seq, onError) {
      const pairs$1 = pairs.resolvePairs(seq, onError);
      const seenKeys = [];
      for (const { key } of pairs$1.items) {
        if (identity.isScalar(key)) {
          if (seenKeys.includes(key.value)) {
            onError(`Ordered maps must not include duplicate keys: ${key.value}`);
          } else {
            seenKeys.push(key.value);
          }
        }
      }
      return Object.assign(new YAMLOMap, pairs$1);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
  };
  exports.YAMLOMap = YAMLOMap;
  exports.omap = omap;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
      return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
  var trueTag = {
    identify: (value) => value === true,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar.Scalar(true),
    stringify: boolStringify
  };
  var falseTag = {
    identify: (value) => value === false,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new Scalar.Scalar(false),
    stringify: boolStringify
  };
  exports.falseTag = falseTag;
  exports.trueTag = trueTag;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, "")),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
      const dot = str.indexOf(".");
      if (dot !== -1) {
        const f = str.substring(dot + 1).replace(/_/g, "");
        if (f[f.length - 1] === "0")
          node.minFractionDigits = f.length;
      }
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS(function(exports) {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === "-" || sign === "+")
      offset += 1;
    str = str.substring(offset).replace(/_/g, "");
    if (intAsBigInt) {
      switch (radix) {
        case 2:
          str = `0b${str}`;
          break;
        case 8:
          str = `0o${str}`;
          break;
        case 16:
          str = `0x${str}`;
          break;
      }
      const n = BigInt(str);
      return sign === "-" ? BigInt(-1) * n : n;
    }
    const n = parseInt(str, radix);
    return sign === "-" ? -1 * n : n;
  }
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
      const str = value.toString(radix);
      return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber.stringifyNumber(node);
  }
  var intBin = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: (node) => intStringify(node, 2, "0b")
  };
  var intOct = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: (node) => intStringify(node, 8, "0")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intBin = intBin;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS(function(exports) {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();

  class YAMLSet extends YAMLMap.YAMLMap {
    constructor(schema) {
      super(schema);
      this.tag = YAMLSet.tag;
    }
    add(key) {
      let pair;
      if (identity.isPair(key))
        pair = key;
      else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
        pair = new Pair.Pair(key.key, null);
      else
        pair = new Pair.Pair(key, null);
      const prev = YAMLMap.findPair(this.items, pair.key);
      if (!prev)
        this.items.push(pair);
    }
    get(key, keepPair) {
      const pair = YAMLMap.findPair(this.items, key);
      return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
    }
    set(key, value) {
      if (typeof value !== "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
      const prev = YAMLMap.findPair(this.items, key);
      if (prev && !value) {
        this.items.splice(this.items.indexOf(prev), 1);
      } else if (!prev && value) {
        this.items.push(new Pair.Pair(key));
      }
    }
    toJSON(_, ctx) {
      return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      if (this.hasAllNullValues(true))
        return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
      else
        throw new Error("Set items must all have null values");
    }
    static from(schema, iterable, ctx) {
      const { replacer } = ctx;
      const set = new this(schema);
      if (iterable && Symbol.iterator in Object(iterable))
        for (let value of iterable) {
          if (typeof replacer === "function")
            value = replacer.call(iterable, value, value);
          set.items.push(Pair.createPair(value, null, ctx));
        }
      return set;
    }
  }
  YAMLSet.tag = "tag:yaml.org,2002:set";
  var set = {
    collection: "map",
    identify: (value) => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: "tag:yaml.org,2002:set",
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
      if (identity.isMap(map)) {
        if (map.hasAllNullValues(true))
          return Object.assign(new YAMLSet, map);
        else
          onError("Set items must all have null values");
      } else
        onError("Expected a mapping for this tag");
      return map;
    }
  };
  exports.YAMLSet = YAMLSet;
  exports.set = set;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS(function(exports) {
  var stringifyNumber = require_stringifyNumber();
  function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts.replace(/_/g, "").split(":").reduce((res, p) => res * num(60) + num(p), num(0));
    return sign === "-" ? num(-1) * res : res;
  }
  function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === "bigint")
      num = (n) => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
      return stringifyNumber.stringifyNumber(node);
    let sign = "";
    if (value < 0) {
      sign = "-";
      value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60];
    if (value < 60) {
      parts.unshift(0);
    } else {
      value = (value - parts[0]) / _60;
      parts.unshift(value % _60);
      if (value >= 60) {
        value = (value - parts[0]) / _60;
        parts.unshift(value);
      }
    }
    return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  var intTime = {
    identify: (value) => typeof value === "bigint" || Number.isInteger(value),
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
  };
  var floatTime = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (str) => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
  };
  var timestamp = {
    identify: (value) => value instanceof Date,
    default: true,
    tag: "tag:yaml.org,2002:timestamp",
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})" + "(?:" + "(?:t|T|[ \\t]+)" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)" + "(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?" + ")?$"),
    resolve(str) {
      const match = str.match(timestamp.test);
      if (!match)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, year, month, day, hour, minute, second] = match.map(Number);
      const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
      let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
      const tz = match[8];
      if (tz && tz !== "Z") {
        let d = parseSexagesimal(tz, false);
        if (Math.abs(d) < 30)
          d *= 60;
        date -= 60000 * d;
      }
      return new Date(date);
    },
    stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
  };
  exports.floatTime = floatTime;
  exports.intTime = intTime;
  exports.timestamp = timestamp;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS(function(exports) {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var binary = require_binary();
  var bool = require_bool2();
  var float = require_float2();
  var int = require_int2();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var set = require_set();
  var timestamp = require_timestamp();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.trueTag,
    bool.falseTag,
    int.intBin,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float,
    binary.binary,
    merge.merge,
    omap.omap,
    pairs.pairs,
    set.set,
    timestamp.intTime,
    timestamp.floatTime,
    timestamp.timestamp
  ];
  exports.schema = schema;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS(function(exports) {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = require_schema();
  var schema$1 = require_schema2();
  var binary = require_binary();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var schema$2 = require_schema3();
  var set = require_set();
  var timestamp = require_timestamp();
  var schemas = new Map([
    ["core", schema.schema],
    ["failsafe", [map.map, seq.seq, string.string]],
    ["json", schema$1.schema],
    ["yaml11", schema$2.schema],
    ["yaml-1.1", schema$2.schema]
  ]);
  var tagsByName = {
    binary: binary.binary,
    bool: bool.boolTag,
    float: float.float,
    floatExp: float.floatExp,
    floatNaN: float.floatNaN,
    floatTime: timestamp.floatTime,
    int: int.int,
    intHex: int.intHex,
    intOct: int.intOct,
    intTime: timestamp.intTime,
    map: map.map,
    merge: merge.merge,
    null: _null.nullTag,
    omap: omap.omap,
    pairs: pairs.pairs,
    seq: seq.seq,
    set: set.set,
    timestamp: timestamp.timestamp
  };
  var coreKnownTags = {
    "tag:yaml.org,2002:binary": binary.binary,
    "tag:yaml.org,2002:merge": merge.merge,
    "tag:yaml.org,2002:omap": omap.omap,
    "tag:yaml.org,2002:pairs": pairs.pairs,
    "tag:yaml.org,2002:set": set.set,
    "tag:yaml.org,2002:timestamp": timestamp.timestamp
  };
  function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
      return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
      if (Array.isArray(customTags))
        tags = [];
      else {
        const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
      }
    }
    if (Array.isArray(customTags)) {
      for (const tag of customTags)
        tags = tags.concat(tag);
    } else if (typeof customTags === "function") {
      tags = customTags(tags.slice());
    }
    if (addMergeTag)
      tags = tags.concat(merge.merge);
    return tags.reduce((tags, tag) => {
      const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
      if (!tagObj) {
        const tagName = JSON.stringify(tag);
        const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
      }
      if (!tags.includes(tagObj))
        tags.push(tagObj);
      return tags;
    }, []);
  }
  exports.coreKnownTags = coreKnownTags;
  exports.getTags = getTags;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS(function(exports) {
  var identity = require_identity();
  var map = require_map();
  var seq = require_seq();
  var string = require_string();
  var tags = require_tags();
  var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

  class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
      this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
      this.name = typeof schema === "string" && schema || "core";
      this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
      this.tags = tags.getTags(customTags, this.name, merge);
      this.toStringOptions = toStringDefaults ?? null;
      Object.defineProperty(this, identity.MAP, { value: map.map });
      Object.defineProperty(this, identity.SCALAR, { value: string.string });
      Object.defineProperty(this, identity.SEQ, { value: seq.seq });
      this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
    }
    clone() {
      const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
      copy.tags = this.tags.slice();
      return copy;
    }
  }
  exports.Schema = Schema;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS(function(exports) {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
      const dir = doc.directives.toString(doc);
      if (dir) {
        lines.push(dir);
        hasDirectives = true;
      } else if (doc.directives.docStart)
        hasDirectives = true;
    }
    if (hasDirectives)
      lines.push("---");
    const ctx = stringify.createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
      if (lines.length !== 1)
        lines.unshift("");
      const cs = commentString(doc.commentBefore);
      lines.unshift(stringifyComment.indentComment(cs, ""));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
      if (identity.isNode(doc.contents)) {
        if (doc.contents.spaceBefore && hasDirectives)
          lines.push("");
        if (doc.contents.commentBefore) {
          const cs = commentString(doc.contents.commentBefore);
          lines.push(stringifyComment.indentComment(cs, ""));
        }
        ctx.forceBlockIndent = !!doc.comment;
        contentComment = doc.contents.comment;
      }
      const onChompKeep = contentComment ? undefined : () => chompKeep = true;
      let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
      if (contentComment)
        body += stringifyComment.lineComment(body, "", commentString(contentComment));
      if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
        lines[lines.length - 1] = `--- ${body}`;
      } else
        lines.push(body);
    } else {
      lines.push(stringify.stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
      if (doc.comment) {
        const cs = commentString(doc.comment);
        if (cs.includes(`
`)) {
          lines.push("...");
          lines.push(stringifyComment.indentComment(cs, ""));
        } else {
          lines.push(`... ${cs}`);
        }
      } else {
        lines.push("...");
      }
    } else {
      let dc = doc.comment;
      if (dc && chompKeep)
        dc = dc.replace(/^\n+/, "");
      if (dc) {
        if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
          lines.push("");
        lines.push(stringifyComment.indentComment(commentString(dc), ""));
      }
    }
    return lines.join(`
`) + `
`;
  }
  exports.stringifyDocument = stringifyDocument;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS(function(exports) {
  var Alias = require_Alias();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var toJS = require_toJS();
  var Schema = require_Schema();
  var stringifyDocument = require_stringifyDocument();
  var anchors = require_anchors();
  var applyReviver = require_applyReviver();
  var createNode = require_createNode();
  var directives = require_directives();

  class Document {
    constructor(value, replacer, options) {
      this.commentBefore = null;
      this.comment = null;
      this.errors = [];
      this.warnings = [];
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const opt = Object.assign({
        intAsBigInt: false,
        keepSourceTokens: false,
        logLevel: "warn",
        prettyErrors: true,
        strict: true,
        stringKeys: false,
        uniqueKeys: true,
        version: "1.2"
      }, options);
      this.options = opt;
      let { version } = opt;
      if (options?._directives) {
        this.directives = options._directives.atDocument();
        if (this.directives.yaml.explicit)
          version = this.directives.yaml.version;
      } else
        this.directives = new directives.Directives({ version });
      this.setSchema(version, options);
      this.contents = value === undefined ? null : this.createNode(value, _replacer, options);
    }
    clone() {
      const copy = Object.create(Document.prototype, {
        [identity.NODE_TYPE]: { value: identity.DOC }
      });
      copy.commentBefore = this.commentBefore;
      copy.comment = this.comment;
      copy.errors = this.errors.slice();
      copy.warnings = this.warnings.slice();
      copy.options = Object.assign({}, this.options);
      if (this.directives)
        copy.directives = this.directives.clone();
      copy.schema = this.schema.clone();
      copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    add(value) {
      if (assertCollection(this.contents))
        this.contents.add(value);
    }
    addIn(path, value) {
      if (assertCollection(this.contents))
        this.contents.addIn(path, value);
    }
    createAlias(node, name) {
      if (!node.anchor) {
        const prev = anchors.anchorNames(this);
        node.anchor = !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
      }
      return new Alias.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
      let _replacer = undefined;
      if (typeof replacer === "function") {
        value = replacer.call({ "": value }, "", value);
        _replacer = replacer;
      } else if (Array.isArray(replacer)) {
        const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
        const asStr = replacer.filter(keyToStr).map(String);
        if (asStr.length > 0)
          replacer = replacer.concat(asStr);
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
      const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, anchorPrefix || "a");
      const ctx = {
        aliasDuplicateObjects: aliasDuplicateObjects ?? true,
        keepUndefined: keepUndefined ?? false,
        onAnchor,
        onTagObj,
        replacer: _replacer,
        schema: this.schema,
        sourceObjects
      };
      const node = createNode.createNode(value, tag, ctx);
      if (flow && identity.isCollection(node))
        node.flow = true;
      setAnchors();
      return node;
    }
    createPair(key, value, options = {}) {
      const k = this.createNode(key, null, options);
      const v = this.createNode(value, null, options);
      return new Pair.Pair(k, v);
    }
    delete(key) {
      return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    deleteIn(path) {
      if (Collection.isEmptyPath(path)) {
        if (this.contents == null)
          return false;
        this.contents = null;
        return true;
      }
      return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
    }
    get(key, keepScalar) {
      return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : undefined;
    }
    getIn(path, keepScalar) {
      if (Collection.isEmptyPath(path))
        return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
      return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : undefined;
    }
    has(key) {
      return identity.isCollection(this.contents) ? this.contents.has(key) : false;
    }
    hasIn(path) {
      if (Collection.isEmptyPath(path))
        return this.contents !== undefined;
      return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    set(key, value) {
      if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, [key], value);
      } else if (assertCollection(this.contents)) {
        this.contents.set(key, value);
      }
    }
    setIn(path, value) {
      if (Collection.isEmptyPath(path)) {
        this.contents = value;
      } else if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
      } else if (assertCollection(this.contents)) {
        this.contents.setIn(path, value);
      }
    }
    setSchema(version, options = {}) {
      if (typeof version === "number")
        version = String(version);
      let opt;
      switch (version) {
        case "1.1":
          if (this.directives)
            this.directives.yaml.version = "1.1";
          else
            this.directives = new directives.Directives({ version: "1.1" });
          opt = { resolveKnownTags: false, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          if (this.directives)
            this.directives.yaml.version = version;
          else
            this.directives = new directives.Directives({ version });
          opt = { resolveKnownTags: true, schema: "core" };
          break;
        case null:
          if (this.directives)
            delete this.directives;
          opt = null;
          break;
        default: {
          const sv = JSON.stringify(version);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
        }
      }
      if (options.schema instanceof Object)
        this.schema = options.schema;
      else if (opt)
        this.schema = new Schema.Schema(Object.assign(opt, options));
      else
        throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      const ctx = {
        anchors: new Map,
        doc: this,
        keep: !json,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res } of ctx.anchors.values())
          onAnchor(res, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
    toJSON(jsonArg, onAnchor) {
      return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    toString(options = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
        const s = JSON.stringify(options.indent);
        throw new Error(`"indent" option must be a positive integer, not ${s}`);
      }
      return stringifyDocument.stringifyDocument(this, options);
    }
  }
  function assertCollection(contents) {
    if (identity.isCollection(contents))
      return true;
    throw new Error("Expected a YAML collection as document contents");
  }
  exports.Document = Document;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/errors.js
var require_errors = __commonJS(function(exports) {
  class YAMLError extends Error {
    constructor(name, pos, code, message) {
      super();
      this.name = name;
      this.code = code;
      this.message = message;
      this.pos = pos;
    }
  }

  class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLParseError", pos, code, message);
    }
  }

  class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLWarning", pos, code, message);
    }
  }
  var prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
      return;
    error.linePos = error.pos.map((pos) => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
    if (ci >= 60 && lineStr.length > 80) {
      const trimStart = Math.min(ci - 39, lineStr.length - 79);
      lineStr = "…" + lineStr.substring(trimStart);
      ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
      lineStr = lineStr.substring(0, 79) + "…";
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
      let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
      if (prev.length > 80)
        prev = prev.substring(0, 79) + `…
`;
      lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
      let count = 1;
      const end = error.linePos[1];
      if (end?.line === line && end.col > col) {
        count = Math.max(1, Math.min(end.col - col, 80 - ci));
      }
      const pointer = " ".repeat(ci) + "^".repeat(count);
      error.message += `:

${lineStr}
${pointer}
`;
    }
  };
  exports.YAMLError = YAMLError;
  exports.YAMLParseError = YAMLParseError;
  exports.YAMLWarning = YAMLWarning;
  exports.prettifyError = prettifyError;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS(function(exports) {
  function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = "";
    let commentSep = "";
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
      if (reqSpace) {
        if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
          onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
        reqSpace = false;
      }
      if (tab) {
        if (atNewline && token.type !== "comment" && token.type !== "newline") {
          onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
        }
        tab = null;
      }
      switch (token.type) {
        case "space":
          if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("\t")) {
            tab = token;
          }
          hasSpace = true;
          break;
        case "comment": {
          if (!hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = token.source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += commentSep + cb;
          commentSep = "";
          atNewline = false;
          break;
        }
        case "newline":
          if (atNewline) {
            if (comment)
              comment += token.source;
            else if (!found || indicator !== "seq-item-ind")
              spaceBefore = true;
          } else
            commentSep += token.source;
          atNewline = true;
          hasNewline = true;
          if (anchor || tag)
            newlineAfterProp = token;
          hasSpace = true;
          break;
        case "anchor":
          if (anchor)
            onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
          if (token.source.endsWith(":"))
            onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
          anchor = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        case "tag": {
          if (tag)
            onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
          tag = token;
          start ?? (start = token.offset);
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        }
        case indicator:
          if (anchor || tag)
            onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
          if (found)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
          found = token;
          atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
          hasSpace = false;
          break;
        case "comma":
          if (flow) {
            if (comma)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
            comma = token;
            atNewline = false;
            hasSpace = false;
            break;
          }
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
          atNewline = false;
          hasSpace = false;
      }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
      onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
    }
    if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
      onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
    return {
      comma,
      found,
      spaceBefore,
      comment,
      hasNewline,
      anchor,
      tag,
      newlineAfterProp,
      end,
      start: start ?? end
    };
  }
  exports.resolveProps = resolveProps;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS(function(exports) {
  function containsNewline(key) {
    if (!key)
      return null;
    switch (key.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (key.source.includes(`
`))
          return true;
        if (key.end) {
          for (const st of key.end)
            if (st.type === "newline")
              return true;
        }
        return false;
      case "flow-collection":
        for (const it of key.items) {
          for (const st of it.start)
            if (st.type === "newline")
              return true;
          if (it.sep) {
            for (const st of it.sep)
              if (st.type === "newline")
                return true;
          }
          if (containsNewline(it.key) || containsNewline(it.value))
            return true;
        }
        return false;
      default:
        return true;
    }
  }
  exports.containsNewline = containsNewline;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS(function(exports) {
  var utilContainsNewline = require_util_contains_newline();
  function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === "flow-collection") {
      const end = fc.end[0];
      if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
        const msg = "Flow end indicator should be more indented than parent";
        onError(end, "BAD_INDENT", msg, true);
      }
    }
  }
  exports.flowIndentCheck = flowIndentCheck;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS(function(exports) {
  var identity = require_identity();
  function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
      return false;
    const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
    return items.some((pair) => isEqual(pair.key, search));
  }
  exports.mapIncludes = mapIncludes;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS(function(exports) {
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  var utilMapIncludes = require_util_map_includes();
  var startColMsg = "All mapping items must start at the same column";
  function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
      const { start, key, sep, value } = collItem;
      const keyProps = resolveProps.resolveProps(start, {
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: bm.indent,
        startOnNewline: true
      });
      const implicitKey = !keyProps.found;
      if (implicitKey) {
        if (key) {
          if (key.type === "block-seq")
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
          else if ("indent" in key && key.indent !== bm.indent)
            onError(offset, "BAD_INDENT", startColMsg);
        }
        if (!keyProps.anchor && !keyProps.tag && !sep) {
          commentEnd = keyProps.end;
          if (keyProps.comment) {
            if (map.comment)
              map.comment += `
` + keyProps.comment;
            else
              map.comment = keyProps.comment;
          }
          continue;
        }
        if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
          onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
        }
      } else if (keyProps.found?.indent !== bm.indent) {
        onError(offset, "BAD_INDENT", startColMsg);
      }
      ctx.atKey = true;
      const keyStart = keyProps.end;
      const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
      ctx.atKey = false;
      if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
        onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
      const valueProps = resolveProps.resolveProps(sep ?? [], {
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: bm.indent,
        startOnNewline: !key || key.type === "block-scalar"
      });
      offset = valueProps.end;
      if (valueProps.found) {
        if (implicitKey) {
          if (value?.type === "block-map" && !valueProps.hasNewline)
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
          if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
            onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
        offset = valueNode.range[2];
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      } else {
        if (implicitKey)
          onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
        if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      }
    }
    if (commentEnd && commentEnd < offset)
      onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
  }
  exports.resolveBlockMap = resolveBlockMap;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS(function(exports) {
  var YAMLSeq = require_YAMLSeq();
  var resolveProps = require_resolve_props();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
      const props = resolveProps.resolveProps(start, {
        indicator: "seq-item-ind",
        next: value,
        offset,
        onError,
        parentIndent: bs.indent,
        startOnNewline: true
      });
      if (!props.found) {
        if (props.anchor || props.tag || value) {
          if (value?.type === "block-seq")
            onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
          else
            onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
        } else {
          commentEnd = props.end;
          if (props.comment)
            seq.comment = props.comment;
          continue;
        }
      }
      const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
      offset = node.range[2];
      seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
  }
  exports.resolveBlockSeq = resolveBlockSeq;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS(function(exports) {
  function resolveEnd(end, offset, reqSpace, onError) {
    let comment = "";
    if (end) {
      let hasSpace = false;
      let sep = "";
      for (const token of end) {
        const { source, type } = token;
        switch (type) {
          case "space":
            hasSpace = true;
            break;
          case "comment": {
            if (reqSpace && !hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += sep + cb;
            sep = "";
            break;
          }
          case "newline":
            if (comment)
              sep += source;
            hasSpace = true;
            break;
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
        }
        offset += source.length;
      }
    }
    return { comment, offset };
  }
  exports.resolveEnd = resolveEnd;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS(function(exports) {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilMapIncludes = require_util_map_includes();
  var blockMsg = "Block collections are not allowed within flow collections";
  var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
  function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === "{";
    const fcName = isMap ? "flow map" : "flow sequence";
    const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0;i < fc.items.length; ++i) {
      const collItem = fc.items[i];
      const { start, key, sep, value } = collItem;
      const props = resolveProps.resolveProps(start, {
        flow: fcName,
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (!props.found) {
        if (!props.anchor && !props.tag && !sep && !value) {
          if (i === 0 && props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
          else if (i < fc.items.length - 1)
            onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
          if (props.comment) {
            if (coll.comment)
              coll.comment += `
` + props.comment;
            else
              coll.comment = props.comment;
          }
          offset = props.end;
          continue;
        }
        if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
          onError(key, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
      }
      if (i === 0) {
        if (props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
      } else {
        if (!props.comma)
          onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
        if (props.comment) {
          let prevItemComment = "";
          loop:
            for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
          if (prevItemComment) {
            let prev = coll.items[coll.items.length - 1];
            if (identity.isPair(prev))
              prev = prev.value ?? prev.key;
            if (prev.comment)
              prev.comment += `
` + prevItemComment;
            else
              prev.comment = prevItemComment;
            props.comment = props.comment.substring(prevItemComment.length + 1);
          }
        }
      }
      if (!isMap && !sep && !props.found) {
        const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
        coll.items.push(valueNode);
        offset = valueNode.range[2];
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else {
        ctx.atKey = true;
        const keyStart = props.end;
        const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
        if (isBlock(key))
          onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
        ctx.atKey = false;
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          flow: fcName,
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (valueProps.found) {
          if (!isMap && !props.found && ctx.options.strict) {
            if (sep)
              for (const st of sep) {
                if (st === valueProps.found)
                  break;
                if (st.type === "newline") {
                  onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            if (props.start < valueProps.found.offset - 1024)
              onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else if (value) {
          if ("source" in value && value.source?.[0] === ":")
            onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
          else
            onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
        if (valueNode) {
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        if (isMap) {
          const map = coll;
          if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
            onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
          map.items.push(pair);
        } else {
          const map = new YAMLMap.YAMLMap(ctx.schema);
          map.flow = true;
          map.items.push(pair);
          const endRange = (valueNode ?? keyNode).range;
          map.range = [keyNode.range[0], endRange[1], endRange[2]];
          coll.items.push(map);
        }
        offset = valueNode ? valueNode.range[2] : valueProps.end;
      }
    }
    const expectedEnd = isMap ? "}" : "]";
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce?.source === expectedEnd)
      cePos = ce.offset + ce.source.length;
    else {
      const name = fcName[0].toUpperCase() + fcName.substring(1);
      const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
      onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
      if (ce && ce.source.length !== 1)
        ee.unshift(ce);
    }
    if (ee.length > 0) {
      const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
      if (end.comment) {
        if (coll.comment)
          coll.comment += `
` + end.comment;
        else
          coll.comment = end.comment;
      }
      coll.range = [fc.offset, cePos, end.offset];
    } else {
      coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
  }
  exports.resolveFlowCollection = resolveFlowCollection;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS(function(exports) {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveBlockMap = require_resolve_block_map();
  var resolveBlockSeq = require_resolve_block_seq();
  var resolveFlowCollection = require_resolve_flow_collection();
  function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    if (tagName === "!" || tagName === Coll.tagName) {
      coll.tag = Coll.tagName;
      return coll;
    }
    if (tagName)
      coll.tag = tagName;
    return coll;
  }
  function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
    if (token.type === "block-seq") {
      const { anchor, newlineAfterProp: nl } = props;
      const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
      if (lastProp && (!nl || nl.offset < lastProp.offset)) {
        const message = "Missing newline after block sequence props";
        onError(lastProp, "MISSING_CHAR", message);
      }
    }
    const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
    if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
      return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
    if (!tag) {
      const kt = ctx.schema.knownTags[tagName];
      if (kt?.collection === expType) {
        ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
        tag = kt;
      } else {
        if (kt) {
          onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
        } else {
          onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
        }
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
    const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
      node.format = tag.format;
    return node;
  }
  exports.composeCollection = composeCollection;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
      return { value: "", type: null, comment: "", range: [start, start, start] };
    const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    let chompStart = lines.length;
    for (let i = lines.length - 1;i >= 0; --i) {
      const content = lines[i][1];
      if (content === "" || content === "\r")
        chompStart = i;
      else
        break;
    }
    if (chompStart === 0) {
      const value = header.chomp === "+" && lines.length > 0 ? `
`.repeat(Math.max(1, lines.length - 1)) : "";
      let end = start + header.length;
      if (scalar.source)
        end += scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0;i < chompStart; ++i) {
      const [indent, content] = lines[i];
      if (content === "" || content === "\r") {
        if (header.indent === 0 && indent.length > trimIndent)
          trimIndent = indent.length;
      } else {
        if (indent.length < trimIndent) {
          const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
          onError(offset + indent.length, "MISSING_CHAR", message);
        }
        if (header.indent === 0)
          trimIndent = indent.length;
        contentStart = i;
        if (trimIndent === 0 && !ctx.atRoot) {
          const message = "Block scalar values in collections must be indented";
          onError(offset, "BAD_INDENT", message);
        }
        break;
      }
      offset += indent.length + content.length + 1;
    }
    for (let i = lines.length - 1;i >= chompStart; --i) {
      if (lines[i][0].length > trimIndent)
        chompStart = i + 1;
    }
    let value = "";
    let sep = "";
    let prevMoreIndented = false;
    for (let i = 0;i < contentStart; ++i)
      value += lines[i][0].slice(trimIndent) + `
`;
    for (let i = contentStart;i < chompStart; ++i) {
      let [indent, content] = lines[i];
      offset += indent.length + content.length + 1;
      const crlf = content[content.length - 1] === "\r";
      if (crlf)
        content = content.slice(0, -1);
      if (content && indent.length < trimIndent) {
        const src = header.indent ? "explicit indentation indicator" : "first line";
        const message = `Block scalar lines must not be less indented than their ${src}`;
        onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
        indent = "";
      }
      if (type === Scalar.Scalar.BLOCK_LITERAL) {
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
      } else if (indent.length > trimIndent || content[0] === "\t") {
        if (sep === " ")
          sep = `
`;
        else if (!prevMoreIndented && sep === `
`)
          sep = `

`;
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
        prevMoreIndented = true;
      } else if (content === "") {
        if (sep === `
`)
          value += `
`;
        else
          sep = `
`;
      } else {
        value += sep + content;
        sep = " ";
        prevMoreIndented = false;
      }
    }
    switch (header.chomp) {
      case "-":
        break;
      case "+":
        for (let i = chompStart;i < lines.length; ++i)
          value += `
` + lines[i][0].slice(trimIndent);
        if (value[value.length - 1] !== `
`)
          value += `
`;
        break;
      default:
        value += `
`;
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
  }
  function parseBlockScalarHeader({ offset, props }, strict, onError) {
    if (props[0].type !== "block-scalar-header") {
      onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
      return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = "";
    let error = -1;
    for (let i = 1;i < source.length; ++i) {
      const ch = source[i];
      if (!chomp && (ch === "-" || ch === "+"))
        chomp = ch;
      else {
        const n = Number(ch);
        if (!indent && n)
          indent = n;
        else if (error === -1)
          error = offset + i;
      }
    }
    if (error !== -1)
      onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = "";
    let length = source.length;
    for (let i = 1;i < props.length; ++i) {
      const token = props[i];
      switch (token.type) {
        case "space":
          hasSpace = true;
        case "newline":
          length += token.source.length;
          break;
        case "comment":
          if (strict && !hasSpace) {
            const message = "Comments must be separated from other tokens by white space characters";
            onError(token, "MISSING_CHAR", message);
          }
          length += token.source.length;
          comment = token.source.substring(1);
          break;
        case "error":
          onError(token, "UNEXPECTED_TOKEN", token.message);
          length += token.source.length;
          break;
        default: {
          const message = `Unexpected token in block scalar header: ${token.type}`;
          onError(token, "UNEXPECTED_TOKEN", message);
          const ts = token.source;
          if (ts && typeof ts === "string")
            length += ts.length;
        }
      }
    }
    return { mode, indent, chomp, comment, length };
  }
  function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
    const lines = [line0];
    for (let i = 1;i < split.length; i += 2)
      lines.push([split[i], split[i + 1]]);
    return lines;
  }
  exports.resolveBlockScalar = resolveBlockScalar;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS(function(exports) {
  var Scalar = require_Scalar();
  var resolveEnd = require_resolve_end();
  function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
      case "scalar":
        _type = Scalar.Scalar.PLAIN;
        value = plainValue(source, _onError);
        break;
      case "single-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_SINGLE;
        value = singleQuotedValue(source, _onError);
        break;
      case "double-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_DOUBLE;
        value = doubleQuotedValue(source, _onError);
        break;
      default:
        onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
        return {
          value: "",
          type: null,
          comment: "",
          range: [offset, offset + source.length, offset + source.length]
        };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
    return {
      value,
      type: _type,
      comment: re.comment,
      range: [offset, valueEnd, re.offset]
    };
  }
  function plainValue(source, onError) {
    let badChar = "";
    switch (source[0]) {
      case "\t":
        badChar = "a tab character";
        break;
      case ",":
        badChar = "flow indicator character ,";
        break;
      case "%":
        badChar = "directive indicator character %";
        break;
      case "|":
      case ">": {
        badChar = `block scalar indicator ${source[0]}`;
        break;
      }
      case "@":
      case "`": {
        badChar = `reserved character ${source[0]}`;
        break;
      }
    }
    if (badChar)
      onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
    return unfoldLines(source);
  }
  function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
      onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
    return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
  }
  function unfoldLines(source) {
    const line = /(.*?)\r?\n/sy;
    let match = line.exec(source);
    if (!match)
      return source;
    let trimEnd, trimBoth;
    try {
      trimEnd = new RegExp("(?<![ \t])[ \t]+$");
      trimBoth = new RegExp("^[ \t]+|(?<![ \t])[ \t]+$", "g");
    } catch {
      trimEnd = /[ \t]+$/;
      trimBoth = /^[ \t]+|[ \t]+$/g;
    }
    let res = match[1].replace(trimEnd, "");
    let sep = " ";
    let pos = line.lastIndex;
    while (match = line.exec(source)) {
      const lm = match[1].replace(trimBoth, "");
      if (lm === "") {
        if (sep === `
`)
          res += sep;
        else
          sep = `
`;
      } else {
        res += sep + lm;
        sep = " ";
      }
      pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? "");
  }
  function doubleQuotedValue(source, onError) {
    let res = "";
    for (let i = 1;i < source.length - 1; ++i) {
      const ch = source[i];
      if (ch === "\r" && source[i + 1] === `
`)
        continue;
      if (ch === `
`) {
        const { fold, offset } = foldNewline(source, i);
        res += fold;
        i = offset;
      } else if (ch === "\\") {
        let next = source[++i];
        const cc = escapeCodes[next];
        if (cc)
          res += cc;
        else if (next === `
`) {
          next = source[i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "\r" && source[i + 1] === `
`) {
          next = source[++i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "x" || next === "u" || next === "U") {
          const length = next === "x" ? 2 : next === "u" ? 4 : 8;
          res += parseCharCode(source, i + 1, length, onError);
          i += length;
        } else {
          const raw = source.substr(i - 1, 2);
          onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
          res += raw;
        }
      } else if (ch === " " || ch === "\t") {
        const wsStart = i;
        let next = source[i + 1];
        while (next === " " || next === "\t")
          next = source[++i + 1];
        if (next !== `
` && !(next === "\r" && source[i + 2] === `
`))
          res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
      } else {
        res += ch;
      }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
      onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
    return res;
  }
  function foldNewline(source, offset) {
    let fold = "";
    let ch = source[offset + 1];
    while (ch === " " || ch === "\t" || ch === `
` || ch === "\r") {
      if (ch === "\r" && source[offset + 2] !== `
`)
        break;
      if (ch === `
`)
        fold += `
`;
      offset += 1;
      ch = source[offset + 1];
    }
    if (!fold)
      fold = " ";
    return { fold, offset };
  }
  var escapeCodes = {
    "0": "\x00",
    a: "\x07",
    b: "\b",
    e: "\x1B",
    f: "\f",
    n: `
`,
    r: "\r",
    t: "\t",
    v: "\v",
    N: "",
    _: " ",
    L: "\u2028",
    P: "\u2029",
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "\t": "\t"
  };
  function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    try {
      return String.fromCodePoint(code);
    } catch {
      const raw = source.substr(offset - 2, length + 2);
      onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
      return raw;
    }
  }
  exports.resolveFlowScalar = resolveFlowScalar;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS(function(exports) {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
      tag = ctx.schema[identity.SCALAR];
    } else if (tagName)
      tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === "scalar")
      tag = findScalarTagByTest(ctx, value, token, onError);
    else
      tag = ctx.schema[identity.SCALAR];
    let scalar;
    try {
      const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
      scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
      scalar = new Scalar.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
      scalar.type = type;
    if (tagName)
      scalar.tag = tagName;
    if (tag.format)
      scalar.format = tag.format;
    if (comment)
      scalar.comment = comment;
    return scalar;
  }
  function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === "!")
      return schema[identity.SCALAR];
    const matchWithTest = [];
    for (const tag of schema.tags) {
      if (!tag.collection && tag.tag === tagName) {
        if (tag.default && tag.test)
          matchWithTest.push(tag);
        else
          return tag;
      }
    }
    for (const tag of matchWithTest)
      if (tag.test?.test(value))
        return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
      schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
      return kt;
    }
    onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
    return schema[identity.SCALAR];
  }
  function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
    const tag = schema.tags.find((tag) => (tag.default === true || atKey && tag.default === "key") && tag.test?.test(value)) || schema[identity.SCALAR];
    if (schema.compat) {
      const compat = schema.compat.find((tag) => tag.default && tag.test?.test(value)) ?? schema[identity.SCALAR];
      if (tag.tag !== compat.tag) {
        const ts = directives.tagString(tag.tag);
        const cs = directives.tagString(compat.tag);
        const msg = `Value may be parsed as either ${ts} or ${cs}`;
        onError(token, "TAG_RESOLVE_FAILED", msg, true);
      }
    }
    return tag;
  }
  exports.composeScalar = composeScalar;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS(function(exports) {
  function emptyScalarPosition(offset, before, pos) {
    if (before) {
      pos ?? (pos = before.length);
      for (let i = pos - 1;i >= 0; --i) {
        let st = before[i];
        switch (st.type) {
          case "space":
          case "comment":
          case "newline":
            offset -= st.source.length;
            continue;
        }
        st = before[++i];
        while (st?.type === "space") {
          offset += st.source.length;
          st = before[++i];
        }
        break;
      }
    }
    return offset;
  }
  exports.emptyScalarPosition = emptyScalarPosition;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS(function(exports) {
  var Alias = require_Alias();
  var identity = require_identity();
  var composeCollection = require_compose_collection();
  var composeScalar = require_compose_scalar();
  var resolveEnd = require_resolve_end();
  var utilEmptyScalarPosition = require_util_empty_scalar_position();
  var CN = { composeNode, composeEmptyNode };
  function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
      case "alias":
        node = composeAlias(ctx, token, onError);
        if (anchor || tag)
          onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        node = composeScalar.composeScalar(ctx, token, tag, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        try {
          node = composeCollection.composeCollection(CN, ctx, token, props, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          onError(token, "RESOURCE_EXHAUSTION", message);
        }
        break;
      default: {
        const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
        onError(token, "UNEXPECTED_TOKEN", message);
        isSrcToken = false;
      }
    }
    node ?? (node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError));
    if (anchor && node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
      const msg = "With stringKeys, all keys must be strings";
      onError(tag ?? token, "NON_STRING_KEY", msg);
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      if (token.type === "scalar" && token.source === "")
        node.comment = comment;
      else
        node.commentBefore = comment;
    }
    if (ctx.options.keepSourceTokens && isSrcToken)
      node.srcToken = token;
    return node;
  }
  function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
      type: "scalar",
      offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
      indent: -1,
      source: ""
    };
    const node = composeScalar.composeScalar(ctx, token, tag, onError);
    if (anchor) {
      node.anchor = anchor.source.substring(1);
      if (node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      node.comment = comment;
      node.range[2] = end;
    }
    return node;
  }
  function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias.Alias(source.substring(1));
    if (alias.source === "")
      onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
    if (alias.source.endsWith(":"))
      onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
      alias.comment = re.comment;
    return alias;
  }
  exports.composeEmptyNode = composeEmptyNode;
  exports.composeNode = composeNode;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS(function(exports) {
  var Document = require_Document();
  var composeNode = require_compose_node();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document.Document(undefined, opts);
    const ctx = {
      atKey: false,
      atRoot: true,
      directives: doc.directives,
      options: doc.options,
      schema: doc.schema
    };
    const props = resolveProps.resolveProps(start, {
      indicator: "doc-start",
      next: value ?? end?.[0],
      offset,
      onError,
      parentIndent: 0,
      startOnNewline: true
    });
    if (props.found) {
      doc.directives.docStart = true;
      if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
        onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
    }
    doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
      doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
  }
  exports.composeDoc = composeDoc;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS(function(exports) {
  var node_process = __require("process");
  var directives = require_directives();
  var Document = require_Document();
  var errors = require_errors();
  var identity = require_identity();
  var composeDoc = require_compose_doc();
  var resolveEnd = require_resolve_end();
  function getErrorPos(src) {
    if (typeof src === "number")
      return [src, src + 1];
    if (Array.isArray(src))
      return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === "string" ? source.length : 1)];
  }
  function parsePrelude(prelude) {
    let comment = "";
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0;i < prelude.length; ++i) {
      const source = prelude[i];
      switch (source[0]) {
        case "#":
          comment += (comment === "" ? "" : afterEmptyLine ? `

` : `
`) + (source.substring(1) || " ");
          atComment = true;
          afterEmptyLine = false;
          break;
        case "%":
          if (prelude[i + 1]?.[0] !== "#")
            i += 1;
          atComment = false;
          break;
        default:
          if (!atComment)
            afterEmptyLine = true;
          atComment = false;
      }
    }
    return { comment, afterEmptyLine };
  }

  class Composer {
    constructor(options = {}) {
      this.doc = null;
      this.atDirectives = false;
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
      this.onError = (source, code, message, warning) => {
        const pos = getErrorPos(source);
        if (warning)
          this.warnings.push(new errors.YAMLWarning(pos, code, message));
        else
          this.errors.push(new errors.YAMLParseError(pos, code, message));
      };
      this.directives = new directives.Directives({ version: options.version || "1.2" });
      this.options = options;
    }
    decorate(doc, afterDoc) {
      const { comment, afterEmptyLine } = parsePrelude(this.prelude);
      if (comment) {
        const dc = doc.contents;
        if (afterDoc) {
          doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
        } else if (afterEmptyLine || doc.directives.docStart || !dc) {
          doc.commentBefore = comment;
        } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
          let it = dc.items[0];
          if (identity.isPair(it))
            it = it.key;
          const cb = it.commentBefore;
          it.commentBefore = cb ? `${comment}
${cb}` : comment;
        } else {
          const cb = dc.commentBefore;
          dc.commentBefore = cb ? `${comment}
${cb}` : comment;
        }
      }
      if (afterDoc) {
        for (let i = 0;i < this.errors.length; ++i)
          doc.errors.push(this.errors[i]);
        for (let i = 0;i < this.warnings.length; ++i)
          doc.warnings.push(this.warnings[i]);
      } else {
        doc.errors = this.errors;
        doc.warnings = this.warnings;
      }
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
    }
    streamInfo() {
      return {
        comment: parsePrelude(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    *compose(tokens, forceDoc = false, endOffset = -1) {
      for (const token of tokens)
        yield* this.next(token);
      yield* this.end(forceDoc, endOffset);
    }
    *next(token) {
      if (node_process.env.LOG_STREAM)
        console.dir(token, { depth: null });
      switch (token.type) {
        case "directive":
          this.directives.add(token.source, (offset, message, warning) => {
            const pos = getErrorPos(token);
            pos[0] += offset;
            this.onError(pos, "BAD_DIRECTIVE", message, warning);
          });
          this.prelude.push(token.source);
          this.atDirectives = true;
          break;
        case "document": {
          const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
          if (this.atDirectives && !doc.directives.docStart)
            this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
          this.decorate(doc, false);
          if (this.doc)
            yield this.doc;
          this.doc = doc;
          this.atDirectives = false;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(token.source);
          break;
        case "error": {
          const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
          const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
          if (this.atDirectives || !this.doc)
            this.errors.push(error);
          else
            this.doc.errors.push(error);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const msg = "Unexpected doc-end without preceding document";
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
            break;
          }
          this.doc.directives.docEnd = true;
          const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
          this.decorate(this.doc, true);
          if (end.comment) {
            const dc = this.doc.comment;
            this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
          }
          this.doc.range[2] = end.offset;
          break;
        }
        default:
          this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
      }
    }
    *end(forceDoc = false, endOffset = -1) {
      if (this.doc) {
        this.decorate(this.doc, true);
        yield this.doc;
        this.doc = null;
      } else if (forceDoc) {
        const opts = Object.assign({ _directives: this.directives }, this.options);
        const doc = new Document.Document(undefined, opts);
        if (this.atDirectives)
          this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
        doc.range = [0, endOffset, endOffset];
        this.decorate(doc, false);
        yield doc;
      }
    }
  }
  exports.Composer = Composer;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS(function(exports) {
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  var errors = require_errors();
  var stringifyString = require_stringifyString();
  function resolveAsScalar(token, strict = true, onError) {
    if (token) {
      const _onError = (pos, code, message) => {
        const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
        if (onError)
          onError(offset, code, message);
        else
          throw new errors.YAMLParseError([offset, offset + 1], code, message);
      };
      switch (token.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
        case "block-scalar":
          return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
      }
    }
    return null;
  }
  function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey,
      indent: indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
      { type: "newline", offset: -1, indent, source: `
` }
    ];
    switch (source[0]) {
      case "|":
      case ">": {
        const he = source.indexOf(`
`);
        const head = source.substring(0, he);
        const body = source.substring(he + 1) + `
`;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, end))
          props.push({ type: "newline", offset: -1, indent, source: `
` });
        return { type: "block-scalar", offset, indent, props, source: body };
      }
      case '"':
        return { type: "double-quoted-scalar", offset, indent, source, end };
      case "'":
        return { type: "single-quoted-scalar", offset, indent, source, end };
      default:
        return { type: "scalar", offset, indent, source, end };
    }
  }
  function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = "indent" in token ? token.indent : null;
    if (afterKey && typeof indent === "number")
      indent += 2;
    if (!type)
      switch (token.type) {
        case "single-quoted-scalar":
          type = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          type = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const header = token.props[0];
          if (header.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          type = "PLAIN";
      }
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey: implicitKey || indent === null,
      indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
      case "|":
      case ">":
        setBlockScalarValue(token, source);
        break;
      case '"':
        setFlowScalarValue(token, source, "double-quoted-scalar");
        break;
      case "'":
        setFlowScalarValue(token, source, "single-quoted-scalar");
        break;
      default:
        setFlowScalarValue(token, source, "scalar");
    }
  }
  function setBlockScalarValue(token, source) {
    const he = source.indexOf(`
`);
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + `
`;
    if (token.type === "block-scalar") {
      const header = token.props[0];
      if (header.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      header.source = head;
      token.source = body;
    } else {
      const { offset } = token;
      const indent = "indent" in token ? token.indent : -1;
      const props = [
        { type: "block-scalar-header", offset, indent, source: head }
      ];
      if (!addEndtoBlockProps(props, "end" in token ? token.end : undefined))
        props.push({ type: "newline", offset: -1, indent, source: `
` });
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type: "block-scalar", indent, props, source: body });
    }
  }
  function addEndtoBlockProps(props, end) {
    if (end)
      for (const st of end)
        switch (st.type) {
          case "space":
          case "comment":
            props.push(st);
            break;
          case "newline":
            props.push(st);
            return true;
        }
    return false;
  }
  function setFlowScalarValue(token, source, type) {
    switch (token.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        token.type = type;
        token.source = source;
        break;
      case "block-scalar": {
        const end = token.props.slice(1);
        let oa = source.length;
        if (token.props[0].type === "block-scalar-header")
          oa -= token.props[0].source.length;
        for (const tok of end)
          tok.offset += oa;
        delete token.props;
        Object.assign(token, { type, source, end });
        break;
      }
      case "block-map":
      case "block-seq": {
        const offset = token.offset + source.length;
        const nl = { type: "newline", offset, indent: token.indent, source: `
` };
        delete token.items;
        Object.assign(token, { type, source, end: [nl] });
        break;
      }
      default: {
        const indent = "indent" in token ? token.indent : -1;
        const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type, indent, source, end });
      }
    }
  }
  exports.createScalarToken = createScalarToken;
  exports.resolveAsScalar = resolveAsScalar;
  exports.setScalarValue = setScalarValue;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS(function(exports) {
  var stringify = (cst) => ("type" in cst) ? stringifyToken(cst) : stringifyItem(cst);
  function stringifyToken(token) {
    switch (token.type) {
      case "block-scalar": {
        let res = "";
        for (const tok of token.props)
          res += stringifyToken(tok);
        return res + token.source;
      }
      case "block-map":
      case "block-seq": {
        let res = "";
        for (const item of token.items)
          res += stringifyItem(item);
        return res;
      }
      case "flow-collection": {
        let res = token.start.source;
        for (const item of token.items)
          res += stringifyItem(item);
        for (const st of token.end)
          res += st.source;
        return res;
      }
      case "document": {
        let res = stringifyItem(token);
        if (token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
      default: {
        let res = token.source;
        if ("end" in token && token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
    }
  }
  function stringifyItem({ start, key, sep, value }) {
    let res = "";
    for (const st of start)
      res += st.source;
    if (key)
      res += stringifyToken(key);
    if (sep)
      for (const st of sep)
        res += st.source;
    if (value)
      res += stringifyToken(value);
    return res;
  }
  exports.stringify = stringify;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS(function(exports) {
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove item");
  function visit(cst, visitor) {
    if ("type" in cst && cst.type === "document")
      cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
      const tok = item?.[field];
      if (tok && "items" in tok) {
        item = tok.items[index];
      } else
        return;
    }
    return item;
  };
  visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && "items" in coll)
      return coll;
    throw new Error("Parent collection not found");
  };
  function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === "symbol")
      return ctrl;
    for (const field of ["key", "value"]) {
      const token = item[field];
      if (token && "items" in token) {
        for (let i = 0;i < token.items.length; ++i) {
          const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            token.items.splice(i, 1);
            i -= 1;
          }
        }
        if (typeof ctrl === "function" && field === "key")
          ctrl = ctrl(item, path);
      }
    }
    return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
  }
  exports.visit = visit;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS(function(exports) {
  var cstScalar = require_cst_scalar();
  var cstStringify = require_cst_stringify();
  var cstVisit = require_cst_visit();
  var BOM = "\uFEFF";
  var DOCUMENT = "\x02";
  var FLOW_END = "\x18";
  var SCALAR = "\x1F";
  var isCollection = (token) => !!token && ("items" in token);
  var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
  function prettyToken(token) {
    switch (token) {
      case BOM:
        return "<BOM>";
      case DOCUMENT:
        return "<DOC>";
      case FLOW_END:
        return "<FLOW_END>";
      case SCALAR:
        return "<SCALAR>";
      default:
        return JSON.stringify(token);
    }
  }
  function tokenType(source) {
    switch (source) {
      case BOM:
        return "byte-order-mark";
      case DOCUMENT:
        return "doc-mode";
      case FLOW_END:
        return "flow-error-end";
      case SCALAR:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case `
`:
      case `\r
`:
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (source[0]) {
      case " ":
      case "\t":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }
  exports.createScalarToken = cstScalar.createScalarToken;
  exports.resolveAsScalar = cstScalar.resolveAsScalar;
  exports.setScalarValue = cstScalar.setScalarValue;
  exports.stringify = cstStringify.stringify;
  exports.visit = cstVisit.visit;
  exports.BOM = BOM;
  exports.DOCUMENT = DOCUMENT;
  exports.FLOW_END = FLOW_END;
  exports.SCALAR = SCALAR;
  exports.isCollection = isCollection;
  exports.isScalar = isScalar;
  exports.prettyToken = prettyToken;
  exports.tokenType = tokenType;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS(function(exports) {
  var cst = require_cst();
  function isEmpty(ch) {
    switch (ch) {
      case undefined:
      case " ":
      case `
`:
      case "\r":
      case "\t":
        return true;
      default:
        return false;
    }
  }
  var hexDigits = new Set("0123456789ABCDEFabcdef");
  var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
  var flowIndicatorChars = new Set(",[]{}");
  var invalidAnchorChars = new Set(` ,[]{}
\r	`);
  var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);

  class Lexer {
    constructor() {
      this.atEnd = false;
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      this.buffer = "";
      this.flowKey = false;
      this.flowLevel = 0;
      this.indentNext = 0;
      this.indentValue = 0;
      this.lineEndPos = null;
      this.next = null;
      this.pos = 0;
    }
    *lex(source, incomplete = false) {
      if (source) {
        if (typeof source !== "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + source : source;
        this.lineEndPos = null;
      }
      this.atEnd = !incomplete;
      let next = this.next ?? "stream";
      while (next && (incomplete || this.hasChars(1)))
        next = yield* this.parseNext(next);
    }
    atLineEnd() {
      let i = this.pos;
      let ch = this.buffer[i];
      while (ch === " " || ch === "\t")
        ch = this.buffer[++i];
      if (!ch || ch === "#" || ch === `
`)
        return true;
      if (ch === "\r")
        return this.buffer[i + 1] === `
`;
      return false;
    }
    charAt(n) {
      return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
      let ch = this.buffer[offset];
      if (this.indentNext > 0) {
        let indent = 0;
        while (ch === " ")
          ch = this.buffer[++indent + offset];
        if (ch === "\r") {
          const next = this.buffer[indent + offset + 1];
          if (next === `
` || !next && !this.atEnd)
            return offset + indent + 1;
        }
        return ch === `
` || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
      }
      if (ch === "-" || ch === ".") {
        const dt = this.buffer.substr(offset, 3);
        if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
          return -1;
      }
      return offset;
    }
    getLine() {
      let end = this.lineEndPos;
      if (typeof end !== "number" || end !== -1 && end < this.pos) {
        end = this.buffer.indexOf(`
`, this.pos);
        this.lineEndPos = end;
      }
      if (end === -1)
        return this.atEnd ? this.buffer.substring(this.pos) : null;
      if (this.buffer[end - 1] === "\r")
        end -= 1;
      return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
      return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
      this.buffer = this.buffer.substring(this.pos);
      this.pos = 0;
      this.lineEndPos = null;
      this.next = state;
      return null;
    }
    peek(n) {
      return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
      switch (next) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let line = this.getLine();
      if (line === null)
        return this.setNext("stream");
      if (line[0] === cst.BOM) {
        yield* this.pushCount(1);
        line = line.substring(1);
      }
      if (line[0] === "%") {
        let dirEnd = line.length;
        let cs = line.indexOf("#");
        while (cs !== -1) {
          const ch = line[cs - 1];
          if (ch === " " || ch === "\t") {
            dirEnd = cs - 1;
            break;
          } else {
            cs = line.indexOf("#", cs + 1);
          }
        }
        while (true) {
          const ch = line[dirEnd - 1];
          if (ch === " " || ch === "\t")
            dirEnd -= 1;
          else
            break;
        }
        const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
        yield* this.pushCount(line.length - n);
        this.pushNewline();
        return "stream";
      }
      if (this.atLineEnd()) {
        const sp = yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - sp);
        yield* this.pushNewline();
        return "stream";
      }
      yield cst.DOCUMENT;
      return yield* this.parseLineStart();
    }
    *parseLineStart() {
      const ch = this.charAt(0);
      if (!ch && !this.atEnd)
        return this.setNext("line-start");
      if (ch === "-" || ch === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const s = this.peek(3);
        if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
          yield* this.pushCount(3);
          this.indentValue = 0;
          this.indentNext = 0;
          return s === "---" ? "doc" : "stream";
        }
      }
      this.indentValue = yield* this.pushSpaces(false);
      if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
        this.indentNext = this.indentValue;
      return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [ch0, ch1] = this.peek(2);
      if (!ch1 && !this.atEnd)
        return this.setNext("block-start");
      if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
        const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
        this.indentNext = this.indentValue + 1;
        this.indentValue += n;
        return "block-start";
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(true);
      const line = this.getLine();
      if (line === null)
        return this.setNext("doc");
      let n = yield* this.pushIndicators();
      switch (line[n]) {
        case "#":
          yield* this.pushCount(line.length - n);
        case undefined:
          yield* this.pushNewline();
          return yield* this.parseLineStart();
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel = 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          return "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          n += yield* this.parseBlockScalarHeader();
          n += yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - n);
          yield* this.pushNewline();
          return yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let nl, sp;
      let indent = -1;
      do {
        nl = yield* this.pushNewline();
        if (nl > 0) {
          sp = yield* this.pushSpaces(false);
          this.indentValue = indent = sp;
        } else {
          sp = 0;
        }
        sp += yield* this.pushSpaces(true);
      } while (nl + sp > 0);
      const line = this.getLine();
      if (line === null)
        return this.setNext("flow");
      if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
        const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
        if (!atFlowEndMarker) {
          this.flowLevel = 0;
          yield cst.FLOW_END;
          return yield* this.parseLineStart();
        }
      }
      let n = 0;
      while (line[n] === ",") {
        n += yield* this.pushCount(1);
        n += yield* this.pushSpaces(true);
        this.flowKey = false;
      }
      n += yield* this.pushIndicators();
      switch (line[n]) {
        case undefined:
          return "flow";
        case "#":
          yield* this.pushCount(line.length - n);
          return "flow";
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel += 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          this.flowKey = true;
          this.flowLevel -= 1;
          return this.flowLevel ? "flow" : "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "flow";
        case '"':
        case "'":
          this.flowKey = true;
          return yield* this.parseQuotedScalar();
        case ":": {
          const next = this.charAt(1);
          if (this.flowKey || isEmpty(next) || next === ",") {
            this.flowKey = false;
            yield* this.pushCount(1);
            yield* this.pushSpaces(true);
            return "flow";
          }
        }
        default:
          this.flowKey = false;
          return yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const quote = this.charAt(0);
      let end = this.buffer.indexOf(quote, this.pos + 1);
      if (quote === "'") {
        while (end !== -1 && this.buffer[end + 1] === "'")
          end = this.buffer.indexOf("'", end + 2);
      } else {
        while (end !== -1) {
          let n = 0;
          while (this.buffer[end - 1 - n] === "\\")
            n += 1;
          if (n % 2 === 0)
            break;
          end = this.buffer.indexOf('"', end + 1);
        }
      }
      const qb = this.buffer.substring(0, end);
      let nl = qb.indexOf(`
`, this.pos);
      if (nl !== -1) {
        while (nl !== -1) {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = qb.indexOf(`
`, cs);
        }
        if (nl !== -1) {
          end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
        }
      }
      if (end === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        end = this.buffer.length;
      }
      yield* this.pushToIndex(end + 1, false);
      return this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      let i = this.pos;
      while (true) {
        const ch = this.buffer[++i];
        if (ch === "+")
          this.blockScalarKeep = true;
        else if (ch > "0" && ch <= "9")
          this.blockScalarIndent = Number(ch) - 1;
        else if (ch !== "-")
          break;
      }
      return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
    }
    *parseBlockScalar() {
      let nl = this.pos - 1;
      let indent = 0;
      let ch;
      loop:
        for (let i = this.pos;ch = this.buffer[i]; ++i) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case `
`:
              nl = i;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === `
`)
                break;
            }
            default:
              break loop;
          }
        }
      if (!ch && !this.atEnd)
        return this.setNext("block-scalar");
      if (indent >= this.indentNext) {
        if (this.blockScalarIndent === -1)
          this.indentNext = indent;
        else {
          this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        }
        do {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = this.buffer.indexOf(`
`, cs);
        } while (nl !== -1);
        if (nl === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          nl = this.buffer.length;
        }
      }
      let i = nl + 1;
      ch = this.buffer[i];
      while (ch === " ")
        ch = this.buffer[++i];
      if (ch === "\t") {
        while (ch === "\t" || ch === " " || ch === "\r" || ch === `
`)
          ch = this.buffer[++i];
        nl = i - 1;
      } else if (!this.blockScalarKeep) {
        do {
          let i = nl - 1;
          let ch = this.buffer[i];
          if (ch === "\r")
            ch = this.buffer[--i];
          const lastChar = i;
          while (ch === " ")
            ch = this.buffer[--i];
          if (ch === `
` && i >= this.pos && i + 1 + indent > lastChar)
            nl = i;
          else
            break;
        } while (true);
      }
      yield cst.SCALAR;
      yield* this.pushToIndex(nl + 1, true);
      return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const inFlow = this.flowLevel > 0;
      let end = this.pos - 1;
      let i = this.pos - 1;
      let ch;
      while (ch = this.buffer[++i]) {
        if (ch === ":") {
          const next = this.buffer[i + 1];
          if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
            break;
          end = i;
        } else if (isEmpty(ch)) {
          let next = this.buffer[i + 1];
          if (ch === "\r") {
            if (next === `
`) {
              i += 1;
              ch = `
`;
              next = this.buffer[i + 1];
            } else
              end = i;
          }
          if (next === "#" || inFlow && flowIndicatorChars.has(next))
            break;
          if (ch === `
`) {
            const cs = this.continueScalar(i + 1);
            if (cs === -1)
              break;
            i = Math.max(i, cs - 2);
          }
        } else {
          if (inFlow && flowIndicatorChars.has(ch))
            break;
          end = i;
        }
      }
      if (!ch && !this.atEnd)
        return this.setNext("plain-scalar");
      yield cst.SCALAR;
      yield* this.pushToIndex(end + 1, true);
      return inFlow ? "flow" : "doc";
    }
    *pushCount(n) {
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos += n;
        return n;
      }
      return 0;
    }
    *pushToIndex(i, allowEmpty) {
      const s = this.buffer.slice(this.pos, i);
      if (s) {
        yield s;
        this.pos += s.length;
        return s.length;
      } else if (allowEmpty)
        yield "";
      return 0;
    }
    *pushIndicators() {
      let n = 0;
      loop:
        while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            case "?":
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
      return n;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let i = this.pos + 2;
        let ch = this.buffer[i];
        while (!isEmpty(ch) && ch !== ">")
          ch = this.buffer[++i];
        return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
      } else {
        let i = this.pos + 1;
        let ch = this.buffer[i];
        while (ch) {
          if (tagChars.has(ch))
            ch = this.buffer[++i];
          else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
            ch = this.buffer[i += 3];
          } else
            break;
        }
        return yield* this.pushToIndex(i, false);
      }
    }
    *pushNewline() {
      const ch = this.buffer[this.pos];
      if (ch === `
`)
        return yield* this.pushCount(1);
      else if (ch === "\r" && this.charAt(1) === `
`)
        return yield* this.pushCount(2);
      else
        return 0;
    }
    *pushSpaces(allowTabs) {
      let i = this.pos - 1;
      let ch;
      do {
        ch = this.buffer[++i];
      } while (ch === " " || allowTabs && ch === "\t");
      const n = i - this.pos;
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos = i;
      }
      return n;
    }
    *pushUntil(test) {
      let i = this.pos;
      let ch = this.buffer[i];
      while (!test(ch))
        ch = this.buffer[++i];
      return yield* this.pushToIndex(i, false);
    }
  }
  exports.Lexer = Lexer;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS(function(exports) {
  class LineCounter {
    constructor() {
      this.lineStarts = [];
      this.addNewLine = (offset) => this.lineStarts.push(offset);
      this.linePos = (offset) => {
        let low = 0;
        let high = this.lineStarts.length;
        while (low < high) {
          const mid = low + high >> 1;
          if (this.lineStarts[mid] < offset)
            low = mid + 1;
          else
            high = mid;
        }
        if (this.lineStarts[low] === offset)
          return { line: low + 1, col: 1 };
        if (low === 0)
          return { line: 0, col: offset };
        const start = this.lineStarts[low - 1];
        return { line: low, col: offset - start + 1 };
      };
    }
  }
  exports.LineCounter = LineCounter;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS(function(exports) {
  var node_process = __require("process");
  var cst = require_cst();
  var lexer = require_lexer();
  function includesToken(list, type) {
    for (let i = 0;i < list.length; ++i)
      if (list[i].type === type)
        return true;
    return false;
  }
  function findNonEmptyIndex(list) {
    for (let i = 0;i < list.length; ++i) {
      switch (list[i].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return i;
      }
    }
    return -1;
  }
  function isFlowToken(token) {
    switch (token?.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return true;
      default:
        return false;
    }
  }
  function getPrevProps(parent) {
    switch (parent.type) {
      case "document":
        return parent.start;
      case "block-map": {
        const it = parent.items[parent.items.length - 1];
        return it.sep ?? it.start;
      }
      case "block-seq":
        return parent.items[parent.items.length - 1].start;
      default:
        return [];
    }
  }
  function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
      return [];
    let i = prev.length;
    loop:
      while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
    while (prev[++i]?.type === "space") {}
    return prev.splice(i, prev.length);
  }
  function arrayPushArray(target, source) {
    if (source.length < 1e5)
      Array.prototype.push.apply(target, source);
    else
      for (let i = 0;i < source.length; ++i)
        target.push(source[i]);
  }
  function fixFlowSeqItems(fc) {
    if (fc.start.type === "flow-seq-start") {
      for (const it of fc.items) {
        if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
          if (it.key)
            it.value = it.key;
          delete it.key;
          if (isFlowToken(it.value)) {
            if (it.value.end)
              arrayPushArray(it.value.end, it.sep);
            else
              it.value.end = it.sep;
          } else
            arrayPushArray(it.start, it.sep);
          delete it.sep;
        }
      }
    }
  }

  class Parser {
    constructor(onNewLine) {
      this.atNewLine = true;
      this.atScalar = false;
      this.indent = 0;
      this.offset = 0;
      this.onKeyLine = false;
      this.stack = [];
      this.source = "";
      this.type = "";
      this.lexer = new lexer.Lexer;
      this.onNewLine = onNewLine;
    }
    *parse(source, incomplete = false) {
      if (this.onNewLine && this.offset === 0)
        this.onNewLine(0);
      for (const lexeme of this.lexer.lex(source, incomplete))
        yield* this.next(lexeme);
      if (!incomplete)
        yield* this.end();
    }
    *next(source) {
      this.source = source;
      if (node_process.env.LOG_TOKENS)
        console.log("|", cst.prettyToken(source));
      if (this.atScalar) {
        this.atScalar = false;
        yield* this.step();
        this.offset += source.length;
        return;
      }
      const type = cst.tokenType(source);
      if (!type) {
        const message = `Not a YAML token: ${source}`;
        yield* this.pop({ type: "error", offset: this.offset, message, source });
        this.offset += source.length;
      } else if (type === "scalar") {
        this.atNewLine = false;
        this.atScalar = true;
        this.type = "scalar";
      } else {
        this.type = type;
        yield* this.step();
        switch (type) {
          case "newline":
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine)
              this.onNewLine(this.offset + source.length);
            break;
          case "space":
            if (this.atNewLine && source[0] === " ")
              this.indent += source.length;
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            if (this.atNewLine)
              this.indent += source.length;
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = false;
        }
        this.offset += source.length;
      }
    }
    *end() {
      while (this.stack.length > 0)
        yield* this.pop();
    }
    get sourceToken() {
      const st = {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
      return st;
    }
    *step() {
      const top = this.peek(1);
      if (this.type === "doc-end" && top?.type !== "doc-end") {
        while (this.stack.length > 0)
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!top)
        return yield* this.stream();
      switch (top.type) {
        case "document":
          return yield* this.document(top);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(top);
        case "block-scalar":
          return yield* this.blockScalar(top);
        case "block-map":
          return yield* this.blockMap(top);
        case "block-seq":
          return yield* this.blockSequence(top);
        case "flow-collection":
          return yield* this.flowCollection(top);
        case "doc-end":
          return yield* this.documentEnd(top);
      }
      yield* this.pop();
    }
    peek(n) {
      return this.stack[this.stack.length - n];
    }
    *pop(error) {
      const token = error ?? this.stack.pop();
      if (!token) {
        const message = "Tried to pop an empty stack";
        yield { type: "error", offset: this.offset, source: "", message };
      } else if (this.stack.length === 0) {
        yield token;
      } else {
        const top = this.peek(1);
        if (token.type === "block-scalar") {
          token.indent = "indent" in top ? top.indent : 0;
        } else if (token.type === "flow-collection" && top.type === "document") {
          token.indent = 0;
        }
        if (token.type === "flow-collection")
          fixFlowSeqItems(token);
        switch (top.type) {
          case "document":
            top.value = token;
            break;
          case "block-scalar":
            top.props.push(token);
            break;
          case "block-map": {
            const it = top.items[top.items.length - 1];
            if (it.value) {
              top.items.push({ start: [], key: token, sep: [] });
              this.onKeyLine = true;
              return;
            } else if (it.sep) {
              it.value = token;
            } else {
              Object.assign(it, { key: token, sep: [] });
              this.onKeyLine = !it.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const it = top.items[top.items.length - 1];
            if (it.value)
              top.items.push({ start: [], value: token });
            else
              it.value = token;
            break;
          }
          case "flow-collection": {
            const it = top.items[top.items.length - 1];
            if (!it || it.value)
              top.items.push({ start: [], key: token, sep: [] });
            else if (it.sep)
              it.value = token;
            else
              Object.assign(it, { key: token, sep: [] });
            return;
          }
          default:
            yield* this.pop();
            yield* this.pop(token);
        }
        if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
          const last = token.items[token.items.length - 1];
          if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
            if (top.type === "document")
              top.end = last.start;
            else
              top.items.push({ start: last.start });
            token.items.splice(-1, 1);
          }
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const doc = {
            type: "document",
            offset: this.offset,
            start: []
          };
          if (this.type === "doc-start")
            doc.start.push(this.sourceToken);
          this.stack.push(doc);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(doc) {
      if (doc.value)
        return yield* this.lineEnd(doc);
      switch (this.type) {
        case "doc-start": {
          if (findNonEmptyIndex(doc.start) !== -1) {
            yield* this.pop();
            yield* this.step();
          } else
            doc.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          doc.start.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(doc);
      if (bv)
        this.stack.push(bv);
      else {
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML document`,
          source: this.source
        };
      }
    }
    *scalar(scalar) {
      if (this.type === "map-value-ind") {
        const prev = getPrevProps(this.peek(2));
        const start = getFirstKeyStartProps(prev);
        let sep;
        if (scalar.end) {
          sep = scalar.end;
          sep.push(this.sourceToken);
          delete scalar.end;
        } else
          sep = [this.sourceToken];
        const map = {
          type: "block-map",
          offset: scalar.offset,
          indent: scalar.indent,
          items: [{ start, key: scalar, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map;
      } else
        yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          scalar.props.push(this.sourceToken);
          return;
        case "scalar":
          scalar.source = this.source;
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine) {
            let nl = this.source.indexOf(`
`) + 1;
            while (nl !== 0) {
              this.onNewLine(this.offset + nl);
              nl = this.source.indexOf(`
`, nl) + 1;
            }
          }
          yield* this.pop();
          break;
        default:
          yield* this.pop();
          yield* this.step();
      }
    }
    *blockMap(map) {
      const it = map.items[map.items.length - 1];
      switch (this.type) {
        case "newline":
          this.onKeyLine = false;
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "space":
        case "comment":
          if (it.value) {
            map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            if (this.atIndentedComment(it.start, map.indent)) {
              const prev = map.items[map.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                arrayPushArray(end, it.start);
                end.push(this.sourceToken);
                map.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= map.indent) {
        const atMapIndent = !this.onKeyLine && this.indent === map.indent;
        const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
        let start = [];
        if (atNextItem && it.sep && !it.value) {
          const nl = [];
          for (let i = 0;i < it.sep.length; ++i) {
            const st = it.sep[i];
            switch (st.type) {
              case "newline":
                nl.push(i);
                break;
              case "space":
                break;
              case "comment":
                if (st.indent > map.indent)
                  nl.length = 0;
                break;
              default:
                nl.length = 0;
            }
          }
          if (nl.length >= 2)
            start = it.sep.splice(nl[1]);
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start });
              this.onKeyLine = true;
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "explicit-key-ind":
            if (!it.sep && !it.explicitKey) {
              it.start.push(this.sourceToken);
              it.explicitKey = true;
            } else if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start, explicitKey: true });
            } else {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [this.sourceToken], explicitKey: true }]
              });
            }
            this.onKeyLine = true;
            return;
          case "map-value-ind":
            if (it.explicitKey) {
              if (!it.sep) {
                if (includesToken(it.start, "newline")) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else {
                  const start = getFirstKeyStartProps(it.start);
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                }
              } else if (it.value) {
                map.items.push({ start: [], key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start, key: null, sep: [this.sourceToken] }]
                });
              } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                const start = getFirstKeyStartProps(it.start);
                const key = it.key;
                const sep = it.sep;
                sep.push(this.sourceToken);
                delete it.key;
                delete it.sep;
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start, key, sep }]
                });
              } else if (start.length > 0) {
                it.sep = it.sep.concat(start, this.sourceToken);
              } else {
                it.sep.push(this.sourceToken);
              }
            } else {
              if (!it.sep) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else if (it.value || atNextItem) {
                map.items.push({ start, key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [], key: null, sep: [this.sourceToken] }]
                });
              } else {
                it.sep.push(this.sourceToken);
              }
            }
            this.onKeyLine = true;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (atNextItem || it.value) {
              map.items.push({ start, key: fs, sep: [] });
              this.onKeyLine = true;
            } else if (it.sep) {
              this.stack.push(fs);
            } else {
              Object.assign(it, { key: fs, sep: [] });
              this.onKeyLine = true;
            }
            return;
          }
          default: {
            const bv = this.startBlockValue(map);
            if (bv) {
              if (bv.type === "block-seq") {
                if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                  yield* this.pop({
                    type: "error",
                    offset: this.offset,
                    message: "Unexpected block-seq-ind on same line with key",
                    source: this.source
                  });
                  return;
                }
              } else if (atMapIndent) {
                map.items.push({ start });
              }
              this.stack.push(bv);
              return;
            }
          }
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *blockSequence(seq) {
      const it = seq.items[seq.items.length - 1];
      switch (this.type) {
        case "newline":
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              seq.items.push({ start: [this.sourceToken] });
          } else
            it.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (it.value)
            seq.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(it.start, seq.indent)) {
              const prev = seq.items[seq.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                arrayPushArray(end, it.start);
                end.push(this.sourceToken);
                seq.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (it.value || this.indent <= seq.indent)
            break;
          it.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== seq.indent)
            break;
          if (it.value || includesToken(it.start, "seq-item-ind"))
            seq.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
      }
      if (this.indent > seq.indent) {
        const bv = this.startBlockValue(seq);
        if (bv) {
          this.stack.push(bv);
          return;
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *flowCollection(fc) {
      const it = fc.items[fc.items.length - 1];
      if (this.type === "flow-error-end") {
        let top;
        do {
          yield* this.pop();
          top = this.peek(1);
        } while (top?.type === "flow-collection");
      } else if (fc.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            if (!it || it.sep)
              fc.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            if (!it || it.value)
              fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            if (!it || it.value)
              fc.items.push({ start: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              it.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (!it || it.value)
              fc.items.push({ start: [], key: fs, sep: [] });
            else if (it.sep)
              this.stack.push(fs);
            else
              Object.assign(it, { key: fs, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            fc.end.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(fc);
        if (bv)
          this.stack.push(bv);
        else {
          yield* this.pop();
          yield* this.step();
        }
      } else {
        const parent = this.peek(2);
        if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
          yield* this.pop();
          yield* this.step();
        } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          fixFlowSeqItems(fc);
          const sep = fc.end.splice(1, fc.end.length);
          sep.push(this.sourceToken);
          const map = {
            type: "block-map",
            offset: fc.offset,
            indent: fc.indent,
            items: [{ start, key: fc, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else {
          yield* this.lineEnd(fc);
        }
      }
    }
    flowScalar(type) {
      if (this.onNewLine) {
        let nl = this.source.indexOf(`
`) + 1;
        while (nl !== 0) {
          this.onNewLine(this.offset + nl);
          nl = this.source.indexOf(`
`, nl) + 1;
        }
      }
      return {
        type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(parent) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          start.push(this.sourceToken);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, explicitKey: true }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(start, indent) {
      if (this.type !== "comment")
        return false;
      if (this.indent <= indent)
        return false;
      return start.every((st) => st.type === "newline" || st.type === "space");
    }
    *documentEnd(docEnd) {
      if (this.type !== "doc-mode") {
        if (docEnd.end)
          docEnd.end.push(this.sourceToken);
        else
          docEnd.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
      }
    }
    *lineEnd(token) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop();
          yield* this.step();
          break;
        case "newline":
          this.onKeyLine = false;
        case "space":
        case "comment":
        default:
          if (token.end)
            token.end.push(this.sourceToken);
          else
            token.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
      }
    }
  }
  exports.Parser = Parser;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS(function(exports) {
  var composer = require_composer();
  var Document = require_Document();
  var errors = require_errors();
  var log = require_log();
  var identity = require_identity();
  var lineCounter = require_line_counter();
  var parser = require_parser();
  function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter || null;
    return { lineCounter: lineCounter$1, prettyErrors };
  }
  function parseAllDocuments(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter?.addNewLine);
    const composer$1 = new composer.Composer(options);
    const docs = Array.from(composer$1.compose(parser$1.parse(source)));
    if (prettyErrors && lineCounter)
      for (const doc of docs) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter));
      }
    if (docs.length > 0)
      return docs;
    return Object.assign([], { empty: true }, composer$1.streamInfo());
  }
  function parseDocument(source, options = {}) {
    const { lineCounter, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter?.addNewLine);
    const composer$1 = new composer.Composer(options);
    let doc = null;
    for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
      if (!doc)
        doc = _doc;
      else if (doc.options.logLevel !== "silent") {
        doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    }
    if (prettyErrors && lineCounter) {
      doc.errors.forEach(errors.prettifyError(source, lineCounter));
      doc.warnings.forEach(errors.prettifyError(source, lineCounter));
    }
    return doc;
  }
  function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === "function") {
      _reviver = reviver;
    } else if (options === undefined && reviver && typeof reviver === "object") {
      options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
      return null;
    doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
      if (doc.options.logLevel !== "silent")
        throw doc.errors[0];
      else
        doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
  }
  function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === undefined && replacer) {
      options = replacer;
    }
    if (typeof options === "string")
      options = options.length;
    if (typeof options === "number") {
      const indent = Math.round(options);
      options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
      const { keepUndefined } = options ?? replacer ?? {};
      if (!keepUndefined)
        return;
    }
    if (identity.isDocument(value) && !_replacer)
      return value.toString(options);
    return new Document.Document(value, _replacer, options).toString(options);
  }
  exports.parse = parse;
  exports.parseAllDocuments = parseAllDocuments;
  exports.parseDocument = parseDocument;
  exports.stringify = stringify;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/picomatch/lib/constants.js
var require_constants = __commonJS(function(exports, module) {
  var WIN_SLASH = "\\\\/";
  var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
  var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
  var DOT_LITERAL = "\\.";
  var PLUS_LITERAL = "\\+";
  var QMARK_LITERAL = "\\?";
  var SLASH_LITERAL = "\\/";
  var ONE_CHAR = "(?=.)";
  var QMARK = "[^/]";
  var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
  var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
  var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
  var NO_DOT = `(?!${DOT_LITERAL})`;
  var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
  var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
  var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
  var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
  var STAR = `${QMARK}*?`;
  var SEP = "/";
  var POSIX_CHARS = {
    DOT_LITERAL,
    PLUS_LITERAL,
    QMARK_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    QMARK,
    END_ANCHOR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR,
    SEP
  };
  var WINDOWS_CHARS = {
    ...POSIX_CHARS,
    SLASH_LITERAL: `[${WIN_SLASH}]`,
    QMARK: WIN_NO_SLASH,
    STAR: `${WIN_NO_SLASH}*?`,
    DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
    NO_DOT: `(?!${DOT_LITERAL})`,
    NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
    NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
    QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
    START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
    END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
    SEP: "\\"
  };
  var POSIX_REGEX_SOURCE = {
    __proto__: null,
    alnum: "a-zA-Z0-9",
    alpha: "a-zA-Z",
    ascii: "\\x00-\\x7F",
    blank: " \\t",
    cntrl: "\\x00-\\x1F\\x7F",
    digit: "0-9",
    graph: "\\x21-\\x7E",
    lower: "a-z",
    print: "\\x20-\\x7E ",
    punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
    space: " \\t\\r\\n\\v\\f",
    upper: "A-Z",
    word: "A-Za-z0-9_",
    xdigit: "A-Fa-f0-9"
  };
  module.exports = {
    DEFAULT_MAX_EXTGLOB_RECURSION,
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE,
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    REPLACEMENTS: {
      __proto__: null,
      "***": "*",
      "**/**": "**",
      "**/**/**": "**"
    },
    CHAR_0: 48,
    CHAR_9: 57,
    CHAR_UPPERCASE_A: 65,
    CHAR_LOWERCASE_A: 97,
    CHAR_UPPERCASE_Z: 90,
    CHAR_LOWERCASE_Z: 122,
    CHAR_LEFT_PARENTHESES: 40,
    CHAR_RIGHT_PARENTHESES: 41,
    CHAR_ASTERISK: 42,
    CHAR_AMPERSAND: 38,
    CHAR_AT: 64,
    CHAR_BACKWARD_SLASH: 92,
    CHAR_CARRIAGE_RETURN: 13,
    CHAR_CIRCUMFLEX_ACCENT: 94,
    CHAR_COLON: 58,
    CHAR_COMMA: 44,
    CHAR_DOT: 46,
    CHAR_DOUBLE_QUOTE: 34,
    CHAR_EQUAL: 61,
    CHAR_EXCLAMATION_MARK: 33,
    CHAR_FORM_FEED: 12,
    CHAR_FORWARD_SLASH: 47,
    CHAR_GRAVE_ACCENT: 96,
    CHAR_HASH: 35,
    CHAR_HYPHEN_MINUS: 45,
    CHAR_LEFT_ANGLE_BRACKET: 60,
    CHAR_LEFT_CURLY_BRACE: 123,
    CHAR_LEFT_SQUARE_BRACKET: 91,
    CHAR_LINE_FEED: 10,
    CHAR_NO_BREAK_SPACE: 160,
    CHAR_PERCENT: 37,
    CHAR_PLUS: 43,
    CHAR_QUESTION_MARK: 63,
    CHAR_RIGHT_ANGLE_BRACKET: 62,
    CHAR_RIGHT_CURLY_BRACE: 125,
    CHAR_RIGHT_SQUARE_BRACKET: 93,
    CHAR_SEMICOLON: 59,
    CHAR_SINGLE_QUOTE: 39,
    CHAR_SPACE: 32,
    CHAR_TAB: 9,
    CHAR_UNDERSCORE: 95,
    CHAR_VERTICAL_LINE: 124,
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
    extglobChars(chars) {
      return {
        "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
        "?": { type: "qmark", open: "(?:", close: ")?" },
        "+": { type: "plus", open: "(?:", close: ")+" },
        "*": { type: "star", open: "(?:", close: ")*" },
        "@": { type: "at", open: "(?:", close: ")" }
      };
    },
    globChars(win32) {
      return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
    }
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/picomatch/lib/utils.js
var require_utils = __commonJS(function(exports) {
  var {
    REGEX_BACKSLASH,
    REGEX_REMOVE_BACKSLASH,
    REGEX_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_GLOBAL
  } = require_constants();
  exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
  exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
  exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
  exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
  exports.isWindows = () => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      const platform = navigator.platform.toLowerCase();
      return platform === "win32" || platform === "windows";
    }
    if (typeof process !== "undefined" && process.platform) {
      return process.platform === "win32";
    }
    return false;
  };
  exports.removeBackslashes = (str) => {
    return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
      return match === "\\" ? "" : match;
    });
  };
  exports.escapeLast = (input, char, lastIdx) => {
    const idx = input.lastIndexOf(char, lastIdx);
    if (idx === -1)
      return input;
    if (input[idx - 1] === "\\")
      return exports.escapeLast(input, char, idx - 1);
    return `${input.slice(0, idx)}\\${input.slice(idx)}`;
  };
  exports.removePrefix = (input, state = {}) => {
    let output = input;
    if (output.startsWith("./")) {
      output = output.slice(2);
      state.prefix = "./";
    }
    return output;
  };
  exports.wrapOutput = (input, state = {}, options = {}) => {
    const prepend = options.contains ? "" : "^";
    const append = options.contains ? "" : "$";
    let output = `${prepend}(?:${input})${append}`;
    if (state.negated === true) {
      output = `(?:^(?!${output}).*$)`;
    }
    return output;
  };
  exports.basename = (path, { windows } = {}) => {
    const segs = path.split(windows ? /[\\/]/ : "/");
    const last = segs[segs.length - 1];
    if (last === "") {
      return segs[segs.length - 2];
    }
    return last;
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/picomatch/lib/scan.js
var require_scan = __commonJS(function(exports, module) {
  var utils = require_utils();
  var {
    CHAR_ASTERISK,
    CHAR_AT,
    CHAR_BACKWARD_SLASH,
    CHAR_COMMA,
    CHAR_DOT,
    CHAR_EXCLAMATION_MARK,
    CHAR_FORWARD_SLASH,
    CHAR_LEFT_CURLY_BRACE,
    CHAR_LEFT_PARENTHESES,
    CHAR_LEFT_SQUARE_BRACKET,
    CHAR_PLUS,
    CHAR_QUESTION_MARK,
    CHAR_RIGHT_CURLY_BRACE,
    CHAR_RIGHT_PARENTHESES,
    CHAR_RIGHT_SQUARE_BRACKET
  } = require_constants();
  var isPathSeparator = (code) => {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };
  var depth = (token) => {
    if (token.isPrefix !== true) {
      token.depth = token.isGlobstar ? Infinity : 1;
    }
  };
  var scan = (input, options) => {
    const opts = options || {};
    const length = input.length - 1;
    const scanToEnd = opts.parts === true || opts.scanToEnd === true;
    const slashes = [];
    const tokens = [];
    const parts = [];
    let str = input;
    let index = -1;
    let start = 0;
    let lastIndex = 0;
    let isBrace = false;
    let isBracket = false;
    let isGlob = false;
    let isExtglob = false;
    let isGlobstar = false;
    let braceEscaped = false;
    let backslashes = false;
    let negated = false;
    let negatedExtglob = false;
    let finished = false;
    let braces = 0;
    let prev;
    let code;
    let token = { value: "", depth: 0, isGlob: false };
    const eos = () => index >= length;
    const peek = () => str.charCodeAt(index + 1);
    const advance = () => {
      prev = code;
      return str.charCodeAt(++index);
    };
    while (index < length) {
      code = advance();
      let next;
      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token.backslashes = true;
        code = advance();
        if (code === CHAR_LEFT_CURLY_BRACE) {
          braceEscaped = true;
        }
        continue;
      }
      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }
          if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;
            if (scanToEnd === true) {
              continue;
            }
            break;
          }
          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;
            if (braces === 0) {
              braceEscaped = false;
              isBrace = token.isBrace = true;
              finished = true;
              break;
            }
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token);
        token = { value: "", depth: 0, isGlob: false };
        if (finished === true)
          continue;
        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }
        lastIndex = index + 1;
        continue;
      }
      if (opts.noext !== true) {
        const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
        if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          isExtglob = token.isExtglob = true;
          finished = true;
          if (code === CHAR_EXCLAMATION_MARK && index === start) {
            negatedExtglob = true;
          }
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob = token.isGlob = true;
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
      }
      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK)
          isGlobstar = token.isGlobstar = true;
        isGlob = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_QUESTION_MARK) {
        isGlob = token.isGlob = true;
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }
          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token.isBracket = true;
            isGlob = token.isGlob = true;
            finished = true;
            break;
          }
        }
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
      if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
        negated = token.negated = true;
        start++;
        continue;
      }
      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
      if (isGlob === true) {
        finished = true;
        if (scanToEnd === true) {
          continue;
        }
        break;
      }
    }
    if (opts.noext === true) {
      isExtglob = false;
      isGlob = false;
    }
    let base = str;
    let prefix = "";
    let glob = "";
    if (start > 0) {
      prefix = str.slice(0, start);
      str = str.slice(start);
      lastIndex -= start;
    }
    if (base && isGlob === true && lastIndex > 0) {
      base = str.slice(0, lastIndex);
      glob = str.slice(lastIndex);
    } else if (isGlob === true) {
      base = "";
      glob = str;
    } else {
      base = str;
    }
    if (base && base !== "" && base !== "/" && base !== str) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) {
        base = base.slice(0, -1);
      }
    }
    if (opts.unescape === true) {
      if (glob)
        glob = utils.removeBackslashes(glob);
      if (base && backslashes === true) {
        base = utils.removeBackslashes(base);
      }
    }
    const state = {
      prefix,
      input,
      start,
      base,
      glob,
      isBrace,
      isBracket,
      isGlob,
      isExtglob,
      isGlobstar,
      negated,
      negatedExtglob
    };
    if (opts.tokens === true) {
      state.maxDepth = 0;
      if (!isPathSeparator(code)) {
        tokens.push(token);
      }
      state.tokens = tokens;
    }
    if (opts.parts === true || opts.tokens === true) {
      let prevIndex;
      for (let idx = 0;idx < slashes.length; idx++) {
        const n = prevIndex ? prevIndex + 1 : start;
        const i = slashes[idx];
        const value = input.slice(n, i);
        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else {
            tokens[idx].value = value;
          }
          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }
        if (idx !== 0 || value !== "") {
          parts.push(value);
        }
        prevIndex = i;
      }
      if (prevIndex && prevIndex + 1 < input.length) {
        const value = input.slice(prevIndex + 1);
        parts.push(value);
        if (opts.tokens) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }
      state.slashes = slashes;
      state.parts = parts;
    }
    return state;
  };
  module.exports = scan;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/picomatch/lib/parse.js
var require_parse = __commonJS(function(exports, module) {
  var constants = require_constants();
  var utils = require_utils();
  var {
    MAX_LENGTH,
    POSIX_REGEX_SOURCE,
    REGEX_NON_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_BACKREF,
    REPLACEMENTS
  } = constants;
  var expandRange = (args, options) => {
    if (typeof options.expandRange === "function") {
      return options.expandRange(...args, options);
    }
    args.sort();
    const value = `[${args.join("-")}]`;
    try {
      new RegExp(value);
    } catch (ex) {
      return args.map((v) => utils.escapeRegex(v)).join("..");
    }
    return value;
  };
  var syntaxError = (type, char) => {
    return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
  };
  var splitTopLevel = (input) => {
    const parts = [];
    let bracket = 0;
    let paren = 0;
    let quote = 0;
    let value = "";
    let escaped = false;
    for (const ch of input) {
      if (escaped === true) {
        value += ch;
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        value += ch;
        escaped = true;
        continue;
      }
      if (ch === '"') {
        quote = quote === 1 ? 0 : 1;
        value += ch;
        continue;
      }
      if (quote === 0) {
        if (ch === "[") {
          bracket++;
        } else if (ch === "]" && bracket > 0) {
          bracket--;
        } else if (bracket === 0) {
          if (ch === "(") {
            paren++;
          } else if (ch === ")" && paren > 0) {
            paren--;
          } else if (ch === "|" && paren === 0) {
            parts.push(value);
            value = "";
            continue;
          }
        }
      }
      value += ch;
    }
    parts.push(value);
    return parts;
  };
  var isPlainBranch = (branch) => {
    let escaped = false;
    for (const ch of branch) {
      if (escaped === true) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (/[?*+@!()[\]{}]/.test(ch)) {
        return false;
      }
    }
    return true;
  };
  var normalizeSimpleBranch = (branch) => {
    let value = branch.trim();
    let changed = true;
    while (changed === true) {
      changed = false;
      if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
        value = value.slice(2, -1);
        changed = true;
      }
    }
    if (!isPlainBranch(value)) {
      return;
    }
    return value.replace(/\\(.)/g, "$1");
  };
  var hasRepeatedCharPrefixOverlap = (branches) => {
    const values = branches.map(normalizeSimpleBranch).filter(Boolean);
    for (let i = 0;i < values.length; i++) {
      for (let j = i + 1;j < values.length; j++) {
        const a = values[i];
        const b = values[j];
        const char = a[0];
        if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
          continue;
        }
        if (a === b || a.startsWith(b) || b.startsWith(a)) {
          return true;
        }
      }
    }
    return false;
  };
  var parseRepeatedExtglob = (pattern, requireEnd = true) => {
    if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
      return;
    }
    let bracket = 0;
    let paren = 0;
    let quote = 0;
    let escaped = false;
    for (let i = 1;i < pattern.length; i++) {
      const ch = pattern[i];
      if (escaped === true) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        quote = quote === 1 ? 0 : 1;
        continue;
      }
      if (quote === 1) {
        continue;
      }
      if (ch === "[") {
        bracket++;
        continue;
      }
      if (ch === "]" && bracket > 0) {
        bracket--;
        continue;
      }
      if (bracket > 0) {
        continue;
      }
      if (ch === "(") {
        paren++;
        continue;
      }
      if (ch === ")") {
        paren--;
        if (paren === 0) {
          if (requireEnd === true && i !== pattern.length - 1) {
            return;
          }
          return {
            type: pattern[0],
            body: pattern.slice(2, i),
            end: i
          };
        }
      }
    }
  };
  var buildCharClassStar = (chars) => {
    const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
    return `${source}*`;
  };
  var getStarExtglobSequenceChars = (pattern) => {
    let index = 0;
    const chars = [];
    while (index < pattern.length) {
      const match = parseRepeatedExtglob(pattern.slice(index), false);
      if (!match || match.type !== "*") {
        return;
      }
      const branches = splitTopLevel(match.body).map((branch) => branch.trim());
      if (branches.length !== 1) {
        return;
      }
      const branch = normalizeSimpleBranch(branches[0]);
      if (!branch || branch.length !== 1) {
        return;
      }
      chars.push(branch);
      index += match.end + 1;
    }
    if (chars.length < 1) {
      return;
    }
    return chars;
  };
  var repeatedExtglobRecursion = (pattern) => {
    let depth = 0;
    let value = pattern.trim();
    let match = parseRepeatedExtglob(value);
    while (match) {
      depth++;
      value = match.body.trim();
      match = parseRepeatedExtglob(value);
    }
    return depth;
  };
  var analyzeRepeatedExtglob = (body, options) => {
    if (options.maxExtglobRecursion === false) {
      return { risky: false };
    }
    const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
    const branches = splitTopLevel(body).map((branch) => branch.trim());
    if (branches.length > 1) {
      if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
        return { risky: true };
      }
    }
    const safeChars = [];
    let sawStarSequence = false;
    let combinable = true;
    for (const branch of branches) {
      const chars = getStarExtglobSequenceChars(branch);
      if (chars) {
        sawStarSequence = true;
        safeChars.push(...chars);
        continue;
      }
      const literal = normalizeSimpleBranch(branch);
      if (literal && literal.length === 1) {
        safeChars.push(literal);
        continue;
      }
      combinable = false;
      if (repeatedExtglobRecursion(branch) > max) {
        return { risky: true };
      }
    }
    if (sawStarSequence) {
      return combinable ? { risky: true, safeOutput: buildCharClassStar([...new Set(safeChars)]) } : { risky: true };
    }
    return { risky: false };
  };
  var parse = (input, options) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected a string");
    }
    input = REPLACEMENTS[input] || input;
    const opts = { ...options };
    const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    let len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    const bos = { type: "bos", value: "", output: opts.prepend || "" };
    const tokens = [bos];
    const capture = opts.capture ? "" : "?:";
    const PLATFORM_CHARS = constants.globChars(opts.windows);
    const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
    const {
      DOT_LITERAL,
      PLUS_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    } = PLATFORM_CHARS;
    const globstar = (opts) => {
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const nodot = opts.dot ? "" : NO_DOT;
    const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    let star = opts.bash === true ? globstar(opts) : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    if (typeof opts.noext === "boolean") {
      opts.noextglob = opts.noext;
    }
    const state = {
      input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: "",
      output: "",
      prefix: "",
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens
    };
    input = utils.removePrefix(input, state);
    len = input.length;
    const extglobs = [];
    const braces = [];
    const stack = [];
    let prev = bos;
    let value;
    const eos = () => state.index === len - 1;
    const peek = state.peek = (n = 1) => input[state.index + n];
    const advance = state.advance = () => input[++state.index] || "";
    const remaining = () => input.slice(state.index + 1);
    const consume = (value = "", num = 0) => {
      state.consumed += value;
      state.index += num;
    };
    const append = (token) => {
      state.output += token.output != null ? token.output : token.value;
      consume(token.value);
    };
    const negate = () => {
      let count = 1;
      while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
        advance();
        state.start++;
        count++;
      }
      if (count % 2 === 0) {
        return false;
      }
      state.negated = true;
      state.start++;
      return true;
    };
    const increment = (type) => {
      state[type]++;
      stack.push(type);
    };
    const decrement = (type) => {
      state[type]--;
      stack.pop();
    };
    const push = (tok) => {
      if (prev.type === "globstar") {
        const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
        const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
        if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "star";
          prev.value = "*";
          prev.output = star;
          state.output += prev.output;
        }
      }
      if (extglobs.length && tok.type !== "paren") {
        extglobs[extglobs.length - 1].inner += tok.value;
      }
      if (tok.value || tok.output)
        append(tok);
      if (prev && prev.type === "text" && tok.type === "text") {
        prev.output = (prev.output || prev.value) + tok.value;
        prev.value += tok.value;
        return;
      }
      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };
    const extglobOpen = (type, value) => {
      const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: "" };
      token.prev = prev;
      token.parens = state.parens;
      token.output = state.output;
      token.startIndex = state.index;
      token.tokensIndex = tokens.length;
      const output = (opts.capture ? "(" : "") + token.open;
      increment("parens");
      push({ type, value, output: state.output ? "" : ONE_CHAR });
      push({ type: "paren", extglob: true, value: advance(), output });
      extglobs.push(token);
    };
    const extglobClose = (token) => {
      const literal = input.slice(token.startIndex, state.index + 1);
      const body = input.slice(token.startIndex + 2, state.index);
      const analysis = analyzeRepeatedExtglob(body, opts);
      if ((token.type === "plus" || token.type === "star") && analysis.risky) {
        const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : undefined;
        const open = tokens[token.tokensIndex];
        open.type = "text";
        open.value = literal;
        open.output = safeOutput || utils.escapeRegex(literal);
        for (let i = token.tokensIndex + 1;i < tokens.length; i++) {
          tokens[i].value = "";
          tokens[i].output = "";
          delete tokens[i].suffix;
        }
        state.output = token.output + open.output;
        state.backtrack = true;
        push({ type: "paren", extglob: true, value, output: "" });
        decrement("parens");
        return;
      }
      let output = token.close + (opts.capture ? ")" : "");
      let rest;
      if (token.type === "negate") {
        let extglobStar = star;
        if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
          extglobStar = globstar(opts);
        }
        if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
          output = token.close = `)$))${extglobStar}`;
        }
        if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
          const expression = parse(rest, { ...options, fastpaths: false }).output;
          output = token.close = `)${expression})${extglobStar})`;
        }
        if (token.prev.type === "bos") {
          state.negatedExtglob = true;
        }
      }
      push({ type: "paren", extglob: true, value, output });
      decrement("parens");
    };
    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      let backslashes = false;
      let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
        if (first === "\\") {
          backslashes = true;
          return m;
        }
        if (first === "?") {
          if (esc) {
            return esc + first + (rest ? QMARK.repeat(rest.length) : "");
          }
          if (index === 0) {
            return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
          }
          return QMARK.repeat(chars.length);
        }
        if (first === ".") {
          return DOT_LITERAL.repeat(chars.length);
        }
        if (first === "*") {
          if (esc) {
            return esc + first + (rest ? star : "");
          }
          return star;
        }
        return esc ? m : `\\${m}`;
      });
      if (backslashes === true) {
        if (opts.unescape === true) {
          output = output.replace(/\\/g, "");
        } else {
          output = output.replace(/\\+/g, (m) => {
            return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
          });
        }
      }
      if (output === input && opts.contains === true) {
        state.output = input;
        return state;
      }
      state.output = utils.wrapOutput(output, state, options);
      return state;
    }
    while (!eos()) {
      value = advance();
      if (value === "\x00") {
        continue;
      }
      if (value === "\\") {
        const next = peek();
        if (next === "/" && opts.bash !== true) {
          continue;
        }
        if (next === "." || next === ";") {
          continue;
        }
        if (!next) {
          value += "\\";
          push({ type: "text", value });
          continue;
        }
        const match = /^\\+/.exec(remaining());
        let slashes = 0;
        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;
          if (slashes % 2 !== 0) {
            value += "\\";
          }
        }
        if (opts.unescape === true) {
          value = advance();
        } else {
          value += advance();
        }
        if (state.brackets === 0) {
          push({ type: "text", value });
          continue;
        }
      }
      if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
        if (opts.posix !== false && value === ":") {
          const inner = prev.value.slice(1);
          if (inner.includes("[")) {
            prev.posix = true;
            if (inner.includes(":")) {
              const idx = prev.value.lastIndexOf("[");
              const pre = prev.value.slice(0, idx);
              const rest = prev.value.slice(idx + 2);
              const posix = POSIX_REGEX_SOURCE[rest];
              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();
                if (!bos.output && tokens.indexOf(prev) === 1) {
                  bos.output = ONE_CHAR;
                }
                continue;
              }
            }
          }
        }
        if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
          value = `\\${value}`;
        }
        if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
          value = `\\${value}`;
        }
        if (opts.posix === true && value === "!" && prev.value === "[") {
          value = "^";
        }
        prev.value += value;
        append({ value });
        continue;
      }
      if (state.quotes === 1 && value !== '"') {
        value = utils.escapeRegex(value);
        prev.value += value;
        append({ value });
        continue;
      }
      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;
        if (opts.keepQuotes === true) {
          push({ type: "text", value });
        }
        continue;
      }
      if (value === "(") {
        increment("parens");
        push({ type: "paren", value });
        continue;
      }
      if (value === ")") {
        if (state.parens === 0 && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("opening", "("));
        }
        const extglob = extglobs[extglobs.length - 1];
        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }
        push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
        decrement("parens");
        continue;
      }
      if (value === "[") {
        if (opts.nobracket === true || !remaining().includes("]")) {
          if (opts.nobracket !== true && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("closing", "]"));
          }
          value = `\\${value}`;
        } else {
          increment("brackets");
        }
        push({ type: "bracket", value });
        continue;
      }
      if (value === "]") {
        if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
          push({ type: "text", value, output: `\\${value}` });
          continue;
        }
        if (state.brackets === 0) {
          if (opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "["));
          }
          push({ type: "text", value, output: `\\${value}` });
          continue;
        }
        decrement("brackets");
        const prevValue = prev.value.slice(1);
        if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
          value = `/${value}`;
        }
        prev.value += value;
        append({ value });
        if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
          continue;
        }
        const escaped = utils.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length);
        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        }
        prev.value = `(${capture}${escaped}|${prev.value})`;
        state.output += prev.value;
        continue;
      }
      if (value === "{" && opts.nobrace !== true) {
        increment("braces");
        const open = {
          type: "brace",
          value,
          output: "(",
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length
        };
        braces.push(open);
        push(open);
        continue;
      }
      if (value === "}") {
        const brace = braces[braces.length - 1];
        if (opts.nobrace === true || !brace) {
          push({ type: "text", value, output: value });
          continue;
        }
        let output = ")";
        if (brace.dots === true) {
          const arr = tokens.slice();
          const range = [];
          for (let i = arr.length - 1;i >= 0; i--) {
            tokens.pop();
            if (arr[i].type === "brace") {
              break;
            }
            if (arr[i].type !== "dots") {
              range.unshift(arr[i].value);
            }
          }
          output = expandRange(range, opts);
          state.backtrack = true;
        }
        if (brace.comma !== true && brace.dots !== true) {
          const out = state.output.slice(0, brace.outputIndex);
          const toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = "\\{";
          value = output = "\\}";
          state.output = out;
          for (const t of toks) {
            state.output += t.output || t.value;
          }
        }
        push({ type: "brace", value, output });
        decrement("braces");
        braces.pop();
        continue;
      }
      if (value === "|") {
        if (extglobs.length > 0) {
          extglobs[extglobs.length - 1].conditions++;
        }
        push({ type: "text", value });
        continue;
      }
      if (value === ",") {
        let output = value;
        const brace = braces[braces.length - 1];
        if (brace && stack[stack.length - 1] === "braces") {
          brace.comma = true;
          output = "|";
        }
        push({ type: "comma", value, output });
        continue;
      }
      if (value === "/") {
        if (prev.type === "dot" && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = "";
          state.output = "";
          tokens.pop();
          prev = bos;
          continue;
        }
        push({ type: "slash", value, output: SLASH_LITERAL });
        continue;
      }
      if (value === ".") {
        if (state.braces > 0 && prev.type === "dot") {
          if (prev.value === ".")
            prev.output = DOT_LITERAL;
          const brace = braces[braces.length - 1];
          prev.type = "dots";
          prev.output += value;
          prev.value += value;
          brace.dots = true;
          continue;
        }
        if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
          push({ type: "text", value, output: DOT_LITERAL });
          continue;
        }
        push({ type: "dot", value, output: DOT_LITERAL });
        continue;
      }
      if (value === "?") {
        const isGroup = prev && prev.value === "(";
        if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("qmark", value);
          continue;
        }
        if (prev && prev.type === "paren") {
          const next = peek();
          let output = value;
          if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
            output = `\\${value}`;
          }
          push({ type: "text", value, output });
          continue;
        }
        if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
          push({ type: "qmark", value, output: QMARK_NO_DOT });
          continue;
        }
        push({ type: "qmark", value, output: QMARK });
        continue;
      }
      if (value === "!") {
        if (opts.noextglob !== true && peek() === "(") {
          if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
            extglobOpen("negate", value);
            continue;
          }
        }
        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }
      if (value === "+") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          extglobOpen("plus", value);
          continue;
        }
        if (prev && prev.value === "(" || opts.regex === false) {
          push({ type: "plus", value, output: PLUS_LITERAL });
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
          push({ type: "plus", value });
          continue;
        }
        push({ type: "plus", value: PLUS_LITERAL });
        continue;
      }
      if (value === "@") {
        if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
          push({ type: "at", extglob: true, value, output: "" });
          continue;
        }
        push({ type: "text", value });
        continue;
      }
      if (value !== "*") {
        if (value === "$" || value === "^") {
          value = `\\${value}`;
        }
        const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
        if (match) {
          value += match[0];
          state.index += match[0].length;
        }
        push({ type: "text", value });
        continue;
      }
      if (prev && (prev.type === "globstar" || prev.star === true)) {
        prev.type = "star";
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }
      let rest = remaining();
      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen("star", value);
        continue;
      }
      if (prev.type === "star") {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }
        const prior = prev.prev;
        const before = prior.prev;
        const isStart = prior.type === "slash" || prior.type === "bos";
        const afterStar = before && (before.type === "star" || before.type === "globstar");
        if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
          push({ type: "star", value, output: "" });
          continue;
        }
        const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
        const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
        if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
          push({ type: "star", value, output: "" });
          continue;
        }
        while (rest.slice(0, 3) === "/**") {
          const after = input[state.index + 4];
          if (after && after !== "/") {
            break;
          }
          rest = rest.slice(3);
          consume("/**", 3);
        }
        if (prior.type === "bos" && eos()) {
          prev.type = "globstar";
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }
        if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
          const end = rest[1] !== undefined ? "|$" : "";
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = `(?:${prior.output}`;
          prev.type = "globstar";
          prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
          prev.value += value;
          state.output += prior.output + prev.output;
          state.globstar = true;
          consume(value + advance());
          push({ type: "slash", value: "/", output: "" });
          continue;
        }
        if (prior.type === "bos" && rest[0] === "/") {
          prev.type = "globstar";
          prev.value += value;
          prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({ type: "slash", value: "/", output: "" });
          continue;
        }
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = "globstar";
        prev.output = globstar(opts);
        prev.value += value;
        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      const token = { type: "star", value, output: star };
      if (opts.bash === true) {
        token.output = ".*?";
        if (prev.type === "bos" || prev.type === "slash") {
          token.output = nodot + token.output;
        }
        push(token);
        continue;
      }
      if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
        token.output = value;
        push(token);
        continue;
      }
      if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
        if (prev.type === "dot") {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }
        if (peek() !== "*") {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }
      push(token);
    }
    while (state.brackets > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "]"));
      state.output = utils.escapeLast(state.output, "[");
      decrement("brackets");
    }
    while (state.parens > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", ")"));
      state.output = utils.escapeLast(state.output, "(");
      decrement("parens");
    }
    while (state.braces > 0) {
      if (opts.strictBrackets === true)
        throw new SyntaxError(syntaxError("closing", "}"));
      state.output = utils.escapeLast(state.output, "{");
      decrement("braces");
    }
    if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
      push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
    }
    if (state.backtrack === true) {
      state.output = "";
      for (const token of state.tokens) {
        state.output += token.output != null ? token.output : token.value;
        if (token.suffix) {
          state.output += token.suffix;
        }
      }
    }
    return state;
  };
  parse.fastpaths = (input, options) => {
    const opts = { ...options };
    const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    const len = input.length;
    if (len > max) {
      throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
    }
    input = REPLACEMENTS[input] || input;
    const {
      DOT_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOTS_SLASH,
      STAR,
      START_ANCHOR
    } = constants.globChars(opts.windows);
    const nodot = opts.dot ? NO_DOTS : NO_DOT;
    const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    const capture = opts.capture ? "" : "?:";
    const state = { negated: false, prefix: "" };
    let star = opts.bash === true ? ".*?" : STAR;
    if (opts.capture) {
      star = `(${star})`;
    }
    const globstar = (opts) => {
      if (opts.noglobstar === true)
        return star;
      return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
    };
    const create = (str) => {
      switch (str) {
        case "*":
          return `${nodot}${ONE_CHAR}${star}`;
        case ".*":
          return `${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*.*":
          return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "*/*":
          return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
        case "**":
          return nodot + globstar(opts);
        case "**/*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
        case "**/*.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
        case "**/.*":
          return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
        default: {
          const match = /^(.*?)\.(\w+)$/.exec(str);
          if (!match)
            return;
          const source = create(match[1]);
          if (!source)
            return;
          return source + DOT_LITERAL + match[2];
        }
      }
    };
    const output = utils.removePrefix(input, state);
    let source = create(output);
    if (source && opts.strictSlashes !== true) {
      source += `${SLASH_LITERAL}?`;
    }
    return source;
  };
  module.exports = parse;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS(function(exports, module) {
  var scan = require_scan();
  var parse = require_parse();
  var utils = require_utils();
  var constants = require_constants();
  var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
  var picomatch = (glob, options, returnState = false) => {
    if (Array.isArray(glob)) {
      const fns = glob.map((input) => picomatch(input, options, returnState));
      const arrayMatcher = (str) => {
        for (const isMatch of fns) {
          const state = isMatch(str);
          if (state)
            return state;
        }
        return false;
      };
      return arrayMatcher;
    }
    const isState = isObject(glob) && glob.tokens && glob.input;
    if (glob === "" || typeof glob !== "string" && !isState) {
      throw new TypeError("Expected pattern to be a non-empty string");
    }
    const opts = options || {};
    const posix = opts.windows;
    const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
    const state = regex.state;
    delete regex.state;
    let isIgnored = () => false;
    if (opts.ignore) {
      const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
      isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
    }
    const matcher = (input, returnObject = false) => {
      const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
      const result = { glob, state, regex, posix, input, output, match, isMatch };
      if (typeof opts.onResult === "function") {
        opts.onResult(result);
      }
      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (isIgnored(input)) {
        if (typeof opts.onIgnore === "function") {
          opts.onIgnore(result);
        }
        result.isMatch = false;
        return returnObject ? result : false;
      }
      if (typeof opts.onMatch === "function") {
        opts.onMatch(result);
      }
      return returnObject ? result : true;
    };
    if (returnState) {
      matcher.state = state;
    }
    return matcher;
  };
  picomatch.test = (input, regex, options, { glob, posix } = {}) => {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }
    if (input === "") {
      return { isMatch: false, output: "" };
    }
    const opts = options || {};
    const format = opts.format || (posix ? utils.toPosixSlashes : null);
    let match = input === glob;
    let output = match && format ? format(input) : input;
    if (match === false) {
      output = format ? format(input) : input;
      match = output === glob;
    }
    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = picomatch.matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output);
      }
    }
    return { isMatch: Boolean(match), match, output };
  };
  picomatch.matchBase = (input, glob, options, posix = options && options.windows) => {
    const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
    return regex.test(utils.basename(input, { windows: posix }));
  };
  picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
  picomatch.parse = (pattern, options) => {
    if (Array.isArray(pattern))
      return pattern.map((p) => picomatch.parse(p, options));
    return parse(pattern, { ...options, fastpaths: false });
  };
  picomatch.scan = (input, options) => scan(input, options);
  picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
    if (returnOutput === true) {
      return state.output;
    }
    const opts = options || {};
    const prepend = opts.contains ? "" : "^";
    const append = opts.contains ? "" : "$";
    let source = `${prepend}(?:${state.output})${append}`;
    if (state && state.negated === true) {
      source = `^(?!${source}).*$`;
    }
    const regex = picomatch.toRegex(source, options);
    if (returnState === true) {
      regex.state = state;
    }
    return regex;
  };
  picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
    if (!input || typeof input !== "string") {
      throw new TypeError("Expected a non-empty string");
    }
    let parsed = { negated: false, fastpaths: true };
    if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
      parsed.output = parse.fastpaths(input, options);
    }
    if (!parsed.output) {
      parsed = parse(input, options);
    }
    return picomatch.compileRe(parsed, options, returnOutput, returnState);
  };
  picomatch.toRegex = (source, options) => {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
    } catch (err) {
      if (options && options.debug === true)
        throw err;
      return /$^/;
    }
  };
  picomatch.constants = constants;
  module.exports = picomatch;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/picomatch/index.js
var require_picomatch2 = __commonJS(function(exports, module) {
  var pico = require_picomatch();
  var utils = require_utils();
  function picomatch(glob, options, returnState = false) {
    if (options && (options.windows === null || options.windows === undefined)) {
      options = { ...options, windows: utils.isWindows() };
    }
    return pico(glob, options, returnState);
  }
  Object.assign(picomatch, pico);
  module.exports = picomatch;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/internal/constants.js
var require_constants2 = __commonJS(function(exports, module) {
  var SEMVER_SPEC_VERSION = "2.0.0";
  var MAX_LENGTH = 256;
  var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
  var MAX_SAFE_COMPONENT_LENGTH = 16;
  var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
  var RELEASE_TYPES = [
    "major",
    "premajor",
    "minor",
    "preminor",
    "patch",
    "prepatch",
    "prerelease"
  ];
  module.exports = {
    MAX_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_SAFE_INTEGER,
    RELEASE_TYPES,
    SEMVER_SPEC_VERSION,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/internal/debug.js
var require_debug = __commonJS(function(exports, module) {
  var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {};
  module.exports = debug;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/internal/re.js
var require_re = __commonJS(function(exports, module) {
  var {
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_BUILD_LENGTH,
    MAX_LENGTH
  } = require_constants2();
  var debug = require_debug();
  exports = module.exports = {};
  var re = exports.re = [];
  var safeRe = exports.safeRe = [];
  var src = exports.src = [];
  var safeSrc = exports.safeSrc = [];
  var t = exports.t = {};
  var R = 0;
  var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  var safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
  ];
  var makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  var createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug(name, index, value);
    t[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re[index] = new RegExp(value, isGlobal ? "g" : undefined);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : undefined);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})\\.` + `(${src[t.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` + `(${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
  createToken("FULL", `^${src[t.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
  createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:\\.(${src[t.XRANGEIDENTIFIER]})` + `(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` + `(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?` + `)?)?`);
  createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])" + "(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` + `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
  createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?` + `(?:${src[t.BUILD]})?` + `(?:$|[^\\d])`);
  createToken("COERCERTL", src[t.COERCE], true);
  createToken("COERCERTLFULL", src[t.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAIN]})` + `\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})` + `\\s+-\\s+` + `(${src[t.XRANGEPLAINLOOSE]})` + `\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS(function(exports, module) {
  var looseOption = Object.freeze({ loose: true });
  var emptyOpts = Object.freeze({});
  var parseOptions = (options) => {
    if (!options) {
      return emptyOpts;
    }
    if (typeof options !== "object") {
      return looseOption;
    }
    return options;
  };
  module.exports = parseOptions;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS(function(exports, module) {
  var numeric = /^[0-9]+$/;
  var compareIdentifiers = (a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a === b ? 0 : a < b ? -1 : 1;
    }
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (anum && bnum) {
      a = +a;
      b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
  };
  var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
  module.exports = {
    compareIdentifiers,
    rcompareIdentifiers
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/classes/semver.js
var require_semver = __commonJS(function(exports, module) {
  var debug = require_debug();
  var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants2();
  var { safeRe: re, t } = require_re();
  var parseOptions = require_parse_options();
  var { compareIdentifiers } = require_identifiers();
  var isPrereleaseIdentifier = (prerelease, identifier) => {
    const identifiers = identifier.split(".");
    if (identifiers.length > prerelease.length) {
      return false;
    }
    for (let i = 0;i < identifiers.length; i++) {
      if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
        return false;
      }
    }
    return true;
  };

  class SemVer {
    constructor(version, options) {
      options = parseOptions(options);
      if (version instanceof SemVer) {
        if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError(`version is longer than ${MAX_LENGTH} characters`);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError(`Invalid Version: ${version}`);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map((id) => {
          if (/^[0-9]+$/.test(id)) {
            const num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    format() {
      this.version = `${this.major}.${this.minor}.${this.patch}`;
      if (this.prerelease.length) {
        this.version += `-${this.prerelease.join(".")}`;
      }
      return this.version;
    }
    toString() {
      return this.version;
    }
    compare(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        if (typeof other === "string" && other === this.version) {
          return 0;
        }
        other = new SemVer(other, this.options);
      }
      if (other.version === this.version) {
        return 0;
      }
      return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.major < other.major) {
        return -1;
      }
      if (this.major > other.major) {
        return 1;
      }
      if (this.minor < other.minor) {
        return -1;
      }
      if (this.minor > other.minor) {
        return 1;
      }
      if (this.patch < other.patch) {
        return -1;
      }
      if (this.patch > other.patch) {
        return 1;
      }
      return 0;
    }
    comparePre(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      let i = 0;
      do {
        const a = this.prerelease[i];
        const b = other.prerelease[i];
        debug("prerelease compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    compareBuild(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      let i = 0;
      do {
        const a = this.build[i];
        const b = other.build[i];
        debug("build compare", i, a, b);
        if (a === undefined && b === undefined) {
          return 0;
        } else if (b === undefined) {
          return 1;
        } else if (a === undefined) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i);
    }
    inc(release, identifier, identifierBase) {
      if (release.startsWith("pre")) {
        if (!identifier && identifierBase === false) {
          throw new Error("invalid increment argument: identifier is empty");
        }
        if (identifier) {
          const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
          if (!match || match[1] !== identifier) {
            throw new Error(`invalid identifier: ${identifier}`);
          }
        }
      }
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier, identifierBase);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier, identifierBase);
          this.inc("pre", identifier, identifierBase);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier, identifierBase);
          }
          this.inc("pre", identifier, identifierBase);
          break;
        case "release":
          if (this.prerelease.length === 0) {
            throw new Error(`version ${this.raw} is not a prerelease`);
          }
          this.prerelease.length = 0;
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre": {
          const base = Number(identifierBase) ? 1 : 0;
          if (this.prerelease.length === 0) {
            this.prerelease = [base];
          } else {
            let i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === "number") {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) {
              if (identifier === this.prerelease.join(".") && identifierBase === false) {
                throw new Error("invalid increment argument: identifier already exists");
              }
              this.prerelease.push(base);
            }
          }
          if (identifier) {
            let prerelease = [identifier, base];
            if (identifierBase === false) {
              prerelease = [identifier];
            }
            if (isPrereleaseIdentifier(this.prerelease, identifier)) {
              const prereleaseBase = this.prerelease[identifier.split(".").length];
              if (isNaN(prereleaseBase)) {
                this.prerelease = prerelease;
              }
            } else {
              this.prerelease = prerelease;
            }
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${release}`);
      }
      this.raw = this.format();
      if (this.build.length) {
        this.raw += `+${this.build.join(".")}`;
      }
      return this;
    }
  }
  module.exports = SemVer;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/parse.js
var require_parse2 = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var parse = (version, options, throwErrors = false) => {
    if (version instanceof SemVer) {
      return version;
    }
    try {
      return new SemVer(version, options);
    } catch (er) {
      if (!throwErrors) {
        return null;
      }
      throw er;
    }
  };
  module.exports = parse;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/valid.js
var require_valid = __commonJS(function(exports, module) {
  var parse = require_parse2();
  var valid = (version, options) => {
    const v = parse(version, options);
    return v ? v.version : null;
  };
  module.exports = valid;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/clean.js
var require_clean = __commonJS(function(exports, module) {
  var parse = require_parse2();
  var clean = (version, options) => {
    const s = parse(version.trim().replace(/^[=v]+/, ""), options);
    return s ? s.version : null;
  };
  module.exports = clean;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/inc.js
var require_inc = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var inc = (version, release, options, identifier, identifierBase) => {
    if (typeof options === "string") {
      identifierBase = identifier;
      identifier = options;
      options = undefined;
    }
    try {
      return new SemVer(version instanceof SemVer ? version.version : version, options).inc(release, identifier, identifierBase).version;
    } catch (er) {
      return null;
    }
  };
  module.exports = inc;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/diff.js
var require_diff = __commonJS(function(exports, module) {
  var parse = require_parse2();
  var diff = (version1, version2) => {
    const v1 = parse(version1, null, true);
    const v2 = parse(version2, null, true);
    const comparison = v1.compare(v2);
    if (comparison === 0) {
      return null;
    }
    const v1Higher = comparison > 0;
    const highVersion = v1Higher ? v1 : v2;
    const lowVersion = v1Higher ? v2 : v1;
    const highHasPre = !!highVersion.prerelease.length;
    const lowHasPre = !!lowVersion.prerelease.length;
    if (lowHasPre && !highHasPre) {
      if (!lowVersion.patch && !lowVersion.minor) {
        return "major";
      }
      if (lowVersion.compareMain(highVersion) === 0) {
        if (lowVersion.minor && !lowVersion.patch) {
          return "minor";
        }
        return "patch";
      }
    }
    const prefix = highHasPre ? "pre" : "";
    if (v1.major !== v2.major) {
      return prefix + "major";
    }
    if (v1.minor !== v2.minor) {
      return prefix + "minor";
    }
    if (v1.patch !== v2.patch) {
      return prefix + "patch";
    }
    return "prerelease";
  };
  module.exports = diff;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/major.js
var require_major = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var major = (a, loose) => new SemVer(a, loose).major;
  module.exports = major;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/minor.js
var require_minor = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var minor = (a, loose) => new SemVer(a, loose).minor;
  module.exports = minor;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/patch.js
var require_patch = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var patch = (a, loose) => new SemVer(a, loose).patch;
  module.exports = patch;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS(function(exports, module) {
  var parse = require_parse2();
  var prerelease = (version, options) => {
    const parsed = parse(version, options);
    return parsed && parsed.prerelease.length ? parsed.prerelease : null;
  };
  module.exports = prerelease;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/compare.js
var require_compare = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
  module.exports = compare;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS(function(exports, module) {
  var compare = require_compare();
  var rcompare = (a, b, loose) => compare(b, a, loose);
  module.exports = rcompare;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS(function(exports, module) {
  var compare = require_compare();
  var compareLoose = (a, b) => compare(a, b, true);
  module.exports = compareLoose;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var compareBuild = (a, b, loose) => {
    const versionA = new SemVer(a, loose);
    const versionB = new SemVer(b, loose);
    return versionA.compare(versionB) || versionA.compareBuild(versionB);
  };
  module.exports = compareBuild;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/sort.js
var require_sort = __commonJS(function(exports, module) {
  var compareBuild = require_compare_build();
  var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
  module.exports = sort;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS(function(exports, module) {
  var compareBuild = require_compare_build();
  var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
  module.exports = rsort;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/gt.js
var require_gt = __commonJS(function(exports, module) {
  var compare = require_compare();
  var gt = (a, b, loose) => compare(a, b, loose) > 0;
  module.exports = gt;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/lt.js
var require_lt = __commonJS(function(exports, module) {
  var compare = require_compare();
  var lt = (a, b, loose) => compare(a, b, loose) < 0;
  module.exports = lt;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/eq.js
var require_eq = __commonJS(function(exports, module) {
  var compare = require_compare();
  var eq = (a, b, loose) => compare(a, b, loose) === 0;
  module.exports = eq;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/neq.js
var require_neq = __commonJS(function(exports, module) {
  var compare = require_compare();
  var neq = (a, b, loose) => compare(a, b, loose) !== 0;
  module.exports = neq;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/gte.js
var require_gte = __commonJS(function(exports, module) {
  var compare = require_compare();
  var gte = (a, b, loose) => compare(a, b, loose) >= 0;
  module.exports = gte;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/lte.js
var require_lte = __commonJS(function(exports, module) {
  var compare = require_compare();
  var lte = (a, b, loose) => compare(a, b, loose) <= 0;
  module.exports = lte;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS(function(exports, module) {
  var eq = require_eq();
  var neq = require_neq();
  var gt = require_gt();
  var gte = require_gte();
  var lt = require_lt();
  var lte = require_lte();
  var cmp = (a, op, b, loose) => {
    switch (op) {
      case "===":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a === b;
      case "!==":
        if (typeof a === "object") {
          a = a.version;
        }
        if (typeof b === "object") {
          b = b.version;
        }
        return a !== b;
      case "":
      case "=":
      case "==":
        return eq(a, b, loose);
      case "!=":
        return neq(a, b, loose);
      case ">":
        return gt(a, b, loose);
      case ">=":
        return gte(a, b, loose);
      case "<":
        return lt(a, b, loose);
      case "<=":
        return lte(a, b, loose);
      default:
        throw new TypeError(`Invalid operator: ${op}`);
    }
  };
  module.exports = cmp;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var parse = require_parse2();
  var { safeRe: re, t } = require_re();
  var coerce = (version, options) => {
    if (version instanceof SemVer) {
      return version;
    }
    if (typeof version === "number") {
      version = String(version);
    }
    if (typeof version !== "string") {
      return null;
    }
    options = options || {};
    let match = null;
    if (!options.rtl) {
      match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
    } else {
      const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
      let next;
      while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
        if (!match || next.index + next[0].length !== match.index + match[0].length) {
          match = next;
        }
        coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
      }
      coerceRtlRegex.lastIndex = -1;
    }
    if (match === null) {
      return null;
    }
    const major = match[2];
    const minor = match[3] || "0";
    const patch = match[4] || "0";
    const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
    const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
    return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
  };
  module.exports = coerce;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/truncate.js
var require_truncate = __commonJS(function(exports, module) {
  var parse = require_parse2();
  var constants = require_constants2();
  var SemVer = require_semver();
  var truncate = (version, truncation, options) => {
    if (!constants.RELEASE_TYPES.includes(truncation)) {
      return null;
    }
    const clonedVersion = cloneInputVersion(version, options);
    return clonedVersion && doTruncation(clonedVersion, truncation);
  };
  var cloneInputVersion = (version, options) => {
    const versionStringToParse = version instanceof SemVer ? version.version : version;
    return parse(versionStringToParse, options);
  };
  var doTruncation = (version, truncation) => {
    if (isPrerelease(truncation)) {
      return version.version;
    }
    version.prerelease = [];
    switch (truncation) {
      case "major":
        version.minor = 0;
        version.patch = 0;
        break;
      case "minor":
        version.patch = 0;
        break;
    }
    return version.format();
  };
  var isPrerelease = (type) => {
    return type.startsWith("pre");
  };
  module.exports = truncate;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS(function(exports, module) {
  class LRUCache {
    constructor() {
      this.max = 1000;
      this.map = new Map;
    }
    get(key) {
      const value = this.map.get(key);
      if (value === undefined) {
        return;
      } else {
        this.map.delete(key);
        this.map.set(key, value);
        return value;
      }
    }
    delete(key) {
      return this.map.delete(key);
    }
    set(key, value) {
      const deleted = this.delete(key);
      if (!deleted && value !== undefined) {
        if (this.map.size >= this.max) {
          const firstKey = this.map.keys().next().value;
          this.delete(firstKey);
        }
        this.map.set(key, value);
      }
      return this;
    }
  }
  module.exports = LRUCache;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/classes/range.js
var require_range = __commonJS(function(exports, module) {
  var SPACE_CHARACTERS = /\s+/g;

  class Range {
    constructor(range, options) {
      options = parseOptions(options);
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        this.raw = range.value;
        this.set = [[range]];
        this.formatted = undefined;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = undefined;
    }
    get range() {
      if (this.formatted === undefined) {
        this.formatted = "";
        for (let i = 0;i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0;k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range) {
      range = range.replace(BUILDSTRIPRE, "");
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug("hyphen replace", range);
      range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range);
      range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
      debug("tilde trim", range);
      range = range.replace(re[t.CARETTRIM], caretTrimReplace);
      debug("caret trim", range);
      let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug("loose invalid filter", comp, this.options);
          return !!comp.match(re[t.COMPARATORLOOSE]);
        });
      }
      debug("range list", rangeList);
      const rangeMap = new Map;
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0;i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  module.exports = Range;
  var LRU = require_lrucache();
  var cache = new LRU;
  var parseOptions = require_parse_options();
  var Comparator = require_comparator();
  var debug = require_debug();
  var SemVer = require_semver();
  var {
    safeRe: re,
    src,
    t,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = require_re();
  var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants2();
  var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
  var isNullSet = (c) => c.value === "<0.0.0-0";
  var isAny = (c) => c.value === "";
  var isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  var parseComparator = (comp, options) => {
    comp = comp.replace(re[t.BUILD], "");
    debug("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug("caret", comp);
    comp = replaceTildes(comp, options);
    debug("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug("xrange", comp);
    comp = replaceStars(comp, options);
    debug("stars", comp);
    return comp;
  };
  var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
  var replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  var replaceTilde = (comp, options) => {
    const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug("tilde return", ret);
      return ret;
    });
  };
  var replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  var replaceCaret = (comp, options) => {
    debug("caret", comp, options);
    const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug("caret return", ret);
      return ret;
    });
  };
  var replaceXRanges = (comp, options) => {
    debug("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  var replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug("xRange", comp, ret, gtlt, M, m, p, pr);
      if (invalidXRangeOrder(M, m, p)) {
        return comp;
      }
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug("xRange return", ret);
      return ret;
    });
  };
  var replaceStars = (comp, options) => {
    debug("replaceStars", comp, options);
    return comp.trim().replace(re[t.STAR], "");
  };
  var replaceGTE0 = (comp, options) => {
    debug("replaceGTE0", comp, options);
    return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
  };
  var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  var testSet = (set, version, options) => {
    for (let i = 0;i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0;i < set.length; i++) {
        debug(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS(function(exports, module) {
  var ANY = Symbol("SemVer ANY");

  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== undefined ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY || version === ANY) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range(this.value, options).test(comp.semver);
      }
      options = parseOptions(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  module.exports = Comparator;
  var parseOptions = require_parse_options();
  var { safeRe: re, t } = require_re();
  var cmp = require_cmp();
  var debug = require_debug();
  var SemVer = require_semver();
  var Range = require_range();
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS(function(exports, module) {
  var Range = require_range();
  var satisfies = (version, range, options) => {
    try {
      range = new Range(range, options);
    } catch (er) {
      return false;
    }
    return range.test(version);
  };
  module.exports = satisfies;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS(function(exports, module) {
  var Range = require_range();
  var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
  module.exports = toComparators;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Range = require_range();
  var maxSatisfying = (versions, range, options) => {
    let max = null;
    let maxSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!max || maxSV.compare(v) === -1) {
          max = v;
          maxSV = new SemVer(max, options);
        }
      }
    });
    return max;
  };
  module.exports = maxSatisfying;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Range = require_range();
  var minSatisfying = (versions, range, options) => {
    let min = null;
    let minSV = null;
    let rangeObj = null;
    try {
      rangeObj = new Range(range, options);
    } catch (er) {
      return null;
    }
    versions.forEach((v) => {
      if (rangeObj.test(v)) {
        if (!min || minSV.compare(v) === 1) {
          min = v;
          minSV = new SemVer(min, options);
        }
      }
    });
    return min;
  };
  module.exports = minSatisfying;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Range = require_range();
  var gt = require_gt();
  var minVersion = (range, loose) => {
    range = new Range(range, loose);
    let minver = new SemVer("0.0.0");
    if (range.test(minver)) {
      return minver;
    }
    minver = new SemVer("0.0.0-0");
    if (range.test(minver)) {
      return minver;
    }
    minver = null;
    for (let i = 0;i < range.set.length; ++i) {
      const comparators = range.set[i];
      let setMin = null;
      comparators.forEach((comparator) => {
        const compver = new SemVer(comparator.semver.version);
        switch (comparator.operator) {
          case ">":
            if (compver.prerelease.length === 0) {
              compver.patch++;
            } else {
              compver.prerelease.push(0);
            }
            compver.raw = compver.format();
          case "":
          case ">=":
            if (!setMin || gt(compver, setMin)) {
              setMin = compver;
            }
            break;
          case "<":
          case "<=":
            break;
          default:
            throw new Error(`Unexpected operation: ${comparator.operator}`);
        }
      });
      if (setMin && (!minver || gt(minver, setMin))) {
        minver = setMin;
      }
    }
    if (minver && range.test(minver)) {
      return minver;
    }
    return null;
  };
  module.exports = minVersion;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS(function(exports, module) {
  var Range = require_range();
  var validRange = (range, options) => {
    try {
      return new Range(range, options).range || "*";
    } catch (er) {
      return null;
    }
  };
  module.exports = validRange;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/outside.js
var require_outside = __commonJS(function(exports, module) {
  var SemVer = require_semver();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var Range = require_range();
  var satisfies = require_satisfies();
  var gt = require_gt();
  var lt = require_lt();
  var lte = require_lte();
  var gte = require_gte();
  var outside = (version, range, hilo, options) => {
    version = new SemVer(version, options);
    range = new Range(range, options);
    let gtfn, ltefn, ltfn, comp, ecomp;
    switch (hilo) {
      case ">":
        gtfn = gt;
        ltefn = lte;
        ltfn = lt;
        comp = ">";
        ecomp = ">=";
        break;
      case "<":
        gtfn = lt;
        ltefn = gte;
        ltfn = gt;
        comp = "<";
        ecomp = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (satisfies(version, range, options)) {
      return false;
    }
    for (let i = 0;i < range.set.length; ++i) {
      const comparators = range.set[i];
      let high = null;
      let low = null;
      comparators.forEach((comparator) => {
        if (comparator.semver === ANY) {
          comparator = new Comparator(">=0.0.0");
        }
        high = high || comparator;
        low = low || comparator;
        if (gtfn(comparator.semver, high.semver, options)) {
          high = comparator;
        } else if (ltfn(comparator.semver, low.semver, options)) {
          low = comparator;
        }
      });
      if (high.operator === comp || high.operator === ecomp) {
        return false;
      }
      if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
        return false;
      } else if (low.operator === ecomp && ltfn(version, low.semver)) {
        return false;
      }
    }
    return true;
  };
  module.exports = outside;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS(function(exports, module) {
  var outside = require_outside();
  var gtr = (version, range, options) => outside(version, range, ">", options);
  module.exports = gtr;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS(function(exports, module) {
  var outside = require_outside();
  var ltr = (version, range, options) => outside(version, range, "<", options);
  module.exports = ltr;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS(function(exports, module) {
  var Range = require_range();
  var intersects = (r1, r2, options) => {
    r1 = new Range(r1, options);
    r2 = new Range(r2, options);
    return r1.intersects(r2, options);
  };
  module.exports = intersects;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS(function(exports, module) {
  var satisfies = require_satisfies();
  var compare = require_compare();
  module.exports = (versions, range, options) => {
    const set = [];
    let first = null;
    let prev = null;
    const v = versions.sort((a, b) => compare(a, b, options));
    for (const version of v) {
      const included = satisfies(version, range, options);
      if (included) {
        prev = version;
        if (!first) {
          first = version;
        }
      } else {
        if (prev) {
          set.push([first, prev]);
        }
        prev = null;
        first = null;
      }
    }
    if (first) {
      set.push([first, null]);
    }
    const ranges = [];
    for (const [min, max] of set) {
      if (min === max) {
        ranges.push(min);
      } else if (!max && min === v[0]) {
        ranges.push("*");
      } else if (!max) {
        ranges.push(`>=${min}`);
      } else if (min === v[0]) {
        ranges.push(`<=${max}`);
      } else {
        ranges.push(`${min} - ${max}`);
      }
    }
    const simplified = ranges.join(" || ");
    const original = typeof range.raw === "string" ? range.raw : String(range);
    return simplified.length < original.length ? simplified : range;
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/ranges/subset.js
var require_subset = __commonJS(function(exports, module) {
  var Range = require_range();
  var Comparator = require_comparator();
  var { ANY } = Comparator;
  var satisfies = require_satisfies();
  var compare = require_compare();
  var subset = (sub, dom, options = {}) => {
    if (sub === dom) {
      return true;
    }
    sub = new Range(sub, options);
    dom = new Range(dom, options);
    let sawNonNull = false;
    OUTER:
      for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
    return true;
  };
  var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
  var minimumVersion = [new Comparator(">=0.0.0")];
  var simpleSubset = (sub, dom, options) => {
    if (sub === dom) {
      return true;
    }
    if (sub.length === 1 && sub[0].semver === ANY) {
      if (dom.length === 1 && dom[0].semver === ANY) {
        return true;
      } else if (options.includePrerelease) {
        sub = minimumVersionWithPreRelease;
      } else {
        sub = minimumVersion;
      }
    }
    if (dom.length === 1 && dom[0].semver === ANY) {
      if (options.includePrerelease) {
        return true;
      } else {
        dom = minimumVersion;
      }
    }
    const eqSet = new Set;
    let gt, lt;
    for (const c of sub) {
      if (c.operator === ">" || c.operator === ">=") {
        gt = higherGT(gt, c, options);
      } else if (c.operator === "<" || c.operator === "<=") {
        lt = lowerLT(lt, c, options);
      } else {
        eqSet.add(c.semver);
      }
    }
    if (eqSet.size > 1) {
      return null;
    }
    let gtltComp;
    if (gt && lt) {
      gtltComp = compare(gt.semver, lt.semver, options);
      if (gtltComp > 0) {
        return null;
      } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
        return null;
      }
    }
    for (const eq of eqSet) {
      if (gt && !satisfies(eq, String(gt), options)) {
        return null;
      }
      if (lt && !satisfies(eq, String(lt), options)) {
        return null;
      }
      for (const c of dom) {
        if (!satisfies(eq, String(c), options)) {
          return false;
        }
      }
      return true;
    }
    let higher, lower;
    let hasDomLT, hasDomGT;
    let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
    let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
    if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
      needDomLTPre = false;
    }
    for (const c of dom) {
      hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
      hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
      if (gt) {
        if (needDomGTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
            needDomGTPre = false;
          }
        }
        if (c.operator === ">" || c.operator === ">=") {
          higher = higherGT(gt, c, options);
          if (higher === c && higher !== gt) {
            return false;
          }
        } else if (gt.operator === ">=" && !c.test(gt.semver)) {
          return false;
        }
      }
      if (lt) {
        if (needDomLTPre) {
          if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
            needDomLTPre = false;
          }
        }
        if (c.operator === "<" || c.operator === "<=") {
          lower = lowerLT(lt, c, options);
          if (lower === c && lower !== lt) {
            return false;
          }
        } else if (lt.operator === "<=" && !c.test(lt.semver)) {
          return false;
        }
      }
      if (!c.operator && (lt || gt) && gtltComp !== 0) {
        return false;
      }
    }
    if (gt && hasDomLT && !lt && gtltComp !== 0) {
      return false;
    }
    if (lt && hasDomGT && !gt && gtltComp !== 0) {
      return false;
    }
    if (needDomGTPre || needDomLTPre) {
      return false;
    }
    return true;
  };
  var higherGT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
  };
  var lowerLT = (a, b, options) => {
    if (!a) {
      return b;
    }
    const comp = compare(a.semver, b.semver, options);
    return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
  };
  module.exports = subset;
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/semver/index.js
var require_semver2 = __commonJS(function(exports, module) {
  var internalRe = require_re();
  var constants = require_constants2();
  var SemVer = require_semver();
  var identifiers = require_identifiers();
  var parse = require_parse2();
  var valid = require_valid();
  var clean = require_clean();
  var inc = require_inc();
  var diff = require_diff();
  var major = require_major();
  var minor = require_minor();
  var patch = require_patch();
  var prerelease = require_prerelease();
  var compare = require_compare();
  var rcompare = require_rcompare();
  var compareLoose = require_compare_loose();
  var compareBuild = require_compare_build();
  var sort = require_sort();
  var rsort = require_rsort();
  var gt = require_gt();
  var lt = require_lt();
  var eq = require_eq();
  var neq = require_neq();
  var gte = require_gte();
  var lte = require_lte();
  var cmp = require_cmp();
  var coerce = require_coerce();
  var truncate = require_truncate();
  var Comparator = require_comparator();
  var Range = require_range();
  var satisfies = require_satisfies();
  var toComparators = require_to_comparators();
  var maxSatisfying = require_max_satisfying();
  var minSatisfying = require_min_satisfying();
  var minVersion = require_min_version();
  var validRange = require_valid2();
  var outside = require_outside();
  var gtr = require_gtr();
  var ltr = require_ltr();
  var intersects = require_intersects();
  var simplifyRange = require_simplify();
  var subset = require_subset();
  module.exports = {
    parse,
    valid,
    clean,
    inc,
    diff,
    major,
    minor,
    patch,
    prerelease,
    compare,
    rcompare,
    compareLoose,
    compareBuild,
    sort,
    rsort,
    gt,
    lt,
    eq,
    neq,
    gte,
    lte,
    cmp,
    coerce,
    truncate,
    Comparator,
    Range,
    satisfies,
    toComparators,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validRange,
    outside,
    gtr,
    ltr,
    intersects,
    simplifyRange,
    subset,
    SemVer,
    re: internalRe.re,
    src: internalRe.src,
    tokens: internalRe.t,
    SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: constants.RELEASE_TYPES,
    compareIdentifiers: identifiers.compareIdentifiers,
    rcompareIdentifiers: identifiers.rcompareIdentifiers
  };
});

// ../../../oss/adrkit/packages/cli/src/index.ts
import { parseArgs as parseArgs3 } from "node:util";
import { readdir as readdir4 } from "node:fs/promises";

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array, separator = "|") {
  return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}

class Cached {
  constructor(getter) {
    this._getter = getter;
    this._value = undefined;
  }
  get value() {
    const getter = this._getter;
    if (getter !== undefined) {
      this._value = getter();
      this._getter = undefined;
    }
    return this._value;
  }
}
function cached(getter) {
  return new Cached(getter);
}
function nullish(input) {
  return input === null || input === undefined;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function rawShape(def) {
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  return desc?.get ? desc.get.raw : desc?.value;
}
function sourceShape(schema) {
  return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
function deferProp(target, key, getter) {
  Object.defineProperty(target, key, {
    get() {
      const value = getter();
      assignProp(this, key, value);
      return value;
    },
    enumerable: true,
    configurable: true
  });
}
function putProp(target, key, value) {
  if (key in target)
    assignProp(target, key, value);
  else
    target[key] = value;
}
function mirrorShape(target, source, keys, wrap) {
  const raw = sourceShape(source);
  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(raw, key);
    if (!desc.enumerable)
      continue;
    if (desc.get) {
      deferProp(target, key, () => {
        const value = source._zod.def.shape[key];
        return wrap ? wrap(value, key) : value;
      });
    } else
      putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
  }
}
function mirrorProps(target, source) {
  for (const key of Reflect.ownKeys(source)) {
    const desc = Object.getOwnPropertyDescriptor(source, key);
    if (!desc.enumerable)
      continue;
    if (desc.get)
      deferProp(target, key, () => source[key]);
    else
      putProp(target, key, desc.value);
  }
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === undefined)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin !== undefined && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = /* @__PURE__ */ (() => ({
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const newShape = {};
  mirrorShape(newShape, schema, maskedKeys(schema, mask));
  return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}
function maskedKeys(schema, mask) {
  const raw = sourceShape(schema);
  const keys = [];
  for (const key of Reflect.ownKeys(mask)) {
    if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) {
      throw new Error(`Unrecognized key: "${String(key)}"`);
    }
    if (mask[key])
      keys.push(key);
  }
  return keys;
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const omitted = new Set(maskedKeys(schema, mask));
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
  return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = sourceShape(schema);
    for (const key of Reflect.ownKeys(shape)) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function extended(schema, shape) {
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
  mirrorProps(newShape, shape);
  return newShape;
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
  if (!b?._zod?.def) {
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  }
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const newShape = {};
  mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
  mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
  const def = mergeDefs(a._zod.def, {
    shape: newShape,
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class, schema, mask, name = "partial") {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
  }
  const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({ type: "optional", innerType: value })));
  return clone(schema, mergeDefs(schema._zod.def, { shape: newShape, checks: [] }));
}
function required(Class, schema, mask) {
  const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
  const newShape = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({ type: "nonoptional", innerType: value }));
  return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
  var _a;
  for (let i = start;i < issues.length; i++) {
    (_a = issues[i]).schema ?? (_a.schema = inst);
  }
}
function finalizeIssue(iss, ctx, config) {
  var _a;
  const traits = iss.inst?._zod?.traits;
  if (traits?.has("$ZodType")) {
    if (traits.has("$ZodCheck"))
      (_a = iss).schema ?? (_a.schema = iss.inst);
    else
      iss.schema = iss.inst;
  }
  const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
  const full = {};
  for (const k of Object.keys(iss)) {
    if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__")
      continue;
    full[k] = iss[k];
  }
  full.path ?? (full.path = []);
  full.message = message;
  if (ctx?.reportInput) {
    full.input = iss.input;
  }
  return full;
}
var highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
  const units = str.length;
  if (!highSurrogate.test(str))
    return units;
  let count = units;
  for (let i = 0;i < units - 1; i++) {
    if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
      count--;
      i++;
    }
  }
  return count;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function members(proto, table) {
  for (const key in table) {
    const desc = Object.getOwnPropertyDescriptor(table, key);
    if (desc.get)
      Object.defineProperty(proto, key, { ...desc, enumerable: false });
    else
      defineBound(proto, key, desc.value);
  }
}
function own(inst, key, value, enumerable = true) {
  Object.defineProperty(inst, key, { configurable: true, writable: true, enumerable, value });
  return value;
}
function hide(inst, key, value) {
  return own(inst, key, value, false);
}
function derived(computes, table) {
  for (const key in computes) {
    const compute = computes[key];
    Object.defineProperty(table, key, {
      configurable: true,
      enumerable: true,
      get() {
        return own(this, key, compute(this));
      },
      set(value) {
        own(this, key, value);
      }
    });
  }
  return table;
}
function defineBound(proto, key, fn) {
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      return this == null ? fn : own(this, key, fn.bind(this));
    },
    set(value) {
      own(this, key, value);
    }
  });
}
function claim(inst, sentinel) {
  const proto = Object.getPrototypeOf(inst);
  return sentinel in proto ? undefined : proto;
}
var installing;
var broke = false;
var breaker = {
  configurable: true,
  get() {
    broke = true;
    return;
  }
};
function defineLazyInternal(inst, key, compute) {
  const proto = Object.getPrototypeOf(inst._zod);
  if (key in proto && installing !== inst._zod) {
    installing = undefined;
    return;
  }
  installing = inst._zod;
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      Object.defineProperty(this, key, breaker);
      const outer = broke;
      broke = false;
      try {
        const value = compute(this);
        if (broke)
          delete this[key];
        else
          Object.defineProperty(this, key, { configurable: true, writable: true, value });
        broke = broke || outer;
        return value;
      } catch (err) {
        delete this[key];
        broke = broke || outer;
        throw err;
      }
    },
    set(value) {
      Object.defineProperty(this, key, { configurable: true, writable: true, value });
    }
  });
}
function installLazyProp(inst, key, make, enumerable) {
  const proto = claim(inst, key);
  if (!proto)
    return;
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      const desc = { configurable: true, writable: true, enumerable, value: undefined };
      Object.defineProperty(this, key, desc);
      desc.value = make(this);
      Object.defineProperty(this, key, desc);
      return desc.value;
    },
    set(value) {
      Object.defineProperty(this, key, { configurable: true, writable: true, enumerable, value });
    }
  });
}
var CONSTANT_CATCH = "~constantCatch";
function constantCatch(value) {
  const fn = () => value;
  fn[CONSTANT_CATCH] = true;
  return fn;
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/core.js
var _a;
var _zodDesc = { value: undefined, enumerable: false };
var _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
  const E = _E;
  if (E) {
    const saved = E.stackTraceLimit;
    if (typeof saved === "number") {
      try {
        E.stackTraceLimit = 0;
      } catch {
        _E = null;
        return new Definition;
      }
      try {
        return new Definition;
      } finally {
        E.stackTraceLimit = saved;
      }
    }
  }
  return new Definition;
}
function $constructor(name, initializer, proto, params) {
  const zodProto = {};
  function Internals(def) {
    this.def = def;
    this.constr = _;
    this.traits = new Set;
  }
  Internals.prototype = zodProto;
  const protoMembers = proto;
  const initialized = protoMembers && new WeakSet;
  function init(inst, def) {
    if (!inst._zod) {
      _zodDesc.value = new Internals(def);
      try {
        Object.defineProperty(inst, "_zod", _zodDesc);
      } finally {
        _zodDesc.value = undefined;
      }
    } else if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer(inst, def);
    if (initialized) {
      const own = Object.getPrototypeOf(inst);
      const ctorProto = inst._zod.constr.prototype;
      let up = own;
      while (up && up !== ctorProto)
        up = Object.getPrototypeOf(up);
      const target = up ?? own;
      if (!initialized.has(target)) {
        initialized.add(target);
        members(target, protoMembers);
      }
    }
    const proto = _.prototype;
    for (const k in proto) {
      if (!Object.prototype.hasOwnProperty.call(proto, k))
        continue;
      if (!(k in inst)) {
        inst[k] = proto[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;

  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    const inst = params?.Parent ? newError(Definition) : this;
    init(inst, def);
    const deferred = inst._zod.deferred;
    if (deferred) {
      for (const fn of deferred) {
        fn();
      }
      inst._zod.deferred = undefined;
    }
    const pp = globalThis.__zod_globalConfig?.postProcessor;
    if (pp)
      pp(inst);
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/errors.js
function _getMessage() {
  const internals = this._zod;
  internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
  return internals.message;
}
function _setMessage(value) {
  this._zod.message = value;
}
var _messageDesc = {
  get: _getMessage,
  set: _setMessage,
  enumerable: true,
  configurable: true
};
var _issuesDesc = { value: undefined, enumerable: false };
var _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  _issuesDesc.value = def;
  Object.defineProperty(inst, "issues", _issuesDesc);
  _issuesDesc.value = undefined;
  Object.defineProperty(inst, "message", _messageDesc);
  const proto = Object.getPrototypeOf(inst);
  if (!_installedToString.has(proto)) {
    _installedToString.add(proto);
    Object.defineProperty(proto, "toString", {
      configurable: true,
      enumerable: false,
      get() {
        const value = () => this.message;
        Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
        return value;
      },
      set(value) {
        Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
      }
    });
  }
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, undefined, {
  Parent: Error
});
function node(obj, key, make) {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    if (key === "__proto__") {
      Object.defineProperty(obj, key, { value: make(), writable: true, enumerable: true, configurable: true });
    } else {
      obj[key] = make();
    }
  }
  return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue) => issue.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error, path = []) => {
    for (const issue of error.issues) {
      if (issue.code === "invalid_union" && issue.errors.length) {
        issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
      } else if (issue.code === "invalid_key") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else if (issue.code === "invalid_element") {
        processError({ issues: issue.issues }, [...path, ...issue.path]);
      } else {
        const fullpath = [...path, ...issue.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (el === "_errors") {
              if (terminal)
                curr._errors.push(mapper(issue));
              i++;
              continue;
            }
            if (!Object.prototype.hasOwnProperty.call(curr, el)) {
              Object.defineProperty(curr, el, {
                value: { _errors: [] },
                enumerable: true,
                writable: true,
                configurable: true
              });
            }
            const node = curr[el];
            if (terminal) {
              node._errors.push(mapper(issue));
            }
            curr = node;
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
  return { callee: params?.callee ?? callee, Err: params?.Err };
}
var _parse = (_Err) => {
  const fn = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError;
    }
    if (result.issues.length) {
      const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, _params?.callee ?? fn);
      throw e;
    }
    return result.value;
  };
  return fn;
};
var _parseAsync = (_Err) => {
  const fn = async (schema, value, _ctx, params) => {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    if (result.issues.length) {
      const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, params?.callee ?? fn);
      throw e;
    }
    return result.value;
  };
  return fn;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
};
function failure(Err, issues, ctx) {
  let error;
  return {
    success: false,
    get error() {
      if (!error) {
        error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
        issues = undefined;
        ctx = undefined;
      }
      return error;
    },
    set error(e) {
      error = e;
      issues = undefined;
      ctx = undefined;
    }
  };
}
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? failure(_Err, result.issues, ctx) : { success: true, data: result.value };
};
var COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
var COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
var validate = (schema, value, _ctx) => {
  const validator = schema._zod.bag.validator;
  if (validator !== undefined) {
    if (validator(value) !== COMPILE_INVALID)
      return true;
    if (validator.definite === true && _ctx === undefined)
      return false;
  }
  return validateFallback(schema, value, _ctx);
};
function validateFallback(schema, value, _ctx) {
  const ctx = _ctx ? { ..._ctx, async: false, abortEarly: true } : { async: false, abortEarly: true };
  const fallbackRun = schema._zod.bag.fallbackRun;
  let result;
  if (fallbackRun) {
    ctx[COMPILE_FALLBACK] = true;
    result = fallbackRun({ value, issues: [] }, ctx);
  } else {
    result = schema._zod.run({ value, issues: [] }, ctx);
  }
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length === 0;
}
var validateAsync = async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true, abortEarly: true } : { async: true, abortEarly: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length === 0;
};
var _encode = (_Err) => {
  const parse = _parse(_Err);
  const fn = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return parse(schema, value, ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _decode = (_Err) => {
  const parse = _parse(_Err);
  const fn = (schema, value, _ctx, _params) => {
    return parse(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _encodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn = async (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _decodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn = async (schema, value, _ctx, _params) => {
    return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
  return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
function anchor(source) {
  return new RegExp(`^${source}$`);
}
var date = /* @__PURE__ */ anchor(dateSource);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const opts = ["Z"];
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const qualified = `${timeSource({ precision: args.precision, seconds: true })}(?:${opts.join("|")})`;
  const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var anyString = /^[\s\S]{0,}$/;
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a = inst._zod).onattach ?? (_a.onattach = []);
});
var _whenHasLength = (payload) => {
  const val = payload.value;
  return !nullish(val) && val.length !== undefined;
};
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin: numericOriginMap[typeof payload.value] ?? origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin: numericOriginMap[typeof payload.value] ?? origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units > def.maximum ? codePointLength(input) : units;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a;
  $ZodCheck.init(inst, def);
  (_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a, _b;
  $ZodCheck.init(inst, def);
  if (def.pattern)
    (_a = inst._zod).check ?? (_a.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/doc.js
class Doc {
  constructor(args = [], closed = {}) {
    this.content = [];
    this.indent = 0;
    this.args = args;
    this.closed = closed;
  }
  indented(fn) {
    this.indent += 1;
    try {
      fn(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split(`
`).filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const content = this?.content ?? [``];
    const factory = new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${content.join(`
`)}
};`);
    return factory(...Object.values(this.closed));
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 6,
  patch: 5
};

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const defChecks = inst._zod.def.checks;
  const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks, ctx) => {
      if (payload.memo)
        return payload;
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError;
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            attachSchema(payload.issues, currLen, inst);
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          attachSchema(payload.issues, currLen, inst);
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary) => {
            return handleCanaryResult(canary, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return result.then((result) => runChecks(result, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
}, {
  get "~standard"() {
    return hide(this, "~standard", standardProps(this));
  },
  set "~standard"(value) {
    own(this, "~standard", value);
  }
});
var toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
async function validateAsync2(inst, value) {
  const ctx = { async: true };
  return toStandardResult(await inst._zod.run({ value, issues: [] }, ctx), ctx);
}
function standardProps(inst) {
  return {
    validate: (value) => {
      const ctx = { async: false };
      try {
        const r = inst._zod.run({ value, issues: [] }, ctx);
        if (!(r instanceof Promise))
          return toStandardResult(r, ctx);
      } catch (_) {}
      return validateAsync2(inst, value);
    },
    vendor: "zod",
    version: 1
  };
}
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = def.pattern ?? anyString;
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_) {}
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var URL_BAD_FORMAT = 1;
var URL_UNPARSEABLE = 2;
function canParseURL(input) {
  try {
    if (typeof URL !== "undefined" && typeof URL.canParse === "function")
      return URL.canParse(input);
    new URL(input);
    return true;
  } catch {
    return false;
  }
}
function validateURL(trimmed, def) {
  if (!("normalize" in def) && !("hostname" in def) && !("protocol" in def)) {
    return canParseURL(trimmed) || URL_UNPARSEABLE;
  }
  return parseURLObject(trimmed, def);
}
function parseURLObject(trimmed, def) {
  if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) {
    return URL_BAD_FORMAT;
  }
  try {
    if (typeof URL !== "undefined") {
      const URLStatic = URL;
      if (typeof URLStatic.parse === "function")
        return URLStatic.parse(trimmed) ?? URL_UNPARSEABLE;
    }
    return new URL(trimmed);
  } catch {
    return URL_UNPARSEABLE;
  }
}
var asciiTabOrNewline = /[\t\n\r]/g;
function stripTabAndNewline(value) {
  return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
  hostname.lastIndex = 0;
  return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
  protocol.lastIndex = 0;
  return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url = validateURL(trimmed, def);
      if (url === URL_BAD_FORMAT) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: payload.value,
          inst,
          continue: !def.abort
        });
        return;
      }
      if (url === URL_UNPARSEABLE) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
        return;
      }
      if (url === true) {
        payload.value = stripTabAndNewline(trimmed);
        return;
      }
      if (def.hostname && !urlHostnameOk(url, def.hostname)) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid hostname",
          pattern: def.hostname.source,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
      if (def.protocol && !urlProtocolOk(url, def.protocol)) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid protocol",
          pattern: def.protocol.source,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
      payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  if (def.length !== undefined && (!Number.isInteger(def.length) || def.length < 1))
    throw new Error(`Invalid nanoid length: ${def.length}`);
  def.pattern ?? (def.pattern = def.length === undefined ? nanoid : nanoidOfLength(def.length));
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
});
var ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
  if (!ipv6Alphabet.test(value))
    return false;
  return canParseURL(`http://[${value}]`);
}
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (!isValidIPv6(payload.value)) {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
  const parts = value.split("/");
  if (parts.length !== 2)
    return false;
  const [address, prefix] = parts;
  if (!prefix)
    return false;
  const prefixNum = Number(prefix);
  if (`${prefixNum}` !== prefix)
    return false;
  if (prefixNum < 0 || prefixNum > 128)
    return false;
  return isValidIPv6(address);
}
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (!isValidCIDRv6(payload.value)) {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64Charset);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
  if (!base64urlCharset.test(data))
    return false;
  const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64urlCharset);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : undefined : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
    const proms = [];
    const abortEarly = ctx?.abortEarly;
    for (let i = 0;i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result) => handleArrayResult(result, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
        if (abortEarly && result.issues.length !== 0 && aborted(result))
          break;
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, optin, optout) {
  const isPresent = key in input;
  const isOptionalOut = optout === "optional";
  if (!isPresent && isOptionalOut && optin === "optional") {
    return;
  }
  if (result.issues.length) {
    if (optin !== undefined && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && optin === undefined) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [key]
      });
    }
    return;
  }
  if (result.value === undefined) {
    if (isPresent || optin === "defaulted" && !isOptionalOut) {
      final.value[key] = undefined;
    }
  } else {
    final.value[key] = result.value;
  }
}
var NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  const ownSymbols = Object.getOwnPropertySymbols(def.shape);
  const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
  const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
  for (const k of allKeys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    allKeys,
    symbolKeys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const optin = _catchall.optin;
  const optout = _catchall.optout;
  let seen = 0;
  for (const key in input) {
    if (abortEarly && payload.issues.length !== seen) {
      if (aborted(payload, seen))
        break;
      seen = payload.issues.length;
    }
    if (keySet.has(key))
      continue;
    if (key === "__proto__") {
      if (t === "never")
        unrecognized.push(key);
      continue;
    }
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
    } else {
      handlePropertyResult(r, payload, key, input, optin, optout);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst,
      continue: true
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  const sh = desc?.get ? desc.get.raw : def.shape ?? {};
  if (sh) {
    const get = () => {
      const newSh = { ...sh };
      Object.defineProperty(def, "shape", { value: newSh });
      get.raw = newSh;
      return newSh;
    };
    get.raw = sh;
    Object.defineProperty(def, "shape", { get });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazyInternal(inst, "propValues", (zod) => {
    const shape = zod.def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        if (!Object.prototype.hasOwnProperty.call(propValues, key)) {
          assignProp(propValues, key, new Set);
        }
        for (const v of field.values)
          propValues[key].add(v);
        if (field.optin !== undefined)
          propValues[key].add(undefined);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
    const proms = [];
    const shape = value.shape;
    const abortEarly = ctx?.abortEarly;
    let seen = payload.issues.length;
    for (const key of value.allKeys) {
      if (abortEarly && payload.issues.length !== seen) {
        if (aborted(payload, seen))
          break;
        seen = payload.issues.length;
      }
      if (key === "__proto__")
        continue;
      const el = shape[key];
      const optin = el._zod.optin;
      const optout = el._zod.optout;
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
      } else {
        handlePropertyResult(r, payload, key, input, optin, optout);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const memo = globalConfig.memoizer;
  const generateFastpass = (shape) => {
    const normalized = _normalized.value;
    const syms = normalized.symbolKeys;
    const doc = new Doc(["payload", "ctx"], { shape, inst, memo, syms });
    const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    doc.write(`const input = payload.value;`);
    const ids = Object.create(null);
    let counter = 0;
    for (const key of normalized.allKeys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
    for (const key of normalized.allKeys) {
      if (key === "__proto__")
        continue;
      const id = ids[key];
      const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
      const isPresent = `${k} in input`;
      const schema = shape[key];
      const optin = schema?._zod?.optin;
      const isOptionalIn = optin !== undefined;
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(k)};`);
      if (isOptionalIn && isOptionalOut) {
        const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
        doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
        if (optin === "defaulted") {
          doc.write(`newResult[${k}] = ${id}.value;`);
        } else {
          doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
        }
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    return doc.compile();
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== undefined) ? "optional" : undefined);
  defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
  defineLazyInternal(inst, "values", (zod) => {
    if (zod.def.options.every((o) => o._zod.values)) {
      return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return;
  });
  defineLazyInternal(inst, "pattern", (zod) => {
    if (zod.def.options.every((o) => o._zod.pattern)) {
      const patterns = zod.def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results) => {
      return handleUnionResults(results, payload, inst, ctx);
    });
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left, right]) => {
        return handleIntersectionResults(payload, left, right);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    if (Object.prototype.hasOwnProperty.call(newObj, "__proto__"))
      delete newObj.__proto__;
    for (const key of sharedKeys) {
      if (key === "__proto__")
        continue;
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = new Map;
  let unrecIssue;
  const keyIssues = new Map;
  const collect = (iss, side) => {
    let keys;
    if (iss.code === "unrecognized_keys" && !iss.path?.length) {
      unrecIssue ?? (unrecIssue = iss);
      keys = iss.keys;
    } else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
      const k = String(iss.path[0]);
      if (!keyIssues.has(k))
        keyIssues.set(k, iss);
      keys = [k];
    } else {
      return false;
    }
    for (const k of keys) {
      if (!unrecKeys.has(k))
        unrecKeys.set(k, {});
      unrecKeys.get(k)[side] = true;
    }
    return true;
  };
  for (const iss of left.issues) {
    if (!collect(iss, "l"))
      result.issues.push(iss);
  }
  for (const iss of right.issues) {
    if (!collect(iss, "r"))
      result.issues.push(iss);
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length) {
    const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
    if (aggregated.length)
      result.issues.push({ ...unrecIssue, keys: aggregated });
    for (const k of bothKeys) {
      if (!aggregated.includes(k) && keyIssues.has(k))
        result.issues.push(keyIssues.get(k));
    }
  }
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    if (aborted(result))
      return result;
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values && !def.partial) {
      payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
      const recordKeys = new Set;
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          if (key === "__proto__")
            continue;
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (keyResult.issues.length) {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
            continue;
          }
          const outKey = keyResult.value;
          if (outKey === "__proto__")
            continue;
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result) => {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[outKey] = result.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          if (def.mode === "loose") {
            if (key === "__proto__")
              continue;
            payload.value[key] = input[key];
          } else {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          }
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized,
          continue: true
        });
      }
    } else {
      payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
      let unrecognized;
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(input, key))
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else if (values) {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const outKey = keyResult.value;
        if (outKey === "__proto__")
          continue;
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result) => {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[outKey] = result.value;
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized,
          continue: true
        });
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  defineLazyInternal(inst, "pattern", (zod) => {
    const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
    return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
  });
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  globalConfig.memoizer?.guard(inst);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output) => {
        payload.value = output;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError;
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(payload, result) {
  payload.value = result.issues.length ? undefined : result.value;
  return payload;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
  inst._zod.optout = "optional";
  defineLazyInternal(inst, "values", (zod) => {
    const values = zod.def.innerType._zod.values;
    return values ? new Set([...values, undefined]) : undefined;
  });
  defineLazyInternal(inst, "pattern", (zod) => {
    const pattern = zod.def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === undefined) {
      if (def.innerType._zod.optin !== "defaulted")
        return payload;
      const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
      if (result instanceof Promise)
        return result.then((result) => handleOptionalResult(payload, result));
      return handleOptionalResult(payload, result);
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
  defineLazyInternal(inst, "pattern", (zod) => {
    const pattern = zod.def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
  });
  defineLazyInternal(inst, "values", (zod) => {
    return zod.def.innerType._zod.values ? new Set([...zod.def.innerType._zod.values, null]) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "defaulted";
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleDefaultResult(result, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "defaulted";
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => {
    const v = zod.def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleNonOptionalResult(result, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
function handleCatchResult(payload, result, def, ctx) {
  if (!result.issues.length) {
    payload.value = result.value;
    if (result.memo)
      payload.memo = true;
    return payload;
  }
  payload.value = def.catchValue({
    ...result,
    value: payload.value,
    error: {
      issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
    },
    input: payload.value
  });
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
    if (result instanceof Promise) {
      return result.then((result) => handleCatchResult(payload, result, def, ctx));
    }
    return handleCatchResult(payload, result, def, ctx);
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
  defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
  defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right) => handlePipeResult(right, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left) => handlePipeResult(left, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  if (!payload.memo)
    payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r) => handleRefineResult(r, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...inst._zod.def.path ?? []],
      continue: !inst._zod.def.abort
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/memoizer.js
class $ZodCyclicError extends Error {
  constructor() {
    super(`Cannot parse a reference cycle that closes through a transform`);
    this.name = "ZodCyclicError";
  }
}
var STATE = "~memo";
var NO_ISSUES = [];
function isRef(value) {
  return value !== null && typeof value === "object";
}
function cloneIssues(issues) {
  return issues.map((iss) => iss.path ? { ...iss, path: iss.path.slice() } : { ...iss });
}
var recursive = /* @__PURE__ */ new WeakMap;
var NONE = 0;
var ASSUMED = 1;
var PROVEN = 2;
function isRecursive(inst, stack, resolve) {
  const cached = recursive.get(inst);
  if (cached !== undefined)
    return cached ? PROVEN : NONE;
  if (stack.has(inst))
    return PROVEN;
  stack.add(inst);
  let result = NONE;
  const check = (child) => {
    if (result !== PROVEN && child?._zod) {
      const answer = isRecursive(child, stack, resolve);
      if (answer > result)
        result = answer;
    }
  };
  const shape = (sh, spread) => {
    let answer = NONE;
    for (const key of Reflect.ownKeys(sh)) {
      const desc = Object.getOwnPropertyDescriptor(sh, key);
      if (spread && !desc.enumerable)
        continue;
      const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
      if (child > answer)
        answer = child;
    }
    return answer;
  };
  const merge = (answer) => {
    if (answer > result)
      result = answer;
  };
  const def = inst._zod.def;
  const kind = def.type;
  switch (kind) {
    case "object": {
      const raw = rawShape(def);
      merge(raw ? shape(raw, true) : ASSUMED);
      check(def.catchall);
      break;
    }
    case "array":
      check(def.element);
      break;
    case "tuple":
      for (const el of def.items)
        check(el);
      check(def.rest);
      break;
    case "record":
    case "map":
      check(def.keyType);
      check(def.valueType);
      break;
    case "set":
      check(def.valueType);
      break;
    case "union":
      for (const el of def.options)
        check(el);
      break;
    case "intersection":
      check(def.left);
      check(def.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      check(def.innerType);
      break;
    case "pipe":
      check(def.in);
      check(def.out);
      break;
    case "function":
      check(def.input);
      check(def.output);
      break;
    case "lazy": {
      const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : undefined);
      merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
      break;
    }
    case "template_literal":
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default: {
      for (const key in def) {
        const desc = Object.getOwnPropertyDescriptor(def, key);
        if (!desc || desc.get)
          continue;
        const value = desc.value;
        if (!value || typeof value !== "object")
          continue;
        if (value._zod)
          check(value);
        else if (Array.isArray(value))
          for (const el of value)
            check(el);
      }
    }
  }
  stack.delete(inst);
  return settle(inst, result);
}
function settle(inst, answer) {
  if (answer !== ASSUMED)
    recursive.set(inst, answer === PROVEN);
  return answer;
}
function bucketFor(state, inst) {
  let bucket = state.buckets.get(inst);
  if (!bucket) {
    bucket = new WeakMap;
    state.buckets.set(inst, bucket);
  }
  return bucket;
}
var handoff;
var open = [];
var memo = {
  alloc(_inst, payload, empty) {
    const bucket = handoff;
    if (!bucket)
      return empty;
    handoff = undefined;
    const entry = { value: empty, issues: null };
    bucket.set(payload.value, entry);
    open.push(entry);
    return empty;
  },
  guard(inst) {
    var _a;
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload, ctx) => {
        if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value))
          throw new $ZodCyclicError;
        return base(payload, ctx);
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base)
        inst._zod.run = wrapped;
    });
  },
  attach(inst) {
    var _a;
    let isRecursiveInst;
    let rechecked = false;
    let lastCtx;
    let lastBucket;
    (_a = inst._zod).deferred ?? (_a.deferred = []);
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload, ctx) => {
        if (isRecursiveInst === undefined) {
          const walked = isRecursive(inst, new Set, false);
          if (walked === NONE) {
            inst._zod.parse = base;
            if (inst._zod.run === wrapped)
              inst._zod.run = base;
            return base(payload, ctx);
          }
          if (walked === PROVEN || rechecked)
            isRecursiveInst = true;
          else
            rechecked = true;
        }
        const input = payload.value;
        if (!isRef(input))
          return base(payload, ctx);
        let state = ctx[STATE];
        if (!state) {
          state = { buckets: new WeakMap, backEdges: undefined };
          ctx[STATE] = state;
        }
        let bucket;
        if (lastCtx === ctx) {
          bucket = lastBucket;
        } else {
          bucket = bucketFor(state, inst);
          lastCtx = ctx;
          lastBucket = bucket;
        }
        const hit = bucket.get(input);
        if (hit) {
          payload.value = hit.value;
          if (hit.issues) {
            if (hit.issues.length)
              payload.issues.push(...cloneIssues(hit.issues));
          } else {
            payload.memo = true;
            state.backEdges ?? (state.backEdges = new WeakSet);
            state.backEdges.add(hit.value);
          }
          return payload;
        }
        handoff = bucket;
        const depth = open.length;
        const result = base(payload, ctx);
        handoff = undefined;
        const entry = open.length > depth ? open.pop() : undefined;
        if (result instanceof Promise) {
          return result.then((r) => {
            if (entry)
              entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
            return r;
          });
        }
        if (entry)
          entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
        return result;
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base)
        inst._zod.run = wrapped;
    });
  }
};
function memoizer() {
  return memo;
}
function isBackEdge(ctx, value) {
  const backEdges = ctx[STATE]?.backEdges;
  return backEdges !== undefined && isRef(value) && backEdges.has(value);
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/locales/en.js
var error = () => {
  const Sizable = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    currency_code: "currency code",
    credit_card: "credit card number",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  function getTypeName(type, input) {
    if (type === "number" && typeof input === "number" && !Number.isFinite(input)) {
      return String(input);
    }
    return TypeDictionary[type] ?? type;
  }
  return (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        const expected = getTypeName(issue.expected);
        const receivedType = parsedType(issue.input);
        const received = getTypeName(receivedType, issue.input);
        return `Invalid input: expected ${expected}, received ${received}`;
      }
      case "invalid_value":
        if (issue.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
        return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
      case "too_big": {
        const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
        const sizing = getSizing(issue.origin);
        if (sizing)
          return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
        const sizing = getSizing(issue.origin);
        if (sizing) {
          return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
        }
        return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Invalid string: must end with "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Invalid string: must include "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Invalid string: must match pattern ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${issue.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${issue.origin}`;
      case "invalid_union":
        if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) {
          const opts = issue.options.map((o) => `'${o}'`).join(" | ");
          return `Invalid discriminator value. Expected ${opts}`;
        }
        if (issue.inclusive === false) {
          return "Invalid input: more than one option matched";
        }
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${issue.origin}`;
      default:
        return `Invalid input`;
    }
  };
};
function en_default() {
  return {
    localeError: error()
  };
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/registries.js
var _a2;
class $ZodRegistry {
  constructor() {
    this._map = new WeakMap;
    this._idmap = new Map;
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap;
    this._idmap = new Map;
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : undefined;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry;
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/api.js
function snapshotChecks(def) {
  if (def.checks)
    def.checks = [...def.checks];
  return def;
}
function _string(Class, params) {
  return new Class(snapshotChecks({ type: "string", ...normalizeParams(params) }));
}
function _email(Class, params) {
  return new Class({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class, params) {
  return new Class({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class, params) {
  return new Class({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class, params) {
  return new Class({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class, params) {
  return new Class({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class, params) {
  return new Class({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class, params) {
  return new Class({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class, params) {
  return new Class({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class, params) {
  return new Class({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class, params) {
  return new Class({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class, params) {
  return new Class({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class, params) {
  return new Class({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class, params) {
  return new Class({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class, params) {
  return new Class({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class, params) {
  return new Class({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class, params) {
  return new Class({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class, params) {
  return new Class({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class, params) {
  return new Class({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class, params) {
  return new Class({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class, params) {
  return new Class({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class, params) {
  return new Class({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class, params) {
  return new Class({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class, params) {
  return new Class(snapshotChecks({ type: "number", checks: [], ...normalizeParams(params) }));
}
function _int(Class, params) {
  return new Class({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _boolean(Class, params) {
  return new Class({
    type: "boolean",
    ...normalizeParams(params)
  });
}
function _unknown(Class) {
  return new Class({
    type: "unknown"
  });
}
function _never(Class, params) {
  return new Class({
    type: "never",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class, element, params) {
  return new Class({
    type: "array",
    element,
    ...normalizeParams(params)
  });
}
function _refine(Class, fn, _params) {
  const schema = new Class({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn, params) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        if (!("input" in _issue))
          _issue.input = payload.value;
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
  for (const source of sources) {
    for (const key of Reflect.ownKeys(source)) {
      if (Object.prototype.propertyIsEnumerable.call(source, key)) {
        assignProp(target, key, source[key]);
      }
    }
  }
  return target;
}
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map,
    sharedDefsExtractedFor: undefined,
    sharedEmitDoneFor: undefined,
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: params?.external ?? undefined
  };
}
function handleUnrepresentable(schema, ctx, json, params, message) {
  const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({ zodSchema: schema, path: params.path, message }) : ctx.unrepresentable;
  if (result === "any")
    return false;
  if (result === undefined || result === "throw")
    throw new Error(message);
  Object.assign(json, result);
  return true;
}
function processSchema(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);
  ctx.sharedDefsExtractedFor = undefined;
  ctx.sharedEmitDoneFor = undefined;
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      processSchema(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    assignProps(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a = result.schema).default ?? (_a.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function encodeJSONPointerSegment(segment) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external)
    return;
  const idToSchema = new Map;
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id) => id);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}` };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    if (entry[1] === root && !entry[1].schema.id) {
      return { ref: uriPrefix };
    }
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + encodeJSONPointerSegment(defId) };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema = seen.schema;
    for (const key in schema) {
      delete schema[key];
    }
    schema.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + `#/${seen.cycle?.join("/")}/<root>` + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
      }
    }
  }
  if (ctx.external)
    ctx.sharedDefsExtractedFor = ctx.external;
}
function compactTypeUnion(schema) {
  const options = schema.anyOf;
  if (!Array.isArray(options) || options.length === 0 || schema.type !== undefined)
    return;
  const types = [];
  for (const option of options) {
    if (!option || typeof option !== "object")
      return;
    compactTypeUnion(option);
    const keys = Object.keys(option);
    if (keys.length !== 1 || keys[0] !== "type")
      return;
    const type = option.type;
    for (const member of Array.isArray(type) ? type : [type]) {
      if (typeof member !== "string")
        return;
      if (!types.includes(member))
        types.push(member);
    }
  }
  delete schema.anyOf;
  schema.type = types.length === 1 ? types[0] : types;
}
var FOLDABLE_KEYS = new Set(["type", "properties", "required", "additionalProperties"]);
var UNION_KEYS = ["oneOf", "anyOf"];
function undeclaredConstraint(member) {
  const extra = member.additionalProperties;
  if (extra === undefined || extra === false || typeof extra !== "object" || extra === null)
    return null;
  return Object.keys(extra).length ? extra : null;
}
function foldObjects(members) {
  const objects = [];
  for (const member of members) {
    if (typeof member !== "object" || member.type !== "object")
      return null;
    for (const key in member) {
      if (!FOLDABLE_KEYS.has(key))
        return null;
    }
    objects.push(member);
  }
  const properties = {};
  const required = new Set;
  for (const object of objects) {
    for (const key in object.properties) {
      if (Object.prototype.hasOwnProperty.call(properties, key))
        continue;
      const parts = [];
      for (const other of objects) {
        const part = other.properties?.[key] ?? undeclaredConstraint(other);
        if (part === null || part === undefined)
          continue;
        if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part)))
          parts.push(part);
      }
      const merged = parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts };
      assignProp(properties, key, merged);
    }
    for (const key of object.required ?? [])
      required.add(key);
  }
  const folded = { type: "object", properties };
  if (required.size)
    folded.required = [...required];
  if (objects.every((object) => object.additionalProperties === false)) {
    folded.additionalProperties = false;
  } else {
    const constraints = [];
    for (const object of objects) {
      const constraint = undeclaredConstraint(object);
      if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint)))
        constraints.push(constraint);
    }
    if (constraints.length === 1)
      folded.additionalProperties = constraints[0];
    else if (constraints.length > 1)
      folded.additionalProperties = { allOf: constraints };
  }
  return folded;
}
function foldIntersection(json) {
  const allOf = json.allOf;
  if (!Array.isArray(allOf) || allOf.length < 2)
    return;
  for (const key of FOLDABLE_KEYS)
    if (key in json)
      return;
  const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
  let folded = null;
  if (!unions.length) {
    folded = foldObjects(allOf);
  } else {
    const union = unions[0];
    const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
    if (Object.keys(union).length !== 1)
      return;
    const rest = allOf.filter((m) => m !== union);
    const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
    if (branches.some((b) => !b))
      return;
    folded = { [keyword]: branches };
  }
  if (!folded)
    return;
  delete json.allOf;
  assignProps(json, folded);
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema = seen.def ?? seen.schema;
    const _cached = { ...schema };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema.allOf = schema.allOf ?? [];
        schema.allOf.push(refSchema);
      } else {
        assignProps(schema, refSchema);
      }
      assignProps(schema, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema,
      path: seen.path ?? []
    });
  };
  if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
    for (const entry of [...ctx.seen.entries()].reverse()) {
      flattenRef(entry[0]);
    }
    if (ctx.target !== "openapi-3.0") {
      for (const entry of ctx.seen.entries()) {
        compactTypeUnion(entry[1].def ?? entry[1].schema);
      }
    }
    for (const rewrite of ctx.deferred)
      rewrite();
    if (ctx.intersections.length) {
      const carriers = new Map;
      for (const seen of ctx.seen.values()) {
        for (const json of [seen.schema, seen.def]) {
          const allOf = json?.allOf;
          if (!Array.isArray(allOf))
            continue;
          const existing = carriers.get(allOf);
          if (existing)
            existing.push(json);
          else
            carriers.set(allOf, [json]);
        }
      }
      for (const allOf of ctx.intersections) {
        for (const json of carriers.get(allOf) ?? [])
          foldIntersection(json);
      }
    }
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {}
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== undefined && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.def && seen.defId) {
        if (seen.def.id === seen.defId)
          delete seen.def.id;
        assignProp(defs, seen.defId, seen.def);
      }
    }
  }
  if (ctx.external)
    ctx.sharedEmitDoneFor = ctx.external;
  if (ctx.external) {} else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: new Set };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  processSchema(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  processSchema(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/core/json-schema-processors.js
var narrowMin = (agg, key, value) => {
  if (agg[key] === undefined || value > agg[key])
    agg[key] = value;
};
var narrowMax = (agg, key, value) => {
  if (agg[key] === undefined || value < agg[key])
    agg[key] = value;
};
var narrowBoth = (agg, value) => {
  narrowMin(agg, "minimum", value);
  narrowMax(agg, "maximum", value);
};
var addDivisor = (agg, value) => {
  agg.multipleOf ?? (agg.multipleOf = []);
  if (!agg.multipleOf.includes(value))
    agg.multipleOf.push(value);
};
var addPattern = (agg, pattern) => {
  agg.patterns ?? (agg.patterns = new Set);
  agg.patterns.add(pattern);
};
var intersectMime = (agg, mime) => {
  agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
var setFormat = (agg, format) => {
  agg.format = format;
  if (format.includes("int"))
    agg.isInt = true;
};
var minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
var maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
var formatContributor = (ranges) => (agg, def) => {
  setFormat(agg, def.format);
  const [minimum, maximum] = ranges[def.format];
  narrowMin(agg, "minimum", minimum);
  narrowMax(agg, "maximum", maximum);
};
var contributors = {
  greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
  less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
  multiple_of: (agg, def) => addDivisor(agg, def.value),
  number_format: formatContributor(NUMBER_FORMAT_RANGES),
  bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
  min_length: minContributor,
  max_length: maxContributor,
  length_equals: (agg, def) => narrowBoth(agg, def.length),
  min_size: minContributor,
  max_size: maxContributor,
  size_equals: (agg, def) => narrowBoth(agg, def.size),
  string_format: (agg, def) => {
    setFormat(agg, def.format);
    if (def.pattern)
      addPattern(agg, def.pattern);
    if (def.format === "base64" || def.format === "base64url")
      agg.contentEncoding = def.format;
    if (def.local || def.precision === -1)
      agg.laxFormat = true;
  },
  mime_type: (agg, def) => intersectMime(agg, def.mime)
};
function aggregateChecks(schema) {
  const agg = {};
  const def = schema._zod.def;
  const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
  for (const ch of list)
    contributors[ch._zod.def.check]?.(agg, ch._zod.def);
  const bag = schema._zod.bag;
  if (bag.minimum !== undefined)
    narrowMin(agg, "minimum", bag.minimum);
  if (bag.exclusiveMinimum !== undefined)
    narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
  if (bag.maximum !== undefined)
    narrowMax(agg, "maximum", bag.maximum);
  if (bag.exclusiveMaximum !== undefined)
    narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
  if (bag.multipleOf !== undefined)
    addDivisor(agg, bag.multipleOf);
  if (bag.format !== undefined) {
    agg.format ?? (agg.format = bag.format);
    if (bag.format.includes("int"))
      agg.isInt = true;
  }
  if (bag.mime)
    intersectMime(agg, bag.mime);
  for (const pattern of bag.patterns ?? [])
    addPattern(agg, pattern);
  return agg;
}
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
var exactPatterns = new Map([
  [base64Charset, base64],
  [base64urlCharset, base64url]
]);
var exactPattern = (p) => exactPatterns.get(p) ?? p;
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time" || laxFormat) {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const patternList = [...patterns].map(exactPattern);
    if (patternList.length === 1)
      json.pattern = patternList[0].source;
    else if (patternList.length > 1) {
      json.allOf = [
        ...patternList.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
  json.type = isInt ? "integer" : "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (multipleOf) {
    const divisors = new Set;
    for (const divisor of multipleOf) {
      if (Number.isFinite(divisor) && divisor !== 0)
        divisors.add(Math.abs(divisor));
      else
        handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
    }
    const [first, ...rest] = divisors;
    if (first !== undefined)
      json.multipleOf = first;
    if (rest.length)
      json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
  }
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.length === 0) {
    json.not = {};
    return;
  }
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var customProcessor = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
var transformProcessor = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = aggregateChecks(schema);
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = processSchema(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
function inputOptin(schema) {
  const def = schema._zod.def;
  if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) {
    return inputOptin(def.out);
  }
  if (def.type === "catch") {
    return inputOptin(def.innerType);
  }
  return schema._zod.optin;
}
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const shape = def.shape;
  const symbolKeys = Object.getOwnPropertySymbols(shape);
  if (symbolKeys.length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) {
    return;
  }
  json.type = "object";
  json.properties = {};
  for (const key in shape) {
    assignProp(json.properties, key, processSchema(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    }));
  }
  const requiredKeys = [];
  for (const key of Object.keys(shape)) {
    const field = def.shape[key];
    if (ctx.io === "input" ? inputOptin(field) === undefined : field._zod.optout === undefined) {
      requiredKeys.push(key);
    }
  }
  if (requiredKeys.length > 0) {
    json.required = requiredKeys;
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = processSchema(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => processSchema(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = processSchema(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = processSchema(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => ("allOf" in val) && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
  ctx.intersections.push(allOf);
};
function stringifyKeyNames(bySchema, json, visited) {
  if (json.$ref) {
    if (visited.has(json))
      return json;
    visited.add(json);
    const def = bySchema.get(json)?.def;
    if (!def)
      return json;
    const inlined = stringifyKeyNames(bySchema, def, visited);
    return inlined === def ? json : inlined;
  }
  for (const keyword of ["anyOf", "oneOf"]) {
    const branches = json[keyword];
    if (!Array.isArray(branches))
      continue;
    const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
    if (mapped.some((branch, i) => branch !== branches[i]))
      json = { ...json, [keyword]: mapped };
  }
  const types = Array.isArray(json.type) ? json.type : [json.type];
  const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
  const values = json.enum ?? (json.const !== undefined ? [json.const] : undefined);
  if (!numericType && !values?.some((v) => typeof v === "number"))
    return json;
  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
  if (rest.enum)
    rest.enum = rest.enum.map((v) => typeof v === "number" ? String(v) : v);
  else if (typeof rest.const === "number")
    rest.const = String(rest.const);
  if (!numericType)
    return rest;
  rest.type = "string";
  if (!values)
    rest.pattern = (types.includes("number") ? number : integer).source;
  return rest;
}
var pendingRecords = new WeakMap;
function rewriteKeyNames(ctx) {
  const bySchema = new Map;
  for (const entry of ctx.seen.values()) {
    if (entry.def && !bySchema.has(entry.schema))
      bySchema.set(entry.schema, entry);
  }
  const rewrites = new Map;
  for (const record of pendingRecords.get(ctx) ?? []) {
    const seen = ctx.seen.get(record);
    const names = (seen?.def ?? seen?.schema)?.propertyNames;
    if (!names || names === true || rewrites.has(names))
      continue;
    const rewritten = stringifyKeyNames(bySchema, names, new Set);
    if (rewritten !== names)
      rewrites.set(names, rewritten);
  }
  if (!rewrites.size)
    return;
  for (const entry of ctx.seen.values()) {
    for (const carrier of [entry.schema, entry.def]) {
      const rewritten = carrier && rewrites.get(carrier.propertyNames);
      if (rewritten)
        carrier.propertyNames = rewritten;
    }
  }
}
var recordProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  const keyType = def.keyType;
  const patterns = aggregateChecks(keyType).patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = processSchema(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      assignProp(json.patternProperties, exactPattern(pattern).source, valueSchema);
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = processSchema(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
      let pending = pendingRecords.get(ctx);
      if (!pending) {
        pending = [];
        pendingRecords.set(ctx, pending);
        ctx.deferred.push(() => rewriteKeyNames(ctx));
      }
      pending.push(schema);
    }
    json.additionalProperties = processSchema(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== undefined;
  if (keyValues && !def.partial && !omittableOnInput) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json.required = validKeyValues.map(String);
    }
  }
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
  let unrepresentable = false;
  const serialized = JSON.stringify(value, (_, val) => {
    if (typeof val !== "bigint")
      return val;
    unrepresentable = true;
    return null;
  });
  if (!unrepresentable)
    return JSON.parse(serialized);
  handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
  return UNREPRESENTABLE_DEFAULT;
}
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT)
    json.default = value;
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io !== "input")
    return;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT)
    json._prefault = value;
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(undefined);
  } catch {
    handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  processSchema(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  processSchema(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/classic/errors.js
var _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
  Object.defineProperty(proto, key, {
    configurable: true,
    enumerable: false,
    get() {
      const value = make(this);
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
      return value;
    },
    set(value) {
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
    }
  });
}
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  const proto = Object.getPrototypeOf(inst);
  if (_installedErrorProtos.has(proto))
    return;
  _installedErrorProtos.add(proto);
  _lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
  _lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
  _lazyMethod(proto, "addIssue", (self) => (issue) => {
    self.issues.push(issue);
    self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
  });
  _lazyMethod(proto, "addIssues", (self) => (issues) => {
    self.issues.push(...issues);
    self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
  });
  Object.defineProperty(proto, "isEmpty", {
    configurable: true,
    enumerable: false,
    get() {
      return this.issues.length === 0;
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, undefined, {
  Parent: Error
});

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/classic/parse.js
var parse2 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
  if (!globalConfig.localeError)
    config(en_default());
}
function _ensureDefaultMemoizer() {
  if (!globalConfig.memoizer)
    config({ memoizer: memoizer() });
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  _ensureDefaultLocale();
  $ZodType.init(inst, def);
  inst.def = def;
  inst.type = def.type;
  return inst;
}, {
  check(...chks) {
    const def = this.def;
    return this.clone(mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }), { parent: true });
  },
  with(...chks) {
    return this.check(...chks);
  },
  clone(def, params) {
    return clone(this, def, params);
  },
  brand() {
    return this;
  },
  register(reg, meta) {
    reg.add(this, meta);
    return this;
  },
  refine(check, params) {
    return this.check(refine(check, params));
  },
  superRefine(refinement, params) {
    return this.check(superRefine(refinement, params));
  },
  overwrite(fn) {
    return this.check(_overwrite(fn));
  },
  optional() {
    return optional(this);
  },
  exactOptional() {
    return exactOptional(this);
  },
  nullable() {
    return nullable(this);
  },
  nullish() {
    return optional(nullable(this));
  },
  nonoptional(params) {
    return nonoptional(this, params);
  },
  array() {
    return array(this);
  },
  or(arg) {
    return union([this, arg]);
  },
  and(arg) {
    return intersection(this, arg);
  },
  transform(tx) {
    return pipe(this, transform(tx));
  },
  default(d) {
    return _default(this, d);
  },
  prefault(d) {
    return prefault(this, d);
  },
  catch(params) {
    return _catch(this, params);
  },
  pipe(target) {
    return pipe(this, target);
  },
  readonly() {
    return readonly(this);
  },
  describe(description) {
    const cl = this.clone();
    globalRegistry.add(cl, { description });
    return cl;
  },
  meta(...args) {
    if (args.length === 0)
      return globalRegistry.get(this);
    const cl = this.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  },
  isOptional() {
    return this.safeParse(undefined).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(fn, ...args) {
    return args.length === 0 ? fn(this) : fn(this, ...args);
  },
  get "~standard"() {
    return hide(this, "~standard", {
      ...standardProps(this),
      jsonSchema: {
        input: createStandardJSONSchemaMethod(this, "input"),
        output: createStandardJSONSchemaMethod(this, "output")
      }
    });
  },
  set "~standard"(value) {
    own(this, "~standard", value);
  },
  parse: function _parse(data, params) {
    return parse2(this, data, params, { callee: _parse });
  },
  parseAsync: async function _parseAsync(data, params) {
    return await parseAsync(this, data, params, { callee: _parseAsync });
  },
  safeParse(data, params) {
    return safeParse(this, data, params);
  },
  async safeParseAsync(data, params) {
    return safeParseAsync(this, data, params);
  },
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(value) {
    own(this, "spa", value);
  },
  validate(data, params) {
    return validate(this, data, params);
  },
  validateAsync(data, params) {
    return validateAsync(this, data, params);
  },
  encode: function _encode(data, params) {
    return encode(this, data, params, { callee: _encode });
  },
  decode: function _decode(data, params) {
    return decode(this, data, params, { callee: _decode });
  },
  encodeAsync: async function _encodeAsync(data, params) {
    return await encodeAsync(this, data, params, { callee: _encodeAsync });
  },
  decodeAsync: async function _decodeAsync(data, params) {
    return await decodeAsync(this, data, params, { callee: _decodeAsync });
  },
  safeEncode(data, params) {
    return safeEncode(this, data, params);
  },
  safeDecode(data, params) {
    return safeDecode(this, data, params);
  },
  async safeEncodeAsync(data, params) {
    return safeEncodeAsync(this, data, params);
  },
  async safeDecodeAsync(data, params) {
    return safeDecodeAsync(this, data, params);
  },
  toJSONSchema(params) {
    return createToJSONSchemaMethod(this, {})(params);
  },
  get description() {
    return globalRegistry.get(this)?.description;
  },
  get _def() {
    return this._zod.def;
  }
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
}, /* @__PURE__ */ derived({
  format: (inst) => aggregateChecks(inst).format ?? null,
  minLength: (inst) => aggregateChecks(inst).minimum ?? null,
  maxLength: (inst) => aggregateChecks(inst).maximum ?? null
}, {
  regex(...args) {
    return this.check(_regex(...args));
  },
  includes(...args) {
    return this.check(_includes(...args));
  },
  startsWith(...args) {
    return this.check(_startsWith(...args));
  },
  endsWith(...args) {
    return this.check(_endsWith(...args));
  },
  min(...args) {
    return this.check(_minLength(...args));
  },
  max(...args) {
    return this.check(_maxLength(...args));
  },
  length(...args) {
    return this.check(_length(...args));
  },
  nonempty(...args) {
    return this.check(_minLength(1, ...args));
  },
  lowercase(params) {
    return this.check(_lowercase(params));
  },
  uppercase(params) {
    return this.check(_uppercase(params));
  },
  trim() {
    return this.check(_trim());
  },
  normalize(...args) {
    return this.check(_normalize(...args));
  },
  toLowerCase() {
    return this.check(_toLowerCase());
  },
  toUpperCase() {
    return this.check(_toUpperCase());
  },
  slugify() {
    return this.check(_slugify());
  }
}));
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
}, {
  email(params) {
    return this.check(_email(ZodEmail, params));
  },
  url(params) {
    return this.check(_url(ZodURL, params));
  },
  jwt(params) {
    return this.check(_jwt(ZodJWT, params));
  },
  emoji(params) {
    return this.check(_emoji2(ZodEmoji, params));
  },
  guid(params) {
    return this.check(_guid(ZodGUID, params));
  },
  uuid(params) {
    return this.check(_uuid(ZodUUID, params));
  },
  uuidv4(params) {
    return this.check(_uuidv4(ZodUUID, params));
  },
  uuidv6(params) {
    return this.check(_uuidv6(ZodUUID, params));
  },
  uuidv7(params) {
    return this.check(_uuidv7(ZodUUID, params));
  },
  nanoid(params) {
    return this.check(_nanoid(ZodNanoID, params));
  },
  cuid(params) {
    return this.check(_cuid(ZodCUID, params));
  },
  cuid2(params) {
    return this.check(_cuid2(ZodCUID2, params));
  },
  ulid(params) {
    return this.check(_ulid(ZodULID, params));
  },
  base64(params) {
    return this.check(_base64(ZodBase64, params));
  },
  base64url(params) {
    return this.check(_base64url(ZodBase64URL, params));
  },
  xid(params) {
    return this.check(_xid(ZodXID, params));
  },
  ksuid(params) {
    return this.check(_ksuid(ZodKSUID, params));
  },
  ipv4(params) {
    return this.check(_ipv4(ZodIPv4, params));
  },
  ipv6(params) {
    return this.check(_ipv6(ZodIPv6, params));
  },
  cidrv4(params) {
    return this.check(_cidrv4(ZodCIDRv4, params));
  },
  cidrv6(params) {
    return this.check(_cidrv6(ZodCIDRv6, params));
  },
  e164(params) {
    return this.check(_e164(ZodE164, params));
  },
  datetime(params) {
    return this.check(_isoDateTime(ZodISODateTime, params));
  },
  date(params) {
    return this.check(_isoDate(ZodISODate, params));
  },
  time(params) {
    return this.check(_isoTime(ZodISOTime, params));
  },
  duration(params) {
    return this.check(_isoDuration(ZodISODuration, params));
  }
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  inst.isFinite = true;
}, /* @__PURE__ */ derived({
  minValue: (inst) => {
    const { minimum, exclusiveMinimum } = aggregateChecks(inst);
    return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
  },
  maxValue: (inst) => {
    const { maximum, exclusiveMaximum } = aggregateChecks(inst);
    return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
  },
  isInt: (inst) => {
    const { isInt, multipleOf } = aggregateChecks(inst);
    return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
  },
  format: (inst) => aggregateChecks(inst).format ?? null
}, {
  gt(value, params) {
    return this.check(_gt(value, params));
  },
  gte(value, params) {
    return this.check(_gte(value, params));
  },
  min(value, params) {
    return this.check(_gte(value, params));
  },
  lt(value, params) {
    return this.check(_lt(value, params));
  },
  lte(value, params) {
    return this.check(_lte(value, params));
  },
  max(value, params) {
    return this.check(_lte(value, params));
  },
  int(params) {
    return this.check(int(params));
  },
  safe(params) {
    return this.check(int(params));
  },
  positive(params) {
    return this.check(_gt(0, params));
  },
  nonnegative(params) {
    return this.check(_gte(0, params));
  },
  negative(params) {
    return this.check(_lt(0, params));
  },
  nonpositive(params) {
    return this.check(_lte(0, params));
  },
  multipleOf(value, params) {
    return this.check(_multipleOf(value, params));
  },
  step(value, params) {
    return this.check(_multipleOf(value, params));
  },
  finite() {
    return this;
  }
}));
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
}, {
  min(n, params) {
    return this.check(_minLength(n, params));
  },
  nonempty(params) {
    return this.check(_minLength(1, params));
  },
  max(n, params) {
    return this.check(_maxLength(n, params));
  },
  length(n, params) {
    return this.check(_length(n, params));
  },
  unwrap() {
    return this.element;
  }
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
  keyof() {
    return _enum(Object.keys(this._zod.def.shape));
  },
  catchall(catchall) {
    return this.clone(mergeDefs(this._zod.def, { catchall }));
  },
  passthrough() {
    return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
  },
  loose() {
    return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
  },
  strict() {
    return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
  },
  strip() {
    return this.clone(mergeDefs(this._zod.def, { catchall: undefined }));
  },
  extend(incoming) {
    return extend(this, incoming);
  },
  safeExtend(incoming) {
    return safeExtend(this, incoming);
  },
  merge(other) {
    return merge(this, other);
  },
  pick(mask) {
    return pick(this, mask);
  },
  omit(mask) {
    return omit(this, mask);
  },
  partial(...args) {
    return partial(ZodOptional, this, args[0]);
  },
  exactPartial(...args) {
    return partial(ZodExactOptional, this, args[0], "exactPartial");
  },
  required(...args) {
    return required(ZodNonOptional, this, args[0]);
  }
});
function strictObject(shape, params) {
  return new ZodObject({
    type: "object",
    shape,
    catchall: never(),
    ...normalizeParams(params)
  });
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  if (!valueType || !valueType._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string2(),
      valueType: keyType,
      ...normalizeParams(valueType)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = [...inst._zod.values];
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        if (!("input" in _issue))
          _issue.input = payload.value;
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output) => {
        payload.value = output;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
  });
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
// ../../../oss/adrkit/packages/core/src/schema/adr.schema.ts
var SCHEMA_VERSION = "0.2.0";
var Identity = string2().regex(/^(@[A-Za-z0-9-]+|team:[a-z0-9-]+|[^@\s]+@[^@\s]+\.[^@\s]+)$/, "Expected @handle, team:slug, or an email address");
var AdrRef = string2().regex(/^(([a-z0-9][a-z0-9-]*):)?([0-9]{4,}|[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26})$/, "Expected an ADR id, optionally prefixed with a log name");
var IsoDate = string2().date();
var IsoDateTime = string2().datetime({
  offset: true,
  error: "Expected an RFC 3339 date-time with seconds, e.g. 2026-01-01T12:30:00Z"
});
var Slug = string2().regex(/^[a-z0-9][a-z0-9-]*$/);
var strictObject2 = (shape) => strictObject(shape);
var uniqueArray = (item) => array(item).refine((xs) => new Set(xs.map((x) => JSON.stringify(x))).size === xs.length, {
  message: "Items must be unique"
}).meta({ uniqueItems: true });
var Status = _enum([
  "draft",
  "proposed",
  "accepted",
  "rejected",
  "superseded",
  "deprecated"
]);
var Scope = _enum(["component", "domain", "org"]);
var Reversibility = _enum(["two-way-door", "one-way-door", "unknown"]);
var BlastRadius = _enum(["component", "team", "cross-team", "org"]);
var ReviewTier = _enum(["auto", "async", "arb"]);
var Severity = _enum(["error", "warn", "info"]);
var EscalationReason = _enum([
  "one-way-door",
  "cost-threshold",
  "security-surface",
  "data-residency",
  "regulatory",
  "contradicts-accepted-adr",
  "low-confidence",
  "pass-disagreement",
  "agent-authored-production",
  "novel-no-precedent",
  "human-requested"
]);
var AffectsType = _enum([
  "path",
  "entity",
  "package",
  "resource",
  "api",
  "data"
]);
var AffectsMatcher = strictObject2({
  type: AffectsType,
  pattern: string2().min(1),
  repo: string2().optional(),
  negate: boolean2().default(false),
  note: string2().optional()
});
var Assertion = strictObject2({
  id: Slug,
  description: string2().optional(),
  engine: _enum(["rego", "jsonpath", "grep", "custom"]),
  expression: string2().optional(),
  expressionFile: string2().optional(),
  input: _enum(["source", "iac-plan", "sbom", "openapi", "catalog", "custom"]).default("source"),
  severity: Severity
});
var Provenance = strictObject2({
  authoredBy: _enum(["human", "agent", "agent-drafted"]).default("human"),
  agent: strictObject2({
    name: string2().optional(),
    model: string2().optional(),
    harness: string2().optional(),
    runId: string2().optional()
  }).optional(),
  ratifiedBy: Identity.optional(),
  sourceArtifact: string2().optional(),
  importedFrom: strictObject2({
    sourceKind: _enum(["madr", "agent-log", "plan-artifact", "other"]),
    sourceRef: string2(),
    fingerprint: string2(),
    importedAt: IsoDateTime.optional()
  }).optional()
});
var Objection = strictObject2({
  by: Identity,
  summary: string2().optional(),
  resolved: boolean2().default(false)
});
var Review = strictObject2({
  tier: ReviewTier.optional(),
  tierReason: string2().optional(),
  queuedAt: IsoDateTime.optional(),
  slaDays: number2().int().min(0).optional(),
  escalatedAt: IsoDateTime.optional(),
  decidedAt: IsoDateTime.optional(),
  quorum: number2().int().min(1).optional(),
  approvals: array(Identity).default([]),
  objections: array(Objection).default([])
});
var DeterministicFinding = strictObject2({
  rule: string2(),
  severity: Severity,
  message: string2().optional(),
  adr: AdrRef.optional()
});
var Evaluation = strictObject2({
  ranAt: IsoDateTime.optional(),
  evaluatorVersion: string2().optional(),
  rubricVersion: string2().optional(),
  scores: record(string2(), number2().min(0).max(4)).optional(),
  confidence: number2().min(0).max(1).optional(),
  escalate: boolean2().optional(),
  escalationReasons: array(EscalationReason).default([]),
  deterministicFindings: array(DeterministicFinding).default([])
});
var ExternalRef = strictObject2({
  type: _enum(["issue", "pr", "rfc", "incident", "doc", "meeting", "control", "other"]),
  id: string2().optional(),
  url: string2().url(),
  label: string2().optional()
});
var AdrFrontmatter = strictObject2({
  schemaVersion: string2().regex(/^\d+\.\d+\.\d+$/).default(SCHEMA_VERSION),
  id: string2().regex(/^([0-9]{4,}|[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26})$/),
  title: string2().min(3).max(120),
  status: Status,
  date: IsoDate,
  created: IsoDate.optional(),
  deciders: array(Identity).default([]),
  consulted: array(Identity).default([]),
  informed: array(Identity).default([]),
  tags: uniqueArray(Slug).default([]),
  scope: Scope.default("component"),
  domain: string2().optional(),
  reversibility: Reversibility.default("unknown"),
  blastRadius: BlastRadius.default("component"),
  supersedes: uniqueArray(AdrRef).default([]),
  supersededBy: AdrRef.optional(),
  relatesTo: uniqueArray(AdrRef).default([]),
  conflictsWith: array(AdrRef).default([]),
  affects: array(AffectsMatcher).default([]),
  assertions: array(Assertion).default([]),
  provenance: Provenance.optional(),
  review: Review.optional(),
  evaluation: Evaluation.optional(),
  externalRefs: array(ExternalRef).default([]),
  complianceControls: uniqueArray(string2()).default([]),
  reviewBy: IsoDate.optional()
}).refine((a) => a.status === "superseded" ? Boolean(a.supersededBy) : true, {
  message: 'status "superseded" requires supersededBy',
  path: ["supersededBy"]
}).refine((a) => a.supersededBy ? a.status === "superseded" : true, {
  message: 'supersededBy is set but status is not "superseded"',
  path: ["status"]
}).refine((a) => a.status !== "accepted" || a.deciders.length > 0 || Boolean(a.provenance?.importedFrom), {
  message: "an accepted decision must name at least one decider, unless it was imported",
  path: ["deciders"]
}).refine((a) => a.status !== "accepted" || a.provenance?.authoredBy !== "agent" && a.provenance?.authoredBy !== "agent-drafted" || Boolean(a.provenance?.ratifiedBy), {
  message: 'a machine-originated record cannot reach "accepted" without a named human ratifier',
  path: ["provenance", "ratifiedBy"]
}).refine((a) => !(a.reversibility === "one-way-door" && a.review?.tier === "auto"), {
  message: "one-way-door decisions may not take the auto-approve fast path",
  path: ["review", "tier"]
});
// ../../../oss/adrkit/packages/core/src/schema/emit.ts
var ADR_SCHEMA_ID = `https://adrkit.dev/schema/adr/v${SCHEMA_VERSION}/adr.schema.json`;
// ../../../oss/adrkit/packages/core/src/schema/ref.ts
function parseAdrRef(ref) {
  const idx = ref.indexOf(":");
  if (idx <= 0)
    return { id: ref };
  return { log: ref.slice(0, idx), id: ref.slice(idx + 1) };
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/yaml/dist/index.js
var composer = require_composer();
var Document = require_Document();
var Schema = require_Schema();
var errors2 = require_errors();
var Alias = require_Alias();
var identity = require_identity();
var Pair = require_Pair();
var Scalar = require_Scalar();
var YAMLMap = require_YAMLMap();
var YAMLSeq = require_YAMLSeq();
var cst = require_cst();
var lexer = require_lexer();
var lineCounter = require_line_counter();
var parser = require_parser();
var publicApi = require_public_api();
var visit = require_visit();
var $Composer = composer.Composer;
var $Document = Document.Document;
var $Schema = Schema.Schema;
var $YAMLError = errors2.YAMLError;
var $YAMLParseError = errors2.YAMLParseError;
var $YAMLWarning = errors2.YAMLWarning;
var $Alias = Alias.Alias;
var $isAlias = identity.isAlias;
var $isCollection = identity.isCollection;
var $isDocument = identity.isDocument;
var $isMap = identity.isMap;
var $isNode = identity.isNode;
var $isPair = identity.isPair;
var $isScalar = identity.isScalar;
var $isSeq = identity.isSeq;
var $Pair = Pair.Pair;
var $Scalar = Scalar.Scalar;
var $YAMLMap = YAMLMap.YAMLMap;
var $YAMLSeq = YAMLSeq.YAMLSeq;
var $Lexer = lexer.Lexer;
var $LineCounter = lineCounter.LineCounter;
var $Parser = parser.Parser;
var $parse = publicApi.parse;
var $parseAllDocuments = publicApi.parseAllDocuments;
var $parseDocument = publicApi.parseDocument;
var $stringify = publicApi.stringify;
var $visit = visit.visit;
var $visitAsync = visit.visitAsync;

// ../../../oss/adrkit/packages/core/src/parse/frontmatter.ts
class FrontmatterError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "FrontmatterError";
    this.code = code;
  }
}
function lineContent(source, start, end) {
  const raw = source.slice(start, end);
  return raw.endsWith("\r") ? raw.slice(0, -1) : raw;
}
function parseFrontmatter(source) {
  const firstLineEnd = source.indexOf(`
`);
  const firstLine = firstLineEnd === -1 ? source : source.slice(0, firstLineEnd);
  if ((firstLine.endsWith("\r") ? firstLine.slice(0, -1) : firstLine) !== "---") {
    throw new FrontmatterError("missing-frontmatter", "ADR files must start with a leading --- YAML frontmatter fence");
  }
  if (firstLineEnd === -1) {
    throw new FrontmatterError("unterminated-frontmatter", "ADR frontmatter is missing its closing --- fence");
  }
  let lineStart = firstLineEnd + 1;
  while (lineStart <= source.length) {
    const nextNewline = source.indexOf(`
`, lineStart);
    const lineEnd = nextNewline === -1 ? source.length : nextNewline;
    if (lineContent(source, lineStart, lineEnd) === "---") {
      const yamlSource = source.slice(firstLineEnd + 1, lineStart);
      const bodyStart = nextNewline === -1 ? source.length : nextNewline + 1;
      const document = $parseDocument(yamlSource, { strict: true, prettyErrors: false });
      if (document.errors.length > 0) {
        throw new FrontmatterError("invalid-yaml", document.errors.map((error) => error.message).join("; "));
      }
      return { data: document.toJS(), body: source.slice(bodyStart) };
    }
    if (nextNewline === -1) {
      break;
    }
    lineStart = nextNewline + 1;
  }
  throw new FrontmatterError("unterminated-frontmatter", "ADR frontmatter is missing its closing --- fence");
}
// ../../../oss/adrkit/packages/core/src/load/corpus.ts
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";

// ../../../oss/adrkit/packages/core/src/ordering/index.ts
function compareCodeUnits(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function compareFindings(a, b) {
  return compareCodeUnits(a.rule, b.rule) || compareCodeUnits(a.id ?? "", b.id ?? "") || compareCodeUnits(a.pattern ?? "", b.pattern ?? "") || compareCodeUnits(a.path ?? "", b.path ?? "") || compareCodeUnits(a.field ?? "", b.field ?? "") || compareCodeUnits(a.message, b.message);
}
function sortFindingsCanonical(findings) {
  return [...findings].sort(compareFindings);
}

// ../../../oss/adrkit/packages/core/src/load/corpus.ts
var RECORD_FILE_PATTERN = /^[0-9]{4,}-.+\.md$/;
var TEMPLATE_FILE_NAME = "0000-template.md";
var NON_RECORD_FILE_NAMES = new Set(["readme.md", "index.md", "contributing.md", "template.md"]);
function isConventionalNonRecordFileName(fileName) {
  return fileName === TEMPLATE_FILE_NAME || NON_RECORD_FILE_NAMES.has(fileName.toLowerCase());
}
function isRecordFileName(fileName) {
  return fileName !== TEMPLATE_FILE_NAME && RECORD_FILE_PATTERN.test(fileName);
}
function normalizeDisplayPath(path, cwd = process.cwd()) {
  const absolutePath = isAbsolute(path) ? path : resolve(cwd, path);
  const displayPath = relative(cwd, absolutePath) || basename(absolutePath);
  return displayPath.split(sep).join("/");
}
function toAbsolutePath(path, cwd = process.cwd()) {
  return isAbsolute(path) ? path : resolve(cwd, path);
}
function compareByDisplayPath(a, b, cwd = process.cwd()) {
  return compareCodeUnits(normalizeDisplayPath(a, cwd), normalizeDisplayPath(b, cwd));
}
async function discoverAdrFiles(dir = "docs/adr", cwd = process.cwd()) {
  const absoluteDir = toAbsolutePath(dir, cwd);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && isRecordFileName(entry.name)).map((entry) => join(absoluteDir, entry.name)).sort((a, b) => compareByDisplayPath(a, b, cwd));
}
var MAX_SKIP_SCAN_DEPTH = 8;
async function collectSkippedMarkdown(absoluteDir, depth, found) {
  const entries = await readdir(absoluteDir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const path = join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".") && depth < MAX_SKIP_SCAN_DEPTH) {
        await collectSkippedMarkdown(path, depth + 1, found);
      }
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name.startsWith("."))
      continue;
    if (isConventionalNonRecordFileName(entry.name))
      continue;
    if (depth > 0)
      found.push({ path, reason: "nested" });
    else if (!isRecordFileName(entry.name))
      found.push({ path, reason: "filename" });
  }
}
async function discoverSkippedMarkdownFiles(dir = "docs/adr", cwd = process.cwd()) {
  const found = [];
  await collectSkippedMarkdown(toAbsolutePath(dir, cwd), 0, found);
  return found.sort((a, b) => compareByDisplayPath(a.path, b.path, cwd));
}
async function expandRecordInputs(paths, dir = "docs/adr", cwd = process.cwd()) {
  if (!paths || paths.length === 0) {
    return discoverAdrFiles(dir, cwd);
  }
  const expanded = [];
  for (const inputPath of paths) {
    const absolutePath = toAbsolutePath(inputPath, cwd);
    try {
      const inputStat = await stat(absolutePath);
      if (inputStat.isDirectory()) {
        expanded.push(...await discoverAdrFiles(absolutePath, cwd));
      } else if (inputStat.isFile()) {
        expanded.push(absolutePath);
      }
    } catch {
      expanded.push(absolutePath);
    }
  }
  return Array.from(new Set(expanded)).sort((a, b) => compareByDisplayPath(a, b, cwd));
}
async function parseAdrFile(path, cwd = process.cwd()) {
  const absolutePath = toAbsolutePath(path, cwd);
  const source = await readFile(absolutePath, "utf8");
  const parsed = parseFrontmatter(source);
  return {
    ...parsed,
    absolutePath,
    path: normalizeDisplayPath(absolutePath, cwd)
  };
}
// ../../../oss/adrkit/packages/core/src/status/bucket.ts
function decisionBucketFor(status) {
  if (status === "accepted")
    return "governing";
  if (status === "draft" || status === "proposed")
    return "activeProposals";
  return "history";
}
// ../../../oss/adrkit/packages/core/src/validate/findings.ts
function compareOptional(a, b) {
  return compareCodeUnits(a ?? "", b ?? "");
}
function sortFindings(findings) {
  return [...findings].sort((a, b) => compareCodeUnits(a.rule, b.rule) || compareOptional(a.id, b.id) || compareOptional(a.pattern, b.pattern) || compareOptional(a.path, b.path) || compareOptional(a.field, b.field) || compareCodeUnits(a.message, b.message));
}
function countFindings(findings) {
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const finding of findings) {
    if (finding.severity === "error")
      errors += 1;
    if (finding.severity === "warn")
      warnings += 1;
    if (finding.severity === "info")
      infos += 1;
  }
  return { errors, warnings, infos };
}
function exitCodeForFindings(findings) {
  return findings.some((finding) => finding.severity === "error") ? 1 : 0;
}
// ../../../oss/adrkit/packages/core/src/validate/contract.ts
function fieldPath(path) {
  return path.length === 0 ? undefined : path.map(String).join(".");
}
function rawId(data) {
  if (data && typeof data === "object" && "id" in data) {
    const id = data.id;
    return typeof id === "string" ? id : undefined;
  }
  return;
}
function ruleForIssue(issue) {
  if (issue.code === "unrecognized_keys") {
    return "strict-unknown-key";
  }
  if (issue.code === "custom") {
    if (issue.message === 'status "superseded" requires supersededBy') {
      return "superseded-requires-supersededBy";
    }
    if (issue.message === 'supersededBy is set but status is not "superseded"') {
      return "supersededBy-requires-superseded-status";
    }
    if (issue.message === "an accepted decision must name at least one decider, unless it was imported") {
      return "accepted-requires-decider-unless-imported";
    }
    if (issue.message === 'a machine-originated record cannot reach "accepted" without a named human ratifier') {
      return "agent-accepted-requires-ratifier";
    }
    if (issue.message === "one-way-door decisions may not take the auto-approve fast path") {
      return "one-way-door-disallows-auto";
    }
    if (issue.message === "Items must be unique") {
      return "unique-items";
    }
    return "contract-refinement";
  }
  if (issue.code === "invalid_type") {
    return issue.message.includes("undefined") ? "required-field" : "invalid-type";
  }
  if (issue.code === "invalid_value") {
    return "invalid-enum-value";
  }
  if (issue.code === "invalid_format") {
    return "invalid-format";
  }
  if (issue.code === "too_small" || issue.code === "too_big") {
    return "invalid-size";
  }
  return `contract-${issue.code}`;
}
function issueFindings(issue, path, id) {
  if (issue.code === "unrecognized_keys") {
    return issue.keys.map((key) => {
      const field = fieldPath([...issue.path, key]) ?? key;
      return {
        rule: "strict-unknown-key",
        severity: "error",
        message: `Unknown frontmatter field "${field}" is not allowed`,
        path,
        id,
        field
      };
    });
  }
  return [
    {
      rule: ruleForIssue(issue),
      severity: "error",
      message: issue.message,
      path,
      id,
      field: fieldPath(issue.path)
    }
  ];
}
function validateParsedAdr(parsed) {
  const result = AdrFrontmatter.safeParse(parsed.data);
  if (result.success) {
    return {
      findings: [],
      record: {
        frontmatter: result.data,
        body: parsed.body,
        path: parsed.path
      }
    };
  }
  const id = rawId(parsed.data);
  return {
    findings: result.error.issues.flatMap((issue) => issueFindings(issue, parsed.path, id))
  };
}
function validateAdrFrontmatter(data, path) {
  return validateParsedAdr({ data, body: "", path, absolutePath: path });
}
// ../../../oss/adrkit/packages/core/src/validate/corpus-invariants.ts
function addReferenceFinding(findings, record, field, ref, severity) {
  const crossLog = parseAdrRef(ref).log !== undefined;
  findings.push({
    rule: `dangling-${field}`,
    severity,
    message: crossLog ? `Reference "${ref}" in ${field} names another decision log; cross-repository supersession is not supported` : `Reference "${ref}" in ${field} does not resolve to a record in the corpus`,
    path: record.path,
    id: record.frontmatter.id,
    field
  });
}
function addFederatedReferenceFinding(findings, record, field, ref, log) {
  findings.push({
    rule: "federated-ref-unresolved",
    severity: "info",
    message: `Reference "${ref}" in ${field} names another decision log ("${log}") and is inert against this corpus`,
    path: record.path,
    id: record.frontmatter.id,
    field,
    pattern: ref
  });
}
function validateCorpusInvariants(records) {
  const findings = [];
  const byId = new Map;
  for (const record of records) {
    const recordsForId = byId.get(record.frontmatter.id) ?? [];
    recordsForId.push(record);
    byId.set(record.frontmatter.id, recordsForId);
  }
  for (const [id, duplicates] of byId) {
    if (duplicates.length <= 1)
      continue;
    const paths = duplicates.map((record) => record.path).sort();
    for (const record of duplicates) {
      findings.push({
        rule: "unique-id",
        severity: "error",
        message: `ADR id "${id}" is used by multiple records: ${paths.join(", ")}`,
        path: record.path,
        id,
        field: "id"
      });
    }
  }
  const ids = new Set(byId.keys());
  for (const record of records) {
    for (const ref of record.frontmatter.supersedes) {
      if (!ids.has(ref))
        addReferenceFinding(findings, record, "supersedes", ref, "error");
    }
    if (record.frontmatter.supersededBy && !ids.has(record.frontmatter.supersededBy)) {
      addReferenceFinding(findings, record, "supersededBy", record.frontmatter.supersededBy, "error");
    }
    for (const ref of record.frontmatter.relatesTo) {
      const { log } = parseAdrRef(ref);
      if (log !== undefined)
        addFederatedReferenceFinding(findings, record, "relatesTo", ref, log);
      else if (!ids.has(ref))
        addReferenceFinding(findings, record, "relatesTo", ref, "error");
    }
    for (const ref of record.frontmatter.conflictsWith) {
      const { log } = parseAdrRef(ref);
      if (log !== undefined) {
        addFederatedReferenceFinding(findings, record, "conflictsWith", ref, log);
      } else if (!ids.has(ref)) {
        addReferenceFinding(findings, record, "conflictsWith", ref, "warn");
      } else if (record.frontmatter.status === "accepted") {
        findings.push({
          rule: "accepted-conflictsWith",
          severity: "warn",
          message: `Accepted ADR declares a known conflict with "${ref}"`,
          path: record.path,
          id: record.frontmatter.id,
          field: "conflictsWith"
        });
      }
    }
  }
  return findings;
}
// ../../../oss/adrkit/packages/core/src/validate/import-incomplete.ts
function validateImportIncomplete(records) {
  const findings = [];
  for (const record of records) {
    if (!record.frontmatter.provenance?.importedFrom)
      continue;
    if (record.frontmatter.status === "accepted" && record.frontmatter.deciders.length === 0) {
      findings.push({
        rule: "import-incomplete",
        severity: "info",
        message: "Imported accepted decision has no deciders; provenance explains the gap, but it should be backfilled when known",
        path: record.path,
        id: record.frontmatter.id,
        field: "deciders"
      });
    }
  }
  return findings;
}
// ../../../oss/adrkit/packages/core/src/affects/inert.ts
var import_picomatch = __toESM(require_picomatch2(), 1);
function compilePattern(pattern) {
  return import_picomatch.default(pattern, { dot: false, nocase: false, nonegate: true });
}
function resolveEntityIds(pattern, catalog) {
  const ids = new Set;
  const isMatch = compilePattern(pattern);
  for (const entity of catalog.entities) {
    const refs = [entity.id, ...entity.refs ?? []];
    if (refs.some((ref) => isMatch(ref))) {
      ids.add(entity.id);
    }
  }
  return ids;
}
function entitiesForPaths(changedFiles, catalog) {
  const ids = new Set;
  for (const entity of catalog.entities) {
    for (const entityPath of entity.paths ?? []) {
      const isMatch = compilePattern(entityPath);
      if (changedFiles.some((path) => isMatch(path))) {
        ids.add(entity.id);
        break;
      }
    }
  }
  return ids;
}
function matchEntityPattern(pattern, changedFiles, catalog) {
  if (!catalog) {
    return { matched: false, unresolvable: true };
  }
  const entityIds = resolveEntityIds(pattern, catalog);
  if (entityIds.size === 0) {
    return { matched: false };
  }
  const changedEntityIds = entitiesForPaths(changedFiles, catalog);
  return {
    matched: [...entityIds].some((id) => changedEntityIds.has(id))
  };
}
function isAlwaysInertType(type) {
  return type === "resource" || type === "api" || type === "data";
}

// ../../../oss/adrkit/packages/core/src/affects/matchers/package.ts
var import_semver = __toESM(require_semver2(), 1);
function parsePackagePattern(pattern) {
  const splitAt = pattern.lastIndexOf("@");
  const hasRange = splitAt > 0;
  const name = hasRange ? pattern.slice(0, splitAt) : pattern;
  const range = hasRange ? pattern.slice(splitAt + 1).trim() : undefined;
  if (!name.trim() || hasRange && !range) {
    return;
  }
  if (range && !import_semver.default.validRange(range)) {
    return;
  }
  return range ? { name, range } : { name };
}
function matchPackagePattern(pattern, changedDependencies) {
  const parsed = parsePackagePattern(pattern);
  if (!parsed) {
    return { matched: false, badPattern: true };
  }
  if (!changedDependencies) {
    return { matched: false, unresolvable: true };
  }
  return {
    matched: changedDependencies.some((dependency) => dependency.name === parsed.name && (!parsed.range || import_semver.default.satisfies(dependency.version, parsed.range)))
  };
}

// ../../../oss/adrkit/packages/core/src/affects/matchers/path.ts
var import_picomatch2 = __toESM(require_picomatch2(), 1);
function normalizeCandidate(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}
function hasDotSegment(path) {
  return path.split("/").some((segment) => segment.startsWith(".") && segment !== "." && segment !== "..");
}
function patternAllowsDotSegment(pattern) {
  return pattern.split("/").some((segment) => segment.startsWith(".") && segment !== "." && segment !== "..");
}
function matchPathPattern(pattern, changedFiles) {
  if (pattern.startsWith("/")) {
    return { matched: false, badPattern: "leading-slash" };
  }
  try {
    const isMatch = import_picomatch2.default(pattern, { dot: false, nocase: false, nonegate: true });
    const allowsDot = patternAllowsDotSegment(pattern);
    return {
      matched: changedFiles.some((path) => {
        const candidate = normalizeCandidate(path);
        return (!hasDotSegment(candidate) || allowsDot) && isMatch(candidate);
      })
    };
  } catch {
    return { matched: false, badPattern: "invalid-glob" };
  }
}

// ../../../oss/adrkit/packages/core/src/affects/index.ts
var AFFECTS_REPO_NOT_APPLICABLE = "affects-repo-not-applicable";
function compareFiredMatcher(a, b) {
  return compareCodeUnits(a.type, b.type) || compareCodeUnits(a.pattern, b.pattern);
}
function uniqueSortedFiredMatchers(matchers) {
  const byKey = new Map;
  for (const matcher of matchers) {
    byKey.set(`${matcher.type}\x00${matcher.pattern}`, matcher);
  }
  return [...byKey.values()].sort(compareFiredMatcher);
}
function affectsFinding(record, matcher, rule, severity, message) {
  return {
    rule,
    severity,
    message,
    id: record.frontmatter.id,
    path: record.path,
    field: `affects.${matcher.type}`,
    pattern: matcher.pattern
  };
}
function matcherAppliesToMember(matcher, member) {
  if (!matcher.repo)
    return true;
  if (member === undefined)
    return false;
  return matcher.repo === member.repo || matcher.repo === member.log;
}
function repoNotApplicableFinding(record, matcher) {
  return affectsFinding(record, matcher, AFFECTS_REPO_NOT_APPLICABLE, "info", `${matcher.type} matcher "${matcher.pattern}" is qualified with repo "${matcher.repo}" and cannot apply in a single-repository corpus; it was skipped, and is kept for a federation that includes that repository.`);
}
function evaluateMatcher(record, matcher, changedFiles, snapshots) {
  if (matcher.type === "path") {
    const result = matchPathPattern(matcher.pattern, changedFiles);
    if (result.badPattern) {
      return {
        matched: false,
        findings: [
          affectsFinding(record, matcher, "affects-bad-pattern", "warn", result.badPattern === "leading-slash" ? `Path matcher "${matcher.pattern}" must be repo-relative and must not start with "/".` : `Path matcher "${matcher.pattern}" is not a valid glob pattern.`)
        ]
      };
    }
    return { matched: result.matched, findings: [] };
  }
  if (matcher.type === "package") {
    const result = matchPackagePattern(matcher.pattern, snapshots?.changedDependencies);
    if (result.unresolvable) {
      return {
        matched: false,
        findings: [
          affectsFinding(record, matcher, "affects-unresolvable", "info", `Package matcher "${matcher.pattern}" requires a changed-dependency snapshot and is inert.`)
        ]
      };
    }
    if (result.badPattern) {
      return {
        matched: false,
        findings: [
          affectsFinding(record, matcher, "affects-bad-pattern", "warn", `Package matcher "${matcher.pattern}" must be "name" or "name@<valid semver range>".`)
        ]
      };
    }
    return { matched: result.matched, findings: [] };
  }
  if (matcher.type === "entity") {
    const result = matchEntityPattern(matcher.pattern, changedFiles, snapshots?.catalog);
    if (result.unresolvable) {
      return {
        matched: false,
        findings: [
          affectsFinding(record, matcher, "affects-unresolvable", "info", `Entity matcher "${matcher.pattern}" has no catalog snapshot and is inert.`)
        ]
      };
    }
    return { matched: result.matched, findings: [] };
  }
  if (isAlwaysInertType(matcher.type)) {
    return {
      matched: false,
      findings: [
        affectsFinding(record, matcher, "affects-unresolvable", "info", `${matcher.type} matcher "${matcher.pattern}" has no backing snapshot in this phase and is inert.`)
      ]
    };
  }
  return {
    matched: false,
    findings: [
      affectsFinding(record, matcher, "affects-unknown-type", "warn", `Affects matcher type "${matcher.type}" is not recognized by this adrkit version and was ignored.`)
    ]
  };
}
function resolveAffects(input) {
  const matches = [];
  const findings = [];
  for (const record of input.records) {
    const firedMatchers = [];
    let suppressed = false;
    for (const matcher of record.frontmatter.affects ?? []) {
      if (!matcherAppliesToMember(matcher, input.member)) {
        if (input.member === undefined)
          findings.push(repoNotApplicableFinding(record, matcher));
        continue;
      }
      const result = evaluateMatcher(record, matcher, input.changedFiles, input.snapshots);
      findings.push(...result.findings);
      if (!result.matched)
        continue;
      if (matcher.negate) {
        suppressed = true;
      } else {
        firedMatchers.push({ type: matcher.type, pattern: matcher.pattern });
      }
    }
    if (!suppressed && firedMatchers.length > 0) {
      matches.push({
        recordId: record.frontmatter.id,
        firedMatchers: uniqueSortedFiredMatchers(firedMatchers)
      });
    }
  }
  return {
    matches: matches.sort((a, b) => compareCodeUnits(a.recordId, b.recordId)),
    findings: sortFindings(findings)
  };
}

// ../../../oss/adrkit/packages/core/src/validate/affects-repo-qualifier.ts
function validateAffectsRepoQualifiers(records) {
  const findings = [];
  for (const record of records) {
    const qualified = (record.frontmatter.affects ?? []).filter((matcher) => Boolean(matcher.repo));
    if (qualified.length === 0)
      continue;
    const repos = [...new Set(qualified.map((matcher) => matcher.repo))].sort(compareCodeUnits);
    const count = qualified.length;
    const noun = count === 1 ? "affects matcher is" : "affects matchers are";
    findings.push({
      rule: AFFECTS_REPO_NOT_APPLICABLE,
      severity: "info",
      message: `${count} ${noun} qualified with another repository (repo ${repos.map((repo) => `"${repo}"`).join(", ")}) ` + "and cannot apply in a single-repository corpus; adr check and adr explain skip them, " + "and they are kept for a federation that includes that repository.",
      path: record.path,
      id: record.frontmatter.id,
      field: "affects"
    });
  }
  return findings;
}
// ../../../oss/adrkit/packages/core/src/validate/index.ts
import { stat as stat2 } from "node:fs/promises";
import { isAbsolute as isAbsolute2, resolve as resolve2 } from "node:path";
function parseErrorFinding(error, path) {
  if (error instanceof FrontmatterError) {
    return {
      rule: error.code === "invalid-yaml" ? "frontmatter-parse" : "frontmatter-fence",
      severity: "error",
      message: error.message,
      path,
      field: "frontmatter"
    };
  }
  return {
    rule: "file-read",
    severity: "error",
    message: error instanceof Error ? error.message : String(error),
    path
  };
}
function skippedFileFinding(skipped, cwd) {
  const message = skipped.reason === "nested" ? "Markdown file is in a subdirectory of the corpus, and discovery reads only the top level of the corpus directory; move it to the corpus root as <id>-<slug>.md for it to be linted and enforced" : "Markdown file in the corpus directory is not a discoverable ADR record and was skipped; rename it to <id>-<slug>.md (four or more leading digits) for it to be linted and enforced";
  return {
    rule: "corpus-file-skipped",
    severity: "warn",
    message,
    path: normalizeDisplayPath(skipped.path, cwd)
  };
}
async function isDirectory(path) {
  return stat2(path).then((info) => info.isDirectory(), () => false);
}
async function scannedDirectories(paths, dir, cwd) {
  if (!paths || paths.length === 0)
    return [dir];
  const directories = new Set;
  for (const path of paths) {
    const absolutePath = isAbsolute2(path) ? path : resolve2(cwd, path);
    if (await isDirectory(absolutePath))
      directories.add(absolutePath);
  }
  return [...directories].sort((a, b) => compareByDisplayPath(a, b, cwd));
}
async function lintCorpus(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const dir = options.dir ?? "docs/adr";
  const files = await expandRecordInputs(options.paths, dir, cwd);
  const records = [];
  const findings = [];
  for (const file of files) {
    const displayPath = normalizeDisplayPath(file, cwd);
    try {
      const parsed = await parseAdrFile(file, cwd);
      const result = validateParsedAdr(parsed);
      findings.push(...result.findings);
      if (result.record) {
        records.push(result.record);
      }
    } catch (error) {
      findings.push(parseErrorFinding(error, displayPath));
    }
  }
  const checkedPaths = new Set(files);
  for (const scanned of await scannedDirectories(options.paths, dir, cwd)) {
    for (const skipped of await discoverSkippedMarkdownFiles(scanned, cwd)) {
      if (!checkedPaths.has(skipped.path))
        findings.push(skippedFileFinding(skipped, cwd));
    }
  }
  findings.push(...validateImportIncomplete(records));
  findings.push(...validateAffectsRepoQualifiers(records));
  findings.push(...validateCorpusInvariants(records));
  return {
    checked: files.length,
    findings: sortFindings(findings),
    records: [...records].sort((a, b) => compareCodeUnits(a.frontmatter.id, b.frontmatter.id))
  };
}
// ../../../oss/adrkit/packages/core/src/scaffold/new.ts
import { mkdir, writeFile } from "node:fs/promises";
import { basename as basename2, dirname, resolve as resolve3 } from "node:path";

// ../../../oss/adrkit/packages/core/src/queue/as-of.ts
function isCalendarDate(candidate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate))
    return false;
  const probe = new Date(`${candidate}T00:00:00Z`);
  return Number.isFinite(probe.getTime()) && probe.toISOString().slice(0, 10) === candidate;
}
function resolveAsOf(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return isCalendarDate(value) ? { ok: true, date: value } : { ok: false, code: "invalid" };
  }
  const tIndex = value.indexOf("T");
  if (tIndex !== -1) {
    const timePart = value.slice(tIndex + 1);
    const hasTimezone = /Z$/.test(timePart) || /[+-]\d{2}:?\d{2}$/.test(timePart);
    if (!hasTimezone)
      return { ok: false, code: "tzless" };
    if (!isCalendarDate(value.slice(0, tIndex)))
      return { ok: false, code: "invalid" };
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime()))
      return { ok: false, code: "invalid" };
    const resolved = parsed.toISOString().slice(0, 10);
    return isCalendarDate(resolved) ? { ok: true, date: resolved } : { ok: false, code: "invalid" };
  }
  return { ok: false, code: "invalid" };
}
function todayUtcDate(now = new Date) {
  const date = now.toISOString().slice(0, 10);
  if (!isCalendarDate(date))
    throw new RangeError(`todayUtcDate: ${now.toISOString()} is outside years 0000-9999.`);
  return date;
}

// ../../../oss/adrkit/packages/core/src/scaffold/new.ts
class ScaffoldError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "ScaffoldError";
    this.code = code;
  }
}
function slugifyTitle(title) {
  const slug = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  if (!slug) {
    throw new ScaffoldError("usage", "Title must contain at least one ASCII letter or digit");
  }
  return slug.slice(0, 80).replace(/-+$/g, "");
}
function statusForInput(input) {
  const status = input ?? "draft";
  const parsed = Status.safeParse(status);
  if (!parsed.success) {
    throw new ScaffoldError("usage", `Invalid status "${status}"`);
  }
  if (status === "accepted" || status === "superseded") {
    throw new ScaffoldError("usage", `adr new cannot scaffold status "${status}" without additional required fields`);
  }
  return status;
}
async function nextSequentialId(dir, cwd) {
  const files = await discoverAdrFiles(dir, cwd).catch(() => []);
  let max = 0;
  for (const file of files) {
    const match = /^([0-9]+)-/.exec(basename2(file));
    if (match?.[1]) {
      max = Math.max(max, Number(match[1]));
    }
  }
  return String(max + 1).padStart(4, "0");
}
function renderAdrRecord(options) {
  const frontmatter = {
    schemaVersion: SCHEMA_VERSION,
    id: options.id,
    title: options.title,
    status: options.status,
    date: options.date,
    deciders: [],
    tags: [],
    scope: "component",
    reversibility: "unknown",
    blastRadius: "component",
    relatesTo: [],
    affects: [],
    provenance: {
      authoredBy: "human"
    }
  };
  const validation = AdrFrontmatter.safeParse(frontmatter);
  if (!validation.success) {
    throw new ScaffoldError("usage", validation.error.issues.map((issue) => issue.message).join("; "));
  }
  return `---
schemaVersion: ${frontmatter.schemaVersion}
id: "${frontmatter.id}"
title: ${JSON.stringify(frontmatter.title)}
status: ${frontmatter.status}
date: ${frontmatter.date}
deciders: []
tags: []
scope: ${frontmatter.scope}
reversibility: ${frontmatter.reversibility}
blastRadius: ${frontmatter.blastRadius}
relatesTo: []
affects: []
provenance:
  authoredBy: human
---

# ADR-${frontmatter.id}: ${frontmatter.title}

## Context

What forces are at play? What makes this a decision rather than a preference?
Why now — what changed?

State the problem, not the solution. If this section is a restatement of the
option you already picked, the record scores 2 at best on D1.

## Decision

What we are doing, in the active voice. "We will…"

## Options considered

At least two genuine alternatives, including doing nothing. An option no
competent engineer would choose is a straw man and scores zero.

### Option A: <chosen>

| Dimension | Assessment |
|---|---|
| | |

### Option B: <alternative>

**Pros:**
**Cons:**

### Option C: Do nothing

## Trade-offs

What the chosen option costs. State the downsides as plainly as the benefits —
a decision whose chosen option has no listed downsides is not a decision.

## Consequences

- Easier:
- Harder:
- **How we would know this was wrong:** a metric, a threshold, an exit
  condition, or a review date. This is the field that most separates records
  that stay alive from records that rot.
- Revisit if:

## Action items

1. [ ]
`;
}
async function createAdr(options) {
  const cwd = options.cwd ?? process.cwd();
  const dir = options.dir ?? "docs/adr";
  const title = options.title.trim();
  const status = statusForInput(options.status);
  if (title.length < 3 || title.length > 120) {
    throw new ScaffoldError("usage", "Title must be between 3 and 120 characters");
  }
  if (/[\r\n]/.test(title)) {
    throw new ScaffoldError("usage", "Title must fit on a single line");
  }
  const id = await nextSequentialId(dir, cwd);
  const fileName = `${id}-${slugifyTitle(title)}.md`;
  const path = resolve3(cwd, dir, fileName);
  const displayPath = normalizeDisplayPath(path, cwd);
  const content = renderAdrRecord({ id, title, status, date: options.date ?? todayUtcDate() });
  if (options.write !== false) {
    await mkdir(dirname(path), { recursive: true });
    try {
      await writeFile(path, content, { encoding: "utf8", flag: "wx" });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "EEXIST") {
        throw new ScaffoldError("exists", `Refusing to overwrite existing ADR file ${displayPath}`);
      }
      throw error;
    }
  }
  return { id, path: displayPath, content };
}
// ../../../oss/adrkit/packages/core/src/graph/build.ts
function edgeKey(edge) {
  return `${edge.from}\x00${edge.to}\x00${edge.kind}`;
}
function pushEdge(edges, ids, edge) {
  if (!ids.has(edge.from) || !ids.has(edge.to))
    return;
  edges.set(edgeKey(edge), edge);
}
function buildAdrGraph(records) {
  const sortedRecords = [...records].sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id));
  const ids = new Set(sortedRecords.map((record) => record.frontmatter.id));
  const edges = new Map;
  for (const record of sortedRecords) {
    for (const superseded of record.frontmatter.supersedes) {
      pushEdge(edges, ids, { from: record.frontmatter.id, to: superseded, kind: "supersedes" });
    }
    if (record.frontmatter.supersededBy) {
      pushEdge(edges, ids, {
        from: record.frontmatter.supersededBy,
        to: record.frontmatter.id,
        kind: "supersedes"
      });
    }
    for (const related of record.frontmatter.relatesTo) {
      pushEdge(edges, ids, { from: record.frontmatter.id, to: related, kind: "relatesTo" });
    }
    for (const conflict of record.frontmatter.conflictsWith) {
      pushEdge(edges, ids, { from: record.frontmatter.id, to: conflict, kind: "conflictsWith" });
    }
  }
  return {
    nodes: sortedRecords.map((record) => ({
      id: record.frontmatter.id,
      title: record.frontmatter.title,
      status: record.frontmatter.status
    })),
    edges: [...edges.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.kind.localeCompare(b.kind))
  };
}
function filterAdrGraph(graph, filter) {
  const focus = filter.focus;
  const hasFocus = focus !== undefined;
  const kinds = filter.kinds?.length ? new Set(filter.kinds) : undefined;
  const edges = graph.edges.filter((edge) => (!kinds || kinds.has(edge.kind)) && (!hasFocus || edge.from === focus || edge.to === focus));
  if (!hasFocus && !kinds) {
    return { nodes: [...graph.nodes], edges: [...graph.edges] };
  }
  const includedIds = new Set;
  if (focus !== undefined && graph.nodes.some((node) => node.id === focus))
    includedIds.add(focus);
  for (const edge of edges) {
    includedIds.add(edge.from);
    includedIds.add(edge.to);
  }
  return {
    nodes: graph.nodes.filter((node) => includedIds.has(node.id)),
    edges
  };
}
function dotString(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/\r/g, "\\n").replace(/\n/g, "\\n").replace(/"/g, "\\\"")}"`;
}
var GRAPH_NODE_STYLES = {
  accepted: { fill: "#FFFFFF", stroke: "#50709B", text: "#2B2826" },
  proposed: { fill: "#F6F6F5", stroke: "#C45D45", text: "#2B2826" },
  draft: { fill: "#F6F6F5", stroke: "#D8D3CE", text: "#2B2826" },
  rejected: { fill: "#FFFFFF", stroke: "#8F3F2F", text: "#8F3F2F" },
  superseded: { fill: "#F6F6F5", stroke: "#6B6661", text: "#6B6661" },
  deprecated: { fill: "#FFFFFF", stroke: "#C45D45", text: "#6B6661" }
};
var DEFAULT_DOT_NODE_STYLE = {
  fill: "#F6F6F5",
  stroke: "#D8D3CE",
  text: "#2B2826"
};
function dotEdgeAttributes(kind) {
  switch (kind) {
    case "supersedes":
      return 'color="#C45D45", fontcolor="#8F3F2F", penwidth="2.0"';
    case "relatesTo":
      return 'color="#50709B", fontcolor="#50709B", style="dashed"';
    case "conflictsWith":
      return 'color="#8F3F2F", fontcolor="#8F3F2F", style="dotted", penwidth="2.0"';
  }
}
function renderDotGraph(graph) {
  const lines = [
    "digraph adr {",
    "  rankdir=LR;",
    '  graph [bgcolor="transparent", pad="0.25", nodesep="0.35", ranksep="0.75", outputorder="edgesfirst"];',
    '  node [shape="box", style="rounded,filled", fontname="Helvetica", fontsize="10", margin="0.14,0.08"];',
    '  edge [fontname="Helvetica", fontsize="9", arrowsize="0.7"];'
  ];
  for (const node of graph.nodes) {
    const nodeStyle = Object.hasOwn(GRAPH_NODE_STYLES, node.status) ? GRAPH_NODE_STYLES[node.status] : DEFAULT_DOT_NODE_STYLE;
    lines.push(`  ${dotString(node.id)} [label=${dotString(`${node.id} [${node.status}]
${node.title}`)}, status=${dotString(node.status)}, fillcolor=${dotString(nodeStyle.fill)}, color=${dotString(nodeStyle.stroke)}, fontcolor=${dotString(nodeStyle.text)}];`);
  }
  for (const edge of graph.edges) {
    lines.push(`  ${dotString(edge.from)} -> ${dotString(edge.to)} [label=${dotString(edge.kind)}, ${dotEdgeAttributes(edge.kind)}];`);
  }
  lines.push("}");
  return `${lines.join(`
`)}
`;
}
function renderJsonGraph(graph) {
  return `${JSON.stringify(graph, null, 2)}
`;
}
function mermaidClassDefinitions() {
  return [
    ...Object.entries(GRAPH_NODE_STYLES).map(([status, style]) => `  classDef ${status} fill:${style.fill},stroke:${style.stroke},color:${style.text};`),
    `  classDef unknown fill:${DEFAULT_DOT_NODE_STYLE.fill},stroke:${DEFAULT_DOT_NODE_STYLE.stroke},color:${DEFAULT_DOT_NODE_STYLE.text};`
  ];
}
function mermaidLabel(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r\n?/g, `
`).replace(/\n/g, "<br/>");
}
function mermaidClass(status) {
  return Object.hasOwn(GRAPH_NODE_STYLES, status) ? status : "unknown";
}
function mermaidEdge(edge, from, to) {
  switch (edge.kind) {
    case "supersedes":
      return `  ${from} -->|supersedes| ${to}`;
    case "relatesTo":
      return `  ${from} -.->|relatesTo| ${to}`;
    case "conflictsWith":
      return `  ${from} ==>|conflictsWith| ${to}`;
  }
}
function renderMermaidGraph(graph) {
  const nodeNames = new Map(graph.nodes.map((node, index) => [node.id, `n${index}`]));
  const lines = ["flowchart LR"];
  for (const node of graph.nodes) {
    const name = nodeNames.get(node.id);
    lines.push(`  ${name}["${mermaidLabel(`${node.id} [${node.status}]
${node.title}`)}"]:::${mermaidClass(node.status)}`);
  }
  for (const edge of graph.edges) {
    const from = nodeNames.get(edge.from);
    const to = nodeNames.get(edge.to);
    if (from && to)
      lines.push(mermaidEdge(edge, from, to));
  }
  lines.push(...mermaidClassDefinitions());
  return `${lines.join(`
`)}
`;
}
// ../../../oss/adrkit/packages/core/src/markers/scan.ts
var MARKER_HEADER_WINDOW_BYTES = 8192;
var MARKER_DECLARATION_FILE_CAP = 64;
var MARKER_TOKEN = "@adr";
var COMMENT_INTRODUCERS = [
  "//",
  "/*",
  "{/*",
  "*",
  "#",
  "--",
  ";",
  "%",
  "<!--",
  '"""',
  "'''"
];
var MARKDOWN_COMMENT_INTRODUCERS = ["{/*", "<!--"];
var MARKDOWN_EXTENSIONS = [".md", ".mdx", ".markdown"];
function isMarkdownPath(path) {
  const lower = path.toLowerCase();
  return MARKDOWN_EXTENSIONS.some((extension) => lower.endsWith(extension));
}
var FENCE_LINE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
function isRefChar(char) {
  return /[0-9A-Za-z:-]/.test(char);
}
function isSpace(char) {
  return char === " " || char === "\t";
}
function completeLinePrefix(source) {
  const lastNewline = Math.max(source.lastIndexOf(`
`), source.lastIndexOf("\r"));
  return lastNewline === -1 ? "" : source.slice(0, lastNewline + 1);
}
function completeLineByteExtent(bytes, limit) {
  for (let index = Math.min(limit, bytes.length) - 1;index >= 0; index -= 1) {
    const byte = bytes[index];
    if (byte === 10 || byte === 13)
      return index + 1;
  }
  return 0;
}
function dedicatedMarkerIndex(line, introducers) {
  let commentStart = 0;
  while (commentStart < line.length && isSpace(line[commentStart] ?? ""))
    commentStart += 1;
  for (const introducer of introducers) {
    if (!line.startsWith(introducer, commentStart))
      continue;
    let markerStart = commentStart + introducer.length;
    while (markerStart < line.length && isSpace(line[markerStart] ?? ""))
      markerStart += 1;
    if (line.startsWith(MARKER_TOKEN, markerStart))
      return markerStart;
  }
  return;
}
function readRefs(rest) {
  if (rest.length === 0 || !isSpace(rest[0] ?? ""))
    return [];
  const refs = [];
  let cursor = 0;
  for (;; ) {
    while (cursor < rest.length && isSpace(rest[cursor] ?? ""))
      cursor += 1;
    const start = cursor;
    while (cursor < rest.length && isRefChar(rest[cursor] ?? ""))
      cursor += 1;
    const token = rest.slice(start, cursor);
    if (!token || !AdrRef.safeParse(token).success)
      return refs;
    refs.push(token);
    let lookahead = cursor;
    while (lookahead < rest.length && isSpace(rest[lookahead] ?? ""))
      lookahead += 1;
    if (rest[lookahead] !== ",")
      return refs;
    cursor = lookahead + 1;
  }
}
function scanWindow(window, path) {
  const markers = [];
  let omittedMarkers = 0;
  const introducers = isMarkdownPath(path) ? MARKDOWN_COMMENT_INTRODUCERS : COMMENT_INTRODUCERS;
  let fence = null;
  const lines = window.text.split(/\r\n|[\r\n]/);
  for (const [index, line] of lines.entries()) {
    const content = index === 0 && line.charCodeAt(0) === 65279 ? line.slice(1) : line;
    const fenceMatch = FENCE_LINE.exec(content);
    if (fenceMatch) {
      const char = fenceMatch[1][0];
      const length = fenceMatch[1].length;
      const info = fenceMatch[2];
      if (fence) {
        if (char === fence.char && length >= fence.length && info.trim() === "")
          fence = null;
      } else if (!(char === "`" && info.includes("`"))) {
        fence = { char, length };
      }
      continue;
    }
    if (fence)
      continue;
    const markerStart = dedicatedMarkerIndex(content, introducers);
    if (markerStart === undefined)
      continue;
    for (const ref of readRefs(content.slice(markerStart + MARKER_TOKEN.length))) {
      if (markers.length < MARKER_DECLARATION_FILE_CAP) {
        const { id, log } = parseAdrRef(ref);
        markers.push({ path, ref, id, ...log ? { log } : {}, line: index + 1 });
      } else {
        omittedMarkers += 1;
      }
    }
  }
  return { markers, omittedMarkers, truncated: window.truncated };
}
function scanBoundedSourceMarkerWindow(source, path, truncated) {
  return scanWindow({ text: truncated ? completeLinePrefix(source) : source, truncated }, path);
}
// ../../../oss/adrkit/packages/core/src/markers/read.ts
import { constants, lstat, open as open2, realpath } from "node:fs/promises";
import { isAbsolute as isAbsolute3, relative as relative2, resolve as resolve4, sep as sep2 } from "node:path";

// ../../../oss/adrkit/packages/core/src/markers/pool.ts
async function mapConcurrent(items, concurrency, task) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      results[index] = await task(item, index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

// ../../../oss/adrkit/packages/core/src/markers/read.ts
var MARKER_SCAN_FILE_CAP = 3000;
var MARKER_SCAN_CONCURRENCY = 16;
var MARKER_DECLARATION_BATCH_CAP = 1e4;
function scanStateForError(error) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  return code === "ENOENT" || code === "ENOTDIR" ? "absent" : "unreadable";
}
function isInsideRoot(root, target) {
  const rel = relative2(root, target);
  return rel !== "" && !isAbsolute3(rel) && rel !== ".." && !rel.startsWith(`..${sep2}`);
}
async function lstatWithoutSymlink(root, target) {
  const segments = relative2(root, target).split(sep2);
  let current = root;
  let info;
  for (const segment of segments) {
    current = resolve4(current, segment);
    info = await lstat(current);
    if (info.isSymbolicLink())
      return;
  }
  return info;
}
function normalizeMarkerPath(path) {
  const forward = sep2 === "\\" ? path.replace(/\\/g, "/") : path;
  let start = 0;
  while (forward.startsWith("./", start))
    start += 2;
  return forward.slice(start);
}
async function prepareRoot(cwd) {
  const root = resolve4(cwd);
  try {
    return { root, realRoot: await realpath(root) };
  } catch (error) {
    return { root, errorState: scanStateForError(error) };
  }
}
function readFlags() {
  return constants.O_RDONLY | (typeof constants.O_NONBLOCK === "number" ? constants.O_NONBLOCK : 0);
}
async function readWithPreparedRoot(path, prepared) {
  const normalizedPath = normalizeMarkerPath(path);
  const refuse = (state) => ({
    path: normalizedPath,
    state,
    markers: [],
    truncated: false
  });
  if (prepared.errorState || !prepared.realRoot)
    return refuse(prepared.errorState ?? "unreadable");
  const candidate = resolve4(prepared.root, normalizedPath);
  if (isAbsolute3(normalizedPath) || !isInsideRoot(prepared.root, candidate))
    return refuse("out-of-tree");
  let handle;
  try {
    const link = await lstatWithoutSymlink(prepared.root, candidate);
    if (!link || !link.isFile())
      return refuse("unreadable");
    const target = resolve4(prepared.realRoot, relative2(prepared.root, candidate));
    if (!isInsideRoot(prepared.realRoot, target))
      return refuse("out-of-tree");
    handle = await open2(candidate, readFlags());
    const opened = await handle.stat();
    if (!opened.isFile())
      return refuse("unreadable");
    const buffer = new Uint8Array(MARKER_HEADER_WINDOW_BYTES + 1);
    let bytesRead = 0;
    while (bytesRead < buffer.length) {
      const chunk = await handle.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead);
      if (chunk.bytesRead === 0)
        break;
      bytesRead += chunk.bytesRead;
    }
    const truncated = bytesRead > MARKER_HEADER_WINDOW_BYTES;
    const scannedBytes = truncated ? completeLineByteExtent(buffer, MARKER_HEADER_WINDOW_BYTES) : bytesRead;
    const source = new TextDecoder().decode(buffer.subarray(0, scannedBytes));
    const scan = scanBoundedSourceMarkerWindow(source, normalizedPath, truncated);
    return {
      path: normalizedPath,
      state: "scanned",
      markers: scan.markers,
      ...scan.omittedMarkers > 0 ? { omittedMarkers: scan.omittedMarkers } : {},
      truncated: scan.truncated,
      scannedBytes,
      fileBytes: opened.size
    };
  } catch (error) {
    return refuse(scanStateForError(error));
  } finally {
    await handle?.close();
  }
}
async function readSourceMarkers(path, cwd = process.cwd()) {
  return readWithPreparedRoot(path, await prepareRoot(cwd));
}
async function readSourceMarkersBatch(paths, cwd = process.cwd()) {
  const candidates = [...new Set(paths.map(normalizeMarkerPath))].sort(compareCodeUnits);
  const selected = candidates.slice(0, MARKER_SCAN_FILE_CAP);
  const skippedPaths = candidates.slice(MARKER_SCAN_FILE_CAP);
  const prepared = selected.length > 0 ? await prepareRoot(cwd) : undefined;
  const scans = [];
  let remaining = MARKER_DECLARATION_BATCH_CAP;
  let perFileOmitted = 0;
  let batchOmitted = 0;
  if (prepared) {
    for (let offset = 0;offset < selected.length; offset += MARKER_SCAN_CONCURRENCY) {
      const paths = selected.slice(offset, offset + MARKER_SCAN_CONCURRENCY);
      const chunk = await mapConcurrent(paths, MARKER_SCAN_CONCURRENCY, (path) => readWithPreparedRoot(path, prepared));
      for (const scan of chunk) {
        perFileOmitted += scan.omittedMarkers ?? 0;
        const retained = scan.markers.slice(0, remaining);
        remaining -= retained.length;
        batchOmitted += scan.markers.length - retained.length;
        scans.push(retained.length === scan.markers.length ? scan : { ...scan, markers: retained });
      }
    }
  }
  const retained = MARKER_DECLARATION_BATCH_CAP - remaining;
  const omitted = perFileOmitted + batchOmitted;
  return {
    scans,
    skippedPaths,
    limit: MARKER_SCAN_FILE_CAP,
    totalCandidates: candidates.length,
    declarations: {
      total: retained + omitted,
      retained,
      omitted,
      perFileOmitted,
      batchOmitted,
      perFileLimit: MARKER_DECLARATION_FILE_CAP,
      batchLimit: MARKER_DECLARATION_BATCH_CAP
    }
  };
}
// ../../../oss/adrkit/packages/core/src/check/decisions.ts
function toGoverningDecisions(records, matches) {
  const byId = new Map(records.map((record) => [record.frontmatter.id, record]));
  return matches.map((match) => {
    const frontmatter = byId.get(match.recordId)?.frontmatter;
    const status = frontmatter?.status ?? "draft";
    return {
      recordId: match.recordId,
      title: frontmatter?.title ?? "",
      status,
      bucket: decisionBucketFor(status),
      ...frontmatter?.supersededBy ? { supersededBy: frontmatter.supersededBy } : {},
      firedMatchers: match.firedMatchers
    };
  });
}
function bucketDecisions(decisions) {
  const buckets = { governing: [], activeProposals: [], history: [] };
  for (const decision of decisions)
    buckets[decision.bucket].push(decision);
  return buckets;
}

// ../../../oss/adrkit/packages/core/src/temporal/window.ts
function decisionWindowFor(record, byId) {
  const opensOn = record.frontmatter.date;
  if (record.frontmatter.status !== "superseded")
    return { opensOn, closesOn: null };
  const successorId = record.frontmatter.supersededBy;
  const successor = successorId ? byId.get(successorId) : undefined;
  if (!successor)
    return { opensOn, closesOn: null };
  return { opensOn, closesOn: successor.frontmatter.date, closedBy: successor.frontmatter.id };
}
function isInvertedWindow(window) {
  return window.closesOn !== null && window.closesOn < window.opensOn;
}
function standingAsOf(status, window, asOf) {
  if (asOf < window.opensOn)
    return "notYetRecorded";
  switch (status) {
    case "accepted":
      return "governing";
    case "superseded":
      return window.closesOn === null || asOf < window.closesOn ? "governing" : "history";
    case "deprecated":
      return "undetermined";
    case "rejected":
      return "history";
    default:
      return "activeProposals";
  }
}
function wasGoverningAsOf(record, byId, asOf) {
  return standingAsOf(record.frontmatter.status, decisionWindowFor(record, byId), asOf) === "governing";
}

// ../../../oss/adrkit/packages/core/src/markers/resolve.ts
function danglingFinding(marker) {
  return {
    rule: "dangling-marker",
    severity: "warn",
    message: `Source marker "@adr ${marker.ref}" in ${marker.path}:${marker.line} does not resolve to a record in the corpus`,
    path: marker.path,
    field: "marker",
    pattern: marker.ref
  };
}
function unresolvableFinding(marker) {
  return {
    rule: "marker-unresolvable",
    severity: "info",
    message: `Source marker "@adr ${marker.ref}" in ${marker.path}:${marker.line} names another decision log and is inert against this corpus`,
    path: marker.path,
    field: "marker",
    pattern: marker.ref
  };
}
function terminalLiveSuccessor(record, byId) {
  let next = record.frontmatter.supersededBy;
  const seen = new Set([record.frontmatter.id]);
  while (next) {
    if (seen.has(next))
      return;
    seen.add(next);
    const successor = byId.get(next);
    if (!successor)
      return;
    if (successor.frontmatter.status === "accepted")
      return successor.frontmatter.id;
    if (successor.frontmatter.status === "draft" || successor.frontmatter.status === "proposed") {
      return successor.frontmatter.id;
    }
    if (successor.frontmatter.status !== "superseded")
      return;
    next = successor.frontmatter.supersededBy;
  }
  return;
}
function staleFinding(marker, record, byId, asOf) {
  const status = record.frontmatter.status;
  if (status !== "superseded" && status !== "rejected" && status !== "deprecated") {
    return;
  }
  if (asOf !== undefined && wasGoverningAsOf(record, byId, asOf))
    return;
  const successor = status === "superseded" ? terminalLiveSuccessor(record, byId) : undefined;
  const action = successor ? `update it to "@adr ${successor}" or re-affirm ${marker.id}` : `update the marker or re-affirm ${marker.id}`;
  return {
    rule: "stale-marker",
    severity: "warn",
    message: `Source marker "@adr ${marker.ref}" in ${marker.path}:${marker.line} names ${status} ADR ${marker.id}; ${action}`,
    path: marker.path,
    field: "marker",
    pattern: marker.ref
  };
}
function compareDeclarations(a, b) {
  return compareCodeUnits(a.path, b.path) || a.line - b.line || compareCodeUnits(a.ref, b.ref);
}
function resolveSourceMarkers(input) {
  const byId = new Map(input.records.map((record) => [record.frontmatter.id, record]));
  const byRecord = new Map;
  const findings = [];
  const seen = new Set;
  for (const marker of input.markers) {
    const key = `${marker.path}\x00${marker.line}\x00${marker.ref}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    if (marker.log) {
      findings.push(unresolvableFinding(marker));
      continue;
    }
    const record = byId.get(marker.id);
    if (!record) {
      findings.push(danglingFinding(marker));
      continue;
    }
    const stale = staleFinding(marker, record, byId, input.asOf);
    if (stale)
      findings.push(stale);
    const declarations = byRecord.get(marker.id) ?? [];
    declarations.push({ path: marker.path, line: marker.line, ref: marker.ref });
    byRecord.set(marker.id, declarations);
  }
  const matches = [...byRecord.entries()].map(([recordId, declaredBy]) => ({ recordId, declaredBy: declaredBy.sort(compareDeclarations) })).sort((a, b) => compareCodeUnits(a.recordId, b.recordId));
  return { matches, findings: sortFindings(findings) };
}
function mergeSourceDeclarations(patternDecisions, records, markerMatches) {
  if (markerMatches.length === 0)
    return [...patternDecisions];
  const pending = new Map(markerMatches.map((match) => [match.recordId, match.declaredBy]));
  const merged = patternDecisions.map((decision) => {
    const declaredBy = pending.get(decision.recordId);
    if (!declaredBy)
      return decision;
    pending.delete(decision.recordId);
    return { ...decision, declaredBy };
  });
  const markerOnly = toGoverningDecisions(records, [...pending.keys()].map((recordId) => ({ recordId, firedMatchers: [] }))).map((decision) => ({ ...decision, declaredBy: pending.get(decision.recordId) ?? [] }));
  return [...merged, ...markerOnly].sort((a, b) => compareCodeUnits(a.recordId, b.recordId));
}
// ../../../oss/adrkit/packages/core/src/check/index.ts
import { sep as sep3 } from "node:path";
var RECORD_BASENAME = /^\d{4,}-.+\.md$/;
var TEMPLATE_BASENAME = "0000-template.md";
function normalizeDir(dir) {
  const forward = toForwardSlash(dir ?? "docs/adr");
  let end = forward.length;
  while (end > 0 && forward.charCodeAt(end - 1) === 47)
    end -= 1;
  const stripped = forward.slice(0, end);
  return stripped === "." ? "" : stripped;
}
function toForwardSlash(path) {
  return sep3 === "\\" ? path.replace(/\\/g, "/") : path;
}
function isCorpusRecordPath(file, dir) {
  const prefix = dir ? `${dir}/` : "";
  if (!file.startsWith(prefix))
    return false;
  const rest = file.slice(prefix.length);
  if (rest.length === 0 || rest.includes("/"))
    return false;
  return rest !== TEMPLATE_BASENAME && RECORD_BASENAME.test(rest);
}
function uniqueSorted(values) {
  return [...new Set(values)].sort(compareCodeUnits);
}
function markerScanReport(batch) {
  const absentPaths = [];
  const unreadablePaths = [];
  const outOfTreePaths = [];
  const truncatedPaths = [];
  let scanned = 0;
  const retained = batch.scans.reduce((total, scan) => total + scan.markers.length, 0);
  const perFileOmitted = batch.scans.reduce((total, scan) => total + (scan.omittedMarkers ?? 0), 0);
  const declarations = batch.declarations ?? {
    total: retained + perFileOmitted,
    retained,
    omitted: perFileOmitted,
    perFileOmitted,
    batchOmitted: 0,
    perFileLimit: MARKER_DECLARATION_FILE_CAP,
    batchLimit: MARKER_DECLARATION_BATCH_CAP
  };
  for (const scan of batch.scans) {
    if (scan.state === "scanned")
      scanned += 1;
    if (scan.state === "absent")
      absentPaths.push(scan.path);
    if (scan.state === "unreadable")
      unreadablePaths.push(scan.path);
    if (scan.state === "out-of-tree")
      outOfTreePaths.push(scan.path);
    if (scan.truncated)
      truncatedPaths.push(scan.path);
  }
  return {
    totalCandidates: batch.totalCandidates,
    limit: batch.limit,
    counts: {
      scanned,
      absent: absentPaths.length,
      unreadable: unreadablePaths.length,
      "out-of-tree": outOfTreePaths.length,
      truncated: truncatedPaths.length,
      skipped: batch.skippedPaths.length
    },
    absentPaths: absentPaths.sort(compareCodeUnits),
    unreadablePaths: unreadablePaths.sort(compareCodeUnits),
    outOfTreePaths: outOfTreePaths.sort(compareCodeUnits),
    truncatedPaths: truncatedPaths.sort(compareCodeUnits),
    skippedPaths: [...batch.skippedPaths].sort(compareCodeUnits),
    declarations
  };
}
function cappedScanFinding(report) {
  if (report.skippedPaths.length === 0)
    return;
  const shown = report.skippedPaths.slice(0, 10);
  const remaining = report.skippedPaths.length - shown.length;
  const suffix = remaining > 0 ? `, and ${remaining} more (see markerScan.skippedPaths)` : "";
  return {
    rule: "marker-scan-capped",
    severity: "warn",
    message: `Marker scan reached the ${report.limit}-file cap and skipped ${shown.join(", ")}${suffix}`,
    field: "marker"
  };
}
function cappedDeclarationsFinding(report) {
  const declarations = report.declarations;
  if (declarations.omitted === 0)
    return;
  return {
    rule: "marker-declarations-capped",
    severity: "warn",
    message: `Marker scan retained ${declarations.retained} of ${declarations.total} declarations; ` + `omitted ${declarations.perFileOmitted} at the ${declarations.perFileLimit}-per-file cap ` + `and ${declarations.batchOmitted} at the ${declarations.batchLimit}-per-batch cap ` + "(see markerScan.declarations)",
    field: "marker"
  };
}
function checkChanges(input) {
  const dir = normalizeDir(input.dir);
  const changedFiles = uniqueSorted(input.changedFiles.map(toForwardSlash));
  const changedRecords = changedFiles.filter((file) => isCorpusRecordPath(file, dir));
  const changedRecordSet = new Set(changedRecords);
  const resolution = resolveAffects({
    records: input.lint.records,
    changedFiles,
    snapshots: input.snapshots,
    ...input.member ? { member: input.member } : {}
  });
  const markerResolution = input.markerScans ? resolveSourceMarkers({
    records: input.lint.records,
    markers: input.markerScans.scans.flatMap((scan) => scan.markers)
  }) : { matches: [], findings: [] };
  const governedBy = mergeSourceDeclarations(toGoverningDecisions(input.lint.records, resolution.matches), input.lint.records, markerResolution.matches);
  const buckets = bucketDecisions(governedBy);
  const changedRecordFindings = input.lint.findings.filter((finding) => finding.path !== undefined && changedRecordSet.has(finding.path) && !(input.member !== undefined && finding.rule === AFFECTS_REPO_NOT_APPLICABLE));
  const markerScan = input.markerScans ? markerScanReport(input.markerScans) : undefined;
  const capped = markerScan ? cappedScanFinding(markerScan) : undefined;
  const cappedDeclarations = markerScan ? cappedDeclarationsFinding(markerScan) : undefined;
  const findings = sortFindings([
    ...resolution.findings,
    ...markerResolution.findings,
    ...capped ? [capped] : [],
    ...cappedDeclarations ? [cappedDeclarations] : [],
    ...changedRecordFindings
  ]);
  const ok = !changedRecordFindings.some((finding) => finding.severity === "error");
  return {
    changedFiles,
    governedBy,
    governing: buckets.governing,
    activeProposals: buckets.activeProposals,
    history: buckets.history,
    changedRecords,
    findings,
    ...markerScan ? { markerScan } : {},
    ok
  };
}
// ../../../oss/adrkit/packages/core/src/import/index.ts
import { access, readFile as readFile3, rename, writeFile as writeFile2 } from "node:fs/promises";
import { basename as basename4, dirname as dirname2, isAbsolute as isAbsolute5, join as join3, resolve as resolve6 } from "node:path";

// ../../../oss/adrkit/packages/core/src/import/classify.ts
function importedMadrSourceRef(record) {
  const importedFrom = record.frontmatter.provenance?.importedFrom;
  if (importedFrom?.sourceKind !== "madr")
    return;
  return importedFrom.sourceRef;
}
function classifyReimport(sourceEntries, existingRecords, recordEdited = () => false) {
  const recordsBySourceRef = new Map;
  for (const record of [...existingRecords].sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id))) {
    const sourceRef = importedMadrSourceRef(record);
    if (sourceRef && !recordsBySourceRef.has(sourceRef)) {
      recordsBySourceRef.set(sourceRef, record);
    }
  }
  return [...sourceEntries].sort((a, b) => a.sourceRef.localeCompare(b.sourceRef)).map((entry) => {
    const record = recordsBySourceRef.get(entry.sourceRef);
    if (!record)
      return { sourceRef: entry.sourceRef, bucket: "new" };
    const storedFingerprint = record.frontmatter.provenance?.importedFrom?.fingerprint;
    if (storedFingerprint === entry.fingerprint) {
      return { sourceRef: entry.sourceRef, bucket: "unchanged", recordId: record.frontmatter.id };
    }
    return {
      sourceRef: entry.sourceRef,
      bucket: recordEdited(record.frontmatter.id) ? "diverged" : "updated",
      recordId: record.frontmatter.id
    };
  });
}

// ../../../oss/adrkit/packages/core/src/import/fingerprint.ts
import { createHash } from "node:crypto";
function normalizeSourceBody(sourceBody) {
  const normalizedLines = sourceBody.replace(/\r\n/g, `
`).replace(/\r/g, `
`);
  return `${normalizedLines.replace(/\n*$/g, "")}
`;
}
function fingerprintSourceBody(sourceBody) {
  return createHash("sha256").update(normalizeSourceBody(sourceBody), "utf8").digest("hex");
}

// ../../../oss/adrkit/packages/core/src/import/madr.ts
import { readdir as readdir2, readFile as readFile2 } from "node:fs/promises";
import { basename as basename3, isAbsolute as isAbsolute4, join as join2, resolve as resolve5 } from "node:path";
function isPlainRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function firstLine(source) {
  const lineEnd = source.indexOf(`
`);
  const line = lineEnd === -1 ? source : source.slice(0, lineEnd);
  return line.endsWith("\r") ? line.slice(0, -1) : line;
}
function extractMadrTitle(frontmatter, body) {
  const frontmatterTitle = frontmatter.title;
  if (typeof frontmatterTitle === "string" && frontmatterTitle.trim().length > 0) {
    return frontmatterTitle.trim();
  }
  const heading = /^#\s+(.+?)\s*#*\s*$/m.exec(body);
  const title = heading?.[1]?.trim();
  return title && title.length > 0 ? title : undefined;
}
function headerRegion(body) {
  const heading = /^##[^\n]*$/m.exec(body);
  return heading?.index === undefined ? body : body.slice(0, heading.index);
}
var MAX_FIELD_VALUE_LENGTH = 512;
function cleanFieldValue(value) {
  return value.slice(0, MAX_FIELD_VALUE_LENGTH).replace(/`/g, "").replace(/\*\*|__/g, "").replace(/\[([^[\]]*)\]\([^()]*\)/g, "$1").replace(/^[[<]+|[\]>]+$/g, "").replace(/[.,;]+$/, "").trim();
}
function headerBulletValue(region, field) {
  const pattern = new RegExp(`^[ \\t]*(?:[*+-][ \\t]+)?\\*{0,2}_{0,2}${field}_{0,2}\\*{0,2}[ \\t]*:[ \\t]*(.+)$`, "im");
  const value = cleanFieldValue(pattern.exec(region)?.[1] ?? "");
  return value.length > 0 ? value : undefined;
}
function sectionValue(body, field) {
  const heading = new RegExp(`^#{2,6}[ \\t]+${field}[ \\t]*#*[ \\t]*$`, "im").exec(body);
  if (!heading)
    return;
  const rest = body.slice(heading.index + heading[0].length);
  for (const line of rest.split(`
`)) {
    if (/^#{1,6}[ \t]/.test(line))
      break;
    const value = cleanFieldValue(line);
    if (value.length > 0)
      return value;
  }
  return;
}
var IDENTITY_PATTERN = /^(@[A-Za-z0-9-]+|team:[a-z0-9-]+|[^@\s]+@[^@\s]+\.[^@\s]+)$/;
function parseDeciders(value) {
  if (!value)
    return { identities: [], unmapped: [] };
  const identities = [];
  const unmapped = [];
  for (const entry of value.split(/[,;]|\s+and\s+/).map((part) => part.trim())) {
    if (entry.length === 0)
      continue;
    if (IDENTITY_PATTERN.test(entry))
      identities.push(entry);
    else
      unmapped.push(entry);
  }
  return { identities: [...new Set(identities)], unmapped: [...new Set(unmapped)] };
}
function extractMadrBodyFields(body) {
  const region = headerRegion(body);
  const status = headerBulletValue(region, "status") ?? sectionValue(body, "status");
  const date = headerBulletValue(region, "date") ?? sectionValue(body, "date");
  const deciders = parseDeciders(headerBulletValue(region, "deciders") ?? sectionValue(body, "deciders"));
  return {
    ...status !== undefined ? { status } : {},
    ...date !== undefined ? { date } : {},
    ...deciders.identities.length > 0 ? { deciders: deciders.identities } : {},
    ...deciders.unmapped.length > 0 ? { decidersUnmapped: deciders.unmapped } : {}
  };
}
function notMadr(path, absolutePath, reason) {
  return { kind: "not-madr", path, absolutePath, reason };
}
async function readMadrFile(path, cwd = process.cwd()) {
  const absolutePath = isAbsolute4(path) ? path : resolve5(cwd, path);
  const displayPath = normalizeDisplayPath(absolutePath, cwd);
  const source = await readFile2(absolutePath, "utf8");
  const hasLeadingFence = firstLine(source) === "---";
  if (hasLeadingFence) {
    try {
      const parsed = parseFrontmatter(source);
      const frontmatter = isPlainRecord(parsed.data) ? parsed.data : {};
      return {
        kind: "madr",
        path: displayPath,
        absolutePath,
        frontmatter,
        body: parsed.body,
        source,
        title: extractMadrTitle(frontmatter, parsed.body),
        bodyFields: extractMadrBodyFields(parsed.body)
      };
    } catch (error) {
      const reason = error instanceof FrontmatterError ? error.message : String(error);
      return notMadr(displayPath, absolutePath, reason);
    }
  }
  const title = extractMadrTitle({}, source);
  if (!title) {
    return notMadr(displayPath, absolutePath, "File has no leading YAML frontmatter or top-level title");
  }
  return {
    kind: "madr",
    path: displayPath,
    absolutePath,
    frontmatter: {},
    body: source,
    source,
    title,
    bodyFields: extractMadrBodyFields(source)
  };
}
async function discoverMarkdownFilesInDir(dir) {
  const entries = await readdir2(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join2(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await discoverMarkdownFilesInDir(path));
    } else if (entry.isFile() && entry.name.endsWith(".md") && !isConventionalNonRecordFileName(entry.name)) {
      files.push(path);
    }
  }
  return files;
}
async function discoverMadrCandidateFiles(dir = "docs/adr", cwd = process.cwd()) {
  const absoluteDir = isAbsolute4(dir) ? dir : resolve5(cwd, dir);
  const files = await discoverMarkdownFilesInDir(absoluteDir).catch(() => []);
  return files.sort((a, b) => normalizeDisplayPath(a, cwd).localeCompare(normalizeDisplayPath(b, cwd)));
}
function fileNameId(path) {
  return /^([0-9]{4,})-/.exec(basename3(path))?.[1];
}

// ../../../oss/adrkit/packages/core/src/import/status.ts
var MADR_RECOGNIZED_STATUSES = [
  "draft",
  "proposed",
  "accepted",
  "rejected",
  "superseded",
  "deprecated"
];
var STATUS_SET = new Set(MADR_RECOGNIZED_STATUSES);
function rawStatusText(status) {
  if (typeof status !== "string")
    return;
  const trimmed = status.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
function supersededByRef(normalized, context) {
  if (!/^superse(?:ded|des)\s+by\b/.test(normalized))
    return;
  const scraped = /\b(\d{4,})\b/.exec(normalized)?.[1];
  if (!scraped)
    return;
  const resolved = context.resolveSupersededRef?.(scraped);
  return resolved && resolved !== context.id ? resolved : undefined;
}
function mapMadrStatus(status, context) {
  const raw = rawStatusText(status);
  const normalized = raw?.toLowerCase();
  if (normalized && STATUS_SET.has(normalized)) {
    return { status: normalized, findings: [] };
  }
  if (normalized) {
    const ref = supersededByRef(normalized, context);
    if (ref)
      return { status: "superseded", supersededBy: ref, findings: [] };
  }
  return {
    status: "proposed",
    findings: [
      {
        rule: "import-status-unrecognized",
        severity: "warn",
        message: raw ? `MADR status "${raw}" is not recognized; using "proposed"` : 'MADR status is missing; using "proposed"',
        path: context.path,
        id: context.id,
        field: "status"
      }
    ]
  };
}

// ../../../oss/adrkit/packages/core/src/import/merge.ts
class MadrMergeError extends Error {
  findings;
  constructor(message, findings) {
    super(message);
    this.name = "MadrMergeError";
    this.findings = findings;
  }
}
var FALLBACKS = {
  deciders: [],
  consulted: [],
  informed: [],
  tags: [],
  scope: "component",
  reversibility: "unknown",
  blastRadius: "component",
  supersedes: [],
  relatesTo: [],
  conflictsWith: [],
  affects: [],
  assertions: [],
  externalRefs: [],
  complianceControls: []
};
var OPTIONAL_COPY_KEYS = [
  "created",
  "deciders",
  "consulted",
  "informed",
  "tags",
  "scope",
  "domain",
  "reversibility",
  "blastRadius",
  "supersedes",
  "supersededBy",
  "relatesTo",
  "conflictsWith",
  "affects",
  "assertions",
  "review",
  "evaluation",
  "externalRefs",
  "complianceControls",
  "reviewBy"
];
var OPTIONAL_REMOVE_KEYS = new Set([
  "created",
  "domain",
  "supersededBy",
  "review",
  "evaluation",
  "reviewBy"
]);
var FRONTMATTER_ORDER = [
  "schemaVersion",
  "id",
  "title",
  "status",
  "date",
  "created",
  "deciders",
  "consulted",
  "informed",
  "tags",
  "scope",
  "domain",
  "reversibility",
  "blastRadius",
  "supersedes",
  "supersededBy",
  "relatesTo",
  "conflictsWith",
  "affects",
  "assertions",
  "provenance",
  "review",
  "evaluation",
  "externalRefs",
  "complianceControls",
  "reviewBy"
];
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isValidId(value) {
  return typeof value === "string" && /^([0-9]{4,}|[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26})$/.test(value);
}
function isValidSchemaVersion(value) {
  return typeof value === "string" && /^\d+\.\d+\.\d+$/.test(value);
}
function dateFrom(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string")
    return;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed))
    return;
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return parsed.toISOString().slice(0, 10) === trimmed ? trimmed : undefined;
}
function titleFinding(path, id) {
  return {
    rule: "import-not-madr",
    severity: "warn",
    message: "MADR source is missing a usable title",
    path,
    id,
    field: "title"
  };
}
var EPOCH_DATE = "1970-01-01";
function missingDateFinding(path, id) {
  return {
    rule: "import-date-missing",
    severity: "warn",
    message: `MADR source declares no date; using "${EPOCH_DATE}" as a placeholder — backfill the real decision date`,
    path,
    id,
    field: "date"
  };
}
function unmappedDecidersFinding(unmapped, path, id) {
  const listed = unmapped.map((entry) => `"${entry}"`).join(", ");
  return {
    rule: "import-deciders-unmapped",
    severity: "warn",
    message: `MADR source declares deciders that are not valid identities and were not imported: ${listed} — rewrite them as @handle, team:slug, or an email address`,
    path,
    id,
    field: "deciders"
  };
}
function importedAtFrom(value) {
  if (!isRecord(value))
    return;
  const importedFrom = value.importedFrom;
  if (!isRecord(importedFrom))
    return;
  return typeof importedFrom.importedAt === "string" ? importedFrom.importedAt : undefined;
}
function provenanceFrom(raw, sourceRef, fingerprint) {
  const sourceProvenance = isRecord(raw.provenance) ? { ...raw.provenance } : {};
  const authoredBy = sourceProvenance.authoredBy;
  if (authoredBy !== "human" && authoredBy !== "agent" && authoredBy !== "agent-drafted") {
    sourceProvenance.authoredBy = "human";
  }
  const importedFrom = {
    sourceKind: "madr",
    sourceRef,
    fingerprint
  };
  const importedAt = importedAtFrom(sourceProvenance);
  if (importedAt)
    importedFrom.importedAt = importedAt;
  return {
    ...sourceProvenance,
    importedFrom
  };
}
function initialCandidate(options, findings) {
  const raw = options.source.frontmatter;
  const bodyFields = options.source.bodyFields ?? {};
  const id = isValidId(raw.id) ? raw.id : options.id;
  const title = options.source.title;
  if (!title || title.length < 3 || title.length > 120) {
    throw new MadrMergeError("MADR source is missing a usable title", [titleFinding(options.source.path, id)]);
  }
  const status = mapMadrStatus(raw.status ?? bodyFields.status, {
    path: options.source.path,
    id,
    ...options.resolveSupersededRef ? { resolveSupersededRef: options.resolveSupersededRef } : {}
  });
  findings.push(...status.findings);
  const candidate = {};
  for (const key of OPTIONAL_COPY_KEYS) {
    if (key in raw)
      candidate[key] = raw[key];
  }
  candidate.schemaVersion = isValidSchemaVersion(raw.schemaVersion) ? raw.schemaVersion : SCHEMA_VERSION;
  candidate.id = id;
  candidate.title = title;
  candidate.status = status.status;
  const date = dateFrom(raw.date) ?? dateFrom(raw.created) ?? dateFrom(bodyFields.date);
  if (date === undefined)
    findings.push(missingDateFinding(options.source.path, id));
  candidate.date = date ?? EPOCH_DATE;
  if (status.supersededBy !== undefined && candidate.supersededBy === undefined) {
    candidate.supersededBy = status.supersededBy;
  }
  if (!Array.isArray(candidate.deciders)) {
    if (bodyFields.deciders !== undefined)
      candidate.deciders = [...bodyFields.deciders];
    if (bodyFields.decidersUnmapped !== undefined) {
      findings.push(unmappedDecidersFinding(bodyFields.decidersUnmapped, options.source.path, id));
    }
  }
  for (const [key, value] of Object.entries(FALLBACKS)) {
    if (!(key in candidate) || candidate[key] === undefined || candidate[key] === null) {
      candidate[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  candidate.provenance = provenanceFrom(raw, options.sourceRef, options.fingerprint);
  return candidate;
}
function safeParseCandidate(candidate, sourcePath) {
  const working = { ...candidate };
  for (let attempt = 0;attempt < 20; attempt += 1) {
    const parsed = AdrFrontmatter.safeParse(working);
    if (parsed.success)
      return parsed.data;
    let changed = false;
    for (const issue of parsed.error.issues) {
      const top = issue.path[0];
      if (typeof top !== "string")
        continue;
      if (top in FALLBACKS) {
        const fallback = FALLBACKS[top];
        working[top] = Array.isArray(fallback) ? [...fallback] : fallback;
        changed = true;
        continue;
      }
      if (OPTIONAL_REMOVE_KEYS.has(top)) {
        delete working[top];
        changed = true;
        continue;
      }
      if (top === "provenance") {
        working.provenance = candidate.provenance;
        changed = true;
      }
    }
    if (!changed) {
      throw new MadrMergeError(`Migrated frontmatter for ${sourcePath} would not satisfy the adrkit schema`, parsed.error.issues.map((issue) => ({
        rule: "import-not-madr",
        severity: "warn",
        message: issue.message,
        path: sourcePath,
        id: typeof working.id === "string" ? working.id : undefined,
        field: issue.path.length > 0 ? issue.path.map(String).join(".") : "frontmatter"
      })));
    }
  }
  throw new MadrMergeError(`Unable to produce valid frontmatter for ${sourcePath}`, [
    {
      rule: "import-not-madr",
      severity: "warn",
      message: "Unable to produce valid frontmatter after removing invalid optional fields",
      path: sourcePath,
      id: typeof working.id === "string" ? working.id : undefined,
      field: "frontmatter"
    }
  ]);
}
function orderedObject(value, order) {
  const output = {};
  for (const key of order) {
    if (value[key] !== undefined)
      output[key] = value[key];
  }
  for (const key of Object.keys(value).sort()) {
    if (!(key in output) && value[key] !== undefined)
      output[key] = value[key];
  }
  return output;
}
function orderProvenance(provenance) {
  const output = {};
  for (const key of ["authoredBy", "agent", "ratifiedBy", "sourceArtifact"]) {
    if (provenance[key] !== undefined)
      output[key] = provenance[key];
  }
  if (provenance.importedFrom) {
    const importedFrom = {
      sourceKind: provenance.importedFrom.sourceKind,
      sourceRef: provenance.importedFrom.sourceRef,
      fingerprint: provenance.importedFrom.fingerprint
    };
    if (provenance.importedFrom.importedAt)
      importedFrom.importedAt = provenance.importedFrom.importedAt;
    output.importedFrom = importedFrom;
  }
  return output;
}
function orderedFrontmatter(frontmatter) {
  const raw = frontmatter;
  const output = orderedObject(raw, FRONTMATTER_ORDER);
  if (frontmatter.provenance)
    output.provenance = orderProvenance(frontmatter.provenance);
  return output;
}
function renderMigratedContent(frontmatter, body) {
  const yaml = $stringify(orderedFrontmatter(frontmatter), {
    lineWidth: 0,
    sortMapEntries: false
  }).trimEnd();
  return `---
${yaml}
---
${body}`;
}
function mergeMadr(options) {
  const findings = [];
  const candidate = initialCandidate(options, findings);
  const frontmatter = safeParseCandidate(candidate, options.source.path);
  return {
    frontmatter,
    content: renderMigratedContent(frontmatter, options.source.body),
    findings
  };
}
function recordFromMerge(result, source) {
  return {
    frontmatter: result.frontmatter,
    body: source.body,
    path: source.path
  };
}

// ../../../oss/adrkit/packages/core/src/import/index.ts
function toAbsolutePath2(path, cwd) {
  return isAbsolute5(path) ? path : resolve6(cwd, path);
}
async function pathExists(path) {
  return access(path).then(() => true, () => false);
}
function notMadrFinding(path, reason) {
  return {
    rule: "import-not-madr",
    severity: "warn",
    message: reason,
    path
  };
}
function undiscoverableFinding(path, id, reason) {
  return {
    rule: "import-undiscoverable",
    severity: "warn",
    message: `Migrated record is not discoverable: ${reason}. Until it is, lint, check, explain, graph, and queue will skip it`,
    path,
    id,
    field: "path"
  };
}
var UNDISCOVERABLE_FILENAME = "its filename does not match <id>-<slug>.md (four or more leading digits) — re-run with --rename, or rename it by hand";
var UNDISCOVERABLE_NESTED = "it is in a subdirectory of the corpus, and discovery reads only the top level of the corpus directory — move it up, or point --dir at its directory";
function discoverableFileName(id, title) {
  if (!title)
    return `${id}-record.md`;
  try {
    return `${id}-${slugifyTitle(title)}.md`;
  } catch {
    return `${id}-record.md`;
  }
}
async function existingRecordsFromFiles(files, cwd) {
  const records = [];
  for (const file of files) {
    const absolutePath = toAbsolutePath2(file, cwd);
    try {
      const source = await readFile3(absolutePath, "utf8");
      const parsed = parseFrontmatter(source);
      const frontmatter = AdrFrontmatter.safeParse(parsed.data);
      if (frontmatter.success) {
        records.push({
          frontmatter: frontmatter.data,
          body: parsed.body,
          path: normalizeDisplayPath(absolutePath, cwd)
        });
      }
    } catch {}
  }
  return records.sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id));
}
function recordById(records) {
  return new Map(records.map((record) => [record.frontmatter.id, record]));
}
function classifyBySourceRef(classifications) {
  return new Map(classifications.map((classification) => [classification.sourceRef, classification]));
}
function numericId(id) {
  return /^\d+$/.test(id) ? Number(id) : undefined;
}
function rawId2(source) {
  const id = source.frontmatter.id;
  return typeof id === "string" && /^([0-9]{4,}|[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26})$/.test(id) ? id : undefined;
}
function createIdAllocator(seed, usedIds) {
  const used = new Set(usedIds);
  let next = numericId(seed) ?? 1;
  return (source, classification) => {
    const existing = classification?.recordId;
    if (existing)
      return existing;
    const sourceId = rawId2(source);
    if (sourceId) {
      used.add(sourceId);
      return sourceId;
    }
    const fileId = fileNameId(source.absolutePath);
    if (fileId && !used.has(fileId)) {
      used.add(fileId);
      return fileId;
    }
    for (;; ) {
      const id = String(next).padStart(4, "0");
      next += 1;
      if (!used.has(id)) {
        used.add(id);
        return id;
      }
    }
  };
}
function importIncompleteRecords(records) {
  const seen = new Set;
  const unique = [];
  for (const record of records) {
    const key = `${record.frontmatter.id}\x00${record.path}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    unique.push(record);
  }
  return unique;
}
async function migrateMadr(input) {
  const cwd = input.cwd ?? process.cwd();
  const dir = input.dir ?? "docs/adr";
  const write = input.write !== false;
  const rename_ = input.rename === true;
  const files = input.files ? input.files.map((file) => toAbsolutePath2(file, cwd)).sort((a, b) => normalizeDisplayPath(a, cwd).localeCompare(normalizeDisplayPath(b, cwd))) : await discoverMadrCandidateFiles(dir, cwd);
  const findings = [];
  const results = [];
  const divergence = [];
  const prepared = [];
  for (const file of files) {
    const read = await readMadrFile(file, cwd);
    if (read.kind === "not-madr") {
      results.push({ path: read.path, outcome: "skipped" });
      findings.push(notMadrFinding(read.path, read.reason));
      continue;
    }
    const sourceRef = read.path;
    prepared.push({ source: read, sourceRef, fingerprint: fingerprintSourceBody(read.body) });
  }
  const existingRecords = input.existingRecords ?? await existingRecordsFromFiles(files, cwd);
  const classifications = classifyReimport(prepared.map((entry) => ({ sourceRef: entry.sourceRef, fingerprint: entry.fingerprint, path: entry.source.path })), existingRecords, input.recordEdited ?? (() => false));
  const classificationForSource = classifyBySourceRef(classifications);
  const existingById = recordById(existingRecords);
  const seed = await nextSequentialId(dir, cwd).catch(() => "0001");
  const allocateId = createIdAllocator(seed, [
    ...existingRecords.map((record) => record.frontmatter.id),
    ...prepared.map((entry) => rawId2(entry.source)).filter((id) => Boolean(id))
  ]);
  const recordsForIncomplete = [];
  const sorted = prepared.sort((a, b) => a.source.path.localeCompare(b.source.path));
  const writable = sorted.filter((entry) => {
    const bucket = classificationForSource.get(entry.sourceRef)?.bucket ?? "new";
    return bucket !== "diverged" && bucket !== "unchanged";
  });
  const allocatedIds = new Map(writable.map((entry) => [entry.sourceRef, allocateId(entry.source, classificationForSource.get(entry.sourceRef))]));
  const sourceNumberToId = new Map;
  for (const entry of sorted) {
    const declared = rawId2(entry.source) ?? fileNameId(entry.source.absolutePath);
    if (!declared || sourceNumberToId.has(declared))
      continue;
    const resolved = allocatedIds.get(entry.sourceRef) ?? classificationForSource.get(entry.sourceRef)?.recordId;
    if (resolved)
      sourceNumberToId.set(declared, resolved);
  }
  const resolveSupersededRef = (ref) => sourceNumberToId.get(ref);
  for (const entry of sorted) {
    const classification = classificationForSource.get(entry.sourceRef);
    const bucket = classification?.bucket ?? "new";
    if (bucket === "diverged") {
      results.push({ path: entry.source.path, outcome: "diverged" });
      divergence.push({ path: entry.source.path, sourceRef: entry.sourceRef });
      const existing = classification?.recordId ? existingById.get(classification.recordId) : undefined;
      if (existing)
        recordsForIncomplete.push(existing);
      continue;
    }
    if (bucket === "unchanged") {
      results.push({ path: entry.source.path, outcome: "unchanged" });
      const existing = classification?.recordId ? existingById.get(classification.recordId) : undefined;
      if (existing)
        recordsForIncomplete.push(existing);
      continue;
    }
    try {
      const id = allocatedIds.get(entry.sourceRef) ?? allocateId(entry.source, classification);
      const sourceDir = dirname2(entry.source.absolutePath);
      const isNested = resolve6(sourceDir) !== resolve6(toAbsolutePath2(dir, cwd));
      const targetAbsolutePath = join3(sourceDir, discoverableFileName(id, entry.source.title));
      const needsRename = !isNested && !isRecordFileName(basename4(entry.source.absolutePath));
      const targetTaken = targetAbsolutePath !== entry.source.absolutePath && await pathExists(targetAbsolutePath);
      const willRename = rename_ && needsRename && !targetTaken;
      const finalAbsolutePath = willRename ? targetAbsolutePath : entry.source.absolutePath;
      const finalPath = willRename ? normalizeDisplayPath(finalAbsolutePath, cwd) : entry.source.path;
      const merged = mergeMadr({
        source: entry.source,
        id,
        sourceRef: finalPath,
        fingerprint: entry.fingerprint,
        resolveSupersededRef
      });
      findings.push(...merged.findings);
      const outcome = bucket === "updated" ? "updated" : "migrated";
      if (write && (merged.content !== entry.source.source || willRename)) {
        await writeFile2(entry.source.absolutePath, merged.content, "utf8");
        if (willRename)
          await rename(entry.source.absolutePath, finalAbsolutePath);
      }
      if (isNested) {
        findings.push(undiscoverableFinding(entry.source.path, id, UNDISCOVERABLE_NESTED));
      } else if (needsRename && !willRename) {
        findings.push(undiscoverableFinding(entry.source.path, id, UNDISCOVERABLE_FILENAME));
      }
      results.push({
        path: entry.source.path,
        outcome,
        frontmatter: merged.frontmatter,
        ...willRename ? { renamedTo: finalPath } : {}
      });
      recordsForIncomplete.push({ ...recordFromMerge(merged, entry.source), path: finalPath });
    } catch (error) {
      if (error instanceof MadrMergeError) {
        results.push({ path: entry.source.path, outcome: "skipped" });
        findings.push(...error.findings);
        continue;
      }
      throw error;
    }
  }
  findings.push(...validateImportIncomplete(importIncompleteRecords(recordsForIncomplete)));
  return {
    results: results.sort((a, b) => a.path.localeCompare(b.path)),
    divergence: divergence.sort((a, b) => a.path.localeCompare(b.path) || a.sourceRef.localeCompare(b.sourceRef)),
    findings: sortFindings(findings)
  };
}
// ../../../oss/adrkit/packages/core/src/fingerprint/index.ts
import { createHash as createHash2 } from "node:crypto";
function canonicalStringify(value) {
  if (value === null || value === undefined)
    return "null";
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value))
    return `[${value.map(canonicalStringify).join(",")}]`;
  if (typeof value === "object") {
    const record = value;
    const keys = Object.keys(record).filter((key) => record[key] !== undefined).sort(compareCodeUnits);
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(record[key])}`).join(",")}}`;
  }
  return "null";
}
function fingerprintOf(records, corpusFindings, recordCount, excludedCount) {
  const projection = {
    records: records.map((record) => ({ sourcePath: record.path, frontmatter: record.frontmatter, body: record.body })),
    corpusFindings,
    corpusHealth: { recordCount, excludedCount }
  };
  return createHash2("sha256").update(canonicalStringify(projection), "utf8").digest("hex");
}
// ../../../oss/adrkit/packages/core/src/temporal/decisions.ts
var EMPTY_WINDOW = { opensOn: "", closesOn: null };
function undeterminedFinding(decision, asOf) {
  return {
    rule: "temporal-window-undetermined",
    severity: "warn",
    id: decision.recordId,
    field: "status",
    message: `ADR ${decision.recordId} is deprecated and records no date it stopped governing, ` + `so whether it governed on ${asOf} cannot be determined from the corpus`
  };
}
function openWindowFinding(decision) {
  return {
    rule: "temporal-window-open",
    severity: "info",
    id: decision.recordId,
    field: "supersededBy",
    ...decision.supersededBy ? { pattern: decision.supersededBy } : {},
    message: `ADR ${decision.recordId} is superseded by ${decision.supersededBy ?? "an unnamed record"}, ` + "which this corpus does not have, so its window has no close date and is treated as open"
  };
}
function invertedWindowFinding(decision, window) {
  return {
    rule: "temporal-window-inverted",
    severity: "warn",
    id: decision.recordId,
    field: "date",
    message: `ADR ${decision.recordId} opens on ${window.opensOn} but its successor ` + `${window.closedBy ?? "record"} is dated ${window.closesOn}, so it has no date on which ` + "it governed; fix one of the two dates"
  };
}
function resolveDecisionsAsOf(input) {
  const byId = new Map(input.records.map((record) => [record.frontmatter.id, record]));
  const findings = [];
  const view = {
    date: input.asOf,
    governing: [],
    activeProposals: [],
    history: [],
    notYetRecorded: [],
    undetermined: [],
    findings: []
  };
  for (const decision of input.decisions) {
    const record = byId.get(decision.recordId);
    if (!record) {
      view.undetermined.push({ ...decision, window: EMPTY_WINDOW, standing: "undetermined" });
      findings.push({
        rule: "temporal-window-undetermined",
        severity: "warn",
        id: decision.recordId,
        message: `ADR ${decision.recordId} is not in the corpus, so it cannot be placed on ${input.asOf}`
      });
      continue;
    }
    const window = decisionWindowFor(record, byId);
    const standing = standingAsOf(record.frontmatter.status, window, input.asOf);
    view[standing].push({ ...decision, window, standing });
    if (standing === "undetermined")
      findings.push(undeterminedFinding(decision, input.asOf));
    if (record.frontmatter.status === "superseded") {
      if (window.closesOn === null)
        findings.push(openWindowFinding(decision));
      else if (isInvertedWindow(window))
        findings.push(invertedWindowFinding(decision, window));
    }
  }
  for (const key of ["governing", "activeProposals", "history", "notYetRecorded", "undetermined"]) {
    view[key].sort((a, b) => compareCodeUnits(a.recordId, b.recordId));
  }
  view.findings = sortFindings(findings);
  return view;
}
// ../../../oss/adrkit/packages/core/src/schema/identity.ts
function identityKey(identity) {
  return identity.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
}
function sameIdentity(a, b) {
  return identityKey(a) === identityKey(b);
}
function distinctIdentityCount(identities) {
  return new Set(identities.map(identityKey)).size;
}
var INVISIBLE_OR_CONTROL = /[\p{Cc}\p{Cf}]/u;
var JOINERS = /[\u200c\u200d]/gu;
function isWritableIdentity(identity) {
  if (!Identity.safeParse(identity).success)
    return false;
  const email = !identity.startsWith("@") && !identity.startsWith("team:");
  return !INVISIBLE_OR_CONTROL.test(email ? identity.replace(JOINERS, "") : identity);
}
function hasInvisibleOrControl(text) {
  return INVISIBLE_OR_CONTROL.test(text) || /[\u2028\u2029]/.test(text);
}

// ../../../oss/adrkit/packages/core/src/queue/findings.ts
var ONE_WAY_DOOR_AUTO_MESSAGE = "one-way-door decisions may not take the auto-approve fast path (reversibility: one-way-door, review.tier: auto)";
var RULE_TO_CORPUS_CODE = {
  "file-read": "corpus.read-error",
  "frontmatter-parse": "corpus.parse-error",
  "frontmatter-fence": "corpus.parse-error",
  "one-way-door-disallows-auto": "corpus.one-way-door-auto-tier",
  "required-field": "corpus.schema-invalid",
  "invalid-type": "corpus.schema-invalid",
  "invalid-enum-value": "corpus.schema-invalid",
  "invalid-format": "corpus.schema-invalid",
  "invalid-size": "corpus.schema-invalid",
  "strict-unknown-key": "corpus.schema-invalid",
  "unique-items": "corpus.schema-invalid",
  "contract-refinement": "corpus.schema-invalid",
  "superseded-requires-supersededBy": "corpus.schema-invalid",
  "supersededBy-requires-superseded-status": "corpus.schema-invalid",
  "accepted-requires-decider-unless-imported": "corpus.schema-invalid",
  "agent-accepted-requires-ratifier": "corpus.schema-invalid",
  "corpus-file-skipped": "corpus.file-skipped"
};
var WARN_CORPUS_CODES = new Set(["corpus.file-skipped"]);
function messageFor(code, finding) {
  switch (code) {
    case "corpus.read-error":
      return `Cannot read file: ${finding.message}`;
    case "corpus.one-way-door-auto-tier":
      return ONE_WAY_DOOR_AUTO_MESSAGE;
    default:
      return finding.message;
  }
}
function mapFindingToCorpusFinding(finding, sourcePath) {
  const code = RULE_TO_CORPUS_CODE[finding.rule] ?? "corpus.schema-invalid";
  const severity = WARN_CORPUS_CODES.has(code) ? "warn" : "error";
  return { sourcePath, code, severity, message: messageFor(code, finding) };
}

// ../../../oss/adrkit/packages/core/src/queue/types.ts
var SLA_STATE_URGENCY_ORDER = {
  overdue: 0,
  escalated: 1,
  due: 2,
  "within-sla": 3,
  "missing-sla": 4,
  "not-queued": 5,
  decided: 6
};

// ../../../oss/adrkit/packages/core/src/queue/sort.ts
var SEVERITY_RANK = { error: 0, warn: 1, info: 2 };
function severityRank(severity) {
  return SEVERITY_RANK[severity] ?? Number.MAX_SAFE_INTEGER;
}
function compareNullableLast(a, b) {
  if (a === b)
    return 0;
  if (a === null)
    return 1;
  if (b === null)
    return -1;
  return compareCodeUnits(a, b);
}
function sortQueueItems(items) {
  return [...items].sort((a, b) => SLA_STATE_URGENCY_ORDER[a.slaState] - SLA_STATE_URGENCY_ORDER[b.slaState] || compareNullableLast(a.deadlineDate, b.deadlineDate) || compareCodeUnits(a.queuedAt ?? "", b.queuedAt ?? "") || compareCodeUnits(a.id, b.id) || compareCodeUnits(a.sourcePath, b.sourcePath));
}
function sortCorpusFindings(findings) {
  return [...findings].sort((a, b) => compareCodeUnits(a.sourcePath, b.sourcePath) || compareCodeUnits(a.code, b.code) || severityRank(a.severity) - severityRank(b.severity) || compareCodeUnits(a.message, b.message));
}
function sortItemFindings(findings) {
  return [...findings].sort((a, b) => compareCodeUnits(a.code, b.code) || severityRank(a.severity) - severityRank(b.severity) || compareCodeUnits(a.message, b.message));
}

// ../../../oss/adrkit/packages/core/src/queue/kernel.ts
var TIER_LABELS = {
  auto: "expedited routing; human acceptance required",
  async: "asynchronous human review",
  arb: "ARB human review"
};
var ITEM_MESSAGES = {
  tierAbsent: "review.tier is absent; routing tier cannot be determined — add review.tier: auto|async|arb to this record",
  decidersEmpty: "deciders is empty; routing targets cannot be determined — add at least one decider identity to this record"
};
function parseUtcDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid timestamp in ADR frontmatter: '${value}' is not a valid ISO date/datetime`);
  }
  return date;
}
function toUtcInstant(value) {
  return parseUtcDate(value).toISOString();
}
function toUtcCalendarDate(value) {
  return parseUtcDate(value).toISOString().slice(0, 10);
}
function addCalendarDays(date, days) {
  const base = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(base)) {
    throw new Error(`Invalid calendar date for SLA deadline computation: '${date}'`);
  }
  const result = new Date(base + days * 86400000);
  if (!Number.isFinite(result.getTime())) {
    throw new Error(`SLA deadline computation is out of range for '${date}' plus ${days} day(s)`);
  }
  return result.toISOString().slice(0, 10);
}
function normalizeSourcePath(path) {
  return path.replace(/\\/g, "/");
}
function tierLabelFor(tier) {
  return tier ? TIER_LABELS[tier] : null;
}
function computeDeadlineDate(frontmatter) {
  if (frontmatter.reviewBy != null)
    return frontmatter.reviewBy;
  const queuedAt = frontmatter.review?.queuedAt;
  const slaDays = frontmatter.review?.slaDays;
  if (queuedAt != null && slaDays != null) {
    return addCalendarDays(toUtcCalendarDate(queuedAt), slaDays);
  }
  return null;
}
function computeSlaState(frontmatter, deadlineDate, asOf) {
  const review = frontmatter.review;
  if (review?.decidedAt != null)
    return "decided";
  if (review?.escalatedAt != null)
    return "escalated";
  if (deadlineDate != null) {
    if (asOf > deadlineDate)
      return "overdue";
    if (asOf === deadlineDate)
      return "due";
    return "within-sla";
  }
  if (review?.queuedAt != null)
    return "missing-sla";
  return "not-queued";
}
function computeItemFindings(frontmatter) {
  const findings = [];
  const review = frontmatter.review;
  const queuedAt = review?.queuedAt;
  const enteredReview = review !== undefined || frontmatter.reviewBy != null;
  if (enteredReview && review?.tier == null) {
    findings.push({ code: "item.tier-absent", severity: "info", message: ITEM_MESSAGES.tierAbsent });
  }
  if (frontmatter.reviewBy != null && queuedAt != null) {
    const queuedAtDate = toUtcCalendarDate(queuedAt);
    if (compareCodeUnits(frontmatter.reviewBy, queuedAtDate) < 0) {
      findings.push({
        code: "item.review-by-before-queued",
        severity: "warn",
        message: `reviewBy (${frontmatter.reviewBy}) is before queuedAt (${queuedAtDate}); SLA deadline may be inconsistent`
      });
    }
  }
  const deciders = frontmatter.deciders ?? [];
  if (deciders.length === 0 && queuedAt != null) {
    findings.push({ code: "item.deciders-empty", severity: "info", message: ITEM_MESSAGES.decidersEmpty });
  }
  return sortItemFindings(findings);
}
function buildItem(frontmatter, sourcePath, asOf) {
  const review = frontmatter.review;
  const tier = review?.tier ?? null;
  const objections = review?.objections ?? [];
  const deadlineDate = computeDeadlineDate(frontmatter);
  return {
    id: frontmatter.id,
    title: frontmatter.title,
    sourcePath: normalizeSourcePath(sourcePath),
    tier,
    tierLabel: tierLabelFor(tier),
    queuedAt: review?.queuedAt != null ? toUtcInstant(review.queuedAt) : null,
    slaDays: review?.slaDays ?? null,
    reviewBy: frontmatter.reviewBy ?? null,
    slaState: computeSlaState(frontmatter, deadlineDate, asOf),
    deadlineDate,
    routingTargets: [...frontmatter.deciders ?? []],
    quorum: review?.quorum ?? null,
    approvalCount: distinctIdentityCount(review?.approvals ?? []),
    unresolvedObjectionCount: objections.filter((o) => o.resolved !== true).length,
    resolvedObjectionCount: objections.filter((o) => o.resolved === true).length,
    escalatedAt: review?.escalatedAt != null ? toUtcInstant(review.escalatedAt) : null,
    decidedAt: review?.decidedAt != null ? toUtcInstant(review.decidedAt) : null,
    itemFindings: computeItemFindings(frontmatter)
  };
}
function buildQueueReport(input) {
  const { corpus, asOf } = input;
  const recordPaths = new Set(corpus.records.map((record) => record.path));
  const excludedPaths = new Set(corpus.findings.filter((f) => (f.severity === "error" || f.rule === "corpus-file-skipped") && f.path != null && !recordPaths.has(f.path)).map((f) => f.path));
  const corpusFindings = sortCorpusFindings(corpus.findings.filter((f) => f.path != null && excludedPaths.has(f.path)).map((f) => mapFindingToCorpusFinding(f, normalizeSourcePath(f.path))));
  const items = sortQueueItems(corpus.records.filter((record) => record.frontmatter.status === "proposed").map((record) => buildItem(record.frontmatter, record.path, asOf)));
  const orderedRecords = [...corpus.records].sort((a, b) => compareCodeUnits(a.frontmatter.id, b.frontmatter.id) || compareCodeUnits(a.path, b.path));
  const corpusFingerprint = fingerprintOf(orderedRecords, sortFindingsCanonical(corpus.findings), corpus.records.length, corpus.checked - corpus.records.length);
  return {
    version: "1",
    asOf,
    corpusFingerprint,
    totalItems: items.length,
    totalCorpusFindings: corpusFindings.length,
    itemsWithFindings: items.filter((i) => i.itemFindings.length > 0).length,
    items,
    corpusFindings
  };
}
// ../../../oss/adrkit/packages/core/src/queue/format.ts
function formatQueueReportJson(report) {
  return `${JSON.stringify(report, null, 2)}
`;
}
function escapeCell(value) {
  return value.replace(/\r\n/g, `
`).replace(/\r/g, " ").replace(/\n/g, "<br>").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/`/g, "\\`");
}
function escapeBullet(value) {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|");
}
function normalizeHeading(value) {
  return value.replace(/\r\n/g, `
`).replace(/[\r\n]/g, " ");
}
function dash(value) {
  return value === null ? "-" : String(value);
}
function tierOverview(item) {
  return item.tier === null ? "(none)" : `${item.tier} (${item.tierLabel})`;
}
function objectionsCell(item) {
  return item.resolvedObjectionCount > 0 ? `${item.unresolvedObjectionCount} (${item.resolvedObjectionCount} resolved)` : String(item.unresolvedObjectionCount);
}
function corpusFindingsBlock(findings) {
  if (findings.length === 0)
    return null;
  const rows = findings.map((f) => `| \`${escapeCell(f.sourcePath)}\` | \`${escapeCell(f.code)}\` | ${f.severity} | ${escapeCell(f.message)} |`);
  return ["## Corpus Findings", "", "| Source Path | Code | Severity | Message |", "|-------------|------|----------|---------|", ...rows].join(`
`);
}
function overviewBlock(items) {
  if (items.length === 0)
    return ["## Queue Items", "", "*No proposed records found.*"].join(`
`);
  const rows = items.map((item, index) => {
    const approvals = `${item.approvalCount}/${item.quorum === null ? "-" : item.quorum}`;
    return `| ${index + 1} | \`${escapeCell(item.id)}\` | ${escapeCell(item.title)} | ${escapeCell(tierOverview(item))} | ${item.slaState} | ${dash(item.deadlineDate)} | ${approvals} | ${objectionsCell(item)} |`;
  });
  return [
    "## Queue Items",
    "",
    "| # | ID | Title | Tier | SLA State | Deadline | Approvals | Objections |",
    "|---|----|-------|------|-----------|----------|-----------|------------|",
    ...rows
  ].join(`
`);
}
function findingBullet(finding) {
  return `- \`${finding.code}\` (${finding.severity}): ${escapeBullet(finding.message)}`;
}
function detailBlock(item) {
  const rows = [
    `| Source | \`${escapeCell(item.sourcePath)}\` |`,
    `| Tier | ${item.tier === null ? "(none)" : escapeCell(item.tier)} |`,
    `| Tier Label | ${item.tierLabel === null ? "-" : escapeCell(item.tierLabel)} |`,
    `| SLA State | ${item.slaState} |`,
    `| Queued At | ${dash(item.queuedAt)} |`,
    `| SLA Days | ${dash(item.slaDays)} |`,
    `| Review By | ${dash(item.reviewBy)} |`,
    `| Deadline | ${dash(item.deadlineDate)} |`,
    `| Routing Targets | ${item.routingTargets.length > 0 ? escapeCell(item.routingTargets.join(", ")) : "-"} |`,
    `| Quorum | ${dash(item.quorum)} |`,
    `| Approvals | ${item.approvalCount} |`,
    `| Unresolved Objections | ${item.unresolvedObjectionCount} |`,
    `| Resolved Objections | ${item.resolvedObjectionCount} |`,
    `| Escalated At | ${dash(item.escalatedAt)} |`,
    `| Decided At | ${dash(item.decidedAt)} |`
  ];
  const table = [`### ${item.id} — ${normalizeHeading(item.title)}`, "", "| Field | Value |", "|-------|-------|", ...rows].join(`
`);
  if (item.itemFindings.length === 0)
    return table;
  const findings = ["#### Findings", "", ...item.itemFindings.map(findingBullet)].join(`
`);
  return `${table}

${findings}`;
}
function formatQueueReportMarkdown(report) {
  const blocks = [
    [
      `# ARB Queue — ${report.asOf}`,
      "",
      `Corpus fingerprint: \`${report.corpusFingerprint}\``,
      `${report.totalItems} item(s) | ${report.totalCorpusFindings} corpus finding(s) | ${report.itemsWithFindings} item(s) with findings`
    ].join(`
`)
  ];
  const corpusBlock = corpusFindingsBlock(report.corpusFindings);
  if (corpusBlock)
    blocks.push(corpusBlock);
  blocks.push(overviewBlock(report.items));
  for (const item of report.items)
    blocks.push(detailBlock(item));
  return `${blocks.join(`

`)}
`;
}
// ../../../oss/adrkit/packages/core/src/report/index.ts
function buildLintReport(result, findings) {
  return { checked: result.checked, findings };
}
function formatLintReportJson(report) {
  return `${JSON.stringify(report, null, 2)}
`;
}
function buildNewAdrReport(result) {
  return { id: result.id, path: result.path };
}
function formatNewAdrReportJson(report) {
  return `${JSON.stringify(report, null, 2)}
`;
}
function explainMarkerScan(scan) {
  const omittedDeclarations = scan.omittedMarkers ?? 0;
  return {
    state: scan.state,
    windowBytes: MARKER_HEADER_WINDOW_BYTES,
    ...scan.scannedBytes === undefined ? {} : { scannedBytes: scan.scannedBytes },
    ...scan.fileBytes === undefined ? {} : { fileBytes: scan.fileBytes },
    truncated: scan.truncated,
    declarationLimit: MARKER_DECLARATION_FILE_CAP,
    totalDeclarations: scan.markers.length + omittedDeclarations,
    omittedDeclarations,
    declared: scan.markers.map((marker) => ({ ref: marker.ref, line: marker.line }))
  };
}
function explainAsOf(resolved, view) {
  return {
    requested: resolved.requested,
    date: resolved.date,
    resolvedFrom: resolved.resolvedFrom,
    ...resolved.commit === undefined ? {} : { commit: resolved.commit },
    ...resolved.committedAt === undefined ? {} : { committedAt: resolved.committedAt },
    governing: view?.governing ?? [],
    activeProposals: view?.activeProposals ?? [],
    history: view?.history ?? [],
    notYetRecorded: view?.notYetRecorded ?? [],
    undetermined: view?.undetermined ?? []
  };
}
function buildExplainReport(input) {
  const governedBy = input.governedBy ?? [];
  const buckets = bucketDecisions(governedBy);
  return {
    path: input.path,
    ...input.asOf === undefined ? {} : { asOf: explainAsOf(input.asOf, input.asOfView) },
    governedBy,
    governing: buckets.governing,
    activeProposals: buckets.activeProposals,
    history: buckets.history,
    markers: explainMarkerScan(input.scan),
    findings: input.findings
  };
}
function formatExplainReportJson(report) {
  return `${JSON.stringify(report, null, 2)}
`;
}
// ../../../oss/adrkit/packages/core/src/transition/splice.ts
function locateFrontmatter(source) {
  const firstLineEnd = source.indexOf(`
`);
  const eol = firstLineEnd > 0 && source[firstLineEnd - 1] === "\r" ? `\r
` : `
`;
  const offset = firstLineEnd + 1;
  let lineStart = offset;
  while (lineStart <= source.length) {
    const next = source.indexOf(`
`, lineStart);
    const lineEnd = next === -1 ? source.length : next;
    const raw = source.slice(lineStart, lineEnd);
    if ((raw.endsWith("\r") ? raw.slice(0, -1) : raw) === "---") {
      return { yaml: source.slice(offset, lineStart), offset, eol };
    }
    if (next === -1)
      break;
    lineStart = next + 1;
  }
  throw new FrontmatterError("unterminated-frontmatter", "ADR frontmatter is missing its closing --- fence");
}
function keyOf(pair) {
  return $isScalar(pair.key) ? pair.key.value : pair.key;
}
function lineStartOf(text, index) {
  return text.lastIndexOf(`
`, index - 1) + 1;
}
function backUpOverTrivia(yaml, point, indentedComments, floor = 0) {
  while (point > floor) {
    const previousLineStart = lineStartOf(yaml, point - 1);
    const line = yaml.slice(previousLineStart, point).replace(/\r?\n$/, "");
    const comment = indentedComments ? line.trimStart().startsWith("#") : line.startsWith("#");
    if (line.trim() === "" || comment) {
      point = previousLineStart;
      continue;
    }
    break;
  }
  return point;
}
function blockInsertionPoint(yaml, root, index, keepValue = false) {
  const next = root.items[index + 1];
  const point = next && $isScalar(next.key) && next.key.range ? lineStartOf(yaml, next.key.range[0]) : yaml.length;
  const value = root.items[index]?.value;
  const floor = keepValue && value?.range ? lineAfter(yaml, value.range[1]) : 0;
  return backUpOverTrivia(yaml, point, false, floor);
}
function lineAfter(yaml, offset) {
  if (offset <= 0 || yaml[offset - 1] === `
`)
    return offset;
  const next = yaml.indexOf(`
`, offset);
  return next === -1 ? yaml.length : next + 1;
}
function leadAt(yaml, point, eol) {
  return point > 0 && !yaml.slice(0, point).endsWith(`
`) ? eol : "";
}
function quoted(value) {
  return JSON.stringify(value);
}
function renderScalarLike(original, value) {
  if (original.type === $Scalar.QUOTE_DOUBLE)
    return JSON.stringify(value);
  if (original.type === $Scalar.QUOTE_SINGLE)
    return `'${value.replace(/'/g, "''")}'`;
  return value;
}
function mergeEdits(edits) {
  const concrete = [...edits].sort((a, b) => Number(Boolean(a.newBlock)) - Number(Boolean(b.newBlock)));
  const merged = [];
  for (const edit of concrete) {
    const same = merged.find((other) => other.start === edit.start && other.end === edit.end && other.start === other.end);
    if (same && edit.start === edit.end)
      same.text += edit.text;
    else
      merged.push({ ...edit });
  }
  return merged;
}
function applyEdits(yaml, edits) {
  let output = yaml;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }
  return output;
}
function sameValue(a, b) {
  if (a === b)
    return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    return sameValue(aKeys, bKeys) && aKeys.every((key) => sameValue(a[key], b[key]));
  }
  return false;
}
function errorFindings(findings) {
  return findings.filter((finding) => finding.severity === "error");
}
function finishSplice(input) {
  const { source, located } = input;
  const yaml = applyEdits(located.yaml, mergeEdits(input.edits));
  const content = source.slice(0, located.offset) + yaml + source.slice(located.offset + located.yaml.length);
  let afterData;
  try {
    afterData = parseFrontmatter(content).data;
  } catch (error) {
    return {
      ok: false,
      code: "unsupported-layout",
      message: `The edited frontmatter no longer parses (${error instanceof Error ? error.message : String(error)}); edit this record by hand.`
    };
  }
  if (!sameValue(afterData, input.expected)) {
    return {
      ok: false,
      code: "unsupported-layout",
      message: `The edit would change a field other than ${input.owned}; edit this record by hand.`
    };
  }
  const after = validateAdrFrontmatter(afterData, input.path);
  const afterErrors = errorFindings(after.findings);
  if (afterErrors.length > 0) {
    return {
      ok: false,
      code: "invalid-result",
      message: `ADR-${input.id} would not be ${input.resultNoun}: ${afterErrors.map((finding) => finding.message).join("; ")}`,
      findings: afterErrors
    };
  }
  return { ok: true, content };
}

// ../../../oss/adrkit/packages/core/src/transition/accept.ts
var RFC3339_SECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
function refuse(code, message, findings) {
  return findings ? { ok: false, code, message, findings } : { ok: false, code, message };
}
function childEdit(located, root, parentKey, childKey, value, render) {
  const rendered = render(value);
  const { yaml, eol } = located;
  const index = root.items.findIndex((pair) => keyOf(pair) === parentKey);
  if (index === -1) {
    const point = blockInsertionPoint(yaml, root, root.items.length - 1);
    const lead = leadAt(yaml, point, eol);
    return { start: point, end: point, text: `${lead}${parentKey}:${eol}  ${childKey}: ${rendered}${eol}`, newBlock: true };
  }
  const parent = root.items[index];
  const map = parent.value;
  if (!$isMap(map) || map.flow || map.items.length === 0) {
    return `"${parentKey}" is not a block mapping; edit this record by hand`;
  }
  const existing = map.items.find((pair) => keyOf(pair) === childKey);
  if (existing) {
    const current = existing.value;
    if (!$isScalar(current) || !current.range || current.type === $Scalar.BLOCK_FOLDED || current.type === $Scalar.BLOCK_LITERAL) {
      return `"${parentKey}.${childKey}" is not a single-line scalar; edit this record by hand`;
    }
    const text = current.type === $Scalar.PLAIN ? rendered : renderScalarLike(current, value);
    return { start: current.range[0], end: current.range[1], text };
  }
  const firstKey = map.items[0].key;
  if (!$isScalar(firstKey) || !firstKey.range) {
    return `"${parentKey}" has a key this command cannot locate; edit this record by hand`;
  }
  const indent = yaml.slice(lineStartOf(yaml, firstKey.range[0]), firstKey.range[0]);
  if (!/^ +$/.test(indent)) {
    return `"${parentKey}" is not an indented block mapping; edit this record by hand`;
  }
  const point = blockInsertionPoint(yaml, root, index);
  const lead = !yaml.slice(0, point).endsWith(`
`) ? eol : "";
  return { start: point, end: point, text: `${lead}${indent}${childKey}: ${rendered}${eol}` };
}
function statusEdit(root) {
  const pair = root.items.find((item) => keyOf(item) === "status");
  const value = pair?.value;
  if (!$isScalar(value) || !value.range)
    return '"status" is not a scalar; edit this record by hand';
  return { start: value.range[0], end: value.range[1], text: renderScalarLike(value, "accepted") };
}
function expectedAfter(data, by, decidedAt) {
  const provenance = { ...data.provenance ?? {}, ratifiedBy: by };
  const review = { ...data.review ?? {}, decidedAt };
  return { ...data, status: "accepted", provenance, review };
}
function acceptAdrSource(input) {
  if (!isWritableIdentity(input.by)) {
    return refuse("invalid-identity", `${JSON.stringify(input.by)} is not an identity this command writes. Expected @handle, team:slug, or an email address. It may contain no control or invisible characters.`);
  }
  if (!RFC3339_SECONDS.test(input.decidedAt) || Number.isNaN(Date.parse(input.decidedAt))) {
    return refuse("invalid-decided-at", `"${input.decidedAt}" is not an RFC 3339 date-time with seconds.`);
  }
  let data;
  try {
    data = parseFrontmatter(input.source).data;
  } catch (error) {
    return refuse("invalid-record", error instanceof Error ? error.message : String(error));
  }
  const before = validateAdrFrontmatter(data, input.path);
  const beforeErrors = errorFindings(before.findings);
  if (!before.record || beforeErrors.length > 0) {
    return refuse("invalid-record", `${input.path} is not a valid record; fix it before accepting.`, beforeErrors);
  }
  const frontmatter = before.record.frontmatter;
  if (frontmatter.status !== "proposed") {
    const hint = frontmatter.status === "draft" ? " A draft has not been proposed yet; set status: proposed and let it go through review first." : "";
    return refuse("not-proposed", `ADR-${frontmatter.id} is "${frontmatter.status}", not "proposed".${hint}`);
  }
  const review = frontmatter.review;
  const unresolved = (review?.objections ?? []).filter((objection) => !objection.resolved);
  if (unresolved.length > 0) {
    const names = unresolved.map((objection) => objection.by).join(", ");
    return refuse("unresolved-objections", `ADR-${frontmatter.id} has ${unresolved.length} unresolved objection(s) (${names}); resolve them before accepting.`);
  }
  const approvals = distinctIdentityCount(review?.approvals ?? []);
  if (review?.quorum !== undefined && approvals < review.quorum) {
    return refuse("quorum-not-met", `ADR-${frontmatter.id} has ${approvals} of ${review.quorum} required approval(s); record the approvals before accepting.`);
  }
  const located = locateFrontmatter(input.source);
  const document = $parseDocument(located.yaml, { strict: true, prettyErrors: false });
  const root = document.contents;
  if (!$isMap(root) || root.flow) {
    return refuse("unsupported-layout", "The frontmatter is not a block mapping; edit this record by hand.");
  }
  const edits = [
    statusEdit(root),
    childEdit(located, root, "provenance", "ratifiedBy", input.by, quoted),
    childEdit(located, root, "review", "decidedAt", input.decidedAt, (value) => value)
  ];
  const problem = edits.find((edit) => typeof edit === "string");
  if (problem)
    return refuse("unsupported-layout", problem);
  const finished = finishSplice({
    source: input.source,
    located,
    edits,
    expected: expectedAfter(data, input.by, input.decidedAt),
    path: input.path,
    owned: "status, ratifiedBy, and decidedAt",
    resultNoun: "a valid accepted record",
    id: frontmatter.id
  });
  if (!finished.ok)
    return refuse(finished.code, finished.message, finished.findings);
  return { ok: true, content: finished.content };
}
// ../../../oss/adrkit/packages/core/src/transition/review.ts
var MAX_OBJECTION_SUMMARY_LENGTH = 500;
function refuse2(code, message, findings) {
  return findings ? { ok: false, code, message, findings } : { ok: false, code, message };
}
function objectionSummaryProblem(summary) {
  const trimmed = summary.trim();
  if (trimmed === "")
    return "The objection summary is empty.";
  if (hasInvisibleOrControl(summary)) {
    return "The objection summary must be one line with no control or invisible characters.";
  }
  if ([...trimmed].length > MAX_OBJECTION_SUMMARY_LENGTH) {
    return `The objection summary is longer than ${MAX_OBJECTION_SUMMARY_LENGTH} characters.`;
  }
  return;
}
function prepare(input, verb) {
  if (!isWritableIdentity(input.by)) {
    return refuse2("invalid-identity", `${JSON.stringify(input.by)} is not an identity this command writes. Expected @handle, team:slug, or an email address. It may contain no control or invisible characters.`);
  }
  let data;
  try {
    data = parseFrontmatter(input.source).data;
  } catch (error) {
    return refuse2("invalid-record", error instanceof Error ? error.message : String(error));
  }
  const before = validateAdrFrontmatter(data, input.path);
  const beforeErrors = errorFindings(before.findings);
  if (!before.record || beforeErrors.length > 0) {
    return refuse2("invalid-record", `${input.path} is not a valid record; fix it before ${verb}.`, beforeErrors);
  }
  const frontmatter = before.record.frontmatter;
  if (frontmatter.status !== "proposed") {
    return refuse2("not-proposed", `ADR-${frontmatter.id} is "${frontmatter.status}", not "proposed"; review state changes only while a record is under review.`);
  }
  const located = locateFrontmatter(input.source);
  const root = $parseDocument(located.yaml, { strict: true, prettyErrors: false }).contents;
  if (!$isMap(root) || root.flow) {
    return refuse2("unsupported-layout", "The frontmatter is not a block mapping; edit this record by hand.");
  }
  return { data, frontmatter, located, root };
}
var isRefusal = (value) => typeof value === "object" && value !== null && value.ok === false;
function pairOf(map, key) {
  return map.items.find((pair) => keyOf(pair) === key);
}
function reviewBlock(root) {
  const index = root.items.findIndex((pair) => keyOf(pair) === "review");
  if (index === -1)
    return;
  const map = root.items[index].value;
  if (!$isMap(map) || map.flow || map.items.length === 0)
    return '"review" is not a block mapping; edit this record by hand';
  return { index, map };
}
function seqEnd(yaml, root, review, key) {
  const position = review.map.items.findIndex((pair) => keyOf(pair) === key);
  const next = review.map.items[position + 1];
  const boundary = next && $isScalar(next.key) && next.key.range ? lineStartOf(yaml, next.key.range[0]) : blockInsertionPoint(yaml, root, review.index, true);
  const seq = review.map.items[position]?.value;
  return backUpOverTrivia(yaml, boundary, true, seq?.range ? lineAfter(yaml, seq.range[1]) : 0);
}
function appendEdit(located, root, key, blockItem, flowItem) {
  const { yaml, eol } = located;
  const review = reviewBlock(root);
  if (typeof review === "string")
    return review;
  if (review === undefined) {
    const point = blockInsertionPoint(yaml, root, root.items.length - 1, true);
    return { start: point, end: point, text: `${leadAt(yaml, point, eol)}review:${eol}  ${key}:${eol}${blockItem("    ")}` };
  }
  const pair = pairOf(review.map, key);
  if (!pair) {
    const firstKey = review.map.items[0].key;
    if (!$isScalar(firstKey) || !firstKey.range)
      return '"review" has a key this command cannot locate; edit this record by hand';
    const indent = yaml.slice(lineStartOf(yaml, firstKey.range[0]), firstKey.range[0]);
    if (!/^ +$/.test(indent))
      return '"review" is not an indented block mapping; edit this record by hand';
    const point = blockInsertionPoint(yaml, root, review.index, true);
    return { start: point, end: point, text: `${leadAt(yaml, point, eol)}${indent}${key}:${eol}${blockItem(`${indent}  `)}` };
  }
  const seq = pair.value;
  if (!$isSeq(seq) || !seq.range)
    return `"review.${key}" is not a list; edit this record by hand`;
  if (seq.flow) {
    if (yaml[seq.range[0]] !== "[" || yaml[seq.range[1] - 1] !== "]") {
      return `"review.${key}" is not a bracketed flow list; edit this record by hand`;
    }
    const last = seq.items.at(-1);
    if (seq.items.length === 0)
      return { start: seq.range[0] + 1, end: seq.range[0] + 1, text: flowItem };
    if (!last?.range)
      return `"review.${key}" has an item this command cannot locate; edit this record by hand`;
    return { start: last.range[1], end: last.range[1], text: `, ${flowItem}` };
  }
  const dashIndent = yaml.slice(lineStartOf(yaml, seq.range[0]), seq.range[0]);
  if (!/^ *$/.test(dashIndent))
    return `"review.${key}" is not an indented block list; edit this record by hand`;
  const point = seqEnd(yaml, root, review, key);
  return { start: point, end: point, text: `${leadAt(yaml, point, eol)}${blockItem(dashIndent)}` };
}
function cloneData(data) {
  return structuredClone(data);
}
function reviewOf(data) {
  const review = data.review ?? {};
  data.review = review;
  return review;
}
function approveAdrSource(input) {
  const prepared = prepare(input, "approving");
  if (isRefusal(prepared))
    return prepared;
  const { data, frontmatter, located, root } = prepared;
  const approvals = frontmatter.review?.approvals ?? [];
  if (approvals.some((approval) => sameIdentity(approval, input.by))) {
    return { ok: true, changed: false, content: input.source, approvals: distinctIdentityCount(approvals) };
  }
  const value = quoted(input.by);
  const edit = appendEdit(located, root, "approvals", (dash) => `${dash}- ${value}${located.eol}`, value);
  if (typeof edit === "string")
    return refuse2("unsupported-layout", edit);
  const expected = cloneData(data);
  const review = reviewOf(expected);
  review.approvals = [...review.approvals ?? [], input.by];
  const finished = finishSplice({
    source: input.source,
    located,
    edits: [edit],
    expected,
    path: input.path,
    owned: "review.approvals",
    resultNoun: "a valid record",
    id: frontmatter.id
  });
  if (!finished.ok)
    return refuse2(finished.code, finished.message, finished.findings);
  return { ok: true, changed: true, content: finished.content, approvals: distinctIdentityCount([...approvals, input.by]) };
}
function objectAdrSource(input) {
  const summaryProblem = objectionSummaryProblem(input.summary);
  const prepared = prepare(input, "objecting");
  if (isRefusal(prepared))
    return prepared;
  if (summaryProblem)
    return refuse2("invalid-summary", summaryProblem);
  const { data, frontmatter, located, root } = prepared;
  const summary = input.summary.trim();
  const objections = frontmatter.review?.objections ?? [];
  const existing = objections.findIndex((objection) => sameIdentity(objection.by, input.by) && objection.summary === summary && !objection.resolved);
  if (existing !== -1)
    return { ok: true, changed: false, content: input.source, objection: existing + 1 };
  const by = quoted(input.by);
  const text = quoted(summary);
  const { eol } = located;
  const edit = appendEdit(located, root, "objections", (dash) => `${dash}- by: ${by}${eol}${dash}  summary: ${text}${eol}${dash}  resolved: false${eol}`, `{ by: ${by}, summary: ${text}, resolved: false }`);
  if (typeof edit === "string")
    return refuse2("unsupported-layout", edit);
  const expected = cloneData(data);
  const review = reviewOf(expected);
  review.objections = [
    ...review.objections ?? [],
    { by: input.by, summary, resolved: false }
  ];
  const finished = finishSplice({
    source: input.source,
    located,
    edits: [edit],
    expected,
    path: input.path,
    owned: "review.objections",
    resultNoun: "a valid record",
    id: frontmatter.id
  });
  if (!finished.ok)
    return refuse2(finished.code, finished.message, finished.findings);
  return { ok: true, changed: true, content: finished.content, objection: objections.length + 1 };
}
function resolvedEdit(located, root, position) {
  const { yaml, eol } = located;
  const review = reviewBlock(root);
  if (typeof review !== "object")
    return review ?? '"review" is missing';
  const seq = pairOf(review.map, "objections")?.value;
  if (!$isSeq(seq))
    return '"review.objections" is not a list; edit this record by hand';
  const item = seq.items[position];
  if (!$isMap(item) || !item.range)
    return `objection ${position + 1} is not a mapping; edit this record by hand`;
  const resolved = pairOf(item, "resolved");
  if (resolved) {
    const value = resolved.value;
    if (!$isScalar(value) || !value.range)
      return `objection ${position + 1} has a "resolved" this command cannot locate`;
    return { start: value.range[0], end: value.range[1], text: "true" };
  }
  const last = item.items.at(-1);
  const lastValue = last?.value;
  const lastKey = last?.key;
  if (item.flow) {
    const end = lastValue?.range?.[1] ?? lastKey?.range?.[1];
    if (end === undefined)
      return `objection ${position + 1} has a field this command cannot locate; edit this record by hand`;
    return { start: end, end, text: ", resolved: true" };
  }
  const firstKey = item.items[0]?.key;
  if (!firstKey?.range)
    return `objection ${position + 1} has a key this command cannot locate; edit this record by hand`;
  const column = firstKey.range[0] - lineStartOf(yaml, firstKey.range[0]);
  const next = seq.items[position + 1];
  let point;
  if (next?.range) {
    let dash = next.range[0] - 1;
    while (dash >= 0 && /[ \t\r\n]/.test(yaml[dash]))
      dash -= 1;
    const start = yaml[dash] === "-" ? dash : next.range[0];
    point = backUpOverTrivia(yaml, lineStartOf(yaml, start), true, lineAfter(yaml, item.range[1]));
  } else {
    point = seqEnd(yaml, root, review, "objections");
  }
  return { start: point, end: point, text: `${leadAt(yaml, point, eol)}${" ".repeat(column)}resolved: true${eol}` };
}
function resolveObjectionAdrSource(input) {
  const prepared = prepare(input, "resolving an objection");
  if (isRefusal(prepared))
    return prepared;
  const { data, frontmatter, located, root } = prepared;
  if (!Number.isInteger(input.objection) || input.objection < 1) {
    return refuse2("invalid-objection-index", `Objection numbers start at 1; "${input.objection}" is not one.`);
  }
  const objections = frontmatter.review?.objections ?? [];
  const objection = objections[input.objection - 1];
  if (!objection) {
    return refuse2("objection-not-found", `ADR-${frontmatter.id} has ${objections.length} objection(s); there is no objection ${input.objection}.`);
  }
  if (!sameIdentity(objection.by, input.by)) {
    return refuse2("not-objector", `Objection ${input.objection} on ADR-${frontmatter.id} was raised by ${objection.by}; only the objector may resolve it.`);
  }
  if (objection.resolved)
    return { ok: true, changed: false, content: input.source };
  const edit = resolvedEdit(located, root, input.objection - 1);
  if (typeof edit === "string")
    return refuse2("unsupported-layout", edit);
  const expected = cloneData(data);
  const review = reviewOf(expected);
  const list = [...review.objections];
  list[input.objection - 1] = { ...list[input.objection - 1], resolved: true };
  review.objections = list;
  const finished = finishSplice({
    source: input.source,
    located,
    edits: [edit],
    expected,
    path: input.path,
    owned: `review.objections[${input.objection - 1}].resolved`,
    resultNoun: "a valid record",
    id: frontmatter.id
  });
  if (!finished.ok)
    return refuse2(finished.code, finished.message, finished.findings);
  return { ok: true, changed: true, content: finished.content };
}
// ../../../oss/adrkit/packages/cli/src/as-of.ts
import { execFile } from "node:child_process";
function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    execFile("git", [...args], {
      cwd,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      const code = error?.code;
      if (code === "ENOENT") {
        resolve("missing");
        return;
      }
      if (error && typeof code !== "number") {
        reject(error);
        return;
      }
      resolve({
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: typeof code === "number" ? code : 0
      });
    });
  });
}
async function resolveRef(ref, cwd) {
  const verified = await runGit(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], cwd);
  if (verified === "missing") {
    return { ok: false, failure: { code: "git-unavailable", reason: "git is not installed or not on PATH" } };
  }
  if (!verified.ok) {
    if (/not a git repository/i.test(verified.stderr)) {
      return { ok: false, failure: { code: "git-unavailable", reason: `${cwd} is not a git repository` } };
    }
    return { ok: false, failure: { code: "ref-unresolved" } };
  }
  const commit = verified.stdout;
  const shown = await runGit(["show", "-s", "--no-show-signature", "--format=%cI", commit], cwd);
  if (shown === "missing" || !shown.ok || shown.stdout.length === 0) {
    return { ok: false, failure: { code: "ref-unresolved" } };
  }
  const committedAt = shown.stdout;
  const resolved = resolveAsOf(committedAt);
  if (!resolved.ok)
    return { ok: false, failure: { code: "ref-unresolved" } };
  return {
    ok: true,
    value: { requested: ref, date: resolved.date, resolvedFrom: "ref", commit, committedAt }
  };
}
async function resolveExplainAsOf(value, cwd) {
  if (value.startsWith("-"))
    return { ok: false, failure: { code: "leading-dash" } };
  const asDate = resolveAsOf(value);
  if (asDate.ok) {
    return { ok: true, value: { requested: value, date: asDate.date, resolvedFrom: "date" } };
  }
  if (asDate.code === "tzless")
    return { ok: false, failure: { code: "tzless" } };
  const asRef = await resolveRef(value, cwd);
  if (asRef.ok)
    return asRef;
  if (/^\d{4}-\d{2}-\d{2}/.test(value))
    return { ok: false, failure: { code: "date-invalid" } };
  return asRef;
}
function asOfFailureMessage(value, failure, cwd) {
  switch (failure.code) {
    case "leading-dash":
      return `Missing value for option "--as-of". It was followed by "${value}", which looks like another option.`;
    case "tzless":
      return `Invalid --as-of value "${value}". Timezone-less datetimes are ambiguous — use YYYY-MM-DD or add an explicit timezone offset (e.g. Z or +05:00).`;
    case "date-invalid":
      return `Invalid --as-of value "${value}". Expected YYYY-MM-DD, an ISO datetime with an explicit timezone (e.g. 2026-01-08T00:00:00Z), or a git ref that resolves to a commit.`;
    case "ref-unresolved":
      return `Invalid --as-of value "${value}". It is not a YYYY-MM-DD date or an ISO datetime with an explicit timezone, and git could not resolve it to a commit in ${cwd}.`;
    case "git-unavailable":
      return `Could not resolve --as-of value "${value}". It is not a YYYY-MM-DD date or an ISO datetime with an explicit timezone, and it could not be resolved as a git ref: ${failure.reason}.`;
  }
}

// ../../../oss/adrkit/packages/cli/src/evaluate.ts
import { readFile as readFile4, readdir as readdir3 } from "node:fs/promises";
import { dirname as dirname3, isAbsolute as isAbsolute7, resolve as resolve8 } from "node:path";

// ../../../oss/adrkit/packages/evaluator/src/catalog.ts
var RULE_IDS = [
  "schema-valid",
  "id-unique",
  "supersession-consistent",
  "no-orphan-refs",
  "affects-resolvable",
  "affects-overlap",
  "scope-hierarchy",
  "assertions-compile",
  "assertions-pass",
  "decider-resolvable",
  "expiry-sane"
];
var RULE_SEVERITY = {
  "schema-valid": "error",
  "id-unique": "error",
  "supersession-consistent": "error",
  "no-orphan-refs": "error",
  "affects-resolvable": "warn",
  "affects-overlap": "warn",
  "scope-hierarchy": "error",
  "assertions-compile": "error",
  "assertions-pass": "warn",
  "decider-resolvable": "warn",
  "expiry-sane": "info"
};
var ROUTING_TRIGGERS = [
  "one-way-door",
  "cost-threshold",
  "security-surface",
  "data-residency",
  "regulatory",
  "contradicts-accepted-adr",
  "agent-authored-production",
  "human-requested"
];
var REASON_CODES = [
  "schema-valid.ok",
  "schema-valid.file-read",
  "schema-valid.parse-error",
  "schema-valid.contract-error",
  "id-unique.ok",
  "id-unique.collision",
  "supersession-consistent.ok",
  "supersession-consistent.dangling-superseded-by",
  "supersession-consistent.non-reciprocal",
  "supersession-consistent.cycle",
  "no-orphan-refs.ok",
  "no-orphan-refs.dangling-supersedes",
  "no-orphan-refs.dangling-relates-to",
  "no-orphan-refs.federated-log-absent",
  "affects-resolvable.ok",
  "affects-resolvable.zero-targets",
  "affects-resolvable.backing-absent",
  "affects-resolvable.resolver-absent",
  "affects-overlap.accepted-intersection",
  "affects-overlap.no-accepted-corpus",
  "affects-overlap.backing-absent",
  "affects-overlap.none",
  "scope-hierarchy.ok",
  "scope-hierarchy.contradicts-org-assertion",
  "scope-hierarchy.evidence-absent",
  "scope-hierarchy.engine-absent",
  "scope-hierarchy.source-absent",
  "scope-hierarchy.base-input-absent",
  "scope-hierarchy.proposed-input-absent",
  "scope-hierarchy.not-applicable-scope",
  "assertions-compile.ok",
  "assertions-compile.none",
  "assertions-compile.no-source",
  "assertions-compile.ambiguous-source",
  "assertions-compile.parse-error",
  "assertions-compile.engine-absent",
  "assertions-compile.source-absent",
  "assertions-pass.ok",
  "assertions-pass.none",
  "assertions-pass.evaluates-false",
  "assertions-pass.evaluation-error",
  "assertions-pass.engine-absent",
  "assertions-pass.input-absent",
  "decider-resolvable.ok",
  "decider-resolvable.none-declared",
  "decider-resolvable.zero-match",
  "decider-resolvable.ambiguous-match",
  "decider-resolvable.directory-absent",
  "expiry-sane.ok",
  "expiry-sane.past-or-equal",
  "not-evaluated.schema-invalid",
  "not-evaluated.prereq-failed",
  "route.escalate.one-way-door",
  "route.escalate.cost-threshold",
  "route.escalate.security-surface",
  "route.escalate.data-residency",
  "route.escalate.regulatory",
  "route.escalate.contradicts-accepted-adr",
  "route.escalate.agent-authored-production",
  "route.escalate.human-requested",
  "route.evidence.one-way-door.not-proven",
  "route.evidence.cost-threshold.not-proven",
  "route.evidence.security-surface.not-proven",
  "route.evidence.data-residency.not-proven",
  "route.evidence.regulatory.not-proven",
  "route.evidence.contradicts-accepted-adr.not-proven",
  "route.evidence.agent-authored-production.not-proven",
  "route.evidence.human-requested.not-proven",
  "route.target.not-required",
  "route.target.deciders",
  "route.target.codeowners",
  "route.target.catalog-owner",
  "route.target.unresolved"
];
var REASON_CODE_SET = new Set(REASON_CODES);
var RULE_REASON_PRECEDENCE = {
  "schema-valid": [
    "schema-valid.ok",
    "schema-valid.file-read",
    "schema-valid.parse-error",
    "schema-valid.contract-error"
  ],
  "id-unique": ["id-unique.ok", "id-unique.collision"],
  "supersession-consistent": [
    "supersession-consistent.ok",
    "supersession-consistent.dangling-superseded-by",
    "supersession-consistent.non-reciprocal",
    "supersession-consistent.cycle"
  ],
  "no-orphan-refs": [
    "no-orphan-refs.ok",
    "no-orphan-refs.dangling-supersedes",
    "no-orphan-refs.dangling-relates-to",
    "no-orphan-refs.federated-log-absent"
  ],
  "affects-resolvable": [
    "affects-resolvable.ok",
    "affects-resolvable.zero-targets",
    "affects-resolvable.backing-absent",
    "affects-resolvable.resolver-absent"
  ],
  "affects-overlap": [
    "affects-overlap.accepted-intersection",
    "affects-overlap.no-accepted-corpus",
    "affects-overlap.backing-absent",
    "affects-overlap.none"
  ],
  "scope-hierarchy": [
    "scope-hierarchy.ok",
    "scope-hierarchy.contradicts-org-assertion",
    "scope-hierarchy.evidence-absent",
    "scope-hierarchy.engine-absent",
    "scope-hierarchy.source-absent",
    "scope-hierarchy.base-input-absent",
    "scope-hierarchy.proposed-input-absent",
    "scope-hierarchy.not-applicable-scope"
  ],
  "assertions-compile": [
    "assertions-compile.ok",
    "assertions-compile.none",
    "assertions-compile.no-source",
    "assertions-compile.ambiguous-source",
    "assertions-compile.parse-error",
    "assertions-compile.engine-absent",
    "assertions-compile.source-absent"
  ],
  "assertions-pass": [
    "assertions-pass.ok",
    "assertions-pass.none",
    "assertions-pass.evaluates-false",
    "assertions-pass.evaluation-error",
    "assertions-pass.engine-absent",
    "assertions-pass.input-absent"
  ],
  "decider-resolvable": [
    "decider-resolvable.ok",
    "decider-resolvable.none-declared",
    "decider-resolvable.zero-match",
    "decider-resolvable.ambiguous-match",
    "decider-resolvable.directory-absent"
  ],
  "expiry-sane": ["expiry-sane.ok", "expiry-sane.past-or-equal"]
};
var ROUTE_ESCALATE_CODE = {
  "one-way-door": "route.escalate.one-way-door",
  "cost-threshold": "route.escalate.cost-threshold",
  "security-surface": "route.escalate.security-surface",
  "data-residency": "route.escalate.data-residency",
  regulatory: "route.escalate.regulatory",
  "contradicts-accepted-adr": "route.escalate.contradicts-accepted-adr",
  "agent-authored-production": "route.escalate.agent-authored-production",
  "human-requested": "route.escalate.human-requested"
};
var ROUTE_EVIDENCE_NOT_PROVEN_CODE = {
  "one-way-door": "route.evidence.one-way-door.not-proven",
  "cost-threshold": "route.evidence.cost-threshold.not-proven",
  "security-surface": "route.evidence.security-surface.not-proven",
  "data-residency": "route.evidence.data-residency.not-proven",
  regulatory: "route.evidence.regulatory.not-proven",
  "contradicts-accepted-adr": "route.evidence.contradicts-accepted-adr.not-proven",
  "agent-authored-production": "route.evidence.agent-authored-production.not-proven",
  "human-requested": "route.evidence.human-requested.not-proven"
};
var RUBRIC_VERSION = "0.1.0";

// ../../../oss/adrkit/packages/evaluator/src/keys.ts
function makeAssertionKey(log, path, id) {
  return JSON.stringify([log ?? "", path, id]);
}
function isCanonicalAssertionKey(key) {
  let parsed;
  try {
    parsed = JSON.parse(key);
  } catch {
    return false;
  }
  if (!Array.isArray(parsed) || parsed.length !== 3)
    return false;
  if (!parsed.every((part) => typeof part === "string"))
    return false;
  return JSON.stringify(parsed) === key;
}
function canonicalTargetKey(id) {
  return `${id.kind}:${id.id}`;
}

// ../../../oss/adrkit/packages/evaluator/src/compare.ts
function byCodeUnit(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ../../../oss/adrkit/packages/evaluator/src/report/order.ts
function cmp(a, b) {
  return byCodeUnit(a ?? "", b ?? "");
}
function targetKey(target) {
  return target ? canonicalTargetKey(target) : "";
}
function compareRuleFindings(a, b) {
  return cmp(a.candidateAdr, b.candidateAdr) || cmp(a.relatedAdr, b.relatedAdr) || cmp(a.matcherKey ?? a.assertionKey, b.matcherKey ?? b.assertionKey) || cmp(targetKey(a.target), targetKey(b.target)) || cmp(a.recordPath, b.recordPath) || cmp(a.field, b.field) || cmp(a.adr, b.adr) || cmp(a.message, b.message);
}
function sortRuleFindings(findings) {
  return [...findings].sort(compareRuleFindings);
}
var RULE_INDEX = new Map(RULE_IDS.map((rule, index) => [rule, index]));

// ../../../oss/adrkit/packages/evaluator/src/report/aggregate.ts
var STATUS_RANK = { fail: 3, inert: 2, pass: 1 };
function winningStatus(subs) {
  let winner = "pass";
  for (const sub of subs) {
    if (STATUS_RANK[sub.status] > STATUS_RANK[winner])
      winner = sub.status;
  }
  return winner;
}
function primaryReason(rule, winners) {
  const present = new Set(winners.map((sub) => sub.reason));
  for (const code of RULE_REASON_PRECEDENCE[rule]) {
    if (present.has(code))
      return code;
  }
  return RULE_REASON_PRECEDENCE[rule][0];
}
function aggregate(rule, subs, evidence) {
  const status = subs.length === 0 ? "pass" : winningStatus(subs);
  const winners = subs.filter((sub) => sub.status === status);
  const reason = winners.length === 0 ? RULE_REASON_PRECEDENCE[rule][0] : primaryReason(rule, winners);
  const findings = sortRuleFindings(subs.flatMap((sub) => sub.finding ? [sub.finding] : []));
  const severity = status === "fail" ? RULE_SEVERITY[rule] : undefined;
  return {
    rule,
    status,
    ...severity ? { severity } : {},
    reason,
    findings,
    ...evidence ? { evidence } : {}
  };
}

// ../../../oss/adrkit/packages/evaluator/src/rules/kernel.ts
function passResult(rule, reason = RULE_REASON_PRECEDENCE[rule][0]) {
  return { rule, status: "pass", reason, findings: [] };
}
function inertResult(rule, reason, finding) {
  return { rule, status: "inert", reason, findings: finding ? [finding] : [] };
}
function notEvaluated(rule, reason) {
  return { rule, status: "not-evaluated", reason, findings: [] };
}

// ../../../oss/adrkit/packages/evaluator/src/rules/context.ts
function acceptedRecordsExcludingCandidate(records, proposalPath) {
  return records.filter((record) => record.frontmatter.status === "accepted" && record.path !== proposalPath);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/schema-valid.ts
var PARSE_RULES = new Set(["frontmatter-parse", "frontmatter-fence"]);
function reasonForFinding(finding) {
  if (finding.rule === "file-read")
    return "schema-valid.file-read";
  if (PARSE_RULES.has(finding.rule))
    return "schema-valid.parse-error";
  return "schema-valid.contract-error";
}
function toRuleFinding(finding) {
  return {
    reason: reasonForFinding(finding),
    ...finding.message ? { message: finding.message } : {},
    ...finding.path ? { recordPath: finding.path } : {},
    ...finding.field ? { field: finding.field } : {},
    lowerLevel: {
      rule: finding.rule,
      ...finding.path ? { path: finding.path } : {},
      ...finding.id ? { id: finding.id } : {},
      ...finding.field ? { field: finding.field } : {},
      ...finding.pattern ? { pattern: finding.pattern } : {}
    }
  };
}
function evaluateSchemaValid(resolution) {
  const findings = resolution.schemaFindings;
  if (findings.length === 0) {
    return passResult("schema-valid");
  }
  const subs = findings.map((finding) => {
    const ruleFinding = toRuleFinding(finding);
    return { status: "fail", reason: ruleFinding.reason, finding: ruleFinding };
  });
  return aggregate("schema-valid", subs);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/id-unique.ts
function key(log, id) {
  return JSON.stringify([log ?? "", id]);
}
function corpusKey(record) {
  return key(record.log, record.frontmatter.id);
}
function federatedKeys(snapshots) {
  const keys = [];
  for (const snapshot of snapshots ?? []) {
    for (const id of snapshot.adrIds)
      keys.push(key(snapshot.log, id));
  }
  return keys;
}
function evaluateIdUnique(ctx) {
  const candidate = key(ctx.proposed.log, ctx.proposed.frontmatter.id);
  let occurrences = 0;
  for (const record of ctx.corpusRecords) {
    if (corpusKey(record) === candidate)
      occurrences += 1;
  }
  for (const federated of federatedKeys(ctx.input.federatedLogs)) {
    if (federated === candidate)
      occurrences += 1;
  }
  if (occurrences <= 1) {
    return passResult("id-unique");
  }
  const finding = {
    reason: "id-unique.collision",
    message: `ADR id "${ctx.proposed.frontmatter.id}" is not unique within log "${ctx.proposed.log ?? ""}"`,
    adr: ctx.proposed.frontmatter.id,
    candidateAdr: ctx.proposed.frontmatter.id,
    recordPath: ctx.proposed.path,
    field: "id",
    lowerLevel: { rule: "unique-id", path: ctx.proposed.path, id: ctx.proposed.frontmatter.id, field: "id" }
  };
  const subs = [{ status: "fail", reason: "id-unique.collision", finding }];
  return aggregate("id-unique", subs);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/no-orphan-refs.ts
function isCrossLog(ref, resolutionLog) {
  const { log } = parseAdrRef(ref);
  return log !== undefined && log !== resolutionLog;
}
function evaluateNoOrphanRefs(ctx) {
  const resolutionLog = ctx.input.resolutionLog;
  const localIds = new Set;
  const knownLogs = new Map;
  for (const record of ctx.corpusRecords) {
    if (record.log === undefined || record.log === resolutionLog) {
      localIds.add(record.frontmatter.id);
    }
    if (record.log !== undefined) {
      const set = knownLogs.get(record.log) ?? new Set;
      set.add(record.frontmatter.id);
      knownLogs.set(record.log, set);
    }
  }
  for (const snapshot of ctx.input.federatedLogs ?? []) {
    const set = knownLogs.get(snapshot.log) ?? new Set;
    for (const id of snapshot.adrIds)
      set.add(id);
    knownLogs.set(snapshot.log, set);
  }
  const subs = [];
  function classify(ref) {
    const parsed = parseAdrRef(ref);
    if (parsed.log === undefined || parsed.log === resolutionLog) {
      return localIds.has(parsed.id) ? "resolved" : "dangling";
    }
    const known = knownLogs.get(parsed.log);
    if (!known)
      return "federated-absent";
    return known.has(parsed.id) ? "resolved" : "dangling";
  }
  function check(record, field, refs) {
    const danglingReason = field === "supersedes" ? "no-orphan-refs.dangling-supersedes" : "no-orphan-refs.dangling-relates-to";
    const lowerRule = field === "supersedes" ? "dangling-supersedes" : "dangling-relatesTo";
    for (const ref of refs) {
      const crossLog = field === "supersedes" && isCrossLog(ref, resolutionLog);
      const outcome = crossLog ? "dangling" : classify(ref);
      if (outcome === "resolved")
        continue;
      if (outcome === "federated-absent") {
        const finding = {
          reason: "no-orphan-refs.federated-log-absent",
          message: `Federated ref "${ref}" has no external-log snapshot; reference is inert`,
          candidateAdr: record.frontmatter.id,
          relatedAdr: ref,
          recordPath: record.path,
          field
        };
        subs.push({ status: "inert", reason: "no-orphan-refs.federated-log-absent", finding });
        continue;
      }
      const finding = {
        reason: danglingReason,
        message: crossLog ? `Reference "${ref}" in ${field} names another decision log; cross-repository supersession is not supported (ADR-0059 clause 4)` : `Reference "${ref}" in ${field} does not resolve to a record in the corpus`,
        adr: record.frontmatter.id,
        candidateAdr: record.frontmatter.id,
        relatedAdr: ref,
        recordPath: record.path,
        field,
        lowerLevel: { rule: lowerRule, path: record.path, id: record.frontmatter.id, field }
      };
      subs.push({ status: "fail", reason: danglingReason, finding });
    }
  }
  for (const record of ctx.corpusRecords) {
    check(record, "supersedes", record.frontmatter.supersedes);
    check(record, "relatesTo", record.frontmatter.relatesTo);
  }
  if (subs.length === 0)
    return passResult("no-orphan-refs");
  return aggregate("no-orphan-refs", subs);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/supersession-consistent.ts
function hasSupersedesCycle(records) {
  const graph = buildAdrGraph(records);
  const adjacency = new Map;
  for (const edge of graph.edges) {
    if (edge.kind !== "supersedes")
      continue;
    const list = adjacency.get(edge.from) ?? [];
    list.push(edge.to);
    adjacency.set(edge.from, list);
  }
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map;
  const nodes = graph.nodes.map((node) => node.id);
  function visit(node) {
    color.set(node, GRAY);
    for (const next of adjacency.get(node) ?? []) {
      const state = color.get(next) ?? WHITE;
      if (state === GRAY)
        return true;
      if (state === WHITE && visit(next))
        return true;
    }
    color.set(node, BLACK);
    return false;
  }
  for (const node of nodes) {
    if ((color.get(node) ?? WHITE) === WHITE && visit(node))
      return true;
  }
  return false;
}
function evaluateSupersessionConsistent(ctx) {
  const resolutionLog = ctx.input.resolutionLog;
  const local = (ref) => isCrossLog(ref, resolutionLog) ? ref : parseAdrRef(ref).id;
  const normalized = ctx.corpusRecords.map((record) => ({
    ...record,
    frontmatter: {
      ...record.frontmatter,
      supersedes: record.frontmatter.supersedes.map(local),
      ...record.frontmatter.supersededBy !== undefined ? { supersededBy: local(record.frontmatter.supersededBy) } : {}
    }
  }));
  const originals = new Map(normalized.map((record, index) => [record, ctx.corpusRecords[index]]));
  const records = normalized;
  const ids = new Set(records.map((record) => record.frontmatter.id));
  const supersededByById = new Map;
  for (const record of records) {
    if (record.frontmatter.supersededBy) {
      supersededByById.set(record.frontmatter.id, record.frontmatter.supersededBy);
    }
  }
  const subs = [];
  const seenPairs = new Set;
  const danglingRefs = new Set;
  for (const record of records) {
    const target = record.frontmatter.supersededBy;
    if (target && !ids.has(target)) {
      danglingRefs.add(`${record.frontmatter.id}->${target}`);
      const written = originals.get(record).frontmatter.supersededBy ?? target;
      const finding = {
        reason: "supersession-consistent.dangling-superseded-by",
        message: isCrossLog(written, resolutionLog) ? `supersededBy "${written}" names another decision log; cross-repository supersession is not supported (ADR-0059 clause 4)` : `supersededBy "${written}" does not resolve to a record in the corpus`,
        adr: record.frontmatter.id,
        candidateAdr: record.frontmatter.id,
        relatedAdr: written,
        recordPath: record.path,
        field: "supersededBy",
        lowerLevel: { rule: "dangling-supersededBy", path: record.path, id: record.frontmatter.id, field: "supersededBy" }
      };
      subs.push({ status: "fail", reason: "supersession-consistent.dangling-superseded-by", finding });
    }
  }
  function nonReciprocal(fromId, toId, path, field) {
    const key = [fromId, toId].sort().join("|");
    if (seenPairs.has(key))
      return;
    seenPairs.add(key);
    const finding = {
      reason: "supersession-consistent.non-reciprocal",
      message: `supersedes/supersededBy between "${fromId}" and "${toId}" is not reciprocal`,
      adr: fromId,
      candidateAdr: fromId,
      relatedAdr: toId,
      recordPath: path,
      field,
      lowerLevel: { rule: "non-reciprocal", path, id: fromId, field }
    };
    subs.push({ status: "fail", reason: "supersession-consistent.non-reciprocal", finding });
  }
  for (const record of records) {
    for (const target of record.frontmatter.supersedes) {
      if (!ids.has(target))
        continue;
      if (supersededByById.get(target) !== record.frontmatter.id) {
        nonReciprocal(record.frontmatter.id, target, record.path, "supersedes");
      }
    }
  }
  const supersedesPairs = new Set;
  for (const record of records) {
    for (const target of record.frontmatter.supersedes) {
      supersedesPairs.add(`${record.frontmatter.id}=>${target}`);
    }
  }
  for (const record of records) {
    const target = record.frontmatter.supersededBy;
    if (!target || !ids.has(target))
      continue;
    if (danglingRefs.has(`${record.frontmatter.id}->${target}`))
      continue;
    if (!supersedesPairs.has(`${target}=>${record.frontmatter.id}`)) {
      nonReciprocal(record.frontmatter.id, target, record.path, "supersededBy");
    }
  }
  if (hasSupersedesCycle(records)) {
    subs.push({
      status: "fail",
      reason: "supersession-consistent.cycle",
      finding: {
        reason: "supersession-consistent.cycle",
        message: "The supersedes relation contains a cycle",
        lowerLevel: { rule: "supersedes-cycle" }
      }
    });
  }
  if (subs.length === 0)
    return passResult("supersession-consistent");
  return aggregate("supersession-consistent", subs);
}

// ../../../oss/adrkit/packages/evaluator/src/targets/canonical.ts
function normalizePathId(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}
function makeTargetId(kind, id) {
  return { kind, id: kind === "path" ? normalizePathId(id) : id };
}
function anyMatcherInert(resolution) {
  return resolution.matchers.some((matcher) => matcher.status !== "resolved");
}
function sortedUnique(ids) {
  const byKey = new Map;
  for (const id of ids)
    byKey.set(canonicalTargetKey(id), id);
  return [...byKey.values()].sort((a, b) => byCodeUnit(canonicalTargetKey(a), canonicalTargetKey(b)));
}
function resolveRecordTargets(record, registry, inventory, resolutionLog) {
  const context = { ...resolutionLog !== undefined ? { log: resolutionLog } : {}, inventory };
  const positive = new Map;
  const negated = new Set;
  const matcherResolutions = [];
  const matchers = record.frontmatter.affects;
  let hasPositiveMatcher = false;
  for (const matcher of matchers) {
    const type = matcher.type;
    if (!matcher.negate)
      hasPositiveMatcher = true;
    if (matcher.repo !== undefined && matcher.repo !== resolutionLog) {
      matcherResolutions.push({ type, pattern: matcher.pattern, negate: matcher.negate, status: "resolved", ids: [] });
      continue;
    }
    const port = registry.get(type);
    if (!port) {
      matcherResolutions.push({ type, pattern: matcher.pattern, negate: matcher.negate, status: "inert-resolver", ids: [] });
      continue;
    }
    const resolution = port.resolve(matcher, context);
    if (resolution.status === "inert") {
      matcherResolutions.push({ type, pattern: matcher.pattern, negate: matcher.negate, status: "inert-backing", ids: [] });
      continue;
    }
    matcherResolutions.push({ type, pattern: matcher.pattern, negate: matcher.negate, status: "resolved", ids: resolution.ids });
    for (const id of resolution.ids) {
      const key = canonicalTargetKey(id);
      if (matcher.negate)
        negated.add(key);
      else
        positive.set(key, id);
    }
  }
  const finalIds = [...positive.entries()].filter(([key]) => !negated.has(key)).map(([, id]) => id);
  const targets = sortedUnique(finalIds);
  return {
    targets,
    targetKeys: new Set(targets.map(canonicalTargetKey)),
    matchers: matcherResolutions,
    hasMatchers: matchers.length > 0,
    hasPositiveMatcher
  };
}

// ../../../oss/adrkit/packages/evaluator/src/rules/affects-resolvable.ts
function matcherFinding(ctx, matcher, reason, message) {
  return {
    reason,
    candidateAdr: ctx.proposed.frontmatter.id,
    matcherKey: `${matcher.type}:${matcher.pattern}`,
    recordPath: ctx.proposed.path,
    field: `affects.${matcher.type}`,
    message
  };
}
function evaluateAffectsResolvable(ctx) {
  const resolution = resolveRecordTargets(ctx.proposed, ctx.input.targetRegistry, ctx.input.targets, ctx.input.resolutionLog);
  if (!resolution.hasMatchers)
    return passResult("affects-resolvable");
  const subs = [];
  for (const matcher of resolution.matchers) {
    if (matcher.status === "inert-resolver") {
      subs.push({
        status: "inert",
        reason: "affects-resolvable.resolver-absent",
        finding: matcherFinding(ctx, matcher, "affects-resolvable.resolver-absent", `No resolver registered for "${matcher.type}" matcher "${matcher.pattern}"`)
      });
      continue;
    }
    if (matcher.status === "inert-backing") {
      subs.push({
        status: "inert",
        reason: "affects-resolvable.backing-absent",
        finding: matcherFinding(ctx, matcher, "affects-resolvable.backing-absent", `No inventory backing for "${matcher.type}" matcher "${matcher.pattern}"`)
      });
      continue;
    }
    if (matcher.negate)
      continue;
    if (matcher.ids.length >= 1) {
      subs.push({ status: "pass", reason: "affects-resolvable.ok" });
    } else {
      subs.push({
        status: "fail",
        reason: "affects-resolvable.zero-targets",
        finding: matcherFinding(ctx, matcher, "affects-resolvable.zero-targets", `"${matcher.type}" matcher "${matcher.pattern}" resolves to zero targets against the supplied inventory`)
      });
    }
  }
  if (!resolution.hasPositiveMatcher) {
    subs.push({
      status: "fail",
      reason: "affects-resolvable.zero-targets",
      finding: {
        reason: "affects-resolvable.zero-targets",
        candidateAdr: ctx.proposed.frontmatter.id,
        recordPath: ctx.proposed.path,
        field: "affects",
        message: "negation-only affects resolves to zero targets"
      }
    });
  }
  if (subs.length === 0)
    return passResult("affects-resolvable");
  return aggregate("affects-resolvable", subs, { resolvedTargets: resolution.targets });
}

// ../../../oss/adrkit/packages/evaluator/src/rules/affects-overlap.ts
function evaluateAffectsOverlap(ctx) {
  const accepted = ctx.acceptedRecords;
  if (accepted.length === 0) {
    return passResult("affects-overlap", "affects-overlap.no-accepted-corpus");
  }
  const proposal = resolveRecordTargets(ctx.proposed, ctx.input.targetRegistry, ctx.input.targets, ctx.input.resolutionLog);
  let anyInert = anyMatcherInert(proposal);
  const subs = [];
  const overlapping = [];
  for (const acc of accepted) {
    const accResolution = resolveRecordTargets(acc, ctx.input.targetRegistry, ctx.input.targets, ctx.input.resolutionLog);
    if (anyMatcherInert(accResolution))
      anyInert = true;
    const intersects = [...proposal.targetKeys].some((key) => accResolution.targetKeys.has(key));
    if (intersects) {
      overlapping.push(acc.frontmatter.id);
      subs.push({
        status: "fail",
        reason: "affects-overlap.accepted-intersection",
        finding: {
          reason: "affects-overlap.accepted-intersection",
          candidateAdr: ctx.proposed.frontmatter.id,
          relatedAdr: acc.frontmatter.id,
          message: `affects overlaps accepted ADR "${acc.frontmatter.id}"`
        }
      });
    }
  }
  if (subs.length > 0) {
    return aggregate("affects-overlap", subs, { overlappingWith: [...overlapping].sort(byCodeUnit) });
  }
  if (anyInert) {
    return inertResult("affects-overlap", "affects-overlap.backing-absent");
  }
  return passResult("affects-overlap", "affects-overlap.none");
}

// ../../../oss/adrkit/packages/evaluator/src/assertions/evaluate.ts
function runPort(port, key, record, hasInline, inline, source, input) {
  const base = { assertionKey: key, candidateAdr: record.frontmatter.id, recordPath: record.path };
  if (!port) {
    return {
      compile: { status: "inert", reason: "assertions-compile.engine-absent", finding: { reason: "assertions-compile.engine-absent", ...base } },
      pass: { status: "inert", reason: "assertions-pass.engine-absent", finding: { reason: "assertions-pass.engine-absent", ...base } }
    };
  }
  if (port.profile === "source") {
    const effectiveSource = hasInline ? inline : source?.fileContent;
    if (effectiveSource === undefined) {
      return {
        compile: { status: "inert", reason: "assertions-compile.source-absent", finding: { reason: "assertions-compile.source-absent", ...base } },
        pass: { status: "inert", reason: "assertions-pass.input-absent", finding: { reason: "assertions-pass.input-absent", ...base } }
      };
    }
    const outcome = port.compile(effectiveSource, source?.sourceRef);
    if (!outcome.ok) {
      return { compile: { status: "fail", reason: outcome.reason, finding: { reason: outcome.reason, ...base } } };
    }
    const compileSub = { status: "pass", reason: "assertions-compile.ok" };
    if (input === undefined) {
      return { compile: compileSub, pass: { status: "inert", reason: "assertions-pass.input-absent", finding: { reason: "assertions-pass.input-absent", ...base } } };
    }
    const evaluated = port.evaluate(outcome.compiled, input);
    if (!evaluated.ok) {
      return { compile: compileSub, pass: { status: "fail", reason: evaluated.reason, finding: { reason: evaluated.reason, ...base } } };
    }
    return {
      compile: compileSub,
      pass: evaluated.pass ? { status: "pass", reason: "assertions-pass.ok" } : { status: "fail", reason: "assertions-pass.evaluates-false", finding: { reason: "assertions-pass.evaluates-false", ...base } }
    };
  }
  const artifact = source?.compiledArtifact;
  if (artifact === undefined) {
    return {
      compile: { status: "inert", reason: "assertions-compile.source-absent", finding: { reason: "assertions-compile.source-absent", ...base } },
      pass: { status: "inert", reason: "assertions-pass.input-absent", finding: { reason: "assertions-pass.input-absent", ...base } }
    };
  }
  const outcome = port.validateArtifact(artifact);
  if (!outcome.ok) {
    return { compile: { status: "fail", reason: outcome.reason, finding: { reason: outcome.reason, ...base } } };
  }
  const compileSub = { status: "pass", reason: "assertions-compile.ok" };
  if (input === undefined) {
    return { compile: compileSub, pass: { status: "inert", reason: "assertions-pass.input-absent", finding: { reason: "assertions-pass.input-absent", ...base } } };
  }
  const evaluated = port.evaluate(outcome.compiled, input);
  if (!evaluated.ok) {
    return { compile: compileSub, pass: { status: "fail", reason: evaluated.reason, finding: { reason: evaluated.reason, ...base } } };
  }
  return {
    compile: compileSub,
    pass: evaluated.pass ? { status: "pass", reason: "assertions-pass.ok" } : { status: "fail", reason: "assertions-pass.evaluates-false", finding: { reason: "assertions-pass.evaluates-false", ...base } }
  };
}
function dispatch(ctx, assertion, key, input) {
  const record = ctx.proposed;
  const source = ctx.input.assertionInputs.sources[key];
  const hasInline = assertion.expression !== undefined;
  const registry = ctx.input.assertionEngines;
  switch (assertion.engine) {
    case "rego":
      return runPort(registry.rego, key, record, hasInline, assertion.expression, source, input);
    case "jsonpath":
      return runPort(registry.jsonpath, key, record, hasInline, assertion.expression, source, input);
    case "grep":
      return runPort(registry.grep, key, record, hasInline, assertion.expression, source, input);
    case "custom":
      return runPort(registry.custom, key, record, hasInline, assertion.expression, source, input);
  }
}
function computeAssertionOutcomes(ctx) {
  const assertions = ctx.proposed.frontmatter.assertions;
  const compileSubs = [];
  const passSubs = [];
  for (const assertion of assertions) {
    const key = makeAssertionKey(ctx.proposed.log, ctx.proposed.path, assertion.id);
    const base = { assertionKey: key, candidateAdr: ctx.proposed.frontmatter.id, recordPath: ctx.proposed.path };
    const hasInline = assertion.expression !== undefined;
    const hasFile = assertion.expressionFile !== undefined;
    if (!hasInline && !hasFile) {
      compileSubs.push({
        status: "fail",
        reason: "assertions-compile.no-source",
        finding: { reason: "assertions-compile.no-source", field: "assertions", message: `Assertion "${assertion.id}" declares no source`, ...base }
      });
      continue;
    }
    if (hasInline && hasFile) {
      compileSubs.push({
        status: "fail",
        reason: "assertions-compile.ambiguous-source",
        finding: { reason: "assertions-compile.ambiguous-source", field: "assertions", message: `Assertion "${assertion.id}" declares both expression and expressionFile`, ...base }
      });
      continue;
    }
    const input = ctx.input.assertionInputs.inputs[key]?.document;
    const result = dispatch(ctx, assertion, key, input);
    compileSubs.push(result.compile);
    if (result.pass)
      passSubs.push(result.pass);
  }
  return { compileSubs, passSubs, hasAssertions: assertions.length > 0 };
}
function compileWith(port, hasInline, inline, source) {
  if (!port)
    return { ok: false, reason: "engine-absent" };
  if (port.profile === "source") {
    const effectiveSource = hasInline ? inline : source?.fileContent;
    if (effectiveSource === undefined)
      return { ok: false, reason: "source-absent" };
    const outcome = port.compile(effectiveSource, source?.sourceRef);
    if (!outcome.ok)
      return { ok: false, reason: "compile-error" };
    return { ok: true, evaluate: (input) => port.evaluate(outcome.compiled, input) };
  }
  const artifact = source?.compiledArtifact;
  if (artifact === undefined)
    return { ok: false, reason: "source-absent" };
  const outcome = port.validateArtifact(artifact);
  if (!outcome.ok)
    return { ok: false, reason: "compile-error" };
  return { ok: true, evaluate: (input) => port.evaluate(outcome.compiled, input) };
}
function compileAssertionForScope(ctx, orgRecord, assertion) {
  const key = makeAssertionKey(orgRecord.log, orgRecord.path, assertion.id);
  const source = ctx.input.assertionInputs.sources[key];
  const hasInline = assertion.expression !== undefined;
  const hasFile = assertion.expressionFile !== undefined;
  if (hasInline === hasFile)
    return { ok: false, reason: "compile-error" };
  const registry = ctx.input.assertionEngines;
  switch (assertion.engine) {
    case "rego":
      return compileWith(registry.rego, hasInline, assertion.expression, source);
    case "jsonpath":
      return compileWith(registry.jsonpath, hasInline, assertion.expression, source);
    case "grep":
      return compileWith(registry.grep, hasInline, assertion.expression, source);
    case "custom":
      return compileWith(registry.custom, hasInline, assertion.expression, source);
  }
}

// ../../../oss/adrkit/packages/evaluator/src/rules/scope-hierarchy.ts
function domainApplies(orgRecord, proposal) {
  const orgDomain = orgRecord.frontmatter.domain;
  if (orgDomain === undefined)
    return true;
  return orgDomain === proposal.frontmatter.domain;
}
function evaluateScopeHierarchy(ctx) {
  const proposal = ctx.proposed;
  if (proposal.frontmatter.scope !== "component") {
    return passResult("scope-hierarchy", "scope-hierarchy.not-applicable-scope");
  }
  const proposalTargets = resolveRecordTargets(proposal, ctx.input.targetRegistry, ctx.input.targets, ctx.input.resolutionLog);
  const subs = [];
  if (anyMatcherInert(proposalTargets)) {
    subs.push({ status: "inert", reason: "scope-hierarchy.evidence-absent" });
  }
  const applicableOrgAdrs = [];
  for (const record of ctx.acceptedRecords) {
    if (record.frontmatter.scope !== "org")
      continue;
    if (!domainApplies(record, proposal))
      continue;
    const orgTargets = resolveRecordTargets(record, ctx.input.targetRegistry, ctx.input.targets, ctx.input.resolutionLog);
    if (anyMatcherInert(orgTargets)) {
      subs.push({ status: "inert", reason: "scope-hierarchy.evidence-absent" });
    }
    if ([...proposalTargets.targetKeys].some((key) => orgTargets.targetKeys.has(key))) {
      applicableOrgAdrs.push(record);
    }
  }
  if (applicableOrgAdrs.length === 0) {
    return subs.length > 0 ? aggregate("scope-hierarchy", subs) : passResult("scope-hierarchy", "scope-hierarchy.ok");
  }
  const transitions = [];
  for (const orgRecord of applicableOrgAdrs) {
    for (const assertion of orgRecord.frontmatter.assertions) {
      const key = makeAssertionKey(orgRecord.log, orgRecord.path, assertion.id);
      const compiled = compileAssertionForScope(ctx, orgRecord, assertion);
      if (!compiled.ok) {
        const reason = compiled.reason === "engine-absent" ? "scope-hierarchy.engine-absent" : "scope-hierarchy.source-absent";
        subs.push({ status: "inert", reason });
        continue;
      }
      const baseInput = ctx.input.scopeEvidence?.baseInputs?.[key]?.document;
      if (baseInput === undefined) {
        subs.push({ status: "inert", reason: "scope-hierarchy.base-input-absent" });
        continue;
      }
      const proposedInput = ctx.input.assertionInputs.inputs[key]?.document;
      if (proposedInput === undefined) {
        subs.push({ status: "inert", reason: "scope-hierarchy.proposed-input-absent" });
        continue;
      }
      const baseEval = compiled.evaluate(baseInput);
      const proposedEval = compiled.evaluate(proposedInput);
      if (!baseEval.ok || !proposedEval.ok) {
        subs.push({ status: "inert", reason: "scope-hierarchy.evidence-absent" });
        continue;
      }
      if (baseEval.pass && !proposedEval.pass) {
        transitions.push(`${orgRecord.frontmatter.id}:${assertion.id}`);
        subs.push({
          status: "fail",
          reason: "scope-hierarchy.contradicts-org-assertion",
          finding: {
            reason: "scope-hierarchy.contradicts-org-assertion",
            candidateAdr: proposal.frontmatter.id,
            relatedAdr: orgRecord.frontmatter.id,
            assertionKey: key,
            message: `Proposal turns accepted org assertion "${orgRecord.frontmatter.id}:${assertion.id}" from green to red`
          }
        });
      }
    }
  }
  if (subs.length === 0)
    return passResult("scope-hierarchy", "scope-hierarchy.ok");
  return aggregate("scope-hierarchy", subs, transitions.length > 0 ? { assertionTransitions: [...transitions].sort(byCodeUnit) } : undefined);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/assertions-compile.ts
function evaluateAssertionsCompile(outcomes) {
  if (!outcomes.hasAssertions)
    return passResult("assertions-compile", "assertions-compile.none");
  return aggregate("assertions-compile", outcomes.compileSubs);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/assertions-pass.ts
function evaluateAssertionsPass(outcomes) {
  if (!outcomes.hasAssertions || outcomes.passSubs.length === 0) {
    return passResult("assertions-pass", "assertions-pass.none");
  }
  return aggregate("assertions-pass", outcomes.passSubs);
}

// ../../../oss/adrkit/packages/evaluator/src/identity/directory.ts
function buildIdentityIndex(directory) {
  const principalsById = new Map;
  for (const principal of directory.principals) {
    principalsById.set(principal.id, principal);
  }
  const teamMembersById = new Map;
  for (const team of directory.teams) {
    teamMembersById.set(team.id, team.members);
  }
  function isActiveHuman(ref) {
    const principal = principalsById.get(ref);
    return principal !== undefined && principal.kind === "human" && principal.active;
  }
  function isTeam(ref) {
    if (teamMembersById.has(ref))
      return true;
    const principal = principalsById.get(ref);
    return principal !== undefined && principal.kind === "team";
  }
  function activeHumansForTeam(ref) {
    const members = teamMembersById.get(ref) ?? [];
    const seen = new Set;
    const humans = [];
    for (const member of members) {
      if (seen.has(member))
        continue;
      if (isActiveHuman(member)) {
        seen.add(member);
        humans.push(member);
      }
    }
    return humans;
  }
  function resolveToActiveHuman(ref) {
    if (isTeam(ref)) {
      const humans = activeHumansForTeam(ref);
      if (humans.length === 1)
        return { status: "resolved", human: humans[0] };
      return humans.length === 0 ? { status: "zero" } : { status: "ambiguous" };
    }
    if (isActiveHuman(ref))
      return { status: "resolved", human: ref };
    return { status: "zero" };
  }
  return { resolveToActiveHuman, isActiveHuman, isTeam };
}

// ../../../oss/adrkit/packages/evaluator/src/rules/decider-resolvable.ts
function evaluateDeciderResolvable(ctx) {
  const directory = ctx.input.identity;
  if (!directory) {
    return inertResult("decider-resolvable", "decider-resolvable.directory-absent");
  }
  const deciders = ctx.proposed.frontmatter.deciders;
  if (deciders.length === 0) {
    return aggregate("decider-resolvable", [
      {
        status: "fail",
        reason: "decider-resolvable.none-declared",
        finding: {
          reason: "decider-resolvable.none-declared",
          candidateAdr: ctx.proposed.frontmatter.id,
          field: "deciders",
          message: "No deciders are declared on the proposal"
        }
      }
    ]);
  }
  const index = buildIdentityIndex(directory);
  const subs = deciders.map((decider) => {
    const resolution = index.resolveToActiveHuman(decider);
    if (resolution.status === "resolved") {
      return { status: "pass", reason: "decider-resolvable.ok" };
    }
    const reason = resolution.status === "ambiguous" ? "decider-resolvable.ambiguous-match" : "decider-resolvable.zero-match";
    return {
      status: "fail",
      reason,
      finding: {
        reason,
        candidateAdr: ctx.proposed.frontmatter.id,
        field: "deciders",
        message: `Decider "${decider}" ${resolution.status === "ambiguous" ? "resolves ambiguously" : "does not resolve to one active principal"}`
      }
    };
  });
  return aggregate("decider-resolvable", subs);
}

// ../../../oss/adrkit/packages/evaluator/src/rules/expiry-sane.ts
function evaluateExpirySane(ctx) {
  const reviewBy = ctx.proposed.frontmatter.reviewBy;
  if (reviewBy === undefined)
    return passResult("expiry-sane");
  if (reviewBy > ctx.evaluationDate)
    return passResult("expiry-sane");
  return aggregate("expiry-sane", [
    {
      status: "fail",
      reason: "expiry-sane.past-or-equal",
      finding: {
        reason: "expiry-sane.past-or-equal",
        candidateAdr: ctx.proposed.frontmatter.id,
        field: "reviewBy",
        message: `reviewBy "${reviewBy}" is on or before the evaluation date "${ctx.evaluationDate}"`
      }
    }
  ]);
}

// ../../../oss/adrkit/packages/evaluator/src/report/assemble.ts
function computeOutcome(results) {
  const returned = results.some((result) => result.status === "fail" && result.severity === "error");
  return returned ? "returned" : "ok";
}
function assembleReport(proposalPath, resultsByRule, routing) {
  const results = RULE_IDS.map((rule) => {
    const result = resultsByRule.get(rule);
    if (!result) {
      throw new Error(`internal: missing rule result for "${rule}"`);
    }
    return result;
  });
  return {
    rubricVersion: RUBRIC_VERSION,
    proposalPath,
    results,
    routing,
    outcome: computeOutcome(results)
  };
}

// ../../../oss/adrkit/packages/evaluator/src/routing/target.ts
var VIA_CODE = {
  deciders: "route.target.deciders",
  codeowners: "route.target.codeowners",
  catalog: "route.target.catalog-owner"
};
function orderedCandidates(deciders, directory, resolvedPaths, resolvedEntities) {
  const candidates = [];
  for (const decider of deciders)
    candidates.push({ ref: decider, via: "deciders" });
  const codeowners = directory.codeowners ?? [];
  const uniquePaths = [...new Set(resolvedPaths)].sort(byCodeUnit);
  for (const path of uniquePaths) {
    let lastMatch;
    for (const rule of codeowners) {
      if (matchPathPattern(rule.pattern, [path]).matched)
        lastMatch = rule.owners;
    }
    if (lastMatch) {
      for (const owner of lastMatch)
        candidates.push({ ref: owner, via: "codeowners" });
    }
  }
  const catalogOwners = directory.catalogOwners;
  const uniqueEntities = [...new Map(resolvedEntities.map((id) => [canonicalTargetKey(id), id])).values()].sort((a, b) => byCodeUnit(canonicalTargetKey(a), canonicalTargetKey(b)));
  for (const entity of uniqueEntities) {
    const owners = catalogOwners !== undefined && Object.hasOwn(catalogOwners, entity.id) ? catalogOwners[entity.id] ?? [] : [];
    for (const owner of owners)
      candidates.push({ ref: owner, via: "catalog" });
  }
  return candidates;
}
function resolveRouteTarget(index, deciders, directory, resolvedPaths, resolvedEntities) {
  const candidates = orderedCandidates(deciders, directory, resolvedPaths, resolvedEntities);
  const seen = new Set;
  for (const candidate of candidates) {
    if (seen.has(candidate.ref))
      continue;
    seen.add(candidate.ref);
    const resolution = index.resolveToActiveHuman(candidate.ref);
    if (resolution.status === "resolved") {
      return { kind: "resolved", human: resolution.human, via: candidate.via, code: VIA_CODE[candidate.via] };
    }
    if (index.isTeam(candidate.ref)) {
      return { kind: "unresolved", code: "route.target.unresolved" };
    }
  }
  return { kind: "unresolved", code: "route.target.unresolved" };
}

// ../../../oss/adrkit/packages/evaluator/src/routing/route.ts
function allNotProven() {
  return ROUTING_TRIGGERS.map((reason) => ({
    reason,
    status: "not-proven",
    code: ROUTE_EVIDENCE_NOT_PROVEN_CODE[reason]
  }));
}
function notRequiredRouting() {
  return {
    escalate: false,
    reasons: [],
    evidenceStatus: allNotProven(),
    target: { kind: "not-required", code: "route.target.not-required" }
  };
}
function intersects(a, b) {
  if (!b || b.size === 0)
    return false;
  for (const key of a)
    if (b.has(key))
      return true;
  return false;
}
function computeRouting(ctx, proposalTargets, contradictsAccepted) {
  const evidence = ctx.input.routingEvidence;
  const proposalKeys = proposalTargets.targetKeys;
  const frontmatter = ctx.proposed.frontmatter;
  const proven = {
    "one-way-door": frontmatter.reversibility === "one-way-door",
    "cost-threshold": evidence?.costEvidence !== undefined && evidence.costEvidence.normalizedCost >= evidence.costEvidence.threshold,
    "security-surface": intersects(proposalKeys, evidence?.securitySurfaceTargets),
    "data-residency": evidence?.dataResidency?.present === true,
    regulatory: frontmatter.complianceControls.length > 0 || intersects(proposalKeys, evidence?.regulatedTargets),
    "contradicts-accepted-adr": contradictsAccepted,
    "agent-authored-production": (frontmatter.provenance?.authoredBy === "agent" || frontmatter.provenance?.authoredBy === "agent-drafted") && intersects(proposalKeys, evidence?.productionTargets),
    "human-requested": evidence?.humanRequested?.requester !== undefined
  };
  const evidenceStatus = ROUTING_TRIGGERS.map((reason) => proven[reason] ? { reason, status: "proven", code: ROUTE_ESCALATE_CODE[reason] } : { reason, status: "not-proven", code: ROUTE_EVIDENCE_NOT_PROVEN_CODE[reason] });
  const reasons = ROUTING_TRIGGERS.filter((reason) => proven[reason]);
  const escalate = reasons.length > 0;
  if (!escalate) {
    return {
      escalate: false,
      reasons: [],
      evidenceStatus,
      target: { kind: "not-required", code: "route.target.not-required" }
    };
  }
  const directory = ctx.input.identity;
  if (!directory) {
    return { escalate: true, reasons, evidenceStatus, target: { kind: "unresolved", code: "route.target.unresolved" } };
  }
  const resolvedPaths = proposalTargets.targets.filter((id) => id.kind === "path").map((id) => id.id);
  const resolvedEntities = proposalTargets.targets.filter((id) => id.kind === "entity");
  const target = resolveRouteTarget(buildIdentityIndex(directory), frontmatter.deciders, directory, resolvedPaths, resolvedEntities);
  return { escalate: true, reasons, evidenceStatus, target };
}

// ../../../oss/adrkit/packages/evaluator/src/routing/accepted-assertion.ts
function contradictsAcceptedAdr(ctx, proposalTargetKeys) {
  if (proposalTargetKeys.size === 0)
    return false;
  for (const accepted of ctx.acceptedRecords) {
    const acceptedTargets = resolveRecordTargets(accepted, ctx.input.targetRegistry, ctx.input.targets, ctx.input.resolutionLog);
    const overlaps = [...proposalTargetKeys].some((key) => acceptedTargets.targetKeys.has(key));
    if (!overlaps)
      continue;
    for (const assertion of accepted.frontmatter.assertions) {
      const key = makeAssertionKey(accepted.log, accepted.path, assertion.id);
      const compiled = compileAssertionForScope(ctx, accepted, assertion);
      if (!compiled.ok)
        continue;
      const proposedInput = ctx.input.assertionInputs.inputs[key]?.document;
      if (proposedInput === undefined)
        continue;
      const evaluated = compiled.evaluate(proposedInput);
      if (evaluated.ok && !evaluated.pass)
        return true;
    }
  }
  return false;
}

// ../../../oss/adrkit/packages/evaluator/src/patch/project.ts
function isViolation(result) {
  return result.status === "fail";
}
function representativeFinding(result) {
  return result.findings.find((finding) => finding.reason === result.reason) ?? result.findings[0];
}
function projectFinding(result) {
  const finding = representativeFinding(result);
  const adr = finding?.adr !== undefined && AdrRef.safeParse(finding.adr).success ? finding.adr : undefined;
  return {
    rule: result.rule,
    severity: RULE_SEVERITY[result.rule],
    ...finding?.message ? { message: finding.message } : {},
    ...adr !== undefined ? { adr } : {}
  };
}
function projectPatch(report) {
  const deterministicFindings = report.results.filter(isViolation).map(projectFinding);
  return {
    deterministicFindings,
    escalate: report.routing.escalate,
    escalationReasons: report.routing.reasons
  };
}

// ../../../oss/adrkit/packages/evaluator/src/pass0.ts
var PROPOSAL_STATUSES = new Set(["draft", "proposed"]);
var NON_PROPOSAL_STATUSES = new Set([
  "accepted",
  "rejected",
  "superseded",
  "deprecated"
]);
function resolveProposal(input) {
  const proposed = input.corpus.records.find((record) => record.path === input.proposalPath);
  if (proposed) {
    return { proposalPath: input.proposalPath, schemaFindings: [], proposed };
  }
  const onPath = input.corpus.findings.filter((finding) => finding.path === input.proposalPath);
  const schemaFindings = onPath.length > 0 ? onPath : [
    {
      rule: "file-read",
      severity: "error",
      message: `Proposal not found in corpus: ${input.proposalPath}`,
      path: input.proposalPath
    }
  ];
  return { proposalPath: input.proposalPath, schemaFindings };
}
function evaluateStructuralAndBacked(context) {
  const results = new Map;
  results.set("id-unique", evaluateIdUnique(context));
  results.set("supersession-consistent", evaluateSupersessionConsistent(context));
  results.set("no-orphan-refs", evaluateNoOrphanRefs(context));
  results.set("affects-resolvable", evaluateAffectsResolvable(context));
  results.set("affects-overlap", evaluateAffectsOverlap(context));
  results.set("scope-hierarchy", evaluateScopeHierarchy(context));
  const assertionOutcomes = computeAssertionOutcomes(context);
  const compile = evaluateAssertionsCompile(assertionOutcomes);
  results.set("assertions-compile", compile);
  results.set("assertions-pass", compile.status === "fail" ? notEvaluated("assertions-pass", "not-evaluated.prereq-failed") : evaluateAssertionsPass(assertionOutcomes));
  results.set("decider-resolvable", evaluateDeciderResolvable(context));
  results.set("expiry-sane", evaluateExpirySane(context));
  return results;
}
function evaluatePass0(input) {
  const resolution = resolveProposal(input);
  if (resolution.proposed) {
    const status = resolution.proposed.frontmatter.status;
    if (!PROPOSAL_STATUSES.has(status) && NON_PROPOSAL_STATUSES.has(status)) {
      const error = {
        code: "candidate-status-not-proposal",
        proposalPath: input.proposalPath,
        actualStatus: status
      };
      return { kind: "input-error", error };
    }
  }
  const schemaValid = evaluateSchemaValid(resolution);
  const resultsByRule = new Map;
  resultsByRule.set("schema-valid", schemaValid);
  if (schemaValid.status === "fail" || !resolution.proposed) {
    for (const rule of RULE_IDS) {
      if (rule === "schema-valid")
        continue;
      resultsByRule.set(rule, notEvaluated(rule, "not-evaluated.schema-invalid"));
    }
    const report = assembleReport(input.proposalPath, resultsByRule, notRequiredRouting());
    return { kind: "evaluated", result: { report, patch: projectPatch(report) } };
  }
  const proposed = resolution.proposed;
  const context = {
    input,
    proposed,
    resolution,
    corpusRecords: input.corpus.records,
    acceptedRecords: acceptedRecordsExcludingCandidate(input.corpus.records, input.proposalPath),
    evaluationDate: input.evaluationDate
  };
  for (const [rule, result] of evaluateStructuralAndBacked(context)) {
    resultsByRule.set(rule, result);
  }
  const proposalTargets = resolveRecordTargets(proposed, input.targetRegistry, input.targets, input.resolutionLog);
  const contradicts = contradictsAcceptedAdr(context, proposalTargets.targetKeys);
  const routing = computeRouting(context, proposalTargets, contradicts);
  const report = assembleReport(input.proposalPath, resultsByRule, routing);
  return { kind: "evaluated", result: { report, patch: projectPatch(report) } };
}
// ../../../oss/adrkit/packages/evaluator/src/targets/registry.ts
function createTargetResolutionRegistry(ports) {
  const byType = new Map;
  for (const port of ports)
    byType.set(port.type, port);
  return { get: (type) => byType.get(type) };
}
// ../../../oss/adrkit/packages/evaluator/src/targets/path.ts
function createPathTargetResolver() {
  return {
    type: "path",
    resolve(matcher, context) {
      const inventory = context.inventory.trackedPaths;
      if (inventory === undefined) {
        return { status: "inert", ids: [], reason: "affects-resolvable.backing-absent" };
      }
      const ids = inventory.filter((path) => matchPathPattern(matcher.pattern, [path]).matched).map((path) => makeTargetId("path", path));
      return {
        status: "resolved",
        ids,
        reason: ids.length > 0 ? "affects-resolvable.ok" : "affects-resolvable.zero-targets"
      };
    }
  };
}
// ../../../oss/adrkit/packages/evaluator/src/targets/package.ts
function createPackageTargetResolver() {
  return {
    type: "package",
    resolve(matcher, context) {
      const inventory = context.inventory.dependencies;
      if (inventory === undefined) {
        return { status: "inert", ids: [], reason: "affects-resolvable.backing-absent" };
      }
      if (!parsePackagePattern(matcher.pattern)) {
        return { status: "resolved", ids: [], reason: "affects-resolvable.zero-targets" };
      }
      const ids = inventory.filter((dependency) => matchPackagePattern(matcher.pattern, [
        { name: dependency.name, version: dependency.version ?? "0.0.0-unversioned" }
      ]).matched).map((dependency) => makeTargetId("package", dependency.name));
      return {
        status: "resolved",
        ids,
        reason: ids.length > 0 ? "affects-resolvable.ok" : "affects-resolvable.zero-targets"
      };
    }
  };
}
// ../../../oss/adrkit/packages/evaluator/src/assertions/registry.ts
function createAssertionEngineRegistry(ports = {}) {
  const registry = {
    ...ports.rego ? { rego: ports.rego } : {},
    ...ports.jsonpath ? { jsonpath: ports.jsonpath } : {},
    ...ports.grep ? { grep: ports.grep } : {},
    ...ports.custom ? { custom: ports.custom } : {}
  };
  return registry;
}
// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/parser/parser.js
function peg$subclass(child, parent) {
  function C() {
    this.constructor = child;
  }
  C.prototype = parent.prototype;
  child.prototype = new C;
}
function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}
peg$subclass(peg$SyntaxError, Error);
function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) {
    return str;
  }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}
peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0;k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, " ");
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = last - s.column || 1;
      str += `
 --> ` + loc + `
` + filler + ` |
` + offset_s.line + " | " + line + `
` + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
    } else {
      str += `
 at ` + loc;
    }
  }
  return str;
};
peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return '"' + literalEscape(expectation.text) + '"';
    },
    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
      });
      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },
    any: function() {
      return "any character";
    },
    end: function() {
      return "end of input";
    },
    other: function(expectation) {
      return expectation.description;
    }
  };
  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }
  function literalEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
      return "\\x" + hex(ch);
    });
  }
  function classEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
      return "\\x" + hex(ch);
    });
  }
  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }
  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;
    descriptions.sort();
    if (descriptions.length > 0) {
      for (i = 1, j = 1;i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }
    switch (descriptions.length) {
      case 1:
        return descriptions[0];
      case 2:
        return descriptions[0] + " or " + descriptions[1];
      default:
        return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
    }
  }
  function describeFound(found) {
    return found ? '"' + literalEscape(found) + '"' : "end of input";
  }
  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};
function peg$parse(input, options) {
  options = options !== undefined ? options : {};
  var peg$FAILED = {};
  var peg$source = options.grammarSource;
  var peg$startRuleFunctions = { jsonpath_query: peg$parsejsonpath_query };
  var peg$startRuleFunction = peg$parsejsonpath_query;
  var peg$c0 = "$";
  var peg$c1 = ".";
  var peg$c2 = "..";
  var peg$c3 = "[";
  var peg$c4 = ",";
  var peg$c5 = "]";
  var peg$c6 = "*";
  var peg$c7 = ":";
  var peg$c8 = "?";
  var peg$c9 = '"';
  var peg$c10 = "'";
  var peg$c11 = "0";
  var peg$c12 = "-";
  var peg$c13 = "||";
  var peg$c14 = "\\";
  var peg$c15 = "u";
  var peg$c16 = "&&";
  var peg$c17 = "d";
  var peg$c18 = "(";
  var peg$c19 = ")";
  var peg$c20 = "!";
  var peg$c21 = "==";
  var peg$c22 = "!=";
  var peg$c23 = "<=";
  var peg$c24 = ">=";
  var peg$c25 = "-0";
  var peg$c26 = "true";
  var peg$c27 = "false";
  var peg$c28 = "null";
  var peg$c29 = "@";
  var peg$c30 = "e";
  var peg$r0 = /^[\t-\n\r ]/;
  var peg$r1 = /^[A-Z_a-z\x80-\uD7FF\uE000-\uFFFF]/;
  var peg$r2 = /^[\uD800-\uDBFF]/;
  var peg$r3 = /^[\uDC00-\uDFFF]/;
  var peg$r4 = /^[A-Za-z]/;
  var peg$r5 = /^[0-9]/;
  var peg$r6 = /^[1-9]/;
  var peg$r7 = /^[ -!#-&(-[\]-\uD7FF\uE000-\uFFFF]/;
  var peg$r8 = /^[\/\\bfnrt]/;
  var peg$r9 = /^[A-CE-F]/i;
  var peg$r10 = /^[0-7]/;
  var peg$r11 = /^[8-9]/;
  var peg$r12 = /^[A-B]/i;
  var peg$r13 = /^[C-F]/i;
  var peg$r14 = /^[A-F]/i;
  var peg$r15 = /^[<>]/;
  var peg$r16 = /^[0-9_a-z]/;
  var peg$r17 = /^[+\-]/;
  var peg$r18 = /^[a-z]/;
  var peg$e0 = peg$literalExpectation("$", false);
  var peg$e1 = peg$classExpectation([["\t", `
`], "\r", " "], false, false);
  var peg$e2 = peg$literalExpectation(".", false);
  var peg$e3 = peg$literalExpectation("..", false);
  var peg$e4 = peg$literalExpectation("[", false);
  var peg$e5 = peg$literalExpectation(",", false);
  var peg$e6 = peg$literalExpectation("]", false);
  var peg$e7 = peg$literalExpectation("*", false);
  var peg$e8 = peg$classExpectation([["A", "Z"], "_", ["a", "z"], ["", "퟿"], ["", "￿"]], false, false);
  var peg$e9 = peg$classExpectation([["\uD800", "\uDBFF"]], false, false);
  var peg$e10 = peg$classExpectation([["\uDC00", "\uDFFF"]], false, false);
  var peg$e11 = peg$literalExpectation(":", false);
  var peg$e12 = peg$literalExpectation("?", false);
  var peg$e13 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false);
  var peg$e14 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e15 = peg$literalExpectation('"', false);
  var peg$e16 = peg$literalExpectation("'", false);
  var peg$e17 = peg$literalExpectation("0", false);
  var peg$e18 = peg$literalExpectation("-", false);
  var peg$e19 = peg$classExpectation([["1", "9"]], false, false);
  var peg$e20 = peg$literalExpectation("||", false);
  var peg$e21 = peg$classExpectation([[" ", "!"], ["#", "&"], ["(", "["], ["]", "퟿"], ["", "￿"]], false, false);
  var peg$e22 = peg$literalExpectation("\\", false);
  var peg$e23 = peg$classExpectation(["/", "\\", "b", "f", "n", "r", "t"], false, false);
  var peg$e24 = peg$literalExpectation("u", false);
  var peg$e25 = peg$literalExpectation("&&", false);
  var peg$e26 = peg$classExpectation([["A", "C"], ["E", "F"]], false, true);
  var peg$e27 = peg$literalExpectation("D", true);
  var peg$e28 = peg$classExpectation([["0", "7"]], false, false);
  var peg$e29 = peg$classExpectation([["8", "9"]], false, false);
  var peg$e30 = peg$classExpectation([["A", "B"]], false, true);
  var peg$e31 = peg$classExpectation([["C", "F"]], false, true);
  var peg$e32 = peg$literalExpectation("(", false);
  var peg$e33 = peg$literalExpectation(")", false);
  var peg$e34 = peg$classExpectation([["A", "F"]], false, true);
  var peg$e35 = peg$literalExpectation("!", false);
  var peg$e36 = peg$literalExpectation("==", false);
  var peg$e37 = peg$literalExpectation("!=", false);
  var peg$e38 = peg$literalExpectation("<=", false);
  var peg$e39 = peg$literalExpectation(">=", false);
  var peg$e40 = peg$classExpectation(["<", ">"], false, false);
  var peg$e41 = peg$literalExpectation("-0", false);
  var peg$e42 = peg$literalExpectation("true", false);
  var peg$e43 = peg$literalExpectation("false", false);
  var peg$e44 = peg$literalExpectation("null", false);
  var peg$e45 = peg$literalExpectation("@", false);
  var peg$e46 = peg$classExpectation([["0", "9"], "_", ["a", "z"]], false, false);
  var peg$e47 = peg$literalExpectation("e", true);
  var peg$e48 = peg$classExpectation(["+", "-"], false, false);
  var peg$e49 = peg$classExpectation([["a", "z"]], false, false);
  var peg$f0 = function(segments) {
    return {
      type: "JsonPathQuery",
      segments
    };
  };
  var peg$f1 = function(value) {
    return value;
  };
  var peg$f2 = function(value) {
    return value;
  };
  var peg$f3 = function(node) {
    return { type: "ChildSegment", node };
  };
  var peg$f4 = function(node) {
    return { type: "DescendantSegment", node };
  };
  var peg$f5 = function(main, child) {
    return child;
  };
  var peg$f6 = function(main, rest) {
    return [main, ...rest];
  };
  var peg$f7 = function(selectors) {
    return {
      type: "BracketedSelection",
      selectors
    };
  };
  var peg$f8 = function() {
    return { type: "WildcardSelector" };
  };
  var peg$f9 = function(value) {
    return { type: "MemberNameShorthand", value };
  };
  var peg$f10 = function(value) {
    return { type: "NameSelector", value };
  };
  var peg$f11 = function(start, end, value) {
    return value;
  };
  var peg$f12 = function(start, end, step) {
    return { start, end, step };
  };
  var peg$f13 = function(values) {
    return {
      type: "SliceSelector",
      start: values.start === "" ? null : Number.parseInt(values.start.trim(), 10),
      end: values.end === "" ? null : Number.parseInt(values.end.trim(), 10),
      step: values.step === "" || values.step === null ? null : Number.parseInt(values.step.trim(), 10)
    };
  };
  var peg$f14 = function(value) {
    return { type: "IndexSelector", value: Number.parseInt(value, 10) };
  };
  var peg$f15 = function(value) {
    return { type: "FilterSelector", value };
  };
  var peg$f16 = function(value) {
    return value;
  };
  var peg$f17 = function(value) {
    return value;
  };
  var peg$f18 = function(value) {
    return value.join("");
  };
  var peg$f19 = function() {
    return '"';
  };
  var peg$f20 = function(value) {
    switch (value) {
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return `
`;
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "/":
        return "/";
      case "\\":
        return "\\";
      default:
        return value.slice(1);
    }
  };
  var peg$f21 = function() {
    return "'";
  };
  var peg$f22 = function(value) {
    switch (value) {
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return `
`;
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "/":
        return "/";
      case "\\":
        return "\\";
      default:
        return value.slice(1);
    }
  };
  var peg$f23 = function(left, value) {
    return value;
  };
  var peg$f24 = function(left, rest) {
    return rest.length === 0 ? left : {
      type: "LogicalOrExpr",
      left,
      right: rest.length === 1 ? rest[0] : rest.slice(1).reduce((acc, curr) => ({
        type: "LogicalOrExpr",
        left: acc,
        right: curr
      }), rest[0])
    };
  };
  var peg$f25 = function(main, value) {
    return value;
  };
  var peg$f26 = function(main, rest) {
    return [main, ...rest];
  };
  var peg$f27 = function(conditions) {
    return conditions.length === 1 ? conditions[0] : {
      type: "LogicalAndExpr",
      left: conditions[0],
      right: conditions.length === 2 ? conditions[1] : conditions.slice(2).reduce((acc, curr) => ({
        type: "LogicalOrExpr",
        left: acc,
        right: curr
      }), conditions[1])
    };
  };
  var peg$f28 = function() {
    return String.fromCharCode(Number.parseInt(text(), 16));
  };
  var peg$f29 = function(h, l) {
    return String.fromCharCode(Number.parseInt(h, 16)) + String.fromCharCode(Number.parseInt(l, 16));
  };
  var peg$f30 = function(value) {
    return value;
  };
  var peg$f31 = function(not, expression) {
    return not !== null ? {
      type: "LogicalNotExpr",
      expression
    } : expression;
  };
  var peg$f32 = function(left, op, right) {
    return {
      type: "ComparisonExpr",
      left,
      op,
      right
    };
  };
  var peg$f33 = function(not, expression) {
    return not !== null ? {
      type: "LogicalNotExpr",
      expression: {
        type: "TestExpr",
        expression
      }
    } : {
      type: "TestExpr",
      expression
    };
  };
  var peg$f34 = function(value) {
    return { type: "FilterQuery", value };
  };
  var peg$f35 = function(name, f, rest) {
    return rest;
  };
  var peg$f36 = function(name, f, r) {
    return [f, ...r];
  };
  var peg$f37 = function(name, args) {
    return {
      type: "FunctionExpr",
      name,
      arguments: args
    };
  };
  var peg$f38 = function(value) {
    return { type: "Literal", value };
  };
  var peg$f39 = function(segments) {
    return { type: "RelQuery", segments };
  };
  var peg$f40 = function(value) {
    return Number(value);
  };
  var peg$f41 = function() {
    return true;
  };
  var peg$f42 = function() {
    return false;
  };
  var peg$f43 = function() {
    return null;
  };
  var peg$f44 = function(segments) {
    return { type: "RelSingularQuery", segments };
  };
  var peg$f45 = function(segments) {
    return { type: "AbsSingularQuery", segments };
  };
  var peg$f46 = function(segment) {
    return {
      type: "SingularQuerySegment",
      node: segment
    };
  };
  var peg$f47 = function(segments) {
    return segments;
  };
  var peg$f48 = function(value) {
    return value;
  };
  var peg$f49 = function(value) {
    return value;
  };
  var peg$f50 = function(selector) {
    return { type: "IndexSelector", selector };
  };
  var peg$currPos = options.peg$currPos | 0;
  var peg$savedPos = peg$currPos;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = peg$currPos;
  var peg$maxFailExpected = options.peg$maxFailExpected || [];
  var peg$silentFails = options.peg$silentFails | 0;
  var peg$result;
  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }
  function offset() {
    return peg$savedPos;
  }
  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }
  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }
  function expected(description, location) {
    location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location);
  }
  function error(message, location) {
    location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message, location);
  }
  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts, inverted, ignoreCase };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;
    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {}
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);
    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset && peg$source && typeof peg$source.offset === "function") {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }
  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected);
  }
  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }
  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
  }
  function peg$parsejsonpath_query() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseroot_identifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesegments();
      peg$savedPos = s0;
      s0 = peg$f0(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseroot_identifier() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 36) {
      s0 = peg$c0;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    return s0;
  }
  function peg$parsesegments() {
    var s0, s1, s2, s3;
    s0 = [];
    s1 = peg$currPos;
    s2 = peg$parseS();
    s3 = peg$parsesegment();
    if (s3 !== peg$FAILED) {
      peg$savedPos = s1;
      s1 = peg$f1(s3);
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$currPos;
      s2 = peg$parseS();
      s3 = peg$parsesegment();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s1;
        s1 = peg$f1(s3);
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseS() {
    var s0, s1;
    s0 = [];
    s1 = peg$parseB();
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$parseB();
    }
    return s0;
  }
  function peg$parsesegment() {
    var s0;
    s0 = peg$parsechild_segment();
    if (s0 === peg$FAILED) {
      s0 = peg$parsedescendant_segment();
    }
    return s0;
  }
  function peg$parseB() {
    var s0;
    s0 = input.charAt(peg$currPos);
    if (peg$r0.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e1);
      }
    }
    return s0;
  }
  function peg$parsechild_segment() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsebracketed_selection();
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c1;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e2);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsewildcard_selector();
        if (s3 === peg$FAILED) {
          s3 = peg$parsemember_name_shorthand();
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s1;
          s1 = peg$f2(s3);
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f3(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsedescendant_segment() {
    var s0, s1, s2;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c2) {
      s1 = peg$c2;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e3);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsebracketed_selection();
      if (s2 === peg$FAILED) {
        s2 = peg$parsewildcard_selector();
        if (s2 === peg$FAILED) {
          s2 = peg$parsemember_name_shorthand();
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f4(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsebracketed_selection() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c3;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parseS();
      s4 = peg$parseselector();
      if (s4 !== peg$FAILED) {
        s5 = [];
        s6 = peg$currPos;
        s7 = peg$parseS();
        if (input.charCodeAt(peg$currPos) === 44) {
          s8 = peg$c4;
          peg$currPos++;
        } else {
          s8 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e5);
          }
        }
        if (s8 !== peg$FAILED) {
          s9 = peg$parseS();
          s10 = peg$parseselector();
          if (s10 !== peg$FAILED) {
            peg$savedPos = s6;
            s6 = peg$f5(s4, s10);
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        while (s6 !== peg$FAILED) {
          s5.push(s6);
          s6 = peg$currPos;
          s7 = peg$parseS();
          if (input.charCodeAt(peg$currPos) === 44) {
            s8 = peg$c4;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s8 !== peg$FAILED) {
            s9 = peg$parseS();
            s10 = peg$parseselector();
            if (s10 !== peg$FAILED) {
              peg$savedPos = s6;
              s6 = peg$f5(s4, s10);
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
        }
        peg$savedPos = s2;
        s2 = peg$f6(s4, s5);
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseS();
        if (input.charCodeAt(peg$currPos) === 93) {
          s4 = peg$c5;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s4 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f7(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsewildcard_selector() {
    var s0, s1;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 42) {
      s1 = peg$c6;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e7);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f8();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsemember_name_shorthand() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$parsename_first();
    if (s3 !== peg$FAILED) {
      s4 = [];
      s5 = peg$parsename_char();
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parsename_char();
      }
      s3 = [s3, s4];
      s2 = s3;
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f9(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseselector() {
    var s0;
    s0 = peg$parsename_selector();
    if (s0 === peg$FAILED) {
      s0 = peg$parsewildcard_selector();
      if (s0 === peg$FAILED) {
        s0 = peg$parseslice_selector();
        if (s0 === peg$FAILED) {
          s0 = peg$parseindex_selector();
          if (s0 === peg$FAILED) {
            s0 = peg$parsefilter_selector();
          }
        }
      }
    }
    return s0;
  }
  function peg$parsename_first() {
    var s0, s1, s2;
    s0 = input.charAt(peg$currPos);
    if (peg$r1.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e8);
      }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = input.charAt(peg$currPos);
      if (peg$r2.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e9);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = input.charAt(peg$currPos);
        if (peg$r3.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e10);
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parsename_char() {
    var s0;
    s0 = peg$parsename_first();
    if (s0 === peg$FAILED) {
      s0 = peg$parseDIGIT();
    }
    return s0;
  }
  function peg$parsename_selector() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsestring_literal();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f10(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseslice_selector() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$currPos;
    s4 = peg$parseint();
    if (s4 !== peg$FAILED) {
      s5 = peg$parseS();
      s4 = [s4, s5];
      s3 = s4;
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 === peg$FAILED) {
      s3 = null;
    }
    s2 = input.substring(s2, peg$currPos);
    if (input.charCodeAt(peg$currPos) === 58) {
      s3 = peg$c7;
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e11);
      }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parseS();
      s5 = peg$currPos;
      s6 = peg$currPos;
      s7 = peg$parseint();
      if (s7 !== peg$FAILED) {
        s8 = peg$parseS();
        s7 = [s7, s8];
        s6 = s7;
      } else {
        peg$currPos = s6;
        s6 = peg$FAILED;
      }
      if (s6 === peg$FAILED) {
        s6 = null;
      }
      s5 = input.substring(s5, peg$currPos);
      s6 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 58) {
        s7 = peg$c7;
        peg$currPos++;
      } else {
        s7 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e11);
        }
      }
      if (s7 !== peg$FAILED) {
        s8 = peg$currPos;
        s9 = peg$currPos;
        s10 = peg$parseS();
        s11 = peg$parseint();
        if (s11 === peg$FAILED) {
          s11 = null;
        }
        s10 = [s10, s11];
        s9 = s10;
        s8 = input.substring(s8, peg$currPos);
        peg$savedPos = s6;
        s6 = peg$f11(s2, s5, s8);
      } else {
        peg$currPos = s6;
        s6 = peg$FAILED;
      }
      if (s6 === peg$FAILED) {
        s6 = null;
      }
      peg$savedPos = s1;
      s1 = peg$f12(s2, s5, s6);
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f13(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseindex_selector() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseint();
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f14(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsefilter_selector() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 63) {
      s1 = peg$c8;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e12);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseS();
      s3 = peg$parselogical_or_expr();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f15(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseALPHA() {
    var s0;
    s0 = input.charAt(peg$currPos);
    if (peg$r4.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e13);
      }
    }
    return s0;
  }
  function peg$parseDIGIT() {
    var s0;
    s0 = input.charAt(peg$currPos);
    if (peg$r5.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e14);
      }
    }
    return s0;
  }
  function peg$parsestring_literal() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s2 = peg$c9;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e15);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = [];
      s4 = peg$parsedouble_quoted();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parsedouble_quoted();
      }
      if (input.charCodeAt(peg$currPos) === 34) {
        s4 = peg$c9;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e15);
        }
      }
      if (s4 !== peg$FAILED) {
        peg$savedPos = s1;
        s1 = peg$f16(s3);
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c10;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e16);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsesingle_quoted();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsesingle_quoted();
        }
        if (input.charCodeAt(peg$currPos) === 39) {
          s4 = peg$c10;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e16);
          }
        }
        if (s4 !== peg$FAILED) {
          peg$savedPos = s1;
          s1 = peg$f17(s3);
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f18(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parseint() {
    var s0, s1, s2, s3, s4;
    if (input.charCodeAt(peg$currPos) === 48) {
      s0 = peg$c11;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e17);
      }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 45) {
        s1 = peg$c12;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e18);
        }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      s2 = peg$parseDIGIT1();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseDIGIT();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parseDIGIT();
        }
        s1 = [s1, s2, s3];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parsedouble_quoted() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseunescaped();
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 39) {
        s0 = peg$c10;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e16);
        }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseESC();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s2 = peg$c9;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e15);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f19();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseESC();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseescapable();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f20(s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }
    return s0;
  }
  function peg$parsesingle_quoted() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseunescaped();
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 34) {
        s0 = peg$c9;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e15);
        }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseESC();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s2 = peg$c10;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e16);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f21();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseESC();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseescapable();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f22(s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }
    return s0;
  }
  function peg$parseDIGIT1() {
    var s0;
    s0 = input.charAt(peg$currPos);
    if (peg$r6.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e19);
      }
    }
    return s0;
  }
  function peg$parselogical_or_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7;
    s0 = peg$currPos;
    s1 = peg$parselogical_and_expr();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parseS();
      if (input.substr(peg$currPos, 2) === peg$c13) {
        s5 = peg$c13;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parseS();
        s7 = peg$parselogical_and_expr();
        if (s7 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f23(s1, s7);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parseS();
        if (input.substr(peg$currPos, 2) === peg$c13) {
          s5 = peg$c13;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e20);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parseS();
          s7 = peg$parselogical_and_expr();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f23(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$savedPos = s0;
      s0 = peg$f24(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseunescaped() {
    var s0, s1, s2;
    s0 = input.charAt(peg$currPos);
    if (peg$r7.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e21);
      }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = input.charAt(peg$currPos);
      if (peg$r2.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e9);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = input.charAt(peg$currPos);
        if (peg$r3.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e10);
          }
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseESC() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 92) {
      s0 = peg$c14;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e22);
      }
    }
    return s0;
  }
  function peg$parseescapable() {
    var s0, s1, s2;
    s0 = input.charAt(peg$currPos);
    if (peg$r8.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e23);
      }
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 117) {
        s1 = peg$c15;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e24);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsehexchar();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parselogical_and_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsebasic_expr();
    if (s2 !== peg$FAILED) {
      s3 = [];
      s4 = peg$currPos;
      s5 = peg$parseS();
      if (input.substr(peg$currPos, 2) === peg$c16) {
        s6 = peg$c16;
        peg$currPos += 2;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e25);
        }
      }
      if (s6 !== peg$FAILED) {
        s7 = peg$parseS();
        s8 = peg$parsebasic_expr();
        if (s8 !== peg$FAILED) {
          peg$savedPos = s4;
          s4 = peg$f25(s2, s8);
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$currPos;
        s5 = peg$parseS();
        if (input.substr(peg$currPos, 2) === peg$c16) {
          s6 = peg$c16;
          peg$currPos += 2;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e25);
          }
        }
        if (s6 !== peg$FAILED) {
          s7 = peg$parseS();
          s8 = peg$parsebasic_expr();
          if (s8 !== peg$FAILED) {
            peg$savedPos = s4;
            s4 = peg$f25(s2, s8);
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
      }
      peg$savedPos = s1;
      s1 = peg$f26(s2, s3);
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f27(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsehexchar() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsenon_surrogate();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s1;
      s2 = peg$f28();
    }
    s1 = s2;
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$currPos;
      s3 = peg$parsehigh_surrogate();
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s3 = peg$c14;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e22);
          }
        }
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 117) {
            s4 = peg$c15;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e24);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$currPos;
            s6 = peg$parselow_surrogate();
            if (s6 !== peg$FAILED) {
              s5 = input.substring(s5, peg$currPos);
            } else {
              s5 = s6;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s1;
              s1 = peg$f29(s2, s5);
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f30(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsebasic_expr() {
    var s0;
    s0 = peg$parseparen_expr();
    if (s0 === peg$FAILED) {
      s0 = peg$parsecomparison_expr();
      if (s0 === peg$FAILED) {
        s0 = peg$parsetest_expr();
      }
    }
    return s0;
  }
  function peg$parsenon_surrogate() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseDIGIT();
    if (s1 === peg$FAILED) {
      s1 = input.charAt(peg$currPos);
      if (peg$r9.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e26);
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = [];
      s4 = peg$parseHEXDIG();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        if (s3.length >= 3) {
          s4 = peg$FAILED;
        } else {
          s4 = peg$parseHEXDIG();
        }
      }
      if (s3.length < 3) {
        peg$currPos = s2;
        s2 = peg$FAILED;
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = input.charAt(peg$currPos);
      if (s1.toLowerCase() === peg$c17) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e27);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = input.charAt(peg$currPos);
        if (peg$r10.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          s4 = [];
          s5 = peg$parseHEXDIG();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            if (s4.length >= 2) {
              s5 = peg$FAILED;
            } else {
              s5 = peg$parseHEXDIG();
            }
          }
          if (s4.length < 2) {
            peg$currPos = s3;
            s3 = peg$FAILED;
          } else {
            s3 = s4;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parsehigh_surrogate() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (s1.toLowerCase() === peg$c17) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e27);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = input.charAt(peg$currPos);
      if (peg$r11.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e29);
        }
      }
      if (s2 === peg$FAILED) {
        s2 = input.charAt(peg$currPos);
        if (peg$r12.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e30);
          }
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parseHEXDIG();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          if (s4.length >= 2) {
            s5 = peg$FAILED;
          } else {
            s5 = peg$parseHEXDIG();
          }
        }
        if (s4.length < 2) {
          peg$currPos = s3;
          s3 = peg$FAILED;
        } else {
          s3 = s4;
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parselow_surrogate() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (s1.toLowerCase() === peg$c17) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e27);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = input.charAt(peg$currPos);
      if (peg$r13.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e31);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parseHEXDIG();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          if (s4.length >= 2) {
            s5 = peg$FAILED;
          } else {
            s5 = peg$parseHEXDIG();
          }
        }
        if (s4.length < 2) {
          peg$currPos = s3;
          s3 = peg$FAILED;
        } else {
          s3 = s4;
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseparen_expr() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parselogical_not_op();
    if (s2 !== peg$FAILED) {
      s3 = peg$parseS();
      s2 = [s2, s3];
      s1 = s2;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    if (input.charCodeAt(peg$currPos) === 40) {
      s2 = peg$c18;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e32);
      }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parseS();
      s4 = peg$parselogical_or_expr();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseS();
        if (input.charCodeAt(peg$currPos) === 41) {
          s6 = peg$c19;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e33);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f31(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecomparison_expr() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecomparable();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseS();
      s3 = peg$parsecomparison_op();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseS();
        s5 = peg$parsecomparable();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f32(s1, s3, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsetest_expr() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parselogical_not_op();
    if (s2 !== peg$FAILED) {
      s3 = peg$parseS();
      s2 = [s2, s3];
      s1 = s2;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = null;
    }
    s2 = peg$parsefilter_query();
    if (s2 === peg$FAILED) {
      s2 = peg$parsefunction_expr();
    }
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f33(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseHEXDIG() {
    var s0;
    s0 = peg$parseDIGIT();
    if (s0 === peg$FAILED) {
      s0 = input.charAt(peg$currPos);
      if (peg$r14.test(s0)) {
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e34);
        }
      }
    }
    return s0;
  }
  function peg$parselogical_not_op() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 33) {
      s0 = peg$c20;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e35);
      }
    }
    return s0;
  }
  function peg$parsecomparable() {
    var s0;
    s0 = peg$parseliteral();
    if (s0 === peg$FAILED) {
      s0 = peg$parsesingular_query();
      if (s0 === peg$FAILED) {
        s0 = peg$parsefunction_expr();
      }
    }
    return s0;
  }
  function peg$parsecomparison_op() {
    var s0;
    if (input.substr(peg$currPos, 2) === peg$c21) {
      s0 = peg$c21;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e36);
      }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c22) {
        s0 = peg$c22;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e37);
        }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c23) {
          s0 = peg$c23;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e38);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c24) {
            s0 = peg$c24;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e39);
            }
          }
          if (s0 === peg$FAILED) {
            s0 = input.charAt(peg$currPos);
            if (peg$r15.test(s0)) {
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e40);
              }
            }
          }
        }
      }
    }
    return s0;
  }
  function peg$parsefilter_query() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = peg$parserel_query();
    if (s1 === peg$FAILED) {
      s1 = peg$parsejsonpath_query();
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f34(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsefunction_expr() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
    s0 = peg$currPos;
    s1 = peg$parsefunction_name();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 40) {
        s2 = peg$c18;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e32);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseS();
        s4 = peg$currPos;
        s5 = peg$parsefunction_argument();
        if (s5 !== peg$FAILED) {
          s6 = [];
          s7 = peg$currPos;
          s8 = peg$parseS();
          if (input.charCodeAt(peg$currPos) === 44) {
            s9 = peg$c4;
            peg$currPos++;
          } else {
            s9 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s9 !== peg$FAILED) {
            s10 = peg$parseS();
            s11 = peg$parsefunction_argument();
            if (s11 !== peg$FAILED) {
              peg$savedPos = s7;
              s7 = peg$f35(s1, s5, s11);
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          } else {
            peg$currPos = s7;
            s7 = peg$FAILED;
          }
          while (s7 !== peg$FAILED) {
            s6.push(s7);
            s7 = peg$currPos;
            s8 = peg$parseS();
            if (input.charCodeAt(peg$currPos) === 44) {
              s9 = peg$c4;
              peg$currPos++;
            } else {
              s9 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e5);
              }
            }
            if (s9 !== peg$FAILED) {
              s10 = peg$parseS();
              s11 = peg$parsefunction_argument();
              if (s11 !== peg$FAILED) {
                peg$savedPos = s7;
                s7 = peg$f35(s1, s5, s11);
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
            } else {
              peg$currPos = s7;
              s7 = peg$FAILED;
            }
          }
          peg$savedPos = s4;
          s4 = peg$f36(s1, s5, s6);
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parseS();
        if (input.charCodeAt(peg$currPos) === 41) {
          s6 = peg$c19;
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e33);
          }
        }
        if (s6 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f37(s1, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseliteral() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsenumber();
    if (s1 === peg$FAILED) {
      s1 = peg$parsestring_literal();
      if (s1 === peg$FAILED) {
        s1 = peg$parsetrue();
        if (s1 === peg$FAILED) {
          s1 = peg$parsefalse();
          if (s1 === peg$FAILED) {
            s1 = peg$parsenull();
          }
        }
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f38(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsesingular_query() {
    var s0;
    s0 = peg$parserel_singular_query();
    if (s0 === peg$FAILED) {
      s0 = peg$parseabs_singular_query();
    }
    return s0;
  }
  function peg$parserel_query() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsecurrent_node_identifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesegments();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f39(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsefunction_name() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parseLCALPHA();
    if (s2 !== peg$FAILED) {
      s3 = [];
      s4 = peg$parsefunction_name_char();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parsefunction_name_char();
      }
      s2 = [s2, s3];
      s1 = s2;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    return s0;
  }
  function peg$parsefunction_argument() {
    var s0;
    s0 = peg$parseliteral();
    if (s0 === peg$FAILED) {
      s0 = peg$parsefilter_query();
      if (s0 === peg$FAILED) {
        s0 = peg$parsefunction_expr();
        if (s0 === peg$FAILED) {
          s0 = peg$parselogical_or_expr();
        }
      }
    }
    return s0;
  }
  function peg$parsenumber() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = peg$parseint();
    if (s3 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c25) {
        s3 = peg$c25;
        peg$currPos += 2;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e41);
        }
      }
    }
    if (s3 !== peg$FAILED) {
      s4 = peg$parsefrac();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      s5 = peg$parseexp();
      if (s5 === peg$FAILED) {
        s5 = null;
      }
      s3 = [s3, s4, s5];
      s2 = s3;
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f40(s1);
    }
    s0 = s1;
    return s0;
  }
  function peg$parsetrue() {
    var s0, s1;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c26) {
      s1 = peg$c26;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e42);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f41();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsefalse() {
    var s0, s1;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c27) {
      s1 = peg$c27;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e43);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f42();
    }
    s0 = s1;
    return s0;
  }
  function peg$parsenull() {
    var s0, s1;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c28) {
      s1 = peg$c28;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e44);
      }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f43();
    }
    s0 = s1;
    return s0;
  }
  function peg$parserel_singular_query() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parsecurrent_node_identifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesingular_query_segments();
      peg$savedPos = s0;
      s0 = peg$f44(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseabs_singular_query() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseroot_identifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsesingular_query_segments();
      peg$savedPos = s0;
      s0 = peg$f45(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsecurrent_node_identifier() {
    var s0;
    if (input.charCodeAt(peg$currPos) === 64) {
      s0 = peg$c29;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e45);
      }
    }
    return s0;
  }
  function peg$parsefunction_name_char() {
    var s0;
    s0 = input.charAt(peg$currPos);
    if (peg$r16.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e46);
      }
    }
    return s0;
  }
  function peg$parsefrac() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 46) {
      s1 = peg$c1;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseDIGIT();
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDIGIT();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseexp() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (s1.toLowerCase() === peg$c30) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e47);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = input.charAt(peg$currPos);
      if (peg$r17.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e48);
        }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = [];
      s4 = peg$parseDIGIT();
      if (s4 !== peg$FAILED) {
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parseDIGIT();
        }
      } else {
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s1 = [s1, s2, s3];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parsesingular_query_segments() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$currPos;
    s3 = peg$parseS();
    s4 = peg$parsename_segment();
    if (s4 === peg$FAILED) {
      s4 = peg$parseindex_segment();
    }
    if (s4 !== peg$FAILED) {
      peg$savedPos = s2;
      s2 = peg$f46(s4);
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$currPos;
      s3 = peg$parseS();
      s4 = peg$parsename_segment();
      if (s4 === peg$FAILED) {
        s4 = peg$parseindex_segment();
      }
      if (s4 !== peg$FAILED) {
        peg$savedPos = s2;
        s2 = peg$f46(s4);
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    peg$savedPos = s0;
    s1 = peg$f47(s1);
    s0 = s1;
    return s0;
  }
  function peg$parseLCALPHA() {
    var s0;
    s0 = input.charAt(peg$currPos);
    if (peg$r18.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e49);
      }
    }
    return s0;
  }
  function peg$parsename_segment() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c3;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsename_selector();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c5;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f48(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c1;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e2);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsemember_name_shorthand();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f49(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseindex_segment() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c3;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseindex_selector();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c5;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f50(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  peg$result = peg$startRuleFunction();
  if (options.peg$library) {
    return {
      peg$result,
      peg$currPos,
      peg$FAILED,
      peg$maxFailExpected,
      peg$maxFailPos
    };
  }
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/parser/index.js
function parser_default(input) {
  return peg$parse(input);
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/stack.js
class Stack {
  head = null;
  tail = null;
  size = 0;
  push(element) {
    const newNode = { value: element, next: null };
    if (this.tail !== null) {
      this.tail.next = newNode;
    }
    this.tail = newNode;
    if (this.head === null) {
      this.head = newNode;
    }
    this.size++;
  }
  pop() {
    if (this.head === null)
      return;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) {
      this.tail = null;
    }
    this.size--;
    return value;
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/guards.js
function isPlainObject2(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
var isStackItemWithArrayValue = (item) => Array.isArray(item.value);
var isStackItemWithObjectValue = (item) => isPlainObject2(item.value);

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/results.js
var nodeLists = new WeakSet;
var isNodeList = (value) => {
  return typeof value === "object" && value !== null && nodeLists.has(value);
};
var isJsonValue = (value) => {
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return true;
    case "object":
      return value === null || isPlainObject2(value) || isArray(value);
    default:
      return false;
  }
};
var isArray = (value) => Array.isArray(value) && !isNodeList(value);
var createNodeList = () => {
  const list = [];
  nodeLists.add(list);
  return list;
};
var Nothing = Symbol("Nothing");

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/functions/count.js
var count_default = {
  declaration: function count(ctx, value) {
    if (isNodeList(value)) {
      return value.length;
    }
    return 0;
  },
  definition: {
    parameters: ["NodesType"],
    returnType: "ValueType"
  }
};

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/functions/length.js
function countUnicodeScalarValues(str) {
  let count = 0;
  for (let i = 0;i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0 && code <= 55295 || code >= 57344 && code <= 1114111) {
      count++;
    }
  }
  return count;
}
var length_default = {
  declaration: function length(ctx, value) {
    if (typeof value === "string") {
      return countUnicodeScalarValues(value);
    }
    if (Array.isArray(value)) {
      return value.length;
    }
    if (isPlainObject2(value)) {
      return Object.keys(value).length;
    }
    return Nothing;
  },
  definition: {
    parameters: ["ValueType"],
    returnType: "ValueType"
  }
};

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/functions/utils/construct-regex.js
function isBackslash(code) {
  return code === 92;
}
function eatCharacterClass(pattern, start) {
  let maybeEscaped = false;
  let i = start;
  while (i < pattern.length) {
    const ch = pattern.charCodeAt(i);
    i++;
    if (isBackslash(ch)) {
      maybeEscaped = true;
      continue;
    }
    if (ch === 93) {
      if (!maybeEscaped) {
        break;
      }
      maybeEscaped = false;
    }
  }
  return i;
}
function toEcmaScriptPattern(pattern) {
  let ecmaScriptPattern = pattern;
  for (let i = 0;i < pattern.length; i++) {
    const ch = pattern.charCodeAt(i);
    if (isBackslash(ch)) {
      i++;
    } else if (ch === 91) {
      i = eatCharacterClass(pattern, i);
    } else if (ch === 46) {
      ecmaScriptPattern = `${pattern.slice(0, i)}[^
\r]${pattern.slice(i + 1)}`;
    }
  }
  return ecmaScriptPattern;
}
function constructRegex({ cache }, pattern) {
  const store = cache.get("regexps") ?? {};
  if (!cache.has("regexps")) {
    cache.set("regexps", store);
  }
  if (Object.hasOwn(store, pattern)) {
    return store[pattern];
  }
  try {
    const r = RegExp(toEcmaScriptPattern(pattern), "u");
    store[pattern] = r;
    return r;
  } catch {
    store[pattern] = null;
    return null;
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/functions/match.js
var match_default = {
  declaration: function match(ctx, value, pattern) {
    if (typeof value !== "string" || typeof pattern !== "string") {
      return false;
    }
    return constructRegex(ctx, `^${pattern}$`)?.test(value) === true;
  },
  definition: {
    parameters: ["ValueType", "ValueType"],
    returnType: "LogicalType"
  }
};

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/functions/search.js
var search_default = {
  declaration: function search(ctx, value, pattern) {
    if (typeof value !== "string" || typeof pattern !== "string") {
      return false;
    }
    return constructRegex(ctx, pattern)?.test(value) === true;
  },
  definition: {
    parameters: ["ValueType", "ValueType"],
    returnType: "LogicalType"
  }
};

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/functions/value.js
var value_default = {
  declaration: function value(ctx, nodes) {
    if (nodes.length === 1) {
      return nodes[0];
    }
    return Nothing;
  },
  definition: {
    parameters: ["NodesType"],
    returnType: "ValueType"
  }
};

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/path.js
var EMPTY_PATH = [];
function joinPathWithKey(path, key) {
  if (path === EMPTY_PATH) {
    return EMPTY_PATH;
  }
  if (typeof key === "number") {
    return [...path, key];
  }
  return [...path, toNormalizedKey(key)];
}
function getInitialPath(capturePaths) {
  return capturePaths ? [] : EMPTY_PATH;
}
var ESCAPE_REGEX = /[\u0000-\u001f'\\]/g;
function escapeValue(ch) {
  const code = ch.charCodeAt(0);
  switch (code) {
    case 8:
      return "\\b";
    case 12:
      return "\\f";
    case 10:
      return "\\n";
    case 13:
      return "\\r";
    case 9:
      return "\\t";
    case 39:
      return "\\'";
    case 92:
      return "\\\\";
    default:
      return `\\u${code.toString(16).padStart(4, "0")}`;
  }
}
function toNormalizedKey(key) {
  return key.replace(ESCAPE_REGEX, escapeValue);
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/assertions.js
function assertDefinedNodeType(node) {
  throw new TypeError(`Unexpected node type: ${node["type"]}`);
}
function assertDefinedComparisonOp(op) {
  throw new TypeError(`Unexpected comparison operator: ${op}`);
}
function assertNever(_, message) {
  throw new Error(message);
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/get-type.js
function getType(value) {
  switch (typeof value) {
    case "object":
      if (value === null) {
        return "null";
      }
      if (isNodeList(value)) {
        return "NodeList";
      }
      if (isArray(value)) {
        return "array";
      }
      if (isPlainObject2(value)) {
        return "object";
      }
      throw new TypeError(`Unknown type: ${value}`);
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      if (value === Nothing) {
        return "Nothing";
      }
      throw new TypeError(`Unknown type: ${value}`);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/is-equal.js
function isEqualArray(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0;i < a.length; i++) {
    if (!isEqual(a[i], b[i])) {
      return false;
    }
  }
  return true;
}
function isEqualObject(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!Object.hasOwn(b, key)) {
      return false;
    }
    if (!isEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
function isEqual(left, right) {
  if (getType(left) !== getType(right)) {
    return false;
  }
  switch (getType(left)) {
    case "string":
    case "number":
    case "boolean":
    case "null":
      return left === right;
    case "object":
      return isEqualObject(left, right);
    case "array":
    case "NodeList":
      return isEqualArray(left, right);
    default:
      return false;
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/array.js
function compareArrays(a, b, op) {
  switch (op) {
    case "==":
    case ">=":
    case "<=":
      return !isNodeList(a) && !isNodeList(b) && isEqual(a, b);
    case "<":
    case ">":
      return false;
    case "!=":
      return !compareArrays(a, b, "==");
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/node-lists.js
function compareNodeLists(a, b, op) {
  switch (op) {
    case "==":
    case "<=":
    case ">=":
      return isNodeList(a) && (isNodeList(b) && isEqual(a, b) || b === Nothing);
    case "<":
    case ">":
      return false;
    case "!=":
      return !compareNodeLists(a, b, "==");
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/nothing.js
function compareNothing(a, b, op) {
  switch (op) {
    case "==":
    case "<=":
    case ">=":
      return b === Nothing || isNodeList(b) && b.length === 0;
    case "<":
    case ">":
      return false;
    case "!=":
      return !compareNothing(a, b, "==");
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/number.js
function compareNumbers(a, b, op) {
  switch (op) {
    case "==":
      return a === b;
    case "<":
      return typeof b === "number" && a < b;
    case "!=":
      return !compareNumbers(a, b, "==");
    case "<=":
      return compareNumbers(a, b, "<") || compareNumbers(a, b, "==");
    case ">":
      return typeof b === "number" && compareNumbers(b, a, "<");
    case ">=":
      return typeof b === "number" && compareNumbers(b, a, "<") || compareNumbers(a, b, "==");
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/object.js
function compareObjects(a, b, op) {
  switch (op) {
    case "==":
    case "<=":
    case ">=":
      return isEqual(a, b);
    case "<":
    case ">":
      return false;
    case "!=":
      return !isEqual(a, b);
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/primitives.js
function comparePrimitives(a, b, op) {
  switch (op) {
    case "==":
    case "<=":
    case ">=":
      return a === b;
    case "<":
    case ">":
      return false;
    case "!=":
      return !comparePrimitives(a, b, "==");
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/string.js
function compareString(a, b, op) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  switch (op) {
    case "==":
      return a === b;
    case "<": {
      let index = 0;
      while (a.length > index && b.length > index) {
        const leftCode = a.charCodeAt(index);
        const rightCode = b.charCodeAt(index);
        if (leftCode === rightCode) {
          index++;
          continue;
        }
        return a.charCodeAt(index) < b.charCodeAt(index);
      }
      return a.length < b.length;
    }
    default:
      assertDefinedComparisonOp(op);
  }
}
function string_default(a, b, op) {
  switch (op) {
    case "==":
    case "<":
      return compareString(a, b, op);
    case "!=":
      return !compareString(a, b, "==");
    case "<=":
      return compareString(a, b, "<") || compareString(a, b, "==");
    case ">":
      return compareString(b, a, "<");
    case ">=":
      return compareString(b, a, "<") || compareString(a, b, "==");
    default:
      assertDefinedComparisonOp(op);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/utils/comparers/compare.js
function compare(a, b, op) {
  const leftValue = isNodeList(a) && a.length === 1 ? a[0] : a;
  const leftType = getType(leftValue);
  const rightValue = isNodeList(b) && b.length === 1 ? b[0] : b;
  switch (leftType) {
    case "string":
      return string_default(leftValue, rightValue, op);
    case "number":
      return compareNumbers(leftValue, rightValue, op);
    case "boolean":
    case "null":
      return comparePrimitives(leftValue, rightValue, op);
    case "object":
      return compareObjects(leftValue, rightValue, op);
    case "array":
      return compareArrays(leftValue, rightValue, op);
    case "Nothing":
      return compareNothing(leftValue, rightValue, op);
    case "NodeList":
      return compareNodeLists(leftValue, rightValue, op);
    default:
      assertNever(leftType, "Unknown type");
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/filter-query.js
function evalFilterQuery(ctx, item, node) {
  const list = createNodeList();
  switch (node.value.type) {
    case "RelQuery":
      visitQuery(ctx, item.root, item.value, node.value, (value) => {
        list.push(value);
      });
      break;
    case "JsonPathQuery":
      visitQuery(ctx, item.root, item.root, node.value, (value) => {
        list.push(value);
      });
      break;
    default:
      assertDefinedNodeType(node.value);
  }
  return list;
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/test-expr.js
function evalTestExpr(ctx, item, node) {
  switch (node.expression.type) {
    case "FilterQuery":
      return evalFilterQuery(ctx, item, node.expression).length > 0;
    case "FunctionExpr":
      return evalFunctionExpr(ctx, item, node.expression) === true;
    default:
      assertDefinedNodeType(node.expression);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/logical-expr.js
function evalLogicalExpr(ctx, item, node) {
  switch (node.type) {
    case "LogicalNotExpr":
      return !evalLogicalExpr(ctx, item, node.expression);
    case "LogicalAndExpr":
      return evalLogicalExpr(ctx, item, node.left) && evalLogicalExpr(ctx, item, node.right);
    case "LogicalOrExpr":
      return evalLogicalExpr(ctx, item, node.left) || evalLogicalExpr(ctx, item, node.right);
    case "TestExpr":
      return evalTestExpr(ctx, item, node);
    case "ComparisonExpr":
      return evalComparisonExpr(ctx, item, node);
    default:
      assertDefinedNodeType(node);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/function-argument.js
function evalFunctionArgument(ctx, item, node) {
  switch (node.type) {
    case "FunctionExpr":
      return evalFunctionExpr(ctx, item, node);
    case "FilterQuery":
      return evalFilterQuery(ctx, item, node);
    case "LogicalNotExpr":
    case "LogicalAndExpr":
    case "LogicalOrExpr":
    case "TestExpr":
      return evalLogicalExpr(ctx, item, node);
    case "Literal":
      return node.value;
    default:
      assertDefinedNodeType(node);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/function-expr.js
function coerceValueType(value) {
  if (isNodeList(value)) {
    return value.length === 1 ? value[0] : Nothing;
  }
  return value;
}
function evalFunctionExpr(ctx, item, node) {
  if (!isKnownFunction(ctx.functions, node.name)) {
    return false;
  }
  const fn = ctx.functions[node.name];
  if (fn.definition.parameters.length !== node.arguments.length) {
    return false;
  }
  const args = [];
  for (let i = 0;i < node.arguments.length; i++) {
    const value = evalFunctionArgument(ctx, item, node.arguments[i]);
    const param = fn.definition.parameters[i];
    switch (param) {
      case "ValueType":
        if (!isNodeList(value) && !isJsonValue(value)) {
          return false;
        }
        args.push(coerceValueType(value));
        break;
      case "NodesType":
        if (!isNodeList(value)) {
          return false;
        }
        args.push(value);
        break;
      case "LogicalType":
        if (typeof value === "boolean") {
          args.push(value);
        } else if (isNodeList(value)) {
          args.push(value.length > 0);
        } else {
          return false;
        }
        break;
      default:
        assertNever(param, "Unknown function argument type");
    }
  }
  return fn.declaration(ctx, ...args);
}
function isKnownFunction(functions, name) {
  return Object.hasOwn(functions, name);
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/comparable.js
function evalComparable(ctx, item, node) {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "RelSingularQuery":
    case "AbsSingularQuery": {
      const root = node.type === "RelSingularQuery" ? item.value : item.root;
      if (node.segments.length === 0) {
        return root;
      }
      const nodeList = createNodeList();
      visitQuery(ctx, item.root, root, node, (v) => {
        nodeList.push(v);
      });
      return nodeList;
    }
    case "FunctionExpr":
      return evalFunctionExpr(ctx, item, node);
    default:
      assertDefinedNodeType(node);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/evaluators/comparison-expr.js
function evalComparisonExpr(ctx, item, node) {
  const leftValue = evalComparable(ctx, item, node.left);
  const rightValue = evalComparable(ctx, item, node.right);
  return compare(leftValue, rightValue, node.op);
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/filter-selector.js
function visitFilterSelector(ctx, item, node) {
  if (node.value.type === "ComparisonExpr") {
    if (!evalComparisonExpr(ctx, item, node.value)) {
      return;
    }
  } else if (!evalLogicalExpr(ctx, item, node.value)) {
    return;
  }
  ctx.stack.push({
    root: item.root,
    path: item.path,
    value: item.value,
    index: item.index + 1
  });
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/index-selector.js
function getArrayIndex(index, length) {
  return index < 0 ? length + index : index;
}
function visitIndexSelector(ctx, item, node) {
  const index = getArrayIndex(node.value, item.value.length);
  if (index >= 0 && index < item.value.length) {
    ctx.stack.push({
      root: item.root,
      path: joinPathWithKey(item.path, index),
      value: item.value[index],
      index: item.index + 1
    });
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/name-selector.js
function visitNameSelector(ctx, { root, path, value, index }, node) {
  if (Object.hasOwn(value, node.value)) {
    ctx.stack.push({
      root,
      path: joinPathWithKey(path, node.value),
      value: value[node.value],
      index: index + 1
    });
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/slice-selector.js
function normalize(i, len) {
  return i >= 0 ? i : len + i;
}
function bounds(start, end, step, len) {
  const nStart = normalize(start, len);
  const nEnd = normalize(end, len);
  if (step >= 0) {
    const lower = Math.min(Math.max(nStart, 0), len);
    const upper = Math.min(Math.max(nEnd, 0), len);
    return [lower, upper];
  }
  const upper = Math.min(Math.max(nStart, -1), len - 1);
  const lower = Math.min(Math.max(nEnd, -1), len - 1);
  return [lower, upper];
}
function visitSliceSelector(ctx, { root, path, value, index }, node) {
  const step = node.step ?? 1;
  const defaultStart = step >= 0 ? 0 : value.length - 1;
  const defaultEnd = step >= 0 ? value.length : -value.length - 1;
  const nStart = node.start === null ? defaultStart : normalize(node.start, value.length);
  const nEnd = node.end === null ? defaultEnd : normalize(node.end, value.length);
  const [lower, upper] = bounds(nStart, nEnd, step, value.length);
  if (step > 0) {
    let i = lower;
    while (i < upper) {
      ctx.stack.push({
        root,
        path: joinPathWithKey(path, i),
        value: value[i],
        index: index + 1
      });
      i += step;
    }
  } else if (step < 0) {
    let i = upper;
    while (lower < i) {
      ctx.stack.push({
        root,
        path: joinPathWithKey(path, i),
        value: value[i],
        index: index + 1
      });
      i += step;
    }
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/wildcard-selector.js
function visitWildcardSelector(ctx, { root, path, value, index }) {
  if (Array.isArray(value)) {
    for (let i = 0;i < value.length; i++) {
      ctx.stack.push({
        root,
        path: joinPathWithKey(path, i),
        value: value[i],
        index: index + 1
      });
    }
  } else if (isPlainObject2(value)) {
    for (const key of Object.keys(value)) {
      ctx.stack.push({
        root,
        path: joinPathWithKey(path, key),
        value: value[key],
        index: index + 1
      });
    }
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/bracketed-selection.js
function visitBracketedSelection(ctx, item, node) {
  for (const selector of node.selectors) {
    switch (selector.type) {
      case "NameSelector":
        if (isStackItemWithObjectValue(item)) {
          visitNameSelector(ctx, item, selector);
        }
        break;
      case "SliceSelector":
        if (isStackItemWithArrayValue(item)) {
          visitSliceSelector(ctx, item, selector);
        }
        break;
      case "IndexSelector": {
        if (isStackItemWithArrayValue(item)) {
          visitIndexSelector(ctx, item, selector);
        }
        break;
      }
      case "WildcardSelector":
        visitWildcardSelector(ctx, item);
        break;
      case "FilterSelector": {
        if (isStackItemWithArrayValue(item)) {
          visitFilterSelectorForArrayItem(ctx, item, selector);
        } else if (isStackItemWithObjectValue(item)) {
          visitFilterSelectorForObjectItem(ctx, item, selector);
        }
        break;
      }
      default:
        assertDefinedNodeType(selector);
    }
  }
}
function visitFilterSelectorForArrayItem(ctx, { root, path, value, index }, node) {
  for (let i = 0;i < value.length; i++) {
    visitFilterSelector(ctx, {
      root,
      path: joinPathWithKey(path, i),
      value: value[i],
      index
    }, node);
  }
}
function visitFilterSelectorForObjectItem(ctx, { root, path, value, index }, node) {
  for (const key of Object.keys(value)) {
    visitFilterSelector(ctx, {
      root,
      path: joinPathWithKey(path, key),
      value: value[key],
      index
    }, node);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/member-name-shorthand.js
function visitMemberNameShorthand(ctx, { root, path, value, index }, node) {
  if (Object.hasOwn(value, node.value)) {
    ctx.stack.push({
      root,
      path: joinPathWithKey(path, node.value),
      value: value[node.value],
      index: index + 1
    });
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/segment.js
function visitSegment(ctx, item, node) {
  switch (node.type) {
    case "BracketedSelection":
      return visitBracketedSelection(ctx, item, node);
    case "WildcardSelector":
      return visitWildcardSelector(ctx, item);
    case "MemberNameShorthand":
      if (isStackItemWithObjectValue(item)) {
        visitMemberNameShorthand(ctx, item, node);
      }
      break;
    case "NameSelector":
      if (isStackItemWithObjectValue(item)) {
        visitNameSelector(ctx, item, node);
      }
      break;
    case "IndexSelector":
      if (isStackItemWithArrayValue(item)) {
        visitIndexSelector(ctx, item, node);
      }
      break;
    default:
      assertDefinedNodeType(node);
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/visitors/query.js
function visitQuery(ctx, root, input, node, cb) {
  const stack = new Stack;
  stack.push({
    root,
    path: getInitialPath(ctx.capturePaths),
    value: input,
    index: 0
  });
  const context = {
    cache: ctx.cache,
    capturePaths: false,
    functions: ctx.functions,
    regexp: ctx.regexp,
    stack
  };
  while (stack.size > 0) {
    const item = stack.pop();
    if (item.index === node.segments.length) {
      cb(item.value, item.path);
      continue;
    }
    const { path, value, index } = item;
    const segment = node.segments[index];
    visitSegment(context, item, segment.node);
    if (segment.type === "DescendantSegment") {
      if (Array.isArray(value)) {
        for (let i = 0;i < value.length; i++) {
          stack.push({
            root,
            path: joinPathWithKey(path, i),
            value: value[i],
            index
          });
        }
      } else if (value !== null && typeof value === "object") {
        for (const key of Object.keys(value)) {
          stack.push({
            root,
            path: joinPathWithKey(path, key),
            value: value[key],
            index
          });
        }
      }
    }
  }
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/core/exec.js
function exec(input, expression, opts, cb) {
  const ctx = {
    cache: new Map,
    capturePaths: opts.capturePaths,
    functions: {
      count: count_default,
      search: search_default,
      value: value_default,
      match: match_default,
      length: length_default
    },
    regexp: "i-regexp",
    stack: new Stack
  };
  visitQuery(ctx, input, input, parser_default(expression), cb);
}

// ../../../../../../private/tmp/ncw-adrkit-bundle-deps/node_modules/jsonpath-rfc9535/dist/esm/index.js
function query(input, expression) {
  const values = [];
  exec(input, expression, { capturePaths: false }, (value) => {
    values.push(value);
  });
  return values;
}

// ../../../oss/adrkit/packages/evaluator/src/report/serialize.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function indentOf(depth, pretty) {
  return pretty ? "  ".repeat(depth) : "";
}
function canonicalStringify2(root, pretty = false) {
  const nl = pretty ? `
` : "";
  const colon = pretty ? ": " : ":";
  const out = [];
  const stack = [{ kind: "val", value: root, depth: 0 }];
  while (stack.length > 0) {
    const task = stack.pop();
    if (!task)
      continue;
    if (task.kind === "str") {
      out.push(task.text);
      continue;
    }
    const { value, depth } = task;
    if (value === null) {
      out.push("null");
      continue;
    }
    const type = typeof value;
    if (type === "string" || type === "boolean") {
      out.push(JSON.stringify(value));
      continue;
    }
    if (type === "number") {
      out.push(Number.isFinite(value) ? JSON.stringify(value) : "null");
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        out.push("[]");
        continue;
      }
      const parts = [{ kind: "str", text: `[${nl}` }];
      value.forEach((item, i) => {
        parts.push({ kind: "str", text: indentOf(depth + 1, pretty) });
        parts.push({ kind: "val", value: item, depth: depth + 1 });
        parts.push({ kind: "str", text: `${i < value.length - 1 ? "," : ""}${nl}` });
      });
      parts.push({ kind: "str", text: `${indentOf(depth, pretty)}]` });
      for (let i = parts.length - 1;i >= 0; i -= 1)
        stack.push(parts[i]);
      continue;
    }
    if (isRecord2(value)) {
      const source = value;
      const keys = Object.keys(source).filter((key) => source[key] !== undefined).sort(byCodeUnit);
      if (keys.length === 0) {
        out.push("{}");
        continue;
      }
      const parts = [{ kind: "str", text: `{${nl}` }];
      keys.forEach((key, i) => {
        parts.push({ kind: "str", text: `${indentOf(depth + 1, pretty)}${JSON.stringify(key)}${colon}` });
        parts.push({ kind: "val", value: source[key], depth: depth + 1 });
        parts.push({ kind: "str", text: `${i < keys.length - 1 ? "," : ""}${nl}` });
      });
      parts.push({ kind: "str", text: `${indentOf(depth, pretty)}}` });
      for (let i = parts.length - 1;i >= 0; i -= 1)
        stack.push(parts[i]);
      continue;
    }
    out.push("null");
  }
  return out.join("");
}
function canonicalBytes(value) {
  return `${canonicalStringify2(value, true)}
`;
}

// ../../../oss/adrkit/packages/evaluator/src/assertions/limits.ts
var ASSERTION_INPUT_LIMITS = { maxBytes: 1024 * 1024, maxDepth: 64, maxNodes: 1e5 };
var REGO_DATA_LIMITS = { maxBytes: 1024 * 1024, maxDepth: 64, maxNodes: 1e5 };
function canonicalJsonString(value) {
  return canonicalStringify2(value, false);
}
function withinStructuralLimits(value, limits) {
  let nodes = 0;
  const stack = [{ value, depth: 1 }];
  while (stack.length > 0) {
    const { value: current, depth } = stack.pop();
    nodes += 1;
    if (nodes > limits.maxNodes)
      return false;
    if (depth > limits.maxDepth)
      return false;
    if (Array.isArray(current)) {
      for (const item of current)
        stack.push({ value: item, depth: depth + 1 });
    } else if (current !== null && typeof current === "object") {
      for (const entry of Object.values(current)) {
        stack.push({ value: entry, depth: depth + 1 });
      }
    }
  }
  return true;
}
function withinJsonLimits(value, limits) {
  if (!withinStructuralLimits(value, limits))
    return false;
  const bytes = new TextEncoder().encode(canonicalJsonString(value)).length;
  return bytes <= limits.maxBytes;
}

// ../../../oss/adrkit/packages/evaluator/src/assertions/jsonpath.ts
var MAX_SOURCE_BYTES = 8 * 1024;
var ALLOWED_FUNCTIONS = new Set(["length", "count", "value"]);
function functionNames(node, out) {
  if (Array.isArray(node)) {
    for (const item of node)
      functionNames(item, out);
    return;
  }
  if (node === null || typeof node !== "object")
    return;
  const record = node;
  if (record.type === "FunctionExpr" && typeof record.name === "string") {
    out.add(record.name);
  }
  for (const value of Object.values(record))
    functionNames(value, out);
}
function usesOnlyAllowedFunctions(ast) {
  const names = new Set;
  functionNames(ast, names);
  for (const name of names) {
    if (!ALLOWED_FUNCTIONS.has(name))
      return false;
  }
  return true;
}
function createJsonPathEngine() {
  return {
    engine: "jsonpath",
    profile: "source",
    compile(effectiveSource, sourceRef) {
      if (new TextEncoder().encode(effectiveSource).length > MAX_SOURCE_BYTES) {
        return { ok: false, reason: "assertions-compile.parse-error" };
      }
      let ast;
      try {
        ast = parser_default(effectiveSource);
      } catch {
        return { ok: false, reason: "assertions-compile.parse-error" };
      }
      if (!usesOnlyAllowedFunctions(ast)) {
        return { ok: false, reason: "assertions-compile.parse-error" };
      }
      const payload = { source: effectiveSource, ast };
      return {
        ok: true,
        compiled: { engine: "jsonpath", payload, ...sourceRef !== undefined ? { sourceRef } : {} }
      };
    },
    evaluate(compiled, input) {
      if (!withinJsonLimits(input, ASSERTION_INPUT_LIMITS)) {
        return { ok: false, reason: "assertions-pass.evaluation-error" };
      }
      try {
        const nodes = query(input, compiled.payload.source);
        return { ok: true, pass: nodes.length > 0 };
      } catch {
        return { ok: false, reason: "assertions-pass.evaluation-error" };
      }
    }
  };
}
// ../../../oss/adrkit/packages/evaluator/src/crypto/sha256.ts
var K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
function rotr(x, n) {
  return x >>> n | x << 32 - n;
}
function sha256Bytes(message) {
  const h = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
  const length = message.length;
  const bitLength = length * 8;
  const paddedLength = (length + 8 >> 6) + 1;
  const padded = new Uint8Array(paddedLength * 64);
  padded.set(message);
  padded[length] = 128;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLength >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLength / 4294967296), false);
  const w = new Uint32Array(64);
  for (let offset = 0;offset < padded.length; offset += 64) {
    for (let i = 0;i < 16; i += 1)
      w[i] = dv.getUint32(offset + i * 4, false);
    for (let i = 16;i < 64; i += 1) {
      const a = w[i - 15];
      const b = w[i - 2];
      const s0 = rotr(a, 7) ^ rotr(a, 18) ^ a >>> 3;
      const s1 = rotr(b, 17) ^ rotr(b, 19) ^ b >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let a = h[0];
    let b = h[1];
    let c = h[2];
    let d = h[3];
    let e = h[4];
    let f = h[5];
    let g = h[6];
    let hh = h[7];
    for (let i = 0;i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = e & f ^ ~e & g;
      const t1 = hh + S1 + ch + K[i] + w[i] >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj >>> 0;
      hh = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    h[0] = h[0] + a >>> 0;
    h[1] = h[1] + b >>> 0;
    h[2] = h[2] + c >>> 0;
    h[3] = h[3] + d >>> 0;
    h[4] = h[4] + e >>> 0;
    h[5] = h[5] + f >>> 0;
    h[6] = h[6] + g >>> 0;
    h[7] = h[7] + hh >>> 0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0;i < 8; i += 1)
    outView.setUint32(i * 4, h[i], false);
  return out;
}
function toHex(bytes) {
  let hex = "";
  for (const byte of bytes)
    hex += byte.toString(16).padStart(2, "0");
  return hex;
}
function sha256Hex(message) {
  return toHex(sha256Bytes(message));
}
var encoder = new TextEncoder;
function sha256HexUtf8(text) {
  return sha256Hex(encoder.encode(text));
}

// ../../../oss/adrkit/packages/evaluator/src/assertions/rego.ts
var MEDIA_TYPE = "application/vnd.adrkit.rego-wasm-policy.v1+json";
var SCHEMA_VERSION2 = "adrkit.rego-wasm-policy/v1";
var CAPABILITIES_PROFILE = "adrkit.rego-wasm.capabilities/v1";
var MAX_SOURCE_BYTES2 = 64 * 1024;
var MAX_MODULE_BYTES = 4 * 1024 * 1024;
var MAX_MODULE_BASE64_LEN = Math.ceil(MAX_MODULE_BYTES / 3) * 4;
var MAX_ENVELOPE_BYTES = Math.floor(6.75 * 1024 * 1024);
var HEX_64 = /^[0-9a-f]{64}$/;
var ENVELOPE_KEYS = [
  "mediaType",
  "schemaVersion",
  "source",
  "sourceSha256",
  "moduleBase64",
  "moduleSha256",
  "data",
  "entrypoint",
  "abi",
  "compiler",
  "requiredHostBuiltins",
  "envelopeSha256"
];
function fail(message) {
  return { ok: false, message: `Rego-Wasm envelope: ${message}` };
}
function isPlainObject3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function decodeCanonicalBase64(b64) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64) || b64.length % 4 !== 0)
    return;
  let binary;
  try {
    binary = atob(b64);
  } catch {
    return;
  }
  if (btoa(binary) !== b64)
    return;
  const bytes = new Uint8Array(binary.length);
  for (let i = 0;i < binary.length; i += 1)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function hasWasmMagic(bytes) {
  return bytes.length >= 8 && bytes[0] === 0 && bytes[1] === 97 && bytes[2] === 115 && bytes[3] === 109;
}
function isStructurallyValidWasm(bytes) {
  try {
    return WebAssembly.validate(bytes);
  } catch {
    return false;
  }
}
function isJsonValue2(root) {
  const active = new Set;
  const stack = [{ kind: "enter", value: root }];
  while (stack.length > 0) {
    const task = stack.pop();
    if (!task)
      continue;
    if (task.kind === "exit") {
      active.delete(task.value);
      continue;
    }
    const value = task.value;
    if (value === null)
      continue;
    const type = typeof value;
    if (type === "boolean" || type === "string")
      continue;
    if (type === "number") {
      if (!Number.isFinite(value))
        return false;
      continue;
    }
    if (typeof value !== "object" || value === null)
      return false;
    const objectValue = value;
    if (active.has(objectValue))
      return false;
    active.add(objectValue);
    stack.push({ kind: "exit", value: objectValue });
    if (Array.isArray(objectValue)) {
      for (let index = objectValue.length - 1;index >= 0; index -= 1) {
        if (!(index in objectValue))
          return false;
        stack.push({ kind: "enter", value: objectValue[index] });
      }
      continue;
    }
    let prototype;
    let descriptors;
    try {
      prototype = Object.getPrototypeOf(objectValue);
      descriptors = Object.getOwnPropertyDescriptors(objectValue);
    } catch {
      return false;
    }
    if (prototype !== Object.prototype && prototype !== null)
      return false;
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== "string")
        return false;
      const descriptor = descriptors[key];
      if (!descriptor?.enumerable || !("value" in descriptor))
        return false;
      stack.push({ kind: "enter", value: descriptor.value });
    }
  }
  return true;
}
function isCanonicalEntrypoint(entrypoint) {
  if (!entrypoint.startsWith("/") || entrypoint.length < 2)
    return false;
  if (entrypoint.endsWith("/") || entrypoint.includes("//"))
    return false;
  return entrypoint.slice(1).split("/").every((segment) => segment.length > 0);
}
function validateRegoWasmPolicyEnvelopeV1(artifact) {
  if (!isPlainObject3(artifact))
    return fail("must be an object");
  for (const key of Object.keys(artifact)) {
    if (!ENVELOPE_KEYS.includes(key))
      return fail(`unknown key "${key}"`);
  }
  for (const key of ENVELOPE_KEYS) {
    if (!(key in artifact))
      return fail(`missing key "${key}"`);
  }
  if (artifact.mediaType !== MEDIA_TYPE)
    return fail("mediaType mismatch");
  if (artifact.schemaVersion !== SCHEMA_VERSION2)
    return fail("schemaVersion mismatch");
  const source = artifact.source;
  if (typeof source !== "string")
    return fail("source must be a string");
  if (new TextEncoder().encode(source).length > MAX_SOURCE_BYTES2)
    return fail("source exceeds 64 KiB");
  const sourceSha256 = artifact.sourceSha256;
  if (typeof sourceSha256 !== "string" || !HEX_64.test(sourceSha256))
    return fail("sourceSha256 must be 64 lowercase hex");
  if (sha256HexUtf8(source) !== sourceSha256)
    return fail("sourceSha256 does not match source");
  const moduleBase64 = artifact.moduleBase64;
  if (typeof moduleBase64 !== "string")
    return fail("moduleBase64 must be a string");
  if (moduleBase64.length > MAX_MODULE_BASE64_LEN)
    return fail("moduleBase64 exceeds the maximum encoded length for a 4 MiB module");
  const moduleBytes = decodeCanonicalBase64(moduleBase64);
  if (!moduleBytes)
    return fail("moduleBase64 is not canonical base64");
  if (moduleBytes.length > MAX_MODULE_BYTES)
    return fail("module exceeds 4 MiB");
  if (!hasWasmMagic(moduleBytes))
    return fail("module is not a valid Wasm binary (magic)");
  if (!isStructurallyValidWasm(moduleBytes))
    return fail("module is not a structurally valid Wasm binary");
  const moduleSha256 = artifact.moduleSha256;
  if (typeof moduleSha256 !== "string" || !HEX_64.test(moduleSha256))
    return fail("moduleSha256 must be 64 lowercase hex");
  if (sha256Hex(moduleBytes) !== moduleSha256)
    return fail("moduleSha256 does not match module");
  const data = artifact.data;
  if (!isJsonValue2(data))
    return fail("data must be a JSON value");
  if (!withinJsonLimits(data, REGO_DATA_LIMITS))
    return fail("data exceeds size/depth/node limits");
  const entrypoint = artifact.entrypoint;
  if (typeof entrypoint !== "string" || !isCanonicalEntrypoint(entrypoint)) {
    return fail("entrypoint must be a canonical /slash/path");
  }
  const abi = artifact.abi;
  if (!isPlainObject3(abi))
    return fail("abi must be an object");
  for (const key of Object.keys(abi)) {
    if (key !== "major" && key !== "minor")
      return fail(`unknown abi key "${key}"`);
  }
  if (abi.major !== 1 || abi.minor !== 3)
    return fail("unsupported ABI (expected 1.3)");
  const compiler = artifact.compiler;
  if (!isPlainObject3(compiler))
    return fail("compiler must be an object");
  for (const key of Object.keys(compiler)) {
    if (!["name", "version", "capabilitiesProfile", "capabilitiesSha256"].includes(key)) {
      return fail(`unknown compiler key "${key}"`);
    }
  }
  if (compiler.name !== "opa")
    return fail('compiler.name must be "opa"');
  const compilerVersion = compiler.version;
  if (typeof compilerVersion !== "string" || compilerVersion.length === 0)
    return fail("compiler.version required");
  if (compiler.capabilitiesProfile !== CAPABILITIES_PROFILE)
    return fail("unsupported capabilities profile");
  const capabilitiesSha256 = compiler.capabilitiesSha256;
  if (typeof capabilitiesSha256 !== "string" || !HEX_64.test(capabilitiesSha256)) {
    return fail("compiler.capabilitiesSha256 must be 64 lowercase hex");
  }
  if (!Array.isArray(artifact.requiredHostBuiltins) || artifact.requiredHostBuiltins.length !== 0) {
    return fail("requiredHostBuiltins must be empty in v1");
  }
  const envelopeSha256 = artifact.envelopeSha256;
  if (typeof envelopeSha256 !== "string" || !HEX_64.test(envelopeSha256))
    return fail("envelopeSha256 must be 64 lowercase hex");
  const envelope = {
    mediaType: MEDIA_TYPE,
    schemaVersion: SCHEMA_VERSION2,
    source,
    sourceSha256,
    moduleBase64,
    moduleSha256,
    data,
    entrypoint,
    abi: { major: 1, minor: 3 },
    compiler: {
      name: "opa",
      version: compilerVersion,
      capabilitiesProfile: CAPABILITIES_PROFILE,
      capabilitiesSha256
    },
    requiredHostBuiltins: [],
    envelopeSha256
  };
  if (new TextEncoder().encode(canonicalJsonString(envelope)).length > MAX_ENVELOPE_BYTES) {
    return fail("decoded envelope exceeds 6.75 MiB");
  }
  const { envelopeSha256: _boundHash, ...priorFields } = envelope;
  if (sha256HexUtf8(canonicalJsonString(priorFields)) !== envelopeSha256) {
    return fail("envelopeSha256 does not bind the prior fields");
  }
  return { ok: true, envelope };
}
// ../../../oss/adrkit/packages/cli/src/errors.ts
import { isAbsolute as isAbsolute6, resolve as resolve7 } from "node:path";

// ../../../oss/adrkit/packages/cli/src/presentation.ts
var RESET = "\x1B[0m";
var BOLD = "\x1B[1m";
var DIM = "\x1B[2m";
var RED = "\x1B[31m";
var GREEN = "\x1B[32m";
var YELLOW = "\x1B[33m";
var MAGENTA = "\x1B[35m";
var CYAN = "\x1B[36m";
var STYLE_HEADING = [BOLD, CYAN];
var activePresentation = createPresentation();
function colorize(enabled, codes, text) {
  return enabled ? `${codes.join("")}${text}${RESET}` : text;
}
function normalizeNoColor(value) {
  if (value !== undefined)
    return value;
  return process.env.NO_COLOR !== undefined;
}
function colorEnabled(mode, isTTY, noColor) {
  if (mode === "never")
    return false;
  if (mode === "always")
    return true;
  return isTTY && !noColor;
}
function createStreamStyle(enabled) {
  return {
    enabled,
    bold: (text) => colorize(enabled, [BOLD], text),
    dim: (text) => colorize(enabled, [DIM], text),
    red: (text) => colorize(enabled, [RED], text),
    yellow: (text) => colorize(enabled, [YELLOW], text),
    green: (text) => colorize(enabled, [GREEN], text),
    cyan: (text) => colorize(enabled, [CYAN], text),
    magenta: (text) => colorize(enabled, [MAGENTA], text),
    heading: (text) => colorize(enabled, STYLE_HEADING, text),
    label: (text) => colorize(enabled, [BOLD], text),
    command: (text) => colorize(enabled, [BOLD], text),
    path: (text) => colorize(enabled, [CYAN], text),
    note: (text) => colorize(enabled, [DIM], text),
    severity: (text) => {
      switch (text) {
        case "error":
          return colorize(enabled, [RED, BOLD], text);
        case "warn":
          return colorize(enabled, [YELLOW, BOLD], text);
        case "info":
          return colorize(enabled, [CYAN], text);
        default:
          return colorize(enabled, [BOLD], text);
      }
    },
    status: (text) => {
      switch (text) {
        case "accepted":
        case "decided":
        case "within-sla":
        case "migrated":
          return colorize(enabled, [GREEN, BOLD], text);
        case "proposed":
        case "due":
        case "missing-sla":
        case "updated":
          return colorize(enabled, [YELLOW, BOLD], text);
        case "draft":
        case "not-queued":
        case "unchanged":
          return colorize(enabled, [DIM], text);
        case "rejected":
        case "superseded":
        case "overdue":
        case "diverged":
          return colorize(enabled, [RED, BOLD], text);
        case "deprecated":
        case "skipped":
          return colorize(enabled, [MAGENTA, BOLD], text);
        case "escalated":
          return colorize(enabled, [MAGENTA, BOLD], text);
        default:
          return colorize(enabled, [BOLD], text);
      }
    },
    outcome: (text) => {
      switch (text) {
        case "migrated":
          return colorize(enabled, [GREEN, BOLD], text);
        case "updated":
          return colorize(enabled, [CYAN, BOLD], text);
        case "unchanged":
          return colorize(enabled, [DIM], text);
        case "diverged":
          return colorize(enabled, [RED, BOLD], text);
        case "skipped":
          return colorize(enabled, [YELLOW, BOLD], text);
        default:
          return colorize(enabled, [BOLD], text);
      }
    }
  };
}
function createPresentation(options = {}) {
  const noColor = normalizeNoColor(options.noColor);
  const mode = options.colorMode ?? "auto";
  const stdoutIsTTY = options.stdoutIsTTY ?? process.stdout.isTTY === true;
  const stderrIsTTY = options.stderrIsTTY ?? process.stderr.isTTY === true;
  return {
    stdout: createStreamStyle(colorEnabled(mode, stdoutIsTTY, noColor)),
    stderr: createStreamStyle(colorEnabled(mode, stderrIsTTY, noColor))
  };
}
function setPresentation(options = {}) {
  activePresentation = createPresentation(options);
  return activePresentation;
}
function getPresentation() {
  return activePresentation;
}
function styleUsageBlock(text, style) {
  const lines = text.split(`
`);
  return lines.map((line) => {
    if (line.startsWith("Usage:"))
      return style.heading(line);
    if (/^(Commands|Options|Arguments|Examples|Exit codes):$/.test(line))
      return style.heading(line);
    if (line.startsWith("  -h, --help"))
      return `${style.label("  -h, --help")}${line.slice("  -h, --help".length)}`;
    if (line.startsWith("  -V, --version"))
      return `${style.label("  -V, --version")}${line.slice("  -V, --version".length)}`;
    return line;
  }).join(`
`);
}

// ../../../oss/adrkit/packages/cli/src/errors.ts
var CORPUS_DIRECTORY_NOT_FOUND_CODES = new Set(["ENOENT", "ENOTDIR"]);
var CORPUS_DIRECTORY_NOT_READABLE_CODES = new Set(["EACCES", "EPERM", "ELOOP", "ENAMETOOLONG"]);
var CORPUS_DIRECTORY_ROOT_READ_CODES = new Set(["EIO", "ESTALE"]);
function formatUsageError(message, usage, command, style) {
  const error = style?.red ? style.red("Error:") : "Error:";
  if (!command)
    return `${error} ${message}

${style ? styleUsageBlock(usage, style) : usage}`;
  const usageLine = usage.split(`
`, 1)[0] ?? `Usage: adr ${command} [options]`;
  const styledUsageLine = style?.heading ? style.heading(usageLine) : usageLine;
  const helpLine = style?.note ? style.note(`Run 'adr help ${command}' for more information.`) : `Run 'adr help ${command}' for more information.`;
  return `${error} ${message}

${styledUsageLine}
${helpLine}
`;
}
function corpusDirectoryErrorMessage(dir, kind) {
  const state = kind === "not-readable" ? "not readable" : "not found";
  return `Corpus directory ${state}: "${dir}".`;
}
function corpusDirectoryErrorKind(error, dir, cwd = process.cwd()) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : undefined;
  if (code === undefined || !CORPUS_DIRECTORY_NOT_FOUND_CODES.has(code) && !CORPUS_DIRECTORY_NOT_READABLE_CODES.has(code) && !CORPUS_DIRECTORY_ROOT_READ_CODES.has(code)) {
    return;
  }
  const path = typeof error === "object" && error !== null && "path" in error ? error.path : undefined;
  const resolveFromCwd = (value) => isAbsolute6(value) ? value : resolve7(cwd, value);
  if (CORPUS_DIRECTORY_ROOT_READ_CODES.has(code) && typeof path !== "string")
    return;
  if (typeof path === "string" && resolveFromCwd(path) !== resolveFromCwd(dir))
    return;
  return CORPUS_DIRECTORY_NOT_FOUND_CODES.has(code) ? "not-found" : "not-readable";
}

// ../../../oss/adrkit/packages/cli/src/evaluate-snapshot.ts
class SnapshotContractError extends Error {
  constructor(message) {
    super(message);
    this.name = "SnapshotContractError";
  }
}

class StrictJsonReader {
  s;
  static MAX_DEPTH = 128;
  i = 0;
  constructor(s) {
    this.s = s;
  }
  read() {
    this.ws();
    const value = this.value(0);
    this.ws();
    if (this.i !== this.s.length)
      this.fail("unexpected trailing content");
    return value;
  }
  fail(message) {
    throw new SnapshotContractError(`Malformed snapshot JSON: ${message} (offset ${this.i})`);
  }
  ws() {
    while (this.i < this.s.length) {
      const c = this.s.charCodeAt(this.i);
      if (c === 32 || c === 9 || c === 10 || c === 13)
        this.i += 1;
      else
        break;
    }
  }
  value(depth) {
    if (depth > StrictJsonReader.MAX_DEPTH) {
      this.fail(`nesting exceeds ${StrictJsonReader.MAX_DEPTH}`);
    }
    const c = this.s[this.i];
    if (c === "{")
      return this.object(depth);
    if (c === "[")
      return this.array(depth);
    if (c === '"')
      return this.string();
    if (c === "-" || c !== undefined && c >= "0" && c <= "9")
      return this.number();
    if (this.s.startsWith("true", this.i))
      return this.i += 4, true;
    if (this.s.startsWith("false", this.i))
      return this.i += 5, false;
    if (this.s.startsWith("null", this.i))
      return this.i += 4, null;
    this.fail("unexpected token");
  }
  object(depth) {
    this.i += 1;
    const obj = Object.create(null);
    const seen = new Set;
    this.ws();
    if (this.s[this.i] === "}")
      return this.i += 1, obj;
    for (;; ) {
      this.ws();
      if (this.s[this.i] !== '"')
        this.fail("expected string key");
      const key = this.string();
      if (seen.has(key))
        throw new SnapshotContractError(`Duplicate key "${key}" in snapshot bundle`);
      seen.add(key);
      this.ws();
      if (this.s[this.i] !== ":")
        this.fail('expected ":"');
      this.i += 1;
      this.ws();
      obj[key] = this.value(depth + 1);
      this.ws();
      const ch = this.s[this.i];
      if (ch === ",") {
        this.i += 1;
        continue;
      }
      if (ch === "}") {
        this.i += 1;
        break;
      }
      this.fail('expected "," or "}"');
    }
    return obj;
  }
  array(depth) {
    this.i += 1;
    const arr = [];
    this.ws();
    if (this.s[this.i] === "]")
      return this.i += 1, arr;
    for (;; ) {
      this.ws();
      arr.push(this.value(depth + 1));
      this.ws();
      const ch = this.s[this.i];
      if (ch === ",") {
        this.i += 1;
        continue;
      }
      if (ch === "]") {
        this.i += 1;
        break;
      }
      this.fail('expected "," or "]"');
    }
    return arr;
  }
  string() {
    const start = this.i;
    this.i += 1;
    while (this.i < this.s.length) {
      const ch = this.s[this.i];
      if (ch === "\\") {
        this.i += 2;
        continue;
      }
      if (ch === '"') {
        this.i += 1;
        break;
      }
      this.i += 1;
    }
    const raw = this.s.slice(start, this.i);
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "string")
        this.fail("invalid string literal");
      return parsed;
    } catch {
      this.fail("invalid string literal");
    }
  }
  number() {
    const start = this.i;
    const isDigit = (c) => c !== undefined && c >= "0" && c <= "9";
    if (this.s[this.i] === "-")
      this.i += 1;
    if (this.s[this.i] === "0") {
      this.i += 1;
    } else if (this.s[this.i] !== undefined && this.s[this.i] >= "1" && this.s[this.i] <= "9") {
      this.i += 1;
      while (isDigit(this.s[this.i]))
        this.i += 1;
    } else {
      this.fail("invalid number: expected an integer part");
    }
    if (this.s[this.i] === ".") {
      this.i += 1;
      if (!isDigit(this.s[this.i]))
        this.fail("invalid number: expected a digit after the decimal point");
      while (isDigit(this.s[this.i]))
        this.i += 1;
    }
    if (this.s[this.i] === "e" || this.s[this.i] === "E") {
      this.i += 1;
      if (this.s[this.i] === "+" || this.s[this.i] === "-")
        this.i += 1;
      if (!isDigit(this.s[this.i]))
        this.fail("invalid number: expected a digit in the exponent");
      while (isDigit(this.s[this.i]))
        this.i += 1;
    }
    const raw = this.s.slice(start, this.i);
    const n = Number(raw);
    if (raw.length === 0 || !Number.isFinite(n))
      this.fail("invalid number");
    return n;
  }
}
function parseSnapshotJson(text) {
  return new StrictJsonReader(text).read();
}
var AFFECTS_TYPES = ["path", "entity", "package", "resource", "api", "data"];
function parseAffectsType(value) {
  return AFFECTS_TYPES.find((type) => type === value);
}
function isPlainObject4(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireObject(value, where) {
  if (!isPlainObject4(value))
    throw new SnapshotContractError(`${where} must be an object`);
  return value;
}
function requireString(value, where) {
  if (typeof value !== "string")
    throw new SnapshotContractError(`${where} must be a string`);
  return value;
}
function requireBoolean(value, where) {
  if (typeof value !== "boolean")
    throw new SnapshotContractError(`${where} must be a boolean`);
  return value;
}
function requireNumber(value, where) {
  if (typeof value !== "number")
    throw new SnapshotContractError(`${where} must be a number`);
  return value;
}
function requireStringArray(value, where) {
  if (!Array.isArray(value))
    throw new SnapshotContractError(`${where} must be an array`);
  return value.map((item, idx) => requireString(item, `${where}[${idx}]`));
}
function rejectUnknownKeys(obj, allowed, where) {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(obj)) {
    if (!allowedSet.has(key))
      throw new SnapshotContractError(`Unknown key "${key}" in ${where}`);
  }
}
function isCanonicalTargetKey(key) {
  const idx = key.indexOf(":");
  if (idx <= 0)
    return false;
  const kind = parseAffectsType(key.slice(0, idx));
  if (!kind)
    return false;
  const id = key.slice(idx + 1);
  if (id.length === 0)
    return false;
  return canonicalTargetKey(makeTargetId(kind, id)) === key;
}
function requireCanonicalTargetKeys(value, where) {
  const keys = requireStringArray(value, where);
  for (const key of keys) {
    if (!isCanonicalTargetKey(key))
      throw new SnapshotContractError(`"${key}" in ${where} is not a canonical target key`);
  }
  return keys;
}
function requireCanonicalAssertionKeys(obj, where) {
  for (const key of Object.keys(obj)) {
    if (!isCanonicalAssertionKey(key)) {
      throw new SnapshotContractError(`Assertion key "${key}" in ${where} is not canonical`);
    }
  }
}
function validateFederatedLogs(value) {
  if (!Array.isArray(value))
    throw new SnapshotContractError("federatedLogs must be an array");
  return value.map((item, idx) => {
    const obj = requireObject(item, `federatedLogs[${idx}]`);
    rejectUnknownKeys(obj, ["log", "adrIds", "sourceRef"], `federatedLogs[${idx}]`);
    const log = requireString(obj.log ?? null, `federatedLogs[${idx}].log`);
    const adrIds = requireStringArray(obj.adrIds ?? null, `federatedLogs[${idx}].adrIds`);
    return {
      log,
      adrIds,
      ...obj.sourceRef !== undefined ? { sourceRef: requireString(obj.sourceRef, `federatedLogs[${idx}].sourceRef`) } : {}
    };
  });
}
function validateTargets(value) {
  const obj = requireObject(value, "targets");
  rejectUnknownKeys(obj, ["trackedPaths", "dependencies", "entities", "resources", "apis", "data"], "targets");
  const targets = {};
  if (obj.trackedPaths !== undefined)
    targets.trackedPaths = requireStringArray(obj.trackedPaths, "targets.trackedPaths");
  if (obj.dependencies !== undefined) {
    if (!Array.isArray(obj.dependencies))
      throw new SnapshotContractError("targets.dependencies must be an array");
    targets.dependencies = obj.dependencies.map((item, idx) => {
      const dep = requireObject(item, `targets.dependencies[${idx}]`);
      rejectUnknownKeys(dep, ["name", "version"], `targets.dependencies[${idx}]`);
      return {
        name: requireString(dep.name ?? null, `targets.dependencies[${idx}].name`),
        ...dep.version !== undefined ? { version: requireString(dep.version, `targets.dependencies[${idx}].version`) } : {}
      };
    });
  }
  if (obj.entities !== undefined) {
    if (!Array.isArray(obj.entities))
      throw new SnapshotContractError("targets.entities must be an array");
    targets.entities = obj.entities.map((item, idx) => {
      const ent = requireObject(item, `targets.entities[${idx}]`);
      rejectUnknownKeys(ent, ["id", "owner"], `targets.entities[${idx}]`);
      return {
        id: requireString(ent.id ?? null, `targets.entities[${idx}].id`),
        ...ent.owner !== undefined ? { owner: requireString(ent.owner, `targets.entities[${idx}].owner`) } : {}
      };
    });
  }
  if (obj.resources !== undefined) {
    if (!Array.isArray(obj.resources))
      throw new SnapshotContractError("targets.resources must be an array");
    targets.resources = obj.resources.map((item, idx) => {
      const r = requireObject(item, `targets.resources[${idx}]`);
      rejectUnknownKeys(r, ["id", "securitySurface", "production", "regulated"], `targets.resources[${idx}]`);
      return {
        id: requireString(r.id ?? null, `targets.resources[${idx}].id`),
        ...r.securitySurface !== undefined ? { securitySurface: requireBoolean(r.securitySurface, `targets.resources[${idx}].securitySurface`) } : {},
        ...r.production !== undefined ? { production: requireBoolean(r.production, `targets.resources[${idx}].production`) } : {},
        ...r.regulated !== undefined ? { regulated: requireBoolean(r.regulated, `targets.resources[${idx}].regulated`) } : {}
      };
    });
  }
  if (obj.apis !== undefined) {
    if (!Array.isArray(obj.apis))
      throw new SnapshotContractError("targets.apis must be an array");
    targets.apis = obj.apis.map((item, idx) => {
      const a = requireObject(item, `targets.apis[${idx}]`);
      rejectUnknownKeys(a, ["id", "securitySurface", "production"], `targets.apis[${idx}]`);
      return {
        id: requireString(a.id ?? null, `targets.apis[${idx}].id`),
        ...a.securitySurface !== undefined ? { securitySurface: requireBoolean(a.securitySurface, `targets.apis[${idx}].securitySurface`) } : {},
        ...a.production !== undefined ? { production: requireBoolean(a.production, `targets.apis[${idx}].production`) } : {}
      };
    });
  }
  if (obj.data !== undefined) {
    if (!Array.isArray(obj.data))
      throw new SnapshotContractError("targets.data must be an array");
    targets.data = obj.data.map((item, idx) => {
      const d = requireObject(item, `targets.data[${idx}]`);
      rejectUnknownKeys(d, ["id", "residency", "regulated"], `targets.data[${idx}]`);
      return {
        id: requireString(d.id ?? null, `targets.data[${idx}].id`),
        ...d.residency !== undefined ? { residency: requireString(d.residency, `targets.data[${idx}].residency`) } : {},
        ...d.regulated !== undefined ? { regulated: requireBoolean(d.regulated, `targets.data[${idx}].regulated`) } : {}
      };
    });
  }
  return targets;
}
function validateAssertionSource(value, where) {
  const obj = requireObject(value, where);
  rejectUnknownKeys(obj, ["fileContent", "sourceRef", "compiledArtifact"], where);
  const source = {};
  if (obj.fileContent !== undefined)
    source.fileContent = requireString(obj.fileContent, `${where}.fileContent`);
  if (obj.sourceRef !== undefined)
    source.sourceRef = requireString(obj.sourceRef, `${where}.sourceRef`);
  if (obj.compiledArtifact !== undefined) {
    const validation = validateRegoWasmPolicyEnvelopeV1(obj.compiledArtifact);
    if (!validation.ok)
      throw new SnapshotContractError(`${where}.compiledArtifact: ${validation.message}`);
    source.compiledArtifact = validation.envelope;
  }
  return source;
}
function validateAssertionInputs(value) {
  const obj = requireObject(value, "assertionInputs");
  rejectUnknownKeys(obj, ["sources", "inputs"], "assertionInputs");
  const sources = {};
  const inputs = {};
  if (obj.sources !== undefined) {
    const src = requireObject(obj.sources, "assertionInputs.sources");
    requireCanonicalAssertionKeys(src, "assertionInputs.sources");
    for (const [key, val] of Object.entries(src)) {
      sources[key] = validateAssertionSource(val, `assertionInputs.sources["${key}"]`);
    }
  }
  if (obj.inputs !== undefined) {
    const inp = requireObject(obj.inputs, "assertionInputs.inputs");
    requireCanonicalAssertionKeys(inp, "assertionInputs.inputs");
    for (const [key, val] of Object.entries(inp)) {
      const entry = requireObject(val, `assertionInputs.inputs["${key}"]`);
      rejectUnknownKeys(entry, ["document"], `assertionInputs.inputs["${key}"]`);
      if (entry.document === undefined)
        throw new SnapshotContractError(`assertionInputs.inputs["${key}"].document is required`);
      inputs[key] = { document: entry.document };
    }
  }
  return { sources, inputs };
}
function validateIdentity(value) {
  const obj = requireObject(value, "identity");
  rejectUnknownKeys(obj, ["principals", "teams", "codeowners", "catalogOwners"], "identity");
  if (!Array.isArray(obj.principals))
    throw new SnapshotContractError("identity.principals must be an array");
  const seenPrincipals = new Set;
  const principals = obj.principals.map((item, idx) => {
    const p = requireObject(item, `identity.principals[${idx}]`);
    rejectUnknownKeys(p, ["id", "active", "kind"], `identity.principals[${idx}]`);
    const id = requireString(p.id ?? null, `identity.principals[${idx}].id`);
    if (seenPrincipals.has(id))
      throw new SnapshotContractError(`Duplicate principal id "${id}"`);
    seenPrincipals.add(id);
    const kind = requireString(p.kind ?? null, `identity.principals[${idx}].kind`);
    if (kind !== "human" && kind !== "team")
      throw new SnapshotContractError(`identity.principals[${idx}].kind must be "human" or "team"`);
    return { id, active: requireBoolean(p.active ?? null, `identity.principals[${idx}].active`), kind };
  });
  const teams = Array.isArray(obj.teams) ? obj.teams.map((item, idx) => {
    const t = requireObject(item, `identity.teams[${idx}]`);
    rejectUnknownKeys(t, ["id", "members"], `identity.teams[${idx}]`);
    return {
      id: requireString(t.id ?? null, `identity.teams[${idx}].id`),
      members: requireStringArray(t.members ?? null, `identity.teams[${idx}].members`)
    };
  }) : obj.teams === undefined ? [] : (() => {
    throw new SnapshotContractError("identity.teams must be an array");
  })();
  const identity = { principals, teams };
  const principalKindById = new Map(principals.map((p) => [p.id, p.kind]));
  const teamIds = new Set;
  for (const team of teams) {
    if (teamIds.has(team.id))
      throw new SnapshotContractError(`Duplicate team id "${team.id}"`);
    teamIds.add(team.id);
    const kind = principalKindById.get(team.id);
    if (kind === undefined)
      throw new SnapshotContractError(`Team "${team.id}" has no matching principal`);
    if (kind !== "team")
      throw new SnapshotContractError(`Team "${team.id}" collides with a non-team principal`);
  }
  for (const p of principals) {
    if (p.kind === "team" && !teamIds.has(p.id)) {
      throw new SnapshotContractError(`Team principal "${p.id}" has no membership entry`);
    }
  }
  if (obj.codeowners !== undefined) {
    if (!Array.isArray(obj.codeowners))
      throw new SnapshotContractError("identity.codeowners must be an array");
    identity.codeowners = obj.codeowners.map((item, idx) => {
      const rule = requireObject(item, `identity.codeowners[${idx}]`);
      rejectUnknownKeys(rule, ["pattern", "owners"], `identity.codeowners[${idx}]`);
      return {
        pattern: requireString(rule.pattern ?? null, `identity.codeowners[${idx}].pattern`),
        owners: requireStringArray(rule.owners ?? null, `identity.codeowners[${idx}].owners`)
      };
    });
  }
  if (obj.catalogOwners !== undefined) {
    const co = requireObject(obj.catalogOwners, "identity.catalogOwners");
    const map = Object.create(null);
    for (const [key, owners] of Object.entries(co)) {
      map[key] = requireStringArray(owners, `identity.catalogOwners["${key}"]`);
    }
    identity.catalogOwners = map;
  }
  return identity;
}
function validateScopeEvidence(value) {
  const obj = requireObject(value, "scopeEvidence");
  rejectUnknownKeys(obj, ["baseInputs"], "scopeEvidence");
  if (obj.baseInputs === undefined)
    return {};
  const base = requireObject(obj.baseInputs, "scopeEvidence.baseInputs");
  requireCanonicalAssertionKeys(base, "scopeEvidence.baseInputs");
  const baseInputs = {};
  for (const [key, val] of Object.entries(base)) {
    const entry = requireObject(val, `scopeEvidence.baseInputs["${key}"]`);
    rejectUnknownKeys(entry, ["document"], `scopeEvidence.baseInputs["${key}"]`);
    if (entry.document === undefined)
      throw new SnapshotContractError(`scopeEvidence.baseInputs["${key}"].document is required`);
    baseInputs[key] = { document: entry.document };
  }
  return { baseInputs };
}
function validateRoutingEvidence(value) {
  const obj = requireObject(value, "routingEvidence");
  rejectUnknownKeys(obj, ["costEvidence", "dataResidency", "humanRequested", "securitySurfaceTargetKeys", "regulatedTargetKeys", "productionTargetKeys"], "routingEvidence");
  const evidence = {};
  if (obj.costEvidence !== undefined) {
    const c = requireObject(obj.costEvidence, "routingEvidence.costEvidence");
    rejectUnknownKeys(c, ["normalizedCost", "threshold"], "routingEvidence.costEvidence");
    evidence.costEvidence = {
      normalizedCost: requireNumber(c.normalizedCost ?? null, "routingEvidence.costEvidence.normalizedCost"),
      threshold: requireNumber(c.threshold ?? null, "routingEvidence.costEvidence.threshold")
    };
  }
  if (obj.dataResidency !== undefined) {
    const d = requireObject(obj.dataResidency, "routingEvidence.dataResidency");
    rejectUnknownKeys(d, ["present"], "routingEvidence.dataResidency");
    evidence.dataResidency = { present: requireBoolean(d.present ?? null, "routingEvidence.dataResidency.present") };
  }
  if (obj.humanRequested !== undefined) {
    const h = requireObject(obj.humanRequested, "routingEvidence.humanRequested");
    rejectUnknownKeys(h, ["requester"], "routingEvidence.humanRequested");
    evidence.humanRequested = { requester: requireString(h.requester ?? null, "routingEvidence.humanRequested.requester") };
  }
  if (obj.securitySurfaceTargetKeys !== undefined) {
    evidence.securitySurfaceTargets = new Set(requireCanonicalTargetKeys(obj.securitySurfaceTargetKeys, "routingEvidence.securitySurfaceTargetKeys"));
  }
  if (obj.regulatedTargetKeys !== undefined) {
    evidence.regulatedTargets = new Set(requireCanonicalTargetKeys(obj.regulatedTargetKeys, "routingEvidence.regulatedTargetKeys"));
  }
  if (obj.productionTargetKeys !== undefined) {
    evidence.productionTargets = new Set(requireCanonicalTargetKeys(obj.productionTargetKeys, "routingEvidence.productionTargetKeys"));
  }
  return evidence;
}
function loadSnapshotBundle(text) {
  const raw = parseSnapshotJson(text);
  const bundle = requireObject(raw, "snapshot bundle");
  rejectUnknownKeys(bundle, ["schemaVersion", "federatedLogs", "log", "targets", "assertionInputs", "identity", "scopeEvidence", "routingEvidence"], "snapshot bundle");
  if (bundle.schemaVersion !== "adrkit.pass0.snapshot/v1") {
    throw new SnapshotContractError('snapshot schemaVersion must be exactly "adrkit.pass0.snapshot/v1"');
  }
  const normalized = {
    targets: bundle.targets !== undefined ? validateTargets(bundle.targets) : {},
    assertionInputs: bundle.assertionInputs !== undefined ? validateAssertionInputs(bundle.assertionInputs) : { sources: {}, inputs: {} }
  };
  if (bundle.log !== undefined)
    normalized.resolutionLog = requireString(bundle.log, "log");
  if (bundle.federatedLogs !== undefined)
    normalized.federatedLogs = validateFederatedLogs(bundle.federatedLogs);
  if (bundle.identity !== undefined)
    normalized.identity = validateIdentity(bundle.identity);
  if (bundle.scopeEvidence !== undefined)
    normalized.scopeEvidence = validateScopeEvidence(bundle.scopeEvidence);
  if (bundle.routingEvidence !== undefined)
    normalized.routingEvidence = validateRoutingEvidence(bundle.routingEvidence);
  return normalized;
}

// ../../../oss/adrkit/packages/cli/src/evaluate.ts
var TARGET_REGISTRY = createTargetResolutionRegistry([createPathTargetResolver(), createPackageTargetResolver()]);
var ASSERTION_ENGINES = createAssertionEngineRegistry({ jsonpath: createJsonPathEngine() });
var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function isValidIsoDate(value) {
  if (!ISO_DATE.test(value))
    return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31)
    return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function resolveFromCwd(path, cwd) {
  return isAbsolute7(path) ? path : resolve8(cwd, path);
}
function corpusDirectoryOutput(dir, kind) {
  return { exitCode: 2, stdout: "", stderr: "", corpusDirectoryError: { dir, kind } };
}
function handleCorpusDirectoryError(error, dir, cwd) {
  const kind = corpusDirectoryErrorKind(error, dir, cwd);
  return kind ? corpusDirectoryOutput(dir, kind) : undefined;
}
async function ensureCorpusDirectoryReadable(dir, cwd) {
  try {
    await readdir3(resolveFromCwd(dir, cwd));
    return;
  } catch (error) {
    const output = handleCorpusDirectoryError(error, dir, cwd);
    if (output)
      return output;
    throw error;
  }
}
function buildInput(proposalPath, corpus, snapshot, date) {
  return {
    corpus,
    proposalPath,
    ...snapshot.federatedLogs ? { federatedLogs: snapshot.federatedLogs } : {},
    ...snapshot.resolutionLog !== undefined ? { resolutionLog: snapshot.resolutionLog } : {},
    targets: snapshot.targets,
    targetRegistry: TARGET_REGISTRY,
    assertionInputs: snapshot.assertionInputs,
    assertionEngines: ASSERTION_ENGINES,
    ...snapshot.identity ? { identity: snapshot.identity } : {},
    ...snapshot.scopeEvidence ? { scopeEvidence: snapshot.scopeEvidence } : {},
    ...snapshot.routingEvidence ? { routingEvidence: snapshot.routingEvidence } : {},
    evaluationDate: date
  };
}
function renderHuman(report) {
  const style = getPresentation().stdout;
  const lines = [`${style.heading("Pass 0 evaluation of")} ${style.path(report.proposalPath)} — outcome: ${style.status(report.outcome)}`];
  for (const result of report.results) {
    const severity = result.status === "fail" && result.severity ? ` (${style.severity(result.severity)})` : "";
    lines.push(`  ${style.label(result.rule)}: ${style.status(result.status)}${severity} — ${result.reason}`);
  }
  const { routing } = report;
  const target = routing.target.kind === "resolved" ? `${routing.target.human} (via ${routing.target.via})` : routing.target.kind;
  lines.push(`  ${style.label("routing")}: ${routing.escalate ? `${style.status("escalate")} [${routing.reasons.join(", ")}]` : style.note("no escalation")}, target: ${target}`);
  return `${lines.join(`
`)}
`;
}
async function evaluate(options) {
  const cwd = options.cwd ?? process.cwd();
  if (!isValidIsoDate(options.date)) {
    const style = getPresentation().stderr;
    return {
      exitCode: 2,
      stdout: "",
      stderr: `${style.red("adr evaluate:")} --date must be a valid YYYY-MM-DD (got "${options.date}")
`
    };
  }
  const dir = options.dir ?? dirname3(options.proposalPath);
  if (options.dir !== undefined) {
    const dirOutput = await ensureCorpusDirectoryReadable(options.dir, cwd);
    if (dirOutput)
      return dirOutput;
  }
  let snapshot;
  try {
    const text = await readFile4(options.snapshotPath, "utf8");
    snapshot = loadSnapshotBundle(text);
  } catch (error) {
    const style = getPresentation().stderr;
    if (error instanceof SnapshotContractError) {
      return { exitCode: 2, stdout: "", stderr: `${style.red("adr evaluate:")} ${error.message}
` };
    }
    return {
      exitCode: 2,
      stdout: "",
      stderr: `${style.red("adr evaluate:")} could not read snapshot "${options.snapshotPath}": ${error instanceof Error ? error.message : String(error)}
`
    };
  }
  let corpus;
  try {
    corpus = await lintCorpus({ paths: [dir, options.proposalPath], cwd });
  } catch (error) {
    const output = handleCorpusDirectoryError(error, dir, cwd);
    if (output)
      return output;
    throw error;
  }
  const proposalPath = normalizeDisplayPath(options.proposalPath, cwd);
  const outcome = evaluatePass0(buildInput(proposalPath, corpus, snapshot, options.date));
  if (outcome.kind === "input-error") {
    const style = getPresentation().stderr;
    return {
      exitCode: 2,
      stdout: "",
      stderr: `${style.red("adr evaluate:")} ${outcome.error.code} — "${proposalPath}" has status "${outcome.error.actualStatus}", not draft/proposed
`
    };
  }
  const { report, patch } = outcome.result;
  const exitCode = report.outcome === "returned" ? 1 : 0;
  if (options.json) {
    const envelope = {
      result: { report, patch },
      metadata: { evaluatorVersion: "0.1.0" }
    };
    return { exitCode, stdout: canonicalBytes(envelope), stderr: "" };
  }
  return { exitCode, stdout: renderHuman(report), stderr: "" };
}

// ../../../oss/adrkit/packages/cli/src/terminal-text.ts
var UNSAFE_TERMINAL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g;
var EMOJI_GRAPHEME = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
var MARK = /\p{Mark}/u;
var GRAPHEME_SEGMENTER = new Intl.Segmenter("en", { granularity: "grapheme" });
function cleanText(value) {
  return value.replace(UNSAFE_TERMINAL_CHARACTERS, "").replace(/\s+/g, " ").trim();
}
function clampColumns(columns) {
  return Math.max(40, Math.min(160, Number.isFinite(columns) ? Math.floor(columns) : 100));
}
function isWideCodePoint(codePoint) {
  return codePoint >= 4352 && (codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || codePoint >= 11904 && codePoint <= 42191 && codePoint !== 12351 || codePoint >= 44032 && codePoint <= 55203 || codePoint >= 63744 && codePoint <= 64255 || codePoint >= 65040 && codePoint <= 65049 || codePoint >= 65072 && codePoint <= 65135 || codePoint >= 65280 && codePoint <= 65376 || codePoint >= 65504 && codePoint <= 65510 || codePoint >= 131072 && codePoint <= 262141);
}
function graphemeWidth(grapheme) {
  if (EMOJI_GRAPHEME.test(grapheme))
    return 2;
  let width = 0;
  for (const character of grapheme) {
    const codePoint = character.codePointAt(0);
    if (codePoint === 8205 || codePoint === 65038 || codePoint === 65039 || MARK.test(character)) {
      continue;
    }
    width = Math.max(width, isWideCodePoint(codePoint) ? 2 : 1);
  }
  return width;
}
function graphemes(value) {
  return [...GRAPHEME_SEGMENTER.segment(value)].map((segment) => segment.segment);
}
function terminalDisplayWidth(value) {
  return graphemes(value).reduce((width, grapheme) => width + graphemeWidth(grapheme), 0);
}
function truncate(value, width) {
  if (terminalDisplayWidth(value) <= width)
    return value;
  if (width <= 3)
    return ".".repeat(Math.max(0, width));
  const limit = width - 3;
  let output = "";
  let used = 0;
  for (const grapheme of graphemes(value)) {
    const next = graphemeWidth(grapheme);
    if (used + next > limit)
      break;
    output += grapheme;
    used += next;
  }
  return `${output}...`;
}
function wrapText(value, width) {
  const lines = [];
  let current = "";
  for (const word of value.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (terminalDisplayWidth(candidate) <= width) {
      current = candidate;
      continue;
    }
    if (current)
      lines.push(current);
    current = terminalDisplayWidth(word) <= width ? word : truncate(word, width);
  }
  if (current)
    lines.push(current);
  return lines;
}

// ../../../oss/adrkit/packages/cli/src/graph.ts
var STATUS_ORDER = ["accepted", "proposed", "draft", "rejected", "superseded", "deprecated"];
var EDGE_KIND_ORDER = ["supersedes", "relatesTo", "conflictsWith"];
var DENSE_EDGE_THRESHOLD = 24;
var DENSE_NODE_THRESHOLD = 40;
var MAX_FOCUS_EDGES_PER_DIRECTION = 20;
var MAX_HUBS = 8;
function resolveGraphFormat(format, stdoutIsTTY) {
  return format === "auto" ? stdoutIsTTY ? "terminal" : "dot" : format;
}
function noteLines(text, style, width, indent = "") {
  const available = Math.max(1, width - terminalDisplayWidth(indent));
  return wrapText(text, available).map((line) => `${indent}${style.note(line)}`);
}
function nodeHeader(node, style, width, preferredIndent = "") {
  const indent = terminalDisplayWidth(`${preferredIndent}${node.id} [${node.status}]`) <= width ? preferredIndent : "";
  return `${indent}${style.label(node.id)} [${style.status(node.status)}]`;
}
function plural(count, singular, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}
function statusText(status, style) {
  return style.status(status);
}
function edgeKindText(kind, style, text = kind) {
  switch (kind) {
    case "supersedes":
      return style.magenta(text);
    case "relatesTo":
      return style.cyan(text);
    case "conflictsWith":
      return style.red(text);
  }
}
function graphCounts(graph, style) {
  const statusCounts = new Map;
  for (const node of graph.nodes)
    statusCounts.set(node.status, (statusCounts.get(node.status) ?? 0) + 1);
  const relationshipCounts = new Map;
  for (const edge of graph.edges) {
    relationshipCounts.set(edge.kind, (relationshipCounts.get(edge.kind) ?? 0) + 1);
  }
  const maxStatusCount = Math.max(1, ...statusCounts.values());
  const lines = [style.heading("Status")];
  for (const status of STATUS_ORDER) {
    const count = statusCounts.get(status) ?? 0;
    if (count === 0)
      continue;
    const bar = "#".repeat(Math.max(1, Math.round(count / maxStatusCount * 20)));
    const paddedStatus = `${statusText(status, style)}${" ".repeat(Math.max(0, 12 - status.length))}`;
    lines.push(`  ${paddedStatus} ${String(count).padStart(3)}  ${bar}`);
  }
  const extraStatuses = [...statusCounts.keys()].filter((status) => !STATUS_ORDER.includes(status)).sort();
  for (const status of extraStatuses) {
    const count = statusCounts.get(status);
    const bar = "#".repeat(Math.max(1, Math.round(count / maxStatusCount * 20)));
    const paddedStatus = `${statusText(status, style)}${" ".repeat(Math.max(0, 12 - status.length))}`;
    lines.push(`  ${paddedStatus} ${String(count).padStart(3)}  ${bar}`);
  }
  lines.push("", style.heading("Relationships"));
  for (const kind of EDGE_KIND_ORDER) {
    const count = relationshipCounts.get(kind) ?? 0;
    if (count > 0) {
      lines.push(`  ${edgeKindText(kind, style, kind.padEnd(14))} ${String(count).padStart(3)}`);
    }
  }
  return lines;
}
function nodeLines(node, style, width) {
  const prefix = `${node.id} [${node.status}] `;
  const available = width - terminalDisplayWidth(prefix);
  if (available >= 3) {
    return [
      `${nodeHeader(node, style, width)} ${truncate(cleanText(node.title), available)}`
    ];
  }
  return [
    nodeHeader(node, style, width),
    `  ${truncate(cleanText(node.title), Math.max(1, width - 2))}`
  ];
}
function edgeLines(edge, style, width) {
  const plain = `  ${edge.from} --${edge.kind}--> ${edge.to}`;
  if (terminalDisplayWidth(plain) <= width) {
    return [`  ${edge.from} --${edgeKindText(edge.kind, style)}--> ${edge.to}`];
  }
  return [
    `  ${edge.from}`,
    `  --${edgeKindText(edge.kind, style)}-->`,
    `  ${edge.to}`
  ];
}
function renderFocusedGraph(graph, options, width) {
  const focus = graph.nodes.find((node) => node.id === options.focus);
  if (!focus)
    return [options.style.note(`Focus ${options.focus ?? ""} is not present in this view.`)];
  const incoming = graph.edges.filter((edge) => edge.to === focus.id);
  const outgoing = graph.edges.filter((edge) => edge.from === focus.id);
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const focusHeading = `Focus ${focus.id} [${focus.status}]`;
  const lines = terminalDisplayWidth(focusHeading) <= width ? [`${options.style.heading(`Focus ${focus.id}`)} [${options.style.status(focus.status)}]`] : [options.style.heading(`Focus ${focus.id}`), `  [${options.style.status(focus.status)}]`];
  lines.push(`  ${truncate(cleanText(focus.title), Math.max(1, width - 2))}`, `  ${incoming.length} incoming | ${outgoing.length} outgoing`);
  if (outgoing.length > 0) {
    lines.push("", options.style.heading("Outgoing"));
    const visible = outgoing.slice(0, MAX_FOCUS_EDGES_PER_DIRECTION);
    for (const edge of visible) {
      const target = nodesById.get(edge.to);
      const plainPrefix = `  --${edge.kind}--> ${edge.to}${target ? ` [${target.status}] ` : ""}`;
      const available = width - terminalDisplayWidth(plainPrefix);
      if (!target || available >= 3) {
        const suffix = target ? ` [${options.style.status(target.status)}] ${truncate(cleanText(target.title), available)}` : "";
        lines.push(`  --${edgeKindText(edge.kind, options.style)}--> ${edge.to}${suffix}`);
        continue;
      }
      lines.push(`  --${edgeKindText(edge.kind, options.style)}-->`);
      lines.push(nodeHeader(target, options.style, width, "  "));
      lines.push(`    ${truncate(cleanText(target.title), Math.max(1, width - 4))}`);
    }
    if (visible.length < outgoing.length) {
      lines.push(...noteLines(`... ${outgoing.length - visible.length} more outgoing relationships; use --kind or --format json.`, options.style, width, "  "));
    }
  }
  if (incoming.length > 0) {
    lines.push("", options.style.heading("Incoming"));
    const visible = incoming.slice(0, MAX_FOCUS_EDGES_PER_DIRECTION);
    for (const edge of visible) {
      const source = nodesById.get(edge.from);
      const plainPrefix = `  ${edge.from}${source ? ` [${source.status}] ` : ""}`;
      const plainSuffix = ` --${edge.kind}--> ${focus.id}`;
      const available = width - terminalDisplayWidth(plainPrefix) - terminalDisplayWidth(plainSuffix);
      if (!source || available >= 3) {
        const title = source ? ` ${truncate(cleanText(source.title), available)}` : "";
        const status = source ? ` [${options.style.status(source.status)}]` : "";
        lines.push(`  ${edge.from}${status}${title} --${edgeKindText(edge.kind, options.style)}--> ${focus.id}`);
        continue;
      }
      lines.push(nodeHeader(source, options.style, width, "  "));
      lines.push(`    ${truncate(cleanText(source.title), Math.max(1, width - 4))}`);
      const relation = `  --${edge.kind}--> ${focus.id}`;
      if (terminalDisplayWidth(relation) <= width) {
        lines.push(`  --${edgeKindText(edge.kind, options.style)}--> ${focus.id}`);
      } else {
        lines.push(`  --${edgeKindText(edge.kind, options.style)}-->`, `  ${focus.id}`);
      }
    }
    if (visible.length < incoming.length) {
      lines.push(...noteLines(`... ${incoming.length - visible.length} more incoming relationships; use --kind or --format json.`, options.style, width, "  "));
    }
  }
  if (incoming.length === 0 && outgoing.length === 0) {
    lines.push("", options.style.note("No relationships match this view."));
  }
  return lines;
}
function renderSparseGraph(graph, style, width) {
  const lines = [style.heading("Decisions")];
  for (const node of graph.nodes)
    lines.push(...nodeLines(node, style, width));
  lines.push("", style.heading("Relationship map"));
  if (graph.edges.length === 0) {
    lines.push(`  ${style.note("No relationships in this view.")}`);
  } else {
    for (const edge of graph.edges)
      lines.push(...edgeLines(edge, style, width));
  }
  return lines;
}
function renderDenseGraph(graph, style, width) {
  const links = new Map(graph.nodes.map((node) => [node.id, 0]));
  for (const edge of graph.edges) {
    links.set(edge.from, (links.get(edge.from) ?? 0) + 1);
    links.set(edge.to, (links.get(edge.to) ?? 0) + 1);
  }
  const hubs = [...graph.nodes].sort((a, b) => (links.get(b.id) ?? 0) - (links.get(a.id) ?? 0) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).slice(0, MAX_HUBS);
  const lines = [style.heading("Most connected")];
  for (const node of hubs) {
    const count = links.get(node.id) ?? 0;
    const countText = String(count).padStart(3);
    const prefix = `  ${node.id} [${node.status}] ${countText} ${plural(count, "link")}  `;
    const available = width - terminalDisplayWidth(prefix);
    if (available >= 3) {
      lines.push(`  ${style.label(node.id)} [${style.status(node.status)}] ${countText} ${plural(count, "link")}  ${truncate(cleanText(node.title), available)}`);
      continue;
    }
    lines.push(nodeHeader(node, style, width, "  "));
    const linkPrefix = `  ${count} ${plural(count, "link")}  `;
    lines.push(`${linkPrefix}${truncate(cleanText(node.title), Math.max(1, width - terminalDisplayWidth(linkPrefix)))}`);
  }
  const suggestedFocus = hubs[0]?.id;
  lines.push("", ...noteLines(suggestedFocus ? `Dense graph: use \`adr graph --focus ${suggestedFocus}\` or \`--kind supersedes\` for a readable subgraph.` : "Dense graph: use --focus or --kind for a readable subgraph.", style, width));
  return lines;
}
function renderTerminalGraph(graph, options) {
  const width = clampColumns(options.columns);
  const lines = [
    options.style.heading("ADR decision graph"),
    `${graph.nodes.length} ${plural(graph.nodes.length, "decision")} | ${graph.edges.length} ${plural(graph.edges.length, "relationship")}`
  ];
  if (graph.nodes.length === 0) {
    lines.push("", options.style.note("No decisions match this view."));
    return `${lines.join(`
`)}
`;
  }
  lines.push("", ...graphCounts(graph, options.style), "");
  if (options.focus) {
    lines.push(...renderFocusedGraph(graph, options, width));
  } else if (graph.nodes.length <= DENSE_NODE_THRESHOLD && graph.edges.length <= DENSE_EDGE_THRESHOLD) {
    lines.push(...renderSparseGraph(graph, options.style, width));
  } else {
    lines.push(...renderDenseGraph(graph, options.style, width));
  }
  return `${lines.join(`
`)}
`;
}

// ../../../oss/adrkit/packages/cli/src/recovery.ts
function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1;leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1;rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(previous[rightIndex] + 1, current[rightIndex - 1] + 1, substitution);
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}
function closestCandidate(input, candidates, maxDistance = 2) {
  let bestCandidate;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const distance = editDistance(input, candidate);
    if (distance > maxDistance)
      continue;
    if (distance < bestDistance || distance === bestDistance && (bestCandidate === undefined || candidate < bestCandidate)) {
      bestCandidate = candidate;
      bestDistance = distance;
    }
  }
  return bestCandidate;
}

// ../../../oss/adrkit/packages/cli/src/command-registry.ts
var COMMAND_ORDER = ["new", "lint", "check", "explain", "graph", "queue", "approve", "object", "resolve", "accept", "evaluate", "migrate", "completion", "help"];
var COMMAND_SUMMARIES = {
  new: "Create a decision record",
  lint: "Validate ADR files and corpus rules",
  check: "Review changed files against governing decisions",
  explain: "Explain which decisions govern a path",
  graph: "Render decision relationships",
  queue: "Show the architecture review board queue",
  approve: "Approve a proposed decision under your identity",
  object: "Raise an objection on a proposed decision",
  resolve: "Resolve your own objection on a proposed decision",
  accept: "Accept a proposed decision as its named ratifier",
  evaluate: "Evaluate a proposal from an offline snapshot",
  migrate: "Import a MADR corpus into adrkit",
  completion: "Generate shell completion scripts",
  help: "Show help for a command"
};
var TOP_LEVEL_OPTIONS = ["--help", "--version", "--color"];
var GLOBAL_COLOR_OPTIONS = ["--color"];
var GLOBAL_COLOR_VALUES = ["auto", "always", "never"];
var TOP_LEVEL_COMPLETION_OPTIONS = ["-h", "--help", "-V", "--version", ...GLOBAL_COLOR_OPTIONS];
var TOP_LEVEL_COMPLETION_VALUE_CHOICES = {
  "--color": GLOBAL_COLOR_VALUES
};
var GRAPH_FORMAT_VALUES = ["auto", "terminal", "dot", "json", "mermaid"];
var GRAPH_KIND_VALUES = ["supersedes", "relatesTo", "conflictsWith"];
function isGraphFormat(value) {
  return GRAPH_FORMAT_VALUES.includes(value);
}
function isGraphKind(value) {
  return GRAPH_KIND_VALUES.includes(value);
}
var COMMAND_OPTIONS = {
  new: ["--status", "--dir", "--json", "--help"],
  lint: ["--json", "--dir", "--help"],
  check: ["--json", "--dir", "--help"],
  explain: ["--json", "--dir", "--as-of", "--help"],
  graph: ["--dir", "--format", "--focus", "--kind", "--help"],
  queue: ["--dir", "--as-of", "--format", "--help"],
  approve: ["--by", "--dir", "--json", "--help"],
  object: ["--by", "--summary", "--dir", "--json", "--help"],
  resolve: ["--objection", "--by", "--dir", "--json", "--help"],
  accept: ["--by", "--dir", "--json", "--help"],
  evaluate: ["--snapshot", "--date", "--json", "--dir", "--help"],
  migrate: ["--from", "--dir", "--dry-run", "--rename", "--json", "--help"],
  completion: ["--help"],
  help: ["--help"]
};
var COMMAND_COMPLETION_OPTIONS = {
  new: ["-h", "--help", "--status", "--dir", "--json"],
  lint: ["-h", "--help", "--json", "--dir"],
  check: ["-h", "--help", "--json", "--dir"],
  explain: ["-h", "--help", "--json", "--dir", "--as-of"],
  graph: ["-h", "--help", "--dir", "--format", "--focus", "--kind"],
  queue: ["-h", "--help", "--dir", "--as-of", "--format"],
  approve: ["-h", "--help", "--by", "--dir", "--json"],
  object: ["-h", "--help", "--by", "--summary", "--dir", "--json"],
  resolve: ["-h", "--help", "--objection", "--by", "--dir", "--json"],
  accept: ["-h", "--help", "--by", "--dir", "--json"],
  evaluate: ["-h", "--help", "--snapshot", "--date", "--json", "--dir"],
  migrate: ["-h", "--help", "--from", "--dir", "--dry-run", "--rename", "--json"],
  completion: ["-h", "--help"],
  help: ["-h", "--help"]
};
var COMMAND_VALUE_CHOICES = {
  new: { "--status": ["draft", "proposed", "rejected", "deprecated"] },
  graph: { "--format": GRAPH_FORMAT_VALUES, "--kind": GRAPH_KIND_VALUES },
  queue: { "--format": ["auto", "terminal", "markdown", "json"] },
  migrate: { "--from": ["madr"] }
};
var COMMAND_POSITIONAL_CHOICES = {
  help: COMMAND_ORDER,
  completion: ["bash", "zsh", "fish"]
};
function withGlobalColorOption(options) {
  return [...new Set([...options, ...GLOBAL_COLOR_OPTIONS])];
}
function renderGlobalColorUsageLine(indent = "  ") {
  return `${indent}--color <auto|always|never>  Colorize human-readable output (default: auto; honors NO_COLOR)`;
}
function commandOptions(command) {
  return COMMAND_OPTIONS[command];
}
function commandCompletionOptions(command) {
  return COMMAND_COMPLETION_OPTIONS[command];
}
function commandValueChoices(command, option) {
  const choiceMap = COMMAND_VALUE_CHOICES[command];
  return choiceMap?.[option];
}
function commandValueChoiceMap(command) {
  return COMMAND_VALUE_CHOICES[command];
}
function requiredCommandValueChoices(command, option) {
  const choices = commandValueChoices(command, option);
  if (!choices) {
    throw new Error(`Missing command registry value choices for ${command} ${option}.`);
  }
  return choices;
}
function commandPositionalChoices(command) {
  return COMMAND_POSITIONAL_CHOICES[command];
}
function renderTopLevelUsage(version, style) {
  const heading = style?.heading ?? ((text) => text);
  const commandStyle = style?.command ?? ((text) => text);
  const note = style?.note ?? ((text) => text);
  const label = style?.label ?? ((text) => text);
  const width = Math.max(...COMMAND_ORDER.map((command) => command.length));
  const commandLines = COMMAND_ORDER.map((command) => `  ${commandStyle(command.padEnd(width))}  ${style?.note?.(COMMAND_SUMMARIES[command]) ?? COMMAND_SUMMARIES[command]}`).join(`
`);
  return `${heading(`adrkit ${version}`)}
${note("Decision memory for human- and agent-authored plans.")}

${heading("Usage:")}
  adr <command> [options]

${heading("Commands:")}
${commandLines}

${heading("Options:")}
  ${label("--color")} auto|always|never  Colorize human-readable output (default: auto; honors NO_COLOR)
  ${label("-h, --help")}                 Show help
  ${label("-V, --version")}              Show version

${heading("Examples:")}
  adr new "Adopt PostgreSQL"
  adr lint
  adr explain src/auth/session.ts
  adr check src/auth/session.ts package.json
  adr completion bash

${note("Run 'adr help <command>' for command-specific options and examples.")}
${note("Documentation: https://adrkit.dev/commands/")}
`;
}

// ../../../oss/adrkit/packages/cli/src/completion.ts
var COMPLETION_SHELLS = ["bash", "zsh", "fish"];
var COMPLETION_USAGE = `Usage: adr completion <shell>

Write a deterministic shell completion script to stdout.
The generated script registers both the \`adr\` and \`adrkit\` binaries where the shell format permits.

Arguments:
  <shell>         Completion shell: bash|zsh|fish

Options:
  -h, --help      Show this help and exit
${renderGlobalColorUsageLine()}

Examples:
  adr completion bash
  adr completion zsh > ~/.zsh/completions/_adr
  adr completion fish > ~/.config/fish/completions/adr.fish

Exit codes: 0 = script emitted; 2 = usage error (missing or unsupported shell).
`;
function usageError(message) {
  process.stderr.write(formatUsageError(message, COMPLETION_USAGE, "completion", getPresentation().stderr));
  return 2;
}
function formatChoiceList(values) {
  if (values.length === 1)
    return `"${values[0]}"`;
  if (values.length === 2)
    return `"${values[0]}" or "${values[1]}"`;
  return `${values.slice(0, -1).map((value) => `"${value}"`).join(", ")}, or "${values[values.length - 1]}"`;
}
function shellWords(values) {
  return values.join(" ");
}
function unknownOptionMessage(option) {
  const suggestion = closestCandidate(option, withGlobalColorOption(["--help"]));
  return suggestion ? `Unknown option "${option}". Did you mean "${suggestion}"?` : `Unknown option "${option}".`;
}
function unknownShellMessage(shell) {
  const suggestion = closestCandidate(shell, COMPLETION_SHELLS);
  const expected = formatChoiceList(COMPLETION_SHELLS);
  return suggestion ? `Invalid shell "${shell}". Did you mean "${suggestion}"? Expected ${expected}.` : `Invalid shell "${shell}". Expected ${expected}.`;
}
function parseFlags(args) {
  let shell;
  let help = false;
  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg.startsWith("-"))
      return { ok: false, unknown: arg };
    if (shell !== undefined)
      return { ok: false, positional: arg };
    shell = arg;
  }
  if (!help && shell === undefined)
    return { ok: false, missing: true };
  return { ok: true, help, shell };
}
function renderBashScanHelpers() {
  return `__adr_complete_words() {
  local prefix=$1
  shift
  COMPREPLY=( $(compgen -W "$*" -- "$prefix") )
}

__adr_complete_prefixed_words() {
  local prefix=$1
  local value_prefix=$2
  shift 2
  COMPREPLY=()
  local candidate
  for candidate in "$@"; do
    [[ $candidate == "$value_prefix"* ]] && COMPREPLY+=("\${prefix}\${candidate}")
  done
}

__adr_after_terminator() {
  local i=1 token
  while (( i < COMP_CWORD )); do
    token="\${COMP_WORDS[i]}"
    case "$token" in
      --)
        return 0
        ;;
      --color)
        (( i += 2 ))
        continue
        ;;
      --color=*)
        (( i += 1 ))
        continue
        ;;
      -h|--help|-V|--version)
        (( i += 1 ))
        continue
        ;;
    esac
    (( i += 1 ))
  done
  return 1
}

__adr_command_index() {
  local i=1 token
  while (( i < COMP_CWORD )); do
    token="\${COMP_WORDS[i]}"
    case "$token" in
      --)
        return 1
        ;;
      --color)
        (( i += 2 ))
        continue
        ;;
      --color=*)
        (( i += 1 ))
        continue
        ;;
      -h|--help|-V|--version)
        (( i += 1 ))
        continue
        ;;
    esac
    if [[ $token != -* ]]; then
      printf '%s' "$i"
      return 0
    fi
    return 1
  done
  return 1
}

__adr_first_positional() {
  local i=1 token command_seen=0 positionals=0
  while (( i < COMP_CWORD )); do
    token="\${COMP_WORDS[i]}"
    case "$token" in
      --color)
        (( i += 2 ))
        continue
        ;;
      --color=*)
        (( i += 1 ))
        continue
        ;;
      -h|--help|-V|--version)
        (( i += 1 ))
        continue
        ;;
      --)
        if (( command_seen == 0 )); then
          return 1
        fi
        (( i += 1 ))
        continue
        ;;
    esac
    if [[ $token != -* ]]; then
      if (( command_seen == 0 )); then
        command_seen=1
      else
        (( positionals += 1 ))
      fi
    fi
    (( i += 1 ))
  done
  (( command_seen == 1 && positionals == 0 ))
}
`;
}
function renderZshScanHelpers() {
  return `__adr_complete_words() {
  local prefix=$1
  shift
  local -a matches=()
  local candidate
  for candidate in "$@"; do
    [[ $candidate == "$prefix"* ]] && matches+=("$candidate")
  done
  if (( \${#matches[@]} )); then
    compadd -Q -- "\${matches[@]}"
  fi
}

__adr_complete_prefixed_words() {
  local prefix=$1
  local value_prefix=$2
  shift 2
  local -a matches=()
  local candidate
  for candidate in "$@"; do
    [[ $candidate == "$value_prefix"* ]] && matches+=("\${prefix}\${candidate}")
  done
  if (( \${#matches[@]} )); then
    compadd -Q -- "\${matches[@]}"
  fi
}

__adr_after_terminator() {
  local i=2 token
  while (( i < CURRENT )); do
    token="\${words[i]}"
    case "$token" in
      --)
        return 0
        ;;
      --color)
        (( i += 2 ))
        continue
        ;;
      --color=*)
        (( i += 1 ))
        continue
        ;;
      -h|--help|-V|--version)
        (( i += 1 ))
        continue
        ;;
    esac
    (( i += 1 ))
  done
  return 1
}

__adr_command_index() {
  local i=2 token
  while (( i < CURRENT )); do
    token="\${words[i]}"
    case "$token" in
      --)
        return 1
        ;;
      --color)
        (( i += 2 ))
        continue
        ;;
      --color=*)
        (( i += 1 ))
        continue
        ;;
      -h|--help|-V|--version)
        (( i += 1 ))
        continue
        ;;
    esac
    if [[ $token != -* ]]; then
      printf '%s' "$i"
      return 0
    fi
    return 1
  done
  return 1
}

__adr_first_positional() {
  local i=2 token command_seen=0 positionals=0
  while (( i < CURRENT )); do
    token="\${words[i]}"
    case "$token" in
      --color)
        (( i += 2 ))
        continue
        ;;
      --color=*)
        (( i += 1 ))
        continue
        ;;
      -h|--help|-V|--version)
        (( i += 1 ))
        continue
        ;;
      --)
        if (( command_seen == 0 )); then
          return 1
        fi
        (( i += 1 ))
        continue
        ;;
    esac
    if [[ $token != -* ]]; then
      if (( command_seen == 0 )); then
        command_seen=1
      else
        (( positionals += 1 ))
      fi
    fi
    (( i += 1 ))
  done
  (( command_seen == 1 && positionals == 0 ))
}
`;
}
function renderFishScanHelpers() {
  return [
    `function __adr_tokens_before_cursor`,
    `    set -l tokens (commandline -opc)`,
    `    set -l current (commandline -ct)`,
    `    if test -n "$current"`,
    `        if test (count $tokens) -gt 0; and test "$tokens[(count $tokens)]" = "$current"`,
    `            set -e tokens[(count $tokens)]`,
    `        end`,
    `    end`,
    `    printf '%s
' $tokens`,
    `end`,
    ``,
    `function __adr_after_terminator`,
    `    if test (commandline -ct) = '--'`,
    `        return 0`,
    `    end`,
    ``,
    `    set -l tokens (__adr_tokens_before_cursor)`,
    `    set -l i 2`,
    `    while test $i -le (count $tokens)`,
    `        switch $tokens[$i]`,
    `            case '--'`,
    `                return 0`,
    `            case '--color'`,
    `                set i (math $i + 2)`,
    `                continue`,
    `            case '--color=*'`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '-h' '--help' '-V' '--version'`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '*'`,
    `                set i (math $i + 1)`,
    `        end`,
    `    end`,
    `    return 1`,
    `end`,
    ``,
    `function __adr_command_token`,
    `    set -l tokens (__adr_tokens_before_cursor)`,
    `    set -l i 2`,
    `    while test $i -le (count $tokens)`,
    `        switch $tokens[$i]`,
    `            case '--'`,
    `                return 1`,
    `            case '--color'`,
    `                set i (math $i + 2)`,
    `                continue`,
    `            case '--color=*'`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '-h' '--help' '-V' '--version'`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '*'`,
    `                if not string match -q -r '^-' -- $tokens[$i]`,
    `                    echo $tokens[$i]`,
    `                    return 0`,
    `                end`,
    `                return 1`,
    `        end`,
    `    end`,
    `    return 1`,
    `end`,
    ``,
    `function __adr_root_position`,
    `    __adr_color_value; and return 1`,
    `    __adr_after_terminator; and return 1`,
    `    set -l command (__adr_command_token)`,
    `    test -z "$command"`,
    `end`,
    ``,
    `function __adr_subcommand_is`,
    `    set -l command (__adr_command_token)`,
    `    test -n "$command"; and test "$command" = "$argv[1]"`,
    `end`,
    ``,
    `function __adr_color_value`,
    `    __adr_after_terminator; and return 1`,
    `    set -l current (commandline -ct)`,
    `    if string match -q -- '--color=*' "$current"`,
    `        return 0`,
    `    end`,
    `    set -l tokens (__adr_tokens_before_cursor)`,
    `    if test (count $tokens) -gt 0; and test "$tokens[(count $tokens)]" = '--color'`,
    `        return 0`,
    `    end`,
    `    return 1`,
    `end`,
    ``,
    `function __adr_first_positional`,
    `    set -l tokens (__adr_tokens_before_cursor)`,
    `    set -l i 2`,
    `    set -l command_seen 0`,
    `    set -l positionals 0`,
    `    while test $i -le (count $tokens)`,
    `        switch $tokens[$i]`,
    `            case '--color'`,
    `                set i (math $i + 2)`,
    `                continue`,
    `            case '--color=*'`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '-h' '--help' '-V' '--version'`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '--'`,
    `                if test $command_seen -eq 0`,
    `                    return 1`,
    `                end`,
    `                set i (math $i + 1)`,
    `                continue`,
    `            case '*'`,
    `                if not string match -q -r '^-' -- $tokens[$i]`,
    `                    if test $command_seen -eq 0`,
    `                        set command_seen 1`,
    `                    else`,
    `                        set positionals (math $positionals + 1)`,
    `                    end`,
    `                end`,
    `                set i (math $i + 1)`,
    `        end`,
    `    end`,
    `    test $command_seen -eq 1; and test $positionals -eq 0`,
    `end`,
    ``,
    `function __adr_current_token_is_option`,
    `    set -l token (commandline -ct)`,
    `    test -n "$token"; and test (string sub -s 1 -l 1 -- $token) = '-'`,
    `end`,
    ``
  ].join(`
`);
}
function renderValueBranches(shell, values) {
  return Object.entries(values).map(([flag, choices]) => shell === "bash" ? renderBashValueBranch(flag, choices) : renderZshValueBranch(flag, choices)).join("");
}
function renderBashValueBranch(flag, choices) {
  return `      if [[ $cur == ${flag}=* ]]; then
        local value_prefix="\${cur#${flag}=}"
        __adr_complete_prefixed_words "${flag}=" "$value_prefix" ${shellWords(choices)}
        return 0
      fi
      if [[ $prev == ${flag} ]]; then
        __adr_complete_words "$cur" ${shellWords(choices)}
        return 0
      fi
`;
}
function renderZshValueBranch(flag, choices) {
  return `      if [[ $cur == ${flag}=* ]]; then
        local value_prefix="\${cur#${flag}=}"
        __adr_complete_prefixed_words "${flag}=" "$value_prefix" ${shellWords(choices)}
        return 0
      fi
      if [[ $prev == ${flag} ]]; then
        __adr_complete_words "$cur" ${shellWords(choices)}
        return 0
      fi
`;
}
function renderCommandBranch(shell, command) {
  const options = withGlobalColorOption(commandCompletionOptions(command));
  const valueChoices = commandValueChoiceMap(command) ?? {};
  const positionalChoices = commandPositionalChoices(command);
  const valueBranch = renderValueBranches(shell, valueChoices);
  const optionHelper = "__adr_complete_words";
  const positionalChoicesForCommand = command === "help" ? COMMAND_ORDER : command === "completion" ? COMPLETION_SHELLS : positionalChoices;
  const positionalBranch = positionalChoicesForCommand ? shell === "bash" ? `      if __adr_first_positional; then
        if [[ $cur == -* ]]; then
          ${optionHelper} "$cur" ${shellWords(options)}
        else
          ${optionHelper} "$cur" ${shellWords(positionalChoicesForCommand)}
        fi
        return 0
      fi
` : `      if __adr_first_positional; then
        if [[ $cur == -* ]]; then
          ${optionHelper} "$cur" ${shellWords(options)}
        else
          ${optionHelper} "$cur" ${shellWords(positionalChoicesForCommand)}
        fi
        return 0
      fi
` : "";
  const lateOptionBranch = command === "help" || command === "completion" ? `      if [[ -z $cur || $cur == -* ]]; then
        ${optionHelper} "$cur" ${shellWords(options)}
        return 0
      fi
` : "";
  if (command === "help" || command === "completion") {
    return `    ${command})
      if [[ $cur == -- || $after_terminator -eq 1 ]]; then
        return 0
      fi
${valueBranch}${positionalBranch}${lateOptionBranch}      return 0
      ;;
`;
  }
  return `    ${command})
      if [[ $cur == -- || $after_terminator -eq 1 ]]; then
        return 0
      fi
${valueBranch}${positionalBranch}      if [[ -z $cur || $cur == -* ]]; then
        ${optionHelper} "$cur" ${shellWords(options)}
        return 0
      fi
      ;;
`;
}
function renderBashCompletion() {
  const rootCandidates = [...TOP_LEVEL_COMPLETION_OPTIONS, ...COMMAND_ORDER];
  const rootValueBranches = renderValueBranches("bash", TOP_LEVEL_COMPLETION_VALUE_CHOICES);
  const commandBranches = COMMAND_ORDER.map((command) => renderCommandBranch("bash", command)).join("");
  return `# shellcheck shell=bash
${renderBashScanHelpers()}
_adr_completion() {
  local cur prev command_index after_terminator command
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"

  if __adr_after_terminator; then
    after_terminator=1
  else
    after_terminator=0
  fi

  if [[ $after_terminator -eq 0 ]]; then
${rootValueBranches}  fi

  if [[ $cur == -- || $after_terminator -eq 1 ]]; then
    return 0
  fi

  command_index="$(__adr_command_index)"
  if [[ -z $command_index ]]; then
    command_index=0
  fi

  if [[ $command_index -eq 0 ]]; then
    if [[ $after_terminator -eq 0 ]]; then
      __adr_complete_words "$cur" ${shellWords(rootCandidates)}
    fi
    return 0
  fi

  command="\${COMP_WORDS[command_index]}"

  case "$command" in
${commandBranches}  esac
}

complete -F _adr_completion adr adrkit
`;
}
function renderZshCompletion() {
  const rootCandidates = [...TOP_LEVEL_COMPLETION_OPTIONS, ...COMMAND_ORDER];
  const rootValueBranches = renderValueBranches("zsh", TOP_LEVEL_COMPLETION_VALUE_CHOICES);
  const commandBranches = COMMAND_ORDER.map((command) => renderCommandBranch("zsh", command)).join("");
  return `#compdef adr adrkit
${renderZshScanHelpers()}
_adr_completion() {
  emulate -L zsh
  setopt localoptions noshwordsplit
  local cur prev command_index after_terminator command
  cur="\${words[CURRENT]}"
  prev="\${words[CURRENT-1]}"

  if __adr_after_terminator; then
    after_terminator=1
  else
    after_terminator=0
  fi

  if [[ $after_terminator -eq 0 ]]; then
${rootValueBranches}  fi

  if [[ $cur == -- || $after_terminator -eq 1 ]]; then
    return 0
  fi

  command_index="$(__adr_command_index)"
  if [[ -z $command_index ]]; then
    command_index=0
  fi

  if [[ $command_index -eq 0 ]]; then
    if [[ $after_terminator -eq 0 ]]; then
      __adr_complete_words "$cur" ${shellWords(rootCandidates)}
    fi
    return 0
  fi

  command="\${words[command_index]}"

  case "$command" in
${commandBranches}  esac
}

compdef _adr_completion adr adrkit
`;
}
function renderFishCompletion() {
  const lines = [];
  const binaryTargets = "-c adr -c adrkit";
  const rootCandidates = [...TOP_LEVEL_COMPLETION_OPTIONS, ...COMMAND_ORDER];
  lines.push(renderFishScanHelpers());
  lines.push(`complete ${binaryTargets} -n '__adr_root_position' -f -a "${shellWords(rootCandidates)}"`);
  lines.push(`complete ${binaryTargets} -n '__adr_root_position' -s h -l help -d 'Show help'`);
  lines.push(`complete ${binaryTargets} -n '__adr_root_position' -s V -l version -d 'Show version'`);
  lines.push(`complete ${binaryTargets} -n '__adr_color_value' -r -l color -a "${shellWords(GLOBAL_COLOR_VALUES)}"`);
  for (const command of COMMAND_ORDER) {
    const options = withGlobalColorOption(commandCompletionOptions(command).filter((option) => option !== "-h" && option !== "--help"));
    const valueChoices = commandValueChoiceMap(command) ?? {};
    const guard = `__adr_subcommand_is ${command}`;
    if (command === "help" || command === "completion") {
      const firstChoices = command === "help" ? COMMAND_ORDER : COMPLETION_SHELLS;
      lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator; and __adr_first_positional; and not __adr_current_token_is_option' -f -a "${shellWords(firstChoices)}"`);
      lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator; and not __adr_first_positional' -f -a "${shellWords(options)}"`);
      lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator; and __adr_first_positional; and __adr_current_token_is_option' -l color -d 'Colorize output'`);
      lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator; and __adr_first_positional' -s h -l help -d 'Show help'`);
      continue;
    }
    lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator' -s h -l help -d 'Show help'`);
    lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator' -f -a "${shellWords(options)}"`);
    for (const [flag, choices] of Object.entries(valueChoices)) {
      lines.push(`complete ${binaryTargets} -n '${guard}; and not __adr_color_value; and not __adr_after_terminator' -r -l ${flag.slice(2)} -a "${shellWords(choices)}"`);
    }
  }
  return `${lines.join(`
`)}
`;
}
function renderCompletionScript(shell) {
  if (shell === "bash")
    return renderBashCompletion();
  if (shell === "zsh")
    return renderZshCompletion();
  return renderFishCompletion();
}
function parseCompletionArgs(args) {
  const parsed = parseFlags(args);
  if (!parsed.ok)
    return parsed;
  if (parsed.help)
    return parsed;
  if (parsed.shell === undefined)
    return { ok: false, missing: true };
  return parsed;
}
async function runCompletion(args) {
  const parsed = parseCompletionArgs(args);
  if (!parsed.ok) {
    if ("missing" in parsed)
      return usageError("adr completion requires exactly one shell: bash, zsh, or fish.");
    if ("positional" in parsed)
      return usageError(`Positional argument "${parsed.positional}" is not supported. Use adr completion <shell>.`);
    return usageError(unknownOptionMessage(parsed.unknown));
  }
  if (parsed.help) {
    process.stdout.write(styleUsageBlock(COMPLETION_USAGE, getPresentation().stdout));
    return 0;
  }
  if (parsed.shell === undefined) {
    return usageError("adr completion requires exactly one shell: bash, zsh, or fish.");
  }
  if (!COMPLETION_SHELLS.includes(parsed.shell)) {
    return usageError(unknownShellMessage(parsed.shell));
  }
  process.stdout.write(renderCompletionScript(parsed.shell));
  return 0;
}

// ../../../oss/adrkit/packages/cli/src/queue.ts
import { readFile as readFile5 } from "node:fs/promises";
import { resolve as resolve9 } from "node:path";

// ../../../oss/adrkit/packages/cli/src/queue-terminal.ts
function resolveQueueFormat(format, stdoutIsTTY) {
  return format === "auto" ? stdoutIsTTY ? "terminal" : "markdown" : format;
}
var DAY_MS = 86400000;
function daysBetween(from, to) {
  const parse = (date) => Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));
  return Math.round((parse(to) - parse(from)) / DAY_MS);
}
function deadlineText(item, asOf) {
  if (item.deadlineDate === null)
    return null;
  const days = daysBetween(asOf, item.deadlineDate);
  const relative = days === 0 ? "today" : days > 0 ? `in ${days} day${days === 1 ? "" : "s"}` : `${-days} day${days === -1 ? "" : "s"} overdue`;
  return `due ${item.deadlineDate} (${relative})`;
}
function acceptBlockers(item) {
  const blockers = [];
  if (item.unresolvedObjectionCount > 0) {
    const n = item.unresolvedObjectionCount;
    blockers.push(`${n} unresolved objection${n === 1 ? "" : "s"}`);
  }
  if (item.quorum !== null && item.approvalCount < item.quorum) {
    blockers.push(`${item.approvalCount} of ${item.quorum} required approvals`);
  }
  return blockers;
}
function reviewLine(item) {
  const approvals = item.quorum === null ? `approvals ${item.approvalCount}` : `approvals ${item.approvalCount}/${item.quorum}`;
  const objections = item.resolvedObjectionCount > 0 ? `objections ${item.unresolvedObjectionCount} open, ${item.resolvedObjectionCount} resolved` : `objections ${item.unresolvedObjectionCount}`;
  const parts = [approvals, objections];
  if (item.routingTargets.length > 0)
    parts.push(`route ${item.routingTargets.join(", ")}`);
  return cleanText(parts.join(" · "));
}
function tierLine(item) {
  if (item.tier === null)
    return "no review tier";
  return cleanText(item.tierLabel === null ? item.tier : `${item.tier} · ${item.tierLabel}`);
}
function corpusFindingLines(findings, style, width) {
  if (findings.length === 0)
    return [];
  const lines = [style.heading("Corpus findings")];
  for (const finding of findings) {
    const lead = `  ${finding.severity.padEnd(5)}  `;
    const available = Math.max(1, width - lead.length);
    lines.push(`  ${style.severity(finding.severity)}${" ".repeat(Math.max(1, 7 - finding.severity.length))}${truncate(cleanText(finding.code), available)}`);
    lines.push(`${" ".repeat(lead.length)}${style.path(truncate(cleanText(finding.sourcePath), available))}`);
    for (const line of wrapText(cleanText(finding.message), available))
      lines.push(`${" ".repeat(lead.length)}${line}`);
  }
  lines.push("");
  return lines;
}
function itemLines(item, index, numberWidth, report, options, width) {
  const { style } = options;
  const marker = `${index + 1}.`.padEnd(numberWidth + 1);
  const indent = " ".repeat(marker.length + 1);
  const available = Math.max(1, width - indent.length);
  const lines = [];
  const id = cleanText(item.id);
  const deadline = deadlineText(item, report.asOf);
  const headPlain = `${marker} ${id}  ${item.slaState}${deadline ? ` · ${deadline}` : ""}`;
  if (terminalDisplayWidth(headPlain) <= width) {
    lines.push(`${marker} ${style.bold(id)}  ${style.status(item.slaState)}${deadline ? style.note(` · ${deadline}`) : ""}`);
  } else {
    lines.push(`${marker} ${style.bold(truncate(id, available))}  ${style.status(item.slaState)}`);
    if (deadline)
      lines.push(`${indent}${style.note(truncate(deadline, available))}`);
  }
  lines.push(`${indent}${truncate(cleanText(item.title), available)}`);
  for (const line of wrapText(tierLine(item), available))
    lines.push(`${indent}${style.note(line)}`);
  for (const line of wrapText(reviewLine(item), available))
    lines.push(`${indent}${line}`);
  lines.push(`${indent}${style.path(truncate(cleanText(item.sourcePath), available))}`);
  for (const finding of item.itemFindings) {
    const severity = finding.severity === "warn" ? "warn" : "info";
    const hang = " ".repeat(severity.length + 1);
    const text = cleanText(`${finding.code}: ${finding.message}`);
    const [first = "", ...rest] = wrapText(text, Math.max(1, available - hang.length));
    lines.push(`${indent}${style.severity(severity)} ${first}`);
    for (const line of rest)
      lines.push(`${indent}${hang}${line}`);
  }
  const blockers = acceptBlockers(item);
  const refusal = options.acceptRefusals?.get(item.sourcePath);
  if (blockers.length === 0 && refusal !== undefined)
    blockers.push(cleanText(refusal));
  if (blockers.length > 0) {
    for (const line of wrapText(`blocked: ${blockers.join("; ")}`, available))
      lines.push(`${indent}${style.yellow(line)}`);
  } else {
    const command = `adr accept ${id} --by <identity>`;
    const plain = `next: ${command}`;
    lines.push(terminalDisplayWidth(plain) <= available ? `${indent}${style.note("next:")} ${style.command(command)}` : `${indent}${style.command(truncate(command, available))}`);
  }
  return lines;
}
function renderTerminalQueue(report, options) {
  const width = clampColumns(options.columns);
  const { style } = options;
  const n = report.totalItems;
  const summary = [
    `${n} proposed`,
    `${report.totalCorpusFindings} corpus finding${report.totalCorpusFindings === 1 ? "" : "s"}`,
    `${report.itemsWithFindings} with item findings`
  ].join(" · ");
  const lines = [
    style.heading(truncate(`ARB queue — as of ${report.asOf}`, width)),
    ...wrapText(summary, width).map((line) => style.note(line)),
    "",
    ...corpusFindingLines(report.corpusFindings, style, width)
  ];
  if (report.items.length === 0) {
    lines.push(style.note("No proposed records. Nothing is waiting for a decision."));
  } else {
    const numberWidth = String(report.items.length).length;
    report.items.forEach((item, index) => {
      lines.push(...itemLines(item, index, numberWidth, report, options, width));
      lines.push("");
    });
    lines.pop();
  }
  lines.push("", style.note(truncate(`corpus ${report.corpusFingerprint.slice(0, 12)} · --format markdown|json for the full report`, width)));
  return `${lines.join(`
`)}
`;
}

// ../../../oss/adrkit/packages/cli/src/queue.ts
var USAGE = `Usage: adr queue [options]

Show the architecture review board operations queue for the local ADR corpus.

Options:
  --dir <path>              ADR corpus directory (default: docs/adr)
  --as-of <date>            UTC calendar date for SLA computation (default: today, UTC).
                            Accepts YYYY-MM-DD or an ISO datetime with an explicit
                            timezone (e.g. 2026-01-08 or 2026-01-08T00:00:00Z).
  --format <format>         auto|terminal|markdown|json (default: auto — terminal
                            on a TTY, markdown when piped or redirected)
${renderGlobalColorUsageLine()}
  -h, --help                Show this help and exit

Examples:
  adr queue
  adr queue --as-of 2026-08-24
  adr queue --format json
  adr queue | less          # piped: the canonical markdown report

Accept a record from the queue with: adr accept <id> --by <identity>

Exit codes: 0 = report, no error findings; 1 = report with corpus error findings;
2 = usage error (invalid flag/value or unreachable corpus directory).
`;
var QUEUE_USAGE = USAGE;
function usageError2(message) {
  process.stderr.write(formatUsageError(message, USAGE, "queue", getPresentation().stderr));
  return 2;
}
var QUEUE_OPTIONS = withGlobalColorOption(commandOptions("queue"));
var QUEUE_FORMAT_CHOICES = requiredCommandValueChoices("queue", "--format");
function formatChoiceList2(values) {
  if (values.length === 1)
    return `"${values[0]}"`;
  if (values.length === 2)
    return `"${values[0]}" or "${values[1]}"`;
  return `${values.slice(0, -1).map((value) => `"${value}"`).join(", ")}, or "${values[values.length - 1]}"`;
}
function unknownOptionMessage2(option) {
  const suggestion = closestCandidate(option, QUEUE_OPTIONS);
  return suggestion ? `Unknown option "${option}". Did you mean "${suggestion}"?` : `Unknown option "${option}".`;
}
function formatMessage(value) {
  const suggestion = closestCandidate(value, QUEUE_FORMAT_CHOICES);
  const expected = formatChoiceList2(QUEUE_FORMAT_CHOICES);
  const hint = suggestion ? ` Did you mean "${suggestion}"?` : "";
  return `Invalid --format value "${value}".${hint} Expected ${expected}.`;
}
function parseFlags2(args) {
  const flags = { dir: "docs/adr", format: "auto", help: false };
  for (let i = 0;i < args.length; i += 1) {
    const arg = args[i];
    const eq = arg.startsWith("--") ? arg.indexOf("=") : -1;
    const name = eq !== -1 ? arg.slice(0, eq) : arg;
    const inlineValue = eq !== -1 ? arg.slice(eq + 1) : undefined;
    if (name === "--help" || name === "-h") {
      flags.help = true;
      continue;
    }
    const valueFlag = name === "--dir" || name === "--as-of" || name === "--format";
    if (!valueFlag) {
      if (!name.startsWith("-"))
        return { ok: false, positional: name };
      return { ok: false, unknown: name };
    }
    let value;
    if (inlineValue !== undefined) {
      value = inlineValue;
    } else {
      const next = args[i + 1];
      if (next === undefined || next.startsWith("-")) {
        return { ok: false, missing: name };
      }
      value = next;
      i += 1;
    }
    if (value.length === 0)
      return { ok: false, missing: name };
    if (name === "--dir")
      flags.dir = value;
    else if (name === "--as-of")
      flags.asOf = value;
    else
      flags.format = value;
  }
  return { ok: true, flags };
}
async function acceptRefusals(sourcePaths) {
  const refusals = new Map;
  await Promise.all(sourcePaths.map(async (sourcePath) => {
    let source;
    try {
      source = await readFile5(resolve9(process.cwd(), sourcePath), "utf8");
    } catch {
      refusals.set(sourcePath, "the record could not be read to check whether it can be accepted");
      return;
    }
    const result = acceptAdrSource({ source, by: "@adrkit", decidedAt: "2000-01-01T00:00:00Z", path: sourcePath });
    if (!result.ok)
      refusals.set(sourcePath, result.message);
  }));
  return refusals;
}
async function runQueue(args) {
  const parsed = parseFlags2(args);
  if (!parsed.ok) {
    if ("missing" in parsed) {
      return usageError2(`Missing value for option "${parsed.missing}".`);
    }
    if ("positional" in parsed) {
      return usageError2(`Positional argument "${parsed.positional}" is not supported. Use --dir <path> to select the ADR corpus.`);
    }
    return usageError2(unknownOptionMessage2(parsed.unknown));
  }
  const { flags } = parsed;
  if (flags.help) {
    process.stdout.write(styleUsageBlock(USAGE, getPresentation().stdout));
    return 0;
  }
  if (!QUEUE_FORMAT_CHOICES.includes(flags.format)) {
    return usageError2(formatMessage(flags.format));
  }
  let asOf;
  if (flags.asOf !== undefined) {
    const resolution = resolveAsOf(flags.asOf);
    if (!resolution.ok) {
      const message = resolution.code === "tzless" ? `Invalid --as-of value "${flags.asOf}". Timezone-less datetimes are ambiguous — use YYYY-MM-DD or add an explicit timezone offset (e.g. Z or +05:00).` : `Invalid --as-of value "${flags.asOf}". Expected YYYY-MM-DD or ISO datetime with explicit timezone (e.g. 2026-01-08 or 2026-01-08T00:00:00Z).`;
      return usageError2(message);
    }
    asOf = resolution.date;
  } else {
    asOf = todayUtcDate();
  }
  let corpus;
  try {
    corpus = await lintCorpus({ dir: flags.dir });
  } catch (error) {
    const kind = corpusDirectoryErrorKind(error, flags.dir);
    if (kind)
      return usageError2(corpusDirectoryErrorMessage(flags.dir, kind));
    throw error;
  }
  const report = buildQueueReport({ corpus, asOf });
  const format = resolveQueueFormat(flags.format, process.stdout.isTTY === true);
  const output = format === "json" ? formatQueueReportJson(report) : format === "terminal" ? renderTerminalQueue(report, {
    columns: process.stdout.columns ?? 100,
    style: getPresentation().stdout,
    acceptRefusals: await acceptRefusals(report.items.map((item) => item.sourcePath))
  }) : formatQueueReportMarkdown(report);
  process.stdout.write(output);
  return report.corpusFindings.some((finding) => finding.severity === "error") ? 1 : 0;
}

// ../../../oss/adrkit/packages/cli/src/accept.ts
import { readFile as readFile6, writeFile as writeFile3 } from "node:fs/promises";
import { parseArgs } from "node:util";

// ../../../oss/adrkit/packages/cli/src/record-target.ts
import { resolve as resolve10 } from "node:path";
function candidateIds(raw) {
  const stripped = raw.replace(/^adr-/i, "");
  const padded = /^[0-9]+$/.test(stripped) ? stripped.padStart(4, "0") : stripped;
  return [...new Set([raw, stripped, padded])];
}
function belongsTo(finding, id, path) {
  return finding.id === id || finding.path === path;
}
function namesRecord(finding, id) {
  if (finding.id === id)
    return true;
  const file = finding.path?.split(/[\\/]/).pop() ?? "";
  return file.startsWith(`${id}-`);
}
async function resolveWriteTarget(rawId, dir, report) {
  let corpus;
  try {
    corpus = await lintCorpus({ dir });
  } catch (error) {
    const kind = corpusDirectoryErrorKind(error, dir);
    if (kind)
      return report.usageError(corpusDirectoryErrorMessage(dir, kind));
    throw error;
  }
  const errors = corpus.findings.filter((finding) => finding.severity === "error");
  let id;
  let matches = [];
  for (const candidate of candidateIds(rawId)) {
    matches = corpus.records.filter((record) => record.frontmatter.id === candidate);
    const invalid = errors.filter((finding) => namesRecord(finding, candidate));
    if (matches.length > 0 || invalid.length > 0) {
      id = candidate;
      if (matches.length === 0)
        return report.refusal(`ADR "${candidate}" exists but is invalid; fix it first.`, invalid);
      break;
    }
  }
  if (id === undefined)
    return report.usageError(`No ADR with id "${rawId}" exists in "${dir}".`);
  if (matches.length > 1) {
    return report.refusal(`more than one record declares id "${id}": ${matches.map((record) => record.path).join(", ")}.`);
  }
  const record = matches[0];
  const recordErrors = errors.filter((finding) => belongsTo(finding, id, record.path));
  if (recordErrors.length > 0)
    return report.refusal(`ADR-${id} has lint errors; fix them first.`, recordErrors);
  return { ok: true, id, record, absolutePath: resolve10(process.cwd(), record.path) };
}

// ../../../oss/adrkit/packages/cli/src/accept.ts
var USAGE2 = `Usage: adr accept <id> --by <identity> [options]

Accept a proposed decision record as its named ratifier (ADR-0044).

Sets status: accepted, provenance.ratifiedBy, and review.decidedAt (now, UTC),
and changes no other line. Nothing is committed: review the diff and open a
pull request. Refuses a record that is not proposed, has an unresolved
objection, lacks its review.quorum of approvals, or would not be valid.

Arguments:
  <id>                ADR id, as shown by adr queue (e.g. 0044)

Options:
  --by <identity>     Required. The human ratifier: @handle, team:slug, or email
  --dir <path>        ADR corpus directory (default: docs/adr)
  --json              Emit { id, path, status, ratifiedBy, decidedAt } as JSON
${renderGlobalColorUsageLine()}
  -h, --help          Show this help and exit

Examples:
  adr queue
  adr accept 0044 --by @octocat

Exit codes: 0 = accepted; 1 = refused (record unchanged); 2 = usage error.
`;
var ACCEPT_USAGE = USAGE2;
var ACCEPT_OPTIONS = withGlobalColorOption(commandOptions("accept"));
function usageError3(message) {
  process.stderr.write(formatUsageError(message, USAGE2, "accept", getPresentation().stderr));
  return 2;
}
function refusal(message, findings = []) {
  const style = getPresentation().stderr;
  const lines = [`${style.severity("error")} adr accept refused: ${cleanText(message)}`];
  for (const finding of findings) {
    const field = finding.field ? ` (${cleanText(finding.field)})` : "";
    lines.push(`  ${style.severity(finding.severity)} ${cleanText(finding.rule)}${field}: ${cleanText(finding.message)}`);
  }
  lines.push(style.note("The record was not changed."));
  process.stderr.write(`${lines.join(`
`)}
`);
  return 1;
}
function renderAccepted(result, style) {
  return [
    `${style.status("accepted")} ADR-${cleanText(result.id)}: ${cleanText(result.title)}`,
    `  ${style.label("ratified by")} ${result.ratifiedBy} ${style.note(`at ${result.decidedAt}`)}`,
    `  ${style.path(cleanText(result.path))}`,
    style.note("Nothing was committed. Review the diff, then open a pull request."),
    ""
  ].join(`
`);
}
async function runAccept(args) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      strict: true,
      options: {
        by: { type: "string", multiple: true },
        dir: { type: "string", default: "docs/adr" },
        json: { type: "boolean", default: false }
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const unknown = /^Unknown option ['"`]([^'"`]+)['"`]/.exec(message)?.[1];
    if (unknown) {
      const suggestion = closestCandidate(unknown, ACCEPT_OPTIONS);
      return usageError3(suggestion ? `Unknown option "${unknown}". Did you mean "${suggestion}"?` : `Unknown option "${unknown}".`);
    }
    return usageError3(message);
  }
  if (parsed.positionals.length !== 1) {
    return usageError3(parsed.positionals.length === 0 ? "adr accept requires an ADR id." : "adr accept takes exactly one ADR id.");
  }
  const rawId = String(parsed.positionals[0]);
  const byValues = parsed.values.by ?? [];
  if (byValues.length > 1) {
    return usageError3("--by was given more than once; adr accept records one ratifier.");
  }
  const by = byValues[0] ?? "";
  if (by === "") {
    return usageError3("adr accept requires --by <identity>: the human ratifying this decision. It is never inferred.");
  }
  if (!isWritableIdentity(by)) {
    return usageError3(`Invalid --by value ${JSON.stringify(by)}. Expected @handle, team:slug, or an email address. It may contain no control or invisible characters.`);
  }
  const target = await resolveWriteTarget(rawId, String(parsed.values.dir), { usageError: usageError3, refusal });
  if (typeof target === "number")
    return target;
  const { id, record, absolutePath } = target;
  const source = await readFile6(absolutePath, "utf8");
  const decidedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const result = acceptAdrSource({ source, by, decidedAt, path: record.path });
  if (!result.ok)
    return refusal(result.message, result.findings);
  await writeFile3(absolutePath, result.content, "utf8");
  const accepted = { id, title: record.frontmatter.title, path: record.path, ratifiedBy: by, decidedAt };
  if (parsed.values.json) {
    const json = { id, path: record.path, status: "accepted", ratifiedBy: by, decidedAt };
    process.stdout.write(`${JSON.stringify(json, null, 2)}
`);
  } else {
    process.stdout.write(renderAccepted(accepted, getPresentation().stdout));
  }
  return 0;
}

// ../../../oss/adrkit/packages/cli/src/review-commands.ts
import { readFile as readFile7, writeFile as writeFile4 } from "node:fs/promises";
import { parseArgs as parseArgs2 } from "node:util";
var COMMON_TAIL = `Nothing is committed: review the diff and open a pull request. --by is
required and is never inferred; it names the person whose review this is.`;
var APPROVE_USAGE = `Usage: adr approve <id> --by <identity> [options]

Record an approval on a proposed decision record (ADR-0051).

Adds <identity> to review.approvals and changes no other line. Approving
twice is a no-op. Refuses a record that is not proposed or is not valid.
${COMMON_TAIL}

Arguments:
  <id>                ADR id, as shown by adr queue (e.g. 0044)

Options:
  --by <identity>     Required. The approver: @handle, team:slug, or email
  --dir <path>        ADR corpus directory (default: docs/adr)
  --json              Emit { id, path, by, changed, approvals } as JSON
${renderGlobalColorUsageLine()}
  -h, --help          Show this help and exit

Examples:
  adr queue
  adr approve 0044 --by @octocat

Exit codes: 0 = approved, or already approved; 1 = refused (record unchanged);
2 = usage error.
`;
var OBJECT_USAGE = `Usage: adr object <id> --by <identity> --summary <text> [options]

Raise an objection on a proposed decision record (ADR-0051).

Appends { by, summary, resolved: false } to review.objections and changes no
other line. An unresolved objection blocks adr accept until the objector
resolves it. Raising the same open objection twice is a no-op. Refuses a
record that is not proposed or is not valid.
${COMMON_TAIL}

Arguments:
  <id>                ADR id, as shown by adr queue (e.g. 0044)

Options:
  --by <identity>     Required. The objector: @handle, team:slug, or email
  --summary <text>    Required. One line, at most ${MAX_OBJECTION_SUMMARY_LENGTH} characters;
                      write --summary=-text for a summary that starts with -
  --dir <path>        ADR corpus directory (default: docs/adr)
  --json              Emit { id, path, by, changed, objection } as JSON
${renderGlobalColorUsageLine()}
  -h, --help          Show this help and exit

Examples:
  adr object 0044 --by @octocat --summary "Needs a load test first"

Exit codes: 0 = objection recorded, or already open; 1 = refused (record
unchanged); 2 = usage error.
`;
var RESOLVE_USAGE = `Usage: adr resolve <id> --objection <n> --by <identity> [options]

Resolve your own objection on a proposed decision record (ADR-0051).

Sets resolved: true on objection <n> (1-based, in file order) and changes no
other line. Only the objector may resolve an objection: --by must equal its
by. Resolving a resolved objection is a no-op. Refuses a record that is not
proposed or is not valid.
${COMMON_TAIL}

Arguments:
  <id>                ADR id, as shown by adr queue (e.g. 0044)

Options:
  --objection <n>     Required. Which objection, counting from 1
  --by <identity>     Required. The objector: @handle, team:slug, or email
  --dir <path>        ADR corpus directory (default: docs/adr)
  --json              Emit { id, path, by, changed, objection } as JSON
${renderGlobalColorUsageLine()}
  -h, --help          Show this help and exit

Examples:
  adr resolve 0044 --objection 1 --by @octocat

Exit codes: 0 = resolved, or already resolved; 1 = refused (record unchanged);
2 = usage error.
`;
var USAGES = { approve: APPROVE_USAGE, object: OBJECT_USAGE, resolve: RESOLVE_USAGE };
function usageErrorFor(command) {
  return (message) => {
    process.stderr.write(formatUsageError(message, USAGES[command], command, getPresentation().stderr));
    return 2;
  };
}
function refusalFor(command) {
  return (message, findings = []) => {
    const style = getPresentation().stderr;
    const lines = [`${style.severity("error")} adr ${command} refused: ${cleanText(message)}`];
    for (const finding of findings) {
      const field = finding.field ? ` (${cleanText(finding.field)})` : "";
      lines.push(`  ${style.severity(finding.severity)} ${cleanText(finding.rule)}${field}: ${cleanText(finding.message)}`);
    }
    lines.push(style.note("The record was not changed."));
    process.stderr.write(`${lines.join(`
`)}
`);
    return 1;
  };
}
async function run(command, args) {
  const usageError = usageErrorFor(command.name);
  const refusal = refusalFor(command.name);
  let parsed;
  try {
    parsed = parseArgs2({
      args,
      allowPositionals: true,
      strict: true,
      options: {
        by: { type: "string", multiple: true },
        dir: { type: "string", default: "docs/adr" },
        json: { type: "boolean", default: false },
        ...command.options
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const unknown = /^Unknown option ['"`]([^'"`]+)['"`]/.exec(message)?.[1];
    if (unknown) {
      const suggestion = closestCandidate(unknown, withGlobalColorOption(commandOptions(command.name)));
      return usageError(suggestion ? `Unknown option "${unknown}". Did you mean "${suggestion}"?` : `Unknown option "${unknown}".`);
    }
    return usageError(message);
  }
  if (parsed.positionals.length !== 1) {
    return usageError(parsed.positionals.length === 0 ? `adr ${command.name} requires an ADR id.` : `adr ${command.name} takes exactly one ADR id.`);
  }
  const rawId = String(parsed.positionals[0]);
  const byValues = parsed.values.by ?? [];
  if (byValues.length > 1) {
    return usageError(`--by was given more than once; adr ${command.name} records one person's review.`);
  }
  const by = byValues[0] ?? "";
  if (by === "") {
    return usageError(`adr ${command.name} requires --by <identity>: the person whose review this is. It is never inferred.`);
  }
  if (!isWritableIdentity(by)) {
    return usageError(`Invalid --by value ${JSON.stringify(by)}. Expected @handle, team:slug, or an email address. It may contain no control or invisible characters.`);
  }
  const invalid = command.validate(parsed.values);
  if (invalid)
    return usageError(invalid);
  const target = await resolveWriteTarget(rawId, String(parsed.values.dir), { usageError, refusal });
  if (typeof target === "number")
    return target;
  const { id, record, absolutePath } = target;
  const source = await readFile7(absolutePath, "utf8");
  const result = command.apply(source, by, record.path, parsed.values);
  if (!result.ok)
    return refusal(result.message, result.findings);
  const { outcome } = result;
  if (outcome.changed)
    await writeFile4(absolutePath, outcome.content, "utf8");
  if (parsed.values.json) {
    const json = { id, path: record.path, by, changed: outcome.changed, ...outcome.extra };
    process.stdout.write(`${JSON.stringify(json, null, 2)}
`);
    return 0;
  }
  const style = getPresentation().stdout;
  const lines = outcome.changed ? [
    `${style.status(outcome.verb)} ADR-${cleanText(id)}: ${cleanText(record.frontmatter.title)}`,
    `  ${outcome.detail}`,
    `  ${style.path(cleanText(record.path))}`,
    style.note("Nothing was committed. Review the diff, then open a pull request.")
  ] : [
    `${style.note("unchanged")} ADR-${cleanText(id)}: ${cleanText(record.frontmatter.title)}`,
    `  ${outcome.noop}`,
    style.note("Nothing was written.")
  ];
  process.stdout.write(`${lines.join(`
`)}
`);
  return 0;
}
var APPROVE = {
  name: "approve",
  options: {},
  validate: () => {
    return;
  },
  apply(source, by, path) {
    const result = approveAdrSource({ source, by, path });
    if (!result.ok)
      return result;
    return {
      ok: true,
      outcome: {
        changed: result.changed,
        content: result.content,
        extra: { approvals: result.approvals },
        verb: "approved",
        detail: `by ${cleanText(by)}; ${result.approvals} approval(s) recorded`,
        noop: `The record already has an approval from ${cleanText(by)}.`
      }
    };
  }
};
var OBJECT = {
  name: "object",
  options: { summary: { type: "string" } },
  validate(values) {
    if (values.summary === undefined)
      return "adr object requires --summary <text>: one line saying what the concern is.";
    return objectionSummaryProblem(String(values.summary));
  },
  apply(source, by, path, values) {
    const result = objectAdrSource({ source, by, summary: String(values.summary), path });
    if (!result.ok)
      return result;
    return {
      ok: true,
      outcome: {
        changed: result.changed,
        content: result.content,
        extra: { objection: result.objection },
        verb: "objected",
        detail: `objection ${result.objection} raised by ${cleanText(by)}; adr accept refuses until it is resolved`,
        noop: `The record already has this open objection from ${cleanText(by)} (objection ${result.objection}).`
      }
    };
  }
};
var OBJECTION_NUMBER = /^[1-9][0-9]*$/;
var RESOLVE = {
  name: "resolve",
  options: { objection: { type: "string" } },
  validate(values) {
    if (values.objection === undefined)
      return "adr resolve requires --objection <n>: which objection, counting from 1.";
    const raw = String(values.objection);
    if (!OBJECTION_NUMBER.test(raw) || !Number.isSafeInteger(Number(raw))) {
      return `Invalid --objection value "${raw}". Expected a positive whole number, counting from 1.`;
    }
    return;
  },
  apply(source, by, path, values) {
    const objection = Number(values.objection);
    const result = resolveObjectionAdrSource({ source, by, objection, path });
    if (!result.ok)
      return result;
    return {
      ok: true,
      outcome: {
        changed: result.changed,
        content: result.content,
        extra: { objection },
        verb: "resolved",
        detail: `objection ${objection}, by its objector ${cleanText(by)}`,
        noop: `Objection ${objection} is already resolved.`
      }
    };
  }
};
var runApprove = (args) => run(APPROVE, args);
var runObject = (args) => run(OBJECT, args);
var runResolve = (args) => run(RESOLVE, args);

// ../../../oss/adrkit/packages/cli/src/main-module.ts
import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
function isMainModule(moduleUrl, argvPath) {
  if (!argvPath || !existsSync(argvPath))
    return false;
  return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argvPath);
}

// ../../../oss/adrkit/packages/cli/src/index.ts
var CLI_VERSION = "0.20.0";
function topLevelUsage(style) {
  return renderTopLevelUsage(CLI_VERSION, style);
}
function writeStdout(text) {
  process.stdout.write(text);
}
function writeStderr(text) {
  process.stderr.write(text);
}
function extractColorMode(argv) {
  let colorMode = "auto";
  const args = [];
  for (let index = 0;index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      args.push(...argv.slice(index));
      break;
    }
    if (arg !== "--color" && !arg.startsWith("--color=")) {
      args.push(arg);
      continue;
    }
    let value = "";
    if (arg === "--color") {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith("-")) {
        return { error: 'Missing value for option "--color".' };
      }
      value = next;
      index += 1;
    } else {
      value = arg.slice("--color=".length);
      if (value.length === 0)
        return { error: 'Missing value for option "--color".' };
    }
    if (!GLOBAL_COLOR_VALUES.includes(value)) {
      return { error: `Invalid --color value "${value}". Expected "auto", "always", or "never".` };
    }
    colorMode = value;
  }
  return { colorMode, args };
}
function extractUnknownOption(message) {
  const match = /^Unknown option ['"`]([^'"`]+)['"`]/.exec(message);
  return match?.[1];
}
function unknownOptionMessage3(option, candidates) {
  const suggestion = closestCandidate(option, candidates);
  return suggestion ? `Unknown option "${option}". Did you mean "${suggestion}"?` : `Unknown option "${option}".`;
}
function corpusDirectoryUsageError(dir, kind, command) {
  return usageError4(corpusDirectoryErrorMessage(dir, kind), command);
}
function handleCorpusDirectoryError2(error, dir, command) {
  const kind = corpusDirectoryErrorKind(error, dir);
  return kind ? corpusDirectoryUsageError(dir, kind, command) : undefined;
}
async function ensureCorpusDirectoryReadable2(dir, command) {
  try {
    await readdir4(dir);
    return;
  } catch (error) {
    const exitCode = handleCorpusDirectoryError2(error, dir, command);
    if (exitCode !== undefined)
      return exitCode;
    throw error;
  }
}
function hasValueFlag(args, flag) {
  for (const arg of args) {
    if (arg === "--")
      return false;
    if (arg === flag || arg.startsWith(`${flag}=`))
      return true;
  }
  return false;
}
function hasHelpFlagBeforeTerminator(args) {
  for (const arg of args) {
    if (arg === "--")
      return false;
    if (isHelpFlag(arg))
      return true;
  }
  return false;
}
var COMMAND_USAGE = {
  new: `Usage: adr new <title> [options]

Create a decision record with the next available numeric ID.

Arguments:
  <title>             Decision title

Options:
  --status <status>   Initial status: draft|proposed|rejected|deprecated
                      (default: draft)
  --dir <path>        ADR corpus directory (default: docs/adr)
  --json              Emit { id, path } as JSON
${renderGlobalColorUsageLine()}
  -h, --help          Show this help and exit

Examples:
  adr new "Adopt PostgreSQL"
  adr new "Trial a regional cache" --status proposed

Exit codes: 0 = created; 1 = refused to overwrite an existing file; 2 = usage error.
`,
  lint: `Usage: adr lint [paths...] [options]

Validate the ADR corpus. With no paths, every discoverable record under --dir is checked.

Arguments:
  [paths...]      Optional ADR files to validate

Options:
  --dir <path>    ADR corpus directory (default: docs/adr)
  --json          Emit { checked, findings } as JSON
${renderGlobalColorUsageLine()}
    -h, --help      Show this help and exit

Examples:
  adr lint
  adr lint docs/adr/0012-adopt-postgresql.md
  adr lint --json

Exit codes: 0 = no error findings; 1 = one or more error findings;
2 = usage error (invalid invocation or unreachable corpus directory).
`,
  check: `Usage: adr check [files...] [options]

Report the decisions governing changed files and validate changed ADRs.
With no files, the command performs a successful no-op.

Arguments:
  [files...]      Optional repo-relative paths to review

Options:
  --dir <path>    ADR corpus directory (default: docs/adr)
  --json          Emit the CheckOutcome as JSON
${renderGlobalColorUsageLine()}
  -h, --help      Show this help and exit

Examples:
  adr check src/auth/session.ts package.json
  adr check --json src/auth/session.ts

Exit codes: 0 = ok; 1 = a changed record has an error finding;
2 = usage error (invalid invocation or unreachable corpus directory).
`,
  explain: `Usage: adr explain <path> [options]

Report which decisions govern one repo-relative path, and why.

A decision reaches a path in two directions. The record declares an "affects" pattern
that matches it ("via path: src/**"), or the file itself declares the record in a
comment ("declared by src/sync.ts:3 (@adr 0012)"). If <path> exists, at most its first
8192 bytes are scanned for dedicated "@adr <id>" comment lines -- the scan stops at the
last complete line inside that bound, and --json reports the extent it reached. A marker
naming a record the corpus does not have is reported as a dangling-marker warning. A
marker naming a superseded, rejected, or deprecated record is reported as a stale-marker
warning; a resolvable supersession chain names its terminal live successor.

With --as-of, the same decisions are reported as they stood on a past date. A record's
window opens on its own "date" and closes on its successor's, so a record superseded
today was governing then. Which decisions reach <path> is still read from today's corpus
and today's working tree; only their standing is re-dated.

Arguments:
  <path>          Repo-relative path to explain

Options:
  --dir <path>    ADR corpus directory (default: docs/adr)
  --as-of <when>  Report standing as of a past date instead of today. Accepts
                  YYYY-MM-DD, an ISO datetime with an explicit timezone, or a git
                  ref resolved to its commit's committer date in the current
                  directory. Dates are tried first, so a tag named like a date is
                  read as a date.
  --json          Emit { path, governedBy, governing, activeProposals, history,
                  markers, findings }, plus "asOf" when --as-of is given. Pattern
                  matches carry "firedMatchers"; file declarations carry "declaredBy".
${renderGlobalColorUsageLine()}
  -h, --help      Show this help and exit

Examples:
  adr explain src/auth/session.ts
  adr explain --json src/auth/session.ts
  adr explain src/auth/session.ts --as-of 2026-03-01
  adr explain src/auth/session.ts --as-of a1b2c3d

Exit codes: 0 = explained; 1 = corpus has error findings;
2 = usage error (invalid invocation, unreachable corpus directory, or an --as-of
value that is neither a date nor a resolvable git ref).
`,
  graph: `Usage: adr graph [options]

Render supersedes, relatesTo, and conflictsWith relationships for the corpus.

Options:
  --dir <path>          ADR corpus directory (default: docs/adr)
  --format <format>     auto|terminal|dot|json|mermaid (default: auto)
  --focus <id>          Keep one ADR and its directly connected decisions
  --kind <kind>         Keep one relationship kind; repeat to include more
${renderGlobalColorUsageLine()}
  -h, --help            Show this help and exit

Examples:
  adr graph
  adr graph --focus 0014
  adr graph --kind supersedes
  adr graph --format mermaid
  adr graph --format dot > decisions.dot
  adr graph --format json

Exit codes: 0 = rendered without corpus errors; 1 = rendered with corpus errors;
2 = usage error (invalid invocation or unreachable corpus directory).
`,
  queue: QUEUE_USAGE,
  approve: APPROVE_USAGE,
  object: OBJECT_USAGE,
  resolve: RESOLVE_USAGE,
  accept: ACCEPT_USAGE,
  evaluate: `Usage: adr evaluate <proposal-path> --snapshot <bundle.json> --date YYYY-MM-DD [options]

Run the deterministic evaluator over one proposal against an offline snapshot bundle.

Arguments:
  <proposal-path>      Proposed ADR to evaluate

Options:
  --snapshot <path>   Snapshot bundle (required)
  --date <date>       Evaluation date, YYYY-MM-DD (required)
  --dir <path>        ADR corpus directory (default: proposal directory)
  --json              Emit the evaluation report as JSON
${renderGlobalColorUsageLine()}
  -h, --help          Show this help and exit

The evaluator routes; it never approves, persists, or writes. There is no --write.

Examples:
  adr evaluate docs/adr/0042-adopt-postgresql.md \\
    --snapshot evidence/bundle.json --date 2026-08-24
  adr evaluate proposals/0042-adopt-postgresql.md --dir docs/adr \\
    --snapshot evidence/bundle.json --date 2026-08-24

Exit codes: 0 = evaluated (including warn/info/inert and escalation);
1 = the proposal was returned on a rubric error; 2 = usage error, unreachable
corpus directory, or malformed snapshot bundle.
`,
  migrate: `Usage: adr migrate --from madr [options]

Import a MADR corpus in place by adding adrkit frontmatter and preserving each body.
Migration is one-way: adrkit does not sync later changes back to MADR.

Options:
  --from madr     Source format (required; only madr is supported)
  --dir <path>    ADR corpus directory (default: docs/adr)
  --dry-run       Report what would change without writing
  --rename        Rename each migrated file to <id>-<slug>.md so corpus discovery
                  can see it. Off by default, because migration is in place.
  --json          Emit the migration result as JSON
${renderGlobalColorUsageLine()}
  -h, --help      Show this help and exit

Examples:
  adr migrate --from madr --dry-run
  adr migrate --from madr --rename

Exit codes: 0 = migration ran (findings are reported but do not fail the run);
2 = usage error (missing or unsupported --from, unknown flag, positional argument,
or unreachable corpus directory).
`,
  help: `Usage: adr help [command]

Show top-level help or detailed help for one command.

Arguments:
  [command]       Optional command to describe

Examples:
  adr help
  adr help check

Options:
${renderGlobalColorUsageLine()}
`,
  completion: COMPLETION_USAGE
};
var COMMANDS = COMMAND_ORDER;
var LINT_OPTIONS = withGlobalColorOption(commandOptions("lint"));
var MIGRATE_OPTIONS = withGlobalColorOption(commandOptions("migrate"));
var NEW_OPTIONS = withGlobalColorOption(commandOptions("new"));
var GRAPH_OPTIONS = withGlobalColorOption(commandOptions("graph"));
var EXPLAIN_OPTIONS = withGlobalColorOption(commandOptions("explain"));
var CHECK_OPTIONS = withGlobalColorOption(commandOptions("check"));
var EVALUATE_OPTIONS = withGlobalColorOption(commandOptions("evaluate"));
var NEW_ALLOWED_STATUSES = requiredCommandValueChoices("new", "--status");
var GRAPH_FORMAT_CHOICES = requiredCommandValueChoices("graph", "--format");
var GRAPH_KIND_CHOICES = requiredCommandValueChoices("graph", "--kind");
var MIGRATE_FROM_CHOICES = requiredCommandValueChoices("migrate", "--from");
function commandUsageFor(command) {
  return Object.hasOwn(COMMAND_USAGE, command) ? COMMAND_USAGE[command] : undefined;
}
function usageError4(message, command) {
  writeStderr(formatUsageError(message, command ? commandUsageFor(command) ?? "" : topLevelUsage(getPresentation().stderr), command, getPresentation().stderr));
  return 2;
}
function isHelpFlag(arg) {
  return arg === "--help" || arg === "-h";
}
function runHelp(args) {
  const unsupportedFlag = args.find((arg) => arg.startsWith("-") && !isHelpFlag(arg));
  if (unsupportedFlag)
    return usageError4(unknownOptionMessage3(unsupportedFlag, withGlobalColorOption(["--help"])));
  const positionals = args.filter((arg) => !arg.startsWith("-"));
  if (positionals.length > 1)
    return usageError4("adr help accepts at most one command.");
  const requested = positionals[0];
  if (requested === undefined) {
    writeStdout(topLevelUsage(getPresentation().stdout));
    return 0;
  }
  const commandUsage = commandUsageFor(requested);
  if (!commandUsage) {
    return usageError4(unknownCommandMessage(requested));
  }
  writeStdout(styleUsageBlock(commandUsage, getPresentation().stdout));
  return 0;
}
function unknownCommandMessage(command) {
  const suggestion = closestCandidate(command, COMMANDS);
  return suggestion ? `Unknown command "${command}". Did you mean "${suggestion}"?` : `Unknown command "${command}".`;
}
function parseCommandArgs(args, options, allowedOptions) {
  try {
    return parseArgs3({ args, options, allowPositionals: true, strict: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const unsupported = extractUnknownOption(message);
    if (unsupported)
      throw new Error(unknownOptionMessage3(unsupported, allowedOptions));
    throw error;
  }
}
function renderFinding(finding, style = getPresentation().stdout) {
  const field = finding.field ? ` ${finding.field}` : "";
  const id = finding.id ? ` ${finding.id}` : "";
  const pattern = finding.pattern ? ` ${finding.pattern}` : "";
  return `  ${style.severity(finding.severity)} ${style.label(finding.rule)}${id}${field}${pattern}: ${finding.message}
`;
}
function renderHumanLint(findings, style = getPresentation().stdout) {
  const grouped = new Map;
  for (const finding of findings) {
    const group = finding.path ?? "(corpus)";
    let list = grouped.get(group);
    if (!list) {
      list = [];
      grouped.set(group, list);
    }
    list.push(finding);
  }
  let output = "";
  for (const [path, groupFindings] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    output += `${style.path(path)}
`;
    for (const finding of groupFindings) {
      output += renderFinding(finding, style);
    }
  }
  return output;
}
function findingBelongsToRecord(finding, id) {
  if (finding.id === id)
    return true;
  const fileName = finding.path?.replace(/\\/g, "/").split("/").at(-1);
  return fileName?.startsWith(`${id}-`) === true && fileName.endsWith(".md");
}
async function runLint(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      json: { type: "boolean", default: false },
      dir: { type: "string", default: "docs/adr" }
    }, LINT_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "lint");
  }
  const dir = String(parsed.values.dir);
  if (parsed.positionals.length > 0 && hasValueFlag(args, "--dir")) {
    const exitCode = await ensureCorpusDirectoryReadable2(dir, "lint");
    if (exitCode !== undefined)
      return exitCode;
  }
  let result;
  try {
    result = await lintCorpus({
      dir,
      paths: parsed.positionals
    });
  } catch (error) {
    const exitCode = handleCorpusDirectoryError2(error, dir, "lint");
    if (exitCode !== undefined)
      return exitCode;
    throw error;
  }
  const findings = sortFindings(result.findings);
  const counts = countFindings(findings);
  if (parsed.values.json) {
    writeStdout(formatLintReportJson(buildLintReport(result, findings)));
  } else {
    const humanFindings = renderHumanLint(findings, getPresentation().stderr);
    if (humanFindings)
      writeStderr(humanFindings);
    writeStdout(`${getPresentation().stdout.label("checked")} ${result.checked} records, ${counts.errors} errors, ${counts.warnings} warnings
`);
  }
  return exitCodeForFindings(findings);
}
function renderHumanMigrate(result, style = getPresentation().stdout) {
  const counts = {
    migrated: 0,
    updated: 0,
    unchanged: 0,
    diverged: 0,
    skipped: 0
  };
  let output = "";
  for (const item of result.results) {
    counts[item.outcome] += 1;
    const renamed = item.renamedTo ? ` -> ${item.renamedTo}` : "";
    output += `${style.outcome(item.outcome)}  ${style.path(item.path)}${renamed}
`;
  }
  output += `${style.label("summary:")} migrated ${counts.migrated}, updated ${counts.updated}, unchanged ${counts.unchanged}, diverged ${counts.diverged}, skipped ${counts.skipped}
`;
  output += `${style.heading("Divergence (report only):")}
`;
  if (result.divergence.length === 0) {
    output += `  ${style.note("none")}
`;
  } else {
    for (const item of result.divergence) {
      output += `  ${style.path(item.path)}  ${style.label("sourceRef")}=${item.sourceRef}
`;
    }
  }
  if (result.findings.length > 0) {
    output += `${style.heading("Findings:")}
`;
    for (const finding of result.findings) {
      output += renderFinding(finding, style);
    }
  }
  return output;
}
async function runMigrate(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      from: { type: "string" },
      dir: { type: "string", default: "docs/adr" },
      "dry-run": { type: "boolean", default: false },
      rename: { type: "boolean", default: false },
      json: { type: "boolean", default: false }
    }, MIGRATE_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "migrate");
  }
  if (parsed.positionals.length > 0)
    return usageError4("adr migrate does not accept positional arguments.", "migrate");
  const from = parsed.values.from;
  if (typeof from !== "string" || !MIGRATE_FROM_CHOICES.includes(from)) {
    const suggestion = typeof from === "string" ? closestCandidate(from, MIGRATE_FROM_CHOICES) : undefined;
    return usageError4(from ? suggestion ? `Unsupported --from value "${String(from)}". Did you mean "${suggestion}"? Only "madr" is available; migration is one-way.` : `Unsupported --from value "${String(from)}". Only "madr" is available; migration is one-way.` : "adr migrate requires --from madr.", "migrate");
  }
  const dir = String(parsed.values.dir);
  const dirExitCode = await ensureCorpusDirectoryReadable2(dir, "migrate");
  if (dirExitCode !== undefined)
    return dirExitCode;
  let result;
  try {
    result = await migrateMadr({
      dir,
      write: parsed.values["dry-run"] !== true,
      rename: parsed.values.rename === true
    });
  } catch (error) {
    const exitCode = handleCorpusDirectoryError2(error, dir, "migrate");
    if (exitCode !== undefined)
      return exitCode;
    throw error;
  }
  if (parsed.values.json) {
    writeStdout(`${JSON.stringify(result, null, 2)}
`);
  } else {
    writeStdout(renderHumanMigrate(result, getPresentation().stdout));
  }
  return 0;
}
async function runNew(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      json: { type: "boolean", default: false },
      dir: { type: "string", default: "docs/adr" },
      status: { type: "string", default: "draft" }
    }, NEW_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "new");
  }
  const title = parsed.positionals.join(" ").trim();
  if (!title)
    return usageError4("adr new requires a title.", "new");
  const status = String(parsed.values.status);
  const suggestion = closestCandidate(status, NEW_ALLOWED_STATUSES);
  if (suggestion && !NEW_ALLOWED_STATUSES.includes(status)) {
    return usageError4(`Invalid status "${status}". Did you mean "${suggestion}"?`, "new");
  }
  try {
    const result = await createAdr({
      title,
      status,
      dir: String(parsed.values.dir)
    });
    if (parsed.values.json) {
      writeStdout(formatNewAdrReportJson(buildNewAdrReport(result)));
    } else {
      writeStdout(`${getPresentation().stdout.path(result.path)}
`);
    }
    return 0;
  } catch (error) {
    if (error instanceof ScaffoldError) {
      if (error.code === "usage")
        return usageError4(error.message, "new");
      writeStderr(`${error.message}
`);
      return 1;
    }
    throw error;
  }
}
async function runGraph(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      dir: { type: "string", default: "docs/adr" },
      format: { type: "string", default: "auto" },
      focus: { type: "string" },
      kind: { type: "string", multiple: true }
    }, GRAPH_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "graph");
  }
  if (parsed.positionals.length > 0)
    return usageError4("adr graph does not accept positional arguments.", "graph");
  const format = String(parsed.values.format);
  if (!isGraphFormat(format)) {
    const suggestion = closestCandidate(format, GRAPH_FORMAT_CHOICES);
    return usageError4(suggestion ? `adr graph --format must be "auto", "terminal", "dot", "json", or "mermaid". Did you mean "${suggestion}"?` : 'adr graph --format must be "auto", "terminal", "dot", "json", or "mermaid".', "graph");
  }
  const kinds = [];
  for (const rawKind of (Array.isArray(parsed.values.kind) ? parsed.values.kind : []).map(String)) {
    if (isGraphKind(rawKind)) {
      kinds.push(rawKind);
      continue;
    }
    const suggestion = closestCandidate(rawKind, GRAPH_KIND_CHOICES);
    return usageError4(suggestion ? `adr graph --kind must be "supersedes", "relatesTo", or "conflictsWith". Did you mean "${suggestion}"?` : 'adr graph --kind must be "supersedes", "relatesTo", or "conflictsWith".', "graph");
  }
  const focus = parsed.values.focus === undefined ? undefined : String(parsed.values.focus);
  if (focus === "") {
    return usageError4("adr graph --focus requires a non-empty ADR id.", "graph");
  }
  const dir = String(parsed.values.dir);
  let result;
  try {
    result = await lintCorpus({ dir });
  } catch (error) {
    const exitCode = handleCorpusDirectoryError2(error, dir, "graph");
    if (exitCode !== undefined)
      return exitCode;
    throw error;
  }
  const graph = buildAdrGraph(result.records);
  const errorFindings = result.findings.filter((finding) => finding.severity === "error");
  if (focus !== undefined && !graph.nodes.some((node) => node.id === focus)) {
    const focusFindings = errorFindings.filter((finding) => findingBelongsToRecord(finding, focus));
    if (focusFindings.length > 0) {
      writeStderr(`ADR "${focus}" exists but is invalid:
`);
      writeStderr(renderHumanLint(focusFindings, getPresentation().stderr));
      return 1;
    }
    return usageError4(`No ADR with id "${focus}" exists in "${dir}".`, "graph");
  }
  const filtered = filterAdrGraph(graph, {
    focus,
    kinds
  });
  const resolvedFormat = resolveGraphFormat(format, process.stdout.isTTY === true);
  switch (resolvedFormat) {
    case "terminal":
      writeStdout(renderTerminalGraph(filtered, {
        columns: process.stdout.columns ?? 100,
        focus,
        style: getPresentation().stdout
      }));
      break;
    case "dot":
      writeStdout(renderDotGraph(filtered));
      break;
    case "json":
      writeStdout(renderJsonGraph(filtered));
      break;
    case "mermaid":
      writeStdout(renderMermaidGraph(filtered));
      break;
  }
  if (errorFindings.length > 0) {
    writeStderr(renderHumanLint(errorFindings, getPresentation().stderr));
    return 1;
  }
  return 0;
}
async function runExplain(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      json: { type: "boolean", default: false },
      dir: { type: "string", default: "docs/adr" },
      "as-of": { type: "string" }
    }, EXPLAIN_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "explain");
  }
  if (parsed.positionals.length !== 1)
    return usageError4("adr explain requires exactly one path.", "explain");
  const path = parsed.positionals[0];
  if (!path)
    return usageError4("adr explain requires exactly one path.", "explain");
  const requestedAsOf = parsed.values["as-of"];
  let asOf;
  if (requestedAsOf !== undefined) {
    const cwd = process.cwd();
    const resolution = await resolveExplainAsOf(String(requestedAsOf), cwd);
    if (!resolution.ok) {
      return usageError4(asOfFailureMessage(String(requestedAsOf), resolution.failure, cwd), "explain");
    }
    asOf = resolution.value;
  }
  const dir = String(parsed.values.dir);
  let corpus;
  try {
    corpus = await lintCorpus({ dir });
  } catch (error) {
    const exitCode = handleCorpusDirectoryError2(error, dir, "explain");
    if (exitCode !== undefined)
      return exitCode;
    throw error;
  }
  const scan = await readSourceMarkers(path);
  const corpusFindings = sortFindings(corpus.findings);
  if (exitCodeForFindings(corpusFindings) !== 0) {
    if (parsed.values.json) {
      writeStdout(formatExplainReportJson(buildExplainReport({ path, scan, ...asOf ? { asOf } : {}, findings: corpusFindings })));
    } else {
      const humanFindings = renderHumanLint(corpusFindings, getPresentation().stderr);
      if (humanFindings)
        writeStderr(humanFindings);
      writeStdout(renderMarkerScanNote(scan, getPresentation().stdout));
    }
    return 1;
  }
  const resolution = resolveAffects({ records: corpus.records, changedFiles: [path] });
  const markerResolution = resolveSourceMarkers({
    records: corpus.records,
    markers: scan.markers,
    ...asOf ? { asOf: asOf.date } : {}
  });
  const governedBy = mergeSourceDeclarations(toGoverningDecisions(corpus.records, resolution.matches), corpus.records, markerResolution.matches);
  const buckets = bucketDecisions(governedBy);
  const asOfView = asOf ? resolveDecisionsAsOf({ records: corpus.records, decisions: governedBy, asOf: asOf.date }) : undefined;
  const findings = sortFindings([
    ...resolution.findings,
    ...markerResolution.findings,
    ...asOfView?.findings ?? []
  ]);
  if (parsed.values.json) {
    writeStdout(formatExplainReportJson(buildExplainReport({ path, scan, governedBy, ...asOf && asOfView ? { asOf, asOfView } : {}, findings })));
    return 0;
  }
  if (asOf && asOfView) {
    writeStdout(renderAsOfView(path, asOf, asOfView, getPresentation().stdout));
  } else if (governedBy.length === 0) {
    writeStdout(`${getPresentation().stdout.note("No decision governs")} ${getPresentation().stdout.path(path)}.
`);
  } else {
    if (buckets.governing.length === 0) {
      writeStdout(`${getPresentation().stdout.note("No accepted decision governs")} ${getPresentation().stdout.path(path)}.
`);
    } else {
      writeStdout(renderDecisionGroup(`Decisions governing ${path}:`, buckets.governing, "  ", getPresentation().stdout));
    }
    writeStdout(renderDecisionGroup("Active proposals (not yet binding):", buckets.activeProposals, "  ", getPresentation().stdout));
    writeStdout(renderDecisionGroup("Historical records (not binding):", buckets.history, "  ", getPresentation().stdout));
  }
  writeStdout(renderMarkerScanNote(scan, getPresentation().stdout));
  if (findings.length > 0) {
    writeStdout(`${getPresentation().stdout.heading("Findings:")}
`);
    for (const finding of findings) {
      writeStdout(renderFinding(finding, getPresentation().stdout));
    }
  }
  return 0;
}
function renderDecisionGroup(heading, decisions, indent = "  ", style = getPresentation().stdout) {
  if (decisions.length === 0)
    return "";
  let output = `${style.heading(heading)}
`;
  for (const decision of decisions) {
    const successor = decision.supersededBy ? ` (superseded by ${decision.supersededBy})` : "";
    output += `${indent}${style.label(decision.recordId)}  [${style.status(decision.status)}] ${decision.title}${successor}
`;
    for (const matcher of decision.firedMatchers) {
      output += `${indent}  ${style.note("via")} ${matcher.type}: ${style.path(matcher.pattern)}
`;
    }
    for (const declaration of decision.declaredBy ?? []) {
      output += `${indent}  ${style.note("declared by")} ${style.path(declaration.path)}:${declaration.line} (@adr ${style.label(declaration.ref)})
`;
    }
  }
  return output;
}
function renderAsOfView(path, resolved, view, style = getPresentation().stdout) {
  const provenance = resolved.resolvedFrom === "ref" && resolved.commit ? ` ${style.note(`(${resolved.requested} → ${resolved.commit.slice(0, 12)}, committed ${resolved.committedAt ?? "?"})`)}` : "";
  let output = `${style.heading(`As of ${view.date}`)}${provenance}
`;
  output += `${style.note("Note: matchers and @adr markers are read from today’s corpus and working tree; only standing is re-dated.")}
`;
  const reached = view.governing.length + view.activeProposals.length + view.history.length + view.notYetRecorded.length + view.undetermined.length;
  if (reached === 0) {
    return `${output}${style.note("No decision governed")} ${style.path(path)} ${style.note(`as of ${view.date}`)}.
`;
  }
  if (view.governing.length === 0) {
    output += `${style.note("No decision governed")} ${style.path(path)} ${style.note(`as of ${view.date}`)}.
`;
  } else {
    output += renderAsOfGroup(`Decisions governing ${path} as of ${view.date}:`, view.governing, style);
  }
  output += renderAsOfGroup(`Active proposals as of ${view.date} (not binding):`, view.activeProposals, style);
  output += renderAsOfGroup(`Historical records as of ${view.date} (not binding):`, view.history, style);
  output += renderAsOfGroup(`Not yet recorded as of ${view.date}:`, view.notYetRecorded, style);
  output += renderAsOfGroup(`Standing on ${view.date} not determinable:`, view.undetermined, style);
  return output;
}
function renderAsOfGroup(heading, decisions, style) {
  if (decisions.length === 0)
    return "";
  let output = `${style.heading(heading)}
`;
  for (const decision of decisions) {
    const successor = decision.supersededBy ? ` (superseded by ${decision.supersededBy})` : "";
    output += `  ${style.label(decision.recordId)}  [${style.status(decision.status)}] ${decision.title}${successor}
`;
    output += `    ${style.note(renderWindow(decision))}
`;
    for (const matcher of decision.firedMatchers) {
      output += `    ${style.note("via")} ${matcher.type}: ${style.path(matcher.pattern)}
`;
    }
    for (const declaration of decision.declaredBy ?? []) {
      output += `    ${style.note("declared by")} ${style.path(declaration.path)}:${declaration.line} (@adr ${style.label(declaration.ref)})
`;
    }
  }
  return output;
}
function renderWindow(decision) {
  if (decision.standing === "notYetRecorded")
    return `recorded ${decision.window.opensOn}`;
  if (decision.standing === "undetermined") {
    return `recorded ${decision.window.opensOn}; no date it stopped governing is recorded`;
  }
  if (decision.status === "rejected")
    return `recorded ${decision.window.opensOn}; rejected, so never in force`;
  if (decision.standing === "activeProposals")
    return `recorded ${decision.window.opensOn}; never ratified`;
  if (decision.window.closesOn === null)
    return `in force ${decision.window.opensOn} → open`;
  const closedBy = decision.window.closedBy ? ` (closed by ${decision.window.closedBy})` : "";
  if (isInvertedWindow(decision.window)) {
    return `no in-force interval: recorded ${decision.window.opensOn}, but its successor${closedBy ? ` ${decision.window.closedBy}` : ""} is dated ${decision.window.closesOn}`;
  }
  return `in force ${decision.window.opensOn} → ${decision.window.closesOn}${closedBy}`;
}
function renderMarkerScanNote(scan, style = getPresentation().stdout) {
  if (scan.state === "absent") {
    return `${style.note("Note:")} ${style.path(scan.path)} is not a file in this working tree; no @adr markers were scanned.
`;
  }
  if (scan.state === "unreadable") {
    return `${style.note("Note:")} ${style.path(scan.path)} could not be read; no @adr markers were scanned.
`;
  }
  if (scan.state === "out-of-tree") {
    return `${style.note("Note:")} ${style.path(scan.path)} is not a repo-relative path inside this working tree; no @adr markers were scanned.
`;
  }
  let output = "";
  if ((scan.omittedMarkers ?? 0) > 0) {
    output += `${style.note("Note:")} retained the first ${MARKER_DECLARATION_FILE_CAP} @adr declarations in ${style.path(scan.path)} and omitted ${scan.omittedMarkers} more.
`;
  }
  if (scan.truncated && scan.scannedBytes !== undefined && scan.fileBytes !== undefined) {
    output += `${style.note("Note:")} only the first ${scan.scannedBytes} of ${scan.fileBytes} bytes of ${style.path(scan.path)} were scanned for @adr markers.
`;
  }
  return output;
}
function markerScanExtents(batch) {
  const extents = new Map;
  for (const scan of batch.scans) {
    if (!scan.truncated)
      continue;
    if (scan.scannedBytes === undefined || scan.fileBytes === undefined)
      continue;
    extents.set(scan.path, `${scan.scannedBytes}/${scan.fileBytes}`);
  }
  return extents;
}
function renderHumanCheck(outcome, extents = new Map, style = getPresentation().stdout) {
  let output = "";
  if (outcome.governedBy.length === 0) {
    output += `${style.note("No decisions govern the changed files.")}
`;
  } else {
    if (outcome.governing.length === 0) {
      output += `${style.note("No accepted decisions govern the changed files.")}
`;
    } else {
      output += renderDecisionGroup("Decisions governing this change:", outcome.governing, "  ", style);
    }
    output += renderDecisionGroup("Active proposals touching this change (not yet binding):", outcome.activeProposals, "  ", style);
    output += renderDecisionGroup("Historical records that once covered this change (not binding):", outcome.history, "  ", style);
  }
  if (outcome.markerScan && outcome.markerScan.totalCandidates > 0) {
    const counts = outcome.markerScan.counts;
    output += `${style.label("marker scan:")} ${counts.scanned} scanned, ${counts.absent} absent, ` + `${counts.unreadable} unreadable, ${counts["out-of-tree"]} out-of-tree, ` + `${counts.truncated} truncated, ${counts.skipped} skipped
`;
    const declarations = outcome.markerScan.declarations;
    output += `${style.label("marker declarations:")} ${declarations.retained}/${declarations.total} retained, ` + `${declarations.omitted} omitted (${declarations.perFileOmitted} per-file, ${declarations.batchOmitted} per-batch)
`;
    const unavailable = [
      ...outcome.markerScan.absentPaths,
      ...outcome.markerScan.unreadablePaths,
      ...outcome.markerScan.outOfTreePaths,
      ...outcome.markerScan.skippedPaths
    ];
    if (unavailable.length > 0) {
      const shown = unavailable.slice(0, 10);
      const remaining = unavailable.length - shown.length;
      output += `${style.label("marker scan unavailable for:")} ${shown.map((path) => style.path(path)).join(", ")}`;
      if (remaining > 0)
        output += `, and ${remaining} more (see --json for the complete lists)`;
      output += `
`;
    }
    if (outcome.markerScan.truncatedPaths.length > 0) {
      const shown = outcome.markerScan.truncatedPaths.slice(0, 10);
      const remaining = outcome.markerScan.truncatedPaths.length - shown.length;
      const labelled = shown.map((path) => {
        const extent = extents.get(path);
        return extent === undefined ? style.path(path) : `${style.path(path)} ${extent}`;
      });
      output += `${style.label("marker scan truncated (bytes scanned of total):")} ${labelled.join(", ")}`;
      if (remaining > 0)
        output += `, and ${remaining} more (see --json for the complete list)`;
      output += `
`;
    }
  }
  if (outcome.findings.length > 0) {
    output += `${style.heading("Findings:")}
`;
    output += renderHumanLint(outcome.findings, style);
  }
  const changedRecordErrors = outcome.findings.filter((finding) => finding.severity === "error" && finding.path && outcome.changedRecords.includes(finding.path)).length;
  output += `${style.label("checked:")} ${outcome.governing.length} governing, ${outcome.activeProposals.length} active proposals, ${outcome.history.length} historical, ${outcome.changedRecords.length} changed records, ${changedRecordErrors} changed-record errors
`;
  return output;
}
async function runCheck(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      json: { type: "boolean", default: false },
      dir: { type: "string", default: "docs/adr" }
    }, CHECK_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "check");
  }
  const dir = String(parsed.values.dir);
  let lint;
  try {
    lint = await lintCorpus({ dir });
  } catch (error) {
    const exitCode = handleCorpusDirectoryError2(error, dir, "check");
    if (exitCode !== undefined)
      return exitCode;
    throw error;
  }
  const markerScans = await readSourceMarkersBatch(parsed.positionals);
  const outcome = checkChanges({ lint, changedFiles: parsed.positionals, dir, markerScans });
  if (parsed.values.json) {
    writeStdout(`${JSON.stringify(outcome, null, 2)}
`);
  } else {
    writeStdout(renderHumanCheck(outcome, markerScanExtents(markerScans)));
  }
  return outcome.ok ? 0 : 1;
}
async function runEvaluate(args) {
  let parsed;
  try {
    parsed = parseCommandArgs(args, {
      snapshot: { type: "string" },
      date: { type: "string" },
      json: { type: "boolean", default: false },
      dir: { type: "string" }
    }, EVALUATE_OPTIONS);
  } catch (error) {
    return usageError4(error instanceof Error ? error.message : String(error), "evaluate");
  }
  if (parsed.positionals.length !== 1) {
    return usageError4("adr evaluate requires exactly one proposal path.", "evaluate");
  }
  const proposalPath = parsed.positionals[0];
  if (!proposalPath)
    return usageError4("adr evaluate requires a proposal path.", "evaluate");
  const snapshot = parsed.values.snapshot;
  if (typeof snapshot !== "string" || snapshot.length === 0) {
    return usageError4("adr evaluate requires --snapshot <bundle.json>.", "evaluate");
  }
  const date = parsed.values.date;
  if (typeof date !== "string" || date.length === 0) {
    return usageError4("adr evaluate requires --date YYYY-MM-DD.", "evaluate");
  }
  const result = await evaluate({
    proposalPath,
    snapshotPath: snapshot,
    date,
    json: parsed.values.json === true,
    ...typeof parsed.values.dir === "string" ? { dir: parsed.values.dir } : {}
  });
  if (result.corpusDirectoryError) {
    return usageError4(corpusDirectoryErrorMessage(result.corpusDirectoryError.dir, result.corpusDirectoryError.kind), "evaluate");
  }
  if (result.stderr)
    writeStderr(result.stderr);
  if (result.stdout)
    writeStdout(result.stdout);
  return result.exitCode;
}
async function main(argv = process.argv.slice(2)) {
  const color = extractColorMode(argv);
  if ("error" in color) {
    writeStderr(formatUsageError(color.error, topLevelUsage(getPresentation().stderr), undefined, getPresentation().stderr));
    return 2;
  }
  setPresentation({ colorMode: color.colorMode });
  const [command, ...args] = color.args;
  try {
    if (command === undefined) {
      writeStdout(topLevelUsage(getPresentation().stdout));
      return 0;
    }
    if (command === "help")
      return runHelp(args);
    if (isHelpFlag(command))
      return runHelp(args);
    if (command === "--version" || command === "-V") {
      writeStdout(`${CLI_VERSION}
`);
      return 0;
    }
    if (command.startsWith("-"))
      return usageError4(unknownOptionMessage3(command, TOP_LEVEL_OPTIONS));
    const commandUsage = command === "queue" || command === "completion" ? undefined : commandUsageFor(command);
    if (commandUsage && hasHelpFlagBeforeTerminator(args)) {
      writeStdout(styleUsageBlock(commandUsage, getPresentation().stdout));
      return 0;
    }
    if (command === "lint")
      return await runLint(args);
    if (command === "migrate")
      return await runMigrate(args);
    if (command === "new")
      return await runNew(args);
    if (command === "graph")
      return await runGraph(args);
    if (command === "explain")
      return await runExplain(args);
    if (command === "check")
      return await runCheck(args);
    if (command === "evaluate")
      return await runEvaluate(args);
    if (command === "queue")
      return await runQueue(args);
    if (command === "approve")
      return await runApprove(args);
    if (command === "object")
      return await runObject(args);
    if (command === "resolve")
      return await runResolve(args);
    if (command === "accept")
      return await runAccept(args);
    if (command === "completion")
      return await runCompletion(args);
    return usageError4(unknownCommandMessage(command));
  } catch (error) {
    writeStderr(`${error instanceof Error ? error.message : String(error)}
`);
    return 1;
  }
}
if (isMainModule(import.meta.url, process.argv[1])) {
  process.exitCode = await main();
}
export {
  CLI_VERSION,
  main
};
