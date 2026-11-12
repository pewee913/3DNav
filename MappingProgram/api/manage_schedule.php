<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../database/db.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    if ($method === 'POST') {
        // Add new class schedule item
        $sectionId = trim($data['section_id'] ?? '');
        $dayOfWeek = trim($data['day_of_week'] ?? '');
        $subjectCode = trim($data['subject_code'] ?? '');
        $subjectName = trim($data['subject_name'] ?? '');
        $timeStart = trim($data['time_start'] ?? '');
        $timeEnd = trim($data['time_end'] ?? '');
        $displayTime = trim($data['display_time'] ?? "$timeStart - $timeEnd");
        $roomId = trim($data['room_id'] ?? '');
        $instructor = trim($data['instructor'] ?? 'TBA');
        $type = trim($data['type'] ?? 'Lecture');

        if (!$sectionId || !$dayOfWeek || !$subjectCode || !$timeStart || !$timeEnd || !$roomId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields (section_id, day_of_week, subject_code, time_start, time_end, room_id)']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO schedules (section_id, day_of_week, subject_code, subject_name, time_start, time_end, display_time, room_id, instructor, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $sectionId, $dayOfWeek, $subjectCode, $subjectName, $timeStart, $timeEnd, $displayTime, $roomId, $instructor, $type
        ]);
        $newId = $pdo->lastInsertId();

        echo json_encode(['success' => true, 'message' => 'Schedule session added successfully', 'id' => (int)$newId]);

    } elseif ($method === 'PUT') {
        // Update class schedule item
        $id = (int)($data['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Valid schedule ID is required for update']);
            exit;
        }

        $fields = [];
        $params = [];
        $updatable = ['section_id', 'day_of_week', 'subject_code', 'subject_name', 'time_start', 'time_end', 'display_time', 'room_id', 'instructor', 'type'];

        foreach ($updatable as $col) {
            if (isset($data[$col])) {
                $fields[] = "$col = ?";
                $params[] = trim($data[$col]);
            }
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No fields provided to update']);
            exit;
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE schedules SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Schedule updated successfully']);

    } elseif ($method === 'DELETE') {
        // Delete class schedule item
        $id = (int)($data['id'] ?? ($_GET['id'] ?? 0));
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Valid schedule ID is required for deletion']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM schedules WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Schedule deleted successfully']);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
