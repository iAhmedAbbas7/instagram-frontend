// <= DATE UTILS FILE FOR MESSAGES DATE RENDERING =>

/**
 * FORMATS A DATE FOR DISPLAY IN MESSAGES
 * @param {string|Date} - DATE TO BE FORMATTED
 * @returns - FORMATTED DATE STRING - TODAY, YESTERDAY OR FULL DATES
 */
export const formatDateDivider = (date) => {
  // SETTING TODAY FOR COMPARISON
  const today = new Date();
  // MESSAGE DATE
  const messageDate = new Date(date);
  // RESETTING TIME TO COMPARE ONLY DATES
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const msgDate = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );
  // CALCULATING THE DIFFERENCE IN TIME
  const differenceTime = todayDate.getTime() - msgDate.getTime();
  // CALCULATING THE DIFFERENCE IN DAYS
  const differenceDays = Math.ceil(differenceTime / (1000 * 60 * 24 * 24));
  // SETTING THE LABEL ACCORDINGLY
  if (differenceDays === 0) return "Today";
  if (differenceDays === 1) return "Yesterday";
  return messageDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * CHECKS IF TWO DATES ARE NO DIFFERENT DAYS
 * @param {string|Date} - FIRST DATE
 * @param {string|Date} - SECOND DATE
 * @returns {boolean} - TRUE IF DATES ARE IN DIFFERENT DAYS
 */
export const isDifferentDay = (date1, date2) => {
  // DATE 1
  const d1 = new Date(date1);
  // DATE 2
  const d2 = new Date(date2);
  // COMPARING
  return d1.toDateString() !== d2.toDateString();
};

/**
 * PROCESSES MESSAGES ARRAY AND ADDS DIVIDERS WHERE NEEDED
 * @param {Array} - ARRAY OF MESSAGE OBJECTS
 * @returns {Array} - ARRAY CONTAINING BOTH MESSAGES AND DATE DIVIDERS
 */
export const processMessagesWithDividers = (messages) => {
  // IF NO MESSAGES YET
  if (!messages || messages.length === 0) return [];
  // INITIATING PROCESSED ARRAY
  const processedItems = [];
  // PROCESSING MESSAGES
  messages.forEach((message, index) => {
    // SETTING PREVIOUS MESSAGE FROM THE INCOMING MESSAGE
    const previousMessage = messages[index - 1];
    // ADDING THE DIVIDER IF IT IS THE FIRST MESSAGE OR IN DIFFERENT DAY
    if (
      index === 0 ||
      isDifferentDay(previousMessage.createdAt - message.createdAt)
    ) {
      // PUSHING DIVIDER IN THE PROCESSED ITEMS
      processedItems.push({
        type: "DIVIDER",
        id: `DIVIDER-${message._id}`,
        date: message.createdAt,
        label: formatDateDivider(message.createdAt),
      });
    }
    // ADDING THE ACTUAL MESSAGE
    processedItems.push({
      type: "MESSAGE",
      ...message,
    });
  });
  // RETUNING PROCESSED ITEMS
  return processedItems;
};
