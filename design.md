# Campus Wall — Publish Post Page

> A warm, playful, Material Design 3 inspired mobile publishing screen for a campus social app.
> Platform: iOS / Android (375px baseline).
> Language: Simplified Chinese (zh-CN).

---

## Design Principles

- **Warm & Playful**: Soft pink-rose primary palette (`#9B4053`) with rounded corners everywhere.
- **Material You**: Semantic color roles (surface, on-surface, primary-container, outline-variant) adapted from Material Design 3.
- **Bouncy Feedback**: Every tappable element compresses with an elastic spring curve on press.
- **Glassmorphism**: Header uses translucent background with backdrop blur.
- **Doodle Aesthetic**: The image upload placeholder uses a hand-drawn dashed border for a friendly, imperfect feel.

---

## Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#9B4053` | Headlines, active states, selected chips, brand accent |
| On Primary | `#FFFFFF` | Text on primary-colored buttons |
| Primary Container | `#FF8FA3` | Filled icons, active switch track, gradient start |
| Primary Fixed | `#FFD9DD` | Selection highlight background |
| Primary Fixed Dim | `#FFB2BD` | Gradient end, soft highlights |
| Inverse Primary | `#FFB2BD` | Alternate soft accent |

### Secondary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Secondary | `#6D4EA2` | AI tag text, secondary emphasis |
| Secondary Container | `#C5A3FF` | AI tag chip backgrounds, gradient accent |
| On Secondary | `#FFFFFF` | Text on secondary backgrounds |

### Tertiary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Tertiary | `#316385` | Occasional cool accents |
| Tertiary Container | `#86B6DB` | Info highlights |

### Surface & Background

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FEF8F8` | Main page background (warm off-white with pink tint) |
| Surface | `#FEF8F8` | Cards, modals |
| Surface Bright | `#FEF8F8` | Elevated surfaces |
| Surface Dim | `#DED9D9` | Dividers, disabled backgrounds |
| Surface Container | `#F2ECED` | Image grid item backgrounds |
| Surface Container Low | `#F8F2F2` | Subtle card backgrounds |
| Surface Container Lowest | `#FFFFFF` | Pure white cards (settings card) |
| Surface Container High | `#ECE7E7` | Hover/pressed states |
| Surface Variant | `#E7E1E1` | Inactive track backgrounds |

### Text & Outlines

| Token | Hex | Usage |
|-------|-----|-------|
| On Surface | `#1D1B1B` | Primary body text |
| On Surface Variant | `#544244` | Secondary text, icons |
| Outline | `#877274` | Borders, placeholder text |
| Outline Variant | `#DAC0C3` | Subtle dividers, dashed borders |

### Semantic & Feedback

| Token | Hex | Usage |
|-------|-----|-------|
| Error | `#BA1A1A` | Critical errors |
| Error Container | `#FFDAD6` | Error backgrounds |
| On Error | `#FFFFFF` | Text on error |
| Success | `#4CD964` | Upload success overlay (iOS green) |
| iOS Red | `#FF3B30` | Required field markers |

### Extended Functional Colors

| Hex | Usage |
|-----|-------|
| `#FFF0F3` | Selected chip background, selected list row background |
| `#F5F6F8` | Unselected chip background, input field backgrounds |
| `#FFE1E6` | Location pill background |
| `#FF8FA3` → `#FFB2BD` | Primary CTA gradient (135deg) |
| `#FF8FA3` → `#C5A3FF` | Action button gradient (e.g., "Add" custom tag) |
| `#F4F5F7` | Disabled CTA background |
| `#C1C1C1` | Disabled CTA text |
| `#E0E0E0` | Disabled button background |
| `#999999` | Disabled button text |
| `#FFF9F0` | Custom tag background (warm yellow tint) |
| `#FFE8CC` | Custom tag border |
| `#D48806` | Custom tag text (amber) |
| `#DAC0C3` | Doodle dashed border stroke |
| `#B0A0A3` | Banner upload placeholder text |

---

## Typography

### Font Families

- **Headlines**: `Plus Jakarta Sans`, sans-serif — bold, geometric, friendly.
- **Body / Labels**: `Be Vietnam Pro`, sans-serif — readable, warm, slightly rounded.
- **Icons**: `Material Symbols Outlined` (Google) — variable font with FILL axis support.

### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| Headline LG | 24px | 32px | 800 | 0 | Page title (mobile) |
| Headline MD | 18px | 24px | 700 | 0 | Card titles, section headers |
| Body LG | 15px | 22px | 400 | 0 | Main body text, textarea input |
| Label MD | 13px | 18px | 500 | 0 | List item labels, button text |
| Label SM | 11px | 14px | 400 | 0.02em | Metadata, captions, counters |
| Label SM Mobile | 10px | 12px | 500 | 0 | Small badges, tag counts |

### Hardcoded Sizes (from publish.vue)

| Size | Usage |
|------|-------|
| 36px | Page title "发布新贴" |
| 32px | Card headlines, textarea text |
| 30px | List row labels (分区, 标签, etc.) |
| 28px | List row values, chip text, input text |
| 26px | Secondary descriptions, hint text |
| 24px | Small labels, tag text, button text |
| 22px | Error retry label |
| 18px | Tag post-count metadata |

---

## Spacing System

### Layout Tokens

| Token | Value | Usage |
|-------|-------|-------|
| margin-page | 16px | Horizontal page padding |
| gutter-card | 12px | Gap between grid items |
| padding-inner | 16px | Internal card padding |
| status-bar | 44px | iOS status bar height reference |
| capsule-safe-zone | 90px | Bottom safe area + CTA space |

### Component Spacing

| Value | Usage |
|-------|-------|
| 8px | Small internal gaps |
| 12px | Gap between tags, icon-to-text spacing |
| 16px | Section margins (mt-4, mb-6), card internal padding |
| 20px | Card border-radius |
| 24px | Large card border-radius, modal top radius |
| 25px | CTA button border-radius (pill) |
| 32px | Header padding, modal horizontal padding |
| 44px | Input height, large pill border-radius |
| 50px | CTA button height |
| 64px | Icon button touch target |

---

## Shape & Elevation

### Border Radius Scale

| Token | Radius | Usage |
|-------|--------|-------|
| radius-sm | 12px | Small buttons, tags |
| radius-md | 16px | Image grid items |
| radius-lg | 20px | Cards (40rpx) |
| radius-xl | 22px | Input fields (44rpx pill) |
| radius-2xl | 24px | Modals top corners (48rpx) |
| radius-pill | 25px | Primary CTA (50rpx) |
| radius-full | 50% | Icon buttons, avatars |

### Shadows

| Name | Value | Usage |
|------|-------|-------|
| shadow-card | `0 4px 12px rgba(255,143,163,0.06)` | Elevated cards (AI tag card) |
| shadow-image | `0 8px 20px rgba(255,143,163,0.10)` | Image grid items |
| shadow-cta | `0 12px 32px rgba(255,143,163,0.30)` | Active primary CTA |
| shadow-modal | `0 -8px 32px rgba(0,0,0,0.12)` | Bottom sheet modal |

---

## Iconography

- **Family**: Material Symbols Outlined
- **Style**: Outlined with optional FILL=1 for active/selected states
- **Sizes**: 32px (small), 40px (medium), 44px (list), 48px (feature), 56px (large feature), 64px (empty state)

### Icon Mapping

| Icon Name | Usage | Size |
|-----------|-------|------|
| `close` | Cancel, remove image, close modal | 32px–40px |
| `add` | Add image placeholder | 64px |
| `auto_awesome` | AI feature icon | 48px (filled) |
| `folder` | Group picker | 44px |
| `label` | Tag picker | 44px |
| `location_on` | Location indicator (filled) | 44px |
| `visibility_off` | Anonymous toggle | 44px |
| `chevron_right` | Navigation arrow | 40px |
| `check_circle` | Selected state (filled) | 32px |
| `sync` | Upload loading spinner | 56px |
| `error` | Upload error state | 48px |
| `add_photo_alternate` | Banner upload | 56px |
| `folder_open` | Empty state illustration | 64px |

---

## Components

### Sticky Header

