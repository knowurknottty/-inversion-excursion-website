# Timebank UX Specification
## Mobile-First Design Document

**Version:** 1.0  
**Platform:** Progressive Web App (PWA)  
**Target:** Mobile-first, responsive to desktop  
**Design Philosophy:** Minimalist, accessible, trust-building

---

## 1. Design System

### 1.1 Color Palette
```
Primary:      #2563EB (Trust Blue)
Secondary:    #10B981 (Growth Green)
Accent:       #F59E0B (Warm Amber - for TimeTokens)
Danger:       #EF4444 (Dispute/Cancel)
Success:      #22C55E (Complete/Confirm)
Neutral:      #6B7280 (Gray - secondary text)
Background:   #F9FAFB (Light Gray)
Surface:      #FFFFFF (Card backgrounds)
Dark:         #111827 (Primary text)
```

### 1.2 Typography
```
Font Family: Inter, system-ui, sans-serif
Headings:    600 weight
Body:        400 weight
Small:       12px
Base:        14px (mobile) / 16px (desktop)
Large:       18px
XLarge:      24px
```

### 1.3 Spacing System
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### 1.4 Components
- **Buttons**: Full-width on mobile, rounded-lg (8px), min-height 48px (touch target)
- **Cards**: rounded-xl (12px), shadow-sm, padding 16px
- **Inputs**: rounded-lg, border-gray-300, focus:ring-2 focus:ring-primary
- **Bottom Sheet**: Native-feeling slide-up for actions/selections
- **Toast Notifications**: Top of screen, auto-dismiss 3s

---

## 2. User Flows

### 2.1 Onboarding Flow

#### Flow Diagram
```
[Welcome Screen]
      │
      ▼
[How It Works] ───> [Skip] ───> [Wallet Connection]
      │                               │
      ▼                               ▼
[Create Profile] <─────────────── [Connect Wallet]
      │
      ▼
[Skills/Interests]
      │
      ▼
[TimeToken Intro]
      │
      ▼
[Home Dashboard]
```

#### Wireframe: Welcome Screen
```
┌─────────────────────────────┐
│                             │
│                             │
│       ◈ TIME BANK ◈         │
│                             │
│    [Animated Logo:          │
│     Hourglass with          │
│     flowing particles]      │
│                             │
│                             │
│   Trade Skills, Build       │
│   Community, No Money       │
│   Required                  │
│                             │
│                             │
│                             │
│   ┌─────────────────────┐   │
│   │   Get Started →     │   │
│   └─────────────────────┘   │
│                             │
│   Already have an account?  │
│         Sign In             │
│                             │
└─────────────────────────────┘
```

#### Wireframe: How It Works
```
┌─────────────────────────────┐
│ ← How Timebank Works        │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │  ◉ ○ ○ ○            │    │ ← Step indicator
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   [Illustration:    │    │
│  │    Person offering  │    │
│  │    service]         │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│   Offer Your Skills         │
│                             │
│   Share what you're good    │
│   at. Cooking, coding,      │
│   tutoring, repairs—        │
│   anything counts.          │
│                             │
│                             │
│   ┌─────────────────────┐   │
│   │     Continue →      │   │
│   └─────────────────────┘   │
│                             │
│        Skip Tutorial        │
│                             │
└─────────────────────────────┘
```

**Step Content:**
1. **Offer Skills** - "Share what you're good at. Cooking, coding, tutoring, repairs—anything counts."
2. **Earn TimeTokens** - "Each hour you help others earns 1 TimeToken. Soulbound to you—non-transferable."
3. **Request Help** - "Use your TimeTokens to get help when you need it. No cash required."
4. **Build Reputation** - "Complete exchanges, earn ratings, build trust in your community."

