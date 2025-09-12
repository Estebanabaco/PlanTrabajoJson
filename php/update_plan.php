<?php
// Establece que la respuesta será en formato JSON.
header('Content-Type: application/json');

// --- CONFIGURACIÓN DE SEGURIDAD Y RUTA ---

// Carga la configuración que contiene la clave secreta.
// Este archivo no está en el repositorio de Git por seguridad.
require_once __DIR__ . '/config.php';

// Ruta al archivo JSON que se va a actualizar.
$json_file_path = __DIR__ . '/../json/plan.json';


// --- BLOQUE DE VALIDACIÓN Y SEGURIDAD ---

// 1. Verificar la clave secreta (API Key).
// La clave debe ser enviada en una cabecera llamada 'X-API-KEY'.
$api_key_header = isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '';

if ($api_key_header !== $secret_api_key) {
    http_response_code(403); // Forbidden
    echo json_encode(['status' => 'error', 'message' => 'Acceso no autorizado. La API Key es inválida o no fue proporcionada.']);
    exit;
}

// 2. Aceptar únicamente peticiones con el método POST.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido. Solo se aceptan peticiones POST.']);
    exit;
}


// --- LÓGICA PRINCIPAL DEL API ---

// 3. Leer el cuerpo de la petición (que se espera sea el JSON).
$json_data = file_get_contents('php://input');

// 4. Validar si el string recibido es un JSON válido.
json_decode($json_data);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Los datos recibidos no son un JSON válido.']);
    exit;
}

// 5. Intentar escribir el nuevo contenido en el archivo plan.json.
if (file_put_contents($json_file_path, $json_data) !== false) {
    http_response_code(200); // OK
    echo json_encode(['status' => 'success', 'message' => 'El plan de trabajo ha sido actualizado correctamente.']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'Error interno: No se pudo escribir en el archivo de destino.']);
}

?>
