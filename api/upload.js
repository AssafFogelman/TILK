var multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const type = file.originalname.split(".")[1];
    const originalName = file.originalname.split(".")[0];
    console.log("file var:", file);
    cb(null, originalName + "-" + uniqueSuffix + "." + type);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