#### Wireframe: Wallet Connection
```
┌─────────────────────────────┐
│ ← Connect Wallet            │
├─────────────────────────────┤
│                             │
│   Connect Your Wallet       │
│                             │
│   Timebank uses blockchain  │
│   to secure your TimeTokens │
│   and reputation. Choose    │
│   a wallet to continue:     │
│                             │
│   ┌─────────────────────┐   │
│   │ 🦊 MetaMask         │   │
│   │                     │   │
│   │ Most popular        │ → │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔷 WalletConnect    │   │
│   │                     │   │
│   │ Connect any wallet  │ → │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔑 Create New       │   │
│   │                     │   │
│   │ Built-in wallet     │ → │
│   └─────────────────────┘   │
│                             │
│                             │
│   🔒 Your keys, your        │
│      tokens. We never       │
│      have access.           │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Create Profile
```
┌─────────────────────────────┐
│ ← Create Profile            │
├─────────────────────────────┤
│                             │
│   Tell us about yourself    │
│                             │
│   ┌─────────────────────┐   │
│   │ 👤                  │   │
│   │   Add Photo         │   │
│   │   (Optional)        │   │
│   └─────────────────────┘   │
│                             │
│   Display Name *            │
│   ┌─────────────────────┐   │
│   │ Alex Chen           │   │
│   └─────────────────────┘   │
│                             │
│   Username *                │
│   ┌─────────────────────┐   │
│   │ @alexcreates        │   │
│   └─────────────────────┘   │
│   ✅ Available              │
│                             │
│   Bio                       │
│   ┌─────────────────────┐   │
│   │ I love helping...   │   │
│   │                     │   │
│   └─────────────────────┘   │
│   0/160                     │
│                             │
│   Location                  │
│   ┌─────────────────────┐   │
│   │ 📍 Portland, OR     │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │   Continue →        │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Skills Selection
```
┌─────────────────────────────┐
│ ← Your Skills               │
├─────────────────────────────┤
│                             │
│   What can you offer?       │
│   Select at least 3         │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔍 Search skills... │   │
│   └─────────────────────┘   │
│                             │
│   Popular Categories:       │
│                             │
│   ┌────┐ ┌────┐ ┌────┐     │
│   │🍳  │ │💻  │ │🔧  │     │
│   │Cook│ │Tech│ │Home│     │
│   │ing │ │    │ │    │     │
│   └────┘ └────┘ └────┘     │
│                             │
│   Selected (2/3):           │
│   ┌─────────────────────┐   │
│   │ ✓ Web Development   │ × │
│   │ ✓ Photography       │ × │
│   └─────────────────────┘   │
│                             │
│   Suggested:                │
│   ┌─────────────────────┐   │
│   │ + Graphic Design    │   │
│   ├─────────────────────┤   │
│   │ + Tutoring          │   │
│   ├─────────────────────┤   │
│   │ + Gardening         │   │
│   ├─────────────────────┤   │
│   │ + Carpentry         │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │   Continue (2/3)    │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Wireframe: TimeToken Introduction
```
┌─────────────────────────────┐
│                             │
├─────────────────────────────┤
│                             │
│      ⏳ TimeTokens ⏳       │
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │   [Animated Token   │   │
│   │    rotating with    │   │
│   │    hourglass icon]  │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│   Your Time, Tokenized      │
│                             │
│   • 1 hour of help =        │
│     1 TimeToken             │
│                             │
│   • Tokens are soulbound    │
│     to you (non-transfer)   │
│                             │
│   • Use them to request     │
│     services from others    │
│                             │
│   • Can't be sold—only      │
│     earned through giving   │
│                             │
│   ┌─────────────────────┐   │
│   │   Start Exploring → │   │
│   └─────────────────────┘   │
│                             │
│   ━━━━━━━━━━━━━━━━━━━━━━━   │
│   You received 1 starter    │
│   TimeToken! 🎉             │
│                             │
└─────────────────────────────┘
```

---

### 2.2 Offering Services Flow

#### Flow Diagram
```
[Home Dashboard]
      │
      │ (Tap "+" or "Offer Help")
      ▼
[Service Creation Form]
      │
      ├───> [Save Draft]
      │
      ▼
[Preview Service]
      │
      ├───> [Edit]
      │
      ▼
[Publish]
      │
      ▼
[Confirmation] ───> [Share to Community]
```

#### Wireframe: Service Creation
```
┌─────────────────────────────┐
│ ← Offer a Service           │
├─────────────────────────────┤
│                             │
│   What help can you offer?  │
│                             │
│   Service Title *           │
│   ┌─────────────────────┐   │
│   │ e.g., "Web Design   │   │
│   │ for Small Business" │   │
│   └─────────────────────┘   │
│                             │
│   Category *                │
│   ┌─────────────────────┐   │
│   │ Technology ▼        │   │
│   └─────────────────────┘   │
│                             │
│   Description *             │
│   ┌─────────────────────┐   │
│   │ Describe what you   │   │
│   │ offer, your         │   │
│   │ experience level,   │   │
│   │ and what the        │   │
│   │ requester can       │   │
│   │ expect...           │   │
│   │                     │   │
│   │                     │   │
│   └─────────────────────┘   │
│   0/500                     │
│                             │
│   Time Required *           │
│   ┌─────────────────────┐   │
│   │ ⏱️ 2 hours    ▼     │   │
│   └─────────────────────┘   │
│                             │
│   Availability              │
│   ┌─────────────────────┐   │
│   │ 🗓️ Select days...   │   │
│   └─────────────────────┘   │
│                             │
│   Location                  │
│   ○ Remote only             │
│   ○ In-person               │
│   ○ Both                    │
│                             │
│   ┌─────────────────────┐   │
│   │  Preview →          │   │
│   └─────────────────────┘   │
│                             │
│   [ Save Draft ]            │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Service Preview
```
┌─────────────────────────────┐
│ ← Preview                   │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │ 👤 Alex Chen        │   │
│   │ ⭐ 4.8 (12 reviews) │   │
│   └─────────────────────┘   │
│                             │
│   Web Design for Small      │
│   Business                  │
│   🏷️ Technology             │
│                             │
│   ⏱️ 2 hours per session    │
│   🌍 Remote or In-person    │
│                             │
│   ─────────────────────     │
│                             │
│   About this service:       │
│                             │
│   I specialize in creating  │
│   beautiful, functional     │
│   websites for small        │
│   businesses. I'll help...  │
│                             │
│   [Read more]               │
│                             │
│   ─────────────────────     │
│                             │
│   Available:                │
│   Mon, Wed, Fri             │
│   9:00 AM - 5:00 PM         │
│                             │
│   ─────────────────────     │
│                             │
│   Location:                 │
│   📍 Portland, OR area      │
│                             │
│                             │
│   ┌─────────────────────┐   │
│   │  ✓ Publish Service  │   │
│   └─────────────────────┘   │
│                             │
│   [ Make Changes ]          │
│                             │
└─────────────────────────────┘
```

