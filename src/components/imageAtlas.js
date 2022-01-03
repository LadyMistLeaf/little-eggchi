const sprites = {};

export const addImage = (imageName, imageSrc) => {
    sprites[imageName] = new Image();
    sprites[imageName].src = imageSrc;
};

addImage("dogFace1", "./images/dogFace1.png");
addImage("dogFace2", "./images/dogFace2.png");
addImage("dogFace3", "./images/dogFace3.png");
addImage("dogSide1", "./images/dogSide1.png");
addImage("dogSide2", "./images/dogSide2.png");
addImage("dogSide3", "./images/dogSide3.png");
addImage("lightOn", "./images/lightOn.png");
addImage("lightOff", "./images/lightOff.png");
addImage("bigFood", "./images/bigFood.png");
addImage("back", "./images/back.png");
addImage("barEmpty", "./images/barEmpty.png");
addImage("barFull", "./images/barFull.png");
addImage("sleep", "./images/sleep.png");
addImage("food", "./images/food2.png");
addImage("play", "./images/happy.png");
addImage("bar", "./images/bar.png");
addImage("arrowLeft", "./images/arrow-left.png");
addImage("arrowRight", "./images/arrow-right.png");
addImage("check", "./images/check.png");
addImage("dogEat1", "./images/dogEat1.png");
addImage("dogEat2", "./images/dogEat2.png");
addImage("dogEat3", "./images/dogEat3.png");
addImage("dogEat4", "./images/dogEat4.png");
addImage("dogEat5", "./images/dogEat5.png");
addImage("dogEat6", "./images/dogEat6.png");
addImage("dogEat7", "./images/dogEat7.png");
addImage("dogSleep1", "./images/dogSleep1.png");
addImage("dogSleep2", "./images/dogSleep2.png");
addImage("rock", "./images/rock.png");
addImage("paper", "./images/paper.png");
addImage("scissors", "./images/scissors.png");

export default sprites;
