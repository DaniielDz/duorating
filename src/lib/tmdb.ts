const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY!;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const TMDB_LANG = "es-MX";

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  overview: string;
  media_type: "movie";
}

export interface TMDBTV {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  overview: string;
  media_type: "tv";
}

export type TMDBResult = TMDBMovie | TMDBTV;

export interface TMDBMovieDetails extends Omit<TMDBMovie, "media_type" | "genre_ids"> {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  backdrop_path: string | null;
  credits?: { cast: TMDBPerson[]; crew: TMDBPersonCrew[] };
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  episode_number: number;
  runtime: number | null;
  still_path: string | null;
  overview: string;
  vote_average: number;
}

export interface TMDBTVSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episodes: TMDBEpisode[];
}

export interface TMDBPersonCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBTVDetails extends Omit<TMDBTV, "media_type" | "genre_ids"> {
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TMDBSeason[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  tagline: string;
  backdrop_path: string | null;
  credits?: { cast: TMDBPerson[]; crew: TMDBPersonCrew[] };
}

export interface TMDBPerson {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDBWatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TMDBWatchProviderCountry {
  link: string;
  flatrate?: TMDBWatchProviderItem[];
  rent?: TMDBWatchProviderItem[];
  buy?: TMDBWatchProviderItem[];
}

export interface TMDBWatchProviders {
  id: number;
  results: {
    [country: string]: TMDBWatchProviderCountry;
  };
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export class TMDBError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "TMDBError";
  }
}

async function fetchTMDB<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new TMDBError(response.status, `TMDB request failed: ${response.statusText}`);
  }
  return response.json();
}

export const tmdb = {
  search: async (
    query: string,
    mediaType: "all" | "movie" | "tv" = "all",
    signal?: AbortSignal,
  ) => {
    const isMulti = mediaType === "all";
    const endpoint = isMulti ? "search/multi" : `search/${mediaType}`;
    const response = await fetchTMDB<{ results: TMDBResult[] }>(
      `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${TMDB_LANG}`,
      signal,
    );
    let results = response.results;
    if (isMulti) {
      results = results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv",
      );
    } else {
      results = results.map((r) => ({ ...r, media_type: mediaType })) as TMDBResult[];
    }
    return results;
  },

  getMovieDetails: async (id: number, signal?: AbortSignal) => {
    return fetchTMDB<TMDBMovieDetails>(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=${TMDB_LANG}&append_to_response=credits`,
      signal,
    );
  },

  getTvDetails: async (id: number, signal?: AbortSignal) => {
    return fetchTMDB<TMDBTVDetails>(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=${TMDB_LANG}&append_to_response=credits`,
      signal,
    );
  },

  getGenres: async (mediaType: "movie" | "tv", signal?: AbortSignal) => {
    const response = await fetchTMDB<{ genres: TMDBGenre[] }>(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=${TMDB_LANG}`,
      signal,
    );
    return response.genres;
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number, signal?: AbortSignal) => {
    return fetchTMDB<TMDBTVSeasonDetails>(
      `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=${TMDB_LANG}`,
      signal,
    );
  },

  getWatchProviders: async (mediaType: "movie" | "tv", id: number, signal?: AbortSignal) => {
    return fetchTMDB<TMDBWatchProviders>(
      `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`,
      signal,
    );
  },

  getPosterUrl: (path: string, size: "w200" | "w500" | "original" = "w500") => {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },

  getBackdropUrl: (path: string, size: "w780" | "w1280" | "original" = "w780") => {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
