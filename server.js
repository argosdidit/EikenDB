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
    pre2: "voc_pre2",
    grade2: "voc_2",
    pre1: "voc_pre1",
    grade1: "voc_1"
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
      no,
      sentences,
      word1,
      word2,
      word3,
      word4,
      answer
      FROM
      ${tableName}
      WHERE
      year = ?
      AND
      times = ?`,
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
    pre2: "reading_sentence_pre2",
    grade2: "reading_sentence_2",
    pre1: "reading_sentence_pre1",
    grade1: "reading_sentence_1"
  };

  const tableChoice = {
    pre2: "reading_choice_pre2",
    grade2: "reading_choice_2",
    pre1: "reading_choice_pre1",
    grade1: "reading_choice_1"
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
      levelid,
      year,
      times,
      area,
      clause,
      subject,
      path_sentence,
      path_explanation
      FROM ${sentenceTable}
      WHERE
      year = ?
      AND
      times = ?
      `,
      [year, times]
    );

    // 設問データ
    const [choiceRows] = await connection.execute(
      `
      SELECT
      levelid,
      year,
      times,
      area,
      no,
      clause,
      subject,
      path_question,
      path_choice1,
      path_choice2,
      path_choice3,
      path_choice4,
      answer
      FROM ${choiceTable}
      WHERE
      year = ?
      AND
      times = ?
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