---

### 2.3 Requesting Services Flow

#### Flow Diagram
```
[Home/Browse]
      │
      ├───> [Search] ───> [Filter Results]
      │
      ├───> [Categories] ───> [Service List]
      │
      ▼
[Service Detail]
      │
      ├───> [View Provider Profile]
      │
      ▼
[Request Form]
      │
      ▼
[Confirm Request] ───> [Provider Notification]
      │
      ▼
[Waiting for Response]
```

#### Wireframe: Browse Services
```
┌─────────────────────────────┐
│  Discover                   │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │ 🔍 Search skills... │   │
│   └─────────────────────┘   │
│                             │
│   📍 Portland, OR  [Change] │
│                             │
│   Categories:               │
│   ┌────┬────┬────┬────┐    │
│   │All │🍳  │💻  │🔧  │    │
│   │    │Food│Tech│Home│    │
│   └────┴────┴────┴────┘    │
│                             │
│   Available Now             │
│   ┌─────────────────────┐   │
│   │ 👤 Sarah M.         │   │
│   │ 🍳 Home Cooking     │   │
│   │    Lessons          │   │
│   │ ⭐ 4.9 • ⏱️ 1.5 hrs │   │
│   │ 🟢 Available today  │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 👤 Marcus T.        │   │
│   │ 🔧 Bicycle Repair   │   │
│   │ ⭐ 4.7 • ⏱️ 1 hr    │   │
│   │ 🟡 Available Wed    │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 👤 Elena R.         │   │
│   │ 💻 Coding Tutor     │   │
│   │ ⭐ 5.0 • ⏱️ 2 hrs   │   │
│   │ 🟢 Available now    │   │
│   └─────────────────────┘   │
│                             │
│         [+ Offer Help]      │
└─────────────────────────────┘
```

#### Wireframe: Service Detail
```
┌─────────────────────────────┐
│ ← Service Details           │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │   👤                │   │
│   │                     │   │
│   │   Sarah Mitchell    │   │
│   │   ⭐ 4.9 ★★★★★      │   │
│   │   24 exchanges      │   │
│   │   Member since 2025 │   │
│   │                     │   │
│   │ [View Full Profile] │   │
│   └─────────────────────┘   │
│                             │
│   Home Cooking Lessons      │
│   🏷️ Food & Nutrition       │
│                             │
│   ⏱️ 1.5 hours per session  │
│   🌍 In-person              │
│   📍 3 miles away           │
│                             │
│   ─────────────────────     │
│                             │
│   About this service        │
│                             │
│   Learn to cook healthy,    │
│   delicious meals at home.  │
│   I specialize in...        │
│                             │
│   [Read full description]   │
│                             │
│   ─────────────────────     │
│                             │
│   Recent Reviews            │
│                             │
│   ⭐⭐⭐⭐⭐ "Amazing!"      │
│   "Sarah taught me to make  │
│   perfect pasta in one..."  │
│   — Alex C.                 │
│                             │
│   [See all 12 reviews]      │
│                             │
│   ─────────────────────     │
│                             │
│   Available This Week       │
│   Mon ✓  Tue ✓  Wed ✗      │
│   Thu ✓  Fri ✓  Sat ✓      │
│                             │
│   ┌─────────────────────┐   │
│   │  📅 Request This →  │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Request Form
```
┌─────────────────────────────┐
│ ← Request Service           │
├─────────────────────────────┤
│                             │
│   Home Cooking Lessons      │
│   with Sarah Mitchell       │
│                             │
│   ─────────────────────     │
│                             │
│   📅 Preferred Date *       │
│   ┌─────────────────────┐   │
│   │ March 15, 2025  ▼   │   │
│   └─────────────────────┘   │
│                             │
│   ⏰ Preferred Time *       │
│   ┌─────────────────────┐   │
│   │ 2:00 PM  ▼          │   │
│   └─────────────────────┘   │
│                             │
│   📍 Location               │
│   ○ My place                │
│   ○ Provider's place        │
│   ○ Public location         │
│                             │
│   📝 Details for Sarah      │
│   ┌─────────────────────┐   │
│   │ I'd like to learn   │   │
│   │ Italian cooking...  │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│   ─────────────────────     │
│                             │
│   Cost: 1.5 TimeTokens      │
│   Your balance: 3.0 TT      │
│                             │
│   ┌─────────────────────┐   │
│   │  ✓ Confirm Request  │   │
│   └─────────────────────┘   │
│                             │
│   Tokens held until         │
│   service is completed      │
│                             │
└─────────────────────────────┘
```

---

### 2.4 Completing Exchange Flow

#### Flow Diagram
```
[Request Confirmed]
      │
      ▼
[In Progress State]
      │
      ├───> [Message Provider]
      │
      ├───> [Reschedule]
      │
      ├───> [Cancel] ───> [Refund tokens]
      │
      ▼
[Service Completed]
      │
      ├───> [Mark Complete - Provider]
      │
      ├───> [Mark Complete - Requester]
      │
      ▼
