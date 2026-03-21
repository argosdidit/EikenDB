// server.js (ESM版)

import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname を ESM で再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB 接続情報
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "EIKENDB"
};

// 静的ファイル配信
app.use(express.static(__dirname));

// -----------------------------
// /api/quizVocabulary
// -----------------------------
app.get("/api/quizVocabulary", async (req, res) => {
  const { level, year, times } = req.query;

  const tableMap = {
    pre2: "VOC_PRE2",
    grade2: "VOC_2",
    pre1: "VOC_PRE1",
    grade1: "VOC_1"
  };

  const tableName = tableMap[level];
  if (!tableName) return res.status(400).json({ error: "Invalid level" });

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT
      NO,
      SENTENCES,
      WORD1,
      WORD2,
      WORD3,
      WORD4,
      ANSWER
      FROM ${tableName}
      WHERE YEAR = ? AND TIMES = ?
      `,
      [year, times]
    );

    await connection.end();
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// -----------------------------
// /api/reading
// -----------------------------
app.get("/api/reading", async (req, res) => {
  const { level, year, times } = req.query;

  const tableSentence = {
    pre2: "READING_SENTENCE_PRE2",
    grade2: "READING_SENTENCE_2",
    pre1: "READING_SENTENCE_PRE1",
    grade1: "READING_SENTENCE_1"
  };

  const tableChoice = {
    pre2: "READING_CHOICE_PRE2",
    grade2: "READING_CHOICE_2",
    pre1: "READING_CHOICE_PRE1",
    grade1: "READING_CHOICE_1"
  };

  const sentenceTable = tableSentence[level];
  const choiceTable = tableChoice[level];

  if (!sentenceTable || !choiceTable) {
    return res.status(400).json({ error: "Invalid level" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [sentenceRows] = await connection.execute(
      `
      SELECT
      LEVELID,
      YEAR,
      TIMES,
      AREA,
      CLAUSE,
      SUBJECT,
      PATH_SENTENCE,
      PATH_EXPLANATION
      FROM ${sentenceTable}
      WHERE YEAR = ? AND TIMES = ?
      `,
      [year, times]
    );

    const [choiceRows] = await connection.execute(
      `
      SELECT
      LEVELID,
      YEAR,
      TIMES,
      AREA,
      NO,
      CLAUSE,
      SUBJECT,
      PATH_QUESTION,
      PATH_CHOICE1,
      PATH_CHOICE2,
      PATH_CHOICE3,
      PATH_CHOICE4,
      ANSWER
      FROM ${choiceTable}
      WHERE YEAR = ? AND TIMES = ?
      `,
      [year, times]
    );

    await connection.end();

    res.json({
      sentence: sentenceRows,
      choice: choiceRows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// -----------------------------
// サーバー起動
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