- **Position**: Fixed top, z-index 60
- **Height**: `status-bar + 56px` (dynamic based on device)
- **Background**: `bg-background/85` with `backdrop-blur-md`
- **Border**: Bottom 1px `outline-variant/20`
- **Layout**: Flex row, justify-between, align-center
- **Left**: Close icon button (48px touch target, `-ml-2` alignment)
- **Center**: Title "发布新贴" — 36px, `font-headline-lg`, `text-primary`, bold
- **Right**: Empty spacer (`w-10`)

### Textarea Input

- **Background**: Transparent
- **Border**: None, no focus ring
- **Text**: 32px (16px equivalent), `text-on-surface`, `leading-relaxed`
- **Placeholder**: `text-outline-variant`, "分享此刻的校园生活... (支持 AI 润色哦)"
- **Size**: Full width, height 160px
- **Max length**: 1000 characters
- **Counter**: Right-aligned below textarea, 24px, `text-outline-variant`, format: "{current}/1000"

### Image Grid Item

- **Layout**: 3-column CSS grid, gap 12px
- **Item**: Aspect-square, border-radius 16px, overflow hidden
- **Border**: 4px solid white
- **Shadow**: `shadow-image`
- **Background**: `surface-container`
- **Overlay States**:
  - **Uploading**: Absolute full cover, `bg-black/40`, `backdrop-blur-[2px]`, centered spinning `sync` icon (white, 56px)
  - **Success**: Absolute full cover, `bg-success/20` (`#4CD964` at 20%), centered `check_circle` icon (white, filled, 56px), pointer-events none
  - **Error**: Absolute full cover, `bg-error/40`, `backdrop-blur-[2px]`, centered vertical stack: `error` icon (48px) + "重试" text (22px, white, bold). Tappable to retry.
- **Remove Button**: Absolute top-2 right-2, 48px circle, `bg-black/50`, `backdrop-blur-md`, white `close` icon (32px). z-index 10.

### Add Image Button

- **Size**: Aspect-square (fills one grid cell)
- **Border**: Dashed doodle border (SVG stroke `#DAC0C3`, 2px, dasharray 8,8, rounded caps)
- **Border Radius**: 16px
- **Background**: `surface-container-lowest`
- **Content**: Vertical center — `add` icon (64px, `text-outline-variant`) + "添加图片" label (24px, bold)
- **Tap**: `bouncy-tap` active scale

### AI Tag Card

- **Background**: `surface-container-low`
- **Border Radius**: 20px
- **Padding**: 32px
- **Shadow**: `shadow-card`
- **Border**: 1px `outline-variant/20`
- **Header**: Horizontal flex, justify-between
  - Left: `auto_awesome` icon (48px, filled, `text-primary-container`) + "AI 智能标签" (32px, bold)
  - Right: "生成" button — `bg-primary/10`, `text-primary`, px-16px py-6px, pill shape, 24px bold
- **Content**:
  - If empty: "点击右上角，让 AI 为你的文案提取个性标签 ✨" (26px, `text-outline-variant`)
  - If tags exist: Horizontal flex-wrap gap-8px
    - Tag chip: `bg-secondary-container/30`, `text-secondary`, px-12px py-6px, pill, 24px bold, border 1px `secondary-container/20`

### Settings List Card

- **Background**: White (`#FFFFFF`)
- **Border Radius**: 20px
- **Padding**: 8px (internal items have their own padding)
- **Shadow**: `shadow-sm`
- **Border**: 1px `outline-variant/20`
- **Rows**: Each row is horizontal flex, justify-between, align-center, padding 16px
  - **Border Bottom**: 1px `outline-variant/20` on all rows except last
  - **Left**: Icon (44px, `text-on-surface-variant`) + Label (30px, bold, `text-on-surface`), gap 12px
  - **Right**: Value text (28px, `text-primary`, bold, truncated) + `chevron_right` icon (40px), OR Switch toggle

#### Settings Row Variants

| Row | Icon | Label | Right Content |
|-----|------|-------|---------------|
| Group Picker | `folder` | 分区 | Selected group name or "选择分区" + chevron |
| Tag Picker | `label` | 标签 | Selected tags or "选择标签" + chevron |
| Location | `location_on` (filled) | 地点 | Location pill (`bg-[#FFE1E6]`, `text-[#9B4053]`, pill) or "未获取到位置" |
| Anonymous | `visibility_off` | 匿名发布 | Switch, active track color `#FFB2BD` |

