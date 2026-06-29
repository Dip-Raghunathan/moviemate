import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import Spinner from '../../../shared/components/ui/Spinner';
import Badge from '../../../shared/components/ui/Badge';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

// Curated movie catalog copy for real-time offline-first typo-tolerant search
const MOVIE_CATALOG = [
  {
    id: "m1",
    title: "Oppenheimer",
    genres: ["Drama", "History", "Biography"],
    director: "Christopher Nolan",
    actors: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
    language: "English",
    year: 2023,
    rating: 8.9,
    runtime: 180,
    streaming: "Peacock",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
  },
  {
    id: "m2",
    title: "Dune: Part Two",
    genres: ["Sci-Fi", "Adventure", "Action"],
    director: "Denis Villeneuve",
    actors: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    language: "English",
    year: 2024,
    rating: 8.8,
    runtime: 166,
    streaming: "Max",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
  },
  {
    id: "m3",
    title: "Interstellar",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    director: "Christopher Nolan",
    actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    language: "English",
    year: 2014,
    rating: 8.7,
    runtime: 169,
    streaming: "Paramount+",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: "m4",
    title: "Inception",
    genres: ["Sci-Fi", "Action", "Thriller"],
    director: "Christopher Nolan",
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    language: "English",
    year: 2010,
    rating: 8.8,
    runtime: 148,
    streaming: "Netflix",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea."
  },
  {
    id: "m5",
    title: "Spirited Away",
    genres: ["Anime", "Fantasy", "Adventure"],
    director: "Hayao Miyazaki",
    actors: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    language: "Japanese",
    year: 2001,
    rating: 8.6,
    runtime: 125,
    streaming: "Max",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits."
  },
  {
    id: "m6",
    title: "The Dark Knight",
    genres: ["Action", "Crime", "Drama"],
    director: "Christopher Nolan",
    actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    language: "English",
    year: 2008,
    rating: 9.0,
    runtime: 152,
    streaming: "Max",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
  },
  {
    id: "m7",
    title: "Everything Everywhere All at Once",
    genres: ["Sci-Fi", "Adventure", "Comedy"],
    director: "Daniel Kwan",
    actors: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
    language: "English",
    year: 2022,
    rating: 8.5,
    runtime: 139,
    streaming: "Netflix",
    description: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes."
  },
  {
    id: "m8",
    title: "Parasite",
    genres: ["Thriller", "Drama", "Comedy"],
    director: "Bong Joon Ho",
    actors: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
    language: "Korean",
    year: 2019,
    rating: 8.5,
    runtime: 132,
    streaming: "Max",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
  },
  {
    id: "m9",
    title: "Knives Out",
    genres: ["Comedy", "Mystery", "Thriller"],
    director: "Rian Johnson",
    actors: ["Daniel Craig", "Chris Evans", "Ana de Armas"],
    language: "English",
    year: 2019,
    rating: 7.9,
    runtime: 130,
    streaming: "Netflix",
    description: "A detective investigates the death of the patriarch of an eccentric, combative family."
  },
  {
    id: "m10",
    title: "Spider-Man: Across the Spider-Verse",
    genres: ["Action", "Adventure", "Animation"],
    director: "Joaquim Dos Santos",
    actors: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    language: "English",
    year: 2023,
    rating: 8.6,
    runtime: 140,
    streaming: "Netflix",
    description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence."
  },
  {
    id: "m11",
    title: "Whiplash",
    genres: ["Drama", "Music"],
    director: "Damien Chazelle",
    actors: ["Miles Teller", "J.K. Simmons", "Paul Reiser"],
    language: "English",
    year: 2014,
    rating: 8.5,
    runtime: 106,
    streaming: "Netflix",
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing."
  },
  {
    id: "m12",
    title: "Get Out",
    genres: ["Horror", "Mystery", "Thriller"],
    director: "Jordan Peele",
    actors: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford"],
    language: "English",
    year: 2017,
    rating: 7.8,
    runtime: 104,
    streaming: "Peacock",
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception reaches a boiling point."
  },
  {
    id: "m13",
    title: "La La Land",
    genres: ["Romance", "Comedy", "Drama", "Music"],
    director: "Damien Chazelle",
    actors: ["Ryan Gosling", "Emma Stone", "Rosemarie DeWitt"],
    language: "English",
    year: 2016,
    rating: 8.0,
    runtime: 128,
    streaming: "Netflix",
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations."
  },
  {
    id: "m14",
    title: "The Godfather",
    genres: ["Crime", "Drama"],
    director: "Francis Ford Coppola",
    actors: ["Marlon Brando", "Al Pacino", "James Caan"],
    language: "English",
    year: 1972,
    rating: 9.2,
    runtime: 175,
    streaming: "Paramount+",
    description: "The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son."
  },
  {
    id: "m15",
    title: "Pulp Fiction",
    genres: ["Crime", "Drama"],
    director: "Quentin Tarantino",
    actors: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    language: "English",
    year: 1994,
    rating: 8.9,
    runtime: 154,
    streaming: "Max",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
  },
  {
    id: "m16",
    title: "Blade Runner 2049",
    genres: ["Sci-Fi", "Action", "Drama"],
    director: "Denis Villeneuve",
    actors: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
    language: "English",
    year: 2017,
    rating: 8.0,
    runtime: 164,
    streaming: "Max",
    description: "A new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos."
  },
  {
    id: "m17",
    title: "Poor Things",
    genres: ["Comedy", "Romance", "Sci-Fi"],
    director: "Yorgos Lanthimos",
    actors: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe"],
    language: "English",
    year: 2023,
    rating: 8.0,
    runtime: 141,
    streaming: "Hulu",
    description: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist."
  },
  {
    id: "m18",
    title: "Perfect Blue",
    genres: ["Anime", "Thriller", "Horror"],
    director: "Satoshi Kon",
    actors: ["Junko Iwao", "Rica Matsumoto", "Shinpachi Tsuji"],
    language: "Japanese",
    year: 1997,
    rating: 8.0,
    runtime: 81,
    streaming: "Prime Video",
    description: "A retired pop singer turned actress's sense of reality starts to slip when she is stalked by an obsessed fan and plagued by ghosts of her past."
  },
  {
    id: "m19",
    title: "Kimi no Na wa (Your Name.)",
    genres: ["Anime", "Romance", "Fantasy", "Drama"],
    director: "Makoto Shinkai",
    actors: ["Ryunosuke Kamiki", "Mone Kamishiraishi", "Ryo Narita"],
    language: "Japanese",
    year: 2016,
    rating: 8.4,
    runtime: 106,
    streaming: "Crunchyroll",
    description: "Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?"
  },
  {
    id: "m20",
    title: "The Grand Budapest Hotel",
    genres: ["Comedy", "Drama", "Adventure"],
    director: "Wes Anderson",
    actors: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric"],
    language: "English",
    year: 2014,
    rating: 8.1,
    runtime: 99,
    streaming: "Hulu",
    description: "A writer relates his adventures at a renowned European resort hotel between the first and second World Wars."
  },
  {
    id: "m21",
    title: "Shutter Island",
    genres: ["Mystery", "Thriller"],
    director: "Martin Scorsese",
    actors: ["Leonardo DiCaprio", "Mark Ruffalo", "Ben Kingsley"],
    language: "English",
    year: 2010,
    rating: 8.2,
    runtime: 138,
    streaming: "Paramount+",
    description: "Teddy Daniels and Chuck Aule, two US marshals, are sent to an asylum on a remote island in order to investigate the disappearance of a patient."
  },
  {
    id: "m22",
    title: "Arrival",
    genres: ["Sci-Fi", "Mystery", "Drama"],
    director: "Denis Villeneuve",
    actors: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
    language: "English",
    year: 2016,
    rating: 7.9,
    runtime: 116,
    streaming: "Paramount+",
    description: "A linguist works with the military to communicate with alien lifeforces after twelve mysterious spacecraft appear around the world."
  },
  {
    id: "m23",
    title: "The Matrix",
    genres: ["Sci-Fi", "Action"],
    director: "Lana Wachowski",
    actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    language: "English",
    year: 1999,
    rating: 8.7,
    runtime: 136,
    streaming: "Max",
    description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence."
  },
  {
    id: "m24",
    title: "Roma",
    genres: ["Drama"],
    director: "Alfonso Cuarón",
    actors: ["Yalitza Aparicio", "Marina de Tavira", "Diego Cortina Autrey"],
    language: "Spanish",
    year: 2018,
    rating: 7.7,
    runtime: 135,
    streaming: "Netflix",
    description: "A year in the life of a middle-class family's maid in Mexico City in the early 1970s."
  },
  {
    id: "m25",
    title: "Mad Max: Fury Road",
    genres: ["Action", "Sci-Fi", "Adventure"],
    director: "George Miller",
    actors: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
    language: "English",
    year: 2015,
    rating: 8.1,
    runtime: 120,
    streaming: "Max",
    description: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max."
  }
];

