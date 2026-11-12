/**
 * Campus 3D Navigator - Main Application Logic
 * Manages search, filters, student schedule finder, room detail drawer,
 * and 3D viewer bridge.
 */

let viewer = null;
let roomsData = [];
let schedulesData = [];
let currentFilter = 'all';
let currentFloor = 'all';
let searchQuery = '';
let activeProgramId = 'bsit-1a';
let activeDay = 'Monday';
let simulatedTime = '10:00'; // Default daytime for showcase

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load Data
  await loadData();

  // 2. Initialize 3D Building Viewer
  init3DViewer();

  // 3. Setup UI Event Handlers
  setupTabs();
  setupSidebarDrawer();
  setupSearchAndFilters();
  setupScheduleNavigator();
  setupHUDControls();
  setupRoomModal();
  setupCoordinatePicker();
  setupKeyboardShortcuts();
  setupThemeToggle();

  // 4. Initial Render of listings
  renderRoomsList();
  renderSchedule();

  // 5. Connect 3D Raycast Events to UI
  window.addEventListener('room-selected', (e) => {
    openRoomDetails(e.detail.roomId);
  });

  window.addEventListener('canvas-empty-clicked', () => {
    // Dismiss room modal if open and inspector mode is off
    if (activeModalRoomId && (!viewer || !viewer.isInspectorMode)) {
      closeRoomDetails();
    }
  });
});

async function loadData() {
  try {
    const roomsPromise = fetch('data/rooms.json?v=' + Date.now()).then(r => r.json());
    
    // Fetch live schedules from backend API (connected to MySQL/database) with graceful fallback
    const schedPromise = fetch('api/get_schedules.php?v=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .catch(() => fetch('data/schedules.json?v=' + Date.now()).then(r => r.json()));

    [roomsData, schedulesData] = await Promise.all([roomsPromise, schedPromise]);
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

function init3DViewer() {
  const container = document.getElementById('webgl-container');
  if (container) {
    viewer = new BuildingViewer('webgl-container', roomsData);
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    if (savedTheme === 'light' && typeof viewer.setTheme === 'function') {
      viewer.setTheme('light');
    }
  }
}

// Tab Switching (Directory vs Student Schedule)
function setupTabs() {
  const tabDirectory = document.getElementById('tab-btn-directory');
  const tabSchedule = document.getElementById('tab-btn-schedule');
  
  const viewDirectory = document.getElementById('view-directory');
  const viewSchedule = document.getElementById('view-schedule');

  const tabs = [
    { btn: tabDirectory, view: viewDirectory },
    { btn: tabSchedule, view: viewSchedule }
  ];

  tabs.forEach(({ btn, view }) => {
    if (!btn || !view) return;
    btn.addEventListener('click', () => {
      tabs.forEach(t => {
        if (!t.btn || !t.view) return;
        t.btn.classList.remove('tab-active');
        t.btn.classList.add('tab-inactive');
        t.view.classList.add('hidden');
      });

      btn.classList.add('tab-active');
      btn.classList.remove('tab-inactive');
      view.classList.remove('hidden');
    });
  });
}

// Search and Category Filters
function setupSearchAndFilters() {
  const searchInput = document.getElementById('room-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
      }
      renderRoomsList();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      renderRoomsList();
    });
  }

  // Category Filter Pills
  const filterPills = document.querySelectorAll('.category-filter-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('filter-active'));
      pill.classList.add('filter-active');
      currentFilter = pill.getAttribute('data-category');
      renderRoomsList();
    });
  });
}

// Render filtered rooms in the left panel
function renderRoomsList() {
  const listContainer = document.getElementById('rooms-list-container');
  const countBadge = document.getElementById('rooms-count-badge');
  if (!listContainer) return;

  const filtered = roomsData.filter(room => {
    const matchesCategory = (currentFilter === 'all') || (room.category === currentFilter);
    const matchesFloor = (currentFloor === 'all') || (room.floor === parseInt(currentFloor));
    const matchesSearch = !searchQuery || 
      room.name.toLowerCase().includes(searchQuery) ||
      room.code.toLowerCase().includes(searchQuery) ||
      (room.head && room.head.toLowerCase().includes(searchQuery));

    return matchesCategory && matchesFloor && matchesSearch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} locations`;
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400">
        <i class="fa-solid fa-magnifying-glass text-3xl mb-3 text-slate-500"></i>
        <p class="font-medium">No locations found</p>
        <p class="text-xs text-slate-500 mt-1">Try another search keyword or clear category filter</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = filtered.map(room => {
    const iconClass = getCategoryIcon(room.category, room);
    const floorLabel = getFloorLabel(room.floor);
    
    return `
      <div class="room-card group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all duration-200 cursor-pointer shadow-sm"
           onclick="handleRoomClick('${room.id}')">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" 
                 style="background-color: ${room.color}22; color: ${room.color}; border: 1px solid ${room.color}44;">
              <i class="${iconClass} text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm">${room.code}</span>
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ${floorLabel}
                </span>
              </div>
              <h4 class="text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">${room.name}</h4>
              <p class="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <i class="fa-solid fa-layer-group text-[10px] text-cyan-400"></i>
                <span>${getFloorLabel(room.floor)}</span>
                ${room.access ? `<span class="text-amber-400 font-semibold">• ${room.access}</span>` : ''}
              </p>
            </div>
          </div>
          <button class="shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-colors"
                  title="Locate in 3D Model"
                  onclick="event.stopPropagation(); locateRoom('${room.id}')">
            <i class="fa-solid fa-location-crosshairs text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function handleRoomClick(roomId) {
  locateRoom(roomId);
  openRoomDetails(roomId);
}

function locateRoom(roomId) {
  if (viewer) {
    viewer.focusRoom(roomId, true);
  }
  closeSidebar();
}

// Floating Sidebar Overlay Management (Shares same space as 3D canvas)
function closeSidebar() {
  const sidebar = document.getElementById('sidebar-panel');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) {
    sidebar.classList.add('-translate-x-full');
  }
  if (backdrop) {
    backdrop.classList.add('hidden');
  }
}

function openSidebar() {
  const sidebar = document.getElementById('sidebar-panel');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) {
    sidebar.classList.remove('-translate-x-full');
  }
  if (backdrop) {
    backdrop.classList.remove('hidden');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar && sidebar.classList.contains('-translate-x-full')) {
    openSidebar();
  } else {
    closeSidebar();
  }
}

