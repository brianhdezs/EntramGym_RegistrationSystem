<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_FILES["image"]) && isset($_POST["fileName"])) {
        $fileName = basename($_POST["fileName"]);
        $uploadDir = "../src/images/images_clients/";

        // Verificar si la carpeta existe, si no, crearla
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Ruta completa de la imagen
        $filePath = $uploadDir . $fileName;

        // Guardar la imagen
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $filePath)) {
            echo json_encode(["success" => true, "filePath" => $filePath]);
        } else {
            echo json_encode(["success" => false, "error" => "No se pudo guardar la imagen"]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
}
?>
