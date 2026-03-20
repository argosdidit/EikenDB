const YearTimesApp = {
  levelParam: null,
  fieldParam: null,

  levelMap: {
    grade1: { label: "1級", color: "#ffcccc" },
    pre1: { label: "準1級", color: "#e6ccff" },
    grade2: { label: "2級", color: "#cce6ff" },
    pre2: { label: "準2級", color: "#fff7cc" }
  },

  yearTimes: [
    { year: 2025, times: [1, 2, 3] },
    { year: 2024, times: [1, 2, 3] },
    { year: 2023, times: [1, 2, 3] },
    { year: 2022, times: [1, 2, 3] },
    { year: 2021, times: [1, 2, 3] },
    { year: 2020, times: [1, 2, 3] },
    { year: 2019, times: [1, 2, 3] },
    { year: 2018, times: [1, 2, 3] },
    { year: 2017, times: [1, 2, 3] },
    { year: 2016, times: [1, 2, 3] },
    { year: 2015, times: [1, 2, 3] },
    { year: 2014, times: [1, 2, 3] }
  ],

  container: null,
  header: null,

  getParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.levelParam = urlParams.get("level") || "pre2";
    this.fieldParam = urlParams.get("field") || "word";
    return this;
  },

  makeTitleField() {
    const { label, color } = this.levelMap[this.levelParam] || this.levelMap["pre2"];
    const fieldLabel = this.getFieldLabel(this.fieldParam);

    this.header = document.getElementById("header");
    this.header.innerHTML = `
      <a href="../section.html?level=${this.levelParam}" class="back-button">← 戻る</a>
      <h1>${label} ${fieldLabel} 過去問</h1>
    `;
    this.header.className = "header";
    this.header.style.backgroundColor = color;
    return this;
  },

  getFieldLabel(field) {
    const fieldMap = {
      word: "ワード",
      reading: "リーディング",
      writing: "ライティング",
      listening: "リスニング"
    };
    return fieldMap[field] || "ワード";
  },

  makeSectionField() {
    this.container = document.getElementById("section-container");

    this.yearTimes.forEach(({ year, times }) => {
      times.forEach(num => {
        const div = document.createElement("div");
        div.className = "section-button";
        div.textContent = `${year}年度${num}回`;

        // field=word は vocabulary に固定
        let targetFolder = this.fieldParam;
        if (this.fieldParam === "word") targetFolder = "vocabulary";

        div.addEventListener("click", () => {
          window.location.href = `./${targetFolder}/${targetFolder}.html?level=${this.levelParam}&field=${this.fieldParam}&year=${year}&times=${num}`;
        });

        this.container.appendChild(div);
      });
    });

    return this;
  }
};

YearTimesApp
  .getParams()
  .makeTitleField()
  .makeSectionField();
