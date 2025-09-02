// <== FLATTEN HELPER : FLATTENING AN EXPANDED STORY TRAY ==>

export const flattenTrayToSlides = (tray = []) => {
  // INITIATING SLIDES ARRAY
  const slides = [];
  // LOOPING OVER EACH OWNER IN THE TRAY
  for (const ownerGroup of tray) {
    // SETTING STORY OWNER
    const owner = ownerGroup.owner;
    // STORY STACK EXPECTED WHEN EXPANDED IS TRUE
    const storyStack = ownerGroup.storyStack || [];
    // LOOPING OVER EACH STORY OF STORY STACK
    for (const story of storyStack) {
      // SETTING STORY ID
      const storyId = story.storyId;
      // GETTING STORY MEDIAS
      const storyMedias = story.medias || [];
      // PUSHING EACH MEDIA OF THE STORY IN SLIDES ARRAY
      for (let mediaIndex = 0; mediaIndex < storyMedias.length; mediaIndex++) {
        // SETTING MEDIA
        const media = storyMedias[mediaIndex];
        // PUSHING THE MEDIAS IN THE SLIDES INDEX
        slides.push({
          id: `${storyId}:${mediaIndex}`,
          ownerId: owner?._id,
          owner,
          storyId,
          mediaIndex,
          url: media.url,
          type: media.type,
          order: media.order ?? mediaIndex,
          duration: media.duration ?? (media.type === "VIDEO" ? 15 : 5),
        });
      }
    }
  }
  // RETURNING SLIDES ARRAY
  return slides;
};

// <== OWNER MEDIA BUILDER HELPER : COMBINING OWNER STORIES MEDIA ==>
export const buildOwnerCombinedMedias = (ownerEntry = {}) => {
  // INITIATING THE COMBINED MEDIA ARRAY
  const combined = [];
  // GETTING THE STORY STACK FROM OWNER ENTRY
  const storyStack = ownerEntry.storyStack || [];
  // LOOPING OVER STORY STACK TO SET DETAILS FOR EACH MEDIA
  for (const story of storyStack) {
    // GETTING MEDIAS OF STORY
    const medias = (story.medias || [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    // LOOPING OVER STORY MEDIAS
    for (let i = 0; i < medias.length; i++) {
      // SETTING MEDIA
      const media = medias[i];
      // PUSHING MEDIA IN COMBINED ARRAY
      combined.push({
        url: media.url,
        type: media.type,
        storyLocalIndex: i,
        storyId: story.storyId,
        order: media.order ?? i,
        duration: media.duration ?? (media.type === "VIDEO" ? 15 : 5),
      });
    }
  }
  // RETURNING COMBINED ARRAY
  return combined;
};
