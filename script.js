const SUPABASE_URL = "https://cbzslusotuzxjpepwssn.supabase.co";
const SUPABASE_KEY = "sb_publishable_-rp5D9EFAN6oYnljqxo97A_D2Uwv6ec";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================
// FILMS + NOTES
// =====================================

async function loadMovies() {

    const { data: movies, error: moviesError } =
        await supabaseClient
            .from("movies")
            .select("*")
            .order("title");

    if (moviesError) {
        console.error("Erreur films :", moviesError);
        return;
    }

    const { data: reviews, error: reviewsError } =
        await supabaseClient
            .from("reviews")
            .select("movie_id, rating, content");

    if (reviewsError) {
        console.error("Erreur avis :", reviewsError);
        return;
    }

    const moviesContainer = document.querySelector(".movies");

    if (!moviesContainer) return;

    moviesContainer.innerHTML = "";


    movies.forEach(movie => {

        const movieReviews = reviews.filter(
            review => review.movie_id === movie.id
        );

        let average = 0;

        if (movieReviews.length > 0) {

            const total = movieReviews.reduce(
                (sum, review) => sum + review.rating,
                0
            );

            average = total / movieReviews.length;
        }


        const card = document.createElement("article");

        card.className = "movie-card";


        card.innerHTML = `
            <div class="movie-poster poster-one">

                <span class="poster-icon">
                    🎬
                </span>

                <div class="movie-rating">
                    ⭐ ${average.toFixed(1)}
                </div>

            </div>

            <div class="movie-info">

                <h3>${movie.title}</h3>

                <p>
                    ${movie.release_year || ""} · ${movie.genre || ""}
                </p>

               <div class="movie-reviews">
    ${
        movieReviews.length > 0
        ? movieReviews.map(review => `
            <div class="review">
                <div class="review-rating">
                    ⭐ ${review.rating}/10
                </div>

                <p>${review.content || "Aucun commentaire."}</p>
            </div>
        `).join("")
        : "<p class='no-reviews'>Aucun avis pour le moment.</p>"
    }
</div>

                <button
                    class="rate-movie-btn"
                    data-movie-id="${movie.id}"
                    data-movie-title="${movie.title}"
                >
                    ⭐ Noter ce film
                </button>

            </div>
        `;


        moviesContainer.appendChild(card);
    });


    // Boutons "Noter ce film"
    document.querySelectorAll(".rate-movie-btn").forEach(button => {

        button.addEventListener("click", () => {

            const movieId = Number(button.dataset.movieId);
            const movieTitle = button.dataset.movieTitle;

            openReviewModal(movieId, movieTitle);
        });

    });
}


// =====================================
// MODALE POUR NOTER UN FILM
// =====================================

function openReviewModal(movieId, movieTitle) {

    let modal = document.querySelector("#review-modal");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "review-modal";

        modal.innerHTML = `
            <div class="review-modal-box">

                <button
                    id="close-review-modal"
                    class="close-review-modal"
                >
                    ×
                </button>

                <h2>Noter le film</h2>

                <p id="review-movie-title"></p>

                <label for="review-rating">
                    Ta note
                </label>

                <select id="review-rating">

                    <option value="10">10 / 10 ⭐</option>
                    <option value="9">9 / 10 ⭐</option>
                    <option value="8">8 / 10 ⭐</option>
                    <option value="7">7 / 10 ⭐</option>
                    <option value="6">6 / 10 ⭐</option>
                    <option value="5">5 / 10 ⭐</option>
                    <option value="4">4 / 10 ⭐</option>
                    <option value="3">3 / 10 ⭐</option>
                    <option value="2">2 / 10 ⭐</option>
                    <option value="1">1 / 10 ⭐</option>

                </select>

                <label for="review-content">
                    Ton avis
                </label>

                <textarea
                    id="review-content"
                    placeholder="Qu'as-tu pensé de ce film ?"
                    rows="5"
                ></textarea>

                <button
                    id="publish-review"
                    class="primary-btn"
                >
                    Publier mon avis
                </button>

                <p id="review-message"></p>

            </div>
        `;

        document.body.appendChild(modal);


        document
            .querySelector("#close-review-modal")
            .addEventListener("click", () => {
                modal.classList.remove("show");
            });


        document
            .querySelector("#publish-review")
            .addEventListener("click", async () => {

                await publishReview();
            });
    }


    document.querySelector("#review-movie-title").textContent =
        movieTitle;

    modal.dataset.movieId = movieId;

    document.querySelector("#review-rating").value = "10";

    document.querySelector("#review-content").value = "";

    document.querySelector("#review-message").textContent = "";

    modal.classList.add("show");
}


// =====================================
// PUBLIER UN AVIS
// =====================================

async function publishReview() {

    const modal = document.querySelector("#review-modal");

    const movieId = Number(modal.dataset.movieId);

    const rating = Number(
        document.querySelector("#review-rating").value
    );

    const content =
        document.querySelector("#review-content").value.trim();

    const message =
        document.querySelector("#review-message");


    // Vérifier la connexion
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        message.textContent =
            "Tu dois être connecté pour publier un avis.";

        return;
    }


    // Vérifier l'avis
    if (!content) {

        message.textContent =
            "Écris un petit avis avant de publier.";

        return;
    }


    message.textContent =
        "Publication de ton avis...";


    // Ajouter l'avis dans Supabase
    const { error } =
        await supabaseClient
            .from("reviews")
            .insert({
                user_id: user.id,
                movie_id: movieId,
                rating: rating,
                content: content
            });


    if (error) {

        console.error("Erreur publication :", error);

        message.textContent =
            "Erreur : " + error.message;

        return;
    }


    message.textContent =
        "Avis publié ! 🎉";


    // Fermer la fenêtre après 1 seconde
    setTimeout(() => {

        modal.classList.remove("show");

        loadMovies();

    }, 1000);
}


