import React, { useState } from "react";
import axios from "axios";
import { GameState } from "../types/game";
import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./board";
import Loading from "./loading";
import Instructions from "./instructions";
import badCards from "../lib/bad-cards";

export default function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);

  React.useEffect(() => {
    const fetchGameData = async () => {
      const res = await axios.get<string>(
        "https://wikitrivia-data.tomjwatson.com/items.json"
      );
      const items: Item[] = res.data
        .trim()
        .split("\n")
        .map((line) => {
          return JSON.parse(line);
        })
        // Filter out questions which give away their answers
        .filter((item) => !item.label.includes(String(item.year)))
        .filter((item) => !item.description.includes(String(item.year)))
        .filter(
          (item) =>
            !item.description.includes(
              String("st century" || "nd century" || "th century")
            )
        )
        // Filter cards which have bad data as submitted in https://github.com/tom-james-watson/wikitrivia/discussions/2
        .filter((item) => !(item.id in badCards));
      setItems(items);
      console.log(items);  // you can uncomment this and see it in the console at the bottom of the window on the right
      /**
       * Data shape:
       *  {
            date_prop_id: "P571",
            description: "Country in western Europe",
            id: "Q31",
            image: "Flag_of_Belgium.svg",
            instance_of: Array(1),
            label: "Belgium",
            occupations: null,
            page_views: 234155,
            wikipedia_title: "Belgium",
            year: 1830,
       *  }
       * So, we want to replace the contents of `fetchGameData` so that our data is of the same form
       */
    };

    const customFetchGameData = async () => {
      // you'll want to sort out new types for all this so it matches above
      const res = await axios.get<any>(
        "https://cdn.contentful.com/spaces/upzmqc86pl94/environments/master/entries?access_token=8iXYYrCPR31ZKYMv-oMe31EGELqmJcv7agSgG4M9w3Y"
      );
      console.log({ res });
      // gotta fill this object out, or adjust it elsewhere in the app
      const data = res.data.items.map((item: any) => ({
        date_prop_id: "P571", //will have to figure out what this is
        description: item.fields.title,
        id: `${item.fields.id}`, //I did this because it was expecting a string
        image: item.fields.picture.sys.id, //looks like the images are in the "includes" object which is next to the "items" in the payload (res.data.items). try to figure out how to find the right image for the right card, if you have problems let me know
        instance_of: Array(1), // I don't know what this is
        label: item.fields.title,
        occupations: "not sure what this data is",
        page_views: 234155, // this probably doesn't matter
        wikipedia_title: item.fields.title, // you'll probably want to rename this throughout the app
        year: item.fields.year
      }));

      const images = res.data.includes.Asset.map((image: any) => ({
        image_src: "https:" + image.fields.file.url
      }));

      const items: Item[] = data.map((card: any, index: any) => ({
        date_prop_id: "P571", //will have to figure out what this is
        description: card.description,
        id: card.id, //I did this because it was expecting a string
        image: images[index].image_src,
        instance_of: Array(1), // I don't know what this is
        label: card.label,
        occupations: "not sure what this data is",
        page_views: 234155, // this probably doesn't matter
        wikipedia_title: card.wikipedia_title, // you'll probably want to rename this throughout the app
        year: card.year
      }));
      console.log({ items });
      setItems(items);
    };

    // you can toggle which one to use, mine is obviously not complete
    // fetchGameData();
    customFetchGameData();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
        setLoaded(true);
      }
    })();
  }, [items]);

  const resetGame = React.useCallback(() => {
    (async () => {
      if (items !== null) {
        setState(await createState(items));
      }
    })();
  }, [items]);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  if (!loaded || state === null) {
    return <Loading />;
  }

  if (!started) {
    return (
      <Instructions highscore={highscore} start={() => setStarted(true)} />
    );
  }

  return (
    <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      updateHighscore={updateHighscore}
    />
  );
}
