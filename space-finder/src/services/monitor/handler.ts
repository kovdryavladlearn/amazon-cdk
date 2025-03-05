import { SNSEvent } from "aws-lambda";

const webHookUrl = 'https://hooks.slack.com/services/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';

async function handler(event: SNSEvent, context) {
    for (const record of event.Records){
        await fetch(webHookUrl, {
            method: "POST",
            body: JSON.stringify({
                "text": `Huston, we have a problem" ${record.Sns.Message}`
            })
        })
    }
}

export { handler }