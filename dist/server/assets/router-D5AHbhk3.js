import { createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#FAF6EE",
      // Soft Cream background
      paper: "#FFFFFF"
      // Solid White panels/cards
    },
    primary: {
      main: "#1E3F20",
      // Forest Green active accent
      contrastText: "#FFFFFF"
    },
    text: {
      primary: "#1E2522",
      // Dark slate charcoal
      secondary: "#6E7672"
    }
  },
  typography: {
    fontFamily: "var(--font-inter), sans-serif",
    h1: {
      fontFamily: "var(--font-montserrat), sans-serif",
      fontWeight: 700
    },
    h2: {
      fontFamily: "var(--font-montserrat), sans-serif",
      fontWeight: 700
    },
    h3: {
      fontFamily: "var(--font-montserrat), sans-serif",
      fontWeight: 700
    },
    h4: {
      fontFamily: "var(--font-montserrat), sans-serif",
      fontWeight: 700
    },
    h5: {
      fontFamily: "var(--font-montserrat), sans-serif",
      fontWeight: 700
    },
    h6: {
      fontFamily: "var(--font-montserrat), sans-serif",
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)"
        }
      }
    }
  }
});
const Route$1 = createRootRoute({
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsxs(ThemeProvider, { theme, children: [
    /* @__PURE__ */ jsx(CssBaseline, {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("title", { children: "Tapestree – Discover Your Family History" }),
      /* @__PURE__ */ jsx(HeadContent, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const $$splitComponentImporter = () => import("./index-DZkTM0cK.js");
const getTreeData = createServerFn({
  method: "GET"
}).handler(createSsrRpc("5cb8c752510335e707b5688104581db46303f437afaebc436b245c16a1cdbe97"));
const Route = createFileRoute("/")({
  loader: async () => {
    return getTreeData();
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true
  });
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
