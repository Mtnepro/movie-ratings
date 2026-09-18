const SUPABASE_URL = "https://cbzslusotuxjep...supabase.co";
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
