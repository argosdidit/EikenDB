// URL から img パラメータを取得
const params = new URLSearchParams(window.location.search);
const imgPath = params.get("img");

// 画像タグに反映
document.querySelector(".main-image").src = imgPath;
