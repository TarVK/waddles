import {jsx} from "@emotion/core";
import {FC, Fragment, useState, useEffect, useMemo} from "react";
import {IconButton, Modal, SearchBox, Toggle, Button, FontIcon} from "@fluentui/react";
import {useTheme} from "../../../../services/useTheme";
import {Title} from "../../../../components/Title";
import {Application} from "../../../../model/Application";
import {useDataHook} from "model-react";
import {WorldList, WordListContainer} from "./WordList";
import {getWordLists} from "../../../../services/lists/getWordLists";
import {NewCustomListModal} from "./NewCustomListModal";
import {wordListVersion} from "../../../../services/lists/addWordLists";

export const WordListSelection: FC = () => {
    const [h] = useDataHook();
    const room = Application.getRoom(h)!;
    const isAdmin = Application.isAdmin(h);
    const [search, setSearch] = useState("");

    const availableLists = useMemo(getWordLists, [wordListVersion.get(h)]);
    const [isCustomListModalOpen, setCustomListModalOpen] = useState(false);

    const theme = useTheme();
    return (
        <Fragment>
            <Title
                css={{
                    marginTop: theme.spacing.m,
                    marginBottom: theme.spacing.s1,
                }}>
                Word list selection
            </Title>
            <SearchBox
                placeholder="Search"
                css={{
                    marginLeft: theme.spacing.s1,
                    marginRight: theme.spacing.s1,
                }}
                underlined
                value={search}
                onChange={(e, v) => v !== undefined && setSearch(v)}
            />
            <div
                css={{
                    flex: 1,
                    flexShrink: 1,
                    minHeight: 150,
                    overflow: "auto",
                }}
                data-is-scrollable={true}>
                {availableLists
                    .filter(({name, description}) =>
                        (name + description).toLowerCase().includes(search)
                    )
                    .map(source => (
                        <WorldList key={source.name} source={source} />
                    ))}
                <WordListContainer
                    css={{backgroundColor: theme.palette.themeLight}}
                    onClick={() => {
                        if (isAdmin) setCustomListModalOpen(true);
                    }}>
                    <div
                        title="Upload custom word list"
                        css={{
                            height: 60,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}>
                        <FontIcon aria-label="Add" iconName="Add" css={{fontSize: 60}} />
                    </div>
                </WordListContainer>
            </div>
            <NewCustomListModal
                isOpen={isCustomListModalOpen}
                onClose={() => setCustomListModalOpen(false)}
            />
        </Fragment>
    );
};
