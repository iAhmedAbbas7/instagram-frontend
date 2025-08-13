// <== MOCKUP TESTING DATA ==>

// <== HELPER : PICSUM IMAGE URL WITH FIXED DIMENSIONS USING A SEED NUMBER ==>
const randomImage = (n) => `https://picsum.photos/seed/${n}/400/700`;

// <== EXPORT : STORY GROUPS MOCKUPS - 15 STATIC GROUPS ==>
export const storyGroups = Array.from({ length: 15 }).map((_, i) => ({
  // CREATING OWNER OBJECT FOR THE STORY GROUP (USER META)
  owner: {
    //  OWNER ID BUILT FROM INDEX
    _id: `user_${i + 1}`,
    // USERNAME BUILT FROM INDEX
    username: `user ${i + 1}`,
    // FULLNAME BUILT FROM INDEX
    fullName: `User ${i + 1}`,
    // PROFILE PHOTO BUILT FROM PICSUM IMAGES
    profilePhoto: randomImage(100 + i),
  },
  // STORY ID'S ARRAY: EACH GROUP POINTS TO A SINGLE STORY ID
  storyIds: [`story_${i + 1}`],
  // FLAG INDICATING IF THE CURRENT USER HAS SEEN THIS STORY
  hasSeen: i % 4 === 0,
  // A SIMPLE COUNT OF STORIES IN THE GROUP
  storyCount: 3,
  // TIMESTAMP FOR LATEST STORY IN THE GROUP (DECREASING WITH INDEX)
  latestStoryAt: new Date(Date.now() - i * 3600_000).toISOString(),
}));

// <== EXPORT : STORY OBJECTS KEYED BY STORY ID (FULL STORY DOCS) ==>
export const storiesById = Object.fromEntries(
  // MAPPING EACH STORY GROUP TO A KEY VALUE PAIR
  storyGroups.map((g, i) => {
    // GETTING THE STORY ID THIS GROUP REFERENCES (FIRST ITEM IN STORY ID'S)
    const storyId = g.storyIds[0];
    // BUILDING AN ARRAY FO MEDIA ENTRIES FOR EACH STORY WITH VARYING LENGTHS
    const medias = Array.from({ length: 3 + (i % 2) }).map((_, mIdx) => {
      // DECIDING IF THIS MEDIA ITEM SHOULD BE A VIDEO
      const isVideo = (i + mIdx) % 5 === 0;
      // RETURNING A MEDIA OBJECT
      return {
        // ORDER OF THIS MEDIA ITEM
        order: mIdx,
        // TYPE IS EITHER VIDEO OR IMAGE
        type: isVideo ? "VIDEO" : "IMAGE",
        // URL OF THE RESPECTIVE MEDIA TYPE
        url: isVideo
          ? `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`
          : randomImage(i * 10 + mIdx + 1),
        // DURATION IN SECONDS FOR RESPECTIVE MEDIA TYPE
        duration: isVideo ? 10 : 5,
        // PUBLIC ID OF THE MEDIA TYPE
        publicId: `stories/${g.owner._id}/media_${mIdx}`,
      };
    });
    // RETURNING A PAIR OF STORY ID AND STORY DOCUMENT FOR THE MAP
    return [
      storyId,
      {
        // STORY DOCUMENT ID
        _id: storyId,
        // OWNER OBJECT COPIED FROM THE GROUP
        owner: g.owner,
        // MEDIA ARRAY CREATED FOR THE STORY
        medias,
        // EXPIRES AT TIMESTAMP FOR THE STORY
        expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
        // CREATED A T TIMESTAMP FOR THE STORY
        createdAt: new Date().toISOString(),
      },
    ];
  })
);

// DEFAULT EXPORTS FOR THE STORY DATA
export default {
  storyGroups,
  storiesById,
};
