const fs = require('fs');

const request = require('request');

const dataUrl = "http://www.unicode.org/Public/UNIDATA/UnicodeData.txt";
// const indexUrl = "http://unicode.org/Public/UNIDATA/Index.txt";
const blocksUrl = "http://unicode.org/Public/UNIDATA/Blocks.txt";
const emojiSequencesUrl = "http://www.unicode.org/Public/emoji/latest/emoji-sequences.txt";
const emojiZwjSequencesUrl = "http://www.unicode.org/Public/emoji/latest/emoji-zwj-sequences.txt";

// var index = new Promise((resolve, reject) =>
// {
//     console.log("downloading index")
//     request.get(indexUrl, (error, response, body) =>
//     {
//         if (error != null) return reject(error);
//         if (response.statusCode != 200) return reject(new Erro("Unexpected statuscode " + response.statusCode));
//         console.log("processing index");
//         let index = {};
//         body.split(/[\r\n]+/).forEach((line) =>
//         {
//             let [name, code] = line.split(/\t/);
//             const id = parseInt(code, 16);
//             if (index[id] == null)
//                 index[id] = { id: id, code: code, names: [] };
//             index[id].names.push(name);
//         });
//         resolve(index);
//     });
// });

function dropIfBlank(str, numerical)
{
    var value = (str == "" || str == null) ? undefined : str;
    if (value !== undefined && numerical)
    {
        value = parseInt(value);
        if (isNaN(value) || (""+value) != str) throw new Error("not an int; " + str);
    }
    return value;
}

var index = new Promise((resolve, reject) =>
{
    console.log("downloading data")
    request.get(dataUrl, (error, response, body) =>
    {
        if (error != null) return reject(error);
        if (response.statusCode != 200) return reject(new Erro("Unexpected statuscode " + response.statusCode));
        console.log("processing data");
        let index = {};
        body.split(/[\r\n]+/).forEach((line) =>
        {
            // see ftp://ftp.unicode.org/Public/3.0-Update/UnicodeData-3.0.0.html
            let [ code, charName, generalCategory, canoninicalCombingClasses,
                biDiCategory, characterDecompositionMapping, decimalDigitValue,
                digitValue, numericValue, mirrored, unicode10Name,
                iso10646Comment, uppercaseMapping, lowercaseMapping,
                titlecaseMapping, ...rest ] = line.split(/;/);

            if (code == "" || code == null) return;

            const id = parseInt(code, 16);
            var o = {
                value: id,
                code: code,
                charName: dropIfBlank(charName),
                generalCategory: dropIfBlank(generalCategory),
                canoninicalCombingClasses: dropIfBlank(canoninicalCombingClasses, true),
                biDiCategory: dropIfBlank(biDiCategory),
                characterDecompositionMapping: dropIfBlank(characterDecompositionMapping),
                //cdm: dropIfBlank(characterDecompositionMapping),
                decimalDigitValue: dropIfBlank(decimalDigitValue, true),
                digitValue: dropIfBlank(digitValue, true),
                numericValue: dropIfBlank(numericValue),
                mirrored: dropIfBlank(mirrored),
                unicode10Name: dropIfBlank(unicode10Name),
                iso10646Comment: dropIfBlank(iso10646Comment),
                uppercaseMapping: dropIfBlank(uppercaseMapping),
                lowercaseMapping: dropIfBlank(lowercaseMapping),
                titlecaseMapping: dropIfBlank(titlecaseMapping)
            };
            index[code] = o;
        });
        resolve(index);
    });
});

