function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	// Earliest and latest dates
	const times = tweet_array.map(t => t.time.getTime());
	const minTime = new Date(Math.min.apply(null, times));
	const maxTime = new Date(Math.max.apply(null, times));
	const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	document.getElementById('firstDate').innerText = minTime.toLocaleDateString(undefined, dateOpts);
	document.getElementById('lastDate').innerText = maxTime.toLocaleDateString(undefined, dateOpts);

	// Category counts
	const counts = { completed_event: 0, live_event: 0, achievement: 0, miscellaneous: 0 };
	for (const t of tweet_array) {
		if (t.source === 'completed_event') counts.completed_event++;
		else if (t.source === 'live_event') counts.live_event++;
		else if (t.source === 'achievement') counts.achievement++;
		else counts.miscellaneous++;
	}
	const total = tweet_array.length;
	const pct = (n) => math.format((n / total) * 100, {notation: 'fixed', precision: 2}) + '%';

	// Update all matching class spans
	for (const el of document.querySelectorAll('.completedEvents')) { el.textContent = String(counts.completed_event); }
	for (const el of document.querySelectorAll('.completedEventsPct')) { el.textContent = pct(counts.completed_event); }
	for (const el of document.querySelectorAll('.liveEvents')) { el.textContent = String(counts.live_event); }
	for (const el of document.querySelectorAll('.liveEventsPct')) { el.textContent = pct(counts.live_event); }
	for (const el of document.querySelectorAll('.achievements')) { el.textContent = String(counts.achievement); }
	for (const el of document.querySelectorAll('.achievementsPct')) { el.textContent = pct(counts.achievement); }
	for (const el of document.querySelectorAll('.miscellaneous')) { el.textContent = String(counts.miscellaneous); }
	for (const el of document.querySelectorAll('.miscellaneousPct')) { el.textContent = pct(counts.miscellaneous); }

	// Written percentages among completed events
	const completedTweets = tweet_array.filter(t => t.source === 'completed_event');
	const numWritten = completedTweets.filter(t => t.written).length;
	for (const el of document.querySelectorAll('.written')) { el.textContent = String(numWritten); }
	for (const el of document.querySelectorAll('.writtenPct')) {
		const denom = completedTweets.length || 1;
		el.textContent = math.format((numWritten / denom) * 100, {notation: 'fixed', precision: 2}) + '%';
	}
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});