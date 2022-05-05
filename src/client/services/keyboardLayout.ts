import {IKeyLayout} from "../UI/game/_types/IKeyLayout";
import {Field} from "model-react";
import {Observer} from "./Observer";

export const keyboardLayouts: Record<string, IKeyLayout> = {
    qwerty: [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ],
    azerty: [
        ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
        ["enter", "w", "x", "x", "v", "b", "n", "backspace"],
    ],
};

const storedLayoutName = localStorage.getItem("keyboardLayout");
const layout = storedLayoutName && keyboardLayouts[storedLayoutName];

export const keyboardLayout = new Field<{name: string; layout: IKeyLayout}>(
    layout
        ? {name: storedLayoutName as string, layout}
        : {name: "qwerty", layout: keyboardLayouts.qwerty}
);

export function setKeyboardLayout(name: string) {
    const exists = keyboardLayouts[name];
    if (!exists) return;
    const layout = keyboardLayouts[name];
    keyboardLayout.set({name, layout});
    localStorage.setItem("keyboardLayout", name);
}
