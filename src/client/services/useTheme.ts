import {useTheme as emotionUseTheme} from "emotion-theming";
import {ITheme} from "@fluentui/react";
import {ICharStatus} from "../../_types/game/ICharStatus";

export const useTheme = emotionUseTheme as () => ITheme;
