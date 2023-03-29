class ChatCompletion {
    constructor(model, apiKey) {
        this.model = model;
        this.apiKey = apiKey;
        this.url = "https://api.openai.com/v1/chat/completions";
    }

    // create({sysPrompt: "You are a great personal assistant.", prompt: "Tell me about OpenAI's mission.", temperature: 1.0});
    async create({ sysPrompt = "", prompt, temperature = 1 }) {
        if (
            typeof sysPrompt !== "string" ||
            !prompt ||
            typeof prompt !== "string" ||
            !temperature ||
            typeof temperature !== "number" ||
            temperature < 0 ||
            temperature > 1
        ) {
            throw new Error("Invalid arguments.");
        }
        console.log("Prompt:");
        console.log({ temperature, sysPrompt, prompt });

        const startTime = Date.now();
        try {
            const response = await fetch(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    temperature: temperature,
                    messages: [
                        { role: "system", content: sysPrompt },
                        { role: "user", content: prompt },
                    ],
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMessage = result?.error?.message || "Unknown error";
                // console.error(`Status code: ${response.status}`);
                if (response.status === 401) {
                    throw new Error(
                        `Failed to fetch from OpenAI API (Did you input the API key correctly?): \n${errorMessage}`
                    );
                }
                throw new Error(
                    `Failed to fetch from OpenAI API: \n${errorMessage}`
                );
            }

            const endTime = Date.now();
            const elapsedTime = endTime - startTime;

            console.log(
                `Total tokens: ${result.usage.total_tokens}\nResult(${elapsedTime} ms):`
            );
            console.log(result.choices[0].message.content);

            return {
                text: `${result.choices[0].message.content}`,
                total_tokens: result.usage.total_tokens,
                processing_time: elapsedTime,
            };

            // return result.choices[0].message.content;
        } catch (error) {
            //console.error(error);
            //throw new Error(`Failed to communicate with the server. ${error}`);
            throw error;
        }
    }
}

class Translator extends ChatCompletion {
    // example: translate({text: "Je voudrais une baguette, s'il vous plaît.", targetLang: "Japanese", temperature: "1.0", style: "novel"})
    async translate({ text, targetLang, temperature = 1, style = "" }) {
        if (
            !text ||
            typeof text !== "string" ||
            !targetLang ||
            typeof targetLang !== "string" ||
            typeof temperature !== "number" ||
            temperature < 0 ||
            temperature > 1
        ) {
            throw new Error("Invalid arguments.");
        }

        console.log(`Target langage: ${targetLang}\nStyle: ${style}`);
        // const prompt = `You are a great translator and a native ${targetLang} speaker.\nThe following is a part of the ${style} text. Please translate the following text to ${targetLang} for the ${style} text. If the Text and target language are the same, please inform the user succinctly that there is no need to translate.\n\nText\n----------\n${text}\n---------\n\nTranslated text\n---------`;
        const prompt = `You are a great translator and a native ${targetLang} speaker.\nThe following is a part of the ${style} text. Please translate the following text to ${targetLang} for the ${style} text.\n\nText\n----------\n${text}\n---------\n\nTranslated text\n---------`;

        const response = await this.create({
            prompt: prompt,
        });
        return response;
    }
}
