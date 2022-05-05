export type IWordListSource = {
    name: string;
    description: string;
    isCustom: boolean;
    get: () => Promise<string[]>;
};
