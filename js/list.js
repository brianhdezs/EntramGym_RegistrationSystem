document.addEventListener('DOMContentLoaded', async () => {
    const clientTableBody = document.getElementById('clientTableBody');
    const searchInput = document.getElementById('searchInput');
    const editClientModal = new bootstrap.Modal(document.getElementById('editClientModal'));
    const editClientForm = document.getElementById('editClientForm');

    // Toasts
    const successToast = new bootstrap.Toast(document.getElementById('successToast'));
    const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
    const confirmToast = new bootstrap.Toast(document.getElementById('confirmToast'));
    const successToastBody = document.getElementById('successToastBody');
    const errorToastBody = document.getElementById('errorToastBody');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    let clientIdToDelete = null;
    let clientsData = []; // 🔴 Guardamos los clientes aquí para búsqueda

    function showSuccessToast(message) {
        successToastBody.textContent = message;
        successToast.show();
    }

    function showErrorToast(message) {
        errorToastBody.textContent = message;
        errorToast.show();
    }

    function showConfirmToast(id) {
        clientIdToDelete = id;
        confirmToast.show();
    }

    async function loadClients() {
        try {
            const response = await fetch('http://localhost:3000/clients');
            clientsData = await response.json(); // Guardamos la lista de clientes
            renderClients(clientsData); // Renderizamos los clientes
        } catch (error) {
            console.error('❌ Error al cargar los clientes:', error);
            showErrorToast("Error al cargar los clientes.");
        }
    }

    function renderClients(filteredClients) {
        clientTableBody.innerHTML = '';

        filteredClients.forEach(client => {
            const row = document.createElement('tr');

            const today = new Date().toISOString().split('T')[0];
            const isExpired = client.expirationDate < today;

            if (isExpired) {
                row.classList.add("table-danger");
            }

            row.innerHTML = `
                <td><img src="/uploads/${client.photo}" class="rounded-circle" width="50" height="50"></td>
                <td>${client.name}</td>
                <td>${client.registrationDate}</td>
                <td>${client.expirationDate}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" 
                        data-id="${client.id}" 
                        data-name="${client.name}" 
                        data-registration="${client.registrationDate}" 
                        data-expiration="${client.expirationDate}" 
                        data-photo="${client.photo}">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${client.id}">Eliminar</button>
                </td>
            `;

            clientTableBody.appendChild(row);
        });

        addEventListeners();
    }

    function addEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                document.getElementById('editClientId').value = this.getAttribute('data-id');
                document.getElementById('editClientName').value = this.getAttribute('data-name');
                document.getElementById('editRegistrationDate').value = this.getAttribute('data-registration');
                document.getElementById('editExpirationDate').value = this.getAttribute('data-expiration');
                document.getElementById('editPhotoPreview').src = this.getAttribute('data-photo') ? `/uploads/${this.getAttribute('data-photo')}` : '/images/profile_img_placeholder.jpg';

                editClientModal.show();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                const clientId = this.getAttribute('data-id');
                showConfirmToast(clientId);
            });
        });
    }

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!clientIdToDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/clients/${clientIdToDelete}`, { method: 'DELETE' });

            if (response.ok) {
                showSuccessToast("Cliente eliminado correctamente.");
                loadClients();
            } else {
                showErrorToast("Error al eliminar cliente.");
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            showErrorToast("Error al eliminar cliente.");
        } finally {
            confirmToast.hide();
        }
    });

    editClientForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const clientId = document.getElementById('editClientId').value;
        const clientName = document.getElementById('editClientName').value;
        const registrationDate = document.getElementById('editRegistrationDate').value;
        const expirationDate = document.getElementById('editExpirationDate').value;
        const photoInput = document.getElementById('editPhoto').files[0];

        const formData = new FormData();
        formData.append('clientName', clientName);
        formData.append('registrationDate', registrationDate);
        formData.append('expirationDate', expirationDate);
        if (photoInput) {
            formData.append('photo', photoInput);
        }

        try {
            const response = await fetch(`http://localhost:3000/clients/${clientId}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                showSuccessToast("Cliente actualizado correctamente.");
                editClientModal.hide();
                editClientForm.reset();
                loadClients();
            } else {
                showErrorToast("Error al actualizar cliente.");
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            showErrorToast("Error al actualizar cliente.");
        }
    });

    // 🔍 FUNCIONALIDAD DE LA BARRA DE BÚSQUEDA
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === "") {
            renderClients(clientsData); // Si el input está vacío, mostramos todos los clientes
        } else {
            const filteredClients = clientsData.filter(client =>
                client.name.toLowerCase().includes(query)
            );
            renderClients(filteredClients);
        }
    });

    loadClients();
});
