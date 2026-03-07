import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("getToolLabel", () => {
  test("str_replace_editor create", () => {
    expect(getToolLabel("str_replace_editor", { command: "create", path: "/components/Card.jsx" })).toBe("Creating /components/Card.jsx");
  });

  test("str_replace_editor str_replace", () => {
    expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/App.jsx" })).toBe("Editing /App.jsx");
  });

  test("str_replace_editor insert", () => {
    expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })).toBe("Editing /App.jsx");
  });

  test("str_replace_editor view", () => {
    expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading /App.jsx");
  });

  test("str_replace_editor undo_edit", () => {
    expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Undoing edit in /App.jsx");
  });

  test("file_manager rename", () => {
    expect(getToolLabel("file_manager", { command: "rename", path: "/old.jsx" })).toBe("Renaming /old.jsx");
  });

  test("file_manager delete", () => {
    expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting /App.jsx");
  });

  test("unknown tool falls back to tool name", () => {
    expect(getToolLabel("unknown_tool", { command: "do_something" })).toBe("unknown_tool");
  });
});

describe("ToolInvocationBadge", () => {
  test("in-progress state shows spinner and label", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/components/Card.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating /components/Card.jsx")).toBeDefined();
    expect(container.querySelector(".animate-spin")).toBeDefined();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("result state shows green dot and label", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/components/Card.jsx" }}
        state="result"
        result="File created"
      />
    );
    expect(screen.getByText("Creating /components/Card.jsx")).toBeDefined();
    expect(container.querySelector(".bg-emerald-500")).toBeDefined();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
