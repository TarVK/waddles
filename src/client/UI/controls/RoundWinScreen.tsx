import {jsx} from "@emotion/core";
import {FC, Fragment, useState, useEffect} from "react";
import {Modal, PrimaryButton} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {Player} from "../../model/game/Player";

export const RoundWinScreen: FC = () => {
    const theme = useTheme();
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;
    const me = Application.getPlayer(h);

    const [prevWinner, setPrevWinner] = useState<Player | null>(null);
    const [prevWord, setPrevWord] = useState<string | null>(null);
    const status = room.getStatus(h);
    const visible = status == "showingWinner";
    const winner = room.getWinner(h);
    const word = room.getWord(h);

    useEffect(() => {
        if (!visible) {
            setTimeout(() => setPrevWinner(null), 2000);
            setTimeout(() => setPrevWord(null), 2000);
        }
    }, [visible]);
    useEffect(() => {
        if (winner) setPrevWinner(winner);
    }, [winner]);
    useEffect(() => {
        if (word) setPrevWord(word);
    }, [word]);

    const sustainedWinner = prevWinner || winner;

    return (
        <Modal isOpen={visible} styles={{main: {padding: theme.spacing.s1}}}>
            <div css={{fontSize: 30, padding: theme.spacing.l2}}>
                {sustainedWinner ? (
                    <Fragment>
                        {sustainedWinner.getID() == me?.getID()
                            ? "You"
                            : sustainedWinner.getName(h)}{" "}
                        won this round!
                    </Fragment>
                ) : (
                    <Fragment>Nobody won this round!</Fragment>
                )}
                <div>
                    The word was{" "}
                    <span
                        css={{
                            color: theme.palette.themeSecondary,
                            textTransform: "uppercase",
                        }}>
                        {prevWord}
                    </span>
                    .
                </div>

                {Application.isAdmin(h) && (
                    <div css={{marginTop: 30, display: "flex", justifyContent: "center"}}>
                        <PrimaryButton onClick={() => room.nextRound()} autoFocus>
                            Next round
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </Modal>
    );
};
