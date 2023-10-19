// Function to create a new list item
function createListItem(text, price, description) {
    const listItem = document.createElement("li");
    listItem.className = "item";
    listItem.innerHTML = `
        <input type="checkbox"> &nbsp &nbsp &nbsp; 
        <span><b>Item:</b> ${text}</span> &nbsp &nbsp &nbsp &nbsp; 
        <span><b>Price:</b> R${price.toFixed(2)}</span> &nbsp &nbsp &nbsp &nbsp; 
        <a href="#" class="show-more-link" data-toggle="modal" data-target="#itemModal">Show More</a> &nbsp; 
        <button class="btn btn-danger delete-button">Delete</button>
    `;
    listItem.querySelector(".show-more-link").addEventListener("click", () => {
        document.getElementById("modal-item-name").textContent = text;
        document.getElementById("modal-item-price").textContent = `Price: R${price.toFixed(2)}`;
        document.getElementById("modal-item-description").textContent = description;
    });
    return listItem;
}
// Function to update the item list
function updateItemList() {
    const itemList = document.querySelector(".item-list");
    itemList.innerHTML = "";

    for (const item of items) {
        const listItem = createListItem(item.text, item.price, item.description);
        const checkbox = listItem.querySelector("input[type='checkbox");
        const deleteButton = listItem.querySelector(".delete-button");

        checkbox.checked = item.checked;
        checkbox.addEventListener("change", () => {
            item.checked = checkbox.checked;
            updateItemsInCookies();
            updateItemList();
            updateBudgetStatus();
        });

        deleteButton.addEventListener("click", () => {
            items = items.filter((i) => i !== item);
            updateItemsInCookies();
            updateItemList();
            updateBudgetStatus();
            handleDeleteItem(items)
            
        });

        itemList.appendChild(listItem);
    }
}
// Handle budget submission
const budgetSubmitButton = document.getElementById("budget-submit");
budgetSubmitButton.addEventListener("click", () => {
    const budgetInput = document.getElementById("total-budget");
    const budget = parseFloat(budgetInput.value);
    if (!isNaN(budget)) {
        budgetInput.setAttribute("disabled", true);
        budgetSubmitButton.setAttribute("disabled", true);
        document.getElementById("add-button").removeAttribute("disabled");
    } else {
        alert("Please enter a valid budget.");
    }
});

// Handle saving the list
const saveListButton = document.getElementById("save-list");
saveListButton.addEventListener("click", () => {
    const shoppingList = JSON.stringify(items);
    const blob = new Blob([shoppingList], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.json";
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    alert("Your shopping list has been saved!");
});
// Handle downloading the list
const downloadListButton = document.getElementById("download-list");
downloadListButton.addEventListener("click", () => {
    const itemsForPDF = items.map((item, index) => {
        return `${index + 1}:  ${item.text}           Price - R ${item.price.toFixed(2)}`;
    });

    const shoppingList = itemsForPDF.join('\n\n');

    const pdfDocGenerator = pdfMake.createPdf({
        content: [
            { text: "Shopping List", style: "header" },
            { text: " " },
            { text: "Total Budget: R" + document.getElementById("total-budget").value },
            { text: " " },
            { text: "Items", style: "subheader" },
            { text: " " },
            shoppingList,
        ],
        styles: {
            header: {
                fontSize: 20,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 10],
            },
            subheader: {
                fontSize: 18,
                bold: true,
                alignment: "center",
                margin: [0, 10, 0, 5],
            },
        },
    });
    pdfDocGenerator.download("shopping-list.pdf");

    URL.revokeObjectURL(url);
    alert("Your shopping list has been downloaded!");
});


// Handle adding new item
const addButton = document.getElementById("add-button");
addButton.addEventListener("click", () => {
    const newItemInput = document.getElementById("new-item");
    const newItemShop = document.getElementById("item-shop");
    const newItemPrice = document.getElementById("item-price");
    const newItemDescription = document.getElementById("item-description");

    const text = newItemInput.value.trim();
    const shop = newItemShop.value.trim();
    const price = parseFloat(newItemPrice.value);
    const description = newItemDescription.value.trim();

    if (text !== "" && !isNaN(price)) {
        items.push({ text, shop, price, description, checked: false });
        updateItemsInCookies();
        updateItemList();
        updateBudgetStatus();

        newItemInput.value = "";
        newItemShop.value = "";
        newItemPrice.value = "";
        newItemDescription.value = "";
    } else {
        alert("Please fill in the required item information.");
    }
});
// Handle loading a saved list
const retrieveListButton = document.getElementById('retrieve-list');
retrieveListButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            items = JSON.parse(event.target.result);
            // Update cookies with the retrieved items
            updateItemsInCookies();
            updateItemList();
            updateBudgetStatus();
            alert('Your saved shopping list has been retrieved!');
        };
        reader.readAsText(file);
    });
    input.click();
});
function handleDeleteItem(item) {
    const itemIndex = items.indexOf(item);
    if (itemIndex > -1) {
        items.splice(itemIndex, 1);
        // Mark the item as deleted
        item.deleted = true;
        updateItemsInCookies();
        updateItemList();
        updateBudgetStatus();
    }
}


// Update the event listener for the "Delete" buttons
document.querySelectorAll(".delete-button").forEach((deleteButton, index) => {
    deleteButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent the default link behavior
        const listItem = event.target.parentElement;
        const itemText = listItem.querySelector("span:first-child").textContent;
        const confirmDelete = confirm(`Do you want to delete the item "${itemText}"?`);
        if (confirmDelete) {
            handleDeleteItem(items[index]);
        }
    });
});
// Load items from cookies (if available)
let items = [];
const budgetInput = document.getElementById("total-budget");

const cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)groceryList\s*=\s*([^;]*).*$)|^.*$/, "$1");
if (cookieValue) {
    items = JSON.parse(cookieValue);
    updateItemList();
    updateBudgetStatus();
    
    // Disable budget input if budget is set
    if (items.length > 0 && !isNaN(parseFloat(budgetInput.value))) {
        budgetInput.setAttribute("disabled", true);
        document.getElementById("add-button").removeAttribute("disabled");
    }
}

// Function to update the items in cookies
function updateItemsInCookies() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3); // Items expire in 3 days

    document.cookie = `groceryList=${JSON.stringify(items)}; expires=${expirationDate.toUTCString()}`;
}

// Function to update budget status
function updateBudgetStatus() {
    const totalBudget = parseFloat(budgetInput.value);
    const totalCost = items.filter(item => item.checked).reduce((acc, item) => acc + item.price, 0);

    const budgetStatus = document.getElementById("budget-status");
    if (totalCost > totalBudget) {
        budgetStatus.innerHTML = `You are over budget by R${(totalCost - totalBudget).toFixed(2)}`;
        budgetStatus.style.color = "red";
    } else {
        budgetStatus.innerHTML = `You are under budget by R${(totalBudget - totalCost).toFixed(2)}`;
        budgetStatus.style.color = "green";
    }
}