function setupSidebarDrawer() {
  const toggleBtns = [
    document.getElementById('toggle-sidebar'),
    document.getElementById('toggle-sidebar-mobile')
  ].filter(Boolean);

  const closeBtns = [
    document.getElementById('close-sidebar'),
    document.getElementById('close-sidebar-mobile'),
    document.getElementById('btn-view-map-1'),
    document.getElementById('btn-view-map-mobile-1'),
    document.getElementById('btn-view-map-2'),
    document.getElementById('btn-view-map-mobile-2')
  ].filter(Boolean);

  const backdrop = document.getElementById('sidebar-backdrop');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  });

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  // Keyboard shortcut: Press Escape to close sidebar drawer if open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('sidebar-panel');
      if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        closeSidebar();
      }
    }
  });

  // On desktop screens, start open as an overlay card so directory options are readily visible
  if (window.innerWidth >= 1024) {
    openSidebar();
  }
}

// Student Schedule Navigator Setup
function setupScheduleNavigator() {
  const programSelect = document.getElementById('schedule-program-select');
  const dayButtons = document.querySelectorAll('.schedule-day-btn');
  const timeSlider = document.getElementById('schedule-time-slider');
  const timeDisplay = document.getElementById('schedule-time-display');
  const nowBtn = document.getElementById('schedule-now-btn');

  // Program change
  if (programSelect) {
    programSelect.addEventListener('change', (e) => {
      activeProgramId = e.target.value;
      renderSchedule();
    });
  }

  // Day buttons
  dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dayButtons.forEach(b => b.classList.remove('day-active'));
      btn.classList.add('day-active');
      activeDay = btn.getAttribute('data-day');
      renderSchedule();
      if (activeModalRoomId) renderRoomModalContent(activeModalRoomId);
    });
  });

  // Time slider
  if (timeSlider && timeDisplay) {
    timeSlider.addEventListener('input', (e) => {
      const minutes = parseInt(e.target.value);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMins = mins.toString().padStart(2, '0');
      simulatedTime = `${formattedHours}:${formattedMins}`;
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      timeDisplay.textContent = `${displayHours}:${formattedMins.padStart(2, '0')} ${ampm}`;

      renderSchedule();
      if (activeModalRoomId) renderRoomModalContent(activeModalRoomId);
    });
  }

  // "Use Real-Time / Now" Button
  if (nowBtn && timeSlider && timeDisplay) {
    nowBtn.addEventListener('click', () => {
      const date = new Date();
      const h = date.getHours();
      const m = date.getMinutes();
      const totalMins = h * 60 + m;
      
      // Clamp within campus hours (7:00 to 20:00)
      const clampedMins = Math.max(420, Math.min(1200, totalMins));
      timeSlider.value = clampedMins;
      
      const hours = Math.floor(clampedMins / 60);
      const mins = clampedMins % 60;
      simulatedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      timeDisplay.textContent = `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;

      // Also set day of week to today if Mon-Fri
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[date.getDay()];
      if (today !== 'Sunday') {
        activeDay = today;
        dayButtons.forEach(b => {
          b.classList.toggle('day-active', b.getAttribute('data-day') === today);
        });
      }

      renderSchedule();
      if (activeModalRoomId) renderRoomModalContent(activeModalRoomId);
    });
  }
}

// Render student schedule and determine currently active/next class
function renderSchedule() {
  const currentClassBanner = document.getElementById('current-class-banner');
  const scheduleListContainer = document.getElementById('schedule-timeline-container');
  if (!scheduleListContainer) return;

  const currentProgram = schedulesData.find(p => p.programId === activeProgramId);
  if (!currentProgram || !currentProgram.days[activeDay]) {
    scheduleListContainer.innerHTML = `
      <div class="p-6 text-center text-slate-400">
        <i class="fa-regular fa-calendar-xmark text-3xl mb-2 text-slate-500"></i>
        <p class="font-medium">No classes scheduled for ${activeDay}</p>
        <p class="text-xs text-slate-500 mt-1">Enjoy your study break or consult your professors!</p>
      </div>
    `;
    if (currentClassBanner) currentClassBanner.classList.add('hidden');
    return;
  }

  const dayClasses = currentProgram.days[activeDay];

  // Evaluate current class vs upcoming classes
  let activeClass = null;
  let nextClass = null;

  dayClasses.forEach(item => {
    if (simulatedTime >= item.timeStart && simulatedTime <= item.timeEnd) {
      activeClass = item;
    } else if (simulatedTime < item.timeStart && !nextClass) {
      nextClass = item;
    }
  });

  // Render "Where You Need to Go Right Now" Highlight Banner
  if (currentClassBanner) {
    const focusTarget = activeClass || nextClass;
    if (focusTarget) {
      const isOngoing = !!activeClass;
      currentClassBanner.classList.remove('hidden');
      currentClassBanner.innerHTML = `
        <div class="bg-gradient-to-r ${isOngoing ? 'from-cyan-950/80 via-blue-900/60 to-slate-900/90 border-cyan-500' : 'from-indigo-950/80 via-purple-900/60 to-slate-900/90 border-indigo-500'} border rounded-2xl p-4 shadow-lg backdrop-blur relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-28 h-28 ${isOngoing ? 'bg-cyan-500/10' : 'bg-indigo-500/10'} rounded-full blur-xl pointer-events-none"></div>
          <div class="flex items-center justify-between mb-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isOngoing ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'}">
              <span class="w-2 h-2 rounded-full ${isOngoing ? 'bg-cyan-400 animate-ping' : 'bg-indigo-400'}"></span>
              ${isOngoing ? 'Class In Progress Now' : 'Upcoming Next Class'}
            </span>
            <span class="text-xs font-semibold text-slate-300">${focusTarget.displayTime}</span>
          </div>

          <h3 class="text-base font-bold text-white leading-tight">${focusTarget.subjectCode}: ${focusTarget.subjectName}</h3>
          
          <div class="flex items-center gap-3 mt-2 text-xs text-slate-300">
            <div class="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <i class="fa-solid fa-location-dot"></i>
              <span>${focusTarget.roomName}</span>
            </div>
            <span>• ${getFloorLabel(focusTarget.floor)}</span>
          </div>

          <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <span class="text-xs text-slate-400">Instructor: <strong class="text-slate-200">${focusTarget.instructor}</strong></span>
            <button onclick="handleScheduleNavigate('${focusTarget.roomId}')"
                    class="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95">
              <i class="fa-solid fa-route"></i>
              <span>Take Me There</span>
            </button>
          </div>
        </div>
      `;
    } else {
      currentClassBanner.classList.remove('hidden');
      currentClassBanner.innerHTML = `
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <p class="text-xs text-emerald-400 font-bold"><i class="fa-solid fa-circle-check mr-1.5"></i>All scheduled classes for today are complete!</p>
          <p class="text-[11px] text-slate-400 mt-1">Check out the Library, Cafeteria, or Innovation Hub.</p>
        </div>
      `;
    }
  }

  // Render Full Day Timeline
  scheduleListContainer.innerHTML = dayClasses.map(item => {
    const isOngoing = simulatedTime >= item.timeStart && simulatedTime <= item.timeEnd;
    const isPast = simulatedTime > item.timeEnd;
    const isFuture = simulatedTime < item.timeStart;

    let badgeClass = 'bg-slate-800 text-slate-400';
    let statusText = 'Scheduled';
    if (isOngoing) {
      badgeClass = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      statusText = 'Ongoing';
    } else if (isPast) {
      badgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      statusText = 'Done';
    }

    return `
      <div class="schedule-item relative pl-6 pb-5 border-l-2 ${isOngoing ? 'border-cyan-400' : 'border-slate-800'} last:border-transparent last:pb-0">
        <!-- Timeline node dot -->
        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full ${isOngoing ? 'bg-cyan-400 ring-4 ring-cyan-500/30' : isPast ? 'bg-emerald-500' : 'bg-slate-700'} border-2 border-slate-950 flex items-center justify-center">
        </div>

        <div class="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-xl p-3.5 transition-colors cursor-pointer group"
             onclick="handleScheduleNavigate('${item.roomId}')">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">${item.subjectCode}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${badgeClass}">${statusText}</span>
          </div>

          <h4 class="text-xs text-slate-300 font-medium">${item.subjectName}</h4>

          <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <div class="flex items-center gap-1.5 text-cyan-400">
              <i class="fa-solid fa-door-open text-[10px]"></i>
              <span class="font-semibold">${item.roomName}</span>
            </div>
            <span>${item.displayTime}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleScheduleNavigate(roomId) {
  locateRoom(roomId);
  openRoomDetails(roomId);
}

// Floating HUD Controls on 3D Canvas
function setupHUDControls() {
  // Floor isolate buttons
  const floorButtons = document.querySelectorAll('.hud-floor-btn');
  floorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      floorButtons.forEach(b => b.classList.remove('hud-floor-active'));
      btn.classList.add('hud-floor-active');
      const floor = btn.getAttribute('data-floor');
      currentFloor = floor;
      if (viewer) {
        viewer.isolateFloor(floor);
      }
      renderRoomsList();
    });
  });

  // Preset view buttons
  const presetButtons = document.querySelectorAll('.hud-view-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (viewer) {
        viewer.setPresetView(view);
      }
    });
  });

  // Exploded View Slider
  const explodeSlider = document.getElementById('explode-slider');
  if (explodeSlider) {
    explodeSlider.addEventListener('input', (e) => {
      const factor = parseFloat(e.target.value) / 100;
      if (viewer) {
        viewer.setExplodedView(factor);
      }
    });
  }

  // 3D Background Grid Lines Toggle Feature
  const gridBtn = document.getElementById('btn-toggle-grid');
  const gridIcon = document.getElementById('grid-toggle-icon');
  const gridText = document.getElementById('grid-toggle-text');

  function updateGridBtnState(visible) {
    if (!gridBtn) return;
    if (visible) {
      gridBtn.classList.add('bg-cyan-950/70', 'text-cyan-300', 'border', 'border-cyan-500/50');
      gridBtn.classList.remove('text-slate-300');
      if (gridText) gridText.textContent = 'Grid: ON';
      if (gridIcon) gridIcon.className = 'fa-solid fa-border-all text-cyan-400';
    } else {
      gridBtn.classList.remove('bg-cyan-950/70', 'text-cyan-300', 'border', 'border-cyan-500/50');
      gridBtn.classList.add('text-slate-300');
      if (gridText) gridText.textContent = 'Grid: OFF';
      if (gridIcon) gridIcon.className = 'fa-solid fa-border-none text-slate-400';
    }
  }

  if (gridBtn) {
    const savedGrid = localStorage.getItem('app-grid-visible');
    const isGridOn = (savedGrid !== 'false');
    updateGridBtnState(isGridOn);

    gridBtn.addEventListener('click', () => {
      if (!viewer) return;
      const isVisible = viewer.toggleGrid();
      updateGridBtnState(isVisible);
    });
  }

  window.addEventListener('grid-visibility-changed', (e) => {
    updateGridBtnState(e.detail.visible);
  });
}

