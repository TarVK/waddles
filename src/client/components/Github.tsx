import {jsx} from "@emotion/core";
import {FC} from "react";
import {ActionButton, FontIcon} from "@fluentui/react";

export const Github: FC = ({}) => {
    return (
        <a href="https://github.com/TarVK/waddles" css={{textAlign: "right"}}>
            <ActionButton css={{padding: 10, fontSize: 18}}>Github</ActionButton>
        </a>
    );
};
