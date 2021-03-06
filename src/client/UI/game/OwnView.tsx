import {jsx} from "@emotion/core";
import {useDataHook} from "model-react";
import {FC, Fragment, useEffect, useState, useCallback} from "react";
import {Application} from "../../model/Application";
import {Keyboard} from "./Keyboard";
import {Attempts} from "./Attempts";
import {IKey} from "./_types/IKeyLayout";
import {useTheme} from "../../services/useTheme";
import {getWordLength} from "../../services/lists/getWordLength";
import {hasWord} from "../../services/lists/hasWord";

export const OwnView: FC = () => {
    const [h] = useDataHook();
    const me = Application.getPlayer(h)!;
    const room = Application.getRoom(h)!;
    const {attempts, wordList} = room.getSettings(h);
    const wordLength = getWordLength(room, h);
    const isChooser = room.getChooser(h)?.getID() == me?.getID();
    const waiting = room.getStatus(h) == "waiting";

    const [isShaking, setShaking] = useState(false);
    const shake = useCallback(() => {
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
    }, []);

    const processKey = useCallback(
        (key: IKey) => {
            if (room.getStatus(null) != "playing" || isChooser) return;

            const guess = me.getGuess(null);
            if (key == "enter") {
                if (guess.length != wordLength) {
                    shake();
                    return;
                }
                if (me.getAttempts(wordLength, null).length > attempts) return;

                if (!hasWord(wordList, guess)) {
                    shake();
                    return;
                }

                me.guess();
            } else if (key == "backspace") {
                me.setGuess(guess.substring(0, guess.length - 1));
            } else {
                if (guess.length < wordLength) me.setGuess(guess + key);
            }
        },
        [room, me, wordList, attempts, isChooser]
    );

    const theme = useTheme();
    return (
        <div
            css={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
            <div
                css={{
                    padding: theme.spacing.m,
                    justifyContent: "space-around",
                    height: "100%",
                    paddingTop: 0,
                    paddingBottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing.m,
                    maxWidth: 600,
                    flex: 1,
                }}>
                <div />
                <div css={{display: "flex", justifyContent: "center", ">*": {flex: 1}}}>
                    <Attempts player={me} resize={true} shake={isShaking} />
                </div>
                <Keyboard
                    player={me}
                    onPress={processKey}
                    disabled={isChooser || waiting}
                    css={{marginBottom: 20}}
                />
            </div>
        </div>
    );
};