[Mutual Confirmation]
      │
      ▼
[Rate & Review]
      │
      ▼
[Tokens Transferred]
```

#### Wireframe: Exchange In Progress
```
┌─────────────────────────────┐
│ ← Exchange #2847            │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │ Status: IN PROGRESS │   │
│   │                     │   │
│   │ ⏱️ Scheduled for    │   │
│   │    Today, 2:00 PM   │   │
│   └─────────────────────┘   │
│                             │
│   Home Cooking Lessons      │
│   1.5 hours • 1.5 TT        │
│                             │
│   ─────────────────────     │
│                             │
│   Provider                  │
│   ┌─────────────────────┐   │
│   │ 👤 Sarah Mitchell   │   │
│   │ ⭐ 4.9 (24)         │   │
│   │ 📱 Message          │ → │
│   └─────────────────────┘   │
│                             │
│   ─────────────────────     │
│                             │
│   Location                  │
│   📍 Your place             │
│   123 Main St, Portland     │
│                             │
│   ─────────────────────     │
│                             │
│   Actions                   │
│                             │
│   ┌─────────────────────┐   │
│   │ 📅 Reschedule       │   │
│   ├─────────────────────┤   │
│   │ 💬 Send Message     │   │
│   ├─────────────────────┤   │
│   │ ✓ Mark Complete     │   │
│   ├─────────────────────┤   │
│   │ ⚠️ Report Issue     │   │
│   ├─────────────────────┤   │
│   │ ✕ Cancel Exchange   │   │
│   └─────────────────────┘   │
│                             │
│   1.5 TT held in escrow     │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Mark Complete
```
┌─────────────────────────────┐
│ ✕                           │
├─────────────────────────────┤
│                             │
│   Complete Exchange?        │
│                             │
│   Home Cooking Lessons      │
│   with Sarah Mitchell       │
│                             │
│   Was the service           │
│   completed successfully?   │
│                             │
│   ┌─────────────────────┐   │
│   │ ✅ Yes, Complete    │   │
│   │                     │   │
│   │ Tokens will be      │   │
│   │ released to Sarah   │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ ⚠️ No, Issue to     │   │
│   │    Report           │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ ✕ Cancel            │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

### 2.5 Rating & Reputation Flow

#### Flow Diagram
```
[Exchange Completed]
      │
      ▼
[Rate Provider]
      │
      ├───> [Star Rating 1-5]
      │
      ├───> [Category Ratings]
      │       - Communication
      │       - Punctuality
      │       - Quality
      │
      ├───> [Written Review]
      │
      ▼
[Submit Review]
      │
      ▼
[Reputation Updated]
```

#### Wireframe: Rate & Review
```
┌─────────────────────────────┐
│ ← Rate Exchange             │
├─────────────────────────────┤
│                             │
│   How was your experience?  │
│                             │
│   Home Cooking Lessons      │
│   with Sarah Mitchell       │
│                             │
│   ─────────────────────     │
│                             │
│   Overall Rating            │
│                             │
│      ☆ ☆ ☆ ☆ ☆            │
│                             │
│   Tap a star to rate        │
│                             │
│   ─────────────────────     │
│                             │
│   Rate specific areas:      │
│                             │
│   Communication             │
│   ★★★★★ Excellent           │
│                             │
│   Punctuality               │
│   ★★★★☆ Good                │
│                             │
│   Service Quality           │
│   ★★★★★ Excellent           │
│                             │
│   ─────────────────────     │
│                             │
│   Write a review            │
│   (Optional but helpful!)   │
│                             │
│   ┌─────────────────────┐   │
│   │ What went well?     │   │
│   │ What could improve? │   │
│   │                     │   │
│   │                     │   │
│   └─────────────────────┘   │
│   0/500                     │
│                             │
│   ☐ Show my name            │
│   ☑ Post anonymously        │
│                             │
│   ┌─────────────────────┐   │
│   │  Submit Review →    │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Reputation Profile
```
┌─────────────────────────────┐
│ ← Back                      │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │        👤           │   │
│   │                     │   │
│   │   Sarah Mitchell    │   │
│   │   @sarahcooks       │   │
│   │                     │   │
│   │   ⭐ 4.9             │   │
│   │   ───────────────── │   │
│   │   24 exchanges      │   │
│   │   Member 6 months   │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│   Trust Score               │
│   ┌─────────────────────┐   │
│   │ ████████████░░░ 92% │   │
│   │ Verified Member     │   │
│   │ Quick Responder     │   │
│   │ Repeat Preferred    │   │
│   └─────────────────────┘   │
│                             │
│   Categories                │
│   ┌─────────────────────┐   │
│   │ 🍳 Food & Nutrition │   │
│   │ ⭐ 5.0 (18 reviews) │   │
│   ├─────────────────────┤   │
│   │ 🎨 Arts & Crafts    │   │
│   │ ⭐ 4.8 (6 reviews)  │   │
│   └─────────────────────┘   │
│                             │
│   Recent Reviews            │
│   ┌─────────────────────┐   │
│   │ ⭐⭐⭐⭐⭐ Alex C.    │   │
│   │ "Amazing teacher!   │   │
│   │ Learned so much..." │   │
│   │ 2 days ago          │   │
│   ├─────────────────────┤   │
│   │ ⭐⭐⭐⭐⭐ Jamie L.   │   │
│   │ "Delicious meal and │   │
│   │ great company"      │   │
│   │ 1 week ago          │   │
│   └─────────────────────┘   │
│                             │
│   [View all 24 reviews]     │
│                             │
│   ┌─────────────────────┐   │
│   │  📅 Book Service →  │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

### 2.6 Dispute Filing Flow

#### Flow Diagram
```
[Exchange Issue Detected]
      │
      ├───> [Auto-detect: No response]
      │
      ├───> [Auto-detect: Missed appointment]
      │
      └───> [User Reports Issue]
            │
            ▼
      [Dispute Form]
            │
            ├───> [Select Issue Type]
            │
            ├───> [Provide Details]
            │
            ├───> [Evidence Upload]
            │
            ▼
      [Submit Dispute]
            │
            ├───> [Auto-escalation if clear]
            │
            └───> [Mediator Assignment]
