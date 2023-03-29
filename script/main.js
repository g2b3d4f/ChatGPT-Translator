const translateButton = document.getElementById("translate-btn");
translateButton.addEventListener("click", translateText);

const apikeyInput = document.getElementById("api-key");
const targetTextarea = document.getElementById("target-text");
const sourceTextarea = document.getElementById("source-text");
// const temperatureInput = document.getElementById("temperature")
const completionInfoElem = document.getElementById("completion-info");

const languageSelect = document.getElementById("target-lang");
const styleSelect = document.getElementById("style-select");

function generateOptions(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

/* 言語リスト(select)を生成するやつ */

const languageData = [
    {
        language: "BG",
        name: "Bulgarian",
        supports_formality: false,
    },
    {
        language: "CS",
        name: "Czech",
        supports_formality: false,
    },
    {
        language: "DA",
        name: "Danish",
        supports_formality: false,
    },
    {
        language: "DE",
        name: "German",
        supports_formality: true,
    },
    {
        language: "EL",
        name: "Greek",
        supports_formality: false,
    },
    {
        language: "EN-GB",
        name: "English (British)",
        supports_formality: false,
    },
    {
        language: "EN-US",
        name: "English (American)",
        supports_formality: false,
    },
    {
        language: "ES",
        name: "Spanish",
        supports_formality: true,
    },
    {
        language: "ET",
        name: "Estonian",
        supports_formality: false,
    },
    {
        language: "FI",
        name: "Finnish",
        supports_formality: false,
    },
    {
        language: "FR",
        name: "French",
        supports_formality: true,
    },
    {
        language: "HU",
        name: "Hungarian",
        supports_formality: false,
    },
    {
        language: "ID",
        name: "Indonesian",
        supports_formality: false,
    },
    {
        language: "IT",
        name: "Italian",
        supports_formality: true,
    },
    {
        language: "JA",
        name: "Japanese",
        supports_formality: false,
    },
    {
        language: "KO",
        name: "Korean",
        supports_formality: false,
    },
    {
        language: "LT",
        name: "Lithuanian",
        supports_formality: false,
    },
    {
        language: "LV",
        name: "Latvian",
        supports_formality: false,
    },
    {
        language: "NB",
        name: "Norwegian",
        supports_formality: false,
    },
    {
        language: "NL",
        name: "Dutch",
        supports_formality: true,
    },
    {
        language: "PL",
        name: "Polish",
        supports_formality: true,
    },
    {
        language: "PT-BR",
        name: "Portuguese (Brazilian)",
        supports_formality: true,
    },
    {
        language: "PT-PT",
        name: "Portuguese (European)",
        supports_formality: true,
    },
    {
        language: "RO",
        name: "Romanian",
        supports_formality: false,
    },
    {
        language: "RU",
        name: "Russian",
        supports_formality: true,
    },
    {
        language: "SK",
        name: "Slovak",
        supports_formality: false,
    },
    {
        language: "SL",
        name: "Slovenian",
        supports_formality: false,
    },
    {
        language: "SV",
        name: "Swedish",
        supports_formality: false,
    },
    {
        language: "TR",
        name: "Turkish",
        supports_formality: false,
    },
    {
        language: "UK",
        name: "Ukrainian",
        supports_formality: false,
    },
    {
        language: "ZH",
        name: "Chinese (simplified)",
        supports_formality: false,
    },
];

languageData.forEach((language) => {
    languageSelect.appendChild(
        generateOptions(language.language, language.name)
    );
});

/* スタイルリスト(select)を生成するやつ */

const styleData = [
    { style: "", prompt: "", name: "None" },
    { style: "novel", prompt: " for the novel", name: "Novel" },
    { style: "twitter", prompt: " for the twitter", name: "Twitter" },
    { style: "wiki", prompt: " for the wiki", name: "Wiki" },
];

styleData.forEach((param) => {
    styleSelect.appendChild(generateOptions(param.style, param.name));
});

// 指定スタイルのプロンプトをgetする
// console.log(getStylePrompt("novel", supportedStyles)); // 出力: " for the novel"
function getStylePrompt(style, styles) {
    const foundStyle = styles.find((item) => item.style === style);
    return foundStyle ? foundStyle.prompt : "";
}

/* translate-btnの制御するやつ */

// sourceTextareが空 or languageSelectがデフォ = disabled
function updateTranslateButton() {
    translateButton.disabled = !(
        sourceTextarea.value.match(/\S/) && languageSelect.value
    );
    // if (sourceTextarea.value.trim() === "" || languageSelect.value === "") {
    //     translateButton.disabled = true;
    // } else {
    //     translateButton.disabled = false;
    // }
}

sourceTextarea.addEventListener("input", updateTranslateButton);
languageSelect.addEventListener("change", updateTranslateButton);

updateTranslateButton();

/* valueの小数点第base位以下を切り捨てする関数 */

function orgFloor(value, base) {
    return Math.floor(value * Math.pow(10, base)) / Math.pow(10, base);
}

async function translateText() {
    sourceTextarea.removeEventListener("input", updateTranslateButton);
    languageSelect.removeEventListener("change", updateTranslateButton);
    translateButton.disabled = true;

    // const stylePrompt = getStylePrompt(style, styleData);

    //内容の削除
    //TODO:インジケーター表示
    //結果で上書き
    targetTextarea.value = "";
    const placeholder = targetTextarea.placeholder;
    targetTextarea.placeholder = "Translating...";
    completionInfoElem.innerHTML = "...";

    const translator = new Translator(
        "gpt-3.5-turbo-0301",
        `${apikeyInput.value}`
    );

    try {
        const result = await translator.translate({
            text: sourceTextarea.value,
            targetLang:
                languageSelect.options[languageSelect.selectedIndex].text,
            temperature: 1.0,
            style: styleSelect.value,
        });
        targetTextarea.value = result.text;
        completionInfoElem.innerHTML = `${result.processing_time / 1000} s, ${
            result.total_tokens
        } tokens, ${orgFloor(
            0.000002 * result.total_tokens,
            4
        )} USD, ${orgFloor(0.000002 * result.total_tokens * 130, 3)} JPY`;
    } catch (error) {
        console.error(error);
        targetTextarea.value = `Error: An error has occurred. Please check the console for details.`;
        completionInfoElem.innerHTML = `Translation failed.`;
    }

    targetTextarea.placeholder = `${placeholder}`;

    sourceTextarea.addEventListener("input", updateTranslateButton);
    languageSelect.addEventListener("change", updateTranslateButton);
    updateTranslateButton();
}

translateButton.addEventListener("click", translateText);
