import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  content: {
    username: { type: String, required: true },
    message: { type: String, required: true },
  },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  avatar: { type: String, required: true },
  postImg: { type: String, required: false },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
