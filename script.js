// =========================================
// PRODUCT DATA
// =========================================
const products = [
    {
        id: 101,
        name: "Apple iPhone 15",
        category: "Smartphones",
        price: 69999,
        rating: 4.8,
        popularity: 95
    },
    {
        id: 102,
        name: "Apple iPhone 15 Plus",
        category: "Smartphones",
        price: 79999,
        rating: 4.7,
        popularity: 91
    },
    {
        id: 103,
        name: "Apple iPhone 15 Pro",
        category: "Smartphones",
        price: 134999,
        rating: 4.9,
        popularity: 98
    },
    {
        id: 104,
        name: "Apple iPhone 15 Pro Max",
        category: "Smartphones",
        price: 154999,
        rating: 4.9,
        popularity: 99
    },
    {
        id: 105,
        name: "Samsung Galaxy S24",
        category: "Smartphones",
        price: 74999,
        rating: 4.7,
        popularity: 94
    },
    {
        id: 106,
        name: "Samsung Galaxy S24 Ultra",
        category: "Smartphones",
        price: 129999,
        rating: 4.9,
        popularity: 97
    },
    {
        id: 107,
        name: "OnePlus 12",
        category: "Smartphones",
        price: 64999,
        rating: 4.6,
        popularity: 89
    },
    {
        id: 108,
        name: "OnePlus Nord CE 4",
        category: "Smartphones",
        price: 24999,
        rating: 4.4,
        popularity: 82
    },
    {
        id: 109,
        name: "Google Pixel 8",
        category: "Smartphones",
        price: 75999,
        rating: 4.6,
        popularity: 86
    },
    {
        id: 110,
        name: "Google Pixel 8 Pro",
        category: "Smartphones",
        price: 106999,
        rating: 4.8,
        popularity: 90
    },
    {
        id: 201,
        name: "Apple MacBook Air M2",
        category: "Laptops",
        price: 89999,
        rating: 4.8,
        popularity: 94
    },
    {
        id: 202,
        name: "Apple MacBook Air M3",
        category: "Laptops",
        price: 109999,
        rating: 4.9,
        popularity: 96
    },
    {
        id: 203,
        name: "Dell Inspiron 15",
        category: "Laptops",
        price: 58999,
        rating: 4.4,
        popularity: 80
    },
    {
        id: 204,
        name: "HP Pavilion 14",
        category: "Laptops",
        price: 62999,
        rating: 4.5,
        popularity: 84
    },
    {
        id: 205,
        name: "Lenovo IdeaPad Slim 5",
        category: "Laptops",
        price: 65999,
        rating: 4.6,
        popularity: 87
    },
    {
        id: 301,
        name: "Apple AirPods Pro",
        category: "Headphones",
        price: 24999,
        rating: 4.7,
        popularity: 93
    },
    {
        id: 302,
        name: "Sony WH-1000XM5",
        category: "Headphones",
        price: 29999,
        rating: 4.8,
        popularity: 92
    },
    {
        id: 303,
        name: "JBL Tune 770NC",
        category: "Headphones",
        price: 6999,
        rating: 4.5,
        popularity: 85
    },
    {
        id: 304,
        name: "Bose QuietComfort 45",
        category: "Headphones",
        price: 27999,
        rating: 4.7,
        popularity: 88
    },
    {
        id: 305,
        name: "Apple Watch Series 9",
        category: "Smartwatches",
        price: 41999,
        rating: 4.7,
        popularity: 90
    }
];
// ========================================
// PRODUCT IMAGES
// ========================================
const productImages = {
    101: "images/iphone-15.jpg",
    102: "images/iphone-15-plus.jpg",
    103: "images/iphone-15-pro.jpg",
    104: "images/iphone-15-pro-max.jpg",

    105: "images/samsung-s24.jpg",
    106: "images/samsung-s24-ultra.jpg",

    107: "images/oneplus-12.jpg",
    108: "images/oneplus-nord-ce4.jpg",

    109: "images/pixel-8.jpg",
    110: "images/pixel-8-pro.jpg",

    201: "images/macbook-air-m2.jpg",
    202: "images/macbook-air-m3.jpg",
    203: "images/dell-inspiron-15.jpg",
    204: "images/hp-pavilion-14.jpg",
    205: "images/ideapad-slim-5.jpg",

    301: "images/airpods-pro.jpg",
    302: "images/sony-xm5.jpg",
    303: "images/jbl-770nc.jpg",
    304: "images/bose-qc45.jpg",

    305: "images/apple-watch-9.jpg"
};
// =========================================
// GET HTML ELEMENTS
// =========================================
const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const suggestionsBox = document.getElementById("suggestions");
const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");
const resultsTitle = document.getElementById("resultsTitle");
// =========================================
// SEARCH FUNCTION
// =========================================
function searchProducts(query) {
    const searchTerm = query.trim().toLowerCase();
    if (searchTerm === "") {
        return [];
    }
    return products.filter(product => {
        const productName =
            product.name.toLowerCase();
        const category =
            product.category.toLowerCase();
        // 1. Exact product-name match
        if (productName === searchTerm) {
            return true;
        }
        // 2. Prefix match for individual words
        const words = productName.split(" ");
        const nameMatch = words.some(word =>
            word.startsWith(searchTerm)
        );
        // 3. Category prefix match
        const categoryMatch =
            category.startsWith(searchTerm);
        return nameMatch || categoryMatch;
    });
}
// =========================================
// AUTOCOMPLETE
// =========================================
function showSuggestions(query) {
    const searchTerm = query.trim().toLowerCase();
    // Hide dropdown if nothing is typed
    if (searchTerm === "") {
        suggestionsBox.style.display = "none";
        suggestionsBox.innerHTML = "";
        return;
    }
    // Find matching products
    const matches = products.filter(product => {
        const words = product.name
            .toLowerCase()
            .split(" ");
        return words.some(word =>
            word.startsWith(searchTerm)
        );
    });
    // Show only first 5 suggestions
    const suggestions = matches.slice(0, 5);
    // No suggestions
    if (suggestions.length === 0) {
        suggestionsBox.style.display = "none";
        suggestionsBox.innerHTML = "";
        return;
    }
    // Clear old suggestions
    suggestionsBox.innerHTML = "";
    // Create suggestion items
    suggestions.forEach(product => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `
            <div class="suggestion-icon">
                <img src="${productImages[product.id]}" 
                    alt="${product.name}">
            </div>
            <div class="suggestion-details">
                <div class="suggestion-name">
                    ${product.name}
                </div>
                <div class="suggestion-category">
                    ${product.category}
                </div>
            </div>
            <div class="suggestion-price">
                ₹${product.price.toLocaleString("en-IN")}
            </div>
        `;
        // Click suggestion
    item.addEventListener("click", () => {
    // Put selected product name into search box
    searchInput.value = product.name;
    // Show clear button
    clearButton.style.display = "block";
    // Hide autocomplete
    suggestionsBox.style.display = "none";
    // Update heading
    resultsTitle.textContent =
        `Results for "${product.name}"`;
    // Show the selected product
    displayProducts([product]);
}); 
        suggestionsBox.appendChild(item);
    });
    // Show dropdown
    suggestionsBox.style.display = "block";
}
// =========================================
// RANK SEARCH RESULTS
// =========================================

