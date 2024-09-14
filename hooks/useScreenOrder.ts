import { useAuthState } from "../AuthContext";

export const useScreenOrder = () => {
  const { chosenAvatar, chosenBio, chosenTags } = useAuthState();

  return chosenBio
    ? chosenAvatar
      ? chosenTags
        ? "Tabs"
        : "LookingTo"
      : "SelectAvatar"
    : "PersonalDetails";
};