### Switch Toggle

- **Scale**: 0.9
- **Active Track**: `#FFB2BD`
- **Thumb**: White
- **Platform Style**: iOS-style switch

### Board Fields Card (Conditional)

- **Visibility**: Only shown when selected board is `recommend`, `secondhand`, `parttime`, `promotion`, or `team`
- **Background**: White
- **Border Radius**: 20px
- **Padding**: 32px
- **Shadow**: `shadow-sm`
- **Border**: 1px `outline-variant/20`
- **Spacing**: Gap 20px between field groups

#### Section Title

- **Layout**: Horizontal flex, align-center, gap 12px
- **Accent Bar**: Vertical pill, 4px wide, 24px tall, border-radius full, `bg-primary` (`#9B4053`)
- **Title Text**: "{分区名称}信息" (e.g., "兼职信息", "推广信息", "组队信息", "集市信息") — 30px, bold, `text-on-surface`
- **Right Action** (optional): Some boards show a toggle or badge aligned to the right of the title row

#### Input Field Style

- **Layout**: Vertical stack — Label above, Input below
- **Label**: 28px, bold, `text-on-surface-variant`, margin-bottom 8px
- **Label Suffix**: Currency symbol `(¥)` or unit in parentheses, same style as label
- **Input**:
  - Height: 50px
  - Background: `#F5F6F8`
  - Border Radius: 22px (pill)
  - Padding: 0 20px
  - Text: 28px, `text-on-surface`
  - Placeholder: `text-outline-variant`
- **Two-Column Layout**: When a row has two fields, use a horizontal flex with gap 12px, each input flex-1

---

### Board Variants

#### 1. 推荐 (Default — `recommend`)

- **Board Fields Card**: Hidden entirely
- **Behavior**: This is the default state when no specific board is selected, or when the generic "推荐" group is chosen. Only the base form is shown (textarea, images, AI tags, settings).

#### 2. 兼职信息 (`parttime`)

- **Title**: "兼职信息" with left accent bar
- **Row 1 — Two Columns**:
  - **Left**: Label "薪资(¥)" + Input (digit), placeholder "请输入薪资"
  - **Right**: Label "信息费(¥)" + Input (digit), placeholder "可选"
- **Row 2**: Label "联系方式" + Input (text), placeholder "微信/QQ号"

#### 3. 推广信息 (`promotion`)

- **Title**: "推广信息" with left accent bar
- **Banner Label**: "16:9 Banner Upload" — 24px, `text-outline-variant`, margin-bottom 8px
- **Banner Upload Area**:
  - Size: Full width, aspect-ratio 16:9 (or fixed height ~200px)
  - Border Radius: 24px
  - Background: `#F5F6F8`
  - Border: 2px dashed `#DAC0C3` (doodle style)
  - Content: Centered `add_photo_alternate` icon (48px, `text-outline-variant`) + "上传横向 Banner" text (24px, `text-outline-variant`)
  - **Preview State**: If image exists, full-width image with border-radius 24px, object-fit cover
- **Row**: Label "联系方式" + Input (text), placeholder "微信/QQ/手机号"

#### 4. 组队信息 (`team`)

- **Title**: "组队信息" with left accent bar
- **Row 1**: Label "需求详情" + Input (text), placeholder "例如：缺2人，来个辅助"
- **Row 2**: Label "联系方式" + Input (text), placeholder "微信/QQ号"

#### 5. 集市信息 (`secondhand`)

- **Title Row**: Horizontal flex, justify-between, align-center
  - **Left**: Accent bar + "集市信息" title
  - **Right**: "价格面议" toggle — horizontal flex, align-center, gap 6px
    - Text: 24px, `text-on-surface-variant`
    - Check icon: `check_circle` (20px, filled, `text-primary`)
    - Switch: iOS-style, scale 0.9, active track `#FF8FA3`