```

#### Wireframe: Report Issue
```
┌─────────────────────────────┐
│ ← Report Issue              │
├─────────────────────────────┤
│                             │
│   Exchange #2847            │
│   Home Cooking Lessons      │
│   with Sarah Mitchell       │
│                             │
│   ─────────────────────     │
│                             │
│   What happened? *          │
│                             │
│   ○ Provider didn't show up │
│   ○ Service not as described│
│   ○ Provider unresponsive   │
│   ○ Quality concerns        │
│   ○ Safety concern          │
│   ○ Other                   │
│                             │
│   ─────────────────────     │
│                             │
│   Describe the issue *      │
│   ┌─────────────────────┐   │
│   │ Please provide      │   │
│   │ details about what  │   │
│   │ happened...         │   │
│   │                     │   │
│   └─────────────────────┘   │
│   0/1000                    │
│                             │
│   ─────────────────────     │
│                             │
│   Add Evidence              │
│   ┌─────────────────────┐   │
│   │ 📎 Upload photos    │   │
│   │    or screenshots   │   │
│   └─────────────────────┘   │
│                             │
│   ─────────────────────     │
│                             │
│   What outcome do you seek? │
│                             │
│   ○ Full refund             │
│   ○ Partial refund          │
│   ○ Reschedule exchange     │
│   ○ Just reporting          │
│                             │
│   ┌─────────────────────┐   │
│   │ ⚠️ Submit Dispute   │   │
│   └─────────────────────┘   │
│                             │
│   🔒 Mediator will review   │
│      within 24 hours        │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Dispute Status
```
┌─────────────────────────────┐
│ ← Dispute #D-847            │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │ Status: UNDER       │   │
│   │         REVIEW      │   │
│   │                     │   │
│   │ 🔵 Submitted        │   │
│   │ 🔵 Under Review     │   │
│   │ ⚪ Decision Pending │   │
│   │ ⚪ Resolved         │   │
│   └─────────────────────┘   │
│                             │
│   Exchange #2847            │
│   Home Cooking Lessons      │
│                             │
│   ─────────────────────     │
│                             │
│   Your Report:              │
│   Provider didn't show up   │
│                             │
│   "Waited for 30 minutes    │
│   at the location. Sent     │
│   messages with no          │
│   response."                │
│                             │
│   📎 2 attachments          │
│                             │
│   ─────────────────────     │
│                             │
│   Timeline                  │
│                             │
│   🔵 Mar 7, 2:30 PM         │
│      Dispute filed          │
│                             │
│   🔵 Mar 7, 3:15 PM         │
│      Assigned to mediator   │
│      @community_mod         │
│                             │
│   ⏳ Expected decision:     │
│      Mar 8, 2:30 PM         │
│                             │
│   ─────────────────────     │
│                             │
│   ┌─────────────────────┐   │
│   │ 💬 Message Mediator │   │
│   └─────────────────────┘   │
│                             │
│   [Withdraw Dispute]        │
│                             │
└─────────────────────────────┘
```

---

### 2.7 Governance Voting Flow

#### Flow Diagram
```
[Home] ───> [Governance Tab]
                │
                ├───> [Active Proposals]
                │
                ├───> [Past Proposals]
                │
                └───> [Create Proposal]
                      │
                      ├───> [Proposal Type]
                      ├───> [Draft Proposal]
                      ├───> [Stake Tokens]
                      └───> [Submit]
```