// Levenshtein distance implementation for typo tolerance
function getLevenshteinDistance(a, b) {
  const tmp = [];
  let i, j;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (i = 0; i <= a.length; i++) tmp[i] = [i];
  for (j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        a[i - 1] === b[j - 1] ? tmp[i - 1][j - 1] : tmp[i - 1][j - 1] + 1
      );
    }
  }
  return tmp[a.length][b.length];
}

function getSimilarity(s1, s2) {
  const w1 = s1.toLowerCase();
  const w2 = s2.toLowerCase();
  if (w1.includes(w2) || w2.includes(w1)) return 1.0;
  const dist = getLevenshteinDistance(w1, w2);
  const maxLen = Math.max(w1.length, w2.length);
  return maxLen === 0 ? 1.0 : 1.0 - dist / maxLen;
}

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedStreaming, setSelectedStreaming] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  const genresList = Array.from(new Set(MOVIE_CATALOG.flatMap(m => m.genres))).sort();
  const languagesList = Array.from(new Set(MOVIE_CATALOG.map(m => m.language))).sort();
  const streamingList = Array.from(new Set(MOVIE_CATALOG.map(m => m.streaming))).sort();

  // Search logic running on query and filter updates
  useEffect(() => {
    setSearching(true);
    const delayDebounce = setTimeout(() => {
      let filtered = MOVIE_CATALOG.map(movie => {
        let score = 0;
        
        if (query.trim()) {
          const words = query.trim().split(/\s+/);
          words.forEach(word => {
            // Direct matches
            if (movie.title.toLowerCase().includes(word.toLowerCase())) score += 100;
            if (movie.director.toLowerCase().includes(word.toLowerCase())) score += 50;
            if (movie.description.toLowerCase().includes(word.toLowerCase())) score += 20;
            
            // Check actor matches
            movie.actors.forEach(actor => {
              if (actor.toLowerCase().includes(word.toLowerCase())) score += 30;
            });
            
            // Check genre matches
            movie.genres.forEach(genre => {
              if (genre.toLowerCase().includes(word.toLowerCase())) score += 25;
            });

            // Typo-tolerant similarity matches (Levenshtein thresholds)
            const titleSim = getSimilarity(movie.title, word);
            if (titleSim > 0.65) score += Math.floor(titleSim * 60);

            const dirSim = getSimilarity(movie.director, word);
            if (dirSim > 0.65) score += Math.floor(dirSim * 30);
          });
        } else {
          // If no query, score matches base movie rating
          score = movie.rating * 10;
        }

        return { ...movie, relevanceScore: score };
      });

      // Filter by genre
      if (selectedGenre) {
        filtered = filtered.filter(m => m.genres.includes(selectedGenre));
      }

      // Filter by language
      if (selectedLanguage) {
        filtered = filtered.filter(m => m.language === selectedLanguage);
      }

      // Filter by streaming
      if (selectedStreaming) {
        filtered = filtered.filter(m => m.streaming === selectedStreaming);
      }

      // Filter by rating
      if (minRating > 0) {
        filtered = filtered.filter(m => m.rating >= minRating);
      }

      // Sort by relevance score desc, then by rating desc
      const sorted = filtered
        .filter(m => query.trim() === '' || m.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore || b.rating - a.rating);

      setResults(sorted);

      // Suggestions dropdown mapping
      if (query.trim().length > 1) {
        const matchingTitles = MOVIE_CATALOG.filter(m => 
          getSimilarity(m.title, query) > 0.5 || m.title.toLowerCase().includes(query.toLowerCase())
        ).map(m => m.title);
        setSuggestions(Array.from(new Set(matchingTitles)).slice(0, 5));
      } else {
        setSuggestions([]);
      }

      setSearching(false);
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedGenre, selectedLanguage, selectedStreaming, minRating]);

  const handleQuickMatch = (movieTitle) => {
    navigate('/dashboard', { state: { movie: movieTitle } });
  };

  const handleSuggestionClick = (title) => {
    setQuery(title);
    setSuggestions([]);
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedStreaming('');
    setMinRating(0);
    setQuery('');
  };

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* Ambient background blur */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.05) 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(90px)' }} />
      </div>

      <div className="section-container" style={{ paddingTop: 108, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', color: '#e8102a', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PremiumIcon name="star" size={14} color="#e8102a" /> Smart Discovery Desk
          </p>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#f0f0fa', letterSpacing: '-0.04em', margin: 0 }}>
            Search Movie Catalog
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b85', marginTop: 6 }}>
            Typo-tolerant real-time matching with relevance ranking.
          </p>
        </div>

        {/* Outer Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
          
          {/* Left panel: Search & Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24 }}>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#f0f0fa', margin: '0 0 4px' }}>Search & Filter</h3>
            
            {/* Search Input wrapper */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Search query</label>
              <input
                type="text"
                placeholder="Search title, director, actors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f0f0fa',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'rgba(13,13,26,0.98)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, overflow: 'hidden', zIndex: 10,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  marginTop: 6
                }}>
                  {suggestions.map((title, i) => (
                    <div
                      key={i}
                      onClick={() => handleSuggestionClick(title)}
                      style={{ padding: '10px 14px', fontSize: '0.84rem', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', color: '#a8a8c0' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Keywords tags */}
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#6b6b85', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Trending Searches</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {["Oppenheimer", "Sci-Fi", "Christopher Nolan", "Dune"].map(t => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', color: '#a8a8c0', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f0f0fa'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#a8a8c0'; }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Genre</label>
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#a8a8c0', fontSize: '0.86rem', outline: 'none' }}
              >
                <option value="">All Genres</option>
                {genresList.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Language</label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#a8a8c0', fontSize: '0.86rem', outline: 'none' }}
              >
                <option value="">All Languages</option>
                {languagesList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Streaming filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Streaming Service</label>
              <select
                value={selectedStreaming}
                onChange={e => setSelectedStreaming(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#a8a8c0', fontSize: '0.86rem', outline: 'none' }}
              >
                <option value="">All Services</option>
                {streamingList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Minimum Rating</label>
                <span style={{ fontSize: '0.8rem', color: '#ff6b7a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PremiumIcon name="star" size={14} color="#ff6b7a" /> {minRating > 0 ? `${minRating}+` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="9.5"
                step="0.5"
                value={minRating}
                onChange={e => setMinRating(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#e8102a' }}
              />
            </div>

            <button
              onClick={clearFilters}
              style={{
                width: '100%', padding: '11px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#6b6b85', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 200ms ease', marginTop: 8
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f0f0fa'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b6b85'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              Reset Filters
            </button>
          </div>

          {/* Right panel: Search Results */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b6b85', fontWeight: 500 }}>
                Showing {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
              {query && (
                <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PremiumIcon name="check" size={14} color="#10b981" /> Typo tolerance active (Levenshtein score matched)
                </span>
              )}
            </div>

            {searching ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}><Spinner size="lg" color="#e8102a" /></div>
            ) : results.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <PremiumIcon name="movie" size={56} color="#4a4a60" />
                </div>
                <h4 style={{ fontSize: '1.1rem', color: '#f0f0fa', fontWeight: 700, margin: '0 0 6px' }}>No matches found</h4>
                <p style={{ fontSize: '0.84rem', color: '#6b6b85', margin: 0 }}>Try adjusting your keywords or clearing selected filters.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 20, padding: 22, display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: 16, transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,16,42,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                        <h4 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#f0f0fa', letterSpacing: '-0.02em', margin: 0 }}>
                          {m.title}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#a8a8c0', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6 }}>{m.year}</span>
                        <span style={{ fontSize: '0.72rem', color: '#a8a8c0', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6 }}>{m.runtime} mins</span>
                        <span style={{ fontSize: '0.72rem', color: '#ff6b7a', background: 'rgba(232,16,42,0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Streaming: {m.streaming}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#a8a8c0', lineHeight: 1.45, margin: '0 0 12px' }}>{m.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '0.78rem', color: '#6b6b85' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="movie" size={14} color="#6b6b85" />
                          Director: <span style={{ color: '#a8a8c0', fontWeight: 600 }}>{m.director}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="group" size={14} color="#6b6b85" />
                          Starring: <span style={{ color: '#a8a8c0', fontWeight: 600 }}>{m.actors.join(', ')}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="video" size={14} color="#6b6b85" />
                          Language: <span style={{ color: '#a8a8c0', fontWeight: 600 }}>{m.language}</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                        {m.genres.map(g => (
                          <span key={g} style={{ fontSize: '0.7rem', color: '#6b6b85', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>{g}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 20, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#f5a623', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,165,35,0.25)', padding: '4px 10px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PremiumIcon name="star" size={18} color="#f5a623" /> {m.rating}
                      </span>
                      <button
                        onClick={() => handleQuickMatch(m.title)}
                        style={{
                          padding: '10px 16px', borderRadius: 12,
                          background: 'linear-gradient(135deg, #e8102a, #ff3a4a)',
                          color: 'white', border: 'none', fontSize: '0.8rem', fontWeight: 700,
                          cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,16,42,0.3)',
                          transition: 'all 200ms ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      >
                        Quick Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default SearchPage;
