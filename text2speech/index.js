'use strict';
import textToSpeech from '@google-cloud/text-to-speech';
import Speaker from 'speaker';

import dotenv from 'dotenv';


dotenv.config();

const client = new textToSpeech.TextToSpeechClient();
const speaker = new Speaker();

async function playAudio(audioBuffer) {
    console.log("Audio playback started");
    speaker.write(audioBuffer);
    console.log("Audio playback completed");
}

async function convertTextToAudio() {
    const text = "Hey, there";

    const request = {
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' }
    }

    const response = await client.synthesizeSpeech(request);

    if (response[0] && response[0].audioContent) {
        console.log("Text to speech has completed. Audio is playing.");
        await playAudio(response[0].audioContent);
    } else {
        console.error("No audio content received in the response.");
    }
}

convertTextToAudio();


