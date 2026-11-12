<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus 3D Building Navigator | Find Rooms & Class Schedule</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#ecfeff',
              100: '#cffafe',
              400: '#22d3ee',
              500: '#06b6d4',
              600: '#0891b2',
              700: '#0e7490',
              900: '#164e63',
            }
          }
        }
      }
    }
  </script>

  <!-- Font Awesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- Custom Styles -->
  <link rel="stylesheet" href="css/style.css?v=<?= time() ?>">

  <!-- Inline Theme Overrides to guarantee instant Light/Dark mode changes across all browsers -->
  <style id="theme-system-inline">
    html.light-theme body,
    body.light-theme {
      background-color: #f1f5f9 !important;
      color: #0f172a !important;
    }

    /* 3D Canvas Viewport in Light Mode */
    html.light-theme main,
    body.light-theme main,
    html.light-theme #webgl-container,
    body.light-theme #webgl-container {
      background-color: #f1f5f9 !important;
    }

    /* Top App Header */
    html.light-theme header,
    body.light-theme header {
      background-color: rgba(255, 255, 255, 0.98) !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
    }
    html.light-theme header h1,
    body.light-theme header h1 {
      color: #0f172a !important;
    }
    html.light-theme header button,
    body.light-theme header button,
    html.light-theme header .bg-slate-800,
    body.light-theme header .bg-slate-800 {
      background-color: #f1f5f9 !important;
      color: #334155 !important;
      border-color: #cbd5e1 !important;
    }
    html.light-theme header button:hover,
    body.light-theme header button:hover {
      background-color: #e2e8f0 !important;
      color: #0f172a !important;
    }

    /* Left Sidebar */
    html.light-theme #sidebar-panel,
    body.light-theme #sidebar-panel {
      background-color: rgba(255, 255, 255, 0.98) !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07) !important;
    }

    /* Override all dark background utility classes */
    html.light-theme .bg-slate-950,
    body.light-theme .bg-slate-950,
    html.light-theme .bg-slate-950\/95,
    body.light-theme .bg-slate-950\/95,
    html.light-theme .bg-slate-950\/80,
    body.light-theme .bg-slate-950\/80,
    html.light-theme .bg-slate-950\/70,
    body.light-theme .bg-slate-950\/70,
    html.light-theme .bg-slate-950\/60,
    body.light-theme .bg-slate-950\/60,
    html.light-theme .bg-slate-950\/50,
    body.light-theme .bg-slate-950\/50,
    html.light-theme .bg-slate-950\/40,
    body.light-theme .bg-slate-950\/40,
    html.light-theme .lg\:bg-slate-950\/80,
    body.light-theme .lg\:bg-slate-950\/80 {
      background-color: #f8fafc !important;
    }

    html.light-theme .bg-slate-900,
    body.light-theme .bg-slate-900,
    html.light-theme .bg-slate-900\/95,
    body.light-theme .bg-slate-900\/95,
    html.light-theme .bg-slate-900\/90,
    body.light-theme .bg-slate-900\/90,
    html.light-theme .bg-slate-900\/80,
    body.light-theme .bg-slate-900\/80,
    html.light-theme .bg-slate-900\/60,
    body.light-theme .bg-slate-900\/60,
    html.light-theme .bg-slate-900\/40,
    body.light-theme .bg-slate-900\/40 {
      background-color: #ffffff !important;
    }

    html.light-theme .bg-slate-800,
    body.light-theme .bg-slate-800,
    html.light-theme .bg-slate-800\/90,
    body.light-theme .bg-slate-800\/90,
    html.light-theme .bg-slate-800\/80,
    body.light-theme .bg-slate-800\/80 {
      background-color: #f1f5f9 !important;
      color: #334155 !important;
    }

    /* All dark borders -> clean light borders */
    html.light-theme .border-slate-800,
    body.light-theme .border-slate-800,
    html.light-theme .border-slate-800\/80,
    body.light-theme .border-slate-800\/80,
    html.light-theme .border-slate-800\/60,
    body.light-theme .border-slate-800\/60,
    html.light-theme .border-slate-700,
    body.light-theme .border-slate-700,
    html.light-theme .border-slate-700\/80,
    body.light-theme .border-slate-700\/80 {
      border-color: #e2e8f0 !important;
    }

    /* Text contrast */
    html.light-theme .text-white,
    body.light-theme .text-white {
      color: #0f172a !important;
    }
    html.light-theme .text-slate-100,
    body.light-theme .text-slate-100,
    html.light-theme .text-slate-200,
    body.light-theme .text-slate-200 {
      color: #1e293b !important;
    }
    html.light-theme .text-slate-300,
    body.light-theme .text-slate-300 {
      color: #334155 !important;
    }
    html.light-theme .text-slate-400,
    body.light-theme .text-slate-400 {
      color: #64748b !important;
    }
    html.light-theme .text-slate-500,
    body.light-theme .text-slate-500 {
      color: #94a3b8 !important;
    }

    /* Cards */
    html.light-theme .room-card,
    body.light-theme .room-card {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
    }
    html.light-theme .room-card:hover,
    body.light-theme .room-card:hover {
      background-color: #f8fafc !important;
      border-color: #06b6d4 !important;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.12) !important;
    }

    /* Filter pills & buttons */
    html.light-theme .category-filter-btn,
    body.light-theme .category-filter-btn {
      background: #f1f5f9 !important;
      color: #475569 !important;
      border-color: #cbd5e1 !important;
    }
    html.light-theme .category-filter-btn:hover,
    body.light-theme .category-filter-btn:hover {
      background: #e2e8f0 !important;
      color: #0f172a !important;
    }
    html.light-theme .category-filter-btn.filter-active,
    body.light-theme .category-filter-btn.filter-active {
      background: #0284c7 !important;
      color: #ffffff !important;
      border-color: #0284c7 !important;
    }

    /* Tabs */
    html.light-theme .tab-inactive,
    body.light-theme .tab-inactive {
      color: #64748b !important;
    }
    html.light-theme .tab-inactive:hover,
    body.light-theme .tab-inactive:hover {
      color: #0f172a !important;
      background: #f1f5f9 !important;
    }
    html.light-theme .tab-active,
    body.light-theme .tab-active {
      color: #0284c7 !important;
      background: #ffffff !important;
    }

    /* Inputs */
    html.light-theme #room-search-input,
    body.light-theme #room-search-input,
    html.light-theme #schedule-program-select,
    body.light-theme #schedule-program-select {
      background-color: #f8fafc !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }

    /* 3D HUD */
    html.light-theme .glass-hud,
    body.light-theme .glass-hud {
      background: rgba(255, 255, 255, 0.95) !important;
      border-color: #cbd5e1 !important;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08) !important;
      color: #0f172a !important;
    }
    html.light-theme .hud-floor-btn,
    body.light-theme .hud-floor-btn {
      background: #f8fafc !important;
      color: #475569 !important;
      border-color: #cbd5e1 !important;
    }
    html.light-theme .hud-floor-btn:hover,
    body.light-theme .hud-floor-btn:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }
    html.light-theme .hud-floor-active,
    body.light-theme .hud-floor-active {
      background: #0284c7 !important;
      color: #ffffff !important;
      border-color: #0284c7 !important;
    }
    html.light-theme .hud-view-btn,
    body.light-theme .hud-view-btn {
      color: #475569 !important;
    }
    html.light-theme .hud-view-btn:hover,
    body.light-theme .hud-view-btn:hover {
      color: #0f172a !important;
      background: #f1f5f9 !important;
    }

    /* Floating Room Modal Dynamic Theme (Clean Solid Surfaces, No Gradients) */
    #room-modal-card {
      background-color: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    #room-modal-card #room-modal-content {
      background-color: #0f172a;
      color: #f1f5f9;
    }
    html.light-theme #room-modal-card,
    body.light-theme #room-modal-card {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      color: #0f172a !important;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.14) !important;
    }
    html.light-theme #room-modal-card #room-modal-content,
    body.light-theme #room-modal-card #room-modal-content {
      background-color: #ffffff !important;
      color: #0f172a !important;
    }
    html.light-theme #close-room-modal,
    body.light-theme #close-room-modal {
      background-color: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #64748b !important;
    }
    html.light-theme #close-room-modal:hover,
    body.light-theme #close-room-modal:hover {
      background-color: #e2e8f0 !important;
      color: #0f172a !important;
    }
    html.light-theme #inspector-toast,
    body.light-theme #inspector-toast {
      background-color: #ffffff !important;
      border-color: #06b6d4 !important;
      color: #0f172a !important;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1) !important;
    }
  </style>

  <!-- Three.js & Loaders -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
