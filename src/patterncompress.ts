const partialASCII = [...Array(94).keys()].map(i => String.fromCharCode(i + 33));
console.log(partialASCII);
const input = "The year 2004 marks the last time DuPage County, Illinois voted for a Republican presidential candidate. Four years later, Floyd County, Kentucky voted for a Republican candidate for the first time ever. Conversely, Riley County, Kansas voted for a Democrat for the first time in 2020. Sharing these facts with even my politically interested peers would garner odd looks. To me, however, they show leftward shifts in suburbs, rightward shifts in rural working-class areas, and increasingly progressive voting patterns in areas with higher levels of bachelor’s degree attainment, respectively. I enjoy reading the news, but it only covers what’s happening; reading about history is fascinating, but it only covers what’s happened. So when I have free time, I go down the rabbit hole of looking at elections–the perfect synthesis of past and present. I’ve always been interested in the obscure and how, through carefully crafted connections, the obscure can be made relevant. Early on, I collected facts on anything from Ancient Egypt to Balkan geography to seafloor life, but not politics. My political awakening was the day after the 2016 election, when my amusement quickly turned into a profound realization of the division, anxiety, and rage that would take hold of the country. I began following the news, but it was not until Virginia’s 2021 off-year elections that I fully understood how electoral analysis melded my interests in both little-known facts and politics. I consumed electoral data with the same ferocity with which some peers followed the NFL draft–and I drew a similar high from the feeling of being an insider. Regardless of who won, Election Day felt like the culmination of hard work, even if that work was just scrutinizing the news. Elections are one way to check the pulse of the nation, to see successes and failures, problems and solutions, through the lens of the people. The fact that heartbeat upon heartbeat across years, or even centuries, can paint a picture of the past and future, is what really makes them matter to me. They help with critical thinking, too–everyone should have the willpower to examine a poll that is favorable to a preferred candidate and think, is this really accurate? For finding these elections and polls, the Internet is my friend. Wikipedia, maligned as it is, is great for viewing unfiltered data–particularly for elections undiscussed outside esoteric circles. FiveThirtyEight filters and weights polls through methodology far more complex than my own abilities. Politico provides a spotlight on D.C. happenings and ongoing campaigns–which, while helpful, is susceptible to the sensationalistic, speculatory practices that pervade coverage by conventional news sources. My guiltiest pleasure is “Election Twitter.” While the most susceptible to personal biases, it also provides a sort of community that I’ve had difficulty finding in real life. Sometimes, though, real life gives you a chance. This summer, I pursued an internship at former Senate Majority Leader Tom Daschle’s firm, where I was tasked with researching state-by-state abortion policies, tracking likely Congressional freshmen after primaries, and covering Congressional hearings. In speaking with the Senator, I realized that politicians have genuine, complex motives, and learned what a veteran policymaker had to say about contemporary global issues. The experience helped me understand that politics is not a spectator sport: It has real effects on real people, and my own actions factor into them. This has changed my perception of analyzing elections: I had an imperative to stay informed, as soon I, too, would play a part–no longer an observer, but someone with influence on policy. When I cast my first ballot in Virginia’s 2023 elections, I'll remember this. Sometimes I worry, however, that future votes won’t matter, as more states and districts become more partisan and less competitive. But really, it’s the assumption that polarization is inevitable that causes more problems than polarization itself. Whenever I feel powerless, past election results can show me that things do, in fact, change.";

function getPatternValue(text: string, pattern: string): number {
    let place = text.indexOf(pattern);
    if (-1 === place) {
        return -(pattern.length + 2);
    }
    let occurences = 0;
    while (0 <= place) {
        place = text.indexOf(pattern, place + pattern.length);
        occurences++;
    }
    return occurences * (pattern.length - 1) - (pattern.length + 2);
}
function findBestPattern(text: string): string {
    let length = 2;
    const patterns: {pattern: string, location: number, value: number}[] = [];
    for (let i = 0; i < text.length - 1; i++) {
        const pattern = text.substring(i, i + length);
        const value = getPatternValue(text, pattern);
        if (0 <= value) {
            patterns.push({pattern: pattern, location: i, value: value});
        }
    }
    let improvement = true;
    while (improvement) {
        length++;
        improvement = false;
        patterns.forEach((p, i) => {
            const pattern = text.substring(p.location, p.location + length);
            const value = getPatternValue(text, pattern);
            if (p.value < value) {
                patterns[i] = {pattern: pattern, location: p.location, value: value};
                improvement = true;
            }
        });
    }
    return patterns.reduce((p, c) => p.value < c.value ? c : p, {pattern: "", location: 0, value: -1}).pattern;
}
function patternCompress(text: string): {text: string, patterns: {char: string, pattern: string, value: number}[]} {
    const unusedASCII = partialASCII.filter(c => !text.includes(c));
    let bestPattern: string;
    const patterns: {char: string, pattern: string, value: number}[] = []
    while (0 < getPatternValue(text, (bestPattern = findBestPattern(text))) && 1 < unusedASCII.length) {
        const pattern = {char: unusedASCII.shift(), pattern: bestPattern, value: getPatternValue(text, bestPattern)};
        patterns.push(pattern);
        text = text.replaceAll(pattern.pattern, pattern.char);
    }
    const bC = unusedASCII.shift();
    const result = bC + patterns.map(p => p.char + p.pattern).join(bC) + bC + bC + text;
    return {text: result, patterns: patterns};
}
function patternDecompress(text: string): string {
    const bC = text.charAt(0);
    const patterns = text.substring(1, text.indexOf(bC + bC)).split(bC);
    let content = text.substring(text.indexOf(bC + bC) + 2);
    patterns.reverse().forEach(p => {
        content = content.replaceAll(p.charAt(0), p.substring(1));
    })
    return content;
}
/*
const compressed = patternCompress(input)
const decompressed = patternDecompress(compressed.text);
console.log(input, "\nlength:", input.length, "\n");
console.log(compressed.patterns);
console.log(compressed.text);
console.log("length:", compressed.text.length, "\n")
console.log(decompressed, "\n");
*/
window.addEventListener("load", () => {
    const input = document.getElementById("input") as HTMLTextAreaElement
    const output = document.getElementById("output") as HTMLTextAreaElement
    const compress = document.getElementById("compress") as HTMLButtonElement;
    const decompress = document.getElementById("decompress") as HTMLButtonElement;
    compress.addEventListener("click", e => {
        output.value = patternCompress(input.value).text;
    });
    decompress.addEventListener("click", e => {
        output.value = patternDecompress(input.value);
    })
})
