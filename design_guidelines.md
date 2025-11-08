# Khalil Investment Platform - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from professional financial platforms (Robinhood, Coinbase, Bloomberg Terminal) combined with modern SaaS dashboards (Linear, Stripe Dashboard). This creates a trustworthy, data-rich interface suitable for a multi-sector investment ecosystem.

## Core Design Principles
1. **Trust & Professionalism**: Clean layouts, clear hierarchy, and premium feel
2. **Data Clarity**: Charts and metrics take visual priority
3. **Dashboard Efficiency**: Quick access to all modules via persistent sidebar
4. **Modern Sophistication**: Blend of financial gravitas with contemporary UI

---

## Color Palette
**Primary Colors** (as specified):
- **Dark Blue**: `#1a237e` (primary), `#0d47a1` (lighter variant) - Headers, sidebar, primary buttons
- **White**: `#ffffff` - Backgrounds, cards, text on dark
- **Gold**: `#ffd700` (accent), `#f9a825` (muted variant) - CTAs, highlights, success states

**Supporting Colors**:
- Gray scale: `#f5f5f5` (light bg), `#e0e0e0` (borders), `#757575` (secondary text)
- Success: `#4caf50` (profit/positive ROI)
- Warning: `#ff9800` (pending approval)
- Error: `#f44336` (losses/rejected)

---

## Typography System
**Font Families**:
- Primary: 'Inter' (UI, body text)
- Display: 'Poppins' (headings, numbers)
- Monospace: 'JetBrains Mono' (financial data, codes)

**Hierarchy**:
- H1 (Page Titles): 32px, Poppins SemiBold
- H2 (Section Headers): 24px, Poppins SemiBold
- H3 (Card Titles): 18px, Inter SemiBold
- Body: 15px, Inter Regular
- Small/Meta: 13px, Inter Regular
- Financial Numbers: 20-28px, Poppins Medium

---

## Layout System
**Spacing Units** (Tailwind): Use 2, 4, 8, 12, 16, 24 units
- Card padding: p-6
- Section spacing: space-y-8
- Component gaps: gap-4
- Container margins: mx-auto max-w-7xl

**Dashboard Structure**:
- Fixed sidebar: 280px wide, dark blue background, white text
- Main content area: Flexible width with max-w-7xl container
- Top navbar: 64px height, white bg with subtle shadow

---

## Component Library

### Navigation
**Sidebar** (Admin & User):
- Logo at top (180px wide)
- Navigation items with icons (Heroicons)
- Active state: Gold left border (4px) + gold icon
- Hover state: Lighter blue background (`#1e3a8a`)
- Section dividers between module groups
- User profile card at bottom with avatar, name, role

**Top Navbar**:
- Breadcrumb navigation (left)
- Search bar (center) - full-width on tablets
- Notification bell + user dropdown (right)

### Cards & Containers
**Dashboard Cards**:
- White background with subtle shadow (`shadow-md`)
- Rounded corners (`rounded-lg`)
- Padding: p-6
- Hover: Slight lift effect (`hover:shadow-lg transition-shadow`)

**Stat Cards** (Metrics):
- Icon (gold circle bg) + Label + Large number + Trend indicator
- 4-column grid on desktop, 2 on tablet, 1 on mobile

**Investment Cards**:
- Company logo/icon (left)
- Investment name + amount (center)
- ROI percentage with color-coded badge (right)
- Progress bar showing time remaining

**Property Cards** (Real Estate):
- Large image (16:9 ratio) with "Pending/Approved" badge overlay
- Title, location (with map pin icon), price (gold)
- Action buttons: View Details, Edit, Promote

**Product Cards** (E-commerce):
- Square product image
- Name, category tag, price
- Stock status indicator
- Quick action menu (3-dot icon)

### Forms & Inputs
**Input Fields**:
- Height: h-12
- Border: 1px solid #e0e0e0, focus: gold border
- Padding: px-4
- Labels: Above input, 13px, gray-700

**Buttons**:
- Primary: Dark blue bg, white text, gold on hover
- Secondary: White bg, dark blue border, hover fill
- Success: Gold bg (#ffd700), dark blue text
- Height: h-12, rounded-md, font-medium

### Data Visualization
**Charts** (Chart.js):
- Line charts: ROI over time (gold line, gradient fill)
- Bar charts: Investment comparison (dark blue bars)
- Pie charts: Portfolio distribution (blue/gold/white segments)
- Donut charts: Commission breakdown
- Background: White cards with title and filter controls

**Tables**:
- Striped rows (alternate light gray)
- Header: Dark blue bg, white text, sticky on scroll
- Sortable columns with arrow indicators
- Action column (right) with icon buttons

### Modals & Overlays
**Modal Windows**:
- Overlay: Dark blue with 60% opacity
- Modal: White, rounded-lg, max-w-2xl
- Header with close button (top-right)
- Footer with action buttons (right-aligned)

**Notifications/Toast**:
- Top-right position
- Gold background for success
- Auto-dismiss after 5 seconds
- Icon + Message + Close button

---

## Module-Specific Designs

### Investment Module
- Real-time price ticker (top of section)
- Investment request form: 2-column layout (project selector, amount input)
- Portfolio view: Grid of investment cards with filtering
- ROI chart: Prominent line chart showing historical performance

### Real Estate Module
- Map view toggle (Google Maps integration)
- Property grid: 3 columns on desktop
- Add property form: Multi-step (Details → Images → Pricing → Promotion)
- Filter sidebar: Price range, location, type

### E-commerce Module
- Shop connection wizard (Shopify/WooCommerce OAuth)
- Product management table with inline editing
- Order dashboard with status pipeline
- Inventory alerts (low stock warnings)

### Social Posting Module
- Connected accounts row (platform logos with status badges)
- Post composer: Large textarea with AI suggest button (gold)
- Platform selector: Checkbox cards with platform branding
- Schedule picker: Calendar dropdown
- Post history: Timeline view with preview cards

---

## Admin Dashboard Specifics
- Analytics overview: 4 stat cards + 2 large charts
- User table: Avatar, name, email, role badge, actions
- Approval queues: Tabbed interface (Investments, Properties, Products)
- Settings panel: Form sections with save button (sticky footer)

---

## Images
**Required Images**:
1. **Logo**: "Khalil Investment" wordmark with gold accent (vector preferred)
2. **Dashboard Hero/Banner**: Financial chart visualization background (subtle, no text overlay) - optional decorative element
3. **Property Placeholders**: Real estate imagery for listings
4. **Product Placeholders**: Generic product images
5. **User Avatars**: Default avatar icons

**No Large Hero Section**: This is a dashboard application - immediate access to data takes priority over marketing imagery.

---

## Responsive Behavior
- Desktop (>1024px): Full sidebar + 3-4 column grids
- Tablet (768-1024px): Collapsible sidebar + 2 column grids
- Mobile (<768px): Bottom navigation + single column + hamburger menu

---

## Accessibility
- WCAG AA contrast ratios (dark blue on white, white on dark blue)
- Focus indicators: Gold ring on all interactive elements
- Keyboard navigation for all dashboards
- Screen reader labels on icon-only buttons