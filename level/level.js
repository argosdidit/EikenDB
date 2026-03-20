const App = {
  container: null,

  levelData: [
    { label: "1級", value: "grade1", color: "#ffcccc" },
    { label: "準1級", value: "pre1", color: "#e6ccff" },
    { label: "2級", value: "grade2", color: "#cce6ff" },
    { label: "準2級", value: "pre2", color: "#fff7cc" },
  ],

  makeLevelField() {
    this.container = document.getElementById("level-container");
    return this;
  },

  makeButtonField() {
    this.levelData.forEach(level => {
      const btn = document.createElement("div");
      btn.className = "level-button";
      btn.textContent = level.label;
      btn.style.backgroundColor = level.color;

      // ✅ 修正済みリンク：sectionフォルダ内へ
      btn.addEventListener("click", () => {
        // ✅ section.html に遷移
        window.location.href = `section/section.html?level=${level.value}`;
      });
      this.container.appendChild(btn);
    });
    return this;
  }
};

App
  .makeLevelField()
  .makeButtonField();