- **Row 1 — Two Columns**:
  - **Left**: Label "价格(¥)" + Input (digit), placeholder "0.00", text color `text-primary` (`#9B4053`) when filled
    - When "价格面议" is ON: input shows placeholder "面议" and is disabled (opacity 0.5)
  - **Right**: Label "联系方式" + Input (text), placeholder "微信/QQ号"

---

### Banner Upload Area

- **Size**: Full width, aspect-ratio 16:9
- **Border Radius**: 24px
- **Background**: `#F5F6F8`
- **Border**: 2px dashed `#DAC0C3`
- **Content**: Centered vertical stack — `add_photo_alternate` icon (48px, `text-outline-variant`) + "上传横向 Banner" text (24px, `text-outline-variant`)
- **Preview State**: If image exists, full-width image with border-radius 24px, object-fit cover, replacing the upload placeholder entirely

### Bottom Sheet Modal

- **Position**: Fixed inset-0, z-index 1000
- **Backdrop**: Full screen, semi-transparent black (click to dismiss)
- **Container**: Full width, max-height 75vh, aligned bottom
- **Top Radius**: 24px
- **Shadow**: `shadow-2xl`
- **Animation**: `animate-slideUp` — translateY(100%) → 0, 0.3s, cubic-bezier(0.22, 1, 0.36, 1)
- **Header**: Horizontal flex, justify-between, padding 32px 40px
  - Title: 36px, bold, `text-on-surface`
  - Close button: 64px circle, `bg-surface-container`, `close` icon (40px)
- **Content**: Scrollable area, height 50vh, padding 0 40px 80px

#### Group Picker Modal

- **Items**: Vertical list, gap 8px
- **Item Row**: Full width, padding 16px, border-radius 12px, border 3px
  - **Unselected**: `bg-[#F5F6F8]`, border transparent
  - **Selected**: `bg-[#FFF0F3]`, border `#9B4053` (`border-primary`)
- **Text**: 28px, bold — `text-on-surface` or `text-[#9B4053]` when selected
- **Checkmark**: `check_circle` icon (32px, `text-primary`) shown only when selected

#### Tag Picker Modal

- **Empty State**: If no group selected, centered `folder_open` icon (64px) + "请先选择分区" (28px)
- **Section Title**: "{Group Name} 标签（可多选）" (24px, bold, `text-outline-variant`, uppercase, tracking-wide)
- **Tag Grid**: Flex-wrap, gap 12px
  - **Chip**: Horizontal flex, gap 6px, padding 16px 20px, border-radius pill (full), border 3px
    - **Unselected**: `bg-[#F5F6F8]`, border transparent, `text-on-surface`
    - **Selected**: `bg-[#FFF0F3]`, border `#9B4053`, `text-[#9B4053]`
  - **Tag Name**: 26px, bold, with `#` prefix
  - **Post Count**: 18px, `text-outline-variant`, format: "{count} 帖"
- **Custom Topic Section**:
  - Title: "自定义话题" (24px, bold, `text-outline-variant`, uppercase)
  - Input row: Flex, gap 12px
    - Input: Flex-1, height 88px, `bg-[#F5F6F8]`, border-radius 22px, padding 0 32px, 28px text
    - Add button: Height 88px, padding 0 48px, border-radius 22px
      - **Disabled**: `bg-[#E0E0E0]`, `text-[#999]`
      - **Active**: Gradient `bg-gradient-to-br from-[#FF8FA3] to-[#C5A3FF]`, white text, `shadow-md`
  - Custom tags list: Flex-wrap, gap 12px, margin-top 16px
    - Tag: `bg-[#FFF9F0]`, border 2px `#FFE8CC`, pill, padding 16px 24px
    - Text: 26px, bold, `#D48806`
    - Remove: `×` character (32px, `#D48806`, tappable)

### Primary CTA Button

- **Position**: Fixed bottom, full width, z-index 70
- **Background**: White with top padding for safe area
- **Button**:
  - Width: Full (with 32px horizontal margin)
  - Height: 50px
  - Border Radius: 25px (pill)
  - Text: "发布贴纸 ✨" — 36px, bold, centered
  - **Active State**: Gradient `linear-gradient(135deg, #FF8FA3 0%, #FFB2BD 100%)`, white text, `shadow-cta`
  - **Disabled State**: `bg-[#F4F5F7]`, `text-[#C1C1C1]`, no shadow