// Room Details Slide-over Drawer / Modal
function setupRoomModal() {
  const modal = document.getElementById('room-modal');
  const closeBtn = document.getElementById('close-room-modal');
  const backdrop = document.getElementById('room-modal-backdrop');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeRoomDetails);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeRoomDetails);
  }
}

let activeModalRoomId = null;

// Time and Duration Calculation Utilities
function timeToMins(t) {
  if (!t) return 0;
  const parts = t.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function minsToTimeStr(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const dh = h % 12 || 12;
  return `${dh}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDuration(mins) {
  if (mins <= 0) return '0 mins';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min${m > 1 ? 's' : ''}`;
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h} hr${h > 1 ? 's' : ''} ${m} min${m > 1 ? 's' : ''}`;
}

function convertDisplayTo24h(timeStr) {
  if (!timeStr) return '08:00';
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '08:00';
  let [_, h, m, ampm] = match;
  let hours = parseInt(h, 10);
  if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${m}`;
}

// Extract all scheduled classes for a specific room and day from schedulesData or room.schedule
function getRoomScheduleData(roomId, day) {
  const roomClasses = [];

  if (Array.isArray(schedulesData)) {
    schedulesData.forEach(sec => {
      const list = (sec.days && sec.days[day]) || [];
      list.forEach(item => {
        if (item.roomId === roomId) {
          roomClasses.push({
            ...item,
            sectionCode: item.sectionCode || sec.programCode,
            sectionName: item.sectionName || sec.programName,
            yearLevel: sec.yearLevel
          });
        }
      });
    });
  }

  // Fallback to room.schedule if no entries exist in comprehensive schedulesData
  if (roomClasses.length === 0) {
    const room = roomsData.find(r => r.id === roomId);
    if (room && room.schedule && Array.isArray(room.schedule)) {
      room.schedule.forEach((s, idx) => {
        const parts = s.time.split(' - ');
        roomClasses.push({
          id: `static-${idx}`,
          subjectCode: s.subject.split(':')[0].trim(),
          subjectName: s.subject.split(':')[1]?.trim() || s.subject,
          timeStart: convertDisplayTo24h(parts[0]),
          timeEnd: convertDisplayTo24h(parts[1]),
          displayTime: s.time,
          roomId: roomId,
          roomName: room.name,
          instructor: s.instructor,
          sectionCode: s.section || 'General Class',
          sectionName: s.section || 'General Class',
          type: 'Lecture'
        });
      });
    }
  }

  // Sort chronologically
  roomClasses.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  return roomClasses;
}

