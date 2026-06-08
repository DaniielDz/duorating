const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const tmdb = {
  search: async (query: string) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
    );
    return response.json();
  },

  getMovieDetails: async (id: number) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    return response.json();
  },

  getTvDetails: async (id: number) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    return response.json();
  },

  getPosterUrl: (path: string, size: "w200" | "w500" | "original" = "w500") => {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