- **Tap**: `bouncy-tap` active scale

---

## Page: Publish Post

### Structure

```
[Sticky Header]
  [Close Button]        [Title: 发布新贴]        [Spacer]

[Scrollable Main Content] (px-16px, pb-200px)
  ├─ [Textarea Section] (mt-16px, mb-24px)
  │    [Textarea Input]
  │    [Character Counter: 0/1000]
  │
  ├─ [Image Grid] (3 columns, gap-12px, mb-32px)
  │    [Image 1] [Image 2] [Image 3]
  │    [Image 4] [Add Button]
  │    (Each image shows upload status overlay)
  │
  ├─ [AI Tag Card]
  │    [Header with 生成 Button]
  │    [Tags or Empty Hint]
  │
  ├─ [Settings Card]
  │    [Row: 分区 → 选择分区 >]
  │    [Row: 标签 → 选择标签 >]
  │    [Row: 地点 → Location Pill]
  │    [Row: 匿名发布 → Switch]
  │
  └─ [Board Fields Card] (Conditional — 5 variants)
       [Title Row: Accent Bar + {分区名}信息 (+ optional right action)]
       [Variant-specific fields]
         • 推荐: card hidden
         • 兼职: 薪资(¥) + 信息费(¥) [2-col] → 联系方式
         • 推广: 16:9 Banner Upload → 联系方式
         • 组队: 需求详情 → 联系方式
         • 集市: 价格面议 toggle [title right] → 价格(¥) + 联系方式 [2-col]

[Fixed Bottom CTA]
  [发布贴纸 ✨ Button]

[Bottom Sheet: Group Picker] (Conditional)
[Bottom Sheet: Tag Picker] (Conditional)
```

### Background

- Full page background: `bg-background` (`#FEF8F8`)
- Selection highlight: `bg-primary-fixed` with `text-on-primary-fixed`

### States

| State | Trigger | Visual |
|-------|---------|--------|
| Default | Page load | All fields empty, CTA disabled |
| Valid | Content or images added | CTA active with gradient |
| Uploading | Image selected | Grid item shows spinner overlay |
| Upload Success | Image uploaded | Green checkmark overlay |
| Upload Error | Network failure | Red error overlay with retry |
| Group Selected | User picks a group | Settings row shows group name, board fields may appear |
| Tag Limit Reached | 5 tags selected | Disable adding more tags, show toast |
| Anonymous On | Switch enabled | Switch thumb slides right, track turns pink |

---

## Interactions & Motion

### Bouncy Tap

- **Trigger**: `:active` state on tappable elements
- **Effect**: `transform: scale(0.95)`
- **Curve**: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Duration**: 0.2s
- **Applies to**: Buttons, list rows, chips, image cards, icons

### Slide Up (Modal)

- **Trigger**: Modal open
- **Effect**: `translateY(100%)` → `translateY(0)`
- **Curve**: `cubic-bezier(0.22, 1, 0.36, 1)`
- **Duration**: 0.3s

### Loading Spinner

- **Animation**: Continuous 360deg rotation
- **Duration**: 1s linear infinite
- **Icon**: `sync` (Material Symbols)

### Switch Toggle

- **Platform**: Native iOS-style switch
- **Active Color**: `#FFB2BD`
- **Scale**: 0.9 (slightly smaller than system default)

---

## Notes for Stitch

- This is a **mobile-only** screen. Design at 375px width.
- All measurements use a 375px baseline. In the original code, `1rpx ≈ 0.5px`.
- The page uses **Chinese (Simplified)** as the primary language. Keep all labels and hints in Chinese.
- The **dashed-doodle border** is a key brand element — use an SVG stroke with rounded caps, 2px width, dasharray 8,8, color `#DAC0C3`.
- The **pink gradient CTA** is the primary action highlight. Use `linear-gradient(135deg, #FF8FA3, #FFB2BD)`.
- **Board fields** are conditionally rendered. Show them only when a specific board type is selected.
- Use **Material Symbols Outlined** for all icons, with FILL=1 for active/selected states.