#### Wireframe: Governance Hub
```
┌─────────────────────────────┐
│  Governance                 │
├─────────────────────────────┤
│                             │
│   Your Voting Power         │
│   ┌─────────────────────┐   │
│   │ ⚡ 12 votes         │   │
│   │ (12 TT + 0 bonus)   │   │
│   │                     │   │
│   │ Participation: 85%  │   │
│   └─────────────────────┘   │
│                             │
│   Active Proposals (3)      │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔵 ACTIVE           │   │
│   │                     │   │
│   │ Add "Pet Care"      │   │
│   │ Category            │   │
│   │                     │   │
│   │ Ends in 2 days      │   │
│   │                     │   │
│   │ ✅ 45%  ❌ 12%      │   │
│   │ ⚪ 43% (not voted)  │   │
│   │                     │   │
│   │ [Cast Vote →]       │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔵 ACTIVE           │   │
│   │                     │   │
│   │ Increase dispute    │   │
│   │ window to 48hrs     │   │
│   │                     │   │
│   │ Ends in 5 days      │   │
│   │ ✅ Voted FOR        │   │
│   └─────────────────────┘   │
│                             │
│   Recent Decisions          │
│   ┌─────────────────────┐   │
│   │ ✅ PASSED           │   │
│   │ New member bonus:   │   │
│   │ 2 TT                │   │
│   │ Mar 1, 2025         │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ + Create Proposal   │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Cast Vote
```
┌─────────────────────────────┐
│ ← Cast Vote                 │
├─────────────────────────────┤
│                             │
│   Proposal #124             │
│   Add "Pet Care" Category   │
│                             │
│   ─────────────────────     │
│                             │
│   Description:              │
│   "Many members have        │
│   requested a dedicated     │
│   category for pet          │
│   services including        │
│   dog walking, pet          │
│   sitting, and grooming.    │
│   This proposal would..."   │
│                             │
│   [Read full proposal]      │
│                             │
│   ─────────────────────     │
│                             │
│   Proposed by: @animalover  │
│   Voting ends: Mar 9, 2025  │
│                             │
│   Current Results:          │
│   ┌─────────────────────┐   │
│   │ ✅ FOR: 45%         │   │
│   │ ████████████░░░░░░░ │   │
│   │                     │   │
│   │ ❌ AGAINST: 12%     │   │
│   │ ███░░░░░░░░░░░░░░░░ │   │
│   │                     │   │
│   │ ⚪ NOT VOTED: 43%   │   │
│   │ ███████████░░░░░░░░ │   │
│   └─────────────────────┘   │
│   128 votes cast            │
│                             │
│   ─────────────────────     │
│                             │
│   Your Vote (12 votes)      │
│                             │
│   ┌─────────────────────┐   │
│   │ ✅ Vote FOR         │   │
│   │                     │   │
│   │ Add this category   │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ ❌ Vote AGAINST     │   │
│   │                     │   │
│   │ Don't add this      │   │
│   └─────────────────────┘   │
│                             │
│   You can change your vote  │
│   until the proposal ends   │
│                             │
└─────────────────────────────┘
```

#### Wireframe: Create Proposal
```
┌─────────────────────────────┐
│ ← Create Proposal           │
├─────────────────────────────┤
│                             │
│   Proposal Type *           │
│   ┌─────────────────────┐   │
│   │ Select type...    ▼ │   │
│   └─────────────────────┘   │
│                             │
│   Types:                    │
│   • Category Addition       │
│   • Policy Change           │
│   • Parameter Update        │
│   • Treasury Allocation     │
│                             │
│   ─────────────────────     │
│                             │
│   Title *                   │
│   ┌─────────────────────┐   │
│   │ Brief, clear title  │   │
│   └─────────────────────┘   │
│                             │
│   Description *             │
│   ┌─────────────────────┐   │
│   │ Explain what, why,  │   │
│   │ and expected        │   │
│   │ outcomes...         │   │
│   │                     │   │
│   │                     │   │
│   └─────────────────────┘   │
│   0/2000                    │
│                             │
│   ─────────────────────     │
│                             │
│   Stake Required: 5 TT      │
│   Your balance: 12 TT       │
│                             │
│   Stake returned if:        │
│   • Proposal passes, OR     │
│   • Receives >10% votes     │
│                             │
│   ⚠️ Lost if spam/abuse     │
│                             │
│   ┌─────────────────────┐   │
│   │  Stake & Submit →   │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

## 3. State Transitions

### 3.1 Exchange State Machine
```
┌──────────┐    Request      ┌──────────┐
│  IDLE    │ ──────────────> │ PENDING  │
└──────────┘                 └────┬─────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌─────────┐   ┌─────────┐   ┌──────────┐
              │DECLINED │   │CANCELLED│   │ACCEPTED  │
              │(refund) │   │(refund) │   │(escrow)  │
              └─────────┘   └─────────┘   └────┬─────┘
                                               │
                                               ▼
                                         ┌──────────┐
                                         │SCHEDULED │
                                         └────┬─────┘
                                              │
                    ┌─────────────────────────┼──────────────────────┐
                    │                         │                      │
                    ▼                         ▼                      ▼
              ┌──────────┐            ┌───────────┐           ┌──────────┐
              │COMPLETED │            │  DISPUTE  │           │CANCELLED │
              │(release) │            │(mediation)│           │(refund)  │
              └────┬─────┘            └─────┬─────┘           └──────────┘
                   │                         │
                   ▼                         ▼
              ┌──────────┐            ┌───────────┐
              │  RATED   │            │RESOLVED   │
              └──────────┘            └───────────┘
```

