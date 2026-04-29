const VocabularyApp = (() => {
  'use strict';

  let
    container,
    quizData = [],
    data_pathVocExplanation,
    pathExplanationUrl,
    levelParam,
    fieldParam,

    year,
    times,

    func,
    active;

  const conf = {
    container: "quiz-container",
    resultBox: "result-box",
    checkButton: "check-all",
    backLink: "back-link",
    header: "header",
  };

  func = {
    init: function () {
      const urlParams = new URLSearchParams(window.location.search);
      levelParam = urlParams.get("level") || "pre2";
      fieldParam = urlParams.get("field") || "vocabulary";
      return this;
    },

    loadQuiz: async function () {
      const urlParams = new URLSearchParams(window.location.search);
      const level = urlParams.get("level");
      year = urlParams.get("year");
      times = urlParams.get("times");

      const res = await fetch(`/api/quizVocabulary?level=${level}&year=${year}&times=${times}`);
      quizData = await res.json();

      const res_vocExplanation = await fetch(`/api/vocExplanation?level=${level}&year=${year}&times=${times}`);
      data_pathVocExplanation = await res_vocExplanation.json();

      return this;
    },

    setupHeader: function () {
      const header = document.getElementById(conf.header);
      const backLink = document.getElementById(conf.backLink);

      const levelMap = {
        grade1: { label: "1級", color: "#ffcccc" },
        pre1:   { label: "準1級", color: "#e6ccff" },
        grade2: { label: "2級", color: "#cce6ff" },
        pre2:   { label: "準2級", color: "#fff7cc" }
      };

      const { label, color } = levelMap[levelParam] || levelMap["pre2"];
      header.style.backgroundColor = color;
      header.querySelector("h1").textContent = `ワード ${label} ${year}年 ${times}回`;

      backLink.href = `../year_times.html?level=${levelParam}&field=${fieldParam}`;

      return this;
    },

    renderQuiz: function () {
      container = document.getElementById(conf.container);

      quizData.forEach((item, index) => {
        const box = document.createElement("div");
        box.className = "quiz-box";

        const number = item.no.toString().padStart(2, "0");

        // 正規表現はテンプレートリテラルの外で作る
        const reg = new RegExp("\\[(\\d+)\\]", "g");
        const questionHTML = item.sentences.replace(reg, `[${number}]`);

        box.innerHTML = `
          <div class="quiz-question">[No.${number}]<br>${questionHTML}</div>
          <div class="options">
            ${[item.word1, item.word2, item.word3, item.word4]
              .map((w, i) => `<div class="option" data-value="${i + 1}">${i + 1}. ${w}</div>`)
              .join("")}
          </div>
        `;

        container.appendChild(box);
      });
      return this;
    },
    enableSelect: function () {
      container.addEventListener("click", (e) => {
        if (!e.target.classList.contains("option")) return;

        const options = e.target.parentElement.querySelectorAll(".option");
        options.forEach(opt => opt.classList.remove("selected"));
        e.target.classList.add("selected");
      });

      return this;
    },

    enableCheck: function () {
      const button = document.getElementById(conf.checkButton);
      const resultBox = document.getElementById(conf.resultBox);

      button.addEventListener("click", () => {
        resultBox.innerHTML = "";
        let score = 0;

        container.querySelectorAll(".quiz-box").forEach((box, index) => {
          const selected = box.querySelector(".option.selected");
          const correctIndex = quizData[index].answer;
          const correctWord = quizData[index][`word${correctIndex}`];

          const number = (index + 1).toString().padStart(2, "0");

          // 正規表現はテンプレート外で作る
          const reg = new RegExp("\\[0*" + number + "\\]");
          const questionDiv = box.querySelector(".quiz-question");

          questionDiv.innerHTML = questionDiv.innerHTML.replace(
            reg,
            `<span style="color:red;">${correctWord}</span>`
          );

          let result = document.createElement("div");
          result.textContent = `No.${number} `;

          if (selected) {
            const userAnswer = Number(selected.dataset.value);
            if (userAnswer === correctIndex) {
              selected.classList.add("correct");
              result.textContent += "正解";
              result.style.color = "green";
              score++;
            } else {
              selected.classList.add("incorrect");
              box.querySelector(`.option[data-value="${correctIndex}"]`).classList.add("correct");
              result.textContent += "不正解";
              result.style.color = "red";
            }
          } else {
            box.querySelector(`.option[data-value="${correctIndex}"]`).classList.add("correct");
            result.textContent += "未回答";
            result.style.color = "blue";
          }

          resultBox.appendChild(result);
        });

        const finalScore = document.createElement("div");

        pathExplanationUrl = data_pathVocExplanation[0].path_explanation;

        // vocExplanation.html にパスを渡す
        const url = `vocExplanation/vocExplanation.html?img=${encodeURIComponent(pathExplanationUrl)}`;

        finalScore.innerHTML =
        `
        <strong>あなたの得点: ${score} / ${quizData.length}</strong>
        <br>
        <a href="${url}" target="_blank" style="margin-top:10px; display:inline-block;">
        ▶ 解説へ
        </a>
        `;
        finalScore.style.marginTop = "20px";
        resultBox.appendChild(finalScore);
      });

      return this;
    }
  };

  active = () => {
    func
      .init()
      .loadQuiz()
      .then(() => {
        func
          .setupHeader()
          .renderQuiz()
          .enableSelect()
          .enableCheck();
      });
  };

  return { active };
})();

window.addEventListener("load", () => {
  VocabularyApp.active();
});