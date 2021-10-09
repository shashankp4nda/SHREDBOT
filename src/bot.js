require("dotenv").config(); 

const { time } = require("console");
const { Client } = require('discord.js'); 
const path = require('path');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client(); 
const re1 = /^Tuna [a-g][3-5]$/i;
const re2 = /^chord [A-G].*$/i;

client.on("message", msg => {
    if (re1.test(msg.content)) {
        const { voice } = msg.member
        if (!voice.channelID) {
            msg.reply('You must be in a voice channel!'); 
            return
        }
        var note = msg.content.slice(5, 7);
        voice.channel.join().then((connection) => {
            connection.play(path.join(__dirname, `public\\audio\\${note}.mp3`));

        })
        setTimeout(() => {
            voice.channel.leave();
        }, 5000);
        
    }
    if (msg.content==="!ShredHelp")   {
        msg.reply("\nHello!\nShredBot is a guitar helper bot for your discord jam sessions.\n\n\t\t-------_COMMANDS_-------\n\n1. Tuna:\tTuna is a command used to play a note so that you can tune your guitar strings accordingly by ear. \n\t\t(Example: Tuna e4)\tNOTE: Tuna is case-insensitive so feel free to get sLopPy\n\n2. chords:  Simply type 'chord' followed by the chord name (Example: A, F_maj7, etc) and be provided with chord shape, Fingering and tones of the chord on guitar! ")
    }

    if(re2.test(msg.content))   {
        const url = "https://api.uberchord.com/v1/chords/" + msg.content.slice(6);
        console.log(url)
        https.get(url, chordDetails => {
            console.log(chordDetails.statusCode);
            chordDetails.on("data", (data) => {
                console.log("Data string: " + data)
                if (data.toString() === '[]')  {
                    msg.reply("\nSorry, could'nt find the chord you're looking for :(\nTry using underscores (Example: B_m, F_maj7)")
                } else {
                    const chordData = JSON.parse(data);
                    const Strings = chordData[0].strings; 
                    const Fingering = chordData[0].fingering;
                    const Tones = chordData[0].tones;
                    msg.reply(`\nCHORD: ${msg.content.slice(6)}\nStrings:\t\t\t${Strings}\nFingering:\t\t${Fingering}\nTones:\t\t\t ${Tones}`);
                }
            })
        })
    }
})

client.login(process.env.BOT_TOKEN);