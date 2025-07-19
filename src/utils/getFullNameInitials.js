// <= GET FULLNAME INITIALS HELPER FUNCTION =>

export const getFullNameInitials = (fullName) => {
  // DERIVING PARTS OF THE FULLNAME
  const fullNameParts = fullName.split(" ").filter(Boolean);
  // GETTING THE INITIALS OF THE FIRST TWO WORDS ONLY
  const fullNameInitials =
    fullNameParts.length > 1
      ? (fullNameParts[0][0] + fullNameParts[1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  return fullNameInitials;
};
