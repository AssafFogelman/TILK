import { useAuthState } from "../AuthContext";

export const useScreenOrder = () => {
  const { chosenAvatar, chosenBio, chosenTags } = useAuthState();

  if (!chosenBio) return "PersonalDetails";
  if (!chosenAvatar) return "SelectAvatar";
  if (!chosenTags) return "LookingTo";
  return "Tabs";
};
