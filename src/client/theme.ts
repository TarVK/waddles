import {loadTheme} from "office-ui-fabric-react";
import {ICharStatus} from "../_types/game/ICharStatus";

loadTheme({
    palette: {
        themePrimary: "#c9b458",
        themeSecondary: "#6aaa64",
        themeLighterAlt: "#f5f5f5",
        themeLighter: "#ededed",
        themeLight: "#e7e7e7",
        themeTertiary: "#e5b2a1",
        themeDarkAlt: "#bfa843",
        themeDark: "#bda84b",
        themeDarker: "#a69138",
        neutralLighterAlt: "#f8f8f8",
        neutralLighter: "#f4f4f4",
        neutralLight: "#d3d6da",
        neutralQuaternaryAlt: "#dadada",
        neutralQuaternary: "#d0d0d0",
        neutralTertiaryAlt: "#c8c8c8",
        neutralTertiary: "#c2c2c2",
        neutralSecondary: "#858585",
        neutralPrimaryAlt: "#4b4b4b",
        neutralPrimary: "#333333",
        neutralDark: "#272727",
        black: "#1d1d1d",
        white: "#ffffff",
    },
});

export const gameColors: Record<ICharStatus, string | null> = {
    absent: "#787c7e",
    contains: "#c9b458",
    matches: "#6aaa64",
    unknown: null,
};
