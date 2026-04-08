const ReadingApp = (() => {
  'use strict';

  let sentenceList = [];
  let choiceList = [];
  let levelParam, fieldParam;
  let container;

  const conf = {
    container: "reading-container",
    header: "header",
    backLink: "back-link",
    resultBox: "result-box",
    checkButton: "check-all"
  };

  const func = {
    init() {
      const urlParams = new URLSearchParams(window.location.search);
      levelParam = urlParams.get("level") || "pre2";
      fieldParam = urlParams.get("field") || "reading";
      return this;
    },
    async loadReadingData() {
      const urlParams = new URLSearchParams(window.location.search);
      const level = urlParams.get("level");
      const year = urlParams.get("year");
      const times = urlParams.get("times");

      const res = await fetch(`/api/reading?level=${level}&year=${year}&times=${times}`);
      const data = await res.json();

      sentenceList = data.sentence;
      choiceList = data.choice;

      return this;
    },
    setupHeader() {
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
      header.querySelector("h1").textContent = `${label} 英検リーディング`;

      backLink.href = `../year_times.html?level=${levelParam}&field=${fieldParam}`;

      return this;
    },
    renderReading() {
      container = document.getElementById(conf.container);

      sentenceList.forEach(sentence => {
        const areaBox = document.createElement("div");
        areaBox.className = "main-question";

        areaBox.innerHTML = `
          <div class="area-label">[${sentence.clause}]【${sentence.area}】 ${sentence.subject}</div>
          <div class="main-header">
            <img src="${sentence.path_sentence}">
          </div>
        `;

        const questions = choiceList.filter(q => q.area === sentence.area);

        questions.forEach(q => {
          const quizBox = document.createElement("div");
          quizBox.className = "quiz-box";
          quizBox.dataset.no = q.no;

          quizBox.innerHTML = `
            <div class="quiz-header-row">
              <div class="no-label">Q${q.no}</div>
              <div class="quiz-header">
                <img src="${q.path_question}">
              </div>
            </div>

            <div class="quiz-body">
              ${[1,2,3,4].map(n => `
                <div class="choice-row">
                  <span class="choice-number">${n}.</span>
                  <img src="${q[`path_choice${n}`]}" class="choice" data-value="${n}">
                </div>
              `).join("")}
            </div>
          `;

          areaBox.appendChild(quizBox);
        });

        container.appendChild(areaBox);
      });

      return this;
    },
    enableSelect() {
      document.addEventListener("click", e => {
        const row = e.target.closest(".choice-row");
        if (!row) return;
        const parent = row.closest(".quiz-body");
        parent.querySelectorAll(".choice-row").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
      });
      return this;
    },
    enableCheck() {
      const button = document.getElementById(conf.checkButton);
      const resultBox = document.getElementById(conf.resultBox);
      
      button.addEventListener("click", () => {
        resultBox.innerHTML = "";
        let score = 0;
        
        document.querySelectorAll(".quiz-box").forEach(box => {
          const no = Number(box.dataset.no);
          const q = choiceList.find(item => item.no === no);
          const correct = q.answer;
          
          const selectedRow = box.querySelector(".choice-row.selected");
          const correctRow = box.querySelector(`.choice-row:nth-child(${correct})`);
          
          const result = document.createElement("div");
          result.textContent = `Q${no} `;
          
          if (selectedRow)
          {
            const userAnswer = Number(selectedRow.querySelector(".choice").dataset.value);
            
            if (userAnswer === correct)
            {
              selectedRow.classList.add("correct");
              result.textContent += "正解";
              result.style.color = "green";
              score++;
            }
            else
            {
              selectedRow.classList.add("incorrect");
              correctRow.classList.add("correct");
              result.textContent += "不正解";
              result.style.color = "red";
            }
          }
          else
          {
            correctRow.classList.add("correct");
            result.textContent += "未回答";
            result.style.color = "blue";
          }
          resultBox.appendChild(result);
        });
        const finalScore = document.createElement("div");
        finalScore.innerHTML = `<strong>あなたの得点: ${score} / ${choiceList.length}</strong>`;
        finalScore.style.marginTop = "20px";
        resultBox.appendChild(finalScore);
      });
      return this;
    }
  };

  const active = () => {
    func
      .init()
      .loadReadingData()
      .then(() => {
        func
          .setupHeader()
          .renderReading()
          .enableSelect()
          .enableCheck();
      });
  };

  return { active };
})();

window.addEventListener("load", () => {
  ReadingApp.active();
});