### 3.2 Dispute State Machine
```
┌─────────────┐    File      ┌─────────────┐
│   NONE      │ ───────────> │   OPEN      │
└─────────────┘              └──────┬──────┘
                                    │
          ┌─────────────────────────┼─────────────────────┐
          │                         │                     │
          ▼                         ▼                     ▼
   ┌────────────┐           ┌─────────────┐        ┌────────────┐
   │  WITHDRAWN │           │ UNDER_REVIEW│        │  AUTO      │
   │            │           │             │        │  RESOLVED  │
   └────────────┘           └──────┬──────┘        └────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
             ┌──────────┐  ┌──────────┐  ┌──────────────┐
             │ MEDIATION│  │ MEDIATION│  │  RESOLVED    │
             │ REQUESTER│  │ PROVIDER │  │  (decision)  │
             │   WINS   │  │   WINS   │  │              │
             └──────────┘  └──────────┘  └──────────────┘
```

### 3.3 Proposal State Machine
```
┌──────────┐    Submit     ┌──────────┐
│  DRAFT   │ ─────────────>│ PENDING  │
└──────────┘               └────┬─────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
       ┌──────────┐      ┌──────────┐      ┌──────────┐
       │ CANCELLED│      │  ACTIVE  │      │  FAILED  │
       │          │      │ (voting) │      │ (quorum) │
       └──────────┘      └────┬─────┘      └──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │  PASSED  │    │  REJECTED│    │  EXPIRED │
       │(executed)│    │          │    │          │
       └──────────┘    └──────────┘    └──────────┘
```

---

## 4. Error Handling

### 4.1 Error Categories

| Category | Examples | Handling Strategy |
|----------|----------|-------------------|
| **Network** | Connection lost, timeout | Retry with exponential backoff, offline mode |
| **Wallet** | Rejected tx, insufficient gas | Clear explanation, manual retry option |
| **Validation** | Invalid input, missing fields | Inline validation, real-time feedback |
| **Business Logic** | Insufficient tokens, double booking | Contextual messages, alternative suggestions |
| **System** | Server error, contract revert | Graceful degradation, support contact |

### 4.2 Error States & Recovery

#### Network Error
```
┌─────────────────────────────┐
│                             │
│   ┌─────────────────────┐   │
│   │      ⚠️             │   │
│   │                     │   │
│   │  Connection Lost    │   │
│   │                     │   │
│   │  Check your         │   │
│   │  internet and       │   │
│   │  try again          │   │
│   │                     │   │
│   │  [Retry]            │   │
│   │                     │   │
│   │  Working offline    │   │
│   │  Some features      │   │
│   │  unavailable        │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Wallet Transaction Failed
```
┌─────────────────────────────┐
│ ✕                           │
├─────────────────────────────┤
│                             │
│   Transaction Failed        │
│                             │
│   Could not complete the    │
│   request.                  │
│                             │
│   Reason:                   │
│   "User rejected in wallet" │
│                             │
│   Your tokens are safe.     │
│   No changes were made.     │
│                             │
│   ┌─────────────────────┐   │
│   │    Try Again        │   │
│   └─────────────────────┘   │
│                             │
│   [Why did this happen?]    │
│                             │
└─────────────────────────────┘
```

#### Insufficient Balance
```
┌─────────────────────────────┐
│ ✕                           │
├─────────────────────────────┤
│                             │
│   Insufficient TimeTokens   │
│                             │
│   Service requires: 2.0 TT  │
│   Your balance: 0.5 TT      │
│                             │
│   ─────────────────────     │
│                             │
│   Ways to earn more:        │
│                             │
│   • Offer a service         │
│   • Complete pending        │
│     exchange                │
│   • Welcome bonus (1x only) │
│                             │
│   ┌─────────────────────┐   │
│   │  Offer a Service →  │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

#### Double Booking Prevention
```
┌─────────────────────────────┐
│ ✕                           │
├─────────────────────────────┤
│                             │
│   Time Slot Unavailable     │
│                             │
│   Someone just booked this  │
│   slot.                     │
│                             │
│   Requested:                │
│   Tue, Mar 11 at 2:00 PM    │
│                             │
│   ─────────────────────     │
│                             │
│   Nearby availability:      │
│                             │
│   ┌─────────────────────┐   │
│   │ Tue 3:00 PM  ✓      │   │
│   ├─────────────────────┤   │
│   │ Wed 10:00 AM ✓      │   │
│   ├─────────────────────┤   │
│   │ Wed 2:00 PM  ✓      │   │
│   └─────────────────────┘   │
│                             │
│   [View full calendar]      │
│                             │
└─────────────────────────────┘
```

#### Validation Errors (Inline)
```
┌─────────────────────────────┐
│                             │
│   Display Name *            │
│   ┌─────────────────────┐   │
│   │ A                   │   │
│   └─────────────────────┘   │
│   ⚠️ Must be at least 2     │
│      characters             │
│                             │
│   Username *                │
│   ┌─────────────────────┐   │
│   │ @alex-creates       │   │
│   └─────────────────────┘   │
│   ❌ Can only contain       │
│      letters, numbers,      │
│      and underscores        │
│                             │
│   Email                     │
│   ┌─────────────────────┐   │
│   │ alex@example.com    │   │
│   └─────────────────────┘   │
│   ✅ Valid                  │
│                             │
└─────────────────────────────┘
```

---

## 5. Mobile-First Responsive Breakpoints

### 5.1 Breakpoint Strategy
```
Mobile:     0 - 639px    (Default, single column)
Tablet:     640 - 1023px (Expanded cards, 2-column grid)
Desktop:    1024px+      (Sidebar nav, 3-column grid)
```

