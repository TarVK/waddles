import {jsx} from "@emotion/core";
import {useDataHook} from "model-react";
import {FC, useMemo, useEffect} from "react";
import {Player} from "../../model/game/Player";
import {IKey, IKeyLayout} from "./_types/IKeyLayout";
import {ICharStatus} from "../../../_types/game/ICharStatus";
import {useTheme} from "../../services/useTheme";
import {Application} from "../../model/Application";
import {gameColors} from "../../theme";
import {keyboardLayout} from "../../services/keyboardLayout";
import {useIsMobileView} from "../../services/useIsMobileView";

const statusRanking: Record<ICharStatus, number> = {
    unknown: 0,
    absent: 1,
    contains: 2,
    matches: 3,
};

export const Keyboard: FC<{
    player: Player;
    onPress?: (key: IKey) => void;
    disabled?: boolean;
}> = ({player, onPress, disabled, ...rest}) => {
    const [h] = useDataHook();
    const {layout} = keyboardLayout.get(h);

    const settings = Application.getRoom(h)!.getSettings(h);
    const wordLength = settings.wordList[0]?.length ?? 6;
    const attempts = player.getAttempts(wordLength, h);

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName == "INPUT") return;

            if (!onPress) return;
            if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
            if ("abcdefghijklmnopqrstuvwxyz".includes(event.key))
                onPress(event.key as IKey);
            if (event.keyCode == 8) onPress("backspace");
            if (event.keyCode == 13) onPress("enter");
        };
        document.body.addEventListener("keydown", listener);
        return () => document.body.removeEventListener("keydown", listener);
    }, [onPress]);

    const statuses = useMemo(() => {
        const statuses = new Map<string, ICharStatus>();
        for (let attempt of attempts) {
            for (let {type, letter} of attempt) {
                if (letter) {
                    const best = statuses.get(letter) ?? "unknown";
                    if (statusRanking[best] < statusRanking[type])
                        statuses.set(letter, type);
                }
            }
        }

        return statuses;
    }, [attempts]);

    const layoutFillers = useMemo(() => {
        const rowSpacingLengths = layout.map(row =>
            row.reduce(
                (count, key) => (["enter", "backspace"].includes(key) ? 1.5 : 1) + count,
                0
            )
        );
        const maxKeyLength = rowSpacingLengths.reduce(
            (max, length) => Math.max(max, length),
            0
        );
        const remaining = rowSpacingLengths.map(length => maxKeyLength - length);
        return remaining;
    }, [layout]);

    const isMobile = useIsMobileView();

    const theme = useTheme();
    return (
        <div
            css={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? theme.spacing.s2 : theme.spacing.s1,
                opacity: disabled ? 0.5 : 1,
            }}
            {...rest}>
            {layout.map((row, i) => {
                const filler = layoutFillers[i];

                return (
                    <div
                        key={i}
                        css={{
                            display: "flex",
                            justifyContent: "center",
                            "> button": {
                                marginRight: isMobile
                                    ? theme.spacing.s2
                                    : theme.spacing.s1,
                                "&:last-of-type": {
                                    marginRight: 0,
                                },
                            },
                        }}>
                        {filler ? <div css={{flex: filler / 2}} /> : undefined}

                        {row.map(key => (
                            <Key
                                key={key}
                                char={key}
                                onPress={() => onPress?.(key)}
                                status={statuses.get(key) ?? "unknown"}
                                disabled={disabled}
                            />
                        ))}
                        {filler ? <div css={{flex: filler / 2}} /> : undefined}
                    </div>
                );
            })}
        </div>
    );
};

export const Key: FC<{
    status: ICharStatus;
    char: IKey;
    onPress: () => void;
    disabled?: boolean;
}> = ({status, char: key, onPress, disabled}) => {
    const specialKey = key == "backspace" || key == "enter";
    const theme = useTheme();
    return (
        <button
            css={{
                background: "none",
                color: "inherit",
                border: "none",
                padding: 0,
                cursor: disabled ? undefined : "pointer",
                fontSize: 14,
                fontWeight: "bold",
                textTransform: "uppercase",
                outline: "inherit",
                flex: specialKey ? 1.5 : 1,
                height: 50,

                backgroundColor: gameColors[status] ?? theme.palette.neutralLight,
            }}
            onClick={onPress}>
            {key == "backspace" ? <BackspaceIcon /> : key}
        </button>
    );
};

export const BackspaceIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path
            fill="var(--color-tone-1)"
            d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
    </svg>
);
