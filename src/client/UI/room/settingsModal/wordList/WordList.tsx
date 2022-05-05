import {jsx} from "@emotion/core";
import {FC, Fragment, useState, useCallback} from "react";
import {IconButton} from "@fluentui/react";
import {useTheme} from "../../../../services/useTheme";
import {Title} from "../../../../components/Title";
import {Application} from "../../../../model/Application";
import {useDataHook} from "model-react";
import {IWordListSource} from "../../../../services/lists/_types/IWordListSource";
import {createToast} from "../../../../components/NotificationManager/createToast";
import {wordListVersion} from "../../../../services/lists/addWordLists";
import {removeWordList} from "../../../../services/lists/removeWordList";

export const WorldList: FC<{source: IWordListSource}> = ({
    source: {name, description, isCustom, get},
}) => {
    const theme = useTheme();
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;

    const isSelected = room.getSettings(h).wordListName == name;
    const select = useCallback(async () => {
        localStorage.setItem("lastWordListName", name);
        try {
            const words = await get();
            room.setSettings({
                ...room.getSettings(null),
                wordList: words,
                wordListName: name,
            });
        } catch (e) {
            createToast("Word list loading failed!");
            console.log(e);
        }
    }, []);
    const del = useCallback(async () => {
        try {
            removeWordList(name);
        } catch (e) {
            createToast("Word list deletion failed!");
            console.log(e);
        }
    }, []);

    return (
        <WordListContainer
            css={{
                backgroundColor: isSelected
                    ? theme.palette.themePrimary
                    : theme.palette.themeLight,
            }}
            onClick={select}>
            <Title>{name}</Title>
            {description}
            {!isSelected && isCustom && (
                <IconButton
                    onClick={del}
                    css={{position: "absolute", top: 0, right: 0}}
                    iconProps={{
                        iconName: "Cancel",
                    }}
                    aria-label="Delete"
                />
            )}
        </WordListContainer>
    );
};

export const WordListContainer: FC<{onClick?: () => void}> = ({children, ...rest}) => {
    const [h] = useDataHook();
    const isAdmin = Application.isAdmin(h);
    const theme = useTheme();
    return (
        <div
            css={{
                verticalAlign: "top",
                cursor: isAdmin ? "pointer" : undefined,
                position: "relative",
                padding: 10,
                boxSizing: "border-box",
                margin: theme.spacing.s1,
                minHeight: 80,
                display: "inline-block",
                width: `calc(${Math.floor(
                    100 / Math.floor(Math.min(window.innerWidth, 800) / 250)
                )}% - 2 * ${theme.spacing.s1})`,
            }}
            {...rest}>
            {children}
        </div>
    );
};
