import {jsx} from "@emotion/core";
import {FC, Fragment} from "react";
import {Player} from "../../model/game/Player";
import {Attempts} from "./Attempts";
import {PlayerComp} from "../playerList/PlayerComp";
import {IViewSize} from "./_types/IViewSize";

export const PlayerView: FC<{
    player: Player;
    extended?: boolean;
    size?: IViewSize;
}> = ({player, extended, size = "normal"}) => {
    return (
        <div css={{display: "flex", justifyContent: "Center"}}>
            <div css={{display: "flex", flexDirection: "column"}}>
                <Attempts player={player} size={size} />
                {extended ? (
                    <Fragment>
                        {size == "normal" && <div css={{height: 61}} />}
                        {<PlayerComp player={player} />}
                        {size == "normal" && <div css={{height: 60}} />}
                    </Fragment>
                ) : size == "normal" ? (
                    <div css={{height: 190}} />
                ) : undefined}
            </div>
        </div>
    );
};
