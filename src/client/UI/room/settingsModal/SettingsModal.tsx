import {jsx} from "@emotion/core";
import {IconButton, Modal, SearchBox, Toggle, Button, Dropdown} from "@fluentui/react";
import {useDataHook} from "model-react";
import {FC, Fragment, useEffect, useState} from "react";
import {TextField} from "../../../components/TextField";
import {Title} from "../../../components/Title";
import {Application} from "../../../model/Application";
import {useSyncState} from "../../../services/useSyncState";
import {useTheme} from "../../../services/useTheme";
import {useIsMobileView} from "../../../services/useIsMobileView";
import {FakeFocus} from "../../../components/FakeFocus";
import {WordListSelection} from "./wordList/WordListSelection";
import {IScoreMode} from "../../../../_types/game/IScoreMode";
import {IWordMode} from "../../../../_types/game/IWordMode";
import {
    keyboardLayout,
    keyboardLayouts,
    setKeyboardLayout,
} from "../../../services/keyboardLayout";

export const SettingsModal: FC = () => {
    const [h, c] = useDataHook();

    // Retrieve all relevant data
    const room = Application.getRoom(h)!;
    const isAdmin = Application.isAdmin(h);

    const [isOpen, setOpen] = useState(false);

    // Keep track of some local data
    const [maxPlayerCount, setMaxPlayerCount] = useSyncState(
        room?.getMaxPlayerCount(h) || 2
    );
    const settings = room.getSettings(h);

    const theme = useTheme();
    return (
        <Fragment>
            <IconButton
                iconProps={{iconName: "Settings"}}
                styles={{
                    root: {
                        color: theme.palette.black,
                        verticalAlign: "middle",
                    },
                }}
                title="Settings"
                ariaLabel="Settings"
                onClick={() => setOpen(true)}
            />
            <Modal
                isOpen={isOpen}
                onDismiss={() => setOpen(false)}
                styles={{
                    main: {padding: theme.spacing.s1, width: 800, overflow: "visible"},
                    scrollableContent: {
                        // Fix for scrolling not working on phone, caused by this change: https://github.com/microsoft/fluentui/pull/8568
                        maxHeight: window.innerHeight - 60,
                    },
                }}>
                <div
                    css={{
                        display: "flex",
                        maxHeight: "90vh",
                        flexDirection: "column",
                        marginBottom: 2,
                    }}>
                    <div css={{display: "flex", alignItems: "flex-end"}}>
                        <Title css={{flexGrow: 1}}>Room settings</Title>
                        <IconButton
                            iconProps={{iconName: "remove"}}
                            onClick={() => setOpen(false)}
                        />
                    </div>
                    <div css={{display: "flex", alignItems: "flex-end"}}>
                        <TextField
                            label={"Max player count"}
                            css={{
                                flexGrow: 1,
                                marginLeft: theme.spacing.s1,
                                marginRight: theme.spacing.s1,
                            }}
                            value={maxPlayerCount + ""}
                            type="number"
                            disabled={!isAdmin}
                            onChange={(e, v) =>
                                v !== undefined && setMaxPlayerCount(Number(v))
                            }
                            onBlur={() => {
                                if (room) room.setMaxPlayerCount(maxPlayerCount);
                            }}
                        />
                        <Toggle
                            label="Private room"
                            css={{
                                marginRight: theme.spacing.s1,
                            }}
                            checked={room?.isPrivate(h) || false}
                            disabled={!isAdmin}
                            onChange={(e, v) => {
                                if (room && v !== undefined) room.setPrivate(v);
                            }}
                        />
                    </div>

                    {/* We don't want an actual field to auto focus, so this is a dirty fix */}
                    <FakeFocus />

                    <WordListSelection />

                    <Title css={{marginTop: theme.spacing.m}}>Modes</Title>
                    <div
                        css={{
                            display: "flex",
                            padding: theme.spacing.s1,
                            gap: theme.spacing.s1,
                            flexWrap: "wrap",
                        }}>
                        <Dropdown
                            css={{flex: 1}}
                            placeholder="Select a scoring mode"
                            label="Scoring mode"
                            selectedKey={settings.scoring}
                            disabled={!isAdmin}
                            options={[
                                {
                                    key: "speed",
                                    text: "Fastest guess",
                                },
                                {
                                    key: "attempts",
                                    text: "Fewest attempts",
                                },
                            ]}
                            onChange={(p, i) =>
                                room.setSettings({
                                    ...settings,
                                    scoring: i!.key as IScoreMode,
                                })
                            }
                        />
                        <Dropdown
                            css={{flex: 1}}
                            placeholder="Select a word mode"
                            label="Word mode"
                            selectedKey={settings.wordMode}
                            disabled={!isAdmin}
                            options={[
                                {
                                    key: "randomized",
                                    text: "Randomly chosen",
                                },
                                {
                                    key: "entered",
                                    text: "Entered by a player",
                                },
                            ]}
                            onChange={(p, i) =>
                                room.setSettings({
                                    ...settings,
                                    wordMode: i!.key as IWordMode,
                                })
                            }
                        />
                        <Dropdown
                            css={{flex: 1}}
                            placeholder="Select a visibility mode"
                            label="Visibility mode"
                            selectedKey={settings.seeOpponents ? "shown" : "hidden"}
                            disabled={!isAdmin}
                            options={[
                                {
                                    key: "hidden",
                                    text: "Hide opponent's answers",
                                },
                                {
                                    key: "shown",
                                    text: "Show opponent's answers",
                                },
                            ]}
                            onChange={(p, i) =>
                                room.setSettings({
                                    ...settings,
                                    seeOpponents: i!.key == "shown",
                                })
                            }
                        />
                    </div>

                    <Title css={{marginTop: theme.spacing.m}}>Time management</Title>
                    <div
                        css={{
                            display: "flex",
                            padding: theme.spacing.s1,
                            gap: theme.spacing.s1,
                        }}>
                        <TextField
                            label={"Number of rounds"}
                            css={{
                                flexGrow: 1,
                            }}
                            value={settings.rounds + ""}
                            type="number"
                            disabled={!isAdmin}
                            onChange={(e, v) => {
                                if (v !== undefined) {
                                    const val = Number(v);
                                    if (isNaN(val)) return;
                                    room.setSettings({
                                        ...settings,
                                        rounds: Math.max(1, val),
                                    });
                                }
                            }}
                        />
                        <TextField
                            label={"Allowed attempts"}
                            css={{
                                flexGrow: 1,
                            }}
                            value={settings.attempts + ""}
                            type="number"
                            disabled={!isAdmin}
                            onChange={(e, v) => {
                                if (v !== undefined) {
                                    const val = Number(v);
                                    if (isNaN(val)) return;
                                    room.setSettings({
                                        ...settings,
                                        attempts: Math.max(1, val),
                                    });
                                }
                            }}
                        />
                    </div>

                    <Title css={{marginTop: theme.spacing.m}}>Keyboard layout</Title>

                    <Dropdown
                        css={{
                            flex: 1,
                            marginLeft: theme.spacing.s1,
                            marginRight: theme.spacing.s1,
                        }}
                        placeholder="Select a keyboard layout"
                        label="Keyboard layout"
                        selectedKey={keyboardLayout.get(h).name}
                        options={Object.keys(keyboardLayouts).map(name => ({
                            key: name,
                            text: name,
                        }))}
                        onChange={(p, i) => setKeyboardLayout(i!.key + "")}
                    />
                </div>
            </Modal>
        </Fragment>
    );
};
