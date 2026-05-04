# Design: Emoji Selection Logic for Publish Page

## Goal
Implement emoji insertion into the post content textarea at the current cursor position using `emoji-picker-react`.

## Architecture
- **UI Component**: `EmojiPicker` from `emoji-picker-react`.
- **State Management**: React `useState` for `content` and `showEmojiPicker`.
- **DOM Interaction**: React `useRef` for `textarea` to manage focus and cursor selection.

## Components
- `Publish.tsx`: Main page component.
- `EmojiPicker`: Library component for emoji selection.

## Data Flow
1. User toggles `showEmojiPicker` via the smile icon.
2. User selects an emoji.
3. `onEmojiClick` captures the emoji and the current cursor position in the textarea.
4. `content` is updated by inserting the emoji at the cursor position.
5. Focus is returned to the textarea, and the cursor is placed after the inserted emoji.
6. The picker can be closed by clicking outside or toggling the smile icon.

## Implementation Details
- **Insertion Logic**:
  ```typescript
  const { selectionStart, selectionEnd } = textareaRef.current;
  const newContent = content.substring(0, selectionStart) + emojiData.emoji + content.substring(selectionEnd);
  setContent(newContent);
  ```
- **Focus and Cursor**:
  After updating content, focus back to textarea and set cursor to `selectionStart + emojiData.emoji.length`.
- **Click Outside**:
  A document-level event listener to close the picker when clicking outside the picker or its toggle button.
- **Styling**:
  Absolutely positioned wrapper for the picker to ensure it overlays content without shifting layout.

## Testing Strategy
- Verify emoji insertion at start, middle, and end of text.
- Verify focus restoration after selection.
- Verify click-outside-to-close behavior.
- Verify toggle button behavior.
