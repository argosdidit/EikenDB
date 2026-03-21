// server.js

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const app = express();
const PORT = 3000; // Node.js 用のポート。MySQL とは別

// 環境変数から DB 接続情報を取得（Docker対応）
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "EIKENDB"
};

// 静的ファイル配信（HTML / CSS / JS）
app.use(express.static(path.join(__dirname)));

// -----------------------------
// /api/quizVocabulary エンドポイント
// -----------------------------
app.get("/api/quizVocabulary", async (req, res) => {
  const { level, year, times } = req.query;

  // レベル → テーブル名のマッピング
  const tableMap = {
    pre2: "VOC_PRE2",
    grade2: "VOC_2",
    pre1: "VOC_PRE1",
    grade1: "VOC_1"
  };

  const tableName = tableMap[level];
  if (!tableName) return res.status(400).json({ error: "Invalid level" });

  try {
    // MySQL に接続
    const connection = await mysql.createConnection(dbConfig);

    // データ取得
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
      FROM
      ${tableName}
      WHERE
      YEAR = ?
      AND
      TIMES = ?`,
      [year, times]
    );

    await connection.end();

    // JSON で返却
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// -----------------------------
// /api/reading エンドポイント
// -----------------------------
app.get("/api/reading", async (req, res) => {
  const { level, year, times } = req.query;

  // レベル → テーブル名のマッピング
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

    // 文章データ
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
      WHERE
      YEAR = ?
      AND
      TIMES = ?
      `,
      [year, times]
    );

    // 設問データ
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
      WHERE
      YEAR = ?
      AND
      TIMES = ?
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
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