</head>
<body class="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">

  <!-- Top App Navigation Bar -->
  <header class="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 lg:px-6 flex items-center justify-between z-30 shrink-0">
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
      <!-- Mobile / Desktop Sidebar Drawer Toggle Button (Top-Left Menu) -->
      <button id="toggle-sidebar-mobile" class="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 cursor-pointer text-xs font-semibold border border-slate-700 transition shadow-sm" title="Toggle Directory & Schedules Panel">
        <i class="fa-solid fa-bars text-base text-cyan-400"></i>
        <span class="hidden sm:inline font-bold">Directory</span>
      </button>

      <!-- Campus Logo & Building Badge -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-base sm:text-lg shrink-0">
          <i class="fa-solid fa-cubes"></i>
        </div>
        <div class="min-w-0">
          <h1 class="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white truncate">
            <span class="hidden sm:inline">CCS New Building Navigation</span>
            <span class="sm:hidden">CCS 3D Map</span>
          </h1>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Highlights (Desktop) -->
    <div class="hidden md:flex items-center gap-2 text-xs font-semibold">
      <span class="text-slate-400">Quick Destination:</span>
     
      <button onclick="handleRoomClick('octa-office')" class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer">
        Octa Office
      </button>
      <button onclick="handleRoomClick('deans-office')" class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition cursor-pointer">
        Dean's Office
      </button>
      <button onclick="handleRoomClick('faculty-lounge')" class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition cursor-pointer">
        Faculty Room
      </button>
      <button onclick="handleRoomClick('accreditation-room')" class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition cursor-pointer">
        Accreditation
      </button>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
      <!-- Room Coordinate Picker Tool -->
      <button id="btn-toggle-inspector" 
              class="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Room Coordinate Picker: Tap anywhere on 3D building to copy coordinates">
        <i class="fa-solid fa-crosshairs text-cyan-400"></i>
        <span class="hidden sm:inline">Pick Room Coords</span>
      </button>

      <!-- Light / Dark Mode Toggle Button -->
      <button id="btn-toggle-theme" 
              onclick="if(window.toggleTheme) window.toggleTheme();"
              class="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Toggle Light / Dark Mode">
        <i id="theme-toggle-icon" class="fa-solid fa-moon text-xs"></i>
        <span id="theme-toggle-text" class="hidden sm:inline">Theme</span>
      </button>

      <!-- Campus Map Help & Touch Controls -->
      <button onclick="showAppHelp()"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
              title="Help & Camera Navigation Controls">
        <i class="fa-solid fa-circle-question"></i>
      </button>
    </div>
  </header>

  <!-- Main Workspace Area (Unified Shared Space for 3D Building & Floating Cards) -->
  <div class="flex-1 relative overflow-hidden w-full h-full">

    <!-- Full-Space 3D Canvas Viewport (Spans entire screen) -->
    <main class="absolute inset-0 w-full h-full bg-slate-950 overflow-hidden">
      
      <!-- Three.js Canvas Container -->
      <div id="webgl-container" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

      <!-- Room Inspector Floating Toast (Responsive for mobile & desktop) -->
      <div id="inspector-toast" class="hidden fixed sm:absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-cyan-500 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3 text-xs shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 w-[92%] sm:w-auto max-w-md animate-in fade-in slide-in-from-top-4 duration-150">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs sm:text-sm">
            <i class="fa-solid fa-location-crosshairs"></i>
          </div>
          <div class="min-w-0">
            <span class="text-cyan-400 font-bold block text-[10px] sm:text-[11px] uppercase tracking-wider truncate">Coords Picked:</span>
            <code id="inspector-coords" class="text-white font-mono text-[11px] sm:text-xs select-all bg-slate-950 px-2 py-0.5 rounded border border-slate-800 block truncate">Tap room to pick coords</code>
            <span id="inspector-mesh-name" class="text-slate-400 text-[10px] block mt-0.5 font-mono truncate">Mesh: -</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button id="inspector-copy-btn" class="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] sm:text-[11px] shadow transition cursor-pointer">
            Copy
          </button>
          <button id="inspector-close-btn" class="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer text-xs" title="Close Toast">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Loading / Progress Indicator (for custom GLTF) -->
      <div id="model-loading-indicator" class="hidden absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center z-50">
        <div class="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-sm font-bold text-white">Loading 3D Model...</p>
        <span id="model-load-progress" class="text-xs text-cyan-400 font-mono mt-1">0%</span>
      </div>

      <!-- Floating Top HUD: View Presets & Controls -->
      <div class="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div class="glass-hud rounded-xl p-1.5 flex items-center gap-1 shadow-xl">
          <!-- Grid Lines Toggle Option -->
          <button id="btn-toggle-grid" 
                  class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                  title="Toggle Architectural Background Grid Lines (On / Off)">
            <i class="fa-solid fa-border-all text-cyan-400" id="grid-toggle-icon"></i>
            <span id="grid-toggle-text">Grid</span>
          </button>

          <button class="hud-view-btn px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  data-view="reset" title="Reset Camera">
            <i class="fa-solid fa-rotate-left mr-1"></i>Reset
          </button>
        </div>
      </div>

      <!-- Floating Right HUD: Floor Level Isolation -->
      <div class="absolute right-4 top-20 z-10 flex flex-col gap-1.5">
        <div class="glass-hud rounded-xl p-1.5 flex flex-col gap-1 shadow-xl">
          <div class="text-[10px] font-bold text-slate-400 uppercase text-center px-1 py-0.5 border-b border-slate-800 mb-0.5">
            Floors
          </div>
          <button class="hud-floor-btn hud-floor-active px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  data-floor="all" title="View All Floors (Full Opacity)">
            ALL
          </button>
          <button class="hud-floor-btn px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  data-floor="3" title="3rd Floor: Lec 9 to 13 (High Opacity)">
            L3
          </button>
          <button class="hud-floor-btn px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  data-floor="2" title="2nd Floor: Lec 4 to 8 (High Opacity)">
            L2
          </button>
          <button class="hud-floor-btn px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  data-floor="1" title="Ground Floor: Dean, Faculty, Accreditation, Lec 2-3 (High Opacity)">
            L1
          </button>
        </div>
      </div>

      <!-- Floating Bottom HUD: Campus Legend (Responsive for mobile & desktop) -->
      <div class="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-10 flex items-center justify-center sm:justify-end gap-3 pointer-events-none">
        <div class="glass-hud rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2.5 sm:gap-4 text-[10px] sm:text-xs shadow-xl pointer-events-auto overflow-x-auto max-w-[calc(100vw-24px)]">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span class="text-slate-300">Lectures</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span class="text-slate-300">Dean / Admin</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span class="text-slate-300">Faculty</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-slate-300">Labs & Amenities</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Sidebar Backdrop (Click away dismiss) -->
    <div id="sidebar-backdrop" class="hidden fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30 transition-opacity"></div>

    <!-- Floating Cards Panel: Directory, Search & Schedules (Shares same space as 3D canvas) -->
    <aside id="sidebar-panel" 
           class="w-full sm:w-[380px] lg:w-[410px] h-full sm:h-[calc(100%-24px)] flex flex-col border border-slate-800/80 bg-slate-950/95 sm:bg-slate-950/90 backdrop-blur-2xl z-40 transition-transform duration-300 absolute left-0 sm:left-3 top-0 sm:top-3 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden transform -translate-x-full">
      
      <!-- Panel Header Bar (Available across all screen sizes) -->
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 shrink-0">
        <span class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-compass text-cyan-400"></i> Campus Navigation
        </span>
        <button id="close-sidebar" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
          <i class="fa-solid fa-xmark"></i> Close
        </button>
      </div>

      <!-- Tabs Switcher -->
      <div class="flex border-b border-slate-800 bg-slate-900/60 shrink-0">
        <button id="tab-btn-directory" 
                class="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 tab-active transition-colors">
          <i class="fa-solid fa-list-check"></i>
          <span>Directory & Search</span>
        </button>
        <button id="tab-btn-schedule" 
                class="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 tab-inactive transition-colors">
          <i class="fa-solid fa-calendar-days text-cyan-400"></i>
          <span>Where Do I Go?</span>
        </button>
      </div>

      <!-- Tab View 1: Directory & Room Search -->
      <div id="view-directory" class="flex-1 flex flex-col overflow-hidden">
        <!-- Search & Filter Controls -->
        <div class="p-4 border-b border-slate-800/80 space-y-2.5 shrink-0">
          <!-- Search Input -->
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="text" 
                   id="room-search-input" 
                   placeholder="Search room (e.g. Lec 2, Dean's Office, Faculty...)" 
                   class="w-full pl-9 pr-14 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition">
            <button id="clear-search-btn" class="hidden absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <kbd class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
              /
            </kbd>
          </div>

          <!-- Quick Destination Chips (Available on mobile & desktop) -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-semibold no-scrollbar">
            <span class="text-[10px] uppercase font-bold text-slate-500 shrink-0">Quick:</span>
            <button onclick="handleRoomClick('octa-office')" class="px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 shrink-0 text-[11px] transition cursor-pointer">Octa Office</button>
            <button onclick="handleRoomClick('deans-office')" class="px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-rose-300 border border-slate-700/80 shrink-0 text-[11px] transition cursor-pointer">Dean's Office</button>
            <button onclick="handleRoomClick('faculty-lounge')" class="px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-purple-300 border border-slate-700/80 shrink-0 text-[11px] transition cursor-pointer">Faculty Room</button>
            <button onclick="handleRoomClick('accreditation-room')" class="px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-slate-700/80 shrink-0 text-[11px] transition cursor-pointer">Accreditation</button>
          </div>

          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold no-scrollbar">
            <button class="category-filter-btn filter-active px-3 py-1 rounded-full shrink-0" data-category="all">
              All
            </button>
            <button class="category-filter-btn px-3 py-1 rounded-full shrink-0" data-category="lecture">
              <i class="fa-solid fa-chalkboard-user mr-1 text-[10px]"></i>Lectures
            </button>
            <button class="category-filter-btn px-3 py-1 rounded-full shrink-0" data-category="office">
              <i class="fa-solid fa-briefcase mr-1 text-[10px]"></i>Offices
            </button>
            <button class="category-filter-btn px-3 py-1 rounded-full shrink-0" data-category="faculty">
              <i class="fa-solid fa-user-tie mr-1 text-[10px]"></i>Faculty
            </button>
            <button class="category-filter-btn px-3 py-1 rounded-full shrink-0" data-category="amenity">
              <i class="fa-solid fa-restroom mr-1 text-[10px]"></i>Amenities
            </button>
            <button class="category-filter-btn px-3 py-1 rounded-full shrink-0" data-category="lab">
              <i class="fa-solid fa-flask mr-1 text-[10px]"></i>Labs
            </button>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <span id="rooms-count-badge" class="font-medium">Loading locations...</span>
            <span class="text-[11px] text-slate-500">Tap card to pinpoint</span>
          </div>
        </div>

        <!-- Room Cards List -->
        <div id="rooms-list-container" class="flex-1 overflow-y-auto p-4 space-y-2.5">
          <!-- Populated dynamically by app.js -->
        </div>

        <!-- Mobile Return to 3D Button -->
        <div class="lg:hidden p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <button id="btn-view-map-mobile-1" class="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer">
            <i class="fa-solid fa-cube"></i> View 3D Building Map
          </button>
        </div>
      </div>

      <!-- Tab View 2: Student Schedule Finder ("Where Do I Go?") -->
      <div id="view-schedule" class="flex-1 flex flex-col overflow-hidden hidden">
        <div class="p-4 border-b border-slate-800/80 space-y-3 shrink-0 bg-slate-900/40">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Student Program / Block
            </label>
            <select id="schedule-program-select" 
                    class="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400">
              <optgroup label="1st Year (Core IT)">
                <option value="bsit-1a" selected>BSIT 1-A (Year 1 - Block A)</option>
                <option value="bsit-1b">BSIT 1-B (Year 1 - Block B)</option>
                <option value="bsit-1c">BSIT 1-C (Year 1 - Block C)</option>
              </optgroup>
              <optgroup label="2nd Year (Core IT)">
                <option value="bsit-2a">BSIT 2-A (Year 2 - Block A)</option>
                <option value="bsit-2b">BSIT 2-B (Year 2 - Block B)</option>
                <option value="bsit-2c">BSIT 2-C (Year 2 - Block C)</option>
              </optgroup>
              <optgroup label="3rd Year (Web & Mobile App Dev - WMAD)">
                <option value="bsit-3-wmad-1">BSIT 3 WMAD 1</option>
                <option value="bsit-3-wmad-2">BSIT 3 WMAD 2</option>
                <option value="bsit-3-wmad-3">BSIT 3 WMAD 3</option>
              </optgroup>
              <optgroup label="3rd Year (Service Management Program - SMP)">
                <option value="bsit-3-smp-1">BSIT 3 SMP 1</option>
                <option value="bsit-3-smp-2">BSIT 3 SMP 2</option>
              </optgroup>
              <optgroup label="4th Year (Web & Mobile App Dev - WMAD)">
                <option value="bsit-4-wmad-1">BSIT 4 WMAD 1</option>
                <option value="bsit-4-wmad-2">BSIT 4 WMAD 2</option>
                <option value="bsit-4-wmad-3">BSIT 4 WMAD 3</option>
              </optgroup>
              <optgroup label="4th Year (Service Management Program - SMP)">
                <option value="bsit-4-smp-1">BSIT 4 SMP 1</option>
                <option value="bsit-4-smp-2">BSIT 4 SMP 2</option>
              </optgroup>
            </select>
          </div>

          <!-- Day of the Week Pills -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Class Day</label>
              <button id="schedule-now-btn" class="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <i class="fa-solid fa-clock-rotate-left"></i> Set to Current Time
              </button>
            </div>
            <div class="grid grid-cols-5 gap-1 text-[11px]">
              <button class="schedule-day-btn day-active py-1.5 rounded-lg text-center" data-day="Monday">Mon</button>
              <button class="schedule-day-btn py-1.5 rounded-lg text-center" data-day="Tuesday">Tue</button>
              <button class="schedule-day-btn py-1.5 rounded-lg text-center" data-day="Wednesday">Wed</button>
              <button class="schedule-day-btn py-1.5 rounded-lg text-center" data-day="Thursday">Thu</button>
              <button class="schedule-day-btn py-1.5 rounded-lg text-center" data-day="Friday">Fri</button>
            </div>
          </div>

          <!-- Simulated Time Scrubber -->
          <div class="pt-1">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-slate-400 font-medium">Class Time Simulator:</span>
              <span id="schedule-time-display" class="font-mono font-bold text-cyan-400 text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                10:00 AM
              </span>
            </div>
            <input type="range" id="schedule-time-slider" min="450" max="1140" step="15" value="600" class="w-full">
            <div class="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>07:30 AM</span>
              <span>12:00 PM</span>
              <span>07:00 PM</span>
            </div>
          </div>
        </div>

        <!-- Schedule Content Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- "Where You Need to Go Right Now" Banner -->
          <div id="current-class-banner">
            <!-- Injected by app.js -->
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <i class="fa-solid fa-list-timeline text-cyan-400"></i>
              <span>Full Day Class Schedule</span>
            </h4>
            <!-- Timeline Container -->
            <div id="schedule-timeline-container" class="space-y-3">
              <!-- Injected by app.js -->
            </div>
          </div>
        </div>

        <!-- Mobile Return to 3D Button -->
        <div class="lg:hidden p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <button id="btn-view-map-mobile-2" class="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer">
            <i class="fa-solid fa-cube"></i> View 3D Building Map
          </button>
        </div>
      </div>


    </aside>
  </div>

  <!-- Room Details Floating Top Card (Shares same space as 3D building, directly above room) -->
  <div id="room-modal" class="hidden fixed inset-y-0 left-0 right-0 z-40 pointer-events-none flex justify-center items-start pt-2 sm:pt-4 px-3 sm:px-4">
    <!-- Non-intrusive backdrop -->
    <div id="room-modal-backdrop" class="hidden absolute inset-0 pointer-events-none"></div>
    
    <!-- Floating Card: Half-screen height, dynamic solid theme, fully scrollable to leave the 3D room visible below -->
    <div id="room-modal-card" class="pointer-events-auto relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 h-[48vh] sm:h-[50vh] max-h-[48vh] sm:max-h-[50vh] text-slate-100">
      <!-- Close Button -->
      <button id="close-room-modal" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center z-20 transition shadow-sm border border-slate-700 cursor-pointer" title="Close details">
        <i class="fa-solid fa-xmark text-xs"></i>
      </button>

      <!-- Content populated by app.js (fully scrollable, dynamic theme) -->
      <div id="room-modal-content" class="overflow-y-auto custom-scrollbar flex-1 bg-slate-900 text-slate-100"></div>
    </div>
  </div>

  <!-- Application Scripts -->
  <script src="js/building-generator.js?v=<?= time() ?>"></script>
  <script src="js/viewer3d.js?v=<?= time() ?>"></script>
  <script src="js/app.js?v=<?= time() ?>"></script>
</body>
</html>
