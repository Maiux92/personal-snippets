<?php

$dbFile = 'db/snippets.db';
$db = new PDO('sqlite:' . $dbFile);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("PRAGMA encoding = 'UTF-8'");

initializeDatabase($db);

handleDownloadRequest($db);

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRequest($db);
        break;

    case 'POST':
        handlePostRequest($db);
        break;

    case 'PUT':
        handlePutRequest($db);
        break;

    case 'DELETE':
        handleDeleteRequest($db);
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function initializeDatabase($db) {
    // Create 'snippets' table if it doesn't exist
    $db->exec("CREATE TABLE IF NOT EXISTS snippets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        language TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )");
}

function handleDownloadRequest($db){
    $dw = $_GET['dw'] ?? null;

    if($dw) {
        $stmt = $db->prepare("SELECT * FROM snippets WHERE id = ? LIMIT 1");
        $stmt->execute([$dw]);
        $snippet = $stmt->fetch();

        include('extensions.inc.php');

        $file_ext = $language_extensions[$snippet['language']] ?? '.txt';
        $file_name = $snippet['title'] . $file_ext;
        $file_content = $snippet['content'];

        header('Content-Type: text/plain');
        header('Content-Disposition: attachment; filename="' . $file_name . '"');
        header('Content-Length: ' . strlen($file_content));
        echo $file_content;
        exit;
    }
}


function handleGetRequest($db) {
    $stmt = $db->query("SELECT * FROM snippets ORDER BY updated_at DESC");
    $snippets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($snippets);
}

function handlePostRequest($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Check if title is unique
    $stmt = $db->prepare("SELECT COUNT(*) FROM snippets WHERE title = ?");
    $stmt->execute([$data['title']]);
    $titleCount = $stmt->fetchColumn();

    if ($titleCount > 0) {
        echo json_encode(['error' => 'Title must be unique']);
        return;
    }

    $stmt = $db->prepare("INSERT INTO snippets (title, language, content, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))");
    $stmt->execute([$data['title'], $data['language'], $data['content']]);

    echo json_encode(['success' => true]);
}

function handlePutRequest($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Check if title is unique and not the same as the current one
    $stmt = $db->prepare("SELECT COUNT(*) FROM snippets WHERE title = ? AND id != ?");
    $stmt->execute([$data['title'], $data['id']]);
    $titleCount = $stmt->fetchColumn();

    if ($titleCount > 0) {
        echo json_encode(['error' => 'Title must be unique']);
        return;
    }

    $stmt = $db->prepare("UPDATE snippets SET title = ?, language = ?, content = ?, updated_at = datetime('now') WHERE id = ?");
    $stmt->execute([$data['title'], $data['language'], $data['content'], $data['id']]);

    echo json_encode(['success' => true]);
}

function handleDeleteRequest($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $db->prepare("DELETE FROM snippets WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true]);
}

