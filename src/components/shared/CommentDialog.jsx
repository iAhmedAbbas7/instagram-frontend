// <= IMPORTS =>
import { Dialog, DialogContent } from "../ui/dialog";
import INSTAGRAM from "../../assets/images/INSTAGRAM.png";

const CommentDialog = ({ open, setOpen }) => {
  return (
    <Dialog open={open}>
      <DialogContent
        className="p-0 border-none outline-none focus-visible:ring-0 focus:outline-none rounded-sm"
        onInteractOutside={() => setOpen(false)}
      >
        <img
          src={INSTAGRAM}
          alt="Post Image"
          className="w-full aspect-square object-cover rounded-sm"
        />
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
