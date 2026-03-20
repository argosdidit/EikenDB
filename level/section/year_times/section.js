const App = {
  levelParam: null,
  container: null,

  levelMap: {
    grade1: { label: "1級", color: "#ffcccc" },
    pre1:   { label: "準1級", color: "#e6ccff" },
    grade2: { label: "2級", color: "#cce6ff" },
    pre2:   { label: "準2級", color: "#fff7cc" }
  },

  fields: [
    { label: "ワード", value: "vocabulary" },
    { label: "リーディング", value: "reading" },
    { label: "ライティング", value: "writing" },
    { label: "リスニング", value: "listening" }
  ],

  getParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.levelParam = urlParams.get("level") || "pre2";
    return this;
  },

  setHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    const { label, color } = this.levelMap[this.levelParam] || this.levelMap["pre2"];
    header.style.backgroundColor = color; // レベル色に設定
    header.querySelector("h1").textContent = `${label} 分野を選択してください`;

    // 戻るリンク
    const backLink = header.querySelector("#back-link");
    backLink.href = "../level.html";

    return this;
  },

  makeFieldButtons() {
    this.container = document.getElementById("section-container");
    if (!this.container) {
      console.error("section-container が見つかりません");
      return this;
    }

    this.fields.forEach(field => {
      const btn = document.createElement("div");
      btn.className = "section-button";
      btn.textContent = field.label;

      btn.addEventListener("click", () => {
        // year_times へパラメータ付きで遷移
        window.location.href = `year_times/year_times.html?level=${this.levelParam}&field=${field.value}`;
      });

      this.container.appendChild(btn);
    });

    return this;
  }
};

// 実行
App.getParams().setHeader().makeFieldButtons();
