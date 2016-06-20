export interface IIsEmojiSequenceResult {
    length: number;
    emoji: any;
}
export interface ISplitCharsOptions {
    whitespace?: boolean;
    newLine?: boolean;
    newLineReset?: boolean;
    emoji?: boolean;
    emojiReset?: boolean;
}
export interface IStringRange {
    type: string;
    chars: Array<number>;
}
export declare class UTF16String {
    static ensureCharCode(c: number | string): number;
    static encodeChar(char: number | string): string;
    static encodeAsSurrogatePair(char: number | string): Array<number>;
    static decodeSurrogatePair(a: number | Array<number>, b?: number): number;
    static isSurrogateChar(char: number | string): boolean;
    static isEmojiChar: (char: any) => boolean;
    static isNumericChar(char: number | string): boolean;
    static isOtherChar(char: number | string): boolean;
    static isArabicChar(char: number | string): boolean;
    static isHebrewChar(char: number | string): boolean;
    static isSyriacChar(char: number | string): boolean;
    static isThaanaChar(char: number | string): boolean;
    static isTifinaghChar(char: number | string): boolean;
    static isNKoChar(char: number | string): boolean;
    static isRTLChar(char: number | string): boolean;
    static isNewLineChar(char: number | string): boolean;
    static isWhitespaceChar(char: number | string): boolean;
    static isEmojiSequence(chars: string | Array<number>, index?: number): IIsEmojiSequenceResult;
    static splitChars(str: string | Array<number>, options?: ISplitCharsOptions): Array<IStringRange>;
    static splitStringIntoChars(str: string, offset?: number, count?: number): Array<number>;
    static mergeStringFromChars(chars: Array<number>, offset?: number, count?: number): string;
    static getLength(str: string, offset?: number, count?: number): number;
    static stripEmojis(str: string): string;
}
export declare const emojiSequences: any;
export declare const emojiRanges: any;
export declare const emojiIndex: any;