### 5.2 Key Responsive Adaptations

#### Navigation
- **Mobile**: Bottom tab bar (Home, Browse, Messages, Profile)
- **Tablet**: Bottom tab bar + floating action button
- **Desktop**: Left sidebar + top header

#### Cards & Lists
- **Mobile**: Full-width cards, stacked layout
- **Tablet**: 2-column grid for browse
- **Desktop**: 3-column grid for browse, expanded detail view

#### Forms
- **Mobile**: Full-width inputs, bottom sheet for selectors
- **Desktop**: Side-by-side fields where appropriate, modal dialogs

---

## 6. Accessibility Requirements

### 6.1 Standards
- WCAG 2.1 AA compliance
- Touch targets minimum 44x44dp
- Color contrast ratio 4.5:1 minimum
- Screen reader optimized labels

### 6.2 Key Considerations
- All icons have text labels or aria-labels
- Focus states visible for keyboard navigation
- Form errors announced to screen readers
- Reduced motion support for animations
- Support for system font size settings

---

## 7. Animations & Interactions

### 7.1 Micro-interactions
| Action | Animation | Duration |
|--------|-----------|----------|
| Button press | Scale 0.95 | 100ms |
| Card tap | Elevation increase | 150ms |
| Page transition | Slide from right | 200ms |
| Success state | Checkmark + pulse | 300ms |
| Loading | Skeleton shimmer | Infinite |
| Toast | Slide down + fade | 300ms |

### 7.2 Loading States
```
┌─────────────────────────────┐
│                             │
│   ┌─────────────────────┐   │
│   │ ░░░░░░░░░░░░░░░░░░░ │   │ ← Skeleton
│   │ ░░░░░░░░░░░░░░░░░░░ │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ ░░░░░░░░░░░░░░░░░░░ │   │
│   │ ░░░░░░░░░░░░░░░░░░░ │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ ░░░░░░░░░░░░░░░░░░░ │   │
│   │ ░░░░░░░░░░░░░░░░░░░ │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

## 8. Notification Strategy

### 8.1 Notification Types

| Type | Channel | Trigger |
|------|---------|---------|
| Push | Mobile | Request received, message, reminder |
| In-app | Badge + Toast | All state changes |
| Email | Optional | Weekly digest, important updates |
| SMS | Optional | Appointment reminders |

### 8.2 Toast Examples
```
┌─────────────────────────────┐
│ ┌───────────────────────┐   │
│ │ ✅ Request sent!      │   │
│ │ Sarah has 24hrs to    │   │
│ │ respond               │ × │
│ └───────────────────────┘   │
├─────────────────────────────┤
│                             │
│     [Main Content]          │
│                             │
└─────────────────────────────┘
```

```
┌─────────────────────────────┐
│ ┌───────────────────────┐   │
│ │ 🎉 +2.0 TT earned!    │   │
│ │ "Web Design" exchange │   │
│ │ completed             │ × │
│ └───────────────────────┘   │
├─────────────────────────────┤
│                             │
│     [Main Content]          │
│                             │
└─────────────────────────────┘
```

---

## 9. Key Metrics & Success Indicators

### 9.1 Onboarding Funnel
- Welcome → How It Works: 90%
- How It Works → Wallet: 75%
- Wallet → Profile: 60%
- Profile → Skills: 55%
- Skills → Complete: 50%

### 9.2 Core Actions
- Time to first service offer: <5 minutes
- Time to first request: <3 minutes
- Exchange completion rate: >80%
- Dispute rate: <5%
- 30-day retention: >40%

---

## 10. Implementation Notes

### 10.1 Tech Stack Recommendations
- **Framework**: React/Vue with PWA capabilities
- **State Management**: Zustand/Pinia
- **Wallet**: wagmi/viem for EVM compatibility
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion / Vue transitions
- **Icons**: Lucide (consistent, accessible)

### 10.2 Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90
- Bundle size: <200KB initial

---

## Appendix: User Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        ONBOARDING                           │
│  Welcome → Tutorial → Wallet → Profile → Skills → Home      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ OFFER SERVICE │    │ BROWSE        │    │ GOVERNANCE    │
│               │    │ SERVICES      │    │               │
│ Create →      │    │               │    │ View →        │
│ Preview →     │    │ Search →      │    │ Vote →        │
│ Publish       │    │ Select →      │    │ Create        │
│               │    │ Request       │    │               │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
                             ▼
                    ┌───────────────┐
                    │ EXCHANGE      │
                    │               │
                    │ Accept →      │
                    │ Schedule →    │
                    │ Complete →    │
                    │ Rate          │
│                   └───────┬───────┘
│                           │
│              ┌────────────┴────────────┐
│              │                         │
│              ▼                         ▼
│     ┌───────────────┐        ┌───────────────┐
│     │ DISPUTE       │        │ REPUTATION    │
│     │               │        │               │
│     │ Report →      │        │ Profile →     │
│     │ Mediate →     │        │ History →     │
│     │ Resolve       │        │ Reviews       │
│     └───────────────┘        └───────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*  
*Last Updated: 2025-03-07*  
*Next Review: Post-MVP testing results*
