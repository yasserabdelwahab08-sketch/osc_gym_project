import { Router } from "express";
import { signOut, signUp, signIn, get_BookingsForMySessions, patch_BookingsForMySessions, put_BookingsForMySessions, delete_BookingsForMySessions, view_all_available_sessions, createBooking, cancelBooking } from "../controllers/userController";
import { authorization, authorizeUser, authorizeUserIdentity, authorizeTrainer } from "../middleware/middle_ware"
const router = Router();


router.post("/", signIn);

router.post("/signUp", signUp);
router.get("/signOut", signOut);

router.get("/BookingsForMySessions/:sessionID", authorization, get_BookingsForMySessions);
router.patch("/BookingsForMySessions/:sessionID", authorization, patch_BookingsForMySessions);
router.put("/BookingsForMySessions/", authorizeTrainer, put_BookingsForMySessions);
router.delete("/BookingsForMySessions/:sessionID", authorization, delete_BookingsForMySessions);



router.get("/allAvailableSession", view_all_available_sessions);
router.put("/Booking", authorizeUser, createBooking);
router.patch("/cancelBooking/:sessionID", authorizeUserIdentity, cancelBooking);



export default router;
