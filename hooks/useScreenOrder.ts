import { useAuthState } from "../context/AuthContext";

export const useScreenOrder = () => {
  const { chosenAvatar, chosenBio, chosenTags } = useAuthState();

  return () => {
    if (!chosenBio) return "PersonalDetails";
    if (!chosenAvatar) return "SelectAvatar";
    if (!chosenTags) return "LookingTo";
    return "Tabs";
  };
};
