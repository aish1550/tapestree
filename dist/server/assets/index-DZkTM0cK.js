import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button, Card, CardContent, Avatar, IconButton } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ForestIcon from "@mui/icons-material/Forest";
import { Handle, Position, ReactFlowProvider, useReactFlow, ReactFlow, Background, BackgroundVariant, Controls, MiniMap } from "@xyflow/react";
import { R as Route } from "./router-D5AHbhk3.js";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import "@tanstack/react-router";
import "@mui/material/styles";
import "@mui/material/CssBaseline";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
function Sidebar({ onAddClick }) {
  const menuItems = [
    { text: "Dashboard", icon: /* @__PURE__ */ jsx(DashboardIcon, {}) },
    { text: "Family Tree", icon: /* @__PURE__ */ jsx(AccountTreeIcon, {}), active: true },
    { text: "People", icon: /* @__PURE__ */ jsx(PeopleIcon, {}) },
    { text: "Documents", icon: /* @__PURE__ */ jsx(DescriptionIcon, {}) },
    { text: "Photos", icon: /* @__PURE__ */ jsx(PhotoLibraryIcon, {}) },
    { text: "Research", icon: /* @__PURE__ */ jsx(SearchIcon, {}) },
    { text: "Settings", icon: /* @__PURE__ */ jsx(SettingsIcon, {}) }
  ];
  return /* @__PURE__ */ jsxs(
    Box,
    {
      sx: {
        width: 260,
        height: "100vh",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        p: 2,
        flexShrink: 0
      },
      children: [
        /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, px: 2, py: 3 }, children: [
          /* @__PURE__ */ jsx(ForestIcon, { color: "primary", sx: { fontSize: 32 } }),
          /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "h5",
              color: "primary",
              sx: {
                fontWeight: 800,
                letterSpacing: "-0.5px"
              },
              children: "Tapestree"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(List, { sx: { flexGrow: 1, px: 1 }, children: menuItems.map((item) => /* @__PURE__ */ jsx(ListItem, { disablePadding: true, sx: { mb: 0.5 }, children: /* @__PURE__ */ jsxs(
          ListItemButton,
          {
            selected: item.active,
            sx: {
              borderRadius: 2,
              py: 1.2,
              px: 2,
              "&.Mui-selected": {
                bgcolor: "rgba(30, 63, 32, 0.08)",
                color: "primary.main",
                "& .MuiListItemIcon-root": {
                  color: "primary.main"
                }
              },
              "&:hover": {
                bgcolor: "rgba(30, 63, 32, 0.04)"
              }
            },
            children: [
              /* @__PURE__ */ jsx(ListItemIcon, { sx: { minWidth: 40, color: "text.secondary" }, children: item.icon }),
              /* @__PURE__ */ jsx(
                ListItemText,
                {
                  primary: /* @__PURE__ */ jsx(
                    Typography,
                    {
                      sx: {
                        fontWeight: item.active ? 600 : 500,
                        fontSize: "0.95rem"
                      },
                      children: item.text
                    }
                  )
                }
              )
            ]
          }
        ) }, item.text)) }),
        /* @__PURE__ */ jsx(Divider, { sx: { my: 2 } }),
        /* @__PURE__ */ jsx(Box, { sx: { p: 1 }, children: /* @__PURE__ */ jsx(
          Button,
          {
            fullWidth: true,
            variant: "contained",
            color: "primary",
            startIcon: /* @__PURE__ */ jsx(AddIcon, {}),
            onClick: onAddClick,
            sx: {
              py: 1.5,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#142c16",
                boxShadow: "none"
              }
            },
            children: "Add Family Member"
          }
        ) })
      ]
    }
  );
}
function FamilyNode({ data, selected }) {
  var _a, _b;
  const person = data.person;
  const fullName = `${person.firstName} ${person.lastName || ""}`;
  return /* @__PURE__ */ jsxs(Box, { sx: { position: "relative" }, children: [
    /* @__PURE__ */ jsx(
      Handle,
      {
        type: "target",
        position: Position.Top,
        style: { background: "#1E3F20", width: 8, height: 8, border: "1px solid #FAF6EE" }
      }
    ),
    /* @__PURE__ */ jsx(
      Handle,
      {
        type: "target",
        position: Position.Left,
        id: "spouse-left",
        style: { background: "#1E3F20", width: 6, height: 6, top: "50%", border: "1px solid #FAF6EE" }
      }
    ),
    /* @__PURE__ */ jsx(
      Card,
      {
        sx: {
          width: 220,
          height: 76,
          border: selected ? "2px solid" : "1px solid",
          borderColor: selected ? "primary.main" : "transparent",
          transition: "box-shadow 0.2s, border-color 0.2s",
          display: "flex",
          alignItems: "center",
          bgcolor: "background.paper",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            borderColor: selected ? "primary.main" : "rgba(30, 63, 32, 0.3)"
          }
        },
        children: /* @__PURE__ */ jsxs(
          CardContent,
          {
            sx: {
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: "100%",
              "&:last-child": { pb: 1.5 }
            },
            children: [
              /* @__PURE__ */ jsx(
                Avatar,
                {
                  src: person.photoUrl || void 0,
                  alt: fullName,
                  sx: { width: 44, height: 44 },
                  children: person.firstName[0]
                }
              ),
              /* @__PURE__ */ jsxs(Box, { sx: { overflow: "hidden", flexGrow: 1 }, children: [
                /* @__PURE__ */ jsx(
                  Typography,
                  {
                    variant: "body2",
                    noWrap: true,
                    sx: { fontWeight: "bold" },
                    children: fullName
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Typography,
                  {
                    variant: "caption",
                    color: "text.secondary",
                    sx: { display: "block" },
                    children: [
                      ((_a = person.birthDate.split(",")[1]) == null ? void 0 : _a.trim()) || person.birthDate,
                      " – ",
                      person.deathDate ? (_b = person.deathDate.split(",")[1]) == null ? void 0 : _b.trim() : "Present"
                    ]
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(
      Handle,
      {
        type: "source",
        position: Position.Right,
        id: "spouse-right",
        style: { background: "#1E3F20", width: 6, height: 6, top: "50%", border: "1px solid #FAF6EE" }
      }
    ),
    /* @__PURE__ */ jsx(
      Handle,
      {
        type: "source",
        position: Position.Bottom,
        id: "child-bottom",
        style: { background: "#1E3F20", width: 8, height: 8, border: "1px solid #FAF6EE" }
      }
    )
  ] });
}
const nodeTypes = {
  familyNode: FamilyNode
};
function TreeCanvasInner({ people, relationships, onSelectPerson, selectedPersonId }) {
  const { setViewport } = useReactFlow();
  const viewportRef = useRef(null);
  const cardWidth = 220;
  const cardHeight = 76;
  const nodes = people.map((p) => ({
    id: p.id,
    type: "familyNode",
    position: { x: p.x, y: p.y },
    data: { person: p },
    selected: selectedPersonId === p.id
  }));
  const edges = relationships.map((rel) => {
    const p1 = people.find((x) => x.id === rel.personId1);
    const p2 = people.find((x) => x.id === rel.personId2);
    let source = rel.personId1;
    let target = rel.personId2;
    let sourceHandle = "child-bottom";
    let targetHandle = void 0;
    let edgeType = "step";
    const edgeStyle = {
      stroke: "#1E3F20",
      strokeWidth: 1.5
    };
    if (rel.type === "spouse" && p1 && p2) {
      edgeType = "straight";
      edgeStyle.strokeDasharray = "4, 4";
      edgeStyle.strokeWidth = 2;
      if (p1.x < p2.x) {
        source = p1.id;
        target = p2.id;
        sourceHandle = "spouse-right";
        targetHandle = "spouse-left";
      } else {
        source = p2.id;
        target = p1.id;
        sourceHandle = "spouse-right";
        targetHandle = "spouse-left";
      }
    }
    return {
      id: `edge-${rel.id}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: edgeType,
      style: edgeStyle
    };
  });
  useEffect(() => {
    if (!selectedPersonId || !viewportRef.current) return;
    const person = people.find((p) => p.id === selectedPersonId);
    if (!person) return;
    const W = viewportRef.current.clientWidth;
    const H = viewportRef.current.clientHeight;
    const scale = 1.2;
    const targetX = W / 2 - (person.x + cardWidth / 2) * scale;
    const targetY = H / 2 - (person.y + cardHeight / 2) * scale;
    setViewport({ x: targetX, y: targetY, zoom: scale }, { duration: 450 });
  }, [selectedPersonId, people, setViewport]);
  useEffect(() => {
    if (people.length > 0 && !selectedPersonId && viewportRef.current) {
      const founder = people.reduce((oldest, current) => {
        const oldestDate = new Date(oldest.birthDate).getTime();
        const currentDate = new Date(current.birthDate).getTime();
        return currentDate < oldestDate ? current : oldest;
      }, people[0]);
      if (founder) {
        const W = viewportRef.current.clientWidth;
        const H = viewportRef.current.clientHeight;
        const scale = 1;
        const targetX = W / 2 - (founder.x + cardWidth / 2) * scale;
        const targetY = H / 2 - (founder.y + cardHeight / 2) * scale;
        setViewport({ x: targetX, y: targetY, zoom: scale });
      }
    }
  }, [people, setViewport]);
  const handleNodeClick = (_event, node) => {
    const person = people.find((p) => p.id === node.id);
    if (person) {
      onSelectPerson(person);
    }
  };
  return /* @__PURE__ */ jsx(
    Box,
    {
      ref: viewportRef,
      sx: {
        flexGrow: 1,
        height: "calc(100vh - 64px)",
        width: "100%",
        position: "relative",
        bgcolor: "background.default"
      },
      children: /* @__PURE__ */ jsxs(
        ReactFlow,
        {
          nodes,
          edges,
          nodeTypes,
          onNodeClick: handleNodeClick,
          minZoom: 0.3,
          maxZoom: 1.2,
          fitViewOptions: { padding: 0.2 },
          zoomOnScroll: true,
          zoomOnPinch: true,
          panOnScroll: false,
          panOnDrag: true,
          preventScrolling: true,
          nodesDraggable: false,
          nodesConnectable: false,
          elementsSelectable: true,
          children: [
            /* @__PURE__ */ jsx(Background, { variant: BackgroundVariant.Dots, gap: 40, size: 1, color: "#1E3F20", style: { opacity: 0.15 } }),
            /* @__PURE__ */ jsx(Controls, { showInteractive: false, position: "bottom-left", style: { margin: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" } }),
            /* @__PURE__ */ jsx(MiniMap, { zoomable: true, pannable: true, style: { borderRadius: "8px", border: "1px solid #e0e0e0", margin: "16px" } })
          ]
        }
      )
    }
  );
}
function TreeCanvas(props) {
  return /* @__PURE__ */ jsx(ReactFlowProvider, { children: /* @__PURE__ */ jsx(TreeCanvasInner, { ...props }) });
}
function Inspector({ person, onClose }) {
  if (!person) {
    return /* @__PURE__ */ jsx(
      Box,
      {
        sx: {
          width: 320,
          height: "100vh",
          bgcolor: "background.paper",
          borderLeft: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          flexShrink: 0
        },
        children: /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", align: "center", children: "Select a family member on the canvas to view their profile, stories, and records." })
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    Box,
    {
      sx: {
        width: 320,
        height: "100vh",
        bgcolor: "background.paper",
        borderLeft: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "auto"
      },
      children: [
        /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { fontWeight: "bold" }, children: "Edit Profile" }),
          onClose && /* @__PURE__ */ jsx(IconButton, { size: "small", onClick: onClose, children: /* @__PURE__ */ jsx(CloseIcon, {}) })
        ] }),
        (() => {
          var _a;
          const fullName = `${person.firstName} ${person.lastName || ""}`;
          return /* @__PURE__ */ jsxs(Box, { sx: { display: "flex", flexDirection: "column", alignItems: "center", px: 3, pb: 3, pt: 1 }, children: [
            /* @__PURE__ */ jsx(
              Avatar,
              {
                src: person.photoUrl || void 0,
                alt: fullName,
                sx: { width: 100, height: 100, mb: 2, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }
              }
            ),
            /* @__PURE__ */ jsx(Typography, { variant: "h5", sx: { fontWeight: 700, mb: 0.5, textAlign: "center" }, children: fullName }),
            /* @__PURE__ */ jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              "b. ",
              ((_a = person.birthDate.split(",")[1]) == null ? void 0 : _a.trim()) || "1985",
              " – Present"
            ] }),
            /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              "Born in ",
              person.birthPlace
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(Box, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { fontWeight: "bold", mb: 1.5 }, children: "Relationships" }),
          /* @__PURE__ */ jsxs(Box, { sx: { mb: 1 }, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", children: "Spouse:" }),
            /* @__PURE__ */ jsx(Typography, { variant: "body2", sx: { fontWeight: "medium" }, children: person.spouse || "None" })
          ] }),
          /* @__PURE__ */ jsxs(Box, { children: [
            /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", children: "Children:" }),
            /* @__PURE__ */ jsx(Typography, { variant: "body2", sx: { fontWeight: "medium" }, children: person.id === "1" || person.id === "2" ? "Liam, Sophie" : "Alexander" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(Box, { sx: { p: 3 }, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { fontWeight: "bold", mb: 1.5 }, children: "Life Events" }),
          /* @__PURE__ */ jsxs(List, { disablePadding: true, children: [
            /* @__PURE__ */ jsx(ListItem, { disableGutters: true, sx: { alignItems: "flex-start", mb: 1.5 }, children: /* @__PURE__ */ jsx(
              ListItemText,
              {
                primary: /* @__PURE__ */ jsx(Typography, { variant: "body2", sx: { fontWeight: "bold" }, children: "Birth" }),
                secondary: /* @__PURE__ */ jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                  person.birthDate,
                  " • ",
                  person.birthPlace
                ] })
              }
            ) }),
            person.id === "1" && /* @__PURE__ */ jsx(ListItem, { disableGutters: true, sx: { alignItems: "flex-start" }, children: /* @__PURE__ */ jsx(
              ListItemText,
              {
                primary: /* @__PURE__ */ jsx(Typography, { variant: "body2", sx: { fontWeight: "bold" }, children: "Marriage" }),
                secondary: /* @__PURE__ */ jsx(Typography, { variant: "caption", color: "text.secondary", children: "July 9, 2003 • San Francisco, CA" })
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(Box, { sx: { p: 3, flexGrow: 1 }, children: [
          /* @__PURE__ */ jsx(Typography, { variant: "subtitle2", color: "text.secondary", sx: { fontWeight: "bold", mb: 1 }, children: "Biography Notes" }),
          /* @__PURE__ */ jsx(Typography, { variant: "body2", color: "text.secondary", children: person.bio || "No biography written yet. Click Edit Profile to add their life story." })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(Box, { sx: { p: 2, display: "flex", flexDirection: "column", gap: 1 }, children: [
          /* @__PURE__ */ jsx(Button, { variant: "contained", color: "primary", startIcon: /* @__PURE__ */ jsx(EditIcon, {}), fullWidth: true, children: "Save Changes" }),
          /* @__PURE__ */ jsx(Button, { variant: "outlined", color: "primary", startIcon: /* @__PURE__ */ jsx(PhotoCameraIcon, {}), fullWidth: true, children: "Add Media" }),
          /* @__PURE__ */ jsx(Button, { variant: "text", color: "primary", startIcon: /* @__PURE__ */ jsx(MenuBookIcon, {}), fullWidth: true, children: "View Records" })
        ] })
      ]
    }
  );
}
function HomeComponent() {
  const data = Route.useLoaderData();
  const [selectedPerson, setSelectedPerson] = useState(data.focusPerson ? data.focusPerson : void 0);
  return /* @__PURE__ */ jsxs(Box, { sx: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    overflow: "hidden"
  }, children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs(Box, { sx: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      height: "100%"
    }, children: [
      /* @__PURE__ */ jsx(Box, { sx: {
        height: 64,
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        px: 3,
        bgcolor: "background.paper"
      }, children: /* @__PURE__ */ jsxs(Typography, { variant: "h6", sx: {
        fontWeight: "bold"
      }, children: [
        "Family Tree: ",
        data.treeName
      ] }) }),
      /* @__PURE__ */ jsx(TreeCanvas, { people: data.people, relationships: data.relationships, selectedPersonId: selectedPerson == null ? void 0 : selectedPerson.id, onSelectPerson: (person) => setSelectedPerson(person) })
    ] }),
    /* @__PURE__ */ jsx(Inspector, { person: selectedPerson, onClose: () => setSelectedPerson(void 0) })
  ] });
}
export {
  HomeComponent as component
};
