<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../database/db.php';

try {
    $pdo = Database::getConnection();
    $driver = Database::getDriverType();

    $requestedSection = isset($_GET['section']) ? trim($_GET['section']) : null;

    // Fetch Sections
    if ($requestedSection) {
        $secStmt = $pdo->prepare("SELECT * FROM sections WHERE id = ? ORDER BY year_level ASC, code ASC");
        $secStmt->execute([$requestedSection]);
    } else {
        $secStmt = $pdo->query("SELECT * FROM sections ORDER BY year_level ASC, code ASC");
    }
    $sections = $secStmt->fetchAll();

    if (empty($sections)) {
        // Fallback to static JSON file if DB query returned nothing
        $jsonPath = __DIR__ . '/../data/schedules.json';
        if (file_exists($jsonPath)) {
            echo file_get_contents($jsonPath);
            exit;
        }
        echo json_encode([]);
        exit;
    }

    // Fetch all schedule items joined with room details
    $sql = "
        SELECT 
            s.id AS schedule_id,
            s.section_id,
            sec.code AS section_code,
            sec.name AS section_name,
            s.day_of_week,
            s.subject_code,
            s.subject_name,
            s.time_start,
            s.time_end,
            s.display_time,
            s.room_id,
            s.instructor,
            s.type,
            r.name AS room_name,
            r.code AS room_code,
            r.floor AS room_floor,
            r.color AS room_color
        FROM schedules s
        LEFT JOIN sections sec ON s.section_id = sec.id
        LEFT JOIN rooms r ON s.room_id = r.id
    ";

    if ($requestedSection) {
        $sql .= " WHERE s.section_id = ? ORDER BY s.time_start ASC";
        $schedStmt = $pdo->prepare($sql);
        $schedStmt->execute([$requestedSection]);
    } else {
        $sql .= " ORDER BY s.section_id ASC, s.time_start ASC";
        $schedStmt = $pdo->query($sql);
    }

    $allScheduleRows = $schedStmt->fetchAll();

    // Group schedules by section_id -> day_of_week
    $groupedBySection = [];
    foreach ($allScheduleRows as $row) {
        $secId = $row['section_id'];
        $day = $row['day_of_week'];

        if (!isset($groupedBySection[$secId])) {
            $groupedBySection[$secId] = [
                'Monday' => [],
                'Tuesday' => [],
                'Wednesday' => [],
                'Thursday' => [],
                'Friday' => [],
                'Saturday' => [],
                'Sunday' => []
            ];
        }

        $groupedBySection[$secId][$day][] = [
            'id' => (int)$row['schedule_id'],
            'sectionId' => $secId,
            'sectionCode' => $row['section_code'] ?? $secId,
            'sectionName' => $row['section_name'] ?? '',
            'subjectCode' => $row['subject_code'],
            'subjectName' => $row['subject_name'],
            'timeStart' => $row['time_start'],
            'timeEnd' => $row['time_end'],
            'displayTime' => $row['display_time'],
            'roomId' => $row['room_id'],
            'roomName' => $row['room_name'] ?? $row['room_id'],
            'roomCode' => $row['room_code'] ?? $row['room_id'],
            'floor' => (int)($row['room_floor'] ?? 1),
            'instructor' => $row['instructor'],
            'type' => $row['type']
        ];
    }

    // Format output matching client structure
    $result = [];
    foreach ($sections as $sec) {
        $secId = $sec['id'];
        $days = $groupedBySection[$secId] ?? [
            'Monday' => [],
            'Tuesday' => [],
            'Wednesday' => [],
            'Thursday' => [],
            'Friday' => []
        ];

        // Clean out empty weekend days if no classes
        if (empty($days['Saturday'])) unset($days['Saturday']);
        if (empty($days['Sunday'])) unset($days['Sunday']);

        $result[] = [
            'programId' => $sec['id'],
            'programCode' => $sec['code'],
            'programName' => $sec['name'],
            'yearLevel' => (int)$sec['year_level'],
            'track' => $sec['track'],
            'semester' => '1st Semester, A.Y. 2026-2027',
            'days' => $days
        ];
    }

    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    // If database connection fails, fall back smoothly to data/schedules.json
    $jsonPath = __DIR__ . '/../data/schedules.json';
    if (file_exists($jsonPath)) {
        echo file_get_contents($jsonPath);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
