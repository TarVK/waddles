import {jsx, keyframes} from "@emotion/core";
import {Player} from "../../model/game/Player";
import {FC, Fragment, useEffect, useRef, useCallback} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {IAttempt} from "../../../_types/game/IAttempt";
import {genList} from "../../services/genList";
import {useTheme} from "../../services/useTheme";
import {IViewSize} from "./_types/IViewSize";
import {useSmoothScroll} from "../../services/useSmoothScroll";
import {gameColors} from "../../theme";

export const Attempts: FC<{
    player: Player;
    size?: IViewSize;
    resize?: boolean;
    shake?: boolean;
}> = ({player, size = "normal", resize = false, shake}) => {
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;
    const settings = room.getSettings(h);
    const maxAttempts = settings.attempts;
    const wordLength = settings.wordList[0]?.length ?? 6;
    const attempts = player.getAttempts(wordLength, h);

    const isChooser = room.getChooser(h)?.getID() == player.getID();

    const [scrollRef, smoothScroll] = useSmoothScroll();
    const ref = useRef<HTMLDivElement>();
    const setRef = useCallback((el: HTMLDivElement) => {
        ref.current = el;
        scrollRef(el);
    }, []);
    const scrollTo = useCallback(
        (to: HTMLElement) => {
            const el = ref.current;
            if (el) {
                const containerBox = el.getBoundingClientRect();
                const targetBox = to.getBoundingClientRect();
                const delta =
                    targetBox.bottom - containerBox.bottom + 20 + targetBox.height;
                smoothScroll({addTop: delta});
            }
        },
        [smoothScroll]
    );

    const theme = useTheme();
    const width = {
        normal: 300,
        small: 180,
        extraSmall: 100,
    }[size];
    let rowShook = false;

    const attemptBarrier = 10; // WHen more max attempts are allowed, they won't be shown until reached
    return (
        <div
            ref={setRef}
            css={{
                opacity: isChooser ? 0.5 : 1,
                display: "flex",
                flexDirection: "column",
                gap: size == "extraSmall" ? 4 : theme.spacing.s1,
                maxWidth: width,
                maxHeight: {
                    normal: 340,
                    small: 220,
                    extraSmall: 120,
                }[size],
                textTransform: "uppercase",
                overflow: "auto",
                padding: 2,
                width: resize ? undefined : width,
            }}>
            {genList(
                maxAttempts > attemptBarrier
                    ? Math.max(attempts.length + 1, attemptBarrier)
                    : maxAttempts,
                i => {
                    let attempt = attempts[i];
                    if (!attempt)
                        attempt = genList(wordLength, () => ({type: "unknown"}));

                    let shouldShake = false;
                    if (shake && !rowShook && attempt[0].type == "unknown") {
                        rowShook = true;
                        shouldShake = true;
                    }

                    return (
                        <Attempt
                            key={i}
                            attempt={attempt}
                            size={size}
                            scrollTo={scrollTo}
                            index={maxAttempts > 6 ? i + 1 : undefined}
                            shake={shouldShake}
                        />
                    );
                }
            )}
        </div>
    );
};

export const Attempt: FC<{
    attempt: IAttempt;
    index?: number;
    size?: IViewSize;
    shake?: boolean;
    scrollTo?: (element: HTMLElement) => void;
}> = ({attempt, size = "normal", scrollTo, index, shake}) => {
    const theme = useTheme();
    const height = {
        normal: 50,
        small: 28,
        extraSmall: 16,
    }[size];

    const filled = attempt[0].type != "unknown";
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (filled) {
            const el = ref.current;
            if (el) scrollTo?.(el);
        }
    }, [filled]);

    return (
        <div
            ref={ref}
            css={{
                display: "flex",
                height: height,
                minHeight: height,
                position: "relative",
                gap: size == "extraSmall" ? 4 : theme.spacing.s1,
            }}>
            {attempt.map(({letter, type}, i) => {
                const showIndex = type == "unknown" && i == 0 && !letter && index;
                return (
                    <div
                        key={i}
                        className={shake ? "shake" : ""}
                        css={{
                            flex: 1,
                            boxSizing: "border-box",
                            outline: `2px solid ${gameColors[type] ?? gameColors.absent}`,
                            fontSize: {normal: 30, small: 21, extraSmall: 17}[size],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: gameColors[type] ?? undefined,
                            color: showIndex ? "#dddddd" : undefined,
                            "&.shake": {
                                animation: `${shakeAnimation} 0.3s ease`,
                            },
                        }}>
                        {showIndex ? index : letter}
                    </div>
                );
            })}
        </div>
    );
};

const shakeAnimation = keyframes`
  50% {
    transform: scale(85%);
  }  
`;
