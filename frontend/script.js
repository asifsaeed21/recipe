document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.getElementById("search-btn");
    const ingredientsInput = document.getElementById("ingredients-input");
    const recipesContainer = document.getElementById("recipes-container");
    const errorMessage = document.getElementById("error-message");
    const spinner = document.getElementById("loading-spinner");

    searchBtn.addEventListener("click", function () {
        const ingredients = ingredientsInput.value.trim();

        errorMessage.classList.add("hidden");
        recipesContainer.innerHTML = "";

        if (!ingredients) {
            showError("Please enter one or more ingredients.");
            return;
        }

        spinner.classList.remove("hidden");

        fetch(`${API_BASE_URL}/recommend`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients }),
        })
            .then((res) => res.json())
            .then((data) => {
                spinner.classList.add("hidden");

                if (data.error) {
                    showError(data.error);
                } else {
                    renderRecipes(data.recipes);
                }
            })
            .catch(() => {
                spinner.classList.add("hidden");
                showError("Cannot connect to backend. Is Flask running?");
            });
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove("hidden");
    }

    function renderRecipes(recipes) {
        if (!recipes || recipes.length === 0) {
            showError("No recipes found. Try different ingredients.");
            return;
        }

        recipes.forEach((recipe, index) => {
            const card = document.createElement("div");
            card.className = "recipe-card";
            // Add staggered animation delay for smooth sequential appearance
            card.style.animationDelay = `${index * 0.06}s`;

            card.innerHTML = `
                <div class="recipe-title">${recipe.recipe_title}</div>
                <div class="recipe-category">${recipe.category} / ${recipe.subcategory}</div>
                <div class="recipe-description">${recipe.description || ""}</div>

                <div class="recipe-ingredients">
                    <strong>Ingredients:</strong>
                    ${formatList(recipe.ingredients)}
                </div>

                <button class="show-direction-btn">Show Recipe Steps (${recipe.num_steps} steps)</button>

                <div style="font-size:0.75rem; color:#888; margin-top:0.6rem; padding-top:0.6rem; border-top:1px solid rgba(44,22,8,0.1); text-align:right; font-weight:500;">
                    Similarity: ${recipe.similarity.toFixed(3)}
                </div>
            `;

            const showDirBtn = card.querySelector(".show-direction-btn");
            showDirBtn.onclick = function () {
                // Add button click animation
                showDirBtn.style.transform = "scale(0.95)";
                setTimeout(() => {
                    showDirBtn.style.transform = "";
                }, 150);
                
                // Smooth fade out animation for cards
                const cards = recipesContainer.querySelectorAll('.recipe-card');
                cards.forEach((c, i) => {
                    c.style.animation = `cardFadeOut 0.4s ease forwards`;
                    c.style.animationDelay = `${i * 0.05}s`;
                });
                
                setTimeout(() => {
                    recipesContainer.innerHTML = "";
                    
                    // Change container to single column for direction card
                    recipesContainer.style.gridTemplateColumns = "1fr";
                    recipesContainer.style.maxWidth = "100%";
                    
                    // Create direction card with smooth animation
                    const directionCard = document.createElement("div");
                    directionCard.className = "direction-card";
                    directionCard.style.opacity = "0";
                    directionCard.innerHTML = `
                        <div style='font-size:1.6rem; font-weight:700; margin-bottom:1rem; color:#8B4513; font-family:"Playfair Display", serif; padding-bottom:0.8rem; border-bottom:3px solid rgba(255,215,0,0.3);'>${recipe.recipe_title}</div>
                        <div style='font-size:1.2rem; font-weight:600; margin-bottom:1.5rem; color:#FFA500; text-transform:uppercase; letter-spacing:1px;'>📖 Recipe Steps</div>
                        <div class="steps-content" style='font-size:1rem; line-height:1.8; color:#444;'>${formatList(recipe.directions)}</div>
                        <button class="back-btn" style="margin-top:2rem; display:block; margin-left:auto; margin-right:auto;">← Back to Recipes</button>
                    `;
                    recipesContainer.appendChild(directionCard);
                    
                    // Trigger entrance animation
                    setTimeout(() => {
                        directionCard.style.opacity = "1";
                    }, 50);
                    
                    // Smooth scroll to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    // Back button event with smooth animation
                    directionCard.querySelector(".back-btn").onclick = function () {
                        this.style.transform = "scale(0.95)";
                        directionCard.style.animation = "slideOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards";
                        setTimeout(() => {
                            recipesContainer.innerHTML = "";
                            // Reset container to grid layout
                            recipesContainer.style.gridTemplateColumns = "";
                            recipesContainer.style.maxWidth = "";
                            renderRecipes(recipes);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 500);
                    };
                }, 450);
            };

            recipesContainer.appendChild(card);
        });
    }

    function formatList(data) {
        let arr;

        try {
            arr = typeof data === "string" ? JSON.parse(data) : data;
        } catch {
            arr = Array.isArray(data) ? data : [data];
        }

        if (!Array.isArray(arr)) return arr;

        return `<ul>${arr.map((x) => `<li>${x}</li>`).join("")}</ul>`;
    }

    // Add event listener for recipe cards to focus search bar
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', function() {
            const searchBar = document.getElementById('ingredients-input');
            if (searchBar) {
                searchBar.focus();
            }
        });
    });

    // Add event listener for Home button to refresh the page
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            window.location.reload();
        });
    }
});
