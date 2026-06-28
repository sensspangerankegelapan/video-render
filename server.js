const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Backend Video Render Aktif"
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