// =====================================
// CONNEXION / DÉCONNEXION
// =====================================

const loginButton =
    document.querySelector(".login-btn");


if (loginButton) {

    loginButton.addEventListener("click", async () => {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();


        if (session) {

            await supabaseClient.auth.signOut();

            loginButton.textContent =
                "Se connecter";

        } else {

            document
                .querySelector("#auth-modal")
                .classList.add("show");

        }

    });

}


// =====================================
// FERMER LA FENÊTRE DE CONNEXION
// =====================================

const closeAuth =
    document.querySelector("#close-auth");


if (closeAuth) {

    closeAuth.addEventListener("click", () => {

        document
            .querySelector("#auth-modal")
            .classList.remove("show");

    });

}


// =====================================
// CONNEXION
// =====================================

const authForm =
    document.querySelector("#auth-form");


if (authForm) {

    authForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.querySelector("#auth-email").value;

        const password =
            document.querySelector("#auth-password").value;

        const message =
            document.querySelector("#auth-message");


        message.textContent =
            "Connexion...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            message.textContent =
                error.message;

            return;
        }


        message.textContent =
            "Connexion réussie ! 🎉";


        setTimeout(() => {

            document
                .querySelector("#auth-modal")
                .classList.remove("show");

        }, 1000);


        console.log(
            "Utilisateur connecté :",
            data.user
        );

    });

}


// =====================================
// CRÉATION DE COMPTE
// =====================================

const signupButton =
    document.querySelector("#signup-btn");


if (signupButton) {

    signupButton.addEventListener("click", async () => {

        const email =
            document.querySelector("#auth-email").value;

        const password =
            document.querySelector("#auth-password").value;

        const message =
            document.querySelector("#auth-message");


        if (!email || !password) {

            message.textContent =
                "Remplis ton email et ton mot de passe.";

            return;
        }


        message.textContent =
            "Création du compte...";


        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });


        if (error) {

            message.textContent =
                error.message;

            return;
        }


        message.textContent =
            "Compte créé ! 🎉 Vérifie ton email.";


        console.log(
            "Compte créé :",
            data
        );

    });

}


// =====================================
// ÉTAT DE CONNEXION
// =====================================

async function updateLoginButton() {

    if (!loginButton) return;


    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session) {

        loginButton.textContent =
            "Mon compte";

    } else {

        loginButton.textContent =
            "Se connecter";

    }
}


updateLoginButton();


supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (!loginButton) return;


        if (session) {

            loginButton.textContent =
                "Mon compte";

        } else {

            loginButton.textContent =
                "Se connecter";

        }

    }
);


// =====================================
// STYLE DE LA MODALE DES AVIS
// =====================================

const reviewStyle =
    document.createElement("style");


reviewStyle.textContent = `

#review-modal {

    position: fixed;

    inset: 0;

    background: rgba(0, 0, 0, 0.75);

    display: none;

    align-items: center;

    justify-content: center;

    z-index: 9999;

}


#review-modal.show {

    display: flex;

}


.review-modal-box {

    position: relative;

    width: min(500px, 90%);

    padding: 30px;

    border-radius: 20px;

    background: #0c2852;

    border: 1px solid rgba(255,255,255,0.12);

    box-shadow: 0 20px 60px rgba(0,0,0,0.5);

}


.review-modal-box h2 {

    margin-bottom: 8px;

}


#review-movie-title {

    color: #55b4ff;

    margin-bottom: 25px;

    font-size: 18px;

}


.review-modal-box label {

    display: block;

    margin-top: 16px;

    margin-bottom: 7px;

    color: #dbeafe;

}


#review-rating,

#review-content {

    width: 100%;

    padding: 12px;

    border-radius: 10px;

    border: 1px solid rgba(255,255,255,0.12);

    background: #06152f;

    color: white;

    font-family: inherit;

}


#review-content {

    resize: vertical;

}


#publish-review {

    width: 100%;

    margin-top: 20px;

    padding: 13px;

    border: none;

    border-radius: 10px;

    background: #168cff;

    color: white;

    font-weight: bold;

    cursor: pointer;

}


.close-review-modal {

    position: absolute;

    top: 12px;

    right: 15px;

    border: none;

    background: transparent;

    color: white;

    font-size: 28px;

    cursor: pointer;

}


#review-message {

    margin-top: 15px;

    color: #8fa8c7;

}


.rate-movie-btn {

    margin-top: 12px;

    padding: 9px 14px;

    border: none;

    border-radius: 9px;

    background: #168cff;

    color: white;

    font-weight: bold;

    cursor: pointer;

}

`;


document.head.appendChild(reviewStyle);


// =====================================
// LANCER LE CHARGEMENT
// =====================================

loadMovies();

console.log("Supabase est connecté !");
