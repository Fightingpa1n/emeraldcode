# EmeraldCode

an extension I made for myself, which adds various util features. all of which I used to do manually. none of these will actually help with coding, it's mostly just for my perfectionist tendencies and the time I would waste doing unnecessary things.

---

## Features

- **Copy code with formatting**: 
  - Copy editor selections or entire files wrapped in Markdown code fences.
  - Copies include filenames or relative paths for easy pasting in documentation or chats.
- **Custom splitters**:
  - Insert configurable comment-based splitter lines to visually separate code sections.
  - Includes 4 preset splitter styles with full customization support.
- **Explorer integration**:
  - Right-click files in the explorer to copy their contents with formatting.
- **Context-aware menus**:
  - Commands only appear when relevant (e.g., with a selection, inside a workspace).

---

## Requirements

No external dependencies. VSCode 1.100.0 or higher is required.

---

## Extension Settings

This extension contributes the following settings:

- `emeraldcode.defaultStart`: Default start symbol for custom comment formats.
- `emeraldcode.defaultEnd`: Default end symbol for custom comment formats.
- `emeraldcode.addCommentDefinition`: Auto-add comment styles for unknown languages.
- `emeraldcode.splitter1` to `splitter4`: Keys used to reference specific splitter types.
- `emeraldcode.splitters`: Full array of custom splitter definitions with `key` and `format`.
- `emeraldcode.commentDef`: Per-language comment start/end symbols.
- `emeraldcode.disallowedFileExtensions`: File extensions to ignore when copying file contents.

---

## Known Issues

- Descriptions are currently only visible in the Command Palette (not in right-click context menus).
- Does not support multi-selection of text blocks (only single-range selections).

---

## Release Notes

### 1.0.0
- First stable release.
- Added support for selection and file copying with Markdown formatting.
- Customizable splitter system added.
- Context menu and command palette integration.

---

Made by Fightingpainter (and chatGpt)
(chatGpt helped with descriptions and stuff since I'm not able to write good sentences in the moment, but the code is mostly made by me)