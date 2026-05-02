# Publish Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `Publish` page to align with the "Frosted Playground" aesthetic using glassmorphism, high-blur backgrounds, and vibrant interactions.

**Architecture:** Apply a full-screen blur overlay, use transparent backgrounds for inputs, and implement floating glass components for the header, media grid, and toolbar.

**Tech Stack:** React (TypeScript), Tailwind CSS v4, Lucide React icons.

---

### Task 1: Basic Layout & Background

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Update container classes for full-screen glass effect**
Update the main container to be transparent and add a fixed background blur layer.

```tsx
// src/pages/Publish.tsx

// Change return structure:
return (
  <div className="relative min-h-screen w-full overflow-x-hidden bg-transparent">
    {/* Full-screen Blur Overlay */}
    <div className="fixed inset-0 backdrop-blur-3xl bg-white/10 -z-10" />
    
    <div className="flex flex-col h-screen p-4 pb-24">
      {/* Rest of components will go here */}
    </div>
  </div>
);
```

- [ ] **Step 2: Commit layout changes**
```bash
git add src/pages/Publish.tsx
git commit -m "style: add full-screen blur layout to Publish page"
```

### Task 2: Redesign Header & Submit Button

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Update Header and Submit Button**
Use `font-display`, `elastic-press`, and vibrant gradients.

```tsx
// src/pages/Publish.tsx

{/* 1. Header */}
<div className="flex justify-between items-center mb-8 pt-2">
  <button 
    onClick={() => navigate(-1)} 
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white elastic-press"
  >
    <X size={24} />
  </button>
  <span className="font-display font-bold text-xl text-white">发布</span>
  <button
    onClick={handlePublish}
    disabled={(!content.trim() && images.length === 0) || loading}
    className={`px-6 py-2 rounded-full text-sm font-bold transition-all elastic-press shadow-lg ${
      (content.trim() || images.length > 0) && !loading
        ? "bg-gradient-to-r from-primary to-accent text-white shadow-primary/20"
        : "bg-white/10 text-white/30 pointer-events-none"
    }`}
  >
    {loading ? "发布中..." : "发布"}
  </button>
</div>
```

- [ ] **Step 2: Commit header changes**
```bash
git add src/pages/Publish.tsx
git commit -m "style: redesign Publish page header and submit button"
```

### Task 3: Redesign Textarea

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Style the textarea for a minimal editorial look**
Increase text size, remove borders/background, and update placeholder color.

```tsx
// src/pages/Publish.tsx

<textarea
  placeholder="分享你的想法..."
  value={content}
  onChange={(e) => setContent(e.target.value)}
  className="w-full flex-1 resize-none bg-transparent border-none outline-none text-xl font-medium text-white placeholder:text-white/40 min-h-[160px] py-4"
></textarea>
```

- [ ] **Step 2: Commit textarea changes**
```bash
git add src/pages/Publish.tsx
git commit -m "style: redesign Publish page textarea"
```

### Task 4: Redesign Image Preview Grid

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Update Image Preview Grid and Add Button**
Apply `rounded-2xl`, `glass` effect, and `ring` borders.

```tsx
// src/pages/Publish.tsx

{/* Image Preview Grid */}
{images.length > 0 && (
  <div className="grid grid-cols-3 gap-3 mb-6">
    {images.map((img, index) => (
      <div
        key={index}
        className="relative aspect-square rounded-2xl overflow-hidden group ring-1 ring-white/20 shadow-xl"
      >
        <img
          src={img}
          alt={`Preview ${index + 1}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button
          onClick={() => removeImage(index)}
          className="absolute top-2 right-2 w-6 h-6 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    ))}
    {/* Add more button */}
    {images.length < MAX_IMAGES && (
      <button
        onClick={handleImageClick}
        className="aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-white/40 hover:bg-white/10 hover:border-white/40 transition-all elastic-press"
      >
        <Plus size={32} />
        <span className="text-[10px] mt-1 font-bold">添加</span>
      </button>
    )}
  </div>
)}
```

- [ ] **Step 2: Commit image preview changes**
```bash
git add src/pages/Publish.tsx
git commit -m "style: redesign Publish page image preview grid"
```

### Task 5: Redesign Floating Toolbar

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Implement Floating Glass Toolbar**
Group tools in a capsule at the bottom.

```tsx
// src/pages/Publish.tsx

{/* 3. Media Toolbar (Floating) */}
<div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px]">
  <div className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl ring-1 ring-white/20">
    <button onClick={handleImageClick} className="text-primary-light elastic-press p-2">
      <Image size={24} />
    </button>
    <button className="text-secondary-light elastic-press p-2">
      <Smile size={24} />
    </button>
    <button className="text-accent elastic-press p-2">
      <Hash size={24} />
    </button>
    <button className="text-primary elastic-press p-2">
      <MapPin size={24} />
    </button>
    <div className="w-px h-6 bg-white/10 mx-1" />
    <button className="text-white/60 elastic-press p-2">
      <Plus size={24} />
    </button>
  </div>
</div>
```

- [ ] **Step 2: Remove old toolbar and commit**
```bash
git add src/pages/Publish.tsx
git commit -m "style: implement floating glass toolbar for Publish page"
```

### Task 6: Redesign Settings Section

**Files:**
- Modify: `src/pages/Publish.tsx`

- [ ] **Step 1: Update Settings (Anonymous, Location, Visibility)**
Use glass rows and white text.

```tsx
// src/pages/Publish.tsx

{/* 4. Settings List */}
<div className="mt-4 space-y-3">
  <div className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl px-4 py-3 ring-1 ring-white/10">
    <div className="flex flex-col">
      <span className="text-sm font-bold text-white">匿名发布</span>
      <span className="text-[10px] text-white/40">隐藏个人信息</span>
    </div>
    <button
      onClick={() => setIsAnonymous(!isAnonymous)}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
        isAnonymous ? "bg-accent shadow-[0_0_12px_rgba(0,210,255,0.4)]" : "bg-white/20"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
          isAnonymous ? "left-7" : "left-1"
        }`}
      ></div>
    </button>
  </div>

  {/* Other settings similar to above but with Chevron */}
  {['位置', '可见范围'].map((label, idx) => (
    <div key={label} className="flex items-center justify-between bg-white/5 backdrop-blur-md rounded-2xl px-4 py-3 ring-1 ring-white/10 cursor-pointer active:bg-white/10 transition-colors">
      <span className="text-sm font-bold text-white">{label}</span>
      <div className="flex items-center gap-1 text-white/40">
        <span className="text-xs">{idx === 0 ? '添加地点' : '公开'}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Commit settings changes**
```bash
git add src/pages/Publish.tsx
git commit -m "style: redesign Publish page settings items"
```

### Task 7: Final Polishing & Verification

- [ ] **Step 1: Ensure consistency and remove any leftover white backgrounds**
Check for hardcoded `bg-white` or `text-gray-*` and replace with theme/white-transparent colors.

- [ ] **Step 2: Verify responsive behavior**
Ensure it looks good on mobile-sized viewports.

- [ ] **Step 3: Final commit**
```bash
git add src/pages/Publish.tsx
git commit -m "style: finalize Publish page redesign"
```
