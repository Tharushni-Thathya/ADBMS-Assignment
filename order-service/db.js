const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://test-user:ZaMHN3zMaXxGrYF2@cluster0.mlgrx.mongodb.net/?retryWrites=true&w=majority",
  (error) => {
    if (error) throw error;
  }
);

mongoose.connection.on("connected", () =>
  console.log("Connected to Mongo database")
);

mongoose.connection.on("error", () =>
  console.log("MongoDB Connection Unsuccessfull")
);
