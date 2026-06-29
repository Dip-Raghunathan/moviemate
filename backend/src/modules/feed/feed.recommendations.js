const movieCatalog = require('../../utils/movieCatalog');
const { Review } = require('../../database/models/Review');
const { Friend } = require('../../database/models/Social');
const { Community, CommunityMember } = require('../../database/models/Community');
const Event = require('../../database/models/Event');
const Room = require('../../database/models/Room');

async function getRecommendationsForUser(user) {
  const isPersonalizationDisabled = user.privacy?.disablePersonalization === true;

  if (isPersonalizationDisabled) {
    // 1. Privacy Fallback Modes (Non-personalized, popular/recent catalog items)
    const sortedCatalog = [...movieCatalog].sort((a, b) => b.rating - a.rating);
    const aiPicks = sortedCatalog.slice(0, 4).map(m => ({
      ...m,
      explanation: "Popular pick on VX ShowMate"
    }));

    const trendingNearby = sortedCatalog.slice(4, 8).map(m => ({
      ...m,
      explanation: "Trending in theatres today"
    }));

    // Standard public communities
    let suggestedCommunities = [];
    try {
      const comms = await Community.find({ isArchived: false, privacy: 'public' }).limit(3);
      suggestedCommunities = comms.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        avatar: c.avatar,
        explanation: "Popular VX ShowMate Community"
      }));
    } catch (err) {
      console.error("Error fetching generic communities:", err);
    }

    // Standard upcoming events
    let suggestedEvents = [];
    try {
      const evts = await Event.find({ status: 'scheduled' }).populate('organizer', 'name').limit(3);
      suggestedEvents = evts.map(e => ({
        id: e._id,
        title: e.title,
        movie: e.movie,
        theatre: e.theatre,
        showtime: e.showtime,
        organizer: e.organizer?.name || "System",
        explanation: "Upcoming community watch meetup"
      }));
    } catch (err) {
      console.error("Error fetching generic events:", err);
    }

    return {
      aiPicks,
      trendingNearby,
      friendWatched: [],
      suggestedCommunities,
      suggestedEvents
    };
  }

  // 2. Full Personalized Recommendations
  const favoriteGenres = user.favoriteGenres || [];

  // A. AI Picks: Filter by genre overlap, sorted by rating
  let pickedMovies = movieCatalog.filter(m => 
    m.genres.some(g => favoriteGenres.includes(g))
  );

  // If not enough match, pad with other highly-rated movies
  if (pickedMovies.length < 4) {
    const matchedIds = pickedMovies.map(m => m.id);
    const padding = movieCatalog
      .filter(m => !matchedIds.includes(m.id))
      .sort((a, b) => b.rating - a.rating);
    pickedMovies = [...pickedMovies, ...padding].slice(0, 6);
  } else {
    pickedMovies = pickedMovies.sort((a, b) => b.rating - a.rating).slice(0, 6);
  }

  const aiPicks = pickedMovies.map(m => {
    const overlapping = m.genres.filter(g => favoriteGenres.includes(g));
    const genreText = overlapping.length > 0 ? overlapping.slice(0, 2).join(" & ") : "popular cinematic interest";
    return {
      ...m,
      explanation: `Because you love ${genreText}`
    };
  });

  // B. Trending Nearby: Calculate room bookings frequency, cross-referenced with catalog
  let trendingNearby = [];
  try {
    const activeRooms = await Room.find({ status: { $ne: 'deleted' } }).limit(100);
    const roomCounts = {};
    activeRooms.forEach(r => {
      if (r.movie) {
        roomCounts[r.movie] = (roomCounts[r.movie] || 0) + 1;
      }
    });

    // Match with catalog movies
    const catalogWithCounts = movieCatalog.map(m => ({
      ...m,
      bookingCount: roomCounts[m.title] || 0
    }));

    // Sort by booking count, then by rating
    const sortedTrending = catalogWithCounts.sort((a, b) => {
      if (b.bookingCount !== a.bookingCount) {
        return b.bookingCount - a.bookingCount;
      }
      return b.rating - a.rating;
    });

    trendingNearby = sortedTrending.slice(0, 4).map(m => ({
      ...m,
      explanation: m.bookingCount > 0 
        ? `${m.bookingCount} mates are booking tickets for this nearby right now!`
        : "Highly popular screening option in your region"
    }));
  } catch (err) {
    console.error("Error generating trending nearby:", err);
    trendingNearby = movieCatalog.slice(0, 4).map(m => ({ ...m, explanation: "Popular cinema booking" }));
  }

  // C. Because Your Friend Watched
  let friendWatched = [];
  try {
    const friends = await Friend.find({
      $or: [{ user1: user._id }, { user2: user._id }],
      status: 'friends'
    });

    const friendIds = friends.map(f => 
      f.user1.toString() === user._id.toString() ? f.user2 : f.user1
    );

    if (friendIds.length > 0) {
      const recentFriendReviews = await Review.find({
        user: { $in: friendIds },
        status: 'active'
      })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

      friendWatched = recentFriendReviews.map(r => {
        // Find matching catalog movie if available
        const catalogMovie = movieCatalog.find(m => m.title.toLowerCase() === r.movie.toLowerCase());
        const desc = catalogMovie ? catalogMovie.description : `Reviewed by your friend ${r.user?.name || 'Friend'}`;
        const genres = catalogMovie ? catalogMovie.genres : ['Drama'];
        const director = catalogMovie ? catalogMovie.director : 'Various';

        return {
          id: `fw-${r._id}`,
          title: r.movie,
          genres,
          director,
          rating: r.rating,
          description: desc,
          explanation: `Your friend ${r.user?.name || 'a friend'} rated it ${r.rating}/10`
        };
      });
    }
  } catch (err) {
    console.error("Error generating friend recommendations:", err);
  }

  // D. Suggested Communities: Suggest communities where members match user's favorite genres
  let suggestedCommunities = [];
  try {
    const userMemberships = await CommunityMember.find({ user: user._id }).select('community');
    const joinedIds = userMemberships.map(m => m.community.toString());

    const allComms = await Community.find({ isArchived: false, _id: { $nin: joinedIds } }).limit(10);
    
    // Sort communities based on genre matches in their names/descriptions
    const rankedComms = allComms.map(c => {
      let matchCount = 0;
      favoriteGenres.forEach(genre => {
        if (c.name.toLowerCase().includes(genre.toLowerCase()) || 
            c.description.toLowerCase().includes(genre.toLowerCase())) {
          matchCount += 1;
        }
      });
      return { community: c, matchCount };
    }).sort((a, b) => b.matchCount - a.matchCount);

    suggestedCommunities = rankedComms.slice(0, 3).map(rc => ({
      id: rc.community._id,
      name: rc.community.name,
      description: rc.community.description,
      avatar: rc.community.avatar,
      explanation: rc.matchCount > 0 
        ? `Suggested because you love ${favoriteGenres.join(', ')}`
        : "Popular Community you might like"
    }));
  } catch (err) {
    console.error("Error generating suggested communities:", err);
  }

  // E. Suggested Events: Events matching user's favorite genres/movies
  let suggestedEvents = [];
  try {
    const events = await Event.find({ status: 'scheduled' }).populate('organizer', 'name').limit(10);
    const rankedEvents = events.map(e => {
      // Find catalog movie for this event to check genres
      const catalogMovie = movieCatalog.find(m => m.title.toLowerCase() === e.movie.toLowerCase());
      let matchCount = 0;
      if (catalogMovie) {
        catalogMovie.genres.forEach(g => {
          if (favoriteGenres.includes(g)) matchCount++;
        });
      }
      return { event: e, matchCount };
    }).sort((a, b) => b.matchCount - a.matchCount);

    suggestedEvents = rankedEvents.slice(0, 3).map(re => ({
      id: re.event._id,
      title: re.event.title,
      movie: re.event.movie,
      theatre: re.event.theatre,
      showtime: re.event.showtime,
      organizer: re.event.organizer?.name || "System",
      explanation: re.matchCount > 0 
        ? `Matches your favorite genres (${favoriteGenres.slice(0, 2).join(', ')})`
        : "Upcoming screening party in your area"
    }));
  } catch (err) {
    console.error("Error generating suggested events:", err);
  }

  return {
    aiPicks,
    trendingNearby,
    friendWatched,
    suggestedCommunities,
    suggestedEvents
  };
}

module.exports = {
  getRecommendationsForUser
};
