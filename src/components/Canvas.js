import React, { useReducer, useRef, useState, useEffect } from "react";
import "./canvas.css";
import {
    PIXEL_SIZE,
    MAX_BARS,
    FOOD,
    PLAY,
    SLEEP,
    CENTER_X,
    CENTER_Y,
    HAND_PAPER,
    HAND_ROCK,
    HAND_SCISSORS,
    MODE_MENU,
    MODE_STATS,
    MODE_RPS,
    MODE_FEEDING,
    MODE_CHOICE,
    MODE_HOME,
    AWAKE_DECREASE,
    SLEEP_DECREASE,
    AWAKE_STATE,
    SLEEP_STATE,
    RUN_AWAY_STATE,
    WIN,
    LOSE,
    DRAW,
} from "./constants";
import { unstable_batchedUpdates } from "react-dom";
import sprites from "./imageAtlas";
import { useDrawUI } from "./useDrawUI";

// DONE: Draw Rock Paper Scissors images
// DONE: Rock Paper Scissors game
// DONE: Adding happiness functionality
// DONE: Eating animation / functionality
// TODO: Sleeping animation / functionality
// TODO: Run away functionality (if food stat reaches 0 or happy stat reaches a certain minus level)
// DONE: Idle pet animation
// TODO: Choosing the pet

// NOTE: Pay be taking previous hand value to calculate WIN/LOSE condition on RPS

const initialGameState = {
    hand: HAND_SCISSORS,
    petHand: null,
    mode: MODE_HOME,
    handTimeout: null,
    happyStat: 0,
};

const gameStateReducer = (state, action) => {
    switch (action.type) {
        case "set_player_hand":
            return { ...state, hand: action.payload };
        case "set_pet_hand":
            return { ...state, petHand: action.payload };
        case "set_game_mode":
            return { ...state, mode: action.payload };
        case "set_hand_timeout":
            return { ...state, handTimeout: action.payload };
        case "set_happy_stat":
            return { ...state, happyStat: action.payload };
        default:
            throw new Error(`No action found for action type ${action.type}`);
    }
};

