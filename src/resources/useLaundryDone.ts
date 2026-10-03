import useNotice from "hooks/useNotice";
import useUpdateOutfits from "resources/useUpdateOutfits";
import { Counted, undoOf, washed } from "utils/laundry";

// Washes every piece given at once ("Yes, reset all", "Laundry done"), with an
// Undo: one tap clears every count, so a mistaken tap must be easy to take back
const useLaundryDone = () => {
  const [updateOutfits] = useUpdateOutfits();
  const toast = useNotice();
  const onError = () =>
    toast({
      status: "error",
      title: "Couldn't update your hamper",
      description: "Nothing was changed. Please try again.",
    });

  return (pieces: Counted[]) => {
    const updates = pieces.map(washed);
    const undo = undoOf(pieces, updates);
    return updateOutfits([], undefined, updates)
      .then(() =>
        toast({
          status: "success",
          title: `${pieces.length} piece${pieces.length === 1 ? "" : "s"} washed`,
          action: {
            label: "Undo",
            onClick: () => {
              updateOutfits([], undefined, undo).catch(onError);
            },
          },
        })
      )
      .catch(onError);
  };
};

export default useLaundryDone;
