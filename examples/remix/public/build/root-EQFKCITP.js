import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "/build/_shared/chunk-GMNGJQJJ.js";
import {
  Button,
  css
} from "/build/_shared/chunk-CK5JQJOR.js";
import {
  __toESM,
  require_jsx_dev_runtime,
  require_react
} from "/build/_shared/chunk-W743FPVR.js";

// app/root.tsx
var React = __toESM(require_react());

// public/tokenami.css
var tokenami_default = "/build/_assets/tokenami-CDXSO7RE.css";

// app/root.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
var links = () => [{ rel: "stylesheet", href: tokenami_default }];
function App() {
  const [theme, setTheme] = React.useState("light");
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("html", { lang: "en", style: css({ "--height": "var(--size_full)" }), children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("head", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("meta", { charSet: "utf-8" }, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 15,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 16,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Meta, {}, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 17,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Links, {}, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 18,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/root.tsx",
      lineNumber: 14,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
      "body",
      {
        "data-theme": theme,
        style: css({
          "--min-height": "var(--size_full)",
          "---radial-gradient": "radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)",
          "---grid-bg-size": "calc(var(--_grid) * 5)",
          "--background-size": "var(---,var(---grid-bg-size) var(---grid-bg-size))",
          "--background-image": "var(---,var(---radial-gradient))",
          "--background-color": "var(--color_indigo6)",
          "--background-position-x": 1,
          "--background-position-y": 0.5,
          "--display": "flex",
          "--flex-direction": "column",
          "--align-items": "center",
          "--justify-content": "center",
          "--child-p_background-color": "var(--color_indigo5)",
          "--child-p_border-radius": "var(--radii_sm)",
          "--child-p_px": 2
        }),
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { onClick: () => setTheme((theme2) => theme2 === "light" ? "dark" : "light"), children: "Switch theme" }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 40,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 43,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ScrollRestoration, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 44,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Scripts, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 45,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LiveReload, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 46,
            columnNumber: 9
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "app/root.tsx",
        lineNumber: 20,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, true, {
    fileName: "app/root.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}
export {
  App as default,
  links
};
//# sourceMappingURL=/build/root-EQFKCITP.js.map
