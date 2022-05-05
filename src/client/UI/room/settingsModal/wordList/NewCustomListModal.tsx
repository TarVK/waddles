import {jsx} from "@emotion/core";
import {
    IconButton,
    Modal,
    SearchBox,
    Toggle,
    Button,
    FontIcon,
    PrimaryButton,
} from "@fluentui/react";
import {useDataHook} from "model-react";
import {FC, Fragment, useEffect, useState, useCallback, ChangeEvent, useRef} from "react";
import {useTheme} from "../../../../services/useTheme";
import {Title} from "../../../../components/Title";
import {TextField} from "../../../../components/TextField";
import {addWordList} from "../../../../services/lists/addWordLists";
import {Application} from "../../../../model/Application";

export const NewCustomListModal: FC<{isOpen: boolean; onClose: () => void}> = ({
    isOpen,
    onClose: close,
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [invalidInput, setInvalidInput] = useState(false);
    const theme = useTheme();

    const [h] = useDataHook();
    const room = Application.getRoom(h)!;

    const words = useRef<string[]>([]);
    const selectWords = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event?.target?.files?.[0];
            if (!file) return;
            const text = await file.text();
            try {
                const list = JSON.parse(text) as string[];
                const sameLength = list.every(
                    word => typeof word == "string" && word.length == list[0].length
                );
                if (!sameLength) throw "Different lengths";

                words.current = list;

                if (!name) {
                    const nameParts = file.name.split(".");
                    nameParts.pop();
                    setName(nameParts.join("."));
                }
                setInvalidInput(false);
            } catch (e) {
                setInvalidInput(true);
            }
        },
        [!name]
    );
    const submit = useCallback(() => {
        addWordList(name, description, words.current);
        room.setSettings({
            ...room.getSettings(null),
            wordList: words.current,
            wordListName: name,
        });
        close();
    }, [name, description, close]);

    return (
        <Modal
            isOpen={isOpen}
            onDismiss={() => close()}
            styles={{main: {padding: theme.spacing.s1, width: 800}}}>
            <div css={{display: "flex", maxHeight: "90vh", flexDirection: "column"}}>
                <div css={{display: "flex", alignItems: "flex-end"}}>
                    <Title css={{flexGrow: 1}}>Upload custom json word list</Title>
                    <IconButton
                        iconProps={{iconName: "remove"}}
                        onClick={() => close()}
                    />
                </div>
                <div css={{display: "flex", alignItems: "flex-end"}}>
                    <TextField
                        label={"Name"}
                        css={{
                            flexGrow: 1,
                            marginLeft: theme.spacing.s1,
                            marginRight: theme.spacing.s1,
                        }}
                        value={name + ""}
                        onChange={(e, v) => v !== undefined && setName(v)}
                    />
                    <TextField
                        label={"Description"}
                        css={{
                            flexGrow: 3,
                            marginLeft: theme.spacing.s1,
                            marginRight: theme.spacing.s1,
                        }}
                        value={description + ""}
                        onChange={(e, v) => v !== undefined && setDescription(v)}
                    />
                </div>

                <div
                    css={{
                        marginTop: theme.spacing.m,
                        height: 100,
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: theme.spacing.s1,
                        border: `2px dashed ${theme.palette.neutralLight}`,
                    }}>
                    <FontIcon
                        aria-label="Upload"
                        iconName="Upload"
                        css={{fontSize: 60}}
                    />
                    <input
                        onChange={selectWords}
                        css={{
                            opacity: 0,
                            position: "absolute",
                            left: 0,
                            top: 0,
                            right: 0,
                            bottom: 0,
                        }}
                        type="file"
                    />
                </div>
                {invalidInput && (
                    <div css={{color: theme.semanticColors.errorText}}>
                        The selected file is invalid. The file should contain a list of
                        words in the following format:
                        <br />
                        <code>["word1", "word2", "word3"]</code>
                        <br />
                        Additionally, all words in the list should have the same number of
                        characters.
                    </div>
                )}

                <PrimaryButton css={{marginTop: theme.spacing.m}} onClick={submit}>
                    Upload
                </PrimaryButton>
            </div>
        </Modal>
    );
};
