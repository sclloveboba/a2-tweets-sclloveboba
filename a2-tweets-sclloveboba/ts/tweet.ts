class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        const lower = this.text.toLowerCase();
        // Heuristics based on common RunKeeper templates
        if (lower.includes('watch my') && lower.includes('live')) {
            return 'live_event';
        }
        if (lower.includes('achiev') || lower.includes('personal record') || lower.includes('personal best') || lower.includes('goal')) {
            return 'achievement';
        }
        if (lower.startsWith('just completed') || lower.startsWith('just posted') || lower.startsWith('finished') || lower.includes('with #runkeeper') || lower.includes('with runkeeper')) {
            return 'completed_event';
        }
        return 'miscellaneous';
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        const core = this.extractUserWrittenText(this.text);
        return core.length > 0;
    }

    get writtenText():string {
        // Return the parsed user-written text (may be empty string)
        return this.extractUserWrittenText(this.text);
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        const lower = this.text.toLowerCase();
        // Try to extract the activity phrase that follows the distance,
        const activityAfterDistance = lower.match(/\b[0-9]+(?:\.[0-9]+)?\s*(?:mi|mile|miles|km|kilometer|kilometers)\s+([a-z\s]+?)(?:\s+with|\s+#|\.|,|;|$)/i);
        let phrase = '';
        if (activityAfterDistance && activityAfterDistance[1]) {
            phrase = activityAfterDistance[1].trim();
        } else {
            // Fallback: look for common verbs/nouns if the template differs
            phrase = lower;
        }
        // Normalize synonyms
        if (/(\brun|jog(ging)?\b)/.test(phrase)) return 'running';
        if (/(\bwalk(ing)?\b)/.test(phrase)) return 'walking';
        if (/(\b(bike|biking|cycling)\b|\bbike ride\b|\bride\b)/.test(phrase)) return 'biking';
        if (/(\bhike(ing)?\b)/.test(phrase)) return 'hiking';
        if (/(\bswim(ming)?\b)/.test(phrase)) return 'swimming';
        if (/(\belliptical\b)/.test(phrase)) return 'elliptical';
        if (/(\brow(ing)?\b)/.test(phrase)) return 'rowing';
        if (/(\bski(ing)?|snowboard(ing)?|xc ski\b)/.test(phrase)) return 'skiing';
        if (/(\byoga\b)/.test(phrase)) return 'yoga';
        if (/(\bkayak(ing)?\b)/.test(phrase)) return 'kayaking';
        if (/(\bskate(ing)?\b)/.test(phrase)) return 'skating';
        if (/(\btreadmill\b)/.test(phrase)) return 'treadmill';
        return 'unknown';
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const lower = this.text.toLowerCase();
        const unitMatch = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*(mi|mile|miles|km|kilometer|kilometers)\b/);
        if (unitMatch) {
            const value = parseFloat(unitMatch[1]);
            const unit = unitMatch[2];
            if (['mi', 'mile', 'miles'].includes(unit)) {
                return value;
            }
            // Convert KM to miles (approximate)
            return value / 1.609;
        }
        // Handle shorthand like 5k, 10k
        const kMatch = lower.match(/\b([0-9]+(?:\.[0-9]+)?)\s*k\b/);
        if (kMatch) {
            const km = parseFloat(kMatch[1]);
            return km / 1.609;
        }
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        // Create a clickable link for any URLs in the tweet
        const tweetHtml = this.linkify(this.text);
        const activity = this.activityType;
        return `<tr><th scope="row">${rowNumber}</th><td>${activity}</td><td>${tweetHtml}</td></tr>`;
    }

    private extractUserWrittenText(raw:string):string {
        // Remove URLs and hashtag
        const noUrl = raw.replace(/https?:\/\/\S+/g, ' ').replace(/#runkeeper/ig, ' ').trim();
        const lower = noUrl.toLowerCase();
        // Find the main template clause
        const templateIdx = lower.search(/\b(just completed|just posted|finished|watch my)\b/);
        let userPrefix = '';
        let userSuffix = '';
        if (templateIdx >= 0) {
            userPrefix = noUrl.slice(0, templateIdx).trim();
            // take text after the first period following the template sentence
            const afterTemplate = noUrl.slice(templateIdx);
            const period = afterTemplate.indexOf('.');
            if (period >= 0) {
                userSuffix = afterTemplate.slice(period + 1).trim();
            }
        } else {
            // If no template found, treat any extra text around known boilerplate endings as user text
            userPrefix = noUrl;
        }
        // Clean prefix/suffix of boilerplate
        const cleanBoiler = (s:string) => s
            .replace(/\b(with|on|via|using)\s*runkeeper\b[.!]?/ig, ' ')
            .replace(/\b(check it out!?|see my activity|view (my|the) activity)\b[.!]?/ig, ' ')
            .replace(/[#@]\w+/g, ' ') // hashtags/mentions
            .replace(/\s+/g, ' ') // collapse spaces
            .trim();

        const prefixClean = cleanBoiler(userPrefix);
        const suffixClean = cleanBoiler(userSuffix);

        // Heuristic
        const letters = (s:string) => s.replace(/[^a-z]/gi, '');
        const wordCount = (s:string) => (s.match(/\b[a-zA-Z]{2,}\b/g) || []).length;

        const strongWord = (s:string) => /\b[a-zA-Z]{8,}\b/.test(s);
        const prefixIsUser = (letters(prefixClean).length >= 9 && wordCount(prefixClean) >= 2) || strongWord(prefixClean);
        const suffixIsUser = (letters(suffixClean).length >= 11 && wordCount(suffixClean) >= 2) || strongWord(suffixClean);

        if (!(prefixIsUser || suffixIsUser)) return '';

        const combined = `${prefixClean} ${suffixClean}`.replace(/\s+/g, ' ').trim();
        return combined;
    }

    private linkify(raw:string):string {
        return raw.replace(/(https?:\/\/[^\s]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }
}