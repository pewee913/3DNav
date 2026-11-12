<?php
/**
 * Campus Interactive Map - Database Access Layer
 * Supports MySQL/MariaDB (via XAMPP) and automated SQLite fallback for 100% availability.
 */

class Database {
    private static ?PDO $pdo = null;
    private static string $driverType = 'unknown';

    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        // 1. Try MySQL Connection (Standard XAMPP default: root, no password)
        try {
            $host = '127.0.0.1';
            $dbName = 'campus_map';
            $user = 'root';
            $pass = '';
            
            // Connect without db first to create database if not exists
            $initPdo = @new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 2
            ]);
            $initPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            self::$pdo = new PDO("mysql:host=$host;dbname=$dbName;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            self::$driverType = 'mysql';

            // Check if tables exist, if not auto-seed
            $check = self::$pdo->query("SHOW TABLES LIKE 'sections'")->fetch();
            if (!$check) {
                self::seedDatabase();
            }

            return self::$pdo;
        } catch (Throwable $e) {
            // MySQL unavailable; fall through to SQLite
        }

        // 2. High-performance SQLite Fallback (Zero-configuration)
        $sqliteFile = __DIR__ . '/campus_map.sqlite';
        $isNewDb = !file_exists($sqliteFile);

        self::$pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        self::$driverType = 'sqlite';

        if ($isNewDb || filesize($sqliteFile) < 100) {
            self::seedDatabase();
        }

        return self::$pdo;
    }

    public static function getDriverType(): string {
        if (self::$pdo === null) {
            self::getConnection();
        }
        return self::$driverType;
    }

    private static function seedDatabase(): void {
        $pdo = self::$pdo;
        if (!$pdo) return;

        $isSqlite = (self::$driverType === 'sqlite');

        if ($isSqlite) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS sections (
                    id TEXT PRIMARY KEY,
                    code TEXT NOT NULL,
                    name TEXT NOT NULL,
                    year_level INTEGER NOT NULL,
                    track TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS rooms (
                    id TEXT PRIMARY KEY,
                    code TEXT NOT NULL,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    floor INTEGER NOT NULL,
                    wing TEXT,
                    head TEXT,
                    hours TEXT,
                    phone TEXT,
                    access TEXT,
                    coord_x REAL,
                    coord_y REAL,
                    coord_z REAL,
                    color TEXT
                );
                CREATE TABLE IF NOT EXISTS schedules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    section_id TEXT NOT NULL,
                    day_of_week TEXT NOT NULL,
                    subject_code TEXT NOT NULL,
                    subject_name TEXT NOT NULL,
                    time_start TEXT NOT NULL,
                    time_end TEXT NOT NULL,
                    display_time TEXT NOT NULL,
                    room_id TEXT NOT NULL,
                    instructor TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'Lecture'
                );
            ");
        } else {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS sections (
                    id VARCHAR(50) PRIMARY KEY,
                    code VARCHAR(50) NOT NULL,
                    name VARCHAR(150) NOT NULL,
                    year_level INT NOT NULL,
                    track VARCHAR(50) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS rooms (
                    id VARCHAR(50) PRIMARY KEY,
                    code VARCHAR(50) NOT NULL,
                    name VARCHAR(150) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    floor INT NOT NULL,
                    wing VARCHAR(100),
                    head VARCHAR(100),
                    hours VARCHAR(100),
                    phone VARCHAR(50),
                    access VARCHAR(100),
                    coord_x FLOAT,
                    coord_y FLOAT,
                    coord_z FLOAT,
                    color VARCHAR(20)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

                CREATE TABLE IF NOT EXISTS schedules (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    section_id VARCHAR(50) NOT NULL,
                    day_of_week VARCHAR(20) NOT NULL,
                    subject_code VARCHAR(50) NOT NULL,
                    subject_name VARCHAR(150) NOT NULL,
                    time_start VARCHAR(10) NOT NULL,
                    time_end VARCHAR(10) NOT NULL,
                    display_time VARCHAR(50) NOT NULL,
                    room_id VARCHAR(50) NOT NULL,
                    instructor VARCHAR(100) NOT NULL,
                    type VARCHAR(50) NOT NULL DEFAULT 'Lecture'
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
        }

        // Seed from rooms.json and schedules.json
        $roomsFile = __DIR__ . '/../data/rooms.json';
        $schedulesFile = __DIR__ . '/../data/schedules.json';

        if (file_exists($roomsFile)) {
            $rooms = json_decode(file_get_contents($roomsFile), true) ?: [];
            $stmt = $pdo->prepare("INSERT OR REPLACE INTO rooms (id, code, name, category, floor, wing, head, hours, phone, access, coord_x, coord_y, coord_z, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if (!$isSqlite) {
                $stmt = $pdo->prepare("INSERT INTO rooms (id, code, name, category, floor, wing, head, hours, phone, access, coord_x, coord_y, coord_z, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), floor=VALUES(floor), wing=VALUES(wing)");
            }
            foreach ($rooms as $r) {
                $coords = $r['coordinates'] ?? [];
                $stmt->execute([
                    $r['id'],
                    $r['code'] ?? '',
                    $r['name'] ?? '',
                    $r['category'] ?? '',
                    $r['floor'] ?? 1,
                    $r['wing'] ?? 'Campus Main',
                    $r['head'] ?? '',
                    $r['hours'] ?? '7:00 AM - 7:00 PM',
                    $r['phone'] ?? 'Campus Operator',
                    $r['access'] ?? '',
                    $coords['x'] ?? 0,
                    $coords['y'] ?? 0,
                    $coords['z'] ?? 0,
                    $r['color'] ?? '#0284c7'
                ]);
            }
        }

        if (file_exists($schedulesFile)) {
            $schedules = json_decode(file_get_contents($schedulesFile), true) ?: [];
            
            $secStmt = $pdo->prepare("INSERT OR REPLACE INTO sections (id, code, name, year_level, track) VALUES (?, ?, ?, ?, ?)");
            if (!$isSqlite) {
                $secStmt = $pdo->prepare("INSERT INTO sections (id, code, name, year_level, track) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)");
            }

            $schedStmt = $pdo->prepare("INSERT INTO schedules (section_id, day_of_week, subject_code, subject_name, time_start, time_end, display_time, room_id, instructor, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            foreach ($schedules as $sec) {
                $secStmt->execute([
                    $sec['programId'],
                    $sec['programCode'] ?? $sec['programId'],
                    $sec['programName'] ?? $sec['programId'],
                    $sec['yearLevel'] ?? 1,
                    $sec['track'] ?? 'Core'
                ]);

                if (isset($sec['days']) && is_array($sec['days'])) {
                    foreach ($sec['days'] as $dayName => $classList) {
                        foreach ($classList as $cls) {
                            $schedStmt->execute([
                                $sec['programId'],
                                $dayName,
                                $cls['subjectCode'],
                                $cls['subjectName'],
                                $cls['timeStart'],
                                $cls['timeEnd'],
                                $cls['displayTime'],
                                $cls['roomId'],
                                $cls['instructor'],
                                $cls['type'] ?? 'Lecture'
                            ]);
                        }
                    }
                }
            }
        }
    }
}
