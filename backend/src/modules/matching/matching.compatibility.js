const { Friend } = require('../../database/models/Social');
const { CommunityMember } = require('../../database/models/Community');

/**
 * Calculates a compatibility score (0-100%) and generates a textual explanation.
 * Returns null or { isBlocked: true } if safety bounds are violated.
 */
async function calculateCompatibility(user1, user2, matchContext = {}) {
  if (!user1 || !user2) {
    return { score: 50, explanation: "Standard match for this screening." };
  }

  // 1. Safety Bounds check: Block list
  const blockCheck = await Friend.findOne({
    $or: [
      { user1: user1._id, user2: user2._id },
      { user1: user2._id, user2: user1._id }
    ],
    status: 'blocked'
  });

  if (blockCheck) {
    return { isBlocked: true, score: 0, explanation: "Blocked user connection." };
  }

  // 2. Privacy Check: If either user disabled personalization, return privacy-friendly explanation
  const u1Disable = user1.privacy?.disablePersonalization;
  const u2Disable = user2.privacy?.disablePersonalization;

  if (u1Disable || u2Disable) {
    const movieStr = matchContext.movie ? ` for ${matchContext.movie}` : "";
    return {
      score: 75,
      explanation: `Matched based on your shared movie screening selection${movieStr}.`
    };
  }

  // 3. Full Personalization calculation
  let score = 40; // Base score (they both chose the same movie and theater)
  const explanations = [];

  // Genre Overlap (Max 30 points)
  const genres1 = user1.favoriteGenres || [];
  const genres2 = user2.favoriteGenres || [];
  const mutualGenres = genres1.filter(g => genres2.includes(g));
  if (mutualGenres.length > 0) {
    const points = Math.min(30, mutualGenres.length * 10);
    score += points;
    explanations.push(`You both love ${mutualGenres.slice(0, 2).join(" & ")}`);
  }

  // Age compatibility (Max 10 points)
  const ageDiff = Math.abs((user1.age || 25) - (user2.age || 25));
  if (ageDiff <= 3) {
    score += 10;
  } else if (ageDiff <= 7) {
    score += 6;
  } else if (ageDiff <= 12) {
    score += 3;
  }

  // Language overlap (Max 10 points)
  const langs1 = user1.profile?.languages || [];
  const langs2 = user2.profile?.languages || [];
  const mutualLangs = langs1.filter(l => langs2.includes(l));
  if (mutualLangs.length > 0) {
    score += 10;
    explanations.push(`Both speak ${mutualLangs[0]}`);
  }

  // Actor/Director Overlap (Max 10 points)
  const act1 = user1.profile?.actors || [];
  const act2 = user2.profile?.actors || [];
  const dir1 = user1.profile?.directors || [];
  const dir2 = user2.profile?.directors || [];
  
  const mutualAct = act1.filter(a => act2.includes(a));
  const mutualDir = dir1.filter(d => dir2.includes(d));

  if (mutualDir.length > 0) {
    score += 10;
    explanations.push(`Fans of director ${mutualDir[0]}`);
  } else if (mutualAct.length > 0) {
    score += 8;
    explanations.push(`Fans of actor ${mutualAct[0]}`);
  }

  // Mutual Communities (Max 10 points)
  try {
    const u1Comms = await CommunityMember.find({ user: user1._id }).select('community');
    const u2Comms = await CommunityMember.find({ user: user2._id }).select('community');
    
    const u1CommIds = u1Comms.map(c => c.community.toString());
    const u2CommIds = u2Comms.map(c => c.community.toString());
    const mutualComms = u1CommIds.filter(id => u2CommIds.includes(id));

    if (mutualComms.length > 0) {
      score += Math.min(10, mutualComms.length * 5);
      explanations.push(`Members of ${mutualComms.length} mutual communities`);
    }
  } catch (err) {
    console.error("Failed to query mutual communities:", err);
  }

  // Social Friendship (Bonus 5 points)
  try {
    const isFriend = await Friend.findOne({
      $or: [
        { user1: user1._id, user2: user2._id },
        { user1: user2._id, user2: user1._id }
      ],
      status: 'friends'
    });
    if (isFriend) {
      score += 10;
      explanations.push("You are already connected as friends!");
    }
  } catch (err) {
    console.error("Failed to query friend connection:", err);
  }

  // Cap score at 99% and minimum at 45%
  const finalScore = Math.max(45, Math.min(99, score));
  let finalExplanation = "Attending the same screening and share similar movie tastes.";
  if (explanations.length > 0) {
    finalExplanation = explanations.join(", ") + ".";
  }

  return {
    score: finalScore,
    explanation: finalExplanation
  };
}

module.exports = {
  calculateCompatibility
};