function rankProducts(results) {
    return [...results].sort((a, b) => {
        // Rating contributes 60%
        const ratingA = (a.rating / 5) * 60;
        const ratingB = (b.rating / 5) * 60;

        // Popularity contributes 40%
        const popularityA = a.popularity * 0.40;
        const popularityB = b.popularity * 0.40;

        const scoreA = ratingA + popularityA;
        const scoreB = ratingB + popularityB;

        return scoreB - scoreA; // Highest score first
    });
}
// =========================================
// DISPLAY PRODUCTS
// =========================================
function displayProducts(results) {
    // Clear previous products
    productGrid.innerHTML = "";
    // Update count
    resultCount.textContent =
        `${results.length} product${results.length !== 1 ? "s" : ""}`;
    // No results
    if (results.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    // Results exist
    emptyState.style.display = "none";
    // Create a card for every product
    results.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-image">
            <img src="${productImages[product.id]}" 
             alt="${product.name}">
        <span>${product.category}</span>
    </div>
            <div class="product-info">
                <p class="product-category">
                    ${product.category}
                </p>
                <h3 class="product-name">
                    ${product.name}
                </h3>
                <div class="product-rating">
                    ★ ${product.rating}
                </div>
                <p class="product-popularity">
                    ${product.popularity}% popularity
                </p>
                <div class="product-bottom">
                    <strong class="product-price">
                        ₹${product.price.toLocaleString("en-IN")}
                    </strong>
                    <span class="rank">
                        #${index + 1}
                    </span>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}
// =========================================
// SEARCH INPUT EVENT
// =========================================

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    //show autocomplete suggestions
    showSuggestions(query);
    // Show/hide clear button
    if (query.length > 0) {
        clearButton.style.display = "block";
    } else {
        clearButton.style.display = "none";
    }
    // Search products
    // Search products
const results = searchProducts(query);
const rankedResults = rankProducts(results);

resultsTitle.textContent = query
    ? `Results for "${query}"`
    : "Explore products";

// Update heading
if (query.trim() === "") {
    resultsTitle.textContent = "Explore products";
} else {
    resultsTitle.textContent =
        `Results for "${query.trim()}"`;
}

// Display ranked results
displayProducts(rankedResults);

});
// =========================================
// CLEAR BUTTON
// =========================================
clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearButton.style.display = "none";
    suggestionsBox.style.display = "none";
    resultsTitle.textContent = "Explore products";
    displayProducts(products);
    searchInput.focus();
});
// =========================================
// POPULAR SEARCH BUTTONS
// =========================================
const popularButtons =
    document.querySelectorAll(
        ".popular-searches button"
    );
popularButtons.forEach(button => {
    button.addEventListener("click", () => {
        const searchTerm =
            button.getAttribute("data-search");
        searchInput.value = searchTerm;
        clearButton.style.display = "block";
        resultsTitle.textContent =
            `Results for "${searchTerm}"`;
        const results =
    searchProducts(searchTerm);

const rankedResults =
    rankProducts(results);

displayProducts(rankedResults);
    });
});
// =========================================
// SHOW ALL PRODUCTS ON PAGE LOAD
// =========================================

displayProducts(products);