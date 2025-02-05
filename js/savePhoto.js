async function saveClientPhoto(imageData, clientName, registrationDate) {
    try {
        // Reemplazar espacios con guiones bajos y eliminar caracteres especiales
        let formattedName = clientName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        let formattedDate = registrationDate.replace(/-/g, ""); // Eliminar guiones de la fecha

        let fileName = `${formattedName}_${formattedDate}.png`;

        // Crear FormData para enviar la imagen
        let formData = new FormData();
        formData.append("image", imageData);
        formData.append("fileName", fileName);

        // Enviar la imagen al servidor PHP
        let response = await fetch("/backend/savePhoto.php", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        if (result.success) {
            console.log("Foto guardada exitosamente:", result.filePath);
        } else {
            console.error("Error al guardar la foto:", result.error);
        }
    } catch (error) {
        console.error("Error al enviar la imagen al servidor:", error);
    }
}
