document.addEventListener('DOMContentLoaded', async () => {
    const clientTableBody = document.getElementById('clientTableBody');
    const searchInput = document.getElementById('searchInput');
    const editClientModal = new bootstrap.Modal(document.getElementById('editClientModal'));
    const editClientForm = document.getElementById('editClientForm');

    async function loadClients() {
        try {
            const response = await fetch('http://localhost:3000/clients');
            const clients = await response.json();

            clientTableBody.innerHTML = '';

            clients.forEach(client => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${client.photo ? `/uploads/${client.photo}` : '/images/profile_img_placeholder.jpg'}" class="rounded-circle" width="50" height="50"></td>
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
        } catch (error) {
            console.error('Error al cargar los clientes:', error);
        }
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
            button.addEventListener('click', async function () {
                const clientId = this.getAttribute('data-id');
                if (confirm("¿Seguro que deseas eliminar este cliente?")) {
                    try {
                        const response = await fetch(`http://localhost:3000/clients/${clientId}`, { method: 'DELETE' });
                        if (response.ok) {
                            loadClients();
                        } else {
                            console.error('Error al eliminar cliente');
                        }
                    } catch (error) {
                        console.error('Error al eliminar cliente:', error);
                    }
                }
            });
        });
    }

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
                editClientModal.hide(); // ✅ Cierra el modal después de editar
                editClientForm.reset(); // ✅ Limpia el formulario
                loadClients(); // ✅ Recarga la tabla
            } else {
                console.error('Error al actualizar cliente');
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
        }
    });

    loadClients();
});
