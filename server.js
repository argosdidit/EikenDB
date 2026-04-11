// server.js

const express = require("express");
const { Client } = require("pg");
const path = require("path");
const app = express();
const PORT = 3000;

// PostgreSQL 接続設定（Render 対応）
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
client.connect();

// GitHub Pages の画像ベースURL
const IMAGE_BASE_URL = "https://argosdidit.github.io/EikenDB/";

// 文章データ（sentence）の prefix 付与
function addSentencePrefix(row) {
  return {
    ...row,
    path_sentence: IMAGE_BASE_URL + row.path_sentence,
    path_explanation: IMAGE_BASE_URL + row.path_explanation
  };
}

// 選択肢データ（choice）の prefix 付与
function addChoicePrefix(row) {
  return {
    ...row,
    path_question: IMAGE_BASE_URL + row.path_question,
    path_choice1: IMAGE_BASE_URL + row.path_choice1,
    path_choice2: IMAGE_BASE_URL + row.path_choice2,
    path_choice3: IMAGE_BASE_URL + row.path_choice3,
    path_choice4: IMAGE_BASE_URL + row.path_choice4
  };
}


// 静的ファイル配信（HTML / CSS / JS）
app.use(express.static(path.join(__dirname)));


// -----------------------------
// /api/quizVocabulary エンドポイント
// -----------------------------
app.get("/api/quizVocabulary", async (req, res) => {
  const { level, year, times } = req.query;

  const tableMap = {
    pre2: "voc_pre2",
    grade2: "voc_2",
    pre1: "voc_pre1",
    grade1: "voc_1"
  };

  const tableName = tableMap[level];
  if (!tableName) return res.status(400).json({ error: "Invalid level" });

  try {
    const result = await client.query(
      `
      SELECT
        no,
        sentences,
        word1,
        word2,
        word3,
        word4,
        answer
      FROM ${tableName}
      WHERE year = $1 AND times = $2
      `,
      [year, times]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("quizVocabulary error:", err);
    res.status(500).json({ error: "DB error" });
  }
});


// -----------------------------
// /api/reading エンドポイント
// -----------------------------
app.get("/api/reading", async (req, res) => {
  const { level, year, times } = req.query;

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
    const sentenceResult = await client.query(
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
      WHERE year = $1 AND times = $2
      `,
      [year, times]
    );

    const choiceResult = await client.query(
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
      WHERE year = $1 AND times = $2
      `,
      [year, times]
    );

    // ★ ここで prefix を付ける
    const sentenceWithPrefix = sentenceResult.rows.map(addSentencePrefix);
    const choiceWithPrefix = choiceResult.rows.map(addChoicePrefix);

    res.json({
      sentence: sentenceWithPrefix,
      choice: choiceWithPrefix
    });

  } catch (err) {
    console.error("reading error:", err);
    res.status(500).json({ error: "DB error" });
  }
});


// -----------------------------
// サーバー起動
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
