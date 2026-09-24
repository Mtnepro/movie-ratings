const SUPABASE_URL = "https://cbzslusotuzxjpepwssn.supabase.co";
const SUPABASE_KEY = "sb_publishable_-rp5D9EFAN6oYnljqxo97A_D2Uwv6ec";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// Récupérer les films et leurs notes
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
            .select("movie_id, rating");

    if (reviewsError) {
        console.error("Erreur avis :", reviewsError);
        return;
    }


    const moviesContainer = document.querySelector(".movies");

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

                <div class="rating-count">
                    ${movieReviews.length} note${movieReviews.length > 1 ? "s" : ""}
                </div>

            </div>
        `;


        moviesContainer.appendChild(card);
    });
}


loadMovies();

console.log("Supabase est connecté !");

// ===============================
// CONNEXION
// ===============================

const loginButton = document.querySelector(".login-btn");

if (loginButton) {
    loginButton.addEventListener("click", async () => {

        const { data: { session } } =
            await supabaseClient.auth.getSession();

        if (session) {

            await supabaseClient.auth.signOut();

            loginButton.textContent = "Se connecter";

        } else {

            document.querySelector("#auth-modal").classList.add("show");

        }
    });
}

const closeAuth = document.querySelector("#close-auth");

if (closeAuth) {
    closeAuth.addEventListener("click", () => {
        document.querySelector("#auth-modal").classList.remove("show");
    });
}

const authForm = document.querySelector("#auth-form");

if (authForm) {
    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#auth-email").value;
        const password = document.querySelector("#auth-password").value;
        const message = document.querySelector("#auth-message");

        message.textContent = "Connexion...";

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            message.textContent = error.message;
            return;
        }

        message.textContent = "Connexion réussie ! 🎉";

        setTimeout(() => {
            document.querySelector("#auth-modal").classList.remove("show");
        }, 1000);

        console.log("Utilisateur connecté :", data.user);
    });
}

// =========================
// CRÉATION DE COMPTE
// =========================

const signupButton = document.querySelector("#signup-btn");

if (signupButton) {
    signupButton.addEventListener("click", async () => {

        const email = document.querySelector("#auth-email").value;
        const password = document.querySelector("#auth-password").value;
        const message = document.querySelector("#auth-message");

        if (!email || !password) {
            message.textContent = "Remplis ton email et ton mot de passe.";
            return;
        }

        message.textContent = "Création du compte...";

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            message.textContent = error.message;
            return;
        }

        message.textContent = "Compte créé ! 🎉 Vérifie ton email.";
        console.log("Compte créé :", data);
    });
}

// =========================
// AFFICHER L'ÉTAT DE CONNEXION
// =========================

async function updateLoginButton() {
    if (!loginButton) return;

    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (session) {
        loginButton.textContent = "Mon compte";
    } else {
        loginButton.textContent = "Se connecter";
    }
}

updateLoginButton();

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        loginButton.textContent = "Mon compte";
    } else {
        loginButton.textContent = "Se connecter";
    }
});