function Canvas({ clicks, onButtonReset }) {
    const [coord, setCoord] = useState({ x: 5, y: 18 });
    const [menuState, setMenuState] = useState(0);
    const [statTimer, setStatTimer] = useState({ food: 0, play: 0, sleep: 0 });
    const [petStats, setPetStats] = useState({ food: 6, play: 3, sleep: 7 });
    const [dogFrame, setDogFrame] = useState("dogSide1");
    const [refresh, setRefresh] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [petIdle, setPetIdle] = useState(0); // Tail wag animation frame count
    const [petStatus, setPetStatus] = useState(AWAKE_STATE);

    const [gameState, dispatch] = useReducer(gameStateReducer, initialGameState);

    const canvasRef = useRef(null);

    const [context, setContext] = useState();

    const checkStats = (timestamp, statTimestamp, statDecrease) => {
        let diff = timestamp - statTimestamp;
        return Math.floor(diff / statDecrease);
    };

    useEffect(() => {
        if (!localStorage.getItem("eggchi")) {
            let currentDate = new Date();
            let timeConvert = currentDate.getTime();
            let timestamp = Math.floor(timeConvert / 1000); // To calculate the seconds
            setStatTimer({ food: timestamp, play: timestamp, sleep: timestamp });
            console.log("Save file created!");
        } else {
            let data = JSON.parse(localStorage.getItem("eggchi"));
            console.log(data);
            unstable_batchedUpdates(() => {
                setStatTimer(data.statTimer);
                setPetStats(data.petStats);
            });
        }
    }, []);

    useEffect(() => {
        console.log(gameState.happyStat);
        console.log(gameState.hand, gameState.petHand);
        if (gameState.happyStat >= 1) {
            setPetStats({ food: petStats.food, play: petStats.play + 1, sleep: petStats.sleep });
            dispatch({ type: "set_happy_stat", payload: gameState.happyStat - 1 });
        }
    }, [gameState.happyStat]);

    useEffect(() => {
        localStorage.setItem("eggchi", JSON.stringify({ petStats, statTimer }));
    }, [petStats, statTimer]);

    useEffect(() => {
        // RPS game handling
        console.log(`Player hand: ${gameState.hand}`);
        console.log(`Pet hand: ${gameState.pethand}`);
        if (gameState.mode === MODE_CHOICE) {
            if (gameState.petHand === null) {
                dispatch({ type: "set_game_mode", payload: MODE_RPS });
                return;
            }
            if (gameState.petHand === gameState.hand) {
                // Conditions are from the POV of if the pet wins
                dispatch({ type: "set_happy_stat", payload: gameState.happyStat + DRAW });
            } else if (gameState.hand === HAND_ROCK) {
                if (gameState.petHand === HAND_SCISSORS) {
                    dispatch({ type: "set_happy_stat", payload: gameState.happyStat + LOSE });
                } else {
                    dispatch({ type: "set_happy_stat", payload: gameState.happyStat + WIN });
                }
            } else if (gameState.hand === HAND_PAPER) {
                if (gameState.petHand === HAND_ROCK) {
                    dispatch({ type: "set_happy_stat", payload: gameState.happyStat + LOSE });
                } else {
                    dispatch({ type: "set_happy_stat", payload: gameState.happyStat + WIN });
                }
            } else if (gameState.hand === HAND_SCISSORS) {
                if (gameState.petHand === HAND_PAPER) {
                    dispatch({ type: "set_happy_stat", payload: gameState.happyStat + LOSE });
                } else {
                    dispatch({ type: "set_happy_stat", payload: gameState.happyStat + WIN });
                }
            }
            setTimeout(() => {
                dispatch({ type: "set_pet_hand", payload: null });
            }, 2000);
        }
    }, [gameState.petHand]);

    useEffect(() => {
        if (petStatus != RUN_AWAY_STATE) {
            const interval = setTimeout(() => setSeconds(seconds + 1), 1000);
            if (statTimer.food === 0) {
                return;
            }
            let currentDate = new Date();
            let timeConvert = currentDate.getTime();
            let timestamp = Math.floor(timeConvert / 1000);

            let foodDec = 0,
                playDec = 0,
                sleepDec = 0;

            foodDec = checkStats(timestamp, statTimer.food, FOOD);
            playDec = checkStats(timestamp, statTimer.play, PLAY);
            sleepDec = checkStats(timestamp, statTimer.sleep, SLEEP);

            if (foodDec > 0 || playDec > 0 || sleepDec > 0) {
                unstable_batchedUpdates(() => {
                    setPetStats({
                        food: petStats.food - foodDec,
                        play: petStats.play - playDec,
                        sleep: petStats.sleep - sleepDec,
                    });
                    setStatTimer({
                        food: statTimer.food + FOOD * foodDec,
                        play: statTimer.play + PLAY * playDec,
                        sleep: statTimer.sleep + SLEEP * sleepDec,
                    });
                });
            }

            return () => {
                clearTimeout(interval);
            };
        }
    }, [seconds, petStatus]);

    useEffect(() => {
        // useEffect for animations
        let frame;
        if (gameState.mode === MODE_FEEDING) {
            switch (dogFrame) {
                case "dogEat1":
                    frame = setTimeout(() => setDogFrame("dogEat2"), 300);
                    break;
                case "dogEat2":
                    frame = setTimeout(() => setDogFrame("dogEat3"), 300);
                    break;
                case "dogEat3":
                    frame = setTimeout(() => setDogFrame("dogEat4"), 300);
                    break;
                case "dogEat4":
                    frame = setTimeout(() => setDogFrame("dogEat5"), 300);
                    break;
                case "dogEat5":
                    frame = setTimeout(() => setDogFrame("dogEat6"), 300);
                    break;
                case "dogEat6":
                    frame = setTimeout(() => setDogFrame("dogEat7"), 300);
                    break;
                case "dogEat7":
                    frame = setTimeout(
                        () => dispatch({ type: "set_game_mode", payload: MODE_MENU }),
                        1000
                    );
                    break;
            }
        } else if (gameState.mode === MODE_HOME) {
            if (petStatus === AWAKE_STATE) {
                let wagChance = Math.floor(Math.random() * 10);
                switch (dogFrame) {
                    case "dogSide1":
                        if (wagChance > 8) {
                            setPetIdle(0);
                            frame = setTimeout(() => setDogFrame("dogFace1"), 500);
                        } else {
                            frame = setTimeout(() => setDogFrame("dogSide2"), 500);
                        }
                        break;
                    case "dogSide2":
                        if (wagChance > 8) {
                            setPetIdle(0);
                            frame = setTimeout(() => setDogFrame("dogFace1"), 500);
                        } else {
                            frame = setTimeout(() => setDogFrame("dogSide3"), 500);
                        }
                        break;
                    case "dogSide3":
                        if (wagChance > 8) {
                            setPetIdle(0);
                            frame = setTimeout(() => setDogFrame("dogFace1"), 500);
                        } else {
                            frame = setTimeout(() => setDogFrame("dogSide1"), 500);
                        }
                        break;
                    case "dogFace1":
                        frame = setTimeout(() => setDogFrame("dogFace2"), 150);
                        setPetIdle(petIdle + 1);
                        console.log(petIdle);
                        break;
                    case "dogFace2":
                        console.log(petIdle);
                        if (petIdle === 1 || petIdle === 5 || petIdle === 9 || petIdle > 12) {
                            frame = setTimeout(() => setDogFrame("dogFace3"), 150);
                        } else {
                            frame = setTimeout(() => setDogFrame("dogFace1"), 150);
                        }
                        setPetIdle(petIdle + 1);
                        break;
                    case "dogFace3":
                        console.log(petIdle);
                        if (petIdle >= 12) {
                            frame = setTimeout(() => setDogFrame("dogSide1"), 150);
                        } else {
                            frame = setTimeout(() => setDogFrame("dogFace2"), 150);
                            setPetIdle(petIdle + 1);
                        }
                        break;
                }
            } else if (petStatus === SLEEP_STATE) {
                switch (dogFrame) {
                    case "dogSleep1":
                        frame = setTimeout(() => setDogFrame("dogSleep2"), 1000);
                        break;
                    case "dogSleep2":
                        frame = setTimeout(() => setDogFrame("dogSleep1"), 1000);
                        break;
                }
            }
        } else if (gameState.mode === MODE_RPS) {
            switch (gameState.hand) {
                case HAND_ROCK:
                    frame = setTimeout(() => {
                        if (gameState.mode === MODE_RPS)
                            dispatch({ type: "set_player_hand", payload: HAND_PAPER });
                    }, 1000);
                    dispatch({ type: "set_hand_timeout", payload: frame });
                    break;
                case HAND_PAPER:
                    frame = setTimeout(() => {
                        if (gameState.mode === MODE_RPS)
                            dispatch({ type: "set_player_hand", payload: HAND_SCISSORS });
                    }, 1000);
                    dispatch({ type: "set_hand_timeout", payload: frame });
                    break;
                case HAND_SCISSORS:
                    frame = setTimeout(() => {
                        if (gameState.mode === MODE_RPS)
                            dispatch({ type: "set_player_hand", payload: HAND_ROCK });
                    }, 1000);
                    dispatch({ type: "set_hand_timeout", payload: frame });
                    break;
            }
        }
    }, [dogFrame, gameState.mode, gameState.hand]);

    useEffect(() => {
        // Use effect for button clicks
        if (clicks.left) {
            if (gameState.mode === MODE_HOME) {
                dispatch({ type: "set_game_mode", payload: MODE_STATS });
            } else if (gameState.mode === MODE_MENU) {
                if (menuState === 0) {
                    setMenuState(2);
                } else {
                    setMenuState(menuState - 1);
                }
            } else if (gameState.mode === MODE_STATS) {
                dispatch({ type: "set_game_mode", payload: MODE_RPS });
                dispatch({ type: "set_player_hand", payload: HAND_ROCK });
            } else if (gameState.mode === MODE_RPS || gameState.mode === MODE_CHOICE) {
                dispatch({ type: "set_game_mode", payload: MODE_HOME });
                if (petStatus === AWAKE_STATE) {
                    setDogFrame("dogSide1");
                } else if (petStatus === SLEEP_STATE) {
                    setDogFrame("dogSleep1");
                }
            }
            onButtonReset("left");
        }

        if (clicks.middle) {
            if (gameState.mode === MODE_HOME) {
                dispatch({ type: "set_game_mode", payload: MODE_MENU });
            } else if (gameState.mode === MODE_MENU) {
                if (menuState === 0) {
                    // Feeding
                    if (petStatus === AWAKE_STATE) {
                        dispatch({ type: "set_game_mode", payload: MODE_FEEDING });
                        setDogFrame("dogEat1");
                        if (petStats.food >= 6) {
                            setPetStats({ food: 8, play: petStats.play, sleep: petStats.sleep });
                            let currentDate = new Date();
                            let timeConvert = currentDate.getTime();
                            let timestamp = Math.floor(timeConvert / 1000);
                            setStatTimer({
                                food: timestamp,
                                play: statTimer.play,
                                sleep: statTimer.sleep,
                            });
                        } else {
                            setPetStats({
                                food: petStats.food + 2,
                                play: petStats.play,
                                sleep: petStats.sleep,
                            });
                            setStatTimer({
                                food: statTimer.food + FOOD * 2,
                                play: statTimer.play,
                                sleep: statTimer.sleep,
                            });
                        }
                    }
                } else if (menuState === 1) {
                    // Lights
                    if (petStatus === AWAKE_STATE) {
                        setPetStatus(SLEEP_STATE);
                    } else if (petStatus === SLEEP_STATE) {
                        setPetStatus(AWAKE_STATE);
                    }
                } else {
                    // Return to Home state
                    setMenuState(0);
                    dispatch({ type: "set_game_mode", payload: MODE_HOME });
                    if (petStatus === AWAKE_STATE) {
                        setDogFrame("dogSide1");
                    } else if (petStatus === SLEEP_STATE) {
                        setDogFrame("dogSleep1");
                    }
                }
            } else if (gameState.mode === MODE_RPS) {
                if (petStatus === AWAKE_STATE) {
                    clearTimeout(gameState.handTimeout);
                    dispatch({ type: "set_game_mode", payload: MODE_CHOICE });
                    let rand = Math.floor(Math.random() * 3);
                    switch (rand) {
                        case 0:
                            dispatch({ type: "set_pet_hand", payload: HAND_ROCK });
                            break;
                        case 1:
                            dispatch({ type: "set_pet_hand", payload: HAND_PAPER });
                            break;
                        case 2:
                            dispatch({ type: "set_pet_hand", payload: HAND_SCISSORS });
                            break;
                    }
                }
            }
            onButtonReset("middle");
        }

        if (clicks.right) {
            if (gameState.mode === MODE_HOME) {
                dispatch({ type: "set_game_mode", payload: MODE_RPS });
            } else if (gameState.mode === MODE_MENU) {
                if (menuState === 2) {
                    setMenuState(0);
                } else {
                    setMenuState(menuState + 1);
                }
            } else if (gameState.mode === MODE_RPS || gameState.mode === MODE_CHOICE) {
                dispatch({ type: "set_game_mode", payload: MODE_STATS });
            } else if (gameState.mode === MODE_STATS) {
                dispatch({ type: "set_game_mode", payload: MODE_HOME });
                if (petStatus === AWAKE_STATE) {
                    setDogFrame("dogSide1");
                } else if (petStatus === SLEEP_STATE) {
                    setDogFrame("dogSleep1");
                }
            }
            onButtonReset("right");
        }
    }, [clicks, onButtonReset]);

    useEffect(() => {
        const canvasContext = canvasRef.current.getContext("2d");
        setContext(canvasContext);
    }, []);

    useEffect(() => {
        // Sets up the screen display
        if (context === undefined) {
            return;
        }

        context.clearRect(0, 0, 360, 264);

        if (gameState.mode === MODE_HOME) {
            context.drawImage(sprites[dogFrame], coord.x * PIXEL_SIZE, coord.y * PIXEL_SIZE);
        } else if (gameState.mode === MODE_MENU) {
            if (menuState === 0) {
                context.drawImage(sprites.bigFood, CENTER_X * PIXEL_SIZE, CENTER_Y * PIXEL_SIZE);
            } else if (menuState === 1) {
                if (petStatus === SLEEP_STATE) {
                    context.drawImage(
                        sprites.lightOff,
                        CENTER_X * PIXEL_SIZE,
                        CENTER_Y * PIXEL_SIZE
                    );
                } else {
                    context.drawImage(
                        sprites.lightOn,
                        CENTER_X * PIXEL_SIZE,
                        CENTER_Y * PIXEL_SIZE
                    );
                }
            } else {
                context.drawImage(sprites.back, CENTER_X * PIXEL_SIZE, CENTER_Y * PIXEL_SIZE);
            }
        } else if (gameState.mode === MODE_FEEDING) {
            context.drawImage(sprites[dogFrame], CENTER_X * PIXEL_SIZE, CENTER_Y * PIXEL_SIZE);
        } else if (gameState.mode === MODE_RPS) {
            context.drawImage(
                sprites[gameState.hand],
                CENTER_X * PIXEL_SIZE,
                CENTER_Y * PIXEL_SIZE
            );
        } else if (gameState.mode === MODE_CHOICE) {
            context.drawImage(
                sprites[gameState.hand],
                (CENTER_X - 10) * PIXEL_SIZE,
                CENTER_Y * PIXEL_SIZE
            );
            context.drawImage(
                sprites[gameState.petHand],
                (CENTER_X + 10) * PIXEL_SIZE,
                CENTER_Y * PIXEL_SIZE
            );
        } else if (gameState.mode === MODE_STATS) {
            context.drawImage(sprites.food, 5 * PIXEL_SIZE, 2 * PIXEL_SIZE);
            for (let i = 0; i < MAX_BARS; i++) {
                // NOTE: 17 (5 padding + img (10px) + 2px padding) + i * 5 (4px per block + 1px padding)
                if (i + 1 <= petStats.food) {
                    context.drawImage(sprites.barFull, (17 + i * 5) * PIXEL_SIZE, 2 * PIXEL_SIZE);
                } else {
                    context.drawImage(sprites.barEmpty, (17 + i * 5) * PIXEL_SIZE, 2 * PIXEL_SIZE);
                }
            }
            context.drawImage(sprites.play, 5 * PIXEL_SIZE, 13 * PIXEL_SIZE);
            for (let i = 0; i < MAX_BARS; i++) {
                // NOTE: 17 (5 padding + img (10px) + 2px padding) + i * 5 (4px per block + 1px padding)
                if (i + 1 <= petStats.play) {
                    context.drawImage(sprites.barFull, (17 + i * 5) * PIXEL_SIZE, 13 * PIXEL_SIZE);
                } else {
                    context.drawImage(sprites.barEmpty, (17 + i * 5) * PIXEL_SIZE, 13 * PIXEL_SIZE);
                }
            }
            context.drawImage(sprites.sleep, 5 * PIXEL_SIZE, 24 * PIXEL_SIZE);
            for (let i = 0; i < MAX_BARS; i++) {
                // INFO: 17 (5 padding + img (10px) + 2px padding) + i * 5 (4px per block + 1px padding)
                if (i + 1 <= petStats.sleep) {
                    context.drawImage(sprites.barFull, (17 + i * 5) * PIXEL_SIZE, 24 * PIXEL_SIZE);
                } else {
                    context.drawImage(sprites.barEmpty, (17 + i * 5) * PIXEL_SIZE, 24 * PIXEL_SIZE);
                }
            }
        }
        setRefresh(refresh + 1);
    }, [
        context,
        gameState.mode,
        menuState,
        petStats,
        dogFrame,
        gameState.hand,
        petStatus,
        setRefresh,
    ]);

    useDrawUI(context, sprites.bar, sprites.arrowLeft, sprites.arrowRight, sprites.check, refresh);
    console.log("Re-render");
    return <canvas ref={canvasRef} width="360px" height="264px" id="game"></canvas>;
}

export default Canvas;

// width 360
// height 264
