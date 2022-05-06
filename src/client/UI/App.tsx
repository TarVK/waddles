import {jsx} from "@emotion/core";
import {FC, useState, useEffect} from "react";
import {useDataHook} from "model-react";
import {Application} from "../model/Application";
import {DefaultLoaderSwitch} from "../components/DefaultLoaderSwitch";
import {useIsMobileView} from "../services/useIsMobileView";
import {PlayerList} from "./playerList/PlayerList";
import {RoomData} from "./room/RoomData";
import {useTheme} from "../services/useTheme";
import {Surface} from "../components/Surface";
import {Player} from "../model/game/Player";
import {createToast} from "../components/NotificationManager/createToast";
import {MessageBarType, Panel, PanelType, IconButton} from "@fluentui/react";
import {useSyncState} from "../services/useSyncState";
import {OwnView} from "./game/OwnView";
import {PlayerViews} from "./game/PlayerViews";
import {RoundWinScreen} from "./controls/RoundWinScreen";
import {MatchWinScreen} from "./controls/MatchWinScreen";
import {EnterWordScreen} from "./controls/EnterWordScreen";
import {Footer} from "./Footer";

export const App: FC = () => {
    const [h, c] = useDataHook();
    const player = Application.getPlayer(h);
    const room = Application.getRoom(h);

    useEffect(() => {
        const listener = (kicked: Player) => {
            if (kicked.is(player)) {
                Application.joinRoom("Kicked");
                createToast(`You were kicked!`, MessageBarType.error);
            } else {
                createToast(`${kicked.getName(null)} was kicked`);
            }
        };

        room?.on("kick", listener);
        return () => void room?.off("kick", listener);
    }, [room]);

    const theme = useTheme();
    const [isMenuOpen, setMenuOpen] = useSyncState(false);
    if (useIsMobileView())
        return (
            <DefaultLoaderSwitch {...c}>
                <EnterWordScreen />
                <RoundWinScreen />
                <MatchWinScreen />
                <IconButton
                    iconProps={{iconName: "GlobalNavButton"}}
                    styles={{
                        root: {
                            color: theme.palette.black,
                            position: "absolute",
                            right: theme.spacing.s1,
                            top: 12,
                        },
                        icon: {
                            fontSize: 25,
                        },
                    }}
                    title="Menu"
                    ariaLabel="Menu"
                    onClick={() => setMenuOpen(true)}
                />
                <div
                    css={{
                        height: "100%",
                        width: "100%",
                        overflow: "auto",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        "> *": {
                            flex: 1,
                        },
                    }}>
                    <PlayerViews />
                    <OwnView />
                </div>
                <Panel
                    isOpen={isMenuOpen}
                    isLightDismiss
                    type={PanelType.custom}
                    customWidth={"250px"}
                    onRenderNavigation={() => <div />}
                    styles={{
                        main: {backgroundColor: theme.palette.themeLight},
                        contentInner: {flex: 1},
                        scrollableContent: {height: "100%"},
                        content: {
                            padding: 0,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                        },
                        commands: {margin: 0},
                    }}
                    onDismiss={() => setMenuOpen(false)}>
                    <div
                        css={{
                            padding: theme.spacing.s1,
                            backgroundColor: theme.palette.themeLighter,
                        }}>
                        <RoomData />
                    </div>
                    <div css={{flexGrow: 1}}>
                        <PlayerList />
                    </div>
                    <Footer />
                </Panel>
            </DefaultLoaderSwitch>
        );

    return (
        <DefaultLoaderSwitch {...c}>
            <EnterWordScreen />
            <RoundWinScreen />
            <MatchWinScreen />
            <div
                css={{
                    display: "flex",
                    flexDirection: "row",
                    height: "100%",
                    width: "100%",
                    maxWidth: "auto",
                }}>
                <div
                    css={{
                        height: "100%",
                        overflow: "auto",
                        minWidth: 0,
                        display: "flex",
                        flexGrow: 1,
                        "> *": {
                            flex: 1,
                        },
                    }}>
                    <OwnView />
                    <PlayerViews />
                </div>
                <Surface
                    css={{
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: theme.palette.themeLight,
                        flexShrink: 0,
                        width: 250,
                    }}>
                    <div
                        css={{
                            padding: theme.spacing.s1,
                            backgroundColor: theme.palette.themeLighter,
                        }}>
                        <RoomData />
                    </div>
                    <div css={{flexGrow: 1}}>
                        <PlayerList />
                    </div>
                    <Footer />
                </Surface>
            </div>
        </DefaultLoaderSwitch>
    );
};
