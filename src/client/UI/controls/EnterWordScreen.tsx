import {jsx} from "@emotion/core";
import {FC, Fragment, useState, useEffect, useCallback} from "react";
import {Modal, PrimaryButton} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {TextField} from "../../components/TextField";
import {hasWord} from "../../services/lists/hasWord";

export const EnterWordScreen: FC = () => {
    const theme = useTheme();
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;
    const me = Application.getPlayer(h);

    const status = room.getStatus(h);
    const words = room.getSettings(h).wordList;

    const visible = status == "choosingWord";
    const isChooser = room.getChooser(h)?.getID() == me?.getID();
    const [invalidWord, setInvalidWord] = useState(false);
    const [word, setWord] = useState("");

    const submit = useCallback(() => {
        if (!hasWord(words, word)) {
            setInvalidWord(true);
        } else {
            setInvalidWord(false);
            room.setWord(word);
            setWord("");
        }
    }, [word, words]);

    return (
        <Modal isOpen={visible} styles={{main: {padding: theme.spacing.s1}}}>
            <div css={{fontSize: 30, padding: theme.spacing.l2}}>
                {isChooser ? (
                    <Fragment>
                        Enter the word to be guessed by opponents
                        <div
                            css={{
                                marginTop: 30,
                                display: "flex",
                                justifyContent: "center",
                            }}>
                            <TextField
                                css={{
                                    flexGrow: 1,
                                }}
                                autoFocus
                                errorMessage={
                                    invalidWord
                                        ? `Word must be part of the selected word list!`
                                        : undefined
                                }
                                value={word}
                                onChange={(e, v) => v !== undefined && setWord(v)}
                                onKeyDown={e => {
                                    if (e.keyCode == 13) submit();
                                }}
                            />
                            <PrimaryButton onClick={submit}>Submit</PrimaryButton>
                        </div>
                    </Fragment>
                ) : (
                    <Fragment>The word to be guessed is being entered</Fragment>
                )}
            </div>
        </Modal>
    );
};