// Build chronological timeline of scheduled classes interspersed with explicit FREE windows
function buildRoomTimeline(classes) {
  const timeline = [];
  let dayStart = timeToMins('07:30'); // Standard campus opening slot
  const dayEnd = timeToMins('18:00');   // Campus classes concluding time

  classes.forEach(c => {
    const cStart = timeToMins(c.timeStart);
    const cEnd = timeToMins(c.timeEnd);

    if (cStart > dayStart) {
      timeline.push({
        type: 'free',
        start: dayStart,
        end: cStart,
        displayTime: `${minsToTimeStr(dayStart)} - ${minsToTimeStr(cStart)}`,
        duration: cStart - dayStart
      });
    }

    timeline.push({
      type: 'class',
      ...c,
      start: cStart,
      end: cEnd
    });

    dayStart = Math.max(dayStart, cEnd);
  });

  if (dayStart < dayEnd) {
    timeline.push({
      type: 'free',
      start: dayStart,
      end: dayEnd,
      displayTime: `${minsToTimeStr(dayStart)} - ${minsToTimeStr(dayEnd)}`,
      duration: dayEnd - dayStart
    });
  }

  return timeline;
}

// Room Details Slide-over Drawer / Modal Setup
function setupRoomModal() {
  const modal = document.getElementById('room-modal');
  const closeBtn = document.getElementById('close-room-modal');
  const backdrop = document.getElementById('room-modal-backdrop');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeRoomDetails);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeRoomDetails);
  }
}

function openRoomDetails(roomId) {
  const room = roomsData.find(r => r.id === roomId);
  if (!room) return;

  activeModalRoomId = roomId;

  // Exit sidebar overlay so focused 3D room is clearly visible in the shared space
  closeSidebar();

  renderRoomModalContent(roomId);

  const modal = document.getElementById('room-modal');
  if (modal) modal.classList.remove('hidden');
}

