"use strict";

const backImage = "./images/back.png";
const blankImage = "./images/blank.png";
var currentTotal = 0;
var currentCorrect = 0;

$(document).ready(() => {
  preload();

  showPlayer();

  setupData();

  loadCardsUI();

  resetTabs();

  $("#tab-nav a").click((e) => {
    e.preventDefault();

    // reset define "click"
    resetTabs();
    // get clicked <a>
    let a = $(e.target);
    // add class "selected"
    a.addClass("selected");
    // get id from href
    let id = a.attr("href");
    // get tab div
    let tab = $(id);
    // modify the attribute 'display'
    tab.css("display", "block");
  });

  // add click "save" for after
  $("#save_settings").click((e) => {
    e.preventDefault();

    savePlayer();
  });
  // Let the game choose "play game" automatically, start play game, trigger"click"
  $($("#tab-nav a")[0]).trigger("click");
});
// pre load the images
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
// Hide tabs
const resetTabs = () => {
  // remove class "selected"
  $("#tab-nav a").removeClass("selected");
  $("#tabs-1").css("display", "none");
  $("#tabs-2").css("display", "none");
  $("#tabs-3").css("display", "none");
};

let images = [];
let cards = [];
let number = 48;
const numInRow = 8;

// Use an image array to store the images
// Use a card array to store the src attributes of the images
const setupData = () => {
  images = [];
  cards = [];
  currentTotal = 0;
  currentCorrect = 0;

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
  //get the row number
  let rowNum = parseInt(number / numInRow);
  for (let i = 0; i < rowNum; i++) {
    // create a row element
    const rowElement = $(`<div class="row"></div>`);
    // for each row, add image tags and a tags
    for (let j = 0; j < numInRow; j++) {
      const imageElement = $(`<img/>`);
      imageElement.attr({
        src: backImage,
        id: i * numInRow + j,
        alt: "",
      });
      const aElement = $(`<a class="card-image" href="#"></a>`);
      aElement.attr({
        id: cards[i * numInRow + j],
      });
      aElement.append(imageElement);
      // add a click event to the image element
      imageElement.click((e) => {
        e.preventDefault();

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
        // fadeOut animation
        target.fadeOut(500, function () {
          const src = cards[i * numInRow + j];
          // change the src
          target.attr("src", src);
          // fadeIn animation
          target.fadeIn(500, function () {
            // try to find the element with the same image
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
              currentCorrect += 1;
              // slideUp animation after 1 second
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
              // fadeOut/fadeIn animation after 2 seconds
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

            // caculate the correct
            currentTotal += 1;
            const correctValue =
              ((currentCorrect * 1.0) / (currentTotal / 2)) * 100;
            $("#correct").text("Correct: " + correctValue.toFixed(0) + "%");

            // all done?
            const allDone = currentCorrect == cards.length / 2;
            // console.log(currentCorrect);
            if (allDone && correctValue >= 0) {
              let players = JSON.parse(sessionStorage.getItem("players"));
              if (
                players != undefined &&
                (players != null) & (players.length > 0)
              ) {
                let lastOne = players[players.length - 1];
                let lastHighScore = parseInt(lastOne.highScore[number]);
                if (isNaN(lastHighScore) || lastHighScore < correctValue) {
                  lastOne.highScore[number] = correctValue;
                  $("#high_score").text(
                    "High Score: " + correctValue.toFixed(0) + "%"
                  );
                }
              }
              sessionStorage.setItem("players", JSON.stringify(players));
            }
          });
        });
      });
      $(rowElement).append(aElement);
    }
    $("#cards").append(rowElement);
  }
};

// show the palyer information.
const showPlayer = () => {
  var name = " ";
  var highScore = " ";
  var correct = " ";
  // get palyer data from the sessionStorage
  let players = JSON.parse(sessionStorage.getItem("players"));
  if (players != undefined && (players != null) & (players.length > 0)) {
    let lastOne = players[players.length - 1];
    name = "Player: " + lastOne.name;
    number = lastOne.number;
    let highScoreValue = parseInt(lastOne.highScore[number]);
    if (!isNaN(highScoreValue) && highScoreValue >= 0) {
      highScore = "High Score: " + highScoreValue + "%";
    }
    let correctValue = parseInt(lastOne.correct);
    if (!isNaN(correctValue) && correctValue >= 0) {
      correct = "Correct: " + correctValue + "%";
    }
  }
  // update the elements
  $("#player").text(name);
  $("#high_score").text(highScore);
  $("#correct").text(correct);
};

//Tabs-3 Settings
//Check if the player name is valid
const savePlayer = () => {
  $("#player_name_error").css("visibility", "hidden");
  let name = $("#player_name").val();
  if (name.length <= 0) {
    $("#player_name_error").css("visibility", "visible");
    return;
  }
  // get selected option
  let option = $("#num_cards option:selected");
  let number = parseInt(option.text());

  let player = { name: name, number: number, correct: -1, highScore: {} };

  //use forEach to compare the player’s previous data from session storage
  let players = JSON.parse(sessionStorage.getItem("players"));
  const data = [];
  if (players != undefined && players != null && players.length > 0) {
    players.forEach((element) => {
      if (element.name !== name) {
        //use if else to check if it's new player
        data.push(element);
      } else {
        player.correct = element.correct;
        player.highScore = element.highScore;
      }
    });
  }
  //push the player data into the session storage.
  data.push(player);

  //set and save the new data in session storage
  sessionStorage.setItem("players", JSON.stringify(data));

  //relocation new game pages
  $(location).attr("href", "index.html");
};
