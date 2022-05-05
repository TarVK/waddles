import {jsx} from "@emotion/core";
import {FC, Fragment, useEffect} from "react";
import {useDataHook} from "model-react";
import {Application} from "../../model/Application";
import {PlayerView} from "./PlayerView";
import {useTheme} from "../../services/useTheme";
import {genList} from "../../services/genList";
import {useIsMobileView} from "../../services/useIsMobileView";

export const PlayerViews: FC = () => {
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;
    const self = Application.getPlayer(h)!;
    const players = room.getPlayers(h).filter(player => player.getID() != self.getID());

    const isMobile = useIsMobileView();
    const size = isMobile ? "extraSmall" : players.length >= 3 ? "small" : "normal";
    const theme = useTheme();
    return (
        <div
            css={{
                maxHeight: "100%",
                overflow: "auto",
                display: "flex",
                padding: theme.spacing.l2,
                flexWrap: isMobile ? undefined : "wrap",
                alignItems: "center",
                gap: theme.spacing.l2,
                "> *": {
                    flex: 1,
                },
            }}>
            {/* {genList(10, i => players[0]).map(player => ( */}
            {players.map(player => (
                <PlayerView
                    key={player.getID()}
                    player={player}
                    extended={!isMobile && players.length > 1}
                    size={size}
                />
            ))}
        </div>
    );
};
