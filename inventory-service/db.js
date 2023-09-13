const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-north-1",
  accessKeyId: "AKIAY45MCK5ENWSW44L3",
  secretAccessKey: "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",
});

const db = new AWS.DynamoDB.DocumentClient();

const Table = "inventory";

module.exports = {
  db,
  Table,
};
