import {jsx} from "@emotion/core";
import {FC} from "react";
import {ActionButton, FontIcon} from "@fluentui/react";

export const Footer: FC = ({}) => {
    return (
        <div css={{display: "flex", justifyContent: "space-between"}}>
            <a
                href="https://github.com/TarVK/waddles#gameplay"
                target="_blank"
                css={{textAlign: "right"}}>
                <ActionButton css={{padding: 10, fontSize: 18}}>Help</ActionButton>
            </a>
            <a href="https://github.com/TarVK/waddles" css={{textAlign: "right"}}>
                <ActionButton css={{padding: 10, fontSize: 18}}>Github</ActionButton>
            </a>
        </div>
    );
};
