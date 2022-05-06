import {jsx} from "@emotion/core";
import {FC} from "react";
import {useDataHook} from "model-react";
import {RoomName} from "./RoomName";
import {Application} from "../../model/Application";
import {DefaultButton, PrimaryButton} from "@fluentui/react";
import {useTheme} from "../../services/useTheme";
import {SettingsModal} from "./settingsModal/SettingsModal";

export const RoomData: FC = () => {
    const [h, c] = useDataHook();
    const room = Application.getRoom(h)!;
    const isAdmin = Application.isAdmin(h);
    const isGameGoing = room && room.getStatus(h) != "waiting";
    const round = room.getRound(h);
    const startGame = () => {
        room?.start();
    };

    const theme = useTheme();
    return (
        <div>
            <RoomName /> <SettingsModal />
            <div css={{marginTop: theme.spacing.s1}} />
            <div
                css={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <div>Round {round}</div>
                {isAdmin &&
                    (isGameGoing ? (
                        <DefaultButton onClick={startGame}>Restart</DefaultButton>
                    ) : (
                        <PrimaryButton onClick={startGame}>Start game!</PrimaryButton>
                    ))}
            </div>
        </div>
    );
};
