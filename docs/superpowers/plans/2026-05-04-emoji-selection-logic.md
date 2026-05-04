# Emoji Selection Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement emoji insertion into the post content textarea at the current cursor position and display the EmojiPicker as an overlay.

**Architecture:**
- Use `emoji-picker-react` for the picker component.
- Manage `content` state in `Publish.tsx`.
- Use `textareaRef` to manipulate cursor position and focus.
- Position the picker `absolute` above the toolbar.

**Tech Stack:** React, TypeScript, Tailwind CSS, `emoji-picker-react`.

---

### Task 1: Setup Imports and Types

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Add imports from `emoji-picker-react`**

Add at the top of `src/pages/Publish.tsx`:
```typescript
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Publish.tsx
git commit -m "feat: import emoji picker components"
```

### Task 2: Implement Emoji Selection Handler

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Add `onEmojiClick` handler**

Inside `Publish` component:
```typescript
  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd } = textareaRef.current;
    const emoji = emojiData.emoji;
    const newContent =
      content.substring(0, selectionStart) +
      emoji +
      content.substring(selectionEnd);

    setContent(newContent);
    setShowEmojiPicker(false);

    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = selectionStart + emoji.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Publish.tsx
git commit -m "feat: implement emoji selection handler"
```

### Task 3: Implement Click Outside to Close

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Add `useEffect` for clicking outside**

Inside `Publish` component:
```typescript
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        // Check if click was on the smile button to avoid double toggle
        const target = event.target as HTMLElement;
        if (!target.closest('.emoji-toggle-btn')) {
          setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
```

- [ ] **Step 2: Add class to smile button**

Update the smile button in JSX:
```tsx
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`rounded-xl p-3 transition-colors emoji-toggle-btn ${
                  showEmojiPicker
                    ? "text-blue-500 bg-blue-50"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                <Smile size={24} />
              </button>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Publish.tsx
git commit -m "feat: add click outside to close emoji picker"
```

### Task 4: Add EmojiPicker to JSX

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Add the EmojiPicker component above the toolbar**

Find the Media Toolbar and add the picker above it:
```tsx
          {/* Emoji Picker Overlay */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute z-50 bottom-[240px] left-4 right-4 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={Theme.LIGHT}
                width="100%"
                height={400}
                lazyLoadEmojis={true}
                searchPlaceHolder="搜索表情..."
                previewConfig={{ showPreview: false }}
                skinTonesDisabled={true}
              />
            </div>
          )}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Publish.tsx
git commit -m "feat: add emoji picker to JSX"
```
