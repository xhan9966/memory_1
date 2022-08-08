"use strict";

const backImage = "./images/back.png";
const blankImage = "./images/blank.png";

$(document).ready(() => {
  preload();

  showPlayer();

  setupData();

  loadCardsUI();

  resetTabs();

  $("#tab-nav a").click((e) => {
    // reset
    resetTabs();

    // get clicked <a>
    let a = $(e.target);
    // add class "selected"
    a.addClass("selected");
    // get id from href
    let id = a.attr("href");
    // get tab div
    let tab = $(id);
    // modify the attr 'display'
    tab.css("display", "block");
  });

  $("#save_settings").click((e) => {
    savePlayer();
  });

  $($("#tab-nav a")[0]).trigger("click");
});

const preload = () => {
  let arrayOfImages = ["back.png", "blank.png"];
  for (let i = 0; i < 24; i++) {
    let name = "card_" + (i + 1) + ".png";
    arrayOfImages.push(name);
  }
  $(arrayOfImages).each(function () {
    let src = "./images/" + this;
    let image = $("<img/>");
    image.attr("src", src);
  });
};

const resetTabs = () => {
  // remove class "selected"
  $("#tab-nav a").removeClass("selected");
  $("#tabs-1").css("display", "none");
  $("#tabs-2").css("display", "none");
  $("#tabs-3").css("display", "none");
};

let images = [];
let cards = [];
let number = 8;
const numInRow = 8;

const setupData = () => {
  number = 8;
  const allImages = [];
  for (let i = 0; i < 24; i++) {
    let image = "card_" + (i + 1) + ".png";
    allImages.push(image);
  }

  // get random images(number / 2)
  for (var i = 0; i < number / 2; i++) {
    let ran = Math.floor(Math.random() * (allImages.length - i));
    images.push(allImages[ran]);
    allImages[ran] = allImages[allImages.length - i - 1];
  }

  var allCards = [];
  for (let i = 0; i < images.length; i++) {
    let src = "./images/" + images[i];
    allCards.push(src);
    allCards.push(src);
  }
  // get random src(number)
  for (var i = 0; i < number; i++) {
    let ran = Math.floor(Math.random() * (allCards.length - i));
    cards.push(allCards[ran]);
    allCards[ran] = allCards[allCards.length - i - 1];
  }

  //   console.log(images);
  //   console.log(cards);
};

const loadCardsUI = () => {
  let rowNum = parseInt(number / numInRow);
  for (let i = 0; i < rowNum; i++) {
    const rowElement = $(`<div class="row"></div>`);
    for (let j = 0; j < cards.length; j++) {
      const imageElement = $(`<img/>`);
      imageElement.attr({
        src: backImage,
        id: j,
        alt: "",
      });
      const aElement = $(`<a class="card-image" href="#"></a>`);
      aElement.attr({
        id: cards[j],
      });
      aElement.append(imageElement);
      imageElement.click((e) => {
        var displayCount = 0;
        $(".card-image").each((index, element) => {
          if (
            $(element).children("img").attr("src") !== blankImage &&
            $(element).children("img").attr("src") !== backImage
          ) {
            displayCount += 1;
          }
        });

        if (displayCount >= 3) {
          return;
        }

        var target = $(e.target);
        target.css("pointer-events", "none");
        target.fadeOut(500, function () {
          const src = cards[j];
          target.attr("src", src);
          target.fadeIn(500, function () {
            var lastElement = null;
            $(".card-image").each((index, element) => {
              if (
                $(element).children("img").attr("src") === src &&
                $(element).children("img").attr("id") !== target.attr("id")
              ) {
                lastElement = $(element).children("img");
              }
            });
            // found
            if (lastElement != null) {
              setTimeout(function () {
                target.slideUp(500, function () {
                  target.attr("src", blankImage);
                  target.fadeIn(500, function () {});
                });
                lastElement.slideUp(500, function () {
                  lastElement.attr("src", blankImage);
                  lastElement.fadeIn(500, function () {});
                });
              }, 1000);
            } else {
              setTimeout(function () {
                // fix: For previously displayed images, it is possible that a matching image is displayed at this time
                var tmp = null;
                $(".card-image").each((index, element) => {
                  if (
                    $(element).children("img").attr("src") ===
                      target.attr("src") &&
                    $(element).children("img").attr("id") != target.attr("id")
                  ) {
                    tmp = $(element);
                  }
                });
                if (tmp == null) {
                  target.fadeOut(500, function () {
                    target.attr("src", backImage);
                    target.fadeIn(500, function () {
                      target.css("pointer-events", "auto");
                    });
                  });
                }
              }, 2000);
            }
          });
        });
      });
      $(rowElement).append(aElement);
    }
    $("#cards").append(rowElement);
  }
};

const showPlayer = () => {
  var name = " ";
  var highScore = " ";
  var correct = " ";
  let players = JSON.parse(sessionStorage.getItem("players"));
  if (players != undefined && (players != null) & (players.length > 0)) {
    let lastOne = players[players.length - 1];
    name = "Player: " + lastOne.name;
    number = lastOne.number;
    let highScoreValue = parseInt(lastOne.highScore);
    if (!isNaN(highScoreValue) && highScoreValue >= 0) {
      highScore = "High Score: " + highScoreValue;
    }
    let correctValue = parseInt(lastOne.correct);
    if (!isNaN(correctValue) && correctValue >= 0) {
      correct = "Correct: " + correctValue;
    }
  }
  $("#player").text(name);
  $("#high_score").text(highScore);
  $("#correct").text(correct);
};

const savePlayer = () => {
  $("#player_name_error").css("visibility", "hidden");
  let name = $("#player_name").val();
  if (name.length <= 0) {
    $("#player_name_error").css("visibility", "visible");
    return;
  }

  let option = $("#num_cards option:selected"); // get selected option
  let number = parseInt(option.text());

  let player = { name: name, number: number, highScore: -1, correct: -1 };

  let players = JSON.parse(sessionStorage.getItem("players"));
  const data = [];
  if (players != undefined && (players != null) & (players.length > 0)) {
    players.forEach((element) => {
      if (element.name !== name) {
        data.push(element);
      }
    });
  }

  data.push(player);

  sessionStorage.setItem("players", JSON.stringify(data));

  location.reload();
};