function renderRoomModalContent(roomId) {
  const room = roomsData.find(r => r.id === roomId);
  if (!room) return;

  const content = document.getElementById('room-modal-content');
  if (!content) return;

  // Preserve scroll position if re-rendering during time sliding
  const prevScrollTop = content.scrollTop;

  const isLight = document.body.classList.contains('light-theme');

  // Synchronize outer card and controls with current theme
  const cardContainer = document.getElementById('room-modal-card');
  const closeBtn = document.getElementById('close-room-modal');
  if (cardContainer) {
    if (isLight) {
      cardContainer.className = 'pointer-events-auto relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 h-[48vh] sm:h-[50vh] max-h-[48vh] sm:max-h-[50vh] text-slate-800';
    } else {
      cardContainer.className = 'pointer-events-auto relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 h-[48vh] sm:h-[50vh] max-h-[48vh] sm:max-h-[50vh] text-slate-100';
    }
  }
  if (closeBtn) {
    if (isLight) {
      closeBtn.className = 'absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center z-20 transition shadow-sm border border-slate-200 cursor-pointer';
    } else {
      closeBtn.className = 'absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center z-20 transition shadow-sm border border-slate-700 cursor-pointer';
    }
  }
  if (content) {
    if (isLight) {
      content.className = 'overflow-y-auto custom-scrollbar flex-1 bg-white text-slate-800';
    } else {
      content.className = 'overflow-y-auto custom-scrollbar flex-1 bg-slate-900 text-slate-100';
    }
  }

  const floorLabel = getFloorLabel(room.floor);
  const roomColor = room.color || '#0284c7';

  // Access requirement badge
  const accessBadge = room.access ? `
    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'} flex items-center gap-1 shrink-0">
      <i class="fa-solid fa-lock text-[10px]"></i>
      ${room.access}
    </span>
  ` : '';

  // Get all classes for this room on the currently selected day
  const classes = getRoomScheduleData(roomId, activeDay);

  // Evaluate occupancy based on simulatedTime
  const currentOccupant = classes.find(c => simulatedTime >= c.timeStart && simulatedTime < c.timeEnd);
  const curMins = timeToMins(simulatedTime);

  // Construct Occupancy Status Block
  let occupancyHtml = '';
  let statusBadge = '';

  if (currentOccupant) {
    const endMins = timeToMins(currentOccupant.timeEnd);
    const remainingMins = Math.max(0, endMins - curMins);
    
    // Look for next class after current class ends to determine when room is next free
    const nextClassAfter = classes.find(c => timeToMins(c.timeStart) >= endMins);
    let freeNextMsg = '';
    if (nextClassAfter) {
      const freeDuration = timeToMins(nextClassAfter.timeStart) - endMins;
      if (freeDuration > 0) {
        freeNextMsg = `Free at <strong>${minsToTimeStr(endMins)}</strong> (${formatDuration(freeDuration)} window until ${minsToTimeStr(timeToMins(nextClassAfter.timeStart))})`;
      } else {
        freeNextMsg = `Next class begins immediately at ${minsToTimeStr(endMins)} (${nextClassAfter.sectionCode})`;
      }
    } else {
      freeNextMsg = `Free at <strong>${minsToTimeStr(endMins)}</strong> for the rest of the day (Campus closes at 6:00 PM)`;
    }

    statusBadge = isLight ? `
      <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
        Occupied Now
      </span>
    ` : `
      <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950/70 text-rose-300 border border-rose-800/60 flex items-center gap-1.5 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        Occupied Now
      </span>
    `;

    occupancyHtml = isLight ? `
      <div class="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-3 shadow-sm text-slate-800">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-[11px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
            <i class="fa-solid fa-users text-rose-600"></i>
            Active Class In Session
          </span>
          <span class="text-[10px] font-mono font-bold text-rose-900 bg-white px-2.5 py-0.5 rounded-md border border-rose-300 shadow-sm">
            ${currentOccupant.displayTime}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="bg-white rounded-lg p-2.5 border border-rose-200 shadow-sm">
            <span class="text-slate-500 text-[10px] block font-semibold">Section Using Room</span>
            <strong class="text-cyan-800 text-xs block font-black truncate mt-0.5">${currentOccupant.sectionCode}</strong>
            <span class="text-[10px] text-slate-600 truncate block mt-0.5">${currentOccupant.sectionName}</span>
          </div>
          <div class="bg-white rounded-lg p-2.5 border border-rose-200 shadow-sm">
            <span class="text-slate-500 text-[10px] block font-semibold">Faculty / Instructor</span>
            <strong class="text-slate-900 text-xs block font-bold truncate mt-0.5"><i class="fa-solid fa-chalkboard-user mr-1 text-cyan-600"></i>${currentOccupant.instructor}</strong>
            <span class="text-[10px] text-slate-600 truncate block mt-0.5">${currentOccupant.type}</span>
          </div>
          <div class="sm:col-span-2 bg-white rounded-lg p-2.5 border border-rose-200 shadow-sm">
            <span class="text-slate-500 text-[10px] block font-semibold">Subject & Course</span>
            <strong class="text-slate-900 text-xs block font-bold mt-0.5">${currentOccupant.subjectCode}: ${currentOccupant.subjectName}</strong>
          </div>
        </div>

        <!-- Free Next Time Indicator -->
        <div class="pt-2 border-t border-rose-200 flex items-start gap-2 text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
          <i class="fa-regular fa-calendar-check text-emerald-600 mt-0.5 shrink-0 text-sm"></i>
          <div>
            <span class="text-slate-800 font-medium">When Room is Free:</span> ${freeNextMsg}
            <span class="block text-[10px] text-slate-600 mt-0.5">Session ends in <strong>${formatDuration(remainingMins)}</strong>.</span>
          </div>
        </div>
      </div>
    ` : `
      <div class="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3.5 space-y-3 shadow-sm text-slate-200">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <i class="fa-solid fa-users text-rose-400"></i>
            Active Class In Session
          </span>
          <span class="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/70 px-2.5 py-0.5 rounded-md border border-rose-800/60 shadow-sm">
            ${currentOccupant.displayTime}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div class="bg-slate-900 rounded-lg p-2.5 border border-slate-800 shadow-sm">
            <span class="text-slate-400 text-[10px] block font-semibold">Section Using Room</span>
            <strong class="text-cyan-400 text-xs block font-black truncate mt-0.5">${currentOccupant.sectionCode}</strong>
            <span class="text-[10px] text-slate-300 truncate block mt-0.5">${currentOccupant.sectionName}</span>
          </div>
          <div class="bg-slate-900 rounded-lg p-2.5 border border-slate-800 shadow-sm">
            <span class="text-slate-400 text-[10px] block font-semibold">Faculty / Instructor</span>
            <strong class="text-slate-100 text-xs block font-bold truncate mt-0.5"><i class="fa-solid fa-chalkboard-user mr-1 text-cyan-400"></i>${currentOccupant.instructor}</strong>
            <span class="text-[10px] text-slate-400 truncate block mt-0.5">${currentOccupant.type}</span>
          </div>
          <div class="sm:col-span-2 bg-slate-900 rounded-lg p-2.5 border border-slate-800 shadow-sm">
            <span class="text-slate-400 text-[10px] block font-semibold">Subject & Course</span>
            <strong class="text-slate-100 text-xs block font-bold mt-0.5">${currentOccupant.subjectCode}: ${currentOccupant.subjectName}</strong>
          </div>
        </div>

        <!-- Free Next Time Indicator -->
        <div class="pt-2 border-t border-rose-900/60 flex items-start gap-2 text-[11px] text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/60">
          <i class="fa-regular fa-calendar-check text-emerald-400 mt-0.5 shrink-0 text-sm"></i>
          <div>
            <span class="text-slate-200 font-medium">When Room is Free:</span> ${freeNextMsg}
            <span class="block text-[10px] text-slate-400 mt-0.5">Session ends in <strong>${formatDuration(remainingMins)}</strong>.</span>
          </div>
        </div>
      </div>
    `;
  } else {
    // Room is Free / Vacant at this time
    const nextClass = classes.find(c => timeToMins(c.timeStart) > curMins);
    let freeMsg = '';

    if (nextClass) {
      const nextMins = timeToMins(nextClass.timeStart);
      const freeDuration = nextMins - curMins;
      const secHighlight = isLight ? 'text-cyan-800 font-bold' : 'text-cyan-400 font-bold';
      freeMsg = `Free right now for <strong>${formatDuration(freeDuration)}</strong> (until <strong>${minsToTimeStr(nextMins)}</strong>). Next class: <span class="${secHighlight}">${nextClass.sectionCode}</span> (${nextClass.subjectCode}) with ${nextClass.instructor}.`;
    } else if (classes.length > 0) {
      freeMsg = `Free for the rest of the day! All scheduled classes on <strong>${activeDay}</strong> have concluded.`;
    } else {
      freeMsg = `Free all day! No regular classes scheduled in this room on <strong>${activeDay}</strong>.`;
    }

    statusBadge = isLight ? `
      <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
        Free Now
      </span>
    ` : `
      <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        Free Now
      </span>
    `;

    occupancyHtml = isLight ? `
      <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2.5 shadow-sm text-slate-800">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <i class="fa-solid fa-door-open text-emerald-600"></i>
            Currently Vacant & Available
          </span>
          <span class="text-[10px] font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-sm">
            Open For Study & Consultation
          </span>
        </div>

        <p class="text-xs text-slate-700 leading-snug font-medium">
          ${freeMsg}
        </p>

        <div class="pt-2 border-t border-emerald-200 flex items-center gap-2 text-[11px] text-slate-600">
          <i class="fa-solid fa-circle-info text-cyan-600 shrink-0"></i>
          <span>Students & faculty may freely access this room during available windows.</span>
        </div>
      </div>
    ` : `
      <div class="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-3.5 space-y-2.5 shadow-sm text-slate-200">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <i class="fa-solid fa-door-open text-emerald-400"></i>
            Currently Vacant & Available
          </span>
          <span class="text-[10px] font-black text-emerald-300 bg-emerald-950/70 px-2.5 py-0.5 rounded-md border border-emerald-800/60 shadow-sm">
            Open For Study & Consultation
          </span>
        </div>

        <p class="text-xs text-slate-300 leading-snug font-medium">
          ${freeMsg}
        </p>

        <div class="pt-2 border-t border-emerald-900/60 flex items-center gap-2 text-[11px] text-slate-400">
          <i class="fa-solid fa-circle-info text-cyan-400 shrink-0"></i>
          <span>Students & faculty may freely access this room during available windows.</span>
        </div>
      </div>
    `;
  }

  // Build Timeline of scheduled classes and free windows
  const timeline = buildRoomTimeline(classes);

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  content.innerHTML = `
    <!-- Card Header (Dynamic Solid Theme) -->
    <div class="px-4 py-3 sm:px-5 sm:py-3.5 border-b ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900'} flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 flex-wrap pr-6">
        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm"
              style="background-color: ${roomColor};">
          ${room.category.toUpperCase()}
        </span>
        <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold ${isLight ? 'bg-white text-slate-700 border border-slate-300' : 'bg-slate-800 text-slate-200 border border-slate-700'} shadow-sm">
          ${floorLabel}
        </span>
        ${statusBadge}
        ${accessBadge}
      </div>
    </div>

    <!-- Card Body (Dynamic Solid Theme) -->
    <div class="px-4 py-3 sm:px-5 sm:py-3.5 space-y-3.5 ${isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-100'}">
      <!-- Room Photo Showcase / Placeholder -->
      <div class="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950 border border-slate-800'} flex items-center justify-center group shadow-sm">
        <img id="room-modal-photo" 
             src="${room.image || `assets/images/rooms/${room.id}.jpg`}" 
             alt="${room.name}" 
             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
             onload="const p = document.getElementById('room-modal-placeholder-badge'); if(p) p.classList.add('hidden');"
             onerror="this.classList.add('hidden'); const p = document.getElementById('room-modal-placeholder-badge'); if(p) p.classList.remove('hidden');">
        
        <!-- Placeholder shown when no picture is present yet (Dynamic Solid Theme) -->
        <div id="room-modal-placeholder-badge" class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center ${isLight ? 'bg-slate-50 border border-dashed border-slate-300' : 'bg-slate-900/90 border border-dashed border-slate-700'} rounded-xl">
          <div class="w-12 h-12 rounded-xl ${isLight ? 'bg-cyan-50 border border-cyan-200 text-cyan-600' : 'bg-slate-800 border border-slate-700 text-cyan-400'} flex items-center justify-center mb-1.5 shadow-sm">
            <i class="fa-solid fa-camera text-lg"></i>
          </div>
          <p class="text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}">Room Picture Placeholder</p>
          <p class="text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5">Drop photo in <code class="${isLight ? 'text-cyan-700 font-mono bg-white border border-slate-300' : 'text-cyan-400 font-mono bg-slate-950 border border-slate-800'} px-1.5 py-0.5 rounded">assets/images/rooms/${room.id}.jpg</code></p>
        </div>
      </div>

      <!-- Room Name & Clean Description -->
      <div>
        <h2 class="text-base sm:text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2">
          <span>${room.name}</span>
        </h2>
        ${room.description ? `<p class="text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-0.5 leading-snug">${room.description}</p>` : ''}
      </div>

      <!-- Interactive Day & Time Controls (Dynamic Solid Theme) -->
      <div class="${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800 border border-slate-700'} rounded-xl p-3 space-y-2.5 shadow-sm">
        <!-- Day Selector Buttons -->
        <div class="flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-1">
          <span class="text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} mr-1 shrink-0 flex items-center gap-1">
            <i class="fa-regular fa-calendar text-[11px] ${isLight ? 'text-cyan-600' : 'text-cyan-400'}"></i> Day:
          </span>
          <div class="flex items-center gap-1.5 shrink-0">
            ${daysList.map(d => {
              const isSelected = activeDay === d;
              const unselectedClass = isLight 
                ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600';
              return `
                <button type="button" 
                        class="room-day-btn px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${isSelected ? 'bg-cyan-600 text-white shadow-sm font-black' : unselectedClass}"
                        data-day="${d}">
                  ${d.substring(0, 3)}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Time Scrubber Slider -->
        <div class="flex items-center gap-2.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}">
          <span class="text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} shrink-0 flex items-center gap-1">
            <i class="fa-regular fa-clock text-[11px] ${isLight ? 'text-cyan-600' : 'text-cyan-400'}"></i> Time:
          </span>
          <input id="room-card-time-slider" 
                 type="range" 
                 min="450" 
                 max="1110" 
                 step="15" 
                 value="${curMins}" 
                 class="flex-1 ${isLight ? 'accent-cyan-600 bg-slate-200' : 'accent-cyan-400 bg-slate-700'} h-2 rounded-lg cursor-pointer">
          <span id="room-card-time-display" 
                class="font-mono text-xs font-black ${isLight ? 'text-cyan-800 bg-white border border-slate-300' : 'text-cyan-400 bg-slate-900 border border-slate-700'} px-2.5 py-1 rounded-md shadow-sm shrink-0">
            ${minsToTimeStr(curMins)}
          </span>
          <button id="room-card-now-btn" 
                  class="px-2.5 py-1 rounded-md ${isLight ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-300' : 'bg-slate-700 hover:bg-slate-600 text-cyan-300 border border-slate-600'} text-[10px] font-bold transition shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Sync with current real-world clock">
            <i class="fa-solid fa-bolt text-[10px] ${isLight ? 'text-cyan-600' : 'text-cyan-400'}"></i> Now
          </button>
        </div>
      </div>

      <!-- Live Room Occupancy / Who is Using It Banner -->
      ${occupancyHtml}

      <!-- Quick Info Grid (Dynamic Solid Theme) -->
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800 border border-slate-700'} rounded-xl p-3 shadow-sm">
          <span class="${isLight ? 'text-cyan-700' : 'text-cyan-400'} block text-[10px] font-black uppercase tracking-wider"><i class="fa-solid fa-user-tie mr-1 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}"></i>In-Charge / Head</span>
          <strong class="${isLight ? 'text-slate-900' : 'text-slate-100'} truncate block text-xs font-bold mt-1">${room.head || 'Department Staff'}</strong>
        </div>
        <div class="${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-800 border border-slate-700'} rounded-xl p-3 shadow-sm">
          <span class="${isLight ? 'text-cyan-700' : 'text-cyan-400'} block text-[10px] font-black uppercase tracking-wider"><i class="fa-regular fa-clock mr-1 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}"></i>Operating Hours</span>
          <strong class="${isLight ? 'text-slate-900' : 'text-slate-100'} truncate block text-xs font-bold mt-1">${room.hours || '7:30 AM - 6:30 PM'}</strong>
        </div>
      </div>

      <!-- How to Get There (Dynamic Solid Theme) -->
      ${room.directions ? `
        <div class="${isLight ? 'bg-slate-50 border border-cyan-200 text-slate-700' : 'bg-slate-800 border border-cyan-900/60 text-slate-300'} rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-xs shadow-sm">
          <i class="fa-solid fa-person-walking ${isLight ? 'text-cyan-600' : 'text-cyan-400'} mt-0.5 shrink-0 text-sm"></i>
          <span class="leading-snug font-medium">${room.directions}</span>
        </div>
      ` : ''}

      <!-- Complete Schedule & Free Windows Timeline (Dynamic Solid Theme) -->
      <div class="pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5">
            <i class="fa-regular fa-calendar-days ${isLight ? 'text-cyan-600' : 'text-cyan-400'}"></i>
            Full Room Schedule & Free Windows (${activeDay})
          </span>
          <span class="text-[10px] font-bold ${isLight ? 'text-slate-700 bg-slate-100 border border-slate-200' : 'text-slate-300 bg-slate-800 border border-slate-700'} px-2 py-0.5 rounded-full">
            ${timeline.length} time blocks
          </span>
        </div>

        <div class="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          ${timeline.map(item => {
            if (item.type === 'free') {
              const isCurrentFree = curMins >= item.start && curMins < item.end;
              if (isLight) {
                return `
                  <div class="rounded-xl px-3.5 py-2.5 text-[11px] border transition flex items-center justify-between gap-2 shadow-sm ${isCurrentFree ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-50'}">
                    <div class="flex items-center gap-2.5">
                      <span class="w-2.5 h-2.5 rounded-full ${isCurrentFree ? 'bg-emerald-600 animate-ping' : 'bg-emerald-600'} shrink-0"></span>
                      <div>
                        <span class="text-emerald-900 font-black text-[11px] block">🟢 Free Window (${formatDuration(item.duration)})</span>
                        <span class="text-[10px] text-slate-500 block font-medium">Room is available & open for use</span>
                      </div>
                    </div>
                    <span class="font-mono text-[10px] font-bold text-emerald-900 shrink-0 bg-white px-2.5 py-1 rounded-md border border-emerald-300 shadow-sm">
                      ${item.displayTime}
                    </span>
                  </div>
                `;
              } else {
                return `
                  <div class="rounded-xl px-3.5 py-2.5 text-[11px] border transition flex items-center justify-between gap-2 shadow-sm ${isCurrentFree ? 'bg-emerald-950/60 border-2 border-emerald-500' : 'bg-emerald-950/20 border border-emerald-900/60 hover:bg-emerald-950/40'}">
                    <div class="flex items-center gap-2.5">
                      <span class="w-2.5 h-2.5 rounded-full ${isCurrentFree ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'} shrink-0"></span>
                      <div>
                        <span class="text-emerald-300 font-black text-[11px] block">🟢 Free Window (${formatDuration(item.duration)})</span>
                        <span class="text-[10px] text-slate-400 block font-medium">Room is available & open for use</span>
                      </div>
                    </div>
                    <span class="font-mono text-[10px] font-bold text-emerald-300 shrink-0 bg-slate-900 px-2.5 py-1 rounded-md border border-emerald-800/60 shadow-sm">
                      ${item.displayTime}
                    </span>
                  </div>
                `;
              }
            } else {
              const isOngoing = simulatedTime >= item.timeStart && simulatedTime < item.timeEnd;
              const isPast = curMins >= item.end;

              let badge = '';
              let rowStyle = '';

              if (isLight) {
                if (isOngoing) {
                  badge = `<span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">In Session</span>`;
                  rowStyle = 'bg-cyan-50 border-2 border-cyan-500 shadow-sm';
                } else if (isPast) {
                  badge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Completed</span>`;
                  rowStyle = 'bg-slate-50 border border-slate-200 opacity-70';
                } else {
                  badge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">Upcoming</span>`;
                  rowStyle = 'bg-white border border-slate-200 hover:border-slate-300';
                }

                return `
                  <div class="rounded-xl p-3 text-[11px] border transition shadow-sm ${rowStyle}">
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-200 shadow-sm">
                          ${item.sectionCode}
                        </span>
                        <strong class="text-slate-900 text-xs font-bold truncate">${item.subjectCode}</strong>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        ${badge}
                        <span class="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">${item.displayTime}</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-slate-600 mt-1">
                      <span class="truncate font-medium text-slate-700">${item.subjectName}</span>
                      <span class="shrink-0 text-slate-700 ml-2 font-medium"><i class="fa-solid fa-chalkboard-user text-cyan-600 mr-1"></i>${item.instructor}</span>
                    </div>
                  </div>
                `;
              } else {
                // Dark Mode
                if (isOngoing) {
                  badge = `<span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-950/70 text-rose-300 border border-rose-800/60 shadow-sm">In Session</span>`;
                  rowStyle = 'bg-cyan-950/30 border-2 border-cyan-500 shadow-sm';
                } else if (isPast) {
                  badge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">Completed</span>`;
                  rowStyle = 'bg-slate-800/40 border border-slate-800 opacity-60';
                } else {
                  badge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-700 text-cyan-300 border border-slate-600">Upcoming</span>`;
                  rowStyle = 'bg-slate-800 border border-slate-700 hover:border-slate-600';
                }

                return `
                  <div class="rounded-xl p-3 text-[11px] border transition shadow-sm ${rowStyle}">
                    <div class="flex items-center justify-between gap-2 mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm">
                          ${item.sectionCode}
                        </span>
                        <strong class="text-white text-xs font-bold truncate">${item.subjectCode}</strong>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        ${badge}
                        <span class="font-mono text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">${item.displayTime}</span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span class="truncate font-medium text-slate-300">${item.subjectName}</span>
                      <span class="shrink-0 text-slate-300 ml-2 font-medium"><i class="fa-solid fa-chalkboard-user text-cyan-400 mr-1"></i>${item.instructor}</span>
                    </div>
                  </div>
                `;
              }
            }
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Restore scroll position
  if (prevScrollTop > 0) {
    content.scrollTop = prevScrollTop;
  }

  // Hook interactive Day buttons inside modal
  const modalDayBtns = content.querySelectorAll('.room-day-btn');
  modalDayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedDay = btn.getAttribute('data-day');
      activeDay = selectedDay;

      // Sync with sidebar day buttons
      const dayButtons = document.querySelectorAll('.schedule-day-btn');
      dayButtons.forEach(b => {
        b.classList.toggle('day-active', b.getAttribute('data-day') === selectedDay);
      });

      renderSchedule();
      renderRoomModalContent(roomId);
    });
  });

  // Hook interactive Time Slider inside modal
  const modalTimeSlider = content.getElementById ? content.getElementById('room-card-time-slider') : document.getElementById('room-card-time-slider');
  if (modalTimeSlider) {
    modalTimeSlider.addEventListener('input', (e) => {
      const minutes = parseInt(e.target.value, 10);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMins = mins.toString().padStart(2, '0');
      simulatedTime = `${formattedHours}:${formattedMins}`;

      // Sync sidebar slider & display
      const timeSlider = document.getElementById('schedule-time-slider');
      const timeDisplay = document.getElementById('schedule-time-display');
      if (timeSlider) timeSlider.value = minutes;
      if (timeDisplay) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        timeDisplay.textContent = `${displayHours}:${formattedMins.padStart(2, '0')} ${ampm}`;
      }

      renderSchedule();
      renderRoomModalContent(roomId);
    });
  }

  // Hook "⚡ Now" Button inside modal
  const modalNowBtn = content.getElementById ? content.getElementById('room-card-now-btn') : document.getElementById('room-card-now-btn');
  if (modalNowBtn) {
    modalNowBtn.addEventListener('click', () => {
      const date = new Date();
      const h = date.getHours();
      const m = date.getMinutes();
      const totalMins = h * 60 + m;
      const clampedMins = Math.max(450, Math.min(1110, totalMins));

      const hours = Math.floor(clampedMins / 60);
      const mins = clampedMins % 60;
      simulatedTime = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

      // Also sync day of week
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[date.getDay()];
      if (today !== 'Sunday') {
        activeDay = today;
      }

      // Sync sidebar UI
      const timeSlider = document.getElementById('schedule-time-slider');
      const timeDisplay = document.getElementById('schedule-time-display');
      if (timeSlider) timeSlider.value = clampedMins;
      if (timeDisplay) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        timeDisplay.textContent = `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
      }
      const dayButtons = document.querySelectorAll('.schedule-day-btn');
      dayButtons.forEach(b => {
        b.classList.toggle('day-active', b.getAttribute('data-day') === activeDay);
      });

      renderSchedule();
      renderRoomModalContent(roomId);
    });
  }
}

function closeRoomDetails() {
  activeModalRoomId = null;
  const modal = document.getElementById('room-modal');
  if (modal) modal.classList.add('hidden');
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Esc to close room modal
    if (e.key === 'Escape') {
      closeRoomDetails();
    }

    // '/' to focus search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      const searchInput = document.getElementById('room-search-input');
      if (searchInput) searchInput.focus();
    }
  });
}

// Room Coordinate Picker Tool (Click on 3D Model to copy coordinates)
function setupCoordinatePicker() {
  const toggleBtn = document.getElementById('btn-toggle-inspector');
  const toast = document.getElementById('inspector-toast');
  const coordsEl = document.getElementById('inspector-coords');
  const meshNameEl = document.getElementById('inspector-mesh-name');
  const copyBtn = document.getElementById('inspector-copy-btn');

  let lastCoordsJson = '';

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (!viewer) return;
      viewer.isInspectorMode = !viewer.isInspectorMode;

      if (viewer.isInspectorMode) {
        toggleBtn.classList.add('bg-cyan-500', 'text-slate-950', 'font-black');
        toggleBtn.classList.remove('bg-slate-800', 'text-slate-300');
        if (toast) {
          toast.classList.remove('hidden');
          coordsEl.textContent = 'Click on any room in your 3D model';
          meshNameEl.textContent = 'Inspector Mode: Active';
        }
      } else {
        toggleBtn.classList.remove('bg-cyan-500', 'text-slate-950', 'font-black');
        toggleBtn.classList.add('bg-slate-800', 'text-slate-300');
        if (toast) toast.classList.add('hidden');
      }
    });
  }

  window.addEventListener('inspector-coords-picked', (e) => {
    const { coords, meshName } = e.detail;
    lastCoordsJson = `"coordinates": { "x": ${coords.x}, "y": ${coords.y}, "z": ${coords.z} }`;
    if (toast) toast.classList.remove('hidden');
    if (coordsEl) coordsEl.textContent = lastCoordsJson;
    if (meshNameEl) meshNameEl.textContent = `Mesh: "${meshName}"`;

    // Automatically copy to clipboard!
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lastCoordsJson).catch(() => {});
    }
    if (copyBtn) {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { if (copyBtn) copyBtn.textContent = 'Copy JSON'; }, 1800);
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (lastCoordsJson && navigator.clipboard) {
        navigator.clipboard.writeText(lastCoordsJson);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { if (copyBtn) copyBtn.textContent = 'Copy'; }, 1800);
      }
    });
  }

  const closeToastBtn = document.getElementById('inspector-close-btn');
  if (closeToastBtn) {
    closeToastBtn.addEventListener('click', () => {
      if (toast) toast.classList.add('hidden');
    });
  }
}

// Light / Dark Mode Toggle
function setupThemeToggle() {
  const themeBtn = document.getElementById('btn-toggle-theme');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeText = document.getElementById('theme-toggle-text');

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('app-theme') || 'dark';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isCurrentlyLight = document.body.classList.contains('light-theme');
      const newTheme = isCurrentlyLight ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem('app-theme', newTheme);
    });
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
      if (themeIcon) {
        themeIcon.className = 'fa-solid fa-sun text-amber-500';
      }
      if (themeText) {
        themeText.textContent = 'Light';
      }
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
      if (themeIcon) {
        themeIcon.className = 'fa-solid fa-moon text-slate-300';
      }
      if (themeText) {
        themeText.textContent = 'Dark';
      }
    }

    if (viewer && typeof viewer.setTheme === 'function') {
      viewer.setTheme(theme);
    }

    // Live update room modal card if currently active
    if (activeModalRoomId) {
      renderRoomModalContent(activeModalRoomId);
    }
  }
}

// Helpers
function getCategoryIcon(cat, room = null) {
  if (room && room.code) {
    const c = room.code.toLowerCase();
    if (c.includes('cr') || c.includes('restroom')) return 'fa-solid fa-restroom';
    if (c.includes('hangout') || c.includes('lounge')) return 'fa-solid fa-couch';
  }
  switch (cat) {
    case 'lecture': return 'fa-solid fa-chalkboard-user';
    case 'office': return 'fa-solid fa-briefcase';
    case 'faculty': return 'fa-solid fa-user-tie';
    case 'lab': return 'fa-solid fa-flask-vial';
    case 'amenity': return 'fa-solid fa-couch';
    default: return 'fa-solid fa-location-dot';
  }
}

function getFloorLabel(f) {
  switch (f) {
    case 1: return 'Ground Floor (L1)';
    case 2: return '2nd Floor (L2)';
    case 3: return '3rd Floor (L3)';
    case 4: return '4th Floor (L4)';
    default: return `Floor ${f}`;
  }
}

function showAppHelp() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024);
  if (isTouch) {
    alert("📱 Mobile 3D Navigation Tips:\n\n• 1-Finger Drag: Glide & pan across building facade\n• 2-Finger Pinch: Zoom in & out\n• Tap any Room Pin: Open details & full class schedule\n• Top Menu (☰): Search directory or find 'Where Do I Go'\n• Right HUD (L1/L2/L3): Isolate individual floors\n• Top HUD (Grid / Reset): Toggle grid & reset view");
  } else {
    alert("💻 Desktop Navigation Tips:\n\n• Click & Drag: Pan across building facade\n• Mouse Wheel: Zoom in / out\n• Click any Room or Pin: View details & full schedule\n• Left Sidebar: Search Directory or use Student Schedule\n• Right HUD: Isolate L1, L2, L3 or view ALL floors\n• Pick Room Coords: Click any 3D point to copy coordinates");
  }
}

window.showAppHelp = showAppHelp;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleSidebar = toggleSidebar;
window.openSidebarMobile = openSidebar;
window.closeSidebarMobile = closeSidebar;
window.handleRoomClick = handleRoomClick;
window.locateRoom = locateRoom;
window.handleScheduleNavigate = handleScheduleNavigate;
window.openRoomDetails = openRoomDetails;
window.closeRoomDetails = closeRoomDetails;
window.renderRoomModalContent = renderRoomModalContent;
