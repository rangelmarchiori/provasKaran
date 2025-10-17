const apiUrl = 'http://localhost:3000/items';

document.addEventListener('DOMContentLoaded', () => {
    // Referências para os elementos da página (ok)
    const itemForm = document.getElementById('item-form');
    const itemIdInput = document.getElementById('item-id');
    const itemNameInput = document.getElementById('item-name');
    const btnSave = document.getElementById('btn-save');
    const btnCancel = document.getElementById('btn-cancel');
    const itemList = document.getElementById('item-list');

    btnCancel.style.display = 'none';

    // Carrega os itens quando a página é aberta
    loadItems();

    // Adiciona ou atualiza o item ao enviar o formulário
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita o recarregamento da página
        itemIdInput.value ? updateItem(itemIdInput.value, itemNameInput.value) : createItem(itemNameInput.value);
    });

    // Reseta o formulário quando o botão de cancelar é clicado
    btnCancel.addEventListener('click', resetForm);

    // Função para carregar e exibir os itens da API
    function loadItems() {
        fetch(apiUrl)
            .then(res => res.json())
            .then(items => {
                itemList.innerHTML = '';
                items.forEach(addItemToList);
            })
            .catch(console.error);
    }

    // Função que cria a interface do item e adiciona à lista
    function addItemToList(item) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="item-name">${item.name}</span>
            <div class="item-actions">
                <button class="btn-edit">Editar</button>
                <button class="btn-delete">Excluir</button>
            </div>`;

        li.querySelector('.btn-edit').addEventListener('click', () => editItem(item));
        li.querySelector('.btn-delete').addEventListener('click', () => deleteItem(item.id));
        itemList.appendChild(li);
    }

    // Função para criar um novo item via POST
    function createItem(name) {
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }) // Envia o nome do novo item
        })
        .then(res => res.json()) // Converte a resposta para JSON
        .then(item => {
            addItemToList(item); // Adiciona o item criado à lista
            itemForm.reset(); // Limpa o formulário
        })
        .catch(console.error); // Exibe o erro no console
    }

    function editItem(item) {
        itemIdInput.value = item.id;
        itemNameInput.value = item.name;
        btnSave.textContent = 'Atualizar Item';
        btnCancel.style.display = 'inline-block'; 
    }

    // Função que preenche o formulário para edição do item
    // function editItem(item) {
    //     itemIdInput.value = item.id; // Preenche o ID do item
    //     itemNameInput.value = item.name; // Preenche o nome do item
    //     btnSave.textContent = 'Atualizar Item'; // Altera o texto do botão para "Atualizar"
    //     btnCancel.classList.remove('hidden'); // Mostra o botão de cancelar
    // }

    // Função para atualizar um item via PUT
     function updateItem(id, name) {
        fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        .then(() => {
            resetForm();
            loadItems();
        })
        .catch(console.error);
    }

    // Função para deletar um item via DELETE
    function deleteItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
                .then(() => loadItems())
                .catch(console.error);
        }
    }

    // Função para resetar o formulário
    function resetForm() {
        itemIdInput.value = '';
        itemNameInput.value = '';
        btnSave.textContent = 'Adicionar Item';
        btnCancel.classList.add('hidden');
    }
});