var blocks = new Promise((resolve, reject) =>
{
    console.log("downloading blocks")
    request.get(blocksUrl, (error, response, body) =>
    {
        if (error != null) return reject(error);
        if (response.statusCode != 200) return reject(new Erro("Unexpected statuscode " + response.statusCode));
        console.log("processing blocks");
        let blocks = [];
        body.split(/[\r\n]+/).forEach((line) =>
        {
            if (line.match(/^#/)) return;
            let m = line.match(/^([0-9a-f]+)\.\.([0-9a-f]+);\s*(.*?)$/i);
            if (m)
            {
                blocks.push({
                    fromValue: parseInt(m[1], 16),
                    fromCode: m[1],
                    toValue: parseInt(m[2], 16),
                    toCode: m[2],
                    name: m[3]
                });
            }
        });
        resolve(blocks);
    });
});

function parseEmojiRange(text)
{
    let index = [];
    text.split(/[\r\n]+/).forEach((line) =>
    {
        if (line.match(/^#/)) return;
        let m = line.match(/^\s*(.*?)\s*;\s*(.*?)\s*#\s*(.*?)\s*\[(.*?)\]\s*\((.*?)\)\s*(.*?)$/i);
        if (m)
        {
            index.push({
                codes: m[1].split(/\s+/).filter((a) => { return a != "" }),
                values: m[1].split(/\s+/).map((a) => { return parseInt(a, 16) }).filter((a) => { return !isNaN(a) }),
                type: m[2],
                version: m[3],
                count: m[4],
                str: m[5],
                name: m[6]
            });
        }
    });
    return index;
}

var emojiSequences = new Promise((resolve, reject) =>
{
    console.log("downloading emoji sequences")
    request.get(emojiSequencesUrl, (error, response, body) =>
    {
        if (error != null) return reject(error);
        if (response.statusCode != 200) return reject(new Erro("Unexpected statuscode " + response.statusCode));
        console.log("processing emoji sequences");
        resolve(parseEmojiRange(body));
    });
});

var emojiZwjSequences = new Promise((resolve, reject) =>
{
    console.log("downloading emoji zwj sequences")
    request.get(emojiZwjSequencesUrl, (error, response, body) =>
    {
        if (error != null) return reject(error);
        if (response.statusCode != 200) return reject(new Erro("Unexpected statuscode " + response.statusCode));
        console.log("processing emoji zwj sequences");
        resolve(parseEmojiRange(body));
    });
});

function parseTabDict(...texts)
{
    let dict = {};
    texts.forEach((text) =>
    {
        text.split(/[\r\n]+/).forEach((line) =>
        {
            let [key, value] = line.split(/\t+/);
            key = (key || "").trim();
            if (key != "")
                dict[key] = value;
        })
    })
    return dict;
}


Promise.all([index, blocks, emojiSequences, emojiZwjSequences])
    .then(([index, blocks, emojiSequences, emojiZwjSequences]) =>
{
    console.log("saving index.json")
    fs.writeFileSync("index.json", JSON.stringify({
        blocks: blocks,
        index: index,
        emoji: {
            sequences: emojiSequences.concat(emojiZwjSequences)
        },
        characterDecompositionMapping: parseTabDict(`<font>  	A font variant (e.g. a blackletter form)
<noBreak>  	A no-break version of a space or hyphen
<initial>  	An initial presentation form (Arabic)
<medial>  	A medial presentation form (Arabic)
<final>  	A final presentation form (Arabic)
<isolated>  	An isolated presentation form (Arabic)
<circle>  	An encircled form
<super>  	A superscript form
<sub>  	A subscript form
<vertical>  	A vertical layout presentation form
<wide>  	A wide (or zenkaku) compatibility character
<narrow>  	A narrow (or hankaku) compatibility character
<small>  	A small variant form (CNS compatibility)
<square>  	A CJK squared font variant
<fraction>  	A vulgar fraction form
<compat>  	Otherwise unspecified compatibility character
`),
        biDiCategories: parseTabDict(`L	Left-to-Right
LRE	Left-to-Right Embedding
LRO	Left-to-Right Override
R	Right-to-Left
AL	Right-to-Left Arabic
RLE	Right-to-Left Embedding
RLO	Right-to-Left Override
PDF	Pop Directional Format
EN	European Number
ES	European Number Separator
ET	European Number Terminator
AN	Arabic Number
CS	Common Number Separator
NSM	Non-Spacing Mark
BN	Boundary Neutral
B	Paragraph Separator
S	Segment Separator
WS	Whitespace
ON	Other Neutrals`),
        categories: parseTabDict(`Lu	Letter, Uppercase
Ll	Letter, Lowercase
Lt	Letter, Titlecase
Mn	Mark, Non-Spacing
Mc	Mark, Spacing Combining
Me	Mark, Enclosing
Nd	Number, Decimal Digit
Nl	Number, Letter
No	Number, Other
Zs	Separator, Space
Zl	Separator, Line
Zp	Separator, Paragraph
Cc	Other, Control
Cf	Other, Format
Cs	Other, Surrogate
Co	Other, Private Use
Cn	Other, Not Assigned
`, `Lm	Letter, Modifier
Lo	Letter, Other
Pc	Punctuation, Connector
Pd	Punctuation, Dash
Ps	Punctuation, Open
Pe	Punctuation, Close
Pi	Punctuation, Initial quote
Pf	Punctuation, Final quote
Po	Punctuation, Other
Sm	Symbol, Math
Sc	Symbol, Currency
Sk	Symbol, Modifier
So	Symbol, Other`)
    }, null, "\t"));
})
