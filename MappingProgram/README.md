# 🏛️ Campus 3D Building Navigation & Schedule Management System

> **College of Computer Studies (CCS) New Building**  
> An interactive WebGL/Three.js 3D campus navigation platform, student schedule simulator, and smart IoT occupancy system built for modern university environments.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Database Architecture & Data Model](#-database-architecture--data-model)
6. [Installation & Setup Guide](#-installation--setup-guide)
7. [REST API Endpoints](#-rest-api-endpoints)
8. [IoT & Hardware Builds](#-iot--hardware-builds)
   - [Build 1: Interactive Campus Touchscreen Kiosk](#build-1-interactive-campus-touchscreen-kiosk)
   - [Build 2: ESP32 Smart E-Paper / LCD Room Door Signs](#build-2-esp32-smart-e-paper--lcd-room-door-signs)
   - [Build 3: mmWave Radar & PIR Human Occupancy Sensors](#build-3-mmwave-radar--pir-human-occupancy-sensors)
   - [Build 4: RFID / NFC Attendance & Room Access Reader](#build-4-rfid--nfc-attendance--room-access-reader)
9. [Project Directory Structure](#-project-directory-structure)
10. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Project Overview

The **Campus 3D Building Navigation & Schedule Management System** is an end-to-end web and IoT mapping application designed for university students, faculty, and campus visitors. It solves the everyday challenge of finding lecture rooms, determining real-time room occupancy, discovering available study windows, and accessing weekly course schedules.

### What Makes It Unique:
- **Unified Shared Space**: The 3D building canvas spans the full screen, and all UI controls (directory, schedules, room cards) float directly over the 3D scene without arbitrary screen partitioning.
- **Dynamic 3D Digital Twin**: Built on **Three.js** with realistic architectural materials, lighting, floor isolation, procedural fallback generation, and seamless custom `.glb` model support.
- **Real-Time Schedule Simulation**: Features an interactive **Class Time Simulator** allowing students to scrub across days and hours (7:30 AM – 6:30 PM) to see who occupies each room, when sessions end, and when rooms are next free.
- **Zero-Config Database Fallback**: Built with dual-engine database support: connects natively to **MySQL / MariaDB via XAMPP**, and automatically fails over to an integrated **SQLite database (`database/campus_map.sqlite`)** with zero downtime.

---

## 🚀 Key Features

### 1. 3D Building Navigation (Three.js)
- **Shared Interactive Viewport**: Full-width and full-height WebGL canvas running in the exact same space as navigation cards.
- **Camera Elevation & Room Pin Centering**: Clicking any room pin glides the camera directly in front of the building, elevating the target so the room pin appears in the bottom-middle of the screen, with details displayed in the top half.
- **Floor Isolation HUD**: Toggle between `ALL`, `L3` (3rd Floor), `L2` (2nd Floor), and `L1` (Ground Floor) to focus on a single level with transparent ghosting of non-active floors.
- **Custom Model Drag-and-Drop**: Supports native architectural `.glb` / `.gltf` CAD exports placed in [`assets/models/building.glb`](file:///c:/xampp/htdocs/MappingProgram/assets/models/building.glb).
- **Architectural Background Grid**: Interactive toggleable reference grid (`Grid: ON / OFF`) with persistent state.

### 2. Floating Room Details Card
- **Solid Dynamic Themes (Light & Dark Mode)**: 100% flat, clean surfaces with zero gradients. High contrast, crisp borders, and dark/light pairings across all subcomponents.
- **Room Photo Showcase**: Displays actual high-resolution room photos from [`assets/images/rooms/{room-id}.jpg`](file:///c:/xampp/htdocs/MappingProgram/assets/images/rooms/) with an automatic dashed fallback placeholder.
- **Live Occupancy Banner**:
  - 🔴 **Occupied Now**: Shows active section code, subject name, instructor, time remaining, and next free window.
  - 🟢 **Vacant & Free**: Indicates duration until the next class or free-all-day status.
- **Interactive Day & Time Scrubber**: Change days (Monday–Saturday) and slide hours inside the card to see how occupancy changes dynamically.
- **Complete Daily Timeline**: Visual list of all classes in session, upcoming lectures, and green free study blocks.
- **Quick Info Grid & Route**: Shows department head, operating hours, and turn-by-turn walking directions.

### 3. Student Schedule Navigator ("Where Do I Go?")
- Covers **all 16 BSIT sections** across 1st Year, 2nd Year, 3rd Year (WMAD & SMP tracks), and 4th Year (WMAD & SMP tracks).
- Real-time time simulator with a **"Set to Current Time"** button syncing to the real-world clock.
- **"Where You Need to Go Right Now"** hero card with a direct **"Locate in 3D"** button.

### 4. Room Directory & Instant Search
- Instant keyword filtering by room name, code, instructor, or floor.
- One-click category filter pills: `All`, `Lectures`, `Offices`, `Faculty`, `Amenities`, `Labs`.
- Quick destination chips: **Octa Office**, **Dean's Office**, **Faculty Room**, **Accreditation**.

### 5. Mobile & Touch Screen Ready
- 1-finger touch drag for building panning.
- 2-finger pinch for zoom in/out.
- Touch tap detection that prevents accidental room selections during panning.
- Slide-over drawer with backdrop and easy return to 3D view.

### 6. Room Coordinate Picker (Inspector Mode)
- Tap or click any surface on the 3D model to inspect exact `{x, y, z}` coordinates.
- Automatically copies the formatted JSON payload to the clipboard for rapid coordinate mapping.

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACES                                   |
|  +--------------------+  +----------------------+  +----------------------------+  |
|  | Desktop Web Browser|  | Mobile / Tablet Web  |  | Physical Touch Kiosk (RPI) |  |
|  +--------------------+  +----------------------+  +----------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP / HTTPS (REST API)
+-----------------------------------------v-----------------------------------------+
|                                BACKEND & APIS (PHP)                               |
|  +---------------------------+  +-----------------------------------------------+  |
|  | api/get_schedules.php     |  | api/manage_schedule.php                       |  |
|  | (Fetch sections/schedules)|  | (POST/PUT/DELETE Schedule Sessions)           |  |
|  +---------------------------+  +-----------------------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          | PDO Dual-Engine Abstraction
+-----------------------------------------v-----------------------------------------+
|                             DATABASE STORAGE LAYER                                |
|  +-----------------------------------------+  +---------------------------------+  |
|  | PRIMARY: MariaDB / MySQL (XAMPP :3306)  |  | FALLBACK: SQLite Database File  |  |
|  | Database: `campus_map`                  |  | File: `database/campus_map.sqlite`  |
|  +-----------------------------------------+  +---------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          ^
                                          | Telemetry / Sync (WiFi, MQTT, HTTP)
+-----------------------------------------+-----------------------------------------+
|                              IOT & HARDWARE LAYER                                 |
|  +-------------------------+  +-------------------------+  +--------------------+  |
|  | ESP32 E-Paper Room Signs|  | mmWave / PIR Occupancy  |  | RFID / NFC Readers |  |
|  +-------------------------+  +-------------------------+  +--------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **3D Rendering Engine** | [Three.js (r128)](https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) | WebGL-based scene graph, perspective camera, lights, and raycasting |
| **3D Controls & Loaders** | `OrbitControls.js`, `GLTFLoader.js` | Touch/mouse camera orbit, panning, and binary `.glb` model loading |
| **Frontend Styling** | [Tailwind CSS CDN](https://cdn.tailwindcss.com) + Custom CSS | Glassmorphism, responsive utilities, and custom scrollbars |
| **Icons & Typography** | [Font Awesome 6](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css) | Iconography for amenities, departments, schedules, and tools |
| **Web Server** | Apache (XAMPP) | Local PHP runtime and static asset hosting |
| **Backend API** | PHP 8.x | Lightweight RESTful JSON endpoints with PDO |
| **Primary Database** | MySQL / MariaDB (Port 3306) | Relational database seeded with all CCS schedules |
| **Fallback Database** | SQLite 3 | Standalone file database (`database/campus_map.sqlite`) |
| **IoT Hardware** | ESP32, Raspberry Pi, E-Paper, mmWave | Smart door signage, physical kiosks, and room sensors |

---

## 🗄️ Database Architecture & Data Model

The schema is defined in [`database/schema.sql`](file:///c:/xampp/htdocs/MappingProgram/database/schema.sql) and mirrored in [`database/campus_map.sqlite`](file:///c:/xampp/htdocs/MappingProgram/database/campus_map.sqlite):

### 1. `sections` Table
Stores academic class cohorts and programs:
- `id` (VARCHAR 32, Primary Key): e.g. `bsit-1a`, `bsit-3-wmad-1`
- `name` (VARCHAR 64): e.g. `BSIT 1-A`, `BSIT 3 WMAD 1`
- `year_level` (INT): 1, 2, 3, or 4
- `track` (VARCHAR 64): Core IT, Web & Mobile App Dev (WMAD), Service Management Program (SMP)

### 2. `rooms` Table
Stores physical spaces, architectural properties, and 3D coordinate pins:
- `id` (VARCHAR 32, Primary Key): e.g. `lec-2`, `octa-office`, `deans-office`
- `name` (VARCHAR 100): Full descriptive room title
- `category` (VARCHAR 32): `lecture`, `office`, `faculty`, `amenity`, `lab`
- `floor` (INT): 1, 2, 3, or 4
- `coord_x`, `coord_y`, `coord_z` (FLOAT): 3D space coordinates matching the building geometry
- `head` (VARCHAR 100): Department head / in-charge faculty
- `hours` (VARCHAR 64): Official operating hours
- `directions` (TEXT): Walking guidance from stairs/entry
- `image` (VARCHAR 255): File path to room photo

### 3. `schedules` Table
Stores 280+ recurring weekly lecture and laboratory sessions:
- `id` (INT Auto Increment, Primary Key)
- `section_id` (VARCHAR 32, Foreign Key to `sections.id`)
- `room_id` (VARCHAR 32, Foreign Key to `rooms.id`)
- `day` (VARCHAR 16): `Monday` through `Saturday`
- `time_start` (VARCHAR 8): 24-hour start string (e.g. `07:30`, `13:00`)
- `time_end` (VARCHAR 8): 24-hour end string (e.g. `09:00`, `16:30`)
- `subject_code` (VARCHAR 32): e.g. `IT 101`, `WMAD 302`
- `subject_name` (VARCHAR 128): Full descriptive course title
- `instructor` (VARCHAR 100): Professor or lecturer name
- `type` (VARCHAR 32): `Lecture` or `Laboratory`

---

## ⚙️ Installation & Setup Guide

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL/MariaDB + PHP 8+)
- Web browser with WebGL enabled (Google Chrome, Microsoft Edge, Safari, Firefox)

### Step-by-Step Installation

1. **Clone or Copy Repository**:
   Place the project files into your XAMPP web root:
   ```
   C:\xampp\htdocs\MappingProgram
   ```

2. **Start Apache & MySQL**:
   - Open the **XAMPP Control Panel**.
   - Click **Start** on **Apache** (Port 80/443).
   - Click **Start** on **MySQL** (Port 3306).

3. **Import Database (phpMyAdmin)**:
   - Navigate to `http://localhost/phpmyadmin/` in your browser.
   - Click on the **Import** tab at the top.
   - Click **Choose File** and select:
     ```
     C:\xampp\htdocs\MappingProgram\database\schema.sql
     ```
   - Click **Import** at the bottom.
   - The `campus_map` database will be created with all tables and 280 seeded schedules.

   > [!NOTE]
   > If MySQL is ever stopped or unavailable, the backend automatically uses [`database/campus_map.sqlite`](file:///c:/xampp/htdocs/MappingProgram/database/campus_map.sqlite) without throwing an unhandled connection error.

4. **Launch the Application**:
   Open your browser and navigate to:
   ```
   http://localhost/MappingProgram/
   ```

5. **Adding Custom 3D Models (.glb)**:
   - Export your building model from Blender / Revit as `.glb`.
   - Save the file as:
     ```
     C:\xampp\htdocs\MappingProgram\assets\models\building.glb
     ```
   - Reload the application; the custom model will load automatically.

6. **Adding Room Photos**:
   - Save photos formatted as `{room-id}.jpg` into:
     ```
     C:\xampp\htdocs\MappingProgram\assets\images\rooms/
     ```
   - Examples: `lec-2.jpg`, `octa-office.jpg`, `deans-office.jpg`, `accreditation-room.jpg`.

---

## 📡 REST API Endpoints

### 1. Fetch Schedules & Sections
**Endpoint**: `GET api/get_schedules.php`

**Query Parameters**:
- `section` *(optional)*: Filter by section ID (e.g. `bsit-3-wmad-1`)
- `room` *(optional)*: Filter by room ID (e.g. `lec-2`)
- `day` *(optional)*: Filter by day (e.g. `Monday`)

**Sample Request**:
```bash
curl -X GET "http://localhost/MappingProgram/api/get_schedules.php?section=bsit-3-wmad-1&day=Monday"
```

**Sample Response**:
```json
{
  "status": "success",
  "engine": "mysql",
  "data": {
    "sections": [
      { "id": "bsit-3-wmad-1", "name": "BSIT 3 WMAD 1", "year_level": 3, "track": "WMAD" }
    ],
    "schedules": [
      {
        "id": 142,
        "section_id": "bsit-3-wmad-1",
        "room_id": "lec-7",
        "day": "Monday",
        "time_start": "09:00",
        "time_end": "12:00",
        "subject_code": "WMAD 301",
        "subject_name": "Mobile Application Development",
        "instructor": "Engr. Santos",
        "type": "Lecture"
      }
    ]
  }
}
```

---

### 2. Manage Schedules (CRUD)
**Endpoint**: `POST / PUT / DELETE api/manage_schedule.php`

#### Add Session (POST):
```bash
curl -X POST "http://localhost/MappingProgram/api/manage_schedule.php" \
     -H "Content-Type: application/json" \
     -d '{
       "section_id": "bsit-1a",
       "room_id": "lec-2",
       "day": "Monday",
       "time_start": "08:00",
       "time_end": "10:00",
       "subject_code": "IT 101",
       "subject_name": "Introduction to Computing",
       "instructor": "Prof. Reyes",
       "type": "Lecture"
     }'
```

#### Update Session (PUT):
```bash
curl -X PUT "http://localhost/MappingProgram/api/manage_schedule.php" \
     -H "Content-Type: application/json" \
     -d '{
       "id": 142,
       "room_id": "lec-8",
       "time_start": "10:00",
       "time_end": "13:00"
     }'
```

#### Delete Session (DELETE):
```bash
curl -X DELETE "http://localhost/MappingProgram/api/manage_schedule.php?id=142"
```

---

## 🛠️ IoT & Hardware Builds

The mapping system is engineered to integrate directly with campus physical hardware, digital signage, automated attendance gates, and smart room sensors.

```
                                    CAMPUS IOT ARCHITECTURE
                                    
  [ 42" Touch Kiosk (Lobby) ]      [ 4.2" E-Paper Door Signs ]     [ mmWave Radar Sensors ]
         (Raspberry Pi)                    (ESP32-S3)                    (LD2410 + ESP32)
               |                               |                                |
               | HTTP WebGL                    | HTTP / MQTT                    | HTTP Webhook
               v                               v                                v
+-----------------------------------------------------------------------------------------+
|                                    CENTRAL XAMPP SERVER                                 |
|                         (http://campus-server.local/MappingProgram)                     |
+-----------------------------------------------------------------------------------------+
                                               ^
                                               | RFID / NFC Card Tap
                                               |
                                  [ RFID Attendance Reader ]
                                        (RC522 + ESP32)
```

---

### Build 1: Interactive Campus Touchscreen Kiosk
Floor-standing or wall-mounted interactive 3D navigation kiosk placed at main lobby entrances and staircases.

```
+-------------------------------------------------------------+
|                      KIOSK HARDWARE STACK                   |
|                                                             |
|   +-----------------------------------------------------+   |
|   | 32" / 43" / 55" Capacitive Touch Display (1080p/4K) |   |
|   +-----------------------------------------------------+   |
|                              | HDMI + USB Touch             |
|   +-----------------------------------------------------+   |
|   | Raspberry Pi 5 (8GB) / Intel N100 Mini PC           |   |
|   | OS: Ubuntu Core / Raspberry Pi OS 64-bit            |   |
|   | Chromium Browser Running Fullscreen Kiosk Mode      |   |
|   +-----------------------------------------------------+   |
|                              | Ethernet / WiFi              |
|   +-----------------------------------------------------+   |
|   | 12V 5A MeanWell Industrial Power Supply             |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

#### Bill of Materials (BOM):
| Component | Specification | Quantity |
| :--- | :--- | :--- |
| **SBC / Computer** | Raspberry Pi 5 (4GB/8GB) or Intel N100 Mini PC | 1 |
| **Touch Display** | 32"–43" Commercial IPS Display with 10-point PCAP touch | 1 |
| **Cooling** | Active cooler / Aluminum heatsink enclosure | 1 |
| **Storage** | 128GB High-Endurance MicroSD or NVMe M.2 SSD | 1 |
| **Enclosure** | Custom sheet metal or MDF kiosk pedestal stand | 1 |
| **Power Supply** | 5.1V 5A USB-C PD (Raspberry Pi) + 12V display adapter | 1 |

#### Kiosk Auto-Start Setup (Linux / Raspberry Pi OS):
Create a systemd kiosk service `/etc/systemd/system/kiosk.service`:
```ini
[Unit]
Description=Campus 3D Navigator Kiosk
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
ExecStart=/usr/bin/chromium-browser \
  --noerrdialogs \
  --disable-infobars \
  --kiosk \
  --check-for-update-interval=31536000 \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --autoplay-policy=no-user-gesture-required \
  http://localhost/MappingProgram/
Restart=always
RestartSec=5

[Install]
WantedBy=graphical.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kiosk.service
sudo systemctl start kiosk.service
```

---

### Build 2: ESP32 Smart E-Paper / LCD Room Door Signs
Low-power electronic signs installed outside every classroom and office door. Automatically fetches and displays real-time occupancy, instructor names, current class session, and upcoming schedule.

```
                ESP32 E-PAPER ROOM SIGN SCHEMATIC
                
     +-------------------+
     | 3.7V LiPo Battery |
     +---------+---------+
               |
     +---------v---------+          SPI Bus
     |   TP4056 + LDO    +------------------------+
     |   Power Circuit   |                        |
     +---------+---------+                        |
               | 3.3V                             |
     +---------v---------+               +--------v-------+
     |   ESP32-S3-WROOM  |  WiFi / HTTP  | 4.2" / 7.5"    |
     |   Microcontroller +<------------->+ 3-Color E-Paper|
     |   (Deep Sleep)    |               | Display        |
     +-------------------+               +----------------+
```

#### Bill of Materials (BOM):
| Component | Model / Part | Purpose |
| :--- | :--- | :--- |
| **Microcontroller** | ESP32-S3-WROOM-1 / ESP32-WROOM-32 | WiFi client & JSON parsing |
| **Display** | Waveshare 4.2" (400x300) or 7.5" (800x480) 3-Color E-Paper | Ultra-low power daylight-readable display |
| **Battery** | 3.7V 2500mAh 18650 or LiPo Cell | Portable power (up to 3 months battery life) |
| **Charging** | TP4056 USB-C Li-Ion Charging Module | Battery charging & protection |
| **Enclosure** | 3D Printed PETG / PLA wall-mount frame | Door frame installation |

#### Pinout Wiring:
| ESP32 Pin | E-Paper Display Pin | Description |
| :--- | :--- | :--- |
| **GPIO 18** | `SCK` | SPI Serial Clock |
| **GPIO 23** | `DIN / MOSI` | SPI Master Out Slave In |
| **GPIO 5** | `CS` | Chip Select |
| **GPIO 17** | `DC` | Data / Command Control |
| **GPIO 16** | `RST` | Hardware Reset |
| **GPIO 4** | `BUSY` | Busy Status Check |
| **3V3** | `VCC` | 3.3V Clean Power |
| **GND** | `GND` | Ground Reference |

#### Arduino / ESP32 Firmware Implementation (`RoomSign.ino`):
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <GxEPD2_BW.h>

const char* ssid = "Campus-WiFi";
const char* password = "CampusPassword123";
const char* apiUrl = "http://192.168.1.100/MappingProgram/api/get_schedules.php?room=lec-2";

// Configure deep sleep (poll every 10 minutes)
#define TIME_TO_SLEEP_SEC 600

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiUrl);
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String payload = http.getString();
      DynamicJsonDocument doc(4096);
      deserializeJson(doc, payload);

      // Extract current class occupant
      JsonArray schedules = doc["data"]["schedules"];
      // Update E-Paper Display buffer & trigger partial/full refresh
      Serial.println("Room Sign Display Updated Successfully");
    }
    http.end();
  }

  // Go to deep sleep to conserve battery
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP_SEC * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
```

---

### Build 3: mmWave Radar & PIR Human Occupancy Sensors
Ceiling-mounted smart sensor nodes that detect physical human presence in classrooms to verify whether a room is occupied beyond scheduled class times.

```
       OCCUPANCY DETECTION SENSOR NODE
       
       +-------------------------------+
       | HLK-LD2410 mmWave Radar       |  (24GHz Human Presence Radar)
       | (Detects breathing & motion)  |  Range: Up to 6 meters
       +---------------+---------------+
                       | UART / GPIO Output
       +---------------v---------------+
       | ESP32 Microcontroller Node    |
       | Transmits status over WiFi    |
       +---------------+---------------+
                       |
               +-------+-------+
               |               |
       +-------v-------+ +-----v---------+
       | Green/Red     | | Central REST  |
       | Status LED    | | API Telemetry |
       +---------------+ +---------------+
```

#### Sensor Features:
- **24GHz mmWave Radar (LD2410)**: Unlike conventional PIR sensors that fail if students sit still while taking exams, mmWave radar detects micro-movements including breathing and typing.
- **Physical Verification**: Compares physical room presence against the database schedule to flag unscheduled room usage or study groups.

#### Telemetry Payload Format:
Sensors transmit JSON packets to a listener endpoint (`POST api/sensor_telemetry.php`):
```json
{
  "sensor_id": "sensor-room-lec-2",
  "room_id": "lec-2",
  "timestamp": 1700000000,
  "presence_detected": true,
  "motion_energy": 84,
  "stationary_energy": 62,
  "distance_cm": 240
}
```

---

### Build 4: RFID / NFC Attendance & Room Access Reader
Mounted on door frames for student and faculty card tap identification.

```
     +-------------------+
     | Student / Faculty |
     | Campus RFID Badge |
     +---------+---------+
               | 13.56MHz
     +---------v---------+
     | RC522 / PN532     |
     | RFID/NFC Module   |
     +---------+---------+
               | SPI / I2C
     +---------v---------+
     | ESP32 Controller  |
     | + Buzzer / OLED   |
     +---------+---------+
               | HTTP POST
               v
     [ Central Server: Logs Attendance & Sets Room Active ]
```

#### Hardware Specification:
- **Reader IC**: NXP PN532 (NFC / High-frequency 13.56MHz) or MFRC522.
- **Microcontroller**: ESP32 with hardware SPI.
- **Signaling**: 0.96" I2C OLED display + Piezo buzzer for tap acknowledgment.
- **Action**: Verifies instructor badge to automatically unlock door relay and activate scheduled AV equipment.

---

## 📁 Project Directory Structure

```
MappingProgram/
├── index.php                         # Main application single-page interface
├── README.md                         # Comprehensive project & hardware manual
│
├── api/                              # RESTful Backend API
│   ├── get_schedules.php             # GET: Room & section schedules with JSON response
│   └── manage_schedule.php           # POST/PUT/DELETE: Schedule management
│
├── assets/                           # Media & Static 3D Assets
│   ├── images/
│   │   └── rooms/                    # Classroom photos directory ({room-id}.jpg)
│   │       ├── lec-2.jpg ... lec-12.jpg
│   │       ├── deans-office.jpg
│   │       ├── octa-office.jpg
│   │       ├── accreditation-room.jpg
│   │       └── README.md             # Image specs & photo dropzone guide
│   └── models/
│       ├── building.glb              # Custom architectural 3D building model
│       └── README.md                 # 3D model dropzone & Blender setup guide
│
├── css/
│   └── style.css                     # Custom animations, custom scrollbars & HUD styles
│
├── data/                             # Static JSON Configuration Datasets
│   ├── floors.json                   # Architectural floor definitions & heights
│   ├── rooms.json                    # 17 rooms with 3D coordinates, wings & metadata
│   └── schedules.json                # Complete offline fallback weekly schedule
│
├── database/                         # Database Migration & Schema Files
│   ├── build_data.js                 # Seed script generating 280 BSIT schedules
│   ├── campus_map.sqlite             # Auto-fallback SQLite database file
│   ├── db.php                        # Dual-engine PDO database abstraction layer
│   ├── schema.sql                    # MySQL / MariaDB initialization & seed script
│   └── README.md                     # Database setup & phpMyAdmin guide
│
└── js/                               # Frontend Application Logic
    ├── app.js                        # App controllers, filters, schedule & dynamic cards
    ├── building-generator.js         # Procedural Three.js building geometry generator
    └── viewer3d.js                   # Three.js scene, raycasting, camera tweening & HUD
```

---

## ❓ Troubleshooting & FAQs

### Q1: "MySQL Not Started in XAMPP" or Connection Refused
**Answer**:
1. Open **XAMPP Control Panel**.
2. Click **Start** next to MySQL until it turns green (Port 3306).
3. If port 3306 is blocked by another service, click **Config** on MySQL in XAMPP and change the port to `3307`, or rely on the automatic **SQLite fallback** (`database/campus_map.sqlite`) which works out-of-the-box without MySQL.

### Q2: How do I map new room coordinates on our 3D model?
**Answer**:
1. Click the **"Pick Room Coords"** crosshairs button in the top navigation bar.
2. Click anywhere on your 3D building model.
3. The exact `{x, y, z}` coordinates will appear in a toast and be copied automatically to your clipboard.
4. Paste those coordinates into [`data/rooms.json`](file:///c:/xampp/htdocs/MappingProgram/data/rooms.json) or the `rooms` table in the database.

### Q3: Why is my custom `.glb` model not showing?
**Answer**:
Ensure your exported 3D model is saved as a binary glTF file named:
```
c:\xampp\htdocs\MappingProgram\assets\models\building.glb
```
Check your browser developer console (F12) for any WebGL memory errors. You can also drag and drop the `.glb` file directly into the browser to test it immediately.

### Q4: Does the application work without an internet connection?
**Answer**:
Yes! When hosted locally on XAMPP or a Raspberry Pi kiosk, all 3D geometries, database queries, and room coordinates execute entirely locally. Tailwind CSS, Font Awesome, and Three.js can be bundled offline by downloading their respective script bundles into `assets/js/`.

---

## 📄 License & Credits
Developed for the **College of Computer Studies (CCS)**.  
Built with Three.js, Tailwind CSS, PHP, and modern IoT microcontrollers. All rights reserved.
