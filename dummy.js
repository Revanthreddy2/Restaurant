// Function to fetch and display menu items
function fetchMenuItems() {
    fetch('menu.json')
        .then(response => response.json())
        .then(data => {
            const menuItemsContainer = document.getElementById('menu-items');

            // menuItemsContainer.innerHTML = '';

            for (const category in data) {
                data[category].forEach(item => {
                    const menuItem = document.createElement('div');
                    menuItem.classList.add('menu-item');
                    menuItem.setAttribute('data-category', category.toLowerCase());
                    menuItem.setAttribute('data-name', item.name);
                    menuItem.setAttribute('data-price', item.price);
                    menuItem.setAttribute('id', `${category}-${item.name}`);
                    menuItem.setAttribute('draggable', 'true');

                    menuItem.innerHTML = `
                        <h3>${item.name}</h3>
                        <p>Price: ₹${item.price}</p>
                    `;

                    // Add dragstart event listener
                    menuItem.addEventListener('dragstart', e => {
                        e.dataTransfer.setData('text/plain', e.target.id);
                    });

                    menuItemsContainer.appendChild(menuItem);
                });
            }
        })
        .catch(error => console.error('Error fetching menu:', error));
}


fetchMenuItems();


document.getElementById('menubar').addEventListener('input', filterMenuItems);

