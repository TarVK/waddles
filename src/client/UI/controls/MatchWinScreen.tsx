import {jsx} from "@emotion/core";
import {FC, Fragment, useState, useEffect} from "react";
import {Modal, PrimaryButton} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {Application} from "../../model/Application";
import {useDataHook} from "model-react";
import {Player} from "../../model/game/Player";
import {useSyncState} from "../../services/useSyncState";

export const MatchWinScreen: FC = () => {
    const theme = useTheme();
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;
    const me = Application.getPlayer(h);

    const [winners, setWinners] = useState<Player[]>([]);
    const status = room.getStatus(h);

    const waiting = status == "waiting";
    useEffect(() => {
        if (waiting) {
            const players = room.getPlayers(null);
            const maxScore = players.reduce(
                (max, player) => Math.max(max, player.getScore(null)),
                0
            );
            const winners = players.filter(player => player.getScore(null) == maxScore);
            setWinners(winners);
        }
    }, [waiting]);
    const [visible, setVisible] = useSyncState(
        waiting && room.getRound(h) > 0 && winners.length > 0
    );

    return (
        <Modal
            isOpen={visible}
            onDismiss={() => setVisible(false)}
            styles={{main: {padding: theme.spacing.s1}}}>
            <div css={{fontSize: 30, padding: theme.spacing.l2}}>
                {winners.length == 1 ? (
                    <Fragment>
                        {winners[0].getID() == me?.getID()
                            ? "You"
                            : winners[0].getName(h)}{" "}
                        won the match!
                    </Fragment>
                ) : (
                    <Fragment>
                        The match ended in a draw between{" "}
                        {winners
                            .map(winner =>
                                winner.getID() == me?.getID() ? "you" : winner.getName(h)
                            )
                            .reduce(
                                (text, name, i, total) =>
                                    text +
                                    (i == 0
                                        ? ""
                                        : i == total.length - 1
                                        ? " and "
                                        : ", ") +
                                    name,
                                ""
                            )}
                    </Fragment>
                )}

                {Application.isAdmin(h) && (
                    <div css={{marginTop: 30, display: "flex", justifyContent: "center"}}>
                        <PrimaryButton onClick={() => room.start()} autoFocus>
                            Next match
                        </PrimaryButton>
                    </div>
                )}
            </div>
        </Modal>
    );
};
