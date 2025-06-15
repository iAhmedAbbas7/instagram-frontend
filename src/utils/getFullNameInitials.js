// <= GET FULLNAME INITIALS HELPER FUNCTION =>

export const getFullNameInitials = (fullName) => {
  // DERIVING PARTS OF THE FULLNAME
  const fullNameParts = fullName.split(" ").filter(Boolean);
  // GETTING INITIALS OF THE FULLNAME
  const fullNameInitials =
    fullNameParts.length > 1
      ? (
          fullNameParts[0][0] + fullNameParts[fullNameParts.length - 1][0]
        ).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
  return fullNameInitials;
};
