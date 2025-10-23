const User = require("../models/User");
const amqp = require("amqplib");

/** Publish event to RabbitMQ */
async function publishEvent(event, payload) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertExchange("user_events", "fanout", { durable: false });
  channel.publish("user_events", "", Buffer.from(JSON.stringify({ event, payload })));
  await channel.close();
  await connection.close();
}

/** Lấy danh sách người dùng */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo người dùng mới */
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "Tạo người dùng thành công", user });

    // Gửi event sang auth-service
    await publishEvent("USER_CREATED", user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật người dùng */
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật người dùng thành công", user: updated });
    await publishEvent("USER_UPDATED", updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa người dùng */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