// Function to filter menu items based on search input (by course or food)
function filterMenuItems() {
    const searchInput = document.getElementById('menubar').value.toLowerCase();
    const menuItems = document.querySelectorAll('.menu-item');
    // console.log(menuItems);
    menuItems.forEach(item => {
        const itemName = item.querySelector('h3').textContent.toLowerCase();
        const itemCategory = item.getAttribute('data-category');

        // Check if searchInput matches item name or course
        if (itemName.includes(searchInput) || itemCategory.includes(searchInput)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}


// Event listener for search input to filter tables by name
document.getElementById('search-input').addEventListener('input', filterTablesByName);

// Function to filter tables by name
function filterTablesByName() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const tableItems = document.querySelectorAll('.table-item');

    tableItems.forEach(item => {
        const tableName = item.querySelector('h2').textContent.toLowerCase();
        if (tableName.includes(searchInput)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}



let tablesData = [
    { id: 'table-1', name: 'Table 1', amount: 0, totalItems: 0, items: [] },
    { id: 'table-2', name: 'Table 2', amount: 0, totalItems: 0, items: [] },
    { id: 'table-3', name: 'Table 3', amount: 0, totalItems: 0, items: [] },
];

// Initialize tables on page load
initializeTables();

// Function to initialize tables
function initializeTables() {
    const tablesList = document.getElementById('tables');
    tablesData.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.classList.add('table-item');
        tableDiv.id = table.id;

        // Update table item HTML
        updateTableItemHTML(tableDiv, table);

        // Dragover event listener for tables to allow drop
        tableDiv.addEventListener('dragover', e => {
            e.preventDefault(); // Allow drop
        });

        // Drop event listener for tables
        tableDiv.addEventListener('drop', e => {
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            const menuItem = document.getElementById(itemId);

            if (menuItem) {
                const itemName = menuItem.getAttribute('data-name');
                const itemPrice = parseFloat(menuItem.getAttribute('data-price'));

                // Check if item already exists in table
                const existingItem = table.items.find(item => item.name === itemName);
                if (existingItem) {
                    table.totalItems++;
                    existingItem.quantity++;
                    table.amount += itemPrice; // Increase total amount
                } else {
                    // Add new item to table
                    table.items.push({ name: itemName, price: itemPrice, quantity: 1 });
                    table.totalItems++;
                    table.amount += itemPrice;
                }

                // Update table display
                updateTableItemHTML(tableDiv, table);
            }
        });

        // Click to open modal
        tableDiv.addEventListener('click', () => openTableModal(table));

        tablesList.appendChild(tableDiv);
    });
}

// Function to update table item HTML with amount and total items
function updateTableItemHTML(tableDiv, table) {
    tableDiv.innerHTML = `
        <div class="session-details">
            <h2>${table.name}</h2>
            <p>Rs. ${table.amount.toFixed(2)} | Total Items: ${table.totalItems}</p>
        </div>
    `;
}

// Function to open modal with table details
function openTableModal(table) {
    const modal = document.getElementById('table-modal');
    const modalContent = document.querySelector('.modal-content');
    const tableItemsBody = document.getElementById('table-items-body');
    const totalPriceElement = document.getElementById('total-price');

    // Clear previous table items in modal
    tableItemsBody.innerHTML = '';
    // Populate table items in modal
    table.items.forEach((item, index) => {
        const rowItem = document.createElement('tr');
        rowItem.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
            <td><input type="number" min="1" max="10"  value="${item.quantity}" class="quantity-input"></td>
            <td><button class="delete-item" data-index="${index}">Delete</button></td>
        `;
        tableItemsBody.appendChild(rowItem);
    });

    // Calculate and display total price
    totalPriceElement.textContent = `Rs. ${table.amount.toFixed(2)}`;

    // Display the modal
    modal.style.display = 'block';

    // Close modal when clicking the close button (X)
    const closeButton = document.querySelector('.close');
    closeButton.removeEventListener('click', closeModal); // Remove any existing listeners
    closeButton.addEventListener('click', closeModal);

    // Close modal when clicking outside of it
    window.removeEventListener('click', clickOutsideToCloseModal); // Remove any existing listeners
    window.addEventListener('click', clickOutsideToCloseModal);

    // For deleting an item in pop up window
    const deleteButtons = document.querySelectorAll('.delete-item');
    deleteButtons.forEach(button => {
        button.removeEventListener('click', handleDeleteItem); // Remove any existing listeners
        button.addEventListener('click', () => handleDeleteItem(table));
    });

    // Event listener for updating quantity
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.removeEventListener('input', handleQuantityInput); // Remove any existing listeners
        input.addEventListener('input', () => handleQuantityInput(table));
    });

    // Event listener for session end button
    const sessionEndButton = document.getElementById('session-end');
    sessionEndButton.removeEventListener('click', handleSessionEnd); // Remove any existing listeners
    sessionEndButton.addEventListener('click', () => handleSessionEnd(table));

    // Helper functions for event handlers
    function closeModal() {
        modal.style.display = 'none';
    }

    function clickOutsideToCloseModal(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    }

    function handleDeleteItem(table) {
        const itemIndex = parseInt(this.getAttribute('data-index'));
        const itemPrice = table.items[itemIndex].price;
        const itemQuantity = table.items[itemIndex].quantity;

        // Remove item from table's items array
        table.items.splice(itemIndex, 1);

        // Update items and total
        table.totalItems--;
        table.amount -= itemPrice * itemQuantity;

        // Update table display and modal
        updateTableItemHTML(document.getElementById(table.id), table);
        openTableModal(table); // Refresh modal
    }

    function handleQuantityInput(table) {
        const itemIndex = parseInt(this.parentElement.parentElement.querySelector('.delete-item').getAttribute('data-index'));
        const newQuantity = parseInt(this.value);
        const oldQuantity = table.items[itemIndex].quantity;
        const itemPrice = table.items[itemIndex].price;

        if (!isNaN(newQuantity) && newQuantity >= 1) {
            // Update item quantity and total amount
            table.items[itemIndex].quantity = newQuantity;
            table.amount += itemPrice * (newQuantity - oldQuantity);

            // Update table display and modal
            updateTableItemHTML(document.getElementById(table.id), table);
            openTableModal(table); // Refresh modal
        } else {
            // Reset input to old quantity if new input is invalid
            this.value = oldQuantity;
        }
    }

    function handleSessionEnd(table) {
        // Display total price to pay and clear table data
        if (table.amount !== 0) {
            alert(`Total Price to Pay for ${table.name}: Rs. ${table.amount.toFixed(2)}`);
            table.items = [];
            table.totalItems = 0;
            table.amount = 0;
            updateTableItemHTML(document.getElementById(table.id), table); // Update table display
        }
        modal.style.display = 'none'; // Close modal after session ends
    }
}





